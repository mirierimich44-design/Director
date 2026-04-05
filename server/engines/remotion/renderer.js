import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition, renderStill as remotionRenderStill, ensureBrowser } from '@remotion/renderer';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createHash } from 'crypto';
import fs from 'fs/promises';
import { existsSync } from 'fs';
import os from 'os';
import esbuild from 'esbuild';
import cliProgress from 'cli-progress';

// Create a multibar instance for tracking concurrent progress
const multibar = new cliProgress.MultiBar({
    clearOnComplete: false,
    hideCursor: true,
    format: ' {bar} | {jobId} | {phase} | {percentage}%',
}, cliProgress.Presets.shades_classic);

// Minimum free disk space required before starting a render (500 MB)
const MIN_FREE_BYTES = 500 * 1024 * 1024;
async function checkDiskSpace(dir) {
    try {
        const { execFile } = await import('child_process');
        const { promisify } = await import('util');
        const exec = promisify(execFile);
        const { stdout } = await exec('df', ['-k', '--output=avail', dir]);
        const lines = stdout.trim().split('\n');
        const availKb = parseInt(lines[lines.length - 1].trim(), 10);
        const availBytes = availKb * 1024;
        if (availBytes < MIN_FREE_BYTES) {
            throw new Error(`Insufficient disk space: ${Math.round(availBytes / 1024 / 1024)}MB free, need at least ${Math.round(MIN_FREE_BYTES / 1024 / 1024)}MB`);
        }
    } catch (e) {
        if (e.message.startsWith('Insufficient')) throw e;
        // df unavailable (Windows dev) — skip check
    }
}

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
export async function purgeOldTempDirs(tempRoot, maxAgeMs = 30 * 60 * 1000) { // 30 mins
    try {
        // Specifically look for the remotion bundles folder
        const bundlesRoot = join(tempRoot, 'remotion');
        if (!existsSync(bundlesRoot)) return;

        const entries = await fs.readdir(bundlesRoot, { withFileTypes: true });
        const now = Date.now();
        let cleaned = 0;
        for (const entry of entries) {
            // Target the bundle folders specifically
            if (!entry.isDirectory() || !entry.name.startsWith('bundle-')) continue;
            
            const fullPath = join(bundlesRoot, entry.name);
            try {
                const stat = await fs.stat(fullPath);
                if (now - stat.mtimeMs > maxAgeMs) {
                    await fs.rm(fullPath, { recursive: true, force: true });
                    cleaned++;
                }
            } catch (e) { /* skip */ }
        }
        if (cleaned > 0) console.log(`🧹 Purged ${cleaned} stale remotion bundles`);
    } catch (e) { console.warn('⚠️ Purge failed:', e.message); }
}

// Concurrency: use env var, or default to half CPU cores
const RENDER_CONCURRENCY = parseInt(process.env.RENDER_CONCURRENCY) || Math.max(1, Math.floor(os.cpus().length / 2));
console.log(`⚡ Remotion render concurrency: ${RENDER_CONCURRENCY} (${os.cpus().length} CPU cores detected)`);

// Bundle lock to prevent concurrent bundling (not thread-safe due to chdir)
let bundleLock = Promise.resolve();

// Reject a promise after ms milliseconds
const withTimeout = (promise, ms, label) =>
    Promise.race([
        promise,
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error(`Timeout: ${label} exceeded ${ms / 1000}s`)), ms)
        ),
    ]);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// CRITICAL: Force Remotion to use a local temp directory to avoid system /tmp ENOSPC/permission issues
const LOCAL_REMOTION_TMP = join(__dirname, '../../../.temp/remotion');
process.env.REMOTION_TMPDIR = LOCAL_REMOTION_TMP;

let browserExecutablePath = null;

/**
 * Ensures the Remotion browser (Chrome Headless Shell) is available.
 * Caches the path to avoid repeated downloads.
 */
async function ensureRemotionBrowser() {
    if (browserExecutablePath && existsSync(browserExecutablePath)) {
        return browserExecutablePath;
    }

    // Check known system/Playwright Chrome locations before downloading
    const SYSTEM_CHROME_CANDIDATES = [
        '/usr/bin/chromium-browser',
        '/usr/bin/chromium',
        '/usr/bin/google-chrome',
        '/usr/bin/google-chrome-stable',
        '/snap/bin/chromium',
        '/root/.cache/ms-playwright/chromium_headless_shell-1194/chrome-linux/headless_shell',
        '/root/.cache/ms-playwright/chromium-1194/chrome-linux/chrome',
    ];
    for (const candidate of SYSTEM_CHROME_CANDIDATES) {
        if (existsSync(candidate)) {
            browserExecutablePath = candidate;
            console.log(`✅ Using system browser: ${browserExecutablePath}`);
            return browserExecutablePath;
        }
    }

    try {
        console.log('⚡ Ensuring Remotion browser is ready...');
        const result = await ensureBrowser();
        browserExecutablePath = result.path;
        console.log(`✅ Remotion browser ready: ${browserExecutablePath}`);
        return browserExecutablePath;
    } catch (error) {
        console.error('❌ Failed to ensure Remotion browser:', error.message);
        throw error;
    }
}

// Helper to detect if URL is a video
const isVideoUrl = (url) => {
    if (!url) return false;
    const videoExtensions = ['.mp4', '.webm', '.mov', '.avi', '.mkv', '.m4v'];
    return videoExtensions.some(ext => url.toLowerCase().endsWith(ext));
};


// Wraps a raw TSX component in the full Remotion boilerplate (registerRoot, Composition, etc.)
const wrapperTemplate = (componentCode, settings) => {
    const reactHooks = ['useState', 'useEffect', 'useMemo', 'useCallback', 'useRef', 'useLayoutEffect', 'useContext', 'useReducer', 'Fragment', 'memo', 'forwardRef'];
    let hooksToAdd = new Set();

    // Move React hooks mistakenly imported from 'remotion' to React
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

    // Consolidate React imports
    componentCode = componentCode.replace(
        /import\s+React\s*,?\s*\{([^}]*)\}\s*from\s*['"]react['"]/g,
        (match, imports) => {
            imports.split(',').map(s => s.trim()).filter(Boolean).forEach(item => hooksToAdd.add(item));
            return '';
        }
    );
    componentCode = componentCode.replace(/import\s+React\s+from\s*['"]react['"];?/g, '');

    const finalHooks = Array.from(hooksToAdd);
    const reactImportStr = finalHooks.length > 0
        ? `import React, { ${finalHooks.join(', ')} } from 'react';`
        : `import React from 'react';`;

    const hasBackground = !!settings.backgroundUrl;
    const isVideo = isVideoUrl(settings.backgroundUrl);

    let additionalImports = '';
    if (hasBackground) {
        additionalImports = isVideo
            ? `\nimport { OffthreadVideo } from 'remotion';`
            : `\nimport { Img } from 'remotion';`;
    }

    let backgroundCode = '';
    if (hasBackground) {
        if (isVideo) {
            backgroundCode = `
const BackgroundWrapper = ({children}) => (
    <AbsoluteFill>
        <AbsoluteFill style={{ zIndex: 0 }}>
            <OffthreadVideo src="${settings.backgroundUrl}" style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover' }} muted />
        </AbsoluteFill>
        <AbsoluteFill style={{ zIndex: 1 }}>{children}</AbsoluteFill>
    </AbsoluteFill>
);`;
        } else {
            backgroundCode = `
const BackgroundWrapper = ({children}) => (
    <AbsoluteFill>
        <Img src="${settings.backgroundUrl}" style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover' }} />
        <AbsoluteFill style={{ zIndex: 1 }}>{children}</AbsoluteFill>
    </AbsoluteFill>
);`;
        }
    }

    const durationFrames = Math.round((settings.duration || 15) * (settings.fps || 30));
    const fpsValue = settings.fps || 30;
    const widthValue = settings.width || 1920;
    const heightValue = settings.height || 1080;

    // When rendering at less than full 1920×1080 (e.g. preview at 960×540),
    // scale the 1920×1080 component down so nothing is clipped.
    const needsScale = widthValue < 1920 || heightValue < 1080;
    const previewScale = needsScale ? Math.min(widthValue / 1920, heightValue / 1080).toFixed(6) : '1';

    const innerAnim = hasBackground
        ? '<BackgroundWrapper><AbsoluteFill><AnimationComponent /></AbsoluteFill></BackgroundWrapper>'
        : '<AbsoluteFill><AnimationComponent /></AbsoluteFill>';

    const componentWrapper = needsScale
        ? `const WrappedAnimation = () => (
  <AbsoluteFill style={{ overflow: 'hidden', background: 'transparent' }}>
    <div style={{ width: 1920, height: 1080, transform: 'scale(${previewScale})', transformOrigin: 'top left', position: 'absolute', top: 0, left: 0 }}>
      ${innerAnim}
    </div>
  </AbsoluteFill>
);`
        : `const WrappedAnimation = () => ${innerAnim};`;

    // Strip any remaining duplicate React imports from component code
    componentCode = componentCode.replace(/import\s+React\s*(?:,\s*\{[^}]*\})?\s*from\s*['"]react['"];?\s*\n?/g, '');

    // Strip CSS imports — Remotion's webpack bundler has no CSS loader and will
    // throw "unexpected end of file" trying to parse CSS as JS.
    componentCode = componentCode.replace(/^import\s+['"][^'"]*\.css['"]\s*;?\s*$/gm, '');

    // Safeguard: heal broken injection artifacts from old templateFiller bug.
    // The old regex replaced variable NAMES (identifiers) with quoted strings, producing
    // invalid syntax like: const "10.0" = "PLACEHOLDER"
    // Fix: turn the quoted string back into a valid identifier so the file can compile.
    // The variable won't be referenced (its uses were also replaced with string literals),
    // so renaming it is safe — it just needs to be syntactically valid.
    componentCode = componentCode.replace(
        /\b(const|let|var)\s+"([^"]+)"\s*=/g,
        (match, keyword, val) => {
            const safeName = ('_' + val).replace(/[^a-zA-Z0-9_]/g, '_');
            return `${keyword} ${safeName} =`;
        }
    );

    return `
${reactImportStr}
import { registerRoot, Composition, AbsoluteFill, staticFile, interpolate as _originalInterpolate } from 'remotion';${additionalImports}

const fontFamily = "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

// Runtime safety wrapper for LLM-generated interpolate calls
const interpolate = (value, inputRange, outputRange, options) => {
    if (!outputRange || !Array.isArray(outputRange)) {
        outputRange = Array.isArray(inputRange) && inputRange.length >= 2
            ? inputRange.map((_, i) => i / (inputRange.length - 1))
            : [0, 1];
    }
    if (Array.isArray(inputRange) && inputRange.length !== outputRange.length) {
        inputRange = [inputRange[0], inputRange[inputRange.length - 1]];
        outputRange = [outputRange[0], outputRange[outputRange.length - 1]];
    }
    outputRange = outputRange.map(v => {
        if (typeof v === 'number') return v;
        const n = parseFloat(String(v).replace(/[^0-9.\-]/g, ''));
        return isNaN(n) ? 0 : n;
    });
    try { return _originalInterpolate(value, inputRange, outputRange, options); }
    catch (e) { return outputRange[0] || 0; }
};

${componentCode}

${backgroundCode}

${componentWrapper}

const RemotionRoot = () => (
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

/**
 * Surgical Gemini syntax fixer.
 * Shows Gemini only the broken lines (±10 context), asks it to return
 * only those lines fixed. We then splice the fix back in.
 * This prevents Gemini from modifying unrelated code.
 */
async function geminiSyntaxFix(fullCode, preCheck) {
    try {
        const { GoogleGenerativeAI } = await import('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

        const lines = fullCode.split('\n');
        const errorLine = preCheck.line || 1;
        const CONTEXT = 10;
        const startLine = Math.max(1, errorLine - CONTEXT);
        const endLine = Math.min(lines.length, errorLine + CONTEXT);

        const snippet = lines.slice(startLine - 1, endLine).map((l, i) =>
            `${startLine + i}| ${l}`
        ).join('\n');

        const prompt = `You are a TypeScript/TSX syntax fixer. Fix ONLY the syntax error described below.
Return ONLY the fixed lines (no line numbers, no explanation, no markdown fences).
The output must have exactly ${endLine - startLine + 1} lines.
Do NOT change any logic, variable names, or lines outside the error.

ERROR: ${preCheck.error}
ERROR IS ON LINE: ${errorLine}

LINES TO FIX (with line numbers for reference only — do not include them in output):
${snippet}`;

        const result = await model.generateContent(prompt);
        const fixedSnippet = result.response.text().trim();
        const fixedLines = fixedSnippet.split('\n');

        if (fixedLines.length !== endLine - startLine + 1) {
            console.log(`   ⚠️ Gemini returned ${fixedLines.length} lines, expected ${endLine - startLine + 1} — skipping splice`);
            return null;
        }

        const newLines = [
            ...lines.slice(0, startLine - 1),
            ...fixedLines,
            ...lines.slice(endLine),
        ];
        return newLines.join('\n');
    } catch (e) {
        console.warn(`   ⚠️ geminiSyntaxFix error: ${e.message}`);
        return null;
    }
}

// Calculate MD5 hash of content
const calculateHash = (content) => {
    return createHash('md5').update(content).digest('hex');
};

export async function renderVideo(tsxCode, outputPath, settings, onProgress = null) {
    const browserPath = await ensureRemotionBrowser();
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

            // Fix 5: Hyphenated CSS props + invalid LLM identifiers.
            // Triggers on either of the two esbuild errors these produce.
            const _hasBadIdent = preCheck.error && (
                preCheck.error.includes('Expected ";" but found "-"') ||
                preCheck.error.includes('Expected "}" but found')
            );
            if (_hasBadIdent) {
                const camelCase = (s) => s.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
                lines = wrappedCode.split('\n');

                // Fix 5a: CSS hyphenated property keys in style objects
                let fixed5 = lines.map(l =>
                    l.replace(/\b([a-z][a-z0-9]*(?:-[a-z][a-z0-9]*)+)\s*:/g, (match, prop) => `${camelCase(prop)}:`)
                );

                // Fix 5b: `const <invalid-identifier> = 'value'` — LLM used a phrase as a var name.
                // 1. Capture the invalid ident + its string value.
                // 2. Comment out the const declaration.
                // 3. Replace any JSX {invalid-ident} references with {'value'} inline strings.
                const invalidIdents = []; // [{ ident, value }]
                fixed5 = fixed5.map(l => {
                    const m = l.match(/^(\s*)const\s+([^=]+?)\s*=\s*(['"`])([\s\S]*?)\3\s*;?\s*$/);
                    if (!m) return l;
                    const ident = m[2].trim();
                    if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(ident)) return l; // valid — leave it
                    invalidIdents.push({ ident, value: m[4] });
                    return `${m[1]}// [auto-removed invalid identifier: ${ident}]`;
                });

                // Replace JSX {invalid ident} with {'value'}
                if (invalidIdents.length > 0) {
                    const joined = fixed5.join('\n');
                    const replaced = invalidIdents.reduce((code, { ident, value }) => {
                        const escaped = ident.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                        const safe = value.replace(/'/g, "\\'");
                        return code.replace(new RegExp(`\\{\\s*${escaped}\\s*\\}`, 'g'), `{'${safe}'}`);
                    }, joined);
                    fixed5 = replaced.split('\n');
                }

                if (fixed5.join('\n') !== wrappedCode) {
                    wrappedCode = fixed5.join('\n');
                    console.log(`   🔧 Fixed invalid const identifiers / hyphenated CSS properties`);
                }
            }

        // Re-check after built-in fix attempt
        const recheck = await syntaxPreCheck(wrappedCode);
        if (!recheck.valid) {
            console.log(`   ❌ Built-in fixers failed. Attempting Gemini surgical fix...`);
            const geminiFixed = await geminiSyntaxFix(wrappedCode, recheck);
            if (geminiFixed) {
                const geminiCheck = await syntaxPreCheck(geminiFixed);
                if (geminiCheck.valid) {
                    console.log(`   ✅ Gemini fix succeeded`);
                    wrappedCode = geminiFixed;
                } else {
                    console.log(`   ❌ Gemini fix did not resolve syntax. Passing to bundler.`);
                }
            }
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

        // Setup progress bar for this specific render job
        const jobName = outputPath.split(/[\\/]/).pop().split('.')[0] || hash.substring(0, 8);
        const progressBar = multibar.create(100, 0, { jobId: jobName, phase: 'Bundling' });

        // Fail fast if disk is nearly full before burning a bundle slot.
        await checkDiskSpace(tempDir);

        // Acquire lock and perform bundling.
        // IMPORTANT: split the chain so a bundle failure resets the lock for the
        // next caller instead of leaving bundleLock permanently rejected.
        const bundleWork = bundleLock.then(async () => {
            // Check for cached bundle info
            try {
                const bundleInfo = JSON.parse(await fs.readFile(bundleInfoPath, 'utf-8'));
                await fs.access(bundleInfo.location);
                progressBar.update(100, { phase: 'Cached Bundle' });
                if (onProgress) onProgress({ phase: 'bundling', progress: 30 });
                return bundleInfo.location;
            } catch (e) {
                // Not cached or invalid, proceed to bundle
            }

            const publicDir = join(__dirname, '../../../public');
            const loc = await withTimeout(
                bundle({
                    entryPoint: entryPath,
                    publicDir: publicDir,
                    outDir: join(LOCAL_REMOTION_TMP, `bundle-${hash.substring(0, 8)}`),
                    onProgress: (progress) => {
                        const pct = Math.round(progress * 100);
                        progressBar.update(pct, { phase: 'Bundling' });
                        if (onProgress) {
                            onProgress({ phase: 'bundling', progress: Math.round(progress * 30) });
                        }
                    },
                }),
                90_000,
                'bundling'
            );
            await fs.writeFile(bundleInfoPath, JSON.stringify({ location: loc }), 'utf-8');
            return loc;
        });
        // Reset the lock regardless of success/failure so the next render isn't blocked.
        bundleLock = bundleWork.catch(() => {});
        bundleLocation = await bundleWork;

        // console.log('   🎥 Selecting composition...');
        progressBar.update(0, { phase: 'Selecting Composition' });
        if (onProgress) onProgress({ phase: 'bundling', progress: 32 });
        const composition = await selectComposition({
            serveUrl: bundleLocation,
            id: 'Animation',
            browserExecutable: browserPath,
        });

        // console.log('   🎬 Rendering video...');
        progressBar.update(0, { phase: 'Rendering Video' });
        if (onProgress) onProgress({ phase: 'rendering', progress: 35 });
        // Scale the hard cap by composition size:
        // 960×540 (preview) → ~90s cap; 1920×1080 (full) → 360s cap
        const isPreview = widthValue <= 960 && heightValue <= 540;
        const renderTimeoutMs = isPreview ? 90_000 : 360_000;

        await withTimeout(
            renderMedia({
                composition,
                serveUrl: bundleLocation,
                codec: 'h264',
                outputLocation: outputPath,
                concurrency: RENDER_CONCURRENCY,
                browserExecutable: browserPath,
                // Cap delayRender (e.g. maplibre tile loading) so map templates
                // fail fast instead of hanging for the full render duration.
                timeoutInMilliseconds: isPreview ? 15_000 : 30_000,
                onProgress: ({ progress }) => {
                    const pct = Math.round(progress * 100);
                    progressBar.update(pct, { phase: 'Rendering' });
                    if (onProgress) {
                        onProgress({ phase: 'rendering', progress: 30 + Math.round(progress * 70) });
                    }
                },
            }),
            renderTimeoutMs,
            'renderMedia'
        );

        // console.log('   ✅ Video saved to:', outputPath);
        progressBar.update(100, { phase: 'Done' });
        progressBar.stop();

        // Note: immediate cleanup removed to allow caching and avoid races.
        // Purge logic handles old temp dirs.

        return outputPath;

    } catch (error) {
        console.error('Render failed:', error);
        throw error;
    }
}

export async function renderStill(tsxCode, outputPath, frame, settings) {
    const browserPath = await ensureRemotionBrowser();
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

        // Acquire lock and perform bundling
        bundleLocation = await (bundleLock = bundleLock.then(async () => {
            // Check for cached bundle info
            try {
                const bundleInfo = JSON.parse(await fs.readFile(bundleInfoPath, 'utf-8'));
                await fs.access(bundleInfo.location);
                return bundleInfo.location;
            } catch (e) {
                // Not cached or invalid, proceed to bundle
            }

            const publicDir = join(__dirname, '../../../public');
            const loc = await withTimeout(
                bundle({ entryPoint: entryPath, publicDir: publicDir }),
                90_000,
                'bundling (still)'
            );
            await fs.writeFile(bundleInfoPath, JSON.stringify({ location: loc }), 'utf-8');
            return loc;
        }));

        const composition = await selectComposition({
            serveUrl: bundleLocation,
            id: 'Animation',
            browserExecutable: browserPath,
        });

        await fs.mkdir(dirname(outputPath), { recursive: true });

        // Use last frame if frame is -1 (default: capture final state of animation)
        const resolvedFrame = frame === -1 ? composition.durationInFrames - 1 : frame;

        await remotionRenderStill({
            composition,
            serveUrl: bundleLocation,
            output: outputPath,
            frame: resolvedFrame,
            browserExecutable: browserPath,
        });

        // Note: immediate cleanup removed to allow caching and avoid races.
        // Purge logic handles old temp dirs.

        return outputPath;
    } catch (error) {
        console.error('Still render failed:', error);
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
        const browserPath = await ensureRemotionBrowser();
        console.log(`✅ Browser ready: ${browserPath}`);

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
