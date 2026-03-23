import React from 'react'
import { useCurrentFrame, interpolate } from 'remotion'

export const AnimationComponent = () => {
  const frame = useCurrentFrame()

  const titleOp = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const titleTy = interpolate(frame, [0, 20], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const barW = interpolate(frame, [10, 40], [0, 1920], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const splitProgress = interpolate(frame, [15, 55], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const labelOp = interpolate(frame, [50, 65], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const statOp = interpolate(frame, [58, 74], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  const title = "TITLE_TEXT"
  const compareLabel1 = "COMPARE_LABEL_1"
  const compareLabel2 = "COMPARE_LABEL_2"
  const compareValue1 = "COMPARE_VALUE_1"
  const compareValue2 = "COMPARE_VALUE_2"
  const contextText = "CONTEXT_TEXT"

  // Split ratio — 65/35 representing the two values
  const splitRatio = 0.65
  const splitX = 1920 * splitRatio * splitProgress
  const rightX = splitX

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden', backgroundColor: 'BACKGROUND_COLOR' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 5, overflow: 'hidden', backgroundColor: 'PRIMARY_COLOR', opacity: titleOp }} />
      <div style={{ position: 'absolute', top: 1074, left: 0, width: barW, height: 6, overflow: 'hidden', backgroundColor: 'PRIMARY_COLOR' }} />

      {/* Title */}
      <div style={{ position: 'absolute', top: 50, left: 0, width: 1920, height: 60, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: titleOp, transform: `translateY(${titleTy}px)` }}>
        <span style={{ fontSize: 26, fontWeight: 700, color: 'PRIMARY_COLOR', letterSpacing: 5, textTransform: 'uppercase', fontFamily: 'sans-serif' }}>{title}</span>
      </div>

      {/* Left fill panel */}
      <div style={{ position: 'absolute', top: 140, left: 0, width: splitX, height: 800, overflow: 'hidden', backgroundColor: 'PRIMARY_COLOR', borderRadius: '0 0 0 0' }} />

      {/* Right fill panel */}
      <div style={{ position: 'absolute', top: 140, left: rightX, width: 1920 - rightX, height: 800, overflow: 'hidden', backgroundColor: 'CHART_BG', border: '1px solid', borderColor: 'CHART_BORDER', boxSizing: 'border-box' }} />

      {/* Divider line */}
      <div style={{ position: 'absolute', top: 130, left: rightX - 2, width: 4, height: 820, overflow: 'hidden', backgroundColor: 'ACCENT_COLOR', opacity: splitProgress }} />

      {/* Left value */}
      <div style={{ position: 'absolute', top: 340, left: 0, width: splitX, height: 200, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: statOp }}>
        <span style={{ fontSize: 140, fontWeight: 900, color: 'TEXT_ON_PRIMARY', fontFamily: 'sans-serif', lineHeight: 1, letterSpacing: -4 }}>{compareValue1}</span>
      </div>

      {/* Left label */}
      <div style={{ position: 'absolute', top: 560, left: 0, width: splitX, height: 60, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: labelOp }}>
        <span style={{ fontSize: 28, fontWeight: 700, color: 'TEXT_ON_PRIMARY', fontFamily: 'sans-serif', textTransform: 'uppercase', letterSpacing: 3, opacity: 0.85 }}>{compareLabel1}</span>
      </div>

      {/* Right value */}
      <div style={{ position: 'absolute', top: 340, left: rightX, width: 1920 - rightX, height: 200, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: statOp }}>
        <span style={{ fontSize: 140, fontWeight: 900, color: 'PRIMARY_COLOR', fontFamily: 'sans-serif', lineHeight: 1, letterSpacing: -4 }}>{compareValue2}</span>
      </div>

      {/* Right label */}
      <div style={{ position: 'absolute', top: 560, left: rightX, width: 1920 - rightX, height: 60, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: labelOp }}>
        <span style={{ fontSize: 28, fontWeight: 700, color: 'SUPPORT_COLOR', fontFamily: 'sans-serif', textTransform: 'uppercase', letterSpacing: 3 }}>{compareLabel2}</span>
      </div>

      {/* Context */}
      <div style={{ position: 'absolute', top: 980, left: 0, width: 1920, height: 50, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: labelOp }}>
        <span style={{ fontSize: 22, fontWeight: 400, color: 'SUPPORT_COLOR', fontFamily: 'sans-serif' }}>{contextText}</span>
      </div>
    </div>
  )
}

export default AnimationComponent