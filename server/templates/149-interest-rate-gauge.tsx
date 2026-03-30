import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

export const AnimationComponent = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const TITLE = 'TITLE_TEXT';
  const CURRENT_RATE = 'CURRENT_RATE_VALUE';
  const labelLow = 'LABEL_LOW';
  const labelHigh = 'LABEL_HIGH';
  const subText = 'SUB_TEXT';

  const centerX = 960;
  const centerY = 640;
  const radius = 320;

  const needleRotation = interpolate(frame, [40, 120], [-135, 135], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const titleOp = interpolate(frame, [0, 30], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const gaugeOp = interpolate(frame, [20, 60], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const needleOp = interpolate(frame, [60, 90], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden', backgroundColor: 'BACKGROUND_COLOR' }}>
      <div style={{ position: 'absolute', top: 60, left: 192, width: 1536, height: 100, color: 'TEXT_ON_PRIMARY', fontSize: 40, fontWeight: 'bold', textAlign: 'center', opacity: titleOp, letterSpacing: '2px' }}>
        {TITLE}
      </div>

      <svg style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, opacity: gaugeOp }}>
        <path d={`M ${centerX - radius} ${centerY} A ${radius} ${radius} 0 1 1 ${centerX + radius} ${centerY}`} fill="none" stroke="GRID_LINE" strokeWidth="40" strokeDasharray="1000" strokeDashoffset="500" />
        <text x={centerX - radius - 40} y={centerY + 10} fill="TEXT_ON_PRIMARY" fontSize="24" fontWeight="600">{labelLow}</text>
        <text x={centerX + radius + 20} y={centerY + 10} fill="TEXT_ON_PRIMARY" fontSize="24" fontWeight="600">{labelHigh}</text>
      </svg>

      <div style={{ position: 'absolute', top: centerY - 20, left: centerX - 2, width: 4, height: radius, backgroundColor: 'ACCENT_COLOR', transformOrigin: 'top center', transform: `rotate(${needleRotation}deg)`, opacity: needleOp, zIndex: 3 }} />
      
      <div style={{ position: 'absolute', top: centerY + 120, left: centerX - 200, width: 400, textAlign: 'center', opacity: needleOp }}>
        <div style={{ fontSize: 80, fontWeight: 'bold', color: 'PRIMARY_COLOR', fontFamily: 'monospace' }}>{CURRENT_RATE}</div>
        <div style={{ fontSize: 20, color: 'TEXT_ON_SECONDARY', marginTop: 16 }}>{subText}</div>
      </div>
    </div>
  );
};

export default AnimationComponent;