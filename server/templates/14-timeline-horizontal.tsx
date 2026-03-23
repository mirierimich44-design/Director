import React, { useMemo } from 'react'
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion'

export const AnimationComponent = () => {
  const frame = useCurrentFrame()

  // Content
  const rawEvents = ["EVENT_1", "EVENT_2", "EVENT_3", "EVENT_4", "EVENT_5", "EVENT_6"]
  const rawDates = ["DATE_1", "DATE_2", "DATE_3", "DATE_4", "DATE_5", "DATE_6"]

  // Filter out empty or placeholder items
  const data = useMemo(() => {
    return rawEvents
      .map((event, i) => ({ event, date: rawDates[i] }))
      .filter(item => item.event !== '' && item.event !== 'Placeholder' && item.date !== '' && item.date !== 'Placeholder')
  }, [])

  const count = data.length
  const events = data.map(d => d.event)
  const dates = data.map(d => d.date)

  // Layout math
  const startX = 200
  const totalWidth = 1520
  const nodeXPositions = Array.from({ length: count }, (_, i) => 
    count > 1 ? startX + (i * (totalWidth / (count - 1))) : startX
  )
  const lineY = 540
  const labelAbove = Array.from({ length: count }, (_, i) => i % 2 === 0)

  // Title
  const titleOp = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const titleTy = interpolate(frame, [0, 20], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  // Main line draw
  const lineW = interpolate(frame, [15, 55], [0, totalWidth], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  // Staggered animations
  const nodeOpacities = Array.from({ length: count }, (_, i) => 
    interpolate(frame, [20 + (i * 8), 35 + (i * 8)], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  )
  const nodeScales = Array.from({ length: count }, (_, i) => 
    interpolate(frame, [20 + (i * 8), 35 + (i * 8)], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  )
  const labelOpacities = Array.from({ length: count }, (_, i) => 
    interpolate(frame, [30 + (i * 8), 45 + (i * 8)], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  )

  const title = "TITLE_TEXT"

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
        top: 80,
        left: 0,
        width: 1920,
        height: 70,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: titleOp,
        transform: `translateY(${titleTy}px)`,
      }}>
        <span style={{
          fontSize: 30,
          fontWeight: 700,
          color: 'PRIMARY_COLOR',
          letterSpacing: 5,
          textTransform: 'uppercase',
          fontFamily: 'sans-serif',
        }}>
          {title}
        </span>
      </div>

      <svg
        width={1920}
        height={1080}
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        <line
          x1={startX}
          y1={lineY}
          x2={startX + lineW}
          y2={lineY}
          stroke="LINE_STROKE"
          strokeWidth={3}
        />

        {nodeXPositions.map((x, i) => (
          <g key={i} style={{ opacity: nodeOpacities[i] }}>
            <circle
              cx={x}
              cy={lineY}
              r={18}
              fill="CHART_BG"
              stroke="NODE_STROKE"
              strokeWidth={2}
              transform={`scale(${nodeScales[i]})`}
              style={{ transformOrigin: `${x}px ${lineY}px` }}
            />
            <circle
              cx={x}
              cy={lineY}
              r={8}
              fill="NODE_FILL"
              style={{ opacity: nodeOpacities[i] }}
            />
          </g>
        ))}
      </svg>

      {nodeXPositions.map((x, i) => {
        const above = labelAbove[i]
        const topPos = above ? lineY - 180 : lineY + 50
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: topPos,
              left: x - 120,
              width: 240,
              height: 130,
              overflow: 'hidden',
              opacity: labelOpacities[i],
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <span style={{
              fontSize: 20,
              fontWeight: 700,
              color: 'ACCENT_COLOR',
              fontFamily: 'sans-serif',
              letterSpacing: 2,
              textTransform: 'uppercase',
              marginBottom: 8,
            }}>
              {dates[i]}
            </span>
            <div style={{
              width: 2,
              height: 20,
              backgroundColor: 'GRID_LINE',
              marginBottom: 8,
            }} />
            <span style={{
              fontSize: 18,
              fontWeight: 500,
              color: 'TEXT_ON_SECONDARY',
              fontFamily: 'sans-serif',
              textAlign: 'center',
              lineHeight: 1.4,
            }}>
              {events[i]}
            </span>
          </div>
        )
      })}
    </div>
  )
}

export default AnimationComponent