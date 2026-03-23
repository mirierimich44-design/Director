import React, { useMemo } from 'react'
import { useCurrentFrame, interpolate } from 'remotion'

export const AnimationComponent = () => {
  const frame = useCurrentFrame()

  const title = "TITLE_TEXT"
  const rawBarLabels = ["BAR_LABEL_1", "BAR_LABEL_2", "BAR_LABEL_3", "BAR_LABEL_4"]
  const rawBarValues = ["BAR_VALUE_1", "BAR_VALUE_2", "BAR_VALUE_3", "BAR_VALUE_4"]
  const rawBarHeightRatios = [0.55, 0.70, 0.82, 1.0]

  // Filter items early
  const items = useMemo(() => {
    return rawBarLabels
      .map((label, i) => ({
        label,
        value: rawBarValues[i],
        ratio: rawBarHeightRatios[i]
      }))
      .filter(item => item.label !== '' && item.label !== 'Placeholder' && item.value !== '' && item.value !== 'Placeholder')
  }, [])

  const itemCount = items.length

  const titleOp = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const titleTy = interpolate(frame, [0, 20], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const axisOp = interpolate(frame, [15, 30], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  // Dynamic staggered animations based on filtered count
  const barGrowProgress = items.map((_, i) => 
    interpolate(frame, [25 + (i * 7), 55 + (i * 7)], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  )
  const valueOpacities = items.map((_, i) => 
    interpolate(frame, [55 + (i * 7), 68 + (i * 7)], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  )

  const labelOp = interpolate(frame, [60, 75], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const barW = interpolate(frame, [15, 45], [0, 1920], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  const chartH = 500
  const chartTop = 200
  const chartBottom = chartTop + chartH
  const barWidth = 180
  const barGap = 100
  const totalBarsW = itemCount * barWidth + (itemCount - 1) * barGap
  const startX = (1920 - totalBarsW) / 2

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: 1920,
      height: 1080,
      overflow: 'hidden',
      backgroundColor: 'BACKGROUND_COLOR',
    }}>

      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: 1920,
        height: 5,
        overflow: 'hidden',
        backgroundColor: 'PRIMARY_COLOR',
        opacity: titleOp,
      }} />

      <div style={{
        position: 'absolute',
        top: 1074,
        left: 0,
        width: barW,
        height: 6,
        overflow: 'hidden',
        backgroundColor: 'PRIMARY_COLOR',
      }} />

      <div style={{
        position: 'absolute',
        top: 60,
        left: 0,
        width: 1920,
        height: 60,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: titleOp,
        transform: `translateY(${titleTy}px)`,
      }}>
        <span style={{
          fontSize: 28,
          fontWeight: 700,
          color: 'PRIMARY_COLOR',
          letterSpacing: 5,
          textTransform: 'uppercase',
          fontFamily: 'sans-serif',
        }}>
          {title}
        </span>
      </div>

      <svg width={1920} height={1080} style={{ position: 'absolute', top: 0, left: 0 }}>
        {[0.25, 0.5, 0.75, 1.0].map((ratio, i) => {
          const y = chartBottom - ratio * chartH
          return (
            <g key={i} opacity={axisOp}>
              <line
                x1={startX - 20}
                y1={y}
                x2={startX + totalBarsW + 20}
                y2={y}
                stroke="GRID_LINE"
                strokeWidth={1}
                strokeDasharray="6 4"
              />
            </g>
          )
        })}
        <line
          x1={startX - 20}
          y1={chartBottom}
          x2={startX + totalBarsW + 20}
          y2={chartBottom}
          stroke="LINE_STROKE"
          strokeWidth={2}
          opacity={axisOp}
        />
      </svg>

      {items.map((item, i) => {
        const x = startX + i * (barWidth + barGap)
        const maxH = item.ratio * chartH
        const currentH = maxH * barGrowProgress[i]
        const barTop = chartBottom - currentH

        return (
          <div key={i}>
            <div style={{
              position: 'absolute',
              top: barTop,
              left: x,
              width: barWidth,
              height: currentH,
              overflow: 'hidden',
              backgroundColor: i === itemCount - 1 ? 'PRIMARY_COLOR' : 'SECONDARY_COLOR',
              borderRadius: '4px 4px 0 0',
            }} />

            <div style={{
              position: 'absolute',
              top: barTop - 50,
              left: x,
              width: barWidth,
              height: 44,
              overflow: 'hidden',
              opacity: valueOpacities[i],
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <span style={{
                fontSize: 30,
                fontWeight: 800,
                color: i === itemCount - 1 ? 'PRIMARY_COLOR' : 'ACCENT_COLOR',
                fontFamily: 'sans-serif',
              }}>
                {item.value}
              </span>
            </div>

            <div style={{
              position: 'absolute',
              top: chartBottom + 16,
              left: x,
              width: barWidth,
              height: 40,
              overflow: 'hidden',
              opacity: labelOp,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <span style={{
                fontSize: 22,
                fontWeight: 500,
                color: 'SUPPORT_COLOR',
                fontFamily: 'sans-serif',
                textAlign: 'center',
              }}>
                {item.label}
              </span>
            </div>
          </div>
        )
      })}

    </div>
  )
}

export default AnimationComponent