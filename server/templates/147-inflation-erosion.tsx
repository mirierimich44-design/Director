import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, Easing } from 'remotion';

export const AnimationComponent = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const title  = 'TITLE_TEXT';
  const stat1  = 'STAT_VALUE_1';
  const stat2  = 'STAT_VALUE_2';
  const label1 = 'LABEL_1';
  const label2 = 'LABEL_2';
  const desc   = 'DESC_1';

  const chartData = [1000, 910, 820, 740, 650, 560, 480, 410, 350, 280];
  const maxVal    = 1000;

  const entryStart = 10;

  // Gentler animations — longer transitions, smaller translateY
  const titleOp = interpolate(frame, [entryStart, entryStart + 30], [0, 1], { extrapolateLeft: 'clamp' });
  const titleTy = interpolate(frame, [entryStart, entryStart + 30], [18, 0], { extrapolateLeft: 'clamp', easing: Easing.out(Easing.quad) });

  const stat1Op = interpolate(frame, [entryStart + 20, entryStart + 45], [0, 1], { extrapolateLeft: 'clamp' });
  const stat2Op = interpolate(frame, [entryStart + 40, entryStart + 65], [0, 1], { extrapolateLeft: 'clamp' });

  const chartStart = entryStart + 40;
  const chartH     = 340;  // Reduced from 450 to give more breathing room

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden',
      backgroundColor: 'BACKGROUND_COLOR', fontFamily: 'Inter, system-ui, sans-serif',
    }}>
      {/* Background grid */}
      <div style={{
        position: 'absolute', width: '100%', height: '100%',
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
        backgroundSize: '100px 100px', opacity: 0.5,
      }} />

      {/* Header */}
      <div style={{ position: 'absolute', top: 70, left: 120, opacity: titleOp, transform: `translateY(${titleTy}px)` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 10 }}>
          <div style={{ width: 10, height: 44, backgroundColor: 'PRIMARY_COLOR', borderRadius: 4, boxShadow: '0 0 20px PRIMARY_COLOR' }} />
          <div style={{ fontSize: 52, fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', textTransform: 'uppercase' }}>{title}</div>
        </div>
        <div style={{ fontSize: 20, color: 'rgba(255,255,255,0.3)', fontWeight: 600, letterSpacing: '0.1em', marginLeft: 30 }}>
          CURRENCY_EROSION_INDEX // PURCHASING_POWER_DECAY
        </div>
      </div>

      {/* KPI Stats */}
      <div style={{ position: 'absolute', top: 200, left: 120, width: 1680, height: 160, display: 'flex', gap: 36, zIndex: 10 }}>
        <div style={{
          flex: 1, padding: '28px 40px',
          backgroundColor: 'rgba(15, 23, 42, 0.92)', backdropFilter: 'blur(24px)',
          borderRadius: 20, border: '1px solid rgba(255,255,255,0.1)', borderLeft: '7px solid PRIMARY_COLOR',
          opacity: stat1Op, boxShadow: '0 20px 40px rgba(0,0,0,0.7)',
          overflow: 'hidden', boxSizing: 'border-box',
        }}>
          <div style={{ fontSize: 52, fontWeight: 900, color: '#fff', fontFamily: 'monospace', lineHeight: 1, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{stat1}</div>
          <div style={{ fontSize: 16, color: 'rgba(255,255,255,0.45)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', marginTop: 10, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{label1}</div>
        </div>
        <div style={{
          flex: 1, padding: '28px 40px',
          backgroundColor: 'rgba(15, 23, 42, 0.92)', backdropFilter: 'blur(24px)',
          borderRadius: 20, border: '1px solid rgba(255,255,255,0.1)', borderLeft: '7px solid ACCENT_COLOR',
          opacity: stat2Op, boxShadow: '0 20px 40px rgba(0,0,0,0.7)',
          overflow: 'hidden', boxSizing: 'border-box',
        }}>
          <div style={{ fontSize: 52, fontWeight: 900, color: 'ACCENT_COLOR', fontFamily: 'monospace', lineHeight: 1, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{stat2}</div>
          <div style={{ fontSize: 16, color: 'rgba(255,255,255,0.45)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', marginTop: 10, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{label2}</div>
        </div>
      </div>

      {/* Bar chart */}
      <div style={{
        position: 'absolute', top: 390, left: 120, width: 1680, height: chartH,
        display: 'flex', alignItems: 'flex-end', gap: 16,
      }}>
        {chartData.map((val, i) => {
          const barStart = chartStart + (i * 8);
          const barH     = (val / maxVal) * chartH;
          const barOp    = interpolate(frame, [barStart, barStart + 15], [0, 1], { extrapolateLeft: 'clamp' });
          const barSc    = interpolate(frame, [barStart, barStart + 22], [0, 1], { extrapolateLeft: 'clamp', easing: Easing.out(Easing.quad) });

          return (
            <div key={i} style={{ flex: 1, height: barH, position: 'relative', opacity: barOp }}>
              <div style={{
                position: 'absolute', bottom: 0, width: '100%', height: '100%',
                background: 'linear-gradient(to top, PRIMARY_COLOR 0%, ACCENT_COLOR 100%)',
                borderRadius: '6px 6px 0 0', opacity: 0.85,
                transform: `scaleY(${barSc})`, transformOrigin: 'bottom',
              }} />
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div style={{ position: 'absolute', bottom: 36, left: 120, display: 'flex', alignItems: 'center', gap: 16, opacity: 0.25 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#fff' }} />
        <div style={{ color: '#fff', fontSize: 16, fontWeight: 500 }}>{desc}</div>
      </div>
    </div>
  );
};

export default AnimationComponent;
