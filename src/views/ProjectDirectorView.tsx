import React, { useState, useEffect, useRef } from 'react';
import {
    Box, Typography, TextField, Button, Card, CardContent, Chip, LinearProgress, CircularProgress,
    IconButton, Tooltip, Accordion, AccordionSummary, AccordionDetails, Alert, Divider,
    List, ListItem, ListItemText, ListItemButton, Paper, Grid, Slider, FormControl,
    Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
    MenuItem, Menu, Select, InputLabel, Collapse
} from '@mui/material';
import {
    ExpandMore as ExpandIcon,
    PlayArrow as RenderIcon,
    Download as DownloadIcon,
    Refresh as RefreshIcon,
    Movie as VideoIcon,
    Code as CodeIcon,
    Image as ImageIcon,
    Build as BuildIcon,
    History as HistoryIcon,
    FolderOpen as LoadIcon,
    Add as AddIcon,
    Flag as FlagIcon,
    CheckCircle as CheckIcon,
    Lock as LockIcon,
    Warning as WarningIcon,
    Delete as DeleteIcon,
    Autorenew as RegenerateIcon,
    AutoFixHigh as GenerateTemplateIcon,
    Tune as TuneIcon,
    Settings as SettingsIcon,
    Palette as PaletteIcon,
    Edit as EditIcon,
    CloudUpload as UploadIcon,
} from '@mui/icons-material';
import AdjustDialog from '../components/AdjustDialog';

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

    // Adjust dialog: { filename, chapterId, sceneIdx } or null when closed
    const [adjustTarget, setAdjustTarget] = useState<{ filename: string; chapterId: string; sceneIdx: number } | null>(null);

    const [quickTestOpen, setQuickTestOpen] = useState(false);
    const [quickTestScript, setQuickTestScript] = useState('');
    const [quickTestResult, setQuickTestResult] = useState<any>(null);
    const [quickTestRendering, setQuickTestRendering] = useState(false);

    const [templateCreatorOpen, setTemplateCreatorOpen] = useState(false);
    const [templateDescription, setTemplateDescription] = useState('');
    const [templateName, setTemplateName] = useState('');
    const [templateCategory, setTemplateCategory] = useState('generated');
    const [templateTheme, setTemplateTheme] = useState('CLEAN');
    const [templateGenerating, setTemplateGenerating] = useState(false);
    const [templateResult, setTemplateResult] = useState<any>(null);

    // Generation settings panel
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [expandedContent, setExpandedContent] = useState<Record<string, boolean>>({});
    const [genSettings, setGenSettings] = useState({
        templateRatio: 60,
        colorScheme: 'auto',
        customColors: { primary: '#FF6600', background: '#0A0A0A', accent: '#FFAA00' },
        templateVariety: 'high',
        maxTemplateReuse: 1,
        customPrompt: '',
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

    const handleQuickTestRender = async () => {
        if (!quickTestScript.trim()) {
            setError('Please enter a script segment');
            return;
        }

        setQuickTestRendering(true);
        setQuickTestResult(null);
        setError('');

        try {
            const res = await fetch('/api/quick-test-render', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ scriptSegment: quickTestScript.trim() })
            });
            const data = await res.json();

            if (data.success && data.scene) {
                setQuickTestResult(data.scene);
                setQuickTestOpen(false);
            } else {
                setError(data.error || 'Failed to analyze script segment');
            }
        } catch (err: any) {
            setError(`Quick test failed: ${err.message}`);
        } finally {
            setQuickTestRendering(false);
        }
    };

    const handleCreateTemplate = async () => {
        if (!templateDescription.trim()) {
            setError('Please enter a template description');
            return;
        }

        setTemplateGenerating(true);
        setTemplateResult(null);
        setError('');

        try {
            const res = await fetch('/api/templates/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    description: templateDescription.trim(),
                    suggestedName: templateName.trim() || undefined,
                    category: templateCategory,
                    theme: templateTheme
                })
            });
            const data = await res.json();

            if (data.success) {
                setTemplateResult(data);
            } else {
                setError(data.error || 'Failed to generate template');
            }
        } catch (err: any) {
            setError(`Template generation failed: ${err.message}`);
        } finally {
            setTemplateGenerating(false);
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
                templateVariety: 'high', maxTemplateReuse: 1, customPrompt: '',
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
                    scriptText: newChapterScript
                })
            });
            const data = await res.json();
            if (data.success) {
                setNewChapterTitle('');
                setNewChapterScript('');
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
                            environment: (scene as any).environment,
                            camera: (scene as any).camera,
                        })
                    });
                    
                    clearInterval(progressInterval);
                    const data = await res.json();
                    if (!data.success) throw new Error(data.error || 'Image generation failed');

                    const imageUrl = data.url; 
                    const prog: SceneProgress = { phase: 'processing', progress: 95, message: 'Image ready, creating motion...' };
                    setSceneProgress(p => ({ ...p, [sceneKey]: prog }));
                    if (onProgress) onProgress(prog);

                    // 2. Trigger a Video Render Job using the ImageHero template
                    const motion = (scene as any).motion || 'slow zoom in';
                    
                    const renderRes = await fetch(`/api/auto-scene/render-image-video`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            imageUrl: imageUrl,
                            motion: motion,
                            duration: scene.duration || 15,
                            projectId: proj.id,
                            chapterId: chapterId,
                            sceneIndex: sceneIndex
                        })
                    });
                    const renderData = await renderRes.json();
                    if (!renderData.success) throw new Error(renderData.error || 'Video rendering failed');

                    // 3. Use SSE for live progress of the video render
                    await new Promise<void>((resolveSSE) => {
                        const evtSrc = new EventSource(`/api/render-progress/${renderData.jobId}`);

                        evtSrc.onmessage = async (e) => {
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
                                    logs: newLogs.slice(-20) // keep last 20 logs
                                };
                                if (onProgress) onProgress(prog);
                                return { ...prev, [sceneKey]: prog };
                            });

                            if (job.status === 'completed' || job.status === 'fallback') {
                                evtSrc.close();
                                // Backend now persists the result automatically.
                                setSceneProgress(p => { const n = { ...p }; delete n[sceneKey]; return n; });
                                loadProjectDetails(proj.id);
                                resolveSSE();
                            } else if (job.status === 'error') {
                                evtSrc.close();
                                throw new Error(job.error || 'Render failed');
                            }
                        };

                        evtSrc.onerror = () => {
                            evtSrc.close();
                            // If SSE fails, polling fallback
                            setTimeout(async () => {
                                try {
                                    const checkRes = await fetch(`/api/job-status/${renderData.jobId}`);
                                    const job = await checkRes.json();
                                    if (job.status === 'completed' || job.status === 'fallback') {
                                        loadProjectDetails(proj.id);
                                    }
                                    resolveSSE();
                                } catch (e) { resolveSSE(); }
                            }, 5000);
                        };
                    });
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

                    // Use SSE for live progress
                    await new Promise<void>((resolveSSE) => {
                        const evtSrc = new EventSource(`/api/render-progress/${data.jobId}`);

                        evtSrc.onmessage = async (e) => {
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
                                    logs: newLogs.slice(-20) // keep last 20 logs
                                };
                                if (onProgress) onProgress(prog);
                                return { ...prev, [sceneKey]: prog };
                            });

                            if (job.status === 'completed') {
                                evtSrc.close();
                                await fetch(`/api/projects/${proj.id}/chapters/${chapterId}/scenes/${sceneIndex}`, {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ videoUrl: job.url, status: 'rendered' })
                                });
                                setSceneProgress(p => { const n = { ...p }; delete n[sceneKey]; return n; });
                                loadProjectDetails(proj.id);
                                resolveSSE();
                            } else if (job.status === 'fallback') {
                                evtSrc.close();
                                // Fallback to 3D image when Remotion render failed
                                await fetch(`/api/projects/${proj.id}/chapters/${chapterId}/scenes/${sceneIndex}`, {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        imageUrl: job.imageUrl,
                                        status: 'rendered',
                                        fallbackPrompt: job.fallbackPrompt,
                                        type: '3D_RENDER' // Mark as 3D render since we have an image
                                    })
                                });
                                setSceneProgress(p => { const n = { ...p }; delete n[sceneKey]; return n; });
                                loadProjectDetails(proj.id);
                                console.log(`   ✅ Fallback to 3D image for scene ${scene.globalIndex}`);
                                resolveSSE();
                            } else if (job.status === 'error') {
                                evtSrc.close();
                                throw new Error(job.error || 'Render failed');
                            }
                        };

                        evtSrc.onerror = () => {
                            evtSrc.close();
                            resolveSSE(); // resolve anyway, check job status next poll
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
                    <Grid size={{ xs: 12 }}>
                        <Paper sx={{ p: 2, bgcolor: 'var(--bg-secondary)', borderRadius: 2, border: '1px solid var(--accent-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Button
                                variant="contained"
                                onClick={() => setTemplateCreatorOpen(true)}
                                sx={{ bgcolor: 'var(--accent-gold)', color: '#000', py: 1.5, px: 3 }}
                            >
                                🎨 Create Template
                            </Button>
                        </Paper>
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                        <Paper sx={{ p: 2, bgcolor: 'var(--bg-secondary)', borderRadius: 2, border: '1px solid var(--accent-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Button
                                variant="contained"
                                onClick={() => setQuickTestOpen(true)}
                                sx={{ bgcolor: 'var(--accent-gold)', color: '#000', '&:hover': { bgcolor: '#fff' }, py: 1.5, px: 3 }}
                            >
                                🧪 Quick Test Render
                            </Button>
                        </Paper>
                    </Grid>
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
                                    sx={{ mb: 2 }}
                                />
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
                                                        scene.flag === 'needs-fix' ? '#ff3b30' :
                                                        scene.flag === 'needs-review' ? '#ffcc00' :
                                                        scene.flag === 'approved' ? '#34c759' :
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
                                                                </Box>
                                                                <Typography variant="body1" sx={{ color: '#fff', fontStyle: 'italic', mb: 2, pl: 2, borderLeft: '2px solid rgba(255,255,255,0.2)' }}>
                                                                    "{scene.script}"
                                                                </Typography>

                                                                {!isLocked && (
                                                                    <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                                                                        <Button
                                                                            size="small"
                                                                            variant="contained"
                                                                            startIcon={<RenderIcon />}
                                                                            onClick={() => renderScene(chapter.id, idx)}
                                                                            disabled={scene.renderStatus === 'rendering'}
                                                                            sx={{ bgcolor: 'var(--accent-gold)', color: '#000' }}
                                                                        >
                                                                            {scene.renderStatus === 'rendering' ? 'Rendering...' : (scene.status === 'rendered' ? 'Re-Render' : 'Render')}
                                                                        </Button>

                                                                        <Tooltip title="Mark as Needs Fix">
                                                                            <IconButton size="small" onClick={() => handleFlagScene(chapter.id, idx, 'needs-fix')} color={scene.flag === 'needs-fix' ? 'error' : 'default'}>
                                                                                <WarningIcon />
                                                                            </IconButton>
                                                                        </Tooltip>
                                                                        <Tooltip title="Mark as Needs Review">
                                                                            <IconButton size="small" onClick={() => handleFlagScene(chapter.id, idx, 'needs-review')} color={scene.flag === 'needs-review' ? 'warning' : 'default'}>
                                                                                <FlagIcon />
                                                                            </IconButton>
                                                                        </Tooltip>
                                                                        <Tooltip title="Mark as Approved">
                                                                            <IconButton size="small" onClick={() => handleFlagScene(chapter.id, idx, 'approved')} color={scene.flag === 'approved' ? 'success' : 'default'}>
                                                                                <CheckIcon />
                                                                            </IconButton>
                                                                        </Tooltip>
                                                                        <Tooltip title="Clear Status Flag">
                                                                            <IconButton size="small" onClick={() => handleFlagScene(chapter.id, idx, null)}>
                                                                                <RefreshIcon />
                                                                            </IconButton>
                                                                        </Tooltip>

                                                                        {/* Adjust template — only for TEMPLATE scenes with an assigned template */}
                                                                        {scene.type === 'TEMPLATE' && scene.template && (
                                                                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                                                                <Tooltip title="Edit content fields">
                                                                                    <Button
                                                                                        size="small"
                                                                                        variant="outlined"
                                                                                        startIcon={<EditIcon sx={{ fontSize: '13px !important' }} />}
                                                                                        onClick={() => setExpandedContent(prev => ({ ...prev, [sceneKey]: !prev[sceneKey] }))}
                                                                                        sx={{
                                                                                            fontSize: '0.7rem', py: 0.4, px: 1,
                                                                                            borderColor: 'var(--accent-gold)', color: 'var(--accent-gold)',
                                                                                            '&:hover': { bgcolor: 'rgba(201,169,97,0.08)', borderColor: 'var(--accent-gold)' },
                                                                                        }}
                                                                                    >
                                                                                        {expandedContent[sceneKey] ? 'Hide Content' : 'Edit Content'}
                                                                                    </Button>
                                                                                </Tooltip>
                                                                                <Tooltip title="Adjust template with presets">
                                                                                    <Button
                                                                                        size="small"
                                                                                        variant="outlined"
                                                                                        startIcon={<TuneIcon sx={{ fontSize: '13px !important' }} />}
                                                                                        onClick={() => setAdjustTarget({
                                                                                            filename: scene.template + '.tsx',
                                                                                            chapterId: chapter.id,
                                                                                            sceneIdx: idx,
                                                                                        })}
                                                                                        sx={{
                                                                                            fontSize: '0.7rem', py: 0.4, px: 1,
                                                                                            borderColor: '#4fc3f744', color: '#4fc3f7',
                                                                                            '&:hover': { bgcolor: 'rgba(79,195,247,0.08)', borderColor: '#4fc3f7' },
                                                                                        }}
                                                                                    >
                                                                                        Adjust
                                                                                    </Button>
                                                                                </Tooltip>
                                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 1, border: '1px solid rgba(255,255,255,0.1)', borderRadius: 1, p: '2px 8px' }}>
                                                                                    <Typography variant="caption" sx={{ color: 'var(--text-secondary)', fontSize: '0.65rem' }}>BG:</Typography>
                                                                                    <input
                                                                                        type="color"
                                                                                        value={scene.content?.BACKGROUND_OVERRIDE || '#000000'}
                                                                                        onChange={(e) => handleUpdateSceneContent(chapter.id, idx, 'BACKGROUND_OVERRIDE', e.target.value)}
                                                                                        style={{ width: '20px', height: '20px', padding: 0, border: 'none', background: 'none', cursor: 'pointer' }}
                                                                                    />
                                                                                </Box>
                                                                            </Box>
                                                                        )}
                                                                    </Box>
                                                                )}

                                                                {/* Content Editor Panel */}
                                                                <Collapse in={expandedContent[sceneKey]}>
                                                                    <Paper sx={{ mt: 2, p: 2, bgcolor: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                                        <Typography variant="caption" sx={{ color: 'var(--accent-gold)', fontWeight: 800, mb: 2, display: 'block', letterSpacing: 1 }}>CONTENT FIELDS</Typography>
                                                                        <Grid container spacing={2}>
                                                                            {Object.entries(scene.content || {}).map(([field, value]) => {
                                                                                if (field === 'BACKGROUND_OVERRIDE') return null;
                                                                                const isImage = ['IMAGE_URL', 'PROFILE_IMAGE', 'SUBJECT_IMAGE_URL', 'AVATAR_URL'].includes(field.toUpperCase()) || field.toUpperCase().endsWith('_IMAGE');
                                                                                
                                                                                return (
                                                                                    <Grid size={{ xs: 12, sm: 6 }} key={field}>
                                                                                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
                                                                                            <TextField
                                                                                                fullWidth
                                                                                                size="small"
                                                                                                label={field.replace(/_/g, ' ')}
                                                                                                value={value}
                                                                                                onChange={(e) => handleUpdateSceneContent(chapter.id, idx, field, e.target.value)}
                                                                                                InputProps={{ sx: { fontSize: '0.8rem', color: '#fff' } }}
                                                                                                InputLabelProps={{ sx: { fontSize: '0.75rem' } }}
                                                                                            />
                                                                                            {isImage && (
                                                                                                <Box>
                                                                                                    <input
                                                                                                        type="file"
                                                                                                        accept="image/*"
                                                                                                        id={`upload-${sceneKey}-${field}`}
                                                                                                        style={{ display: 'none' }}
                                                                                                        onChange={(e) => {
                                                                                                            const file = e.target.files?.[0];
                                                                                                            if (file) handleImageUpload(chapter.id, idx, field, file);
                                                                                                        }}
                                                                                                    />
                                                                                                    <label htmlFor={`upload-${sceneKey}-${field}`}>
                                                                                                        <IconButton component="span" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.05)', color: 'var(--accent-gold)' }}>
                                                                                                            <UploadIcon fontSize="small" />
                                                                                                        </IconButton>
                                                                                                    </label>
                                                                                                </Box>
                                                                                            )}
                                                                                        </Box>
                                                                                    </Grid>
                                                                                );
                                                                            })}
                                                                        </Grid>
                                                                    </Paper>
                                                                </Collapse>

                                                                {/* Generate Template button — shown when TEMPLATE scene has no code or has an error */}
                                                                {!isLocked && scene.type === 'TEMPLATE' && (!scene.code || scene.renderStatus === 'error') && (
                                                                    <Box sx={{ mt: 1 }}>
                                                                        <Button
                                                                            size="small"
                                                                            variant="outlined"
                                                                            startIcon={<GenerateTemplateIcon />}
                                                                            onClick={() => handleGenerateTemplate(chapter.id, idx)}
                                                                            disabled={scene.renderStatus === 'rendering'}
                                                                            sx={{ borderColor: '#7b5ea7', color: '#b39ddb', '&:hover': { borderColor: '#b39ddb', bgcolor: 'rgba(123,94,167,0.1)' } }}
                                                                        >
                                                                            {scene.renderStatus === 'rendering' ? 'Generating...' : 'Generate Template'}
                                                                        </Button>
                                                                        <Typography variant="caption" sx={{ display: 'block', color: 'var(--text-secondary)', mt: 0.5 }}>
                                                                            {scene.template ? `Template "${scene.template}" not found — click to create it` : 'No template assigned — click to generate one'}
                                                                        </Typography>
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
                                                                    
                                                                    if (isRendering) {
                                                                        return (
                                                                            <Box sx={{ width: '100%', height: 150, bgcolor: '#000', borderRadius: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 2 }}>
                                                                                <CircularProgress size={24} sx={{ color: 'var(--accent-gold)', mb: 2 }} />
                                                                                <Typography variant="caption" sx={{ color: '#fff', textAlign: 'center', fontSize: '0.7rem' }}>{progress.message || 'Processing...'}</Typography>
                                                                                <LinearProgress variant="determinate" value={progress.progress} sx={{ width: '80%', mt: 1.5, height: 4, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.1)', '& .MuiLinearProgress-bar': { bgcolor: 'var(--accent-gold)' } }} />
                                                                                <Typography variant="caption" sx={{ color: 'var(--text-secondary)', mt: 0.5, fontSize: '0.6rem' }}>{Math.round(progress.progress)}%</Typography>
                                                                            </Box>
                                                                        );
                                                                    }

                                                                    if (scene.videoUrl) {
                                                                        return (
                                                                            <Box sx={{ position: 'relative' }}>
                                                                                <video src={scene.videoUrl} controls style={{ width: '100%', borderRadius: '8px', maxHeight: '150px', background: '#000' }} />
                                                                            </Box>
                                                                        );
                                                                    }

                                                                    if (scene.imageUrl) {
                                                                        return (
                                                                            <Box sx={{ position: 'relative' }}>
                                                                                <img src={scene.imageUrl} alt="Scene preview" style={{ width: '100%', borderRadius: '8px', maxHeight: '150px', objectFit: 'contain', background: '#000' }} />
                                                                                {scene.fallbackPrompt && (
                                                                                    <Chip
                                                                                        label="FALLBACK"
                                                                                        size="small"
                                                                                        sx={{
                                                                                            position: 'absolute',
                                                                                            top: 4,
                                                                                            right: 4,
                                                                                            bgcolor: 'rgba(255, 107, 107, 0.9)',
                                                                                            color: '#fff',
                                                                                            fontSize: '0.65rem',
                                                                                            fontWeight: 'bold',
                                                                                            height: 20,
                                                                                        }}
                                                                                    />
                                                                                )}
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

            {/* Adjust Template Dialog */}
            {adjustTarget && (
                <AdjustDialog
                    filename={adjustTarget.filename}
                    open={!!adjustTarget}
                    onClose={() => setAdjustTarget(null)}
                    onApplied={async (_filename) => {
                        // After saving the adjusted template, re-generate scene code from the
                        // updated .tsx file, then re-render so the change is visible immediately.
                        const { chapterId, sceneIdx } = adjustTarget;
                        setAdjustTarget(null);
                        if (!selectedProject) return;
                        try {
                            await fetch(
                                `/api/projects/${selectedProject.id}/chapters/${chapterId}/scenes/${sceneIdx}/generate-template`,
                                { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) }
                            );
                            await loadProjectDetails(selectedProject.id);
                            renderScene(chapterId, sceneIdx);
                        } catch {
                            // Silently ignore — user can manually re-render if the auto trigger fails
                        }
                    }}
                />
            )}

            {/* Template Creator Dialog */}
            <Dialog
                open={templateCreatorOpen}
                onClose={() => setTemplateCreatorOpen(false)}
                PaperProps={{ sx: { bgcolor: 'var(--bg-secondary)', color: '#fff', border: '1px solid var(--border-color)', borderRadius: 2 } }}
                maxWidth="md"
            >
                <DialogTitle sx={{ color: 'var(--accent-gold)' }}>
                    🎨 Create New Template
                </DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        multiline
                        rows={4}
                        label="Describe the template you want to create..."
                        value={templateDescription}
                        onChange={(e) => setTemplateDescription(e.target.value)}
                        sx={{ mb: 2, '& .MuiInputBase-input': { color: '#fff' } }}
                        disabled={templateGenerating}
                        helperText="E.g., 'Animated stat cluster with 3 boxes that reveals each stat with a scale animation from 0 to 1'"
                    />

                    <TextField
                        fullWidth
                        label="Template name (optional)"
                        value={templateName}
                        onChange={(e) => setTemplateName(e.target.value)}
                        sx={{ mb: 2, '& .MuiInputBase-input': { color: '#fff' } }}
                        disabled={templateGenerating}
                        placeholder="Leave blank for auto-generated name"
                    />

                    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                        <TextField
                            select
                            label="Category"
                            value={templateCategory}
                            onChange={(e) => setTemplateCategory(e.target.value)}
                            sx={{ flex: 1, '& .MuiInputBase-input': { color: '#fff' } }}
                            disabled={templateGenerating}
                        >
                            <MenuItem value="generated">Generated</MenuItem>
                            <MenuItem value="stats">Stats</MenuItem>
                            <MenuItem value="timeline">Timeline</MenuItem>
                            <MenuItem value="network">Network</MenuItem>
                            <MenuItem value="map">Map</MenuItem>
                            <MenuItem value="chart">Chart</MenuItem>
                            <MenuItem value="chapter">Chapter</MenuItem>
                            <MenuItem value="transition">Transition</MenuItem>
                        </TextField>

                        <TextField
                            select
                            label="Theme"
                            value={templateTheme}
                            onChange={(e) => setTemplateTheme(e.target.value)}
                            sx={{ flex: 1, '& .MuiInputBase-input': { color: '#fff' } }}
                            disabled={templateGenerating}
                        >
                            <MenuItem value="CLEAN">Clean</MenuItem>
                            <MenuItem value="CREAM">Cream</MenuItem>
                            <MenuItem value="DARK">Dark</MenuItem>
                            <MenuItem value="TECHNICAL">Technical</MenuItem>
                            <MenuItem value="THREAT">Threat</MenuItem>
                            <MenuItem value="INTEL">Intel</MenuItem>
                            <MenuItem value="COLD">Cold</MenuItem>
                        </TextField>
                    </Box>

                    {templateGenerating && (
                        <Box sx={{ display: 'flex', alignItems: 'center', py: 2 }}>
                            <CircularProgress size={24} sx={{ color: 'var(--accent-gold)', mr: 2 }} />
                            <Typography sx={{ color: 'var(--text-secondary)' }}>Generating template...</Typography>
                        </Box>
                    )}

                    {templateResult && !templateGenerating && (
                        <Box>
                            <Typography variant="h6" sx={{ color: 'var(--accent-gold)', mb: 2 }}>
                                ✅ Template Created: {templateResult.template}
                            </Typography>

                            <Paper sx={{ p: 2, mt: 2, bgcolor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                                <Typography variant="caption" sx={{ color: 'var(--text-muted)', mb: 1 }}>
                                    <strong>Category:</strong> {templateResult.category}
                                </Typography>
                                <Typography variant="caption" sx={{ color: 'var(--text-muted)', mb: 1 }}>
                                    <strong>Theme:</strong> {templateResult.theme}
                                </Typography>
                                {templateResult.description && (
                                    <Typography variant="caption" sx={{ color: 'var(--text-muted)', mb: 1 }}>
                                        <strong>Description:</strong> {templateResult.description}
                                    </Typography>
                                )}
                                <Typography variant="caption" sx={{ color: 'var(--text-muted)', mb: 1 }}>
                                    <strong>Fields:</strong> {Object.keys(templateResult.fields || {}).join(', ')}
                                </Typography>
                            </Paper>

                            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                                <Button
                                    variant="outlined"
                                    onClick={() => setTemplateCreatorOpen(false)}
                                    sx={{ flex: 1, color: '#fff', borderColor: 'var(--border-color)' }}
                                >
                                    Close
                                </Button>
                                <Button
                                    variant="contained"
                                    onClick={() => {
                                        if (templateResult && templateResult.schema) {
                                            // Copy schema to clipboard for easy reference
                                            const schemaJson = JSON.stringify(templateResult.schema, null, 2);
                                            navigator.clipboard.writeText(schemaJson);
                                        }
                                    }}
                                    sx={{ flex: 2, bgcolor: 'var(--accent-gold)', color: '#000' }}
                                    disabled={!templateResult}
                                >
                                    📋 Copy Schema
                                </Button>
                            </Box>
                        </Box>
                    )}
                </DialogContent>
            </Dialog>

            {/* Quick Test Render Dialog */}
            <Dialog
                open={quickTestOpen}
                onClose={() => setQuickTestOpen(false)}
                PaperProps={{ sx: { bgcolor: 'var(--bg-secondary)', color: '#fff', border: '1px solid var(--border-color)', borderRadius: 2 } }}
                maxWidth="md"
            >
                <DialogTitle sx={{ color: 'var(--accent-gold)' }}>
                    🧪 Quick Test Render
                </DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        multiline
                        rows={6}
                        label="Paste script segment to test..."
                        value={quickTestScript}
                        onChange={(e) => setQuickTestScript(e.target.value)}
                        sx={{ mb: 2, '& .MuiInputBase-input': { color: '#fff' } }}
                        disabled={quickTestRendering}
                    />

                    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                        <Button
                            variant="contained"
                            onClick={handleQuickTestRender}
                            disabled={!quickTestScript.trim() || quickTestRendering}
                            sx={{ flex: 1, bgcolor: 'var(--accent-gold)', color: '#000' }}
                        >
                            🧪 Analyze
                        </Button>
                    </Box>

                    {quickTestRendering && (
                        <Box sx={{ display: 'flex', alignItems: 'center', py: 2 }}>
                            <CircularProgress size={24} sx={{ color: 'var(--accent-gold)', mr: 2 }} />
                            <Typography sx={{ color: 'var(--text-secondary)' }}>Analyzing...</Typography>
                        </Box>
                    )}

                    {quickTestResult && !quickTestRendering && (
                        <Box>
                            <Typography variant="h6" sx={{ color: 'var(--accent-gold)', mb: 2 }}>
                                ✅ Best Template: {quickTestResult.template}
                            </Typography>
                            <Typography variant="subtitle1" sx={{ color: 'var(--text-secondary)', mb: 2 }}>
                                Scene: {quickTestResult.script.substring(0, 100)}
                            </Typography>

                            <Paper sx={{ p: 2, mt: 2, bgcolor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                                <Typography variant="caption" sx={{ color: 'var(--text-muted)', mb: 1 }}>
                                    <strong>Theme:</strong> {quickTestResult.theme}
                                </Typography>
                                {quickTestResult.reasoning && (
                                    <Typography variant="caption" sx={{ color: 'var(--text-muted)', mb: 1 }}>
                                        <strong>Reasoning:</strong> {quickTestResult.reasoning}
                                    </Typography>
                                )}
                            </Paper>

                            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                                <Button
                                    variant="outlined"
                                    onClick={() => setQuickTestOpen(false)}
                                    sx={{ flex: 1, color: '#fff', borderColor: 'var(--border-color)' }}
                                >
                                    Close
                                </Button>
                                {quickTestResult.template && (
                                    <Button
                                        variant="contained"
                                        onClick={() => {
                                            if (selectedProject) {
                                                const chapter = selectedProject.chapters[0];
                                                const sceneIdx = chapter.scenes.length;
                                                renderScene(chapter.id, sceneIdx);
                                                setQuickTestOpen(false);
                                            } else {
                                                setError('Please create or select a project first');
                                            }
                                        }}
                                        sx={{ flex: 2, bgcolor: 'var(--accent-gold)', color: '#000' }}
                                    >
                                        🎬 Render This Template
                                    </Button>
                                )}
                            </Box>
                        </Box>
                    )}
                </DialogContent>
            </Dialog>

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

