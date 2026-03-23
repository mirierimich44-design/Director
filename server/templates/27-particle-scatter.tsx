import React from 'react'
import { useCurrentFrame, interpolate } from 'remotion'

export const AnimationComponent = () => {
  const frame = useCurrentFrame()

  const titleOp = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const titleTy = interpolate(frame, [0, 20], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const barW = interpolate(frame, [10, 40], [0, 1920], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const labelOp = interpolate(frame, [70, 85], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  const title = "TITLE_TEXT"
  const originLabel = "ORIGIN_LABEL"
  const countValue = "COUNT_VALUE"
  const countLabel = "COUNT_LABEL"
  const alertText = "ALERT_TEXT"

  const cx = 960
  const cy = 520

  // Scattered particles in random directions across full screen
  const particleCount = 80
  const angleOffsets = [0,7,14,23,31,40,50,61,73,86,100,115,131,148,166,185,205,226,248,271,295,320,346,12,39,68,98,129,161,194,228,263,299,336,14,53,93,134,176,219,263,308,354,41,89,138,188,239,291,344,38,93,149,206,264,323,23,84,146,209,273,338,44,111,179,248,318,29,101,174,248,323,38,114,191,269,348,68]
  const particles = Array.from({ length: particleCount }, (_, i) => {
    const launchFrame = 18 + Math.floor(i * 1.2)
    const angle = (angleOffsets[i % angleOffsets.length] / 360) * 2 * Math.PI
    const maxDist = 350 + (i % 8) * 50
    const progress = interpolate(frame, [launchFrame, launchFrame + 55], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    const dist = maxDist * progress
    const x = cx + Math.cos(angle) * dist
    const y = cy + Math.sin(angle) * dist
    const op = interpolate(frame, [launchFrame, launchFrame + 8, launchFrame + 40, launchFrame + 55], [0, 0.9, 0.6, 0.1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    const size = 2 + (i % 4)
    const isHighlight = i % 12 === 0
    return { x, y, op, size, isHighlight }
  })

  const sourceOp = interpolate(frame, [8, 22], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const sourceScale = interpolate(frame, [8, 22], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden', backgroundColor: 'BACKGROUND_COLOR' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 5, overflow: 'hidden', backgroundColor: 'SECONDARY_COLOR', opacity: titleOp }} />
      <div style={{ position: 'absolute', top: 1074, left: 0, width: barW, height: 6, overflow: 'hidden', backgroundColor: 'SECONDARY_COLOR' }} />
      <div style={{ position: 'absolute', top: 50, left: 0, width: 1920, height: 60, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: titleOp, transform: `translateY(${titleTy}px)` }}>
        <span style={{ fontSize: 28, fontWeight: 700, color: 'PRIMARY_COLOR', letterSpacing: 5, textTransform: 'uppercase', fontFamily: 'sans-serif' }}>{title}</span>
      </div>

      <svg width={1920} height={1080} style={{ position: 'absolute', top: 0, left: 0 }}>
        {particles.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={p.size} fill={p.isHighlight ? 'ACCENT_COLOR' : 'SECONDARY_COLOR'} opacity={p.op} />
        ))}
        <circle cx={cx} cy={cy} r={52} fill="PRIMARY_COLOR" stroke="SECONDARY_COLOR" strokeWidth={4} opacity={sourceOp} transform={`scale(${sourceScale})`} style={{ transformOrigin: `${cx}px ${cy}px` }} />
        <circle cx={cx} cy={cy} r={32} fill="BACKGROUND_COLOR" opacity={sourceOp} />
      </svg>

      <div style={{ position: 'absolute', top: cy - 18, left: cx - 110, width: 220, height: 36, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: sourceOp }}>
        <span style={{ fontSize: 14, fontWeight: 900, color: 'PRIMARY_COLOR', fontFamily: 'sans-serif', textTransform: 'uppercase', letterSpacing: 1 }}>{originLabel}</span>
      </div>

      <div style={{ position: 'absolute', top: 840, left: 160, width: 600, height: 70, overflow: 'hidden', opacity: labelOp, display: 'flex', alignItems: 'center' }}>
        <span style={{ fontSize: 60, fontWeight: 900, color: 'SECONDARY_COLOR', fontFamily: 'sans-serif', marginRight: 20 }}>{countValue}</span>
        <span style={{ fontSize: 22, fontWeight: 500, color: 'SUPPORT_COLOR', fontFamily: 'sans-serif', textTransform: 'uppercase', letterSpacing: 2, alignSelf: 'flex-end', paddingBottom: 8 }}>{countLabel}</span>
      </div>

      <div style={{ position: 'absolute', top: 840, left: 1400, width: 360, height: 56, overflow: 'hidden', opacity: labelOp, backgroundColor: 'SECONDARY_COLOR', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 20, fontWeight: 700, color: 'TEXT_ON_SECONDARY', fontFamily: 'sans-serif', letterSpacing: 2, textTransform: 'uppercase' }}>{alertText}</span>
      </div>
    </div>
  )
}

export default AnimationComponent