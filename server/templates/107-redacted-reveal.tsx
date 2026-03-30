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
    }}>
      <div style={{
        fontSize: 40,
        fontWeight: 'bold',
        color: 'PRIMARY_COLOR',
        marginBottom: 64,
        letterSpacing: '2px',
        textTransform: 'uppercase',
      }}>
        CLASSIFIED_TITLE
      </div>
      {filtered.map((text, i) => {
        const start = 30 + (i * 40);
        const end = start + 30;
        const reveal = interpolate(frame, [start, end], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
        const barWidth = interpolate(frame, [start, end], [100, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

        return (
          <div key={i} style={{
            position: 'relative',
            height: 60,
            marginBottom: 24,
            display: 'flex',
            alignItems: 'center',
          }}>
            <div style={{
              fontSize: 32,
              color: 'TEXT_ON_PRIMARY',
              opacity: reveal,
              fontFamily: 'monospace',
            }}>
              {text}
            </div>
            <div style={{
              position: 'absolute',
              left: 0,
              top: 0,
              height: '100%',
              width: `${barWidth}%`,
              backgroundColor: 'SECONDARY_COLOR',
              zIndex: 2,
            }} />
          </div>
        );
      })}
    </div>
  );
};

export default AnimationComponent;