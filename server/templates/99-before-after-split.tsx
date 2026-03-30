import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

export const AnimationComponent = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const splitX = interpolate(frame, [30, 90], [0, width / 2], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const dividerOp = interpolate(frame, [30, 40], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const contentOp = interpolate(frame, [90, 120], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const title1 = 'TITLE_LEFT';
  const title2 = 'TITLE_RIGHT';
  const desc1 = 'DESC_LEFT';
  const desc2 = 'DESC_RIGHT';
  const stat1 = 'STAT_LEFT';
  const stat2 = 'STAT_RIGHT';

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden', backgroundColor: 'BACKGROUND_COLOR' }}>
      {/* Left Side */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: splitX, height: 1080, backgroundColor: 'PRIMARY_COLOR', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 300, left: 100, width: 700, opacity: contentOp, color: 'TEXT_ON_PRIMARY' }}>
          <div style={{ fontSize: 64, fontWeight: 'bold', marginBottom: 24 }}>{title1}</div>
          <div style={{ fontSize: 80, fontWeight: 'bold', fontFamily: 'monospace', marginBottom: 24 }}>{stat1}</div>
          <div style={{ fontSize: 24, lineHeight: 1.5 }}>{desc1}</div>
        </div>
      </div>

      {/* Right Side */}
      <div style={{ position: 'absolute', top: 0, left: splitX, width: width - splitX, height: 1080, backgroundColor: 'SECONDARY_COLOR', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 300, left: 100, width: 700, opacity: contentOp, color: 'TEXT_ON_SECONDARY' }}>
          <div style={{ fontSize: 64, fontWeight: 'bold', marginBottom: 24 }}>{title2}</div>
          <div style={{ fontSize: 80, fontWeight: 'bold', fontFamily: 'monospace', marginBottom: 24 }}>{stat2}</div>
          <div style={{ fontSize: 24, lineHeight: 1.5 }}>{desc2}</div>
        </div>
      </div>

      {/* Divider */}
      <div style={{ position: 'absolute', top: 0, left: splitX - 4, width: 8, height: 1080, backgroundColor: 'ACCENT_COLOR', opacity: dividerOp, zIndex: 3 }} />
    </div>
  );
};

export default AnimationComponent;