import React, { useState, useEffect, useRef } from 'react';
import {
    Box, Typography, Grid, Card, CardActionArea,
    Button, TextField, CircularProgress, Alert, IconButton,
    Stack, Paper, LinearProgress, MenuItem, Select,
    FormControl, InputLabel, Tooltip, InputAdornment, Chip
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

    const [script, setScript] = useState('');
    const [search, setSearch] = useState('');
    const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
    const [selectedTheme, setSelectedTheme] = useState('THREAT');

    const [renderJob, setRenderJob] = useState<RenderJob | null>(null);
    const [extractedFields, setExtractedFields] = useState<Record<string, string> | null>(null);
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

    const filteredTemplates = templates.filter(t => {
        if (!search) return true;
        const q = search.toLowerCase();
        return t.id.includes(q) || t.name.toLowerCase().includes(q) ||
            t.category.toLowerCase().includes(q) || (t.tags || []).some(tag => tag.toLowerCase().includes(q));
    });

    const handleGenerate = async () => {
        if (!script.trim() || !selectedTemplate) return;

        evtSrcRef.current?.close();
        setRenderJob({ id: 'init', status: 'processing', progress: 0, message: 'Asking AI to extract fields...' });
        setExtractedFields(null);

        try {
            const res = await fetch('/api/scene-studio/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ script, templateId: selectedTemplate.id, theme: selectedTheme })
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.error);

            setExtractedFields(data.content || null);
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

    const canGenerate = script.trim().length > 0 && selectedTemplate !== null && renderJob?.status !== 'processing';

    if (loading) return (
        <Box sx={{ p: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress sx={{ color: 'var(--accent-gold)' }} />
        </Box>
    );

    return (
        <Box sx={{ p: 4, height: '100%', overflow: 'auto' }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" sx={{ color: 'var(--accent-gold)', fontWeight: 'bold', mb: 0.5 }}>
                    SCENE STUDIO
                </Typography>
                <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
                    Paste your script, pick a template, and let AI generate the scene.
                </Typography>
            </Box>

            <Grid container spacing={3}>
                {/* ── LEFT COLUMN: Script + Template Picker ── */}
                <Grid size={{ xs: 12, lg: 7 }}>

                    {/* Step 1: Script */}
                    <Paper sx={{ p: 3, mb: 3, bgcolor: 'var(--bg-secondary)', borderRadius: 3, border: '1px solid var(--border-color)' }}>
                        <Typography variant="overline" sx={{ color: 'var(--accent-gold)', letterSpacing: 2, mb: 1.5, display: 'block' }}>
                            1 — SCRIPT LINES
                        </Typography>
                        <TextField
                            fullWidth
                            multiline
                            minRows={4}
                            maxRows={8}
                            placeholder={`Paste your script lines here...\n\n"Can you think of any reason that China would target your little community?" "That's the exact question I had for the FBI when they visited me on that first day," Lawler said.`}
                            value={script}
                            onChange={e => setScript(e.target.value)}
                            InputProps={{
                                endAdornment: script ? (
                                    <InputAdornment position="end" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                                        <IconButton size="small" onClick={() => setScript('')} sx={{ color: '#666' }}>
                                            <ClearIcon fontSize="small" />
                                        </IconButton>
                                    </InputAdornment>
                                ) : undefined
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    bgcolor: 'rgba(255,255,255,0.02)',
                                    color: '#fff',
                                    fontSize: '0.95rem',
                                    lineHeight: 1.6,
                                    '& fieldset': { borderColor: 'rgba(255,255,255,0.08)' },
                                    '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                                    '&.Mui-focused fieldset': { borderColor: 'var(--accent-gold)' }
                                },
                                '& .MuiOutlinedInput-input::placeholder': { color: '#555', opacity: 1 }
                            }}
                        />
                    </Paper>

                    {/* Step 2: Template + Theme */}
                    <Paper sx={{ p: 3, bgcolor: 'var(--bg-secondary)', borderRadius: 3, border: '1px solid var(--border-color)' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                            <Typography variant="overline" sx={{ color: 'var(--accent-gold)', letterSpacing: 2 }}>
                                2 — SELECT TEMPLATE
                            </Typography>
                            <FormControl size="small" sx={{ minWidth: 160 }}>
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
                            fullWidth
                            size="small"
                            placeholder="Search templates by name, category, or tag..."
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

                        <Box sx={{ maxHeight: 340, overflow: 'auto', pr: 0.5 }}>
                            <Grid container spacing={1.5}>
                                {filteredTemplates.map(t => {
                                    const isSelected = selectedTemplate?.id === t.id;
                                    const catColor = CATEGORY_COLORS[t.category] || '#aaa';
                                    return (
                                        <Grid size={{ xs: 6, sm: 4 }} key={t.id}>
                                            <Card sx={{
                                                bgcolor: isSelected ? 'rgba(201,169,97,0.12)' : 'rgba(255,255,255,0.02)',
                                                border: `1px solid ${isSelected ? 'var(--accent-gold)' : 'rgba(255,255,255,0.05)'}`,
                                                borderRadius: 2,
                                                transition: 'all 0.15s',
                                                '&:hover': { border: `1px solid ${isSelected ? 'var(--accent-gold)' : 'rgba(255,255,255,0.2)'}` }
                                            }}>
                                                <CardActionArea onClick={() => setSelectedTemplate(isSelected ? null : t)} sx={{ p: 1.5 }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                                                        <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: catColor, flexShrink: 0 }} />
                                                        <Typography variant="caption" sx={{ color: catColor, fontFamily: 'monospace', fontSize: '0.6rem', lineHeight: 1 }}>{t.category}</Typography>
                                                    </Box>
                                                    <Typography variant="caption" sx={{ color: '#888', fontFamily: 'monospace', fontSize: '0.6rem', display: 'block' }}>{t.id}</Typography>
                                                    <Typography variant="body2" sx={{ color: '#fff', fontWeight: 'bold', fontSize: '0.72rem', mt: 0.3, lineHeight: 1.3 }}>{t.name}</Typography>
                                                </CardActionArea>
                                            </Card>
                                        </Grid>
                                    );
                                })}
                            </Grid>
                            {filteredTemplates.length === 0 && (
                                <Typography variant="body2" sx={{ color: '#555', textAlign: 'center', py: 4 }}>No templates match "{search}"</Typography>
                            )}
                        </Box>

                        {selectedTemplate && (
                            <Box sx={{ mt: 2, p: 1.5, bgcolor: 'rgba(201,169,97,0.06)', borderRadius: 2, border: '1px solid rgba(201,169,97,0.2)' }}>
                                <Typography variant="caption" sx={{ color: 'var(--accent-gold)', fontWeight: 'bold', display: 'block', mb: 0.5 }}>
                                    {selectedTemplate.name}
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#aaa', display: 'block', mb: 1 }}>
                                    {selectedTemplate.description}
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                    {selectedTemplate.fields.map(f => (
                                        <Chip key={f} label={f} size="small" sx={{ height: 18, fontSize: '0.6rem', bgcolor: 'rgba(255,255,255,0.05)', color: '#aaa', '& .MuiChip-label': { px: 1 } }} />
                                    ))}
                                </Box>
                            </Box>
                        )}

                        {/* Generate Button */}
                        <Box sx={{ mt: 3 }}>
                            <Button
                                fullWidth
                                variant="contained"
                                size="large"
                                startIcon={renderJob?.status === 'processing'
                                    ? <CircularProgress size={18} color="inherit" />
                                    : <AIIcon />}
                                disabled={!canGenerate}
                                onClick={handleGenerate}
                                sx={{
                                    bgcolor: canGenerate ? 'var(--accent-gold)' : 'rgba(255,255,255,0.05)',
                                    color: canGenerate ? '#000' : '#444',
                                    fontWeight: 'bold',
                                    fontSize: '0.9rem',
                                    letterSpacing: 1,
                                    py: 1.5,
                                    '&:hover': { bgcolor: canGenerate ? '#fff' : undefined },
                                    '&.Mui-disabled': { bgcolor: 'rgba(255,255,255,0.05)', color: '#444' }
                                }}
                            >
                                {renderJob?.status === 'processing' ? 'GENERATING...' : 'GENERATE SCENE'}
                            </Button>
                            {(!script.trim() || !selectedTemplate) && (
                                <Typography variant="caption" sx={{ color: '#555', display: 'block', textAlign: 'center', mt: 1 }}>
                                    {!script.trim() ? 'Paste a script above' : 'Select a template'}
                                </Typography>
                            )}
                        </Box>
                    </Paper>
                </Grid>

                {/* ── RIGHT COLUMN: Preview + AI Fields + History ── */}
                <Grid size={{ xs: 12, lg: 5 }}>
                    {/* Video Preview */}
                    <Paper sx={{ p: 0, bgcolor: '#000', borderRadius: 3, border: '1px solid var(--border-color)', overflow: 'hidden', minHeight: 280 }}>
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
                                    variant="determinate"
                                    value={renderJob.progress || 0}
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
                            <Box sx={{ py: 10, textAlign: 'center', opacity: 0.2 }}>
                                <MovieIcon sx={{ fontSize: 80, color: '#fff', mb: 1 }} />
                                <Typography variant="body2" sx={{ color: '#fff' }}>Preview will appear here</Typography>
                            </Box>
                        )}
                    </Paper>

                    {/* AI Extracted Fields */}
                    {extractedFields && Object.keys(extractedFields).length > 0 && (
                        <Paper sx={{ p: 2.5, mt: 2, bgcolor: 'var(--bg-secondary)', borderRadius: 3, border: '1px solid rgba(201,169,97,0.2)' }}>
                            <Typography variant="overline" sx={{ color: 'var(--accent-gold)', letterSpacing: 2, fontSize: '0.65rem', display: 'block', mb: 1.5 }}>
                                AI EXTRACTED FIELDS
                            </Typography>
                            <Stack spacing={0.75}>
                                {Object.entries(extractedFields).map(([key, val]) => (
                                    <Box key={key} sx={{ display: 'flex', gap: 1.5, alignItems: 'baseline' }}>
                                        <Typography variant="caption" sx={{ color: '#666', fontFamily: 'monospace', fontSize: '0.65rem', flexShrink: 0, width: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {key}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: '#ccc', fontSize: '0.75rem', fontWeight: 500 }}>
                                            {String(val)}
                                        </Typography>
                                    </Box>
                                ))}
                            </Stack>
                        </Paper>
                    )}

                    {/* History */}
                    {renderHistory.length > 0 && (
                        <Paper sx={{ p: 2.5, mt: 2, bgcolor: 'var(--bg-secondary)', borderRadius: 3, border: '1px solid var(--border-color)' }}>
                            <Typography variant="overline" sx={{ color: '#888', letterSpacing: 2, fontSize: '0.65rem', display: 'block', mb: 1.5 }}>
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
