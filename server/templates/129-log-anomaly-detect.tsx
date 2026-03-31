import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

export const AnimationComponent = () => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();

  const rawLogs = ['LOG_1', 'LOG_2', 'LOG_3', 'LOG_4', 'LOG_5', 'LOG_6', 'LOG_7', 'LOG_8'];
  const logs = useMemo(() => {
    const filled = rawLogs.filter(l => l !== '' && l !== ' ' && !l.startsWith('LOG_'));
    return filled.length > 0 ? filled : [
      "AUTH_SERVICE: Connection from 45.12.9.102",
      "SYSLOG: Received SIGTERM on PID 4401",
      "KERNEL: Memory allocation spike detected",
      "NETWORK: Packet fragmentation on eth0",
      "AUTH_SERVICE: Multiple failed logins: admin",
      "SHELL: Interactive bash session started",
      "SECURITY: UNAUTHORIZED ROOT ACCESS DETECTED",
      "EXFIL: Data stream initiated to external IP"
    ];
  }, []);

  // Timings
  const anomalyIndex = logs.length - 1;
  const startScroll = 10;
  const anomalyImpactFrame = Math.floor(durationInFrames * 0.7);
  
  // Log scrolling logic
  const scrollY = interpolate(frame, [startScroll, anomalyImpactFrame], [0, -anomalyIndex * 60], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  
  // Freeze effect at anomaly
  const isFrozen = frame >= anomalyImpactFrame;
  const anomalyOp = interpolate(frame, [anomalyImpactFrame, anomalyImpactFrame + 10], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const anomalyScale = interpolate(frame, [anomalyImpactFrame, anomalyImpactFrame + 15], [2, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Glitch effect on impact
  const glitch = frame >= anomalyImpactFrame && frame < anomalyImpactFrame + 5 ? (frame % 2 === 0 ? 5 : -5) : 0;

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden',
      backgroundColor: 'BACKGROUND_COLOR', fontFamily: 'monospace'
    }}>
      {/* Background Decor */}
      <div style={{
        position: 'absolute', width: '100%', height: '100%',
        backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(255,0,0,0.05) 0%, transparent 70%)',
        opacity: isFrozen ? 1 : 0, transition: 'opacity 0.2s'
      }} />

      {/* Terminal Container */}
      <div style={{
        position: 'absolute', top: 200, left: 100, width: 1200, height: 600,
        backgroundColor: 'rgba(15, 23, 42, 0.5)', borderRadius: 20, border: '1px solid rgba(255,255,255,0.1)',
        padding: '40px', overflow: 'hidden', transform: `translateX(${glitch}px)`
      }}>
        <div style={{ transform: `translateY(${scrollY}px)` }}>
          {logs.map((log, i) => {
            const isAnomaly = i === anomalyIndex;
            return (
              <div key={i} style={{
                height: 60, display: 'flex', alignItems: 'center', gap: 24,
                fontSize: 24, color: isAnomaly && isFrozen ? '#e63946' : 'rgba(255,255,255,0.7)',
                opacity: interpolate(frame, [startScroll + (i * 2), startScroll + (i * 2) + 5], [0, 1], { extrapolateLeft: 'clamp' })
              }}>
                <span style={{ color: 'rgba(255,255,255,0.2)' }}>[{new Date().toISOString().substring(11, 19)}.{i}42]</span>
                <span style={{ fontWeight: isAnomaly && isFrozen ? 900 : 400 }}>{log}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Anomaly Highlight Frame */}
      {isFrozen && (
        <div style={{
          position: 'absolute', top: 200 + (anomalyIndex * 60) + scrollY + 40, left: 100,
          width: 1200, height: 60, border: '4px solid #e63946', borderRadius: 4,
          boxShadow: '0 0 30px #e63946', opacity: anomalyOp, zIndex: 10,
          pointerEvents: 'none', backgroundColor: 'rgba(230, 57, 70, 0.1)'
        }} />
      )}

      {/* Forensic Intelligence Card */}
      <div style={{
        position: 'absolute', top: 200, right: 100, width: 450,
        backgroundColor: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(24px)',
        borderRadius: 24, border: '1px solid rgba(255,255,255,0.1)',
        padding: '48px', opacity: anomalyOp, transform: `scale(${anomalyScale})`,
        boxShadow: '0 32px 64px rgba(0,0,0,0.80), 0 0 20px rgba(230,57,70,0.30)',
        borderTop: '8px solid #e63946'
      }}>
        <div style={{ 
          backgroundColor: 'rgba(230,57,70,0.1)', color: '#e63946',
          padding: '8px 16px', borderRadius: 8, fontSize: 18, fontWeight: 900,
          textAlign: 'center', letterSpacing: '0.1em', marginBottom: 32
        }}>
          CRITICAL_ANOMALY_LOCATED
        </div>

        <div style={{ marginBottom: 40 }}>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, textTransform: 'uppercase', marginBottom: 8 }}>Primary Vector</div>
          <div style={{ color: '#fff', fontSize: 24, fontWeight: 700 }}>Privilege Escalation</div>
        </div>

        <div style={{ marginBottom: 40 }}>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, textTransform: 'uppercase', marginBottom: 8 }}>Target Process</div>
          <div style={{ color: 'PRIMARY_COLOR', fontSize: 22, fontWeight: 600, fontFamily: 'monospace' }}>/usr/bin/sudo</div>
        </div>

        <div style={{ height: 2, width: '100%', backgroundColor: 'rgba(255,255,255,0.1)', marginBottom: 32 }} />

        <div style={{ fontSize: 18, color: 'rgba(255,255,255,0.8)', lineHeight: 1.6 }}>
          Automated heuristic engine detected non-standard execution pattern on root-level process. 
          <span style={{ color: '#e63946', fontWeight: 700 }}> IMMEDIATE ACTION REQUIRED.</span>
        </div>
      </div>

      {/* Header UI */}
      <div style={{ position: 'absolute', top: 80, left: 100, display: 'flex', alignItems: 'center', gap: 20 }}>
        <div style={{ width: 8, height: 40, backgroundColor: isFrozen ? '#e63946' : 'PRIMARY_COLOR', boxShadow: `0 0 15px ${isFrozen ? '#e63946' : 'PRIMARY_COLOR'}` }} />
        <div style={{ fontSize: 32, fontWeight: 900, color: '#fff', letterSpacing: '0.1em' }}>FORENSIC_ANALYSIS_SUBSYSTEM</div>
      </div>
    </div>
  );
};

export default AnimationComponent;