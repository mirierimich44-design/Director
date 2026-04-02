import React, { useState, useEffect, Suspense, lazy } from 'react';
import './App.css';
import LoginPage from './components/LoginPage';
import { Box, Typography, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider, Button, CircularProgress } from '@mui/material';
import {
    FolderSpecial as ProjectIcon,
    GraphicEq as AudioIcon,
    Settings as SettingsIcon,
    AutoFixHigh as AutoFixIcon,
    ExitToApp as LogoutIcon,
    Movie as MovieIcon,
} from '@mui/icons-material';

// Lazy load views for better initial speed
const ProjectDirectorView = lazy(() => import('./views/ProjectDirectorView'));
const AudioProcessorView = lazy(() => import('./views/AudioProcessorView'));
const SettingsView = lazy(() => import('./views/SettingsView'));
const VideoGeneratorView = lazy(() => import('./views/VideoGeneratorView'));
const SceneStudioView = lazy(() => import('./views/SceneStudioView'));

const ViewFallback = () => (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <CircularProgress sx={{ color: 'var(--accent-gold)' }} />
    </Box>
);

type Mode = 'project-director' | 'audio' | 'settings' | 'video-generator' | 'scene-studio';

const App: React.FC = () => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => 
        localStorage.getItem('isAuthorized') === 'true'
    );
    const [mode, setMode] = useState<Mode>(() =>
        (localStorage.getItem('directorMode') as Mode) || 'project-director'
    );

    useEffect(() => { localStorage.setItem('directorMode', mode); }, [mode]);

    const handleLogin = (password: string) => {
        // Since there is no database, you can set your password here.
        // Or better yet, use a value from your .env file via import.meta.env
        const SECURE_KEY = 'admin'; // You can change this to any password you want
        
        if (password === SECURE_KEY) {
            setIsAuthenticated(true);
            localStorage.setItem('isAuthorized', 'true');
            return true;
        }
        return false;
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        localStorage.removeItem('isAuthorized');
    };

    if (!isAuthenticated) {
        return <LoginPage onLogin={handleLogin} />;
    }

    const nav = [
        { id: 'project-director',    label: 'Project Director',    icon: <ProjectIcon />,   desc: 'Chapter-based Projects' },
        { id: 'video-generator',     label: 'B-Roll Avatar',       icon: <AutoFixIcon />,   desc: 'Gemini + Pexels + HeyGen' },
        { id: 'scene-studio',        label: 'Scene Studio',        icon: <MovieIcon />,     desc: 'Custom Standalone Scenes' },
        { id: 'audio',               label: 'Audio Studio',        icon: <AudioIcon />,     desc: 'Voiceover Processor' },
        { id: 'settings',            label: 'LLM Settings',        icon: <SettingsIcon />,  desc: 'API Keys & Models' },
    ];

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
            <Box sx={{ width: 260, borderRight: '1px solid var(--border-color)', bgcolor: 'var(--bg-secondary)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
                <Box sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="h5" sx={{ color: 'var(--accent-gold)', fontVariant: 'small-caps', letterSpacing: '4px', fontWeight: 'bold' }}>
                        ARXXIS
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'var(--text-secondary)', letterSpacing: '2px', display: 'block' }}>
                        Director Studio
                    </Typography>
                </Box>

                <Divider sx={{ borderColor: 'var(--border-color)', mb: 2 }} />

                <List sx={{ px: 2, flexGrow: 1 }}>
                    {nav.map(item => (
                        <ListItem key={item.id} disablePadding sx={{ mb: 1 }}>
                            <ListItemButton
                                selected={mode === item.id}
                                onClick={() => setMode(item.id as Mode)}
                                sx={{
                                    borderRadius: '8px',
                                    '&.Mui-selected': { bgcolor: 'rgba(201,169,97,0.12)', color: 'var(--accent-gold)', '& .MuiListItemIcon-root': { color: 'var(--accent-gold)' } },
                                    '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' },
                                }}
                            >
                                <ListItemIcon sx={{ color: 'var(--text-secondary)', minWidth: 40 }}>{item.icon}</ListItemIcon>
                                <ListItemText
                                    primary={item.label.toUpperCase()}
                                    secondary={item.desc}
                                    primaryTypographyProps={{ sx: { fontSize: '0.82rem', fontWeight: 'bold', letterSpacing: '1px' } }}
                                    secondaryTypographyProps={{ sx: { fontSize: '0.68rem', color: 'var(--text-secondary)' } }}
                                />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>

                <Box sx={{ p: 2 }}>
                    <Button
                        fullWidth
                        onClick={handleLogout}
                        startIcon={<LogoutIcon />}
                        sx={{
                            color: 'var(--text-secondary)',
                            justifyContent: 'flex-start',
                            px: 2,
                            py: 1,
                            borderRadius: '8px',
                            '&:hover': { bgcolor: 'rgba(255,59,48,0.1)', color: '#ff3b30' },
                            textTransform: 'none',
                            fontSize: '0.8rem',
                            letterSpacing: '1px'
                        }}
                    >
                        SIGN OUT
                    </Button>
                </Box>

                <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="caption" sx={{ color: 'var(--border-color)', fontSize: '0.6rem' }}>
                        v2.4.0 • DIRECTOR STUDIO
                    </Typography>
                </Box>
            </Box>

            <Box sx={{ flexGrow: 1, overflow: 'auto', bgcolor: 'var(--bg-primary)' }}>
                <Suspense fallback={<ViewFallback />}>
                    {mode === 'project-director'    && <ProjectDirectorView />}
                    {mode === 'video-generator'     && <VideoGeneratorView />}
                    {mode === 'scene-studio'        && <SceneStudioView />}
                    {mode === 'audio'               && <AudioProcessorView />}
                    {mode === 'settings'            && <SettingsView />}
                </Suspense>
            </Box>
        </Box>
    );
};

export default App;
