import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

export const AnimationComponent = () => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();

  const rows = useMemo(() => [
    { src: 'SRC_IP_1', dst: 'DST_IP_1', proto: 'PROTO_1', len: 'LEN_1', info: 'INFO_1' },
    { src: 'SRC_IP_2', dst: 'DST_IP_2', proto: 'PROTO_2', len: 'LEN_2', info: 'INFO_2' },
    { src: 'SRC_IP_3', dst: 'DST_IP_3', proto: 'PROTO_3', len: 'LEN_3', info: 'INFO_3' },
    { src: 'SRC_IP_4', dst: 'DST_IP_4', proto: 'PROTO_4', len: 'LEN_4', info: 'INFO_4' },
    { src: 'SRC_IP_5', dst: 'DST_IP_5', proto: 'PROTO_5', len: 'LEN_5', info: 'INFO_5' },
    { src: 'SRC_IP_6', dst: 'DST_IP_6', proto: 'PROTO_6', len: 'LEN_6', info: 'INFO_6' },
  ], []);

  const count = rows.length;
  const startDelay = 20;
  const endDelay = 30;
  const framesPerRow = Math.floor((durationInFrames - startDelay - endDelay) / count);

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden',
      backgroundColor: 'BACKGROUND_COLOR', fontFamily: 'monospace'
    }}>
      {/* Background Tech Grid */}
      <div style={{
        position: 'absolute', width: '100%', height: '100%',
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
        backgroundSize: '120px 80px',
        opacity: 0.5
      }} />

      {/* Header UI */}
      <div style={{ position: 'absolute', top: 80, left: 100, display: 'flex', alignItems: 'center', gap: 20, zIndex: 10 }}>
          <div style={{ width: 12, height: 40, backgroundColor: 'PRIMARY_COLOR', boxShadow: '0 0 15px PRIMARY_COLOR' }} />
          <div style={{ fontSize: 32, fontWeight: 900, color: 'PRIMARY_COLOR', letterSpacing: '0.1em' }}>PACKET_CAPTURE_SUBSYSTEM</div>
          <div style={{ marginLeft: 40, padding: '4px 12px', border: '1px solid #2a9d5c', borderRadius: 4, color: '#2a9d5c', fontSize: 14 }}>LIVE_FEED: ACTIVE</div>
      </div>

      {/* Column Headers */}
      <div style={{ 
        position: 'absolute', top: 180, left: 100, width: 1720, height: 40, 
        display: 'flex', alignItems: 'center', padding: '0 32px', color: 'rgba(255,255,255,0.3)',
        fontSize: 16, fontWeight: 800, borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div style={{ width: '20%' }}>SOURCE_IP</div>
        <div style={{ width: '20%' }}>DESTINATION_IP</div>
        <div style={{ width: '15%' }}>PROTOCOL</div>
        <div style={{ width: '10%' }}>LENGTH</div>
        <div style={{ width: '35%' }}>TECHNICAL_INFO</div>
      </div>

      {/* Capture Stream Container */}
      <div style={{
        position: 'absolute', top: 240, left: 100, width: 1720, height: 740,
        display: 'flex', flexDirection: 'column', gap: '8px'
      }}>
        {rows.map((row, i) => {
          const appearFrame = startDelay + (i * framesPerRow);
          const op = interpolate(frame, [appearFrame, appearFrame + 10], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          const tx = interpolate(frame, [appearFrame, appearFrame + 15], [-20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          
          const isActive = frame >= appearFrame;
          const isScanning = frame >= appearFrame && frame < appearFrame + 20;

          // Placeholder handling
          const src = row.src.startsWith('SRC_') ? `10.0.0.${100+i}` : row.src;
          const dst = row.dst.startsWith('DST_') ? `172.16.4.${20+i}` : row.dst;
          const proto = row.proto.startsWith('PROTO_') ? (i % 2 === 0 ? 'TCP' : 'UDP') : row.proto;
          const len = row.len.startsWith('LEN_') ? (64 + i * 12).toString() : row.len;
          const info = row.info.startsWith('INFO_') ? `Packet ${i+1}: Synthetic network trace data` : row.info;

          // Determine protocol color
          const isTCP = proto.toUpperCase().includes('TCP');
          const color = isTCP ? 'PRIMARY_COLOR' : 'ACCENT_COLOR';

          return (
            <div key={i} style={{
              width: '100%', height: '70px',
              backgroundColor: isActive ? 'rgba(15, 23, 42, 0.92)' : 'transparent',
              backdropFilter: 'blur(20px)',
              borderRadius: '8px', border: `1px solid ${isScanning ? color : 'rgba(255,255,255,0.05)'}`,
              display: 'flex', alignItems: 'center', padding: '0 32px',
              opacity: op, transform: `translateX(${tx}px)`,
              boxShadow: isScanning ? `0 0 20px ${color}22` : 'none',
              transition: 'border 0.3s, background-color 0.3s'
            }}>
              <div style={{ width: '20%', color: isScanning ? '#fff' : 'rgba(255,255,255,0.7)', fontSize: 20 }}>{src}</div>
              <div style={{ width: '20%', color: isScanning ? '#fff' : 'rgba(255,255,255,0.7)', fontSize: 20 }}>{dst}</div>
              <div style={{ width: '15%', color: color, fontWeight: 900, fontSize: 20 }}>{proto}</div>
              <div style={{ width: '10%', color: 'rgba(255,255,255,0.5)', fontSize: 20 }}>{len}</div>
              <div style={{ width: '35%', color: 'rgba(255,255,255,0.9)', fontSize: 20, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{info}</div>
            </div>
          );
        })}
      </div>

      {/* Footer System Status */}
      <div style={{ position: 'absolute', bottom: 40, right: 100, color: 'rgba(255,255,255,0.1)', fontSize: 14, textAlign: 'right' }}>
        INTERFACE: eth0 // PROMISCUOUS_MODE: ON<br />
        FILTER: tcp or udp or icmp
      </div>
    </div>
  );
};

export default AnimationComponent;