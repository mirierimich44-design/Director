import React from 'react'
import { useCurrentFrame, interpolate } from 'remotion'

export const AnimationComponent = () => {
  const frame = useCurrentFrame()

  const bgOp = interpolate(frame, [0, 18], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const barW = interpolate(frame, [10, 40], [0, 1920], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const overlayH = interpolate(frame, [15, 45], [0, 400], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const titleOp = interpolate(frame, [30, 48], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const titleTy = interpolate(frame, [30, 48], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const subOp = interpolate(frame, [44, 60], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const subTy = interpolate(frame, [44, 60], [16, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const statOp = interpolate(frame, [56, 72], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const divW = interpolate(frame, [35, 58], [0, 1400], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  const titleText = "TITLE_TEXT"
  const leftHead = "LEFT_HEAD"
  const rightHead = "RIGHT_HEAD"
  const leftSub1 = "LEFT_SUB1"
  const leftSub2 = "LEFT_SUB2"
  const rightSub1 = "RIGHT_SUB1"
  const rightSub2 = "RIGHT_SUB2"
  const stat1 = "STAT_VALUE_1"
  const stat2 = "STAT_VALUE_2"
  const contextText = "CONTEXT_TEXT"

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden', backgroundColor: 'BACKGROUND_COLOR' }}>
      {/* Background tint */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden', backgroundColor: 'PANEL_LEFT_BG', opacity: bgOp * 0.08 }} />
      <div style={{ position: 'absolute', top: 1074, left: 0, width: barW, height: 6, overflow: 'hidden', backgroundColor: 'PRIMARY_COLOR' }} />

      {/* Top full-width overlay panel */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: overlayH, overflow: 'hidden', backgroundColor: 'PRIMARY_COLOR' }} />

      {/* Title in overlay */}
      <div style={{ position: 'absolute', top: 80, left: 0, width: 1920, height: 80, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: titleOp, transform: `translateY(${titleTy}px)` }}>
        <span style={{ fontSize: 60, fontWeight: 900, color: 'TEXT_ON_PRIMARY', fontFamily: 'sans-serif', letterSpacing: -1 }}>{titleText}</span>
      </div>
      <div style={{ position: 'absolute', top: 180, left: 0, width: 1920, height: 44, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: subOp }}>
        <span style={{ fontSize: 22, fontWeight: 600, color: 'ACCENT_COLOR', fontFamily: 'sans-serif', letterSpacing: 4, textTransform: 'uppercase' }}>{contextText}</span>
      </div>

      {/* Divider */}
      <div style={{ position: 'absolute', top: 410, left: 260, width: divW, height: 2, overflow: 'hidden', backgroundColor: 'ACCENT_COLOR' }} />

      {/* Two columns below overlay */}
      <div style={{ position: 'absolute', top: 440, left: 160, width: 740, height: 540, overflow: 'hidden', opacity: statOp }}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: 740, height: 80, overflow: 'hidden' }}>
          <span style={{ fontSize: 52, fontWeight: 900, color: 'PRIMARY_COLOR', fontFamily: 'sans-serif', lineHeight: 1 }}>{leftHead}</span>
        </div>
        <div style={{ position: 'absolute', top: 100, left: 0, width: 740, height: 48, overflow: 'hidden', opacity: subOp, transform: `translateY(${subTy}px)` }}>
          <span style={{ fontSize: 28, fontWeight: 400, color: 'SUPPORT_COLOR', fontFamily: 'sans-serif' }}>{leftSub1}</span>
        </div>
        <div style={{ position: 'absolute', top: 158, left: 0, width: 740, height: 48, overflow: 'hidden', opacity: subOp }}>
          <span style={{ fontSize: 26, fontWeight: 400, color: 'SUPPORT_COLOR', fontFamily: 'sans-serif', opacity: 0.75 }}>{leftSub2}</span>
        </div>
        <div style={{ position: 'absolute', top: 250, left: 0, width: 300, height: 140, overflow: 'hidden', backgroundColor: 'CHART_BG', borderRadius: 6, border: '1px solid', borderColor: 'CHART_BORDER', boxSizing: 'border-box' }}>
          <div style={{ position: 'absolute', top: 20, left: 20, width: 260, height: 70, overflow: 'hidden' }}>
            <span style={{ fontSize: 60, fontWeight: 900, color: 'PRIMARY_COLOR', fontFamily: 'sans-serif', lineHeight: 1 }}>{stat1}</span>
          </div>
        </div>
      </div>

      <div style={{ position: 'absolute', top: 440, left: 1020, width: 740, height: 540, overflow: 'hidden', opacity: statOp }}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: 740, height: 80, overflow: 'hidden' }}>
          <span style={{ fontSize: 52, fontWeight: 900, color: 'SECONDARY_COLOR', fontFamily: 'sans-serif', lineHeight: 1 }}>{rightHead}</span>
        </div>
        <div style={{ position: 'absolute', top: 100, left: 0, width: 740, height: 48, overflow: 'hidden', opacity: subOp, transform: `translateY(${subTy}px)` }}>
          <span style={{ fontSize: 28, fontWeight: 400, color: 'SUPPORT_COLOR', fontFamily: 'sans-serif' }}>{rightSub1}</span>
        </div>
        <div style={{ position: 'absolute', top: 158, left: 0, width: 740, height: 48, overflow: 'hidden', opacity: subOp }}>
          <span style={{ fontSize: 26, fontWeight: 400, color: 'SUPPORT_COLOR', fontFamily: 'sans-serif', opacity: 0.75 }}>{rightSub2}</span>
        </div>
        <div style={{ position: 'absolute', top: 250, left: 0, width: 300, height: 140, overflow: 'hidden', backgroundColor: 'CHART_BG', borderRadius: 6, border: '1px solid', borderColor: 'CHART_BORDER', boxSizing: 'border-box' }}>
          <div style={{ position: 'absolute', top: 20, left: 20, width: 260, height: 70, overflow: 'hidden' }}>
            <span style={{ fontSize: 60, fontWeight: 900, color: 'SECONDARY_COLOR', fontFamily: 'sans-serif', lineHeight: 1 }}>{stat2}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AnimationComponent