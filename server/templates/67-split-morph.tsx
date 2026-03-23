import React from 'react'
import { useCurrentFrame, interpolate } from 'remotion'

export const AnimationComponent = () => {
  const frame = useCurrentFrame()

  const barW = interpolate(frame, [10, 40], [0, 1920], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const bgOp = interpolate(frame, [0, 15], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  // Phase 1: show left state (frames 0-60)
  // Morph: frames 45-85
  // Phase 2: show right state (frames 75+)
  const splitX = interpolate(frame, [45, 85], [960, 1820], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const leftOp = interpolate(frame, [0, 15, 75, 95], [0, 1, 1, 0.3], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const rightOp = interpolate(frame, [55, 80], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const rightTx = interpolate(frame, [55, 80], [80, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  const label1Op = interpolate(frame, [10, 28], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const label1Ty = interpolate(frame, [10, 28], [30, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const label2Op = interpolate(frame, [62, 80], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const label2Ty = interpolate(frame, [62, 80], [30, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  const compareLabel1 = "COMPARE_LABEL_1"
  const compareLabel2 = "COMPARE_LABEL_2"
  const compareValue1 = "COMPARE_VALUE_1"
  const compareValue2 = "COMPARE_VALUE_2"
  const leftSub1 = "LEFT_SUB1"
  const leftSub2 = "LEFT_SUB2"
  const rightSub1 = "RIGHT_SUB1"
  const rightSub2 = "RIGHT_SUB2"
  const contextText = "CONTEXT_TEXT"
  const contextOp = interpolate(frame, [82, 96], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden', backgroundColor: 'BACKGROUND_COLOR' }}>
      <div style={{ position: 'absolute', top: 1074, left: 0, width: barW, height: 6, overflow: 'hidden', backgroundColor: 'ACCENT_COLOR' }} />

      {/* Left state panel */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: splitX, height: 1080, overflow: 'hidden', backgroundColor: 'PRIMARY_COLOR', opacity: leftOp }}>
        <div style={{ position: 'absolute', top: 200, left: 120, width: splitX - 140, height: 120, overflow: 'hidden', opacity: label1Op, transform: `translateY(${label1Ty}px)` }}>
          <span style={{ fontSize: 28, fontWeight: 600, color: 'ACCENT_COLOR', fontFamily: 'sans-serif', letterSpacing: 4, textTransform: 'uppercase' }}>{compareLabel1}</span>
        </div>
        <div style={{ position: 'absolute', top: 260, left: 120, width: splitX - 140, height: 180, overflow: 'hidden', opacity: label1Op }}>
          <span style={{ fontSize: 140, fontWeight: 900, color: 'TEXT_ON_PRIMARY', fontFamily: 'sans-serif', lineHeight: 1, letterSpacing: -4 }}>{compareValue1}</span>
        </div>
        <div style={{ position: 'absolute', top: 460, left: 120, width: Math.min(splitX - 140, 700), height: 50, overflow: 'hidden', opacity: label1Op }}>
          <span style={{ fontSize: 26, fontWeight: 400, color: 'TEXT_ON_PRIMARY', fontFamily: 'sans-serif', opacity: 0.8 }}>{leftSub1}</span>
        </div>
        <div style={{ position: 'absolute', top: 520, left: 120, width: Math.min(splitX - 140, 700), height: 50, overflow: 'hidden', opacity: label1Op }}>
          <span style={{ fontSize: 24, fontWeight: 400, color: 'TEXT_ON_PRIMARY', fontFamily: 'sans-serif', opacity: 0.65 }}>{leftSub2}</span>
        </div>
      </div>

      {/* Morph divider line */}
      <div style={{ position: 'absolute', top: 0, left: splitX - 3, width: 6, height: 1080, overflow: 'hidden', backgroundColor: 'ACCENT_COLOR', opacity: bgOp }} />

      {/* Right state panel */}
      <div style={{ position: 'absolute', top: 0, left: splitX, width: 1920 - splitX, height: 1080, overflow: 'hidden', backgroundColor: 'CHART_BG', opacity: rightOp, transform: `translateX(${rightTx}px)` }}>
        <div style={{ position: 'absolute', top: 200, left: 80, width: 700, height: 60, overflow: 'hidden', opacity: label2Op, transform: `translateY(${label2Ty}px)` }}>
          <span style={{ fontSize: 28, fontWeight: 600, color: 'SECONDARY_COLOR', fontFamily: 'sans-serif', letterSpacing: 4, textTransform: 'uppercase' }}>{compareLabel2}</span>
        </div>
        <div style={{ position: 'absolute', top: 260, left: 80, width: 700, height: 180, overflow: 'hidden', opacity: label2Op }}>
          <span style={{ fontSize: 140, fontWeight: 900, color: 'PRIMARY_COLOR', fontFamily: 'sans-serif', lineHeight: 1, letterSpacing: -4 }}>{compareValue2}</span>
        </div>
        <div style={{ position: 'absolute', top: 460, left: 80, width: 700, height: 50, overflow: 'hidden', opacity: label2Op }}>
          <span style={{ fontSize: 26, fontWeight: 400, color: 'SUPPORT_COLOR', fontFamily: 'sans-serif' }}>{rightSub1}</span>
        </div>
        <div style={{ position: 'absolute', top: 520, left: 80, width: 700, height: 50, overflow: 'hidden', opacity: label2Op }}>
          <span style={{ fontSize: 24, fontWeight: 400, color: 'SUPPORT_COLOR', fontFamily: 'sans-serif', opacity: 0.75 }}>{rightSub2}</span>
        </div>
      </div>

      {/* Context bottom */}
      <div style={{ position: 'absolute', top: 980, left: 0, width: 1920, height: 50, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: contextOp }}>
        <span style={{ fontSize: 20, fontWeight: 400, color: 'SUPPORT_COLOR', fontFamily: 'sans-serif' }}>{contextText}</span>
      </div>
    </div>
  )
}

export default AnimationComponent