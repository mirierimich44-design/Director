import React from 'react'
import { useCurrentFrame, interpolate } from 'remotion'

export const AnimationComponent = () => {
  const frame = useCurrentFrame()

  const bgScale = interpolate(frame, [0, 40], [1.3, 1.0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const bgOp = interpolate(frame, [0, 25], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const overlayOp = interpolate(frame, [0, 35], [0.9, 0.4], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const titleOp = interpolate(frame, [25, 45], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const titleScale = interpolate(frame, [25, 45], [1.2, 1.0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const subOp = interpolate(frame, [40, 58], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const subTy = interpolate(frame, [40, 58], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const barW = interpolate(frame, [15, 50], [0, 1920], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const tagOp = interpolate(frame, [55, 70], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  const titleText = "TITLE_TEXT"
  const chapterWord = "CHAPTER_WORD"
  const chapterSub = "CHAPTER_SUB"
  const tag1 = "TAG_1"

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden', backgroundColor: 'PRIMARY_COLOR' }}>
      {/* Zoom background */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden', backgroundColor: 'PANEL_LEFT_BG', opacity: bgOp, transform: `scale(${bgScale})` }} />
      {/* Dark overlay */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden', backgroundColor: 'PRIMARY_COLOR', opacity: overlayOp }} />
      <div style={{ position: 'absolute', top: 1074, left: 0, width: barW, height: 6, overflow: 'hidden', backgroundColor: 'ACCENT_COLOR' }} />
      <div style={{ position: 'absolute', top: 5, left: 0, width: 1920, height: 5, overflow: 'hidden', backgroundColor: 'ACCENT_COLOR', opacity: titleOp }} />
      <div style={{ position: 'absolute', top: 360, left: 0, width: 1920, height: 50, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: subOp, transform: `translateY(${subTy}px)` }}>
        <span style={{ fontSize: 20, fontWeight: 600, color: 'ACCENT_COLOR', fontFamily: 'sans-serif', letterSpacing: 6, textTransform: 'uppercase' }}>{chapterWord}</span>
      </div>
      <div style={{ position: 'absolute', top: 420, left: 0, width: 1920, height: 200, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: titleOp, transform: `scale(${titleScale})` }}>
        <span style={{ fontSize: 140, fontWeight: 900, color: 'TEXT_ON_PRIMARY', fontFamily: 'sans-serif', letterSpacing: -3, textTransform: 'uppercase', lineHeight: 1 }}>{titleText}</span>
      </div>
      <div style={{ position: 'absolute', top: 640, left: 0, width: 1920, height: 60, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: subOp }}>
        <span style={{ fontSize: 28, fontWeight: 300, color: 'TEXT_ON_PRIMARY', fontFamily: 'sans-serif', opacity: 0.7, letterSpacing: 4 }}>{chapterSub}</span>
      </div>
      <div style={{ position: 'absolute', top: 730, left: 0, width: 1920, height: 50, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: tagOp }}>
        <span style={{ fontSize: 18, fontWeight: 600, color: 'ACCENT_COLOR', fontFamily: 'sans-serif', letterSpacing: 4, textTransform: 'uppercase' }}>{tag1}</span>
      </div>
    </div>
  )
}

export default AnimationComponent