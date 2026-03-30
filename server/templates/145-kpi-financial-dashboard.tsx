import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

export const AnimationComponent = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const kpis = useMemo(() => [
    { label: 'REVENUE', value: 'STAT_VALUE_1', trend: 'TREND_1' },
    { label: 'EBITDA', value: 'STAT_VALUE_2', trend: 'TREND_2' },
    { label: 'MARGIN %', value: 'STAT_VALUE_3', trend: 'TREND_3' },
    { label: 'YOY GROWTH', value: 'STAT_VALUE_4', trend: 'TREND_4' }
  ], []);

  const title = 'TITLE_TEXT';

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden', backgroundColor: 'BACKGROUND_COLOR' }}>
      <div style={{ position: 'absolute', top: 60, left: 192, fontSize: 40, fontWeight: 'bold', color: 'TEXT_ON_PRIMARY', letterSpacing: '2px' }}>{title}</div>
      
      <div style={{ position: 'absolute', top: 180, left: 192, width: 1536, height: 720, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '48px' }}>
        {kpis.map((kpi, i) => {
          const start = 30 + (i * 20);
          const opacity = interpolate(frame, [start, start + 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          const scale = interpolate(frame, [start, start + 20], [0.9, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

          return (
            <div key={i} style={{ 
              backgroundColor: 'CHART_BG', 
              padding: '48px', 
              borderRadius: '8px', 
              opacity, 
              transform: `scale(${scale})`,
              border: '2px solid NODE_STROKE'
            }}>
              <div style={{ fontSize: 22, color: 'SUPPORT_COLOR', marginBottom: '16px', letterSpacing: '0.12em' }}>{kpi.label}</div>
              <div style={{ fontSize: 80, fontWeight: 'bold', color: 'PRIMARY_COLOR', fontFamily: 'monospace' }}>{kpi.value}</div>
              <div style={{ fontSize: 24, color: 'ACCENT_COLOR', marginTop: '16px' }}>{kpi.trend}</div>
            </div>
          );
        })}
      </div>

      <div style={{ position: 'absolute', top: 940, left: 192, color: 'SUPPORT_COLOR', fontSize: 16 }}>SOURCE_TEXT</div>
    </div>
  );
};

export default AnimationComponent;