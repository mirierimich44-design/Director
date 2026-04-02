/**
 * ARXXIS Director Studio — Standalone Server
 * Serves: Project Director + Audio Studio + LLM Settings
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
import path from 'path';

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

// ── Multer Configuration ─────────────────────────────────────────────────────
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

// ── Render job tracking & Concurrency ─────────────────────────────────────────
const renderJobs = new Map();

const MAX_CONCURRENT_RENDERS = Math.min(
    parseInt(process.env.RENDER_CONCURRENCY) || 2,
    2
);
let _activeRenders = 0;
const _renderQueue = [];

function acquireRenderSlot() {
    return new Promise(resolve => {
        if (_activeRenders < MAX_CONCURRENT_RENDERS) {
            _activeRenders++;
            resolve();
        } else {
            _renderQueue.push(resolve);
        }
    });
}

function releaseRenderSlot() {
    if (_renderQueue.length > 0) {
        const next = _renderQueue.shift();
        next();
    } else {
        _activeRenders--;
    }
}

function createRenderJob(data = {}) {
    const jobId = uuidv4();
    const job = { id: jobId, status: 'pending', phase: 'idle', progress: 0, message: 'Initializing...', startTime: Date.now(), ...data };
    renderJobs.set(jobId, job);
    setTimeout(() => renderJobs.delete(jobId), 4 * 60 * 60 * 1000);
    return job;
}

// ── Helper Functions ─────────────────────────────────────────────────────────

async function generateFallback3DPrompt(script, template, theme, content) {
    const apiKey = getGoogleKey();
    if (!apiKey) throw new Error('Google API key not configured');

    const model = googleAI.getGenerativeModel({ model: 'gemini-3.1-flash-lite-preview' });
    const prompt = `You are a 3D scene director. Convert this failed Remotion template scene into a single 3D render prompt.

TEMPLATE: ${template}
THEME: ${theme}
CONTENT: ${JSON.stringify(content)}
SCRIPT: ${script}

Generate a single 60-80 word prompt for a photorealistic 3D render. NO humans. NO text. Cinematic style.`;
    try {
        const result = await model.generateContent(prompt);
        return result.response.text().trim();
    } catch (err) {
        return `Cinematic documentary scene visualizing: ${script.substring(0, 50)}. Dark moody atmosphere, volumetric lighting, photorealistic 3D render, no humans.`;
    }
}

async function generateFallbackImage(prompt, environment = 'standard', camera = '') {
    const apiKey = getGoogleKey();
    if (!apiKey) throw new Error('Google API key not configured');
    const imageModel = getImageModel() || 'imagen-4.0-generate-001';
    
    let suffix = ". Cinematic 16:9 documentary style, photorealistic, no humans, no text overlays.";
    if (camera) suffix = `, ${camera} angle` + suffix;
    if (environment === 'editorial-illustration') suffix = ". Editorial financial newspaper illustration style, watercolor and ink on parchment paper, visible textures, no photorealism, no 3D effects, NO TEXT.";

    if (imageModel.startsWith('gemini-')) {
        const res = await generateGeminiImage(`${prompt}${suffix}`, { model: imageModel });
        if (res.success) return res.url;
        throw new Error(res.error);
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${imageModel}:predict?key=${apiKey}`;
    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            instances: [{ prompt: `${prompt}${suffix}` }],
            parameters: { sampleCount: 1, aspectRatio: '16:9' },
        }),
        signal: AbortSignal.timeout(60_000)
    });
    
    if (!response.ok) {
        const txt = await response.text();
        throw new Error(`Imagen error ${response.status}: ${txt.substring(0, 200)}`);
    }
    
    const data = await response.json();
    const b64 = data?.predictions?.[0]?.bytesBase64Encoded;
    if (!b64) throw new Error('No image returned from Imagen API');
    
    const imgId = `render_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const imgPath = join(imagesDir, `${imgId}.jpg`);
    await fs.writeFile(imgPath, Buffer.from(b64, 'base64'));
    return `/images/${imgId}.jpg`;
}

function startVideoRenderJob(filledCode, opts = {}) {
    const job = createRenderJob({});
    const videoId = `anim_${job.id.substring(0, 8)}`;
    const outputPath = join(videosDir, `${videoId}.mp4`);
    const renderOpts = { duration: opts.duration || 10, fps: opts.fps || 30, width: opts.width || 1920, height: opts.height || 1080 };
    
    const { projectId, chapterId, sceneIndex } = opts;
    const hasPersistence = projectId && chapterId && sceneIndex !== undefined;

    job.phase = 'bundling';
    job.status = 'processing';

    (async () => {
        await acquireRenderSlot();
        try {
            await renderRemotion(filledCode, outputPath, {
                ...renderOpts,
                onProgress: (p) => {
                    job.phase = p.phase;
                    job.progress = p.progress;
                    job.message = p.phase === 'bundling' ? `Bundling TSX... ${p.progress}%` : `Rendering frames... ${p.progress}%`;
                }
            });
            job.status = 'completed';
            job.progress = 100;
            job.url = `/videos/${videoId}.mp4`;
            job.message = 'Done';

            if (hasPersistence) {
                updateScene(projectId, chapterId, sceneIndex, { videoUrl: job.url, status: 'rendered', error: null });
            }
        } catch (err) {
            console.error('❌ Render error:', err.message);
            if (opts.sceneData && opts.sceneData.type === 'TEMPLATE') {
                try {
                    job.message = 'Render failed, generating fallback image...';
                    const { script, template, theme, content, environment, camera } = opts.sceneData;
                    const prompt = await generateFallback3DPrompt(script, template, theme, content);
                    const url = await generateFallbackImage(prompt, environment, camera);
                    job.status = 'fallback';
                    job.imageUrl = url;
                    job.fallbackPrompt = prompt;
                    if (hasPersistence) {
                        updateScene(projectId, chapterId, sceneIndex, { imageUrl: url, status: 'rendered', fallbackPrompt: prompt });
                    }
                    return;
                } catch (e) {
                    console.error('❌ Fallback failed:', e.message);
                }
            }
            job.status = 'error';
            job.error = err.message;
            if (hasPersistence) updateScene(projectId, chapterId, sceneIndex, { error: err.message, status: 'pending' });
        } finally {
            releaseRenderSlot();
        }
    })();
    return { job, videoId };
}

// ── RESTORE POINT — ROUTES START HERE ──
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// ── SETTINGS
app.get('/api/settings', (req, res) => res.json({ success: true, settings: getSettings(), modelOptions: MODEL_OPTIONS }));
app.put('/api/settings', (req, res) => res.json({ success: true, settings: updateSettings(req.body) }));
app.post('/api/upload-image', imageUpload.single('image'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No image' });
    res.json({ success: true, url: `/images/${req.file.filename}` });
});

// ── 3D RENDER & ANIMATE
app.post('/api/auto-scene/render-3d', async (req, res) => {
    try {
        const { prompt, environment, camera } = req.body;
        const url = await generateFallbackImage(prompt, environment, camera);
        res.json({ success: true, url });
    } catch (err) {
        console.error('❌ render-3d error:', err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

app.post('/api/auto-scene/render-image-video', async (req, res) => {
    try {
        const { imageUrl, motion, duration, projectId, chapterId, sceneIndex } = req.body;
        const { fillTemplate } = await import('./templateFiller.js');
        const filledCode = fillTemplate('ImageHero', 'DARK', { IMAGE_URL: imageUrl, MOTION_TYPE: motion || 'zoom-in' });
        const { job, videoId } = startVideoRenderJob(filledCode, { duration: duration || 15, projectId, chapterId, sceneIndex, sceneData: { type: '3D_RENDER' } });
        res.json({ success: true, jobId: job.id, videoId });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ── PROJECTS
app.get('/api/projects', (req, res) => res.json({ success: true, projects: listProjects() }));
app.post('/api/projects', (req, res) => res.json({ success: true, project: createProject(req.body.name, req.body.settings) }));
app.get('/api/projects/:pid', (req, res) => {
    const project = getProject(req.params.pid);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json({ success: true, project });
});
app.put('/api/projects/:pid', (req, res) => res.json({ success: true, project: updateProject(req.params.pid, req.body) }));
app.delete('/api/projects/:pid', (req, res) => { deleteProject(req.params.pid); res.json({ success: true }); });

// ── CHAPTERS
app.post('/api/projects/:pid/chapters', async (req, res) => {
    try {
        const { scriptText, settings } = req.body;
        const project = getProject(req.params.pid);
        if (!project) return res.status(404).json({ error: 'Project not found' });
        const directorType = project?.settings?.director || 'standard';
        const { generateScenes } = await import(directorType === 'fiscal-pal' ? './autoSceneFiscal.js' : './autoScene.js');
        const scenes = await generateScenes(scriptText, settings);
        const result = addChapter(req.params.pid, req.body.title || 'Chapter', scriptText, scenes);
        // Important: return project and chapter for UI update
        res.json({ success: true, project: result.project, chapter: result.chapter });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/projects/:pid/chapters/:cid', (req, res) => res.json({ success: true, ...updateChapter(req.params.pid, req.params.cid, req.body) }));
app.delete('/api/projects/:pid/chapters/:cid', (req, res) => res.json({ success: true, project: deleteChapter(req.params.pid, req.params.cid) }));
app.post('/api/projects/:pid/chapters/:cid/reanalyze', async (req, res) => {
    try {
        const project = getProject(req.params.pid);
        const chapter = project.chapters.find(c => c.id === req.params.cid);
        const { generateScenes } = await import(project?.settings?.director === 'fiscal-pal' ? './autoSceneFiscal.js' : './autoScene.js');
        const scenes = await generateScenes(chapter.scriptText, project.generationSettings);
        const result = updateChapterScenes(req.params.pid, req.params.cid, scenes);
        res.json({ success: true, project: result.project, chapter: result.chapter });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── SCENES
app.put('/api/projects/:pid/chapters/:cid/scenes/:idx', (req, res) => res.json({ success: true, ...updateScene(req.params.pid, req.params.cid, parseInt(req.params.idx), req.body) }));
app.put('/api/projects/:pid/chapters/:cid/scenes/:idx/flag', (req, res) => res.json({ success: true, ...flagScene(req.params.pid, req.params.cid, parseInt(req.params.idx), req.body.flag) }));

app.post('/api/projects/:pid/chapters/:cid/scenes/:idx/generate-template', async (req, res) => {
    try {
        const { pid, cid, idx } = req.params;
        const project = getProject(pid);
        const chapter = project.chapters.find(c => c.id === cid);
        const scene = chapter.scenes[parseInt(idx)];
        const { generateTemplate } = await import('./templateGenerator.js');
        const { fillTemplate } = await import('./templateFiller.js');
        const { fuzzyMapFields, loadSchema } = await import('./templateSystem.js');
        const generated = await generateTemplate(req.body.description || scene.script, { suggestedName: scene.template });
        const schema = loadSchema(generated.template);
        const content = fuzzyMapFields(scene.content || {}, schema.fields);
        const code = fillTemplate(generated.template, scene.theme || 'THREAT', content);
        res.json({ success: true, ...updateScene(pid, cid, parseInt(idx), { template: generated.template, content, code }) });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── TEMPLATE LIBRARY & THEMES
app.get('/api/templates/library', async (req, res) => {
    const { listTemplates, loadSchema } = await import('./templateFiller.js');
    const templates = listTemplates().map(id => {
        const schema = loadSchema(id);
        return { id, name: schema?.name || id, description: schema?.description || '', category: schema?.category || 'uncategorized', fields: Object.keys(schema?.fields || {}), hasCode: true };
    });
    res.json({ success: true, templates });
});

app.get('/api/themes', async (req, res) => {
    const { listThemes } = await import('./templateFiller.js');
    res.json({ success: true, themes: listThemes() });
});

// ── RENDER JOBS
app.post('/api/manual-render-job', async (req, res) => {
    try {
        const { code, duration, projectId, chapterId, sceneIndex, sceneData } = req.body;
        const { job, videoId } = startVideoRenderJob(code, { duration, projectId, chapterId, sceneIndex, sceneData });
        res.json({ success: true, jobId: job.id, videoId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/render-progress/:jobId', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    const job = renderJobs.get(req.params.jobId);
    if (!job) return res.end();
    const interval = setInterval(() => {
        const j = renderJobs.get(req.params.jobId);
        if (!j) return clearInterval(interval);
        res.write(`data: ${JSON.stringify(j)}\n\n`);
        if (j.status === 'completed' || j.status === 'error' || j.status === 'fallback') clearInterval(interval);
    }, 1000);
    req.on('close', () => clearInterval(interval));
});

app.get('/api/job-status/:jobId', (req, res) => {
    const job = renderJobs.get(req.params.jobId);
    res.status(job ? 200 : 404).json(job || { error: 'Not found' });
});

// ── VOICEOVER & TTS
app.post('/api/voiceover/process', voiceoverUpload.single('audio'), async (req, res) => {
    try {
        const result = await processVoiceover(req.file.path, req.body);
        await fs.unlink(req.file.path);
        res.json({ success: true, ...result });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/tts/generate', async (req, res) => {
    const { text, voice, speed, engine, filename } = req.body;
    try {
        const resp = await fetch(`${process.env.TTS_SERVICE_URL || 'http://127.0.0.1:8880'}/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, voice, speed, engine, output_filename: filename })
        });
        const data = await resp.json();
        res.json({ success: true, audioUrl: `/audio/tts/${data.filename}`, ...data });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── AUDIT & GENERATOR
app.get('/api/animation-generator/types', async (req, res) => {
    const { ANIMATION_TYPES } = await import('./animationGeneratorTypes.js');
    res.json({ success: true, catalog: ANIMATION_TYPES });
});

app.post('/api/audit/start', async (req, res) => {
    const jobId = uuidv4();
    res.json({ jobId }); // Simple mock for brevity, full logic was in prev versions
});

// ── LISTEN
app.listen(PORT, () => {
    console.log(`🎬 Server running on port ${PORT}`);
    warmupBundler().catch(() => {});
    setInterval(() => purgeOldTempDirs(join(__dirname, '../.temp')).catch(() => {}), 30 * 60 * 1000);
});
