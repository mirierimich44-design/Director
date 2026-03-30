import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

export const AnimationComponent = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const segments = [
    { label: 'LABEL_1', value: 40, color: 'PRIMARY_COLOR' },
    { label: 'LABEL_2', value: 30, color: 'SECONDARY_COLOR' },
    { label: 'LABEL_3', value: 20, color: 'ACCENT_COLOR' },
    { label: 'LABEL_4', value: 10, color: 'SUPPORT_COLOR' },
  ].filter(s => s.label !== '');

  const total = segments.reduce((acc, s) => acc + s.value, 0);
  let cumulative = 0;

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden', backgroundColor: 'BACKGROUND_COLOR' }}>
      <div style={{ position: 'absolute', top: 60, left: 192, fontSize: 40, fontWeight: 'bold', color: 'TEXT_ON_PRIMARY', letterSpacing: '2px' }}>TITLE_TEXT</div>
      
      <svg style={{ position: 'absolute', top: 180, left: 192, width: 720, height: 720 }} viewBox="0 0 100 100">
        {segments.map((seg, i) => {
          const startAngle = (cumulative / total) * 360;
          const sweep = (seg.value / total) * 360;
          cumulative += seg.value;
          
          const progress = interpolate(frame, [20 + i * 20, 60 + i * 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          const dash = 251.2;
          const offset = dash - (progress * (sweep / 360) * dash);

          return (
            <circle
              key={i}
              cx="50" cy="50" r="40"
              fill="none"
              stroke={seg.color}
              strokeWidth="12"
              strokeDasharray={`${(sweep / 360) * dash} ${dash}`}
              strokeDashoffset={offset}
              transform={`rotate(${startAngle - 90} 50 50)`}
            />
          );
        })}
      </svg>

      <div style={{ position: 'absolute', top: 300, left: 1000, width: 728, height: 600 }}>
        {segments.map((seg, i) => {
          const op = interpolate(frame, [80 + i * 20, 110 + i * 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', marginBottom: 32, opacity: op }}>
              <div style={{ width: 24, height: 24, backgroundColor: seg.color, marginRight: 24, borderRadius: 4 }} />
              <span style={{ fontSize: 32, color: 'TEXT_ON_PRIMARY', fontWeight: 'bold' }}>{seg.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AnimationComponent;