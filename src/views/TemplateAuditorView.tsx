import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Box, Typography, Button, LinearProgress, Chip, Stack, Grid,
    Card, CardContent, CardMedia, Divider, Tooltip, CircularProgress,
    ToggleButtonGroup, ToggleButton, Alert, IconButton,
} from '@mui/material';
import {
    BugReport as AuditIcon,
    AutoFixHigh as FixIcon,
    CheckCircle as CleanIcon,
    Error as ErrorIcon,
    Warning as WarnIcon,
    Refresh as RefreshIcon,
    Image as ImageIcon,
    Close as CloseIcon,
} from '@mui/icons-material';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Issue {
    source: string;
    id: string;
    severity: 'error' | 'warning' | 'info';
    description: string;
    detail?: string;
    location?: string;
    fix_hint?: string;
    file?: string;
}

interface TemplateResult {
    name: string;
    filename: string;
    issues: Issue[];
    screenshotUrl: string | null;
}

type Filter = 'all' | 'errors' | 'warnings' | 'clean';

// ─── Severity helpers ─────────────────────────────────────────────────────────

const SEV_COLOR: Record<string, 'error' | 'warning' | 'info' | 'default'> = {
    error: 'error', warning: 'warning', info: 'info',
};

function maxSeverity(issues: Issue[]): 'error' | 'warning' | 'clean' {
    if (issues.some(i => i.severity === 'error'))   return 'error';
    if (issues.some(i => i.severity === 'warning')) return 'warning';
    return 'clean';
}

// ─── TemplateCard ─────────────────────────────────────────────────────────────

function TemplateCard({ result, onFix, fixing }: {
    result: TemplateResult;
    onFix: (filename: string) => void;
    fixing: boolean;
}) {
    const sev = maxSeverity(result.issues);
    const borderColor = sev === 'error' ? '#e63946' : sev === 'warning' ? '#f4a261' : '#2a9d5c';

    return (
        <Card sx={{
            bgcolor: 'var(--bg-secondary)',
            border: `1px solid ${borderColor}44`,
            borderLeft: `3px solid ${borderColor}`,
            height: '100%',
        }}>
            {/* Screenshot */}
            {result.screenshotUrl ? (
                <CardMedia
                    component="img"
                    image={result.screenshotUrl}
                    alt={result.name}
                    sx={{ height: 120, objectFit: 'cover', bgcolor: '#111' }}
                />
            ) : (
                <Box sx={{
                    height: 120, bgcolor: '#111', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                }}>
                    <ImageIcon sx={{ color: '#333', fontSize: 36 }} />
                </Box>
            )}

            <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                {/* Header */}
                <Stack direction="row" alignItems="center" justifyContent="space-between" mb={0.5}>
                    <Typography sx={{ fontSize: '0.72rem', fontWeight: 'bold', color: 'var(--text-primary)', fontFamily: 'monospace' }}>
                        {result.filename}
                    </Typography>
                    {sev === 'clean' && <CleanIcon sx={{ fontSize: 16, color: '#2a9d5c' }} />}
                    {sev === 'error' && <ErrorIcon sx={{ fontSize: 16, color: '#e63946' }} />}
                    {sev === 'warning' && <WarnIcon sx={{ fontSize: 16, color: '#f4a261' }} />}
                </Stack>

                {/* Issue list */}
                {result.issues.length === 0 ? (
                    <Typography sx={{ fontSize: '0.65rem', color: '#2a9d5c' }}>No issues found</Typography>
                ) : (
                    <Stack spacing={0.4} mb={1}>
                        {result.issues.map((issue, i) => (
                            <Tooltip key={i} title={issue.fix_hint || issue.detail || ''} placement="top" arrow>
                                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5 }}>
                                    <Chip
                                        label={issue.severity}
                                        size="small"
                                        color={SEV_COLOR[issue.severity] || 'default'}
                                        sx={{ fontSize: '0.55rem', height: 16, flexShrink: 0 }}
                                    />
                                    <Typography sx={{ fontSize: '0.62rem', color: 'var(--text-secondary)', lineHeight: 1.3 }}>
                                        {issue.description}
                                    </Typography>
                                </Box>
                            </Tooltip>
                        ))}
                    </Stack>
                )}

                {/* Fix button */}
                {result.issues.some(i => i.severity === 'error' || i.severity === 'warning') && (
                    <Button
                        size="small"
                        variant="outlined"
                        startIcon={fixing ? <CircularProgress size={10} /> : <FixIcon />}
                        disabled={fixing}
                        onClick={() => onFix(result.filename)}
                        sx={{
                            fontSize: '0.62rem', py: 0.3, px: 1,
                            borderColor: 'var(--accent-gold)', color: 'var(--accent-gold)',
                            '&:hover': { bgcolor: 'rgba(201,169,97,0.1)' },
                        }}
                    >
                        {fixing ? 'Fixing...' : 'Auto-Fix'}
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}

// ─── Main View ────────────────────────────────────────────────────────────────

const TemplateAuditorView: React.FC = () => {
    const [results, setResults]       = useState<TemplateResult[]>([]);
    const [running, setRunning]       = useState(false);
    const [progress, setProgress]     = useState(0);
    const [currentFile, setCurrentFile] = useState('');
    const [currentStage, setCurrentStage] = useState('');
    const [filter, setFilter]         = useState<Filter>('all');
    const [fixing, setFixing]         = useState<Record<string, boolean>>({});
    const [fixAllRunning, setFixAllRunning] = useState(false);
    const [alert, setAlert]           = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
    const [skipRender, setSkipRender] = useState(false);
    const esRef = useRef<EventSource | null>(null);

    // Load last report on mount
    useEffect(() => {
        fetch('/api/audit/report')
            .then(r => r.json())
            .then(data => { if (data?.results) setResults(data.results); })
            .catch(() => {});
    }, []);

    const startAudit = useCallback(() => {
        if (running) return;
        setRunning(true);
        setResults([]);
        setProgress(0);
        setCurrentFile('');
        setAlert(null);

        fetch('/api/audit/start', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ skipRender }),
        })
            .then(r => r.json())
            .then(({ jobId }) => {
                const es = new EventSource(`/api/audit/stream/${jobId}`);
                esRef.current = es;

                es.onmessage = (e) => {
                    const event = JSON.parse(e.data);

                    if (event.type === 'template_start') {
                        setCurrentFile(event.filename);
                        setProgress(Math.round((event.index / event.total) * 100));
                    }
                    if (event.type === 'stage') {
                        setCurrentStage(event.message || event.stage);
                    }
                    if (event.type === 'template_done') {
                        setResults(prev => {
                            const existing = prev.findIndex(r => r.filename === event.result.filename);
                            if (existing >= 0) {
                                const updated = [...prev];
                                updated[existing] = event.result;
                                return updated;
                            }
                            return [...prev, event.result];
                        });
                    }
                    if (event.type === 'complete') {
                        setProgress(100);
                        setRunning(false);
                        setCurrentFile('');
                        setCurrentStage('');
                        es.close();
                        const s = event.summary;
                        if (s) setAlert({ type: 'success', msg: `Done — ${s.templates} templates: ${s.clean} clean, ${s.errors} errors, ${s.warnings} warnings` });
                    }
                    if (event.type === 'error') {
                        setRunning(false);
                        setAlert({ type: 'error', msg: event.message });
                        es.close();
                    }
                };

                es.onerror = () => {
                    setRunning(false);
                    setAlert({ type: 'error', msg: 'Connection to audit stream lost' });
                    es.close();
                };
            })
            .catch(err => {
                setRunning(false);
                setAlert({ type: 'error', msg: err.message });
            });
    }, [running, skipRender]);

    const fixTemplate = useCallback(async (filename: string) => {
        setFixing(f => ({ ...f, [filename]: true }));
        try {
            const r = await fetch('/api/audit/fix', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ filename }),
            });
            const data = await r.json();
            if (data.success) {
                setAlert({ type: 'success', msg: `Fixed: ${filename}` });
                // Mark issues resolved in local state
                setResults(prev => prev.map(res =>
                    res.filename === filename ? { ...res, issues: [] } : res
                ));
            } else {
                setAlert({ type: 'error', msg: data.error || 'Fix failed' });
            }
        } catch (err: any) {
            setAlert({ type: 'error', msg: err.message });
        }
        setFixing(f => ({ ...f, [filename]: false }));
    }, []);

    const fixAll = useCallback(async () => {
        const toFix = results.filter(r => r.issues.some(i => i.severity === 'error' || i.severity === 'warning'));
        if (toFix.length === 0) return;
        setFixAllRunning(true);
        let fixed = 0;
        for (const r of toFix) {
            try {
                const res = await fetch('/api/audit/fix', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ filename: r.filename }),
                });
                const data = await res.json();
                if (data.success && data.fixed) {
                    fixed++;
                    setResults(prev => prev.map(p => p.filename === r.filename ? { ...p, issues: [] } : p));
                }
            } catch {}
        }
        setFixAllRunning(false);
        setAlert({ type: 'success', msg: `Auto-fixed ${fixed} of ${toFix.length} templates` });
    }, [results]);

    // Filtered results
    const filtered = results.filter(r => {
        if (filter === 'errors')   return r.issues.some(i => i.severity === 'error');
        if (filter === 'warnings') return r.issues.some(i => i.severity === 'warning') && !r.issues.some(i => i.severity === 'error');
        if (filter === 'clean')    return r.issues.length === 0;
        return true;
    });

    // Summary counts
    const totalErrors   = results.reduce((n, r) => n + r.issues.filter(i => i.severity === 'error').length, 0);
    const totalWarnings = results.reduce((n, r) => n + r.issues.filter(i => i.severity === 'warning').length, 0);
    const totalClean    = results.filter(r => r.issues.length === 0).length;
    const withIssues    = results.filter(r => r.issues.some(i => i.severity === 'error' || i.severity === 'warning')).length;

    return (
        <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto' }}>
            {/* Header */}
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
                <Box>
                    <Typography variant="h5" sx={{ color: 'var(--accent-gold)', fontWeight: 'bold', letterSpacing: '2px' }}>
                        TEMPLATE AUDITOR
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'var(--text-secondary)' }}>
                        Vision: gemini-2.5-pro &nbsp;·&nbsp; Fix: gemini-2.5-flash &nbsp;·&nbsp; {results.length} templates loaded
                    </Typography>
                </Box>

                <Stack direction="row" spacing={1} alignItems="center">
                    {/* Skip render toggle */}
                    <Tooltip title={skipRender ? 'Static analysis only (fast)' : 'Full render + vision analysis'}>
                        <Chip
                            label={skipRender ? 'Static Only' : 'Full Audit'}
                            size="small"
                            onClick={() => !running && setSkipRender(s => !s)}
                            sx={{
                                cursor: running ? 'default' : 'pointer',
                                bgcolor: skipRender ? 'rgba(74,95,127,0.3)' : 'rgba(201,169,97,0.15)',
                                color: skipRender ? '#4A5F7F' : 'var(--accent-gold)',
                                border: `1px solid ${skipRender ? '#4A5F7F' : 'var(--accent-gold)'}44`,
                            }}
                        />
                    </Tooltip>

                    <Button
                        variant="outlined"
                        startIcon={running ? <CircularProgress size={14} /> : <AuditIcon />}
                        disabled={running}
                        onClick={startAudit}
                        sx={{
                            borderColor: 'var(--accent-gold)', color: 'var(--accent-gold)',
                            '&:hover': { bgcolor: 'rgba(201,169,97,0.1)' },
                            letterSpacing: '1px', fontSize: '0.8rem',
                        }}
                    >
                        {running ? 'Auditing...' : 'Audit All'}
                    </Button>

                    <Button
                        variant="contained"
                        startIcon={fixAllRunning ? <CircularProgress size={14} sx={{ color: '#fff' }} /> : <FixIcon />}
                        disabled={fixAllRunning || running || withIssues === 0}
                        onClick={fixAll}
                        sx={{
                            bgcolor: withIssues > 0 ? '#e63946' : 'rgba(255,255,255,0.05)',
                            '&:hover': { bgcolor: '#c1121f' },
                            letterSpacing: '1px', fontSize: '0.8rem',
                        }}
                    >
                        {fixAllRunning ? 'Fixing...' : `Fix All (${withIssues})`}
                    </Button>
                </Stack>
            </Stack>

            {/* Alert */}
            {alert && (
                <Alert
                    severity={alert.type}
                    action={<IconButton size="small" onClick={() => setAlert(null)}><CloseIcon fontSize="small" /></IconButton>}
                    sx={{ mb: 2, bgcolor: alert.type === 'success' ? 'rgba(42,157,92,0.15)' : 'rgba(230,57,70,0.15)' }}
                >
                    {alert.msg}
                </Alert>
            )}

            {/* Progress */}
            {running && (
                <Box mb={3}>
                    <Stack direction="row" justifyContent="space-between" mb={0.5}>
                        <Typography sx={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                            {currentFile && `▶ ${currentFile}`} {currentStage && `— ${currentStage}`}
                        </Typography>
                        <Typography sx={{ fontSize: '0.75rem', color: 'var(--accent-gold)' }}>
                            {progress}%
                        </Typography>
                    </Stack>
                    <LinearProgress
                        variant="determinate"
                        value={progress}
                        sx={{
                            height: 4, borderRadius: 2,
                            bgcolor: 'rgba(255,255,255,0.06)',
                            '& .MuiLinearProgress-bar': { bgcolor: 'var(--accent-gold)' },
                        }}
                    />
                </Box>
            )}

            {/* Summary chips */}
            {results.length > 0 && (
                <Stack direction="row" spacing={2} mb={2.5} flexWrap="wrap">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#888' }} />
                        <Typography sx={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                            {results.length} total
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#2a9d5c' }} />
                        <Typography sx={{ fontSize: '0.8rem', color: '#2a9d5c' }}>{totalClean} clean</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#f4a261' }} />
                        <Typography sx={{ fontSize: '0.8rem', color: '#f4a261' }}>{totalWarnings} warnings</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#e63946' }} />
                        <Typography sx={{ fontSize: '0.8rem', color: '#e63946' }}>{totalErrors} errors</Typography>
                    </Box>
                </Stack>
            )}

            {/* Filter tabs */}
            {results.length > 0 && (
                <ToggleButtonGroup
                    value={filter}
                    exclusive
                    onChange={(_, v) => v && setFilter(v)}
                    size="small"
                    sx={{ mb: 2.5 }}
                >
                    {([['all', 'All'], ['errors', 'Errors'], ['warnings', 'Warnings'], ['clean', 'Clean']] as [Filter, string][]).map(([val, label]) => (
                        <ToggleButton
                            key={val}
                            value={val}
                            sx={{
                                fontSize: '0.7rem', letterSpacing: '1px', px: 2,
                                color: 'var(--text-secondary)',
                                border: '1px solid var(--border-color) !important',
                                '&.Mui-selected': {
                                    bgcolor: 'rgba(201,169,97,0.15)',
                                    color: 'var(--accent-gold)',
                                    borderColor: 'var(--accent-gold) !important',
                                },
                                '&:hover': { bgcolor: 'rgba(255,255,255,0.04)' },
                            }}
                        >
                            {label}
                        </ToggleButton>
                    ))}
                </ToggleButtonGroup>
            )}

            {/* Template grid */}
            {filtered.length > 0 ? (
                <Grid container spacing={1.5}>
                    {filtered.map(result => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={result.filename}>
                            <TemplateCard
                                result={result}
                                onFix={fixTemplate}
                                fixing={!!fixing[result.filename]}
                            />
                        </Grid>
                    ))}
                </Grid>
            ) : !running && results.length === 0 ? (
                <Box sx={{
                    textAlign: 'center', py: 10, color: 'var(--text-secondary)',
                    border: '1px dashed var(--border-color)', borderRadius: 2,
                }}>
                    <AuditIcon sx={{ fontSize: 48, mb: 2, opacity: 0.3 }} />
                    <Typography variant="h6" sx={{ mb: 1, opacity: 0.5 }}>No audit results yet</Typography>
                    <Typography variant="body2" sx={{ opacity: 0.4 }}>
                        Click <strong>Audit All</strong> to scan all {85} templates with Gemini Vision
                    </Typography>
                </Box>
            ) : null}
        </Box>
    );
};

export default TemplateAuditorView;
