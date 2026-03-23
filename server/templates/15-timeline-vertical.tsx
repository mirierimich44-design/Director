import React, { useMemo } from 'react'
import { useCurrentFrame, interpolate } from 'remotion'

export const AnimationComponent = () => {
  const frame = useCurrentFrame()

  const rawDates = ["DATE_1", "DATE_2", "DATE_3", "DATE_4", "DATE_5"]
  const rawEvents = ["EVENT_1", "EVENT_2", "EVENT_3", "EVENT_4", "EVENT_5"]
  const rawTags = ["TAG_1", "TAG_2", "TAG_3", "TAG_4", "TAG_5"]

  const items = useMemo(() => {
    return rawDates
      .map((date, i) => ({ date, event: rawEvents[i], tag: rawTags[i] }))
      .filter(item => item.date !== '' && item.date !== 'Placeholder' && item.event !== '' && item.event !== 'Placeholder')
  }, [])

  const count = items.length
  const itemSpacing = 150
  const lineTop = 150
  const lineX = 400

  const titleOp = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const titleTy = interpolate(frame, [0, 20], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const barW = interpolate(frame, [10, 40], [0, 1920], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const lineH = interpolate(frame, [18, 65], [0, Math.max(0, (count - 1) * itemSpacing + 80)], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  const itemAnimations = Array.from({ length: count }).map((_, i) => {
    const start = 22 + i * 12
    const end = 36 + i * 12
    const op = interpolate(frame, [start, end], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    const tx = interpolate(frame, [start, end], [30, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    const scale = interpolate(frame, [start, end], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    return { op, tx, scale }
  })

  const title = "TITLE_TEXT"

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden', backgroundColor: 'BACKGROUND_COLOR' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 5, overflow: 'hidden', backgroundColor: 'PRIMARY_COLOR', opacity: titleOp }} />
      <div style={{ position: 'absolute', top: 1074, left: 0, width: barW, height: 6, overflow: 'hidden', backgroundColor: 'PRIMARY_COLOR' }} />
      <div style={{ position: 'absolute', top: 60, left: 0, width: 1920, height: 60, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: titleOp, transform: `translateY(${titleTy}px)` }}>
        <span style={{ fontSize: 26, fontWeight: 700, color: 'PRIMARY_COLOR', letterSpacing: 5, textTransform: 'uppercase', fontFamily: 'sans-serif' }}>{title}</span>
      </div>
      <div style={{ position: 'absolute', top: lineTop, left: lineX - 2, width: 4, height: lineH, overflow: 'hidden', backgroundColor: 'LINE_STROKE' }} />
      <svg width={1920} height={1080} style={{ position: 'absolute', top: 0, left: 0 }}>
        {items.map((_, i) => {
          const cy = lineTop + 40 + i * itemSpacing
          return (
            <g key={i}>
              <circle cx={lineX} cy={cy} r={20} fill="CHART_BG" stroke="NODE_STROKE" strokeWidth={2} opacity={itemAnimations[i].op} transform={`scale(${itemAnimations[i].scale})`} style={{ transformOrigin: `${lineX}px ${cy}px` }} />
              <circle cx={lineX} cy={cy} r={10} fill={i === count - 1 ? 'SECONDARY_COLOR' : 'PRIMARY_COLOR'} opacity={itemAnimations[i].op} transform={`scale(${itemAnimations[i].scale})`} style={{ transformOrigin: `${lineX}px ${cy}px` }} />
            </g>
          )
        })}
      </svg>
      {items.map((item, i) => {
        const itemY = lineTop + 40 + i * itemSpacing
        return (
          <div key={i}>
            <div style={{ position: 'absolute', top: itemY - 18, left: 160, width: 200, height: 40, overflow: 'hidden', opacity: itemAnimations[i].op, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
              <span style={{ fontSize: 20, fontWeight: 700, color: 'ACCENT_COLOR', fontFamily: 'sans-serif', letterSpacing: 1, textTransform: 'uppercase' }}>{item.date}</span>
            </div>
            <div style={{ position: 'absolute', top: itemY - 40, left: lineX + 48, width: 1200, height: 84, overflow: 'hidden', opacity: itemAnimations[i].op, transform: `translateX(${itemAnimations[i].tx}px)`, backgroundColor: i === count - 1 ? 'PRIMARY_COLOR' : 'CHART_BG', borderRadius: 6, border: i === count - 1 ? 'none' : '1px solid', borderColor: 'CHART_BORDER', boxSizing: 'border-box' }}>
              <div style={{ position: 'absolute', top: 12, left: 20, width: 120, height: 32, overflow: 'hidden', backgroundColor: 'SECONDARY_COLOR', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'TEXT_ON_SECONDARY', fontFamily: 'sans-serif', letterSpacing: 1, textTransform: 'uppercase' }}>{item.tag}</span>
              </div>
              <div style={{ position: 'absolute', top: 12, left: 156, width: 1000, height: 60, overflow: 'hidden' }}>
                <span style={{ fontSize: 26, fontWeight: i === count - 1 ? 700 : 500, color: i === count - 1 ? 'TEXT_ON_PRIMARY' : 'TEXT_ON_SECONDARY', fontFamily: 'sans-serif', lineHeight: 1.3 }}>{item.event}</span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default AnimationComponent