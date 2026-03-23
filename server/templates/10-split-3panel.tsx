import React, { useMemo } from 'react'
import { useCurrentFrame, interpolate } from 'remotion'

export const AnimationComponent = () => {
  const frame = useCurrentFrame()

  const title = "TITLE_TEXT"
  const rawHeads = ["LEFT_HEAD", "RIGHT_HEAD", "VERDICT_TEXT"]
  const rawSubs1 = ["LEFT_SUB1", "RIGHT_SUB1", "SUB_1"]
  const rawSubs2 = ["LEFT_SUB2", "RIGHT_SUB2", "SUB_2"]
  const rawSubs3 = ["LEFT_SUB3", "RIGHT_SUB3", "SUB_3"]
  const rawTags = ["TAG_1", "TAG_2", "TAG_3"]
  const rawPanelColors = ['PRIMARY_COLOR', 'PANEL_LEFT_BG', 'SECONDARY_COLOR']
  const rawHeadColors = ['TEXT_ON_PRIMARY', 'TEXT_ON_SECONDARY', 'TEXT_ON_SECONDARY']

  const items = useMemo(() => {
    return rawHeads
      .map((head, i) => ({
        head,
        sub1: rawSubs1[i],
        sub2: rawSubs2[i],
        sub3: rawSubs3[i],
        tag: rawTags[i],
        color: rawPanelColors[i],
        hColor: rawHeadColors[i]
      }))
      .filter(item => item.head !== '' && item.head !== 'Placeholder')
  }, [])

  const count = items.length

  const titleOp = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const titleTy = interpolate(frame, [0, 20], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const barW = interpolate(frame, [10, 40], [0, 1920], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const labelOp = interpolate(frame, [48, 62], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  const panelW = 560
  const panelH = 680
  const panelY = 180
  const gap = 40
  const startX = (1920 - count * panelW - (count - 1) * gap) / 2

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden', backgroundColor: 'BACKGROUND_COLOR' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 5, overflow: 'hidden', backgroundColor: 'PRIMARY_COLOR', opacity: titleOp }} />
      <div style={{ position: 'absolute', top: 1074, left: 0, width: barW, height: 6, overflow: 'hidden', backgroundColor: 'PRIMARY_COLOR' }} />
      <div style={{ position: 'absolute', top: 60, left: 0, width: 1920, height: 60, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: titleOp, transform: `translateY(${titleTy}px)` }}>
        <span style={{ fontSize: 26, fontWeight: 700, color: 'PRIMARY_COLOR', letterSpacing: 5, textTransform: 'uppercase', fontFamily: 'sans-serif' }}>{title}</span>
      </div>
      {items.map((item, i) => {
        const x = startX + i * (panelW + gap)
        const pOp = interpolate(frame, [15 + i * 10, 30 + i * 10], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
        const pTy = interpolate(frame, [15 + i * 10, 30 + i * 10], [30, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
        
        return (
          <div key={i} style={{ position: 'absolute', top: panelY, left: x, width: panelW, height: panelH, overflow: 'hidden', backgroundColor: item.color, borderRadius: 8, opacity: pOp, transform: `translateY(${pTy}px)`, boxSizing: 'border-box' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: panelW, height: 80, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 22, fontWeight: 800, color: item.hColor, fontFamily: 'sans-serif', letterSpacing: 3, textTransform: 'uppercase' }}>{item.head}</span>
            </div>
            <div style={{ position: 'absolute', top: 80, left: 0, width: panelW, height: 3, overflow: 'hidden', backgroundColor: 'ACCENT_COLOR', opacity: 0.4 }} />
            <div style={{ position: 'absolute', top: 110, left: 24, width: panelW - 48, height: 50, overflow: 'hidden', opacity: labelOp }}>
              <span style={{ fontSize: 20, fontWeight: 600, color: item.hColor, fontFamily: 'sans-serif', opacity: 0.85 }}>{item.tag}</span>
            </div>
            <div style={{ position: 'absolute', top: 170, left: 24, width: panelW - 48, height: 50, overflow: 'hidden', opacity: labelOp }}>
              <span style={{ fontSize: 20, fontWeight: 400, color: item.hColor, fontFamily: 'sans-serif', opacity: 0.7 }}>{item.sub1}</span>
            </div>
            <div style={{ position: 'absolute', top: 230, left: 24, width: panelW - 48, height: 50, overflow: 'hidden', opacity: labelOp }}>
              <span style={{ fontSize: 20, fontWeight: 400, color: item.hColor, fontFamily: 'sans-serif', opacity: 0.7 }}>{item.sub2}</span>
            </div>
            <div style={{ position: 'absolute', top: 290, left: 24, width: panelW - 48, height: 50, overflow: 'hidden', opacity: labelOp }}>
              <span style={{ fontSize: 20, fontWeight: 400, color: item.hColor, fontFamily: 'sans-serif', opacity: 0.7 }}>{item.sub3}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default AnimationComponent