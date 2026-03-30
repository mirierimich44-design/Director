import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

export const AnimationComponent = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const title = 'TITLE_TEXT';
  const body = 'BODY_TEXT';
  const btc = 'BTC_ADDRESS';
  const deadline = 'DEADLINE_TEXT';
  const warning = 'WARNING_TEXT';

  const op1 = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const op2 = interpolate(frame, [30, 60], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const op3 = interpolate(frame, [70, 100], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const op4 = interpolate(frame, [110, 140], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const op5 = interpolate(frame, [150, 180], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const glitch = interpolate(frame % 10, [0, 5], [0, 2], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: 1920,
      height: 1080,
      overflow: 'hidden',
      backgroundColor: 'BACKGROUND_COLOR',
      padding: '108px',
      boxSizing: 'border-box',
      fontFamily: 'monospace',
    }}>
      <div style={{ position: 'absolute', top: 108, left: 192, width: 1536, height: 100, opacity: op1, color: 'PRIMARY_COLOR', fontSize: 64, fontWeight: 'bold', letterSpacing: '4px' }}>
        {title}
      </div>

      <div style={{ position: 'absolute', top: 250, left: 192, width: 1536, height: 300, opacity: op2, color: 'TEXT_ON_PRIMARY', fontSize: 32, lineHeight: 1.6 }}>
        {body}
      </div>

      <div style={{ position: 'absolute', top: 600, left: 192, width: 1536, height: 80, opacity: op3, color: 'SECONDARY_COLOR', fontSize: 24, borderLeft: '4px solid #e63946', paddingLeft: '24px' }}>
        BTC ADDRESS: {btc}
      </div>

      <div style={{ position: 'absolute', top: 720, left: 192, width: 1536, height: 80, opacity: op4, color: 'ACCENT_COLOR', fontSize: 32, fontWeight: 'bold' }}>
        DEADLINE: {deadline}
      </div>

      <div style={{ position: 'absolute', top: 900, left: 192, width: 1536, height: 60, opacity: op5, color: '#e63946', fontSize: 20, textTransform: 'uppercase', letterSpacing: '2px', transform: `translateX(${glitch}px)` }}>
        {warning}
      </div>

      <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, background: 'linear-gradient(rgba(230, 57, 70, 0.05), transparent)', pointerEvents: 'none' }} />
    </div>
  );
};

export default AnimationComponent;