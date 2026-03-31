import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

export const AnimationComponent = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const title = 'TITLE_TEXT';
  const ref = 'REF_NUMBER';
  const body = 'BODY_TEXT';
  const status = 'STATUS_TEXT'; // e.g., CLASSIFIED, TOP SECRET

  // 1. Base Entry Animations
  // Card enters from bottom
  const cardOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const cardTranslateY = interpolate(frame, [0, 25], [100, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  
  // Content fades in
  const contentOp = interpolate(frame, [15, 35], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // 2. Stamp Slam Animation (Replacing spring)
  const stampStart = 50;
  // Frame 50 to 56: rapid scale down from 4 to 0.9
  // Frame 56 to 62: settle from 0.9 to 1.0 (creating a bounce/slam effect)
  const stampScale = interpolate(
    frame, 
    [stampStart, stampStart + 6, stampStart + 12], 
    [4, 0.9, 1], 
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  
  const stampOp = interpolate(frame, [stampStart, stampStart + 3], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Subtle flash effect on impact to make the slam feel heavier
  const flashOp = interpolate(frame, [stampStart + 5, stampStart + 6, stampStart + 20], [0, 0.4, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // 3. UI Scanning line effect over the card
  const scanLineY = interpolate(frame, [20, 140], [-100, 1200], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden', backgroundColor: 'BACKGROUND_COLOR',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      {/* Background Decor */}
      <div style={{
        position: 'absolute', width: '100%', height: '100%',
        backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.02) 0%, transparent 80%), linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
        backgroundSize: '100% 100%, 64px 64px, 64px 64px',
      }} />

      {/* Main Document Card */}
      <div style={{
        position: 'relative', 
        width: 1200, 
        height: 760, 
        backgroundColor: 'rgba(15, 23, 42, 0.75)', // Deep technical blue
        backdropFilter: 'blur(24px)',
        borderRadius: 32,
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 32px 64px rgba(0,0,0,0.92), inset 0 1px 0 rgba(255,255,255,0.22)',
        padding: '64px 80px', 
        boxSizing: 'border-box', 
        opacity: cardOpacity, 
        transform: `translateY(${cardTranslateY}px)`,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Scanning Line */}
        <div style={{
          position: 'absolute', top: scanLineY, left: 0, width: '100%', height: 4,
          backgroundColor: 'PRIMARY_COLOR', boxShadow: '0 0 20px 4px PRIMARY_COLOR',
          opacity: 0.3, zIndex: 0
        }} />

        <div style={{ opacity: contentOp, zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid rgba(255,255,255,0.1)', paddingBottom: 32, marginBottom: 48 }}>
            <div>
              <div style={{ fontSize: 20, color: 'SUPPORT_COLOR', fontWeight: 600, letterSpacing: '0.15em', marginBottom: 12, textTransform: 'uppercase' }}>
                REF // {ref}
              </div>
              <div style={{ fontSize: 48, fontWeight: 900, color: 'PRIMARY_COLOR', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                {title}
              </div>
            </div>
            {/* Top right security badge */}
            <div style={{ padding: '12px 24px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', fontFamily: 'monospace', fontSize: 16 }}>
              AUTH: SECURE<br/>ENC: AES-256
            </div>
          </div>

          {/* Body */}
          <div style={{ fontSize: 26, lineHeight: 1.6, color: 'rgba(255,255,255,0.85)', flex: 1, whiteSpace: 'pre-wrap' }}>
            {body}
          </div>
          
          {/* Footer UI elements */}
          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 24, color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace', fontSize: 14 }}>
            <span>SYS.REQ. // 492.001</span>
            <span>END OF FILE</span>
          </div>
        </div>
      </div>

      {/* Massive Stamp Effect */}
      <div style={{
        position: 'absolute',
        top: '50%', left: '50%',
        transform: `translate(-50%, -50%) scale(${stampScale}) rotate(-8deg)`,
        opacity: stampOp,
        zIndex: 5,
        pointerEvents: 'none',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <div style={{
          border: '16px solid ACCENT_COLOR',
          borderRadius: 24,
          padding: '24px 64px',
          color: 'ACCENT_COLOR',
          fontSize: 140,
          fontWeight: 900,
          fontFamily: 'system-ui, sans-serif',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          lineHeight: 1,
          boxShadow: '0 0 60px rgba(0,0,0,0.92), inset 0 0 40px rgba(0,0,0,0.51)',
          textShadow: '2px 8px 26px rgba(0,0,0,0.77)',
          backgroundColor: 'rgba(0,0,0,0.2)', // Slight tint behind the thick stamp text
          backdropFilter: 'blur(4px)'
        }}>
          {status}
        </div>
      </div>

      {/* Flash overlay on impact */}
      <div style={{
        position: 'absolute', top: 0, left: 0, width: 1920, height: 1080,
        backgroundColor: 'ACCENT_COLOR', opacity: flashOp, zIndex: 10, mixBlendMode: 'overlay', pointerEvents: 'none'
      }} />
    </div>
  );
};

export default AnimationComponent;