import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

export const AnimationComponent = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const items = useMemo(() => [
    { label: 'LABEL_1', value: 85 },
    { label: 'LABEL_2', value: 72 },
    { label: 'LABEL_3', value: 64 },
    { label: 'LABEL_4', value: 58 },
    { label: 'LABEL_5', value: 45 },
  ].filter(i => i.label !== ''), []);

  const barHeight = 64;
  const gutter = 24;
  const startY = 240;

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: 1920,
      height: 1080,
      overflow: 'hidden',
      backgroundColor: 'BACKGROUND_COLOR',
      padding: '0 192px',
      boxSizing: 'border-box'
    }}>
      <div style={{ position: 'absolute', top: 100, left: 192, fontSize: 40, fontWeight: 'bold', color: 'TEXT_ON_PRIMARY' }}>
        TITLE_TEXT
      </div>

      {items.map((item, index) => {
        const delay = index * 15;
        const barWidth = interpolate(frame, [20 + delay, 70 + delay], [0, (item.value / 100) * 1400], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
        const opacity = interpolate(frame, [20 + delay, 40 + delay], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

        return (
          <div key={index} style={{
            position: 'absolute',
            top: startY + (index * (barHeight + gutter)),
            left: 192,
            width: 1536,
            height: barHeight,
            opacity
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: barWidth,
              height: barHeight,
              backgroundColor: 'PRIMARY_COLOR',
              borderRadius: 4
            }} />
            <div style={{
              position: 'absolute',
              top: 16,
              left: 24,
              fontSize: 24,
              fontWeight: 'bold',
              color: 'TEXT_ON_PRIMARY',
              whiteSpace: 'nowrap'
            }}>
              {item.label}
            </div>
            <div style={{
              position: 'absolute',
              top: 16,
              right: 24,
              fontSize: 24,
              fontWeight: 'bold',
              color: 'TEXT_ON_PRIMARY',
              fontFamily: 'monospace'
            }}>
              {item.value}%
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AnimationComponent;