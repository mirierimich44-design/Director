import React from 'react'
import { useCurrentFrame, interpolate } from 'remotion'

export const AnimationComponent = () => {
  const frame = useCurrentFrame()

  const bgOp = interpolate(frame, [0, 15], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const chapLabelOp = interpolate(frame, [8, 22], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const chapLabelTy = interpolate(frame, [8, 22], [-20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const wordOp = interpolate(frame, [18, 35], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const wordTy = interpolate(frame, [18, 35], [-80, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const subOp = interpolate(frame, [32, 48], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const subTy = interpolate(frame, [32, 48], [40, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const divW = interpolate(frame, [28, 50], [0, 400], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const ctxOp = interpolate(frame, [50, 65], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const ctxTy = interpolate(frame, [50, 65], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const barW = interpolate(frame, [20, 55], [0, 1920], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  const chapterWord = "CHAPTER_WORD"
  const chapterSub = "CHAPTER_SUB"
  const contextText = "CONTEXT_TEXT"

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: 1920,
      height: 1080,
      overflow: 'hidden',
      backgroundColor: 'BACKGROUND_COLOR',
    }}>

      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: 1920,
        height: 1080,
        overflow: 'hidden',
        backgroundColor: 'PANEL_LEFT_BG',
        opacity: bgOp * 0.12,
      }} />

      <div style={{
        position: 'absolute',
        top: 1074,
        left: 0,
        width: barW,
        height: 6,
        overflow: 'hidden',
        backgroundColor: 'PRIMARY_COLOR',
      }} />

      <div style={{
        position: 'absolute',
        top: 220,
        left: 180,
        width: 5,
        height: 640,
        overflow: 'hidden',
        backgroundColor: 'PRIMARY_COLOR',
        opacity: chapLabelOp,
      }} />

      {/* Chapter label */}
      <div style={{
        position: 'absolute',
        top: 220,
        left: 210,
        width: 700,
        height: 60,
        overflow: 'hidden',
        opacity: chapLabelOp,
        transform: `translateY(${chapLabelTy}px)`,
      }}>
        <span style={{
          fontSize: 24,
          fontWeight: 600,
          color: 'PRIMARY_COLOR',
          fontFamily: 'sans-serif',
          letterSpacing: 6,
          textTransform: 'uppercase',
        }}>
          {chapterWord}
        </span>
      </div>

      {/* Divider line */}
      <div style={{
        position: 'absolute',
        top: 298,
        left: 210,
        width: divW,
        height: 2,
        overflow: 'hidden',
        backgroundColor: 'ACCENT_COLOR',
      }} />

      {/* Hero word — capped height, no overflow */}
      <div style={{
        position: 'absolute',
        top: 310,
        left: 175,
        width: 1560,
        height: 460,
        overflow: 'hidden',
        opacity: wordOp,
        transform: `translateY(${wordTy}px)`,
      }}>
        <span style={{
          fontSize: 200,
          fontWeight: 900,
          color: 'PRIMARY_COLOR',
          fontFamily: 'sans-serif',
          lineHeight: 1.1,
          letterSpacing: -4,
          textTransform: 'uppercase',
          display: 'block',
        }}>
          {chapterSub}
        </span>
      </div>

      {/* Context text — safely below hero */}
      <div style={{
        position: 'absolute',
        top: 820,
        left: 210,
        width: 1100,
        height: 100,
        overflow: 'hidden',
        opacity: ctxOp,
        transform: `translateY(${ctxTy}px)`,
      }}>
        <span style={{
          fontSize: 28,
          fontWeight: 400,
          color: 'SUPPORT_COLOR',
          fontFamily: 'sans-serif',
          lineHeight: 1.5,
        }}>
          {contextText}
        </span>
      </div>

      {/* Sub label bottom right */}
      <div style={{
        position: 'absolute',
        top: 840,
        left: 1400,
        width: 340,
        height: 50,
        overflow: 'hidden',
        opacity: subOp,
        transform: `translateY(${subTy}px)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
      }}>
        <span style={{
          fontSize: 20,
          fontWeight: 500,
          color: 'ACCENT_COLOR',
          fontFamily: 'sans-serif',
          letterSpacing: 3,
          textTransform: 'uppercase',
        }}>
          {chapterWord}
        </span>
      </div>

    </div>
  )
}

export default AnimationComponent