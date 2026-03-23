import React, { useMemo } from 'react'
import { useCurrentFrame, interpolate } from 'remotion'

export const AnimationComponent = () => {
  const frame = useCurrentFrame()

  const title = "TITLE_TEXT"
  const originLabel = "ORIGIN_LABEL"
  const rawTargets = ["TARGET_1", "TARGET_2", "TARGET_3", "TARGET_4"]
  const alertText = "ALERT_TEXT"

  const rawTargetNodes = [
    { x: 900,  y: 220 },
    { x: 1100, y: 400 },
    { x: 1100, y: 680 },
    { x: 900,  y: 860 },
  ]

  const rawFinalNodes = [
    { x: 1500, y: 220 },
    { x: 1500, y: 400 },
    { x: 1500, y: 680 },
    { x: 1500, y: 860 },
  ]

  const activeData = useMemo(() => {
    return rawTargets
      .map((t, i) => ({ label: t, node: rawTargetNodes[i], final: rawFinalNodes[i] }))
      .filter(item => item.label !== '' && item.label !== 'Placeholder')
  }, [])

  const targets = activeData.map(d => d.label)
  const targetNodes = activeData.map(d => d.node)
  const finalNodes = activeData.map(d => d.final)
  const itemCount = activeData.length

  const titleOp = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const titleTy = interpolate(frame, [0, 20], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const barW = interpolate(frame, [10, 40], [0, 1920], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const attackProgress = interpolate(frame, [20, 65], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const sourceOp = interpolate(frame, [10, 24], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const sourceScale = interpolate(frame, [10, 24], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  
  const alertOp = interpolate(frame, [65, 80], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const labelOp = interpolate(frame, [68, 82], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  const targetOpacities = activeData.map((_, i) => {
    const start = 30 + (i * 8)
    return interpolate(frame, [start, start + 14], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  })

  const sx = 300
  const sy = 540

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden', backgroundColor: 'BACKGROUND_COLOR' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 5, overflow: 'hidden', backgroundColor: 'SECONDARY_COLOR', opacity: titleOp }} />
      <div style={{ position: 'absolute', top: 1074, left: 0, width: barW, height: 6, overflow: 'hidden', backgroundColor: 'SECONDARY_COLOR' }} />
      <div style={{ position: 'absolute', top: 60, left: 0, width: 1920, height: 60, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: titleOp, transform: `translateY(${titleTy}px)` }}>
        <span style={{ fontSize: 28, fontWeight: 700, color: 'PRIMARY_COLOR', letterSpacing: 5, textTransform: 'uppercase', fontFamily: 'sans-serif' }}>{title}</span>
      </div>
      <svg width={1920} height={1080} style={{ position: 'absolute', top: 0, left: 0 }}>
        {targetNodes.map((t, i) => {
          const ex = sx + (t.x - sx) * attackProgress
          const ey = sy + (t.y - sy) * attackProgress
          return <line key={i} x1={sx} y1={sy} x2={ex} y2={ey} stroke="SECONDARY_COLOR" strokeWidth={2.5} strokeDasharray="10 5" opacity={0.7} />
        })}
        {targetNodes.map((t, i) => (
          <line key={i} x1={t.x} y1={t.y} x2={finalNodes[i].x} y2={finalNodes[i].y} stroke="LINE_STROKE" strokeWidth={1.5} strokeDasharray="6 4" opacity={targetOpacities[i] * 0.5} />
        ))}
        <circle cx={sx} cy={sy} r={52} fill="PRIMARY_COLOR" stroke="SECONDARY_COLOR" strokeWidth={4} opacity={sourceOp} transform={`scale(${sourceScale})`} style={{ transformOrigin: `${sx}px ${sy}px` }} />
        <circle cx={sx} cy={sy} r={32} fill="BACKGROUND_COLOR" opacity={sourceOp} />
        {targetNodes.map((t, i) => (
          <g key={i} opacity={targetOpacities[i]}>
            <circle cx={t.x} cy={t.y} r={36} fill="CHART_BG" stroke="SECONDARY_COLOR" strokeWidth={2} />
            <circle cx={t.x} cy={t.y} r={20} fill="NODE_FILL" />
          </g>
        ))}
        {finalNodes.map((f, i) => (
          <g key={i} opacity={targetOpacities[i]}>
            <circle cx={f.x} cy={f.y} r={28} fill="CHART_BG" stroke="NODE_STROKE" strokeWidth={1.5} />
            <circle cx={f.x} cy={f.y} r={14} fill="NODE_FILL" opacity={0.5} />
          </g>
        ))}
      </svg>
      <div style={{ position: 'absolute', top: sy - 18, left: sx - 80, width: 160, height: 36, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: sourceOp }}>
        <span style={{ fontSize: 13, fontWeight: 900, color: 'PRIMARY_COLOR', fontFamily: 'sans-serif', letterSpacing: 1, textTransform: 'uppercase' }}>{originLabel}</span>
      </div>
      {targetNodes.map((t, i) => (
        <div key={i} style={{ position: 'absolute', top: t.y + 42, left: t.x - 100, width: 200, height: 36, overflow: 'hidden', opacity: labelOp, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 18, fontWeight: 600, color: 'PRIMARY_COLOR', fontFamily: 'sans-serif', textAlign: 'center' }}>{targets[i]}</span>
        </div>
      ))}
      <div style={{ position: 'absolute', top: 900, left: 160, width: 400, height: 56, overflow: 'hidden', opacity: alertOp, backgroundColor: 'SECONDARY_COLOR', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box' }}>
        <span style={{ fontSize: 20, fontWeight: 700, color: 'TEXT_ON_SECONDARY', fontFamily: 'sans-serif', letterSpacing: 2, textTransform: 'uppercase' }}>{alertText}</span>
      </div>
    </div>
  )
}

export default AnimationComponent