import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

export const AnimationComponent = () => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames, fps } = useVideoConfig();

  const title = 'TITLE_TEXT';
  const footer = 'FOOTER_TEXT';
  const rawSteps = ['STEP_1', 'STEP_2', 'STEP_3', 'STEP_4', 'STEP_5', 'STEP_6', 'STEP_7'];
  
  const steps = useMemo(() => {
    const filled = rawSteps.filter(s => s !== '' && s !== ' ' && !s.startsWith('STEP_'));
    return filled.length > 0 ? filled : ["Reconnaissance", "Weaponization", "Delivery", "Exploitation", "Installation", "C2", "Actions"];
  }, []);

  const count = steps.length;

  // Layout parameters
  const startX = 180;
  const endX = 1740;
  const totalW = endX - startX;
  const centerY = 480;
  const nodeSize = 160;

  // Timing configuration
  const startDelay = 20;
  const endDelay = 40;
  const availableFrames = durationInFrames - startDelay - endDelay;
  const framesPerStep = Math.floor(availableFrames / count);

  // Entrance Animations
  const titleOp = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const titleTy = interpolate(frame, [0, 20], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden',
      backgroundColor: 'BACKGROUND_COLOR',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      {/* Background Decor */}
      <div style={{
        position: 'absolute', width: '100%', height: '100%',
        backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.02) 0%, transparent 80%), linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
        backgroundSize: '100% 100%, 80px 80px, 80px 80px',
        opacity: 0.5
      }} />

      {/* Header */}
      <div style={{ position: 'absolute', top: 80, left: 100, opacity: titleOp, transform: `translateY(${titleTy}px)`, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <div style={{ width: 12, height: 48, backgroundColor: 'PRIMARY_COLOR', borderRadius: 4, boxShadow: '0 0 20px PRIMARY_COLOR' }} />
          <div style={{ fontSize: 48, fontWeight: 900, color: '#fff', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            {title}
          </div>
        </div>
        <div style={{ fontSize: 24, color: 'SUPPORT_COLOR', marginLeft: 36, marginTop: 4, fontWeight: 600, letterSpacing: '0.05em' }}>
          CYBER_KILL_CHAIN_PROGRESSION
        </div>
      </div>

      {/* Connection Track Layer */}
      <div style={{ position: 'absolute', top: centerY - 6, left: startX, width: totalW, height: 12, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 6, zIndex: 1 }} />
      <div style={{ 
        position: 'absolute', top: centerY - 6, left: startX, 
        width: interpolate(frame, [startDelay, durationInFrames - endDelay], [0, totalW], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }), 
        height: 12, backgroundColor: 'PRIMARY_COLOR', borderRadius: 6, zIndex: 1,
        boxShadow: '0 0 20px PRIMARY_COLOR'
      }} />

      {/* Steps Layer */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 2 }}>
        {steps.map((step, i) => {
          const x = startX + (count > 1 ? (totalW / (count - 1)) * i : totalW / 2);
          const appearFrame = startDelay + (i * framesPerStep);
          
          const op = interpolate(frame, [appearFrame, appearFrame + 15], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          const sc = interpolate(frame, [appearFrame, appearFrame + 15], [0.8, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          const cardTy = interpolate(frame, [appearFrame + 5, appearFrame + 20], [30, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

          const isActive = frame >= appearFrame;

          return (
            <React.Fragment key={i}>
              {/* Step Circle Node */}
              <div style={{
                position: 'absolute', top: centerY, left: x, transform: `translate(-50%, -50%) scale(${sc})`,
                width: nodeSize, height: nodeSize, borderRadius: '50%',
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                border: `6px solid ${isActive ? 'PRIMARY_COLOR' : 'rgba(255,255,255,0.1)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: isActive ? `0 0 40px ${'PRIMARY_COLOR'}44, inset 0 0 20px ${'PRIMARY_COLOR'}22` : 'none',
                opacity: op, zIndex: 3, transition: 'border-color 0.3s'
              }}>
                <div style={{ color: isActive ? 'PRIMARY_COLOR' : 'rgba(255,255,255,0.2)', fontSize: 64, fontWeight: 900, fontFamily: 'monospace' }}>
                  {i + 1}
                </div>
                {/* Internal Pulsing Ring */}
                {isActive && (
                   <div style={{
                     position: 'absolute', width: '100%', height: '100%', borderRadius: '50%',
                     border: '2px solid PRIMARY_COLOR',
                     opacity: interpolate(frame % 30, [0, 30], [0.6, 0]),
                     transform: `scale(${interpolate(frame % 30, [0, 30], [1, 1.3])})`
                   }} />
                )}
              </div>

              {/* Step Label Card */}
              <div style={{
                position: 'absolute', top: centerY + 120, left: x, transform: `translateX(-50%) translateY(${cardTy}px)`,
                width: 220, padding: '24px 20px',
                backgroundColor: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(16px)',
                borderRadius: 16, border: `1px solid ${isActive ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.05)'}`,
                boxShadow: '0 20px 40px rgba(0,0,0,0.80)', opacity: op,
                textAlign: 'center', borderTop: `4px solid ${isActive ? 'PRIMARY_COLOR' : 'transparent'}`
              }}>
                <div style={{
                  color: isActive ? 'PRIMARY_COLOR' : 'rgba(255,255,255,0.4)',
                  fontSize: 14, fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 8
                }}>
                  PHASE 0{i + 1}
                </div>
                <div style={{
                  color: 'rgba(255,255,255,0.95)', fontSize: 22, fontWeight: 700, lineHeight: 1.2
                }}>
                  {step}
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {/* Footer Info Box */}
      <div style={{
        position: 'absolute', bottom: 60, left: '50%', transform: 'translateX(-50%)',
        width: 1000, height: 80, backgroundColor: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(20px)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        opacity: interpolate(frame, [durationInFrames - 60, durationInFrames - 40], [0, 1], { extrapolateLeft: 'clamp' })
      }}>
        <div style={{ color: 'ACCENT_COLOR', fontSize: 24, fontWeight: 700, letterSpacing: '0.05em' }}>
           {footer}
        </div>
      </div>
    </div>
  );
};

export default AnimationComponent;