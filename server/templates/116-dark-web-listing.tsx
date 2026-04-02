import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

export const AnimationComponent = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const title = 'TITLE_TEXT';
  const source = 'SOURCE_TEXT';
  const price = 'PRICE_VALUE';
  const records = 'RECORD_COUNT';
  const desc = 'DESCRIPTION_TEXT';

  const op = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const scale = interpolate(frame, [0, 20], [0.82, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const reveal1 = interpolate(frame, [30, 60], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const reveal2 = interpolate(frame, [60, 90], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const reveal3 = interpolate(frame, [90, 120], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: 1920,
      height: 1080,
      backgroundColor: 'BACKGROUND_COLOR',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden'
    }}>
      <div style={{
        position: 'absolute',
        top: 180,
        left: 360,
        width: 1200,
        height: 720,
        backgroundColor: 'rgba(15, 23, 42, 0.8)',
        border: '1px solid rgba(255,255,255,0.1)',
        padding: '64px',
        boxSizing: 'border-box',
        opacity: op,
        transform: `scale(${scale})`,
        zIndex: 1,
        backdropFilter: 'blur(20px)',
        borderRadius: 24,
        boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
      }}>
        <div style={{ color: '#e63946', fontSize: 24, fontWeight: 'bold', letterSpacing: '0.2em', marginBottom: 24, opacity: reveal1 }}>{source}</div>
        <div style={{ color: 'rgba(255,255,255,0.92)', fontSize: 64, fontWeight: 'bold', marginBottom: 40, opacity: reveal1 }}>{title}</div>
        
        <div style={{ display: 'flex', gap: 80, marginBottom: 64, opacity: reveal2 }}>
          <div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 18, marginBottom: 8 }}>PRICE</div>
            <div style={{ color: '#2a9d5c', fontSize: 48, fontFamily: 'monospace' }}>{price}</div>
          </div>
          <div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 18, marginBottom: 8 }}>RECORDS</div>
            <div style={{ color: 'rgba(255,255,255,0.92)', fontSize: 48, fontFamily: 'monospace' }}>{records}</div>
          </div>
        </div>

        <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 24, lineHeight: 1.6, borderTop: '1px solid #333', paddingTop: 40, opacity: reveal3 }}>
          {desc}
        </div>
      </div>
    </div>
  );
};

export default AnimationComponent;