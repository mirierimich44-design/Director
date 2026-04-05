import React, { useState, useEffect, useRef } from 'react';
import {
    Box, Typography, Grid, Card, CardActionArea, CardContent,
    Button, TextField, CircularProgress, Alert, IconButton,
    Stack, LinearProgress, MenuItem, Select, FormControl,
    InputLabel, Chip, Divider, InputAdornment, Dialog,
    DialogTitle, DialogContent, DialogActions, Tooltip
} from '@mui/material';
import {
    Search as SearchIcon,
    Clear as ClearIcon,
    PlayArrow as RenderIcon,
    Close as CloseIcon,
    GridView as GridIcon,
    Category as CategoryIcon,
} from '@mui/icons-material';

interface TemplateEntry {
    name: string;
    category: string;
}

interface RenderJob {
    status: string;
    progress: number;
    message: string;
    url?: string;
    error?: string;
}

const CATEGORY_COLORS: Record<string, string> = {
    CHARTS:       '#4fc3f7',
    TIMELINE:     '#81c784',
    MAP:          '#ce93d8',
    FLOW:         '#ffb74d',
    PERSON:       '#80deea',
    ORGANIZATION: '#b39ddb',
    FINANCIAL:    '#fff176',
    COMPARISON:   '#90caf9',
    IMAGE:        '#f48fb1',
    EVIDENCE:     '#ef9a9a',
    SOCIAL:       '#ef9a9a',
    GENERAL:      '#aaaaaa',
    OTHER:        '#888888',
};

function labelFor(name: string) {
    // "04-linechart-draw" → "Linechart Draw"
    return name.replace(/^\d+-/, '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

const TemplateGalleryView: React.FC = () => {
    const [templates, setTemplates] = useState<TemplateEntry[]>([]);
    const [categories, setCategories] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [search, setSearch] = useState('');
    const [filterCat, setFilterCat] = useState('ALL');

    // Preview dialog state
    const [previewTemplate, setPreviewTemplate] = useState<string | null>(null);
    const [previewJobId, setPreviewJobId]   = useState<string | null>(null);
    const [previewJob,   setPreviewJob]     = useState<RenderJob | null>(null);
    const [previewError, setPreviewError]   = useState('');
    const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        fetch('/api/templates')
            .then(r => r.json())
            .then(d => {
                setTemplates(d.templates || []);
                setCategories(d.categories || {});
                setLoading(false);
            })
            .catch(e => { setError(e.message); setLoading(false); });
    }, []);

    // Poll job status
    useEffect(() => {
        if (!previewJobId) return;
        pollRef.current = setInterval(async () => {
            try {
                const r = await fetch(`/api/job-status/${previewJobId}`);
                const d: RenderJob = await r.json();
                setPreviewJob(d);
                if (d.status === 'completed' || d.status === 'error') {
                    clearInterval(pollRef.current!);
                    pollRef.current = null;
                }
            } catch { /* ignore */ }
        }, 800);
        return () => { if (pollRef.current) clearInterval(pollRef.current); };
    }, [previewJobId]);

    const openPreview = async (name: string) => {
        setPreviewTemplate(name);
        setPreviewJobId(null);
        setPreviewJob(null);
        setPreviewError('');

        try {
            const r = await fetch('/api/templates/preview', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ template: name, theme: 'DARK', duration: 180 }),
            });
            const d = await r.json();
            if (!d.success) throw new Error(d.error || 'Render failed');
            setPreviewJobId(d.jobId);
            setPreviewJob({ status: 'processing', progress: 0, message: 'Starting...' });
        } catch (e: any) {
            setPreviewError(e.message);
        }
    };

    const closePreview = () => {
        setPreviewTemplate(null);
        setPreviewJobId(null);
        setPreviewJob(null);
        setPreviewError('');
        if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
    };

    const allCats = ['ALL', ...Object.keys(categories)];

    const filtered = templates.filter(t => {
        const matchSearch = !search || t.name.toLowerCase().includes(search.toLowerCase()) || labelFor(t.name).toLowerCase().includes(search.toLowerCase());
        const matchCat = filterCat === 'ALL' || t.category === filterCat;
        return matchSearch && matchCat;
    });

    // Group by category for display
    const grouped: Record<string, TemplateEntry[]> = {};
    for (const t of filtered) {
        const cat = t.category || 'OTHER';
        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat].push(t);
    }

    const catColor = (cat: string) => CATEGORY_COLORS[cat] || '#888';

    if (loading) return (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', gap: 2 }}>
            <CircularProgress sx={{ color: 'var(--accent-gold)' }} />
            <Typography sx={{ color: 'var(--text-secondary)' }}>Loading templates...</Typography>
        </Box>
    );

    if (error) return (
        <Box sx={{ p: 4 }}>
            <Alert severity="error">{error}</Alert>
        </Box>
    );

    return (
        <Box sx={{ p: 4, height: '100%', overflow: 'auto' }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h5" sx={{ color: 'var(--accent-gold)', fontWeight: 'bold', letterSpacing: '3px', mb: 0.5 }}>
                    TEMPLATE GALLERY
                </Typography>
                <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
                    {templates.length} templates — click any card to preview with placeholders
                </Typography>
            </Box>

            {/* Filters */}
            <Stack direction="row" spacing={2} sx={{ mb: 4 }} alignItems="center" flexWrap="wrap">
                <TextField
                    size="small"
                    placeholder="Search templates..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    sx={{ width: 260, '& .MuiOutlinedInput-root': { color: 'var(--text-primary)', '& fieldset': { borderColor: 'var(--border-color)' }, '&:hover fieldset': { borderColor: 'var(--accent-gold)' } }, '& .MuiInputBase-input::placeholder': { color: 'var(--text-secondary)' } }}
                    InputProps={{
                        startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: 'var(--text-secondary)', fontSize: 18 }} /></InputAdornment>,
                        endAdornment: search ? (
                            <InputAdornment position="end">
                                <IconButton size="small" onClick={() => setSearch('')} sx={{ color: 'var(--text-secondary)' }}>
                                    <ClearIcon fontSize="small" />
                                </IconButton>
                            </InputAdornment>
                        ) : null,
                    }}
                />

                <FormControl size="small" sx={{ minWidth: 180 }}>
                    <InputLabel sx={{ color: 'var(--text-secondary)' }}>Category</InputLabel>
                    <Select
                        value={filterCat}
                        label="Category"
                        onChange={e => setFilterCat(e.target.value)}
                        sx={{ color: 'var(--text-primary)', '& .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--border-color)' }, '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--accent-gold)' }, '& .MuiSvgIcon-root': { color: 'var(--text-secondary)' } }}
                        MenuProps={{ PaperProps: { sx: { bgcolor: 'var(--bg-secondary)', color: 'var(--text-primary)' } } }}
                    >
                        {allCats.map(c => (
                            <MenuItem key={c} value={c}>
                                {c === 'ALL' ? 'All Categories' : (
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: catColor(c) }} />
                                        <span>{c}</span>
                                    </Stack>
                                )}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <Typography variant="body2" sx={{ color: 'var(--text-secondary)', ml: 1 }}>
                    {filtered.length} shown
                </Typography>
            </Stack>

            {/* Grid per category */}
            {Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([cat, items]) => (
                <Box key={cat} sx={{ mb: 5 }}>
                    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
                        <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: catColor(cat), flexShrink: 0 }} />
                        <Typography variant="subtitle1" sx={{ color: catColor(cat), fontWeight: 'bold', letterSpacing: '2px', fontSize: '0.8rem' }}>
                            {cat}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'var(--text-secondary)' }}>
                            {items.length}
                        </Typography>
                        <Divider sx={{ flexGrow: 1, borderColor: 'var(--border-color)' }} />
                    </Stack>

                    <Grid container spacing={2}>
                        {items.map(t => (
                            <Grid key={t.name} size={{ xs: 12, sm: 6, md: 4, lg: 3, xl: 2 }}>
                                <Card
                                    sx={{
                                        bgcolor: 'var(--bg-secondary)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '8px',
                                        transition: 'border-color 0.2s, transform 0.15s',
                                        '&:hover': { borderColor: catColor(cat), transform: 'translateY(-2px)' },
                                    }}
                                >
                                    <CardActionArea onClick={() => openPreview(t.name)} sx={{ p: 2 }}>
                                        <Box
                                            sx={{
                                                height: 80,
                                                borderRadius: '6px',
                                                bgcolor: 'rgba(255,255,255,0.03)',
                                                border: `1px solid ${catColor(cat)}22`,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                mb: 1.5,
                                            }}
                                        >
                                            <RenderIcon sx={{ color: catColor(cat), opacity: 0.5, fontSize: 32 }} />
                                        </Box>
                                        <Typography variant="body2" sx={{ color: 'var(--text-primary)', fontWeight: 'bold', fontSize: '0.78rem', lineHeight: 1.3, mb: 0.5 }}>
                                            {labelFor(t.name)}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: 'var(--text-secondary)', fontSize: '0.65rem', fontFamily: 'monospace' }}>
                                            {t.name}
                                        </Typography>
                                    </CardActionArea>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            ))}

            {filtered.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 10 }}>
                    <Typography sx={{ color: 'var(--text-secondary)' }}>No templates match your filter.</Typography>
                </Box>
            )}

            {/* Preview Dialog */}
            <Dialog
                open={!!previewTemplate}
                onClose={closePreview}
                maxWidth="lg"
                fullWidth
                PaperProps={{ sx: { bgcolor: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: '12px' } }}
            >
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
                    <Box>
                        <Typography variant="h6" sx={{ color: 'var(--accent-gold)', fontWeight: 'bold', letterSpacing: '2px', fontSize: '0.9rem' }}>
                            TEMPLATE PREVIEW
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                            {previewTemplate}
                        </Typography>
                    </Box>
                    <IconButton onClick={closePreview} size="small" sx={{ color: 'var(--text-secondary)' }}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>

                <DialogContent sx={{ pt: 0 }}>
                    {previewError && (
                        <Alert severity="error" sx={{ mb: 2 }}>{previewError}</Alert>
                    )}

                    {previewJob && previewJob.status !== 'completed' && previewJob.status !== 'error' && (
                        <Box sx={{ mb: 2 }}>
                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                                <CircularProgress size={16} sx={{ color: 'var(--accent-gold)' }} />
                                <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
                                    {previewJob.message}
                                </Typography>
                            </Stack>
                            <LinearProgress
                                variant="determinate"
                                value={previewJob.progress || 0}
                                sx={{ height: 4, borderRadius: 2, bgcolor: 'var(--border-color)', '& .MuiLinearProgress-bar': { bgcolor: 'var(--accent-gold)' } }}
                            />
                        </Box>
                    )}

                    {previewJob?.status === 'error' && (
                        <Alert severity="error">{previewJob.error || 'Render failed'}</Alert>
                    )}

                    {previewJob?.status === 'completed' && previewJob.url && (
                        <Box sx={{ borderRadius: '8px', overflow: 'hidden', bgcolor: '#000', border: '1px solid var(--border-color)' }}>
                            <video
                                key={previewJob.url}
                                src={previewJob.url}
                                controls
                                autoPlay
                                loop
                                style={{ width: '100%', display: 'block', maxHeight: '540px' }}
                            />
                        </Box>
                    )}

                    {!previewJob && !previewError && (
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 6 }}>
                            <CircularProgress sx={{ color: 'var(--accent-gold)' }} />
                        </Box>
                    )}
                </DialogContent>

                <DialogActions sx={{ px: 3, pb: 2 }}>
                    {previewJob?.status === 'completed' && previewJob.url && (
                        <Button
                            component="a"
                            href={previewJob.url}
                            download
                            variant="outlined"
                            size="small"
                            sx={{ color: 'var(--accent-gold)', borderColor: 'var(--accent-gold)', textTransform: 'none', mr: 'auto' }}
                        >
                            Download
                        </Button>
                    )}
                    <Button onClick={closePreview} size="small" sx={{ color: 'var(--text-secondary)', textTransform: 'none' }}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default TemplateGalleryView;
