import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, Easing } from 'remotion';

export const AnimationComponent = () => {
  const frame = useCurrentFrame();

  const lines = useMemo(() => [
    'LOG_1', 'LOG_2', 'LOG_3', 'LOG_4',
    'LOG_5', 'LOG_6', 'LOG_7', 'LOG_8'
  ].filter(l => l && l !== '' && l !== 'Placeholder'), []);

  const title = 'TITLE_TEXT';

  // Base Animations
  const bgOp = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const entryOp = interpolate(frame, [5, 25], [0, 1], { extrapolateLeft: 'clamp' });

  return (
    <div style={{
      position: 'absolute', inset: 0, overflow: 'hidden',
      backgroundColor: 'BACKGROUND_COLOR', fontFamily: 'JetBrains Mono, monospace',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      
      {/* Background Scrim */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        opacity: bgOp
      }} />

      {/* 16:9 Safe Container */}
      <div style={{ width: 1600, height: 900, position: 'relative', opacity: entryOp }}>
        
        {/* Header */}
        <div style={{ position: 'absolute', top: 40, left: 40, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 8, height: 32, backgroundColor: '#FF3B30', boxShadow: '0 0 15px #FF3B30' }} />
          <div style={{ fontSize: 28, fontWeight: 900, color: '#fff', textTransform: 'uppercase', letterSpacing: 2 }}>
            {title}
          </div>
        </div>

        {/* Log Cascade */}
        <div style={{
          position: 'absolute', top: 120, left: 40, width: 1520,
          display: 'flex', flexDirection: 'column', gap: 12
        }}>
          {lines.map((line, i) => {
            // Faster immediate start (delay 6 frames between lines)
            const start = 10 + (i * 8);
            const end = start + 12;
            const opacity = interpolate(frame, [start, end], [0, 1], { extrapolateLeft: 'clamp' });
            
            const isCritical = i >= lines.length - 2;

            return (
              <div key={i} style={{
                height: 56,
                backgroundColor: isCritical ? 'rgba(255, 59, 48, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                padding: '0 24px',
                fontSize: 20,
                color: isCritical ? '#FF3B30' : 'rgba(255,255,255,0.8)',
                border: isCritical ? '1px solid #FF3B30' : '1px solid rgba(255,255,255,0.05)',
                opacity
              }}>
                <span style={{ color: isCritical ? '#FF3B30' : 'PRIMARY_COLOR', marginRight: 16, fontWeight: 900 }}>[{i.toString().padStart(2, '0')}]</span>
                {line}
              </div>
            );
          })}
        </div>

        {/* Termination Alert */}
        <div style={{
          position: 'absolute', bottom: 40, right: 40,
          padding: '12px 24px', backgroundColor: 'rgba(255, 59, 48, 0.1)', border: '1px solid #FF3B30', borderRadius: 8,
          opacity: interpolate(frame, [100, 130], [0, 1], { extrapolateLeft: 'clamp' })
        }}>
          <div style={{ fontSize: 24, fontWeight: 900, color: '#FF3B30', textTransform: 'uppercase', letterSpacing: 4 }}>
            SYSTEM_CRITICAL_FAILURE
          </div>
        </div>

      </div>
    </div>
  );
};

export default AnimationComponent;