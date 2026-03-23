import React, { useMemo } from 'react'
import { useCurrentFrame, interpolate } from 'remotion'

export const AnimationComponent = () => {
  const frame = useCurrentFrame()

  const title = "TITLE_TEXT"
  const originLabel = "ORIGIN_LABEL"
  const rawNodeLabels = ["NODE_LABEL_1", "NODE_LABEL_2", "NODE_LABEL_3", "NODE_LABEL_4", "NODE_LABEL_5", "NODE_LABEL_6"]

  const nodeLabels = useMemo(() => {
    return rawNodeLabels.filter(label => label !== '' && label !== 'Placeholder')
  }, [])

  const titleOp = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const titleTy = interpolate(frame, [0, 20], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const barW = interpolate(frame, [10, 40], [0, 1920], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const centerOp = interpolate(frame, [10, 24], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const centerScale = interpolate(frame, [10, 24], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const ring1Progress = interpolate(frame, [22, 48], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const ring2Progress = interpolate(frame, [38, 64], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const labelOp = interpolate(frame, [60, 75], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  const cx = 960
  const cy = 520
  const ring1R = 280
  const ring2R = 500
  const ring1Count = 4
  const ring2Count = nodeLabels.length

  const ring1Nodes = Array.from({ length: ring1Count }, (_, i) => {
    const angle = (i / ring1Count) * 2 * Math.PI - Math.PI / 2
    return {
      x: cx + ring1R * Math.cos(angle) * ring1Progress,
      y: cy + ring1R * Math.sin(angle) * ring1Progress,
    }
  })

  const ring2Nodes = Array.from({ length: ring2Count }, (_, i) => {
    const angle = (i / ring2Count) * 2 * Math.PI - Math.PI / 2
    return {
      x: cx + ring2R * Math.cos(angle) * ring2Progress,
      y: cy + ring2R * Math.sin(angle) * ring2Progress,
    }
  })

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden', backgroundColor: 'BACKGROUND_COLOR' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 5, overflow: 'hidden', backgroundColor: 'PRIMARY_COLOR', opacity: titleOp }} />
      <div style={{ position: 'absolute', top: 1074, left: 0, width: barW, height: 6, overflow: 'hidden', backgroundColor: 'PRIMARY_COLOR' }} />
      <div style={{ position: 'absolute', top: 60, left: 0, width: 1920, height: 60, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: titleOp, transform: `translateY(${titleTy}px)` }}>
        <span style={{ fontSize: 28, fontWeight: 700, color: 'PRIMARY_COLOR', letterSpacing: 5, textTransform: 'uppercase', fontFamily: 'sans-serif' }}>{title}</span>
      </div>
      <svg width={1920} height={1080} style={{ position: 'absolute', top: 0, left: 0 }}>
        {ring1Nodes.map((n, i) => (
          <line key={i} x1={cx} y1={cy} x2={n.x} y2={n.y} stroke="LINE_STROKE" strokeWidth={2} strokeDasharray="8 5" opacity={ring1Progress * 0.6} />
        ))}
        {ring2Nodes.map((n, i) => {
          const r1 = ring1Nodes[i % ring1Count]
          return <line key={i} x1={r1.x} y1={r1.y} x2={n.x} y2={n.y} stroke="LINE_STROKE" strokeWidth={1.5} strokeDasharray="6 4" opacity={ring2Progress * 0.4} />
        })}
        {ring2Nodes.map((n, i) => {
          const next = ring2Nodes[(i + 2) % ring2Count]
          return <line key={i} x1={n.x} y1={n.y} x2={next.x} y2={next.y} stroke="GRID_LINE" strokeWidth={1} opacity={ring2Progress * 0.2} />
        })}
        <circle cx={cx} cy={cy} r={50} fill="PRIMARY_COLOR" stroke="ACCENT_COLOR" strokeWidth={3} opacity={centerOp} transform={`scale(${centerScale})`} style={{ transformOrigin: `${cx}px ${cy}px` }} />
        <circle cx={cx} cy={cy} r={32} fill="BACKGROUND_COLOR" opacity={centerOp} />
        {ring1Nodes.map((n, i) => (
          <g key={i} opacity={ring1Progress}>
            <circle cx={n.x} cy={n.y} r={32} fill="CHART_BG" stroke="NODE_STROKE" strokeWidth={2} />
            <circle cx={n.x} cy={n.y} r={18} fill="NODE_FILL" />
          </g>
        ))}
        {ring2Nodes.map((n, i) => (
          <g key={i} opacity={ring2Progress}>
            <circle cx={n.x} cy={n.y} r={22} fill="CHART_BG" stroke="ACCENT_COLOR" strokeWidth={1.5} />
            <circle cx={n.x} cy={n.y} r={11} fill="ACCENT_COLOR" opacity={0.7} />
          </g>
        ))}
      </svg>
      <div style={{ position: 'absolute', top: cy - 18, left: cx - 100, width: 200, height: 36, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: centerOp }}>
        <span style={{ fontSize: 13, fontWeight: 900, color: 'PRIMARY_COLOR', fontFamily: 'sans-serif', letterSpacing: 1, textTransform: 'uppercase' }}>{originLabel}</span>
      </div>
      {ring2Nodes.map((n, i) => (
        <div key={i} style={{ position: 'absolute', top: n.y + 28, left: n.x - 90, width: 180, height: 36, overflow: 'hidden', opacity: labelOp, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 16, fontWeight: 500, color: 'PRIMARY_COLOR', fontFamily: 'sans-serif', textAlign: 'center' }}>{nodeLabels[i]}</span>
        </div>
      ))}
    </div>
  )
}

export default AnimationComponent