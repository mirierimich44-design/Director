import React, { useState, useEffect, useRef } from 'react';
import {
    Box, Typography, TextField, Button, Select, MenuItem, FormControl,
    InputLabel, Chip, CircularProgress, Alert, Slider, Stack, Paper,
    IconButton, Tooltip, ToggleButtonGroup, ToggleButton,
} from '@mui/material';
import {
    RecordVoiceOver as TTSIcon,
    Refresh as RegenerateIcon,
    VolumeUp as VolumeIcon,
    Download as DownloadIcon,
    Add as AddToQueueIcon,
} from '@mui/icons-material';

// ── Voice data ────────────────────────────────────────────────────────────────

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

const HEYGEN_VOICES = [
    { id: 'en-US-JennyNeural', label: 'Jenny', group: 'US Female' },
    { id: 'en-US-GuyNeural',   label: 'Guy',   group: 'US Male' },
    { id: 'en-US-AriaNeural',  label: 'Aria',  group: 'US Female' },
    { id: 'en-GB-SoniaNeural', label: 'Sonia', group: 'UK Female' },
    { id: 'en-GB-RyanNeural',  label: 'Ryan',  group: 'UK Male' },
];

const EMOTION_TAGS = ['<laugh>', '<chuckle>', '<sigh>', '<gasp>', '<cough>', '<sniffle>', '<groan>', '<yawn>'];

// ── Types ─────────────────────────────────────────────────────────────────────

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
    const textRef = useRef<HTMLTextAreaElement>(null);

    const voices = engine === 'kokoro' ? KOKORO_VOICES : (engine === 'orpheus' ? ORPHEUS_VOICES : HEYGEN_VOICES);

    // Reset voice to first of new engine when switching
    const handleEngineChange = (_: React.MouseEvent, val: 'kokoro' | 'orpheus' | 'heygen' | null) => {
        if (!val) return;
        setEngine(val);
        const firstVoice = val === 'kokoro' ? 'af_heart' : (val === 'orpheus' ? 'tara' : 'en-US-JennyNeural');
        setVoice(firstVoice);
        setResult(null);
        setError('');
    };

    // Ping service on mount and load settings
    useEffect(() => {
        fetch('/api/tts/health')
            .then(r => r.json())
            .then(d => setServiceStatus(d.success !== false ? 'online' : 'offline'))
            .catch(() => setServiceStatus('offline'));

        fetch('/api/settings')
            .then(r => r.json())
            .then(data => {
                if (data.success && data.settings.models.tts?.engine) {
                    const globalEngine = data.settings.models.tts.engine;
                    setEngine(globalEngine);
                    setVoice(globalEngine === 'kokoro' ? 'af_heart' : 'tara');
                }
            })
            .catch(err => console.warn('Failed to load global TTS settings:', err));
    }, []);

    // Insert emotion tag at cursor position
    const insertTag = (tag: string) => {
        const el = textRef.current;
        if (!el) { setText(t => t + ' ' + tag); return; }
        const start = el.selectionStart ?? text.length;
        const end   = el.selectionEnd   ?? text.length;
        const newText = text.slice(0, start) + tag + text.slice(end);
        setText(newText);
        requestAnimationFrame(() => {
            el.selectionStart = el.selectionEnd = start + tag.length;
            el.focus();
        });
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
                duration: data.duration,
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

    const statusColor = serviceStatus === 'online' ? '#4CAF50' : serviceStatus === 'offline' ? '#f44336' : '#888';

    return (
        <Paper sx={{ p: 3, bgcolor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 2 }}>
            {/* Header */}
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2.5 }}>
                <TTSIcon sx={{ color: 'var(--accent-gold)', fontSize: 22 }} />
                <Typography variant="h6" sx={{ color: 'var(--text-primary)', fontVariant: 'small-caps', letterSpacing: 1, flex: 1 }}>
                    TTS Generator
                </Typography>
                <Chip
                    size="small"
                    label={serviceStatus.toUpperCase()}
                    sx={{
                        bgcolor: `${statusColor}22`,
                        color: statusColor,
                        border: `1px solid ${statusColor}44`,
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        letterSpacing: 1,
                        height: 20,
                    }}
                />
                {serviceStatus === 'offline' && (
                    <Tooltip title="Retry connection">
                        <IconButton size="small" sx={{ color: 'var(--text-secondary)' }} onClick={() => {
                            setServiceStatus('checking');
                            fetch('/api/tts/health')
                                .then(r => r.json())
                                .then(d => setServiceStatus(d.success !== false ? 'online' : 'offline'))
                                .catch(() => setServiceStatus('offline'));
                        }}>
                            <RegenerateIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                )}
            </Stack>

            {/* Offline warning */}
            {serviceStatus === 'offline' && (
                <Alert severity="warning" sx={{ mb: 2, bgcolor: 'rgba(255,152,0,0.08)', color: '#ffb74d', '& .MuiAlert-icon': { color: '#ffb74d' } }}>
                    TTS service offline. Start it:{' '}
                    <code style={{ fontSize: '0.75rem' }}>pm2 start server/tts_service.py --interpreter python3 --name kokoro-tts</code>
                </Alert>
            )}

            {/* Engine toggle */}
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                <Typography variant="caption" sx={{ color: 'var(--text-secondary)', minWidth: 50 }}>Engine</Typography>
                <ToggleButtonGroup
                    value={engine}
                    exclusive
                    onChange={handleEngineChange}
                    size="small"
                    sx={{
                        '& .MuiToggleButton-root': {
                            color: 'var(--text-secondary)',
                            borderColor: 'var(--border-color)',
                            fontSize: '0.75rem',
                            px: 2,
                            py: 0.5,
                            textTransform: 'none',
                        },
                        '& .MuiToggleButton-root.Mui-selected': {
                            bgcolor: 'rgba(201,169,97,0.15)',
                            color: 'var(--accent-gold)',
                            borderColor: 'rgba(201,169,97,0.4)',
                        },
                    }}
                >
                    <ToggleButton value="kokoro">Kokoro</ToggleButton>
                    <ToggleButton value="orpheus">Orpheus</ToggleButton>
                    <ToggleButton value="heygen">HeyGen</ToggleButton>
                </ToggleButtonGroup>

                {engine === 'kokoro' && (
                    <Chip size="small" label="Fast · CPU" sx={{ bgcolor: 'rgba(76,175,80,0.12)', color: '#81c784', fontSize: '0.65rem', height: 20 }} />
                )}
                {engine === 'orpheus' && (
                    <Chip size="small" label="Richer · Slow on CPU" sx={{ bgcolor: 'rgba(255,152,0,0.12)', color: '#ffb74d', fontSize: '0.65rem', height: 20 }} />
                )}
                {engine === 'heygen' && (
                    <Chip size="small" label="Premium · API" sx={{ bgcolor: 'rgba(33,150,243,0.12)', color: '#90caf9', fontSize: '0.65rem', height: 20 }} />
                )}
            </Stack>

            {/* Orpheus CPU warning */}
            {engine === 'orpheus' && (
                <Alert severity="info" sx={{ mb: 2, bgcolor: 'rgba(33,150,243,0.08)', color: '#90caf9', '& .MuiAlert-icon': { color: '#90caf9' }, fontSize: '0.8rem' }}>
                    Orpheus runs on CPU via llama.cpp. Expect 2–5 min per clip on a 6-core VPS.
                    It also supports emotion tags — insert them below.
                </Alert>
            )}

            {/* Text input */}
            <TextField
                multiline
                minRows={3}
                maxRows={8}
                fullWidth
                size="small"
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Enter narration text…"
                inputRef={textRef}
                sx={{
                    mb: engine === 'orpheus' ? 1 : 2,
                    '& .MuiOutlinedInput-root': {
                        bgcolor: 'var(--bg-primary)',
                        color: 'var(--text-primary)',
                        '& fieldset': { borderColor: 'var(--border-color)' },
                        '&:hover fieldset': { borderColor: 'var(--accent-gold)' },
                        '&.Mui-focused fieldset': { borderColor: 'var(--accent-gold)' },
                    },
                    '& .MuiInputBase-input::placeholder': { color: 'var(--text-secondary)', opacity: 1 },
                }}
            />

            {/* Emotion tag buttons (Orpheus only) */}
            {engine === 'orpheus' && (
                <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                    {EMOTION_TAGS.map(tag => (
                        <Chip
                            key={tag}
                            label={tag}
                            size="small"
                            onClick={() => insertTag(tag)}
                            sx={{
                                bgcolor: 'rgba(255,255,255,0.05)',
                                color: 'var(--text-secondary)',
                                border: '1px solid var(--border-color)',
                                fontSize: '0.7rem',
                                cursor: 'pointer',
                                '&:hover': { bgcolor: 'rgba(201,169,97,0.12)', color: 'var(--accent-gold)', borderColor: 'rgba(201,169,97,0.3)' },
                            }}
                        />
                    ))}
                    <Typography variant="caption" sx={{ color: 'var(--text-secondary)', alignSelf: 'center', ml: 0.5 }}>
                        click to insert at cursor
                    </Typography>
                </Box>
            )}

            {/* Controls row */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'flex-end' }} sx={{ mb: 2 }}>
                {/* Voice */}
                <FormControl size="small" sx={{ minWidth: 160 }}>
                    <InputLabel sx={{ color: 'var(--text-secondary)', '&.Mui-focused': { color: 'var(--accent-gold)' } }}>
                        Voice
                    </InputLabel>
                    <Select
                        value={voice}
                        onChange={e => setVoice(e.target.value)}
                        label="Voice"
                        sx={{
                            color: 'var(--text-primary)',
                            bgcolor: 'var(--bg-primary)',
                            '& .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--border-color)' },
                            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--accent-gold)' },
                            '& .MuiSvgIcon-root': { color: 'var(--text-secondary)' },
                        }}
                        MenuProps={{ PaperProps: { sx: { bgcolor: 'var(--bg-secondary)' } } }}
                    >
                        {voices.map(v => (
                            <MenuItem key={v.id} value={v.id} sx={{ color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                                {v.label}
                                <Typography component="span" variant="caption" sx={{ color: 'var(--text-secondary)', ml: 1 }}>
                                    {v.group}
                                </Typography>
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {/* Speed (Kokoro only — Orpheus speed not supported via orpheus-cpp) */}
                {engine === 'kokoro' && (
                    <Box sx={{ flex: 1, minWidth: 140 }}>
                        <Typography variant="caption" sx={{ color: 'var(--text-secondary)', display: 'block', mb: 0.5 }}>
                            Speed: {speed.toFixed(1)}×
                        </Typography>
                        <Slider
                            value={speed}
                            onChange={(_, v) => setSpeed(v as number)}
                            min={0.5} max={2.0} step={0.1}
                            size="small"
                            marks={[{ value: 0.5, label: '0.5×' }, { value: 1.0, label: '1.0×' }, { value: 2.0, label: '2.0×' }]}
                            sx={{
                                color: 'var(--accent-gold)',
                                '& .MuiSlider-markLabel': { color: 'var(--text-secondary)', fontSize: 10 },
                            }}
                        />
                    </Box>
                )}

                {/* Generate */}
                <Button
                    variant="contained"
                    onClick={handleGenerate}
                    disabled={loading || !text.trim() || (engine !== 'heygen' && serviceStatus === 'offline')}
                    startIcon={loading ? <CircularProgress size={14} sx={{ color: '#000' }} /> : result ? <RegenerateIcon /> : <TTSIcon />}
                    sx={{
                        bgcolor: 'var(--accent-gold)',
                        color: '#000',
                        fontWeight: 700,
                        whiteSpace: 'nowrap',
                        '&:hover': { bgcolor: '#e0c46a' },
                        '&:disabled': { bgcolor: 'rgba(201,169,97,0.3)', color: 'rgba(0,0,0,0.4)' },
                    }}
                >
                    {loading ? (engine === 'orpheus' ? 'Generating (slow)…' : 'Generating…') : result ? 'Regenerate' : 'Generate'}
                </Button>
            </Stack>

            {error && (
                <Alert severity="error" sx={{ mb: 2, bgcolor: 'rgba(244,67,54,0.08)', color: '#ef9a9a' }}>
                    {error}
                </Alert>
            )}

            {/* Result */}
            {result && (
                <Box sx={{ p: 2, bgcolor: 'var(--bg-primary)', borderRadius: 1.5, border: '1px solid rgba(201,169,97,0.25)' }}>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                        <VolumeIcon sx={{ fontSize: 16, color: 'var(--accent-gold)' }} />
                        <Typography variant="caption" sx={{ color: 'var(--text-primary)', flex: 1, fontStyle: 'italic' }}>
                            "{result.text}"
                        </Typography>
                        <Chip size="small" label={`${result.duration.toFixed(1)}s`}
                            sx={{ bgcolor: 'var(--bg-secondary)', color: 'var(--text-secondary)', height: 18, fontSize: '0.65rem' }} />
                        <Chip size="small" label={voices.find(v => v.id === result.voice)?.label ?? result.voice}
                            sx={{ bgcolor: 'rgba(201,169,97,0.15)', color: 'var(--accent-gold)', height: 18, fontSize: '0.65rem' }} />
                        <Chip size="small" label={result.engine}
                            sx={{ bgcolor: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', height: 18, fontSize: '0.65rem' }} />
                    </Stack>

                    <audio key={result.audioUrl} controls style={{ width: '100%', height: 36 }} src={result.audioUrl} />

                    <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
                        <Button size="small" component="a" href={result.audioUrl} download={result.filename}
                            startIcon={<DownloadIcon />} sx={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                            Download WAV
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
