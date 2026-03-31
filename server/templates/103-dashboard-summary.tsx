import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, Easing } from 'remotion';

export const AnimationComponent = () => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();

  const title = "TITLE_TEXT";
  const kpi1Label = "KPI_LABEL_1";
  const kpi1Value = "KPI_VALUE_1";
  const kpi2Label = "KPI_LABEL_2";
  const kpi2Value = "KPI_VALUE_2";
  const summary = "SUMMARY_TEXT";

  // Entrance Timings
  const entryStart = 10;
  const headerOp = interpolate(frame, [entryStart, entryStart + 40], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const headerTy = interpolate(frame, [entryStart, entryStart + 40], [30, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.quad) });

  const kpi1Start = entryStart + 20;
  const kpi1Op = interpolate(frame, [kpi1Start, kpi1Start + 40], [0, 1], { extrapolateLeft: 'clamp' });
  const kpi1Scale = interpolate(frame, [kpi1Start, kpi1Start + 50], [0.82, 1], { extrapolateLeft: 'clamp', easing: Easing.out(Easing.quad) });

  const kpi2Start = entryStart + 35;
  const kpi2Op = interpolate(frame, [kpi2Start, kpi2Start + 40], [0, 1], { extrapolateLeft: 'clamp' });
  const kpi2Scale = interpolate(frame, [kpi2Start, kpi2Start + 50], [0.82, 1], { extrapolateLeft: 'clamp', easing: Easing.out(Easing.quad) });

  const summaryStart = entryStart + 60;
  const summaryOp = interpolate(frame, [summaryStart, summaryStart + 40], [0, 1], { extrapolateLeft: 'clamp' });
  const summaryTy = interpolate(frame, [summaryStart, summaryStart + 50], [40, 0], { extrapolateLeft: 'clamp', easing: Easing.out(Easing.quad) });

  // Background Grid Pulse
  const gridOp = interpolate(Math.sin(frame / 30), [-1, 1], [0.2, 0.4]);

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden',
      backgroundColor: 'BACKGROUND_COLOR', fontFamily: 'Inter, system-ui, sans-serif',
      display: 'flex', flexDirection: 'column', padding: '80px 120px'
    }}>
      {/* Background Decor */}
      <div style={{
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
        backgroundSize: '100px 100px',
        opacity: gridOp,
        zIndex: 0
      }} />

      {/* Header Area */}
      <div style={{ opacity: headerOp, transform: `translateY(${headerTy}px)`, zIndex: 10, marginBottom: 60 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 12 }}>
           <div style={{ width: 12, height: 48, backgroundColor: 'PRIMARY_COLOR', borderRadius: 4, boxShadow: '0 0 20px PRIMARY_COLOR' }} />
           <div style={{ fontSize: 56, fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', textTransform: 'uppercase' }}>{title}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginLeft: 36 }}>
           <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#2a9d5c', boxShadow: '0 0 10px #2a9d5c' }} />
           <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 24, fontWeight: 600, letterSpacing: '0.1em' }}>EXECUTIVE_INTEL_SUMMARY_v9.2</div>
        </div>
      </div>

      {/* KPI Modules Row */}
      <div style={{ display: 'flex', gap: 40, zIndex: 5, marginBottom: 40 }}>
        {/* KPI 1 */}
        <div style={{
          flex: 1, minHeight: 280, backgroundColor: 'rgba(15, 23, 42, 0.92)', backdropFilter: 'blur(32px)',
          borderRadius: 32, border: '1px solid rgba(255,255,255,0.1)', borderTop: '6px solid PRIMARY_COLOR',
          boxShadow: '0 32px 64px rgba(0,0,0,0.92)', padding: '40px 50px',
          opacity: kpi1Op, transform: `scale(${kpi1Scale})`,
          display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', overflow: 'hidden'
        }}>
           <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 18, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 12 }}>{kpi1Label}</div>
           <div style={{ color: 'PRIMARY_COLOR', fontSize: kpi1Value.length > 8 ? 70 : 100, fontWeight: 900, fontFamily: 'monospace', lineHeight: 1, letterSpacing: '-0.05em' }}>{kpi1Value}</div>
        </div>

        {/* KPI 2 */}
        <div style={{
          flex: 1, minHeight: 280, backgroundColor: 'rgba(15, 23, 42, 0.92)', backdropFilter: 'blur(32px)',
          borderRadius: 32, border: '1px solid rgba(255,255,255,0.1)', borderTop: '6px solid ACCENT_COLOR',
          boxShadow: '0 32px 64px rgba(0,0,0,0.92)', padding: '40px 50px',
          opacity: kpi2Op, transform: `scale(${kpi2Scale})`,
          display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', overflow: 'hidden'
        }}>
           <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 18, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 12 }}>{kpi2Label}</div>
           <div style={{ color: 'ACCENT_COLOR', fontSize: kpi2Value.length > 8 ? 70 : 100, fontWeight: 900, fontFamily: 'monospace', lineHeight: 1, letterSpacing: '-0.05em' }}>{kpi2Value}</div>
        </div>
      </div>

      {/* Summary Content Block */}
      <div style={{
        backgroundColor: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(32px)',
        borderRadius: 32, border: '1px solid rgba(255,255,255,0.1)', borderLeft: '12px solid PRIMARY_COLOR',
        boxShadow: '0 32px 64px rgba(0,0,0,0.92)', padding: '50px 60px',
        opacity: summaryOp, transform: `translateY(${summaryTy}px)`,
        zIndex: 10, display: 'flex', flexDirection: 'column', justifyContent: 'center',
        flex: 1 // Take remaining space
      }}>
         <div style={{ color: 'PRIMARY_COLOR', fontSize: 18, fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 20 }}>ANALYTIC_DEBRIEF</div>
         <div style={{ color: 'rgba(255,255,255,0.95)', fontSize: summary.length > 250 ? 24 : 32, fontWeight: 500, lineHeight: 1.5 }}>
            {summary}
         </div>
      </div>

      {/* Footer Technical Detail */}
      <div style={{ position: 'absolute', bottom: 30, right: 120, textAlign: 'right', opacity: 0.15 }}>
        <div style={{ color: '#fff', fontFamily: 'monospace', fontSize: 12 }}>
          SYSTEM_ACCESS: GRANTED // NODE_STATUS: STABLE<br />
          REF: DA-772-SUMMARY-AUTO_FLOW
        </div>
      </div>
    </div>
  );
};

export default AnimationComponent;