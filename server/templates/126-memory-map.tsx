import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, Easing } from 'remotion';

export const AnimationComponent = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const segments = [
    { label: 'KERNEL_SPACE', color: 'PRIMARY_COLOR', addr: '0xFFFF8000' },
    { label: 'USER_STACK', color: 'SECONDARY_COLOR', addr: '0x7FFFFFFE' },
    { label: 'SHARED_LIBS', color: 'ACCENT_COLOR', addr: '0x7F000000' },
    { label: 'DATA_SEGMENT', color: 'SUPPORT_COLOR', addr: '0x00600000' },
    { label: 'HEAP_MEMORY', color: '#4fc3f7', addr: '0x00400000' },
    { label: 'CODE_SECTION', color: 'PRIMARY_COLOR', addr: '0x00000000' },
  ];

  const segH = 90;
  const segGap = 12;
  const totalHeight = segments.length * (segH + segGap);
  const startY = (height - totalHeight) / 2;

  // Base Animations
  const contentTy = 0;

  return (
    <div style={{
      position: 'absolute', inset: 0, overflow: 'hidden',
      backgroundColor: 'BACKGROUND_COLOR', fontFamily: 'JetBrains Mono, monospace',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      {/* 16:9 Safe Container */}
      <div style={{ width: 1600, height: 900, position: 'relative' }}>
        
        <div style={{ position: 'absolute', top: 40, left: 40, opacity: 0.8 }}>
          <div style={{ color: 'PRIMARY_COLOR', fontSize: 16, fontWeight: 800, letterSpacing: 6, marginBottom: 8 }}>VIRTUAL_MEMORY_MAP</div>
          <div style={{ color: 'PRIMARY_COLOR', fontSize: 32, fontWeight: 900 }}>SYSTEM ARCHITECTURE ANALYSIS</div>
        </div>

        {/* Memory Stack */}
        <div style={{
          position: 'absolute', top: (900 - totalHeight) / 2, left: 100, width: 700, overflow: 'hidden'
        }}>
          {segments.map((seg, i) => {
            const delay = i * 8;
            const op = interpolate(frame, [delay, delay + 15], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
            const tx = interpolate(frame, [delay, delay + 20], [60, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.quad) });

            return (
              <div key={i} style={{
                height: segH, width: '100%', marginBottom: segGap,
                backgroundColor: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(10px)',
                border: `1px solid rgba(255,255,255,0.1)`, borderRadius: 12,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0 32px', opacity: op, transform: `translateX(${tx}px)`,
                boxShadow: '0 10px 30px rgba(0,0,0,0.2)', position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 6, backgroundColor: seg.color }} />
                
                <div>
                  <div style={{ color: 'SUPPORT_COLOR', fontSize: 12, marginBottom: 4, opacity: 0.6 }}>SEG_ID: {i}</div>
                  <div style={{ color: 'PRIMARY_COLOR', fontSize: 24, fontWeight: 800 }}>{seg.label}</div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: seg.color, fontSize: 18, fontWeight: 700 }}>{seg.addr}</div>
                  <div style={{ color: 'SUPPORT_COLOR', fontSize: 10, marginTop: 4, opacity: 0.5 }}>RWX_MODE</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Metadata Panel */}
        <div style={{
          position: 'absolute', top: 200, right: 100, width: 340,
          padding: '32px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 20,
          border: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)'
        }}>
          <div style={{ color: 'PRIMARY_COLOR', fontSize: 12, fontWeight: 900, letterSpacing: 4, marginBottom: 24 }}>SYSTEM_METRICS</div>
          
          {[1, 2, 3].map(idx => (
            <div key={idx} style={{ marginBottom: 20, paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
               <div style={{ color: 'SUPPORT_COLOR', fontSize: 10, marginBottom: 4, opacity: 0.6 }}>METRIC_0{idx}</div>
               <div style={{ color: 'PRIMARY_COLOR', fontSize: 16, fontWeight: 600 }}>HEALTH: NOMINAL</div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default AnimationComponent;