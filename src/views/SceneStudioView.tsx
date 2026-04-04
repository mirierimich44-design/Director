import React, { useState, useEffect, useRef } from 'react';
import {
    Box, Typography, Grid, Card, CardActionArea,
    Button, TextField, CircularProgress, Alert, IconButton,
    Stack, Paper, LinearProgress, MenuItem, Select,
    FormControl, InputLabel, Tooltip, InputAdornment, Chip, Divider
} from '@mui/material';
import {
    Movie as MovieIcon,
    PlayArrow as RenderIcon,
    CheckCircle as DoneIcon,
    ContentCopy as CopyIcon,
    Palette as ThemeIcon,
    Search as SearchIcon,
    AutoAwesome as AIIcon,
    List as ListIcon,
    Clear as ClearIcon
} from '@mui/icons-material';

interface Template {
    id: string;
    name: string;
    description: string;
    category: string;
    tags: string[];
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

const CATEGORY_COLORS: Record<string, string> = {
    charts: '#4fc3f7',
    timeline: '#81c784',
    network: '#ff8a65',
    map: '#ce93d8',
    flow: '#ffb74d',
    code: '#a5d6a7',
    evidence: '#f48fb1',
    person: '#80deea',
    organization: '#b39ddb',
    financial: '#fff176',
    comparison: '#90caf9',
    social: '#ef9a9a',
    general: '#aaaaaa',
};

const SceneStudioView: React.FC = () => {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [themes, setThemes] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    // Step 1
    const [script, setScript] = useState('');
    const [search, setSearch] = useState('');
    const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
    const [selectedTheme, setSelectedTheme] = useState('THREAT');

    // Step 2 — AI-filled fields (editable)
    const [analyzing, setAnalyzing] = useState(false);
    const [analyzeError, setAnalyzeError] = useState<string | null>(null);
    const [fieldValues, setFieldValues] = useState<Record<string, string> | null>(null);

    // Step 3 — Render
    const [renderJob, setRenderJob] = useState<RenderJob | null>(null);
    const [renderHistory, setRenderHistory] = useState<{ job: RenderJob; template: string; theme: string }[]>([]);

    const evtSrcRef = useRef<EventSource | null>(null);

    useEffect(() => {
        (async () => {
            try {
                const [tRes, thRes] = await Promise.all([
                    fetch('/api/templates/library'),
                    fetch('/api/themes')
                ]);
                const tData = await tRes.json();
                const thData = await thRes.json();
                if (tData.success) setTemplates(tData.templates);
                if (thData.success) setThemes(thData.themes);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    useEffect(() => () => { evtSrcRef.current?.close(); }, []);

    // Selecting a new template clears previous analysis
    const handleSelectTemplate = (t: Template) => {
        setSelectedTemplate(prev => prev?.id === t.id ? null : t);
        setFieldValues(null);
        setAnalyzeError(null);
        setRenderJob(null);
    };

    const filteredTemplates = templates.filter(t => {
        if (!search) return true;
        const q = search.toLowerCase();
        return t.id.includes(q) || t.name.toLowerCase().includes(q) ||
            t.category.toLowerCase().includes(q) || (t.tags || []).some(tag => tag.toLowerCase().includes(q));
    });

    // Step 2: Ask Gemini to analyze + fill fields
    const handleAnalyze = async () => {
        if (!script.trim() || !selectedTemplate) return;
        setAnalyzing(true);
        setAnalyzeError(null);
        setFieldValues(null);
        setRenderJob(null);

        try {
            const res = await fetch('/api/scene-studio/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ script, templateId: selectedTemplate.id })
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.error);
            setFieldValues(data.content);
        } catch (err: any) {
            setAnalyzeError(err.message);
        } finally {
            setAnalyzing(false);
        }
    };

    // Step 3: Render with (possibly edited) field values
    const handleGenerate = async () => {
        if (!selectedTemplate || !fieldValues) return;

        evtSrcRef.current?.close();
        setRenderJob({ id: 'init', status: 'processing', progress: 0, message: 'Starting render...' });

        try {
            const res = await fetch('/api/scene-studio/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ templateId: selectedTemplate.id, theme: selectedTheme, content: fieldValues })
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.error);

            setRenderJob({ id: data.jobId, status: 'processing', progress: 0, message: 'Render started...' });

            const evtSrc = new EventSource(`/api/render-progress/${data.jobId}`);
            evtSrcRef.current = evtSrc;

            evtSrc.onmessage = (e) => {
                const job = JSON.parse(e.data);
                setRenderJob(prev => prev ? { ...prev, ...job } : job);
                if (job.status === 'completed') {
                    evtSrc.close();
                    setRenderHistory(prev => [
                        { job: { ...job, id: data.jobId }, template: selectedTemplate.id, theme: selectedTheme },
                        ...prev
                    ].slice(0, 8));
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

    const canAnalyze = script.trim().length > 0 && selectedTemplate !== null && !analyzing;
    const canGenerate = fieldValues !== null && renderJob?.status !== 'processing';

    if (loading) return (
        <Box sx={{ p: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress sx={{ color: 'var(--accent-gold)' }} />
        </Box>
    );

    return (
        <Box sx={{ p: 4, height: '100%', overflow: 'auto' }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" sx={{ color: 'var(--accent-gold)', fontWeight: 'bold', mb: 0.5 }}>
                    SCENE STUDIO
                </Typography>
                <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
                    Paste your script, pick a template — Gemini fills the data, you hit Generate.
                </Typography>
            </Box>

            <Grid container spacing={3}>
                {/* ── LEFT: Script + Template ── */}
                <Grid size={{ xs: 12, lg: 7 }}>

                    {/* Step 1: Script */}
                    <Paper sx={{ p: 3, mb: 3, bgcolor: 'var(--bg-secondary)', borderRadius: 3, border: '1px solid var(--border-color)' }}>
                        <Typography variant="overline" sx={{ color: 'var(--accent-gold)', letterSpacing: 2, mb: 1.5, display: 'block' }}>
                            1 — SCRIPT LINES
                        </Typography>
                        <TextField
                            fullWidth
                            multiline
                            minRows={3}
                            maxRows={7}
                            placeholder={`Paste your script lines here...\n\n"Can you think of any reason that China would target your little community?"`}
                            value={script}
                            onChange={e => { setScript(e.target.value); setFieldValues(null); setAnalyzeError(null); }}
                            InputProps={{
                                endAdornment: script ? (
                                    <InputAdornment position="end" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                                        <IconButton size="small" onClick={() => { setScript(''); setFieldValues(null); }} sx={{ color: '#666' }}>
                                            <ClearIcon fontSize="small" />
                                        </IconButton>
                                    </InputAdornment>
                                ) : undefined
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    bgcolor: 'rgba(255,255,255,0.02)', color: '#fff',
                                    fontSize: '0.95rem', lineHeight: 1.6,
                                    '& fieldset': { borderColor: 'rgba(255,255,255,0.08)' },
                                    '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                                    '&.Mui-focused fieldset': { borderColor: 'var(--accent-gold)' }
                                },
                                '& .MuiOutlinedInput-input::placeholder': { color: '#555', opacity: 1 }
                            }}
                        />
                    </Paper>

                    {/* Step 2: Template + Theme + Analyze */}
                    <Paper sx={{ p: 3, bgcolor: 'var(--bg-secondary)', borderRadius: 3, border: '1px solid var(--border-color)' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                            <Typography variant="overline" sx={{ color: 'var(--accent-gold)', letterSpacing: 2 }}>
                                2 — SELECT TEMPLATE
                            </Typography>
                            <FormControl size="small" sx={{ minWidth: 150 }}>
                                <InputLabel sx={{ color: '#888', fontSize: '0.8rem' }}>Theme</InputLabel>
                                <Select
                                    value={selectedTheme}
                                    onChange={e => setSelectedTheme(e.target.value)}
                                    label="Theme"
                                    startAdornment={<ThemeIcon sx={{ color: 'var(--accent-gold)', fontSize: 16, mr: 0.5 }} />}
                                    sx={{
                                        color: '#fff', fontSize: '0.85rem',
                                        '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.1)' },
                                        '& .MuiSelect-icon': { color: '#888' }
                                    }}
                                >
                                    {themes.map(th => <MenuItem key={th} value={th} sx={{ fontSize: '0.85rem' }}>{th}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Box>

                        <TextField
                            fullWidth size="small"
                            placeholder="Search by name, category, tag..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            InputProps={{
                                startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#666', fontSize: 18 }} /></InputAdornment>,
                                endAdornment: search ? (
                                    <InputAdornment position="end">
                                        <IconButton size="small" onClick={() => setSearch('')} sx={{ color: '#555' }}>
                                            <ClearIcon fontSize="small" />
                                        </IconButton>
                                    </InputAdornment>
                                ) : undefined
                            }}
                            sx={{
                                mb: 2,
                                '& .MuiOutlinedInput-root': {
                                    bgcolor: 'rgba(255,255,255,0.02)', color: '#fff',
                                    '& fieldset': { borderColor: 'rgba(255,255,255,0.08)' },
                                    '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.15)' },
                                    '&.Mui-focused fieldset': { borderColor: 'var(--accent-gold)' }
                                }
                            }}
                        />

                        <Box sx={{ maxHeight: 300, overflow: 'auto', pr: 0.5, mb: 2 }}>
                            <Grid container spacing={1.5}>
                                {filteredTemplates.map(t => {
                                    const isSelected = selectedTemplate?.id === t.id;
                                    const catColor = CATEGORY_COLORS[t.category] || '#aaa';
                                    return (
                                        <Grid size={{ xs: 6, sm: 4 }} key={t.id}>
                                            <Card sx={{
                                                bgcolor: isSelected ? 'rgba(201,169,97,0.12)' : 'rgba(255,255,255,0.02)',
                                                border: `1px solid ${isSelected ? 'var(--accent-gold)' : 'rgba(255,255,255,0.05)'}`,
                                                borderRadius: 2, transition: 'all 0.15s',
                                                '&:hover': { border: `1px solid ${isSelected ? 'var(--accent-gold)' : 'rgba(255,255,255,0.18)'}` }
                                            }}>
                                                <CardActionArea onClick={() => handleSelectTemplate(t)} sx={{ p: 1.5 }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.3 }}>
                                                        <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: catColor, flexShrink: 0 }} />
                                                        <Typography variant="caption" sx={{ color: catColor, fontFamily: 'monospace', fontSize: '0.6rem' }}>{t.category}</Typography>
                                                    </Box>
                                                    <Typography variant="caption" sx={{ color: '#777', fontFamily: 'monospace', fontSize: '0.58rem', display: 'block' }}>{t.id}</Typography>
                                                    <Typography variant="body2" sx={{ color: '#fff', fontWeight: 'bold', fontSize: '0.72rem', mt: 0.2, lineHeight: 1.3 }}>{t.name}</Typography>
                                                </CardActionArea>
                                            </Card>
                                        </Grid>
                                    );
                                })}
                                {filteredTemplates.length === 0 && (
                                    <Grid size={{ xs: 12 }}>
                                        <Typography variant="body2" sx={{ color: '#555', textAlign: 'center', py: 3 }}>No templates match "{search}"</Typography>
                                    </Grid>
                                )}
                            </Grid>
                        </Box>

                        {/* Analyze button */}
                        <Button
                            fullWidth variant="outlined" size="large"
                            startIcon={analyzing ? <CircularProgress size={18} color="inherit" /> : <AIIcon />}
                            disabled={!canAnalyze}
                            onClick={handleAnalyze}
                            sx={{
                                borderColor: canAnalyze ? 'var(--accent-gold)' : 'rgba(255,255,255,0.08)',
                                color: canAnalyze ? 'var(--accent-gold)' : '#444',
                                fontWeight: 'bold', letterSpacing: 1,
                                '&:hover': { bgcolor: 'rgba(201,169,97,0.08)', borderColor: 'var(--accent-gold)' },
                                '&.Mui-disabled': { borderColor: 'rgba(255,255,255,0.05)', color: '#444' }
                            }}
                        >
                            {analyzing ? 'ANALYZING...' : 'ANALYZE WITH GEMINI'}
                        </Button>

                        {analyzeError && (
                            <Alert severity="error" sx={{ mt: 2, bgcolor: 'rgba(244,67,54,0.08)', color: '#f44336', border: '1px solid rgba(244,67,54,0.2)', fontSize: '0.8rem' }}>
                                {analyzeError}
                            </Alert>
                        )}

                        {!script.trim() && !selectedTemplate && (
                            <Typography variant="caption" sx={{ color: '#444', display: 'block', textAlign: 'center', mt: 1 }}>
                                Paste a script and select a template to enable analysis
                            </Typography>
                        )}
                    </Paper>

                    {/* Step 3: AI-filled fields (editable) + Generate */}
                    {fieldValues && (
                        <Paper sx={{ p: 3, mt: 3, bgcolor: 'var(--bg-secondary)', borderRadius: 3, border: '1px solid rgba(201,169,97,0.25)' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
                                <Typography variant="overline" sx={{ color: 'var(--accent-gold)', letterSpacing: 2 }}>
                                    3 — REVIEW & GENERATE
                                </Typography>
                                <Chip
                                    icon={<AIIcon sx={{ fontSize: '14px !important' }} />}
                                    label="Filled by Gemini"
                                    size="small"
                                    sx={{ bgcolor: 'rgba(201,169,97,0.1)', color: 'var(--accent-gold)', border: '1px solid rgba(201,169,97,0.3)', fontSize: '0.65rem' }}
                                />
                            </Box>

                            <Grid container spacing={2} sx={{ mb: 3 }}>
                                {Object.entries(fieldValues).map(([key, val]) => (
                                    <Grid size={{ xs: 12, md: 6 }} key={key}>
                                        <TextField
                                            fullWidth size="small" label={key}
                                            value={val}
                                            onChange={e => setFieldValues(prev => prev ? { ...prev, [key]: e.target.value } : prev)}
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    bgcolor: 'rgba(255,255,255,0.03)', color: '#fff',
                                                    '& fieldset': { borderColor: 'rgba(255,255,255,0.08)' },
                                                    '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                                                    '&.Mui-focused fieldset': { borderColor: 'var(--accent-gold)' }
                                                },
                                                '& .MuiInputLabel-root': { color: '#666', fontSize: '0.75rem' },
                                                '& .MuiInputLabel-root.Mui-focused': { color: 'var(--accent-gold)' }
                                            }}
                                        />
                                    </Grid>
                                ))}
                            </Grid>

                            <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)', mb: 3 }} />

                            <Button
                                fullWidth variant="contained" size="large"
                                startIcon={renderJob?.status === 'processing' ? <CircularProgress size={18} color="inherit" /> : <RenderIcon />}
                                disabled={!canGenerate}
                                onClick={handleGenerate}
                                sx={{
                                    bgcolor: canGenerate ? 'var(--accent-gold)' : 'rgba(255,255,255,0.05)',
                                    color: canGenerate ? '#000' : '#444',
                                    fontWeight: 'bold', fontSize: '0.9rem', letterSpacing: 1, py: 1.5,
                                    '&:hover': { bgcolor: canGenerate ? '#fff' : undefined },
                                    '&.Mui-disabled': { bgcolor: 'rgba(255,255,255,0.05)', color: '#444' }
                                }}
                            >
                                {renderJob?.status === 'processing' ? 'RENDERING...' : 'GENERATE SCENE'}
                            </Button>
                        </Paper>
                    )}
                </Grid>

                {/* ── RIGHT: Preview + History ── */}
                <Grid size={{ xs: 12, lg: 5 }}>
                    <Paper sx={{ p: 0, bgcolor: '#000', borderRadius: 3, border: '1px solid var(--border-color)', overflow: 'hidden', minHeight: 260 }}>
                        {renderJob?.url ? (
                            <Box>
                                <video src={renderJob.url} controls autoPlay loop style={{ width: '100%', display: 'block' }} />
                                <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'rgba(76,175,80,0.08)', borderTop: '1px solid rgba(76,175,80,0.2)' }}>
                                    <Box>
                                        <Typography variant="caption" sx={{ color: '#4caf50', fontWeight: 'bold', display: 'block' }}>RENDER COMPLETE</Typography>
                                        <Typography variant="caption" sx={{ color: '#666', fontFamily: 'monospace', fontSize: '0.65rem' }}>{renderJob.url}</Typography>
                                    </Box>
                                    <Tooltip title="Copy link">
                                        <IconButton size="small" onClick={() => navigator.clipboard.writeText(window.location.origin + renderJob.url!)} sx={{ color: '#4caf50' }}>
                                            <CopyIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                            </Box>
                        ) : renderJob && renderJob.status !== 'error' ? (
                            <Box sx={{ py: 8, px: 3, textAlign: 'center' }}>
                                <CircularProgress size={48} sx={{ color: 'var(--accent-gold)', mb: 2 }} />
                                <Typography variant="body2" sx={{ color: '#fff', mb: 0.5 }}>{renderJob.message}</Typography>
                                <Typography variant="caption" sx={{ color: '#666' }}>{Math.round(renderJob.progress || 0)}%</Typography>
                                <LinearProgress
                                    variant="determinate" value={renderJob.progress || 0}
                                    sx={{ width: '80%', mx: 'auto', mt: 2, height: 4, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.05)', '& .MuiLinearProgress-bar': { bgcolor: 'var(--accent-gold)' } }}
                                />
                            </Box>
                        ) : renderJob?.status === 'error' ? (
                            <Box sx={{ p: 3 }}>
                                <Alert severity="error" sx={{ bgcolor: 'rgba(244,67,54,0.1)', color: '#f44336', border: '1px solid rgba(244,67,54,0.2)' }}>
                                    {renderJob.error}
                                </Alert>
                            </Box>
                        ) : (
                            <Box sx={{ py: 10, textAlign: 'center', opacity: 0.15 }}>
                                <MovieIcon sx={{ fontSize: 80, color: '#fff', mb: 1 }} />
                                <Typography variant="body2" sx={{ color: '#fff' }}>Preview will appear here</Typography>
                            </Box>
                        )}
                    </Paper>

                    {renderHistory.length > 0 && (
                        <Paper sx={{ p: 2.5, mt: 2, bgcolor: 'var(--bg-secondary)', borderRadius: 3, border: '1px solid var(--border-color)' }}>
                            <Typography variant="overline" sx={{ color: '#666', letterSpacing: 2, fontSize: '0.65rem', display: 'block', mb: 1.5 }}>
                                <ListIcon sx={{ fontSize: 12, mr: 0.5, verticalAlign: 'middle' }} />
                                RECENT RENDERS
                            </Typography>
                            <Stack spacing={1}>
                                {renderHistory.map((h, i) => (
                                    <Box key={i} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1, bgcolor: 'rgba(255,255,255,0.02)', borderRadius: 1.5, border: '1px solid rgba(255,255,255,0.04)' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <DoneIcon sx={{ color: '#4caf50', fontSize: 14 }} />
                                            <Box>
                                                <Typography variant="caption" sx={{ color: '#fff', fontWeight: 'bold', display: 'block', fontSize: '0.7rem' }}>{h.template}</Typography>
                                                <Typography variant="caption" sx={{ color: '#555', fontSize: '0.62rem' }}>{h.theme}</Typography>
                                            </Box>
                                        </Box>
                                        <Button size="small" onClick={() => setRenderJob(h.job)} sx={{ color: 'var(--accent-gold)', fontSize: '0.65rem', minWidth: 0, px: 1 }}>
                                            View
                                        </Button>
                                    </Box>
                                ))}
                            </Stack>
                        </Paper>
                    )}
                </Grid>
            </Grid>
        </Box>
    );
};

export default SceneStudioView;
