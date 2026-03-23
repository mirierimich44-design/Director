import React, { useMemo } from 'react'
import { useCurrentFrame, interpolate } from 'remotion'

export const AnimationComponent = () => {
  const frame = useCurrentFrame()

  const leftHead = "LEFT_HEAD"
  const rightHead = "RIGHT_HEAD"
  const verdictText = "VERDICT_TEXT"
  const leftSub1 = "LEFT_SUB1"
  const rightSub1 = "RIGHT_SUB1"
  const contextText = "CONTEXT_TEXT"
  const tag1 = "TAG_1"
  const tag2 = "TAG_2"
  const tag3 = "TAG_3"

  const items = useMemo(() => [
    { head: leftHead, sub: leftSub1, tag: tag1, top: 100, wipeRange: [8, 35], textRange: [30, 48] },
    { head: rightHead, sub: rightSub1, tag: tag2, top: 420, wipeRange: [22, 50], textRange: [45, 62] },
    { head: verdictText, sub: contextText, tag: tag3, top: 740, wipeRange: [36, 65], textRange: [60, 78] }
  ].filter(item => item.head !== '' && item.head !== 'Placeholder' && item.sub !== '' && item.sub !== 'Placeholder'), [])

  const barW = interpolate(frame, [10, 40], [0, 1920], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const panelH = 280

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden', backgroundColor: 'BACKGROUND_COLOR' }}>
      <div style={{ position: 'absolute', top: 1074, left: 0, width: barW, height: 6, overflow: 'hidden', backgroundColor: 'PRIMARY_COLOR' }} />

      {items.map((item, index) => {
        const wipeW = interpolate(frame, item.wipeRange, [0, 1920], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
        const textOp = interpolate(frame, item.textRange, [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
        const textTy = interpolate(frame, item.textRange, [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
        
        const isLast = index === 2; // Logic preserved from original styling
        const bg = index === 0 ? 'PRIMARY_COLOR' : index === 1 ? 'CHART_BG' : 'PANEL_LEFT_BG';
        const color = index === 0 ? 'TEXT_ON_PRIMARY' : index === 1 ? 'PRIMARY_COLOR' : 'ACCENT_COLOR';

        return (
          <div key={index} style={{ position: 'absolute', top: item.top, left: 0, width: wipeW, height: panelH, overflow: 'hidden', backgroundColor: bg, borderTop: index > 0 ? '2px solid' : 'none', borderColor: index === 1 ? 'CHART_BORDER' : 'ACCENT_COLOR', boxSizing: 'border-box' }}>
            <div style={{ position: 'absolute', top: 40, left: 80, width: 1400, height: 80, overflow: 'hidden', opacity: textOp, transform: `translateY(${textTy}px)` }}>
              <span style={{ fontSize: index === 2 ? 48 : 56, fontWeight: index === 2 ? 700 : 900, color: color, fontFamily: 'sans-serif', lineHeight: 1 }}>{item.head}</span>
            </div>
            <div style={{ position: 'absolute', top: 140, left: 80, width: 1200, height: 44, overflow: 'hidden', opacity: textOp }}>
              <span style={{ fontSize: 24, fontWeight: 400, color: index === 1 ? 'SUPPORT_COLOR' : (index === 2 ? 'TEXT_ON_SECONDARY' : 'TEXT_ON_PRIMARY'), fontFamily: 'sans-serif', opacity: index === 2 ? 0.75 : 0.8 }}>{item.sub}</span>
            </div>
            <div style={{ position: 'absolute', top: 190, left: 80, width: 160, height: 36, overflow: 'hidden', opacity: textOp, backgroundColor: index === 1 ? 'SECONDARY_COLOR' : 'ACCENT_COLOR', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: index === 1 ? 'TEXT_ON_SECONDARY' : 'TEXT_ON_ACCENT', fontFamily: 'sans-serif', letterSpacing: 1, textTransform: 'uppercase' }}>{item.tag}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default AnimationComponent