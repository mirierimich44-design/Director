import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

// Default animation component - replaced dynamically during rendering
export const AnimationComponent: React.FC = () => {
    const frame = useCurrentFrame();
    useVideoConfig(); // kept for future use; fps not needed after spring() ban

    // Sample animation: Text reveal with gradient background
    const opacity = interpolate(frame, [0, 30], [0, 1], {
        extrapolateRight: 'clamp',
    });

    // Problem 4 fix: spring() banned (Frame NaN crash risk). Use interpolate() + Math.min/max.
    const scale = Math.min(1, Math.max(0, interpolate(frame, [0, 30], [0, 1], {
        extrapolateRight: 'clamp',
    })));

    const textY = interpolate(frame, [0, 30], [50, 0], {
        extrapolateRight: 'clamp',
    });

    return (
        <AbsoluteFill
            style={{
                // Problem 3 fix: background: shorthand breaks gradients — use backgroundImage: instead
                backgroundImage: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
                backgroundColor: '#1a1a2e',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'Inter, sans-serif',
                width: 1920,
                height: 1080,
                overflow: 'hidden',
            }}
        >
            <div
                style={{
                    opacity,
                    transform: `scale(${scale}) translateY(${textY}px)`,
                    textAlign: 'center',
                }}
            >
                <h1
                    style={{
                        fontSize: 72,
                        fontWeight: 800,
                        // Problem 3 fix: background: shorthand → backgroundImage: for gradient text effect
                        backgroundImage: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 50%, #3b82f6 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        marginBottom: 20,
                        whiteSpace: 'nowrap',
                    }}
                >
                    AI Animation
                </h1>
                <p
                    style={{
                        fontSize: 28,
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontWeight: 500,
                        whiteSpace: 'nowrap',
                    }}
                >
                    {'Generated with Claude + Remotion'}
                </p>
            </div>
        </AbsoluteFill>
    );
};
