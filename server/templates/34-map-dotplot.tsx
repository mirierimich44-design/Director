import React, { useMemo } from 'react'
import { useCurrentFrame, interpolate, Easing } from 'remotion'

export const AnimationComponent = () => {
  const frame = useCurrentFrame()

  const title = "TITLE_TEXT"
  const rawMapLabels = ["MAP_LABEL_1", "MAP_LABEL_2", "MAP_LABEL_3", "MAP_LABEL_4"]
  const rawDotPositions = [
    { nx: 0.18, ny: 0.35, size: 24 },
    { nx: 0.48, ny: 0.25, size: 20 },
    { nx: 0.72, ny: 0.32, size: 28 },
    { nx: 0.50, ny: 0.55, size: 18 },
  ]

  const activeItems = useMemo(() => {
    return rawMapLabels
      .map((label, index) => ({ label, pos: rawDotPositions[index] }))
      .filter(item => item.label !== '' && item.label !== 'Placeholder' && item.label !== ' ')
  }, [])

  const titleOp = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const titleTy = interpolate(frame, [0, 20], [20, 0], { extrapolateLeft: 'clamp' })
  const mapOp = interpolate(frame, [10, 30], [0, 1], { extrapolateLeft: 'clamp' })
  
  const labelOp = interpolate(frame, [60, 80], [0, 1], { extrapolateLeft: 'clamp' })

  const stadiaKey = "STADIA_API_KEY"
  const stadiaUrl = stadiaKey
    ? `https://tiles.stadiamaps.com/static/alidade_smooth_dark/0,20,1.2/1200x600@2x.png?api_key=${stadiaKey}`
    : null

  const mapX = 260
  const mapY = 180
  const mapW = 1400
  const mapH = 700

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', backgroundColor: '#050505', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 6, backgroundColor: 'PRIMARY_COLOR', opacity: titleOp }} />
      
      <div style={{ position: 'absolute', top: 60, left: 0, width: 1920, textAlign: 'center', opacity: titleOp, transform: `translateY(${titleTy}px)` }}>
        <span style={{ fontSize: 24, fontWeight: 800, color: 'PRIMARY_COLOR', letterSpacing: 8, textTransform: 'uppercase' }}>{title}</span>
      </div>

      {/* Map Container */}
      <div style={{ 
          position: 'absolute', top: mapY, left: mapX, width: mapW, height: mapH, 
          opacity: mapOp, borderRadius: 24, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 40px 100px rgba(0,0,0,0.5)'
      }}>
        {stadiaUrl ? (
          <img src={stadiaUrl} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(1) brightness(0.6)' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', backgroundColor: 'rgba(255,255,255,0.02)' }} />
        )}

        <svg width={mapW} height={mapH} style={{ position: 'absolute', top: 0, left: 0 }}>
          {activeItems.map((item, i) => {
            const delay = 30 + i * 10;
            const dotOp = interpolate(frame, [delay, delay + 20], [0, 1], { extrapolateLeft: 'clamp' });
            const dotScale = interpolate(frame, [delay, delay + 20], [0, 1], { extrapolateLeft: 'clamp', easing: Easing.back(1.5) });
            
            // Pulsing effect
            const pulse = interpolate(frame % 60, [0, 60], [1, 2], { extrapolateLeft: 'clamp' });
            const pulseOp = interpolate(frame % 60, [0, 60], [0.4, 0], { extrapolateLeft: 'clamp' });

            const cx = item.pos.nx * mapW;
            const cy = item.pos.ny * mapH;

            return (
              <g key={i} opacity={dotOp}>
                {/* Outer Pulse */}
                <circle cx={cx} cy={cy} r={item.pos.size * pulse} fill="none" stroke="PRIMARY_COLOR" strokeWidth={2} opacity={pulseOp} />
                
                {/* Main Dot */}
                <circle cx={cx} cy={cy} r={item.pos.size} fill="PRIMARY_COLOR" style={{ filter: 'drop-shadow(0 0 15px PRIMARY_COLOR)' }} transform={`scale(${dotScale})`} />
                <circle cx={cx} cy={cy} r={item.pos.size * 0.4} fill="#fff" opacity={0.5} />
              </g>
            );
          })}
        </svg>
      </div>

      {/* Labels */}
      {activeItems.map((item, i) => {
        const cx = mapX + item.pos.nx * mapW;
        const cy = mapY + item.pos.ny * mapH;
        return (
          <div key={i} style={{ 
              position: 'absolute', top: cy + item.pos.size + 12, left: cx - 150, width: 300, 
              textAlign: 'center', opacity: labelOp 
          }}>
            <div style={{ 
                display: 'inline-block', padding: '6px 16px', backgroundColor: 'rgba(0,0,0,0.6)', 
                backdropFilter: 'blur(10px)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)'
            }}>
              <span style={{ fontSize: 16, fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: 2 }}>{item.label}</span>
            </div>
          </div>
        );
      })}
    </div>
  )
}

export default AnimationComponent