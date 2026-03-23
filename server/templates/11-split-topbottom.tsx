import React from 'react'
import { useCurrentFrame, interpolate } from 'remotion'

export const AnimationComponent = () => {
  const frame = useCurrentFrame()

  const titleOp = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const titleTy = interpolate(frame, [0, 20], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const barW = interpolate(frame, [10, 40], [0, 1920], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const topOp = interpolate(frame, [15, 30], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const topTy = interpolate(frame, [15, 30], [-30, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const botOp = interpolate(frame, [28, 43], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const botTy = interpolate(frame, [28, 43], [30, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const divH = interpolate(frame, [22, 42], [0, 4], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const labelOp = interpolate(frame, [42, 58], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  const leftHead = "LEFT_HEAD"
  const rightHead = "RIGHT_HEAD"
  const leftSub1 = "LEFT_SUB1"
  const leftSub2 = "LEFT_SUB2"
  const rightSub1 = "RIGHT_SUB1"
  const rightSub2 = "RIGHT_SUB2"
  const verdictText = "VERDICT_TEXT"
  const contextText = "CONTEXT_TEXT"

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden', backgroundColor: 'BACKGROUND_COLOR' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 5, overflow: 'hidden', backgroundColor: 'PRIMARY_COLOR', opacity: titleOp }} />
      <div style={{ position: 'absolute', top: 1074, left: 0, width: barW, height: 6, overflow: 'hidden', backgroundColor: 'PRIMARY_COLOR' }} />
      {/* Top panel */}
      <div style={{ position: 'absolute', top: 60, left: 0, width: 1920, height: 460, overflow: 'hidden', backgroundColor: 'PRIMARY_COLOR', opacity: topOp, transform: `translateY(${topTy}px)`, boxSizing: 'border-box', padding: '40px 160px' }}>
        <div style={{ position: 'absolute', top: 40, left: 160, width: 1600, height: 80, overflow: 'hidden' }}>
          <span style={{ fontSize: 64, fontWeight: 900, color: 'TEXT_ON_PRIMARY', fontFamily: 'sans-serif', lineHeight: 1 }}>{leftHead}</span>
        </div>
        <div style={{ position: 'absolute', top: 150, left: 160, width: 700, height: 50, overflow: 'hidden', opacity: labelOp }}>
          <span style={{ fontSize: 26, fontWeight: 400, color: 'TEXT_ON_PRIMARY', fontFamily: 'sans-serif', opacity: 0.8 }}>{leftSub1}</span>
        </div>
        <div style={{ position: 'absolute', top: 210, left: 160, width: 700, height: 50, overflow: 'hidden', opacity: labelOp }}>
          <span style={{ fontSize: 26, fontWeight: 400, color: 'TEXT_ON_PRIMARY', fontFamily: 'sans-serif', opacity: 0.8 }}>{leftSub2}</span>
        </div>
        <div style={{ position: 'absolute', top: 150, left: 1000, width: 700, height: 50, overflow: 'hidden', opacity: labelOp }}>
          <span style={{ fontSize: 26, fontWeight: 600, color: 'ACCENT_COLOR', fontFamily: 'sans-serif' }}>{rightSub1}</span>
        </div>
        <div style={{ position: 'absolute', top: 210, left: 1000, width: 700, height: 50, overflow: 'hidden', opacity: labelOp }}>
          <span style={{ fontSize: 26, fontWeight: 400, color: 'TEXT_ON_PRIMARY', fontFamily: 'sans-serif', opacity: 0.7 }}>{rightSub2}</span>
        </div>
      </div>
      {/* Divider */}
      <div style={{ position: 'absolute', top: 520, left: 0, width: 1920, height: divH, overflow: 'hidden', backgroundColor: 'ACCENT_COLOR' }} />
      {/* Bottom panel */}
      <div style={{ position: 'absolute', top: 524, left: 0, width: 1920, height: 460, overflow: 'hidden', backgroundColor: 'CHART_BG', opacity: botOp, transform: `translateY(${botTy}px)`, boxSizing: 'border-box' }}>
        <div style={{ position: 'absolute', top: 40, left: 160, width: 1600, height: 70, overflow: 'hidden' }}>
          <span style={{ fontSize: 52, fontWeight: 700, color: 'PRIMARY_COLOR', fontFamily: 'sans-serif', lineHeight: 1 }}>{rightHead}</span>
        </div>
        <div style={{ position: 'absolute', top: 140, left: 160, width: 1400, height: 60, overflow: 'hidden', opacity: labelOp }}>
          <span style={{ fontSize: 26, fontWeight: 400, color: 'SUPPORT_COLOR', fontFamily: 'sans-serif' }}>{verdictText}</span>
        </div>
        <div style={{ position: 'absolute', top: 220, left: 160, width: 1400, height: 60, overflow: 'hidden', opacity: labelOp }}>
          <span style={{ fontSize: 24, fontWeight: 400, color: 'SUPPORT_COLOR', fontFamily: 'sans-serif', opacity: 0.7 }}>{contextText}</span>
        </div>
      </div>
    </div>
  )
}

export default AnimationComponent