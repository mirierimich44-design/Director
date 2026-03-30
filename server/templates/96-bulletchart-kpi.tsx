import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

export const AnimationComponent = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const kpis = useMemo(() => [
    { label: 'LABEL_1', value: 75, target: 80 },
    { label: 'LABEL_2', value: 60, target: 70 },
    { label: 'LABEL_3', value: 90, target: 85 },
    { label: 'LABEL_4', value: 45, target: 60 },
  ].filter(k => k.label !== '' && k.label !== ' '), []);

  const containerWidth = 1400;
  const barHeight = 40;
  const rowHeight = 120;
  const startY = 250;

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden', backgroundColor: 'BACKGROUND_COLOR' }}>
      <div style={{ position: 'absolute', top: 60, left: 260, fontSize: 40, fontWeight: 'bold', color: 'TEXT_ON_PRIMARY', letterSpacing: '2px' }}>TITLE_TEXT</div>
      
      {kpis.map((kpi, i) => {
        const delay = i * 20;
        const barProgress = interpolate(frame, [30 + delay, 80 + delay], [0, kpi.value], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
        const targetPos = (kpi.target / 100) * containerWidth;
        const opacity = interpolate(frame, [20 + delay, 50 + delay], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

        return (
          <div key={i} style={{ position: 'absolute', top: startY + (i * rowHeight), left: 260, width: containerWidth, height: barHeight, opacity }}>
            <div style={{ position: 'absolute', top: -30, left: 0, fontSize: 20, fontWeight: '600', color: 'TEXT_ON_SECONDARY' }}>{kpi.label}</div>
            <div style={{ position: 'absolute', top: 0, left: 0, width: containerWidth, height: barHeight, backgroundColor: 'CHART_BG', borderRadius: 4 }} />
            <div style={{ position: 'absolute', top: 0, left: 0, width: (barProgress / 100) * containerWidth, height: barHeight, backgroundColor: 'PRIMARY_COLOR', borderRadius: 4 }} />
            <div style={{ position: 'absolute', top: -8, left: targetPos - 3, width: 6, height: barHeight + 16, backgroundColor: 'ACCENT_COLOR', borderRadius: 2 }} />
          </div>
        );
      })}
      
      <div style={{ position: 'absolute', top: 940, left: 260, fontSize: 16, color: 'SUPPORT_COLOR' }}>SOURCE_TEXT</div>
    </div>
  );
};

export default AnimationComponent;