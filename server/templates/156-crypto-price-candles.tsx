import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

export const AnimationComponent = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const candleData = [
    { open: 100, close: 120, high: 130, low: 90, vol: 50 },
    { open: 120, close: 110, high: 125, low: 105, vol: 80 },
    { open: 110, close: 140, high: 145, low: 108, vol: 120 },
    { open: 140, close: 135, high: 150, low: 130, vol: 60 },
    { open: 135, close: 160, high: 165, low: 132, vol: 150 },
    { open: 160, close: 155, high: 170, low: 150, vol: 90 }
  ];

  const chartWidth = 1600;
  const chartHeight = 500;
  const candleWidth = 120;
  const gap = 40;

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden', backgroundColor: 'BACKGROUND_COLOR' }}>
      <div style={{ position: 'absolute', top: 60, left: 160, fontSize: 40, fontWeight: 'bold', color: 'TEXT_ON_PRIMARY' }}>TITLE_TEXT</div>
      
      <div style={{ position: 'absolute', top: 180, left: 160, width: chartWidth, height: chartHeight, borderLeft: '2px solid GRID_LINE', borderBottom: '2px solid GRID_LINE' }}>
        {candleData.map((d, i) => {
          const isBull = d.close > d.open;
          const color = isBull ? 'PRIMARY_COLOR' : 'SECONDARY_COLOR';
          const startFrame = 30 + (i * 20);
          const opacity = interpolate(frame, [startFrame, startFrame + 15], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          const scaleY = interpolate(frame, [startFrame, startFrame + 25], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

          return (
            <div key={i} style={{ position: 'absolute', left: i * (candleWidth + gap) + 50, bottom: 0, width: candleWidth, height: chartHeight, opacity }}>
              <div style={{ position: 'absolute', bottom: (d.low / 2), left: '50%', width: 4, height: (d.high - d.low) / 2, backgroundColor: color, transform: `scaleY(${scaleY})`, transformOrigin: 'bottom' }} />
              <div style={{ position: 'absolute', bottom: (Math.min(d.open, d.close) / 2), left: '25%', width: '50%', height: Math.abs(d.close - d.open) / 2, backgroundColor: color, transform: `scaleY(${scaleY})`, transformOrigin: 'bottom' }} />
              <div style={{ position: 'absolute', bottom: 0, left: '10%', width: '80%', height: d.vol / 2, backgroundColor: 'SUPPORT_COLOR', opacity: 0.3 }} />
            </div>
          );
        })}
      </div>
      
      <div style={{ position: 'absolute', top: 940, left: 160, fontSize: 24, color: 'TEXT_ON_SECONDARY' }}>SUB_TEXT_1</div>
    </div>
  );
};

export default AnimationComponent;