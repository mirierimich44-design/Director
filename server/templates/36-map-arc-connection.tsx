import React, { useMemo } from 'react'
import { useCurrentFrame, useVideoConfig, interpolate, Easing } from 'remotion'

export const AnimationComponent = () => {
  const frame = useCurrentFrame()
  const { width, height } = useVideoConfig()

  const title = "TITLE_TEXT"
  const arcFrom = "ARC_FROM"
  const rawTargetLabels = ["MAP_LABEL_1", "MAP_LABEL_2", "MAP_LABEL_3", "MAP_LABEL_4"]
  const rawTargets = [
    { x: 380,  y: 350 },
    { x: 790,  y: 280 },
    { x: 820,  y: 540 },
    { x: 1380, y: 580 },
  ]

  const filteredData = useMemo(() => {
    return rawTargetLabels
      .map((label, index) => ({ label, target: rawTargets[index] }))
      .filter(item => item.label !== '' && item.label !== 'Placeholder')
  }, [rawTargetLabels])

  const mapOp = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: 'clamp' })
  const arcProgress = interpolate(frame, [30, 80], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.4, 0, 0.2, 1) })
  const labelOp = interpolate(frame, [70, 95], [0, 1], { extrapolateRight: 'clamp' })

  const source = { x: 1100, y: 380 }

  const getArcPath = (from: {x: number, y: number}, to: {x: number, y: number}) => {
    const cpx = (from.x + to.x) / 2
    const cpy = Math.min(from.y, to.y) - Math.abs(to.x - from.x) * 0.3
    return `M ${from.x} ${from.y} Q ${cpx} ${cpy} ${to.x} ${to.y}`
  }

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden', backgroundColor: 'BACKGROUND_COLOR', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* Cinematic Background Grid */}
      <div style={{
        position: 'absolute', width: '100%', height: '100%',
        backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.02) 0%, transparent 80%), linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
        backgroundSize: '100% 100%, 80px 80px, 80px 80px',
        opacity: mapOp * 0.6
      }} />

      {/* Modern Header */}
      <div style={{ 
          position: 'absolute', top: 60, left: 80, 
          opacity: mapOp, transform: `translateY(${interpolate(frame, [0, 30], [20, 0], { extrapolateRight: 'clamp' })}px)`,
          zIndex: 20 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ width: 6, height: 40, backgroundColor: 'PRIMARY_COLOR', borderRadius: 3, boxShadow: '0 0 15px PRIMARY_COLOR' }} />
          <div style={{ fontSize: 42, fontWeight: 900, color: '#fff', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{title}</div>
        </div>
        <div style={{ fontSize: 14, color: 'ACCENT_COLOR', fontWeight: 800, letterSpacing: '0.4em', textTransform: 'uppercase', marginTop: 10, marginLeft: 26 }}>GLOBAL_OPERATIONS_MAP_v2.4</div>
      </div>

      <svg width={1920} height={1080} style={{ position: 'absolute', top: 0, left: 0 }}>
        <defs>
          <linearGradient id="arcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="PRIMARY_COLOR" stopOpacity="0" />
            <stop offset="50%" stopColor="ACCENT_COLOR" stopOpacity="0.8" />
            <stop offset="100%" stopColor="SECONDARY_COLOR" stopOpacity="0" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Connection Arcs */}
        {filteredData.map((item, i) => {
          const path = getArcPath(source, item.target)
          return (
            <g key={`arc-${i}`}>
              {/* Static Background Arc */}
              <path 
                d={path} 
                fill="none" 
                stroke="PRIMARY_COLOR" 
                strokeWidth={2} 
                opacity={mapOp * 0.15} 
                strokeDasharray="4 4" 
              />
              
              {/* Animated Reveal Arc */}
              <path 
                d={path} 
                fill="none" 
                stroke="ACCENT_COLOR" 
                strokeWidth={3} 
                strokeDasharray="1000"
                strokeDashoffset={1000 * (1 - arcProgress)}
                opacity={0.8}
                filter="url(#glow)"
              />

              {/* Data Flow Particle */}
              <circle r={4} fill="#fff" filter="url(#glow)">
                <animateMotion 
                  path={path} 
                  dur={`${2 + i * 0.5}s`} 
                  repeatCount="indefinite" 
                  begin={`${i * 0.3}s`}
                />
              </circle>
            </g>
          )
        })}

        {/* Source Node */}
        <g opacity={mapOp}>
          <circle cx={source.x} cy={source.y} r={24} fill="rgba(15, 23, 42, 0.9)" stroke="PRIMARY_COLOR" strokeWidth={2} />
          <circle cx={source.x} cy={source.y} r={8} fill="PRIMARY_COLOR" filter="url(#glow)">
            <animate attributeName="r" values="6;10;6" dur="2s" repeatCount="indefinite" />
          </circle>
        </g>

        {/* Target Dots */}
        {filteredData.map((item, i) => (
          <g key={`dot-${i}`} opacity={labelOp}>
            <circle cx={item.target.x} cy={item.target.y} r={18} fill="none" stroke="ACCENT_COLOR" strokeWidth={1} opacity={0.3}>
                <animate attributeName="r" values="18;28;18" dur="3s" repeatCount="indefinite" />
            </circle>
            <circle cx={item.target.x} cy={item.target.y} r={6} fill="ACCENT_COLOR" filter="url(#glow)" />
          </g>
        ))}
      </svg>

      {/* Source Label (Glass) */}
      <div style={{ 
        position: 'absolute', top: source.y - 80, left: source.x - 100, 
        width: 200, padding: '10px', backgroundColor: 'rgba(15, 23, 42, 0.9)', 
        backdropFilter: 'blur(12px)', border: '1px solid PRIMARY_COLOR', 
        borderRadius: 8, opacity: mapOp, textAlign: 'center'
      }}>
        <div style={{ fontSize: 10, color: 'PRIMARY_COLOR', fontWeight: 900, letterSpacing: '0.2em', marginBottom: 4 }}>ORIGIN_NODE</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', textTransform: 'uppercase' }}>{arcFrom}</div>
      </div>

      {/* Target Labels */}
      {filteredData.map((item, i) => (
        <div key={`label-${i}`} style={{ 
            position: 'absolute', top: item.target.y + 30, left: item.target.x - 100, 
            width: 200, opacity: labelOp, textAlign: 'center' 
        }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.05em', textShadow: '0 2px 10px rgba(0,0,0,0.92)' }}>{item.label}</div>
          <div style={{ height: 2, width: 40, backgroundColor: 'ACCENT_COLOR', margin: '8px auto', opacity: 0.6 }} />
        </div>
      ))}

      {/* Bottom Forensic Detail */}
      <div style={{ position: 'absolute', bottom: 40, right: 60, opacity: 0.2, textAlign: 'right' }}>
         <div style={{ color: '#fff', fontSize: 12, fontFamily: 'monospace' }}>
            COORD_MAPPING: ENABLED<br />
            ACTIVE_CONNECTIONS: {filteredData.length}<br />
            STATUS: SECURE_RELAY_OK
         </div>
      </div>
    </div>
  )
}

export default AnimationComponent