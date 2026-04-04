import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

export const AnimationComponent = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const title = "TITLE_TEXT";
  const label1 = "LABEL_1";
  const label2 = "LABEL_2";
  const stat1 = "STAT_VALUE_1";
  const stat2 = "STAT_VALUE_2";

  const data = [100, 85, 70, 55, 40, 25, 10];
  const interest = [10, 8, 7, 5, 4, 2, 1];
  const principal = [90, 77, 63, 50, 36, 23, 9];

  const chartWidth = 1400;
  const chartHeight = 500;
  const barWidth = 120;
  const gap = 80;

  const titleOp = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const gridOp = interpolate(frame, [20, 50], [0, 0.3], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const statOp = interpolate(frame, [10, 35], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden', backgroundColor: 'BACKGROUND_COLOR' }}>
      <div style={{ position: 'absolute', top: 60, left: 192, right: 192, fontSize: 40, fontWeight: 'bold', color: 'TEXT_ON_PRIMARY', opacity: titleOp, wordBreak: 'break-word' }}>{title}</div>

      {/* Stat callout cards */}
      <div style={{ position: 'absolute', top: 130, right: 192, display: 'flex', gap: 32, opacity: statOp }}>
        <div style={{ backgroundColor: 'PRIMARY_COLOR', borderRadius: 12, padding: '14px 28px', textAlign: 'center' }}>
          <div style={{ color: 'TEXT_ON_PRIMARY', fontSize: 32, fontWeight: 'bold', wordBreak: 'break-word' }}>{stat1}</div>
          <div style={{ color: 'TEXT_ON_PRIMARY', fontSize: 16, opacity: 0.75, marginTop: 4, wordBreak: 'break-word' }}>{label1}</div>
        </div>
        <div style={{ backgroundColor: 'ACCENT_COLOR', borderRadius: 12, padding: '14px 28px', textAlign: 'center' }}>
          <div style={{ color: 'TEXT_ON_PRIMARY', fontSize: 32, fontWeight: 'bold', wordBreak: 'break-word' }}>{stat2}</div>
          <div style={{ color: 'TEXT_ON_PRIMARY', fontSize: 16, opacity: 0.75, marginTop: 4, wordBreak: 'break-word' }}>{label2}</div>
        </div>
      </div>

      <div style={{ position: 'absolute', top: 240, left: 200, width: chartWidth, height: chartHeight }}>
        {data.map((val, i) => {
          const barDelay = 60 + (i * 15);
          const pHeight = interpolate(frame, [barDelay, barDelay + 30], [0, (principal[i] / 100) * chartHeight], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          const iHeight = interpolate(frame, [barDelay + 10, barDelay + 40], [0, (interest[i] / 100) * chartHeight], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          
          return (
            <div key={i} style={{ position: 'absolute', bottom: 0, left: i * (barWidth + gap), width: barWidth, display: 'flex', flexDirection: 'column-reverse' }}>
              <div style={{ width: '100%', height: pHeight, backgroundColor: 'PRIMARY_COLOR', transformOrigin: 'bottom', transform: 'scaleY(1)' }} />
              <div style={{ width: '100%', height: iHeight, backgroundColor: 'ACCENT_COLOR', transformOrigin: 'bottom', transform: 'scaleY(1)' }} />
            </div>
          );
        })}
      </div>

      <div style={{ position: 'absolute', top: 840, left: 200, right: 200, display: 'flex', gap: 64, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 24, height: 24, backgroundColor: 'PRIMARY_COLOR', flexShrink: 0 }} />
          <span style={{ color: 'TEXT_ON_PRIMARY', fontSize: 24, wordBreak: 'break-word' }}>{label1}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 24, height: 24, backgroundColor: 'ACCENT_COLOR', flexShrink: 0 }} />
          <span style={{ color: 'TEXT_ON_PRIMARY', fontSize: 24, wordBreak: 'break-word' }}>{label2}</span>
        </div>
      </div>
    </div>
  );
};

export default AnimationComponent;