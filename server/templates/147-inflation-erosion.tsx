import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, Easing } from 'remotion';

export const AnimationComponent = () => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();

  const title = "TITLE_TEXT";
  const stat1 = "STAT_VALUE_1";
  const stat2 = "STAT_VALUE_2";
  const label1 = "LABEL_1";
  const label2 = "LABEL_2";
  const desc = "DESC_1";

  // Data modeling
  const chartData = [1000, 910, 820, 740, 650, 560, 480, 410, 350, 280];
  const maxVal = 1000;

  // Entrance Timings
  const entryStart = 10;
  const titleOp = interpolate(frame, [entryStart, entryStart + 20], [0, 1], { extrapolateLeft: 'clamp' });
  const titleTy = interpolate(frame, [entryStart, entryStart + 20], [30, 0], { extrapolateLeft: 'clamp', easing: Easing.out(Easing.quad) });

  const chartStart = entryStart + 30;
  const chartEnd = durationInFrames - 60;
  const totalChartW = 1200;
  const chartH = 450;

  // Header stats entrance
  const stat1Op = interpolate(frame, [entryStart + 15, entryStart + 35], [0, 1], { extrapolateLeft: 'clamp' });
  const stat2Op = interpolate(frame, [entryStart + 30, entryStart + 50], [0, 1], { extrapolateLeft: 'clamp' });

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden',
      backgroundColor: 'BACKGROUND_COLOR', fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      {/* Background Value Grid */}
      <div style={{
        position: 'absolute', width: '100%', height: '100%',
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
        backgroundSize: '100px 100px',
        opacity: 0.5
      }} />

      {/* Header Area */}
      <div style={{ position: 'absolute', top: 80, left: 120, opacity: titleOp, transform: `translateY(${titleTy}px)` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 12 }}>
           <div style={{ width: 12, height: 48, backgroundColor: 'PRIMARY_COLOR', borderRadius: 4, boxShadow: '0 0 20px PRIMARY_COLOR' }} />
           <div style={{ fontSize: 56, fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', textTransform: 'uppercase' }}>{title}</div>
        </div>
        <div style={{ fontSize: 24, color: 'rgba(255,255,255,0.3)', fontWeight: 600, letterSpacing: '0.1em', marginLeft: 36 }}>CURRENCY_EROSION_INDEX // DECAY_MODEL_v4</div>
      </div>

      {/* KPI Stats (Heavy Glass) */}
      <div style={{ position: 'absolute', top: 220, left: 120, right: 120, display: 'flex', gap: 40, zIndex: 10 }}>
         <div style={{
             flex: 1, padding: '40px', backgroundColor: 'rgba(15, 23, 42, 0.92)', backdropFilter: 'blur(24px)',
             borderRadius: 24, border: '1px solid rgba(255,255,255,0.1)', borderLeft: '8px solid PRIMARY_COLOR',
             opacity: stat1Op, boxShadow: '0 24px 48px rgba(0,0,0,0.64)'
         }}>
            <div style={{ fontSize: 64, fontWeight: 900, color: '#fff', fontFamily: 'monospace', lineHeight: 1 }}>{stat1}</div>
            <div style={{ fontSize: 18, color: 'rgba(255,255,255,0.4)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', marginTop: 12 }}>{label1}</div>
         </div>
         <div style={{
             flex: 1, padding: '40px', backgroundColor: 'rgba(15, 23, 42, 0.92)', backdropFilter: 'blur(24px)',
             borderRadius: 24, border: '1px solid rgba(255,255,255,0.1)', borderLeft: '8px solid ACCENT_COLOR',
             opacity: stat2Op, boxShadow: '0 24px 48px rgba(0,0,0,0.64)'
         }}>
            <div style={{ fontSize: 64, fontWeight: 900, color: 'ACCENT_COLOR', fontFamily: 'monospace', lineHeight: 1 }}>{stat2}</div>
            <div style={{ fontSize: 18, color: 'rgba(255,255,255,0.4)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', marginTop: 12 }}>{label2}</div>
         </div>
      </div>

      {/* Main Chart Container */}
      <div style={{
          position: 'absolute', top: 480, left: 120, right: 120, height: 450,
          display: 'flex', alignItems: 'flex-end', gap: 20
      }}>
         {chartData.map((val, i) => {
            const barStart = chartStart + (i * 8);
            const barH = (val / maxVal) * chartH;
            const barOp = interpolate(frame, [barStart, barStart + 15], [0, 1], { extrapolateLeft: 'clamp' });
            const barSc = interpolate(frame, [barStart, barStart + 20], [0, 1], { extrapolateLeft: 'clamp', easing: Easing.out(Easing.quad) });

            return (
               <div key={i} style={{ flex: 1, height: barH, position: 'relative', opacity: barOp }}>
                  {/* Glowing Bar */}
                  <div style={{
                      position: 'absolute', bottom: 0, width: '100%', height: '100%',
                      background: 'linear-gradient(to top, PRIMARY_COLOR 0%, ACCENT_COLOR 100%)',
                      borderRadius: '8px 8px 0 0', opacity: 0.8,
                      transform: `scaleY(${barSc})`, transformOrigin: 'bottom',
                      boxShadow: '0 0 20px rgba(0,0,0,0.32)'
                  }} />
                  {/* Leading Edge Glow */}
                  <div style={{
                      position: 'absolute', bottom: barH - 4, width: '100%', height: 8,
                      backgroundColor: '#fff', borderRadius: 4, opacity: barSc > 0.9 ? 0.4 : 0,
                      boxShadow: '0 0 15px #fff'
                  }} />
               </div>
            );
         })}
      </div>

      {/* Footer System detail */}
      <div style={{ position: 'absolute', bottom: 40, left: 120, display: 'flex', alignItems: 'center', gap: 20, opacity: 0.2 }}>
         <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#fff' }} />
         <div style={{ color: '#fff', fontSize: 16, fontWeight: 500 }}>{desc}</div>
      </div>

      {/* Technical Flair Sidebar */}
      <div style={{ position: 'absolute', top: 480, right: 40, opacity: 0.1 }}>
         <div style={{ color: '#fff', fontSize: 12, fontFamily: 'monospace', writingMode: 'vertical-rl', letterSpacing: '0.3em' }}>
            INFLATION_VECTOR_MONITOR // STATUS_CRITICAL // PURCHASING_POWER_DECAY
         </div>
      </div>
    </div>
  );
};

export default AnimationComponent;