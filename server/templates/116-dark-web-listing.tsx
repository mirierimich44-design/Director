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
  const reveal1 = interpolate(frame, [30, 50], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const reveal2 = interpolate(frame, [50, 70], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const reveal3 = interpolate(frame, [70, 90], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <div style={{
      position: 'absolute', inset: 0,
      backgroundColor: 'BACKGROUND_COLOR',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden', fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      
      {/* Visibility Scrim */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        opacity: op
      }} />

      {/* 16:9 Safe Container */}
      <div style={{ width: 1600, height: 900, position: 'relative' }}>
        
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          width: 1200, backgroundColor: 'rgba(15, 23, 42, 0.95)',
          border: '1px solid rgba(255,255,255,0.15)', padding: '64px',
          boxSizing: 'border-box', opacity: op,
          backdropFilter: 'blur(30px)', borderRadius: 24,
          boxShadow: '0 30px 80px rgba(0,0,0,0.8)'
        }}>
          
          {/* Source/Alert Text - High Visibility Red */}
          <div style={{ color: '#FF3B30', fontSize: 24, fontWeight: 900, letterSpacing: '0.2em', marginBottom: 24, opacity: reveal1 }}>
            {source}
          </div>
          
          {/* Main Title - Bright White */}
          <div style={{ color: '#FFFFFF', fontSize: 64, fontWeight: 900, marginBottom: 40, opacity: reveal1, lineHeight: 1.1, letterSpacing: '-0.02em' }}>
            {title}
          </div>
          
          <div style={{ display: 'flex', gap: 80, marginBottom: 50, opacity: reveal2 }}>
            <div>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 18, marginBottom: 8, fontWeight: 700, letterSpacing: 2 }}>PRICE</div>
              <div style={{ color: '#34D399', fontSize: 48, fontFamily: 'JetBrains Mono, monospace', fontWeight: 800 }}>{price}</div>
            </div>
            <div>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 18, marginBottom: 8, fontWeight: 700, letterSpacing: 2 }}>RECORDS EXPOSED</div>
              <div style={{ color: '#FFFFFF', fontSize: 48, fontFamily: 'JetBrains Mono, monospace', fontWeight: 800 }}>{records}</div>
            </div>
          </div>

          {/* Description - Bright White */}
          <div style={{ color: 'rgba(255,255,255,0.95)', fontSize: 24, lineHeight: 1.6, borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 40, opacity: reveal3, fontWeight: 500 }}>
            {desc}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AnimationComponent;