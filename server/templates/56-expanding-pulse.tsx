import React, { useMemo } from 'react'
import { useCurrentFrame, interpolate } from 'remotion'

export const AnimationComponent = () => {
  const frame = useCurrentFrame()

  const title = "TITLE_TEXT"
  const originLabel = "ORIGIN_LABEL"
  const rawNodeLabels = ["NODE_LABEL_1", "NODE_LABEL_2", "NODE_LABEL_3", "NODE_LABEL_4", "NODE_LABEL_5"]

  // Filter out empty or placeholder labels
  const nodeLabels = useMemo(() => {
    return rawNodeLabels.filter(label => label !== '' && label !== 'Placeholder')
  }, [])

  const itemCount = nodeLabels.length
  const titleOp = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const titleTy = interpolate(frame, [0, 20], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const barW = interpolate(frame, [10, 40], [0, 1920], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const coreOp = interpolate(frame, [8, 22], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const coreScale = interpolate(frame, [8, 22], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  const r1R = interpolate(frame, [15, 55], [0, 420], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const r1Op = interpolate(frame, [15, 55], [0.9, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const r2R = interpolate(frame, [28, 68], [0, 420], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const r2Op = interpolate(frame, [28, 68], [0.7, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const r3R = interpolate(frame, [41, 81], [0, 420], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const r3Op = interpolate(frame, [41, 81], [0.5, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  const nodeOpacities = Array.from({ length: itemCount }).map((_, i) => 
    interpolate(frame, [30 + (i * 6), 44 + (i * 6)], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  )
  
  const labelOp = interpolate(frame, [65, 80], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  const cx = 960
  const cy = 520
  const nodeRadius = 300
  // Dynamically calculate angles based on remaining items
  const angles = Array.from({ length: itemCount }).map((_, i) => (i * (360 / itemCount) * Math.PI) / 180)
  const nodePositions = angles.map(a => ({ x: cx + nodeRadius * Math.cos(a), y: cy + nodeRadius * Math.sin(a) }))

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden', backgroundColor: 'BACKGROUND_COLOR' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 5, overflow: 'hidden', backgroundColor: 'PRIMARY_COLOR', opacity: titleOp }} />
      <div style={{ position: 'absolute', top: 1074, left: 0, width: barW, height: 6, overflow: 'hidden', backgroundColor: 'PRIMARY_COLOR' }} />
      <div style={{ position: 'absolute', top: 60, left: 0, width: 1920, height: 60, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: titleOp, transform: `translateY(${titleTy}px)` }}>
        <span style={{ fontSize: 28, fontWeight: 700, color: 'PRIMARY_COLOR', letterSpacing: 5, textTransform: 'uppercase', fontFamily: 'sans-serif' }}>{title}</span>
      </div>
      <svg width={1920} height={1080} style={{ position: 'absolute', top: 0, left: 0 }}>
        <circle cx={cx} cy={cy} r={r1R} fill="none" stroke="PRIMARY_COLOR" strokeWidth={3} opacity={r1Op} />
        <circle cx={cx} cy={cy} r={r2R} fill="none" stroke="ACCENT_COLOR" strokeWidth={2} opacity={r2Op} />
        <circle cx={cx} cy={cy} r={r3R} fill="none" stroke="PRIMARY_COLOR" strokeWidth={1.5} opacity={r3Op} />
        {nodePositions.map((n, i) => (
          <line key={i} x1={cx} y1={cy} x2={n.x} y2={n.y} stroke="LINE_STROKE" strokeWidth={1.5} strokeDasharray="6 4" opacity={nodeOpacities[i] * 0.5} />
        ))}
        <circle cx={cx} cy={cy} r={52} fill="PRIMARY_COLOR" stroke="ACCENT_COLOR" strokeWidth={3} opacity={coreOp} transform={`scale(${coreScale})`} style={{ transformOrigin: `${cx}px ${cy}px` }} />
        <circle cx={cx} cy={cy} r={34} fill="BACKGROUND_COLOR" opacity={coreOp} />
        {nodePositions.map((n, i) => (
          <g key={i} opacity={nodeOpacities[i]}>
            <circle cx={n.x} cy={n.y} r={30} fill="CHART_BG" stroke="NODE_STROKE" strokeWidth={2} />
            <circle cx={n.x} cy={n.y} r={16} fill="NODE_FILL" />
          </g>
        ))}
      </svg>
      <div style={{ position: 'absolute', top: cy - 18, left: cx - 110, width: 220, height: 36, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: coreOp }}>
        <span style={{ fontSize: 13, fontWeight: 900, color: 'PRIMARY_COLOR', fontFamily: 'sans-serif', letterSpacing: 1, textTransform: 'uppercase' }}>{originLabel}</span>
      </div>
      {nodePositions.map((n, i) => (
        <div key={i} style={{ position: 'absolute', top: n.y + 36, left: n.x - 90, width: 180, height: 36, overflow: 'hidden', opacity: labelOp, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 17, fontWeight: 500, color: 'PRIMARY_COLOR', fontFamily: 'sans-serif', textAlign: 'center' }}>{nodeLabels[i]}</span>
        </div>
      ))}
    </div>
  )
}

export default AnimationComponent