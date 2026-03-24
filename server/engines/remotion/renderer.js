import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition, renderStill as remotionRenderStill, ensureBrowser } from '@remotion/renderer';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createHash } from 'crypto';
import fs from 'fs/promises';
import os from 'os';
import { balanceBraces } from '../../services/balancer.js';
import esbuild from 'esbuild';
import cliProgress from 'cli-progress';

// Create a multibar instance for tracking concurrent progress
const multibar = new cliProgress.MultiBar({
    clearOnComplete: false,
    hideCursor: true,
    format: ' {bar} | {jobId} | {phase} | {percentage}%',
}, cliProgress.Presets.shades_classic);

// Cleanup helper: removes a temp directory after successful render
async function cleanupTempDir(dirPath) {
    try {
        await fs.rm(dirPath, { recursive: true, force: true });
        console.log(`   🧹 Cleaned up temp dir: ${dirPath.split(/[\\/]/).pop()}`);
    } catch (e) {
        console.warn(`   ⚠️ Cleanup failed (non-critical): ${e.message}`);
    }
}

// Purge all temp dirs older than maxAgeMs (default 1 hour)
async function purgeOldTempDirs(tempRoot, maxAgeMs = 60 * 60 * 1000) {
    try {
        const entries = await fs.readdir(tempRoot, { withFileTypes: true });
        const now = Date.now();
        let cleaned = 0;
        for (const entry of entries) {
            if (!entry.isDirectory() || entry.name === '_warmup') continue;
            const fullPath = join(tempRoot, entry.name);
            try {
                const stat = await fs.stat(fullPath);
                if (now - stat.mtimeMs > maxAgeMs) {
                    await fs.rm(fullPath, { recursive: true, force: true });
                    cleaned++;
                }
            } catch (e) { /* skip entries we can't stat */ }
        }
        if (cleaned > 0) console.log(`🧹 Purged ${cleaned} stale temp directories`);
    } catch (e) { /* temp root doesn't exist yet, that's fine */ }
}

// Concurrency: use env var, or default to half CPU cores
const RENDER_CONCURRENCY = parseInt(process.env.RENDER_CONCURRENCY) || Math.max(1, Math.floor(os.cpus().length / 2));
console.log(`⚡ Remotion render concurrency: ${RENDER_CONCURRENCY} (${os.cpus().length} CPU cores detected)`);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Shared browser executable path to avoid multiple downloads/race conditions
let browserExecutablePath = null;

// Helper to detect if URL is a video
const isVideoUrl = (url) => {
    if (!url) return false;
    const videoExtensions = ['.mp4', '.webm', '.mov', '.avi', '.mkv', '.m4v'];
    return videoExtensions.some(ext => url.toLowerCase().endsWith(ext));
};


// Template for wrapping generated components with optional background
const wrapperTemplate = (componentCode, settings) => {
    // Fix common LLM import mistakes before wrapping:
    // 1. Strip 'interpolate' so our safe wrapper is used
    // 2. Move React hooks/items (Gemini often puts them in 'remotion')
    const reactHooks = ['useState', 'useEffect', 'useMemo', 'useCallback', 'useRef', 'useLayoutEffect', 'useContext', 'useReducer', 'Fragment', 'memo', 'forwardRef'];
    let hooksToAdd = new Set();

    // Scan for and remove 'remotion' named imports that are actually React items
    componentCode = componentCode.replace(
        /import\s*\{([^}]*)\}\s*from\s*['"]remotion['"]/g,
        (match, imports) => {
            const items = imports.split(',').map(s => s.trim()).filter(Boolean);
            items.forEach(item => {
                if (reactHooks.includes(item)) hooksToAdd.add(item);
            });
            const kept = items.filter(s => s !== 'interpolate' && !reactHooks.includes(s));
            if (kept.length === 0) return '';
            return `import { ${kept.join(', ')} } from 'remotion'`;
        }
    );

    // Scan for and remove 'react' named imports (we will re-add them in a unified way)
    componentCode = componentCode.replace(
        /import\s+React\s*,?\s*\{([^}]*)\}\s*from\s*['"]react['"]/g,
        (match, imports) => {
            const items = imports.split(',').map(s => s.trim()).filter(Boolean);
            items.forEach(item => hooksToAdd.add(item));
            return ''; // Remove for unification
        }
    );

    // Also handle simple default React import
    componentCode = componentCode.replace(/import\s+React\s+from\s*['"]react['"];?/g, '');

    // Final consolidated hooks list
    const finalHooks = Array.from(hooksToAdd);
    const reactImportStr = finalHooks.length > 0
        ? `import React, { ${finalHooks.join(', ')} } from 'react';`
        : `import React from 'react';`;

    const hasBackground = !!settings.backgroundUrl;
    const isVideo = isVideoUrl(settings.backgroundUrl);

    let additionalImports = '';
    if (hasBackground) {
        if (isVideo) {
            additionalImports = `
import { OffthreadVideo } from 'remotion';`;
        } else {
            additionalImports = `
import { Img } from 'remotion';`;
        }
    }

    // Create background wrapper component based on media type
    let backgroundCode = '';
    if (hasBackground) {
        if (isVideo) {
            backgroundCode = `
// Video Background wrapper component
const BackgroundWrapper = ({children}) => {
    return (
        <AbsoluteFill>
            <AbsoluteFill style={{ zIndex: 0 }}>
                <OffthreadVideo 
                    src="${settings.backgroundUrl}"
                    style={{ 
                        position: 'absolute', 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover'
                    }}
                    muted
                />
            </AbsoluteFill>
            <AbsoluteFill style={{ zIndex: 1 }}>
                {children}
            </AbsoluteFill>
        </AbsoluteFill>
    );
};
`;
        } else {
            backgroundCode = `
// Image Background wrapper component
const BackgroundWrapper = ({children}) => {
    return (
        <AbsoluteFill>
            <Img 
                src="${settings.backgroundUrl}" 
                style={{ 
                    position: 'absolute', 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover'
                }} 
            />
            <AbsoluteFill style={{ zIndex: 1 }}>
                {children}
            </AbsoluteFill>
        </AbsoluteFill>
    );
};
`;
        }
    }

    const componentWrapper = hasBackground
        ? 'const WrappedAnimation = () => <BackgroundWrapper><AbsoluteFill><AnimationComponent /></AbsoluteFill></BackgroundWrapper>;'
        : 'const WrappedAnimation = () => <AbsoluteFill><AnimationComponent /></AbsoluteFill>;';

    const durationFrames = Math.round((settings.duration || 10) * (settings.fps || 30));
    const fpsValue = settings.fps || 30;
    const widthValue = settings.width || 1920;
    const heightValue = settings.height || 1080;

    // Strip duplicate React/Remotion imports from component code since the wrapper provides its own
    componentCode = componentCode.replace(/import\s+React\s*(?:,\s*\{[^}]*\})?\s*from\s*['"]react['"];?\s*\n?/g, '');

    // CRITICAL: Ensure component code has balanced braces before injecting wrapper code.
    // If the AI truncated the output mid-function, the wrapper (WrappedAnimation, RemotionRoot)
    // would end up INSIDE the unclosed function, causing syntax errors like
    // 'Expected ":" but found "WrappedAnimation"'
    componentCode = balanceBraces(componentCode);

    return `
${reactImportStr}
import { registerRoot, Composition, AbsoluteFill, interpolate as _originalInterpolate } from 'remotion';${additionalImports}
// Note: external font loading removed due to package installation issues. 
// Using system font stack as fallback.
const fontFamily = "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

// Runtime safety wrapper: prevents crashes from LLM-generated code with bad interpolate calls
const interpolate = (value, inputRange, outputRange, options) => {
    if (!outputRange || !Array.isArray(outputRange)) {
        if (Array.isArray(inputRange) && inputRange.length >= 2) {
            outputRange = inputRange.map((_, i) => i / (inputRange.length - 1));
        } else {
            return 0;
        }
    }
    if (Array.isArray(inputRange) && inputRange.length !== outputRange.length) {
        if (inputRange.length >= 2 && outputRange.length >= 2) {
            inputRange = [inputRange[0], inputRange[inputRange.length - 1]];
            outputRange = [outputRange[0], outputRange[outputRange.length - 1]];
        } else if (outputRange.length === 0) {
            outputRange = inputRange.map((_, i) => i / (inputRange.length - 1));
        }
    }
    outputRange = outputRange.map(v => {
        if (typeof v === 'number') return v;
        const n = parseFloat(String(v).replace(/[^0-9.\\-]/g, ''));
        return isNaN(n) ? 0 : n;
    });
    try {
        return _originalInterpolate(value, inputRange, outputRange, options);
    } catch (e) {
        return outputRange[0] || 0;
    }
};

${componentCode}

${backgroundCode}

${componentWrapper}

    const RemotionRoot = () => {
        return (
            <>
                <Composition
                    id="Animation"
                    component={WrappedAnimation}
                    durationInFrames={${durationFrames}}
                fps={${fpsValue}}
                width={${widthValue}}
                height={${heightValue}}
            />
            </>
        );
    };

    registerRoot(RemotionRoot);
    `;
};

/**
 * Fast syntax pre-check using esbuild's transform API.
 * Catches syntax errors in milliseconds instead of waiting for the full bundler.
 * Returns { valid: true } or { valid: false, error: string, line: number, column: number }
 */
async function syntaxPreCheck(tsxCode) {
    try {
        await esbuild.transform(tsxCode, {
            loader: 'tsx',
            logLevel: 'silent',
        });
        return { valid: true };
    } catch (e) {
        const msg = e.message || String(e);
        // Extract line and column from esbuild error
        const lineMatch = msg.match(/:(\d+):(\d+):/);
        return {
            valid: false,
            error: msg,
            line: lineMatch ? parseInt(lineMatch[1]) : null,
            column: lineMatch ? parseInt(lineMatch[2]) : null,
        };
    }
}

// Calculate MD5 hash of content
const calculateHash = (content) => {
    return createHash('md5').update(content).digest('hex');
};

export async function renderVideo(tsxCode, outputPath, settings, onProgress = null) {
    let wrappedCode = wrapperTemplate(tsxCode, settings);

    // CRITICAL: Fast syntax pre-check before expensive bundling.
    // If esbuild can't parse it, the bundler will definitely fail.
    // We attempt targeted fixes for common LLM patterns before giving up.
    const preCheck = await syntaxPreCheck(wrappedCode);
    if (!preCheck.valid) {
        console.log(`⚠️ Syntax pre-check failed (line ${preCheck.line}): attempting targeted fix...`);

        // Attempt targeted line-level fix
        let lines = wrappedCode.split('\n');
        if (preCheck.line && preCheck.line <= lines.length) {
            const badLine = lines[preCheck.line - 1];

            // Fix 1: Extra closing braces in template literals on this line
            const fixedLine = badLine.replace(/`([^`]*)`/g, (match, content) => {
                let depth = 0;
                let cleaned = '';
                for (let i = 0; i < content.length; i++) {
                    if (content[i] === '$' && content[i + 1] === '{') {
                        depth++;
                        cleaned += '${';
                        i++;
                        continue;
                    }
                    if (content[i] === '}' && depth > 0) {
                        depth--;
                        cleaned += '}';
                        continue;
                    }
                    if (content[i] === '}' && depth === 0) {
                        continue; // strip extra }
                    }
                    cleaned += content[i];
                }
                return '`' + cleaned + '`';
            });

            if (fixedLine !== badLine) {
                lines[preCheck.line - 1] = fixedLine;
                wrappedCode = lines.join('\n');
                console.log(`   🔧 Fixed extra braces on line ${preCheck.line}`);
            } else {
                // Fix 2: Handle non-template patterns
                let simplified = badLine;
                // Fix }}> ternary pattern: `highlightProgress }}> 0` → `highlightProgress > 0`
                simplified = simplified.replace(/(\w+)\s*\}{2,}>\s*(\d)/g, '$1 > $2');
                // Remove injected CSS props in wrong places
                simplified = simplified.replace(/,\s*\w+:\s*'[^']*'/g, '');
                // Collapse triple+ closing braces (but not style={{}})
                simplified = simplified.replace(/\}{3,}/g, '}}');

                if (simplified !== badLine) {
                    lines[preCheck.line - 1] = simplified;
                    wrappedCode = lines.join('\n');
                    console.log(`   🔧 Simplified broken expression on line ${preCheck.line}`);
                }
            }

            // Fix 3: "Unterminated string literal" — an open ' or " not closed on its line.
            // Scan the bad line character-by-character; if we exit the scan still inside a string,
            // close it. This handles both truly unterminated strings and multi-line strings that
            // weren't converted to template literals (the validator Phase 1.5 should catch these,
            // but if the error is at a specific line in the WRAPPER code we fix it here).
            if (preCheck.error && preCheck.error.includes('Unterminated string')) {
                let inStr = null;
                let fixLine = lines[preCheck.line - 1] || '';
                for (let ci = 0; ci < fixLine.length; ci++) {
                    const cc = fixLine[ci];
                    if (!inStr) {
                        if (cc === "'" || cc === '"') inStr = cc;
                    } else {
                        if (cc === '\\') { ci++; continue; }
                        if (cc === inStr) inStr = null;
                    }
                }
                if (inStr) {
                    // Close the unclosed string on this line
                    lines[preCheck.line - 1] = fixLine + inStr;
                    wrappedCode = lines.join('\n');
                    console.log(`   🔧 Closed unterminated ${inStr === "'" ? "single" : "double"}-quoted string on line ${preCheck.line}`);
                }
            }

            // Fix 4: "Unterminated regular expression" — a /regex/ literal missing its closing /.
            // esbuild reports the opening / position. Scan forward handling [...] char classes;
            // if we reach end-of-line without finding the closing /, append it (and close the
            // char class if needed).
            if (preCheck.error && preCheck.error.includes('Unterminated regular expression')) {
                const col = preCheck.column ? preCheck.column - 1 : -1;
                let fixLine = lines[preCheck.line - 1] || '';
                const slashIdx = col >= 0 && fixLine[col] === '/' ? col : fixLine.indexOf('/');
                if (slashIdx >= 0) {
                    let j = slashIdx + 1;
                    let inClass = false;
                    while (j < fixLine.length) {
                        const c = fixLine[j];
                        if (c === '\\') { j += 2; continue; }
                        if (!inClass && c === '[') { inClass = true; }
                        else if (inClass && c === ']') { inClass = false; }
                        else if (!inClass && c === '/') { j = -1; break; } // already closed
                        j++;
                    }
                    if (j !== -1) {
                        // regex wasn't closed — append closing delimiter(s)
                        if (inClass) fixLine += ']';
                        fixLine += '/';
                        lines[preCheck.line - 1] = fixLine;
                        wrappedCode = lines.join('\n');
                        console.log(`   🔧 Closed unterminated regex on line ${preCheck.line}`);
                    }
                }
            }
        }

        // Re-check after fix attempt
        const recheck = await syntaxPreCheck(wrappedCode);
        if (!recheck.valid) {
            console.log(`   ❌ Syntax still broken after fix attempt. Passing to render for retry loop.`);
        } else {
            console.log(`   ✅ Syntax pre-check passed after fix`);
        }
    }

    const hash = calculateHash(wrappedCode);
    // Adjusted path to look for .temp in project root
    const tempDir = join(__dirname, '../../../.temp', hash);
    const bundleInfoPath = join(tempDir, 'bundle-info.json');

    try {
        await fs.mkdir(tempDir, { recursive: true });

        // Write the entry file (idempotent)
        const entryPath = join(tempDir, 'index.tsx');
        await fs.writeFile(entryPath, wrappedCode, 'utf-8');

        // Copy SharedComponents for the bundle to access
        const sharedCompSource = join(__dirname, 'SharedComponents.tsx');
        const sharedCompDest = join(tempDir, 'SharedComponents.tsx');
        await fs.copyFile(sharedCompSource, sharedCompDest);

        const packageJson = {
            name: 'temp-remotion-bundle',
            type: 'module',
            dependencies: {
                react: '^18.2.0',
                'react-dom': '^18.2.0',
                remotion: '^4.0.0',
                '@remotion/shapes': '^4.0.0',
                '@remotion/paths': '^4.0.0',
                '@remotion/noise': '^4.0.0',
                '@remotion/transitions': '^4.0.0'
            },
        };
        const packageJsonPath = join(tempDir, 'package.json');
        await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf-8');

        let bundleLocation;
        let isCached = false;
        
        // Setup progress bar for this specific render job
        const jobName = outputPath.split(/[\\/]/).pop().split('.')[0] || hash.substring(0, 8);
        const progressBar = multibar.create(100, 0, { jobId: jobName, phase: 'Bundling' });

        // Check for cached bundle info
        try {
            const bundleInfo = JSON.parse(await fs.readFile(bundleInfoPath, 'utf-8'));
            await fs.access(bundleInfo.location);
            bundleLocation = bundleInfo.location;
            isCached = true;
            // console.log('   📦 Using cached bundle');
            progressBar.update(100, { phase: 'Cached Bundle' });
            if (onProgress) onProgress({ phase: 'bundling', progress: 30 });
        } catch (e) {
            isCached = false;
        }

        if (!isCached) {
            // console.log('   📦 Bundling Remotion project...');
            bundleLocation = await bundle({
                entryPoint: entryPath,
                onProgress: (progress) => {
                    progressBar.update(progress, { phase: 'Bundling' });
                    if (onProgress) {
                        onProgress({ phase: 'bundling', progress: Math.round(progress * 0.3) });
                    }
                },
            });
            // Cache the bundle info
            await fs.writeFile(bundleInfoPath, JSON.stringify({ location: bundleLocation }), 'utf-8');
        }

        // console.log('   🎥 Selecting composition...');
        progressBar.update(0, { phase: 'Selecting Composition' });
        if (onProgress) onProgress({ phase: 'bundling', progress: 32 });
        const composition = await selectComposition({
            serveUrl: bundleLocation,
            id: 'Animation',
            browserExecutable: browserExecutablePath,
        });

        // console.log('   🎬 Rendering video...');
        progressBar.update(0, { phase: 'Rendering Video' });
        if (onProgress) onProgress({ phase: 'rendering', progress: 35 });
        await renderMedia({
            composition,
            serveUrl: bundleLocation,
            codec: 'h264',
            outputLocation: outputPath,
            concurrency: RENDER_CONCURRENCY,
            browserExecutable: browserExecutablePath,
            onProgress: ({ progress }) => {
                const pct = Math.round(progress * 100);
                progressBar.update(pct, { phase: 'Rendering' });
                if (onProgress) {
                    onProgress({ phase: 'rendering', progress: 30 + Math.round(progress * 70) });
                }
            },
        });

        // console.log('   ✅ Video saved to:', outputPath);
        progressBar.update(100, { phase: 'Done' });
        progressBar.stop();

        // Clean up temp directory after successful render
        await cleanupTempDir(tempDir);

        return outputPath;

    } catch (error) {
        console.error('Render failed:', error);
        // Still try to clean up on failure
        await cleanupTempDir(tempDir);
        throw error;
    }
}

export async function renderStill(tsxCode, outputPath, frame, settings) {
    const wrappedCode = wrapperTemplate(tsxCode, settings);
    const hash = calculateHash(wrappedCode);
    // Adjusted path to look for .temp in project root (same as renderVideo)
    const tempDir = join(__dirname, '../../../.temp', hash);
    const bundleInfoPath = join(tempDir, 'bundle-info.json');

    try {
        await fs.mkdir(tempDir, { recursive: true });

        // Write the entry file (idempotent)
        const entryPath = join(tempDir, 'index.tsx');
        await fs.writeFile(entryPath, wrappedCode, 'utf-8');

        // Copy SharedComponents for the bundle to access
        const sharedCompSource = join(__dirname, 'SharedComponents.tsx');
        const sharedCompDest = join(tempDir, 'SharedComponents.tsx');
        await fs.copyFile(sharedCompSource, sharedCompDest);

        const packageJson = {
            name: 'temp-remotion-bundle',
            type: 'module',
            dependencies: {
                react: '^18.2.0',
                'react-dom': '^18.2.0',
                remotion: '^4.0.0',
                '@remotion/shapes': '^4.0.0',
                '@remotion/paths': '^4.0.0',
                '@remotion/noise': '^4.0.0',
                '@remotion/transitions': '^4.0.0'
            },
        };
        const packageJsonPath = join(tempDir, 'package.json');
        await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf-8');

        let bundleLocation;
        let isCached = false;

        // Check for cached bundle info
        try {
            const bundleInfo = JSON.parse(await fs.readFile(bundleInfoPath, 'utf-8'));
            await fs.access(bundleInfo.location);
            bundleLocation = bundleInfo.location;
            isCached = true;
        } catch (e) {
            isCached = false;
        }

        if (!isCached) {
            bundleLocation = await bundle({
                entryPoint: entryPath,
            });
            await fs.writeFile(bundleInfoPath, JSON.stringify({ location: bundleLocation }), 'utf-8');
        }

        const composition = await selectComposition({
            serveUrl: bundleLocation,
            id: 'Animation',
            browserExecutable: browserExecutablePath,
        });

        await fs.mkdir(dirname(outputPath), { recursive: true });

        await remotionRenderStill({
            composition,
            serveUrl: bundleLocation,
            outputLocation: outputPath,
            frame,
            browserExecutable: browserExecutablePath,
        });

        // Clean up temp directory after successful render
        await cleanupTempDir(tempDir);

        return outputPath;
    } catch (error) {
        console.error('Still render failed:', error);
        await cleanupTempDir(tempDir);
        throw error;
    }
}

/**
 * Pre-warm the Remotion bundler on server start.
 * Bundles a minimal component so webpack's internal caches are hot for real renders.
 */
export async function warmupBundler() {
    const minimalCode = `
import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
export const AnimationComponent = () => <AbsoluteFill style={{ background: '#000' }} />;
`;
    try {
        console.log('⚡ Initializing Remotion browser (Chrome Headless Shell)...');
        // This ensures the browser is downloaded once to a shared location
        // rather than per-render in unique hash directories.
        const result = await ensureBrowser();
        browserExecutablePath = result.path;
        console.log(`✅ Browser ready: ${browserExecutablePath}`);

        const warmupDir = join(__dirname, '../../../.temp/_warmup');
        await fs.mkdir(warmupDir, { recursive: true });

        const entryPath = join(warmupDir, 'index.tsx');
        const wrappedCode = wrapperTemplate(minimalCode, { duration: 1, fps: 30, width: 100, height: 100 });
        await fs.writeFile(entryPath, wrappedCode, 'utf-8');

        // Copy SharedComponents
        const sharedCompSource = join(__dirname, 'SharedComponents.tsx');
        await fs.copyFile(sharedCompSource, join(warmupDir, 'SharedComponents.tsx'));

        const packageJson = {
            name: 'temp-remotion-bundle',
            type: 'module',
            dependencies: {
                react: '^18.2.0',
                'react-dom': '^18.2.0',
                remotion: '^4.0.0',
                '@remotion/shapes': '^4.0.0',
                '@remotion/paths': '^4.0.0',
                '@remotion/noise': '^4.0.0',
                '@remotion/transitions': '^4.0.0'
            },
        };
        await fs.writeFile(join(warmupDir, 'package.json'), JSON.stringify(packageJson, null, 2), 'utf-8');

        await bundle({ entryPoint: entryPath });
        console.log('⚡ Remotion bundler warmed up and ready');

        // Purge any old temp directories from previous sessions
        const tempRoot = join(__dirname, '../../../.temp');
        await purgeOldTempDirs(tempRoot);
    } catch (error) {
        console.warn('⚠️ Bundler warmup failed (non-critical):', error.message);
    }
}
