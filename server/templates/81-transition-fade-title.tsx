import React from 'react'
import { useCurrentFrame, interpolate } from 'remotion'

export const AnimationComponent = () => {
  const frame = useCurrentFrame()

  const bgOp = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const titleOp = interpolate(frame, [15, 35], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const titleTy = interpolate(frame, [15, 35], [30, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const subOp = interpolate(frame, [30, 48], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const subTy = interpolate(frame, [30, 48], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const divW = interpolate(frame, [25, 50], [0, 300], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const barOp = interpolate(frame, [10, 30], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const barW = interpolate(frame, [10, 40], [0, 1920], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const tagOp = interpolate(frame, [45, 60], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  const titleText = "TITLE_TEXT"
  const chapterWord = "CHAPTER_WORD"
  const chapterSub = "CHAPTER_SUB"
  const tag1 = "TAG_1"

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden', backgroundColor: 'PRIMARY_COLOR' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden', backgroundColor: 'BACKGROUND_COLOR', opacity: 1 - bgOp }} />
      <div style={{ position: 'absolute', top: 1074, left: 0, width: barW, height: 6, overflow: 'hidden', backgroundColor: 'ACCENT_COLOR', opacity: barOp }} />
      <div style={{ position: 'absolute', top: 5, left: 0, width: 1920, height: 5, overflow: 'hidden', backgroundColor: 'ACCENT_COLOR', opacity: barOp }} />
      <div style={{ position: 'absolute', top: 380, left: 0, width: 1920, height: 60, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: subOp, transform: `translateY(${subTy}px)` }}>
        <span style={{ fontSize: 22, fontWeight: 600, color: 'ACCENT_COLOR', fontFamily: 'sans-serif', letterSpacing: 6, textTransform: 'uppercase' }}>{chapterWord}</span>
      </div>
      <div style={{ position: 'absolute', top: 452, left: (1920 - 300) / 2, width: divW, height: 3, overflow: 'hidden', backgroundColor: 'ACCENT_COLOR' }} />
      <div style={{ position: 'absolute', top: 468, left: 0, width: 1920, height: 180, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: titleOp, transform: `translateY(${titleTy}px)` }}>
        <span style={{ fontSize: 120, fontWeight: 900, color: 'TEXT_ON_PRIMARY', fontFamily: 'sans-serif', letterSpacing: -2, textTransform: 'uppercase', lineHeight: 1 }}>{titleText}</span>
      </div>
      <div style={{ position: 'absolute', top: 660, left: 0, width: 1920, height: 60, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: subOp }}>
        <span style={{ fontSize: 26, fontWeight: 400, color: 'TEXT_ON_PRIMARY', fontFamily: 'sans-serif', opacity: 0.7 }}>{chapterSub}</span>
      </div>
      <div style={{ position: 'absolute', top: 740, left: 0, width: 1920, height: 50, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: tagOp }}>
        <span style={{ fontSize: 18, fontWeight: 600, color: 'ACCENT_COLOR', fontFamily: 'sans-serif', letterSpacing: 4, textTransform: 'uppercase' }}>{tag1}</span>
      </div>
    </div>
  )
}

export default AnimationComponent