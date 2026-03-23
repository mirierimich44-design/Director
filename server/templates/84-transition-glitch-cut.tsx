import React from 'react'
import { useCurrentFrame, interpolate } from 'remotion'

export const AnimationComponent = () => {
  const frame = useCurrentFrame()

  const barW = interpolate(frame, [10, 40], [0, 1920], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const mainOp = interpolate(frame, [0, 15], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const titleOp = interpolate(frame, [12, 28], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const titleTy = interpolate(frame, [12, 28], [30, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const subOp = interpolate(frame, [28, 44], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  const glitchActive = frame < 35
  const cut1 = glitchActive ? interpolate(frame % 6, [0, 2, 3, 6], [0, 1, 0, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) : 0
  const cut2 = glitchActive ? interpolate(frame % 4, [0, 1, 2, 4], [0, 1, 0, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) : 0
  const cutX1 = glitchActive ? interpolate(frame % 7, [0, 3, 7], [-1920, 0, 1920], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) : 1920
  const cutX2 = glitchActive ? interpolate(frame % 5, [0, 2, 5], [1920, 0, -1920], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) : -1920

  const titleText = "TITLE_TEXT"
  const chapterSub = "CHAPTER_SUB"
  const tag1 = "TAG_1"

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden', backgroundColor: 'PRIMARY_COLOR' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden', backgroundColor: 'BACKGROUND_COLOR', opacity: mainOp * 0.08 }} />
      <div style={{ position: 'absolute', top: 1074, left: 0, width: barW, height: 6, overflow: 'hidden', backgroundColor: 'SECONDARY_COLOR' }} />
      {/* Glitch cut panels */}
      <div style={{ position: 'absolute', top: 0, left: cutX1, width: 1920, height: 540, overflow: 'hidden', backgroundColor: 'SECONDARY_COLOR', opacity: cut1 }} />
      <div style={{ position: 'absolute', top: 540, left: cutX2, width: 1920, height: 540, overflow: 'hidden', backgroundColor: 'ACCENT_COLOR', opacity: cut2 }} />
      {/* Main content */}
      <div style={{ position: 'absolute', top: 380, left: 0, width: 1920, height: 200, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: titleOp, transform: `translateY(${titleTy}px)` }}>
        <span style={{ fontSize: 160, fontWeight: 900, color: 'TEXT_ON_PRIMARY', fontFamily: 'sans-serif', letterSpacing: -4, textTransform: 'uppercase', lineHeight: 1 }}>{titleText}</span>
      </div>
      <div style={{ position: 'absolute', top: 600, left: 0, width: 1920, height: 60, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: subOp }}>
        <span style={{ fontSize: 28, fontWeight: 400, color: 'TEXT_ON_PRIMARY', fontFamily: 'sans-serif', letterSpacing: 6, opacity: 0.6, textTransform: 'uppercase' }}>{chapterSub}</span>
      </div>
      <div style={{ position: 'absolute', top: 700, left: 0, width: 1920, height: 50, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: subOp }}>
        <span style={{ fontSize: 18, fontWeight: 600, color: 'ACCENT_COLOR', fontFamily: 'sans-serif', letterSpacing: 4, textTransform: 'uppercase' }}>{tag1}</span>
      </div>
    </div>
  )
}

export default AnimationComponent