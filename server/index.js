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

import { getSettings, updateSettings, MODEL_OPTIONS, getGoogleKey, getImageModel } from './settings.js';
import { processVoiceover, processBatch, concatenateAudio, changeSpeed } from './services/audioProcessor.js';
import { renderVideo as renderRemotion } from './engines/remotion/renderer.js';
import { auditTemplate, applyFix, TEMPLATES_DIR, AUDIT_DIR, REPORT_PATH } from './templateAuditor.js';
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
const publicDir       = join(__dirname, '../public');
const videosDir       = join(publicDir, 'videos');
const audioDir        = join(publicDir, 'audio');
const audioProcessedDir = join(publicDir, 'audio/processed');
const imagesDir       = join(publicDir, 'images');

await fs.mkdir(videosDir,        { recursive: true });
await fs.mkdir(audioDir,         { recursive: true });
await fs.mkdir(audioProcessedDir, { recursive: true });
await fs.mkdir(imagesDir,        { recursive: true });
await fs.mkdir(join(__dirname, 'projects'), { recursive: true });

// ── Static serving ────────────────────────────────────────────────────────────
app.use('/videos', express.static(videosDir));
app.use('/audio',  express.static(audioDir));
app.use('/images', express.static(imagesDir));
app.use(express.static(join(__dirname, '../dist')));

// ── Multer — voiceover uploads ────────────────────────────────────────────────
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

function createRenderJob(data = {}) {
    const jobId = uuidv4();
    const job = { id: jobId, status: 'pending', phase: 'idle', progress: 0, message: 'Initializing...', startTime: Date.now(), ...data };
    renderJobs.set(jobId, job);
    setTimeout(() => renderJobs.delete(jobId), 4 * 60 * 60 * 1000);
    return job;
}

// ── SETTINGS ─────────────────────────────────────────────────────────────────
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
        const { name, description } = req.body;
        if (!name) return res.status(400).json({ error: 'name is required' });
        const project = createProject(name, description);
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

// ── CHAPTERS ──────────────────────────────────────────────────────────────────
app.post('/api/projects/:id/chapters', async (req, res) => {
    try {
        const { title, scriptText, scenes } = req.body;
        if (!scriptText) return res.status(400).json({ error: 'scriptText is required' });

        let processedScenes = scenes;
        if (!processedScenes) {
            const { generateScenes } = await import('./autoScene.js');
            processedScenes = await generateScenes(scriptText);
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
        if (!apiKey) return res.status(503).json({ error: 'Google API key not configured' });

        const imageModel = getImageModel() || 'imagen-3.0-generate-001';

        // Call Imagen via Google AI REST API
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${imageModel}:predict?key=${apiKey}`;
        const body = {
            instances: [{ prompt: `${prompt}. Cinematic 16:9 documentary style, photorealistic, no humans, no text overlays.` }],
            parameters: { sampleCount: 1, aspectRatio: '16:9' },
        };

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error('❌ Imagen API error:', errText.substring(0, 300));
            throw new Error(`Imagen API ${response.status}: ${errText.substring(0, 200)}`);
        }

        const data = await response.json();
        const b64 = data?.predictions?.[0]?.bytesBase64Encoded;
        if (!b64) throw new Error('No image returned from Imagen API');

        // Save to public/images/
        const imgId = `render_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        const imgPath = join(imagesDir, `${imgId}.jpg`);
        await fs.writeFile(imgPath, Buffer.from(b64, 'base64'));

        console.log(`   🖼️ 3D Render saved: ${imgId}.jpg`);
        res.json({ success: true, url: `/images/${imgId}.jpg` });
    } catch (err) {
        console.error('❌ render-3d error:', err.message);
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
        const { generateScenes } = await import('./autoScene.js');
        const processedScenes = await generateScenes(chapter.scriptText);
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
        const { code, duration, fps, width, height } = req.body;
        if (!code) return res.status(400).json({ error: 'TSX code is required' });

        const job = createRenderJob({ code, duration, fps, width, height });
        res.json({ success: true, jobId: job.id });

        const videoId = `Director_${job.id.substring(0, 8)}`;
        const outputPath = join(videosDir, `${videoId}.mp4`);
        const renderOptions = { duration: duration || 10, fps: fps || 30, width: width || 1920, height: height || 1080 };

        job.phase = 'bundling';
        job.status = 'processing';
        job.message = 'Preparing render...';

        try {
            await renderRemotion(code, outputPath, {
                ...renderOptions,
                onProgress: (p) => {
                    job.phase = p.phase;
                    job.progress = p.progress;
                    job.message = p.phase === 'bundling' ? 'Bundling...' : `Rendering frames... ${p.progress}%`;
                }
            });
            job.status = 'completed';
            job.progress = 100;
            job.url = `/videos/${videoId}.mp4`;
            job.message = 'Done';
            console.log(`✅ Render ${job.id} complete`);
        } catch (err) {
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

// ── HEALTH ────────────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', app: 'director-studio', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log(`\n🎬 ARXXIS Director Studio`);
    console.log(`   Server: http://localhost:${PORT}`);
    console.log(`   Frontend (dev): http://localhost:5174\n`);
});
