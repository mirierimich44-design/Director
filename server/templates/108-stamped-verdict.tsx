import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, Easing } from 'remotion';

export const AnimationComponent = () => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();

  const stampText = 'STAMP_TEXT';
  const subText = 'SUB_TEXT';
  const dateText = 'DATE_TEXT';
  const idText = 'ID_TEXT';

  // --- Stamp Impact Logic ---
  const impactFrame = 40;
  
  // Bounce/Slam animation (scale 4x down to 1x)
  const stampScale = interpolate(
    frame, 
    [impactFrame, impactFrame + 6, impactFrame + 12], 
    [4, 0.9, 1], 
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  
  const stampOp = interpolate(frame, [impactFrame, impactFrame + 3], [0, 1], { extrapolateLeft: 'clamp' });
  const stampRotate = interpolate(frame, [impactFrame, impactFrame + 12], [-15, -8], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Screen shake on impact
  const shake = frame >= impactFrame && frame < impactFrame + 10 
    ? (Math.sin(frame * 2) * 5) 
    : 0;

  // Flash on impact
  const flashOp = interpolate(frame, [impactFrame, impactFrame + 2, impactFrame + 15], [0, 0.5, 0], { extrapolateLeft: 'clamp' });

  // Background Entrance
  const entryOp = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp' });
  const contentOp = interpolate(frame, [impactFrame + 20, impactFrame + 40], [0, 1], { extrapolateLeft: 'clamp' });

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden',
      backgroundColor: 'BACKGROUND_COLOR', fontFamily: 'Inter, system-ui, sans-serif',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      transform: `translateX(${shake}px) translateY(${shake}px)`
    }}>
      
      {/* Technical Background Decor */}
      <div style={{
        position: 'absolute', width: '100%', height: '100%',
        backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.02) 0%, transparent 80%), linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
        backgroundSize: '100% 100%, 80px 80px, 80px 80px',
        opacity: 0.4
      }} />

      {/* Main Base Card (Heavy Glass) */}
      <div style={{
        position: 'relative', width: 1400, height: 800,
        backgroundColor: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(24px)',
        borderRadius: 32, border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 40px 100px rgba(0,0,0,0.6)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        opacity: entryOp, overflow: 'hidden'
      }}>
        
        {/* Forensic Header Tags */}
        <div style={{ position: 'absolute', top: 60, left: 60, display: 'flex', gap: 20, opacity: contentOp }}>
           <div style={{ padding: '8px 16px', border: '1px solid PRIMARY_COLOR', color: 'PRIMARY_COLOR', borderRadius: 4, fontFamily: 'monospace', fontWeight: 800, fontSize: 14 }}>AUTH: VERIFIED</div>
           <div style={{ padding: '8px 16px', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.3)', borderRadius: 4, fontFamily: 'monospace', fontWeight: 800, fontSize: 14 }}>FILE_REF: {idText}</div>
        </div>

        {/* The Massive Stamp Text */}
        <div style={{
            transform: `scale(${stampScale}) rotate(${stampRotate}deg)`,
            opacity: stampOp, zIndex: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
            <div style={{
                border: '14px solid PRIMARY_COLOR',
                padding: '30px 80px',
                borderRadius: 20,
                color: 'PRIMARY_COLOR',
                fontSize: 160,
                fontWeight: 900,
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                lineHeight: 1,
                boxShadow: '0 0 50px rgba(0,0,0,0.5), inset 0 0 30px PRIMARY_COLOR33',
                textShadow: '4px 6px 15px rgba(0,0,0,0.4)',
                backgroundColor: 'rgba(0,0,0,0.1)',
                backdropFilter: 'blur(4px)'
            }}>
                {stampText}
            </div>
        </div>

        {/* Resulting Subtext and Date */}
        <div style={{ marginTop: 80, textAlign: 'center', opacity: contentOp }}>
           <div style={{ fontSize: 36, fontWeight: 700, color: '#fff', marginBottom: 16 }}>{subText}</div>
           <div style={{ height: 2, width: 80, backgroundColor: 'rgba(255,255,255,0.1)', margin: '0 auto 20px' }} />
           <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 24, fontWeight: 600, fontFamily: 'monospace', letterSpacing: '0.1em' }}>
              TIMESTAMP: {dateText}
           </div>
        </div>

        {/* Forensic detail tag */}
        <div style={{ position: 'absolute', bottom: 40, right: 60, opacity: 0.1 }}>
           <div style={{ color: '#fff', fontSize: 12, fontFamily: 'monospace', textAlign: 'right' }}>
              VERDICT_ALGORITHM: v2.1-SECURE<br />
              EXECUTION_BY: SYSTEM_AUTO
           </div>
        </div>

      </div>

      {/* Impact Flash */}
      <div style={{
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
        backgroundColor: 'PRIMARY_COLOR', opacity: flashOp, pointerEvents: 'none', zIndex: 100
      }} />

    </div>
  );
};

export default AnimationComponent;