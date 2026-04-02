import React, { useMemo } from 'react'
import { useCurrentFrame, interpolate, Easing } from 'remotion'

export const AnimationComponent = () => {
  const frame = useCurrentFrame()

  const title = "TITLE_TEXT"
  const rawMapLabels = ["MAP_LABEL_1", "MAP_LABEL_2", "MAP_LABEL_3", "MAP_LABEL_4"]
  const rawDotPositions = [
    { nx: 0.25, ny: 0.35, size: 24 }, // NA
    { nx: 0.48, ny: 0.28, size: 20 }, // EU
    { nx: 0.72, ny: 0.35, size: 28 }, // ASIA
    { nx: 0.55, ny: 0.65, size: 14 }, // AF
  ]

  const activeItems = useMemo(() => {
    return rawMapLabels
      .map((label, index) => ({ label, pos: rawDotPositions[index] }))
      .filter(item => item.label !== '' && item.label !== 'Placeholder' && item.label !== ' ')
  }, [])

  const titleOp = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const mapOp = interpolate(frame, [10, 30], [0, 1], { extrapolateLeft: 'clamp' })
  const labelOp = interpolate(frame, [50, 70], [0, 1], { extrapolateLeft: 'clamp' })

  const mapW = 1400
  const mapH = 700

  // Flat 2D World Map Path
  const worldMapPath = "M 150 180 Q 250 120 400 150 Q 450 250 350 350 Q 200 300 150 180 Z M 350 350 Q 400 450 450 550 Q 550 500 500 350 Q 450 300 350 350 Z M 650 150 Q 750 100 850 150 Q 900 250 800 300 Q 700 250 650 150 Z M 750 350 Q 800 450 900 550 Q 1000 500 950 350 Q 850 300 750 350 Z M 1050 150 Q 1150 100 1250 150 Q 1300 250 1200 300 Q 1100 250 1050 150 Z M 1150 350 Q 1200 450 1300 550 Q 1400 500 1350 350 Q 1250 300 1150 350 Z";

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', backgroundColor: 'BACKGROUND_COLOR', fontFamily: 'JetBrains Mono, monospace', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      
      {/* 16:9 Safe Container */}
      <div style={{ width: 1600, height: 900, position: 'relative' }}>
        
        {/* Tech Header */}
        <div style={{ position: 'absolute', top: 40, left: 40, opacity: titleOp }}>
          <div style={{ color: 'PRIMARY_COLOR', fontSize: 14, fontWeight: 900, letterSpacing: 6, marginBottom: 8 }}>GLOBAL_THREAT_MAP</div>
          <div style={{ color: '#fff', fontSize: 32, fontWeight: 900, textTransform: 'uppercase' }}>{title}</div>
        </div>

        {/* 2D Flat Map Container */}
        <div style={{ 
            position: 'absolute', top: 150, left: 100, width: mapW, height: mapH, 
            opacity: mapOp
        }}>
           {/* Map Grid Base */}
           <div style={{
              position: 'absolute', inset: 0,
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
              backgroundSize: '80px 80px', borderRadius: 24, border: '1px solid rgba(255,255,255,0.05)',
              backgroundColor: 'rgba(255,255,255,0.01)'
           }} />

           {/* Vector World Map */}
           <svg width={mapW} height={mapH} style={{ position: 'absolute', top: 0, left: 0 }}>
              <path d={worldMapPath} fill="rgba(255,255,255,0.02)" stroke="PRIMARY_COLOR" strokeWidth={2} opacity={0.4} />

              {/* Simple 2D Glowing Nodes */}
              {activeItems.map((item, i) => {
                const delay = 20 + i * 15;
                const dotOp = interpolate(frame, [delay, delay + 15], [0, 1], { extrapolateLeft: 'clamp' });
                const dotScale = interpolate(frame, [delay, delay + 15], [0, 1], { extrapolateLeft: 'clamp', easing: Easing.out(Easing.quad) });
                
                const pulse = interpolate(frame % 60, [0, 60], [1, 2], { extrapolateLeft: 'clamp' });
                const pulseOp = interpolate(frame % 60, [0, 60], [0.5, 0], { extrapolateLeft: 'clamp' });

                const cx = item.pos.nx * mapW;
                const cy = item.pos.ny * mapH;

                return (
                  <g key={i} opacity={dotOp} transform={`translate(${cx}, ${cy})`}>
                    {/* Flat Pulse */}
                    <circle cx={0} cy={0} r={item.pos.size * pulse} fill="none" stroke="PRIMARY_COLOR" strokeWidth={2} opacity={pulseOp} />
                    
                    {/* Solid Node */}
                    <g transform={`scale(${dotScale})`}>
                      <circle cx={0} cy={0} r={item.pos.size} fill="PRIMARY_COLOR" style={{ filter: 'drop-shadow(0 0 10px PRIMARY_COLOR)' }} />
                      <circle cx={0} cy={0} r={item.pos.size * 0.4} fill="#fff" opacity={0.8} />
                    </g>
                  </g>
                );
              })}
           </svg>
        </div>

        {/* Labels */}
        {activeItems.map((item, i) => {
          const cx = 100 + (item.pos.nx * mapW);
          const cy = 150 + (item.pos.ny * mapH);

          return (
            <div key={i} style={{ 
                position: 'absolute', top: cy + item.pos.size + 12, left: cx - 120, width: 240, 
                opacity: labelOp, display: 'flex', justifyContent: 'center'
            }}>
              <div style={{ 
                  padding: '6px 12px', backgroundColor: 'rgba(0,0,0,0.7)', 
                  backdropFilter: 'blur(5px)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 8, boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
                  textAlign: 'center'
              }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: 1 }}>{item.label}</div>
              </div>
            </div>
          );
        })}

      </div>
    </div>
  )
}

export default AnimationComponent;