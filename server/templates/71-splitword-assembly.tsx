import React from 'react'
import { useCurrentFrame, interpolate } from 'remotion'

export const AnimationComponent = () => {
  const frame = useCurrentFrame()

  const bgOp = interpolate(frame, [0, 15], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const barW = interpolate(frame, [10, 40], [0, 1920], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const subOp = interpolate(frame, [65, 80], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const subTy = interpolate(frame, [65, 80], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const contextOp = interpolate(frame, [75, 90], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const divW = interpolate(frame, [60, 82], [0, 400], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  const chapterWord = "CHAPTER_WORD"
  const chapterSub = "CHAPTER_SUB"
  const contextText = "CONTEXT_TEXT"
  const word1 = "WORD_1"
  const word2 = "WORD_2"

  // Split word assembly — word splits into two halves sliding apart then back together
  const word1Tx = interpolate(frame, [8, 45], [-300, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const word2Tx = interpolate(frame, [8, 45], [300, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const word1Op = interpolate(frame, [8, 25], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const word2Op = interpolate(frame, [15, 32], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  // After assembly — second line slides up
  const line2Ty = interpolate(frame, [48, 65], [60, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const line2Op = interpolate(frame, [48, 65], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden', backgroundColor: 'BACKGROUND_COLOR' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden', backgroundColor: 'PANEL_LEFT_BG', opacity: bgOp * 0.1 }} />
      <div style={{ position: 'absolute', top: 1074, left: 0, width: barW, height: 6, overflow: 'hidden', backgroundColor: 'PRIMARY_COLOR' }} />
      <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 5, overflow: 'hidden', backgroundColor: 'PRIMARY_COLOR', opacity: bgOp }} />

      {/* Left accent bar */}
      <div style={{ position: 'absolute', top: 240, left: 180, width: 5, height: 560, overflow: 'hidden', backgroundColor: 'PRIMARY_COLOR', opacity: bgOp }} />

      {/* Chapter label */}
      <div style={{ position: 'absolute', top: 240, left: 210, width: 700, height: 56, overflow: 'hidden', opacity: word1Op }}>
        <span style={{ fontSize: 22, fontWeight: 600, color: 'PRIMARY_COLOR', fontFamily: 'sans-serif', letterSpacing: 6, textTransform: 'uppercase' }}>{chapterWord}</span>
      </div>

      {/* Word 1 slides from left */}
      <div style={{ position: 'absolute', top: 310, left: 175, width: 900, height: 200, overflow: 'hidden', opacity: word1Op, transform: `translateX(${word1Tx}px)` }}>
        <span style={{ fontSize: 180, fontWeight: 900, color: 'PRIMARY_COLOR', fontFamily: 'sans-serif', lineHeight: 1, letterSpacing: -4, textTransform: 'uppercase' }}>{word1}</span>
      </div>

      {/* Word 2 slides from right */}
      <div style={{ position: 'absolute', top: 480, left: 175, width: 1560, height: 200, overflow: 'hidden', opacity: word2Op, transform: `translateX(${word2Tx}px)` }}>
        <span style={{ fontSize: 180, fontWeight: 900, color: 'SECONDARY_COLOR', fontFamily: 'sans-serif', lineHeight: 1, letterSpacing: -4, textTransform: 'uppercase' }}>{word2}</span>
      </div>

      {/* Sub line slides up after assembly */}
      <div style={{ position: 'absolute', top: 700, left: 210, width: 1200, height: 60, overflow: 'hidden', opacity: line2Op, transform: `translateY(${line2Ty}px)` }}>
        <span style={{ fontSize: 36, fontWeight: 300, color: 'PRIMARY_COLOR', fontFamily: 'sans-serif', letterSpacing: 8, textTransform: 'uppercase', opacity: 0.7 }}>{chapterSub}</span>
      </div>

      {/* Divider */}
      <div style={{ position: 'absolute', top: 780, left: 210, width: divW, height: 2, overflow: 'hidden', backgroundColor: 'ACCENT_COLOR' }} />

      {/* Context */}
      <div style={{ position: 'absolute', top: 820, left: 210, width: 1100, height: 60, overflow: 'hidden', opacity: contextOp, transform: `translateY(${subTy}px)` }}>
        <span style={{ fontSize: 26, fontWeight: 400, color: 'SUPPORT_COLOR', fontFamily: 'sans-serif' }}>{contextText}</span>
      </div>
    </div>
  )
}

export default AnimationComponent