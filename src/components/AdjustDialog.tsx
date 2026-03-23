import React, { useState, useEffect, useCallback } from 'react';
import {
    Box, Typography, Button, Chip, Stack, Divider, CircularProgress,
    TextField, Alert, Dialog, DialogTitle, DialogContent, DialogActions,
    IconButton,
} from '@mui/material';
import {
    Close as CloseIcon,
    Check as CheckIcon,
    Preview as PreviewIcon,
    Save as SaveIcon,
} from '@mui/icons-material';

// ─── Preset categories (mirrors server/adjustmentPresets.js) ──────────────────

const PRESET_CATEGORIES: Record<string, { label: string; color: string; presets: { id: string; label: string }[] }> = {
    typography: {
        label: 'Typography', color: '#4fc3f7',
        presets: [
            { id: 'font-decrease',   label: 'Decrease Font Size'     },
            { id: 'font-increase',   label: 'Increase Font Size'      },
            { id: 'tighter-spacing', label: 'Tighter Letter Spacing'  },
            { id: 'bolder',          label: 'Bolder Text'             },
        ],
    },
    layout: {
        label: 'Layout', color: '#81c784',
        presets: [
            { id: 'more-padding',      label: 'More Padding'       },
            { id: 'fix-clipping',      label: 'Fix Text Clipping'  },
            { id: 'bigger-containers', label: 'Bigger Containers'  },
            { id: 'better-wrapping',   label: 'Better Text Wrap'   },
        ],
    },
    visual: {
        label: 'Visual', color: '#ffb74d',
        presets: [
            { id: 'thicker-outline', label: 'Thicker Outline'   },
            { id: 'stronger-color',  label: 'Stronger Colors'   },
            { id: 'higher-contrast', label: 'Higher Contrast'   },
            { id: 'larger-icons',    label: 'Larger Icons'      },
        ],
    },
    animation: {
        label: 'Animation', color: '#ce93d8',
        presets: [
            { id: 'faster',      label: 'Faster Animation' },
            { id: 'slower',      label: 'Slower Animation' },
            { id: 'smoother',    label: 'Smoother Easing'  },
            { id: 'delay-entry', label: 'Delay Entry'      },
        ],
    },
    fix: {
        label: 'Fix', color: '#ef9a9a',
        presets: [
            { id: 'fix-hardcoded', label: 'Fix Hardcoded Values' },
            { id: 'fix-overflow',  label: 'Fix Overflow:Hidden'  },
            { id: 'remove-nowrap', label: 'Remove Nowrap'        },
            { id: 'fix-scale',     label: 'Fix 1920×1080 Scale'  },
        ],
    },
};

interface DiffSummary { added: number; removed: number; changed: number }

export interface AdjustDialogProps {
    filename: string;        // e.g. "01-statcluster-3box.tsx"
    open: boolean;
    onClose: () => void;
    onApplied: (filename: string) => void;
}

const AdjustDialog: React.FC<AdjustDialogProps> = ({ filename, open, onClose, onApplied }) => {
    const [selectedIds, setSelectedIds]   = useState<Set<string>>(new Set());
    const [customPrompt, setCustomPrompt] = useState('');
    const [previewing, setPreviewing]     = useState(false);
    const [applying, setApplying]         = useState(false);
    const [previewCode, setPreviewCode]   = useState<string | null>(null);
    const [diff, setDiff]                 = useState<DiffSummary | null>(null);
    const [error, setError]               = useState<string | null>(null);
    const [applied, setApplied]           = useState(false);

    // Reset when dialog opens for a new file
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
                body: JSON.stringify({ filename, presetIds: Array.from(selectedIds), customPrompt }),
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
                {/* Preset chip categories */}
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
                                                fontSize: '0.68rem', cursor: 'pointer', mb: 0.6,
                                                bgcolor: selected ? `${cat.color}22` : 'rgba(255,255,255,0.04)',
                                                color: selected ? cat.color : 'var(--text-secondary)',
                                                border: `1px solid ${selected ? cat.color : 'var(--border-color)'}`,
                                                '&:hover': { bgcolor: `${cat.color}15`, color: cat.color, borderColor: cat.color },
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

                {/* Free-text instruction */}
                <TextField
                    label="Additional instructions (optional)"
                    placeholder="e.g. make the title text italic, align stats to the left…"
                    value={customPrompt}
                    onChange={e => { setCustomPrompt(e.target.value); setPreviewCode(null); setDiff(null); }}
                    multiline rows={2} fullWidth size="small"
                    sx={{
                        mb: 2,
                        '& .MuiOutlinedInput-root': {
                            fontSize: '0.78rem', color: 'var(--text-primary)',
                            '& fieldset': { borderColor: 'var(--border-color)' },
                            '&:hover fieldset': { borderColor: 'var(--accent-gold)44' },
                            '&.Mui-focused fieldset': { borderColor: 'var(--accent-gold)' },
                        },
                        '& .MuiInputLabel-root': { color: 'var(--text-secondary)', fontSize: '0.75rem' },
                        '& .MuiInputLabel-root.Mui-focused': { color: 'var(--accent-gold)' },
                    }}
                />

                {error && (
                    <Alert severity="error" sx={{ mb: 1.5, bgcolor: 'rgba(230,57,70,0.12)', fontSize: '0.75rem' }}>
                        {error}
                    </Alert>
                )}

                {/* Diff summary + code preview */}
                {previewCode && diff && !applied && (
                    <Box sx={{ bgcolor: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: 1, p: 1.5 }}>
                        <Stack direction="row" spacing={1.5} alignItems="center" mb={1}>
                            <Typography sx={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>
                                PREVIEW READY
                            </Typography>
                            {diff.changed > 0 && (
                                <Chip label={`~${diff.changed} lines changed`} size="small" sx={{ fontSize: '0.62rem', height: 18, bgcolor: 'rgba(201,169,97,0.15)', color: 'var(--accent-gold)', border: '1px solid var(--accent-gold)44' }} />
                            )}
                            {diff.added > 0 && (
                                <Chip label={`+${diff.added} added`} size="small" sx={{ fontSize: '0.62rem', height: 18, bgcolor: 'rgba(42,157,92,0.12)', color: '#2a9d5c', border: '1px solid #2a9d5c44' }} />
                            )}
                            {diff.removed > 0 && (
                                <Chip label={`-${diff.removed} removed`} size="small" sx={{ fontSize: '0.62rem', height: 18, bgcolor: 'rgba(230,57,70,0.12)', color: '#e63946', border: '1px solid #e6394644' }} />
                            )}
                        </Stack>
                        <Box component="pre" sx={{ maxHeight: 220, overflowY: 'auto', fontSize: '0.6rem', lineHeight: 1.5, color: 'var(--text-secondary)', fontFamily: 'monospace', m: 0, p: 0 }}>
                            {previewCode.slice(0, 3000)}{previewCode.length > 3000 ? '\n…(truncated)' : ''}
                        </Box>
                    </Box>
                )}

                {applied && (
                    <Alert severity="success" icon={<CheckIcon fontSize="small" />} sx={{ bgcolor: 'rgba(42,157,92,0.12)', fontSize: '0.75rem' }}>
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
                            variant="outlined" size="small"
                            startIcon={previewing ? <CircularProgress size={12} /> : <PreviewIcon />}
                            disabled={!canPreview || previewing || applying}
                            onClick={handlePreview}
                            sx={{
                                fontSize: '0.75rem', borderColor: 'var(--accent-gold)', color: 'var(--accent-gold)',
                                '&:hover': { bgcolor: 'rgba(201,169,97,0.1)' },
                                '&.Mui-disabled': { borderColor: 'var(--border-color)', color: 'var(--text-secondary)' },
                            }}
                        >
                            {previewing ? 'Generating…' : 'Preview'}
                        </Button>
                        <Button
                            variant="contained" size="small"
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
};

export default AdjustDialog;
