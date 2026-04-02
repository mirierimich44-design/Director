import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, Easing } from 'remotion';

export const AnimationComponent = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const title = "TITLE_TEXT";
  const kpi1Label = "KPI_LABEL_1";
  const kpi1Value = "KPI_VALUE_1";
  const kpi2Label = "KPI_LABEL_2";
  const kpi2Value = "KPI_VALUE_2";
  const summary = "SUMMARY_TEXT";

  // Entrance Timings (Fades only, no movement)
  const headerOp = interpolate(frame, [10, 40], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const kpi1Op = interpolate(frame, [30, 60], [0, 1], { extrapolateLeft: 'clamp' });
  const kpi2Op = interpolate(frame, [45, 75], [0, 1], { extrapolateLeft: 'clamp' });
  const summaryOp = interpolate(frame, [60, 90], [0, 1], { extrapolateLeft: 'clamp' });

  return (
    <div style={{
      position: 'absolute', inset: 0, overflow: 'hidden',
      backgroundColor: 'BACKGROUND_COLOR', fontFamily: 'Inter, system-ui, sans-serif',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      
      {/* 16:9 Safe Container */}
      <div style={{ width: 1600, height: 900, position: 'relative', display: 'flex', flexDirection: 'column' }}>

        {/* Header Area */}
        <div style={{ opacity: headerOp, marginBottom: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 8 }}>
             <div style={{ width: 8, height: 40, backgroundColor: 'PRIMARY_COLOR', borderRadius: 4 }} />
             <div style={{ fontSize: 44, fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', textTransform: 'uppercase' }}>{title}</div>
          </div>
          <div style={{ color: 'SUPPORT_COLOR', fontSize: 18, fontWeight: 700, letterSpacing: '0.1em', marginLeft: 28, opacity: 0.5 }}>EXECUTIVE_SUMMARY_DASHBOARD</div>
        </div>

        {/* KPI Modules Row */}
        <div style={{ display: 'flex', gap: 32, marginBottom: 32 }}>
          {/* KPI 1 */}
          <div style={{
            flex: 1, height: 220, backgroundColor: 'rgba(255, 255, 255, 0.03)', backdropFilter: 'blur(20px)',
            borderRadius: 24, border: '1px solid rgba(255,255,255,0.08)', borderTop: '4px solid PRIMARY_COLOR',
            padding: '32px 40px', opacity: kpi1Op, display: 'flex', flexDirection: 'column', justifyContent: 'center'
          }}>
             <div style={{ color: 'SUPPORT_COLOR', fontSize: 14, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 8, opacity: 0.6 }}>{kpi1Label}</div>
             <div style={{ color: 'PRIMARY_COLOR', fontSize: 72, fontWeight: 900, fontFamily: 'JetBrains Mono, monospace', lineHeight: 1 }}>{kpi1Value}</div>
          </div>

          {/* KPI 2 */}
          <div style={{
            flex: 1, height: 220, backgroundColor: 'rgba(255, 255, 255, 0.03)', backdropFilter: 'blur(20px)',
            borderRadius: 24, border: '1px solid rgba(255,255,255,0.08)', borderTop: '4px solid ACCENT_COLOR',
            padding: '32px 40px', opacity: kpi2Op, display: 'flex', flexDirection: 'column', justifyContent: 'center'
          }}>
             <div style={{ color: 'SUPPORT_COLOR', fontSize: 14, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 8, opacity: 0.6 }}>{kpi2Label}</div>
             <div style={{ color: 'ACCENT_COLOR', fontSize: 72, fontWeight: 900, fontFamily: 'JetBrains Mono, monospace', lineHeight: 1 }}>{kpi2Value}</div>
          </div>
        </div>

        {/* Summary Content Block */}
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.02)', backdropFilter: 'blur(20px)',
          borderRadius: 24, border: '1px solid rgba(255,255,255,0.05)', borderLeft: '8px solid PRIMARY_COLOR',
          padding: '48px', opacity: summaryOp, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center'
        }}>
           <div style={{ color: 'PRIMARY_COLOR', fontSize: 14, fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 20, opacity: 0.8 }}>SYSTEM_ANALYSIS_DEBRIEF</div>
           <div style={{ color: '#fff', fontSize: 26, fontWeight: 500, lineHeight: 1.5, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 8, WebkitBoxOrient: 'vertical' }}>
              {summary}
           </div>
        </div>

        {/* Footer */}
        <div style={{ position: 'absolute', bottom: 20, right: 0, opacity: 0.3 }}>
          <div style={{ color: 'SUPPORT_COLOR', fontFamily: 'monospace', fontSize: 10, textAlign: 'right' }}>
            NODE_ID: DASH_AUTO_09<br />
            STATUS: DATA_SYNC_COMPLETE
          </div>
        </div>

      </div>
    </div>
  );
};

export default AnimationComponent;