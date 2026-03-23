import React from 'react'
import { useCurrentFrame, interpolate } from 'remotion'

export const AnimationComponent = () => {
  const frame = useCurrentFrame()

  const titleOp = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const leftOp = interpolate(frame, [10, 28], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const leftTx = interpolate(frame, [10, 28], [-60, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const rightOp = interpolate(frame, [22, 40], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const rightTx = interpolate(frame, [22, 40], [60, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const labelOp = interpolate(frame, [40, 56], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const barW = interpolate(frame, [10, 40], [0, 1920], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const dividerOp = interpolate(frame, [15, 35], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  const leftHead = "LEFT_HEAD"
  const rightHead = "RIGHT_HEAD"
  const leftSub1 = "LEFT_SUB1"
  const leftSub2 = "LEFT_SUB2"
  const leftSub3 = "LEFT_SUB3"
  const rightSub1 = "RIGHT_SUB1"
  const rightSub2 = "RIGHT_SUB2"
  const rightSub3 = "RIGHT_SUB3"
  const tag1 = "TAG_1"
  const tag2 = "TAG_2"

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden', backgroundColor: 'BACKGROUND_COLOR' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 5, overflow: 'hidden', backgroundColor: 'PRIMARY_COLOR', opacity: titleOp }} />
      <div style={{ position: 'absolute', top: 1074, left: 0, width: barW, height: 6, overflow: 'hidden', backgroundColor: 'PRIMARY_COLOR' }} />

      {/* Left panel */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: 1020, height: 1080, overflow: 'hidden', backgroundColor: 'PRIMARY_COLOR', opacity: leftOp, transform: `translateX(${leftTx}px)` }}>
        <div style={{ position: 'absolute', top: 180, left: 120, width: 820, height: 100, overflow: 'hidden' }}>
          <span style={{ fontSize: 72, fontWeight: 900, color: 'TEXT_ON_PRIMARY', fontFamily: 'sans-serif', lineHeight: 1 }}>{leftHead}</span>
        </div>
        <div style={{ position: 'absolute', top: 320, left: 120, width: 640, height: 3, overflow: 'hidden', backgroundColor: 'ACCENT_COLOR', opacity: labelOp }} />
        <div style={{ position: 'absolute', top: 344, left: 120, width: 820, height: 50, overflow: 'hidden', opacity: labelOp }}>
          <span style={{ fontSize: 26, fontWeight: 600, color: 'ACCENT_COLOR', fontFamily: 'sans-serif', letterSpacing: 2, textTransform: 'uppercase' }}>{tag1}</span>
        </div>
        <div style={{ position: 'absolute', top: 420, left: 120, width: 820, height: 46, overflow: 'hidden', opacity: labelOp }}>
          <span style={{ fontSize: 28, fontWeight: 400, color: 'TEXT_ON_PRIMARY', fontFamily: 'sans-serif', opacity: 0.85 }}>{leftSub1}</span>
        </div>
        <div style={{ position: 'absolute', top: 478, left: 120, width: 820, height: 46, overflow: 'hidden', opacity: labelOp }}>
          <span style={{ fontSize: 28, fontWeight: 400, color: 'TEXT_ON_PRIMARY', fontFamily: 'sans-serif', opacity: 0.75 }}>{leftSub2}</span>
        </div>
        <div style={{ position: 'absolute', top: 536, left: 120, width: 820, height: 46, overflow: 'hidden', opacity: labelOp }}>
          <span style={{ fontSize: 28, fontWeight: 400, color: 'TEXT_ON_PRIMARY', fontFamily: 'sans-serif', opacity: 0.65 }}>{leftSub3}</span>
        </div>
      </div>

      {/* Diagonal divider SVG */}
      <svg width={1920} height={1080} style={{ position: 'absolute', top: 0, left: 0 }}>
        <polygon points="960,0 1060,0 1060,1080 860,1080" fill="BACKGROUND_COLOR" opacity={dividerOp} />
        <line x1={960} y1={0} x2={860} y2={1080} stroke="ACCENT_COLOR" strokeWidth={4} opacity={dividerOp} />
      </svg>

      {/* Right panel */}
      <div style={{ position: 'absolute', top: 0, left: 900, width: 1020, height: 1080, overflow: 'hidden', backgroundColor: 'CHART_BG', opacity: rightOp, transform: `translateX(${rightTx}px)` }}>
        <div style={{ position: 'absolute', top: 180, left: 200, width: 700, height: 100, overflow: 'hidden' }}>
          <span style={{ fontSize: 72, fontWeight: 900, color: 'PRIMARY_COLOR', fontFamily: 'sans-serif', lineHeight: 1 }}>{rightHead}</span>
        </div>
        <div style={{ position: 'absolute', top: 320, left: 200, width: 640, height: 3, overflow: 'hidden', backgroundColor: 'SECONDARY_COLOR', opacity: labelOp }} />
        <div style={{ position: 'absolute', top: 344, left: 200, width: 700, height: 50, overflow: 'hidden', opacity: labelOp }}>
          <span style={{ fontSize: 26, fontWeight: 600, color: 'SECONDARY_COLOR', fontFamily: 'sans-serif', letterSpacing: 2, textTransform: 'uppercase' }}>{tag2}</span>
        </div>
        <div style={{ position: 'absolute', top: 420, left: 200, width: 700, height: 46, overflow: 'hidden', opacity: labelOp }}>
          <span style={{ fontSize: 28, fontWeight: 400, color: 'TEXT_ON_SECONDARY', fontFamily: 'sans-serif', opacity: 0.85 }}>{rightSub1}</span>
        </div>
        <div style={{ position: 'absolute', top: 478, left: 200, width: 700, height: 46, overflow: 'hidden', opacity: labelOp }}>
          <span style={{ fontSize: 28, fontWeight: 400, color: 'TEXT_ON_SECONDARY', fontFamily: 'sans-serif', opacity: 0.75 }}>{rightSub2}</span>
        </div>
        <div style={{ position: 'absolute', top: 536, left: 200, width: 700, height: 46, overflow: 'hidden', opacity: labelOp }}>
          <span style={{ fontSize: 28, fontWeight: 400, color: 'TEXT_ON_SECONDARY', fontFamily: 'sans-serif', opacity: 0.65 }}>{rightSub3}</span>
        </div>
      </div>
    </div>
  )
}

export default AnimationComponent