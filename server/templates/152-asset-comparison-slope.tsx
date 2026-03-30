import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

export const AnimationComponent = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const title = 'TITLE_TEXT';
  const assetName = 'ASSET_NAME';
  const val1 = 'START_VALUE';
  const val2 = 'END_VALUE';
  const label1 = 'LABEL_START';
  const label2 = 'LABEL_END';
  const change = 'PERCENT_CHANGE';

  const opacity = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const lineDraw = interpolate(frame, [30, 90], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const labelOp = interpolate(frame, [80, 120], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden', backgroundColor: 'BACKGROUND_COLOR', opacity }}>
      <div style={{ position: 'absolute', top: 100, left: 192, fontSize: 40, fontWeight: 'bold', color: 'TEXT_ON_PRIMARY', letterSpacing: '2px' }}>{title}</div>
      
      <div style={{ position: 'absolute', top: 300, left: 400, width: 1120, height: 480 }}>
        <svg width="1120" height="480">
          <line x1="0" y1="400" x2="1120" y2="80" stroke="LINE_STROKE" strokeWidth="8" strokeDasharray="1120" strokeDashoffset={1120 * (1 - lineDraw)} />
          <circle cx="0" cy="400" r="16" fill="PRIMARY_COLOR" />
          <circle cx="1120" cy="80" r="16" fill="ACCENT_COLOR" />
        </svg>
      </div>

      <div style={{ position: 'absolute', top: 650, left: 350, opacity: labelOp }}>
        <div style={{ fontSize: 22, color: 'SUPPORT_COLOR' }}>{label1}</div>
        <div style={{ fontSize: 64, fontWeight: 'bold', color: 'TEXT_ON_PRIMARY', fontFamily: 'monospace' }}>{val1}</div>
      </div>

      <div style={{ position: 'absolute', top: 150, left: 1450, opacity: labelOp }}>
        <div style={{ fontSize: 22, color: 'SUPPORT_COLOR' }}>{label2}</div>
        <div style={{ fontSize: 64, fontWeight: 'bold', color: 'ACCENT_COLOR', fontFamily: 'monospace' }}>{val2}</div>
      </div>

      <div style={{ position: 'absolute', top: 400, left: 800, padding: '16px 32px', backgroundColor: 'SECONDARY_COLOR', borderRadius: '8px', opacity: labelOp }}>
        <div style={{ fontSize: 32, fontWeight: 'bold', color: 'TEXT_ON_SECONDARY' }}>{change}</div>
      </div>
    </div>
  );
};

export default AnimationComponent;