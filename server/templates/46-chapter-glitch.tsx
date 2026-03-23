import React from 'react'
import { useCurrentFrame, interpolate } from 'remotion'

export const AnimationComponent = () => {
  const frame = useCurrentFrame()

  const bgOp = interpolate(frame, [0, 15], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const barW = interpolate(frame, [10, 40], [0, 1920], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const titleOp = interpolate(frame, [10, 25], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const subOp = interpolate(frame, [55, 70], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const subTy = interpolate(frame, [55, 70], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const divW = interpolate(frame, [25, 48], [0, 360], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  // Glitch offsets — rapid random-looking shifts using frame modulo
  const glitchActive = frame > 20 && frame < 60
  const glitchX = glitchActive ? interpolate(frame % 7, [0, 3, 4, 7], [-8, 8, -4, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) : 0
  const glitchX2 = glitchActive ? interpolate(frame % 5, [0, 2, 3, 5], [6, -6, 3, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) : 0
  const glitchOp = glitchActive ? interpolate(frame % 9, [0, 4, 5, 9], [0.7, 0.3, 0.7, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) : 0

  const chapterWord = "CHAPTER_WORD"
  const chapterSub = "CHAPTER_SUB"
  const contextText = "CONTEXT_TEXT"

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden', backgroundColor: 'BACKGROUND_COLOR' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden', backgroundColor: 'PANEL_LEFT_BG', opacity: bgOp * 0.1 }} />
      <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 5, overflow: 'hidden', backgroundColor: 'SECONDARY_COLOR', opacity: bgOp }} />
      <div style={{ position: 'absolute', top: 1074, left: 0, width: barW, height: 6, overflow: 'hidden', backgroundColor: 'SECONDARY_COLOR' }} />
      <div style={{ position: 'absolute', top: 200, left: 180, width: 5, height: 640, overflow: 'hidden', backgroundColor: 'SECONDARY_COLOR', opacity: titleOp }} />
      <div style={{ position: 'absolute', top: 200, left: 210, width: 700, height: 60, overflow: 'hidden', opacity: titleOp }}>
        <span style={{ fontSize: 22, fontWeight: 600, color: 'SECONDARY_COLOR', fontFamily: 'sans-serif', letterSpacing: 6, textTransform: 'uppercase' }}>{chapterWord}</span>
      </div>
      <div style={{ position: 'absolute', top: 276, left: 210, width: divW, height: 2, overflow: 'hidden', backgroundColor: 'SECONDARY_COLOR' }} />
      {/* Glitch layer 1 — red offset */}
      <div style={{ position: 'absolute', top: 300, left: 175 + glitchX, width: 1560, height: 260, overflow: 'hidden', opacity: glitchOp, display: 'flex', alignItems: 'center' }}>
        <span style={{ fontSize: 200, fontWeight: 900, color: 'SECONDARY_COLOR', fontFamily: 'sans-serif', lineHeight: 1, letterSpacing: -4, textTransform: 'uppercase' }}>{chapterSub}</span>
      </div>
      {/* Glitch layer 2 — blue offset */}
      <div style={{ position: 'absolute', top: 300, left: 175 + glitchX2, width: 1560, height: 260, overflow: 'hidden', opacity: glitchOp * 0.6, display: 'flex', alignItems: 'center' }}>
        <span style={{ fontSize: 200, fontWeight: 900, color: 'ACCENT_COLOR', fontFamily: 'sans-serif', lineHeight: 1, letterSpacing: -4, textTransform: 'uppercase' }}>{chapterSub}</span>
      </div>
      {/* Main text */}
      <div style={{ position: 'absolute', top: 300, left: 175, width: 1560, height: 260, overflow: 'hidden', opacity: titleOp, display: 'flex', alignItems: 'center' }}>
        <span style={{ fontSize: 200, fontWeight: 900, color: 'PRIMARY_COLOR', fontFamily: 'sans-serif', lineHeight: 1, letterSpacing: -4, textTransform: 'uppercase' }}>{chapterSub}</span>
      </div>
      <div style={{ position: 'absolute', top: 700, left: 210, width: 1100, height: 100, overflow: 'hidden', opacity: subOp, transform: `translateY(${subTy}px)` }}>
        <span style={{ fontSize: 28, fontWeight: 400, color: 'SUPPORT_COLOR', fontFamily: 'sans-serif', lineHeight: 1.5 }}>{contextText}</span>
      </div>
    </div>
  )
}

export default AnimationComponent