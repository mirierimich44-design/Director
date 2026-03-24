import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Box, Typography, Tabs, Tab, Grid, Card, CardContent, CardActions,
    Button, Chip, TextField, CircularProgress, Alert, Snackbar,
    CardMedia, Stack, IconButton, Dialog, DialogTitle, DialogContent,
    DialogActions, LinearProgress,
} from '@mui/material';
import {
    BarChart as BarChartIcon,
    AutoStories as StoryIcon,
    TextFields as TextIcon,
    Dashboard as LayoutIcon,
    Security as SecurityIcon,
    TrendingUp as FinanceIcon,
    AutoFixHigh as GenerateIcon,
    CheckCircle as DoneIcon,
    BrokenImage as ImageIcon,
    Tune as EditIcon,
    Videocam as VideoIcon,
    Refresh as RefreshIcon,
} from '@mui/icons-material';

// ── Types ─────────────────────────────────────────────────────────────────────
interface AnimationType {
    id: string;
    name: string;
    desc: string;
    suggestedName: string;
    tags: string[];
    categoryId: string;
    categoryLabel: string;
}

interface CategoryDef {
    label: string;
    icon: string;
    types: AnimationType[];
}

interface Catalog {
    [catId: string]: CategoryDef;
}

interface GeneratedResult {
    template: string;
    name: string;
    description: string;
    category: string;
    fields: Record<string, string>;
    screenshotUrl: string | null;
    videoJobId?: string;
    videoUrl?: string;
    videoStatus?: 'rendering' | 'done' | 'error';
    videoProgress?: number;
}

// ── Category icon map ─────────────────────────────────────────────────────────
const CATEGORY_ICONS: Record<string, React.ReactElement> = {
    'data-charts':   <BarChartIcon />,
    'storytelling':  <StoryIcon />,
    'text-reveal':   <TextIcon />,
    'layout':        <LayoutIcon />,
    'security':      <SecurityIcon />,
    'finance':       <FinanceIcon />,
};

const CATEGORY_COLORS: Record<string, string> = {
    'data-charts':   '#4fc3f7',
    'storytelling':  '#ce93d8',
    'text-reveal':   '#80cbc4',
    'layout':        '#ffcc80',
    'security':      '#ef9a9a',
    'finance':       '#a5d6a7',
};

const COLOR_FIELDS = new Set([
    'BACKGROUND_COLOR', 'PRIMARY_COLOR', 'SECONDARY_COLOR', 'ACCENT_COLOR',
    'SUPPORT_COLOR', 'TEXT_ON_PRIMARY', 'TEXT_ON_SECONDARY',
]);

// ── Edit Fields Dialog ────────────────────────────────────────────────────────
interface EditDialogProps {
    open: boolean;
    onClose: () => void;
    generated: GeneratedResult;
    catColor: string;
    onVideoUpdate: (url: string) => void;
}

const EditFieldsDialog: React.FC<EditDialogProps> = ({ open, onClose, generated, catColor, onVideoUpdate }) => {
    const contentFields = Object.entries(generated.fields).filter(([k]) => !COLOR_FIELDS.has(k));

    const [fieldValues, setFieldValues] = useState<Record<string, string>>(() => {
        const init: Record<string, string> = {};
        contentFields.forEach(([k]) => { init[k] = ''; });
        return init;
    });
    const [renderStatus, setRenderStatus] = useState<'idle' | 'rendering' | 'done' | 'error'>('idle');
    const [renderProgress, setRenderProgress] = useState(0);
    const [currentVideoUrl, setCurrentVideoUrl] = useState<string | null>(generated.videoUrl || null);
    const [renderError, setRenderError] = useState<string | null>(null);
    const esRef = useRef<EventSource | null>(null);

    // Sync video URL when it becomes available after dialog opens
    useEffect(() => {
        if (generated.videoUrl && !currentVideoUrl) {
            setCurrentVideoUrl(generated.videoUrl);
        }
    }, [generated.videoUrl]);

    // If the auto-render is still in progress when dialog opens, show its progress
    useEffect(() => {
        if (!open) return;
        if (generated.videoStatus === 'rendering' && generated.videoJobId && !currentVideoUrl) {
            setRenderStatus('rendering');
            setRenderProgress(generated.videoProgress || 0);
        }
    }, [open]);

    useEffect(() => {
        return () => { esRef.current?.close(); };
    }, []);

    const handleRender = async () => {
        esRef.current?.close();
        setRenderStatus('rendering');
        setRenderProgress(0);
        setRenderError(null);

        try {
            const res = await fetch('/api/animation-generator/render-video', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ templateName: generated.template, fieldValues }),
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.error || 'Render failed');

            const es = new EventSource(`/api/render-progress/${data.jobId}`);
            esRef.current = es;

            es.onmessage = (e) => {
                const job = JSON.parse(e.data);
                setRenderProgress(job.progress || 0);
                if (job.status === 'completed') {
                    setRenderStatus('done');
                    setCurrentVideoUrl(job.url);
                    onVideoUpdate(job.url);
                    es.close();
                } else if (job.status === 'error') {
                    setRenderStatus('error');
                    setRenderError(job.error || 'Render failed');
                    es.close();
                }
            };
            es.onerror = () => {
                setRenderStatus('error');
                setRenderError('Connection lost during render');
                es.close();
            };
        } catch (err: unknown) {
            setRenderStatus('error');
            setRenderError(err instanceof Error ? err.message : String(err));
        }
    };

    const inputSx = {
        '& .MuiOutlinedInput-root': {
            fontSize: '0.72rem',
            bgcolor: '#0a0a0a',
            '& fieldset': { borderColor: 'var(--border-color)' },
            '&:hover fieldset': { borderColor: catColor + '66' },
            '&.Mui-focused fieldset': { borderColor: catColor },
        },
        '& .MuiInputBase-input': { color: 'var(--text-primary)' },
        '& .MuiInputLabel-root': { color: '#666', fontSize: '0.7rem' },
        '& .MuiInputLabel-root.Mui-focused': { color: catColor },
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="xl"
            fullWidth
            PaperProps={{ sx: { bgcolor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderTop: `3px solid ${catColor}`, m: 2 } }}
        >
            {/* Title bar */}
            <DialogTitle sx={{ py: 1.2, px: 2.5, borderBottom: '1px solid var(--border-color)' }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Box>
                        <Typography sx={{ fontWeight: 'bold', color: catColor, letterSpacing: '2px', textTransform: 'uppercase', fontSize: '0.85rem' }}>
                            Edit & Preview
                        </Typography>
                        <Typography sx={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                            {generated.template}
                        </Typography>
                    </Box>
                    <Stack direction="row" alignItems="center" gap={1.5}>
                        {renderStatus === 'rendering' && (
                            <Box sx={{ minWidth: 200 }}>
                                <LinearProgress
                                    variant="determinate"
                                    value={renderProgress}
                                    sx={{ height: 4, borderRadius: 2, bgcolor: '#222', '& .MuiLinearProgress-bar': { bgcolor: catColor } }}
                                />
                                <Typography sx={{ fontSize: '0.6rem', color: catColor, mt: 0.3, textAlign: 'center', letterSpacing: '1px' }}>
                                    RENDERING {renderProgress}%
                                </Typography>
                            </Box>
                        )}
                        <Button
                            variant="contained"
                            size="small"
                            startIcon={renderStatus === 'rendering' ? <CircularProgress size={12} sx={{ color: 'inherit' }} /> : <VideoIcon sx={{ fontSize: '14px !important' }} />}
                            disabled={renderStatus === 'rendering'}
                            onClick={handleRender}
                            sx={{ bgcolor: catColor, color: '#000', fontSize: '0.7rem', fontWeight: 'bold', letterSpacing: '1px', whiteSpace: 'nowrap', '&:hover': { bgcolor: catColor + 'dd' }, '&.Mui-disabled': { bgcolor: '#333', color: '#666' } }}
                        >
                            {renderStatus === 'rendering' ? 'RENDERING…' : 'RENDER VIDEO'}
                        </Button>
                        <Button onClick={onClose} size="small" sx={{ color: 'var(--text-secondary)', fontSize: '0.7rem', minWidth: 0 }}>
                            ✕
                        </Button>
                    </Stack>
                </Stack>
            </DialogTitle>

            <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {/* Video pane — large, 16:9 proportional */}
                <Box sx={{ bgcolor: '#030303', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, height: 540 }}>
                    {currentVideoUrl ? (
                        <video
                            key={currentVideoUrl}
                            controls
                            autoPlay
                            loop
                            style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
                        >
                            <source src={currentVideoUrl} type="video/mp4" />
                        </video>
                    ) : renderStatus === 'rendering' ? (
                        <Box sx={{ textAlign: 'center', px: 4 }}>
                            <CircularProgress size={48} sx={{ color: catColor, mb: 2 }} />
                            <Typography sx={{ color: catColor, fontSize: '0.85rem', letterSpacing: '3px' }}>
                                RENDERING {renderProgress}%
                            </Typography>
                        </Box>
                    ) : renderStatus === 'error' ? (
                        <Box sx={{ textAlign: 'center', px: 4 }}>
                            <Typography sx={{ color: '#ef5350', fontSize: '0.8rem', mb: 1.5 }}>
                                Render failed: {renderError}
                            </Typography>
                            <Button onClick={handleRender} startIcon={<RefreshIcon />} sx={{ color: catColor, fontSize: '0.75rem' }}>
                                Retry
                            </Button>
                        </Box>
                    ) : generated.screenshotUrl ? (
                        <img src={generated.screenshotUrl} alt={generated.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    ) : (
                        <Box sx={{ textAlign: 'center', px: 4 }}>
                            <VideoIcon sx={{ color: '#333', fontSize: 56, mb: 1.5 }} />
                            <Typography sx={{ color: '#555', fontSize: '0.75rem' }}>
                                Click Render Video to preview
                            </Typography>
                        </Box>
                    )}
                </Box>

                {/* Fields pane — compact grid below video */}
                <Box sx={{ p: 2, overflow: 'auto', flexGrow: 1 }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1.5}>
                        <Typography sx={{ fontSize: '0.65rem', color: '#666', letterSpacing: '2px', textTransform: 'uppercase' }}>
                            Content Fields
                        </Typography>
                        <Typography sx={{ fontSize: '0.6rem', color: '#444' }}>
                            Empty fields use sample values
                        </Typography>
                    </Stack>

                    {contentFields.length === 0 ? (
                        <Typography sx={{ color: '#555', fontSize: '0.72rem' }}>
                            No content fields — this template uses only color placeholders.
                        </Typography>
                    ) : (
                        <Grid container spacing={1.5}>
                            {contentFields.map(([key, desc]) => (
                                <Grid item xs={12} sm={6} md={4} lg={3} key={key}>
                                    <TextField
                                        label={key}
                                        placeholder={String(desc)}
                                        value={fieldValues[key] || ''}
                                        onChange={e => setFieldValues(prev => ({ ...prev, [key]: e.target.value }))}
                                        fullWidth
                                        size="small"
                                        sx={inputSx}
                                    />
                                </Grid>
                            ))}
                        </Grid>
                    )}
                </Box>
            </DialogContent>
        </Dialog>
    );
};

// ── Type Card ─────────────────────────────────────────────────────────────────
interface TypeCardProps {
    type: AnimationType;
    catColor: string;
    onGenerate: (type: AnimationType, customDesc: string) => void;
    generating: boolean;
    generated: GeneratedResult | null;
    onEdit: (generated: GeneratedResult) => void;
}

const TypeCard: React.FC<TypeCardProps> = ({ type, catColor, onGenerate, generating, generated, onEdit }) => {
    const [custom, setCustom] = useState('');
    const [imgFailed, setImgFailed] = useState(false);

    const isDone = generated !== null;
    const hasVideo = isDone && !!generated.videoUrl;
    const isRendering = isDone && generated.videoStatus === 'rendering';

    return (
        <Card sx={{
            bgcolor: 'var(--bg-secondary)',
            border: `1px solid ${isDone ? catColor + '66' : 'var(--border-color)'}`,
            borderLeft: `3px solid ${catColor}`,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            transition: 'border-color 0.2s',
        }}>
            {/* Preview area */}
            {isDone && (
                hasVideo ? (
                    <Box sx={{ position: 'relative', height: 160, bgcolor: '#0a0a0a', overflow: 'hidden' }}>
                        <video
                            key={generated.videoUrl}
                            autoPlay
                            muted
                            loop
                            style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
                        >
                            <source src={generated.videoUrl} type="video/mp4" />
                        </video>
                    </Box>
                ) : isRendering ? (
                    <Box sx={{ height: 160, bgcolor: '#0a0a0a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1, px: 2 }}>
                        <CircularProgress size={22} sx={{ color: catColor }} />
                        <Typography sx={{ fontSize: '0.6rem', color: catColor, letterSpacing: '1px' }}>
                            RENDERING VIDEO {generated.videoProgress ? `${generated.videoProgress}%` : ''}
                        </Typography>
                        <LinearProgress
                            variant={generated.videoProgress ? 'determinate' : 'indeterminate'}
                            value={generated.videoProgress || 0}
                            sx={{ width: '80%', height: 2, borderRadius: 1, bgcolor: '#222', '& .MuiLinearProgress-bar': { bgcolor: catColor } }}
                        />
                    </Box>
                ) : generated.screenshotUrl && !imgFailed ? (
                    <CardMedia
                        component="img"
                        image={generated.screenshotUrl}
                        alt={type.name}
                        onError={() => setImgFailed(true)}
                        sx={{ height: 160, objectFit: 'contain', bgcolor: '#0a0a0a' }}
                    />
                ) : (
                    <Box sx={{ height: 160, bgcolor: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ImageIcon sx={{ color: '#333', fontSize: 36 }} />
                    </Box>
                )
            )}

            <CardContent sx={{ flexGrow: 1, p: 1.5, '&:last-child': { pb: 1 } }}>
                <Stack direction="row" alignItems="flex-start" justifyContent="space-between" mb={0.5}>
                    <Typography sx={{ fontSize: '0.78rem', fontWeight: 'bold', color: 'var(--text-primary)', lineHeight: 1.3, flex: 1, pr: 1 }}>
                        {type.name}
                    </Typography>
                    {isDone && <DoneIcon sx={{ fontSize: 16, color: catColor, flexShrink: 0 }} />}
                </Stack>

                <Typography sx={{ fontSize: '0.66rem', color: 'var(--text-secondary)', lineHeight: 1.4, mb: 1 }}>
                    {type.desc}
                </Typography>

                <Stack direction="row" flexWrap="wrap" gap={0.4} mb={1}>
                    {type.tags.map(tag => (
                        <Chip key={tag} label={tag} size="small" sx={{
                            height: 16, fontSize: '0.56rem', bgcolor: catColor + '18',
                            color: catColor, border: `1px solid ${catColor}33`,
                            '& .MuiChip-label': { px: 0.7 },
                        }} />
                    ))}
                </Stack>

                {isDone && (
                    <Box sx={{ bgcolor: '#0a0a0a', borderRadius: 1, p: 0.8, mb: 1 }}>
                        <Typography sx={{ fontSize: '0.62rem', color: '#666', mb: 0.3 }}>GENERATED</Typography>
                        <Typography sx={{ fontSize: '0.65rem', color: catColor, fontFamily: 'monospace' }}>
                            {generated.template}
                        </Typography>
                        {Object.keys(generated.fields).length > 0 && (
                            <Typography sx={{ fontSize: '0.6rem', color: 'var(--text-secondary)', mt: 0.5 }}>
                                {Object.keys(generated.fields).length} fields: {Object.keys(generated.fields).slice(0, 4).join(', ')}{Object.keys(generated.fields).length > 4 ? '…' : ''}
                            </Typography>
                        )}
                    </Box>
                )}

                <TextField
                    size="small"
                    placeholder="Optional: add specific requirements…"
                    value={custom}
                    onChange={e => setCustom(e.target.value)}
                    fullWidth
                    multiline
                    rows={2}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            fontSize: '0.65rem',
                            bgcolor: '#0a0a0a',
                            '& fieldset': { borderColor: 'var(--border-color)' },
                            '&:hover fieldset': { borderColor: catColor + '66' },
                            '&.Mui-focused fieldset': { borderColor: catColor },
                        },
                        '& .MuiInputBase-input': { color: 'var(--text-primary)' },
                        '& .MuiInputBase-input::placeholder': { color: '#555', fontSize: '0.65rem' },
                    }}
                />
            </CardContent>

            <CardActions sx={{ p: 1.5, pt: 0, gap: 1 }}>
                <Button
                    fullWidth
                    size="small"
                    variant={isDone ? 'outlined' : 'contained'}
                    disabled={generating}
                    onClick={() => onGenerate(type, custom)}
                    startIcon={generating ? <CircularProgress size={12} sx={{ color: 'inherit' }} /> : <GenerateIcon sx={{ fontSize: '14px !important' }} />}
                    sx={{
                        fontSize: '0.7rem',
                        fontWeight: 'bold',
                        letterSpacing: '1px',
                        bgcolor: isDone ? 'transparent' : catColor,
                        color: isDone ? catColor : '#000',
                        borderColor: catColor,
                        '&:hover': { bgcolor: catColor + (isDone ? '22' : 'dd'), borderColor: catColor },
                        '&.Mui-disabled': { bgcolor: '#222', color: '#444' },
                    }}
                >
                    {generating ? 'GENERATING…' : isDone ? 'REGENERATE' : 'GENERATE'}
                </Button>

                {isDone && (
                    <IconButton
                        size="small"
                        onClick={() => onEdit(generated)}
                        title="Edit fields & preview video"
                        sx={{ color: catColor, border: `1px solid ${catColor}66`, borderRadius: 1, flexShrink: 0, '&:hover': { bgcolor: catColor + '22' } }}
                    >
                        <EditIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                )}
            </CardActions>
        </Card>
    );
};

// ── Main View ─────────────────────────────────────────────────────────────────
const AnimationGeneratorView: React.FC = () => {
    const [catalog, setCatalog] = useState<Catalog | null>(null);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState(0);
    const [generating, setGenerating] = useState<string | null>(null);
    const [generatingAll, setGeneratingAll] = useState(false);
    const [generateAllProgress, setGenerateAllProgress] = useState<{ done: number; total: number } | null>(null);
    const [results, setResults] = useState<Record<string, GeneratedResult>>({});
    const [snack, setSnack] = useState<{ msg: string; severity: 'success' | 'error' } | null>(null);
    const [globalCustom, setGlobalCustom] = useState('');
    const [editTarget, setEditTarget] = useState<{ typeId: string; result: GeneratedResult } | null>(null);

    const eventSources = useRef<Map<string, EventSource>>(new Map());

    useEffect(() => {
        fetch('/api/animation-generator/types')
            .then(r => r.json())
            .then(d => {
                if (d.success) setCatalog(d.catalog);
                else setLoadError(d.error || 'Failed to load catalog');
            })
            .catch(e => setLoadError(e.message));

        return () => {
            eventSources.current.forEach(es => es.close());
        };
    }, []);

    const startVideoPolling = useCallback((typeId: string, jobId: string) => {
        const es = new EventSource(`/api/render-progress/${jobId}`);
        eventSources.current.set(typeId, es);

        es.onmessage = (e) => {
            const job = JSON.parse(e.data);
            setResults(prev => {
                const curr = prev[typeId];
                if (!curr) return prev;
                return {
                    ...prev,
                    [typeId]: {
                        ...curr,
                        videoStatus: job.status === 'completed' ? 'done' : job.status === 'error' ? 'error' : 'rendering',
                        videoProgress: job.progress || 0,
                        ...(job.url ? { videoUrl: job.url } : {}),
                    },
                };
            });
            if (job.status === 'completed' || job.status === 'error') {
                es.close();
                eventSources.current.delete(typeId);
            }
        };
        es.onerror = () => {
            es.close();
            eventSources.current.delete(typeId);
        };
    }, []);

    const handleGenerate = async (type: AnimationType, customDesc: string) => {
        setGenerating(type.id);
        // Close any existing polling for this type
        eventSources.current.get(type.id)?.close();
        eventSources.current.delete(type.id);

        try {
            const body: Record<string, string> = { typeId: type.id };
            const combined = [customDesc, globalCustom].filter(Boolean).join('\n');
            if (combined) body.customDescription = combined;

            const res = await fetch('/api/animation-generator/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.error || 'Generation failed');

            const result: GeneratedResult = {
                ...data,
                videoStatus: data.videoJobId ? 'rendering' : undefined,
                videoProgress: 0,
            };
            setResults(prev => ({ ...prev, [type.id]: result }));
            setSnack({ msg: `✓ ${data.template} generated`, severity: 'success' });

            if (data.videoJobId) {
                startVideoPolling(type.id, data.videoJobId);
            }
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err);
            setSnack({ msg: `✗ ${msg}`, severity: 'error' });
        } finally {
            setGenerating(null);
        }
    };

    const handleGenerateAll = async (types: AnimationType[]) => {
        if (generatingAll) return;
        setGeneratingAll(true);
        setGenerateAllProgress({ done: 0, total: types.length });
        let done = 0;
        for (const type of types) {
            try {
                await handleGenerate(type, '');
            } catch {
                // continue on individual failures
            }
            done++;
            setGenerateAllProgress({ done, total: types.length });
        }
        setGeneratingAll(false);
        setGenerateAllProgress(null);
    };

    const catIds = catalog ? Object.keys(catalog) : [];
    const activeCatId = catalog ? catIds[activeTab] : null;
    const activeCat = activeCatId && catalog ? catalog[activeCatId] : null;
    const catColor = activeCatId ? (CATEGORY_COLORS[activeCatId] || '#c9a961') : '#c9a961';
    const totalGenerated = Object.keys(results).length;

    return (
        <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Header */}
            <Box sx={{ px: 4, pt: 4, pb: 2, borderBottom: '1px solid var(--border-color)', flexShrink: 0 }}>
                <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
                    <Box>
                        <Typography variant="h5" sx={{
                            color: 'var(--accent-gold)', fontVariant: 'small-caps',
                            letterSpacing: '4px', fontWeight: 'bold', fontSize: '1.1rem',
                        }}>
                            Animation Generator
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'var(--text-secondary)', letterSpacing: '1px' }}>
                            AI-powered Remotion template generation • {totalGenerated} generated this session
                        </Typography>
                    </Box>

                    <Box sx={{ maxWidth: 360 }}>
                        <TextField
                            size="small"
                            placeholder="Global style notes applied to all generations…"
                            value={globalCustom}
                            onChange={e => setGlobalCustom(e.target.value)}
                            fullWidth
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    fontSize: '0.7rem', bgcolor: 'var(--bg-secondary)',
                                    '& fieldset': { borderColor: 'var(--border-color)' },
                                    '&.Mui-focused fieldset': { borderColor: 'var(--accent-gold)' },
                                },
                                '& .MuiInputBase-input': { color: 'var(--text-primary)' },
                                '& .MuiInputBase-input::placeholder': { color: '#555' },
                            }}
                        />
                        <Typography sx={{ fontSize: '0.6rem', color: '#555', mt: 0.3 }}>
                            e.g. "dark red and white color scheme" or "use grid lines"
                        </Typography>
                    </Box>
                </Stack>
            </Box>

            {loadError && <Alert severity="error" sx={{ m: 2 }}>{loadError}</Alert>}

            {!catalog && !loadError && (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexGrow: 1 }}>
                    <CircularProgress sx={{ color: 'var(--accent-gold)' }} />
                </Box>
            )}

            {catalog && (
                <>
                    {/* Category tabs */}
                    <Box sx={{ borderBottom: '1px solid var(--border-color)', flexShrink: 0, bgcolor: 'var(--bg-secondary)' }}>
                        <Tabs
                            value={activeTab}
                            onChange={(_, v) => setActiveTab(v)}
                            variant="scrollable"
                            scrollButtons="auto"
                            sx={{
                                '& .MuiTab-root': {
                                    fontSize: '0.7rem', fontWeight: 'bold', letterSpacing: '1px',
                                    color: 'var(--text-secondary)', minWidth: 140, textTransform: 'uppercase',
                                },
                                '& .Mui-selected': { color: catColor + ' !important' },
                                '& .MuiTabs-indicator': { backgroundColor: catColor },
                            }}
                        >
                            {catIds.map((catId, i) => {
                                const cat = catalog[catId];
                                const catGenCount = cat.types.filter(t => results[t.id]).length;
                                return (
                                    <Tab
                                        key={catId}
                                        icon={CATEGORY_ICONS[catId] || <BarChartIcon />}
                                        iconPosition="start"
                                        label={
                                            <Stack direction="row" alignItems="center" gap={0.7}>
                                                {cat.label}
                                                <Chip label={cat.types.length} size="small" sx={{
                                                    height: 16, fontSize: '0.55rem',
                                                    bgcolor: catGenCount > 0 ? CATEGORY_COLORS[catId] + '33' : '#333',
                                                    color: catGenCount > 0 ? CATEGORY_COLORS[catId] : '#666',
                                                    '& .MuiChip-label': { px: 0.6 },
                                                }} />
                                            </Stack>
                                        }
                                    />
                                );
                            })}
                        </Tabs>
                    </Box>

                    {/* Category header */}
                    {activeCat && activeCatId && (
                        <Box sx={{ px: 4, py: 1.5, bgcolor: catColor + '0a', borderBottom: '1px solid var(--border-color)', flexShrink: 0 }}>
                            <Stack direction="row" alignItems="center" justifyContent="space-between">
                                <Stack direction="row" alignItems="center" gap={2}>
                                    <Box sx={{ color: catColor }}>{CATEGORY_ICONS[activeCatId] || <BarChartIcon />}</Box>
                                    <Box>
                                        <Typography sx={{ fontSize: '0.85rem', fontWeight: 'bold', color: catColor, letterSpacing: '2px', textTransform: 'uppercase' }}>
                                            {activeCat.label}
                                        </Typography>
                                        <Typography sx={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>
                                            {activeCat.types.length} animation types •{' '}
                                            {activeCat.types.filter(t => results[t.id]).length} generated
                                            {generateAllProgress && ` • generating ${generateAllProgress.done}/${generateAllProgress.total}…`}
                                        </Typography>
                                    </Box>
                                </Stack>

                                <Button
                                    variant="outlined"
                                    size="small"
                                    disabled={generatingAll || !!generating}
                                    onClick={() => handleGenerateAll(activeCat.types.map(t => ({ ...t, categoryId: activeCatId!, categoryLabel: activeCat.label })))}
                                    startIcon={generatingAll
                                        ? <CircularProgress size={12} sx={{ color: 'inherit' }} />
                                        : <GenerateIcon sx={{ fontSize: '14px !important' }} />
                                    }
                                    sx={{
                                        fontSize: '0.7rem', fontWeight: 'bold', letterSpacing: '1px',
                                        color: catColor, borderColor: catColor + '88',
                                        '&:hover': { bgcolor: catColor + '18', borderColor: catColor },
                                        '&.Mui-disabled': { color: '#444', borderColor: '#333' },
                                    }}
                                >
                                    {generatingAll
                                        ? `${generateAllProgress?.done ?? 0} / ${generateAllProgress?.total ?? 0}`
                                        : `GENERATE ALL ${activeCat.types.length}`
                                    }
                                </Button>
                            </Stack>
                        </Box>
                    )}

                    {/* Type grid */}
                    <Box sx={{ flexGrow: 1, overflow: 'auto', p: 3 }}>
                        {activeCat && (
                            <Grid container spacing={2}>
                                {activeCat.types.map(type => (
                                    <Grid item xs={12} sm={6} md={4} lg={3} key={type.id}>
                                        <TypeCard
                                            type={{ ...type, categoryId: activeCatId!, categoryLabel: activeCat.label }}
                                            catColor={CATEGORY_COLORS[activeCatId!] || '#c9a961'}
                                            onGenerate={handleGenerate}
                                            generating={generating === type.id}
                                            generated={results[type.id] || null}
                                            onEdit={(gen) => setEditTarget({ typeId: type.id, result: gen })}
                                        />
                                    </Grid>
                                ))}
                            </Grid>
                        )}
                    </Box>
                </>
            )}

            {/* Edit Fields Dialog */}
            {editTarget && (
                <EditFieldsDialog
                    open={!!editTarget}
                    onClose={() => setEditTarget(null)}
                    generated={results[editTarget.typeId] ?? editTarget.result}
                    catColor={CATEGORY_COLORS[results[editTarget.typeId]?.category || ''] || catColor}
                    onVideoUpdate={(url) => {
                        setResults(prev => ({
                            ...prev,
                            [editTarget.typeId]: { ...prev[editTarget.typeId], videoUrl: url, videoStatus: 'done', videoProgress: 100 },
                        }));
                    }}
                />
            )}

            {/* Snackbar */}
            <Snackbar
                open={snack !== null}
                autoHideDuration={4000}
                onClose={() => setSnack(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                {snack ? (
                    <Alert severity={snack.severity} onClose={() => setSnack(null)} sx={{ fontSize: '0.75rem' }}>
                        {snack.msg}
                    </Alert>
                ) : <div />}
            </Snackbar>
        </Box>
    );
};

export default AnimationGeneratorView;
