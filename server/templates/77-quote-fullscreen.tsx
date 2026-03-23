import React from 'react'
import { useCurrentFrame, interpolate } from 'remotion'

export const AnimationComponent = () => {
  const frame = useCurrentFrame()

  const bgOp = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const markOp = interpolate(frame, [10, 28], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const markScale = interpolate(frame, [10, 28], [0.5, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const quoteOp = interpolate(frame, [22, 42], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const quoteTy = interpolate(frame, [22, 42], [30, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const divW = interpolate(frame, [38, 58], [0, 200], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const sourceOp = interpolate(frame, [52, 68], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const sourceTy = interpolate(frame, [52, 68], [16, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const subOp = interpolate(frame, [62, 76], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const barW = interpolate(frame, [15, 50], [0, 1920], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  const word1 = "WORD_1"
  const word2 = "WORD_2"
  const label1 = "LABEL_1"
  const label2 = "LABEL_2"
  const subLabel = "SUB_LABEL"

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
        opacity: bgOp * 0.06,
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
        top: 200,
        left: 160,
        width: 6,
        height: 680,
        overflow: 'hidden',
        backgroundColor: 'PRIMARY_COLOR',
        opacity: bgOp,
      }} />

      {/* Opening quote mark — using HTML entity to avoid backtick conflict */}
      <div style={{
        position: 'absolute',
        top: 100,
        left: 180,
        width: 220,
        height: 220,
        overflow: 'hidden',
        opacity: markOp * 0.25,
        transform: `scale(${markScale})`,
      }}>
        <span style={{
          fontSize: 280,
          fontWeight: 900,
          color: 'ACCENT_COLOR',
          fontFamily: 'serif',
          lineHeight: 1,
          display: 'block',
        }}>
          &ldquo;
        </span>
      </div>

      {/* Main quote text */}
      <div style={{
        position: 'absolute',
        top: 260,
        left: 220,
        width: 1480,
        height: 380,
        overflow: 'hidden',
        opacity: quoteOp,
        transform: `translateY(${quoteTy}px)`,
      }}>
        <span style={{
          fontSize: 68,
          fontWeight: 700,
          color: 'PRIMARY_COLOR',
          fontFamily: 'sans-serif',
          lineHeight: 1.25,
          letterSpacing: -1,
        }}>
          {word1}
        </span>
      </div>

      {/* Second quote line */}
      <div style={{
        position: 'absolute',
        top: 580,
        left: 220,
        width: 1480,
        height: 120,
        overflow: 'hidden',
        opacity: quoteOp,
        transform: `translateY(${quoteTy}px)`,
      }}>
        <span style={{
          fontSize: 48,
          fontWeight: 400,
          color: 'SUPPORT_COLOR',
          fontFamily: 'sans-serif',
          lineHeight: 1.4,
          fontStyle: 'italic',
        }}>
          {word2}
        </span>
      </div>

      {/* Divider */}
      <div style={{
        position: 'absolute',
        top: 730,
        left: 220,
        width: divW,
        height: 3,
        overflow: 'hidden',
        backgroundColor: 'ACCENT_COLOR',
      }} />

      {/* Source name */}
      <div style={{
        position: 'absolute',
        top: 752,
        left: 220,
        width: 900,
        height: 60,
        overflow: 'hidden',
        opacity: sourceOp,
        transform: `translateY(${sourceTy}px)`,
      }}>
        <span style={{
          fontSize: 32,
          fontWeight: 700,
          color: 'ACCENT_COLOR',
          fontFamily: 'sans-serif',
          letterSpacing: 2,
          textTransform: 'uppercase',
        }}>
          {label1}
        </span>
      </div>

      {/* Source role */}
      <div style={{
        position: 'absolute',
        top: 818,
        left: 220,
        width: 900,
        height: 50,
        overflow: 'hidden',
        opacity: sourceOp,
        transform: `translateY(${sourceTy}px)`,
      }}>
        <span style={{
          fontSize: 24,
          fontWeight: 400,
          color: 'SUPPORT_COLOR',
          fontFamily: 'sans-serif',
          letterSpacing: 1,
        }}>
          {label2}
        </span>
      </div>

      {/* Sub label */}
      <div style={{
        position: 'absolute',
        top: 752,
        left: 1400,
        width: 320,
        height: 50,
        overflow: 'hidden',
        opacity: subOp,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
      }}>
        <span style={{
          fontSize: 20,
          fontWeight: 500,
          color: 'SECONDARY_COLOR',
          fontFamily: 'sans-serif',
          letterSpacing: 3,
          textTransform: 'uppercase',
        }}>
          {subLabel}
        </span>
      </div>

    </div>
  )
}

export default AnimationComponent