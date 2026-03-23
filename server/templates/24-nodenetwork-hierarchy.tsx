import React, { useMemo } from 'react'
import { useCurrentFrame, interpolate } from 'remotion'

export const AnimationComponent = () => {
  const frame = useCurrentFrame()

  const title = "TITLE_TEXT"
  const originLabel = "ORIGIN_LABEL"
  const rawNodeLabels = ["NODE_LABEL_1", "NODE_LABEL_2", "NODE_LABEL_3", "NODE_LABEL_4", "NODE_LABEL_5", "NODE_LABEL_6"]
  const rawTags = ["TAG_1", "TAG_2", "TAG_3"]

  // Filter logic: Only keep nodes that have valid labels
  const activeData = useMemo(() => {
    const filtered = rawNodeLabels
      .map((label, i) => ({ label, tag: rawTags[Math.floor(i / 2)] }))
      .filter(item => item.label !== '' && item.label !== 'Placeholder')
    
    const midNodes = []
    const leafNodes = []
    const midY = 480
    const leafY = 780
    
    // Grouping logic: 2 leaves per mid node
    const groups = Math.ceil(filtered.length / 2)
    const spacing = 1920 / (groups + 1)
    
    for (let i = 0; i < groups; i++) {
      const midX = spacing * (i + 1)
      midNodes.push({ x: midX, y: midY, tag: rawTags[i] })
      
      const leaves = filtered.slice(i * 2, i * 2 + 2)
      leaves.forEach((leaf, j) => {
        leafNodes.push({ x: midX - 100 + (j * 200), y: leafY, label: leaf.label })
      })
    }
    return { midNodes, leafNodes }
  }, [])

  const { midNodes, leafNodes } = activeData

  const titleOp = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const titleTy = interpolate(frame, [0, 20], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const barW = interpolate(frame, [10, 40], [0, 1920], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  const rootOp = interpolate(frame, [12, 26], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const rootScale = interpolate(frame, [12, 26], [0.6, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const line1Op = interpolate(frame, [24, 38], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const line2Op = interpolate(frame, [50, 64], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const labelOp = interpolate(frame, [72, 86], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  const rootX = 960
  const rootY = 180

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden', backgroundColor: 'BACKGROUND_COLOR' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 5, overflow: 'hidden', backgroundColor: 'PRIMARY_COLOR', opacity: titleOp }} />
      <div style={{ position: 'absolute', top: 1074, left: 0, width: barW, height: 6, overflow: 'hidden', backgroundColor: 'PRIMARY_COLOR' }} />
      <div style={{ position: 'absolute', top: 50, left: 0, width: 1920, height: 60, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: titleOp, transform: `translateY(${titleTy}px)` }}>
        <span style={{ fontSize: 26, fontWeight: 700, color: 'PRIMARY_COLOR', letterSpacing: 5, textTransform: 'uppercase', fontFamily: 'sans-serif' }}>{title}</span>
      </div>

      <svg width={1920} height={1080} style={{ position: 'absolute', top: 0, left: 0 }}>
        {midNodes.map((n, i) => <line key={i} x1={rootX} y1={rootY + 40} x2={n.x} y2={n.y - 40} stroke="LINE_STROKE" strokeWidth={2} strokeDasharray="6 4" opacity={line1Op} />)}
        {leafNodes.map((n, i) => (
          <line key={i} x1={midNodes[Math.floor(i/2)].x} y1={midNodes[Math.floor(i/2)].y + 40} x2={n.x} y2={n.y - 30} stroke="LINE_STROKE" strokeWidth={1.5} strokeDasharray="4 4" opacity={line2Op} />
        ))}

        <circle cx={rootX} cy={rootY} r={44} fill="PRIMARY_COLOR" stroke="ACCENT_COLOR" strokeWidth={3} opacity={rootOp} transform={`scale(${rootScale})`} style={{ transformOrigin: `${rootX}px ${rootY}px` }} />
        <circle cx={rootX} cy={rootY} r={26} fill="BACKGROUND_COLOR" opacity={rootOp} />

        {midNodes.map((n, i) => (
          <g key={i} opacity={interpolate(frame, [32 + i * 6, 46 + i * 6], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}>
            <circle cx={n.x} cy={n.y} r={38} fill="SECONDARY_COLOR" transform={`scale(${interpolate(frame, [32 + i * 6, 46 + i * 6], [0.6, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })})`} style={{ transformOrigin: `${n.x}px ${n.y}px` }} />
            <circle cx={n.x} cy={n.y} r={22} fill="BACKGROUND_COLOR" opacity={0.3} />
          </g>
        ))}

        {leafNodes.map((n, i) => (
          <g key={i} opacity={interpolate(frame, [56 + i * 4, 70 + i * 4], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}>
            <circle cx={n.x} cy={n.y} r={26} fill="CHART_BG" stroke="NODE_STROKE" strokeWidth={1.5} />
            <circle cx={n.x} cy={n.y} r={12} fill="NODE_FILL" />
          </g>
        ))}
      </svg>

      <div style={{ position: 'absolute', top: rootY - 18, left: rootX - 110, width: 220, height: 36, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: rootOp }}>
        <span style={{ fontSize: 14, fontWeight: 800, color: 'PRIMARY_COLOR', fontFamily: 'sans-serif', textTransform: 'uppercase', letterSpacing: 1 }}>{originLabel}</span>
      </div>

      {midNodes.map((n, i) => (
        <div key={i} style={{ position: 'absolute', top: n.y + 46, left: n.x - 100, width: 200, height: 36, overflow: 'hidden', opacity: labelOp, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: 'PRIMARY_COLOR', fontFamily: 'sans-serif', textAlign: 'center', textTransform: 'uppercase', letterSpacing: 1 }}>{n.tag}</span>
        </div>
      ))}

      {leafNodes.map((n, i) => (
        <div key={i} style={{ position: 'absolute', top: n.y + 34, left: n.x - 90, width: 180, height: 36, overflow: 'hidden', opacity: labelOp, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 16, fontWeight: 500, color: 'SUPPORT_COLOR', fontFamily: 'sans-serif', textAlign: 'center' }}>{n.label}</span>
        </div>
      ))}
    </div>
  )
}

export default AnimationComponent