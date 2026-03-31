import React, { useState } from 'react';
import { Box, Paper, TextField, Button, Typography, Container } from '@mui/material';
import { LockOutlined as LockIcon } from '@mui/icons-material';

interface LoginPageProps {
    onLogin: (password: string) => boolean;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (onLogin(password)) {
            setError(false);
        } else {
            setError(true);
        }
    };

    return (
        <Box sx={{ 
            height: '100vh', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            bgcolor: 'var(--bg-primary)',
            background: 'radial-gradient(circle at center, #1a1a1a 0%, #0a0a0a 100%)'
        }}>
            <Container maxWidth="xs">
                <Paper elevation={24} sx={{ 
                    p: 4, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center',
                    bgcolor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '16px'
                }}>
                    <Box sx={{ 
                        m: 1, 
                        bgcolor: 'var(--accent-gold)', 
                        p: 1.5, 
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <LockIcon sx={{ color: 'black' }} />
                    </Box>
                    <Typography variant="h5" sx={{ 
                        mb: 3, 
                        color: 'var(--accent-gold)', 
                        fontVariant: 'small-caps', 
                        letterSpacing: '4px',
                        fontWeight: 'bold'
                    }}>
                        ARXXIS SECURE
                    </Typography>
                    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Security Key"
                            type="password"
                            id="password"
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            error={error}
                            helperText={error ? "Incorrect Security Key" : ""}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    '& fieldset': { borderColor: 'var(--border-color)' },
                                    '&:hover fieldset': { borderColor: 'var(--accent-gold)' },
                                    '&.Mui-focused fieldset': { borderColor: 'var(--accent-gold)' },
                                },
                                '& .MuiInputLabel-root': { color: 'var(--text-secondary)' },
                                '& .MuiInputLabel-root.Mui-focused': { color: 'var(--accent-gold)' },
                                '& .MuiInputBase-input': { color: 'var(--text-primary)' }
                            }}
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ 
                                mt: 3, 
                                mb: 2, 
                                py: 1.5,
                                bgcolor: 'var(--accent-gold)',
                                color: 'black',
                                fontWeight: 'bold',
                                '&:hover': { bgcolor: '#b09456' }
                            }}
                        >
                            AUTHORIZE ACCESS
                        </Button>
                    </Box>
                </Paper>
                <Typography variant="caption" sx={{ 
                    mt: 4, 
                    display: 'block', 
                    textAlign: 'center', 
                    color: 'var(--text-secondary)',
                    letterSpacing: '1px'
                }}>
                    DIRECTOR STUDIO • SECURE GATEWAY
                </Typography>
            </Container>
        </Box>
    );
};

export default LoginPage;
