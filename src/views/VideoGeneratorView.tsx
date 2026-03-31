import React, { useState, useEffect, useRef } from 'react';
import {
    Box, Typography, TextField, Button, Card, CardContent, Chip, LinearProgress,
    IconButton, Tooltip, Stack, Paper, Grid, ToggleButtonGroup, ToggleButton,
    Select, MenuItem, FormControl, InputLabel, Alert, Divider, CircularProgress,
    Dialog, DialogTitle, DialogContent, DialogActions
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
} from '@mui/icons-material';

interface Scene {
    id: string;
    script: string;
    background_query: string;
    videoUrl?: string;
    thumbnailUrl?: string;
    heygenStatus?: 'idle' | 'processing' | 'completed' | 'error';
    heygenVideoUrl?: string;
    error?: string;
}

const AVATARS = [
    { id: 'jessica_suit_outfit', name: 'Jessica (Suit)', gender: 'female' },
    { id: 'eric_casual_outfit', name: 'Eric (Casual)', gender: 'male' },
    { id: 'waynn_business_outfit', name: 'Waynn (Business)', gender: 'male' },
];

const VOICES = [
    { id: 'en-US-JennyNeural', name: 'Jenny (US)', gender: 'female' },
    { id: 'en-US-GuyNeural', name: 'Guy (US)', gender: 'male' },
];

const VideoGeneratorView: React.FC = () => {
    const [mode, setMode] = useState<'topic' | 'paste'>('topic');
    const [input, setInput] = useState('');
    const [scenes, setScenes] = useState<Scene[]>([]);
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState('');
    
    // Settings
    const [avatarMode, setAvatarMode] = useState<'stock' | 'generated'>('stock');
    const [avatar, setAvatar] = useState(AVATARS[0].id);
    const [voice, setVoice] = useState(VOICES[0].id);
    const [layout, setLayout] = useState<'circle' | 'lower_third'>('lower_third');

    // Generated Avatar State
    const [avatarPrompt, setAvatarPrompt] = useState('');
    const [generatedAvatarUrl, setGeneratedAvatarUrl] = useState('');
    const [isGeneratingAvatar, setIsGeneratingAvatar] = useState(false);
    const [talkingPhotoId, setTalkingPhotoId] = useState('');

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

    const handleAnalyze = async () => {
        if (!input.trim()) return;
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/video-gen/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ input, mode }),
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.error);
            setScenes(data.scenes.map((s: any, i: number) => ({
                ...s,
                id: `scene_${Date.now()}_${i}`,
                heygenStatus: 'idle'
            })));
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSearchPexels = async (sceneId: string, query: string) => {
        try {
            const res = await fetch(`/api/video-gen/pexels-search?query=${encodeURIComponent(query)}`);
            const data = await res.json();
            if (data.success && data.videos.length > 0) {
                setScenes(prev => prev.map(s =>
                    s.id === sceneId ? { ...s, videoUrl: data.videos[0].link, thumbnailUrl: data.videos[0].image } : s
                ));
            }
        } catch (err) {
            console.error('Pexels search failed:', err);
        }
    };

    const handleGenerateHeyGen = async (sceneId: string) => {
        const scene = scenes.find(s => s.id === sceneId);
        if (!scene || !scene.videoUrl) return;
        
        if (avatarMode === 'generated' && !talkingPhotoId) {
            setScenes(prev => prev.map(s => s.id === sceneId ? { ...s, error: 'Please enter a Talking Photo ID first.' } : s));
            return;
        }

        setScenes(prev => prev.map(s => s.id === sceneId ? { ...s, heygenStatus: 'processing', error: '' } : s));

        try {
            const res = await fetch('/api/video-gen/heygen-generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    script: scene.script,
                    backgroundVideoUrl: scene.videoUrl,
                    avatarId: avatarMode === 'stock' ? avatar : talkingPhotoId,
                    avatarType: avatarMode === 'stock' ? 'avatar' : 'talking_photo',
                    voiceId: voice,
                    layout: layout
                }),
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.error);

            // Poll for status
            pollHeyGenStatus(sceneId, data.video_id);
        } catch (err: any) {
            setScenes(prev => prev.map(s => s.id === sceneId ? { ...s, heygenStatus: 'error', error: err.message } : s));
        }
    };

    const pollHeyGenStatus = (sceneId: string, videoId: string) => {
        const interval = setInterval(async () => {
            try {
                const res = await fetch(`/api/video-gen/heygen-status/${videoId}`);
                const data = await res.json();
                if (data.status === 'completed') {
                    clearInterval(interval);
                    setScenes(prev => prev.map(s => s.id === sceneId ? { ...s, heygenStatus: 'completed', heygenVideoUrl: data.video_url } : s));
                } else if (data.status === 'failed') {
                    clearInterval(interval);
                    setScenes(prev => prev.map(s => s.id === sceneId ? { ...s, heygenStatus: 'error', error: data.error } : s));
                }
            } catch (err) {
                console.error('Polling failed:', err);
                clearInterval(interval);
            }
        }, 5000);
    };

    return (
        <Box sx={{ p: 4, maxWidth: 1200, mx: 'auto' }}>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 4 }}>
                <VideoGenIcon sx={{ fontSize: 40, color: 'var(--accent-gold)' }} />
                <Box>
                    <Typography variant="h4" sx={{ color: 'var(--accent-gold)', fontWeight: 'bold', fontVariant: 'small-caps' }}>
                        B-Roll Avatar Generator
                    </Typography>
                    <Typography variant="subtitle1" sx={{ color: 'var(--text-secondary)' }}>
                        Gemini Scripting + Pexels B-Roll + HeyGen Avatar
                    </Typography>
                </Box>
            </Stack>

            {/* Setup Panel */}
            <Paper sx={{ p: 3, mb: 4, bgcolor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 2 }}>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" sx={{ color: 'var(--text-primary)', mb: 2 }}>Input Mode</Typography>
                        <ToggleButtonGroup
                            value={mode}
                            exclusive
                            onChange={(_, m) => m && setMode(m)}
                            size="small"
                            fullWidth
                            sx={{ mb: 2 }}
                        >
                            <ToggleButton value="topic" sx={{ color: 'var(--text-secondary)' }}>
                                <TopicIcon sx={{ mr: 1, fontSize: 18 }} /> Topic Prompt
                            </ToggleButton>
                            <ToggleButton value="paste" sx={{ color: 'var(--text-secondary)' }}>
                                <PasteIcon sx={{ mr: 1, fontSize: 18 }} /> Paste Script
                            </ToggleButton>
                        </ToggleButtonGroup>
                        <TextField
                            fullWidth
                            multiline
                            rows={4}
                            placeholder={mode === 'topic' ? "Describe the video topic (e.g. 'How fusion energy works')..." : "Paste your full script here..."}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            sx={{
                                '& .MuiOutlinedInput-root': { bgcolor: 'var(--bg-primary)', color: 'var(--text-primary)' }
                            }}
                        />
                        <Button
                            fullWidth
                            variant="contained"
                            onClick={handleAnalyze}
                            disabled={loading || !input.trim()}
                            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SearchIcon />}
                            sx={{ mt: 2, bgcolor: 'var(--accent-gold)', color: '#000', fontWeight: 'bold' }}
                        >
                            {loading ? 'Analyzing Content...' : 'Generate Scenes & B-Roll'}
                        </Button>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" sx={{ color: 'var(--text-primary)', mb: 2 }}>Visual Style</Typography>
                        <Stack spacing={2}>
                            <ToggleButtonGroup
                                value={avatarMode}
                                exclusive
                                onChange={(_, m) => m && setAvatarMode(m)}
                                size="small"
                                fullWidth
                            >
                                <ToggleButton value="stock" sx={{ color: 'var(--text-secondary)' }}>Stock Avatar</ToggleButton>
                                <ToggleButton value="generated" sx={{ color: 'var(--text-secondary)' }}>Generated (Talking Photo)</ToggleButton>
                            </ToggleButtonGroup>

                            {avatarMode === 'stock' ? (
                                <FormControl fullWidth size="small">
                                    <InputLabel sx={{ color: 'var(--text-secondary)' }}>Avatar</InputLabel>
                                    <Select
                                        value={avatar}
                                        label="Avatar"
                                        onChange={(e) => setAvatar(e.target.value)}
                                        sx={{ bgcolor: 'var(--bg-primary)', color: '#fff' }}
                                    >
                                        {AVATARS.map(a => <MenuItem key={a.id} value={a.id}>{a.name}</MenuItem>)}
                                    </Select>
                                </FormControl>
                            ) : (
                                <Box sx={{ p: 2, bgcolor: 'var(--bg-primary)', borderRadius: 1, border: '1px solid var(--border-color)' }}>
                                    <Typography variant="caption" sx={{ color: 'var(--text-secondary)', display: 'block', mb: 1 }}>
                                        Generate an avatar face using Gemini (Imagen 3).
                                    </Typography>
                                    <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            placeholder="e.g. A futuristic cyberpunk hacker..."
                                            value={avatarPrompt}
                                            onChange={(e) => setAvatarPrompt(e.target.value)}
                                            sx={{ '& .MuiOutlinedInput-root': { color: '#fff' } }}
                                        />
                                        <Button 
                                            variant="contained" 
                                            onClick={handleGenerateAvatar}
                                            disabled={isGeneratingAvatar || !avatarPrompt.trim()}
                                            sx={{ bgcolor: 'var(--accent-gold)', color: '#000', minWidth: 100 }}
                                        >
                                            {isGeneratingAvatar ? <CircularProgress size={20} /> : 'Generate'}
                                        </Button>
                                    </Stack>
                                    
                                    {generatedAvatarUrl && (
                                        <Box sx={{ textAlign: 'center', mb: 2 }}>
                                            <img src={generatedAvatarUrl} alt="Generated Avatar" style={{ width: 100, height: 100, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--accent-gold)' }} />
                                            <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'var(--text-secondary)' }}>
                                                Upload this image to HeyGen to get a Talking Photo ID.
                                            </Typography>
                                        </Box>
                                    )}

                                    <TextField
                                        fullWidth
                                        size="small"
                                        label="HeyGen Talking Photo ID"
                                        value={talkingPhotoId}
                                        onChange={(e) => setTalkingPhotoId(e.target.value)}
                                        sx={{ '& .MuiOutlinedInput-root': { color: '#fff' } }}
                                    />
                                </Box>
                            )}

                            <FormControl fullWidth size="small">
                                <InputLabel sx={{ color: 'var(--text-secondary)' }}>Voice</InputLabel>
                                <Select
                                    value={voice}
                                    label="Voice"
                                    onChange={(e) => setVoice(e.target.value)}
                                    sx={{ bgcolor: 'var(--bg-primary)', color: '#fff' }}
                                >
                                    {VOICES.map(v => <MenuItem key={v.id} value={v.id}>{v.name}</MenuItem>)}
                                </Select>
                            </FormControl>
                            <FormControl fullWidth size="small">
                                <InputLabel sx={{ color: 'var(--text-secondary)' }}>Avatar Layout</InputLabel>
                                <Select
                                    value={layout}
                                    label="Avatar Layout"
                                    onChange={(e) => setLayout(e.target.value)}
                                    sx={{ bgcolor: 'var(--bg-primary)', color: '#fff' }}
                                >
                                    <MenuItem value="lower_third">Lower Third (Rectangle)</MenuItem>
                                    <MenuItem value="circle">Circle Overlay</MenuItem>
                                </Select>
                            </FormControl>
                        </Stack>
                    </Grid>
                </Grid>
            </Paper>

            {error && <Alert severity="error" sx={{ mb: 4 }}>{error}</Alert>}

            {/* Scene Builder */}
            {scenes.length > 0 && (
                <Box>
                    <Typography variant="h6" sx={{ color: 'var(--text-primary)', mb: 2 }}>
                        Storyboard & Production Queue
                    </Typography>
                    <Grid container spacing={2}>
                        {scenes.map((scene, idx) => (
                            <Grid item xs={12} key={scene.id}>
                                <Card sx={{ bgcolor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', position: 'relative' }}>
                                    <CardContent>
                                        <Grid container spacing={3} alignItems="center">
                                            <Grid item xs={12} md={1}>
                                                <Typography variant="h5" sx={{ color: 'var(--accent-gold)', textAlign: 'center' }}>#{idx + 1}</Typography>
                                            </Grid>
                                            <Grid item xs={12} md={5}>
                                                <TextField
                                                    fullWidth
                                                    multiline
                                                    rows={3}
                                                    label="Script Segment"
                                                    value={scene.script}
                                                    onChange={(e) => setScenes(prev => prev.map(s => s.id === scene.id ? { ...s, script: e.target.value } : s))}
                                                    sx={{ mb: 2, '& .MuiOutlinedInput-root': { bgcolor: 'var(--bg-primary)', color: '#fff' } }}
                                                />
                                                <Stack direction="row" spacing={1} alignItems="center">
                                                    <TextField
                                                        fullWidth
                                                        size="small"
                                                        label="B-Roll Query"
                                                        value={scene.background_query}
                                                        onChange={(e) => setScenes(prev => prev.map(s => s.id === scene.id ? { ...s, background_query: e.target.value } : s))}
                                                        sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'var(--bg-primary)', color: '#fff' } }}
                                                    />
                                                    <IconButton onClick={() => handleSearchPexels(scene.id, scene.background_query)} sx={{ color: 'var(--accent-gold)' }}>
                                                        <RefreshIcon />
                                                    </IconButton>
                                                </Stack>
                                            </Grid>
                                            <Grid item xs={12} md={3}>
                                                {scene.videoUrl ? (
                                                    <Box sx={{ position: 'relative', borderRadius: 1, overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                                                        <img src={scene.thumbnailUrl} alt="B-roll" style={{ width: '100%', display: 'block' }} />
                                                        <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, bgcolor: 'rgba(0,0,0,0.6)', p: 0.5 }}>
                                                            <Typography variant="caption" sx={{ color: '#fff' }}>Stock B-Roll Selected</Typography>
                                                        </Box>
                                                    </Box>
                                                ) : (
                                                    <Box sx={{ height: 100, bgcolor: 'var(--bg-primary)', borderRadius: 1, border: '1px dashed var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <Typography variant="caption" sx={{ color: 'var(--text-secondary)' }}>Searching Pexels...</Typography>
                                                    </Box>
                                                )}
                                            </Grid>
                                            <Grid item xs={12} md={3}>
                                                <Stack spacing={1}>
                                                    {scene.heygenStatus === 'idle' && (
                                                        <Button
                                                            fullWidth
                                                            variant="contained"
                                                            startIcon={<MovieIcon />}
                                                            onClick={() => handleGenerateHeyGen(scene.id)}
                                                            disabled={!scene.videoUrl}
                                                            sx={{ bgcolor: 'var(--accent-gold)', color: '#000' }}
                                                        >
                                                            Render Scene
                                                        </Button>
                                                    )}
                                                    {scene.heygenStatus === 'processing' && (
                                                        <Box sx={{ textAlign: 'center' }}>
                                                            <CircularProgress size={24} sx={{ mb: 1, color: 'var(--accent-gold)' }} />
                                                            <Typography variant="caption" sx={{ display: 'block', color: 'var(--text-secondary)' }}>HeyGen Rendering...</Typography>
                                                        </Box>
                                                    )}
                                                    {scene.heygenStatus === 'completed' && (
                                                        <Button
                                                            fullWidth
                                                            variant="outlined"
                                                            startIcon={<PlayIcon />}
                                                            onClick={() => window.open(scene.heygenVideoUrl, '_blank')}
                                                            sx={{ color: '#4CAF50', borderColor: '#4CAF50' }}
                                                        >
                                                            View Render
                                                        </Button>
                                                    )}
                                                    {scene.heygenStatus === 'error' && (
                                                        <Box>
                                                            <Typography variant="caption" color="error" sx={{ mb: 1, display: 'block' }}>{scene.error}</Typography>
                                                            <Button size="small" onClick={() => handleGenerateHeyGen(scene.id)}>Retry</Button>
                                                        </Box>
                                                    )}
                                                </Stack>
                                            </Grid>
                                        </Grid>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>

                    {/* YouTube Metadata Panel */}
                    <Paper sx={{ p: 3, mt: 4, bgcolor: 'rgba(255,0,0,0.05)', border: '1px solid rgba(255,0,0,0.2)', borderRadius: 2 }}>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                            <YouTubeIcon color="error" />
                            <Typography variant="h6" sx={{ color: '#fff' }}>YouTube Publishing Kit</Typography>
                        </Stack>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={8}>
                                <TextField fullWidth size="small" label="Generated Title" sx={{ mb: 2, '& .MuiOutlinedInput-root': { bgcolor: 'rgba(0,0,0,0.2)', color: '#fff' } }} />
                                <TextField fullWidth multiline rows={3} label="Optimized Description" sx={{ mb: 2, '& .MuiOutlinedInput-root': { bgcolor: 'rgba(0,0,0,0.2)', color: '#fff' } }} />
                                <TextField fullWidth size="small" label="SEO Tags" sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'rgba(0,0,0,0.2)', color: '#fff' } }} />
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Box sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 1, height: '100%' }}>
                                    <Typography variant="caption" sx={{ color: 'var(--text-secondary)', display: 'block', mb: 1 }}>Credits & Attribution</Typography>
                                    <Typography variant="caption" sx={{ color: 'var(--text-secondary)' }}>
                                        Videos by Pexels<br />
                                        Avatar by HeyGen<br />
                                        Script by Google Gemini
                                    </Typography>
                                </Box>
                            </Grid>
                        </Grid>
                    </Paper>
                </Box>
            )}
        </Box>
    );
};

export default VideoGeneratorView;
