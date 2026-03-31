import React, { useState, useEffect, useRef } from 'react';
import {
    Box, Typography, TextField, Button, Card, CardContent, Chip, LinearProgress,
    IconButton, Tooltip, Stack, Paper, Grid, ToggleButtonGroup, ToggleButton,
    Select, MenuItem, FormControl, InputLabel, Alert, Divider, CircularProgress,
    Dialog, DialogTitle, DialogContent, DialogActions, Stepper, Step, StepLabel,
    CardActionArea, Avatar as MuiAvatar
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
    previewUrl?: string;
}

const STOCK_AVATARS: AvatarOption[] = [
    { id: 'Daisy-working-suit-20230818', name: 'Daisy (Suit)', gender: 'female', thumbnail: 'https://files2.heygen.ai/avatar/v3/9f8c6b446a814c81881a53f0f7a6f235_26955/preview_target.webp' },
    { id: 'Maya-default-20230622', name: 'Maya (Casual)', gender: 'female', thumbnail: 'https://files2.heygen.ai/avatar/v3/423f85885f81498b965f7c320d365691_26046/preview_target.webp' },
    { id: 'Tyler-as-teacher-20230818', name: 'Tyler (Teacher)', gender: 'male', thumbnail: 'https://files2.heygen.ai/avatar/v3/88029983401546998634812306509743/preview_target.webp' },
    { id: 'Ekar-casual-20230531', name: 'Ekar (Casual)', gender: 'male', thumbnail: 'https://files2.heygen.ai/avatar/v3/10834311028754546876274438343869/preview_target.webp' },
];

const STOCK_VOICES: VoiceOption[] = [
    { id: 'en-US-JennyNeural', name: 'Jenny (US)', gender: 'female', previewUrl: 'https://files2.heygen.ai/voice/preview/en-US-JennyNeural.mp3' },
    { id: 'en-US-GuyNeural', name: 'Guy (US)', gender: 'male', previewUrl: 'https://files2.heygen.ai/voice/preview/en-US-GuyNeural.mp3' },
    { id: 'en-US-AriaNeural', name: 'Aria (US)', gender: 'female', previewUrl: 'https://files2.heygen.ai/voice/preview/en-US-AriaNeural.mp3' },
    { id: 'en-GB-RyanNeural', name: 'Ryan (UK)', gender: 'male', previewUrl: 'https://files2.heygen.ai/voice/preview/en-GB-RyanNeural.mp3' },
];

const STEPS = ['Write Script', 'Select Avatar', 'Choose Voice', 'Background & Render'];

const VideoGeneratorView: React.FC = () => {
    const [activeStep, setActiveStep] = useState(0);
    const [script, setScript] = useState('');
    const [selectedAvatar, setSelectedAvatar] = useState(STOCK_AVATARS[0].id);
    const [selectedVoice, setSelectedVoice] = useState(STOCK_VOICES[0].id);
    const [bgMode, setBgMode] = useState<'color' | 'upload' | 'pexels'>('color');
    const [bgColor, setBgColor] = useState('#00FF00');
    const [uploadUrl, setUploadUrl] = useState('');
    const [pexelsQuery, setPexelsQuery] = useState('modern office');
    const [pexelsVideo, setPexelsVideo] = useState<{link: string, image: string} | null>(null);
    
    // Avatar Logic
    const [avatarMode, setAvatarMode] = useState<'stock' | 'generated'>('stock');
    const [avatarPrompt, setAvatarPrompt] = useState('');
    const [generatedAvatarUrl, setGeneratedAvatarUrl] = useState('');
    const [isGeneratingAvatar, setIsGeneratingAvatar] = useState(false);
    const [talkingPhotoId, setTalkingPhotoId] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successVideoUrl, setSuccessVideoUrl] = useState('');
    const [status, setStatus] = useState<'idle' | 'processing' | 'completed'>('idle');

    const audioRef = useRef<HTMLAudioElement | null>(null);

    // ── Handlers ──────────────────────────────────────────────────────────────

    const handleNext = () => setActiveStep((prev) => prev + 1);
    const handleBack = () => setActiveStep((prev) => prev - 1);

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

            pollStatus(data.video_id);
        } catch (err: any) {
            setError(err.message);
            setStatus('idle');
            setLoading(false);
        }
    };

    const pollStatus = (videoId: string) => {
        const interval = setInterval(async () => {
            try {
                const res = await fetch(`/api/video-gen/heygen-status/${videoId}`);
                const data = await res.json();
                if (data.status === 'completed') {
                    clearInterval(interval);
                    setSuccessVideoUrl(data.video_url);
                    setStatus('completed');
                    setLoading(false);
                } else if (data.status === 'failed') {
                    clearInterval(interval);
                    setError(data.error || 'HeyGen render failed');
                    setStatus('idle');
                    setLoading(false);
                }
            } catch (err) {
                clearInterval(interval);
                setLoading(false);
            }
        }, 5000);
    };

    // ── Render Steps ──────────────────────────────────────────────────────────

    const renderStepContent = () => {
        switch (activeStep) {
            case 0: // Script
                return (
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle1" sx={{ color: 'var(--text-primary)', mb: 2 }}>Paste your full video script below</Typography>
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
                            sx={{ mb: 4 }}
                        >
                            <ToggleButton value="stock" sx={{ color: 'var(--text-secondary)' }}>
                                <AvatarIcon sx={{ mr: 1, fontSize: 18 }} /> Stock Avatars
                            </ToggleButton>
                            <ToggleButton value="generated" sx={{ color: 'var(--text-secondary)' }}>
                                <FaceIcon sx={{ mr: 1, fontSize: 18 }} /> Gemini AI Face
                            </ToggleButton>
                        </ToggleButtonGroup>

                        {avatarMode === 'stock' ? (
                            <Grid container spacing={2}>
                                {STOCK_AVATARS.map((av) => (
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
                        <Typography variant="subtitle1" sx={{ color: 'var(--text-primary)', mb: 2 }}>Select a professional AI voice</Typography>
                        <Stack spacing={1}>
                            {STOCK_VOICES.map((v) => (
                                <Paper key={v.id} sx={{ 
                                    p: 2, 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'space-between',
                                    bgcolor: selectedVoice === v.id ? 'rgba(201,169,97,0.1)' : 'var(--bg-secondary)',
                                    border: selectedVoice === v.id ? '1px solid var(--accent-gold)' : '1px solid var(--border-color)',
                                    cursor: 'pointer'
                                }} onClick={() => setSelectedVoice(v.id)}>
                                    <Stack direction="row" alignItems="center" spacing={2}>
                                        <MuiAvatar sx={{ bgcolor: v.gender === 'female' ? '#e91e63' : '#2196f3', width: 32, height: 32 }}>
                                            <AvatarIcon sx={{ fontSize: 18 }} />
                                        </MuiAvatar>
                                        <Box>
                                            <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#fff' }}>{v.name}</Typography>
                                            <Typography variant="caption" sx={{ color: 'var(--text-secondary)' }}>English (United States)</Typography>
                                        </Box>
                                    </Stack>
                                    <IconButton 
                                        onClick={(e) => { e.stopPropagation(); if(v.previewUrl) playPreview(v.previewUrl); }}
                                        sx={{ color: 'var(--accent-gold)' }}
                                    >
                                        <PlayIcon />
                                    </IconButton>
                                </Paper>
                            ))}
                        </Stack>
                    </Box>
                );
            case 3: // Finalize
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
                                            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
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
                                        <input type="file" hidden accept="image/*,video/*" onChange={(e) => { if(e.target.files?.[0]) handleUpload(e.target.files[0]); }} />
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
                                                InputProps={{ endAdornment: <IconButton size="small" onClick={searchPexels}><SearchIcon sx={{ color: 'var(--accent-gold)' }}/></IconButton> }}
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

            {status === 'completed' && successVideoUrl ? (
                <Card sx={{ bgcolor: 'var(--bg-secondary)', p: 4, textAlign: 'center', border: '1px solid var(--accent-gold)' }}>
                    <SuccessIcon sx={{ fontSize: 60, color: '#4caf50', mb: 2 }} />
                    <Typography variant="h5" sx={{ color: '#fff', mb: 3 }}>Video Generated Successfully!</Typography>
                    <video src={successVideoUrl} controls style={{ width: '100%', maxWidth: 600, borderRadius: 8, border: '1px solid var(--border-color)' }} />
                    <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center' }}>
                        <Button variant="contained" onClick={() => window.open(successVideoUrl, '_blank')} startIcon={<DownloadIcon />} sx={{ bgcolor: 'var(--accent-gold)', color: '#000' }}>Download Video</Button>
                        <Button variant="outlined" onClick={() => { setStatus('idle'); setSuccessVideoUrl(''); setActiveStep(0); }} sx={{ color: 'var(--accent-gold)', borderColor: 'var(--accent-gold)' }}>Create Another</Button>
                    </Box>
                </Card>
            ) : status === 'processing' ? (
                <Card sx={{ bgcolor: 'var(--bg-secondary)', p: 8, textAlign: 'center' }}>
                    <CircularProgress size={60} sx={{ color: 'var(--accent-gold)', mb: 3 }} />
                    <Typography variant="h5" sx={{ color: '#fff', mb: 1 }}>HeyGen is rendering your video...</Typography>
                    <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>This usually takes 2-5 minutes depending on script length.</Typography>
                    <LinearProgress variant="indeterminate" sx={{ mt: 4, bgcolor: 'rgba(255,255,255,0.1)', '& .MuiLinearProgress-bar': { bgcolor: 'var(--accent-gold)' } }} />
                </Card>
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
