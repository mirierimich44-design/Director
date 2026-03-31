import React, { useState, useEffect, useRef } from 'react';
import {
    Box, Typography, TextField, Button, Select, MenuItem, FormControl,
    InputLabel, Chip, CircularProgress, Alert, Slider, Stack, Paper,
    IconButton, Tooltip, ToggleButtonGroup, ToggleButton, ListSubheader,
} from '@mui/material';
import {
    RecordVoiceOver as TTSIcon,
    Refresh as RegenerateIcon,
    VolumeUp as VolumeIcon,
    Download as DownloadIcon,
    Add as AddToQueueIcon,
    PlayArrow as PlayIcon,
} from '@mui/icons-material';

// ── Static voice data (Kokoro & Orpheus never change) ─────────────────────────

const KOKORO_VOICES = [
    { id: 'af_heart',    label: 'Heart',    group: 'American F' },
    { id: 'af_bella',    label: 'Bella',    group: 'American F' },
    { id: 'af_sarah',    label: 'Sarah',    group: 'American F' },
    { id: 'af_nicole',   label: 'Nicole',   group: 'American F' },
    { id: 'am_adam',     label: 'Adam',     group: 'American M' },
    { id: 'am_michael',  label: 'Michael',  group: 'American M' },
    { id: 'bf_emma',     label: 'Emma',     group: 'British F'  },
    { id: 'bf_isabella', label: 'Isabella', group: 'British F'  },
    { id: 'bm_george',   label: 'George',   group: 'British M'  },
    { id: 'bm_lewis',    label: 'Lewis',    group: 'British M'  },
];

const ORPHEUS_VOICES = [
    { id: 'tara', label: 'Tara', group: 'Female' },
    { id: 'leah', label: 'Leah', group: 'Female' },
    { id: 'jess', label: 'Jess', group: 'Female' },
    { id: 'mia',  label: 'Mia',  group: 'Female' },
    { id: 'zoe',  label: 'Zoe',  group: 'Female' },
    { id: 'leo',  label: 'Leo',  group: 'Male'   },
    { id: 'dan',  label: 'Dan',  group: 'Male'   },
    { id: 'zac',  label: 'Zac',  group: 'Male'   },
];

const EMOTION_TAGS = ['<laugh>', '<chuckle>', '<sigh>', '<gasp>', '<cough>', '<sniffle>', '<groan>', '<yawn>'];

// ── Types ─────────────────────────────────────────────────────────────────────

interface DynVoice { id: string; label: string; group: string; previewUrl?: string; }

export interface TtsResult {
    audioUrl: string;
    filename: string;
    duration: number;
    voice: string;
    engine: string;
    text: string;
}

interface VoiceoverPanelProps {
    onGenerated?: (result: TtsResult) => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

const VoiceoverPanel: React.FC<VoiceoverPanelProps> = ({ onGenerated }) => {
    const [engine, setEngine] = useState<'kokoro' | 'orpheus' | 'heygen'>('kokoro');
    const [text, setText] = useState('');
    const [voice, setVoice] = useState('af_heart');
    const [speed, setSpeed] = useState(1.0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState<TtsResult | null>(null);
    const [serviceStatus, setServiceStatus] = useState<'checking' | 'online' | 'offline'>('checking');

    // Dynamic voices for HeyGen (loaded from API)
    const [heygenVoices, setHeygenVoices] = useState<DynVoice[]>([]);
    const [heygenLoading, setHeygenLoading] = useState(false);
    const [voiceSearch, setVoiceSearch] = useState('');

    const textRef = useRef<HTMLTextAreaElement>(null);
    const previewAudioRef = useRef<HTMLAudioElement | null>(null);

    // All voices for current engine
    const staticVoices: DynVoice[] = engine === 'kokoro'
        ? KOKORO_VOICES.map(v => ({ id: v.id, label: v.label, group: v.group }))
        : ORPHEUS_VOICES.map(v => ({ id: v.id, label: v.label, group: v.group }));

    const activeVoices = engine === 'heygen' ? heygenVoices : staticVoices;

    const filteredVoices = voiceSearch.trim()
        ? activeVoices.filter(v =>
            v.label.toLowerCase().includes(voiceSearch.toLowerCase()) ||
            v.group.toLowerCase().includes(voiceSearch.toLowerCase())
          )
        : activeVoices;

    // Group voices for display
    const groups = [...new Set(filteredVoices.map(v => v.group))];

    // ── Side effects ──────────────────────────────────────────────────────────

    useEffect(() => {
        fetch('/api/tts/health')
            .then(r => r.json())
            .then(d => setServiceStatus(d.success !== false ? 'online' : 'offline'))
            .catch(() => setServiceStatus('offline'));
    }, []);

    // Load HeyGen voices when engine switches to heygen
    useEffect(() => {
        if (engine !== 'heygen' || heygenVoices.length > 0) return;
        setHeygenLoading(true);
        fetch('/api/video-gen/heygen-voices')
            .then(r => r.json())
            .then(data => {
                if (data.success && data.voices?.length) {
                    const mapped: DynVoice[] = data.voices.map((v: any) => ({
                        id: v.id,
                        label: v.name,
                        group: `${v.language || 'Other'} · ${v.gender || ''}`.trim().replace(/·\s*$/, ''),
                        previewUrl: v.previewUrl || '',
                    }));
                    setHeygenVoices(mapped);
                    setVoice(mapped[0]?.id || '');
                }
            })
            .catch(() => {})
            .finally(() => setHeygenLoading(false));
    }, [engine]);

    // ── Handlers ──────────────────────────────────────────────────────────────

    const handleEngineChange = (_: React.MouseEvent, val: 'kokoro' | 'orpheus' | 'heygen' | null) => {
        if (!val) return;
        setEngine(val);
        setVoiceSearch('');
        setResult(null);
        setError('');
        if (val === 'kokoro') setVoice('af_heart');
        else if (val === 'orpheus') setVoice('tara');
        // heygen: voice set after fetch
    };

    const insertTag = (tag: string) => {
        const el = textRef.current;
        if (!el) { setText(t => t + ' ' + tag); return; }
        const start = el.selectionStart ?? text.length;
        const end   = el.selectionEnd   ?? text.length;
        setText(text.slice(0, start) + tag + text.slice(end));
        requestAnimationFrame(() => {
            el.selectionStart = el.selectionEnd = start + tag.length;
            el.focus();
        });
    };

    const playPreview = (url: string) => {
        if (!url) return;
        if (!previewAudioRef.current) previewAudioRef.current = new Audio();
        previewAudioRef.current.src = url;
        previewAudioRef.current.play().catch(() => {});
    };

    const handleGenerate = async () => {
        if (!text.trim()) return;
        setLoading(true);
        setError('');
        try {
            const resp = await fetch('/api/tts/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, voice, speed, engine }),
            });
            const data = await resp.json();
            if (!resp.ok) throw new Error(data.error || 'Generation failed');

            const res: TtsResult = {
                audioUrl: data.audioUrl + `?t=${Date.now()}`,
                filename: data.filename,
                duration: data.duration || 0,
                voice,
                engine,
                text: text.slice(0, 80) + (text.length > 80 ? '…' : ''),
            };
            setResult(res);
            onGenerated?.(res);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // ── Derived ───────────────────────────────────────────────────────────────

    const statusColor = serviceStatus === 'online' ? '#4CAF50' : serviceStatus === 'offline' ? '#f44336' : '#888';
    const currentVoiceLabel = activeVoices.find(v => v.id === voice)?.label ?? voice;
    const isOfflineBlocked = engine !== 'heygen' && serviceStatus === 'offline';

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <Paper sx={{ p: 3, bgcolor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 2 }}>

            {/* Header */}
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2.5 }}>
                <TTSIcon sx={{ color: 'var(--accent-gold)', fontSize: 22 }} />
                <Typography variant="h6" sx={{ color: 'var(--text-primary)', fontVariant: 'small-caps', letterSpacing: 1, flex: 1 }}>
                    TTS Generator
                </Typography>
                <Chip size="small" label={serviceStatus.toUpperCase()} sx={{
                    bgcolor: `${statusColor}22`, color: statusColor, border: `1px solid ${statusColor}44`,
                    fontSize: '0.65rem', fontWeight: 700, letterSpacing: 1, height: 20,
                }} />
                {serviceStatus === 'offline' && (
                    <Tooltip title="Retry">
                        <IconButton size="small" sx={{ color: 'var(--text-secondary)' }} onClick={() => {
                            setServiceStatus('checking');
                            fetch('/api/tts/health').then(r => r.json())
                                .then(d => setServiceStatus(d.success !== false ? 'online' : 'offline'))
                                .catch(() => setServiceStatus('offline'));
                        }}>
                            <RegenerateIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                )}
            </Stack>

            {/* Kokoro/Orpheus offline warning */}
            {serviceStatus === 'offline' && engine !== 'heygen' && (
                <Alert severity="warning" sx={{ mb: 2, bgcolor: 'rgba(255,152,0,0.08)', color: '#ffb74d', '& .MuiAlert-icon': { color: '#ffb74d' } }}>
                    TTS service offline.{' '}
                    <code style={{ fontSize: '0.7rem' }}>pm2 start server/tts_service.py --interpreter server/tts_venv/bin/python3 --name kokoro-tts</code>
                </Alert>
            )}

            {/* Engine toggle */}
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                <Typography variant="caption" sx={{ color: 'var(--text-secondary)', minWidth: 50 }}>Engine</Typography>
                <ToggleButtonGroup value={engine} exclusive onChange={handleEngineChange} size="small" sx={{
                    '& .MuiToggleButton-root': { color: 'var(--text-secondary)', borderColor: 'var(--border-color)', fontSize: '0.75rem', px: 2, py: 0.5, textTransform: 'none' },
                    '& .MuiToggleButton-root.Mui-selected': { bgcolor: 'rgba(201,169,97,0.15)', color: 'var(--accent-gold)', borderColor: 'rgba(201,169,97,0.4)' },
                }}>
                    <ToggleButton value="kokoro">Kokoro</ToggleButton>
                    <ToggleButton value="orpheus">Orpheus</ToggleButton>
                    <ToggleButton value="heygen">HeyGen</ToggleButton>
                </ToggleButtonGroup>
                {engine === 'kokoro'  && <Chip size="small" label="Fast · CPU"         sx={{ bgcolor: 'rgba(76,175,80,0.12)',   color: '#81c784', fontSize: '0.65rem', height: 20 }} />}
                {engine === 'orpheus' && <Chip size="small" label="Rich · Slow on CPU"  sx={{ bgcolor: 'rgba(255,152,0,0.12)',   color: '#ffb74d', fontSize: '0.65rem', height: 20 }} />}
                {engine === 'heygen'  && <Chip size="small" label="Premium · API"        sx={{ bgcolor: 'rgba(33,150,243,0.12)',  color: '#90caf9', fontSize: '0.65rem', height: 20 }} />}
            </Stack>

            {/* Orpheus warning */}
            {engine === 'orpheus' && (
                <Alert severity="info" sx={{ mb: 2, bgcolor: 'rgba(33,150,243,0.08)', color: '#90caf9', '& .MuiAlert-icon': { color: '#90caf9' }, fontSize: '0.8rem' }}>
                    Orpheus runs via llama.cpp on CPU — expect 2–5 min per clip. Supports emotion tags below.
                </Alert>
            )}

            {/* Text input */}
            <TextField multiline minRows={3} maxRows={8} fullWidth size="small" value={text}
                onChange={e => setText(e.target.value)} placeholder="Enter narration text…" inputRef={textRef}
                sx={{
                    mb: engine === 'orpheus' ? 1 : 2,
                    '& .MuiOutlinedInput-root': {
                        bgcolor: 'var(--bg-primary)', color: 'var(--text-primary)',
                        '& fieldset': { borderColor: 'var(--border-color)' },
                        '&:hover fieldset': { borderColor: 'var(--accent-gold)' },
                        '&.Mui-focused fieldset': { borderColor: 'var(--accent-gold)' },
                    },
                    '& .MuiInputBase-input::placeholder': { color: 'var(--text-secondary)', opacity: 1 },
                }}
            />

            {/* Emotion tags */}
            {engine === 'orpheus' && (
                <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                    {EMOTION_TAGS.map(tag => (
                        <Chip key={tag} label={tag} size="small" onClick={() => insertTag(tag)} sx={{
                            bgcolor: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)',
                            border: '1px solid var(--border-color)', fontSize: '0.7rem', cursor: 'pointer',
                            '&:hover': { bgcolor: 'rgba(201,169,97,0.12)', color: 'var(--accent-gold)', borderColor: 'rgba(201,169,97,0.3)' },
                        }} />
                    ))}
                    <Typography variant="caption" sx={{ color: 'var(--text-secondary)', alignSelf: 'center', ml: 0.5 }}>click to insert</Typography>
                </Box>
            )}

            {/* Controls row */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'flex-end' }} sx={{ mb: 2 }}>

                {/* Voice selector */}
                <Box sx={{ flex: 1, minWidth: 180 }}>
                    {engine === 'heygen' && (
                        <TextField size="small" fullWidth placeholder="Search voices…" value={voiceSearch}
                            onChange={e => setVoiceSearch(e.target.value)}
                            sx={{
                                mb: 0.75,
                                '& .MuiOutlinedInput-root': { bgcolor: 'var(--bg-primary)', color: 'var(--text-primary)', '& fieldset': { borderColor: 'var(--border-color)' } },
                                '& .MuiInputBase-input::placeholder': { color: 'var(--text-secondary)', opacity: 1 },
                            }}
                        />
                    )}
                    <FormControl size="small" fullWidth>
                        <InputLabel sx={{ color: 'var(--text-secondary)', '&.Mui-focused': { color: 'var(--accent-gold)' } }}>Voice</InputLabel>
                        <Select value={voice} onChange={e => setVoice(e.target.value)} label="Voice"
                            disabled={engine === 'heygen' && heygenLoading}
                            sx={{
                                color: 'var(--text-primary)', bgcolor: 'var(--bg-primary)',
                                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--border-color)' },
                                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--accent-gold)' },
                                '& .MuiSvgIcon-root': { color: 'var(--text-secondary)' },
                            }}
                            MenuProps={{ PaperProps: { sx: { bgcolor: 'var(--bg-secondary)', maxHeight: 320 } } }}
                        >
                            {engine === 'heygen' && heygenLoading && (
                                <MenuItem disabled><CircularProgress size={14} sx={{ mr: 1 }} /> Loading…</MenuItem>
                            )}
                            {groups.map(group => [
                                <ListSubheader key={`g-${group}`} sx={{ bgcolor: 'var(--bg-primary)', color: 'var(--accent-gold)', fontSize: '0.7rem', lineHeight: '28px' }}>
                                    {group}
                                </ListSubheader>,
                                ...filteredVoices.filter(v => v.group === group).map(v => (
                                    <MenuItem key={v.id} value={v.id} sx={{ color: 'var(--text-primary)', fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between' }}>
                                        <span>{v.label}</span>
                                        {v.previewUrl && (
                                            <IconButton size="small" onClick={e => { e.stopPropagation(); playPreview(v.previewUrl!); }}
                                                sx={{ color: 'var(--accent-gold)', p: 0.25, ml: 1 }}>
                                                <PlayIcon sx={{ fontSize: 14 }} />
                                            </IconButton>
                                        )}
                                    </MenuItem>
                                ))
                            ])}
                        </Select>
                    </FormControl>
                </Box>

                {/* Speed (Kokoro only) */}
                {engine === 'kokoro' && (
                    <Box sx={{ flex: 1, minWidth: 130 }}>
                        <Typography variant="caption" sx={{ color: 'var(--text-secondary)', display: 'block', mb: 0.5 }}>Speed: {speed.toFixed(1)}×</Typography>
                        <Slider value={speed} onChange={(_, v) => setSpeed(v as number)} min={0.5} max={2.0} step={0.1} size="small"
                            marks={[{ value: 0.5, label: '0.5×' }, { value: 1.0, label: '1×' }, { value: 2.0, label: '2×' }]}
                            sx={{ color: 'var(--accent-gold)', '& .MuiSlider-markLabel': { color: 'var(--text-secondary)', fontSize: 10 } }}
                        />
                    </Box>
                )}

                {/* Generate button */}
                <Button variant="contained" onClick={handleGenerate}
                    disabled={loading || !text.trim() || !voice || isOfflineBlocked}
                    startIcon={loading ? <CircularProgress size={14} sx={{ color: '#000' }} /> : result ? <RegenerateIcon /> : <TTSIcon />}
                    sx={{
                        bgcolor: 'var(--accent-gold)', color: '#000', fontWeight: 700, whiteSpace: 'nowrap',
                        '&:hover': { bgcolor: '#e0c46a' },
                        '&:disabled': { bgcolor: 'rgba(201,169,97,0.3)', color: 'rgba(0,0,0,0.4)' },
                    }}
                >
                    {loading ? (engine === 'orpheus' ? 'Generating (slow)…' : 'Generating…') : result ? 'Regenerate' : 'Generate'}
                </Button>
            </Stack>

            {error && <Alert severity="error" sx={{ mb: 2, bgcolor: 'rgba(244,67,54,0.08)', color: '#ef9a9a' }}>{error}</Alert>}

            {/* Result */}
            {result && (
                <Box sx={{ p: 2, bgcolor: 'var(--bg-primary)', borderRadius: 1.5, border: '1px solid rgba(201,169,97,0.25)' }}>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                        <VolumeIcon sx={{ fontSize: 16, color: 'var(--accent-gold)' }} />
                        <Typography variant="caption" sx={{ color: 'var(--text-primary)', flex: 1, fontStyle: 'italic' }}>"{result.text}"</Typography>
                        {result.duration > 0 && <Chip size="small" label={`${result.duration.toFixed(1)}s`} sx={{ bgcolor: 'var(--bg-secondary)', color: 'var(--text-secondary)', height: 18, fontSize: '0.65rem' }} />}
                        <Chip size="small" label={currentVoiceLabel} sx={{ bgcolor: 'rgba(201,169,97,0.15)', color: 'var(--accent-gold)', height: 18, fontSize: '0.65rem' }} />
                        <Chip size="small" label={result.engine} sx={{ bgcolor: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', height: 18, fontSize: '0.65rem' }} />
                    </Stack>
                    <audio key={result.audioUrl} controls style={{ width: '100%', height: 36 }} src={result.audioUrl} />
                    <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
                        <Button size="small" component="a" href={result.audioUrl} download={result.filename}
                            startIcon={<DownloadIcon />} sx={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                            Download
                        </Button>
                        {onGenerated && (
                            <Button size="small" startIcon={<AddToQueueIcon />} onClick={() => onGenerated(result)}
                                sx={{ color: 'var(--accent-gold)', fontSize: '0.75rem' }}>
                                Add to Queue
                            </Button>
                        )}
                    </Stack>
                </Box>
            )}
        </Paper>
    );
};

export default VoiceoverPanel;
