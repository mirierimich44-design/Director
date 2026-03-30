import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

export const AnimationComponent = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const lines = useMemo(() => [
    'LOG_1',
    'LOG_2',
    'LOG_3',
    'LOG_4',
    'LOG_5',
    'LOG_6',
    'LOG_7',
    'LOG_8'
  ].filter(l => l && l !== ''), []);

  const title = 'TITLE_TEXT';

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: 1920,
      height: 1080,
      backgroundColor: 'BACKGROUND_COLOR',
      overflow: 'hidden',
      padding: '108px',
      boxSizing: 'border-box'
    }}>
      <div style={{
        fontSize: 40,
        fontWeight: 'bold',
        color: 'PRIMARY_COLOR',
        marginBottom: 48,
        fontFamily: 'monospace',
        letterSpacing: '2px',
        opacity: interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
      }}>
        {title}
      </div>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
      }}>
        {lines.map((line, i) => {
          const start = 30 + (i * 40);
          const end = start + 30;
          const opacity = interpolate(frame, [start, end], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          const xOffset = interpolate(frame, [start, end], [40, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          
          const isCritical = i >= lines.length - 2;

          return (
            <div key={i} style={{
              height: 64,
              backgroundColor: isCritical ? 'rgba(230, 57, 70, 0.15)' : 'rgba(255, 255, 255, 0.05)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              padding: '0 32px',
              fontSize: 24,
              fontFamily: 'monospace',
              color: isCritical ? '#e63946' : 'TEXT_ON_PRIMARY',
              border: isCritical ? '2px solid #e63946' : 'none',
              opacity,
              transform: `translateX(${xOffset}px)`
            }}>
              {line}
            </div>
          );
        })}
      </div>

      <div style={{
        position: 'absolute',
        bottom: 80,
        right: 108,
        fontSize: 32,
        fontWeight: 'bold',
        color: '#e63946',
        opacity: interpolate(frame, [350, 400], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
        fontFamily: 'monospace',
        textTransform: 'uppercase'
      }}>
        PROCESS TERMINATED
      </div>
    </div>
  );
};

export default AnimationComponent;