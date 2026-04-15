import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, Easing } from 'remotion';

export const AnimationComponent = () => {
  const frame = useCurrentFrame();

  const title = "TITLE_TEXT";
  const stat1 = "STAT_VALUE_1";
  const label1 = "LABEL_1";
  const sub1 = "SUB_1";
  const stat2 = "STAT_VALUE_2";
  const label2 = "LABEL_2";
  const sub2 = "SUB_2";

  // Simplified fade-in animations
  const headerOp = interpolate(frame, [10, 30], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const leftOp = interpolate(frame, [20, 40], [0, 1], { extrapolateLeft: 'clamp' });
  const rightOp = interpolate(frame, [35, 55], [0, 1], { extrapolateLeft: 'clamp' });
  const contentOp = interpolate(frame, [40, 60], [0, 1], { extrapolateLeft: 'clamp' });

  const cardStyle = {
    flex: 1,
    backgroundColor: 'PANEL_RIGHT_BG',
    backdropFilter: 'blur(20px)',
    borderRadius: 24,
    border: '1px solid CHART_BORDER',
    padding: '48px',
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'center',
    position: 'relative' as const,
    overflow: 'hidden' as const
  };

  return (
    <div style={{
      position: 'absolute', inset: 0, overflow: 'hidden',
      backgroundColor: 'BACKGROUND_COLOR', fontFamily: 'Inter, system-ui, sans-serif',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      
      {/* 16:9 Safe Container */}
      <div style={{ width: 1600, height: 900, position: 'relative' }}>

        {/* Header Area */}
        <div style={{ 
          position: 'absolute', top: 60, left: 0, width: '100%',
          textAlign: 'center', opacity: headerOp
        }}>
          <div style={{ fontSize: 22, fontWeight: 900, color: 'PRIMARY_COLOR', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: 12 }}>{title}</div>
          <div style={{ width: 80, height: 3, backgroundColor: 'ACCENT_COLOR', margin: '0 auto', borderRadius: 2 }} />
        </div>

        {/* Stat Cluster Container */}
        <div style={{
          position: 'absolute', top: 220, left: 0, right: 0,
          display: 'flex', gap: 40
        }}>
          
          {/* Left Stat Card (Static fade-in) */}
          <div style={{
            ...cardStyle,
            borderTop: '6px solid PRIMARY_COLOR',
            opacity: leftOp,
          }}>
             <div style={{ color: 'PRIMARY_COLOR', fontSize: 110, fontWeight: 900, fontFamily: 'JetBrains Mono, monospace', lineHeight: 1, letterSpacing: '-0.05em', marginBottom: 16 }}>{stat1}</div>
             <div style={{ color: 'PRIMARY_COLOR', fontSize: 32, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.02em', marginBottom: 10, opacity: contentOp }}>{label1}</div>
             <div style={{ height: 1, width: 50, backgroundColor: 'rgba(255,255,255,0.1)', marginBottom: 16, opacity: contentOp }} />
             <div style={{ color: 'SUPPORT_COLOR', fontSize: 20, fontWeight: 500, lineHeight: 1.4, opacity: contentOp }}>{sub1}</div>
          </div>

          {/* Right Stat Card (Static fade-in) */}
          <div style={{
            ...cardStyle,
            borderTop: '6px solid ACCENT_COLOR',
            opacity: rightOp
          }}>
             <div style={{ color: 'ACCENT_COLOR', fontSize: 110, fontWeight: 900, fontFamily: 'JetBrains Mono, monospace', lineHeight: 1, letterSpacing: '-0.05em', marginBottom: 16 }}>{stat2}</div>
             <div style={{ color: 'PRIMARY_COLOR', fontSize: 32, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.02em', marginBottom: 10, opacity: contentOp }}>{label2}</div>
             <div style={{ height: 1, width: 50, backgroundColor: 'rgba(255,255,255,0.1)', marginBottom: 16, opacity: contentOp }} />
             <div style={{ color: 'SUPPORT_COLOR', fontSize: 20, fontWeight: 500, lineHeight: 1.4, opacity: contentOp }}>{sub2}</div>
          </div>

        </div>

        {/* Footer */}
        <div style={{ position: 'absolute', bottom: 40, left: 0, width: '100%', textAlign: 'center', opacity: 0.3 }}>
          <div style={{ color: 'SUPPORT_COLOR', fontFamily: 'monospace', fontSize: 10, letterSpacing: 2 }}>
            SESSION_ID: 0xFD42 // METRIC_DATA_LOCKED
          </div>
        </div>

      </div>
    </div>
  );
};

export default AnimationComponent;