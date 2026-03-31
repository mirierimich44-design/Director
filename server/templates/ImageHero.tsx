import React, { useMemo } from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, staticFile, Easing } from 'remotion';

export const AnimationComponent: React.FC = () => {
    const frame = useCurrentFrame();
    const { width, height, durationInFrames } = useVideoConfig();

    // Content Placeholders
    const imageUrl = 'IMAGE_URL';
    const motionType = 'MOTION_TYPE'; // e.g., "zoom-in", "pan-left", "dolly-forward"

    // Resolve URL for Remotion
    const resolvedImageUrl = imageUrl.startsWith('http') ? imageUrl : staticFile(imageUrl);

    // ── Motion Logic ────────────────────────────────────────────────────────
    // Parse motionType to determine transform
    const transform = useMemo(() => {
        const m = motionType.toLowerCase();
        
        // Zoom In (Dolly Forward)
        if (m.includes('zoom-in') || m.includes('dolly-forward') || m.includes('forward')) {
            const scale = interpolate(frame, [0, durationInFrames], [1, 1.4], {
                extrapolateRight: 'clamp',
                easing: Easing.out(Easing.quad),
            });
            return `scale(${scale})`;
        }
        
        // Zoom Out (Dolly Back)
        if (m.includes('zoom-out') || m.includes('dolly-back') || m.includes('back')) {
            const scale = interpolate(frame, [0, durationInFrames], [1.4, 1], {
                extrapolateRight: 'clamp',
                easing: Easing.out(Easing.quad),
            });
            return `scale(${scale})`;
        }
        
        // Pan Left
        if (m.includes('pan-left') || m.includes('left')) {
            const x = interpolate(frame, [0, durationInFrames], [0, -250], {
                extrapolateRight: 'clamp',
                easing: Easing.out(Easing.quad),
            });
            return `scale(1.2) translateX(${x}px)`;
        }
        
        // Pan Right
        if (m.includes('pan-right') || m.includes('right')) {
            const x = interpolate(frame, [0, durationInFrames], [0, 250], {
                extrapolateRight: 'clamp',
                easing: Easing.out(Easing.quad),
            });
            return `scale(1.2) translateX(${x}px)`;
        }

        // Default: Dramatic drift
        const scale = interpolate(frame, [0, durationInFrames], [1, 1.35], {
            extrapolateRight: 'clamp',
            easing: Easing.out(Easing.quad),
        });
        return `scale(${scale})`;
    }, [frame, durationInFrames, motionType]);

    // ── Sunlight/Shadow Logic ──────────────────────────────────────────────
    // Moving shadow filter to simulate sun passing - AGGRESSIVE
    const shadowOpacity = interpolate(frame, [0, durationInFrames], [0.2, 0.65], {
        extrapolateRight: 'clamp',
    });
    const shadowX = interpolate(frame, [0, durationInFrames], [-40, 80], {
        extrapolateRight: 'clamp',
    });
    const shadowY = interpolate(frame, [0, durationInFrames], [20, 60], {
        extrapolateRight: 'clamp',
    });

    // Cloud/Branch shadow overlay (Moving SVG mask)
    const cloudX = interpolate(frame, [0, durationInFrames], [-400, 400], {
        extrapolateRight: 'clamp',
    });

    return (
        <AbsoluteFill style={{ backgroundColor: '#000', overflow: 'hidden' }}>
            {/* Base Image with Motion */}
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    transform,
                    backgroundImage: `url(${resolvedImageUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    filter: `drop-shadow(${shadowX}px ${shadowY}px 30px rgba(0,0,0,${shadowOpacity}))`,
                }}
            />

            {/* Moving Shadow Overlay (Sunlight passing through clouds/leaves) */}
            <AbsoluteFill style={{ pointerEvents: 'none' }}>
                <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
                    <defs>
                        <radialGradient id="shadowGrad" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor="black" stopOpacity="0.6" />
                            <stop offset="100%" stopColor="black" stopOpacity="0" />
                        </radialGradient>
                    </defs>
                    <g transform={`translate(${cloudX}, 50)`}>
                        <circle cx="200" cy="200" r="400" fill="url(#shadowGrad)" />
                        <circle cx="1200" cy="800" r="500" fill="url(#shadowGrad)" />
                        <circle cx="1600" cy="200" r="350" fill="url(#shadowGrad)" />
                    </g>
                </svg>
            </AbsoluteFill>

            {/* Vignette */}
            <AbsoluteFill
                style={{
                    background: 'radial-gradient(circle, transparent 30%, rgba(0,0,0,0.65) 100%)',
                    pointerEvents: 'none',
                }}
            />
        </AbsoluteFill>
    );
};

export default AnimationComponent;
