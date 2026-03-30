import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

export const AnimationComponent = () => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();

  const title = "RECORDS_COMPROMISED";
  const statStr = "STAT_VALUE_1";
  const sub1 = "SUB_1";
  const sub2 = "SUB_2";
  const label = "LABEL_1";

  // Parse the target number
  const targetNum = useMemo(() => {
    const n = parseInt(statStr.replace(/[^0-9]/g, ''));
    return isNaN(n) ? 5000000 : n;
  }, [statStr]);

  // Timings
  const startCount = 40;
  const endCount = durationInFrames - 60;
  
  const progress = interpolate(frame, [startCount, endCount], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  
  // Ease-out progress for the counter
  const easedProgress = 1 - Math.pow(1 - progress, 3);
  const currentNum = Math.floor(easedProgress * targetNum);

  // Appearance
  const entryOp = interpolate(frame, [0, 30], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const gaugeOp = interpolate(frame, [20, 50], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const detailsOp = interpolate(frame, [endCount - 10, endCount + 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Gauge parameters
  const radius = 350;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (easedProgress * circumference);

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden',
      backgroundColor: 'BACKGROUND_COLOR', fontFamily: 'Inter, system-ui, sans-serif',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      {/* Background Pulse Grid */}
      <div style={{
        position: 'absolute', width: '100%', height: '100%',
        backgroundImage: 'radial-gradient(rgba(230,57,70,0.1) 1px, transparent 1px), linear-gradient(rgba(255,255,255,0.03) 2px, transparent 2px)',
        backgroundSize: '60px 60px, 120px 120px',
        opacity: entryOp
      }} />

      {/* Main Container Card for visibility */}
      <div style={{
        position: 'relative', width: 1500, height: 850,
        backgroundColor: 'rgba(15, 23, 42, 0.9)', // Solid dark base
        backdropFilter: 'blur(30px)',
        borderRadius: 40,
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 50px 100px rgba(0,0,0,0.7)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        opacity: entryOp,
        transform: `scale(${interpolate(frame, [0, 30], [0.95, 1], { extrapolateRight: 'clamp' })})`
      }}>

        {/* Main Odometer Gauge */}
        <div style={{ position: 'relative', width: 650, height: 650, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
          <svg width="650" height="650" style={{ position: 'absolute', transform: 'rotate(-90deg)', opacity: gaugeOp }}>
            {/* Background Ring */}
            <circle cx="325" cy="325" r="280" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="30" />
            {/* Progress Ring */}
            <circle 
              cx="325" cy="325" r="280" fill="none" 
              stroke="#e63946" strokeWidth="30" 
              strokeDasharray={2 * Math.PI * 280}
              strokeDashoffset={2 * Math.PI * 280 * (1 - easedProgress)}
              strokeLinecap="round"
              style={{ filter: 'drop-shadow(0 0 20px #e63946)' }}
            />
          </svg>

          {/* Counter Content */}
          <div style={{ textAlign: 'center', zIndex: 10 }}>
            <div style={{ 
              fontSize: 20, fontWeight: 900, color: 'PRIMARY_COLOR', 
              letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: 12 
            }}>
              {title}
            </div>
            
            <div style={{ 
              fontSize: 120, fontWeight: 900, color: '#ffffff', 
              fontFamily: 'monospace', letterSpacing: '-0.03em', lineHeight: 1,
              textShadow: '0 0 30px rgba(0,0,0,0.5)'
            }}>
              {currentNum.toLocaleString()}
            </div>

            <div style={{ 
              marginTop: 32, padding: '10px 24px', backgroundColor: 'rgba(230,57,70,0.15)',
              borderRadius: 100, border: '1px solid #e63946', display: 'inline-block',
              color: '#e63946', fontSize: 18, fontWeight: 800, letterSpacing: '0.1em'
            }}>
              TOTAL EXFILTRATION DETECTED
            </div>
          </div>
        </div>

        {/* Side Metadata Details */}
        <div style={{
          width: 1200, display: 'flex', 
          justifyContent: 'space-between', opacity: detailsOp, borderTop: '1px solid rgba(255,255,255,0.1)',
          paddingTop: 30
        }}>
          <div style={{ textAlign: 'left' }}>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, textTransform: 'uppercase', marginBottom: 4 }}>{label}</div>
            <div style={{ color: 'ACCENT_COLOR', fontSize: 24, fontWeight: 800 }}>DATABASE_CLUSTERS</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, textTransform: 'uppercase', marginBottom: 4 }}>VULNERABILITY</div>
            <div style={{ color: '#ffffff', fontSize: 24, fontWeight: 800 }}>{sub1}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, textTransform: 'uppercase', marginBottom: 4 }}>TIMELINE</div>
            <div style={{ color: '#ffffff', fontSize: 24, fontWeight: 800 }}>{sub2}</div>
          </div>
        </div>
      </div>

      {/* Decorative Technical Flair outside the card */}
      <div style={{ position: 'absolute', top: 60, right: 80, textAlign: 'right', opacity: 0.2 }}>
        <div style={{ color: '#fff', fontFamily: 'monospace', fontSize: 14 }}>
          COUNT_BUFFER_OVERFLOW: FALSE<br />
          STREAM_INTEGRITY: VERIFIED<br />
          NODE_ID: 0x44A2
        </div>
      </div>
    </div>
  );
};

export default AnimationComponent;