import React, { useMemo } from 'react';
import { useCurrentFrame, interpolate } from 'remotion';

export const AnimationComponent = () => {
  const frame = useCurrentFrame();
  const contents = ['LINE_1', 'LINE_2', 'LINE_3', 'LINE_4', 'LINE_5', 'LINE_6'];
  const filtered = useMemo(() => contents.filter(c => c !== '' && c !== ' '), []);

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: 1920,
      height: 1080,
      backgroundColor: 'BACKGROUND_COLOR',
      padding: '108px 192px',
      boxSizing: 'border-box',
      fontFamily: 'Inter, system-ui, sans-serif',
    }}>
      {/* Glassmorphism container */}
      <div style={{
        backgroundColor: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 24,
        padding: '60px 80px',
        boxShadow: '0 20px 50px rgba(0,0,0,0.92)',
      }}>
        <div style={{
          fontSize: 40,
          fontWeight: 'bold',
          color: 'PRIMARY_COLOR',
          marginBottom: 48,
          letterSpacing: '2px',
          textTransform: 'uppercase',
        }}>
          CLASSIFIED_TITLE
        </div>
        {filtered.map((text, i) => {
          const start = 20 + (i * 25);
          const barEnd = start + 20;
          // Text appears immediately as bar starts sliding, stays at full opacity
          const textOp = interpolate(frame, [start, start + 10], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          // Bar slides off from left to right
          const barLeft = interpolate(frame, [start, barEnd], [0, 100], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

          return (
            <div key={i} style={{
              position: 'relative',
              height: 60,
              marginBottom: 20,
              display: 'flex',
              alignItems: 'center',
            }}>
              <div style={{
                fontSize: 32,
                color: 'TEXT_ON_PRIMARY',
                opacity: textOp,
                fontFamily: 'monospace',
              }}>
                {text}
              </div>
              <div style={{
                position: 'absolute',
                left: `${barLeft}%`,
                top: 0,
                height: '100%',
                width: '100%',
                backgroundColor: 'SECONDARY_COLOR',
                zIndex: 2,
              }} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AnimationComponent;
