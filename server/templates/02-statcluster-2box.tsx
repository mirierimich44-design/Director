import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, Easing } from 'remotion';

export const AnimationComponent = () => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();

  const title = "TITLE_TEXT";
  const stat1 = "STAT_VALUE_1";
  const label1 = "LABEL_1";
  const sub1 = "SUB_1";
  const stat2 = "STAT_VALUE_2";
  const label2 = "LABEL_2";
  const sub2 = "SUB_2";

  // Entrance Timings
  const entryStart = 10;
  
  // Header
  const headerOp = interpolate(frame, [entryStart, entryStart + 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const headerTy = interpolate(frame, [entryStart, entryStart + 20], [30, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.quad) });

  // Left Card
  const leftStart = entryStart + 20;
  const leftOp = interpolate(frame, [leftStart, leftStart + 20], [0, 1], { extrapolateLeft: 'clamp' });
  const leftScale = interpolate(frame, [leftStart, leftStart + 25], [0.9, 1], { extrapolateLeft: 'clamp', easing: Easing.backOut });
  const leftTy = interpolate(frame, [leftStart, leftStart + 25], [40, 0], { extrapolateLeft: 'clamp', easing: Easing.out(Easing.quad) });

  // Right Card
  const rightStart = entryStart + 35;
  const rightOp = interpolate(frame, [rightStart, rightStart + 20], [0, 1], { extrapolateLeft: 'clamp' });
  const rightScale = interpolate(frame, [rightStart, rightStart + 25], [0.9, 1], { extrapolateLeft: 'clamp', easing: Easing.backOut });
  const rightTy = interpolate(frame, [rightStart, rightStart + 25], [40, 0], { extrapolateLeft: 'clamp', easing: Easing.out(Easing.quad) });

  // Content inside cards
  const contentOp = interpolate(frame, [entryStart + 50, entryStart + 70], [0, 1], { extrapolateLeft: 'clamp' });

  // Technical Card Style
  const glassStyle = {
    flex: 1,
    height: 500,
    backgroundColor: 'rgba(15, 23, 42, 0.92)',
    backdropFilter: 'blur(32px)',
    borderRadius: 40,
    border: '1px solid rgba(255,255,255,0.1)',
    boxShadow: '0 40px 100px rgba(0,0,0,0.92)',
    padding: '60px',
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'center',
    position: 'relative' as const,
    overflow: 'hidden' as const
  };

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden',
      backgroundColor: 'BACKGROUND_COLOR', fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      {/* Background Decor */}
      <div style={{
        position: 'absolute', width: '100%', height: '100%',
        backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.02) 0%, transparent 80%), linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
        backgroundSize: '100% 100%, 80px 80px, 80px 80px',
        opacity: 0.5
      }} />

      {/* Header Area */}
      <div style={{ 
        position: 'absolute', top: 100, left: '50%', transform: `translateX(-50%) translateY(${headerTy}px)`, 
        textAlign: 'center', opacity: headerOp, zIndex: 10 
      }}>
        <div style={{ fontSize: 24, fontWeight: 900, color: 'PRIMARY_COLOR', letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: 12 }}>{title}</div>
        <div style={{ width: 100, height: 4, backgroundColor: 'ACCENT_COLOR', margin: '0 auto', borderRadius: 2, boxShadow: '0 0 15px ACCENT_COLOR' }} />
      </div>

      {/* Stat Cluster Container */}
      <div style={{
        position: 'absolute', top: 280, left: 160, right: 160,
        display: 'flex', gap: 60, zIndex: 5
      }}>
        
        {/* Left Stat Card */}
        <div style={{
          ...glassStyle,
          borderTop: '8px solid PRIMARY_COLOR',
          opacity: leftOp,
          transform: `scale(${leftScale}) translateY(${leftTy}px)`
        }}>
           <div style={{ position: 'absolute', top: 0, right: 0, width: 300, height: 300, background: 'radial-gradient(circle, PRIMARY_COLOR 0%, transparent 70%)', opacity: 0.1 }} />
           <div style={{ color: 'PRIMARY_COLOR', fontSize: 130, fontWeight: 900, fontFamily: 'monospace', lineHeight: 1, letterSpacing: '-0.05em', marginBottom: 20, zIndex: 1 }}>{stat1}</div>
           <div style={{ color: '#fff', fontSize: 36, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12, opacity: contentOp }}>{label1}</div>
           <div style={{ height: 2, width: 60, backgroundColor: 'rgba(255,255,255,0.1)', marginBottom: 16, opacity: contentOp }} />
           <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 22, fontWeight: 500, lineHeight: 1.4, opacity: contentOp }}>{sub1}</div>
        </div>

        {/* Right Stat Card */}
        <div style={{
          ...glassStyle,
          borderTop: '8px solid ACCENT_COLOR',
          opacity: rightOp,
          transform: `scale(${rightScale}) translateY(${rightTy}px)`
        }}>
           <div style={{ position: 'absolute', top: 0, right: 0, width: 300, height: 300, background: 'radial-gradient(circle, ACCENT_COLOR 0%, transparent 70%)', opacity: 0.1 }} />
           <div style={{ color: 'ACCENT_COLOR', fontSize: 130, fontWeight: 900, fontFamily: 'monospace', lineHeight: 1, letterSpacing: '-0.05em', marginBottom: 20, zIndex: 1 }}>{stat2}</div>
           <div style={{ color: '#fff', fontSize: 36, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12, opacity: contentOp }}>{label2}</div>
           <div style={{ height: 2, width: 60, backgroundColor: 'rgba(255,255,255,0.1)', marginBottom: 16, opacity: contentOp }} />
           <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 22, fontWeight: 500, lineHeight: 1.4, opacity: contentOp }}>{sub2}</div>
        </div>

      </div>

      {/* Decorative Technical Flair */}
      <div style={{ position: 'absolute', bottom: 60, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 40, opacity: 0.2 }}>
        <div style={{ color: '#fff', fontFamily: 'monospace', fontSize: 14 }}>METRIC_01_VAL: LOCKED</div>
        <div style={{ color: '#fff', fontFamily: 'monospace', fontSize: 14 }}>METRIC_02_VAL: LOCKED</div>
        <div style={{ color: '#fff', fontFamily: 'monospace', fontSize: 14 }}>SESSION_ID: 0xFD42</div>
      </div>

    </div>
  );
};

export default AnimationComponent;