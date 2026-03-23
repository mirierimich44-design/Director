import React, { useMemo } from 'react'
import { useCurrentFrame, interpolate } from 'remotion'

export const AnimationComponent = () => {
  const frame = useCurrentFrame()

  const titleOp = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const titleTy = interpolate(frame, [0, 20], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const barW = interpolate(frame, [10, 40], [0, 1920], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const targetOp = interpolate(frame, [8, 22], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const targetScale = interpolate(frame, [8, 22], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const impactOp = interpolate(frame, [72, 88], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const impactScale = interpolate(frame, [72, 88], [0.5, 1.2], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const labelOp = interpolate(frame, [78, 92], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  const title = "TITLE_TEXT"
  const originLabel = "ORIGIN_LABEL"
  const countValue = "COUNT_VALUE"
  const countLabel = "COUNT_LABEL"
  const alertText = "ALERT_TEXT"

  const cx = 960
  const cy = 520

  const rawAngleOffsets = [0,6,12,18,24,30,36,42,49,56,63,71,79,88,97,107,117,128,139,151,163,176,189,203,217,232,247,263,279,296,313,331,349,8,28,48,69,91,113,136,160,184,209,235,261,288,316,344,13,43,74,106,139,173,208,244,281,319,358,38]
  
  const particles = useMemo(() => {
    const filteredOffsets = rawAngleOffsets.filter(val => val !== null && val !== undefined && val !== '' && val !== 'Placeholder')
    return Array.from({ length: filteredOffsets.length }, (_, i) => {
      const launchFrame = 15 + Math.floor(i * 1.0)
      const angle = (filteredOffsets[i % filteredOffsets.length] / 360) * 2 * Math.PI
      const startDist = 500 + (i % 6) * 40
      const progress = interpolate(frame, [launchFrame, launchFrame + 55], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
      const dist = startDist * (1 - progress)
      const x = cx + Math.cos(angle) * dist
      const y = cy + Math.sin(angle) * dist
      const op = interpolate(frame, [launchFrame, launchFrame + 8, launchFrame + 48, launchFrame + 55], [0, 0.9, 0.8, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
      const size = 3 + (i % 3)
      return { x, y, op, size }
    })
  }, [frame, cx, cy])

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden', backgroundColor: 'BACKGROUND_COLOR' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 5, overflow: 'hidden', backgroundColor: 'SECONDARY_COLOR', opacity: titleOp }} />
      <div style={{ position: 'absolute', top: 1074, left: 0, width: barW, height: 6, overflow: 'hidden', backgroundColor: 'SECONDARY_COLOR' }} />
      <div style={{ position: 'absolute', top: 50, left: 0, width: 1920, height: 60, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: titleOp, transform: `translateY(${titleTy}px)` }}>
        <span style={{ fontSize: 28, fontWeight: 700, color: 'PRIMARY_COLOR', letterSpacing: 5, textTransform: 'uppercase', fontFamily: 'sans-serif' }}>{title}</span>
      </div>

      <svg width={1920} height={1080} style={{ position: 'absolute', top: 0, left: 0 }}>
        {particles.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={p.size} fill="SECONDARY_COLOR" opacity={p.op} />
        ))}

        <circle cx={cx} cy={cy} r={80} fill="SECONDARY_COLOR" opacity={impactOp * 0.15} transform={`scale(${impactScale})`} style={{ transformOrigin: `${cx}px ${cy}px` }} />

        <circle cx={cx} cy={cy} r={52} fill="PRIMARY_COLOR" stroke="SECONDARY_COLOR" strokeWidth={4} opacity={targetOp} transform={`scale(${targetScale})`} style={{ transformOrigin: `${cx}px ${cy}px` }} />
        <circle cx={cx} cy={cy} r={32} fill="BACKGROUND_COLOR" opacity={targetOp} />
      </svg>

      <div style={{ position: 'absolute', top: cy - 18, left: cx - 110, width: 220, height: 36, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: targetOp }}>
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