import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

export const AnimationComponent = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const splitX    = interpolate(frame, [30, 90], [0, width / 2], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const dividerOp = interpolate(frame, [30, 40], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const contentOp = interpolate(frame, [90, 120], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const title1 = 'TITLE_LEFT';
  const title2 = 'TITLE_RIGHT';
  const desc1  = 'DESC_LEFT';
  const desc2  = 'DESC_RIGHT';
  const stat1  = 'STAT_LEFT';
  const stat2  = 'STAT_RIGHT';

  // Shared card style — always uses white text since the card has a dark glass background
  const cardStyle: React.CSSProperties = {
    position: 'absolute', top: 280, left: 80, width: 720,
    opacity: contentOp,
    backgroundColor: 'rgba(10, 16, 30, 0.88)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: 24,
    boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
    padding: 48,
    boxSizing: 'border-box',
  };

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden', backgroundColor: 'BACKGROUND_COLOR' }}>
      {/* Left Side */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: splitX, height: 1080, backgroundColor: 'PRIMARY_COLOR', overflow: 'hidden' }}>
        <div style={cardStyle}>
          <div style={{ fontSize: 60, fontWeight: 900, marginBottom: 20, color: '#fff' }}>{title1}</div>
          <div style={{ fontSize: 80, fontWeight: 900, fontFamily: 'monospace', marginBottom: 20, color: 'ACCENT_COLOR' }}>{stat1}</div>
          <div style={{ fontSize: 26, lineHeight: 1.5, color: 'rgba(255,255,255,0.9)' }}>{desc1}</div>
        </div>
      </div>

      {/* Right Side */}
      <div style={{ position: 'absolute', top: 0, left: splitX, width: width - splitX, height: 1080, backgroundColor: 'SECONDARY_COLOR', overflow: 'hidden' }}>
        <div style={cardStyle}>
          <div style={{ fontSize: 60, fontWeight: 900, marginBottom: 20, color: '#fff' }}>{title2}</div>
          <div style={{ fontSize: 80, fontWeight: 900, fontFamily: 'monospace', marginBottom: 20, color: '#fff' }}>{stat2}</div>
          <div style={{ fontSize: 26, lineHeight: 1.5, color: 'rgba(255,255,255,0.9)' }}>{desc2}</div>
        </div>
      </div>

      {/* Divider */}
      <div style={{ position: 'absolute', top: 0, left: splitX - 5, width: 10, height: 1080, backgroundColor: 'ACCENT_COLOR', opacity: dividerOp, zIndex: 3 }} />
    </div>
  );
};

export default AnimationComponent;
