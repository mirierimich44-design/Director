import React, { useState, useEffect } from 'react';
import {
    Box, Typography, TextField, Button, Card, CardContent, Select, MenuItem,
    FormControl, InputLabel, Alert, Chip, IconButton, InputAdornment
} from '@mui/material';
import {
    Save as SaveIcon,
    Visibility as ShowIcon,
    VisibilityOff as HideIcon,
    Check as CheckIcon,
    Refresh as RefreshIcon,
    Delete as DeleteIcon
} from '@mui/icons-material';

interface ModelOption {
    id: string;
    name: string;
    provider: string;
}

interface Settings {
    keys: {
        google: string;
        anthropic: string;
        stadia: string;
        heygen: string;
        pexels: string;
        googleSet: boolean;
        anthropicSet: boolean;
        stadiaSet: boolean;
        heygenSet: boolean;
        pexelsSet: boolean;
    };
    publicUrl: string;
    models: {
        language: {
            primary: string;
            fast: string;
            claude: string;
            claudeFast: string;
        };
        tts: {
            engine: 'kokoro' | 'orpheus' | 'heygen';
        };
        image: {
            primary: string;
            fallback: string;
        };
        video: {
            primary: string;
        };
    };
    providers: {
        generation: string;
        image: string;
    };
}

interface ModelOptions {
    language: ModelOption[];
    image: ModelOption[];
    video: ModelOption[];
}

const SettingsView: React.FC = () => {
    const [settings, setSettings] = useState<Settings | null>(null);
    const [modelOptions, setModelOptions] = useState<ModelOptions>({ language: [], image: [], video: [] });
    const [googleKey, setGoogleKey] = useState('');
    const [googleKey2, setGoogleKey2] = useState('');
    const [anthropicKey, setAnthropicKey] = useState('');
    const [stadiaKey, setStadiaKey] = useState('');
    const [heygenKey, setHeygenKey] = useState('');
    const [pexelsKey, setPexelsKey] = useState('');
    const [publicUrl, setPublicUrl] = useState('');
    const [showGoogleKey, setShowGoogleKey] = useState(false);
    const [showGoogleKey2, setShowGoogleKey2] = useState(false);
    const [showAnthropicKey, setShowAnthropicKey] = useState(false);
    const [showStadiaKey, setShowStadiaKey] = useState(false);
    const [showHeygenKey, setShowHeygenKey] = useState(false);
    const [showPexelsKey, setShowPexelsKey] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/settings');
            const data = await res.json();
            if (data.success) {
                setSettings(data.settings);
                setModelOptions(data.modelOptions);
                setPublicUrl(data.settings.publicUrl || '');
            }
        } catch (err: any) {
            setError('Failed to load settings');
        } finally {
            setLoading(false);
        }
    };

    const saveAll = async () => {
        if (!settings) return;
        setSaving(true);
        setSaved(false);
        setError('');

        try {
            const payload: any = {
                models: settings.models,
                providers: settings.providers,
                publicUrl: publicUrl,
            };
            // ... keys ...
            if (googleKey) payload.keys = { ...payload.keys, google: googleKey };
            if (googleKey2) payload.keys = { ...(payload.keys || {}), google2: googleKey2 };
            if (anthropicKey) payload.keys = { ...(payload.keys || {}), anthropic: anthropicKey };
            if (stadiaKey) payload.keys = { ...(payload.keys || {}), stadia: stadiaKey };
            if (heygenKey) payload.keys = { ...(payload.keys || {}), heygen: heygenKey };
            if (pexelsKey) payload.keys = { ...(payload.keys || {}), pexels: pexelsKey };

            const res = await fetch('/api/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.error);

            setSettings(data.settings);
            setGoogleKey('');
            setGoogleKey2('');
            setAnthropicKey('');
            setStadiaKey('');
            setHeygenKey('');
            setPexelsKey('');
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err: any) {
            setError(err.message || 'Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const updateModel = (path: string, value: string) => {
        if (!settings) return;
        const parts = path.split('.');
        const updated = { ...settings };
        let target: any = updated;
        for (let i = 0; i < parts.length - 1; i++) {
            target[parts[i]] = { ...target[parts[i]] };
            target = target[parts[i]];
        }
        target[parts[parts.length - 1]] = value;
        setSettings(updated);
    };

    if (loading) {
        return (
            <Box sx={{ p: 4, maxWidth: 900, mx: 'auto' }}>
                <Typography sx={{ color: 'var(--text-secondary)' }}>Loading settings...</Typography>
            </Box>
        );
    }

    if (!settings) return null;

    const sectionSx = {
        bgcolor: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        mb: 3,
    };

    const selectSx = {
        '& .MuiInputBase-root': { bgcolor: 'rgba(0,0,0,0.3)', color: 'var(--text-primary)' },
        '& .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--border-color)' },
        '& .MuiInputLabel-root': { color: 'var(--text-secondary)' },
        '& .MuiSelect-icon': { color: 'var(--text-secondary)' },
    };

    const textFieldSx = {
        '& .MuiInputBase-root': { bgcolor: 'rgba(0,0,0,0.3)', color: 'var(--text-primary)', fontFamily: 'monospace' },
        '& .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--border-color)' },
        '& .MuiInputLabel-root': { color: 'var(--text-secondary)' },
    };

    return (
        <Box sx={{ p: 4, maxWidth: 900, mx: 'auto' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="h4" sx={{ color: 'var(--accent-gold)', fontVariant: 'small-caps', letterSpacing: 3 }}>
                    Settings
                </Typography>
                <Button
                    variant="contained"
                    onClick={saveAll}
                    disabled={saving}
                    startIcon={saved ? <CheckIcon /> : saving ? <RefreshIcon sx={{ animation: 'spin 1s linear infinite' }} /> : <SaveIcon />}
                    sx={{
                        bgcolor: saved ? '#00CC00' : 'var(--accent-gold)',
                        color: '#000',
                        fontWeight: 'bold',
                        '&:hover': { bgcolor: saved ? '#00AA00' : '#b8941f' },
                    }}
                >
                    {saved ? 'SAVED' : saving ? 'SAVING...' : 'SAVE ALL'}
                </Button>
            </Box>
            <Typography variant="body2" sx={{ color: 'var(--text-secondary)', mb: 4 }}>
                Configure API keys and model selections. Changes apply system-wide immediately.
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
            {saved && <Alert severity="success" sx={{ mb: 3 }}>Settings saved and applied system-wide.</Alert>}

            {/* API Keys */}
            <Card sx={sectionSx}>
                <CardContent>
                    <Typography variant="h6" sx={{ color: 'var(--text-primary)', mb: 2, fontWeight: 'bold', letterSpacing: 1 }}>
                        API KEYS
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'var(--text-secondary)', mb: 3 }}>
                        Keys are stored locally in settings.json. They override .env values when set.
                    </Typography>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Typography variant="body2" sx={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>
                                    Google AI API Key
                                </Typography>
                                <Chip
                                    label={settings.keys.googleSet ? 'CONFIGURED' : 'NOT SET'}
                                    size="small"
                                    sx={{
                                        bgcolor: settings.keys.googleSet ? 'rgba(0,200,0,0.15)' : 'rgba(255,50,50,0.15)',
                                        color: settings.keys.googleSet ? '#00CC00' : '#FF4444',
                                        fontSize: '0.65rem',
                                    }}
                                />
                            </Box>
                            {settings.keys.google && (
                                <Typography variant="caption" sx={{ color: 'var(--text-secondary)', mb: 1, display: 'block' }}>
                                    Current: {settings.keys.google}
                                </Typography>
                            )}
                            <TextField
                                fullWidth
                                size="small"
                                type={showGoogleKey ? 'text' : 'password'}
                                value={googleKey}
                                onChange={(e) => setGoogleKey(e.target.value)}
                                placeholder="Enter new Google AI API key (AIza...)"
                                sx={textFieldSx}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton size="small" onClick={() => setShowGoogleKey(!showGoogleKey)} sx={{ color: 'var(--text-secondary)' }}>
                                                {showGoogleKey ? <HideIcon fontSize="small" /> : <ShowIcon fontSize="small" />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Box>

                        <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Typography variant="body2" sx={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>
                                    Google AI API Key (Fallback)
                                </Typography>
                                <Chip
                                    label={settings.keys.google2Set ? 'CONFIGURED' : 'NOT SET'}
                                    size="small"
                                    sx={{
                                        bgcolor: settings.keys.google2Set ? 'rgba(0,200,0,0.15)' : 'rgba(255,150,0,0.15)',
                                        color: settings.keys.google2Set ? '#00CC00' : '#FF9900',
                                        fontSize: '0.65rem',
                                    }}
                                />
                            </Box>
                            <Typography variant="caption" sx={{ color: 'var(--text-secondary)', mb: 1, display: 'block' }}>
                                Used automatically when the primary key hits quota limits (429)
                            </Typography>
                            {settings.keys.google2 && (
                                <Typography variant="caption" sx={{ color: 'var(--text-secondary)', mb: 1, display: 'block' }}>
                                    Current: {settings.keys.google2}
                                </Typography>
                            )}
                            <TextField
                                fullWidth
                                size="small"
                                type={showGoogleKey2 ? 'text' : 'password'}
                                value={googleKey2}
                                onChange={(e) => setGoogleKey2(e.target.value)}
                                placeholder="Enter fallback Google AI API key (AIza...)"
                                sx={textFieldSx}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton size="small" onClick={() => setShowGoogleKey2(!showGoogleKey2)} sx={{ color: 'var(--text-secondary)' }}>
                                                {showGoogleKey2 ? <HideIcon fontSize="small" /> : <ShowIcon fontSize="small" />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Box>

                        <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Typography variant="body2" sx={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>
                                    Anthropic API Key
                                </Typography>
                                <Chip
                                    label={settings.keys.anthropicSet ? 'CONFIGURED' : 'NOT SET'}
                                    size="small"
                                    sx={{
                                        bgcolor: settings.keys.anthropicSet ? 'rgba(0,200,0,0.15)' : 'rgba(255,50,50,0.15)',
                                        color: settings.keys.anthropicSet ? '#00CC00' : '#FF4444',
                                        fontSize: '0.65rem',
                                    }}
                                />
                            </Box>
                            {settings.keys.anthropic && (
                                <Typography variant="caption" sx={{ color: 'var(--text-secondary)', mb: 1, display: 'block' }}>
                                    Current: {settings.keys.anthropic}
                                </Typography>
                            )}
                            <TextField
                                fullWidth
                                size="small"
                                type={showAnthropicKey ? 'text' : 'password'}
                                value={anthropicKey}
                                onChange={(e) => setAnthropicKey(e.target.value)}
                                placeholder="Enter new Anthropic API key (sk-ant-...)"
                                sx={textFieldSx}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton size="small" onClick={() => setShowAnthropicKey(!showAnthropicKey)} sx={{ color: 'var(--text-secondary)' }}>
                                                {showAnthropicKey ? <HideIcon fontSize="small" /> : <ShowIcon fontSize="small" />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Box>

                        <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Typography variant="body2" sx={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>
                                    HeyGen API Key
                                </Typography>
                                <Chip
                                    label={settings.keys.heygenSet ? 'CONFIGURED' : 'NOT SET'}
                                    size="small"
                                    sx={{
                                        bgcolor: settings.keys.heygenSet ? 'rgba(0,200,0,0.15)' : 'rgba(255,50,50,0.15)',
                                        color: settings.keys.heygenSet ? '#00CC00' : '#FF4444',
                                        fontSize: '0.65rem',
                                    }}
                                />
                            </Box>
                            {settings.keys.heygen && (
                                <Typography variant="caption" sx={{ color: 'var(--text-secondary)', mb: 1, display: 'block' }}>
                                    Current: {settings.keys.heygen}
                                </Typography>
                            )}
                            <TextField
                                fullWidth
                                size="small"
                                type={showHeygenKey ? 'text' : 'password'}
                                value={heygenKey}
                                onChange={(e) => setHeygenKey(e.target.value)}
                                placeholder="Enter HeyGen API key"
                                sx={textFieldSx}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton size="small" onClick={() => setShowHeygenKey(!showHeygenKey)} sx={{ color: 'var(--text-secondary)' }}>
                                                {showHeygenKey ? <HideIcon fontSize="small" /> : <ShowIcon fontSize="small" />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Box>

                        <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Typography variant="body2" sx={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>
                                    Pexels API Key
                                </Typography>
                                <Chip
                                    label={settings.keys.pexelsSet ? 'CONFIGURED' : 'NOT SET'}
                                    size="small"
                                    sx={{
                                        bgcolor: settings.keys.pexelsSet ? 'rgba(0,200,0,0.15)' : 'rgba(255,50,50,0.15)',
                                        color: settings.keys.pexelsSet ? '#00CC00' : '#FF4444',
                                        fontSize: '0.65rem',
                                    }}
                                />
                            </Box>
                            {settings.keys.pexels && (
                                <Typography variant="caption" sx={{ color: 'var(--text-secondary)', mb: 1, display: 'block' }}>
                                    Current: {settings.keys.pexels}
                                </Typography>
                            )}
                            <TextField
                                fullWidth
                                size="small"
                                type={showPexelsKey ? 'text' : 'password'}
                                value={pexelsKey}
                                onChange={(e) => setPexelsKey(e.target.value)}
                                placeholder="Enter Pexels API key"
                                sx={textFieldSx}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton size="small" onClick={() => setShowPexelsKey(!showPexelsKey)} sx={{ color: 'var(--text-secondary)' }}>
                                                {showPexelsKey ? <HideIcon fontSize="small" /> : <ShowIcon fontSize="small" />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Box>
                    </Box>
                </CardContent>
            </Card>

            {/* Deployment */}
            <Card sx={sectionSx}>
                <CardContent>
                    <Typography variant="h6" sx={{ color: 'var(--text-primary)', mb: 2, fontWeight: 'bold', letterSpacing: 1 }}>
                        DEPLOYMENT
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'var(--text-secondary)', mb: 3 }}>
                        Set the public URL of this server so external APIs (like HeyGen) can access uploaded assets.
                    </Typography>

                    <TextField
                        fullWidth
                        size="small"
                        label="Public URL Prefix (e.g., https://my-vps-ip.com)"
                        value={publicUrl}
                        onChange={(e) => setPublicUrl(e.target.value)}
                        placeholder="https://your-public-address.com"
                        sx={textFieldSx}
                    />
                </CardContent>
            </Card>

            {/* TTS Engine */}
            <Card sx={sectionSx}>
                <CardContent>
                    <Typography variant="h6" sx={{ color: 'var(--text-primary)', mb: 2, fontWeight: 'bold', letterSpacing: 1 }}>
                        TTS ENGINE
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'var(--text-secondary)', mb: 3 }}>
                        Select the primary text-to-speech engine for video generation.
                    </Typography>

                    <FormControl fullWidth size="small" sx={selectSx}>
                        <InputLabel>Primary TTS Engine</InputLabel>
                        <Select
                            value={settings.models.tts?.engine || 'kokoro'}
                            label="Primary TTS Engine"
                            onChange={(e) => updateModel('models.tts.engine', e.target.value)}
                        >
                            <MenuItem value="kokoro">Kokoro (Fast, CPU)</MenuItem>
                            <MenuItem value="orpheus">Orpheus (Rich, slow on CPU)</MenuItem>
                            <MenuItem value="heygen">HeyGen (Premium, API)</MenuItem>
                        </Select>
                    </FormControl>
                </CardContent>
            </Card>

            {/* Stadia Maps */}
            <Card sx={sectionSx}>
                <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="h6" sx={{ color: 'var(--text-primary)', fontWeight: 'bold', letterSpacing: 1 }}>
                            MAPS — STADIA MAPS
                        </Typography>
                        <Chip
                            label={settings.keys.stadiaSet ? 'CONFIGURED' : 'NOT SET'}
                            size="small"
                            sx={{
                                bgcolor: settings.keys.stadiaSet ? 'rgba(0,200,0,0.15)' : 'rgba(255,50,50,0.15)',
                                color: settings.keys.stadiaSet ? '#00CC00' : '#FF4444',
                                fontSize: '0.65rem',
                            }}
                        />
                    </Box>
                    <Typography variant="body2" sx={{ color: 'var(--text-secondary)', mb: 2 }}>
                        Stadia Maps provides real styled map imagery for all map templates — completely free, no credit card required. Without a key, templates fall back to simplified SVG maps.
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'var(--text-secondary)', mb: 3 }}>
                        Don't have a key?{' '}
                        <a
                            href="https://client.stadiamaps.com/signup/"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: 'var(--accent-gold)', textDecoration: 'none', fontWeight: 'bold' }}
                        >
                            Sign up free at stadiamaps.com →
                        </a>
                        {' '}— 200,000 map loads/month free, no credit card needed. After signing up, create a property and copy the API key from your dashboard.
                    </Typography>

                    {settings.keys.stadia && (
                        <Typography variant="caption" sx={{ color: 'var(--text-secondary)', mb: 1, display: 'block' }}>
                            Current: {settings.keys.stadia}
                        </Typography>
                    )}
                    <TextField
                        fullWidth
                        size="small"
                        type={showStadiaKey ? 'text' : 'password'}
                        value={stadiaKey}
                        onChange={(e) => setStadiaKey(e.target.value)}
                        placeholder="Enter Stadia Maps API key"
                        sx={textFieldSx}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton size="small" onClick={() => setShowStadiaKey(!showStadiaKey)} sx={{ color: 'var(--text-secondary)' }}>
                                        {showStadiaKey ? <HideIcon fontSize="small" /> : <ShowIcon fontSize="small" />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />
                </CardContent>
            </Card>

            {/* Language Models */}
            <Card sx={sectionSx}>
                <CardContent>
                    <Typography variant="h6" sx={{ color: 'var(--text-primary)', mb: 2, fontWeight: 'bold', letterSpacing: 1 }}>
                        LANGUAGE MODELS
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'var(--text-secondary)', mb: 3 }}>
                        Select which models to use for different tasks across the system.
                    </Typography>

                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
                        <FormControl fullWidth size="small" sx={selectSx}>
                            <InputLabel>Primary Model (TSX, Scene Routing)</InputLabel>
                            <Select
                                value={settings.models.language.primary}
                                label="Primary Model (TSX, Scene Routing)"
                                onChange={(e) => updateModel('models.language.primary', e.target.value)}
                            >
                                {modelOptions.language.map((m) => (
                                    <MenuItem key={m.id} value={m.id}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            {m.name}
                                            <Chip label={m.provider} size="small"
                                                sx={{ fontSize: '0.6rem', height: 18, bgcolor: m.provider === 'google' ? 'rgba(66,133,244,0.2)' : 'rgba(204,120,50,0.2)', color: m.provider === 'google' ? '#4285F4' : '#CC7832' }}
                                            />
                                        </Box>
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl fullWidth size="small" sx={selectSx}>
                            <InputLabel>Fast Model (JSON Tasks, Extraction)</InputLabel>
                            <Select
                                value={settings.models.language.fast}
                                label="Fast Model (JSON Tasks, Extraction)"
                                onChange={(e) => updateModel('models.language.fast', e.target.value)}
                            >
                                {modelOptions.language.map((m) => (
                                    <MenuItem key={m.id} value={m.id}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            {m.name}
                                            <Chip label={m.provider} size="small"
                                                sx={{ fontSize: '0.6rem', height: 18, bgcolor: m.provider === 'google' ? 'rgba(66,133,244,0.2)' : 'rgba(204,120,50,0.2)', color: m.provider === 'google' ? '#4285F4' : '#CC7832' }}
                                            />
                                        </Box>
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl fullWidth size="small" sx={selectSx}>
                            <InputLabel>Claude Primary</InputLabel>
                            <Select
                                value={settings.models.language.claude}
                                label="Claude Primary"
                                onChange={(e) => updateModel('models.language.claude', e.target.value)}
                            >
                                {modelOptions.language.filter(m => m.provider === 'anthropic').map((m) => (
                                    <MenuItem key={m.id} value={m.id}>{m.name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl fullWidth size="small" sx={selectSx}>
                            <InputLabel>Claude Fast</InputLabel>
                            <Select
                                value={settings.models.language.claudeFast}
                                label="Claude Fast"
                                onChange={(e) => updateModel('models.language.claudeFast', e.target.value)}
                            >
                                {modelOptions.language.filter(m => m.provider === 'anthropic').map((m) => (
                                    <MenuItem key={m.id} value={m.id}>{m.name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>
                </CardContent>
            </Card>

            {/* Image Models */}
            <Card sx={sectionSx}>
                <CardContent>
                    <Typography variant="h6" sx={{ color: 'var(--text-primary)', mb: 2, fontWeight: 'bold', letterSpacing: 1 }}>
                        IMAGE MODELS
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'var(--text-secondary)', mb: 3 }}>
                        Models used for 3D render image and video generation.
                    </Typography>

                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 3 }}>
                        <FormControl fullWidth size="small" sx={selectSx}>
                            <InputLabel>Primary Image Model</InputLabel>
                            <Select
                                value={settings.models.image.primary}
                                label="Primary Image Model"
                                onChange={(e) => updateModel('models.image.primary', e.target.value)}
                            >
                                {modelOptions.image.map((m) => (
                                    <MenuItem key={m.id} value={m.id}>{m.name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl fullWidth size="small" sx={selectSx}>
                            <InputLabel>Fallback Image Model</InputLabel>
                            <Select
                                value={settings.models.image.fallback}
                                label="Fallback Image Model"
                                onChange={(e) => updateModel('models.image.fallback', e.target.value)}
                            >
                                {modelOptions.image.map((m) => (
                                    <MenuItem key={m.id} value={m.id}>{m.name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl fullWidth size="small" sx={selectSx}>
                            <InputLabel>Video Model (Veo)</InputLabel>
                            <Select
                                value={settings.models.video?.primary || 'veo-3.0-generate-preview'}
                                label="Video Model (Veo)"
                                onChange={(e) => updateModel('models.video.primary', e.target.value)}
                            >
                                {(modelOptions.video || []).map((m) => (
                                    <MenuItem key={m.id} value={m.id}>{m.name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>
                </CardContent>
            </Card>

            {/* Maintenance */}
            <Card sx={sectionSx}>
                <CardContent>
                    <Typography variant="h6" sx={{ color: '#FF4444', mb: 2, fontWeight: 'bold', letterSpacing: 1 }}>
                        MAINTENANCE
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'var(--text-secondary)', mb: 3 }}>
                        Clear temporary webpack bundles, cache, and old render files to free up VPS disk space.
                    </Typography>

                    <Button
                        variant="outlined"
                        color="error"
                        onClick={async () => {
                            if (window.confirm('Clear all temporary server files? This will free up disk space but may slow down the next few renders.')) {
                                try {
                                    const res = await fetch('/api/utils/clear-temp', { method: 'POST' });
                                    const data = await res.json();
                                    if (data.success) alert('Server cache cleared successfully.');
                                } catch (err) {
                                    alert('Failed to clear cache.');
                                }
                            }
                        }}
                        startIcon={<DeleteIcon />}
                        sx={{ borderColor: 'rgba(255,68,68,0.3)', '&:hover': { borderColor: '#FF4444', bgcolor: 'rgba(255,68,68,0.05)' } }}
                    >
                        Clear Server Cache
                    </Button>
                </CardContent>
            </Card>

            {/* Current Config Summary */}
            <Card sx={{ ...sectionSx, border: '1px solid rgba(201,169,97,0.3)' }}>
                <CardContent>
                    <Typography variant="h6" sx={{ color: 'var(--accent-gold)', mb: 2, fontWeight: 'bold', letterSpacing: 1 }}>
                        ACTIVE CONFIG
                    </Typography>
                    <Box sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                        {[
                            ['Language Primary', settings.models.language.primary],
                            ['Language Fast', settings.models.language.fast],
                            ['Claude Primary', settings.models.language.claude],
                            ['Claude Fast', settings.models.language.claudeFast],
                            ['Image Primary', settings.models.image.primary],
                            ['Image Fallback', settings.models.image.fallback],
                            ['Video (Veo)', settings.models.video?.primary || 'veo-3.0-generate-preview'],
                        ].map(([label, value]) => (
                            <Box key={label} sx={{ display: 'flex', gap: 2, mb: 0.5 }}>
                                <Typography variant="body2" sx={{ color: 'var(--accent-gold)', fontFamily: 'monospace', minWidth: 180 }}>
                                    {label}:
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'var(--text-primary)', fontFamily: 'monospace' }}>
                                    {value}
                                </Typography>
                            </Box>
                        ))}
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
};

export default SettingsView;

