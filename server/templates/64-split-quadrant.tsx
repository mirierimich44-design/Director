import React, { useMemo } from 'react'
import { useCurrentFrame, interpolate } from 'remotion'

export const AnimationComponent = () => {
  const frame = useCurrentFrame()

  const title = "TITLE_TEXT"
  const rawHeads = ["LEFT_HEAD", "RIGHT_HEAD", "VERDICT_TEXT", "TITLE_TEXT"]
  const rawSubs = ["LEFT_SUB1", "RIGHT_SUB1", "LEFT_SUB2", "RIGHT_SUB2"]
  const rawTags = ["TAG_1", "TAG_2", "TAG_3", "TAG_4"]

  const activeItems = useMemo(() => {
    return rawHeads
      .map((head, i) => ({
        head,
        sub: rawSubs[i],
        tag: rawTags[i]
      }))
      .filter(item => item.head !== '' && item.head !== 'Placeholder')
  }, [])

  const titleOp = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const titleTy = interpolate(frame, [0, 20], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const barW = interpolate(frame, [10, 40], [0, 1920], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const labelOp = interpolate(frame, [55, 70], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  const quadrants = activeItems.map((item, i) => {
    const startFrame = 15 + (i * 9)
    const endFrame = 30 + (i * 9)
    const op = interpolate(frame, [startFrame, endFrame], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    const scale = interpolate(frame, [startFrame, endFrame], [0.9, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    
    const row = Math.floor(i / 2)
    const col = i % 2
    
    return {
      op,
      scale,
      x: col === 0 ? 40 : 980,
      y: row === 0 ? 140 : 570,
      bg: (i === 0) ? 'PRIMARY_COLOR' : (i === activeItems.length - 1) ? 'SECONDARY_COLOR' : 'CHART_BG',
      text: (i === 0) ? 'TEXT_ON_PRIMARY' : 'TEXT_ON_SECONDARY',
      ...item
    }
  })

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden', backgroundColor: 'BACKGROUND_COLOR' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 5, overflow: 'hidden', backgroundColor: 'PRIMARY_COLOR', opacity: titleOp }} />
      <div style={{ position: 'absolute', top: 1074, left: 0, width: barW, height: 6, overflow: 'hidden', backgroundColor: 'PRIMARY_COLOR' }} />
      <div style={{ position: 'absolute', top: 60, left: 0, width: 1920, height: 60, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: titleOp, transform: `translateY(${titleTy}px)` }}>
        <span style={{ fontSize: 26, fontWeight: 700, color: 'PRIMARY_COLOR', letterSpacing: 5, textTransform: 'uppercase', fontFamily: 'sans-serif' }}>{title}</span>
      </div>
      {quadrants.map((q, i) => (
        <div key={i} style={{ position: 'absolute', top: q.y, left: q.x, width: 900, height: 400, overflow: 'hidden', backgroundColor: q.bg, borderRadius: 6, opacity: q.op, transform: `scale(${q.scale})`, boxSizing: 'border-box', border: q.bg === 'CHART_BG' ? '1px solid' : 'none', borderColor: 'CHART_BORDER' }}>
          <div style={{ position: 'absolute', top: 32, left: 36, width: 828, height: 60, overflow: 'hidden' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: q.text, fontFamily: 'sans-serif', letterSpacing: 3, textTransform: 'uppercase', opacity: 0.6 }}>{q.tag}</span>
          </div>
          <div style={{ position: 'absolute', top: 80, left: 36, width: 828, height: 100, overflow: 'hidden' }}>
            <span style={{ fontSize: 52, fontWeight: 900, color: q.text, fontFamily: 'sans-serif', lineHeight: 1.1 }}>{q.head}</span>
          </div>
          <div style={{ position: 'absolute', top: 200, left: 36, width: 828, height: 60, overflow: 'hidden', opacity: labelOp }}>
            <span style={{ fontSize: 26, fontWeight: 400, color: q.text, fontFamily: 'sans-serif', opacity: 0.8 }}>{q.sub}</span>
          </div>
          <div style={{ position: 'absolute', top: 0, left: 0, width: 6, height: 400, overflow: 'hidden', backgroundColor: 'ACCENT_COLOR', opacity: 0.4 }} />
        </div>
      ))}
    </div>
  )
}

export default AnimationComponent