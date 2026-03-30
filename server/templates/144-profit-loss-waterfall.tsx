import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

export const AnimationComponent = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const labels = ['LABEL_1', 'LABEL_2', 'LABEL_3', 'LABEL_4', 'LABEL_5'];
  const values = [100, -30, -20, -10, 40];
  const colors = ['PRIMARY_COLOR', 'SECONDARY_COLOR', 'SECONDARY_COLOR', 'SECONDARY_COLOR', 'ACCENT_COLOR'];

  const barWidth = 240;
  const gutter = 40;
  const startX = (1920 - (labels.length * (barWidth + gutter))) / 2;
  const baselineY = 700;

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden', backgroundColor: 'BACKGROUND_COLOR' }}>
      <div style={{ position: 'absolute', top: 60, left: 192, width: 1536, height: 100, color: 'TEXT_ON_PRIMARY', fontSize: 40, fontWeight: 'bold', letterSpacing: '2px' }}>TITLE_TEXT</div>
      
      <svg style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 1080 }}>
        <line x1={192} y1={baselineY} x2={1728} y2={baselineY} stroke='GRID_LINE' strokeWidth={3} />
        {labels.map((label, i) => {
          const val = values[i];
          const barH = interpolate(frame, [30 + i * 30, 60 + i * 30], [0, Math.abs(val) * 4], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          const x = startX + i * (barWidth + gutter);
          const y = val > 0 ? baselineY - barH : baselineY;
          
          return (
            <g key={i}>
              <rect x={x} y={y} width={barWidth} height={barH} fill={colors[i]} style={{ opacity: interpolate(frame, [30 + i * 30, 50 + i * 30], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) }} />
              <text x={x + barWidth / 2} y={val > 0 ? y - 20 : y + barH + 40} fill='TEXT_ON_PRIMARY' fontSize={24} fontWeight='bold' textAnchor='middle' style={{ opacity: interpolate(frame, [50 + i * 30, 70 + i * 30], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) }}>{label}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default AnimationComponent;