import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, Easing } from 'remotion';

export const AnimationComponent = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const title = "TITLE_TEXT";
  const label = "LABEL_TEXT";
  const startTimeStr = "TIME_VALUE"; // e.g. "00:05:00"
  const status = "STATUS_TEXT";

  // --- Timer Logic ---
  // Parse time string to total seconds
  const totalStartSeconds = useMemo(() => {
    try {
      const parts = startTimeStr.split(':').map(Number);
      if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
      if (parts.length === 2) return parts[0] * 60 + parts[1];
      return parseInt(startTimeStr) || 300;
    } catch (e) { return 300; }
  }, [startTimeStr]);

  // Current countdown value
  const currentTotalSeconds = Math.max(0, totalStartSeconds - (frame / fps));
  
  const formatTime = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = Math.floor(totalSecs % 60);
    const ms = Math.floor((totalSecs % 1) * 100);
    
    const hStr = hrs > 0 ? `${hrs.toString().padStart(2, '0')}:` : '';
    const mStr = mins.toString().padStart(2, '0');
    const sStr = secs.toString().padStart(2, '0');
    const msStr = ms.toString().padStart(2, '0');
    
    return { main: `${hStr}${mStr}:${sStr}`, ms: msStr };
  };

  const { main, ms } = formatTime(currentTotalSeconds);

  // --- Animation States ---
  const entryOp = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  
  // Danger level based on remaining time (if less than 60s, it's urgent)
  const isUrgent = currentTotalSeconds < 60;
  const alarmPulse = Math.sin(frame / (isUrgent ? 4 : 10)) * 0.5 + 0.5;
  const alarmColor = isUrgent ? `rgba(230, 57, 70, ${0.4 + alarmPulse * 0.6})` : 'PRIMARY_COLOR';

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden',
      backgroundColor: 'BACKGROUND_COLOR', fontFamily: 'Inter, system-ui, sans-serif',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      {/* Dynamic Background Pulse Grid */}
      <div style={{
        position: 'absolute', width: '100%', height: '100%',
        backgroundImage: `radial-gradient(circle, ${isUrgent ? 'rgba(230,57,70,0.1)' : 'rgba(255,255,255,0.02)'} 1px, transparent 1px), linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)`,
        backgroundSize: '100% 100%, 80px 80px, 80px 80px',
        opacity: 0.5
      }} />

      {/* Main Countdown Panel (Heavy Glass) */}
      <div style={{
        position: 'relative', width: 1200, height: 700,
        backgroundColor: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(32px)',
        borderRadius: 40, border: `2px solid ${isUrgent && frame % 10 < 5 ? '#e63946' : 'rgba(255,255,255,0.1)'}`,
        boxShadow: `0 40px 100px rgba(0,0,0,0.92), 0 0 ${isUrgent ? 30 * alarmPulse : 0}px rgba(230,57,70,0.85)`,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        opacity: entryOp,
        overflow: 'hidden'
      }}>
        
        {/* Urgent Overlay Gradient */}
        {isUrgent && (
           <div style={{
             position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
             background: 'radial-gradient(circle, rgba(230,57,70,0.05) 0%, transparent 70%)',
             opacity: alarmPulse, pointerEvents: 'none'
           }} />
        )}

        {/* Header UI */}
        <div style={{ position: 'absolute', top: 60, width: '100%', textAlign: 'center' }}>
          <div style={{ color: alarmColor, fontSize: 20, fontWeight: 900, letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: 12 }}>{title}</div>
          <div style={{ height: 2, width: 200, backgroundColor: alarmColor, margin: '0 auto', boxShadow: `0 0 10px ${alarmColor}` }} />
        </div>

        {/* Timer Core */}
        <div style={{ textAlign: 'center', zIndex: 10 }}>
          <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 24, fontWeight: 700, letterSpacing: '0.1em', marginBottom: 20 }}>{label}</div>
          
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 20 }}>
             <div style={{ 
               fontSize: 220, fontWeight: 900, color: '#fff', 
               fontFamily: 'monospace', letterSpacing: '-0.05em', lineHeight: 0.9,
               textShadow: `0 0 40px ${isUrgent ? 'rgba(230,57,70,0.85)' : 'rgba(255,255,255,0.49)'}`
             }}>
               {main}
             </div>
             <div style={{ 
               fontSize: 80, fontWeight: 700, color: alarmColor, 
               fontFamily: 'monospace', width: 100, textAlign: 'left', opacity: 0.8
             }}>
               .{ms}
             </div>
          </div>
        </div>

        {/* Bottom Status Readout */}
        <div style={{ 
          position: 'absolute', bottom: 60, width: '80%', padding: '24px',
          backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20
        }}>
           <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: isUrgent ? '#e63946' : '#2a9d5c', animation: 'blink 1s infinite' }} />
           <div style={{ color: isUrgent ? '#e63946' : 'rgba(255,255,255,0.7)', fontSize: 24, fontWeight: 700, letterSpacing: '0.05em' }}>
             {status}
           </div>
        </div>
      </div>

      {/* Decorative Sidebar Metadata */}
      <div style={{ position: 'absolute', left: 80, top: '50%', transform: 'translateY(-50%)', opacity: 0.2 }}>
         <div style={{ color: 'PRIMARY_COLOR', fontSize: 14, fontFamily: 'monospace', writingMode: 'vertical-rl', letterSpacing: '0.5em' }}>
           SYSTEM_CLOCK_LOCKED // UTC_SYNC_VERIFIED // MODE: SECURITY_ALERT
         </div>
      </div>

      <style>{`
        @keyframes blink { 0% { opacity: 1; } 50% { opacity: 0.3; } 100% { opacity: 1; } }
      `}</style>
    </div>
  );
};

export default AnimationComponent;