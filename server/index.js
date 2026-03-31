/**
 * ARXXIS Director Studio — Standalone Server
 * Serves: Project Director + Audio Studio + LLM Settings
 * Port: 3002 (same as main app — run one or the other, not both)
 */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';
import fsSync from 'fs';
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';
import archiver from 'archiver';

import { getSettings, updateSettings, getRawSettings, MODEL_OPTIONS, getGoogleKey, getImageModel } from './settings.js';
import videoGeneratorRouter from './videoGenerator.js';
import { processVoiceover, processBatch, concatenateAudio, changeSpeed } from './services/audioProcessor.js';
import { googleAI } from './services/llm.js';
import { generateImage as generateGeminiImage } from './services/gemini.js';
import { renderVideo as renderRemotion, warmupBundler, purgeOldTempDirs } from './engines/remotion/renderer.js';
import { auditTemplate, applyFix, TEMPLATES_DIR, AUDIT_DIR, REPORT_PATH } from './templateAuditor.js';
import { generateAdjustment, diffSummary, getAllPresets } from './adjustmentPresets.js';
import {
    listProjects, getProject, createProject, updateProject, deleteProject,
    addChapter, updateChapter, deleteChapter, updateChapterScenes,
    updateScene, flagScene
} from './projects.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

process.on('unhandledRejection', (reason) => {
    console.error('🚨 Unhandled rejection:', reason?.message || reason);
});

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// ── Directories ──────────────────────────────────────────────────────────────
const publicDir         = join(__dirname, '../public');
const videosDir         = join(publicDir, 'videos');
const audioDir          = join(publicDir, 'audio');
const audioProcessedDir = join(publicDir, 'audio/processed');
const audioTtsDir       = join(publicDir, 'audio/tts');
const imagesDir         = join(publicDir, 'images');

await fs.mkdir(videosDir,         { recursive: true });
await fs.mkdir(audioDir,          { recursive: true });
await fs.mkdir(audioProcessedDir, { recursive: true });
await fs.mkdir(audioTtsDir,       { recursive: true });
await fs.mkdir(imagesDir,         { recursive: true });
await fs.mkdir(join(__dirname, 'projects'), { recursive: true });

// ── Static serving ────────────────────────────────────────────────────────────
app.use('/videos', express.static(videosDir));
app.use('/audio',  express.static(audioDir));
app.use('/images', express.static(imagesDir));
app.use(express.static(join(__dirname, '../dist')));

// ── Multer — image uploads ──────────────────────────────────────────────────
const imageStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, imagesDir),
    filename:    (req, file, cb) => cb(null, `upload_${uuidv4()}.${file.originalname.split('.').pop()}`)
});
const imageUpload = multer({
    storage: imageStorage,
    fileFilter: (req, file, cb) => {
        const allowed = /jpg|jpeg|png|webp|gif/;
        const ext = file.originalname.split('.').pop().toLowerCase();
        cb(null, allowed.test(ext));
    }
});

app.post('/api/upload-image', imageUpload.single('image'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No image provided or invalid format' });
    const url = `/images/${req.file.filename}`;
    res.json({ success: true, url });
});

// ── Multer — voiceover uploads ──────────────────────────────────────────────────

const voiceoverStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, audioDir),
    filename:    (req, file, cb) => cb(null, `vo_${uuidv4()}.${file.originalname.split('.').pop()}`)
});
const voiceoverUpload = multer({
    storage: voiceoverStorage,
    fileFilter: (req, file, cb) => {
        const allowed = /mp3|wav|m4a|aac|ogg|flac|webm/;
        const ext = file.originalname.split('.').pop().toLowerCase();
        cb(null, allowed.test(ext));
    }
});

// ── Render job tracking ───────────────────────────────────────────────────────
const renderJobs = new Map();

// Helper: generate a 3D image prompt from template scene data
async function generateFallback3DPrompt(script, template, theme, content) {
    const apiKey = getGoogleKey();
    if (!apiKey) {
        throw new Error('Google API key not configured for fallback generation');
    }

    const model = googleAI.getGenerativeModel({
        model: 'gemini-3.1-flash-lite-preview',
        generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 1024,
        }
    });

    const prompt = `You are a 3D scene director. Convert this failed Remotion template scene into a single 3D render prompt.

TEMPLATE: ${template}
THEME: ${theme}
CONTENT: ${JSON.stringify(content)}
SCRIPT: ${script}

Generate a single 60-80 word prompt for a photorealistic 3D render that captures the essence of this scene.
Rules:
- Visualize the key data/concept from the content
- Use the mood indicated by the theme (THREAT = urgent/dark, CLEAN = clean/modern, etc.)
- Describe the visual elements clearly
- Include lighting and camera angle suggestions
- NO humans, NO text overlays in the scene itself
- Cinematic documentary style

Return ONLY the prompt text, no markdown, no explanations.`;

    try {
        const result = await model.generateContent(prompt);
        return result.response.text().trim();
    } catch (err) {
        console.warn('⚠️ Fallback prompt generation failed:', err.message);
        // Return a generic fallback prompt
        return `Cinematic documentary scene visualizing: ${script.substring(0, 50)}. Dark moody atmosphere, volumetric lighting, photorealistic 3D render, no humans.`;
    }
}

// Helper: generate a 3D image as fallback
async function generateFallbackImage(prompt, environment = 'standard') {
    const apiKey = getGoogleKey();
    if (!apiKey) {
        throw new Error('Google API key not configured for image generation');
    }

    const imageModel = getImageModel() || 'imagen-4.0-generate-001';

    let promptSuffix = ". Cinematic 16:9 documentary style, photorealistic, no humans, no text overlays.";
    if (environment === 'editorial-illustration') {
        promptSuffix = ". Editorial financial newspaper illustration style, watercolor and ink on parchment paper, visible textures, no photorealism, no 3D effects.";
    }

    // Support for Gemini Image Models (Nano Banana)
    if (imageModel.startsWith('gemini-')) {
        console.log(`   📡 Calling Gemini Image API (Fallback): ${imageModel}`);
        const res = await generateGeminiImage(`${prompt}${promptSuffix}`, { model: imageModel });
        if (res.success) return res.url;
        throw new Error(`Gemini Image Fallback failed: ${res.error}`);
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${imageModel}:predict?key=${apiKey}`;

    const body = {
        instances: [{ prompt: `${prompt}${promptSuffix}` }],
        parameters: { sampleCount: 1, aspectRatio: '16:9' },
    };

    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const errText = await response.text();
        console.error('❌ Fallback Imagen API error:', errText.substring(0, 500));
        // Check if error is HTML (common for API issues)
        if (errText.trim().startsWith('<')) {
            console.error('   ⚠️ Fallback API returned HTML error page instead of JSON');
            throw new Error(`Fallback Imagen API returned HTML error page. Check your Google API key.`);
        }
        throw new Error(`Fallback Imagen API ${response.status}: ${errText.substring(0, 200)}`);
    }

    const responseText = await response.text();

    // Check if response is HTML instead of JSON
    if (responseText.trim().startsWith('<')) {
        console.error('❌ Fallback Imagen API returned HTML instead of JSON');
        console.error('   📋 First 300 chars:', responseText.substring(0, 300));
        throw new Error(`Fallback Imagen API returned HTML error page. Response: ${responseText.substring(0, 200)}...`);
    }

    let data;
    try {
        data = JSON.parse(responseText);
    } catch (parseErr) {
        console.error('❌ Failed to parse fallback API response as JSON:', parseErr.message);
        throw new Error(`Fallback Imagen API returned invalid JSON. Parse error: ${parseErr.message}`);
    }

    const b64 = data?.predictions?.[0]?.bytesBase64Encoded;
    if (!b64) throw new Error('No image returned from Fallback Imagen API. Response: ' + JSON.stringify(data).substring(0, 200));

    const imgId = `fallback_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const imgPath = join(imagesDir, `${imgId}.jpg`);
    await fs.writeFile(imgPath, Buffer.from(b64, 'base64'));

    console.log(`   🖼️ Fallback image generated: ${imgId}.jpg`);
    return `/images/${imgId}.jpg`;
}

// ── Render concurrency semaphore ──────────────────────────────────────────────
// Limits simultaneous Remotion renders so the VPS doesn't OOM.
// Default: 2 for 6-CPU VPS. Override with env RENDER_CONCURRENCY.
const MAX_CONCURRENT_RENDERS = Math.min(
    parseInt(process.env.RENDER_CONCURRENCY) || 2,
    2  // hard cap — never allow more than 2 on this VPS
);
let _activeRenders = 0;
const _renderQueue = [];

function acquireRenderSlot() {
    return new Promise(resolve => {
        if (_activeRenders < MAX_CONCURRENT_RENDERS) {
            _activeRenders++;
            resolve();
        } else {
            console.log(`⏳ Render queued (${_renderQueue.length + 1} waiting, ${_activeRenders}/${MAX_CONCURRENT_RENDERS} active)`);
            _renderQueue.push(resolve);
        }
    });
}

function releaseRenderSlot() {
    if (_renderQueue.length > 0) {
        const next = _renderQueue.shift();
        next(); // hand the slot to the next waiting render
    } else {
        _activeRenders--;
    }
}

// Helper: start a background video render job and return { job, videoId }
function startVideoRenderJob(filledCode, opts = {}) {
    const job = createRenderJob({});
    const videoId = `anim_${job.id.substring(0, 8)}`;
    const outputPath = join(videosDir, `${videoId}.mp4`);
    const renderOpts = { duration: opts.duration || 10, fps: opts.fps || 30, width: opts.width || 1920, height: opts.height || 1080 };
    job.phase = 'bundling';
    job.status = 'processing';
    job.message = 'Preparing render...';

    (async () => {
        await acquireRenderSlot();
        try {
            job.message = 'Render slot acquired, starting...';
            await renderRemotion(filledCode, outputPath, {
                ...renderOpts,
                onProgress: (p) => {
                    job.phase = p.phase;
                    job.progress = p.progress;
                    if (p.phase === 'bundling') {
                        job.message = p.progress >= 30 ? 'Bundling complete, starting render...' : `Bundling... ${Math.round((p.progress / 30) * 100)}%`;
                    } else {
                        job.message = `Rendering frames... ${p.progress}%`;
                    }
                }
            });
            job.status = 'completed';
            job.progress = 100;
            job.url = `/videos/${videoId}.mp4`;
            job.message = 'Done';
        } catch (err) {
            // ── Fallback: Generate 3D image when render fails ─────────────────────────────────
            if (opts.sceneData && opts.sceneData.type === 'TEMPLATE') {
                try {
                    console.log(`   🔄 Render failed, attempting 3D image fallback...`);
                    job.message = 'Render failed, generating fallback image...';
                    job.phase = 'fallback';
                    job.progress = 90;

                    const { script, template, theme, content, environment } = opts.sceneData;
                    const fallbackPrompt = await generateFallback3DPrompt(script, template, theme, content);
                    const fallbackImageUrl = await generateFallbackImage(fallbackPrompt, environment);

                    job.status = 'fallback';
                    job.progress = 100;
                    job.imageUrl = fallbackImageUrl;
                    job.fallbackPrompt = fallbackPrompt;
                    job.message = 'Fallback image ready';
                    console.log(`   ✅ Fallback image generated for failed render ${job.id}`);
                    return;
                } catch (fallbackErr) {
                    console.error(`   ❌ Fallback generation also failed:`, fallbackErr.message);
                    // Continue to original error handling
                }
            }

            // Original error handling if fallback not applicable or failed
            job.status = 'error';
            job.error = err.message;
            job.message = 'Render failed';
            console.error(`❌ Video render ${job.id} failed:`, err.message);
        } finally {
            releaseRenderSlot();
        }
    })();

    return { job, videoId };
}

function createRenderJob(data = {}) {
    const jobId = uuidv4();
    const job = { id: jobId, status: 'pending', phase: 'idle', progress: 0, message: 'Initializing...', startTime: Date.now(), ...data };
    renderJobs.set(jobId, job);
    setTimeout(() => renderJobs.delete(jobId), 4 * 60 * 60 * 1000);
    return job;
}

// ── SETTINGS ─────────────────────────────────────────────────────────────────
app.use('/api/video-gen', videoGeneratorRouter);

app.get('/api/settings', (req, res) => {
    res.json({ success: true, settings: getSettings(), modelOptions: MODEL_OPTIONS });
});

app.put('/api/settings', (req, res) => {
    try {
        const updated = updateSettings(req.body);
        res.json({ success: true, settings: updated });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ── PROJECTS ──────────────────────────────────────────────────────────────────
app.get('/api/projects', (req, res) => {
    res.json({ success: true, projects: listProjects() });
});

app.post('/api/projects', (req, res) => {
    try {
        const { name, description, settings } = req.body;
        if (!name) return res.status(400).json({ error: 'name is required' });
        const project = createProject(name, description, settings);
        res.json({ success: true, project });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.get('/api/projects/:id', (req, res) => {
    const project = getProject(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json({ success: true, project });
});

app.put('/api/projects/:id', (req, res) => {
    try {
        const project = updateProject(req.params.id, req.body);
        res.json({ success: true, project });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.delete('/api/projects/:id', (req, res) => {
    try {
        deleteProject(req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.get('/api/projects/:id/export', (req, res) => {
    try {
        const project = getProject(req.params.id);
        if (!project) return res.status(404).json({ error: 'Project not found' });

        res.attachment(`${project.name.replace(/[^a-zA-Z0-9]/g, '_')}_export.zip`);
        const archive = archiver('zip', { zlib: { level: 9 } });
        archive.on('error', err => { throw err; });
        archive.pipe(res);

        project.chapters.forEach((chapter, cIdx) => {
            const chapterNum = String(cIdx + 1).padStart(2, '0');
            chapter.scenes.forEach(scene => {
                const sceneNum = String(scene.globalIndex).padStart(3, '0');
                if (scene.videoUrl) {
                    const fileName = scene.videoUrl.split('/').pop();
                    const localPath = join(videosDir, fileName);
                    if (fsSync.existsSync(localPath)) {
                        archive.file(localPath, { name: `Ch${chapterNum}_Sc${sceneNum}_${fileName}` });
                    }
                } else if (scene.imageUrl) {
                    const fileName = scene.imageUrl.split('/').pop();
                    const localPath = join(imagesDir, fileName);
                    if (fsSync.existsSync(localPath)) {
                        archive.file(localPath, { name: `Ch${chapterNum}_Sc${sceneNum}_${fileName}` });
                    }
                }
            });
        });

        archive.append(JSON.stringify(project, null, 2), { name: 'project_data.json' });
        archive.finalize();
        } catch (err) {
        res.status(500).json({ success: false, error: err.message });
        }
        });

        app.get('/api/projects/:pid/chapters/:cid/export', (req, res) => {
        try {
        const project = getProject(req.params.pid);
        if (!project) return res.status(404).json({ error: 'Project not found' });

        const chapter = project.chapters.find(c => c.id === req.params.cid);
        if (!chapter) return res.status(404).json({ error: 'Chapter not found' });

        res.attachment(`${project.name.replace(/[^a-zA-Z0-9]/g, '_')}_${chapter.title.replace(/[^a-zA-Z0-9]/g, '_')}_export.zip`);
        const archive = archiver('zip', { zlib: { level: 9 } });
        archive.on('error', err => { throw err; });
        archive.pipe(res);

        chapter.scenes.forEach(scene => {
            const sceneNum = String(scene.globalIndex).padStart(3, '0');
            if (scene.videoUrl) {
                const fileName = scene.videoUrl.split('/').pop();
                const localPath = join(videosDir, fileName);
                if (fsSync.existsSync(localPath)) {
                    archive.file(localPath, { name: `Sc${sceneNum}_${fileName}` });
                }
            } else if (scene.imageUrl) {
                const fileName = scene.imageUrl.split('/').pop();
                const localPath = join(imagesDir, fileName);
                if (fsSync.existsSync(localPath)) {
                    archive.file(localPath, { name: `Sc${sceneNum}_${fileName}` });
                }
            }
        });

        archive.append(JSON.stringify(chapter, null, 2), { name: 'chapter_data.json' });
        archive.finalize();
        } catch (err) {
        res.status(500).json({ success: false, error: err.message });
        }
        });

        // Root Route
        app.get('/', (req, res) => {
        res.send('🎬 ARXXIS Director Studio API Server is running. Access the UI via port 5174 in development.');
        });

        // ── CHAPTERS ──────────────────────────────────────────────────────────────────
app.post('/api/projects/:id/chapters', async (req, res) => {
    try {
        const { title, scriptText, scenes } = req.body;
        if (!scriptText) return res.status(400).json({ error: 'scriptText is required' });

        let processedScenes = scenes;
        if (!processedScenes) {
            const project = getProject(req.params.id);
            const genSettings = project?.generationSettings || null;
            const directorType = project?.settings?.director || 'standard';
            
            console.log(`   🎬 Using director: ${directorType}`);
            const { generateScenes } = await import(directorType === 'fiscal-pal' ? './autoSceneFiscal.js' : './autoScene.js');
            processedScenes = await generateScenes(scriptText, genSettings);
        }

        const result = addChapter(req.params.id, title || `Chapter ${Date.now()}`, scriptText, processedScenes);
        res.json({ success: true, project: result.project, chapter: result.chapter });
    } catch (err) {
        console.error('❌ Add chapter error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

app.put('/api/projects/:pid/chapters/:cid', (req, res) => {
    try {
        const result = updateChapter(req.params.pid, req.params.cid, req.body);
        res.json({ success: true, project: result.project, chapter: result.chapter });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.delete('/api/projects/:pid/chapters/:cid', (req, res) => {
    try {
        const project = deleteChapter(req.params.pid, req.params.cid);
        res.json({ success: true, project });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ── 3D RENDER / IMAGE GENERATION ─────────────────────────────────────────────
// Generate an AI image from a 3D render prompt using Google Imagen
app.post('/api/auto-scene/render-3d', async (req, res) => {
    try {
        const { prompt, environment, camera } = req.body;
        if (!prompt) return res.status(400).json({ error: 'prompt is required' });

        const apiKey = getGoogleKey();
        if (!apiKey) {
            console.error('❌ Imagen API: Google API key not configured in settings');
            return res.status(503).json({ error: 'Google API key not configured' });
        }

        const imageModel = getImageModel() || 'imagen-4.0-generate-001';

        // Choose prompt suffix based on environment
        let promptSuffix = ". Cinematic 16:9 documentary style, photorealistic, no humans, no text overlays.";
        if (environment === 'editorial-illustration') {
            promptSuffix = ". Editorial financial newspaper illustration style, watercolor and ink on parchment paper, visible textures, no photorealism, no 3D effects, NO TEXT, NO WRITING, NO LETTERS, clean background.";
        }

        console.log(`   🎨 Suffix: ${environment === 'editorial-illustration' ? 'ILLUSTRATION' : 'PHOTOREALISTIC'}`);

        // Support for Gemini Image Models (Nano Banana)
        if (imageModel.startsWith('gemini-')) {
            const imgResult = await generateGeminiImage(`${prompt}${promptSuffix}`, { model: imageModel });
            if (imgResult.success) {
                return res.json({ success: true, url: imgResult.url });
            }
            throw new Error(imgResult.error);
        }

        // Call Imagen via Google AI REST API
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${imageModel}:predict?key=${apiKey}`;
        const body = {
            instances: [{ prompt: `${prompt}${promptSuffix}` }],
            parameters: { sampleCount: 1, aspectRatio: '16:9' },
        };

        console.log(`   📡 Calling Imagen API: ${imageModel}`);
        console.log(`   📋 Prompt: ${prompt.substring(0, 100)}...`);

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error('❌ Imagen API error:', errText.substring(0, 500));
            // Check if error is HTML (common for API issues)
            if (errText.trim().startsWith('<')) {
                console.error('   ⚠️ API returned HTML error page instead of JSON');
                console.error('   📋 First 300 chars:', errText.substring(0, 300));
                throw new Error(`Imagen API returned HTML error page. Status: ${response.status}. This may indicate: invalid API key, API quota exceeded, or service unavailable.`);
            }
            throw new Error(`Imagen API ${response.status}: ${errText.substring(0, 200)}`);
        }

        const responseText = await response.text();

        // Check if response is HTML instead of JSON
        if (responseText.trim().startsWith('<')) {
            console.error('❌ Imagen API returned HTML instead of JSON');
            console.error('   📋 First 300 chars:', responseText.substring(0, 300));
            console.error('   🔍 TROUBLESHOOTING:');
            console.error('      1. Check Google API key is valid and not expired');
            console.error('      2. Verify Imagen API is enabled in Google Cloud Console');
            console.error('      3. Check API quota limits (may be exceeded)');
            console.error('      4. Current model:', imageModel);
            throw new Error(`Imagen API returned HTML error page. Check your Google API key and Imagen access. Response: ${responseText.substring(0, 200)}...`);
        }

        let data;
        try {
            data = JSON.parse(responseText);
        } catch (parseErr) {
            console.error('❌ Failed to parse API response as JSON:', parseErr.message);
            console.error('   📋 Response first 300 chars:', responseText.substring(0, 300));
            throw new Error(`Imagen API returned invalid JSON. Parse error: ${parseErr.message}`);
        }

        const b64 = data?.predictions?.[0]?.bytesBase64Encoded;
        if (!b64) throw new Error('No image returned from Imagen API. Response: ' + JSON.stringify(data).substring(0, 200));

        // Save to public/images/
        const imgId = `render_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        const imgPath = join(imagesDir, `${imgId}.jpg`);
        await fs.writeFile(imgPath, Buffer.from(b64, 'base64'));

        console.log(`   🖼️ 3D Render saved: ${imgId}.jpg`);
        res.json({ success: true, url: `/images/${imgId}.jpg` });
    } catch (err) {
        const cause = err.cause ? ` | cause: ${err.cause?.code || err.cause?.message || JSON.stringify(err.cause)}` : '';
        console.error(`❌ render-3d error: ${err.message}${cause}`);
        res.status(500).json({ success: false, error: err.message, cause: String(err.cause || '') });
    }
});

// ── ANIMATE STATIC IMAGE TO VIDEO ────────────────────────────────────────────
// Animate a static image using ImageHero template for 3D_RENDER scenes
app.post('/api/auto-scene/render-image-video', async (req, res) => {
    try {
        const { imageUrl, motion, duration } = req.body;
        if (!imageUrl) return res.status(400).json({ error: 'imageUrl is required' });

        const { fillTemplate } = await import('./templateFiller.js');

        // Fill ImageHero template with the image URL and motion type
        const content = {
            IMAGE_URL: imageUrl,
            MOTION_TYPE: motion || 'zoom-in'
        };

        const filledCode = fillTemplate('ImageHero', 'DARK', content);

        // Start render job with the filled template
        const { job, videoId } = startVideoRenderJob(filledCode, {
            duration: duration || 15,
            fps: 30,
            width: 1920,
            height: 1080,
            sceneData: { type: '3D_RENDER' } // Not a template scene, so no fallback needed
        });

        console.log(`   🎬 Image-to-video render started: ${job.id}`);
        res.json({ success: true, jobId: job.id, videoId });
    } catch (err) {
        console.error('❌ render-image-video error:', err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

// ── TEMPLATE GENERATION ───────────────────────────────────────────────────────
// Generate a brand-new template + schema from a description and optionally
// fill it for a specific scene (returns filled TSX code immediately).
app.post('/api/templates/generate', async (req, res) => {
    try {
        const { description, suggestedName, category, theme, content } = req.body;
        if (!description) return res.status(400).json({ error: 'description is required' });

        const { generateTemplate } = await import('./templateGenerator.js');
        const generated = await generateTemplate(description, { suggestedName, category: category || 'generated' });

        // Optionally fill the template immediately if content is provided
        let code = null;
        if (content && theme) {
            const { fillTemplate } = await import('./templateFiller.js');
            try {
                code = fillTemplate(generated.template, theme, content);
            } catch (fillErr) {
                console.warn('⚠️ Template fill after generation failed:', fillErr.message);
            }
        }

        res.json({
            success: true,
            template: generated.template,
            schema: generated.schema,
            code,
        });
    } catch (err) {
        console.error('❌ Template generation error:', err.stack || err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

// Generate a template and immediately update a scene with the result
app.post('/api/projects/:pid/chapters/:cid/scenes/:idx/generate-template', async (req, res) => {
    try {
        const { pid, cid, idx } = req.params;
        const project = getProject(pid);
        if (!project) return res.status(404).json({ error: 'Project not found' });
        const chapter = project.chapters.find(c => c.id === cid);
        if (!chapter) return res.status(404).json({ error: 'Chapter not found' });
        const scene = chapter.scenes[parseInt(idx)];
        if (!scene) return res.status(404).json({ error: 'Scene not found' });

        const { generateTemplate } = await import('./templateGenerator.js');
        const { fillTemplate } = await import('./templateFiller.js');
        const { fuzzyMapFields } = await import('./templateSystem.js');
        const { loadSchema } = await import('./templateRouter.js');

        const description = req.body.description ||
            `${scene.reasoning || scene.script}\nVisualization type: ${scene.template || 'custom'}\nContent: ${JSON.stringify(scene.content || {})}`;

        const generated = await generateTemplate(description, {
            suggestedName: scene.template || undefined,
            category: 'scene-generated',
        });

        // Fill with scene content
        const schema = loadSchema(generated.template);
        const schemaFields = schema?.fields || {};
        const mappedContent = fuzzyMapFields(scene.content || {}, schemaFields);
        Object.keys(schemaFields).forEach(k => { if (!(k in mappedContent)) mappedContent[k] = '' });

        const code = fillTemplate(generated.template, scene.theme || 'THREAT', mappedContent);

        // Persist back to scene
        const result = updateScene(pid, cid, parseInt(idx), {
            template: generated.template,
            content: mappedContent,
            code,
            error: null,
        });

        res.json({ success: true, scene: result.scene, template: generated.template });
    } catch (err) {
        console.error('❌ Scene generate-template error:', err.stack || err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

app.post('/api/projects/:pid/chapters/:cid/reanalyze', async (req, res) => {
    try {
        const project = getProject(req.params.pid);
        if (!project) return res.status(404).json({ error: 'Project not found' });
        const chapter = project.chapters.find(c => c.id === req.params.cid);
        if (!chapter) return res.status(404).json({ error: 'Chapter not found' });

        console.log(`   📄 Chapter scriptText: ${chapter.scriptText?.length ?? 'MISSING'} chars`)
        const genSettings = project.generationSettings || null;
        const directorType = project?.settings?.director || 'standard';
        
        console.log(`   🎬 Using director (reanalyze): ${directorType}`);
        const { generateScenes } = await import(directorType === 'fiscal-pal' ? './autoSceneFiscal.js' : './autoScene.js');
        
        const processedScenes = await generateScenes(chapter.scriptText, genSettings);
        const result = updateChapterScenes(req.params.pid, req.params.cid, processedScenes);
        res.json({ success: true, project: result.project, chapter: result.chapter });
    } catch (err) {
        console.error('❌ Reanalyze error:', err.stack || err.message);
        res.status(500).json({ success: false, error: err.message, stack: err.stack?.split('\n')[0] });
    }
});

// ── SCENES ────────────────────────────────────────────────────────────────────
app.put('/api/projects/:pid/chapters/:cid/scenes/:idx', (req, res) => {
    try {
        const result = updateScene(req.params.pid, req.params.cid, parseInt(req.params.idx), req.body);
        res.json({ success: true, scene: result.scene });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.put('/api/projects/:pid/chapters/:cid/scenes/:idx/flag', (req, res) => {
    try {
        const result = flagScene(req.params.pid, req.params.cid, parseInt(req.params.idx), req.body.flag);
        res.json({ success: true, scene: result.scene });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ── RENDER JOBS ───────────────────────────────────────────────────────────────
app.post('/api/manual-render-job', async (req, res) => {
    try {
        const { code, duration, fps, width, height, sceneData } = req.body;
        if (!code) return res.status(400).json({ error: 'TSX code is required' });

        const job = createRenderJob({ code, duration, fps, width, height, sceneData });
        res.json({ success: true, jobId: job.id });

        const videoId = `Director_${job.id.substring(0, 8)}`;
        const outputPath = join(videosDir, `${videoId}.mp4`);
        const renderOptions = { duration: duration || 15, fps: fps || 30, width: width || 1920, height: height || 1080, sceneData };

        job.phase = 'bundling';
        job.status = 'processing';
        job.message = 'Preparing render...';

        try {
            await renderRemotion(code, outputPath, {
                ...renderOptions,
                onProgress: (p) => {
                    job.phase = p.phase;
                    job.progress = p.progress;
                    if (p.phase === 'bundling') {
                        job.message = p.progress === 100 ? 'Bundling complete, starting render...' : `Bundling... ${p.progress}%`;
                    } else {
                        job.message = `Rendering frames... ${p.progress}%`;
                    }
                }
            });
            job.status = 'completed';
            job.progress = 100;
            job.url = `/videos/${videoId}.mp4`;
            job.message = 'Done';
            console.log(`✅ Render ${job.id} complete`);
        } catch (err) {
            // Fallback handling is now inside startVideoRenderJob
            job.status = 'error';
            job.error = err.message;
            job.message = 'Render failed';
            console.error(`❌ Render ${job.id} failed:`, err.message);
        }
    } catch (err) {
        res.status(500).json({ error: 'Failed to create render job' });
    }
});

app.get('/api/render-progress/:jobId', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const send = (data) => res.write(`data: ${JSON.stringify(data)}\n\n`);
    const job = renderJobs.get(req.params.jobId);

    if (!job) { send({ status: 'error', error: 'Job not found' }); return res.end(); }
    if (job.status === 'completed' || job.status === 'error') { send(job); return res.end(); }

    const interval = setInterval(() => {
        const j = renderJobs.get(req.params.jobId);
        if (!j) { clearInterval(interval); return res.end(); }
        send(j);
        if (j.status === 'completed' || j.status === 'error') { clearInterval(interval); res.end(); }
    }, 1000);

    req.on('close', () => clearInterval(interval));
});

app.get('/api/job-status/:jobId', (req, res) => {
    const job = renderJobs.get(req.params.jobId);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    res.json(job);
});

// ── VOICEOVER ─────────────────────────────────────────────────────────────────
app.post('/api/voiceover/process', voiceoverUpload.single('audio'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No audio file provided' });

        const options = {
            removeSilences: req.body.removeSilences !== 'false',
            enhance: req.body.enhance !== 'false',
            silenceOptions: {
                silenceThreshold: parseInt(req.body.silenceThreshold) || -40,
                silenceDuration: parseFloat(req.body.silenceDuration) || 0.5
            },
            enhanceOptions: {
                bassBoost: parseInt(req.body.bassBoost) || 6,
                trebleBoost: parseInt(req.body.trebleBoost) || 3,
                compression: req.body.compression !== 'false',
                normalize: req.body.normalize !== 'false',
                deEss: req.body.deEss !== 'false'
            }
        };

        const result = await processVoiceover(req.file.path, options);
        try { await fs.unlink(req.file.path); } catch (_) {}
        res.json({ success: true, ...result, originalFilename: req.file.originalname });
    } catch (err) {
        console.error('❌ Voiceover error:', err);
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/voiceover/batch', voiceoverUpload.array('audio', 20), async (req, res) => {
    try {
        if (!req.files?.length) return res.status(400).json({ error: 'No audio files provided' });

        const options = {
            removeSilences: req.body.removeSilences !== 'false',
            enhance: req.body.enhance !== 'false',
            silenceOptions: {
                silenceThreshold: parseInt(req.body.silenceThreshold) || -40,
                silenceDuration: parseFloat(req.body.silenceDuration) || 0.5
            },
            enhanceOptions: {
                bassBoost: parseInt(req.body.bassBoost) || 6,
                trebleBoost: parseInt(req.body.trebleBoost) || 3,
                compression: req.body.compression !== 'false',
                normalize: req.body.normalize !== 'false',
                deEss: req.body.deEss !== 'false'
            }
        };

        const result = await processBatch(req.files.map(f => f.path), options);
        for (const f of req.files) { try { await fs.unlink(f.path); } catch (_) {} }
        result.results = result.results.map((r, i) => ({ ...r, originalFilename: req.files[i].originalname }));
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/voiceover/concatenate', async (req, res) => {
    try {
        const { files, speed } = req.body;
        if (!files?.length) return res.status(400).json({ error: 'No files provided' });

        const inputPaths = files.map(url => join(publicDir, url.replace(/^\//, '')));
        for (const p of inputPaths) {
            try { await fs.access(p); }
            catch { return res.status(400).json({ error: `File not found: ${p}` }); }
        }

        const speedValue = parseFloat(speed) || 1.0;
        let filesToMerge = inputPaths;
        const tempFiles = [];

        if (speedValue !== 1.0) {
            filesToMerge = [];
            for (const inputPath of inputPaths) {
                const tmpPath = join(audioProcessedDir, `speed_${uuidv4()}.mp3`);
                await changeSpeed(inputPath, tmpPath, speedValue);
                filesToMerge.push(tmpPath);
                tempFiles.push(tmpPath);
            }
        }

        const outputPath = join(audioProcessedDir, `merged_${uuidv4()}.mp3`);
        await concatenateAudio(filesToMerge, outputPath);
        for (const t of tempFiles) { try { await fs.unlink(t); } catch (_) {} }

        const outputUrl = `/audio/processed/${outputPath.split('/').pop()}`;
        res.json({ success: true, outputUrl, message: `Merged ${files.length} files` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/voiceover/processed', async (req, res) => {
    try {
        const entries = await fs.readdir(audioProcessedDir);
        const files = await Promise.all(
            entries
                .filter(f => /\.(mp3|wav|m4a|aac|ogg|flac)$/i.test(f))
                .map(async (f) => {
                    const stat = await fs.stat(join(audioProcessedDir, f));
                    return { filename: f, url: `/audio/processed/${f}`, size: stat.size, createdAt: stat.mtime };
                })
        );
        res.json({ success: true, files: files.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) });
    } catch (err) {
        res.status(500).json({ success: false, files: [], error: err.message });
    }
});

app.delete('/api/voiceover/processed/:filename', async (req, res) => {
    try {
        await fs.unlink(join(audioProcessedDir, req.params.filename));
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/voiceover/download-all', async (req, res) => {
    try {
        const entries = await fs.readdir(audioProcessedDir);
        const files = entries.filter(f => /\.(mp3|wav|m4a|aac|ogg|flac)$/i.test(f));

        res.attachment('processed-audio.zip');
        const archive = archiver('zip', { zlib: { level: 9 } });
        archive.pipe(res);
        files.forEach(f => archive.file(join(audioProcessedDir, f), { name: f }));
        await archive.finalize();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── TEMPLATE AUDITOR ─────────────────────────────────────────────────────────

// In-memory audit jobs: jobId → { status, results, total, current, progress, summary }
const auditJobs = new Map();
// SSE subscribers: jobId → Set of res objects
const auditSubscribers = new Map();

function auditEmit(jobId, event) {
    const subs = auditSubscribers.get(jobId);
    if (!subs) return;
    const data = `data: ${JSON.stringify(event)}\n\n`;
    subs.forEach(res => { try { res.write(data); } catch {} });
    if (event.type === 'complete' || event.type === 'error') {
        subs.forEach(res => { try { res.end(); } catch {} });
        auditSubscribers.delete(jobId);
    }
}

// Serve audit screenshots
app.use('/audit-screenshots', express.static(AUDIT_DIR));

// ── ANIMATION GENERATOR ───────────────────────────────────────────────────────

// GET /api/animation-generator/types — return the full catalog
app.get('/api/animation-generator/types', async (req, res) => {
    try {
        const { ANIMATION_TYPES } = await import('./animationGeneratorTypes.js');
        res.json({ success: true, catalog: ANIMATION_TYPES });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET /api/animation-generator/on-disk — list template names already saved to disk
app.get('/api/animation-generator/on-disk', async (req, res) => {
    try {
        const { listTemplates } = await import('./templateFiller.js');
        res.json({ success: true, templates: listTemplates() });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// POST /api/animation-generator/generate — generate a specific animation type
// Body: { typeId, customDescription? }
app.post('/api/animation-generator/generate', async (req, res) => {
    try {
        const { typeId, customDescription } = req.body;
        if (!typeId) return res.status(400).json({ error: 'typeId is required' });

        const { findType } = await import('./animationGeneratorTypes.js');
        const { generateTemplate } = await import('./templateGenerator.js');
        const { renderTemplateStill } = await import('./templateAuditor.js');

        const typeInfo = findType(typeId);
        if (!typeInfo) return res.status(404).json({ error: `Unknown animation type: ${typeId}` });

        const description = customDescription
            ? `${typeInfo.desc}\n\nAdditional requirements: ${customDescription}`
            : typeInfo.desc;

        console.log(`\n🎬 Animation Generator: "${typeInfo.name}" (${typeId})`);

        const generated = await generateTemplate(description, {
            suggestedName: typeInfo.suggestedName,
            category: typeInfo.categoryId || 'generated',
        });

        const { fillForPreview } = await import('./templateAuditor.js');
        const tsxCode = fsSync.readFileSync(generated.tsxPath, 'utf8');

        // Render a still preview for the UI
        let screenshotUrl = null;
        try {
            const screenshotPath = path.join(__dirname, '../public/audit-screenshots', `${generated.template}.png`);
            await renderTemplateStill(tsxCode, screenshotPath);
            screenshotUrl = `/audit-screenshots/${generated.template}.png`;
            console.log(`   📸 Preview rendered: ${screenshotUrl}`);
        } catch (previewErr) {
            console.warn(`   ⚠️ Preview render failed: ${previewErr.message}`);
        }

        // Auto-start full video render in background
        const filledCode = fillForPreview(tsxCode, {});
        const { job: videoJob } = startVideoRenderJob(filledCode);
        console.log(`   🎬 Video render started: ${videoJob.id}`);

        res.json({
            success: true,
            template: generated.template,
            name: generated.name,
            description: generated.description,
            category: generated.category,
            fields: generated.fields,
            screenshotUrl,
            videoJobId: videoJob.id,
        });
    } catch (err) {
        console.error('❌ Animation generator error:', err.stack || err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

// POST /api/animation-generator/render-video — re-render with custom field values
// Body: { templateName, fieldValues: Record<string, string> }
app.post('/api/animation-generator/render-video', async (req, res) => {
    try {
        const { templateName, fieldValues = {} } = req.body;
        if (!templateName) return res.status(400).json({ error: 'templateName is required' });

        const { fillForPreview } = await import('./templateAuditor.js');
        const tsxPath = path.join(__dirname, 'templates', `${templateName}.tsx`);

        let tsxCode;
        try {
            tsxCode = fsSync.readFileSync(tsxPath, 'utf8');
        } catch {
            return res.status(404).json({ error: `Template not found: ${templateName}` });
        }

        const filledCode = fillForPreview(tsxCode, fieldValues);
        const { job, videoId } = startVideoRenderJob(filledCode);
        console.log(`   🎬 Re-render started: ${job.id} for ${templateName}`);

        res.json({ success: true, jobId: job.id, videoId });
    } catch (err) {
        console.error('❌ Animation render-video error:', err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

// POST /api/audit/start — kick off an audit job
app.post('/api/audit/start', async (req, res) => {
    const { skipRender = false, templateName = null } = req.body || {};
    const jobId = uuidv4();
    const job = { id: jobId, status: 'running', results: [], total: 0, current: '', progress: 0, summary: null };
    auditJobs.set(jobId, job);
    res.json({ jobId });

    // Run audit in background
    (async () => {
        try {
            await fs.mkdir(AUDIT_DIR, { recursive: true });
            const allFiles = (await fs.readdir(TEMPLATES_DIR)).filter(f => f.endsWith('.tsx')).sort();
            const targets = templateName
                ? allFiles.filter(f => f.startsWith(templateName))
                : allFiles;

            job.total = targets.length;
            auditEmit(jobId, { type: 'start', total: targets.length });

            for (let i = 0; i < targets.length; i++) {
                const filename = targets[i];
                const filePath = join(TEMPLATES_DIR, filename);
                job.current = filename;
                job.progress = Math.round((i / targets.length) * 100);
                auditEmit(jobId, { type: 'template_start', filename, index: i, total: targets.length });

                const result = await auditTemplate(filePath, { skipRender }, ({ stage, message }) => {
                    auditEmit(jobId, { type: 'stage', filename, stage, message });
                });

                job.results.push(result);
                auditEmit(jobId, { type: 'template_done', filename, result });
            }

            const errors   = job.results.reduce((n, r) => n + r.issues.filter(i => i.severity === 'error').length, 0);
            const warnings = job.results.reduce((n, r) => n + r.issues.filter(i => i.severity === 'warning').length, 0);
            const clean    = job.results.filter(r => r.issues.length === 0).length;
            job.summary = { templates: targets.length, clean, withIssues: targets.length - clean, errors, warnings };
            job.status   = 'done';
            job.progress = 100;

            // Save report
            const report = { timestamp: new Date().toISOString(), results: job.results, summary: job.summary };
            await fs.writeFile(REPORT_PATH, JSON.stringify(report, null, 2), 'utf-8');

            auditEmit(jobId, { type: 'complete', summary: job.summary });
        } catch (err) {
            job.status = 'error';
            auditEmit(jobId, { type: 'error', message: err.message });
        }
    })();
});

// GET /api/audit/stream/:jobId — SSE live progress
app.get('/api/audit/stream/:jobId', (req, res) => {
    const { jobId } = req.params;
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const job = auditJobs.get(jobId);
    if (!job) { res.write(`data: ${JSON.stringify({ type: 'error', message: 'Job not found' })}\n\n`); return res.end(); }

    // If already done, send full results immediately
    if (job.status === 'done') {
        res.write(`data: ${JSON.stringify({ type: 'complete', summary: job.summary, results: job.results })}\n\n`);
        return res.end();
    }

    if (!auditSubscribers.has(jobId)) auditSubscribers.set(jobId, new Set());
    auditSubscribers.get(jobId).add(res);

    // Send current state to late subscriber
    job.results.forEach(r => {
        res.write(`data: ${JSON.stringify({ type: 'template_done', filename: r.filename, result: r })}\n\n`);
    });

    req.on('close', () => {
        const subs = auditSubscribers.get(jobId);
        if (subs) { subs.delete(res); if (subs.size === 0) auditSubscribers.delete(jobId); }
    });
});

// GET /api/audit/report — last saved report
app.get('/api/audit/report', async (req, res) => {
    try {
        const data = await fs.readFile(REPORT_PATH, 'utf-8');
        res.json(JSON.parse(data));
    } catch {
        res.json(null);
    }
});

// POST /api/audit/fix — fix a single template by filename
app.post('/api/audit/fix', async (req, res) => {
    const { filename } = req.body;
    if (!filename) return res.status(400).json({ error: 'filename required' });

    const filePath = join(TEMPLATES_DIR, filename);
    try {
        // Re-audit to get current issues
        const result = await auditTemplate(filePath, { skipRender: true });
        if (result.issues.length === 0) return res.json({ success: true, message: 'No issues to fix' });

        const fixed = await applyFix(result);
        res.json({ success: true, fixed, issuesFound: result.issues.length });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── TEMPLATE ADJUSTMENTS ──────────────────────────────────────────────────────

// GET /api/templates/adjustment-presets — return the preset library
app.get('/api/templates/adjustment-presets', (_req, res) => {
    res.json({ presets: getAllPresets() });
});

// POST /api/templates/adjust — preview adjustments, returns new code without saving
app.post('/api/templates/adjust', async (req, res) => {
    const { filename, presetIds = [], customPrompt = '' } = req.body;
    if (!filename) return res.status(400).json({ error: 'filename required' });
    if (presetIds.length === 0 && !customPrompt.trim()) {
        return res.status(400).json({ error: 'select at least one preset or provide a custom prompt' });
    }

    const filePath = join(TEMPLATES_DIR, filename);
    try {
        const originalCode = await fs.readFile(filePath, 'utf-8');
        const allPresets = getAllPresets();
        const selectedPresets = presetIds.map(id => allPresets.find(p => p.id === id)).filter(Boolean);

        const newCode = await generateAdjustment(originalCode, selectedPresets, customPrompt, filename.replace('.tsx', ''));
        const diff = diffSummary(originalCode, newCode);

        res.json({ success: true, originalCode, newCode, diff });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/templates/adjust/apply — save previously-previewed adjusted code
app.post('/api/templates/adjust/apply', async (req, res) => {
    const { filename, code } = req.body;
    if (!filename || !code) return res.status(400).json({ error: 'filename and code required' });
    if (!code.includes('AnimationComponent') || !code.includes('useCurrentFrame')) {
        return res.status(400).json({ error: 'Invalid component code — missing AnimationComponent or useCurrentFrame' });
    }

    const filePath = join(TEMPLATES_DIR, filename);
    try {
        // Back up original before saving
        const original = await fs.readFile(filePath, 'utf-8');
        await fs.writeFile(filePath + '.bak', original, 'utf-8');
        await fs.writeFile(filePath, code, 'utf-8');
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── TTS (Kokoro / Orpheus) ────────────────────────────────────────────────────
const TTS_SERVICE_URL = process.env.TTS_SERVICE_URL || 'http://127.0.0.1:8880';

app.get('/api/tts/health', async (req, res) => {
    try {
        const resp = await fetch(`${TTS_SERVICE_URL}/health`, { signal: AbortSignal.timeout(2000) });
        const data = await resp.json();
        res.json({ success: true, ...data });
    } catch (_err) {
        res.status(503).json({ success: false, status: 'unavailable' });
    }
});

app.get('/api/tts/voices', async (req, res) => {
    try {
        const resp = await fetch(`${TTS_SERVICE_URL}/voices`, { signal: AbortSignal.timeout(3000) });
        if (!resp.ok) throw new Error(`TTS service responded ${resp.status}`);
        const data = await resp.json();
        res.json({ success: true, ...data });
    } catch (err) {
        res.status(503).json({ success: false, error: 'TTS service unavailable', detail: err.message });
    }
});

app.post('/api/tts/generate', async (req, res) => {
    const { text, voice = 'af_heart', speed = 1.0, engine = 'kokoro', filename } = req.body;
    if (!text?.trim()) return res.status(400).json({ error: 'text is required' });

    try {
        if (engine === 'heygen') {
            const settings = getRawSettings();
            const apiKey = settings.keys?.heygen;
            if (!apiKey) return res.status(400).json({ error: 'HeyGen API Key not set in LLM Settings' });

            // Call HeyGen TTS API
            const resp = await fetch('https://api.heygen.com/v1/audio/text_to_speech', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-Api-Key': apiKey },
                body: JSON.stringify({ text, voice_id: voice, speed }),
            });

            const data = await resp.json();
            if (!resp.ok || data.error) {
                const msg = data.error?.message || data.message || `HeyGen error ${resp.status}`;
                return res.status(resp.status || 500).json({ error: msg });
            }

            const remoteUrl = data.data?.audio_url;
            if (!remoteUrl) return res.status(500).json({ error: 'No audio_url in HeyGen response' });

            // Download and save locally so it works in the processed queue
            const audioResp = await fetch(remoteUrl);
            const audioBuffer = await audioResp.arrayBuffer();
            const outFilename = filename || `tts_heygen_${uuidv4().slice(0, 12)}.mp3`;
            await fs.writeFile(join(audioTtsDir, outFilename), Buffer.from(audioBuffer));

            return res.json({
                success: true,
                audioUrl: `/audio/tts/${outFilename}`,
                filename: outFilename,
                duration: data.data?.duration || 0,
                voice,
                engine: 'heygen',
            });
        }

        const resp = await fetch(`${TTS_SERVICE_URL}/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, voice, speed, engine, output_filename: filename || undefined }),
        });
        if (!resp.ok) {
            const err = await resp.json().catch(() => ({ detail: resp.statusText }));
            return res.status(resp.status).json({ error: err.detail || 'TTS generation failed' });
        }
        const data = await resp.json();
        res.json({
            success: true,
            audioUrl: `/audio/tts/${data.filename}`,
            filename: data.filename,
            duration: data.duration,
            voice: data.voice,
            engine: data.engine,
        });
    } catch (err) {
        console.error('🔈 TTS error:', err.message);
        res.status(503).json({ error: err.message || 'TTS generation failed', detail: err.message });
    }
});

// ── HEALTH ────────────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', app: 'director-studio', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log(`\n🎬 ARXXIS Director Studio`);
    console.log(`   Server: http://localhost:${PORT}`);
    console.log(`   Frontend (dev): http://localhost:5174`);
    console.log(`   Render slots: ${MAX_CONCURRENT_RENDERS} max concurrent\n`);

    // Pre-warm the Remotion bundler so first render is fast
    warmupBundler().catch(err => console.warn('⚠️ Warmup error (non-critical):', err.message));

    // Purge stale .temp dirs every 30 minutes
    const tempRoot = new URL('../.temp', import.meta.url).pathname;
    setInterval(() => {
        purgeOldTempDirs(tempRoot).catch(() => {});
    }, 30 * 60 * 1000);
});
