import React, { useMemo } from 'react'
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion'

export const AnimationComponent = () => {
  const frame = useCurrentFrame()

  const titleOp = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  const titleText = "TITLE_TEXT"

  const rawEvents = [
    { label: 'NODE_LABEL_1', date: 'DATE_1', y: 380, delay: 12 },
    { label: 'NODE_LABEL_2', date: 'DATE_2', y: 560, delay: 24 },
    { label: 'NODE_LABEL_3', date: 'DATE_3', y: 420, delay: 36 },
    { label: 'NODE_LABEL_4', date: 'DATE_4', y: 640, delay: 48 },
    { label: 'NODE_LABEL_5', date: 'DATE_5', y: 360, delay: 60 },
  ]

  const events = useMemo(() => {
    return rawEvents.filter(ev => ev.label !== '' && ev.label !== 'Placeholder' && ev.date !== '' && ev.date !== 'Placeholder')
  }, [])

  const count = events.length
  const totalWidth = 1920
  const padding = 240
  const xPositions = useMemo(() => {
    if (count === 0) return []
    const step = (totalWidth - (padding * 2)) / (count > 1 ? count - 1 : 1)
    return Array.from({ length: count }, (_, i) => padding + (i * step))
  }, [count])

  const spineY = 540

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

      {/* Title */}
      <div style={{
        position: 'absolute',
        top: 60,
        left: 100,
        width: 1720,
        height: 60,
        overflow: 'hidden',
        fontSize: 22,
        fontWeight: 700,
        color: 'ACCENT_COLOR',
        letterSpacing: 6,
        textTransform: 'uppercase',
        opacity: titleOp,
      }}>
        {titleText}
      </div>

      <svg width={1920} height={1080} style={{ position: 'absolute', top: 0, left: 0 }}>
        {/* Spine */}
        {count > 0 && <line x1={140} y1={spineY} x2={1780} y2={spineY} stroke="GRID_LINE" strokeWidth={2} opacity={titleOp} />}

        {/* Animated spine progress */}
        {events.map((ev, i) => {
          const lineOp = interpolate(frame, [ev.delay - 4, ev.delay + 8], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          })
          const nx = xPositions[i]
          const connY1 = ev.y < spineY ? ev.y + 28 : spineY
          const connY2 = ev.y < spineY ? spineY : ev.y - 28
          return (
            <g key={i} opacity={lineOp}>
              <line
                x1={nx}
                y1={connY1}
                x2={nx}
                y2={connY2}
                stroke="LINE_STROKE"
                strokeWidth={2}
                strokeDasharray="4 4"
              />
              <circle cx={nx} cy={spineY} r={8} fill="ACCENT_COLOR" />
            </g>
          )
        })}

        {/* Event nodes */}
        {events.map((ev, i) => {
          const nx = xPositions[i]
          const nodeOp = interpolate(frame, [ev.delay, ev.delay + 14], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          })
          const nodeR = interpolate(frame, [ev.delay, ev.delay + 14], [0, 28], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          })
          return (
            <g key={i} opacity={nodeOp}>
              <circle cx={nx} cy={ev.y} r={nodeR + 6} fill="NODE_FILL" opacity={0.3} />
              <circle cx={nx} cy={ev.y} r={nodeR} fill="NODE_FILL" stroke="PRIMARY_COLOR" strokeWidth={3} />
              <text x={nx} y={ev.y + 7} textAnchor="middle" fill="ACCENT_COLOR" fontSize={16} fontWeight="800">
                {i + 1}
              </text>
            </g>
          )
        })}
      </svg>

      {/* Event labels */}
      {events.map((ev, i) => {
        const nx = xPositions[i]
        const labelOp = interpolate(frame, [ev.delay + 8, ev.delay + 22], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        })
        const isAbove = ev.y < spineY
        const labelTop = isAbove ? ev.y - 110 : ev.y + 44
        return (
          <div key={i} style={{
            position: 'absolute',
            top: labelTop,
            left: nx - 140,
            width: 280,
            height: 90,
            overflow: 'hidden',
            opacity: labelOp,
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: 280,
              height: 30,
              overflow: 'hidden',
              fontSize: 17,
              fontWeight: 700,
              color: 'ACCENT_COLOR',
              textAlign: 'center',
              letterSpacing: 2,
            }}>
              {ev.date}
            </div>
            <div style={{
              position: 'absolute',
              top: 32,
              left: 0,
              width: 280,
              height: 56,
              overflow: 'hidden',
              fontSize: 21,
              fontWeight: 700,
              color: 'TEXT_ON_PRIMARY',
              textAlign: 'center',
              lineHeight: 1.3,
            }}>
              {ev.label}
            </div>
          </div>
        )
      })}

      {/* Bottom bar */}
      <div style={{
        position: 'absolute',
        top: 1020,
        left: 0,
        width: 1920,
        height: 4,
        overflow: 'hidden',
        backgroundColor: 'ACCENT_COLOR',
        opacity: titleOp,
      }} />
    </div>
  )
}

export default AnimationComponent