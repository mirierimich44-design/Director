import React, { useMemo } from 'react'
import { useCurrentFrame, interpolate } from 'remotion'

export const AnimationComponent = () => {
  const frame = useCurrentFrame()

  const rawEvents = ["EVENT_1", "EVENT_2", "EVENT_3", "EVENT_4", "EVENT_5", "EVENT_6"]
  const rawDates = ["DATE_1", "DATE_2", "DATE_3", "DATE_4", "DATE_5", "DATE_6"]

  const data = useMemo(() => {
    return rawEvents
      .map((event, i) => ({ event, date: rawDates[i] }))
      .filter(item => item.event !== '' && item.event !== 'Placeholder' && item.date !== '' && item.date !== 'Placeholder')
  }, [])

  const count = data.length
  const events = data.map(d => d.event)
  const dates = data.map(d => d.date)

  const nodeXPositions = useMemo(() => {
    const start = 200
    const end = 1720
    const step = count > 1 ? (end - start) / (count - 1) : 0
    return Array.from({ length: count }, (_, i) => start + i * step)
  }, [count])

  const titleOp = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const titleTy = interpolate(frame, [0, 20], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const lineW = interpolate(frame, [15, 55], [0, count > 1 ? nodeXPositions[count - 1] - nodeXPositions[0] : 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  const nodeOpacities = Array.from({ length: count }, (_, i) => interpolate(frame, [20 + i * 8, 35 + i * 8], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }))
  const nodeScales = Array.from({ length: count }, (_, i) => interpolate(frame, [20 + i * 8, 35 + i * 8], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }))
  const labelOpacities = Array.from({ length: count }, (_, i) => interpolate(frame, [30 + i * 8, 45 + i * 8], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }))

  const lineY = 540
  const labelAbove = Array.from({ length: count }, (_, i) => i % 2 === 0)

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
        {count > 0 && <line x1={nodeXPositions[0]} y1={lineY} x2={nodeXPositions[0] + lineW} y2={lineY} stroke="LINE_STROKE" strokeWidth={3} />}
        {nodeXPositions.map((x, i) => (
          <g key={i} opacity={nodeOpacities[i]}>
            <circle cx={x} cy={lineY} r={18} fill="CHART_BG" stroke="NODE_STROKE" strokeWidth={2} transform={`scale(${nodeScales[i]})`} style={{ transformOrigin: `${x}px ${lineY}px` }} />
            <circle cx={x} cy={lineY} r={9} fill="NODE_FILL" transform={`scale(${nodeScales[i]})`} style={{ transformOrigin: `${x}px ${lineY}px` }} />
          </g>
        ))}
      </svg>

      {nodeXPositions.map((x, i) => {
        const above = labelAbove[i]
        return (
          <div key={i} style={{
            position: 'absolute',
            top: above ? lineY - 220 : lineY + 40,
            left: x - 140,
            width: 280,
            height: 180,
            overflow: 'hidden',
            opacity: labelOpacities[i],
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: 280,
              height: 36,
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <span style={{
                fontSize: 22,
                fontWeight: 700,
                color: 'ACCENT_COLOR',
                fontFamily: 'sans-serif',
                letterSpacing: 2,
                textTransform: 'uppercase',
              }}>
                {dates[i]}
              </span>
            </div>

            <div style={{
              position: 'absolute',
              top: 42,
              left: 138,
              width: 4,
              height: 30,
              overflow: 'hidden',
              backgroundColor: 'GRID_LINE',
            }} />

            <div style={{
              position: 'absolute',
              top: 78,
              left: 0,
              width: 280,
              height: 100,
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'center',
            }}>
              <span style={{
                fontSize: 20,
                fontWeight: 500,
                color: 'TEXT_ON_SECONDARY',
                fontFamily: 'sans-serif',
                textAlign: 'center',
                lineHeight: 1.45,
              }}>
                {events[i]}
              </span>
            </div>
          </div>
        )
      })}

    </div>
  )
}

export default AnimationComponent