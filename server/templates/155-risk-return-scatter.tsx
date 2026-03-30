import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

export const AnimationComponent = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const points = useMemo(() => [
    { label: 'LABEL_1', x: 20, y: 30 },
    { label: 'LABEL_2', x: 40, y: 50 },
    { label: 'LABEL_3', x: 60, y: 45 },
    { label: 'LABEL_4', x: 80, y: 75 },
    { label: 'LABEL_5', x: 30, y: 65 },
    { label: 'LABEL_6', x: 70, y: 25 }
  ].filter(p => p.label !== '' && p.label !== ' '), []);

  const chartArea = { left: 200, top: 150, width: 1520, height: 700 };
  
  const gridOp = interpolate(frame, [0, 30], [0, 0.3], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const axisOp = interpolate(frame, [20, 50], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden', backgroundColor: 'BACKGROUND_COLOR' }}>
      <div style={{ position: 'absolute', top: 60, left: 192, fontSize: 40, fontWeight: 'bold', color: 'TEXT_ON_PRIMARY', opacity: axisOp }}>TITLE_TEXT</div>
      
      <svg style={{ position: 'absolute', top: chartArea.top, left: chartArea.left, width: chartArea.width, height: chartArea.height }}>
        <line x1={0} y1={chartArea.height} x2={chartArea.width} y2={chartArea.height} stroke="GRID_LINE" strokeWidth={3} />
        <line x1={0} y1={0} x2={0} y2={chartArea.height} stroke="GRID_LINE" strokeWidth={3} />
        
        {points.map((p, i) => {
          const delay = 60 + (i * 20);
          const op = interpolate(frame, [delay, delay + 25], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          const scale = interpolate(frame, [delay, delay + 25], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          const px = (p.x / 100) * chartArea.width;
          const py = chartArea.height - (p.y / 100) * chartArea.height;

          return (
            <g key={i} style={{ opacity: op, transform: `scale(${scale})`, transformOrigin: `${px}px ${py}px` }}>
              <circle cx={px} cy={py} r={12} fill="PRIMARY_COLOR" />
              <text x={px + 20} y={py - 10} fill="TEXT_ON_PRIMARY" fontSize={18} fontWeight="600">{p.label}</text>
            </g>
          );
        })}

        <path 
          d={`M 0 ${chartArea.height} Q ${chartArea.width * 0.5} ${chartArea.height * 0.2} ${chartArea.width} 0`}
          fill="none" 
          stroke="ACCENT_COLOR" 
          strokeWidth={4} 
          strokeDasharray={chartArea.width * 2}
          strokeDashoffset={interpolate(frame, [180, 260], [chartArea.width * 2, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}
        />
      </svg>

      <div style={{ position: 'absolute', top: 940, left: 192, fontSize: 16, color: 'SUPPORT_COLOR', opacity: axisOp }}>SOURCE_TEXT</div>
    </div>
  );
};

export default AnimationComponent;