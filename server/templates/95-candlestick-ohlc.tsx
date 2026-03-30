import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

export const AnimationComponent = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const candleData = useMemo(() => [
    { open: 100, high: 120, low: 90, close: 110, color: '2a9d5c' },
    { open: 110, high: 115, low: 100, close: 105, color: 'e63946' },
    { open: 105, high: 130, low: 105, close: 125, color: '2a9d5c' },
    { open: 125, high: 140, low: 120, close: 135, color: '2a9d5c' },
    { open: 135, high: 138, low: 110, close: 115, color: 'e63946' },
    { open: 115, high: 125, low: 115, close: 120, color: '2a9d5c' }
  ], []);

  const chartWidth = 1400;
  const chartHeight = 600;
  const startX = 260;
  const startY = 700;
  const candleWidth = 80;
  const gap = 40;

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden', backgroundColor: 'BACKGROUND_COLOR' }}>
      <div style={{ position: 'absolute', top: 60, left: 192, fontSize: 40, fontWeight: 'bold', color: 'TEXT_ON_PRIMARY' }}>TITLE_TEXT</div>
      
      <svg style={{ position: 'absolute', top: 180, left: startX, width: chartWidth, height: chartHeight }}>
        {candleData.map((d, i) => {
          const delay = i * 30;
          const wickOp = interpolate(frame, [delay, delay + 15], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          const bodyH = interpolate(frame, [delay + 10, delay + 40], [0, Math.abs(d.close - d.open) * 4], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          const bodyY = d.close > d.open ? (100 - d.close) * 4 : (100 - d.open) * 4;

          return (
            <g key={i} style={{ opacity: wickOp }}>
              <line x1={i * (candleWidth + gap) + 40} y1={(100 - d.high) * 4} x2={i * (candleWidth + gap) + 40} y2={(100 - d.low) * 4} stroke="LINE_STROKE" strokeWidth={3} />
              <rect x={i * (candleWidth + gap)} y={bodyY} width={candleWidth} height={bodyH} fill={d.color === '2a9d5c' ? 'PRIMARY_COLOR' : 'SECONDARY_COLOR'} />
            </g>
          );
        })}
      </svg>

      <div style={{ position: 'absolute', top: 940, left: 192, fontSize: 16, color: 'SUPPORT_COLOR' }}>SOURCE_TEXT</div>
    </div>
  );
};

export default AnimationComponent;