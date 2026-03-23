import React from 'react'
import { useCurrentFrame, interpolate } from 'remotion'

export const AnimationComponent = () => {
  const frame = useCurrentFrame()

  const titleOp = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const barW = interpolate(frame, [10, 40], [0, 1920], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const bgOp = interpolate(frame, [0, 18], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const wipeW = interpolate(frame, [15, 55], [0, 1920], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const textOp = interpolate(frame, [35, 52], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const textTy = interpolate(frame, [35, 52], [40, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const subOp = interpolate(frame, [50, 65], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const subTy = interpolate(frame, [50, 65], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const labelOp = interpolate(frame, [60, 75], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  const chapterWord = "CHAPTER_WORD"
  const chapterSub = "CHAPTER_SUB"
  const contextText = "CONTEXT_TEXT"

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden', backgroundColor: 'BACKGROUND_COLOR' }}>
      {/* Wipe bar from left */}
      <div style={{ position: 'absolute', top: 380, left: 0, width: wipeW, height: 320, overflow: 'hidden', backgroundColor: 'PRIMARY_COLOR' }} />
      <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 5, overflow: 'hidden', backgroundColor: 'ACCENT_COLOR', opacity: bgOp }} />
      <div style={{ position: 'absolute', top: 1074, left: 0, width: barW, height: 6, overflow: 'hidden', backgroundColor: 'ACCENT_COLOR' }} />
      {/* Chapter label above */}
      <div style={{ position: 'absolute', top: 300, left: 160, width: 800, height: 60, overflow: 'hidden', opacity: titleOp }}>
        <span style={{ fontSize: 22, fontWeight: 600, color: 'SUPPORT_COLOR', fontFamily: 'sans-serif', letterSpacing: 6, textTransform: 'uppercase' }}>{chapterWord}</span>
      </div>
      {/* Hero text on wipe bar */}
      <div style={{ position: 'absolute', top: 400, left: 160, width: 1600, height: 260, overflow: 'hidden', opacity: textOp, transform: `translateY(${textTy}px)`, display: 'flex', alignItems: 'center' }}>
        <span style={{ fontSize: 180, fontWeight: 900, color: 'TEXT_ON_PRIMARY', fontFamily: 'sans-serif', lineHeight: 1, letterSpacing: -4, textTransform: 'uppercase' }}>{chapterSub}</span>
      </div>
      {/* Context below */}
      <div style={{ position: 'absolute', top: 750, left: 160, width: 1100, height: 80, overflow: 'hidden', opacity: subOp, transform: `translateY(${subTy}px)` }}>
        <span style={{ fontSize: 28, fontWeight: 400, color: 'SUPPORT_COLOR', fontFamily: 'sans-serif', lineHeight: 1.5 }}>{contextText}</span>
      </div>
      <div style={{ position: 'absolute', top: 750, left: 1400, width: 360, height: 50, overflow: 'hidden', opacity: labelOp, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
        <span style={{ fontSize: 20, fontWeight: 500, color: 'ACCENT_COLOR', fontFamily: 'sans-serif', letterSpacing: 3, textTransform: 'uppercase' }}>{chapterWord}</span>
      </div>
    </div>
  )
}

export default AnimationComponent