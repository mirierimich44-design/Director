import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

export const AnimationComponent = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const items = useMemo(() => [
    { label: 'LABEL_1', val: 0.8, x: 400, y: 300 },
    { label: 'LABEL_2', val: 0.5, x: 800, y: 600 },
    { label: 'LABEL_3', val: 0.9, x: 1200, y: 400 },
    { label: 'LABEL_4', val: 0.4, x: 1500, y: 700 },
    { label: 'LABEL_5', val: 0.6, x: 600, y: 800 },
  ].filter(i => i.label !== ''), []);

  const titleOp = interpolate(frame, [0, 30], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const stadiaKey = "STADIA_API_KEY"
  const stadiaUrl = stadiaKey
    ? `https://tiles.stadiamaps.com/static/alidade_smooth_dark/0,20,1.2/1920x1080@2x.png?api_key=${stadiaKey}`
    : null

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden', backgroundColor: 'BACKGROUND_COLOR' }}>
      {stadiaUrl ? (
        <img
          src={stadiaUrl}
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0.4, objectFit: 'cover' }}
        />
      ) : null}
      <div style={{ position: 'absolute', top: 60, left: 192, fontSize: 40, fontWeight: 'bold', color: 'TEXT_ON_PRIMARY', opacity: titleOp, letterSpacing: '2px' }}>
        TITLE_TEXT
      </div>
      <svg width={1920} height={1080}>
        {items.map((item, i) => {
          const start = 30 + (i * 20);
          const scale = interpolate(frame, [start, start + 40], [0, item.val], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          const op = interpolate(frame, [start, start + 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          
          return (
            <g key={i} style={{ opacity: op }}>
              <circle 
                cx={item.x} 
                cy={item.y} 
                r={scale * 200} 
                fill="PRIMARY_COLOR" 
                fillOpacity={0.6} 
                stroke="ACCENT_COLOR" 
                strokeWidth={3} 
              />
              <text 
                x={item.x} 
                y={item.y + (scale * 200) + 30} 
                fill="TEXT_ON_PRIMARY" 
                fontSize={20} 
                textAnchor="middle" 
                fontFamily="sans-serif"
              >
                {item.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default AnimationComponent;