import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, Img, staticFile, Easing } from 'remotion';

export const AnimationComponent = () => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();

  const name = 'SUBJECT_NAME';
  const scanType = 'SCAN_TYPE';
  const statusResult = 'STATUS_RESULT';
  const imageUrl = 'IMAGE_URL';

  // 1. Entrance
  const cardOp = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp' });
  const cardScale = interpolate(frame, [0, 25], [0.95, 1], { extrapolateLeft: 'clamp', easing: Easing.out(Easing.quad) });

  // 2. Scanning Phase (1s to 3s)
  const scanStart = 30;
  const scanEnd = 120;
  const scanPos = interpolate(frame, [scanStart, scanEnd], [0, 600], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const isScanning = frame >= scanStart && frame < scanEnd;

  // 3. Result Phase (4s onwards)
  const resultStart = scanEnd + 20;
  const resultOp = interpolate(frame, [resultStart, resultStart + 15], [0, 1], { extrapolateLeft: 'clamp' });
  const resultScale = interpolate(frame, [resultStart, resultStart + 15], [2, 1], { extrapolateLeft: 'clamp', easing: Easing.backOut });

  const isGranted = statusResult.toUpperCase().includes('GRANTED');
  const resultColor = isGranted ? '#27c93f' : '#ff5f56';

  const resolvedImageUrl = useMemo(() => {
    if (!imageUrl || imageUrl.startsWith('IMAGE_')) return null;
    if (imageUrl.startsWith('http')) return imageUrl;
    return staticFile(imageUrl);
  }, [imageUrl]);

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden',
      backgroundColor: 'BACKGROUND_COLOR', fontFamily: 'monospace',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      {/* Background Decor */}
      <div style={{
        position: 'absolute', width: '100%', height: '100%',
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
        backgroundSize: '80px 80px',
      }} />

      {/* Main Scan Panel (Heavy Glass) */}
      <div style={{
        position: 'relative', width: 1000, height: 800,
        backgroundColor: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(32px)',
        borderRadius: 32, border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 40px 100px rgba(0,0,0,0.6)',
        display: 'flex', overflow: 'hidden',
        opacity: cardOp, transform: `scale(${cardScale})`
      }}>
        
        {/* Left Side: Subject Profile */}
        <div style={{ width: 400, borderRight: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column' }}>
           <div style={{ padding: '40px', backgroundColor: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ color: 'PRIMARY_COLOR', fontSize: 14, fontWeight: 900, letterSpacing: '0.2em', marginBottom: 8 }}>SUBJECT_PROFILE</div>
              <div style={{ color: '#fff', fontSize: 24, fontWeight: 800 }}>{name}</div>
           </div>

           {/* Photo Area with Scanning Line */}
           <div style={{ flex: 1, position: 'relative', overflow: 'hidden', backgroundColor: '#000' }}>
              {resolvedImageUrl ? (
                  <Img src={resolvedImageUrl} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: isScanning ? 0.6 : 1, filter: isScanning ? 'grayscale(1) contrast(1.2)' : 'none' }} />
              ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.1)', fontSize: 100 }}>👤</div>
              )}

              {/* Dynamic Scanning Line */}
              {isScanning && (
                  <div style={{
                      position: 'absolute', top: scanPos, left: 0, width: '100%', height: 4,
                      backgroundColor: 'PRIMARY_COLOR', boxShadow: '0 0 20px 5px PRIMARY_COLOR',
                      zIndex: 10
                  }} />
              )}
           </div>
        </div>

        {/* Right Side: Scan Details & Result */}
        <div style={{ flex: 1, padding: '60px', display: 'flex', flexDirection: 'column' }}>
           <div style={{ marginBottom: 60 }}>
              <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 16, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 12 }}>BIOMETRIC_TYPE</div>
              <div style={{ color: 'PRIMARY_COLOR', fontSize: 42, fontWeight: 900 }}>{scanType}</div>
           </div>

           {/* Analysis Stream */}
           <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {['INITIATING...', 'BUFFERING...', 'MATCHING...', 'VERIFYING...'].map((step, i) => {
                  const stepOp = interpolate(frame, [scanStart + i * 20, scanStart + i * 20 + 10], [0, 1], { extrapolateLeft: 'clamp' });
                  return (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, opacity: stepOp }}>
                         <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: 'PRIMARY_COLOR' }} />
                         <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 18, fontWeight: 700 }}>{step}</div>
                      </div>
                  );
              })}
           </div>

           {/* Result Block */}
           <div style={{ 
               marginTop: 'auto', padding: '40px', backgroundColor: 'rgba(255,255,255,0.03)',
               borderRadius: 24, border: `2px solid ${frame >= resultStart ? resultColor : 'rgba(255,255,255,0.05)'}`,
               display: 'flex', flexDirection: 'column', alignItems: 'center',
               opacity: resultOp, transform: `scale(${resultScale})`,
               boxShadow: frame >= resultStart ? `0 0 30px ${resultColor}22` : 'none'
           }}>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, fontWeight: 800, marginBottom: 12 }}>SYSTEM_RESPONSE</div>
              <div style={{ color: resultColor, fontSize: 48, fontWeight: 900, letterSpacing: '0.1em' }}>{statusResult}</div>
           </div>
        </div>

      </div>

      {/* Forensic detail */}
      <div style={{ position: 'absolute', bottom: 40, right: 40, opacity: 0.2 }}>
         <div style={{ color: '#fff', fontSize: 14, fontFamily: 'monospace' }}>AUTH_NODE: DC-SERVER-04 // SECURITY_LEVEL: OMEGA</div>
      </div>

    </div>
  );
};

export default AnimationComponent;