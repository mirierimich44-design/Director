import React, { useMemo } from 'react'
import { useCurrentFrame, interpolate } from 'remotion'

export const AnimationComponent = () => {
  const frame = useCurrentFrame()

  const title = "TITLE_TEXT"
  const rawEvents = ["EVENT_1","EVENT_2","EVENT_3","EVENT_4","EVENT_5","EVENT_6"]
  const rawDates = ["DATE_1","DATE_2","DATE_3","DATE_4","DATE_5","DATE_6"]

  const activeItems = useMemo(() => {
    return rawEvents
      .map((event, i) => ({ event, date: rawDates[i] }))
      .filter(item => item.event !== '' && item.event !== 'Placeholder' && item.date !== '' && item.date !== 'Placeholder')
  }, [])

  const count = activeItems.length
  const events = activeItems.map(i => i.event)
  const dates = activeItems.map(i => i.date)

  const titleOp = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const titleTy = interpolate(frame, [0, 20], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const barW = interpolate(frame, [10, 40], [0, 1920], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const ringDash = interpolate(frame, [15, 65], [1800, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const ringOp = interpolate(frame, [15, 30], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  const eventOpacities = Array.from({ length: count }).map((_, i) => 
    interpolate(frame, [25 + i * 10, 40 + i * 10], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  )
  const labelOp = interpolate(frame, [80, 95], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  const cx = 960
  const cy = 560
  const r = 340

  const angles = Array.from({ length: count }).map((_, i) => ((270 + (i * (360 / count))) * Math.PI) / 180)
  const points = angles.map(a => ({ x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) }))
  const circumference = 2 * Math.PI * r

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden', backgroundColor: 'BACKGROUND_COLOR' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 5, overflow: 'hidden', backgroundColor: 'PRIMARY_COLOR', opacity: titleOp }} />
      <div style={{ position: 'absolute', top: 1074, left: 0, width: barW, height: 6, overflow: 'hidden', backgroundColor: 'PRIMARY_COLOR' }} />
      <div style={{ position: 'absolute', top: 40, left: 0, width: 1920, height: 60, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: titleOp, transform: `translateY(${titleTy}px)` }}>
        <span style={{ fontSize: 26, fontWeight: 700, color: 'PRIMARY_COLOR', letterSpacing: 5, textTransform: 'uppercase', fontFamily: 'sans-serif' }}>{title}</span>
      </div>

      <svg width={1920} height={1080} style={{ position: 'absolute', top: 0, left: 0 }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="LINE_STROKE" strokeWidth={3} strokeDasharray={circumference} strokeDashoffset={ringDash} opacity={ringOp} style={{ transformOrigin: `${cx}px ${cy}px`, transform: 'rotate(-90deg)' }} />
        <circle cx={cx} cy={cy} r={r - 30} fill="none" stroke="GRID_LINE" strokeWidth={1} opacity={ringOp * 0.3} />

        {points.map((p, i) => (
          <g key={i} opacity={eventOpacities[i]}>
            <circle cx={p.x} cy={p.y} r={22} fill="CHART_BG" stroke={i === 0 ? 'SECONDARY_COLOR' : 'NODE_STROKE'} strokeWidth={2} />
            <circle cx={p.x} cy={p.y} r={11} fill={i === 0 ? 'SECONDARY_COLOR' : 'PRIMARY_COLOR'} />
          </g>
        ))}

        {points.map((p, i) => (
          <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="GRID_LINE" strokeWidth={1} strokeDasharray="4 6" opacity={eventOpacities[i] * 0.3} />
        ))}

        <circle cx={cx} cy={cy} r={50} fill="PRIMARY_COLOR" opacity={ringOp} />
        <circle cx={cx} cy={cy} r={30} fill="BACKGROUND_COLOR" opacity={ringOp} />
      </svg>

      <div style={{ position: 'absolute', top: cy - 14, left: cx - 80, width: 160, height: 28, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: ringOp }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'PRIMARY_COLOR', fontFamily: 'sans-serif', textTransform: 'uppercase', letterSpacing: 1 }}>{title}</span>
      </div>

      {points.map((p, i) => {
        const isLeft = p.x < cx - 50
        const isRight = p.x > cx + 50
        const isTop = p.y < cy - 50
        const labelX = isLeft ? p.x - 220 : isRight ? p.x + 34 : p.x - 110
        const labelY = isTop ? p.y - 80 : p.y + 34
        return (
          <div key={i} style={{ position: 'absolute', top: labelY, left: labelX, width: 200, height: 70, overflow: 'hidden', opacity: labelOp }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: 200, height: 28, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: isLeft ? 'flex-end' : 'flex-start' }}>
              <span style={{ fontSize: 18, fontWeight: 700, color: 'ACCENT_COLOR', fontFamily: 'sans-serif', letterSpacing: 1, textTransform: 'uppercase' }}>{dates[i]}</span>
            </div>
            <div style={{ position: 'absolute', top: 32, left: 0, width: 200, height: 38, overflow: 'hidden', display: 'flex', alignItems: 'flex-start', justifyContent: isLeft ? 'flex-end' : 'flex-start' }}>
              <span style={{ fontSize: 17, fontWeight: 500, color: 'PRIMARY_COLOR', fontFamily: 'sans-serif', textAlign: isLeft ? 'right' : 'left', lineHeight: 1.3 }}>{events[i]}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default AnimationComponent