import React, { useState, useEffect, useRef } from 'react';
import {
    Box, Typography, TextField, Button, Card, CardContent, Chip, LinearProgress,
    IconButton, Tooltip, Accordion, AccordionSummary, AccordionDetails, Alert, Divider,
    List, ListItem, ListItemText, ListItemButton, Paper, Grid,
    Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions
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
} from '@mui/icons-material';
import AdjustDialog from '../components/AdjustDialog';

interface Scene {
    index: number;
    globalIndex: number;
    type: 'TEMPLATE' | '3D_RENDER';
    script: string;
    template?: string;
    theme?: string;
    reasoning?: string;
    content?: Record<string, string>;
    code?: string;
    duration?: number;
    status: 'pending' | 'rendered' | 'locked';
    flag: 'needs-fix' | 'needs-review' | 'approved' | null;
    videoUrl?: string;
    imageUrl?: string;
    error?: string;
    renderStatus?: 'idle' | 'rendering' | 'completed' | 'error';
}

interface Chapter {
    id: string;
    title: string;
    status: string;
    sceneOffset: number;
    scenes: Scene[];
}

interface Project {
    id: string;
    name: string;
    description: string;
    status: string;
    chapters: Chapter[];
    totalScenes: number;
}

interface SceneProgress {
    phase: string;
    progress: number;
    message: string;
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
    rendering: 'RENDERING FRAMES',
    code_ready: 'CODE READY',
    cooldown: 'COOLING DOWN',
    processing: 'PROCESSING',
    generating: 'GENERATING IMAGE',
};

const ProjectDirectorView: React.FC = () => {
    const [projects, setProjects] = useState<any[]>([]);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [activeChapterId, setActiveChapterId] = useState<string | null>(null);
    const [newProjectName, setNewProjectName] = useState('');
    const [newChapterTitle, setNewChapterTitle] = useState('');
    const [newChapterScript, setNewChapterScript] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [batchState, setBatchState] = useState<BatchState | null>(null);
    const [sceneProgress, setSceneProgress] = useState<Record<string, SceneProgress>>({});

    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogTitle, setDialogTitle] = useState('');
    const [dialogMessage, setDialogMessage] = useState('');
    const [dialogAction, setDialogAction] = useState<(() => void) | null>(null);
    const [dialogCancelText, setDialogCancelText] = useState('Cancel');
    const [dialogConfirmText, setDialogConfirmText] = useState('Confirm');

    // Adjust dialog: { filename, chapterId, sceneIdx } or null when closed
    const [adjustTarget, setAdjustTarget] = useState<{ filename: string; chapterId: string; sceneIdx: number } | null>(null);

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

    const handleDialogConfirm = () => {
        if (dialogAction) dialogAction();
        setDialogOpen(false);
    };

    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = async () => {
        try {
            const res = await fetch('/api/projects');
            const data = await res.json();
            if (data.success) {
                setProjects(data.projects);
            }
        } catch (err) {
            console.error('Failed to load projects:', err);
        }
    };

    const handleCreateProject = async () => {
        if (!newProjectName.trim()) return;
        setLoading(true);
        try {
            const res = await fetch('/api/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newProjectName })
            });
            const data = await res.json();
            if (data.success) {
                setNewProjectName('');
                loadProjects();
                loadProjectDetails(data.project.id);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const loadProjectDetails = async (id: string) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/projects/${id}`);
            const data = await res.json();
            if (data.success) {
                setSelectedProject(data.project);
                if (data.project.chapters.length > 0) {
                    setActiveChapterId(data.project.chapters[0].id);
                } else {
                    setActiveChapterId(null);
                }
            }
        } catch (err) {
            console.error(err);
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
        const is3DRender = scene.type === '3D_RENDER' && (scene as any).prompt;

        if (!isTemplate && !is3DRender) return Promise.resolve();

        const sceneKey = `${chapterId}-${sceneIndex}`;
        setSceneRenderStatus(chapterId, sceneIndex, 'rendering');

        return new Promise<void>(async (resolve) => {
            try {
                if (is3DRender) {
                    const prog: SceneProgress = { phase: 'generating', progress: 0, message: 'Generating image...' };
                    setSceneProgress(p => ({ ...p, [sceneKey]: prog }));
                    if (onProgress) onProgress(prog);

                    const res = await fetch('/api/auto-scene/render-3d', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            prompt: (scene as any).prompt,
                            environment: (scene as any).environment,
                            camera: (scene as any).camera,
                        })
                    });
                    const data = await res.json();
                    if (!data.success) throw new Error(data.error || 'Image generation failed');

                    await fetch(`/api/projects/${proj.id}/chapters/${chapterId}/scenes/${sceneIndex}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ imageUrl: data.url, status: 'rendered' })
                    });
                    setSceneProgress(p => { const n = { ...p }; delete n[sceneKey]; return n; });
                    loadProjectDetails(proj.id);
                    resolve();

                } else if (isTemplate) {
                    const res = await fetch('/api/manual-render-job', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            code: scene.code,
                            duration: scene.duration || 8,
                            fps: 30,
                            width: 1920,
                            height: 1080
                        })
                    });
                    const data = await res.json();
                    if (!data.success) throw new Error(data.error);

                    // Use SSE for live progress
                    await new Promise<void>((resolveSSE) => {
                        const evtSrc = new EventSource(`/api/render-progress/${data.jobId}`);

                        evtSrc.onmessage = async (e) => {
                            const job = JSON.parse(e.data);
                            const prog: SceneProgress = {
                                phase: job.phase || job.status || 'processing',
                                progress: job.progress || 0,
                                message: job.message || ''
                            };
                            setSceneProgress(p => ({ ...p, [sceneKey]: prog }));
                            if (onProgress) onProgress(prog);

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

    const handleRenderAllScenes = async (chapterId: string) => {
        if (!selectedProject) return;
        const chapter = selectedProject.chapters.find(c => c.id === chapterId);
        if (!chapter) return;

        const scenesToRender = chapter.scenes
            .map((scene, idx) => ({ scene, idx }))
            .filter(({ scene }) =>
                ((scene.code && scene.type === 'TEMPLATE') || ((scene as any).prompt && scene.type === '3D_RENDER'))
                && scene.status !== 'rendered'
                && scene.renderStatus !== 'rendering'
            );

        if (scenesToRender.length === 0) {
            confirmAction('No Pending Scenes', 'No pending scenes to render in this chapter.', () => {}, true);
            return;
        }

        confirmAction(
            'Render All Scenes',
            `Start rendering ${scenesToRender.length} scenes one by one?`,
            async () => {
                for (let i = 0; i < scenesToRender.length; i++) {
                    const { scene, idx } = scenesToRender[i];
                    const sceneLabel = `Scene ${scene.globalIndex}${scene.script ? ': ' + scene.script.slice(0, 50) + (scene.script.length > 50 ? '…' : '') : ''}`;

                    setBatchState({
                        active: true,
                        current: i + 1,
                        total: scenesToRender.length,
                        sceneLabel,
                        phase: 'starting',
                        progress: 0,
                        message: 'Starting...'
                    });

                    await renderScene(chapterId, idx, (prog) => {
                        setBatchState(prev => prev ? { ...prev, phase: prog.phase, progress: prog.progress, message: prog.message } : prev);
                    });
                }
                setBatchState(null);
            }
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

    const handleExportProject = () => {
        if (!selectedProject) return;
        window.open(`/api/projects/${selectedProject.id}/export`, '_blank');
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
                    <Grid item xs={12} md={8}>
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
                                startIcon={<DownloadIcon />}
                                onClick={handleExportProject}
                                disabled={selectedProject.totalScenes === 0}
                                sx={{ bgcolor: 'var(--accent-gold)', color: '#000', '&:hover': { bgcolor: '#fff' } }}
                            >
                                Export Full Project ZIP
                            </Button>
                            <Tooltip title="Delete Project">
                                <IconButton color="error" onClick={() => handleDeleteProject(selectedProject.id)} sx={{ border: '1px solid rgba(255,59,48,0.5)' }}>
                                    <DeleteIcon />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    </Paper>

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
                                                    <Typography variant="caption" sx={{ color: 'var(--text-secondary)' }}>
                                                        {PHASE_LABELS[batchState.phase] || batchState.phase.toUpperCase()}
                                                        {batchState.progress > 0 ? ` — ${batchState.progress}%` : ''}
                                                    </Typography>
                                                </Box>
                                                <Typography variant="body2" sx={{ color: '#fff', mb: 1.5, fontSize: '0.85rem' }}>
                                                    {batchState.sceneLabel}
                                                </Typography>
                                                {batchState.message && (
                                                    <Typography variant="caption" sx={{ color: 'var(--text-secondary)', display: 'block', mb: 1 }}>
                                                        {batchState.message}
                                                    </Typography>
                                                )}
                                                {/* Outer: overall batch progress */}
                                                <LinearProgress
                                                    variant="determinate"
                                                    value={((batchState.current - 1) / batchState.total) * 100 + (batchState.progress / batchState.total)}
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

                                        {chapter.scenes.map((scene, idx) => {
                                            const sceneKey = `${chapter.id}-${idx}`;
                                            const prog = sceneProgress[sceneKey];

                                            return (
                                                <Card key={idx} sx={{ mb: 2, bgcolor: 'var(--bg-secondary)', border: scene.renderStatus === 'rendering' ? '1px solid var(--accent-gold)' : '1px solid var(--border-color)', position: 'relative', transition: 'border-color 0.3s' }}>
                                                    <Box sx={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', bgcolor:
                                                        scene.flag === 'needs-fix' ? '#ff3b30' :
                                                        scene.flag === 'needs-review' ? '#ffcc00' :
                                                        scene.flag === 'approved' ? '#34c759' :
                                                        (scene.status === 'rendered' ? 'var(--accent-gold)' : 'transparent')
                                                    }} />

                                                    {/* Per-scene render progress bar */}
                                                    {scene.renderStatus === 'rendering' && (
                                                        <Box sx={{ px: 3, pt: 1.5 }}>
                                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                                                <Typography variant="caption" sx={{ color: 'var(--accent-gold)', fontWeight: 'bold', letterSpacing: 0.5 }}>
                                                                    {prog ? (PHASE_LABELS[prog.phase] || prog.phase.toUpperCase()) : 'STARTING...'}
                                                                </Typography>
                                                                {prog && prog.progress > 0 && (
                                                                    <Typography variant="caption" sx={{ color: 'var(--text-secondary)' }}>
                                                                        {prog.progress}%
                                                                    </Typography>
                                                                )}
                                                            </Box>
                                                            {prog?.message && (
                                                                <Typography variant="caption" sx={{ color: 'var(--text-secondary)', display: 'block', mb: 0.5, fontSize: '0.7rem' }}>
                                                                    {prog.message}
                                                                </Typography>
                                                            )}
                                                            <LinearProgress
                                                                variant={prog && prog.progress > 0 ? 'determinate' : 'indeterminate'}
                                                                value={prog?.progress || 0}
                                                                sx={{
                                                                    height: 4, borderRadius: 2, mb: 1,
                                                                    bgcolor: 'rgba(255,255,255,0.08)',
                                                                    '& .MuiLinearProgress-bar': { bgcolor: 'var(--accent-gold)', borderRadius: 2 }
                                                                }}
                                                            />
                                                        </Box>
                                                    )}

                                                    <CardContent sx={{ pl: 3 }}>
                                                        <Grid container spacing={2}>
                                                            <Grid size={{ xs: 12, md: 8 }}>
                                                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                                    <Chip size="small" label={`Scene ${scene.globalIndex}`} sx={{ mr: 2, bgcolor: 'rgba(255,255,255,0.1)' }} />
                                                                    <Chip size="small" label={scene.type} sx={{ mr: 2, bgcolor: 'rgba(201, 169, 97, 0.2)', color: 'var(--accent-gold)' }} />
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
                                                                        )}
                                                                    </Box>
                                                                )}

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
                                                                    <Alert severity="error" sx={{ mt: 2 }} size="small">{scene.error}</Alert>
                                                                )}
                                                            </Grid>

                                                            {/* Media Preview */}
                                                            <Grid size={{ xs: 12, md: 4 }} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                {scene.videoUrl ? (
                                                                    <video src={scene.videoUrl} controls style={{ width: '100%', borderRadius: '8px', maxHeight: '150px', background: '#000' }} />
                                                                ) : scene.imageUrl ? (
                                                                    <img src={scene.imageUrl} alt="Scene preview" style={{ width: '100%', borderRadius: '8px', maxHeight: '150px', objectFit: 'contain', background: '#000' }} />
                                                                ) : (
                                                                    <Box sx={{ width: '100%', height: '120px', bgcolor: 'rgba(0,0,0,0.5)', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                        <Typography variant="caption" sx={{ color: 'var(--text-secondary)' }}>No media yet</Typography>
                                                                    </Box>
                                                                )}
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
