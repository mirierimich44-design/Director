import React, { useState, useEffect, useMemo } from 'react';
import {
    Box, Typography, Grid, Card, CardContent, CardActionArea,
    Button, TextField, CircularProgress, Alert, IconButton,
    Stack, Divider, Paper, LinearProgress, MenuItem, Select,
    FormControl, InputLabel, Tooltip
} from '@mui/material';
import {
    Movie as MovieIcon,
    Refresh as RefreshIcon,
    PlayArrow as RenderIcon,
    CheckCircle as DoneIcon,
    ContentCopy as CopyIcon,
    Palette as ThemeIcon,
    ViewQuilt as LayoutIcon,
    List as ListIcon
} from '@mui/icons-material';

interface Template {
    id: string;
    name: string;
    description: string;
    category: string;
    fields: string[];
}

interface RenderJob {
    id: string;
    status: string;
    progress: number;
    message: string;
    url?: string;
    error?: string;
}

const SceneStudioView: React.FC = () => {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [themes, setThemes] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
    const [selectedTheme, setSelectedTheme] = useState<string>('THREAT');
    const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
    
    const [renderJob, setRenderJob] = useState<RenderJob | null>(null);
    const [renderHistory, setRenderHistory] = useState<RenderJob[]>([]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [tRes, thRes] = await Promise.all([
                fetch('/api/templates/library'),
                fetch('/api/themes')
            ]);
            const tData = await tRes.json();
            const thData = await thRes.json();
            
            if (tData.success) setTemplates(tData.templates);
            if (thData.success) setThemes(thData.themes);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    const handleSelectTemplate = (t: Template) => {
        setSelectedTemplate(t);
        const defaults: Record<string, string> = {};
        t.fields.forEach(f => {
            if (f.includes('VALUE')) defaults[f] = '1,200';
            else if (f.includes('LABEL') || f.includes('TEXT')) defaults[f] = 'Sample Text';
            else defaults[f] = '';
        });
        setFieldValues(defaults);
        setRenderJob(null);
    };

    const handleFieldChange = (field: string, value: string) => {
        setFieldValues(prev => ({ ...prev, [field]: value }));
    };

    const handleRender = async () => {
        if (!selectedTemplate) return;
        
        setRenderJob({ id: 'init', status: 'processing', progress: 0, message: 'Filling template...' });

        try {
            // 1. Get filled TSX code
            const fillRes = await fetch('/api/templates/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    description: selectedTemplate.description,
                    suggestedName: selectedTemplate.id,
                    theme: selectedTheme,
                    content: fieldValues
                })
            });
            const fillData = await fillRes.json();
            if (!fillData.success) throw new Error(fillData.error);

            // 2. Start render job
            const renderRes = await fetch('/api/manual-render-job', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code: fillData.code,
                    duration: 10,
                    fps: 30
                })
            });
            const renderData = await renderRes.json();
            if (!renderData.success) throw new Error(renderData.error);

            const jobId = renderData.jobId;
            setRenderJob({ id: jobId, status: 'processing', progress: 0, message: 'Render started...' });

            // 3. Track via SSE
            const evtSrc = new EventSource(`/api/render-progress/${jobId}`);
            evtSrc.onmessage = (e) => {
                const job = JSON.parse(e.data);
                setRenderJob(prev => prev ? { ...prev, ...job } : job);
                
                if (job.status === 'completed') {
                    evtSrc.close();
                    setRenderHistory(prev => [{ ...job, id: jobId }, ...prev].slice(0, 5));
                } else if (job.status === 'error') {
                    evtSrc.close();
                }
            };
            evtSrc.onerror = () => {
                evtSrc.close();
                setRenderJob(prev => prev ? { ...prev, status: 'error', error: 'Connection lost' } : null);
            };

        } catch (err: any) {
            setRenderJob({ id: 'err', status: 'error', progress: 0, message: 'Failed', error: err.message });
        }
    };

    if (loading) return <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}><CircularProgress color="inherit" /></Box>;

    return (
        <Box sx={{ p: 4, height: '100%', overflow: 'auto' }}>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h4" sx={{ color: 'var(--accent-gold)', fontWeight: 'bold', mb: 1 }}>
                        SCENE STUDIO
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
                        Create, customize, and render standalone cinematic scenes.
                    </Typography>
                </Box>
                <Button startIcon={<RefreshIcon />} onClick={loadData} variant="outlined" color="inherit">Refresh Catalog</Button>
            </Box>

            <Grid container spacing={4}>
                {/* Left: Template & Field Editor */}
                <Grid size={{ xs: 12, lg: 7 }}>
                    <Paper sx={{ p: 3, bgcolor: 'var(--bg-secondary)', borderRadius: 3, border: '1px solid var(--border-color)', mb: 3 }}>
                        <Typography variant="h6" sx={{ color: '#fff', mb: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <LayoutIcon sx={{ color: 'var(--accent-gold)' }} /> 1. SELECT TEMPLATE
                        </Typography>
                        
                        <Grid container spacing={2} sx={{ maxHeight: 400, overflow: 'auto', pr: 1, mb: 4 }}>
                            {templates.map(t => (
                                <Grid size={{ xs: 6, sm: 4 }} key={t.id}>
                                    <Card 
                                        sx={{ 
                                            bgcolor: selectedTemplate?.id === t.id ? 'rgba(201,169,97,0.15)' : 'rgba(255,255,255,0.02)',
                                            border: `1px solid ${selectedTemplate?.id === t.id ? 'var(--accent-gold)' : 'rgba(255,255,255,0.05)'}`,
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <CardActionArea onClick={() => handleSelectTemplate(t)} sx={{ p: 1.5 }}>
                                            <Typography variant="caption" sx={{ color: 'var(--accent-gold)', fontFamily: 'monospace', fontSize: '0.65rem' }}>{t.id}</Typography>
                                            <Typography variant="body2" sx={{ color: '#fff', fontWeight: 'bold', fontSize: '0.75rem', mt: 0.5 }}>{t.name}</Typography>
                                        </CardActionArea>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>

                        {selectedTemplate && (
                            <>
                                <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.05)' }} />
                                <Typography variant="h6" sx={{ color: '#fff', mb: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <ThemeIcon sx={{ color: 'var(--accent-gold)' }} /> 2. CUSTOMIZE DATA
                                </Typography>

                                <Box sx={{ mb: 4, display: 'flex', gap: 2 }}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel sx={{ color: '#aaa' }}>Visual Theme</InputLabel>
                                        <Select 
                                            value={selectedTheme} 
                                            onChange={(e) => setSelectedTheme(e.target.value)} 
                                            label="Visual Theme"
                                            sx={{ color: '#fff', '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.1)' } }}
                                        >
                                            {themes.map(th => <MenuItem key={th} value={th}>{th}</MenuItem>)}
                                        </Select>
                                    </FormControl>
                                </Box>

                                <Grid container spacing={2}>
                                    {selectedTemplate.fields.map(field => (
                                        <Grid size={{ xs: 12, md: 6 }} key={field}>
                                            <TextField
                                                fullWidth
                                                label={field}
                                                size="small"
                                                variant="filled"
                                                value={fieldValues[field] || ''}
                                                onChange={(e) => handleFieldChange(field, e.target.value)}
                                                sx={{ 
                                                    '& .MuiFilledInput-root': { bgcolor: 'rgba(255,255,255,0.03)', borderRadius: 1 },
                                                    '& .MuiInputLabel-root': { color: 'var(--text-secondary)' },
                                                    '& .MuiFilledInput-input': { color: '#fff' }
                                                }}
                                            />
                                        </Grid>
                                    ))}
                                </Grid>

                                <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
                                    <Button 
                                        variant="contained" 
                                        size="large"
                                        startIcon={renderJob?.status === 'processing' ? <CircularProgress size={20} color="inherit" /> : <RenderIcon />}
                                        disabled={renderJob?.status === 'processing'}
                                        onClick={handleRender}
                                        sx={{ bgcolor: 'var(--accent-gold)', color: '#000', px: 4, fontWeight: 'bold', '&:hover': { bgcolor: '#fff' } }}
                                    >
                                        RENDER STANDALONE SCENE
                                    </Button>
                                </Box>
                            </>
                        )}
                    </Paper>
                </Grid>

                {/* Right: Preview & Jobs */}
                <Grid size={{ xs: 12, lg: 5 }}>
                    <Paper sx={{ p: 3, bgcolor: '#000', borderRadius: 3, border: '1px solid var(--border-color)', minHeight: 400, position: 'relative', overflow: 'hidden' }}>
                        {renderJob?.url ? (
                            <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
                                <video src={renderJob.url} controls autoPlay loop style={{ width: '100%', borderRadius: 12 }} />
                                <Box sx={{ mt: 3, p: 2, bgcolor: 'rgba(76,175,80,0.1)', border: '1px solid #4caf50', borderRadius: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Box>
                                        <Typography variant="body2" sx={{ color: '#4caf50', fontWeight: 'bold' }}>RENDER SUCCESSFUL</Typography>
                                        <Typography variant="caption" sx={{ color: '#aaa' }}>{renderJob.url}</Typography>
                                    </Box>
                                    <Tooltip title="Copy Link"><IconButton onClick={() => navigator.clipboard.writeText(window.location.origin + renderJob.url)} sx={{ color: '#4caf50' }}><CopyIcon /></IconButton></Tooltip>
                                </Box>
                            </Box>
                        ) : renderJob ? (
                            <Box sx={{ py: 10, textAlign: 'center' }}>
                                <CircularProgress size={60} sx={{ color: 'var(--accent-gold)', mb: 3 }} />
                                <Typography variant="h6" sx={{ color: '#fff' }}>{renderJob.message}</Typography>
                                <Typography variant="caption" sx={{ color: '#aaa' }}>Progress: {Math.round(renderJob.progress || 0)}%</Typography>
                                <LinearProgress variant="determinate" value={renderJob.progress || 0} sx={{ width: '70%', mx: 'auto', mt: 3, height: 6, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.1)', '& .MuiLinearProgress-bar': { bgcolor: 'var(--accent-gold)' } }} />
                                {renderJob.status === 'error' && <Alert severity="error" sx={{ mt: 3, mx: 2 }}>{renderJob.error}</Alert>}
                            </Box>
                        ) : (
                            <Box sx={{ py: 15, textAlign: 'center', opacity: 0.3 }}>
                                <MovieIcon sx={{ fontSize: 100, color: '#fff', mb: 2 }} />
                                <Typography variant="h6" sx={{ color: '#fff' }}>NO ACTIVE RENDER</Typography>
                                <Typography variant="body2" sx={{ color: '#fff' }}>Configure and click Render to preview.</Typography>
                            </Box>
                        )}
                    </Paper>

                    <Paper sx={{ p: 3, mt: 3, bgcolor: 'var(--bg-secondary)', borderRadius: 3, border: '1px solid var(--border-color)' }}>
                        <Typography variant="h6" sx={{ color: '#fff', mb: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <ListIcon sx={{ color: 'var(--accent-gold)' }} /> RECENT RENDERS
                        </Typography>
                        <Stack spacing={1}>
                            {renderHistory.length === 0 ? (
                                <Typography variant="caption" sx={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>No renders this session.</Typography>
                            ) : (
                                renderHistory.map(job => (
                                    <Box key={job.id} sx={{ p: 1.5, bgcolor: 'rgba(255,255,255,0.02)', borderRadius: 2, border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <DoneIcon sx={{ color: '#4caf50', fontSize: 16 }} />
                                            <Typography variant="caption" sx={{ color: '#fff', fontWeight: 'bold' }}>{job.id.substring(0, 8)}</Typography>
                                        </Box>
                                        <Button size="small" onClick={() => setRenderJob(job)} sx={{ color: 'var(--accent-gold)', fontSize: '0.7rem' }}>View</Button>
                                    </Box>
                                ))
                            )}
                        </Stack>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default SceneStudioView;