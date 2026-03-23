import React, { useMemo } from 'react'
import { useCurrentFrame, interpolate } from 'remotion'

export const AnimationComponent = () => {
  const frame = useCurrentFrame()

  const title = "TITLE_TEXT"
  const rawLineValues = ["LINE_VALUE_1", "LINE_VALUE_2", "LINE_VALUE_3", "LINE_VALUE_4", "LINE_VALUE_5"]
  const rawXLabels = ["DATE_1", "DATE_2", "DATE_3", "DATE_4", "DATE_5"]

  // Filter data early
  const data = useMemo(() => {
    return rawLineValues
      .map((val, i) => ({ val, label: rawXLabels[i] }))
      .filter(item => item.val !== '' && item.val !== 'Placeholder' && item.label !== '' && item.label !== 'Placeholder')
  }, [])

  const lineValues = data.map(d => d.val)
  const xLabels = data.map(d => d.label)
  const itemCount = data.length

  const titleOp = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const titleTy = interpolate(frame, [0, 20], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const axisOp = interpolate(frame, [15, 30], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const lineProgress = interpolate(frame, [28, 75], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const dotOp = interpolate(frame, [72, 85], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const labelOp = interpolate(frame, [78, 92], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const accentOp = interpolate(frame, [80, 95], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const barW = interpolate(frame, [15, 45], [0, 1920], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  // Chart area
  const chartLeft = 200
  const chartRight = 1720
  const chartTop = 200
  const chartBottom = 780
  const chartW = chartRight - chartLeft
  const chartH = chartBottom - chartTop

  // Dynamic data points based on filtered count
  const dataPoints = useMemo(() => {
    const yRatios = [0.75, 0.55, 0.65, 0.35, 0.15]
    return Array.from({ length: itemCount }).map((_, i) => ({
      x: chartLeft + (itemCount > 1 ? (chartW / (itemCount - 1)) * i : 0),
      yRatio: yRatios[i % yRatios.length]
    }))
  }, [itemCount, chartLeft, chartW])

  const points = dataPoints.map(p => ({
    x: p.x,
    y: chartBottom - p.yRatio * chartH,
  }))

  const totalSegments = Math.max(1, points.length - 1)
  const progressInSegments = lineProgress * (points.length - 1)
  const fullSegmentsDone = Math.floor(progressInSegments)
  const partialProgress = progressInSegments - fullSegmentsDone

  const visiblePoints: { x: number; y: number }[] = []
  for (let i = 0; i <= fullSegmentsDone && i < points.length; i++) {
    visiblePoints.push(points[i])
  }
  if (fullSegmentsDone < points.length - 1) {
    const from = points[fullSegmentsDone]
    const to = points[fullSegmentsDone + 1]
    visiblePoints.push({
      x: from.x + (to.x - from.x) * partialProgress,
      y: from.y + (to.y - from.y) * partialProgress,
    })
  }

  const polylineStr = visiblePoints.map(p => `${p.x},${p.y}`).join(' ')
  const areaStr = visiblePoints.length > 0 ? polylineStr + ` ${visiblePoints[visiblePoints.length - 1].x},${chartBottom} ${visiblePoints[0].x},${chartBottom}` : ''

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
        {[0.25, 0.5, 0.75, 1.0].map((r, i) => (
          <line
            key={i}
            x1={chartLeft}
            y1={chartBottom - r * chartH}
            x2={chartRight}
            y2={chartBottom - r * chartH}
            stroke="GRID_LINE"
            strokeWidth={1}
            strokeDasharray="6 4"
            opacity={axisOp}
          />
        ))}

        <line x1={chartLeft} y1={chartTop} x2={chartLeft} y2={chartBottom} stroke="LINE_STROKE" strokeWidth={2} opacity={axisOp} />
        <line x1={chartLeft} y1={chartBottom} x2={chartRight} y2={chartBottom} stroke="LINE_STROKE" strokeWidth={2} opacity={axisOp} />

        {visiblePoints.length > 1 && (
          <polygon points={areaStr} fill="PRIMARY_COLOR" opacity={0.08} />
        )}

        {visiblePoints.length > 1 && (
          <polyline
            points={polylineStr}
            fill="none"
            stroke="PRIMARY_COLOR"
            strokeWidth={4}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        )}

        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={10}
            fill="BACKGROUND_COLOR"
            stroke="PRIMARY_COLOR"
            strokeWidth={3}
            opacity={dotOp}
          />
        ))}

        {points.length > 0 && (
          <>
            <circle
              cx={points[points.length - 1].x}
              cy={points[points.length - 1].y}
              r={16}
              fill="PRIMARY_COLOR"
              opacity={accentOp}
            />
            <circle
              cx={points[points.length - 1].x}
              cy={points[points.length - 1].y}
              r={8}
              fill="BACKGROUND_COLOR"
              opacity={accentOp}
            />
          </>
        )}
      </svg>

      {points.map((p, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            top: chartBottom + 16,
            left: p.x - 80,
            width: 160,
            height: 40,
            overflow: 'hidden',
            opacity: labelOp,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span style={{
            fontSize: 20,
            fontWeight: 500,
            color: 'SUPPORT_COLOR',
            fontFamily: 'sans-serif',
            textAlign: 'center',
          }}>
            {xLabels[i]}
          </span>
        </div>
      ))}

      {points.map((p, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            top: p.y - 52,
            left: p.x - 80,
            width: 160,
            height: 40,
            overflow: 'hidden',
            opacity: labelOp,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span style={{
            fontSize: 22,
            fontWeight: 700,
            color: i === points.length - 1 ? 'PRIMARY_COLOR' : 'ACCENT_COLOR',
            fontFamily: 'sans-serif',
          }}>
            {lineValues[i]}
          </span>
        </div>
      ))}
    </div>
  )
}

export default AnimationComponent