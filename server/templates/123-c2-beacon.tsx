import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

export const AnimationComponent = () => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();

  const hostName = 'HOST_NAME';
  const c2Name = 'C2_SERVER';
  const statusText = 'STATUS_TEXT';
  const ipAddress = 'IP_ADDRESS';

  // Layout parameters
  const hostX = 400;
  const c2X = 1520;
  const centerY = 500;
  const distance = c2X - hostX;

  // Timings
  const beaconInterval = Math.floor(durationInFrames / 5); // 5 beacons over 15s
  
  // Base Entrance Animation
  const entryOp = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const entryScale = interpolate(frame, [0, 20], [0.9, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  
  const statusOp = interpolate(frame, [20, 40], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const statusTy = interpolate(frame, [20, 40], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Calculate ongoing beacon logic
  const beaconCycle = frame % beaconInterval;
  
  // 1. Host emitting a radar wave outward
  const waveScale1 = interpolate(beaconCycle, [0, 45], [1, 2.5], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const waveOp1 = interpolate(beaconCycle, [0, 10, 45], [0, 0.6, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  
  const waveScale2 = interpolate((frame - 15) % beaconInterval, [0, 45], [1, 2.5], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const waveOp2 = interpolate((frame - 15) % beaconInterval, [0, 10, 45], [0, 0.4, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // 2. Data packet shooting from Host to C2
  const packetStartFrame = 15;
  const packetEndFrame = Math.floor(beaconInterval * 0.6);
  const packetProgress = interpolate(beaconCycle, [packetStartFrame, packetEndFrame], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const packetActive = beaconCycle >= packetStartFrame && beaconCycle <= packetEndFrame;
  const packetX = hostX + (distance * packetProgress);

  // 3. C2 Server glowing brightly upon receipt
  const receiptGlow = interpolate(beaconCycle, [packetEndFrame - 5, packetEndFrame, packetEndFrame + 15], [0, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Common Card Style for High Visibility
  const uiCardStyle = {
    backgroundColor: 'rgba(15, 23, 42, 0.92)', // 92% opaque - almost solid dark slate for perfect legibility
    backdropFilter: 'blur(20px)',
    borderRadius: '24px',
    boxShadow: '0 24px 64px rgba(0,0,0,0.92)', // Heavy drop shadow lifts it off the background
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px'
  };

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden', backgroundColor: 'BACKGROUND_COLOR', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* Background Grid & Decor */}
      <div style={{
        position: 'absolute', width: '100%', height: '100%',
        backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.03) 0%, transparent 60%), linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
        backgroundSize: '100% 100%, 80px 80px, 80px 80px',
      }} />

      <div style={{ opacity: entryOp, transform: `scale(${entryScale})`, width: '100%', height: '100%' }}>
        {/* Connection Line Layer */}
        <div style={{ position: 'absolute', top: centerY - 2, left: hostX, width: distance, height: 4, backgroundColor: 'rgba(255,255,255,0.1)' }} />
        
        {/* Animated Data Packet */}
        {packetActive && (
          <div style={{
            position: 'absolute', top: centerY - 4, left: packetX - 30, width: 60, height: 8,
            backgroundColor: 'PRIMARY_COLOR', borderRadius: 4,
            boxShadow: '0 0 30px 5px PRIMARY_COLOR, 0 0 10px PRIMARY_COLOR',
            opacity: 1, zIndex: 1
          }} />
        )}

        {/* --- INFECTED HOST NODE --- */}
        <div style={{ position: 'absolute', top: centerY, left: hostX, transform: 'translate(-50%, -50%)', zIndex: 2 }}>
          {/* Radar Waves */}
          <div style={{
            position: 'absolute', top: '50%', left: '50%', transform: `translate(-50%, -50%) scale(${waveScale1})`,
            width: 200, height: 200, borderRadius: '50%', border: '4px solid PRIMARY_COLOR', opacity: waveOp1, pointerEvents: 'none'
          }} />
          <div style={{
            position: 'absolute', top: '50%', left: '50%', transform: `translate(-50%, -50%) scale(${waveScale2})`,
            width: 200, height: 200, borderRadius: '50%', border: '2px solid PRIMARY_COLOR', opacity: waveOp2, pointerEvents: 'none'
          }} />

          {/* Host Card */}
          <div style={{ ...uiCardStyle, border: '2px solid PRIMARY_COLOR', width: 340, height: 340, position: 'relative' }}>
            {/* Warning Header */}
            <div style={{
              position: 'absolute', top: 0, left: 0, width: '100%', backgroundColor: 'rgba(230, 57, 70, 0.15)',
              borderBottom: '2px solid PRIMARY_COLOR', borderTopLeftRadius: 22, borderTopRightRadius: 22,
              color: 'PRIMARY_COLOR', fontSize: 16, fontWeight: 800, textAlign: 'center', padding: '12px 0',
              letterSpacing: '0.15em'
            }}>
              COMPROMISED HOST
            </div>
            
            {/* Icon/Avatar Placeholder */}
            <div style={{ width: 80, height: 80, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.05)', border: '2px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24, marginTop: 40 }}>
              <div style={{ width: 40, height: 40, backgroundColor: 'PRIMARY_COLOR', borderRadius: 8, boxShadow: '0 0 20px PRIMARY_COLOR', opacity: 0.8 }} />
            </div>

            <div style={{ color: 'rgba(255,255,255,0.95)', fontSize: 32, fontWeight: 900, marginBottom: 8, letterSpacing: '-0.02em', textAlign: 'center' }}>
              {hostName}
            </div>
            <div style={{ color: 'PRIMARY_COLOR', fontSize: 20, fontFamily: 'monospace', opacity: 0.9 }}>
              {ipAddress}
            </div>
          </div>
        </div>

        {/* --- C2 SERVER NODE --- */}
        <div style={{ position: 'absolute', top: centerY, left: c2X, transform: 'translate(-50%, -50%)', zIndex: 2 }}>
          {/* Receipt Flash Aura */}
          <div style={{
            position: 'absolute', top: '50%', left: '50%', transform: `translate(-50%, -50%)`,
            width: 380, height: 380, borderRadius: '50%', backgroundColor: 'ACCENT_COLOR', opacity: receiptGlow * 0.3,
            filter: 'blur(30px)', pointerEvents: 'none'
          }} />

          {/* C2 Card */}
          <div style={{ 
            ...uiCardStyle, 
            border: `2px solid ACCENT_COLOR`, 
            width: 340, height: 340, position: 'relative',
            boxShadow: `0 24px 64px rgba(0,0,0,0.92), 0 0 ${receiptGlow * 40}px ACCENT_COLOR` // Dynamic glow on receipt
          }}>
            {/* Server Header */}
            <div style={{
              position: 'absolute', top: 0, left: 0, width: '100%', backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderBottom: '2px solid ACCENT_COLOR', borderTopLeftRadius: 22, borderTopRightRadius: 22,
              color: 'ACCENT_COLOR', fontSize: 16, fontWeight: 800, textAlign: 'center', padding: '12px 0',
              letterSpacing: '0.15em'
            }}>
              C2 INFRASTRUCTURE
            </div>
            
            {/* Icon/Avatar Placeholder */}
            <div style={{ width: 80, height: 80, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.05)', border: '2px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24, marginTop: 40 }}>
              <div style={{ width: 40, height: 40, backgroundColor: 'ACCENT_COLOR', borderRadius: '50%', boxShadow: '0 0 20px ACCENT_COLOR', opacity: 0.8 }} />
            </div>

            <div style={{ color: 'rgba(255,255,255,0.95)', fontSize: 32, fontWeight: 900, marginBottom: 8, letterSpacing: '-0.02em', textAlign: 'center' }}>
              {c2Name}
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#2a9d5c', boxShadow: '0 0 10px #2a9d5c', opacity: receiptGlow * 0.5 + 0.5 }} />
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 18, fontFamily: 'monospace', fontWeight: 600 }}>
                {receiptGlow > 0.1 ? 'RECEIVING...' : 'LISTENING'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Terminal Status Box */}
      <div style={{
        position: 'absolute', top: 880, left: '50%', transform: `translateX(-50%) translateY(${statusTy}px)`,
        width: 1000, height: 100, backgroundColor: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.15)',
        borderLeft: '8px solid PRIMARY_COLOR', borderRadius: 12,
        display: 'flex', alignItems: 'center', padding: '0 40px',
        boxShadow: '0 32px 64px rgba(0,0,0,0.80)', opacity: statusOp, zIndex: 10
      }}>
        <div style={{ color: 'PRIMARY_COLOR', fontSize: 24, fontWeight: 900, marginRight: 24 }}>&gt;_</div>
        <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: 24, fontWeight: 500, fontFamily: 'monospace', letterSpacing: '0.02em', flex: 1 }}>
          {statusText}
        </div>
        <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 16, fontFamily: 'monospace' }}>
          INTERVAL: 3s
        </div>
      </div>

    </div>
  );
};

export default AnimationComponent;