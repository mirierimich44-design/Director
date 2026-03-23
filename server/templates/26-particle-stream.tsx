import React, { useMemo } from 'react'
import { useCurrentFrame, interpolate } from 'remotion'

export const AnimationComponent = () => {
  const frame = useCurrentFrame()

  // Configuration data
  const rawData = [
    { label: "ORIGIN_LABEL", value: "COUNT_VALUE", target: "ARC_TO" },
    // Add more items here if needed
  ]

  // Filter out empty or placeholder items
  const data = useMemo(() => {
    return rawData.filter(item => 
      item.label !== '' && item.label !== 'Placeholder' &&
      item.value !== '' && item.value !== 'Placeholder'
    )
  }, [])

  const titleOp = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const titleTy = interpolate(frame, [0, 20], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const barW = interpolate(frame, [10, 40], [0, 1920], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const sourceOp = interpolate(frame, [10, 24], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const targetOp = interpolate(frame, [60, 75], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const labelOp = interpolate(frame, [70, 85], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const countOp = interpolate(frame, [75, 90], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  const title = "TITLE_TEXT"
  
  // Use first item data if available
  const item = data[0] || { label: "N/A", value: "0", target: "N/A" }

  const sourceX = 200
  const targetX = 1720
  const cy = 540

  const particleCount = 40
  const particles = Array.from({ length: particleCount }, (_, i) => {
    const launchFrame = 15 + i * 3
    const speed = 0.8 + (i % 5) * 0.08
    const yOffset = (((i * 47) % 200) - 100)
    const progress = interpolate(frame, [launchFrame, launchFrame + 60], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    const x = sourceX + (targetX - sourceX) * progress * speed
    const y = cy + yOffset * Math.sin(progress * Math.PI)
    const op = interpolate(frame, [launchFrame, launchFrame + 10, launchFrame + 50, launchFrame + 60], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    const size = 3 + (i % 3)
    return { x, y, op, size }
  })

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden', backgroundColor: 'BACKGROUND_COLOR' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 5, overflow: 'hidden', backgroundColor: 'PRIMARY_COLOR', opacity: titleOp }} />
      <div style={{ position: 'absolute', top: 1074, left: 0, width: barW, height: 6, overflow: 'hidden', backgroundColor: 'PRIMARY_COLOR' }} />
      <div style={{ position: 'absolute', top: 50, left: 0, width: 1920, height: 60, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: titleOp, transform: `translateY(${titleTy}px)` }}>
        <span style={{ fontSize: 28, fontWeight: 700, color: 'PRIMARY_COLOR', letterSpacing: 5, textTransform: 'uppercase', fontFamily: 'sans-serif' }}>{title}</span>
      </div>

      <svg width={1920} height={1080} style={{ position: 'absolute', top: 0, left: 0 }}>
        <line x1={sourceX} y1={cy} x2={targetX} y2={cy} stroke="GRID_LINE" strokeWidth={1} strokeDasharray="4 8" opacity={sourceOp * 0.3} />

        {particles.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={p.size} fill="PRIMARY_COLOR" opacity={p.op * 0.85} />
        ))}

        <circle cx={sourceX} cy={cy} r={44} fill="PRIMARY_COLOR" stroke="ACCENT_COLOR" strokeWidth={3} opacity={sourceOp} />
        <circle cx={sourceX} cy={cy} r={26} fill="BACKGROUND_COLOR" opacity={sourceOp} />

        <circle cx={targetX} cy={cy} r={44} fill="SECONDARY_COLOR" stroke="SECONDARY_COLOR" strokeWidth={3} opacity={targetOp} />
        <circle cx={targetX} cy={cy} r={26} fill="BACKGROUND_COLOR" opacity={targetOp * 0.3} />
      </svg>

      <div style={{ position: 'absolute', top: cy + 54, left: sourceX - 100, width: 200, height: 36, overflow: 'hidden', opacity: sourceOp, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 18, fontWeight: 700, color: 'PRIMARY_COLOR', fontFamily: 'sans-serif', textTransform: 'uppercase', letterSpacing: 1 }}>{item.label}</span>
      </div>
      <div style={{ position: 'absolute', top: cy + 54, left: targetX - 100, width: 200, height: 36, overflow: 'hidden', opacity: labelOp, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 18, fontWeight: 700, color: 'SECONDARY_COLOR', fontFamily: 'sans-serif', textTransform: 'uppercase', letterSpacing: 1 }}>{item.target}</span>
      </div>
      <div style={{ position: 'absolute', top: 820, left: 160, width: 600, height: 70, overflow: 'hidden', opacity: countOp, display: 'flex', alignItems: 'center' }}>
        <span style={{ fontSize: 60, fontWeight: 900, color: 'PRIMARY_COLOR', fontFamily: 'sans-serif', marginRight: 20 }}>{item.value}</span>
        <span style={{ fontSize: 22, fontWeight: 500, color: 'SUPPORT_COLOR', fontFamily: 'sans-serif', textTransform: 'uppercase', letterSpacing: 2, alignSelf: 'flex-end', paddingBottom: 8 }}>COUNT_LABEL</span>
      </div>
    </div>
  )
}

export default AnimationComponent