import React, { useState, useCallback, useRef } from 'react';
import {
    Box, Typography, Button, Stack, Paper,
    LinearProgress, Slider, Switch, FormControlLabel,
    Card, CardContent, IconButton, Tooltip, Chip,
    Dialog, DialogTitle, DialogContent, DialogActions,
    Alert, Divider
} from '@mui/material';
import {
    CloudUpload as UploadIcon,
    PlayArrow as PlayIcon,
    Pause as PauseIcon,
    Delete as DeleteIcon,
    Download as DownloadIcon,
    Settings as SettingsIcon,
    MergeType as MergeIcon,
    CheckCircle as SuccessIcon,
    Error as ErrorIcon,
    AudioFile as AudioIcon,
    Speed as SpeedIcon,
    GraphicEq as EqIcon,
    VolumeUp as VolumeIcon,
    Refresh as RefreshIcon
} from '@mui/icons-material';

interface ProcessedFile {
    id: string;
    filename: string;
    originalFilename?: string;
    url: string;
    outputUrl?: string;
    duration?: number;
    durationFormatted?: string;
    originalDuration?: number;
    processedDuration?: number;
    silenceRemoved?: number;
    silenceRemovedPercent?: string;
    status: 'pending' | 'processing' | 'completed' | 'error';
    error?: string;
}

interface ProcessingOptions {
    removeSilences: boolean;
    enhance: boolean;
    silenceThreshold: number;
    silenceDuration: number;
    bassBoost: number;
    trebleBoost: number;
    compression: boolean;
    normalize: boolean;
    deEss: boolean;
}

const defaultOptions: ProcessingOptions = {
    removeSilences: true,
    enhance: true,
    silenceThreshold: -40,
    silenceDuration: 0.5,
    bassBoost: 6,
    trebleBoost: 3,
    compression: true,
    normalize: true,
    deEss: true
};

const AudioProcessorView: React.FC = () => {
    const [files, setFiles] = useState<ProcessedFile[]>([]);
    const [processedFiles, setProcessedFiles] = useState<ProcessedFile[]>([]);
    const [mergedFiles, setMergedFiles] = useState<ProcessedFile[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isMerging, setIsMerging] = useState(false);
    const [processingProgress, setProcessingProgress] = useState(0);
    const [options, setOptions] = useState<ProcessingOptions>(defaultOptions);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [playingId, setPlayingId] = useState<string | null>(null);
    const [speedMultiplier, setSpeedMultiplier] = useState(1.0);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    // Fetch already processed files
    const fetchProcessedFiles = useCallback(async () => {
        try {
            const response = await fetch('/api/voiceover/processed');
            const data = await response.json();
            if (data.success) {
                setProcessedFiles(data.files.map((f: any) => ({
                    ...f,
                    status: 'completed' as const
                })));
            }
        } catch (error) {
            console.error('Error fetching processed files:', error);
        }
    }, []);

    React.useEffect(() => {
        fetchProcessedFiles();
    }, [fetchProcessedFiles]);

    // Handle file selection
    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = event.target.files;
        if (!selectedFiles) return;

        const newFiles: ProcessedFile[] = Array.from(selectedFiles).map((file, index) => ({
            id: `pending_${Date.now()}_${index}`,
            filename: file.name,
            originalFilename: file.name,
            url: URL.createObjectURL(file),
            status: 'pending' as const
        }));

        setFiles(prev => [...prev, ...newFiles]);

        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Process all pending files
    const processAllFiles = async () => {
        const pendingFiles = files.filter(f => f.status === 'pending');
        if (pendingFiles.length === 0) return;

        setIsProcessing(true);
        setProcessingProgress(0);

        for (let i = 0; i < pendingFiles.length; i++) {
            const file = pendingFiles[i];

            // Update status to processing
            setFiles(prev => prev.map(f =>
                f.id === file.id ? { ...f, status: 'processing' } : f
            ));

            try {
                // Fetch the file blob from the object URL
                const response = await fetch(file.url);
                const blob = await response.blob();

                // Create form data
                const formData = new FormData();
                formData.append('audio', blob, file.filename);
                formData.append('removeSilences', String(options.removeSilences));
                formData.append('enhance', String(options.enhance));
                formData.append('silenceThreshold', String(options.silenceThreshold));
                formData.append('silenceDuration', String(options.silenceDuration));
                formData.append('bassBoost', String(options.bassBoost));
                formData.append('trebleBoost', String(options.trebleBoost));
                formData.append('compression', String(options.compression));
                formData.append('normalize', String(options.normalize));
                formData.append('deEss', String(options.deEss));

                const result = await fetch('/api/voiceover/process', {
                    method: 'POST',
                    body: formData
                });

                const data = await result.json();

                if (data.success) {
                    // Update file with result
                    setFiles(prev => prev.map(f =>
                        f.id === file.id ? {
                            ...f,
                            status: 'completed',
                            outputUrl: data.outputUrl,
                            originalDuration: data.originalDuration,
                            processedDuration: data.processedDuration,
                            silenceRemoved: data.silenceRemoved,
                            silenceRemovedPercent: data.silenceRemovedPercent,
                            durationFormatted: formatTime(data.processedDuration)
                        } : f
                    ));

                    // Add to processed files list
                    setProcessedFiles(prev => [...prev, {
                        id: data.outputUrl,
                        filename: data.outputUrl.split('/').pop() || '',
                        originalFilename: file.originalFilename,
                        url: data.outputUrl,
                        duration: data.processedDuration,
                        durationFormatted: formatTime(data.processedDuration),
                        status: 'completed'
                    }]);
                } else {
                    setFiles(prev => prev.map(f =>
                        f.id === file.id ? { ...f, status: 'error', error: data.error } : f
                    ));
                }

            } catch (error: any) {
                setFiles(prev => prev.map(f =>
                    f.id === file.id ? { ...f, status: 'error', error: error.message } : f
                ));
            }

            setProcessingProgress(((i + 1) / pendingFiles.length) * 100);
        }

        setIsProcessing(false);
    };

    // Delete a file from the queue
    const removeFile = (id: string) => {
        setFiles(prev => prev.filter(f => f.id !== id));
    };

    // Delete a processed file
    const deleteProcessedFile = async (filename: string) => {
        try {
            await fetch(`/api/voiceover/processed/${filename}`, { method: 'DELETE' });
            setProcessedFiles(prev => prev.filter(f => f.filename !== filename));
        } catch (error) {
            console.error('Error deleting file:', error);
        }
    };

    // Play/pause audio
    const togglePlay = (url: string, id: string) => {
        if (playingId === id) {
            audioRef.current?.pause();
            setPlayingId(null);
        } else {
            if (audioRef.current) {
                audioRef.current.src = url;
                audioRef.current.play();
                setPlayingId(id);
            }
        }
    };

    // Concatenate all processed files
    const concatenateFiles = async () => {
        if (processedFiles.length < 2) return;

        setIsMerging(true);
        try {
            const response = await fetch('/api/voiceover/concatenate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    files: processedFiles.map(f => f.url),
                    speed: speedMultiplier !== 1.0 ? speedMultiplier : undefined
                })
            });

            const data = await response.json();
            if (data.success) {
                // Add concatenated file to merged files list (separate from processed)
                setMergedFiles(prev => [...prev, {
                    id: data.outputUrl,
                    filename: data.outputUrl.split('/').pop() || '',
                    originalFilename: `Merged Audio${data.speed && data.speed !== 1.0 ? ` (${data.speed}x speed)` : ''}`,
                    url: data.outputUrl,
                    duration: data.duration,
                    durationFormatted: data.durationFormatted,
                    status: 'completed'
                }]);
            }
        } catch (error) {
            console.error('Concatenation error:', error);
        } finally {
            setIsMerging(false);
        }
    };

    // Delete a merged file
    const deleteMergedFile = async (filename: string, id: string) => {
        try {
            await fetch(`/api/voiceover/processed/${filename}`, { method: 'DELETE' });
            setMergedFiles(prev => prev.filter(f => f.id !== id));
        } catch (error) {
            console.error('Error deleting merged file:', error);
        }
    };

    // Download all processed files
    const downloadAll = () => {
        window.location.href = '/api/voiceover/download-all';
    };

    // Format time helper
    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const pendingCount = files.filter(f => f.status === 'pending').length;
    const completedCount = files.filter(f => f.status === 'completed').length;

    return (
        <Box sx={{ p: 4, maxWidth: 1400, mx: 'auto' }}>
            {/* Hidden audio element */}
            <audio
                ref={audioRef}
                onEnded={() => setPlayingId(null)}
                style={{ display: 'none' }}
            />

            {/* Header */}
            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                    <Typography variant="h4" sx={{
                        color: 'var(--accent-gold)',
                        fontVariant: 'small-caps',
                        letterSpacing: '2px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2
                    }}>
                        <AudioIcon sx={{ fontSize: 32 }} />
                        Voiceover Processor
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'var(--text-secondary)', mt: 1 }}>
                        Upload voiceovers, remove silences, and enhance audio quality
                    </Typography>
                </Box>
                <Stack direction="row" spacing={2}>
                    <Tooltip title="Processing Settings">
                        <IconButton
                            onClick={() => setSettingsOpen(true)}
                            sx={{ color: 'var(--accent-gold)' }}
                        >
                            <SettingsIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Refresh processed files">
                        <IconButton
                            onClick={fetchProcessedFiles}
                            sx={{ color: 'var(--text-secondary)' }}
                        >
                            <RefreshIcon />
                        </IconButton>
                    </Tooltip>
                </Stack>
            </Box>

            {/* Upload Area */}
            <Paper sx={{
                p: 4,
                mb: 4,
                bgcolor: 'var(--bg-secondary)',
                border: '2px dashed var(--border-color)',
                borderRadius: 2,
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s',
                '&:hover': {
                    borderColor: 'var(--accent-gold)',
                    bgcolor: 'rgba(201, 169, 97, 0.05)'
                }
            }}
                onClick={() => fileInputRef.current?.click()}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".mp3,.wav,.m4a,.aac,.ogg,.flac,.webm"
                    multiple
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                />
                <UploadIcon sx={{ fontSize: 48, color: 'var(--accent-gold)', mb: 2 }} />
                <Typography variant="h6" sx={{ color: 'var(--text-primary)', mb: 1 }}>
                    Drop voiceover files here or click to upload
                </Typography>
                <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
                    Supports MP3, WAV, M4A, AAC, OGG, FLAC, WebM
                </Typography>
            </Paper>

            {/* Processing Queue */}
            {files.length > 0 && (
                <Paper sx={{ p: 3, mb: 4, bgcolor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                        <Typography variant="h6" sx={{ color: 'var(--text-primary)' }}>
                            Processing Queue ({pendingCount} pending, {completedCount} completed)
                        </Typography>
                        <Button
                            variant="contained"
                            onClick={processAllFiles}
                            disabled={isProcessing || pendingCount === 0}
                            startIcon={isProcessing ? null : <EqIcon />}
                            sx={{ bgcolor: 'var(--accent-gold)', color: '#000' }}
                        >
                            {isProcessing ? 'Processing...' : 'Process All'}
                        </Button>
                    </Stack>

                    {isProcessing && (
                        <Box sx={{ mb: 2 }}>
                            <LinearProgress
                                variant="determinate"
                                value={processingProgress}
                                sx={{
                                    height: 8,
                                    borderRadius: 4,
                                    bgcolor: 'var(--bg-primary)',
                                    '& .MuiLinearProgress-bar': { bgcolor: 'var(--accent-gold)' }
                                }}
                            />
                            <Typography variant="caption" sx={{ color: 'var(--text-secondary)', mt: 0.5 }}>
                                {Math.round(processingProgress)}% complete
                            </Typography>
                        </Box>
                    )}

                    <Stack spacing={1}>
                        {files.map(file => (
                            <Card key={file.id} sx={{
                                bgcolor: 'var(--bg-primary)',
                                border: '1px solid var(--border-color)'
                            }}>
                                <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                                    <Stack direction="row" alignItems="center" spacing={2}>
                                        {/* Status Icon */}
                                        {file.status === 'pending' && (
                                            <AudioIcon sx={{ color: 'var(--text-secondary)' }} />
                                        )}
                                        {file.status === 'processing' && (
                                            <SpeedIcon sx={{ color: 'var(--accent-gold)', animation: 'spin 1s linear infinite' }} />
                                        )}
                                        {file.status === 'completed' && (
                                            <SuccessIcon sx={{ color: '#4CAF50' }} />
                                        )}
                                        {file.status === 'error' && (
                                            <ErrorIcon sx={{ color: '#f44336' }} />
                                        )}

                                        {/* File Info */}
                                        <Box sx={{ flexGrow: 1 }}>
                                            <Typography variant="body2" sx={{ color: 'var(--text-primary)' }}>
                                                {file.originalFilename || file.filename}
                                            </Typography>
                                            {file.status === 'completed' && file.silenceRemovedPercent && (
                                                <Typography variant="caption" sx={{ color: 'var(--text-secondary)' }}>
                                                    Silence removed: {file.silenceRemovedPercent}% | Duration: {file.durationFormatted}
                                                </Typography>
                                            )}
                                            {file.status === 'error' && (
                                                <Typography variant="caption" sx={{ color: '#f44336' }}>
                                                    {file.error}
                                                </Typography>
                                            )}
                                        </Box>

                                        {/* Actions */}
                                        {file.status === 'completed' && file.outputUrl && (
                                            <IconButton
                                                size="small"
                                                onClick={() => togglePlay(file.outputUrl!, file.id)}
                                                sx={{ color: 'var(--accent-gold)' }}
                                            >
                                                {playingId === file.id ? <PauseIcon /> : <PlayIcon />}
                                            </IconButton>
                                        )}
                                        <IconButton
                                            size="small"
                                            onClick={() => removeFile(file.id)}
                                            sx={{ color: 'var(--text-secondary)' }}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </Stack>
                                </CardContent>
                            </Card>
                        ))}
                    </Stack>
                </Paper>
            )}

            {/* Processed Files */}
            {processedFiles.length > 0 && (
                <Paper sx={{ p: 3, bgcolor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                        <Typography variant="h6" sx={{ color: 'var(--text-primary)' }}>
                            Processed Files ({processedFiles.length})
                        </Typography>
                        <Stack direction="row" spacing={2}>
                            <Button
                                variant="outlined"
                                onClick={concatenateFiles}
                                disabled={processedFiles.length < 2 || isMerging}
                                startIcon={<MergeIcon />}
                                sx={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
                            >
                                {isMerging ? 'Merging...' : 'Merge All'}
                            </Button>
                            <Button
                                variant="contained"
                                onClick={downloadAll}
                                startIcon={<DownloadIcon />}
                                sx={{ bgcolor: 'var(--accent-blue)', color: '#fff' }}
                            >
                                Download All
                            </Button>
                        </Stack>
                    </Stack>

                    {/* Speed Control */}
                    <Box sx={{
                        mt: 2, mb: 2, p: 2,
                        bgcolor: 'var(--bg-primary)',
                        borderRadius: 1,
                        border: '1px solid var(--border-color)'
                    }}>
                        <Stack direction="row" alignItems="center" spacing={2}>
                            <SpeedIcon sx={{ color: 'var(--accent-gold)', fontSize: 20 }} />
                            <Typography variant="body2" sx={{ color: 'var(--text-secondary)', minWidth: 120 }}>
                                Voiceover Speed:
                            </Typography>
                            <Slider
                                value={speedMultiplier}
                                onChange={(_, v) => setSpeedMultiplier(v as number)}
                                min={1.0}
                                max={2.0}
                                step={0.1}
                                marks={[
                                    { value: 1.0, label: '1.0x' },
                                    { value: 1.5, label: '1.5x' },
                                    { value: 2.0, label: '2.0x' }
                                ]}
                                valueLabelDisplay="auto"
                                valueLabelFormat={(v) => `${v}x`}
                                sx={{
                                    color: 'var(--accent-gold)',
                                    flexGrow: 1,
                                    '& .MuiSlider-markLabel': { color: 'var(--text-secondary)', fontSize: 11 },
                                    '& .MuiSlider-valueLabel': { bgcolor: 'var(--accent-gold)', color: '#000' }
                                }}
                            />
                            <Chip
                                size="small"
                                label={speedMultiplier === 1.0 ? 'Normal' : `${Math.round((speedMultiplier - 1) * 100)}% faster`}
                                sx={{
                                    bgcolor: speedMultiplier === 1.0 ? 'var(--bg-secondary)' : 'rgba(201, 169, 97, 0.15)',
                                    color: speedMultiplier === 1.0 ? 'var(--text-secondary)' : 'var(--accent-gold)',
                                    fontWeight: 'bold',
                                    minWidth: 100
                                }}
                            />
                        </Stack>
                        {speedMultiplier !== 1.0 && (
                            <Typography variant="caption" sx={{ color: 'var(--text-secondary)', mt: 1, display: 'block' }}>
                                Speed will be applied when merging. No pitch distortion.
                            </Typography>
                        )}
                    </Box>

                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 2 }}>
                        {processedFiles.map(file => (
                            <Box key={file.id}>
                                <Card sx={{
                                    bgcolor: 'var(--bg-primary)',
                                    border: '1px solid var(--border-color)',
                                    transition: 'all 0.2s',
                                    '&:hover': { borderColor: 'var(--accent-gold)' }
                                }}>
                                    <CardContent>
                                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                                            <AudioIcon sx={{ color: 'var(--accent-gold)' }} />
                                            <Typography variant="body2" sx={{
                                                color: 'var(--text-primary)',
                                                fontWeight: 'bold',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                                flexGrow: 1
                                            }}>
                                                {file.originalFilename || file.filename}
                                            </Typography>
                                        </Stack>

                                        <Chip
                                            size="small"
                                            label={file.durationFormatted || '0:00'}
                                            sx={{
                                                bgcolor: 'var(--bg-secondary)',
                                                color: 'var(--text-secondary)',
                                                mb: 2
                                            }}
                                        />

                                        <Stack direction="row" spacing={1}>
                                            <IconButton
                                                size="small"
                                                onClick={() => togglePlay(file.url, file.id)}
                                                sx={{
                                                    bgcolor: playingId === file.id ? 'var(--accent-gold)' : 'var(--bg-secondary)',
                                                    color: playingId === file.id ? '#000' : 'var(--text-primary)',
                                                    '&:hover': { bgcolor: 'var(--accent-gold)', color: '#000' }
                                                }}
                                            >
                                                {playingId === file.id ? <PauseIcon /> : <PlayIcon />}
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                component="a"
                                                href={file.url}
                                                download
                                                sx={{ bgcolor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                                            >
                                                <DownloadIcon />
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                onClick={() => deleteProcessedFile(file.filename)}
                                                sx={{ bgcolor: 'var(--bg-secondary)', color: '#f44336' }}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </Stack>
                                    </CardContent>
                                </Card>
                            </Box>
                        ))}
                    </Box>
                </Paper>
            )}

            {/* Merged Audios Section */}
            {mergedFiles.length > 0 && (
                <Paper sx={{ p: 3, mt: 4, bgcolor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                        <Typography variant="h6" sx={{ color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 1 }}>
                            <MergeIcon sx={{ color: 'var(--accent-gold)' }} />
                            Merged Audios ({mergedFiles.length})
                        </Typography>
                    </Stack>

                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 2 }}>
                        {mergedFiles.map(file => (
                            <Box key={file.id}>
                                <Card sx={{
                                    bgcolor: 'var(--bg-primary)',
                                    border: '1px solid var(--border-color)',
                                    transition: 'all 0.2s',
                                    '&:hover': { borderColor: 'var(--accent-gold)' }
                                }}>
                                    <CardContent>
                                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                                            <MergeIcon sx={{ color: 'var(--accent-gold)' }} />
                                            <Typography variant="body2" sx={{
                                                color: 'var(--text-primary)',
                                                fontWeight: 'bold',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                                flexGrow: 1
                                            }}>
                                                {file.originalFilename || file.filename}
                                            </Typography>
                                        </Stack>

                                        <Chip
                                            size="small"
                                            label={file.durationFormatted || '0:00'}
                                            sx={{
                                                bgcolor: 'var(--bg-secondary)',
                                                color: 'var(--text-secondary)',
                                                mb: 2
                                            }}
                                        />

                                        <Stack direction="row" spacing={1}>
                                            <IconButton
                                                size="small"
                                                onClick={() => togglePlay(file.url, file.id)}
                                                sx={{
                                                    bgcolor: playingId === file.id ? 'var(--accent-gold)' : 'var(--bg-secondary)',
                                                    color: playingId === file.id ? '#000' : 'var(--text-primary)',
                                                    '&:hover': { bgcolor: 'var(--accent-gold)', color: '#000' }
                                                }}
                                            >
                                                {playingId === file.id ? <PauseIcon /> : <PlayIcon />}
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                component="a"
                                                href={file.url}
                                                download
                                                sx={{ bgcolor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                                            >
                                                <DownloadIcon />
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                onClick={() => deleteMergedFile(file.filename, file.id)}
                                                sx={{ bgcolor: 'var(--bg-secondary)', color: '#f44336' }}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </Stack>
                                    </CardContent>
                                </Card>
                            </Box>
                        ))}
                    </Box>
                </Paper>
            )}

            {/* Empty State */}
            {files.length === 0 && processedFiles.length === 0 && mergedFiles.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                    <VolumeIcon sx={{ fontSize: 64, color: 'var(--border-color)', mb: 2 }} />
                    <Typography variant="h6" sx={{ color: 'var(--text-secondary)', mb: 1 }}>
                        No voiceovers yet
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
                        Upload audio files to remove silences and enhance quality
                    </Typography>
                </Box>
            )}

            {/* Settings Dialog */}
            <Dialog
                open={settingsOpen}
                onClose={() => setSettingsOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle sx={{ bgcolor: 'var(--bg-secondary)', color: 'var(--accent-gold)' }}>
                    Processing Settings
                </DialogTitle>
                <DialogContent sx={{ bgcolor: 'var(--bg-primary)', pt: 3 }}>
                    <Stack spacing={3}>
                        {/* Silence Removal */}
                        <Box>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={options.removeSilences}
                                        onChange={(e) => setOptions({ ...options, removeSilences: e.target.checked })}
                                        sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: 'var(--accent-gold)' } }}
                                    />
                                }
                                label={<Typography sx={{ color: 'var(--text-primary)' }}>Remove Silences</Typography>}
                            />
                            {options.removeSilences && (
                                <Box sx={{ pl: 4, mt: 2 }}>
                                    <Typography variant="body2" sx={{ color: 'var(--text-secondary)', mb: 1 }}>
                                        Silence Threshold: {options.silenceThreshold} dB
                                    </Typography>
                                    <Slider
                                        value={options.silenceThreshold}
                                        onChange={(_, v) => setOptions({ ...options, silenceThreshold: v as number })}
                                        min={-60}
                                        max={-20}
                                        sx={{ color: 'var(--accent-gold)' }}
                                    />
                                    <Typography variant="body2" sx={{ color: 'var(--text-secondary)', mb: 1, mt: 2 }}>
                                        Min Silence Duration: {options.silenceDuration}s
                                    </Typography>
                                    <Slider
                                        value={options.silenceDuration}
                                        onChange={(_, v) => setOptions({ ...options, silenceDuration: v as number })}
                                        min={0.1}
                                        max={2}
                                        step={0.1}
                                        sx={{ color: 'var(--accent-gold)' }}
                                    />
                                </Box>
                            )}
                        </Box>

                        <Divider sx={{ borderColor: 'var(--border-color)' }} />

                        {/* Audio Enhancement */}
                        <Box>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={options.enhance}
                                        onChange={(e) => setOptions({ ...options, enhance: e.target.checked })}
                                        sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: 'var(--accent-gold)' } }}
                                    />
                                }
                                label={<Typography sx={{ color: 'var(--text-primary)' }}>Enhance Audio</Typography>}
                            />
                            {options.enhance && (
                                <Box sx={{ pl: 4, mt: 2 }}>
                                    <Typography variant="body2" sx={{ color: 'var(--text-secondary)', mb: 1 }}>
                                        Bass Boost: +{options.bassBoost} dB
                                    </Typography>
                                    <Slider
                                        value={options.bassBoost}
                                        onChange={(_, v) => setOptions({ ...options, bassBoost: v as number })}
                                        min={0}
                                        max={12}
                                        sx={{ color: 'var(--accent-gold)' }}
                                    />

                                    <Typography variant="body2" sx={{ color: 'var(--text-secondary)', mb: 1, mt: 2 }}>
                                        Treble Boost: +{options.trebleBoost} dB
                                    </Typography>
                                    <Slider
                                        value={options.trebleBoost}
                                        onChange={(_, v) => setOptions({ ...options, trebleBoost: v as number })}
                                        min={0}
                                        max={8}
                                        sx={{ color: 'var(--accent-gold)' }}
                                    />

                                    <Stack spacing={1} sx={{ mt: 2 }}>
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={options.compression}
                                                    onChange={(e) => setOptions({ ...options, compression: e.target.checked })}
                                                    size="small"
                                                    sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: 'var(--accent-gold)' } }}
                                                />
                                            }
                                            label={<Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>Compression</Typography>}
                                        />
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={options.normalize}
                                                    onChange={(e) => setOptions({ ...options, normalize: e.target.checked })}
                                                    size="small"
                                                    sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: 'var(--accent-gold)' } }}
                                                />
                                            }
                                            label={<Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>Normalize Loudness</Typography>}
                                        />
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={options.deEss}
                                                    onChange={(e) => setOptions({ ...options, deEss: e.target.checked })}
                                                    size="small"
                                                    sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: 'var(--accent-gold)' } }}
                                                />
                                            }
                                            label={<Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>De-Esser (reduce sibilance)</Typography>}
                                        />
                                    </Stack>
                                </Box>
                            )}
                        </Box>

                        <Alert severity="info" sx={{ bgcolor: 'var(--bg-secondary)' }}>
                            FFmpeg must be installed on the server for audio processing to work.
                        </Alert>
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ bgcolor: 'var(--bg-secondary)', p: 2 }}>
                    <Button onClick={() => setOptions(defaultOptions)} sx={{ color: 'var(--text-secondary)' }}>
                        Reset to Defaults
                    </Button>
                    <Button
                        variant="contained"
                        onClick={() => setSettingsOpen(false)}
                        sx={{ bgcolor: 'var(--accent-gold)', color: '#000' }}
                    >
                        Done
                    </Button>
                </DialogActions>
            </Dialog>

            {/* CSS for spin animation */}
            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </Box>
    );
};

export default AudioProcessorView;
