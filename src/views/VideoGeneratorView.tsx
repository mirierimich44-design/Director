import React, { useState, useEffect, useRef } from 'react';
import {
    Box, Typography, TextField, Button, Card, CardContent, Chip, LinearProgress,
    IconButton, Tooltip, Stack, Paper, Grid, ToggleButtonGroup, ToggleButton,
    Select, MenuItem, FormControl, InputLabel, Alert, Divider, CircularProgress,
    Dialog, DialogTitle, DialogContent, DialogActions, Stepper, Step, StepLabel,
    CardActionArea, Avatar as MuiAvatar, Pagination, InputAdornment,
} from '@mui/material';
import {
    AutoFixHigh as VideoGenIcon,
    Search as SearchIcon,
    PlayArrow as PlayIcon,
    Download as DownloadIcon,
    Refresh as RefreshIcon,
    Add as AddIcon,
    Delete as DeleteIcon,
    Movie as MovieIcon,
    Person as AvatarIcon,
    History as HistoryIcon,
    CheckCircle as SuccessIcon,
    Error as ErrorIcon,
    ContentPaste as PasteIcon,
    Lightbulb as TopicIcon,
    YouTube as YouTubeIcon,
    NavigateNext as NextIcon,
    NavigateBefore as BackIcon,
    VolumeUp as VoiceIcon,
    CloudUpload as UploadIcon,
    Palette as ColorIcon,
    VideoLibrary as StockIcon,
    Face as FaceIcon,
    AccessTime as TimerIcon,
} from '@mui/icons-material';

// ── Types ─────────────────────────────────────────────────────────────────────

interface AvatarOption {
    id: string;
    name: string;
    gender: string;
    thumbnail: string;
}

interface VoiceOption {
    id: string;
    name: string;
    gender: string;
    language?: string;
    previewUrl?: string;
}

const FALLBACK_AVATARS: AvatarOption[] = [
    { id: '', name: 'Loading…', gender: '', thumbnail: '' },
];

const FALLBACK_VOICES: VoiceOption[] = [
    { id: '', name: 'Loading…', gender: '', previewUrl: '' },
];

const STEPS = ['Write Script', 'Select Avatar', 'Choose Voice', 'Background & Render'];

// ── Video recovery helper ─────────────────────────────────────────────────────

const VideoRecoveryPanel: React.FC<{ onRecovered: (url: string) => void }> = ({ onRecovered }) => {
    const [open, setOpen] = useState(false);
    const [videoId, setVideoId] = useState('');
    const [checking, setChecking] = useState(false);
    const [recoverError, setRecoverError] = useState('');

    const check = async () => {
        if (!videoId.trim()) return;
        setChecking(true);
        setRecoverError('');
        try {
            const res = await fetch(`/api/video-gen/heygen-status/${videoId.trim()}`);
            const data = await res.json();
            if (data.status === 'completed' && data.video_url) {
                onRecovered(data.video_url);
                setOpen(false);
            } else if (data.status === 'failed') {
                setRecoverError(`Video failed on HeyGen: ${data.error || 'unknown reason'}`);
            } else {
                setRecoverError(`Status: ${data.status || 'unknown'} — video not ready yet`);
            }
        } catch (e: any) {
            setRecoverError(e.message);
        } finally {
            setChecking(false);
        }
    };

    if (!open) return (
        <Box sx={{ mb: 3, textAlign: 'right' }}>
            <Button size="small" onClick={() => setOpen(true)} startIcon={<RefreshIcon sx={{ fontSize: 14 }} />}
                sx={{ color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'none' }}>
                Recover a previous render by video ID
            </Button>
        </Box>
    );

    return (
        <Paper sx={{ p: 2.5, mb: 3, bgcolor: 'var(--bg-secondary)', border: '1px solid rgba(201,169,97,0.3)', borderRadius: 2 }}>
            <Typography variant="subtitle2" sx={{ color: 'var(--accent-gold)', mb: 1.5 }}>Recover Completed Video</Typography>
            <Stack direction="row" spacing={1}>
                <TextField
                    size="small" fullWidth placeholder="Paste HeyGen video ID…"
                    value={videoId} onChange={e => setVideoId(e.target.value)}
                    sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'var(--bg-primary)', color: '#fff', '& fieldset': { borderColor: 'var(--border-color)' } } }}
                    onKeyDown={e => e.key === 'Enter' && check()}
                />
                <Button variant="contained" onClick={check} disabled={checking || !videoId.trim()}
                    sx={{ bgcolor: 'var(--accent-gold)', color: '#000', whiteSpace: 'nowrap' }}>
                    {checking ? <CircularProgress size={18} sx={{ color: '#000' }} /> : 'Fetch Video'}
                </Button>
                <Button onClick={() => { setOpen(false); setRecoverError(''); }} sx={{ color: 'var(--text-secondary)' }}>Cancel</Button>
            </Stack>
            {recoverError && <Alert severity="warning" sx={{ mt: 1.5, bgcolor: 'rgba(255,152,0,0.08)', color: '#ffb74d', fontSize: '0.8rem' }}>{recoverError}</Alert>}
        </Paper>
    );
};
const AVATARS_PER_PAGE = 10;
const VOICES_PER_PAGE = 10;

const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

const VideoGeneratorView: React.FC = () => {
    const [activeStep, setActiveStep] = useState(0);
    const [script, setScript] = useState('');
    const [stockAvatars, setStockAvatars] = useState<AvatarOption[]>(FALLBACK_AVATARS);
    const [stockVoices, setStockVoices] = useState<VoiceOption[]>(FALLBACK_VOICES);
    const [avatarsLoading, setAvatarsLoading] = useState(true);
    const [voicesLoading, setVoicesLoading] = useState(true);
    const [selectedAvatar, setSelectedAvatar] = useState('');
    const [selectedVoice, setSelectedVoice] = useState('');
    const [bgMode, setBgMode] = useState<'color' | 'upload' | 'pexels'>('color');
    const [bgColor, setBgColor] = useState('#00FF00');
    const [uploadUrl, setUploadUrl] = useState('');
    const [pexelsQuery, setPexelsQuery] = useState('modern office');
    const [pexelsVideo, setPexelsVideo] = useState<{link: string, image: string} | null>(null);

    // Avatar logic
    const [avatarMode, setAvatarMode] = useState<'stock' | 'generated'>('stock');
    const [avatarPrompt, setAvatarPrompt] = useState('');
    const [generatedAvatarUrl, setGeneratedAvatarUrl] = useState('');
    const [isGeneratingAvatar, setIsGeneratingAvatar] = useState(false);
    const [talkingPhotoId, setTalkingPhotoId] = useState('');

    // Pagination & search
    const [avatarPage, setAvatarPage] = useState(1);
    const [avatarSearch, setAvatarSearch] = useState('');
    const [voicePage, setVoicePage] = useState(1);
    const [voiceSearch, setVoiceSearch] = useState('');

    // Generation status
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successVideoUrl, setSuccessVideoUrl] = useState('');
    const [status, setStatus] = useState<'idle' | 'processing' | 'completed'>('idle');
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [renderingStatus, setRenderingStatus] = useState('waiting');
    const [activeVideoId, setActiveVideoId] = useState('');
    const [pollError, setPollError] = useState('');

    const audioRef = useRef<HTMLAudioElement | null>(null);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const pollCountRef = useRef(0);

    // ── Derived values ────────────────────────────────────────────────────────

    const filteredAvatars = stockAvatars.filter(av =>
        av.id && (!avatarSearch || av.name.toLowerCase().includes(avatarSearch.toLowerCase()))
    );
    const pagedAvatars = filteredAvatars.slice((avatarPage - 1) * AVATARS_PER_PAGE, avatarPage * AVATARS_PER_PAGE);
    const totalAvatarPages = Math.ceil(filteredAvatars.length / AVATARS_PER_PAGE);

    const filteredVoices = stockVoices.filter(v =>
        v.id && (!voiceSearch || v.name.toLowerCase().includes(voiceSearch.toLowerCase()) || (v.language || '').toLowerCase().includes(voiceSearch.toLowerCase()))
    );
    const pagedVoices = filteredVoices.slice((voicePage - 1) * VOICES_PER_PAGE, voicePage * VOICES_PER_PAGE);
    const totalVoicePages = Math.ceil(filteredVoices.length / VOICES_PER_PAGE);

    const estimatedSeconds = 240;
    const renderProgress = Math.min(88, (elapsedSeconds / estimatedSeconds) * 100);

    // ── Load avatars + voices from HeyGen API ─────────────────────────────────
    useEffect(() => {
        fetch('/api/video-gen/heygen-avatars')
            .then(r => r.json())
            .then(data => {
                if (data.success && data.avatars.length > 0) {
                    setStockAvatars(data.avatars);
                    setSelectedAvatar(data.avatars[0].id);
                } else {
                    setStockAvatars([]);
                }
            })
            .catch(() => setStockAvatars([]))
            .finally(() => setAvatarsLoading(false));

        fetch('/api/video-gen/heygen-voices')
            .then(r => r.json())
            .then(data => {
                if (data.success && data.voices.length > 0) {
                    setStockVoices(data.voices);
                    setSelectedVoice(data.voices[0].id);
                } else {
                    setStockVoices([]);
                }
            })
            .catch(() => setStockVoices([]))
            .finally(() => setVoicesLoading(false));
    }, []);

    // Reset pages when search changes
    useEffect(() => { setAvatarPage(1); }, [avatarSearch]);
    useEffect(() => { setVoicePage(1); }, [voiceSearch]);

    // Timer during rendering
    useEffect(() => {
        if (status === 'processing') {
            setElapsedSeconds(0);
            setRenderingStatus('waiting');
            timerRef.current = setInterval(() => setElapsedSeconds(s => s + 1), 1000);
        } else {
            if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [status]);

    // Restore pending video_id from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('heygen_pending_video_id');
        if (saved) {
            const { videoId, startedAt } = JSON.parse(saved);
            const age = (Date.now() - startedAt) / 1000;
            if (age < 600) { // still within 10 min window
                setActiveVideoId(videoId);
                setStatus('processing');
                setElapsedSeconds(Math.floor(age));
                pollStatus(videoId);
            } else {
                localStorage.removeItem('heygen_pending_video_id');
            }
        }
    }, []);

    // ── Handlers ──────────────────────────────────────────────────────────────

    const handleNext = () => setActiveStep(prev => prev + 1);
    const handleBack = () => setActiveStep(prev => prev - 1);

    const playPreview = (url: string) => {
        if (audioRef.current) {
            audioRef.current.src = url;
            audioRef.current.play();
        }
    };

    const handleGenerateAvatar = async () => {
        if (!avatarPrompt.trim()) return;
        setIsGeneratingAvatar(true);
        setError('');
        try {
            const prompt = `A professional photorealistic headshot portrait of ${avatarPrompt}. Facing forward, neutral expression, clean studio background.`;
            const res = await fetch('/api/auto-scene/render-3d', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt }),
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.error);
            setGeneratedAvatarUrl(data.url);
        } catch (err: any) {
            setError(err.message || 'Failed to generate avatar');
        } finally {
            setIsGeneratingAvatar(false);
        }
    };

    const handleUpload = async (file: File) => {
        setLoading(true);
        const formData = new FormData();
        formData.append('image', file);
        try {
            const res = await fetch('/api/upload-image', { method: 'POST', body: formData });
            const data = await res.json();
            if (data.success) setUploadUrl(data.url);
        } catch (err) { setError('Upload failed'); }
        finally { setLoading(false); }
    };

    const searchPexels = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/video-gen/pexels-search?query=${encodeURIComponent(pexelsQuery)}`);
            const data = await res.json();
            if (data.success && data.videos.length > 0) {
                setPexelsVideo(data.videos[0]);
            }
        } catch (err) { setError('Pexels search failed'); }
        finally { setLoading(false); }
    };

    const handleGenerate = async () => {
        setLoading(true);
        setError('');
        setStatus('processing');
        try {
            const res = await fetch('/api/video-gen/heygen-generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    script,
                    backgroundVideoUrl: bgMode === 'upload' ? uploadUrl : (bgMode === 'pexels' ? pexelsVideo?.link : undefined),
                    bgMode,
                    bgColor,
                    avatarId: avatarMode === 'stock' ? selectedAvatar : talkingPhotoId,
                    avatarType: avatarMode === 'stock' ? 'avatar' : 'talking_photo',
                    voiceId: selectedVoice,
                    layout: 'lower_third'
                }),
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.error);
            setActiveVideoId(data.video_id);
            setPollError('');
            localStorage.setItem('heygen_pending_video_id', JSON.stringify({ videoId: data.video_id, startedAt: Date.now() }));
            pollStatus(data.video_id);
        } catch (err: any) {
            setError(err.message);
            setStatus('idle');
            setLoading(false);
        }
    };

    const pollStatus = (videoId: string) => {
        if (pollRef.current) clearInterval(pollRef.current);
        pollCountRef.current = 0;

        const MAX_POLLS = 120; // 10 minutes at 5s interval

        const tick = async () => {
            pollCountRef.current += 1;

            // Timeout guard
            if (pollCountRef.current > MAX_POLLS) {
                clearInterval(pollRef.current!);
                setPollError(`Timed out after 10 minutes. Video ID: ${videoId} — check HeyGen dashboard directly.`);
                setStatus('idle');
                setLoading(false);
                localStorage.removeItem('heygen_pending_video_id');
                return;
            }

            try {
                const res = await fetch(`/api/video-gen/heygen-status/${videoId}`);
                const data = await res.json();
                if (data.status) setRenderingStatus(data.status);

                if (data.status === 'completed') {
                    clearInterval(pollRef.current!);
                    setSuccessVideoUrl(data.video_url);
                    setStatus('completed');
                    setLoading(false);
                    localStorage.removeItem('heygen_pending_video_id');
                } else if (data.status === 'failed') {
                    clearInterval(pollRef.current!);
                    setError(data.error || 'HeyGen render failed');
                    setPollError(`Failed. Video ID: ${videoId}`);
                    setStatus('idle');
                    setLoading(false);
                    localStorage.removeItem('heygen_pending_video_id');
                } else if (data.error) {
                    // Status endpoint itself returned an error — keep polling but show it
                    setPollError(`Poll error: ${data.error}`);
                }
            } catch (err: any) {
                // Network error — keep polling, don't stop
                setPollError(`Network error during poll (retrying…): ${err.message}`);
            }
        };

        pollRef.current = setInterval(tick, 5000);
        tick(); // immediate first check
    };

    const handleManualCheck = () => {
        if (activeVideoId) {
            setPollError('');
            pollStatus(activeVideoId);
        }
    };

    // ── Render Steps ──────────────────────────────────────────────────────────

    const renderStepContent = () => {
        switch (activeStep) {
            case 0: // Script
                return (
                    <Box sx={{ mt: 2 }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                            <Typography variant="subtitle1" sx={{ color: 'var(--text-primary)' }}>Paste your full video script below</Typography>
                            <Chip
                                size="small"
                                label={`${script.length} chars · ~${Math.ceil(script.split(/\s+/).filter(Boolean).length / 130)} min`}
                                sx={{ bgcolor: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)', fontSize: '0.65rem' }}
                            />
                        </Stack>
                        <TextField
                            fullWidth
                            multiline
                            rows={10}
                            placeholder="Hello, I am your AI avatar. Today we are talking about..."
                            value={script}
                            onChange={(e) => setScript(e.target.value)}
                            sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'rgba(0,0,0,0.2)', color: '#fff' } }}
                        />
                    </Box>
                );
            case 1: // Avatar
                return (
                    <Box sx={{ mt: 2 }}>
                        <ToggleButtonGroup
                            value={avatarMode}
                            exclusive
                            onChange={(_, m) => m && setAvatarMode(m)}
                            size="small"
                            fullWidth
                            sx={{ mb: 3 }}
                        >
                            <ToggleButton value="stock" sx={{ color: 'var(--text-secondary)' }}>
                                <AvatarIcon sx={{ mr: 1, fontSize: 18 }} /> Stock Avatars
                            </ToggleButton>
                            <ToggleButton value="generated" sx={{ color: 'var(--text-secondary)' }}>
                                <FaceIcon sx={{ mr: 1, fontSize: 18 }} /> Gemini AI Face
                            </ToggleButton>
                        </ToggleButtonGroup>

                        {avatarMode === 'stock' ? (
                            <>
                                {/* Search + count */}
                                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                                    <TextField
                                        size="small"
                                        placeholder="Search avatars…"
                                        value={avatarSearch}
                                        onChange={e => setAvatarSearch(e.target.value)}
                                        InputProps={{
                                            startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 18, color: 'var(--text-secondary)' }} /></InputAdornment>
                                        }}
                                        sx={{ flex: 1, '& .MuiOutlinedInput-root': { bgcolor: 'rgba(0,0,0,0.2)', color: '#fff' } }}
                                    />
                                    {!avatarsLoading && (
                                        <Typography variant="caption" sx={{ color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                                            {filteredAvatars.length} avatar{filteredAvatars.length !== 1 ? 's' : ''}
                                        </Typography>
                                    )}
                                </Stack>

                                {avatarsLoading && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, color: 'var(--text-secondary)', mb: 2 }}>
                                        <CircularProgress size={16} sx={{ color: 'var(--accent-gold)' }} />
                                        <Typography variant="caption">Loading avatars from HeyGen…</Typography>
                                    </Box>
                                )}
                                {!avatarsLoading && filteredAvatars.length === 0 && (
                                    <Alert severity="warning" sx={{ bgcolor: 'rgba(255,152,0,0.1)', color: '#ffb74d', mb: 2 }}>
                                        {stockAvatars.filter(a => a.id).length === 0
                                            ? 'No avatars found. Make sure your HeyGen API key is set in LLM Settings.'
                                            : 'No avatars match your search.'}
                                    </Alert>
                                )}

                                <Grid container spacing={2}>
                                    {pagedAvatars.map((av) => (
                                        <Grid size={{ xs: 12, sm: 6, md: 3 }} key={av.id}>
                                            <Card sx={{
                                                bgcolor: selectedAvatar === av.id ? 'rgba(201,169,97,0.2)' : 'var(--bg-secondary)',
                                                border: selectedAvatar === av.id ? '2px solid var(--accent-gold)' : '1px solid var(--border-color)',
                                                transition: '0.2s',
                                                '&:hover': { transform: 'translateY(-4px)' }
                                            }}>
                                                <CardActionArea onClick={() => setSelectedAvatar(av.id)}>
                                                    <Box sx={{ position: 'relative', pt: '125%', overflow: 'hidden' }}>
                                                        <img src={av.thumbnail} alt={av.name} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    </Box>
                                                    <CardContent sx={{ p: 1.5, textAlign: 'center' }}>
                                                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: selectedAvatar === av.id ? 'var(--accent-gold)' : '#fff' }}>{av.name}</Typography>
                                                        <Typography variant="caption" sx={{ color: 'var(--text-secondary)' }}>{av.gender.toUpperCase()}</Typography>
                                                    </CardContent>
                                                </CardActionArea>
                                            </Card>
                                        </Grid>
                                    ))}
                                </Grid>

                                {totalAvatarPages > 1 && (
                                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                                        <Pagination
                                            count={totalAvatarPages}
                                            page={avatarPage}
                                            onChange={(_, p) => setAvatarPage(p)}
                                            size="small"
                                            sx={{
                                                '& .MuiPaginationItem-root': { color: 'var(--text-secondary)' },
                                                '& .MuiPaginationItem-root.Mui-selected': { bgcolor: 'rgba(201,169,97,0.2)', color: 'var(--accent-gold)' },
                                            }}
                                        />
                                    </Box>
                                )}
                            </>
                        ) : (
                            <Box sx={{ p: 4, bgcolor: 'rgba(0,0,0,0.2)', borderRadius: 2, textAlign: 'center' }}>
                                <Typography variant="h6" sx={{ color: 'var(--accent-gold)', mb: 2 }}>Generate Custom Face with Gemini</Typography>
                                <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
                                    <TextField
                                        fullWidth
                                        placeholder="e.g. A friendly elderly scientist with glasses..."
                                        value={avatarPrompt}
                                        onChange={(e) => setAvatarPrompt(e.target.value)}
                                        sx={{ '& .MuiOutlinedInput-root': { color: '#fff' } }}
                                    />
                                    <Button
                                        variant="contained"
                                        onClick={handleGenerateAvatar}
                                        disabled={isGeneratingAvatar || !avatarPrompt.trim()}
                                        sx={{ bgcolor: 'var(--accent-gold)', color: '#000', minWidth: 120 }}
                                    >
                                        {isGeneratingAvatar ? <CircularProgress size={20} /> : 'Generate'}
                                    </Button>
                                </Stack>

                                {generatedAvatarUrl && (
                                    <Box sx={{ mb: 4 }}>
                                        <img src={generatedAvatarUrl} alt="AI Face" style={{ width: 200, height: 200, borderRadius: '50%', border: '3px solid var(--accent-gold)', objectFit: 'cover' }} />
                                        <Typography variant="body2" sx={{ color: 'var(--text-secondary)', mt: 2 }}>
                                            Step 1: Save this image.<br />
                                            Step 2: Upload to HeyGen "Talking Photo" section.<br />
                                            Step 3: Paste the <b>Talking Photo ID</b> below.
                                        </Typography>
                                        <TextField
                                            sx={{ mt: 3, maxWidth: 400, mx: 'auto', display: 'block', '& .MuiOutlinedInput-root': { color: '#fff' } }}
                                            fullWidth
                                            label="Talking Photo ID from HeyGen"
                                            value={talkingPhotoId}
                                            onChange={(e) => setTalkingPhotoId(e.target.value)}
                                        />
                                    </Box>
                                )}
                            </Box>
                        )}
                    </Box>
                );
            case 2: // Voice
                return (
                    <Box sx={{ mt: 2 }}>
                        {/* Search + count */}
                        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                            <TextField
                                size="small"
                                fullWidth
                                placeholder="Search by name or language…"
                                value={voiceSearch}
                                onChange={e => setVoiceSearch(e.target.value)}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 18, color: 'var(--text-secondary)' }} /></InputAdornment>
                                }}
                                sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'rgba(0,0,0,0.2)', color: '#fff' } }}
                            />
                            {!voicesLoading && (
                                <Typography variant="caption" sx={{ color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                                    {filteredVoices.length} voice{filteredVoices.length !== 1 ? 's' : ''}
                                </Typography>
                            )}
                        </Stack>

                        {voicesLoading && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, color: 'var(--text-secondary)', mb: 2 }}>
                                <CircularProgress size={16} sx={{ color: 'var(--accent-gold)' }} />
                                <Typography variant="caption">Loading voices from HeyGen…</Typography>
                            </Box>
                        )}
                        {!voicesLoading && filteredVoices.length === 0 && (
                            <Alert severity="warning" sx={{ bgcolor: 'rgba(255,152,0,0.1)', color: '#ffb74d', mb: 2 }}>
                                {stockVoices.filter(v => v.id).length === 0
                                    ? 'No voices found. Make sure your HeyGen API key is set.'
                                    : 'No voices match your search.'}
                            </Alert>
                        )}

                        <Stack spacing={1}>
                            {pagedVoices.map((v) => (
                                <Paper key={v.id} sx={{
                                    p: 1.5,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    bgcolor: selectedVoice === v.id ? 'rgba(201,169,97,0.1)' : 'var(--bg-secondary)',
                                    border: selectedVoice === v.id ? '1px solid var(--accent-gold)' : '1px solid var(--border-color)',
                                    cursor: 'pointer',
                                    transition: '0.15s',
                                    '&:hover': { borderColor: 'rgba(201,169,97,0.4)' },
                                }} onClick={() => setSelectedVoice(v.id)}>
                                    <Stack direction="row" alignItems="center" spacing={1.5}>
                                        <MuiAvatar sx={{ bgcolor: v.gender === 'Female' ? '#e91e63' : '#2196f3', width: 28, height: 28 }}>
                                            <AvatarIcon sx={{ fontSize: 15 }} />
                                        </MuiAvatar>
                                        <Box>
                                            <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#fff', lineHeight: 1.2 }}>{v.name}</Typography>
                                            <Typography variant="caption" sx={{ color: 'var(--text-secondary)' }}>
                                                {v.gender}{v.language ? ` · ${v.language}` : ''}
                                            </Typography>
                                        </Box>
                                    </Stack>
                                    <Stack direction="row" spacing={0.5} alignItems="center">
                                        {selectedVoice === v.id && <Chip size="small" label="Selected" sx={{ bgcolor: 'rgba(201,169,97,0.2)', color: 'var(--accent-gold)', height: 18, fontSize: '0.6rem' }} />}
                                        {v.previewUrl && (
                                            <Tooltip title="Preview voice">
                                                <IconButton
                                                    size="small"
                                                    onClick={(e) => { e.stopPropagation(); playPreview(v.previewUrl!); }}
                                                    sx={{ color: 'var(--accent-gold)' }}
                                                >
                                                    <PlayIcon sx={{ fontSize: 18 }} />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                    </Stack>
                                </Paper>
                            ))}
                        </Stack>

                        {totalVoicePages > 1 && (
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 2, gap: 2 }}>
                                <Pagination
                                    count={totalVoicePages}
                                    page={voicePage}
                                    onChange={(_, p) => setVoicePage(p)}
                                    size="small"
                                    sx={{
                                        '& .MuiPaginationItem-root': { color: 'var(--text-secondary)' },
                                        '& .MuiPaginationItem-root.Mui-selected': { bgcolor: 'rgba(201,169,97,0.2)', color: 'var(--accent-gold)' },
                                    }}
                                />
                                <Typography variant="caption" sx={{ color: 'var(--text-secondary)' }}>
                                    {(voicePage - 1) * VOICES_PER_PAGE + 1}–{Math.min(voicePage * VOICES_PER_PAGE, filteredVoices.length)} of {filteredVoices.length}
                                </Typography>
                            </Box>
                        )}
                    </Box>
                );
            case 3: // Background & Render
                return (
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle1" sx={{ color: 'var(--text-primary)', mb: 2 }}>Choose Background Style</Typography>
                        <Grid container spacing={3}>
                            <Grid size={{ xs: 12, md: 4 }}>
                                <Card sx={{ bgcolor: bgMode === 'color' ? 'rgba(201,169,97,0.1)' : 'var(--bg-secondary)', border: bgMode === 'color' ? '1px solid var(--accent-gold)' : '1px solid var(--border-color)' }}>
                                    <CardActionArea onClick={() => setBgMode('color')} sx={{ p: 2, textAlign: 'center' }}>
                                        <ColorIcon sx={{ fontSize: 40, color: 'var(--accent-gold)', mb: 1 }} />
                                        <Typography variant="h6" sx={{ color: '#fff' }}>Solid Color</Typography>
                                        <Typography variant="caption" sx={{ color: 'var(--text-secondary)' }}>Best for Green Screen / Editing</Typography>
                                        {bgMode === 'color' && (
                                            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                                                <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} />
                                                <Typography variant="body2" sx={{ color: '#fff' }}>{bgColor}</Typography>
                                            </Box>
                                        )}
                                    </CardActionArea>
                                </Card>
                            </Grid>
                            <Grid size={{ xs: 12, md: 4 }}>
                                <Card sx={{ bgcolor: bgMode === 'upload' ? 'rgba(201,169,97,0.1)' : 'var(--bg-secondary)', border: bgMode === 'upload' ? '1px solid var(--accent-gold)' : '1px solid var(--border-color)' }}>
                                    <CardActionArea component="label" sx={{ p: 2, textAlign: 'center' }}>
                                        <UploadIcon sx={{ fontSize: 40, color: 'var(--accent-gold)', mb: 1 }} />
                                        <Typography variant="h6" sx={{ color: '#fff' }}>Upload Own</Typography>
                                        <Typography variant="caption" sx={{ color: 'var(--text-secondary)' }}>Use your own image or video</Typography>
                                        <input type="file" hidden accept="image/*,video/*" onChange={(e) => { if (e.target.files?.[0]) { setBgMode('upload'); handleUpload(e.target.files[0]); } }} />
                                        {uploadUrl && <Chip size="small" label="File Ready" sx={{ mt: 1, bgcolor: '#4caf50', color: '#fff' }} />}
                                    </CardActionArea>
                                </Card>
                            </Grid>
                            <Grid size={{ xs: 12, md: 4 }}>
                                <Card sx={{ bgcolor: bgMode === 'pexels' ? 'rgba(201,169,97,0.1)' : 'var(--bg-secondary)', border: bgMode === 'pexels' ? '1px solid var(--accent-gold)' : '1px solid var(--border-color)' }}>
                                    <CardActionArea onClick={() => setBgMode('pexels')} sx={{ p: 2, textAlign: 'center' }}>
                                        <StockIcon sx={{ fontSize: 40, color: 'var(--accent-gold)', mb: 1 }} />
                                        <Typography variant="h6" sx={{ color: '#fff' }}>Stock B-Roll</Typography>
                                        <Typography variant="caption" sx={{ color: 'var(--text-secondary)' }}>Free videos from Pexels</Typography>
                                    </CardActionArea>
                                    {bgMode === 'pexels' && (
                                        <Box sx={{ p: 1 }}>
                                            <TextField
                                                fullWidth
                                                size="small"
                                                value={pexelsQuery}
                                                onChange={(e) => setPexelsQuery(e.target.value)}
                                                placeholder="Search e.g. nature..."
                                                sx={{ '& .MuiOutlinedInput-root': { color: '#fff' } }}
                                                InputProps={{ endAdornment: <IconButton size="small" onClick={searchPexels}><SearchIcon sx={{ color: 'var(--accent-gold)' }} /></IconButton> }}
                                            />
                                            {pexelsVideo && <img src={pexelsVideo.image} style={{ width: '100%', height: 60, objectFit: 'cover', marginTop: 8, borderRadius: 4 }} />}
                                        </Box>
                                    )}
                                </Card>
                            </Grid>
                        </Grid>
                    </Box>
                );
            default:
                return null;
        }
    };

    // ── Processing screen ──────────────────────────────────────────────────────

    const RENDER_STAGES = ['waiting', 'processing', 'encoding'];
    const stageIndex = RENDER_STAGES.indexOf(renderingStatus);

    const renderProcessingScreen = () => (
        <Card sx={{ bgcolor: 'var(--bg-secondary)', p: { xs: 4, md: 6 }, textAlign: 'center', border: '1px solid var(--border-color)' }}>
            <CircularProgress size={56} sx={{ color: 'var(--accent-gold)', mb: 3 }} />
            <Typography variant="h5" sx={{ color: '#fff', mb: 2 }}>HeyGen is rendering your video…</Typography>

            {/* Stage chips */}
            <Stack direction="row" justifyContent="center" spacing={1} sx={{ mb: 3 }}>
                {RENDER_STAGES.map((stage, i) => {
                    const isActive = i === stageIndex;
                    const isPast = i < stageIndex;
                    return (
                        <Chip key={stage} label={stage} size="small" sx={{
                            bgcolor: isActive ? 'rgba(201,169,97,0.2)' : isPast ? 'rgba(76,175,80,0.15)' : 'rgba(255,255,255,0.05)',
                            color: isActive ? 'var(--accent-gold)' : isPast ? '#81c784' : 'var(--text-secondary)',
                            border: isActive ? '1px solid rgba(201,169,97,0.4)' : '1px solid transparent',
                            fontWeight: isActive ? 700 : 400,
                            textTransform: 'capitalize',
                        }} />
                    );
                })}
            </Stack>

            {/* Elapsed timer */}
            <Stack direction="row" justifyContent="center" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                <TimerIcon sx={{ fontSize: 20, color: 'var(--accent-gold)' }} />
                <Typography variant="h4" sx={{ color: 'var(--accent-gold)', fontFamily: 'monospace', fontWeight: 700 }}>
                    {formatTime(elapsedSeconds)}
                </Typography>
            </Stack>
            <Typography variant="caption" sx={{ color: 'var(--text-secondary)' }}>
                elapsed · typical render time 2–5 minutes
            </Typography>

            {/* Determinate progress */}
            <Box sx={{ mt: 3, mb: 3, px: 2 }}>
                <LinearProgress variant="determinate" value={renderProgress} sx={{
                    height: 8, borderRadius: 4,
                    bgcolor: 'rgba(255,255,255,0.08)',
                    '& .MuiLinearProgress-bar': { bgcolor: 'var(--accent-gold)', borderRadius: 4 }
                }} />
                <Typography variant="caption" sx={{ color: 'var(--text-secondary)', mt: 0.5, display: 'block' }}>
                    ~{Math.round(renderProgress)}% estimated
                </Typography>
            </Box>

            {/* Poll error (non-fatal) */}
            {pollError && (
                <Alert severity="warning" sx={{ mb: 2, bgcolor: 'rgba(255,152,0,0.08)', color: '#ffb74d', textAlign: 'left', fontSize: '0.8rem' }}>
                    {pollError}
                </Alert>
            )}

            {/* Video ID + manual check */}
            {activeVideoId && (
                <Box sx={{ mt: 1, p: 2, bgcolor: 'rgba(0,0,0,0.2)', borderRadius: 1.5, textAlign: 'left' }}>
                    <Typography variant="caption" sx={{ color: 'var(--text-secondary)', display: 'block', mb: 0.5 }}>
                        HeyGen Video ID (save this in case you need to recover the video):
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <Typography sx={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--accent-gold)', flex: 1, wordBreak: 'break-all' }}>
                            {activeVideoId}
                        </Typography>
                        <Button size="small" variant="outlined" onClick={handleManualCheck}
                            startIcon={<RefreshIcon sx={{ fontSize: 14 }} />}
                            sx={{ color: 'var(--accent-gold)', borderColor: 'rgba(201,169,97,0.4)', whiteSpace: 'nowrap', fontSize: '0.72rem' }}>
                            Check Now
                        </Button>
                    </Stack>
                </Box>
            )}
        </Card>
    );

    // ── Main render ───────────────────────────────────────────────────────────

    return (
        <Box sx={{ p: 4, maxWidth: 1000, mx: 'auto' }}>
            <audio ref={audioRef} />

            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 4 }}>
                <VideoGenIcon sx={{ fontSize: 40, color: 'var(--accent-gold)' }} />
                <Box>
                    <Typography variant="h4" sx={{ color: 'var(--accent-gold)', fontWeight: 'bold', fontVariant: 'small-caps' }}>
                        AI Avatar Creator
                    </Typography>
                    <Typography variant="subtitle1" sx={{ color: 'var(--text-secondary)' }}>
                        Professional video in 4 simple steps
                    </Typography>
                </Box>
            </Stack>

            {/* Video recovery panel — paste a HeyGen video ID to fetch a completed video */}
            {status === 'idle' && <VideoRecoveryPanel onRecovered={(url) => { setSuccessVideoUrl(url); setStatus('completed'); }} />}

            {status === 'completed' && successVideoUrl ? (
                <Card sx={{ bgcolor: 'var(--bg-secondary)', p: 4, textAlign: 'center', border: '1px solid var(--accent-gold)' }}>
                    <SuccessIcon sx={{ fontSize: 60, color: '#4caf50', mb: 2 }} />
                    <Typography variant="h5" sx={{ color: '#fff', mb: 1 }}>Video Generated Successfully!</Typography>
                    <Typography variant="caption" sx={{ color: 'var(--text-secondary)', display: 'block', mb: 3 }}>
                        Rendered in {formatTime(elapsedSeconds)}
                    </Typography>
                    <video src={successVideoUrl} controls style={{ width: '100%', maxWidth: 600, borderRadius: 8, border: '1px solid var(--border-color)' }} />
                    <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center' }}>
                        <Button variant="contained" onClick={() => window.open(successVideoUrl, '_blank')} startIcon={<DownloadIcon />} sx={{ bgcolor: 'var(--accent-gold)', color: '#000' }}>Download Video</Button>
                        <Button variant="outlined" onClick={() => { setStatus('idle'); setSuccessVideoUrl(''); setActiveStep(0); }} sx={{ color: 'var(--accent-gold)', borderColor: 'var(--accent-gold)' }}>Create Another</Button>
                    </Box>
                </Card>
            ) : status === 'processing' ? (
                renderProcessingScreen()
            ) : (
                <>
                    <Stepper activeStep={activeStep} sx={{ mb: 6, '& .MuiStepLabel-label': { color: 'var(--text-secondary)' }, '& .MuiStepLabel-label.Mui-active': { color: 'var(--accent-gold)' }, '& .MuiStepIcon-root.Mui-active': { color: 'var(--accent-gold)' }, '& .MuiStepIcon-root.Mui-completed': { color: '#4caf50' } }}>
                        {STEPS.map((label) => (
                            <Step key={label}>
                                <StepLabel>{label}</StepLabel>
                            </Step>
                        ))}
                    </Stepper>

                    <Paper sx={{ p: 4, bgcolor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 2 }}>
                        {renderStepContent()}

                        {error && <Alert severity="error" sx={{ mt: 3 }}>{error}</Alert>}

                        <Divider sx={{ my: 4, borderColor: 'var(--border-color)' }} />

                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Button
                                disabled={activeStep === 0 || loading}
                                onClick={handleBack}
                                startIcon={<BackIcon />}
                                sx={{ color: 'var(--text-secondary)' }}
                            >
                                Back
                            </Button>
                            {activeStep === STEPS.length - 1 ? (
                                <Button
                                    variant="contained"
                                    onClick={handleGenerate}
                                    disabled={loading || !script.trim() || (bgMode === 'upload' && !uploadUrl) || (bgMode === 'pexels' && !pexelsVideo)}
                                    startIcon={loading ? <CircularProgress size={20} /> : <MovieIcon />}
                                    sx={{ bgcolor: 'var(--accent-gold)', color: '#000', fontWeight: 'bold', px: 4 }}
                                >
                                    Generate Video
                                </Button>
                            ) : (
                                <Button
                                    variant="contained"
                                    onClick={handleNext}
                                    disabled={(activeStep === 0 && !script.trim()) || (activeStep === 1 && avatarMode === 'generated' && !talkingPhotoId)}
                                    endIcon={<NextIcon />}
                                    sx={{ bgcolor: 'var(--accent-gold)', color: '#000', fontWeight: 'bold', px: 4 }}
                                >
                                    Continue
                                </Button>
                            )}
                        </Box>
                    </Paper>
                </>
            )}
        </Box>
    );
};

export default VideoGeneratorView;
