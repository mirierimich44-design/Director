import React from 'react'
import { useCurrentFrame, interpolate } from 'remotion'

export const AnimationComponent = () => {
  const frame = useCurrentFrame()

  const titleOp = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const titleTy = interpolate(frame, [0, 20], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const barW = interpolate(frame, [10, 40], [0, 1920], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const bgOp = interpolate(frame, [0, 15], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const labelOp = interpolate(frame, [8, 22], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const cursorOp = interpolate(frame % 30, [0, 15, 16, 30], [1, 1, 0, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const divW = interpolate(frame, [20, 45], [0, 360], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const subOp = interpolate(frame, [60, 75], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const subTy = interpolate(frame, [60, 75], [16, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  const chapterWord = "CHAPTER_WORD"
  const chapterSub = "CHAPTER_SUB"
  const contextText = "CONTEXT_TEXT"

  // Typewriter — reveal characters over 50 frames starting at frame 25
  const typeProgress = interpolate(frame, [25, 75], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const visibleChars = Math.floor(typeProgress * chapterSub.length)
  const displayText = chapterSub.slice(0, visibleChars)

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden', backgroundColor: 'BACKGROUND_COLOR' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden', backgroundColor: 'PANEL_LEFT_BG', opacity: bgOp * 0.08 }} />
      <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 5, overflow: 'hidden', backgroundColor: 'PRIMARY_COLOR', opacity: titleOp }} />
      <div style={{ position: 'absolute', top: 1074, left: 0, width: barW, height: 6, overflow: 'hidden', backgroundColor: 'PRIMARY_COLOR' }} />
      <div style={{ position: 'absolute', top: 200, left: 180, width: 5, height: 640, overflow: 'hidden', backgroundColor: 'PRIMARY_COLOR', opacity: labelOp }} />
      <div style={{ position: 'absolute', top: 200, left: 210, width: 700, height: 60, overflow: 'hidden', opacity: labelOp }}>
        <span style={{ fontSize: 22, fontWeight: 600, color: 'PRIMARY_COLOR', fontFamily: 'sans-serif', letterSpacing: 6, textTransform: 'uppercase' }}>{chapterWord}</span>
      </div>
      <div style={{ position: 'absolute', top: 276, left: 210, width: divW, height: 2, overflow: 'hidden', backgroundColor: 'ACCENT_COLOR' }} />
      <div style={{ position: 'absolute', top: 300, left: 175, width: 1560, height: 260, overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
        <span style={{ fontSize: 130, fontWeight: 900, color: 'PRIMARY_COLOR', fontFamily: 'monospace', lineHeight: 1, letterSpacing: -2, textTransform: 'uppercase' }}>
          {displayText}
          <span style={{ opacity: cursorOp, color: 'ACCENT_COLOR' }}>|</span>
        </span>
      </div>
      <div style={{ position: 'absolute', top: 700, left: 210, width: 1100, height: 100, overflow: 'hidden', opacity: subOp, transform: `translateY(${subTy}px)` }}>
        <span style={{ fontSize: 28, fontWeight: 400, color: 'SUPPORT_COLOR', fontFamily: 'sans-serif', lineHeight: 1.5 }}>{contextText}</span>
      </div>
    </div>
  )
}

export default AnimationComponent