import React, { useMemo } from 'react'
import { useCurrentFrame, interpolate, Easing } from 'remotion'

export const AnimationComponent = () => {
  const frame = useCurrentFrame()

  const title = "TITLE_TEXT"
  const rawMapLabels = ["MAP_LABEL_1", "MAP_LABEL_2", "MAP_LABEL_3", "MAP_LABEL_4"]
  const rawDotPositions = [
    { nx: 0.18, ny: 0.35, size: 20 },
    { nx: 0.48, ny: 0.25, size: 16 },
    { nx: 0.72, ny: 0.32, size: 24 },
    { nx: 0.50, ny: 0.55, size: 14 },
  ]

  const activeItems = useMemo(() => {
    return rawMapLabels
      .map((label, index) => ({ label, pos: rawDotPositions[index] }))
      .filter(item => item.label !== '' && item.label !== 'Placeholder' && item.label !== ' ')
  }, [])

  const titleOp = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const titleTy = interpolate(frame, [0, 20], [15, 0], { extrapolateLeft: 'clamp' })
  const mapOp = interpolate(frame, [10, 30], [0, 1], { extrapolateLeft: 'clamp' })
  const labelOp = interpolate(frame, [60, 80], [0, 1], { extrapolateLeft: 'clamp' })
  const contentTy = interpolate(frame, [0, 40], [20, 0], { extrapolateRight: 'clamp', easing: Easing.out(Easing.quad) });

  const stadiaKey = "STADIA_API_KEY"
  const stadiaUrl = stadiaKey
    ? `https://tiles.stadiamaps.com/static/alidade_smooth_dark/0,20,1.2/1200x550@2x.png?api_key=${stadiaKey}`
    : null

  const mapW = 1200
  const mapH = 550

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', backgroundColor: 'BACKGROUND_COLOR', fontFamily: 'Inter, system-ui, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      
      {/* 16:9 Safe Container */}
      <div style={{ width: 1600, height: 900, position: 'relative', transform: `translateY(${contentTy}px)` }}>
        
        <div style={{ position: 'absolute', top: 40, left: 0, width: '100%', textAlign: 'center', opacity: titleOp, transform: `translateY(${titleTy}px)` }}>
          <span style={{ fontSize: 24, fontWeight: 800, color: 'PRIMARY_COLOR', letterSpacing: 8, textTransform: 'uppercase' }}>{title}</span>
        </div>

        {/* Map Container */}
        <div style={{ 
            position: 'absolute', top: 150, left: (1600 - mapW) / 2, width: mapW, height: mapH, 
            opacity: mapOp, borderRadius: 20, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 30px 60px rgba(0,0,0,0.3)'
        }}>
          {stadiaUrl ? (
            <img src={stadiaUrl} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(1) brightness(0.7)' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', backgroundColor: 'rgba(255,255,255,0.02)' }} />
          )}

          <svg width={mapW} height={mapH} style={{ position: 'absolute', top: 0, left: 0 }}>
            {activeItems.map((item, i) => {
              const delay = 30 + i * 10;
              const dotOp = interpolate(frame, [delay, delay + 20], [0, 1], { extrapolateLeft: 'clamp' });
              const dotScale = interpolate(frame, [delay, delay + 20], [0, 1], { extrapolateLeft: 'clamp', easing: Easing.out(Easing.quad) });
              
              const pulse = interpolate(frame % 60, [0, 60], [1, 1.4], { extrapolateLeft: 'clamp' });
              const pulseOp = interpolate(frame % 60, [0, 60], [0.4, 0], { extrapolateLeft: 'clamp' });

              const padding = 40;
              const cx = Math.max(padding, Math.min(mapW - padding, item.pos.nx * mapW));
              const cy = Math.max(padding, Math.min(mapH - padding, item.pos.ny * mapH));

              return (
                <g key={i} opacity={dotOp}>
                  <circle cx={cx} cy={cy} r={item.pos.size * pulse} fill="none" stroke="PRIMARY_COLOR" strokeWidth={2} opacity={pulseOp} />
                  <circle cx={cx} cy={cy} r={item.pos.size} fill="PRIMARY_COLOR" style={{ filter: 'drop-shadow(0 0 10px PRIMARY_COLOR)' }} transform={`scale(${dotScale})`} />
                  <circle cx={cx} cy={cy} r={item.pos.size * 0.4} fill="#fff" opacity={0.4} />
                </g>
              );
            })}
          </svg>
        </div>

        {/* Labels */}
        {activeItems.map((item, i) => {
          const cx = (1600 - mapW) / 2 + Math.max(40, Math.min(mapW - 40, item.pos.nx * mapW));
          const cy = 150 + Math.max(40, Math.min(mapH - 40, item.pos.ny * mapH));
          return (
            <div key={i} style={{ 
                position: 'absolute', top: cy + item.pos.size + 10, left: cx - 120, width: 240, 
                textAlign: 'center', opacity: labelOp 
            }}>
              <div style={{ 
                  display: 'inline-block', padding: '4px 12px', backgroundColor: 'rgba(0,0,0,0.5)', 
                  backdropFilter: 'blur(5px)', borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)'
              }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: 1.5 }}>{item.label}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  )
}

export default AnimationComponent;