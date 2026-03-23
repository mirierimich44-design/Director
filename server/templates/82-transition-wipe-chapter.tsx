import React from 'react'
import { useCurrentFrame, interpolate } from 'remotion'

export const AnimationComponent = () => {
  const frame = useCurrentFrame()

  const wipeX = interpolate(frame, [0, 35], [-1920, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const textOp = interpolate(frame, [28, 45], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const textTy = interpolate(frame, [28, 45], [30, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const subOp = interpolate(frame, [40, 56], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const lineW = interpolate(frame, [32, 55], [0, 400], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const tagOp = interpolate(frame, [50, 65], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  const chapterWord = "CHAPTER_WORD"
  const chapterSub = "CHAPTER_SUB"
  const contextText = "CONTEXT_TEXT"
  const tag1 = "TAG_1"

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden', backgroundColor: 'BACKGROUND_COLOR' }}>
      {/* Wipe panel */}
      <div style={{ position: 'absolute', top: 0, left: wipeX, width: 1920, height: 1080, overflow: 'hidden', backgroundColor: 'PRIMARY_COLOR' }} />
      {/* Content on top of wipe */}
      <div style={{ position: 'absolute', top: 360, left: 160, width: 800, height: 60, overflow: 'hidden', opacity: textOp }}>
        <span style={{ fontSize: 20, fontWeight: 600, color: 'ACCENT_COLOR', fontFamily: 'sans-serif', letterSpacing: 6, textTransform: 'uppercase' }}>{chapterWord}</span>
      </div>
      <div style={{ position: 'absolute', top: 432, left: 160, width: lineW, height: 3, overflow: 'hidden', backgroundColor: 'ACCENT_COLOR' }} />
      <div style={{ position: 'absolute', top: 448, left: 160, width: 1600, height: 200, overflow: 'hidden', opacity: textOp, transform: `translateY(${textTy}px)`, display: 'flex', alignItems: 'center' }}>
        <span style={{ fontSize: 140, fontWeight: 900, color: 'TEXT_ON_PRIMARY', fontFamily: 'sans-serif', lineHeight: 1, letterSpacing: -4, textTransform: 'uppercase' }}>{chapterSub}</span>
      </div>
      <div style={{ position: 'absolute', top: 700, left: 160, width: 1000, height: 60, overflow: 'hidden', opacity: subOp }}>
        <span style={{ fontSize: 26, fontWeight: 400, color: 'TEXT_ON_PRIMARY', fontFamily: 'sans-serif', opacity: 0.7 }}>{contextText}</span>
      </div>
      <div style={{ position: 'absolute', top: 700, left: 1400, width: 360, height: 50, overflow: 'hidden', opacity: tagOp, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
        <span style={{ fontSize: 18, fontWeight: 600, color: 'ACCENT_COLOR', fontFamily: 'sans-serif', letterSpacing: 3, textTransform: 'uppercase' }}>{tag1}</span>
      </div>
    </div>
  )
}

export default AnimationComponent