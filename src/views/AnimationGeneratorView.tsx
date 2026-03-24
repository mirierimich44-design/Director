import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Tabs, Tab, Grid, Card, CardContent, CardActions,
    Button, Chip, TextField, CircularProgress, Alert, Snackbar,
    CardMedia, Divider, Stack, Tooltip, IconButton,
} from '@mui/material';
import {
    BarChart as BarChartIcon,
    AutoStories as StoryIcon,
    TextFields as TextIcon,
    Dashboard as LayoutIcon,
    Security as SecurityIcon,
    TrendingUp as FinanceIcon,
    AutoFixHigh as GenerateIcon,
    CheckCircle as DoneIcon,
    ContentCopy as CopyIcon,
    OpenInNew as OpenIcon,
    BrokenImage as ImageIcon,
} from '@mui/icons-material';

// ── Types ─────────────────────────────────────────────────────────────────────
interface AnimationType {
    id: string;
    name: string;
    desc: string;
    suggestedName: string;
    tags: string[];
    categoryId: string;
    categoryLabel: string;
}

interface CategoryDef {
    label: string;
    icon: string;
    types: AnimationType[];
}

interface Catalog {
    [catId: string]: CategoryDef;
}

interface GeneratedResult {
    template: string;
    name: string;
    description: string;
    category: string;
    fields: Record<string, string>;
    screenshotUrl: string | null;
}

// ── Category icon map ─────────────────────────────────────────────────────────
const CATEGORY_ICONS: Record<string, React.ReactElement> = {
    'data-charts':   <BarChartIcon />,
    'storytelling':  <StoryIcon />,
    'text-reveal':   <TextIcon />,
    'layout':        <LayoutIcon />,
    'security':      <SecurityIcon />,
    'finance':       <FinanceIcon />,
};

const CATEGORY_COLORS: Record<string, string> = {
    'data-charts':   '#4fc3f7',
    'storytelling':  '#ce93d8',
    'text-reveal':   '#80cbc4',
    'layout':        '#ffcc80',
    'security':      '#ef9a9a',
    'finance':       '#a5d6a7',
};

// ── Type Card ─────────────────────────────────────────────────────────────────
interface TypeCardProps {
    type: AnimationType;
    catColor: string;
    onGenerate: (type: AnimationType, customDesc: string) => void;
    generating: boolean;
    generated: GeneratedResult | null;
}

const TypeCard: React.FC<TypeCardProps> = ({ type, catColor, onGenerate, generating, generated }) => {
    const [custom, setCustom] = useState('');
    const [imgFailed, setImgFailed] = useState(false);

    const isDone = generated !== null;

    return (
        <Card sx={{
            bgcolor: 'var(--bg-secondary)',
            border: `1px solid ${isDone ? catColor + '66' : 'var(--border-color)'}`,
            borderLeft: `3px solid ${catColor}`,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            transition: 'border-color 0.2s',
        }}>
            {/* Preview image */}
            {isDone && generated.screenshotUrl && !imgFailed ? (
                <CardMedia
                    component="img"
                    image={generated.screenshotUrl}
                    alt={type.name}
                    onError={() => setImgFailed(true)}
                    sx={{ height: 160, objectFit: 'contain', bgcolor: '#0a0a0a' }}
                />
            ) : isDone ? (
                <Box sx={{ height: 160, bgcolor: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ImageIcon sx={{ color: '#333', fontSize: 36 }} />
                </Box>
            ) : null}

            <CardContent sx={{ flexGrow: 1, p: 1.5, '&:last-child': { pb: 1 } }}>
                <Stack direction="row" alignItems="flex-start" justifyContent="space-between" mb={0.5}>
                    <Typography sx={{ fontSize: '0.78rem', fontWeight: 'bold', color: 'var(--text-primary)', lineHeight: 1.3, flex: 1, pr: 1 }}>
                        {type.name}
                    </Typography>
                    {isDone && <DoneIcon sx={{ fontSize: 16, color: catColor, flexShrink: 0 }} />}
                </Stack>

                <Typography sx={{ fontSize: '0.66rem', color: 'var(--text-secondary)', lineHeight: 1.4, mb: 1 }}>
                    {type.desc}
                </Typography>

                <Stack direction="row" flexWrap="wrap" gap={0.4} mb={1}>
                    {type.tags.map(tag => (
                        <Chip key={tag} label={tag} size="small" sx={{
                            height: 16, fontSize: '0.56rem', bgcolor: catColor + '18',
                            color: catColor, border: `1px solid ${catColor}33`,
                            '& .MuiChip-label': { px: 0.7 },
                        }} />
                    ))}
                </Stack>

                {isDone && (
                    <Box sx={{ bgcolor: '#0a0a0a', borderRadius: 1, p: 0.8, mb: 1 }}>
                        <Typography sx={{ fontSize: '0.62rem', color: '#666', mb: 0.3 }}>GENERATED</Typography>
                        <Typography sx={{ fontSize: '0.65rem', color: catColor, fontFamily: 'monospace' }}>
                            {generated.template}
                        </Typography>
                        {Object.keys(generated.fields).length > 0 && (
                            <Typography sx={{ fontSize: '0.6rem', color: 'var(--text-secondary)', mt: 0.5 }}>
                                {Object.keys(generated.fields).length} fields: {Object.keys(generated.fields).slice(0, 4).join(', ')}{Object.keys(generated.fields).length > 4 ? '…' : ''}
                            </Typography>
                        )}
                    </Box>
                )}

                <TextField
                    size="small"
                    placeholder="Optional: add specific requirements…"
                    value={custom}
                    onChange={e => setCustom(e.target.value)}
                    fullWidth
                    multiline
                    rows={2}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            fontSize: '0.65rem',
                            bgcolor: '#0a0a0a',
                            '& fieldset': { borderColor: 'var(--border-color)' },
                            '&:hover fieldset': { borderColor: catColor + '66' },
                            '&.Mui-focused fieldset': { borderColor: catColor },
                        },
                        '& .MuiInputBase-input': { color: 'var(--text-primary)' },
                        '& .MuiInputBase-input::placeholder': { color: '#555', fontSize: '0.65rem' },
                    }}
                />
            </CardContent>

            <CardActions sx={{ p: 1.5, pt: 0 }}>
                <Button
                    fullWidth
                    size="small"
                    variant={isDone ? 'outlined' : 'contained'}
                    disabled={generating}
                    onClick={() => onGenerate(type, custom)}
                    startIcon={generating ? <CircularProgress size={12} sx={{ color: 'inherit' }} /> : <GenerateIcon sx={{ fontSize: '14px !important' }} />}
                    sx={{
                        fontSize: '0.7rem',
                        fontWeight: 'bold',
                        letterSpacing: '1px',
                        bgcolor: isDone ? 'transparent' : catColor,
                        color: isDone ? catColor : '#000',
                        borderColor: catColor,
                        '&:hover': { bgcolor: catColor + (isDone ? '22' : 'dd'), borderColor: catColor },
                        '&.Mui-disabled': { bgcolor: '#222', color: '#444' },
                    }}
                >
                    {generating ? 'GENERATING…' : isDone ? 'REGENERATE' : 'GENERATE'}
                </Button>
            </CardActions>
        </Card>
    );
};

// ── Main View ─────────────────────────────────────────────────────────────────
const AnimationGeneratorView: React.FC = () => {
    const [catalog, setCatalog] = useState<Catalog | null>(null);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState(0);
    const [generating, setGenerating] = useState<string | null>(null); // typeId being generated
    const [results, setResults] = useState<Record<string, GeneratedResult>>({});
    const [snack, setSnack] = useState<{ msg: string; severity: 'success' | 'error' } | null>(null);
    const [globalCustom, setGlobalCustom] = useState('');

    useEffect(() => {
        fetch('/api/animation-generator/types')
            .then(r => r.json())
            .then(d => {
                if (d.success) setCatalog(d.catalog);
                else setLoadError(d.error || 'Failed to load catalog');
            })
            .catch(e => setLoadError(e.message));
    }, []);

    const handleGenerate = async (type: AnimationType, customDesc: string) => {
        setGenerating(type.id);
        try {
            const body: Record<string, string> = { typeId: type.id };
            const combined = [customDesc, globalCustom].filter(Boolean).join('\n');
            if (combined) body.customDescription = combined;

            const res = await fetch('/api/animation-generator/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.error || 'Generation failed');

            setResults(prev => ({ ...prev, [type.id]: data }));
            setSnack({ msg: `✓ ${data.template} generated`, severity: 'success' });
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err);
            setSnack({ msg: `✗ ${msg}`, severity: 'error' });
        } finally {
            setGenerating(null);
        }
    };

    const catIds = catalog ? Object.keys(catalog) : [];
    const activeCatId = catalog ? catIds[activeTab] : null;
    const activeCat = activeCatId && catalog ? catalog[activeCatId] : null;
    const catColor = activeCatId ? (CATEGORY_COLORS[activeCatId] || '#c9a961') : '#c9a961';

    const totalGenerated = Object.keys(results).length;

    return (
        <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Header */}
            <Box sx={{ px: 4, pt: 4, pb: 2, borderBottom: '1px solid var(--border-color)', flexShrink: 0 }}>
                <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
                    <Box>
                        <Typography variant="h5" sx={{
                            color: 'var(--accent-gold)', fontVariant: 'small-caps',
                            letterSpacing: '4px', fontWeight: 'bold', fontSize: '1.1rem',
                        }}>
                            Animation Generator
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'var(--text-secondary)', letterSpacing: '1px' }}>
                            AI-powered Remotion template generation • {totalGenerated} generated this session
                        </Typography>
                    </Box>

                    <Box sx={{ maxWidth: 360 }}>
                        <TextField
                            size="small"
                            placeholder="Global style notes applied to all generations…"
                            value={globalCustom}
                            onChange={e => setGlobalCustom(e.target.value)}
                            fullWidth
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    fontSize: '0.7rem', bgcolor: 'var(--bg-secondary)',
                                    '& fieldset': { borderColor: 'var(--border-color)' },
                                    '&.Mui-focused fieldset': { borderColor: 'var(--accent-gold)' },
                                },
                                '& .MuiInputBase-input': { color: 'var(--text-primary)' },
                                '& .MuiInputBase-input::placeholder': { color: '#555' },
                            }}
                        />
                        <Typography sx={{ fontSize: '0.6rem', color: '#555', mt: 0.3 }}>
                            e.g. "dark red and white color scheme" or "use grid lines"
                        </Typography>
                    </Box>
                </Stack>
            </Box>

            {loadError && (
                <Alert severity="error" sx={{ m: 2 }}>{loadError}</Alert>
            )}

            {!catalog && !loadError && (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexGrow: 1 }}>
                    <CircularProgress sx={{ color: 'var(--accent-gold)' }} />
                </Box>
            )}

            {catalog && (
                <>
                    {/* Category tabs */}
                    <Box sx={{ borderBottom: '1px solid var(--border-color)', flexShrink: 0, bgcolor: 'var(--bg-secondary)' }}>
                        <Tabs
                            value={activeTab}
                            onChange={(_, v) => setActiveTab(v)}
                            variant="scrollable"
                            scrollButtons="auto"
                            sx={{
                                '& .MuiTab-root': {
                                    fontSize: '0.7rem', fontWeight: 'bold', letterSpacing: '1px',
                                    color: 'var(--text-secondary)', minWidth: 140,
                                    textTransform: 'uppercase',
                                },
                                '& .Mui-selected': { color: catColor + ' !important' },
                                '& .MuiTabs-indicator': { backgroundColor: catColor },
                            }}
                        >
                            {catIds.map((catId, i) => {
                                const cat = catalog[catId];
                                const catGenCount = cat.types.filter(t => results[t.id]).length;
                                return (
                                    <Tab
                                        key={catId}
                                        icon={CATEGORY_ICONS[catId] || <BarChartIcon />}
                                        iconPosition="start"
                                        label={
                                            <Stack direction="row" alignItems="center" gap={0.7}>
                                                {cat.label}
                                                <Chip label={cat.types.length} size="small" sx={{
                                                    height: 16, fontSize: '0.55rem',
                                                    bgcolor: catGenCount > 0 ? CATEGORY_COLORS[catId] + '33' : '#333',
                                                    color: catGenCount > 0 ? CATEGORY_COLORS[catId] : '#666',
                                                    '& .MuiChip-label': { px: 0.6 },
                                                }} />
                                            </Stack>
                                        }
                                    />
                                );
                            })}
                        </Tabs>
                    </Box>

                    {/* Category header */}
                    {activeCat && activeCatId && (
                        <Box sx={{ px: 4, py: 1.5, bgcolor: catColor + '0a', borderBottom: '1px solid var(--border-color)', flexShrink: 0 }}>
                            <Stack direction="row" alignItems="center" gap={2}>
                                <Box sx={{ color: catColor }}>
                                    {CATEGORY_ICONS[activeCatId] || <BarChartIcon />}
                                </Box>
                                <Box>
                                    <Typography sx={{ fontSize: '0.85rem', fontWeight: 'bold', color: catColor, letterSpacing: '2px', textTransform: 'uppercase' }}>
                                        {activeCat.label}
                                    </Typography>
                                    <Typography sx={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>
                                        {activeCat.types.length} animation types •{' '}
                                        {activeCat.types.filter(t => results[t.id]).length} generated
                                    </Typography>
                                </Box>
                            </Stack>
                        </Box>
                    )}

                    {/* Type grid */}
                    <Box sx={{ flexGrow: 1, overflow: 'auto', p: 3 }}>
                        {activeCat && (
                            <Grid container spacing={2}>
                                {activeCat.types.map(type => (
                                    <Grid item xs={12} sm={6} md={4} lg={3} key={type.id}>
                                        <TypeCard
                                            type={{ ...type, categoryId: activeCatId!, categoryLabel: activeCat.label }}
                                            catColor={CATEGORY_COLORS[activeCatId!] || '#c9a961'}
                                            onGenerate={handleGenerate}
                                            generating={generating === type.id}
                                            generated={results[type.id] || null}
                                        />
                                    </Grid>
                                ))}
                            </Grid>
                        )}
                    </Box>
                </>
            )}

            {/* Snackbar */}
            <Snackbar
                open={snack !== null}
                autoHideDuration={4000}
                onClose={() => setSnack(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                {snack ? (
                    <Alert severity={snack.severity} onClose={() => setSnack(null)} sx={{ fontSize: '0.75rem' }}>
                        {snack.msg}
                    </Alert>
                ) : <div />}
            </Snackbar>
        </Box>
    );
};

export default AnimationGeneratorView;
