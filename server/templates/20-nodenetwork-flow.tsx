import React, { useMemo } from 'react'
import { useCurrentFrame, interpolate } from 'remotion'

export const AnimationComponent = () => {
  const frame = useCurrentFrame()

  const rawNodes = [
    { x: 200,  y: 540, label: "NODE_LABEL_1", tag: "TAG_1", color: 'PRIMARY_COLOR', tagColor: 'PRIMARY_COLOR' },
    { x: 620,  y: 300, label: "NODE_LABEL_2", tag: "TAG_2", color: 'NODE_FILL', tagColor: 'ACCENT_COLOR' },
    { x: 960,  y: 540, label: "NODE_LABEL_3", tag: "TAG_3", color: 'SECONDARY_COLOR', tagColor: 'SECONDARY_COLOR' },
    { x: 1300, y: 300, label: "NODE_LABEL_4", tag: "TAG_4", color: 'NODE_FILL', tagColor: 'ACCENT_COLOR' },
    { x: 1720, y: 540, label: "NODE_LABEL_5", tag: "TAG_5", color: 'PRIMARY_COLOR', tagColor: 'PRIMARY_COLOR' },
  ]

  const activeData = useMemo(() => {
    return rawNodes.filter(n => n.label !== '' && n.label !== 'Placeholder')
  }, [])

  const count = activeData.length
  const spacing = 1920 / (count + 1)
  const nodes = activeData.map((n, i) => ({
    ...n,
    x: spacing * (i + 1)
  }))

  const titleOp = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const titleTy = interpolate(frame, [0, 20], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const barW = interpolate(frame, [10, 40], [0, 1920], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const lineProgress = interpolate(frame, [20, 55], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  
  const nodeOpacities = activeData.map((_, i) => interpolate(frame, [15 + i * 10, 28 + i * 10], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }))
  const nodeScales = activeData.map((_, i) => interpolate(frame, [15 + i * 10, 28 + i * 10], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }))
  const labelOp = interpolate(frame, [62, 76], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  const title = "TITLE_TEXT"
  const connections = Array.from({ length: Math.max(0, count - 1) }, (_, i) => [i, i + 1])

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden', backgroundColor: 'BACKGROUND_COLOR' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 5, overflow: 'hidden', backgroundColor: 'PRIMARY_COLOR', opacity: titleOp }} />
      <div style={{ position: 'absolute', top: 1074, left: 0, width: barW, height: 6, overflow: 'hidden', backgroundColor: 'PRIMARY_COLOR' }} />
      <div style={{ position: 'absolute', top: 60, left: 0, width: 1920, height: 60, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: titleOp, transform: `translateY(${titleTy}px)` }}>
        <span style={{ fontSize: 28, fontWeight: 700, color: 'PRIMARY_COLOR', letterSpacing: 5, textTransform: 'uppercase', fontFamily: 'sans-serif' }}>{title}</span>
      </div>
      <svg width={1920} height={1080} style={{ position: 'absolute', top: 0, left: 0 }}>
        {connections.map(([a, b], i) => {
          const from = nodes[a]
          const to = nodes[b]
          const ex = from.x + (to.x - from.x) * lineProgress
          const ey = from.y + (to.y - from.y) * lineProgress
          return <line key={i} x1={from.x} y1={from.y} x2={ex} y2={ey} stroke="LINE_STROKE" strokeWidth={2} strokeDasharray="8 5" opacity={0.6} />
        })}
        {nodes.map((n, i) => (
          <g key={i} opacity={nodeOpacities[i]}>
            <circle cx={n.x} cy={n.y} r={44} fill="CHART_BG" stroke="NODE_STROKE" strokeWidth={2} transform={`scale(${nodeScales[i]})`} style={{ transformOrigin: `${n.x}px ${n.y}px` }} />
            <circle cx={n.x} cy={n.y} r={28} fill={n.color} transform={`scale(${nodeScales[i]})`} style={{ transformOrigin: `${n.x}px ${n.y}px` }} />
          </g>
        ))}
      </svg>
      {nodes.map((n, i) => (
        <div key={i}>
          <div style={{ position: 'absolute', top: n.y + 52, left: n.x - 110, width: 220, height: 36, overflow: 'hidden', opacity: labelOp, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 18, fontWeight: 700, color: 'PRIMARY_COLOR', fontFamily: 'sans-serif', textAlign: 'center' }}>{n.label}</span>
          </div>
          <div style={{ position: 'absolute', top: n.y + 90, left: n.x - 70, width: 140, height: 32, overflow: 'hidden', opacity: labelOp, backgroundColor: n.tagColor, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'TEXT_ON_PRIMARY', fontFamily: 'sans-serif', letterSpacing: 1, textTransform: 'uppercase' }}>{n.tag}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

export default AnimationComponent