import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Grid, Card, CardContent, CardActions,
    Button, Chip, TextField, CircularProgress, Alert, IconButton,
    Tooltip, InputAdornment, Stack, Divider, Paper, Dialog,
    DialogTitle, DialogContent, DialogActions, LinearProgress
} from '@mui/material';
import {
    Search as SearchIcon,
    CheckCircle as DoneIcon,
    ErrorOutline as MissingIcon,
    AutoFixHigh as GenerateIcon,
    Visibility as ViewIcon,
    Refresh as RefreshIcon,
    Description as SchemaIcon,
    Code as CodeIcon
} from '@mui/icons-material';

interface TemplateInfo {
    id: string;
    name: string;
    description: string;
    category: string;
    hasSchema: boolean;
    hasCode: boolean;
    isGenerated: boolean;
    fields: string[];
}

const CATEGORY_COLORS: Record<string, string> = {
    'data-charts': '#4fc3f7',
    'storytelling': '#ce93d8',
    'text-reveal': '#80cbc4',
    'layout': '#ffcc80',
    'security': '#ef9a9a',
    'finance': '#a5d6a7',
    'generated': '#c9a961',
    'cinematic': '#ffab40'
};

const TemplateLibraryView: React.FC = () => {
    const [templates, setTemplates] = useState<TemplateInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState<'all' | 'created' | 'missing'>('all');
    
    const [generating, setGenerating] = useState<string | null>(null);
    const [previewTarget, setPreviewTarget] = useState<TemplateInfo | null>(null);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [previewVideoUrl, setPreviewVideoUrl] = useState<string | null>(null);
    const [previewProgress, setPreviewProgress] = useState(0);

    const loadTemplates = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/templates/library');
            const data = await res.json();
            if (data.success) {
                setTemplates(data.templates);
            } else {
                setError(data.error);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTemplates();
    }, []);

    const handleGenerate = async (template: TemplateInfo) => {
        setGenerating(template.id);
        try {
            const res = await fetch('/api/templates/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    description: template.description,
                    suggestedName: template.id,
                    category: template.category
                })
            });
            const data = await res.json();
            if (data.success) {
                loadTemplates();
            } else {
                alert('Generation failed: ' + data.error);
            }
        } catch (err: any) {
            alert('Error: ' + err.message);
        } finally {
            setGenerating(null);
        }
    };

    const handlePreview = async (template: TemplateInfo) => {
        setPreviewTarget(template);
        setPreviewLoading(true);
        setPreviewVideoUrl(null);
        setPreviewProgress(0);

        try {
            // 1. Fetch template code and schema (force a fill with default values)
            const res = await fetch(`/api/templates/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    description: template.description,
                    suggestedName: template.id,
                    theme: 'THREAT',
                    content: {} 
                })
            });
            const data = await res.json();
            if (!data.success || !data.code) throw new Error(data.error || 'Failed to get template code');

            // 2. Trigger a render job
            const renderRes = await fetch('/api/manual-render-job', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code: data.code,
                    duration: 5,
                    fps: 30
                })
            });
            const renderData = await renderRes.json();
            if (!renderData.success) throw new Error(renderData.error);

            // 3. Follow progress via SSE
            const evtSrc = new EventSource(`/api/render-progress/${renderData.jobId}`);
            evtSrc.onmessage = (e) => {
                const job = JSON.parse(e.data);
                setPreviewProgress(job.progress || 0);
                if (job.status === 'completed') {
                    setPreviewVideoUrl(job.url);
                    setPreviewLoading(false);
                    evtSrc.close();
                } else if (job.status === 'error') {
                    alert('Preview render failed: ' + job.error);
                    setPreviewLoading(false);
                    evtSrc.close();
                }
            };
            evtSrc.onerror = () => {
                evtSrc.close();
                setPreviewLoading(false);
            };
        } catch (err: any) {
            alert('Preview error: ' + err.message);
            setPreviewLoading(false);
        }
    };

    const filteredTemplates = templates.filter(t => {
        const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             t.description.toLowerCase().includes(searchTerm.toLowerCase());
        
        if (filter === 'created') return matchesSearch && t.hasCode;
        if (filter === 'missing') return matchesSearch && !t.hasCode;
        return matchesSearch;
    });

    const stats = {
        total: templates.length,
        created: templates.filter(t => t.hasCode).length,
        missing: templates.filter(t => !t.hasCode).length
    };

    return (
        <Box sx={{ p: 4, height: '100%', overflow: 'auto' }}>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <Box>
                    <Typography variant="h4" sx={{ color: 'var(--accent-gold)', fontWeight: 'bold', mb: 1 }}>
                        TEMPLATE LIBRARY
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
                        {stats.total} Total Definitions • {stats.created} Implemented • {stats.missing} Pending Generation
                    </Typography>
                </Box>
                <Button 
                    startIcon={<RefreshIcon />} 
                    onClick={loadTemplates}
                    sx={{ color: 'var(--text-secondary)' }}
                >
                    Refresh
                </Button>
            </Box>

            <Paper sx={{ p: 2, mb: 4, bgcolor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 2 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Search templates..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon sx={{ color: 'var(--text-secondary)', fontSize: 20 }} />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    bgcolor: 'rgba(0,0,0,0.2)',
                                    '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' }
                                }
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                            <Button 
                                size="small" 
                                variant={filter === 'all' ? 'contained' : 'outlined'}
                                onClick={() => setFilter('all')}
                                sx={filter === 'all' ? { bgcolor: 'var(--accent-gold)', color: '#000' } : { color: '#fff', borderColor: 'rgba(255,255,255,0.2)' }}
                            >
                                All
                            </Button>
                            <Button 
                                size="small" 
                                variant={filter === 'created' ? 'contained' : 'outlined'}
                                onClick={() => setFilter('created')}
                                sx={filter === 'created' ? { bgcolor: '#4caf50', color: '#000' } : { color: '#fff', borderColor: 'rgba(255,255,255,0.2)' }}
                            >
                                Implemented
                            </Button>
                            <Button 
                                size="small" 
                                variant={filter === 'missing' ? 'contained' : 'outlined'}
                                onClick={() => setFilter('missing')}
                                sx={filter === 'missing' ? { bgcolor: '#f44336', color: '#fff' } : { color: '#fff', borderColor: 'rgba(255,255,255,0.2)' }}
                            >
                                Missing
                            </Button>
                        </Stack>
                    </Grid>
                </Grid>
            </Paper>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                    <CircularProgress sx={{ color: 'var(--accent-gold)' }} />
                </Box>
            ) : error ? (
                <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
            ) : (
                <Grid container spacing={3}>
                    {filteredTemplates.map(template => (
                        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={template.id}>
                            <Card sx={{ 
                                height: '100%', 
                                display: 'flex', 
                                flexDirection: 'column',
                                bgcolor: 'var(--bg-secondary)',
                                border: `1px solid ${template.hasCode ? 'rgba(76,175,80,0.3)' : 'rgba(244,67,54,0.3)'}`,
                                position: 'relative',
                                '&:hover': {
                                    borderColor: template.hasCode ? '#4caf50' : '#f44336',
                                    transform: 'translateY(-4px)',
                                    transition: 'all 0.2s'
                                }
                            }}>
                                <Box sx={{ height: 4, bgcolor: CATEGORY_COLORS[template.category] || 'var(--accent-gold)' }} />
                                
                                <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                        <Typography variant="caption" sx={{ color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                                            {template.id}
                                        </Typography>
                                        {template.hasCode ? (
                                            <DoneIcon sx={{ color: '#4caf50', fontSize: 18 }} />
                                        ) : (
                                            <MissingIcon sx={{ color: '#f44336', fontSize: 18 }} />
                                        )}
                                    </Box>

                                    <Typography variant="h6" sx={{ color: '#fff', fontSize: '1rem', fontWeight: 'bold', mb: 1, lineHeight: 1.2 }}>
                                        {template.name}
                                    </Typography>
                                    
                                    <Typography variant="body2" sx={{ color: 'var(--text-secondary)', fontSize: '0.75rem', mb: 2, height: 45, overflow: 'hidden' }}>
                                        {template.description}
                                    </Typography>

                                    <Stack direction="row" spacing={1} flexWrap="wrap">
                                        <Chip label={template.category} size="small" sx={{ fontSize: '0.6rem', height: 20, bgcolor: 'rgba(255,255,255,0.05)', color: '#aaa' }} />
                                    </Stack>

                                    <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.05)' }} />

                                    <Box>
                                        <Typography variant="caption" sx={{ color: '#555', display: 'block', mb: 0.5, textTransform: 'uppercase' }}>
                                            Fields ({template.fields.length})
                                        </Typography>
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                            {template.fields.slice(0, 4).map(f => (
                                                <Typography key={f} variant="caption" sx={{ color: 'var(--text-secondary)', bgcolor: 'rgba(255,255,255,0.03)', px: 0.5, borderRadius: 0.5, fontSize: '0.65rem' }}>
                                                    {f}
                                                </Typography>
                                            ))}
                                        </Box>
                                    </Box>
                                </CardContent>

                                <CardActions sx={{ p: 2, pt: 0, justifyContent: 'space-between' }}>
                                    <Stack direction="row" spacing={1}>
                                        <Tooltip title="View Schema"><IconButton size="small" sx={{ color: '#4fc3f7' }}><SchemaIcon sx={{ fontSize: 18 }} /></IconButton></Tooltip>
                                        {template.hasCode && <Tooltip title="View TSX Code"><IconButton size="small" sx={{ color: '#81c784' }}><CodeIcon sx={{ fontSize: 18 }} /></IconButton></Tooltip>}
                                    </Stack>
                                    
                                    {!template.hasCode ? (
                                        <Button 
                                            size="small" variant="contained" 
                                            disabled={generating === template.id}
                                            startIcon={generating === template.id ? <CircularProgress size={12} color="inherit" /> : <GenerateIcon />}
                                            onClick={() => handleGenerate(template)}
                                            sx={{ bgcolor: 'var(--accent-gold)', color: '#000', fontSize: '0.7rem', fontWeight: 'bold' }}
                                        >
                                            {generating === template.id ? 'Generating...' : 'Generate'}
                                        </Button>
                                    ) : (
                                        <Button 
                                            size="small" variant="outlined" 
                                            startIcon={<ViewIcon />}
                                            onClick={() => handlePreview(template)}
                                            sx={{ color: 'var(--accent-gold)', borderColor: 'var(--accent-gold)', fontSize: '0.7rem' }}
                                        >
                                            Preview
                                        </Button>
                                    )}
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            {previewTarget && (
                <Dialog open={!!previewTarget} onClose={() => { setPreviewTarget(null); setPreviewVideoUrl(null); }} maxWidth="lg" fullWidth>
                    <DialogTitle sx={{ bgcolor: 'var(--bg-secondary)', color: 'var(--accent-gold)', borderBottom: '1px solid var(--border-color)' }}>
                        Preview: {previewTarget.name}
                    </DialogTitle>
                    <DialogContent sx={{ bgcolor: '#000', p: 0, height: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                        {previewVideoUrl ? (
                            <video src={previewVideoUrl} controls autoPlay loop style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        ) : (
                            <Box sx={{ textAlign: 'center' }}>
                                <CircularProgress size={48} sx={{ color: 'var(--accent-gold)', mb: 2 }} />
                                <Typography sx={{ color: '#fff', mb: 1 }}>Rendering Preview...</Typography>
                                <Typography variant="caption" sx={{ color: 'var(--text-secondary)' }}>{Math.round(previewProgress)}% complete</Typography>
                                <LinearProgress variant="determinate" value={previewProgress} sx={{ width: 300, mt: 2, height: 4, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.1)', '& .MuiLinearProgress-bar': { bgcolor: 'var(--accent-gold)' } }} />
                            </Box>
                        )}
                    </DialogContent>
                    <DialogActions sx={{ bgcolor: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)' }}>
                        <Button onClick={() => { setPreviewTarget(null); setPreviewVideoUrl(null); }} sx={{ color: '#fff' }}>Close</Button>
                    </DialogActions>
                </Dialog>
            )}
        </Box>
    );
};

export default TemplateLibraryView;
