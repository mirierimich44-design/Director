import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

export const AnimationComponent = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const items = useMemo(() => [
    { label: 'LABEL_1', valW: 0.4, valH: 0.6 },
    { label: 'LABEL_2', valW: 0.3, valH: 0.8 },
    { label: 'LABEL_3', valW: 0.3, valH: 0.4 },
  ].filter(i => i.label !== ''), []);

  const totalW = 1400;
  const totalH = 600;
  const startX = 260;
  const startY = 240;

  let currentX = startX;

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, backgroundColor: 'BACKGROUND_COLOR', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 60, left: 192, fontSize: 40, fontWeight: 'bold', color: 'TEXT_ON_PRIMARY', letterSpacing: '2px' }}>TITLE_TEXT</div>
      
      {items.map((item, i) => {
        const w = item.valW * totalW;
        const h = item.valH * totalH;
        const x = currentX;
        currentX += w + 20;

        const reveal = interpolate(frame, [30 + i * 40, 90 + i * 40], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
        const scaleY = interpolate(frame, [30 + i * 40, 90 + i * 40], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

        return (
          <div key={i} style={{ 
            position: 'absolute', 
            left: x, 
            bottom: 240, 
            width: w, 
            height: h * scaleY, 
            backgroundColor: 'rgba(15, 23, 42, 0.8)',
            opacity: reveal,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(20px)',
            borderRadius: 16,
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
          }}>
            <span style={{ color: 'TEXT_ON_PRIMARY', fontSize: 20, fontWeight: 'bold', transform: `scale(${reveal})` }}>{item.label}</span>
          </div>
        );
      })}
      
      <div style={{ position: 'absolute', top: 940, left: 192, color: 'SUPPORT_COLOR', fontSize: 16 }}>SUB_1</div>
    </div>
  );
};

export default AnimationComponent;