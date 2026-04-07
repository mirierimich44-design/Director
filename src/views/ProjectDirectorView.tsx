import React, { useState, useEffect, useRef } from 'react';
import {
    Box, Typography, TextField, Button, Card, CardContent, Chip, LinearProgress, CircularProgress,
    IconButton, Tooltip, Alert, Divider,
    List, ListItem, ListItemText, ListItemButton, Paper, Grid, Slider, FormControl,
    Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
    MenuItem, Select, InputLabel, Collapse
} from '@mui/material';
import {
    PlayArrow as RenderIcon,
    Download as DownloadIcon,
    FolderOpen as LoadIcon,
    Add as AddIcon,
    Lock as LockIcon,
    Delete as DeleteIcon,
    Autorenew as RegenerateIcon,
    Settings as SettingsIcon,
    Palette as PaletteIcon,
    Edit as EditIcon,
    ImageSearch as ReanalyzePromptIcon,
} from '@mui/icons-material';

interface Scene {
    index: number;
    globalIndex: number;
    type: 'TEMPLATE' | '3D_RENDER' | 'ILLUSTRATION';
    script: string;
    template?: string;
    theme?: string;
    reasoning?: string;
    content?: Record<string, string>;
    code?: string;
    duration?: number;
    prompt?: string;
    environment?: string;
    camera?: string;
    lower_third?: { text: string; attribution: string };
    status: 'pending' | 'rendered' | 'locked';
    flag: 'needs-fix' | 'needs-review' | 'approved' | null;
    videoUrl?: string;
    imageUrl?: string;
    error?: string;
    fallbackPrompt?: string;
    renderStatus?: 'idle' | 'rendering' | 'completed' | 'error';
}

interface Chapter {
    id: string;
    title: string;
    status: string;
    sceneOffset: number;
    scenes: Scene[];
}

interface GenerationSettings {
    templateRatio: number;
    colorScheme: string;
    customColors: { primary: string; background: string; accent: string };
    templateVariety: string;
    maxTemplateReuse: number;
    customPrompt: string;
    wordsPerScene: number;
}

interface Project {
    id: string;
    name: string;
    description: string;
    status: string;
    chapters: Chapter[];
    totalScenes: number;
    settings?: {
        director: string;
        format?: string;
        defaultTheme?: string;
    };
    generationSettings?: GenerationSettings;
}

interface SceneProgress {
    phase: string;
    progress: number;
    message: string;
    logs?: string[];
}

interface BatchState {
    active: boolean;
    current: number;
    total: number;
    sceneLabel: string;
    phase: string;
    progress: number;
    message: string;
}

const PHASE_LABELS: Record<string, string> = {
    design: 'AI DESIGNING',
    bundling: 'BUNDLING',
    rendering: 'RENDERING',
    code_ready: 'CODE READY',
    cooldown: 'COOLING DOWN',
    processing: 'PROCESSING',
    generating: 'GENERATING',
};

const CLITerminal: React.FC<{ progress: number; phase: string; message?: string }> = ({ progress, phase }) => {
    return (
        <Box sx={{ 
            bgcolor: 'rgba(0,0,0,0.4)', 
            p: 1.5, 
            borderRadius: '6px', 
            border: '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            mb: 2,
            overflow: 'hidden'
        }}>
            <Typography sx={{ 
                color: 'var(--accent-gold)', 
                fontFamily: 'monospace', 
                fontSize: '0.75rem', 
                fontWeight: 900,
                minWidth: 100,
                letterSpacing: 1
            }}>
                {(phase || 'IDLE').toUpperCase()}
            </Typography>
            
            <Box sx={{ flex: 1, height: 6, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 3, position: 'relative', overflow: 'hidden' }}>
                <Box sx={{ 
                    position: 'absolute', top: 0, left: 0, height: '100%', 
                    bgcolor: 'var(--accent-gold)', 
                    width: `${Math.min(100, Math.max(0, progress))}%`,
                    boxShadow: '0 0 10px var(--accent-gold)',
                    transition: 'width 0.1s linear'
                }} />
            </Box>

            <Typography sx={{ 
                color: '#fff', 
                fontFamily: 'monospace', 
                fontSize: '0.75rem', 
                fontWeight: 900,
                minWidth: 45,
                textAlign: 'right'
            }}>
                {Math.round(progress)}%
            </Typography>
        </Box>
    );
};

const ProjectDirectorView: React.FC = () => {
    const [projects, setProjects] = useState<any[]>([]);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [activeChapterId, setActiveChapterId] = useState<string | null>(null);
    const [newProjectName, setNewProjectName] = useState('');
    const [directorType, setDirectorType] = useState('standard');
    const [newChapterTitle, setNewChapterTitle] = useState('');
    const [newChapterScript, setNewChapterScript] = useState('');
    const [directorReferenceImage, setDirectorReferenceImage] = useState<string | null>(null);
    const [imageSuggestion, setImageSuggestion] = useState<{ description: string; canGenerate: boolean; reason: string } | null>(null);
    const [imageSuggesting, setImageSuggesting] = useState(false);
    const [imageGenerating, setImageGenerating] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [batchState, setBatchState] = useState<BatchState | null>(null);
    const [sceneProgress, setSceneProgress] = useState<Record<string, SceneProgress>>({});
    const renderAbortedRef = useRef<boolean>(false);

    const handleStopRendering = () => {
        renderAbortedRef.current = true;
        setBatchState(prev => prev ? { ...prev, message: 'Stopping after current scene...' } : null);
    };

    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogTitle, setDialogTitle] = useState('');
    const [dialogMessage, setDialogMessage] = useState('');
    const [dialogAction, setDialogAction] = useState<(() => void) | null>(null);
    const [dialogCancelText, setDialogCancelText] = useState('Cancel');
    const [dialogConfirmText, setDialogConfirmText] = useState('Confirm');

    // Generation settings panel
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [genSettings, setGenSettings] = useState({
        templateRatio: 60,
        colorScheme: 'auto',
        customColors: { primary: '#FF6600', background: '#0A0A0A', accent: '#FFAA00' },
        templateVariety: 'high',
        maxTemplateReuse: 1,
        customPrompt: '',
        wordsPerScene: 25,
    });

    const selectedProjectRef = useRef<Project | null>(null);
    useEffect(() => { selectedProjectRef.current = selectedProject; }, [selectedProject]);

    const confirmAction = (title: string, message: string, action: () => void, isAlert: boolean = false) => {
        setDialogTitle(title);
        setDialogMessage(message);
        setDialogAction(() => action);
        setDialogConfirmText(isAlert ? 'OK' : 'Confirm');
        setDialogCancelText(isAlert ? '' : 'Cancel');
        setDialogOpen(true);
    };

    const handleDialogConfirm = async () => {
        const action = dialogAction;
        setDialogOpen(false);
        if (action) {
            try {
                await (action as any)();
            } catch (err: any) {
                console.error('Action execution failed:', err);
                setError(`Action failed: ${err.message}`);
            }
        }
    };

    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = async () => {
        try {
            const res = await fetch('/api/projects');
            const data = await res.json();
            if (data.success) {
                setProjects(data.projects || []);
            }
        } catch (err) {
            console.error('Failed to load projects:', err);
        }
    };

    // Sync generation settings when project loads
    useEffect(() => {
        if (selectedProject?.generationSettings) {
            setGenSettings(prev => ({ ...prev, ...selectedProject.generationSettings }));
        } else {
            setGenSettings({
                templateRatio: 60, colorScheme: 'auto',
                customColors: { primary: '#FF6600', background: '#0A0A0A', accent: '#FFAA00' },
                templateVariety: 'high', maxTemplateReuse: 1, customPrompt: '', wordsPerScene: 25,
            });
        }
    }, [selectedProject?.id]);

    const handleSaveGenSettings = async (andReanalyze = false) => {
        if (!selectedProject) return;
        try {
            const res = await fetch(`/api/projects/${selectedProject.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ generationSettings: genSettings })
            });
            const data = await res.json();
            if (data.success) {
                setSelectedProject(data.project);
                setSettingsOpen(false);

                if (andReanalyze && data.project.chapters.length > 0) {
                    setLoading(true);
                    try {
                        for (const ch of data.project.chapters) {
                            if (ch.status === 'locked') continue;
                            const r = await fetch(`/api/projects/${data.project.id}/chapters/${ch.id}/reanalyze`, { method: 'POST' });
                            if (!r.ok) console.error(`Reanalyze failed for chapter ${ch.title}`);
                        }
                        await loadProjectDetails(data.project.id);
                    } finally {
                        setLoading(false);
                    }
                }
            }
        } catch (err: any) {
            setError(`Failed to save settings: ${err.message}`);
        }
    };

    const handleCreateProject = async () => {
        if (!newProjectName.trim()) return;
        setLoading(true);
        try {
            const res = await fetch('/api/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    name: newProjectName,
                    settings: { 
                        director: directorType,
                        defaultTheme: genSettings.colorScheme === 'auto' ? 'THREAT' : genSettings.colorScheme
                    }
                })
            });
            const data = await res.json();
            if (data.success && data.project) {
                setNewProjectName('');
                await loadProjects();
                await loadProjectDetails(data.project.id);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const loadProjectDetails = async (id: string) => {
        if (!id) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/projects/${id}`);
            const data = await res.json();
            if (data.success && data.project) {
                setSelectedProject(data.project);
                // Preserve the active chapter if it still exists in the project
                if (activeChapterId) {
                    const chapterExists = (data.project.chapters || []).some((c: any) => c.id === activeChapterId);
                    if (!chapterExists && data.project.chapters && data.project.chapters.length > 0) {
                        setActiveChapterId(data.project.chapters[0].id);
                    }
                } else if (data.project.chapters && data.project.chapters.length > 0) {
                    setActiveChapterId(data.project.chapters[0].id);
                }
            }
        } catch (err) {
            console.error('Failed to load project details:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDirectorImageUpload = async (file: File) => {
        const formData = new FormData();
        formData.append('image', file);
        try {
            const res = await fetch('/api/upload-image', { method: 'POST', body: formData });
            const data = await res.json();
            if (data.success) { setDirectorReferenceImage(data.url); setImageSuggestion(null); }
        } catch (err) {
            console.error('Reference image upload failed:', err);
        }
    };

    const handleSuggestImage = async () => {
        if (!newChapterScript.trim()) return;
        setImageSuggesting(true);
        setImageSuggestion(null);
        try {
            const res = await fetch('/api/auto-scene/suggest-reference-image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ scriptText: newChapterScript }),
            });
            const data = await res.json();
            if (data.success && data.description) setImageSuggestion(data);
        } catch (err) {
            console.error('Image suggestion failed:', err);
        } finally {
            setImageSuggesting(false);
        }
    };

    const handleGenerateSuggestedImage = async () => {
        if (!imageSuggestion) return;
        setImageGenerating(true);
        try {
            const res = await fetch('/api/auto-scene/render-3d', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: imageSuggestion.description }),
            });
            const data = await res.json();
            if (data.success) { setDirectorReferenceImage(data.url); setImageSuggestion(null); }
        } catch (err) {
            console.error('Image generation failed:', err);
        } finally {
            setImageGenerating(false);
        }
    };

    const handleAddChapter = async () => {
        if (!selectedProject || !newChapterScript.trim()) return;
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`/api/projects/${selectedProject.id}/chapters`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: newChapterTitle || `Chapter ${selectedProject.chapters.length + 1}`,
                    scriptText: newChapterScript,
                    ...(directorReferenceImage ? { referenceImageUrl: directorReferenceImage } : {}),
                })
            });
            const data = await res.json();
            if (data.success) {
                setNewChapterTitle('');
                setNewChapterScript('');
                setDirectorReferenceImage(null);
                setImageSuggestion(null);
                if (data.chapter && data.chapter.id) {
                    setActiveChapterId(data.chapter.id);
                }
                loadProjectDetails(selectedProject.id);
            } else {
                setError(data.error || 'Failed to add chapter');
            }
        } catch (err: any) {
            setError(err.message || 'Error adding chapter');
        } finally {
            setLoading(false);
        }
    };

    const handleFlagScene = async (chapterId: string, sceneIndex: number, flag: string | null) => {
        if (!selectedProject) return;
        try {
            const res = await fetch(`/api/projects/${selectedProject.id}/chapters/${chapterId}/scenes/${sceneIndex}/flag`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ flag })
            });
            if (res.ok) {
                loadProjectDetails(selectedProject.id);
            }
        } catch (err) {
            console.error('Failed to flag scene:', err);
        }
    };

    const setSceneRenderStatus = (chapterId: string, sceneIndex: number, status: Scene['renderStatus'], errMsg?: string) => {
        setSelectedProject(prev => {
            if (!prev) return prev;
            const updated = { ...prev, chapters: prev.chapters.map(c => {
                if (c.id !== chapterId) return c;
                const scenes = [...c.scenes];
                scenes[sceneIndex] = { ...scenes[sceneIndex], renderStatus: status, error: errMsg };
                return { ...c, scenes };
            })};
            return updated;
        });
    };

    const handleUpdateScene = async (chapterId: string, sceneIndex: number, updates: Partial<Scene>) => {
        if (!selectedProject) return;
        try {
            const res = await fetch(`/api/projects/${selectedProject.id}/chapters/${chapterId}/scenes/${sceneIndex}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });
            if (res.ok) {
                loadProjectDetails(selectedProject.id);
            }
        } catch (err) {
            console.error('Failed to update scene:', err);
        }
    };

    const renderScene = (
        chapterId: string,
        sceneIndex: number,
        onProgress?: (p: SceneProgress) => void
    ): Promise<void> => {
        const proj = selectedProjectRef.current;
        if (!proj) return Promise.resolve();

        const chapter = proj.chapters.find(c => c.id === chapterId);
        if (!chapter) return Promise.resolve();
        const scene = chapter.scenes[sceneIndex];

        const isTemplate = scene.type === 'TEMPLATE' && scene.code;
        const isImage = (scene.type === '3D_RENDER' || scene.type === 'ILLUSTRATION') && (scene as any).prompt;

        if (!isTemplate && !isImage) return Promise.resolve();

        const sceneKey = `${chapterId}-${sceneIndex}`;
        setSceneRenderStatus(chapterId, sceneIndex, 'rendering');

        return new Promise<void>(async (resolve) => {
            try {
                if (isImage) {
                    let fakeProgress = 0;
                    const progressInterval = setInterval(() => {
                        fakeProgress += (90 - fakeProgress) * 0.1;
                        const prog: SceneProgress = { 
                            phase: 'generating', 
                            progress: fakeProgress, 
                            message: `Generating ${scene.type.toLowerCase()}...` 
                        };
                        setSceneProgress(p => ({ ...p, [sceneKey]: prog }));
                        if (onProgress) onProgress(prog);
                    }, 800);

                    // 1. Generate the static image via Imagen
                    const res = await fetch('/api/auto-scene/render-3d', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            prompt: (scene as any).prompt,
                            environment: (scene as any).environment || 'infrastructure',
                            camera: (scene as any).camera || 'cinematic',
                        })
                    });
                    
                    clearInterval(progressInterval);
                    const data = await res.json();
                    if (!data.success) throw new Error(data.error || 'Image generation failed');

                    const imageUrl = data.url; 
                    
                    // Update scene with imageUrl and mark as rendered
                    await fetch(`/api/projects/${selectedProject.id}/chapters/${chapterId}/scenes/${sceneIndex}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ 
                            imageUrl: imageUrl,
                            status: 'rendered',
                            renderStatus: 'completed'
                        })
                    });
                    
                    setSceneProgress(p => { const n = { ...p }; delete n[sceneKey]; return n; });
                    setSceneRenderStatus(chapterId, sceneIndex, 'idle');
                    await loadProjectDetails(selectedProject.id);
                    resolve();
                } else if (isTemplate) {
                    let finalCode = scene.code;
                    // Auto-refresh code if a template is assigned to grab the latest local file edits
                    if (scene.template) {
                        try {
                            const genRes = await fetch(`/api/projects/${proj.id}/chapters/${chapterId}/scenes/${sceneIndex}/generate-template`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({})
                            });
                            const genData = await genRes.json();
                            if (genData.success && genData.scene && genData.scene.code) {
                                finalCode = genData.scene.code;
                            }
                        } catch (e) {
                            console.warn('Failed to auto-refresh template code, using cached version', e);
                        }
                    }

                    const res = await fetch('/api/manual-render-job', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            code: finalCode,
                            duration: scene.duration || 15,
                            fps: 30,
                            width: 1920,
                            height: 1080,
                            projectId: proj.id,
                            chapterId: chapterId,
                            sceneIndex: sceneIndex,
                            sceneData: {
                                type: scene.type,
                                script: scene.script,
                                template: scene.template,
                                theme: scene.theme,
                                content: scene.content,
                            }
                        })
                    });
                    const data = await res.json();
                    if (!data.success) throw new Error(data.error);

                    // 3. Use SSE for live progress
                    await new Promise<void>((resolveSSE) => {
                        const evtSrc = new EventSource(`/api/render-progress/${data.jobId}`);
                        let lastUpdate = Date.now();
                        
                        // Inactivity monitor: Skip if no signal for 90 seconds
                        const heartbeatCheck = setInterval(() => {
                            if (Date.now() - lastUpdate > 90_000) {
                                console.warn(`🚨 Render heartbeat lost for job ${data.jobId}. Skipping...`);
                                clearInterval(heartbeatCheck);
                                evtSrc.close();
                                resolveSSE();
                            }
                        }, 10_000);

                        evtSrc.onmessage = async (e) => {
                            lastUpdate = Date.now(); // Reset heartbeat on every message
                            const job = JSON.parse(e.data);
                            setSceneProgress(prev => {
                                const current = prev[sceneKey] || { phase: '', progress: 0, message: '', logs: [] };
                                const newLogs = [...(current.logs || [])];
                                if (job.message && job.message !== current.message) {
                                    newLogs.push(`[${new Date().toLocaleTimeString()}] ${job.message}`);
                                }
                                const prog: SceneProgress = {
                                    phase: job.phase || job.status || 'processing',
                                    progress: job.progress || 0,
                                    message: job.message || '',
                                    logs: newLogs.slice(-20) 
                                };
                                if (onProgress) onProgress(prog);
                                return { ...prev, [sceneKey]: prog };
                            });

                            if (job.status === 'completed') {
                                clearInterval(heartbeatCheck);
                                evtSrc.close();
                                await fetch(`/api/projects/${proj.id}/chapters/${chapterId}/scenes/${sceneIndex}`, {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ videoUrl: job.url, status: 'rendered' })
                                });
                                setSceneProgress(p => { const n = { ...p }; delete n[sceneKey]; return n; });
                                loadProjectDetails(proj.id);
                                resolveSSE();
                            } else if (job.status === 'error') {
                                clearInterval(heartbeatCheck);
                                evtSrc.close();
                                throw new Error(job.error || 'Render failed');
                            }
                        };

                        evtSrc.onerror = () => {
                            // Don't clear heartbeat here, let it attempt to reconnect or time out
                            evtSrc.close();
                            resolveSSE();
                        };
                    });
                    resolve();
                }
            } catch (err: any) {
                console.error('Render failed:', err);
                setSceneProgress(p => { const n = { ...p }; delete n[sceneKey]; return n; });
                setSceneRenderStatus(chapterId, sceneIndex, 'error', err.message);
                resolve();
            }
        });
    };

    // Helper: is a scene renderable and not yet done?
    const isPendingScene = (scene: Scene) =>
        ((scene.code && scene.type === 'TEMPLATE') || ((scene as any).prompt && (scene.type === '3D_RENDER' || scene.type === 'ILLUSTRATION')))
        && scene.status !== 'rendered'
        && scene.renderStatus !== 'rendering';

    const runBatchRender = async (queue: Array<{ chapterId: string; idx: number; scene: Scene; label: string }>) => {
        renderAbortedRef.current = false;
        let skipped = 0;
        for (let i = 0; i < queue.length; i++) {
            if (renderAbortedRef.current) break;
            const { chapterId, idx, scene, label } = queue[i];
            setBatchState({
                active: true,
                current: i + 1 - skipped,
                total: queue.length,
                sceneLabel: label,
                phase: 'starting',
                progress: 0,
                message: 'Starting...'
            });
            await renderScene(chapterId, idx, (prog) => {
                setBatchState(prev => prev ? { ...prev, phase: prog.phase, progress: prog.progress, message: prog.message } : prev);
            });
            // If the scene ended in error, count as skipped but keep going
            const proj = selectedProjectRef.current;
            const ch = proj?.chapters.find(c => c.id === chapterId);
            if (ch?.scenes[idx]?.renderStatus === 'error') skipped++;
        }
        setBatchState(null);
        renderAbortedRef.current = false;
    };

    const handleRenderAllScenes = async (chapterId: string) => {
        if (!selectedProject) return;
        const chapter = selectedProject.chapters.find(c => c.id === chapterId);
        if (!chapter) return;

        const queue = chapter.scenes
            .map((scene, idx) => ({ scene, idx, chapterId, label: `Scene ${scene.globalIndex}${scene.script ? ': ' + scene.script.slice(0, 50) + (scene.script.length > 50 ? '…' : '') : ''}` }))
            .filter(({ scene }) => isPendingScene(scene));

        if (queue.length === 0) {
            confirmAction('No Pending Scenes', 'No pending scenes to render in this chapter.', () => {}, true);
            return;
        }

        confirmAction(
            'Render Chapter Scenes',
            `Start rendering ${queue.length} pending scene${queue.length !== 1 ? 's' : ''} in "${chapter.title}"? Failed scenes will be skipped automatically.`,
            () => runBatchRender(queue)
        );
    };

    const handleRenderAllChapters = async () => {
        if (!selectedProject) return;

        const queue: Array<{ chapterId: string; idx: number; scene: Scene; label: string }> = [];
        for (const chapter of selectedProject.chapters) {
            if (chapter.status === 'locked') continue;
            chapter.scenes.forEach((scene, idx) => {
                if (isPendingScene(scene)) {
                    queue.push({
                        chapterId: chapter.id,
                        idx,
                        scene,
                        label: `[${chapter.title}] Scene ${scene.globalIndex}${scene.script ? ': ' + scene.script.slice(0, 45) + (scene.script.length > 45 ? '…' : '') : ''}`,
                    });
                }
            });
        }

        if (queue.length === 0) {
            confirmAction('Nothing to Render', 'All scenes are already rendered or locked.', () => {}, true);
            return;
        }

        confirmAction(
            'Render All Chapters',
            `Continuously render ${queue.length} pending scene${queue.length !== 1 ? 's' : ''} across all unlocked chapters? Failed scenes are skipped automatically.`,
            () => runBatchRender(queue)
        );
    };

    const handleLockChapter = async (chapterId: string) => {
        if (!selectedProject) return;
        try {
            await fetch(`/api/projects/${selectedProject.id}/chapters/${chapterId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'locked' })
            });
            loadProjectDetails(selectedProject.id);
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteProject = async (projectId: string) => {
        confirmAction(
            'Delete Project',
            'Are you sure you want to delete this entire project? This cannot be undone.',
            async () => {
                try {
                    await fetch(`/api/projects/${projectId}`, { method: 'DELETE' });
                    if (selectedProject?.id === projectId) setSelectedProject(null);
                    loadProjects();
                } catch (err) {
                    console.error('Failed to delete project', err);
                }
            }
        );
    };

    const handleDeleteChapter = async (chapterId: string) => {
        if (!selectedProject) return;
        confirmAction(
            'Delete Chapter',
            'Are you sure you want to delete this chapter?',
            async () => {
                try {
                    await fetch(`/api/projects/${selectedProject.id}/chapters/${chapterId}`, { method: 'DELETE' });
                    if (activeChapterId === chapterId) setActiveChapterId(null);
                    loadProjectDetails(selectedProject.id);
                } catch (err) {
                    console.error('Failed to delete chapter', err);
                }
            }
        );
    };

    const handleReanalyzeChapter = async (chapterId: string) => {
        if (!selectedProject) return;
        confirmAction(
            'Re-Analyze Chapter',
            'This will completely regenerate all scenes in this chapter using the original script. Existing edits will be lost. Continue?',
            async () => {
                setLoading(true);
                try {
                    const res = await fetch(`/api/projects/${selectedProject.id}/chapters/${chapterId}/reanalyze`, { method: 'POST' });
                    if (res.ok) {
                        loadProjectDetails(selectedProject.id);
                    }
                } catch (err) {
                    console.error('Failed to reanalyze chapter', err);
                } finally {
                    setLoading(false);
                }
            }
        );
    };

    const handleRegeneratePrompt = async (chapterId: string, sceneIndex: number) => {
        if (!selectedProject) return;
        setSceneRenderStatus(chapterId, sceneIndex, 'rendering');
        try {
            const res = await fetch(
                `/api/projects/${selectedProject.id}/chapters/${chapterId}/scenes/${sceneIndex}/regenerate-prompt`,
                { method: 'POST' }
            );
            const data = await res.json();
            if (!data.success) throw new Error(data.error);
            setSceneRenderStatus(chapterId, sceneIndex, 'idle');
            loadProjectDetails(selectedProject.id);
        } catch (err: any) {
            setSceneRenderStatus(chapterId, sceneIndex, 'error', err.message);
        }
    };

    const handleReanalyzeTemplate = async (chapterId: string, sceneIndex: number) => {
        if (!selectedProject) return;
        setSceneRenderStatus(chapterId, sceneIndex, 'rendering');
        try {
            const res = await fetch(
                `/api/projects/${selectedProject.id}/chapters/${chapterId}/scenes/${sceneIndex}/retry`,
                { method: 'POST' }
            );
            const data = await res.json();
            if (!data.success) throw new Error(data.error);
            await loadProjectDetails(selectedProject.id);
            renderScene(chapterId, sceneIndex);
        } catch (err: any) {
            setSceneRenderStatus(chapterId, sceneIndex, 'error', err.message);
        }
    };

    const handleGenerateTemplate = async (chapterId: string, sceneIndex: number) => {
        if (!selectedProject) return;
        setSceneRenderStatus(chapterId, sceneIndex, 'rendering');
        try {
            const res = await fetch(
                `/api/projects/${selectedProject.id}/chapters/${chapterId}/scenes/${sceneIndex}/generate-template`,
                { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) }
            );
            const data = await res.json();
            if (!data.success) throw new Error(data.error);
            setSceneRenderStatus(chapterId, sceneIndex, 'idle');
            loadProjectDetails(selectedProject.id);
        } catch (err: any) {
            setSceneRenderStatus(chapterId, sceneIndex, 'error', err.message);
        }
    };

    const IMAGE_SEQUENCE_TEMPLATES = ['170-image-cascade', '171-image-kenburns', '172-image-polaroid', '173-image-filmstrip', '174-image-stack', '175-image-grid'];
    const IMAGE_GRID_TEMPLATES = ['176-image-1up', '177-image-2up', '178-image-3up', '179-image-4up', '180-image-5up', '181-image-6up'];
    // Templates that use a single bare IMAGE_URL (no number suffix)
    const SINGLE_IMAGE_TEMPLATES = ['114-dossier-open', '151-knowledge-card', '153-social-media-impact', '156-biometric-access-scan', '157-archive-newspaper-reel'];
    const ALL_IMAGE_TEMPLATES = [...IMAGE_SEQUENCE_TEMPLATES, ...IMAGE_GRID_TEMPLATES];
    const isImageSequenceScene = (scene: Scene) => !!scene.template && ALL_IMAGE_TEMPLATES.includes(scene.template);
    const isGridImageScene = (scene: Scene) => !!scene.template && IMAGE_GRID_TEMPLATES.includes(scene.template);
    const isSingleImageScene = (scene: Scene) => !!scene.template && SINGLE_IMAGE_TEMPLATES.some(t => scene.template!.includes(t));
    const getGridImageCount = (template: string): number => { const m = template.match(/(\d+)up$/); return m ? parseInt(m[1]) : 1; };
    const needsImages = (scene: Scene) => isImageSequenceScene(scene) && (!scene.content?.IMAGE_URL_1 || scene.content.IMAGE_URL_1.startsWith('IMAGE_URL_'));
    const needsSingleImage = (scene: Scene) => isSingleImageScene(scene) && (!scene.content?.IMAGE_URL || scene.content.IMAGE_URL.startsWith('IMAGE_'));

    const [slideUploading, setSlideUploading] = useState<Record<string, boolean>>({});
    const [slotGenerating, setSlotGenerating] = useState<Record<string, boolean>>({});
    const [veoAnimating, setVeoAnimating] = useState<Record<string, boolean>>({});

    const handleUploadSlides = async (chapterId: string, sceneIndex: number, files: FileList, slotIndex?: number) => {
        if (!selectedProject || files.length === 0) return;
        const key = `${chapterId}-${sceneIndex}`;
        setSlideUploading(prev => ({ ...prev, [key]: true }));
        try {
            const formData = new FormData();
            if (slotIndex !== undefined) {
                formData.append('slides', files[0]);
                formData.append('slot', String(slotIndex));
            } else {
                Array.from(files).slice(0, 6).forEach(f => formData.append('slides', f));
            }
            const res = await fetch(
                `/api/projects/${selectedProject.id}/chapters/${chapterId}/scenes/${sceneIndex}/upload-slides`,
                { method: 'POST', body: formData }
            );
            const data = await res.json();
            if (!data.success) throw new Error(data.error);
            await loadProjectDetails(selectedProject.id);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSlideUploading(prev => ({ ...prev, [key]: false }));
        }
    };

    const handleAnimateWithVeo = async (chapterId: string, sceneIndex: number, prompt: string, imageUrl?: string) => {
        if (!selectedProject) return;
        const key = `${chapterId}-${sceneIndex}`;
        setVeoAnimating(prev => ({ ...prev, [key]: true }));
        try {
            const animRes = await fetch('/api/auto-scene/animate-veo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt, imageUrl }),
            });
            const animData = await animRes.json();
            if (!animData.success) throw new Error(animData.error);

            const saveRes = await fetch(
                `/api/projects/${selectedProject.id}/chapters/${chapterId}/scenes/${sceneIndex}/set-video`,
                { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ videoUrl: animData.url }) }
            );
            const saveData = await saveRes.json();
            if (!saveData.success) throw new Error(saveData.error);
            await loadProjectDetails(selectedProject.id);
        } catch (err: any) {
            setError(`Veo animation failed: ${err.message}`);
        } finally {
            setVeoAnimating(prev => ({ ...prev, [key]: false }));
        }
    };

    const handleGenerateSlotImage = async (chapterId: string, sceneIndex: number, slotIndex: number, prompt: string) => {
        if (!selectedProject || !prompt) return;
        const key = `${chapterId}-${sceneIndex}-${slotIndex}`;
        setSlotGenerating(prev => ({ ...prev, [key]: true }));
        try {
            const renderRes = await fetch('/api/auto-scene/render-3d', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt }),
            });
            const renderData = await renderRes.json();
            if (!renderData.success) throw new Error(renderData.error);

            const setRes = await fetch(
                `/api/projects/${selectedProject.id}/chapters/${chapterId}/scenes/${sceneIndex}/set-slot`,
                { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slot: slotIndex, url: renderData.url }) }
            );
            const setData = await setRes.json();
            if (!setData.success) throw new Error(setData.error);
            await loadProjectDetails(selectedProject.id);
        } catch (err: any) {
            setError(`Image generation failed: ${err.message}`);
        } finally {
            setSlotGenerating(prev => ({ ...prev, [key]: false }));
        }
    };

    const handleUpdateSceneContent = async (chapterId: string, sceneIndex: number, field: string, value: string) => {
        if (!selectedProject) return;
        const chapter = selectedProject.chapters.find(c => c.id === chapterId);
        if (!chapter) return;
        const scene = chapter.scenes[sceneIndex];
        const newContent = { ...(scene.content || {}), [field]: value };

        try {
            const res = await fetch(`/api/projects/${selectedProject.id}/chapters/${chapterId}/scenes/${sceneIndex}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: newContent })
            });
            if (res.ok) {
                loadProjectDetails(selectedProject.id);
            }
        } catch (err) {
            console.error('Failed to update scene content:', err);
        }
    };

    const handleImageUpload = async (chapterId: string, sceneIndex: number, field: string, file: File) => {
        const formData = new FormData();
        formData.append('image', file);

        try {
            const res = await fetch('/api/upload-image', {
                method: 'POST',
                body: formData,
            });
            const data = await res.json();
            if (data.success) {
                handleUpdateSceneContent(chapterId, sceneIndex, field, data.url);
            } else {
                throw new Error(data.error);
            }
        } catch (err: any) {
            console.error('Image upload failed:', err);
            setError('Image upload failed: ' + err.message);
        }
    };

    const handleExportProject = () => {
        if (!selectedProject) return;
        window.open(`/api/projects/${selectedProject.id}/export`, '_blank');
    };

    const handleExportChapter = (chapterId: string) => {
        if (!selectedProject) return;
        window.open(`/api/projects/${selectedProject.id}/chapters/${chapterId}/export`, '_blank');
    };

    const renderedCount = selectedProject?.chapters.reduce((sum, c) => sum + c.scenes.filter(s => s.status === 'rendered' || s.status === 'locked').length, 0) || 0;
    const lockedChaptersCount = selectedProject?.chapters.filter(c => c.status === 'locked').length || 0;

    return (
        <Box sx={{ p: 4, height: '100%', overflow: 'auto' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 4 }}>
                <Box>
                    <Typography variant="h4" sx={{ color: 'var(--accent-gold)', fontWeight: 'bold' }}>
                        PROJECT DIRECTOR
                    </Typography>
                    <Typography variant="subtitle1" sx={{ color: 'var(--text-secondary)' }}>
                        Chapter-based sequential rendering workflow
                    </Typography>
                </Box>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            {!selectedProject ? (
                <Grid container spacing={4}>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Paper sx={{ p: 3, bgcolor: 'var(--bg-secondary)', borderRadius: 2, border: '1px solid var(--border-color)' }}>
                            <Typography variant="h6" sx={{ color: 'var(--accent-gold)', mb: 2 }}>Create New Project</Typography>
                            <TextField
                                fullWidth
                                label="Project Name"
                                variant="outlined"
                                value={newProjectName}
                                onChange={(e) => setNewProjectName(e.target.value)}
                                sx={{ mb: 2 }}
                            />
                            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                                <InputLabel sx={{ color: 'var(--text-secondary)' }}>Scene Director</InputLabel>
                                <Select
                                    value={directorType}
                                    label="Scene Director"
                                    onChange={(e) => setDirectorType(e.target.value)}
                                    sx={{ color: '#fff', '.MuiOutlinedInput-notchedOutline': { borderColor: 'var(--border-color)' } }}
                                >
                                    <MenuItem value="standard">Standard (Cinematic 3D)</MenuItem>
                                    <MenuItem value="fiscal-pal">Fiscal Pal (Editorial Illustration)</MenuItem>
                                </Select>
                            </FormControl>
                            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                                <InputLabel sx={{ color: 'var(--text-secondary)' }}>Default Theme</InputLabel>
                                <Select
                                    value={genSettings.colorScheme}
                                    label="Default Theme"
                                    onChange={(e) => setGenSettings(prev => ({ ...prev, colorScheme: e.target.value }))}
                                    sx={{ color: '#fff', '.MuiOutlinedInput-notchedOutline': { borderColor: 'var(--border-color)' } }}
                                >
                                    <MenuItem value="THREAT">THREAT — reds, dark charcoal</MenuItem>
                                    <MenuItem value="COLD">COLD — midnight blues, cyans</MenuItem>
                                    <MenuItem value="DARK">DARK — near-black</MenuItem>
                                    <MenuItem value="INTEL">INTEL — deep purples, ambers</MenuItem>
                                    <MenuItem value="TECHNICAL">TECHNICAL — dark green code</MenuItem>
                                    <MenuItem value="CLEAN">CLEAN — light, neutral</MenuItem>
                                    <MenuItem value="CREAM">CREAM — warm magazine</MenuItem>
                                </Select>
                            </FormControl>
                            <Button
                                fullWidth
                                variant="contained"
                                onClick={handleCreateProject}
                                disabled={loading || !newProjectName.trim()}
                                sx={{ bgcolor: 'var(--accent-gold)', color: '#000', '&:hover': { bgcolor: '#fff' } }}
                            >
                                {loading ? 'Creating...' : 'Create Project'}
                            </Button>
                        </Paper>
                    </Grid>
                    <Grid size={{ xs: 12, md: 8 }}>
                        <Paper sx={{ p: 3, bgcolor: 'var(--bg-secondary)', borderRadius: 2, border: '1px solid var(--border-color)', minHeight: 200 }}>
                            <Typography variant="h6" sx={{ color: 'var(--accent-gold)', mb: 2 }}>Existing Projects</Typography>
                            {projects.length === 0 ? (
                                <Typography sx={{ color: 'var(--text-secondary)' }}>No projects found. Create one to get started.</Typography>
                            ) : (
                                <List>
                                    {projects.map(p => (
                                        <ListItem key={p.id} disablePadding sx={{ mb: 1, border: '1px solid var(--border-color)', borderRadius: 1 }}>
                                            <ListItemButton onClick={() => loadProjectDetails(p.id)}>
                                                <LoadIcon sx={{ color: 'var(--text-secondary)', mr: 2 }} />
                                                <ListItemText
                                                    primary={p.name}
                                                    secondary={`${p.chapterCount || 0} chapters • ${p.totalScenes || 0} scenes • Last updated: ${new Date(p.updatedAt).toLocaleDateString()}`}
                                                    primaryTypographyProps={{ sx: { color: '#fff', fontWeight: 'bold' } }}
                                                />
                                                {p.status === 'completed' && <Chip label="Completed" size="small" color="success" />}
                                            </ListItemButton>
                                        </ListItem>
                                    ))}
                                </List>
                            )}
                        </Paper>
                    </Grid>
                </Grid>
            ) : (
                <Box>
                    {/* Project Dashboard Header */}
                    <Paper sx={{ p: 3, mb: 4, bgcolor: 'var(--bg-secondary)', borderRadius: 2, border: '1px solid var(--accent-gold)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                            <Typography variant="h5" sx={{ color: '#fff', fontWeight: 'bold' }}>{selectedProject.name}</Typography>
                            <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
                                {selectedProject.chapters.length} Chapters • {selectedProject.totalScenes} Total Scenes • {renderedCount} Rendered • {lockedChaptersCount} Locked
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Button variant="outlined" onClick={() => setSelectedProject(null)} sx={{ color: '#fff', borderColor: 'var(--border-color)' }}>
                                Back to Projects
                            </Button>
                            <Button
                                variant="contained"
                                startIcon={batchState?.active ? <CircularProgress size={18} sx={{ color: '#000' }} /> : <RenderIcon />}
                                onClick={handleRenderAllChapters}
                                disabled={!!batchState?.active || selectedProject.totalScenes === 0}
                                sx={{ bgcolor: '#4caf50', color: '#000', fontWeight: 'bold', '&:hover': { bgcolor: '#66bb6a' } }}
                            >
                                Render All Chapters
                            </Button>
                            <Button
                                variant="contained"
                                startIcon={<DownloadIcon />}
                                onClick={handleExportProject}
                                disabled={selectedProject.totalScenes === 0}
                                sx={{ bgcolor: 'var(--accent-gold)', color: '#000', '&:hover': { bgcolor: '#fff' } }}
                            >
                                Export ZIP
                            </Button>
                            <Tooltip title="Generation Settings">
                                <IconButton onClick={() => setSettingsOpen(!settingsOpen)} sx={{ color: settingsOpen ? 'var(--accent-gold)' : 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>
                                    <SettingsIcon />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete Project">
                                <IconButton color="error" onClick={() => handleDeleteProject(selectedProject.id)} sx={{ border: '1px solid rgba(255,59,48,0.5)' }}>
                                    <DeleteIcon />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    </Paper>

                    {/* Project-level Batch Render Banner (visible when rendering across chapters) */}
                    {batchState?.active && (
                        <Paper sx={{
                            p: 2.5, mb: 3,
                            bgcolor: 'rgba(76,175,80,0.08)',
                            border: '1px solid #4caf50',
                            borderRadius: 2,
                            position: 'sticky', top: 8, zIndex: 10,
                        }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="subtitle2" sx={{ color: '#4caf50', fontWeight: 'bold', letterSpacing: 1 }}>
                                    RENDERING {batchState.current} OF {batchState.total}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Typography variant="caption" sx={{ color: 'var(--text-secondary)' }}>
                                        {PHASE_LABELS[batchState.phase] || (batchState.phase || 'RENDERING').toUpperCase()}
                                        {batchState.progress > 0 ? ` — ${Math.round(batchState.progress)}%` : ''}
                                    </Typography>
                                    {!renderAbortedRef.current && (
                                        <Button size="small" variant="outlined" color="error"
                                            onClick={handleStopRendering}
                                            sx={{ py: 0, px: 1, fontSize: '0.65rem', height: 20 }}>
                                            Stop
                                        </Button>
                                    )}
                                </Box>
                            </Box>
                            <Typography variant="body2" sx={{ color: '#fff', mb: 1.5, fontSize: '0.85rem' }}>
                                {batchState.sceneLabel || 'Preparing...'}
                            </Typography>
                            <LinearProgress
                                variant="determinate"
                                value={batchState.total > 0 ? (((batchState.current - 1) / batchState.total) * 100 + (batchState.progress / batchState.total)) : 0}
                                sx={{ height: 6, borderRadius: 3, mb: 1, bgcolor: 'rgba(255,255,255,0.1)', '& .MuiLinearProgress-bar': { bgcolor: '#4caf50', borderRadius: 3 } }}
                            />
                            <LinearProgress
                                variant={batchState.progress > 0 ? 'determinate' : 'indeterminate'}
                                value={batchState.progress}
                                sx={{ height: 3, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.05)', '& .MuiLinearProgress-bar': { bgcolor: 'rgba(76,175,80,0.5)', borderRadius: 3 } }}
                            />
                        </Paper>
                    )}

                    {/* Generation Settings Panel */}
                    <Collapse in={settingsOpen}>
                        <Paper sx={{ p: 3, mb: 3, bgcolor: 'var(--bg-secondary)', borderRadius: 2, border: '1px solid var(--accent-gold)' }}>
                            <Typography variant="h6" sx={{ color: 'var(--accent-gold)', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <SettingsIcon fontSize="small" /> Generation Settings
                            </Typography>
                            <Grid container spacing={3}>
                                {/* Template vs Image Ratio */}
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <Typography variant="subtitle2" sx={{ color: '#fff', mb: 1 }}>
                                        Template / Image Ratio: {genSettings.templateRatio}% templates, {100 - genSettings.templateRatio}% 3D renders
                                    </Typography>
                                    <Slider
                                        value={genSettings.templateRatio}
                                        onChange={(_, v) => setGenSettings(prev => ({ ...prev, templateRatio: v as number }))}
                                        min={10} max={90} step={5}
                                        marks={[{ value: 10, label: '10%' }, { value: 50, label: '50/50' }, { value: 90, label: '90%' }]}
                                        sx={{ color: 'var(--accent-gold)', '& .MuiSlider-markLabel': { color: 'var(--text-secondary)', fontSize: '0.7rem' } }}
                                    />
                                </Grid>

                                {/* Words per Scene (density) */}
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <Typography variant="subtitle2" sx={{ color: '#fff', mb: 1 }}>
                                        Scene Density: ~{genSettings.wordsPerScene} words max per scene
                                        <Typography component="span" variant="caption" sx={{ color: 'var(--text-secondary)', ml: 1 }}>
                                            ({genSettings.wordsPerScene <= 20 ? 'concise, more scenes' : genSettings.wordsPerScene >= 45 ? 'dense, fewer scenes' : 'balanced'})
                                        </Typography>
                                    </Typography>
                                    <Slider
                                        value={genSettings.wordsPerScene}
                                        onChange={(_, v) => setGenSettings(prev => ({ ...prev, wordsPerScene: v as number }))}
                                        min={15} max={60} step={5}
                                        marks={[{ value: 15, label: '15' }, { value: 25, label: '25' }, { value: 40, label: '40' }, { value: 60, label: '60' }]}
                                        sx={{ color: 'var(--accent-gold)', '& .MuiSlider-markLabel': { color: 'var(--text-secondary)', fontSize: '0.7rem' } }}
                                    />
                                </Grid>

                                {/* Template Variety */}
                                <Grid size={{ xs: 12, md: 3 }}>
                                    <Typography variant="subtitle2" sx={{ color: '#fff', mb: 1 }}>Template Variety</Typography>
                                    <Select
                                        fullWidth size="small"
                                        value={genSettings.templateVariety}
                                        onChange={(e) => setGenSettings(prev => ({ ...prev, templateVariety: e.target.value }))}
                                        sx={{ color: '#fff', '.MuiOutlinedInput-notchedOutline': { borderColor: 'var(--border-color)' } }}
                                    >
                                        <MenuItem value="low">Low — reuse OK</MenuItem>
                                        <MenuItem value="medium">Medium — some variety</MenuItem>
                                        <MenuItem value="high">High — max diversity</MenuItem>
                                    </Select>
                                </Grid>

                                {/* Max Template Reuse */}
                                <Grid size={{ xs: 12, md: 3 }}>
                                    <Typography variant="subtitle2" sx={{ color: '#fff', mb: 1 }}>Max Reuse Per Template</Typography>
                                    <Select
                                        fullWidth size="small"
                                        value={genSettings.maxTemplateReuse}
                                        onChange={(e) => setGenSettings(prev => ({ ...prev, maxTemplateReuse: Number(e.target.value) }))}
                                        sx={{ color: '#fff', '.MuiOutlinedInput-notchedOutline': { borderColor: 'var(--border-color)' } }}
                                    >
                                        <MenuItem value={1}>1 (unique per chapter)</MenuItem>
                                        <MenuItem value={2}>2</MenuItem>
                                        <MenuItem value={3}>3</MenuItem>
                                        <MenuItem value={5}>5</MenuItem>
                                    </Select>
                                </Grid>

                                {/* Color Scheme */}
                                <Grid size={{ xs: 12, md: 4 }}>
                                    <Typography variant="subtitle2" sx={{ color: '#fff', mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <PaletteIcon fontSize="small" /> Color Scheme
                                    </Typography>
                                    <Select
                                        fullWidth size="small"
                                        value={genSettings.colorScheme}
                                        onChange={(e) => setGenSettings(prev => ({ ...prev, colorScheme: e.target.value }))}
                                        sx={{ color: '#fff', '.MuiOutlinedInput-notchedOutline': { borderColor: 'var(--border-color)' } }}
                                    >
                                        <MenuItem value="auto">Auto (mood-based)</MenuItem>
                                        <MenuItem value="THREAT">THREAT — reds, dark charcoal</MenuItem>
                                        <MenuItem value="COLD">COLD — midnight blues, cyans</MenuItem>
                                        <MenuItem value="DARK">DARK — near-black</MenuItem>
                                        <MenuItem value="INTEL">INTEL — deep purples, ambers</MenuItem>
                                        <MenuItem value="TECHNICAL">TECHNICAL — dark green code</MenuItem>
                                        <MenuItem value="CLEAN">CLEAN — light, neutral</MenuItem>
                                        <MenuItem value="CREAM">CREAM — warm magazine</MenuItem>
                                        <MenuItem value="custom">Custom Palette</MenuItem>
                                    </Select>
                                </Grid>

                                {/* Scene Director Selection */}
                                <Grid size={{ xs: 12, md: 4 }}>
                                    <Typography variant="subtitle2" sx={{ color: '#fff', mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <SettingsIcon fontSize="small" /> Scene Director
                                    </Typography>
                                    <Select
                                        fullWidth size="small"
                                        value={selectedProject?.settings?.director || 'standard'}
                                        onChange={async (e) => {
                                            if (!selectedProject) return;
                                            try {
                                                const res = await fetch(`/api/projects/${selectedProject.id}`, {
                                                    method: 'PUT',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({ settings: { ...selectedProject.settings, director: e.target.value } })
                                                });
                                                const data = await res.json();
                                                if (data.success) setSelectedProject(data.project);
                                            } catch (err) {
                                                console.error('Failed to update director:', err);
                                            }
                                        }}
                                        sx={{ color: '#fff', '.MuiOutlinedInput-notchedOutline': { borderColor: 'var(--border-color)' } }}
                                    >
                                        <MenuItem value="standard">Standard (Cinematic 3D)</MenuItem>
                                        <MenuItem value="fiscal-pal">Fiscal Pal (Editorial Illustration)</MenuItem>
                                    </Select>
                                </Grid>

                                {/* Custom Colors (only when custom is selected) */}
                                {genSettings.colorScheme === 'custom' && (
                                    <Grid size={{ xs: 12, md: 8 }}>
                                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                            <Box>
                                                <Typography variant="caption" sx={{ color: 'var(--text-secondary)' }}>Primary</Typography>
                                                <input type="color" value={genSettings.customColors.primary}
                                                    onChange={(e) => setGenSettings(prev => ({ ...prev, customColors: { ...prev.customColors, primary: e.target.value } }))}
                                                    style={{ width: 48, height: 32, border: 'none', cursor: 'pointer', background: 'transparent' }}
                                                />
                                            </Box>
                                            <Box>
                                                <Typography variant="caption" sx={{ color: 'var(--text-secondary)' }}>Background</Typography>
                                                <input type="color" value={genSettings.customColors.background}
                                                    onChange={(e) => setGenSettings(prev => ({ ...prev, customColors: { ...prev.customColors, background: e.target.value } }))}
                                                    style={{ width: 48, height: 32, border: 'none', cursor: 'pointer', background: 'transparent' }}
                                                />
                                            </Box>
                                            <Box>
                                                <Typography variant="caption" sx={{ color: 'var(--text-secondary)' }}>Accent</Typography>
                                                <input type="color" value={genSettings.customColors.accent}
                                                    onChange={(e) => setGenSettings(prev => ({ ...prev, customColors: { ...prev.customColors, accent: e.target.value } }))}
                                                    style={{ width: 48, height: 32, border: 'none', cursor: 'pointer', background: 'transparent' }}
                                                />
                                            </Box>
                                            <Box sx={{ display: 'flex', gap: 1, ml: 2 }}>
                                                <Box sx={{ width: 24, height: 24, borderRadius: '50%', bgcolor: genSettings.customColors.primary, border: '1px solid #333' }} />
                                                <Box sx={{ width: 24, height: 24, borderRadius: '50%', bgcolor: genSettings.customColors.background, border: '1px solid #333' }} />
                                                <Box sx={{ width: 24, height: 24, borderRadius: '50%', bgcolor: genSettings.customColors.accent, border: '1px solid #333' }} />
                                            </Box>
                                        </Box>
                                    </Grid>
                                )}

                                {/* Custom Prompt */}
                                <Grid size={{ xs: 12 }}>
                                    <Typography variant="subtitle2" sx={{ color: '#fff', mb: 1 }}>Custom Director Instructions</Typography>
                                    <TextField
                                        fullWidth multiline rows={3} size="small"
                                        placeholder="Additional instructions for the AI scene director (e.g., 'prefer dark moody visuals', 'focus on data visualizations', 'use more map templates')..."
                                        value={genSettings.customPrompt}
                                        onChange={(e) => setGenSettings(prev => ({ ...prev, customPrompt: e.target.value }))}
                                    />
                                </Grid>

                                {/* Save Buttons */}
                                <Grid size={{ xs: 12 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                                        <Button variant="outlined" onClick={() => setSettingsOpen(false)} sx={{ color: 'var(--text-secondary)', borderColor: 'var(--border-color)' }}>
                                            Cancel
                                        </Button>
                                        <Button variant="contained" onClick={() => handleSaveGenSettings(false)} sx={{ bgcolor: 'var(--accent-gold)', color: '#000', '&:hover': { bgcolor: '#fff' } }}>
                                            Save Settings
                                        </Button>
                                        {selectedProject && selectedProject.chapters.length > 0 && (
                                            <Button
                                                variant="contained"
                                                onClick={() => confirmAction(
                                                    'Save & Reanalyze All Chapters',
                                                    'This will save settings and regenerate all unlocked chapters with the new settings. Existing scene edits will be lost. Continue?',
                                                    () => handleSaveGenSettings(true)
                                                )}
                                                disabled={loading}
                                                startIcon={<RegenerateIcon />}
                                                sx={{ bgcolor: '#ff6600', color: '#fff', '&:hover': { bgcolor: '#ff8533' } }}
                                            >
                                                {loading ? 'Reanalyzing...' : 'Save & Reanalyze All'}
                                            </Button>
                                        )}
                                    </Box>
                                </Grid>
                            </Grid>
                        </Paper>
                    </Collapse>

                    <Grid container spacing={3}>
                        {/* Chapters Sidebar */}
                        <Grid size={{ xs: 12, md: 3 }}>
                            <Paper sx={{ p: 2, bgcolor: 'var(--bg-secondary)', borderRadius: 2, border: '1px solid var(--border-color)' }}>
                                <Typography variant="h6" sx={{ color: 'var(--accent-gold)', mb: 2 }}>Chapters</Typography>
                                <List disablePadding>
                                    {selectedProject.chapters.map((ch, idx) => (
                                        <ListItem key={ch.id} disablePadding sx={{ mb: 1 }}>
                                            <ListItemButton
                                                selected={activeChapterId === ch.id}
                                                onClick={() => setActiveChapterId(ch.id)}
                                                sx={{
                                                    borderRadius: 1,
                                                    '&.Mui-selected': { bgcolor: 'rgba(201, 169, 97, 0.2)' }
                                                }}
                                            >
                                                <ListItemText
                                                    primary={`${idx + 1}. ${ch.title}`}
                                                    secondary={`${ch.scenes.length} scenes • ${ch.status}`}
                                                    primaryTypographyProps={{ sx: { color: activeChapterId === ch.id ? 'var(--accent-gold)' : '#fff', fontWeight: 'bold', fontSize: '0.9rem' } }}
                                                />
                                                {ch.status === 'locked' && <LockIcon sx={{ fontSize: 16, color: 'var(--text-secondary)' }} />}
                                            </ListItemButton>
                                        </ListItem>
                                    ))}
                                </List>

                                <Divider sx={{ my: 2, borderColor: 'var(--border-color)' }} />

                                <Typography variant="subtitle2" sx={{ color: 'var(--text-secondary)', mb: 1 }}>Add Next Chapter</Typography>
                                <TextField
                                    fullWidth size="small"
                                    placeholder="Chapter Title"
                                    value={newChapterTitle}
                                    onChange={(e) => setNewChapterTitle(e.target.value)}
                                    sx={{ mb: 1 }}
                                />
                                <TextField
                                    fullWidth multiline rows={4} size="small"
                                    placeholder="Paste chapter script here..."
                                    value={newChapterScript}
                                    onChange={(e) => setNewChapterScript(e.target.value)}
                                    sx={{ mb: 1 }}
                                />

                                {/* Director's Reference Image */}
                                <Box sx={{ mb: 2 }}>
                                    {directorReferenceImage ? (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1, borderRadius: 1, border: '1px solid var(--accent-gold)', bgcolor: 'rgba(201,169,97,0.07)' }}>
                                            <Box component="img" src={directorReferenceImage} sx={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 0.5 }} />
                                            <Typography variant="caption" sx={{ color: 'var(--accent-gold)', flex: 1 }}>Reference image attached</Typography>
                                            <Box component="span" onClick={() => setDirectorReferenceImage(null)} sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem', cursor: 'pointer', '&:hover': { color: '#fff' } }}>✕</Box>
                                        </Box>
                                    ) : (
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                <Button
                                                    size="small" variant="outlined" fullWidth
                                                    onClick={handleSuggestImage}
                                                    disabled={imageSuggesting || !newChapterScript.trim()}
                                                    sx={{ color: 'rgba(255,255,255,0.5)', borderColor: 'rgba(255,255,255,0.15)', fontSize: '0.72rem', textTransform: 'none' }}
                                                >
                                                    {imageSuggesting ? <CircularProgress size={12} sx={{ mr: 1 }} /> : null}
                                                    {imageSuggesting ? 'Thinking...' : '💡 Suggest image'}
                                                </Button>
                                                <Box component="label" sx={{ flex: 1 }}>
                                                    <input type="file" hidden accept="image/*" onChange={(e) => { if (e.target.files?.[0]) handleDirectorImageUpload(e.target.files[0]); }} />
                                                    <Button size="small" variant="outlined" fullWidth component="span"
                                                        sx={{ color: 'rgba(255,255,255,0.5)', borderColor: 'rgba(255,255,255,0.15)', fontSize: '0.72rem', textTransform: 'none' }}
                                                    >⬆ Upload</Button>
                                                </Box>
                                            </Box>
                                            {imageSuggestion && (
                                                <Box sx={{ p: 1, borderRadius: 1, bgcolor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                                    <Typography variant="caption" sx={{ color: '#fff', display: 'block', mb: 0.5, fontWeight: 600 }}>
                                                        {imageSuggestion.description}
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.45)', display: 'block', mb: 1, fontSize: '0.68rem' }}>
                                                        {imageSuggestion.reason}
                                                    </Typography>
                                                    {imageSuggestion.canGenerate ? (
                                                        <Button size="small" variant="contained"
                                                            onClick={handleGenerateSuggestedImage}
                                                            disabled={imageGenerating}
                                                            sx={{ bgcolor: 'var(--accent-gold)', color: '#000', fontSize: '0.7rem', textTransform: 'none', py: 0.3 }}
                                                        >
                                                            {imageGenerating ? <CircularProgress size={10} sx={{ mr: 0.5 }} /> : null}
                                                            {imageGenerating ? 'Generating...' : 'Generate'}
                                                        </Button>
                                                    ) : (
                                                        <Box component="label">
                                                            <input type="file" hidden accept="image/*" onChange={(e) => { if (e.target.files?.[0]) handleDirectorImageUpload(e.target.files[0]); }} />
                                                            <Button size="small" variant="outlined" component="span"
                                                                sx={{ color: 'var(--accent-gold)', borderColor: 'var(--accent-gold)', fontSize: '0.7rem', textTransform: 'none', py: 0.3 }}
                                                            >Upload this image</Button>
                                                        </Box>
                                                    )}
                                                </Box>
                                            )}
                                        </Box>
                                    )}
                                </Box>

                                <Button
                                    fullWidth variant="contained"
                                    onClick={handleAddChapter}
                                    disabled={loading || !newChapterScript.trim()}
                                    sx={{ bgcolor: 'rgba(255,255,255,0.1)' }}
                                    startIcon={loading ? undefined : <AddIcon />}
                                >
                                    {loading ? 'Analyzing...' : 'Add & Analyze'}
                                </Button>
                            </Paper>
                        </Grid>

                        {/* Active Chapter Content */}
                        <Grid size={{ xs: 12, md: 9 }}>
                            {activeChapterId && selectedProject.chapters.find(c => c.id === activeChapterId) ? (() => {
                                const chapter = selectedProject.chapters.find(c => c.id === activeChapterId)!;
                                const isLocked = chapter.status === 'locked';

                                return (
                                    <Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                            <Typography variant="h5" sx={{ color: '#fff' }}>
                                                {chapter.title} <Chip size="small" label={chapter.status.toUpperCase()} sx={{ ml: 2, bgcolor: isLocked ? 'rgba(0,255,0,0.1)' : 'rgba(255,255,255,0.1)' }} />
                                            </Typography>
                                            {!isLocked && (
                                                <Box sx={{ display: 'flex', gap: 1 }}>
                                                    <Button
                                                        variant="contained"
                                                        startIcon={<RenderIcon />}
                                                        onClick={() => handleRenderAllScenes(chapter.id)}
                                                        disabled={loading || !!batchState?.active}
                                                        sx={{ bgcolor: 'var(--accent-gold)', color: '#000', mr: 2 }}
                                                    >
                                                        Render All
                                                    </Button>
                                                    <Tooltip title="Regenerate all scenes from script">
                                                        <Button
                                                            variant="outlined"
                                                            startIcon={<RegenerateIcon />}
                                                            onClick={() => handleReanalyzeChapter(chapter.id)}
                                                            disabled={loading}
                                                            sx={{ color: '#fff', borderColor: 'var(--border-color)' }}
                                                        >
                                                            Re-Analyze
                                                        </Button>
                                                    </Tooltip>
                                                    <Tooltip title="Delete Chapter">
                                                        <IconButton color="error" onClick={() => handleDeleteChapter(chapter.id)} sx={{ border: '1px solid rgba(255,59,48,0.5)', mr: 1 }}>
                                                            <DeleteIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Button
                                                        variant="outlined"
                                                        startIcon={<DownloadIcon />}
                                                        onClick={() => handleExportChapter(chapter.id)}
                                                        sx={{ color: '#fff', borderColor: 'var(--border-color)' }}
                                                    >
                                                        Download Assets
                                                    </Button>
                                                    <Button
                                                        variant="outlined"
                                                        color="warning"
                                                        startIcon={<LockIcon />}
                                                        onClick={() => handleLockChapter(chapter.id)}
                                                    >
                                                        Lock Chapter
                                                    </Button>
                                                </Box>
                                            )}
                                        </Box>

                                        {/* Batch Render Progress Banner */}
                                        {batchState?.active && (
                                            <Paper sx={{
                                                p: 2.5, mb: 3,
                                                bgcolor: 'rgba(201,169,97,0.08)',
                                                border: '1px solid var(--accent-gold)',
                                                borderRadius: 2
                                            }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                    <Typography variant="subtitle2" sx={{ color: 'var(--accent-gold)', fontWeight: 'bold', letterSpacing: 1 }}>
                                                        RENDERING {batchState.current} OF {batchState.total}
                                                    </Typography>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                        <Typography variant="caption" sx={{ color: 'var(--text-secondary)' }}>
                                                            {PHASE_LABELS[batchState.phase] || (batchState.phase || 'RENDERING').toUpperCase()}
                                                            {batchState.progress > 0 ? ` — ${Math.round(batchState.progress)}%` : ''}
                                                        </Typography>
                                                        {!renderAbortedRef.current && (
                                                            <Button 
                                                                size="small" 
                                                                variant="outlined" 
                                                                color="error"
                                                                onClick={handleStopRendering}
                                                                sx={{ py: 0, px: 1, fontSize: '0.65rem', height: 20 }}
                                                            >
                                                                Stop Batch
                                                            </Button>
                                                        )}
                                                    </Box>
                                                </Box>
                                                <Typography variant="body2" sx={{ color: '#fff', mb: 1.5, fontSize: '0.85rem' }}>
                                                    {batchState.sceneLabel || 'Preparing scene...'}
                                                </Typography>
                                                {batchState.message && (
                                                    <Typography variant="caption" sx={{ color: 'var(--text-secondary)', display: 'block', mb: 1 }}>
                                                        {batchState.message}
                                                    </Typography>
                                                )}
                                                {/* Outer: overall batch progress */}
                                                <LinearProgress
                                                    variant="determinate"
                                                    value={batchState.total > 0 ? (((batchState.current - 1) / batchState.total) * 100 + (batchState.progress / batchState.total)) : 0}
                                                    sx={{
                                                        height: 6, borderRadius: 3, mb: 1,
                                                        bgcolor: 'rgba(255,255,255,0.1)',
                                                        '& .MuiLinearProgress-bar': { bgcolor: 'var(--accent-gold)', borderRadius: 3 }
                                                    }}
                                                />
                                                {/* Inner: current scene progress */}
                                                <LinearProgress
                                                    variant={batchState.progress > 0 ? 'determinate' : 'indeterminate'}
                                                    value={batchState.progress}
                                                    sx={{
                                                        height: 3, borderRadius: 3,
                                                        bgcolor: 'rgba(255,255,255,0.05)',
                                                        '& .MuiLinearProgress-bar': { bgcolor: 'rgba(201,169,97,0.5)', borderRadius: 3 }
                                                    }}
                                                />
                                            </Paper>
                                        )}

                                        {(chapter.scenes || []).map((scene, idx) => {
                                            const sceneKey = `${chapter.id}-${idx}`;
                                            const prog = sceneProgress[sceneKey];
                                            const isRendering = scene.renderStatus === 'rendering';

                                            return (
                                                <Card key={idx} sx={{ mb: 2, bgcolor: 'var(--bg-secondary)', border: isRendering ? '1px solid var(--accent-gold)' : '1px solid var(--border-color)', position: 'relative', transition: 'border-color 0.3s' }}>
                                                    <Box sx={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', bgcolor:
                                                        (scene.status === 'rendered' ? 'var(--accent-gold)' : 'transparent')
                                                    }} />

                                                    {/* Per-scene terminal-style progress bar */}
                                                    {isRendering && (
                                                        <Box sx={{ px: 3, pt: 2 }}>
                                                            <CLITerminal 
                                                                progress={prog?.progress || 0} 
                                                                phase={prog?.phase || 'starting'} 
                                                                message={prog?.message} 
                                                                
                                                            />
                                                        </Box>
                                                    )}

                                                    <CardContent sx={{ pl: 3 }}>
                                                        <Grid container spacing={2}>
                                                            <Grid size={{ xs: 12, md: 8 }}>
                                                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                                    <Chip size="small" label={`Scene ${scene.globalIndex}`} sx={{ mr: 2, bgcolor: 'rgba(255,255,255,0.1)' }} />
                                                                    <Chip 
                                                                        size="small" 
                                                                        label={scene.type} 
                                                                        sx={{ 
                                                                            mr: 2, 
                                                                            bgcolor: scene.type === 'ILLUSTRATION' ? 'rgba(201, 169, 97, 0.4)' : 'rgba(201, 169, 97, 0.2)', 
                                                                            color: scene.type === 'ILLUSTRATION' ? '#fff' : 'var(--accent-gold)',
                                                                            border: scene.type === 'ILLUSTRATION' ? '1px solid var(--accent-gold)' : 'none',
                                                                            fontWeight: scene.type === 'ILLUSTRATION' ? 900 : 400
                                                                        }} 
                                                                    />
                                                                    {scene.template && <Typography variant="caption" sx={{ color: 'var(--text-secondary)' }}>{scene.template}</Typography>}
                                                                    {needsImages(scene) && (
                                                                        <Chip size="small" label="⚠ Needs Images" sx={{ ml: 1, bgcolor: 'rgba(245,158,11,0.2)', color: '#f59e0b', border: '1px solid #f59e0b', fontWeight: 700, fontSize: '0.65rem' }} />
                                                                    )}
                                                                </Box>
                                                                <Typography variant="body1" sx={{ color: '#fff', fontStyle: 'italic', mb: 1, pl: 2, borderLeft: '2px solid rgba(255,255,255,0.2)' }}>
                                                                    "{scene.script}"
                                                                </Typography>

                                                                {(scene as any).routing_reason && (
                                                                    <Box sx={{ mb: 1, p: 1, bgcolor: 'rgba(201,169,97,0.05)', borderRadius: 1, borderLeft: '3px solid var(--accent-gold)' }}>
                                                                        <Typography variant="caption" sx={{ color: 'var(--accent-gold)', display: 'block', fontWeight: 'bold', fontSize: '0.65rem', textTransform: 'uppercase', mb: 0.5 }}>
                                                                            Director's Note
                                                                        </Typography>
                                                                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', fontStyle: 'italic', fontSize: '0.75rem', lineHeight: 1.2 }}>
                                                                            {(scene as any).routing_reason}
                                                                        </Typography>
                                                                    </Box>
                                                                )}

                                                                {!isLocked && (
                                                                    <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
                                                                        <Button
                                                                            size="small"
                                                                            variant="contained"
                                                                            startIcon={<RenderIcon />}
                                                                            onClick={() => renderScene(chapter.id, idx)}
                                                                            disabled={scene.renderStatus === 'rendering'}
                                                                            sx={{ bgcolor: 'var(--accent-gold)', color: '#000' }}
                                                                        >
                                                                            {scene.renderStatus === 'rendering' ?
                                                                                (scene.type === 'TEMPLATE' ? 'Rendering...' : 'Generating...') :
                                                                                (scene.status === 'rendered' ? 'Re-Render' : (scene.type === 'TEMPLATE' ? 'Render' : 'Generate'))
                                                                            }
                                                                        </Button>

                                                                        {scene.type === '3D_RENDER' && (
                                                                            <Tooltip title="Re-generate image prompt via Gemini">
                                                                                <Button
                                                                                    size="small"
                                                                                    variant="outlined"
                                                                                    startIcon={<ReanalyzePromptIcon />}
                                                                                    onClick={() => handleRegeneratePrompt(chapter.id, idx)}
                                                                                    disabled={scene.renderStatus === 'rendering'}
                                                                                    sx={{ color: 'var(--accent-gold)', borderColor: 'var(--accent-gold)' }}
                                                                                >
                                                                                    Re-analyze
                                                                                </Button>
                                                                            </Tooltip>
                                                                        )}

                                                                        {scene.type === '3D_RENDER' && (scene as any).prompt && (
                                                                            <Tooltip title="Animate this scene with Google Veo (image-to-video). Takes 2–5 min.">
                                                                                <Button
                                                                                    size="small"
                                                                                    variant="outlined"
                                                                                    disabled={scene.renderStatus === 'rendering' || veoAnimating[`${chapter.id}-${idx}`]}
                                                                                    onClick={() => handleAnimateWithVeo(chapter.id, idx, (scene as any).prompt, scene.imageUrl)}
                                                                                    sx={{ color: '#a78bfa', borderColor: '#a78bfa', '&:hover': { borderColor: '#c4b5fd', color: '#c4b5fd' } }}
                                                                                >
                                                                                    {veoAnimating[`${chapter.id}-${idx}`] ? 'Animating…' : 'Animate (Veo)'}
                                                                                </Button>
                                                                            </Tooltip>
                                                                        )}

                                                                        {scene.type === 'TEMPLATE' && (
                                                                            <Tooltip title="Re-fill fields from script via AI, then render">
                                                                                <Button
                                                                                    size="small"
                                                                                    variant="outlined"
                                                                                    startIcon={<ReanalyzePromptIcon />}
                                                                                    onClick={() => handleReanalyzeTemplate(chapter.id, idx)}
                                                                                    disabled={scene.renderStatus === 'rendering'}
                                                                                    sx={{ color: 'var(--accent-gold)', borderColor: 'var(--accent-gold)' }}
                                                                                >
                                                                                    Re-analyze
                                                                                </Button>
                                                                            </Tooltip>
                                                                        )}

                                                                        {/* Single image upload — templates with one bare IMAGE_URL slot */}
                                                                        {isSingleImageScene(scene) && (
                                                                            <>
                                                                                <input
                                                                                    type="file"
                                                                                    accept="image/jpeg,image/png,image/webp"
                                                                                    id={`single-img-input-${chapter.id}-${idx}`}
                                                                                    style={{ display: 'none' }}
                                                                                    onChange={e => e.target.files && handleUploadSlides(chapter.id, idx, e.target.files, 1)}
                                                                                />
                                                                                <Button
                                                                                    size="small"
                                                                                    variant="outlined"
                                                                                    disabled={slideUploading[`${chapter.id}-${idx}`]}
                                                                                    onClick={() => document.getElementById(`single-img-input-${chapter.id}-${idx}`)?.click()}
                                                                                    sx={{ color: '#f59e0b', borderColor: '#f59e0b' }}
                                                                                >
                                                                                    {slideUploading[`${chapter.id}-${idx}`] ? 'Uploading…' : (needsSingleImage(scene) ? 'Upload Image' : 'Replace Image')}
                                                                                </Button>
                                                                            </>
                                                                        )}

                                                                        {/* Bulk upload button — sequence templates only (170-175) */}
                                                                        {isImageSequenceScene(scene) && !isGridImageScene(scene) && (
                                                                            <>
                                                                                <input
                                                                                    type="file"
                                                                                    accept="image/jpeg,image/png,image/webp"
                                                                                    multiple
                                                                                    id={`slide-input-${chapter.id}-${idx}`}
                                                                                    style={{ display: 'none' }}
                                                                                    onChange={e => e.target.files && handleUploadSlides(chapter.id, idx, e.target.files)}
                                                                                />
                                                                                <Button
                                                                                    size="small"
                                                                                    variant="outlined"
                                                                                    disabled={slideUploading[`${chapter.id}-${idx}`]}
                                                                                    onClick={() => document.getElementById(`slide-input-${chapter.id}-${idx}`)?.click()}
                                                                                    sx={{ color: '#f59e0b', borderColor: '#f59e0b' }}
                                                                                >
                                                                                    {slideUploading[`${chapter.id}-${idx}`] ? 'Uploading…' : (needsImages(scene) ? 'Upload Images' : 'Replace Images')}
                                                                                </Button>
                                                                            </>
                                                                        )}

                                                                        {(scene.type === 'TEMPLATE' ? scene.videoUrl : (scene.videoUrl || scene.imageUrl)) && (
                                                                            <Button
                                                                                size="small"
                                                                                variant="outlined"
                                                                                startIcon={<DownloadIcon />}
                                                                                onClick={() => window.open(scene.videoUrl || scene.imageUrl, '_blank')}
                                                                                sx={{ color: '#fff', borderColor: 'var(--border-color)' }}
                                                                            >
                                                                                Download {scene.videoUrl ? 'Video' : 'Image'}
                                                                            </Button>
                                                                        )}
                                                                    </Box>
                                                                )}

                                                                {/* Per-slot upload zones — grid templates (176-181) */}
                                                                {isGridImageScene(scene) && (
                                                                    <Box sx={{ mt: 2 }}>
                                                                        <Typography variant="caption" sx={{ color: '#60a5fa', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.6rem', display: 'block', mb: 1 }}>
                                                                            Images ({scene.template && getGridImageCount(scene.template)} slots)
                                                                        </Typography>
                                                                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                                                            {scene.template && Array.from({ length: getGridImageCount(scene.template) }, (_, i) => i + 1).map(n => {
                                                                                const url = scene.content?.[`IMAGE_URL_${n}`];
                                                                                const hasImg = url && !url.startsWith('IMAGE_URL_');
                                                                                const sug = scene.content?.[`SUGGESTION_${n}`];
                                                                                const hasSug = sug && !sug.startsWith('SUGGESTION_');
                                                                                const uploading = slideUploading[`${chapter.id}-${idx}`];
                                                                                const generating = slotGenerating[`${chapter.id}-${idx}-${n}`];
                                                                                const busy = uploading || generating;
                                                                                return (
                                                                                    <Box key={n} sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, alignItems: 'center' }}>
                                                                                        <input
                                                                                            type="file"
                                                                                            accept="image/jpeg,image/png,image/webp"
                                                                                            id={`slide-input-${chapter.id}-${idx}-${n}`}
                                                                                            style={{ display: 'none' }}
                                                                                            onChange={e => e.target.files && handleUploadSlides(chapter.id, idx, e.target.files, n)}
                                                                                        />
                                                                                        {/* Thumbnail / upload zone */}
                                                                                        <Box
                                                                                            onClick={() => !busy && (document.getElementById(`slide-input-${chapter.id}-${idx}-${n}`) as HTMLInputElement | null)?.click()}
                                                                                            sx={{
                                                                                                width: 72, height: 56, borderRadius: 1.5, overflow: 'hidden', position: 'relative', cursor: busy ? 'default' : 'pointer',
                                                                                                border: hasImg ? '1px solid rgba(59,130,246,0.5)' : '1px dashed rgba(59,130,246,0.35)',
                                                                                                bgcolor: 'rgba(8,18,50,0.8)',
                                                                                                '&:hover': { borderColor: busy ? undefined : '#3b82f6', bgcolor: busy ? undefined : 'rgba(59,130,246,0.08)' },
                                                                                            }}
                                                                                        >
                                                                                            {generating ? (
                                                                                                <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                                                    <Typography sx={{ color: '#60a5fa', fontSize: '0.55rem', textAlign: 'center', px: 0.5 }}>Generating…</Typography>
                                                                                                </Box>
                                                                                            ) : hasImg ? (
                                                                                                <img src={url} alt={`Slot ${n}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                                                            ) : (
                                                                                                <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 0.3 }}>
                                                                                                    <Typography sx={{ color: 'rgba(255,255,255,0.25)', fontSize: '1rem', lineHeight: 1 }}>+</Typography>
                                                                                                    <Typography sx={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.5rem', lineHeight: 1 }}>upload</Typography>
                                                                                                </Box>
                                                                                            )}
                                                                                            <Box sx={{ position: 'absolute', top: 2, left: 3, fontSize: '0.5rem', color: hasImg ? '#4ade80' : 'rgba(255,255,255,0.35)', fontWeight: 700, lineHeight: 1 }}>{n}</Box>
                                                                                        </Box>
                                                                                        {/* AI Generate button (only when suggestion exists and no image yet) */}
                                                                                        {hasSug && !hasImg && (
                                                                                            <Button
                                                                                                size="small"
                                                                                                variant="text"
                                                                                                disabled={busy}
                                                                                                onClick={() => handleGenerateSlotImage(chapter.id, idx, n, sug!)}
                                                                                                sx={{ fontSize: '0.5rem', p: '1px 4px', minWidth: 0, color: '#60a5fa', textTransform: 'none', lineHeight: 1.2 }}
                                                                                            >
                                                                                                {generating ? '…' : 'AI gen'}
                                                                                            </Button>
                                                                                        )}
                                                                                        {/* Suggestion label */}
                                                                                        {hasSug && !hasImg && (
                                                                                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.52rem', maxWidth: 72, textAlign: 'center', lineHeight: 1.2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                                                                {sug}
                                                                                            </Typography>
                                                                                        )}
                                                                                    </Box>
                                                                                );
                                                                            })}
                                                                        </Box>
                                                                    </Box>
                                                                )}

                                                                {/* Suggestion list — sequence templates (170-175) when no images yet */}
                                                                {isImageSequenceScene(scene) && !isGridImageScene(scene) && needsImages(scene) && [1,2,3,4,5,6].some(n => scene.content?.[`SUGGESTION_${n}`] && !scene.content[`SUGGESTION_${n}`].startsWith('SUGGESTION_')) && (
                                                                    <Box sx={{ mt: 2, p: 1.5, bgcolor: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 2 }}>
                                                                        <Typography variant="caption" sx={{ color: '#60a5fa', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.6rem', display: 'block', mb: 1 }}>
                                                                            Suggested images to upload
                                                                        </Typography>
                                                                        {[1,2,3,4,5,6].map(n => {
                                                                            const sug = scene.content?.[`SUGGESTION_${n}`];
                                                                            if (!sug || sug.startsWith('SUGGESTION_')) return null;
                                                                            const hasImg = scene.content?.[`IMAGE_URL_${n}`] && !scene.content[`IMAGE_URL_${n}`].startsWith('IMAGE_URL_');
                                                                            return (
                                                                                <Box key={n} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 0.5 }}>
                                                                                    <Typography variant="caption" sx={{ color: hasImg ? '#4ade80' : '#60a5fa', fontWeight: 700, minWidth: 18, fontSize: '0.7rem' }}>{hasImg ? '✓' : n}</Typography>
                                                                                    <Typography variant="caption" sx={{ color: hasImg ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.65)', fontSize: '0.72rem', lineHeight: 1.3, textDecoration: hasImg ? 'line-through' : 'none' }}>{sug}</Typography>
                                                                                </Box>
                                                                            );
                                                                        })}
                                                                    </Box>
                                                                )}

                                                                {/* Uploaded image thumbnail — single IMAGE_URL templates */}
                                                                {isSingleImageScene(scene) && !needsSingleImage(scene) && scene.content?.IMAGE_URL && (
                                                                    <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                                                                        <Box sx={{ width: 80, height: 56, borderRadius: 1.5, overflow: 'hidden', border: '1px solid rgba(59,130,246,0.4)' }}>
                                                                            <img src={scene.content.IMAGE_URL} alt="Uploaded" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                                        </Box>
                                                                    </Box>
                                                                )}

                                                                {/* Uploaded image thumbnails — sequence templates only */}
                                                                {isImageSequenceScene(scene) && !isGridImageScene(scene) && !needsImages(scene) && (
                                                                    <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
                                                                        {[1,2,3,4,5,6].map(n => {
                                                                            const url = scene.content?.[`IMAGE_URL_${n}`];
                                                                            if (!url || url.startsWith('IMAGE_URL_')) return null;
                                                                            return (
                                                                                <Box key={n} sx={{ width: 52, height: 40, borderRadius: 1, overflow: 'hidden', border: '1px solid rgba(59,130,246,0.4)' }}>
                                                                                    <img src={url} alt={`Slot ${n}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                                                </Box>
                                                                            );
                                                                        })}
                                                                    </Box>
                                                                )}

                                                                {scene.renderStatus === 'error' && (
                                                                    <Alert severity="error" sx={{ mt: 2 }} > {scene.error}</Alert>
                                                                )}
                                                            </Grid>

                                                            {/* Media Preview */}
                                                            <Grid size={{ xs: 12, md: 4 }} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                {(() => {
                                                                    const progress = sceneProgress[sceneKey];
                                                                    const isRendering = progress && (progress.phase === 'generating' || progress.phase === 'bundling' || progress.phase === 'rendering' || progress.phase === 'processing');
                                                                    
                                                                    // Show actual media if we have it (prefer video, then image)
                                                                    if (scene.videoUrl) {
                                                                        return (
                                                                            <Box sx={{ position: 'relative' }}>
                                                                                <video src={scene.videoUrl} controls style={{ width: '100%', borderRadius: '8px', maxHeight: '150px', background: '#000' }} />
                                                                            </Box>
                                                                        );
                                                                    }

                                                                    if (scene.imageUrl) {
                                                                        return (
                                                                            <Box>
                                                                                <img src={scene.imageUrl} alt="Scene preview" style={{ width: '100%', borderRadius: '4px', objectFit: 'contain' }} />
                                                                            </Box>
                                                                        );
                                                                    }

                                                                    if (isRendering) {
                                                                        return (
                                                                            <Box sx={{ width: '100%', height: 150, bgcolor: '#000', borderRadius: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 2 }}>
                                                                                <CircularProgress size={24} sx={{ color: 'var(--accent-gold)', mb: 2 }} />
                                                                                <Typography variant="caption" sx={{ color: '#fff', textAlign: 'center', fontSize: '0.7rem' }}>{progress.message || 'Processing...'}</Typography>
                                                                                <LinearProgress variant="determinate" value={progress.progress} sx={{ width: '80%', mt: 1.5, height: 4, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.1)', '& .MuiLinearProgress-bar': { bgcolor: 'var(--accent-gold)' } }} />
                                                                            </Box>
                                                                        );
                                                                    }

                                                                    return (
                                                                        <Box sx={{ width: '100%', height: '120px', bgcolor: 'rgba(0,0,0,0.5)', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                            <Typography variant="caption" sx={{ color: 'var(--text-secondary)' }}>No media yet</Typography>
                                                                        </Box>
                                                                    );
                                                                })()}
                                                            </Grid>
                                                        </Grid>
                                                    </CardContent>
                                                </Card>
                                            );
                                        })}
                                    </Box>
                                );
                            })() : (
                                <Box sx={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                                    <Typography sx={{ color: 'var(--text-secondary)' }}>Select a chapter to view scenes.</Typography>
                                </Box>
                            )}
                        </Grid>
                    </Grid>
                </Box>
            )}

            {/* Global Action Confirmation Dialog */}
            <Dialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                PaperProps={{ sx: { bgcolor: 'var(--bg-secondary)', color: '#fff', border: '1px solid var(--border-color)', borderRadius: 2 } }}
            >
                <DialogTitle sx={{ color: 'var(--accent-gold)' }}>{dialogTitle}</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ color: 'var(--text-secondary)' }}>
                        {dialogMessage}
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    {dialogCancelText && (
                        <Button onClick={() => setDialogOpen(false)} sx={{ color: '#fff' }}>
                            {dialogCancelText}
                        </Button>
                    )}
                    <Button onClick={handleDialogConfirm} variant="contained" sx={{ bgcolor: 'var(--accent-gold)', color: '#000', '&:hover': { bgcolor: '#fff' } }}>
                        {dialogConfirmText}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ProjectDirectorView;

