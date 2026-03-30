import React, { useState, useEffect } from 'react';
import './App.css';
import ProjectDirectorView from './views/ProjectDirectorView';
import AudioProcessorView from './views/AudioProcessorView';
import SettingsView from './views/SettingsView';
import TemplateAuditorView from './views/TemplateAuditorView';
import VideoGeneratorView from './views/VideoGeneratorView';
import AnimationGeneratorView from './views/AnimationGeneratorView';
import TemplateLibraryView from './views/TemplateLibraryView';
import { Box, Typography, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider } from '@mui/material';
import {
    FolderSpecial as ProjectIcon,
    GraphicEq as AudioIcon,
    Settings as SettingsIcon,
    BugReport as AuditIcon,
    AutoFixHigh as AutoFixIcon,
    LibraryBooks as LibraryIcon,
} from '@mui/icons-material';

type Mode = 'project-director' | 'audio' | 'auditor' | 'settings' | 'video-generator' | 'animation-generator' | 'template-library';

const App: React.FC = () => {
    const [mode, setMode] = useState<Mode>(() =>
        (localStorage.getItem('directorMode') as Mode) || 'project-director'
    );

    useEffect(() => { localStorage.setItem('directorMode', mode); }, [mode]);

    const nav = [
        { id: 'project-director',    label: 'Project Director',    icon: <ProjectIcon />,   desc: 'Chapter-based Projects' },
        { id: 'video-generator',     label: 'B-Roll Avatar',       icon: <AutoFixIcon />,   desc: 'Gemini + Pexels + HeyGen' },
        { id: 'animation-generator', label: 'Animation Generator', icon: <AutoFixIcon />,   desc: 'AI Template Builder' },
        { id: 'template-library',    label: 'Template Library',    icon: <LibraryIcon />,   desc: 'View All Definitions' },
        { id: 'audio',               label: 'Audio Studio',        icon: <AudioIcon />,     desc: 'Voiceover Processor' },
        { id: 'auditor',             label: 'Template Auditor',    icon: <AuditIcon />,     desc: 'Gemini Vision QA' },
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

                <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="caption" sx={{ color: 'var(--border-color)', fontSize: '0.6rem' }}>
                        v2.4.0 • DIRECTOR STUDIO
                    </Typography>
                </Box>
            </Box>

            <Box sx={{ flexGrow: 1, overflow: 'auto', bgcolor: 'var(--bg-primary)' }}>
                {mode === 'project-director'    && <ProjectDirectorView />}
                {mode === 'video-generator'     && <VideoGeneratorView />}
                {mode === 'animation-generator' && <AnimationGeneratorView />}
                {mode === 'template-library'    && <TemplateLibraryView />}
                {mode === 'audio'               && <AudioProcessorView />}
                {mode === 'auditor'             && <TemplateAuditorView />}
                {mode === 'settings'            && <SettingsView />}
            </Box>
        </Box>
    );
};

export default App;
