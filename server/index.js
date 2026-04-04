/**
 * ARXXIS Director Studio — Standalone Server
 * Serves: Project Director + Audio Studio + LLM Settings
 * Port: 3002 (same as main app — run one or the other, not both)
 */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join, basename } from 'path';
import fs from 'fs/promises';
import fsSync from 'fs';
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';
import archiver from 'archiver';

import { getSettings, updateSettings, getRawSettings, MODEL_OPTIONS, getGoogleKey, getImageModel } from './settings.js';
import videoGeneratorRouter from './videoGenerator.js';
import { processVoiceover, processBatch, concatenateAudio, changeSpeed, assembleChapterVideo } from './services/audioProcessor.js';
import { googleAI } from './services/llm.js';
import { generateImage as generateGeminiImage } from './services/gemini.js';
import { renderVideo as renderRemotion, warmupBundler, purgeOldTempDirs } from './engines/remotion/renderer.js';
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
await fs.mkdir(join(__dirname, '../.temp/remotion'), { recursive: true });

// ── Static serving ────────────────────────────────────────────────────────────
app.use('/videos', express.static(videosDir));
app.use('/audio',  express.static(audioDir));
app.use('/images', express.static(imagesDir));
app.use(express.static(join(__dirname, '../dist')));

// ── Multer — image/video uploads ─────────────────────────────────────────────
const imageStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const ext = file.originalname.split('.').pop().toLowerCase();
        const isVideo = /mp4|mov|webm|avi/.test(ext);
        cb(null, isVideo ? videosDir : imagesDir);
    },
    filename: (req, file, cb) => cb(null, `upload_${uuidv4()}.${file.originalname.split('.').pop()}`)
});
const imageUpload = multer({
    storage: imageStorage,
    fileFilter: (req, file, cb) => {
        const allowed = /jpg|jpeg|png|webp|gif|mp4|mov|webm|avi/;
        const ext = file.originalname.split('.').pop().toLowerCase();
        cb(null, allowed.test(ext));
    }
});

app.post('/api/upload-image', imageUpload.single('image'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file provided or invalid format' });
    const ext = req.file.originalname.split('.').pop().toLowerCase();
    const isVideo = /mp4|mov|webm|avi/.test(ext);
    const url = isVideo ? `/videos/${req.file.filename}` : `/images/${req.file.filename}`;
    res.json({ success: true, url });
});

// ── Multer — voiceover uploads ──────────────────────────────────────────────────

const voiceoverStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, audioDir),
    filename:    (req, file, cb) => cb(null, `vo_${uuidv4()}.${file.originalname.split('.').pop()}`)
});
const voiceoverUpload = multer({
    storage: voiceoverStorage,
    limits: { fileSize: 200 * 1024 * 1024 }, // 200 MB per file
    fileFilter: (req, file, cb) => {
        const allowed = /mp3|wav|m4a|aac|ogg|flac|webm/;
        const ext = file.originalname.split('.').pop().toLowerCase();
        cb(null, allowed.test(ext));
    }
});

// Handle multer errors (e.g. 413 file too large) with JSON instead of HTML
function handleMulterError(err, req, res, next) {
    if (err?.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ error: 'File too large. Maximum size is 200 MB.' });
    }
    next(err);
}

// ── Render job tracking ───────────────────────────────────────────────────────
const renderJobs = new Map();
const MAX_JOB_RETENTION_MS = 60 * 60 * 1000; // 1 hour (down from 4)
const MAX_JOBS_IN_MAP = 200;

function pruneRenderJobs() {
    if (renderJobs.size <= MAX_JOBS_IN_MAP) return;
    // Evict oldest completed/errored jobs first
    const entries = [...renderJobs.entries()]
        .filter(([, j]) => j.status === 'completed' || j.status === 'error' || j.status === 'fallback')
        .sort((a, b) => a[1].startTime - b[1].startTime);
    const toDelete = entries.slice(0, renderJobs.size - MAX_JOBS_IN_MAP);
    toDelete.forEach(([id]) => renderJobs.delete(id));
}

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
        signal: AbortSignal.timeout(60_000),
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
    
    const { projectId, chapterId, sceneIndex } = opts;
    const hasPersistence = projectId && chapterId && sceneIndex !== undefined;

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

            // Auto-persist to project file
            if (hasPersistence) {
                try {
                    const { updateScene } = await import('./projects.js');
                    await updateScene(projectId, chapterId, sceneIndex, { videoUrl: job.url, status: 'rendered', error: null });
                    console.log(`   💾 Project state persisted: Scene ${sceneIndex} rendered`);
                } catch (persistErr) {
                    console.error('   ⚠️ Failed to persist project state:', persistErr.message);
                }
            }

        } catch (err) {
            // Template renders must output MP4 — no image fallback
            job.status = 'error';
            job.error = err.message;
            job.message = 'Render failed';
            console.error(`❌ Video render ${job.id} failed:`, err.message);

            // Auto-persist error to project file
            if (hasPersistence) {
                try {
                    const { updateScene } = await import('./projects.js');
                    await updateScene(projectId, chapterId, sceneIndex, { error: err.message, status: 'pending' });
                } catch (pErr) {}
            }
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
    setTimeout(() => renderJobs.delete(jobId), MAX_JOB_RETENTION_MS);
    pruneRenderJobs();
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
const _chapterInFlight = new Set();

app.post('/api/projects/:id/chapters', async (req, res) => {
    try {
        const { title, scriptText, scenes } = req.body;
        if (!scriptText) return res.status(400).json({ error: 'scriptText is required' });

        const project = getProject(req.params.id);

        // Deduplicate: if a chapter with identical script already exists, return it
        const existing = project?.chapters?.find(c => c.scriptText?.trim() === scriptText.trim());
        if (existing) {
            console.log(`   ⚠️ Duplicate chapter detected — returning existing`);
            return res.json({ success: true, project, chapter: existing });
        }

        // Prevent concurrent identical requests
        const lockKey = `${req.params.id}:${scriptText.slice(0, 60)}`;
        if (_chapterInFlight.has(lockKey)) {
            return res.status(409).json({ error: 'Chapter analysis already in progress' });
        }
        _chapterInFlight.add(lockKey);

        try {
            let processedScenes = scenes;
            if (!processedScenes) {
                const genSettings = project?.generationSettings || null;
                const directorType = project?.settings?.director || 'standard';
                console.log(`   🎬 Using director: ${directorType}`);
                const { generateScenes } = await import(directorType === 'fiscal-pal' ? './autoSceneFiscal.js' : './autoScene.js');
                processedScenes = await generateScenes(scriptText, genSettings);
            }
            const result = addChapter(req.params.id, title || `Chapter ${Date.now()}`, scriptText, processedScenes);
            res.json({ success: true, project: result.project, chapter: result.chapter });
        } finally {
            _chapterInFlight.delete(lockKey);
        }
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

// ── SCENES ────────────────────────────────────────────────────────────────────
app.put('/api/projects/:pid/chapters/:cid/scenes/:idx', async (req, res) => {
    try {
        const result = await updateScene(req.params.pid, req.params.cid, parseInt(req.params.idx), req.body);
        res.json({ success: true, ...result });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.put('/api/projects/:pid/chapters/:cid/scenes/:idx/flag', async (req, res) => {
    try {
        const result = await flagScene(req.params.pid, req.params.cid, parseInt(req.params.idx), req.body.flag);
        res.json({ success: true, ...result });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.post('/api/projects/:pid/chapters/:cid/reanalyze', async (req, res) => {
    try {
        const project = getProject(req.params.pid);
        if (!project) return res.status(404).json({ error: 'Project not found' });
        const chapter = project.chapters.find(c => c.id === req.params.cid);
        if (!chapter) return res.status(404).json({ error: 'Chapter not found' });
        const directorType = project?.settings?.director || 'standard';
        const { generateScenes } = await import(directorType === 'fiscal-pal' ? './autoSceneFiscal.js' : './autoScene.js');
        const scenes = await generateScenes(chapter.scriptText, project.generationSettings);
        const result = updateChapterScenes(req.params.pid, req.params.cid, scenes);
        res.json({ success: true, ...result });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.post('/api/projects/:pid/chapters/:cid/scenes/:idx/generate-template', async (req, res) => {
    try {
        const { pid, cid, idx } = req.params;
        const project = getProject(pid);
        if (!project) return res.status(404).json({ error: 'Project not found' });
        
        const chapter = project.chapters.find(c => c.id === cid);
        if (!chapter) return res.status(404).json({ error: 'Chapter not found' });
        
        const scene = chapter.scenes[parseInt(idx)];
        if (!scene) return res.status(404).json({ error: 'Scene not found' });

        if (!scene.template) return res.status(400).json({ error: 'No template assigned to scene' });

        const { fillTemplate } = await import('./templateFiller.js');
        const code = fillTemplate(scene.template, scene.theme || 'DARK', scene.content || {});
        
        const result = await updateScene(pid, cid, parseInt(idx), { code });
        res.json({ success: true, ...result });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Utility: Clear temporary files
app.post('/api/utils/clear-temp', async (req, res) => {
    try {
        const tempRoot = join(__dirname, '../.temp');
        const tmpSystem = '/tmp';
        
        // Clear local .temp
        const entries = await fs.readdir(tempRoot);
        for (const entry of entries) {
            await fs.rm(join(tempRoot, entry), { recursive: true, force: true });
        }

        // Try clearing /tmp remotion files
        try {
            const systemTmpEntries = await fs.readdir(tmpSystem);
            for (const entry of systemTmpEntries) {
                if (entry.startsWith('remotion-')) {
                    await fs.rm(join(tmpSystem, entry), { recursive: true, force: true });
                }
            }
        } catch (e) {
            console.warn('⚠️ Could not clear system /tmp:', e.message);
        }

        res.json({ success: true, message: 'Temporary files cleared' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// POST /api/projects/:pid/chapters/:cid/scenes/:idx/regenerate-prompt
// Regenerates the Gemini image prompt for a 3D_RENDER scene using story context
app.post('/api/projects/:pid/chapters/:cid/scenes/:idx/regenerate-prompt', async (req, res) => {
    try {
        const { pid, cid, idx } = req.params;
        const project = getProject(pid);
        if (!project) return res.status(404).json({ error: 'Project not found' });

        const chapter = project.chapters.find(c => c.id === cid);
        if (!chapter) return res.status(404).json({ error: 'Chapter not found' });

        const sceneIndex = parseInt(idx);
        const scene = chapter.scenes[sceneIndex];
        if (!scene) return res.status(404).json({ error: 'Scene not found' });
        if (scene.type !== '3D_RENDER') return res.status(400).json({ error: 'Scene is not a 3D_RENDER type' });

        console.log(`   🎨 Regenerating image prompt for Scene ${sceneIndex}...`);

        const { regenerateImagePrompt } = await import('./autoScene.js');
        const newPrompt = await regenerateImagePrompt(scene.script, chapter.scriptText || scene.script);

        const result = await updateScene(pid, cid, sceneIndex, { prompt: newPrompt });
        res.json({ success: true, prompt: newPrompt, ...result });
    } catch (err) {
        console.error('❌ Regenerate prompt error:', err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

// POST /api/projects/:pid/chapters/:cid/scenes/:idx/retry — targeted scene repair
app.post('/api/projects/:pid/chapters/:cid/scenes/:idx/retry', async (req, res) => {
    try {
        const { pid, cid, idx } = req.params;
        const project = getProject(pid);
        if (!project) return res.status(404).json({ error: 'Project not found' });
        
        const chapter = project.chapters.find(c => c.id === cid);
        if (!chapter) return res.status(404).json({ error: 'Chapter not found' });
        
        const sceneIndex = parseInt(idx);
        const scene = chapter.scenes[sceneIndex];
        if (!scene) return res.status(404).json({ error: 'Scene not found' });

        console.log(`   🛠️  Retrying Scene ${sceneIndex} for Project ${pid}...`);

        const { fillSceneFields, loadSchema } = await import('./autoScene.js');
        const { fillTemplate } = await import('./templateFiller.js');
        const { fuzzyMapFields } = await import('./templateSystem.js');

        // Pass 2: Field Filling
        const content = await fillSceneFields(scene, scene.template);
        const schema = loadSchema(scene.template);
        const processedContent = schema?.fields ? fuzzyMapFields(content, schema.fields) : content;
        
        // Final TSX generation
        const code = fillTemplate(scene.template, scene.theme || 'DARK', processedContent);
        
        const result = await updateScene(pid, cid, sceneIndex, { code, content: processedContent, renderStatus: 'idle' });
        res.json({ success: true, ...result });
    } catch (err) {
        console.error('❌ Scene retry error:', err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});
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

        let response;
        let lastError;
        const maxAttempts = 3;
        
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                if (attempt > 1) {
                    console.log(`   🔄 Imagen retry ${attempt}/${maxAttempts} (waiting 3s)...`);
                    await new Promise(r => setTimeout(r, 3000));
                }

                response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body),
                    signal: AbortSignal.timeout(90_000), 
                });

                if (response.ok) break;

                const errText = await response.text();
                lastError = `Imagen API ${response.status}: ${errText.substring(0, 200)}`;
                console.error(`❌ Imagen Attempt ${attempt} failed:`, lastError);

                // If it's a 429 (Too Many Requests), definitely retry
                if (response.status !== 429 && response.status !== 503 && response.status !== 504) {
                    break; // Don't retry on 400/401/403/404
                }
            } catch (fetchErr) {
                lastError = fetchErr.message;
                console.error(`❌ Imagen Attempt ${attempt} fetch error:`, lastError);
                if (attempt === maxAttempts) {
                    return res.status(504).json({ success: false, error: `API Gateway Timeout or Network Error after ${maxAttempts} attempts: ${lastError}` });
                }
            }
        }

        if (!response || !response.ok) {
            return res.status(response?.status || 500).json({ success: false, error: lastError });
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
        const { imageUrl, motion, duration, projectId, chapterId, sceneIndex } = req.body;
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
            projectId, chapterId, sceneIndex,
            sceneData: { type: '3D_RENDER' }
        });

        console.log(`   🎬 Image-to-video render started: ${job.id}`);
        res.json({ success: true, jobId: job.id, videoId });
    } catch (err) {
        console.error('❌ render-image-video error:', err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

// ── SCENE STUDIO ─────────────────────────────────────────────────────────────
const SCHEMAS_DIR_SS = join(__dirname, 'schemas');
const THEMES_FILE_SS = join(__dirname, 'themes/themes.json');

app.get('/api/templates/library', async (req, res) => {
    try {
        const files = await fs.readdir(SCHEMAS_DIR_SS);
        const templates = [];
        for (const file of files.filter(f => f.endsWith('.json'))) {
            try {
                const raw = await fs.readFile(join(SCHEMAS_DIR_SS, file), 'utf8');
                const schema = JSON.parse(raw);
                templates.push({
                    id: schema.template || file.replace('.json', ''),
                    name: schema.name || file.replace('.json', ''),
                    description: schema.description || '',
                    category: schema.category || 'general',
                    tags: schema.tags || [],
                    fields: Object.keys(schema.fields || {})
                });
            } catch (_) {}
        }
        templates.sort((a, b) => a.id.localeCompare(b.id));
        res.json({ success: true, templates });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.get('/api/themes', async (req, res) => {
    try {
        const raw = await fs.readFile(THEMES_FILE_SS, 'utf8');
        const themes = Object.keys(JSON.parse(raw));
        res.json({ success: true, themes });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Step 1: Gemini analyzes script + template → returns filled field values (no render)
app.post('/api/scene-studio/analyze', async (req, res) => {
    try {
        const { script, templateId } = req.body;
        if (!script || !templateId) return res.status(400).json({ success: false, error: 'script and templateId are required' });

        const { fillSceneFields, loadSchema } = await import('./autoScene.js');
        const { fuzzyMapFields } = await import('./templateSystem.js');

        const rawContent = await fillSceneFields({ script }, templateId);
        const schema = loadSchema(templateId);
        const content = schema?.fields ? fuzzyMapFields(rawContent, schema.fields) : rawContent;

        console.log(`   🤖 Scene Studio analyze: ${templateId} → ${Object.keys(content).length} fields`);
        res.json({ success: true, content });
    } catch (err) {
        console.error('❌ scene-studio/analyze error:', err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

// Step 2: Render using user-confirmed field values
app.post('/api/scene-studio/generate', async (req, res) => {
    try {
        const { templateId, theme, content } = req.body;
        if (!templateId || !content) return res.status(400).json({ success: false, error: 'templateId and content are required' });

        const { fillTemplate } = await import('./templateFiller.js');

        const code = fillTemplate(templateId, theme || 'THREAT', content);
        const { job, videoId } = startVideoRenderJob(code, { duration: 10, fps: 30 });

        console.log(`   🎬 Scene Studio render started: ${job.id} (template: ${templateId})`);
        res.json({ success: true, jobId: job.id, videoId });
    } catch (err) {
        console.error('❌ scene-studio/generate error:', err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

// ── RENDER JOBS ───────────────────────────────────────────────────────────────
app.post('/api/manual-render-job', async (req, res) => {
    try {
        const { code, duration, fps, width, height, sceneData, projectId, chapterId, sceneIndex } = req.body;
        if (!code) return res.status(400).json({ error: 'TSX code is required' });

        // Use the standardized background job helper
        const { job, videoId } = startVideoRenderJob(code, {
            duration, fps, width, height, 
            sceneData, projectId, chapterId, sceneIndex
        });

        console.log(`   🎬 Manual render job started: ${job.id}`);
        res.json({ success: true, jobId: job.id, videoId });
    } catch (err) {
        console.error('❌ manual-render-job error:', err.message);
        res.status(500).json({ success: false, error: 'Failed to create render job: ' + err.message });
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
app.post('/api/voiceover/process', (req, res, next) => voiceoverUpload.single('audio')(req, res, (err) => err ? handleMulterError(err, req, res, next) : next()), async (req, res) => {
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

app.post('/api/voiceover/batch', (req, res, next) => voiceoverUpload.array('audio', 20)(req, res, (err) => err ? handleMulterError(err, req, res, next) : next()), async (req, res) => {
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

        const outputUrl = `/audio/processed/${basename(outputPath)}`;
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

// ── ASSEMBLY ──────────────────────────────────────────────────────────────────
// POST /api/projects/:pid/chapters/:cid/assemble
// Body: { videoPaths: ["/videos/…", …], audioPath: "/audio/processed/…", audioVolume: 0.9 }
// Concatenates scene videos and muxes the voiceover into a single chapter .mp4
app.post('/api/projects/:pid/chapters/:cid/assemble', async (req, res) => {
    try {
        const { pid, cid } = req.params;
        const { videoPaths, audioPath, audioVolume } = req.body;

        const project = getProject(pid);
        if (!project) return res.status(404).json({ error: 'Project not found' });
        const chapter = project.chapters.find(c => c.id === cid);
        if (!chapter) return res.status(404).json({ error: 'Chapter not found' });
        if (!videoPaths?.length) return res.status(400).json({ error: 'videoPaths is required' });

        // Resolve public-URL paths to absolute filesystem paths
        const absVideos = videoPaths.map(u => join(publicDir, u.replace(/^\//, '')));
        const absAudio  = audioPath ? join(publicDir, audioPath.replace(/^\//, '')) : null;

        for (const p of absVideos) {
            try { await fs.access(p); }
            catch { return res.status(400).json({ error: `Video file not found: ${p}` }); }
        }
        if (absAudio) {
            try { await fs.access(absAudio); }
            catch { return res.status(400).json({ error: `Audio file not found: ${absAudio}` }); }
        }

        const outputFilename = `assembled_${pid}_${cid}_${Date.now()}.mp4`;
        const outputPath     = join(videosDir, outputFilename);

        console.log(`   🎬 Assembling chapter "${chapter.title}" — ${absVideos.length} scenes`);
        await assembleChapterVideo(absVideos, absAudio, outputPath, { audioVolume });

        const outputUrl = `/videos/${outputFilename}`;
        updateChapter(pid, cid, { assembledVideoUrl: outputUrl, status: 'assembled' });

        res.json({ success: true, outputUrl });
    } catch (err) {
        console.error('❌ Chapter assembly error:', err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

// POST /api/projects/:pid/assemble
// Assembles all chapters in order into one full-project .mp4
app.post('/api/projects/:pid/assemble', async (req, res) => {
    try {
        const { pid } = req.params;
        const { audioVolume } = req.body;

        const project = getProject(pid);
        if (!project) return res.status(404).json({ error: 'Project not found' });

        // Collect assembled chapter videos in order
        const chapterVideos = (project.chapters || [])
            .filter(c => c.assembledVideoUrl)
            .map(c => join(publicDir, c.assembledVideoUrl.replace(/^\//, '')));

        if (!chapterVideos.length) {
            return res.status(400).json({ error: 'No assembled chapter videos found. Assemble chapters first.' });
        }

        const outputFilename = `project_${pid}_${Date.now()}.mp4`;
        const outputPath     = join(videosDir, outputFilename);

        console.log(`   🎬 Assembling project "${project.name}" — ${chapterVideos.length} chapters`);
        await assembleChapterVideo(chapterVideos, null, outputPath, { audioVolume });

        const outputUrl = `/videos/${outputFilename}`;
        updateProject(pid, { assembledVideoUrl: outputUrl, status: 'assembled' });

        res.json({ success: true, outputUrl });
    } catch (err) {
        console.error('❌ Project assembly error:', err.message);
        res.status(500).json({ success: false, error: err.message });
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

const server = app.listen(PORT, () => {
    console.log(`\n🎬 ARXXIS Director Studio`);
    console.log(`   Server: http://localhost:${PORT}`);
    console.log(`   Frontend (dev): http://localhost:5174`);
    console.log(`   Render slots: ${MAX_CONCURRENT_RENDERS} max concurrent\n`);

    warmupBundler().catch(err => console.warn('⚠️ Warmup error (non-critical):', err.message));

    const tempRoot = new URL('../.temp', import.meta.url).pathname;
    setInterval(() => {
        purgeOldTempDirs(tempRoot).catch(() => {});
    }, 15 * 60 * 1000); // every 15 min instead of 30
});

// ── Graceful shutdown ─────────────────────────────────────────────────────────
function shutdown(signal) {
    console.log(`\n⚙️  ${signal} received — shutting down gracefully`);
    server.close(() => {
        console.log('✅ HTTP server closed');
        process.exit(0);
    });
    // Force exit after 10s if connections are stuck
    setTimeout(() => {
        console.error('⚠️  Forced exit after 10s timeout');
        process.exit(1);
    }, 10_000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));
