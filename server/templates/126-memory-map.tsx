import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, Easing } from 'remotion';

export const AnimationComponent = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const segments = [
    { label: 'KERNEL_SPACE', color: 'PRIMARY_COLOR', size: 140, addr: '0xFFFF8000' },
    { label: 'USER_STACK', color: 'SECONDARY_COLOR', size: 160, addr: '0x7FFFFFFE' },
    { label: 'SHARED_LIBS', color: 'ACCENT_COLOR', size: 180, addr: '0x7F000000' },
    { label: 'DATA_SEGMENT', color: 'SUPPORT_COLOR', size: 120, addr: '0x00600000' },
    { label: 'HEAP_MEMORY', color: '#4fc3f7', size: 200, addr: '0x00400000' },
    { label: 'CODE_SECTION', color: 'PRIMARY_COLOR', size: 120, addr: '0x00000000' },
  ];

  const totalHeight = segments.length * (120 + 16);
  const startY = (height - totalHeight) / 2;

  return (
    <div style={{
      position: 'absolute', inset: 0, overflow: 'hidden',
      backgroundColor: '#050505', fontFamily: 'JetBrains Mono, monospace'
    }}>
      {/* Background Grid */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
        backgroundSize: '100px 100px', opacity: 0.5
      }} />

      <div style={{ position: 'absolute', top: 80, left: 160, opacity: 0.8 }}>
        <div style={{ color: 'PRIMARY_COLOR', fontSize: 18, fontWeight: 800, letterSpacing: 6, marginBottom: 8 }}>VIRTUAL_MEMORY_MAP</div>
        <div style={{ color: '#fff', fontSize: 40, fontWeight: 900 }}>SYSTEM ARCHITECTURE ANALYSIS</div>
      </div>

      {/* Memory Stack */}
      <div style={{
        position: 'absolute', top: startY, left: 400, width: 800
      }}>
        {segments.map((seg, i) => {
          const delay = i * 10;
          const op = interpolate(frame, [delay, delay + 20], [0, 1], { extrapolateLeft: 'clamp' });
          const tx = interpolate(frame, [delay, delay + 25], [100, 0], { extrapolateLeft: 'clamp', easing: Easing.out(Easing.quad) });
          const scale = interpolate(frame, [delay, delay + 25], [0.8, 1], { extrapolateLeft: 'clamp' });

          return (
            <div key={i} style={{
              height: 120, width: '100%', marginBottom: 16,
              backgroundColor: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(10px)',
              border: `1px solid rgba(255,255,255,0.1)`, borderRadius: 12,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '0 40px', opacity: op, transform: `translateX(${tx}px) scale(${scale})`,
              boxShadow: '0 10px 30px rgba(0,0,0,0.3)', position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Colored side accent */}
              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 8, backgroundColor: seg.color, boxShadow: `0 0 20px ${seg.color}` }} />
              
              <div>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, marginBottom: 4 }}>SEGMENT_ID: {i.toString().padStart(2, '0')}</div>
                <div style={{ color: '#fff', fontSize: 28, fontWeight: 800 }}>{seg.label}</div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ color: seg.color, fontSize: 20, fontWeight: 700 }}>{seg.addr}</div>
                <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, marginTop: 4 }}>READ_WRITE_EXECUTE</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Metadata Panel */}
      <div style={{
        position: 'absolute', top: 300, left: 1350, width: 400,
        padding: '40px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 24,
        border: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)'
      }}>
        <div style={{ color: 'PRIMARY_COLOR', fontSize: 14, fontWeight: 900, letterSpacing: 4, marginBottom: 24 }}>ENVIRONMENT_METRICS</div>
        
        {[1, 2, 3].map(idx => (
          <div key={idx} style={{ marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
             <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginBottom: 4 }}>METRIC_0{idx}</div>
             <div style={{ color: '#fff', fontSize: 18, fontWeight: 600 }}>SYSTEM_HEALTH: NOMINAL</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnimationComponent;