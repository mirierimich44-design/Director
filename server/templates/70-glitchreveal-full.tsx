import React from 'react'
import { useCurrentFrame, interpolate } from 'remotion'

export const AnimationComponent = () => {
  const frame = useCurrentFrame()

  const barW = interpolate(frame, [10, 40], [0, 1920], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const bgOp = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const mainOp = interpolate(frame, [15, 35], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const subOp = interpolate(frame, [45, 62], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const subTy = interpolate(frame, [45, 62], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const tagOp = interpolate(frame, [58, 74], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  const glitchActive = frame > 10 && frame < 50
  const gX1 = glitchActive ? interpolate(frame % 7, [0, 3, 7], [-12, 12, -6], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) : 0
  const gX2 = glitchActive ? interpolate(frame % 5, [0, 2, 5], [8, -8, 4], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) : 0
  const gOp = glitchActive ? interpolate(frame % 9, [0, 4, 9], [0.5, 0.2, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) : 0
  const scanY = interpolate(frame, [15, 65], [-20, 1100], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  const titleText = "TITLE_TEXT"
  const chapterSub = "CHAPTER_SUB"
  const contextText = "CONTEXT_TEXT"
  const tag1 = "TAG_1"

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden', backgroundColor: 'PRIMARY_COLOR' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden', backgroundColor: 'BACKGROUND_COLOR', opacity: 1 - bgOp * 0.92 }} />
      <div style={{ position: 'absolute', top: 1074, left: 0, width: barW, height: 6, overflow: 'hidden', backgroundColor: 'ACCENT_COLOR' }} />
      {/* Scanline */}
      <div style={{ position: 'absolute', top: scanY, left: 0, width: 1920, height: 3, overflow: 'hidden', backgroundColor: 'ACCENT_COLOR', opacity: 0.3 }} />
      {/* Glitch layers */}
      <div style={{ position: 'absolute', top: 300, left: 160 + gX1, width: 1600, height: 300, overflow: 'hidden', opacity: gOp }}>
        <span style={{ fontSize: 200, fontWeight: 900, color: 'SECONDARY_COLOR', fontFamily: 'sans-serif', lineHeight: 1, textTransform: 'uppercase' }}>{titleText}</span>
      </div>
      <div style={{ position: 'absolute', top: 300, left: 160 + gX2, width: 1600, height: 300, overflow: 'hidden', opacity: gOp * 0.6 }}>
        <span style={{ fontSize: 200, fontWeight: 900, color: 'ACCENT_COLOR', fontFamily: 'sans-serif', lineHeight: 1, textTransform: 'uppercase' }}>{titleText}</span>
      </div>
      {/* Main text */}
      <div style={{ position: 'absolute', top: 300, left: 160, width: 1600, height: 300, overflow: 'hidden', opacity: mainOp }}>
        <span style={{ fontSize: 200, fontWeight: 900, color: 'TEXT_ON_PRIMARY', fontFamily: 'sans-serif', lineHeight: 1, textTransform: 'uppercase', letterSpacing: -4 }}>{titleText}</span>
      </div>
      <div style={{ position: 'absolute', top: 550, left: 160, width: 1600, height: 80, overflow: 'hidden', opacity: mainOp }}>
        <span style={{ fontSize: 48, fontWeight: 300, color: 'TEXT_ON_PRIMARY', fontFamily: 'sans-serif', letterSpacing: 8, textTransform: 'uppercase', opacity: 0.7 }}>{chapterSub}</span>
      </div>
      <div style={{ position: 'absolute', top: 680, left: 160, width: 1100, height: 60, overflow: 'hidden', opacity: subOp, transform: `translateY(${subTy}px)` }}>
        <span style={{ fontSize: 26, fontWeight: 400, color: 'TEXT_ON_PRIMARY', fontFamily: 'sans-serif', opacity: 0.6 }}>{contextText}</span>
      </div>
      <div style={{ position: 'absolute', top: 680, left: 1400, width: 360, height: 50, overflow: 'hidden', opacity: tagOp, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
        <span style={{ fontSize: 18, fontWeight: 600, color: 'ACCENT_COLOR', fontFamily: 'sans-serif', letterSpacing: 3, textTransform: 'uppercase' }}>{tag1}</span>
      </div>
    </div>
  )
}

export default AnimationComponent