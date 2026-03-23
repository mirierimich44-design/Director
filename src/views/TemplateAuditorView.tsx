import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Box, Typography, Button, LinearProgress, Chip, Stack, Grid,
    Card, CardContent, CardMedia, Divider, Tooltip, CircularProgress,
    ToggleButtonGroup, ToggleButton, Alert, IconButton, Dialog,
    DialogTitle, DialogContent, DialogActions, TextField,
} from '@mui/material';
import {
    BugReport as AuditIcon,
    AutoFixHigh as FixIcon,
    CheckCircle as CleanIcon,
    Error as ErrorIcon,
    Warning as WarnIcon,
    Image as ImageIcon,
    Close as CloseIcon,
    Tune as TuneIcon,
    Check as CheckIcon,
    Preview as PreviewIcon,
    Save as SaveIcon,
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

// ─── Adjustment Preset Types ──────────────────────────────────────────────────

interface Preset {
    id: string;
    label: string;
    prompt: string;
}

interface PresetCategory {
    label: string;
    color: string;
    presets: Preset[];
}

// ─── Static preset data (mirrors server/adjustmentPresets.js) ─────────────────

const PRESET_CATEGORIES: Record<string, PresetCategory> = {
    typography: {
        label: 'Typography',
        color: '#4fc3f7',
        presets: [
            { id: 'font-decrease',    label: 'Decrease Font Size',     prompt: '' },
            { id: 'font-increase',    label: 'Increase Font Size',     prompt: '' },
            { id: 'tighter-spacing',  label: 'Tighter Letter Spacing', prompt: '' },
            { id: 'bolder',           label: 'Bolder Text',            prompt: '' },
        ],
    },
    layout: {
        label: 'Layout',
        color: '#81c784',
        presets: [
            { id: 'more-padding',      label: 'More Padding',        prompt: '' },
            { id: 'fix-clipping',      label: 'Fix Text Clipping',   prompt: '' },
            { id: 'bigger-containers', label: 'Bigger Containers',   prompt: '' },
            { id: 'better-wrapping',   label: 'Better Text Wrap',    prompt: '' },
        ],
    },
    visual: {
        label: 'Visual',
        color: '#ffb74d',
        presets: [
            { id: 'thicker-outline', label: 'Thicker Outline',    prompt: '' },
            { id: 'stronger-color',  label: 'Stronger Colors',    prompt: '' },
            { id: 'higher-contrast', label: 'Higher Contrast',    prompt: '' },
            { id: 'larger-icons',    label: 'Larger Icons',       prompt: '' },
        ],
    },
    animation: {
        label: 'Animation',
        color: '#ce93d8',
        presets: [
            { id: 'faster',       label: 'Faster Animation', prompt: '' },
            { id: 'slower',       label: 'Slower Animation', prompt: '' },
            { id: 'smoother',     label: 'Smoother Easing',  prompt: '' },
            { id: 'delay-entry',  label: 'Delay Entry',      prompt: '' },
        ],
    },
    fix: {
        label: 'Fix',
        color: '#ef9a9a',
        presets: [
            { id: 'fix-hardcoded', label: 'Fix Hardcoded Values', prompt: '' },
            { id: 'fix-overflow',  label: 'Fix Overflow:Hidden',  prompt: '' },
            { id: 'remove-nowrap', label: 'Remove Nowrap',        prompt: '' },
            { id: 'fix-scale',     label: 'Fix 1920×1080 Scale',  prompt: '' },
        ],
    },
};

// ─── Severity helpers ─────────────────────────────────────────────────────────

const SEV_COLOR: Record<string, 'error' | 'warning' | 'info' | 'default'> = {
    error: 'error', warning: 'warning', info: 'info',
};

function maxSeverity(issues: Issue[]): 'error' | 'warning' | 'clean' {
    if (issues.some(i => i.severity === 'error'))   return 'error';
    if (issues.some(i => i.severity === 'warning')) return 'warning';
    return 'clean';
}

// ─── AdjustDialog ─────────────────────────────────────────────────────────────

interface DiffSummary {
    added: number;
    removed: number;
    changed: number;
}

interface AdjustDialogProps {
    filename: string;
    open: boolean;
    onClose: () => void;
    onApplied: (filename: string) => void;
}

function AdjustDialog({ filename, open, onClose, onApplied }: AdjustDialogProps) {
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [customPrompt, setCustomPrompt]  = useState('');
    const [previewing, setPreviewing]      = useState(false);
    const [applying, setApplying]          = useState(false);
    const [previewCode, setPreviewCode]    = useState<string | null>(null);
    const [diff, setDiff]                  = useState<DiffSummary | null>(null);
    const [error, setError]                = useState<string | null>(null);
    const [applied, setApplied]            = useState(false);

    // Reset state when dialog opens for a new file
    useEffect(() => {
        if (open) {
            setSelectedIds(new Set());
            setCustomPrompt('');
            setPreviewCode(null);
            setDiff(null);
            setError(null);
            setApplied(false);
        }
    }, [open, filename]);

    const togglePreset = (id: string) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
        // Clear any existing preview when selection changes
        setPreviewCode(null);
        setDiff(null);
    };

    const canPreview = selectedIds.size > 0 || customPrompt.trim().length > 0;

    const handlePreview = useCallback(async () => {
        if (!canPreview) return;
        setPreviewing(true);
        setError(null);
        setPreviewCode(null);
        setDiff(null);
        try {
            const r = await fetch('/api/templates/adjust', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    filename,
                    presetIds: Array.from(selectedIds),
                    customPrompt,
                }),
            });
            const data = await r.json();
            if (!data.success) throw new Error(data.error || 'Preview failed');
            setPreviewCode(data.newCode);
            setDiff(data.diff);
        } catch (err: any) {
            setError(err.message);
        }
        setPreviewing(false);
    }, [filename, selectedIds, customPrompt, canPreview]);

    const handleApply = useCallback(async () => {
        if (!previewCode) return;
        setApplying(true);
        setError(null);
        try {
            const r = await fetch('/api/templates/adjust/apply', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ filename, code: previewCode }),
            });
            const data = await r.json();
            if (!data.success) throw new Error(data.error || 'Apply failed');
            setApplied(true);
            onApplied(filename);
        } catch (err: any) {
            setError(err.message);
        }
        setApplying(false);
    }, [filename, previewCode, onApplied]);

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{ sx: { bgcolor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' } }}
        >
            <DialogTitle sx={{ pb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                    <Typography sx={{ color: 'var(--accent-gold)', fontWeight: 'bold', letterSpacing: '1px', fontSize: '0.9rem' }}>
                        ADJUST TEMPLATE
                    </Typography>
                    <Typography sx={{ color: 'var(--text-secondary)', fontSize: '0.72rem', fontFamily: 'monospace' }}>
                        {filename}
                    </Typography>
                </Box>
                <IconButton onClick={onClose} size="small" sx={{ color: 'var(--text-secondary)' }}>
                    <CloseIcon fontSize="small" />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ pt: 1 }}>
                {/* Preset chips by category */}
                <Stack spacing={1.5} mb={2}>
                    {Object.entries(PRESET_CATEGORIES).map(([catKey, cat]) => (
                        <Box key={catKey}>
                            <Typography sx={{
                                fontSize: '0.65rem', fontWeight: 'bold', letterSpacing: '1.5px',
                                color: cat.color, textTransform: 'uppercase', mb: 0.6,
                            }}>
                                {cat.label}
                            </Typography>
                            <Stack direction="row" spacing={0.6} flexWrap="wrap" useFlexGap>
                                {cat.presets.map(preset => {
                                    const selected = selectedIds.has(preset.id);
                                    return (
                                        <Chip
                                            key={preset.id}
                                            label={preset.label}
                                            size="small"
                                            onClick={() => togglePreset(preset.id)}
                                            icon={selected ? <CheckIcon sx={{ fontSize: '12px !important' }} /> : undefined}
                                            sx={{
                                                fontSize: '0.68rem',
                                                cursor: 'pointer',
                                                mb: 0.6,
                                                bgcolor: selected
                                                    ? `${cat.color}22`
                                                    : 'rgba(255,255,255,0.04)',
                                                color: selected ? cat.color : 'var(--text-secondary)',
                                                border: `1px solid ${selected ? cat.color : 'var(--border-color)'}`,
                                                '&:hover': {
                                                    bgcolor: `${cat.color}15`,
                                                    color: cat.color,
                                                    borderColor: cat.color,
                                                },
                                                transition: 'all 0.15s ease',
                                            }}
                                        />
                                    );
                                })}
                            </Stack>
                        </Box>
                    ))}
                </Stack>

                <Divider sx={{ borderColor: 'var(--border-color)', mb: 1.5 }} />

                {/* Custom prompt */}
                <TextField
                    label="Additional instructions (optional)"
                    placeholder="e.g. make the title text italic, align stats to the left…"
                    value={customPrompt}
                    onChange={e => { setCustomPrompt(e.target.value); setPreviewCode(null); setDiff(null); }}
                    multiline
                    rows={2}
                    fullWidth
                    size="small"
                    sx={{
                        mb: 2,
                        '& .MuiOutlinedInput-root': {
                            fontSize: '0.78rem',
                            color: 'var(--text-primary)',
                            '& fieldset': { borderColor: 'var(--border-color)' },
                            '&:hover fieldset': { borderColor: 'var(--accent-gold)44' },
                            '&.Mui-focused fieldset': { borderColor: 'var(--accent-gold)' },
                        },
                        '& .MuiInputLabel-root': { color: 'var(--text-secondary)', fontSize: '0.75rem' },
                        '& .MuiInputLabel-root.Mui-focused': { color: 'var(--accent-gold)' },
                    }}
                />

                {/* Error */}
                {error && (
                    <Alert severity="error" sx={{ mb: 1.5, bgcolor: 'rgba(230,57,70,0.12)', fontSize: '0.75rem' }}>
                        {error}
                    </Alert>
                )}

                {/* Diff summary + preview */}
                {previewCode && diff && !applied && (
                    <Box sx={{
                        bgcolor: 'rgba(0,0,0,0.3)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 1,
                        p: 1.5,
                    }}>
                        <Stack direction="row" spacing={1.5} alignItems="center" mb={1}>
                            <Typography sx={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>
                                PREVIEW READY
                            </Typography>
                            {diff.changed > 0 && (
                                <Chip label={`~${diff.changed} lines changed`} size="small"
                                    sx={{ fontSize: '0.62rem', height: 18, bgcolor: 'rgba(201,169,97,0.15)', color: 'var(--accent-gold)', border: '1px solid var(--accent-gold)44' }} />
                            )}
                            {diff.added > 0 && (
                                <Chip label={`+${diff.added} added`} size="small"
                                    sx={{ fontSize: '0.62rem', height: 18, bgcolor: 'rgba(42,157,92,0.12)', color: '#2a9d5c', border: '1px solid #2a9d5c44' }} />
                            )}
                            {diff.removed > 0 && (
                                <Chip label={`-${diff.removed} removed`} size="small"
                                    sx={{ fontSize: '0.62rem', height: 18, bgcolor: 'rgba(230,57,70,0.12)', color: '#e63946', border: '1px solid #e6394644' }} />
                            )}
                        </Stack>
                        <Box
                            component="pre"
                            sx={{
                                maxHeight: 220,
                                overflowY: 'auto',
                                fontSize: '0.6rem',
                                lineHeight: 1.5,
                                color: 'var(--text-secondary)',
                                fontFamily: 'monospace',
                                m: 0,
                                p: 0,
                            }}
                        >
                            {previewCode.slice(0, 3000)}{previewCode.length > 3000 ? '\n…(truncated)' : ''}
                        </Box>
                    </Box>
                )}

                {/* Applied success */}
                {applied && (
                    <Alert
                        severity="success"
                        icon={<CheckIcon fontSize="small" />}
                        sx={{ bgcolor: 'rgba(42,157,92,0.12)', fontSize: '0.75rem' }}
                    >
                        Template saved. Original backed up as <code style={{ fontSize: '0.7rem' }}>{filename}.bak</code>
                    </Alert>
                )}
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
                <Button onClick={onClose} size="small" sx={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                    {applied ? 'Close' : 'Cancel'}
                </Button>

                {!applied && (
                    <>
                        <Button
                            variant="outlined"
                            size="small"
                            startIcon={previewing ? <CircularProgress size={12} /> : <PreviewIcon />}
                            disabled={!canPreview || previewing || applying}
                            onClick={handlePreview}
                            sx={{
                                fontSize: '0.75rem',
                                borderColor: 'var(--accent-gold)',
                                color: 'var(--accent-gold)',
                                '&:hover': { bgcolor: 'rgba(201,169,97,0.1)' },
                                '&.Mui-disabled': { borderColor: 'var(--border-color)', color: 'var(--text-secondary)' },
                            }}
                        >
                            {previewing ? 'Generating…' : 'Preview'}
                        </Button>

                        <Button
                            variant="contained"
                            size="small"
                            startIcon={applying ? <CircularProgress size={12} sx={{ color: '#fff' }} /> : <SaveIcon />}
                            disabled={!previewCode || applying || previewing}
                            onClick={handleApply}
                            sx={{
                                fontSize: '0.75rem',
                                bgcolor: previewCode ? '#2a9d5c' : 'rgba(255,255,255,0.05)',
                                '&:hover': { bgcolor: '#21876b' },
                                '&.Mui-disabled': { bgcolor: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' },
                            }}
                        >
                            {applying ? 'Saving…' : 'Apply & Save'}
                        </Button>
                    </>
                )}
            </DialogActions>
        </Dialog>
    );
}

// ─── TemplateCard ─────────────────────────────────────────────────────────────

function TemplateCard({ result, onFix, fixing, onAdjust }: {
    result: TemplateResult;
    onFix: (filename: string) => void;
    fixing: boolean;
    onAdjust: (filename: string) => void;
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

                {/* Action buttons */}
                <Stack direction="row" spacing={0.6} flexWrap="wrap" useFlexGap>
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

                    {/* Adjust button — always visible */}
                    <Tooltip title="Open adjustment presets" placement="top">
                        <Button
                            size="small"
                            variant="outlined"
                            startIcon={<TuneIcon sx={{ fontSize: '12px !important' }} />}
                            onClick={() => onAdjust(result.filename)}
                            sx={{
                                fontSize: '0.62rem', py: 0.3, px: 1,
                                borderColor: '#4fc3f744',
                                color: '#4fc3f7',
                                '&:hover': { bgcolor: 'rgba(79,195,247,0.08)', borderColor: '#4fc3f7' },
                            }}
                        >
                            Adjust
                        </Button>
                    </Tooltip>
                </Stack>
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
    const [adjustTarget, setAdjustTarget] = useState<string | null>(null);
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
                                onAdjust={setAdjustTarget}
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

            {/* Adjust Dialog */}
            {adjustTarget && (
                <AdjustDialog
                    filename={adjustTarget}
                    open={!!adjustTarget}
                    onClose={() => setAdjustTarget(null)}
                    onApplied={(filename) => {
                        setAlert({ type: 'success', msg: `Adjustments applied to ${filename}` });
                    }}
                />
            )}
        </Box>
    );
};

export default TemplateAuditorView;
