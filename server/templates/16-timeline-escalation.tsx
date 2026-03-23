import React, { useMemo } from 'react'
import { useCurrentFrame, interpolate } from 'remotion'

export const AnimationComponent = () => {
  const frame = useCurrentFrame()

  const title = "TITLE_TEXT"
  const rawDates = ["DATE_1", "DATE_2", "DATE_3", "DATE_4", "DATE_5"]
  const rawEvents = ["EVENT_1", "EVENT_2", "EVENT_3", "EVENT_4", "EVENT_5"]
  const rawTags = ["TAG_1", "TAG_2", "TAG_3", "TAG_4", "TAG_5"]
  const severityColors = ['#4ade80', '#facc15', '#fb923c', '#ef4444', '#dc2626']

  const items = useMemo(() => {
    return rawDates
      .map((date, i) => ({
        date,
        event: rawEvents[i],
        tag: rawTags[i],
        color: severityColors[i]
      }))
      .filter(item => item.date !== '' && item.date !== 'Placeholder' && item.event !== '' && item.event !== 'Placeholder')
  }, [])

  const count = items.length
  const titleOp = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const titleTy = interpolate(frame, [0, 20], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const barW = interpolate(frame, [10, 40], [0, 1920], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const lineH = interpolate(frame, [18, 70], [0, Math.min(720, 150 + count * 148)], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  const lineX = 360
  const lineTop = 150
  const itemSpacing = 148

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
          const iOp = interpolate(frame, [22 + i * 12, 36 + i * 12], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
          return (
            <g key={i} opacity={iOp}>
              <circle cx={lineX} cy={cy} r={20} fill={items[i].color} opacity={0.2} />
              <circle cx={lineX} cy={cy} r={12} fill={items[i].color} />
            </g>
          )
        })}
      </svg>

      {items.map((item, i) => {
        const itemY = lineTop + 40 + i * itemSpacing
        const cardW = 900 + i * 80
        const iOp = interpolate(frame, [22 + i * 12, 36 + i * 12], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
        const iTx = interpolate(frame, [22 + i * 12, 36 + i * 12], [40, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
        
        return (
          <div key={i}>
            <div style={{ position: 'absolute', top: itemY - 18, left: 120, width: 210, height: 40, overflow: 'hidden', opacity: iOp, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
              <span style={{ fontSize: 20, fontWeight: 700, color: item.color, fontFamily: 'sans-serif', letterSpacing: 1, textTransform: 'uppercase' }}>{item.date}</span>
            </div>
            <div style={{ position: 'absolute', top: itemY - 40, left: lineX + 44, width: cardW, height: 84, overflow: 'hidden', opacity: iOp, transform: `translateX(${iTx}px)`, backgroundColor: 'CHART_BG', borderRadius: 6, border: '1px solid', borderColor: 'CHART_BORDER', boxSizing: 'border-box', borderLeft: `4px solid ${item.color}` }}>
              <div style={{ position: 'absolute', top: 10, left: 20, width: 140, height: 30, overflow: 'hidden', backgroundColor: item.color, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.9 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#000000', fontFamily: 'sans-serif', letterSpacing: 1, textTransform: 'uppercase' }}>{item.tag}</span>
              </div>
              <div style={{ position: 'absolute', top: 10, left: 176, width: cardW - 200, height: 60, overflow: 'hidden' }}>
                <span style={{ fontSize: 24, fontWeight: 500, color: 'TEXT_ON_SECONDARY', fontFamily: 'sans-serif', lineHeight: 1.3 }}>{item.event}</span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default AnimationComponent