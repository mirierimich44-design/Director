import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, Easing } from 'remotion';

export const AnimationComponent = () => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();

  const month = 'TARGET_MONTH';
  const year = 'TARGET_YEAR';
  const day = 'TARGET_DAY';
  const eventTitle = 'EVENT_TITLE';
  const eventDesc = 'EVENT_DESC';

  // 1. Rapid Flip Phase (0s to 2s)
  const flipEnd = 60;
  const flipProgress = interpolate(frame, [0, flipEnd], [0, 10], { extrapolateRight: 'clamp' });
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  
  const currentMonth = frame < flipEnd ? months[Math.floor(flipProgress) % 12] : month;
  const currentYear = frame < flipEnd ? 2020 + Math.floor(flipProgress / 3) : year;

  // 2. Landing Phase
  const isLanded = frame >= flipEnd;
  const landOp = interpolate(frame, [flipEnd, flipEnd + 10], [0.5, 1], { extrapolateLeft: 'clamp' });
  
  // 3. Date Highlight (Circle Grow)
  const highlightStart = flipEnd + 15;
  const highlightScale = interpolate(frame, [highlightStart, highlightStart + 15], [0, 1], { extrapolateLeft: 'clamp', easing: Easing.backOut });
  
  // 4. Info Card Reveal
  const cardStart = highlightStart + 20;
  // Use extrapolateRight: 'clamp' to ensure it stays at 1.0 after the animation
  const cardOp = interpolate(frame, [cardStart, cardStart + 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const cardTy = interpolate(frame, [cardStart, cardStart + 20], [40, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.quad) });

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden',
      backgroundColor: 'BACKGROUND_COLOR', fontFamily: 'Inter, system-ui, sans-serif',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      {/* Background Decor */}
      <div style={{
        position: 'absolute', width: '100%', height: '100%',
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
        backgroundSize: '120px 120px',
        opacity: 0.5
      }} />

      {/* Main Calendar Container */}
      <div style={{
        width: 800, height: 800, backgroundColor: 'rgba(255,255,255,0.95)',
        borderRadius: 32, boxShadow: '0 40px 100px rgba(0,0,0,0.92)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        // Increased the shift distance to ensure no overlap and added extrapolateRight: 'clamp'
        transform: `translateX(${interpolate(frame, [cardStart, cardStart + 20], [0, -400], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}px)`,
        opacity: landOp,
        position: 'relative',
        zIndex: 5
      }}>
         {/* Calendar Header */}
         <div style={{ height: 140, backgroundColor: '#e63946', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ color: '#fff', fontSize: 24, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em' }}>{currentYear}</div>
            <div style={{ color: '#fff', fontSize: 48, fontWeight: 800 }}>{currentMonth}</div>
         </div>

         {/* Calendar Grid */}
         <div style={{ flex: 1, padding: '40px', display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 10 }}>
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                <div key={i} style={{ textAlign: 'center', color: '#888', fontWeight: 800, fontSize: 18, marginBottom: 10 }}>{d}</div>
            ))}
            {Array.from({ length: 31 }).map((_, i) => {
                const dayNum = i + 1;
                const isTarget = isLanded && String(dayNum) === String(day);
                return (
                    <div key={i} style={{ 
                        height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 28, fontWeight: 700, color: isTarget ? '#fff' : '#222',
                        position: 'relative'
                    }}>
                       {isTarget && (
                           <div style={{ 
                               position: 'absolute', width: 70, height: 70, borderRadius: '50%', 
                               backgroundColor: '#e63946', zIndex: -1,
                               transform: `scale(${highlightScale})`,
                               boxShadow: '0 0 20px rgba(230,57,70,0.85)'
                           }} />
                       )}
                       {dayNum}
                    </div>
                );
            })}
         </div>
      </div>

      {/* Info Card (Reveals next to calendar) */}
      <div style={{
          position: 'absolute', 
          // Center-right positioning that works with the calendar's shift
          left: '55%', 
          width: 650,
          backgroundColor: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(32px)',
          borderRadius: 32, border: '1px solid rgba(255,255,255,0.1)',
          padding: '60px', boxShadow: '0 32px 64px rgba(0,0,0,0.92)',
          opacity: cardOp, 
          transform: `translateY(${cardTy}px)`,
          borderLeft: '10px solid #e63946',
          zIndex: 10,
          // Added pointerEvents to ensure it stays interactive if needed
          pointerEvents: cardOp > 0.1 ? 'auto' : 'none'
      }}>
         <div style={{ color: 'PRIMARY_COLOR', fontSize: 18, fontWeight: 900, letterSpacing: '0.15em', marginBottom: 16 }}>HISTORICAL_TIMESTAMP</div>
         <div style={{ color: '#fff', fontSize: 42, fontWeight: 900, lineHeight: 1.1, marginBottom: 24 }}>{eventTitle}</div>
         <div style={{ height: 2, width: 60, backgroundColor: 'rgba(255,255,255,0.1)', marginBottom: 24 }} />
         <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 22, lineHeight: 1.6, fontWeight: 500 }}>
            {eventDesc}
         </div>
      </div>

      {/* Forensic detail */}
      <div style={{ position: 'absolute', bottom: 40, right: 40, opacity: 0.2 }}>
         <div style={{ color: 'PRIMARY_COLOR', fontSize: 14, fontFamily: 'monospace' }}>CLOCK_SYNC: UTC+0 // STRATUM_1_VERIFIED</div>
      </div>

    </div>
  );
};

export default AnimationComponent;