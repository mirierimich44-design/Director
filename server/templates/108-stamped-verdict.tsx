import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, Easing } from 'remotion';

export const AnimationComponent = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const stampText = 'STAMP_TEXT';
  const subText = 'SUB_TEXT';
  const dateText = 'DATE_TEXT';
  const idText = 'ID_TEXT';

  // --- Dynamic Font Sizing for Stamp ---
  const stampFontSize = useMemo(() => {
    const len = stampText.length;
    if (len < 8) return 140;
    if (len < 15) return 90;
    if (len < 25) return 60;
    return 40;
  }, [stampText]);

  // --- Stamp Impact Logic ---
  const impactFrame = 35;
  const stampScale = interpolate(frame, [impactFrame, impactFrame + 10], [1.5, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.quad) });
  const stampOp = interpolate(frame, [impactFrame, impactFrame + 5], [0, 1], { extrapolateLeft: 'clamp' });
  const stampRotate = -8; // Fixed subtle rotation for modern look

  // Background Entrance
  const bgOp = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp' });
  const contentOp = interpolate(frame, [impactFrame + 15, impactFrame + 30], [0, 1], { extrapolateLeft: 'clamp' });

  return (
    <div style={{
      position: 'absolute', inset: 0, overflow: 'hidden',
      backgroundColor: 'BACKGROUND_COLOR', fontFamily: 'Inter, system-ui, sans-serif',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      
      {/* Background Scrim */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        opacity: bgOp
      }} />

      {/* 16:9 Safe Container */}
      <div style={{ 
          width: 1600, height: 900, position: 'relative',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
      }}>
        
        {/* Header Tags */}
        <div style={{ position: 'absolute', top: 40, left: 40, display: 'flex', gap: 16, opacity: bgOp }}>
           <div style={{ padding: '6px 12px', border: '1px solid PRIMARY_COLOR', color: 'PRIMARY_COLOR', borderRadius: 4, fontFamily: 'monospace', fontWeight: 900, fontSize: 12 }}>VERDICT_SECURE</div>
           <div style={{ padding: '6px 12px', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.3)', borderRadius: 4, fontFamily: 'monospace', fontWeight: 800, fontSize: 12 }}>REF: {idText}</div>
        </div>

        {/* The Stamp Text (Now floating, no card) */}
        <div style={{
            transform: `scale(${stampScale}) rotate(${stampRotate}deg)`,
            opacity: stampOp, zIndex: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            maxWidth: 1400
        }}>
            <div style={{
                border: `${Math.max(6, stampFontSize * 0.1)}px solid PRIMARY_COLOR`,
                padding: '20px 60px',
                borderRadius: 12,
                color: 'PRIMARY_COLOR',
                fontSize: stampFontSize,
                fontWeight: 900,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                lineHeight: 1,
                boxShadow: '0 0 30px rgba(0,0,0,0.5)',
                backgroundColor: 'rgba(0,0,0,0.2)',
                backdropFilter: 'blur(8px)',
                textAlign: 'center',
                wordBreak: 'break-word'
            }}>
                {stampText}
            </div>
        </div>

        {/* Subtext and Date */}
        <div style={{ marginTop: 60, textAlign: 'center', opacity: contentOp }}>
           <div style={{ fontSize: 32, fontWeight: 700, color: '#fff', marginBottom: 12, maxWidth: 1000 }}>{subText}</div>
           <div style={{ height: 2, width: 60, backgroundColor: 'ACCENT_COLOR', margin: '0 auto 20px' }} />
           <div style={{ color: 'SUPPORT_COLOR', fontSize: 20, fontWeight: 600, fontFamily: 'monospace', letterSpacing: 2, opacity: 0.6 }}>
              TIMESTAMP: {dateText}
           </div>
        </div>

        {/* System info */}
        <div style={{ position: 'absolute', bottom: 40, right: 40, opacity: 0.2 }}>
           <div style={{ color: '#fff', fontSize: 10, fontFamily: 'monospace', textAlign: 'right', letterSpacing: 1 }}>
              PROTOCOL: AUTO_STAMP_v4<br />
              VERIFIED BY DIRECTOR_AI
           </div>
        </div>

      </div>
    </div>
  );
};

export default AnimationComponent;