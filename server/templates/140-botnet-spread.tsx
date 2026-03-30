import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, Easing } from 'remotion';

export const AnimationComponent = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const title = 'TITLE_TEXT';
  const stat1 = 'STAT_VALUE_1';
  const stat2 = 'STAT_VALUE_2';
  const desc = 'DESC_1';

  const nodes = useMemo(() => Array.from({ length: 14 }, (_, i) => ({
    x: 200 + (i % 5) * 380 + Math.random() * 100,
    y: 150 + Math.floor(i / 5) * 300 + Math.random() * 100,
    delay: i * 8
  })), []);

  // Animation Sequence
  const entranceStart = 10;
  const titleOp = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: 'clamp' });
  const titleTy = interpolate(frame, [0, 30], [20, 0], { extrapolateRight: 'clamp', easing: Easing.out(Easing.quad) });
  const footerOp = interpolate(frame, [60, 90], [0, 1], { extrapolateRight: 'clamp' });

  const glassStyle: React.CSSProperties = {
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '20px',
    boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
  }

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden', backgroundColor: 'BACKGROUND_COLOR', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* Background Decor */}
      <div style={{
        position: 'absolute', width: '100%', height: '100%',
        backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.02) 0%, transparent 80%), linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
        backgroundSize: '100% 100%, 80px 80px, 80px 80px',
        opacity: 0.6
      }} />

      {/* Header UI */}
      <div style={{ position: 'absolute', top: 60, left: 80, opacity: titleOp, transform: `translateY(${titleTy}px)`, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ width: 10, height: 40, backgroundColor: 'ACCENT_COLOR', borderRadius: 4, boxShadow: '0 0 15px ACCENT_COLOR' }} />
          <div style={{ fontSize: 42, fontWeight: 900, color: '#fff', letterSpacing: '0.1em', textTransform: 'uppercase', textShadow: '0 2px 20px rgba(0,0,0,0.5)' }}>{title}</div>
        </div>
        <div style={{ fontSize: 14, color: 'ACCENT_COLOR', fontWeight: 800, letterSpacing: '0.4em', textTransform: 'uppercase', marginTop: 10, marginLeft: 30 }}>BOTNET_PROPAGATION_PROTOCOL_v4</div>
      </div>
      
      <svg style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 1080 }}>
        <defs>
            <filter id="glow">
                <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
            </filter>
        </defs>

        {/* Connection Lines (Animated) */}
        {nodes.map((node, i) => {
          if (i === 0) return null;
          const prev = nodes[i-1];
          const lineOp = interpolate(frame, [node.delay, node.delay + 20], [0, 0.4], { extrapolateRight: 'clamp' });
          return (
            <line key={`l-${i}`} x1={prev.x} y1={prev.y} x2={node.x} y2={node.y} stroke="ACCENT_COLOR" strokeWidth={1} opacity={lineOp} strokeDasharray="5 5" />
          );
        })}

        {/* Node Points */}
        {nodes.map((node, i) => {
          const nodeOp = interpolate(frame, [node.delay, node.delay + 20], [0, 1], { extrapolateRight: 'clamp' });
          const rippleScale = interpolate(frame, [node.delay, node.delay + 50], [0.5, 3], { extrapolateRight: 'clamp' });
          const rippleOp = interpolate(frame, [node.delay, node.delay + 50], [0.8, 0], { extrapolateRight: 'clamp' });

          return (
            <g key={i} style={{ opacity: nodeOp }}>
              <circle cx={node.x} cy={node.y} r={15 * rippleScale} fill="none" stroke="ACCENT_COLOR" strokeWidth={2} style={{ opacity: rippleOp }} />
              <circle cx={node.x} cy={node.y} r={8} fill="ACCENT_COLOR" filter="url(#glow)">
                <animate attributeName="r" values="6;10;6" dur="2s" repeatCount="indefinite" begin={`${i * 0.1}s`} />
              </circle>
            </g>
          );
        })}
      </svg>

      {/* Footer Info Panels (Glass) */}
      <div style={{ position: 'absolute', bottom: 80, left: 80, right: 80, display: 'flex', gap: 40, opacity: footerOp, zIndex: 10 }}>
        <div style={{ ...glassStyle, flex: 1, padding: '40px', display: 'flex', alignItems: 'center', gap: 40 }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: 14, color: 'ACCENT_COLOR', fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 8 }}>PROPAGATION_INDEX</div>
                <div style={{ fontSize: 72, fontWeight: 900, color: '#fff', fontFamily: 'monospace', lineHeight: 1 }}>{stat1}</div>
            </div>
            <div style={{ width: 1, height: 80, backgroundColor: 'rgba(255,255,255,0.1)' }} />
            <div style={{ fontSize: 24, color: 'rgba(255,255,255,0.8)', fontWeight: 500, lineHeight: 1.4 }}>{desc}</div>
        </div>

        <div style={{ ...glassStyle, width: 450, padding: '40px' }}>
            <div style={{ fontSize: 14, color: 'PRIMARY_COLOR', fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 8 }}>INFECTION_COUNT</div>
            <div style={{ fontSize: 72, fontWeight: 900, color: 'PRIMARY_COLOR', fontFamily: 'monospace', lineHeight: 1 }}>{stat2}</div>
        </div>
      </div>

      {/* Forensic Detail */}
      <div style={{ position: 'absolute', top: 60, right: 80, opacity: 0.3, textAlign: 'right' }}>
         <div style={{ color: '#fff', fontSize: 12, fontFamily: 'monospace' }}>
            SPREAD_RATE: DETECTED<br />
            TARGET_NODES: {nodes.length}<br />
            STATUS: ACTIVE_THREAT
         </div>
      </div>

    </div>
  );
};

export default AnimationComponent;