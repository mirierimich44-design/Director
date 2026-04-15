import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, Easing } from 'remotion';

export const AnimationComponent = () => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();

  const steps = useMemo(() => [
    { title: 'STEP_TITLE_1', body: 'STEP_BODY_1' },
    { title: 'STEP_TITLE_2', body: 'STEP_BODY_2' },
    { title: 'STEP_TITLE_3', body: 'STEP_BODY_3' },
    { title: 'STEP_TITLE_4', body: 'STEP_BODY_4' }
  ].filter(s => s.title !== '' && s.title !== ' ' && !s.title.includes('STEP_TITLE')), [
    'STEP_TITLE_1', 'STEP_BODY_1', 'STEP_TITLE_2', 'STEP_BODY_2', 
    'STEP_TITLE_3', 'STEP_BODY_3', 'STEP_TITLE_4', 'STEP_BODY_4'
  ]);

  // If filtered out by placeholder logic but we want to show something during dev
  const activeSteps = steps.length > 0 ? steps : [
      { title: 'STRATEGIC_PLANNING', body: 'Initial phase involving stakeholder alignment and objective definition.' },
      { title: 'DATA_ACQUISITION', body: 'Harvesting raw intelligence from distributed network nodes.' },
      { title: 'ALGORITHMIC_ANALYSIS', body: 'Processing datasets through proprietary neural pathways.' },
      { title: 'OPERATIONAL_DEPLOYMENT', body: 'Final execution of verified strategic protocols.' }
  ];

  const glassStyle: React.CSSProperties = {
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '24px',
    padding: '40px',
    boxShadow: '0 20px 50px rgba(0,0,0,0.92)',
    position: 'relative',
    transition: 'all 0.3s ease-out'
  }

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden', backgroundColor: 'BACKGROUND_COLOR', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* Background Decor */}
      <div style={{
        position: 'absolute', width: '100%', height: '100%',
        backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.02) 0%, transparent 80%), linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
        backgroundSize: '100% 100%, 80px 80px, 80px 80px',
        opacity: 0.5
      }} />

      {/* Header UI */}
      <div style={{ position: 'absolute', top: 60, left: 100, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ width: 8, height: 40, backgroundColor: 'PRIMARY_COLOR', borderRadius: 4, boxShadow: '0 0 15px PRIMARY_COLOR' }} />
            <div style={{ fontSize: 32, fontWeight: 900, color: 'PRIMARY_COLOR', letterSpacing: '0.1em', textTransform: 'uppercase' }}>PROCESS_WORKFLOW</div>
        </div>
      </div>

      {/* Vertical Timeline Thread */}
      <div style={{ position: 'absolute', top: 180, bottom: 80, left: 140, width: 2, backgroundColor: 'rgba(255,255,255,0.1)', zIndex: 1 }} />

      {/* Steps Container */}
      <div style={{ position: 'absolute', top: 180, left: 100, right: 100, bottom: 80, display: 'flex', flexDirection: 'column', gap: 20, zIndex: 5 }}>
        {activeSteps.map((step, i) => {
            const stepStart = 10 + (i * 45);
            
            // Entrance
            const op = interpolate(frame, [stepStart, stepStart + 25], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
            const tx = interpolate(frame, [stepStart, stepStart + 25], [50, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.quad) });
            
            // Activity State (High-lighting current)
            const isLast = i === activeSteps.length - 1;
            const nextStart = stepStart + 45;
            const isActive = frame >= stepStart && (isLast ? true : frame < nextStart);
            const isPast = frame >= nextStart && !isLast;
            
            return (
                <div key={i} style={{ 
                    display: 'flex', 
                    gap: 40, 
                    opacity: op, 
                    transform: `translateX(${tx}px)`,
                    filter: `grayscale(${isPast ? 0.8 : 0})`,
                    minHeight: 180 // Ensure consistent row height
                }}>
                    {/* Number Circle */}
                    <div style={{ 
                        width: 80, height: 80, borderRadius: '50%', 
                        backgroundColor: isActive ? 'PRIMARY_COLOR' : 'rgba(255,255,255,0.05)',
                        border: `2px solid ${isActive ? 'ACCENT_COLOR' : 'rgba(255,255,255,0.1)'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 32, fontWeight: 900, color: isActive ? '#000' : 'rgba(255,255,255,0.3)',
                        boxShadow: isActive ? '0 0 30px PRIMARY_COLOR' : 'none',
                        flexShrink: 0, zIndex: 10,
                        transition: 'all 0.3s ease-out',
                        marginTop: 10
                    }}>
                        {i + 1}
                    </div>

                    {/* Content Card */}
                    <div style={{ 
                        ...glassStyle, 
                        flex: 1, 
                        borderLeft: `8px solid ${isActive ? 'PRIMARY_COLOR' : 'rgba(255,255,255,0.1)'}`,
                        opacity: isPast ? 0.5 : 1,
                        transform: isActive ? 'scale(1.01)' : 'scale(1)',
                        padding: '30px 40px'
                    }}>
                        <div style={{ position: 'absolute', top: 20, right: 30, color: 'rgba(255,255,255,0.05)', fontFamily: 'monospace', fontSize: 14 }}>NODE_REF: 0x0{i+1}</div>
                        <div style={{ fontSize: 14, color: 'ACCENT_COLOR', fontWeight: 900, letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: 8 }}>{step.title}</div>
                        <div style={{ fontSize: 24, fontWeight: 800, color: '#fff', letterSpacing: '0.02em', marginBottom: 12 }}>{step.title}</div>
                        <div style={{ fontSize: 20, color: 'rgba(255,255,255,0.7)', lineHeight: 1.5, fontWeight: 400 }}>{step.body}</div>
                    </div>
                </div>
            );
        })}
      </div>

      {/* Forensic Detail */}
      <div style={{ position: 'absolute', bottom: 40, right: 60, opacity: 0.2, textAlign: 'right' }}>
         <div style={{ color: 'PRIMARY_COLOR', fontSize: 12, fontFamily: 'monospace' }}>
            NARRATIVE_FLOW: ACTIVE<br />
            STEPS_MAPPED: {activeSteps.length}<br />
            STATUS: REALTIME_UPDATE
         </div>
      </div>

    </div>
  );
};

export default AnimationComponent;