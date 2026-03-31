import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

export const AnimationComponent = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const items = useMemo(() => [
    { name: 'COMPANY_1', val: 'VALUE_1', color: 'PRIMARY_COLOR', w: 960, h: 540, x: 0, y: 0 },
    { name: 'COMPANY_2', val: 'VALUE_2', color: 'SECONDARY_COLOR', w: 960, h: 270, x: 960, y: 0 },
    { name: 'COMPANY_3', val: 'VALUE_3', color: 'ACCENT_COLOR', w: 480, h: 270, x: 960, y: 270 },
    { name: 'COMPANY_4', val: 'VALUE_4', color: 'SUPPORT_COLOR', w: 480, h: 270, x: 1440, y: 270 },
    { name: 'COMPANY_5', val: 'VALUE_5', color: 'PRIMARY_COLOR', w: 1920, h: 270, x: 0, y: 540 },
  ], []);

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden', backgroundColor: 'BACKGROUND_COLOR' }}>
      {items.map((item, i) => {
        const start = i * 20;
        const opacity = interpolate(frame, [start, start + 25], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
        const scale = interpolate(frame, [start, start + 25], [0.8, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

        return (
          <div key={i} style={{
            position: 'absolute',
            left: item.x + 16,
            top: item.y + 16,
            width: item.w - 32,
            height: item.h - 32,
            backgroundColor: item.color,
            opacity,
            transform: `scale(${scale})`,
            borderRadius: 8,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            boxShadow: '0 10px 30px rgba(0,0,0,0.48)'
          }}>
            <div style={{ color: 'TEXT_ON_PRIMARY', fontSize: 40, fontWeight: 'bold', letterSpacing: '0.05em' }}>{item.name}</div>
            <div style={{ color: 'TEXT_ON_PRIMARY', fontSize: 24, opacity: 0.8, marginTop: 16 }}>{item.val}</div>
          </div>
        );
      })}
    </div>
  );
};

export default AnimationComponent;