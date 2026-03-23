import React, { useMemo } from 'react'
import { useCurrentFrame, interpolate } from 'remotion'

export const AnimationComponent = () => {
  const frame = useCurrentFrame()

  const title = "TITLE_TEXT"
  const compareLabel1 = "COMPARE_LABEL_1"
  const compareLabel2 = "COMPARE_VALUE_2" // Example of a potential placeholder
  const compareValue1 = "COMPARE_VALUE_1"
  const compareValue2 = "" // Example of an empty string
  const contextText = "CONTEXT_TEXT"

  const items = useMemo(() => {
    const rawItems = [
      { label: compareLabel1, value: compareValue1, color: 'PRIMARY_COLOR' },
      { label: compareLabel2, value: compareValue2, color: 'SECONDARY_COLOR' }
    ]
    return rawItems.filter(item => item.label !== '' && item.label !== 'Placeholder' && item.value !== '' && item.value !== 'Placeholder')
  }, [compareLabel1, compareLabel2, compareValue1, compareValue2])

  const itemCount = items.length
  const chartH = 480
  const chartBottom = 760
  const barWidth = 280
  const totalGap = 400
  const startX = itemCount === 1 ? 820 : 480
  const spacing = itemCount === 1 ? 0 : 680

  const titleOp = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const titleTy = interpolate(frame, [0, 20], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const barW = interpolate(frame, [10, 40], [0, 1920], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const axisOp = interpolate(frame, [15, 30], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const b1H = interpolate(frame, [25, 60], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const b2H = interpolate(frame, [35, 70], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const valueOp = interpolate(frame, [62, 78], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const labelOp = interpolate(frame, [68, 82], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const divW = interpolate(frame, [20, 50], [0, 600], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden', backgroundColor: 'BACKGROUND_COLOR' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 5, overflow: 'hidden', backgroundColor: 'PRIMARY_COLOR', opacity: titleOp }} />
      <div style={{ position: 'absolute', top: 1074, left: 0, width: barW, height: 6, overflow: 'hidden', backgroundColor: 'PRIMARY_COLOR' }} />
      <div style={{ position: 'absolute', top: 60, left: 0, width: 1920, height: 60, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: titleOp, transform: `translateY(${titleTy}px)` }}>
        <span style={{ fontSize: 28, fontWeight: 700, color: 'PRIMARY_COLOR', letterSpacing: 5, textTransform: 'uppercase', fontFamily: 'sans-serif' }}>{title}</span>
      </div>
      <div style={{ position: 'absolute', top: 170, left: 660, width: divW, height: 2, overflow: 'hidden', backgroundColor: 'ACCENT_COLOR' }} />
      <svg width={1920} height={1080} style={{ position: 'absolute', top: 0, left: 0 }}>
        <line x1={380} y1={chartBottom} x2={1540} y2={chartBottom} stroke="LINE_STROKE" strokeWidth={2} opacity={axisOp} />
        {[0.25, 0.5, 0.75, 1.0].map((r, i) => (
          <line key={i} x1={380} y1={chartBottom - r * chartH} x2={1540} y2={chartBottom - r * chartH} stroke="GRID_LINE" strokeWidth={1} strokeDasharray="6 4" opacity={axisOp} />
        ))}
      </svg>
      {items.map((item, i) => {
        const height = chartH * (i === 0 ? 0.55 * b1H : 1.0 * b2H)
        const x = startX + (i * spacing)
        return (
          <React.Fragment key={i}>
            <div style={{ position: 'absolute', top: chartBottom - height, left: x, width: barWidth, height: height, overflow: 'hidden', backgroundColor: item.color, borderRadius: '4px 4px 0 0' }} />
            <div style={{ position: 'absolute', top: chartBottom - height - 60, left: x, width: barWidth, height: 50, overflow: 'hidden', opacity: valueOp, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 44, fontWeight: 900, color: item.color, fontFamily: 'sans-serif' }}>{item.value}</span>
            </div>
            <div style={{ position: 'absolute', top: chartBottom + 20, left: x, width: barWidth, height: 50, overflow: 'hidden', opacity: labelOp, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 24, fontWeight: 600, color: 'SUPPORT_COLOR', fontFamily: 'sans-serif', textAlign: 'center', textTransform: 'uppercase', letterSpacing: 2 }}>{item.label}</span>
            </div>
          </React.Fragment>
        )
      })}
      {itemCount > 1 && (
        <div style={{ position: 'absolute', top: chartBottom - chartH / 2 - 30, left: 940, width: 40, height: 60, overflow: 'hidden', opacity: axisOp, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 28, fontWeight: 900, color: 'ACCENT_COLOR', fontFamily: 'sans-serif' }}>VS</span>
        </div>
      )}
      <div style={{ position: 'absolute', top: chartBottom + 100, left: 0, width: 1920, height: 50, overflow: 'hidden', opacity: labelOp, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 22, fontWeight: 400, color: 'SUPPORT_COLOR', fontFamily: 'sans-serif', textAlign: 'center' }}>{contextText}</span>
      </div>
    </div>
  )
}

export default AnimationComponent