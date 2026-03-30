import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

export const AnimationComponent = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const segments = [
    { label: 'TEXT_SEGMENT', color: 'PRIMARY_COLOR', size: 180 },
    { label: 'DATA_SEGMENT', color: 'SECONDARY_COLOR', size: 140 },
    { label: 'HEAP_SEGMENT', color: 'ACCENT_COLOR', size: 220 },
    { label: 'STACK_SEGMENT', color: 'SUPPORT_COLOR', size: 160 },
    { label: 'INJECTED_CODE', color: '#e63946', size: 120 },
  ];

  const totalSize = segments.reduce((acc, s) => acc + s.size, 0);
  const startY = (height - totalSize) / 2;

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: 1920,
      height: 1080,
      backgroundColor: 'BACKGROUND_COLOR',
      overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: 60, left: 192, fontSize: 40, fontWeight: 'bold', color: 'rgba(255,255,255,0.92)' }}>
        MEMORY MAP ANALYSIS
      </div>

      {segments.map((seg, i) => {
        const delay = i * 20;
        const opacity = interpolate(frame, [delay, delay + 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
        const scale = interpolate(frame, [delay, delay + 30], [0.9, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
        
        let currentY = startY;
        for(let j=0; j<i; j++) currentY += segments[j].size + 16;

        return (
          <div key={i} style={{
            position: 'absolute',
            top: currentY,
            left: 400,
            width: 800,
            height: seg.size,
            backgroundColor: seg.color,
            opacity,
            transform: `scaleY(${scale})`,
            borderRadius: 4,
            display: 'flex',
            alignItems: 'center',
            paddingLeft: 40,
            fontSize: 24,
            fontWeight: '600',
            color: 'rgba(0,0,0,0.8)'
          }}>
            {seg.label}
          </div>
        );
      })}

      <div style={{
        position: 'absolute',
        top: 200,
        left: 1300,
        width: 400,
        color: 'rgba(255,255,255,0.7)',
        fontSize: 18,
        lineHeight: 1.6
      }}>
        <p>SYSTEM MEMORY LAYOUT</p>
        <p>Visualizing segment allocation and potential injection vectors.</p>
      </div>
    </div>
  );
};

export default AnimationComponent;