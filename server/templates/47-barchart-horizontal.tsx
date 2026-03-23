import React, { useMemo } from 'react'
import { useCurrentFrame, interpolate } from 'remotion'

export const AnimationComponent = () => {
  const frame = useCurrentFrame()

  const title = "TITLE_TEXT"
  const rawLabels = ["BAR_LABEL_1", "BAR_LABEL_2", "BAR_LABEL_3", "BAR_LABEL_4"]
  const rawValues = ["BAR_VALUE_1", "BAR_VALUE_2", "BAR_VALUE_3", "BAR_VALUE_4"]
  const rawRatios = [0.55, 0.72, 0.88, 1.0]

  const data = useMemo(() => {
    return rawLabels
      .map((label, i) => ({ label, value: rawValues[i], ratio: rawRatios[i] }))
      .filter(item => item.label !== '' && item.label !== 'Placeholder' && item.value !== '' && item.value !== 'Placeholder')
  }, [])

  const itemCount = data.length
  const titleOp = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const titleTy = interpolate(frame, [0, 20], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const barW = interpolate(frame, [10, 40], [0, 1920], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const axisOp = interpolate(frame, [15, 28], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  const growProgress = data.map((_, i) => interpolate(frame, [22 + i * 8, 52 + i * 8], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }))
  const labelOp = interpolate(frame, [70, 84], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  const maxBarW = 1100
  const barH = 72
  const barGap = 36
  const startX = 360
  const startY = 220

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden', backgroundColor: 'BACKGROUND_COLOR' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 5, overflow: 'hidden', backgroundColor: 'PRIMARY_COLOR', opacity: titleOp }} />
      <div style={{ position: 'absolute', top: 1074, left: 0, width: barW, height: 6, overflow: 'hidden', backgroundColor: 'PRIMARY_COLOR' }} />
      <div style={{ position: 'absolute', top: 60, left: 0, width: 1920, height: 60, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: titleOp, transform: `translateY(${titleTy}px)` }}>
        <span style={{ fontSize: 28, fontWeight: 700, color: 'PRIMARY_COLOR', letterSpacing: 5, textTransform: 'uppercase', fontFamily: 'sans-serif' }}>{title}</span>
      </div>
      <svg width={1920} height={1080} style={{ position: 'absolute', top: 0, left: 0 }}>
        <line x1={startX} y1={startY - 10} x2={startX} y2={startY + itemCount * (barH + barGap) - barGap + 10} stroke="LINE_STROKE" strokeWidth={2} opacity={axisOp} />
      </svg>
      {data.map((item, i) => {
        const y = startY + i * (barH + barGap)
        const currentW = maxBarW * item.ratio * growProgress[i]
        const isLast = i === itemCount - 1
        return (
          <div key={i}>
            <div style={{ position: 'absolute', top: y, left: startX, width: currentW, height: barH, overflow: 'hidden', backgroundColor: isLast ? 'PRIMARY_COLOR' : 'SECONDARY_COLOR', borderRadius: '0 4px 4px 0' }} />
            <div style={{ position: 'absolute', top: y, left: 80, width: 260, height: barH, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', opacity: axisOp }}>
              <span style={{ fontSize: 22, fontWeight: 600, color: 'SUPPORT_COLOR', fontFamily: 'sans-serif', textAlign: 'right' }}>{item.label}</span>
            </div>
            <div style={{ position: 'absolute', top: y, left: startX + currentW + 16, width: 200, height: barH, overflow: 'hidden', display: 'flex', alignItems: 'center', opacity: labelOp }}>
              <span style={{ fontSize: 28, fontWeight: 800, color: isLast ? 'PRIMARY_COLOR' : 'ACCENT_COLOR', fontFamily: 'sans-serif' }}>{item.value}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default AnimationComponent