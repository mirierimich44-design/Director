import React, { useMemo } from 'react'
import { useCurrentFrame, interpolate } from 'remotion'

export const AnimationComponent = () => {
  const frame = useCurrentFrame()

  const titleOp = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const titleTy = interpolate(frame, [0, 20], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const barW = interpolate(frame, [10, 40], [0, 1920], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const panelOp = interpolate(frame, [12, 28], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  const tickerX = interpolate(frame, [0, 200], [0, -2400], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const heroOp = interpolate(frame, [20, 38], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const heroTy = interpolate(frame, [20, 38], [30, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const subOp = interpolate(frame, [38, 52], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  const title = "TITLE_TEXT"
  const statValue1 = "STAT_VALUE_1"
  const statValue2 = "STAT_VALUE_2"
  const label1 = "LABEL_1"
  const label2 = "LABEL_2"
  const contextText = "CONTEXT_TEXT"

  const rawTickerItems = [
    "EVENT_1", "EVENT_2", "EVENT_3", "EVENT_4",
    "EVENT_1", "EVENT_2", "EVENT_3", "EVENT_4",
    "EVENT_1", "EVENT_2", "EVENT_3", "EVENT_4",
  ]

  const tickerItems = useMemo(() => {
    return rawTickerItems.filter(item => item !== '' && item !== 'Placeholder')
  }, [rawTickerItems])

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden', backgroundColor: 'BACKGROUND_COLOR' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 5, overflow: 'hidden', backgroundColor: 'PRIMARY_COLOR', opacity: titleOp }} />
      <div style={{ position: 'absolute', top: 1074, left: 0, width: barW, height: 6, overflow: 'hidden', backgroundColor: 'PRIMARY_COLOR' }} />
      <div style={{ position: 'absolute', top: 60, left: 0, width: 1920, height: 60, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: titleOp, transform: `translateY(${titleTy}px)` }}>
        <span style={{ fontSize: 26, fontWeight: 700, color: 'PRIMARY_COLOR', letterSpacing: 5, textTransform: 'uppercase', fontFamily: 'sans-serif' }}>{title}</span>
      </div>
      <div style={{ position: 'absolute', top: 180, left: 160, width: 760, height: 200, overflow: 'hidden', opacity: heroOp, transform: `translateY(${heroTy}px)` }}>
        <span style={{ fontSize: 160, fontWeight: 900, color: 'PRIMARY_COLOR', fontFamily: 'sans-serif', lineHeight: 1, letterSpacing: -4 }}>{statValue1}</span>
      </div>
      <div style={{ position: 'absolute', top: 360, left: 160, width: 600, height: 50, overflow: 'hidden', opacity: subOp }}>
        <span style={{ fontSize: 26, fontWeight: 600, color: 'ACCENT_COLOR', fontFamily: 'sans-serif', letterSpacing: 3, textTransform: 'uppercase' }}>{label1}</span>
      </div>
      <div style={{ position: 'absolute', top: 180, left: 1000, width: 760, height: 200, overflow: 'hidden', opacity: heroOp, transform: `translateY(${heroTy}px)` }}>
        <span style={{ fontSize: 160, fontWeight: 900, color: 'SECONDARY_COLOR', fontFamily: 'sans-serif', lineHeight: 1, letterSpacing: -4 }}>{statValue2}</span>
      </div>
      <div style={{ position: 'absolute', top: 360, left: 1000, width: 600, height: 50, overflow: 'hidden', opacity: subOp }}>
        <span style={{ fontSize: 26, fontWeight: 600, color: 'ACCENT_COLOR', fontFamily: 'sans-serif', letterSpacing: 3, textTransform: 'uppercase' }}>{label2}</span>
      </div>
      <div style={{ position: 'absolute', top: 460, left: 160, width: 1600, height: 60, overflow: 'hidden', opacity: subOp }}>
        <span style={{ fontSize: 24, fontWeight: 400, color: 'SUPPORT_COLOR', fontFamily: 'sans-serif' }}>{contextText}</span>
      </div>
      <div style={{ position: 'absolute', top: 580, left: 0, width: 1920, height: 60, overflow: 'hidden', backgroundColor: 'PRIMARY_COLOR', opacity: panelOp }}>
        <div style={{ position: 'absolute', top: 0, left: tickerX, width: tickerItems.length * 400, height: 60, overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
          {tickerItems.map((item, i) => (
            <span key={i} style={{ fontSize: 20, fontWeight: 600, color: 'TEXT_ON_PRIMARY', fontFamily: 'sans-serif', letterSpacing: 2, textTransform: 'uppercase', marginRight: 80, whiteSpace: 'nowrap' }}>
              ▶ {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AnimationComponent