import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

export const AnimationComponent = () => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();

  const rawItems = [
    { val: 'IOC_VAL_1', label: 'IOC_TYPE_1' },
    { val: 'IOC_VAL_2', label: 'IOC_TYPE_2' },
    { val: 'IOC_VAL_3', label: 'IOC_TYPE_3' },
    { val: 'IOC_VAL_4', label: 'IOC_TYPE_4' },
    { val: 'IOC_VAL_5', label: 'IOC_TYPE_5' },
    { val: 'IOC_VAL_6', label: 'IOC_TYPE_6' }
  ];

  const items = useMemo(() => {
    const filled = rawItems.filter(i => i.val !== '' && i.val !== ' ' && !i.val.startsWith('IOC_VAL_'));
    return filled.length > 0 ? filled : [
      { val: '192.168.1.44', label: 'MALICIOUS_IP' },
      { val: 'b5e2920...2a1b', label: 'FILE_HASH' },
      { val: 'secure-login.top', label: 'PHISHING_DOMAIN' },
      { val: '45.122.90.18', label: 'C2_INFRASTRUCTURE' },
      { val: 'powershell.exe', label: 'SUSPICIOUS_PROC' }
    ];
  }, []);

  // Map labels to colors
  const getIOCColor = (label: string) => {
    const l = label.toUpperCase();
    if (l.includes('IP') || l.includes('C2')) return '#e63946'; // Danger Red
    if (l.includes('HASH')) return '#4fc3f7'; // Tech Blue
    if (l.includes('DOMAIN') || l.includes('PHISH')) return '#f4a261'; // Warning Orange
    return 'PRIMARY_COLOR';
  };

  // Entrance
  const entryOp = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const entryTy = interpolate(frame, [0, 20], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden',
      backgroundColor: 'BACKGROUND_COLOR', fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      {/* Matrix-style Background Decor */}
      <div style={{
        position: 'absolute', width: '100%', height: '100%',
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 2px, transparent 2px), linear-gradient(90deg, rgba(255,255,255,0.02) 2px, transparent 2px)',
        backgroundSize: '120px 120px',
        opacity: 0.5
      }} />

      {/* Header */}
      <div style={{ position: 'absolute', top: 80, left: 120, opacity: entryOp, transform: `translateY(${entryTy}px)`, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <div style={{ width: 16, height: 16, borderRadius: '50%', backgroundColor: '#e63946', boxShadow: '0 0 20px #e63946' }} />
          <div style={{ fontSize: 40, fontWeight: 900, color: '#fff', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
            INTELLIGENCE_FEED
          </div>
        </div>
        <div style={{ fontSize: 20, color: 'SUPPORT_COLOR', marginLeft: 40, marginTop: 4, fontWeight: 600, fontFamily: 'monospace' }}>
          MONITORING FOR ACTIVE IOCs...
        </div>
      </div>

      {/* List Container */}
      <div style={{
        position: 'absolute', top: 220, left: 120, width: 1680, height: 800,
        display: 'flex', flexDirection: 'column', gap: '20px'
      }}>
        {items.map((item, i) => {
          const color = getIOCColor(item.label);
          const startFrame = 20 + (i * 12);
          
          const op = interpolate(frame, [startFrame, startFrame + 15], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          const tx = interpolate(frame, [startFrame, startFrame + 20], [100, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          const scale = interpolate(frame, [startFrame, startFrame + 15], [0.98, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

          // Typing effect for the value
          const charCount = item.val.length;
          const typingEnd = startFrame + 30;
          const visibleChars = Math.floor(interpolate(frame, [startFrame + 5, typingEnd], [0, charCount], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));

          return (
            <div key={i} style={{
              width: '100%', height: '110px',
              backgroundColor: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(20px)',
              borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)',
              borderLeft: `8px solid ${color}`,
              display: 'flex', alignItems: 'center', padding: '0 40px',
              opacity: op, transform: `translateX(${tx}px) scale(${scale})`,
              boxShadow: `0 12px 32px rgba(0,0,0,0.3), 0 0 15px ${color}11`
            }}>
              {/* Classification Badge */}
              <div style={{
                backgroundColor: `${color}22`, color: color,
                border: `1px solid ${color}44`, borderRadius: '8px',
                padding: '8px 20px', fontSize: '18px', fontWeight: 800,
                letterSpacing: '0.05em', marginRight: '40px', minWidth: '220px', textAlign: 'center'
              }}>
                {item.label.toUpperCase()}
              </div>

              {/* Value (Monospace) */}
              <div style={{
                fontSize: '36px', fontWeight: 700, color: 'rgba(255,255,255,0.95)',
                fontFamily: 'monospace', letterSpacing: '0.02em', flex: 1
              }}>
                {item.val.substring(0, visibleChars)}
                {visibleChars < charCount && <span style={{ opacity: frame % 10 < 5 ? 1 : 0 }}>_</span>}
              </div>

              {/* Status Indicator */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ fontSize: '16px', color: 'rgba(255,255,255,0.3)', fontWeight: 600, fontFamily: 'monospace' }}>RISK_LEVEL: HIGH</div>
                <div style={{ width: 40, height: 40, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                   <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: color, boxShadow: `0 0 10px ${color}` }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Decorative Technical Flair */}
      <div style={{ position: 'absolute', bottom: 40, left: 120, color: 'rgba(255,255,255,0.1)', fontFamily: 'monospace', fontSize: 16 }}>
        SYSTEM_ID: TR-998 // THREAT_INTEL_SUBSYSTEM // LIVE_FEED
      </div>
    </div>
  );
};

export default AnimationComponent;