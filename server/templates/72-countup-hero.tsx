import React from 'react'
import { useCurrentFrame, interpolate } from 'remotion'

export const AnimationComponent = () => {
  const frame = useCurrentFrame()

  const bgOp = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const barW = interpolate(frame, [10, 45], [0, 1920], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const leftBarH = interpolate(frame, [8, 35], [0, 700], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  const prefixOp = interpolate(frame, [12, 28], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const prefixTy = interpolate(frame, [12, 28], [30, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  const countProgress = interpolate(frame, [22, 82], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const finalOp = interpolate(frame, [80, 92], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  const suffixOp = interpolate(frame, [35, 52], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const suffixTy = interpolate(frame, [35, 52], [40, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  const labelOp = interpolate(frame, [55, 70], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const labelTy = interpolate(frame, [55, 70], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  const subOp = interpolate(frame, [68, 82], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const subTy = interpolate(frame, [68, 82], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  const divW = interpolate(frame, [45, 68], [0, 500], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  const title = "TITLE_TEXT"
  const countValue = "COUNT_VALUE"
  const countLabel = "COUNT_LABEL"
  const subLabel = "SUB_LABEL"
  const contextText = "CONTEXT_TEXT"

  // Parse numeric part from countValue (e.g. "$25B", "25 billion", "1,200")
  const targetNumber = parseFloat(countValue.replace(/[^0-9.]/g, '')) || 0
  const currentNumber = Math.floor(countProgress * targetNumber)

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

      {/* Dark left panel */}
      <div style={{
        position: 'absolute',
        top: 190,
        left: 120,
        width: 8,
        height: leftBarH,
        overflow: 'hidden',
        backgroundColor: 'PRIMARY_COLOR',
        opacity: bgOp,
      }} />

      {/* Bottom bar */}
      <div style={{
        position: 'absolute',
        top: 1074,
        left: 0,
        width: barW,
        height: 6,
        overflow: 'hidden',
        backgroundColor: 'ACCENT_COLOR',
      }} />

      {/* Top accent */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: 1920,
        height: 5,
        overflow: 'hidden',
        backgroundColor: 'PRIMARY_COLOR',
        opacity: bgOp,
      }} />

      {/* Title — top center */}
      <div style={{
        position: 'absolute',
        top: 72,
        left: 0,
        width: 1920,
        height: 60,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: bgOp,
      }}>
        <span style={{
          fontSize: 22,
          fontWeight: 600,
          color: 'SUPPORT_COLOR',
          fontFamily: 'sans-serif',
          letterSpacing: 6,
          textTransform: 'uppercase',
        }}>
          {title}
        </span>
      </div>

      {/* Count label */}
      <div style={{
        position: 'absolute',
        top: 200,
        left: 160,
        width: 1000,
        height: 60,
        overflow: 'hidden',
        opacity: prefixOp,
        transform: `translateY(${prefixTy}px)`,
      }}>
        <span style={{
          fontSize: 26,
          fontWeight: 600,
          color: 'ACCENT_COLOR',
          fontFamily: 'sans-serif',
          letterSpacing: 4,
          textTransform: 'uppercase',
        }}>
          {countLabel}
        </span>
      </div>

      {/* Divider */}
      <div style={{
        position: 'absolute',
        top: 272,
        left: 160,
        width: divW,
        height: 3,
        overflow: 'hidden',
        backgroundColor: 'ACCENT_COLOR',
      }} />

      {/* Animated number */}
      <div style={{
        position: 'absolute',
        top: 280,
        left: 140,
        width: 1200,
        height: 400,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
      }}>
        <span style={{
          fontSize: 340,
          fontWeight: 900,
          color: 'PRIMARY_COLOR',
          fontFamily: 'sans-serif',
          lineHeight: 1,
          letterSpacing: -12,
        }}>
          {currentNumber}
        </span>
      </div>

      {/* Final value overlay — snaps at end */}
      <div style={{
        position: 'absolute',
        top: 280,
        left: 140,
        width: 1200,
        height: 400,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        opacity: finalOp,
      }}>
        <span style={{
          fontSize: 340,
          fontWeight: 900,
          color: 'PRIMARY_COLOR',
          fontFamily: 'sans-serif',
          lineHeight: 1,
          letterSpacing: -12,
        }}>
          {countValue}
        </span>
      </div>

      {/* Sub label */}
      <div style={{
        position: 'absolute',
        top: 700,
        left: 160,
        width: 900,
        height: 70,
        overflow: 'hidden',
        opacity: suffixOp,
        transform: `translateY(${suffixTy}px)`,
      }}>
        <span style={{
          fontSize: 48,
          fontWeight: 700,
          color: 'SECONDARY_COLOR',
          fontFamily: 'sans-serif',
          letterSpacing: 1,
          textTransform: 'uppercase',
        }}>
          {subLabel}
        </span>
      </div>

      {/* Context text */}
      <div style={{
        position: 'absolute',
        top: 790,
        left: 160,
        width: 1000,
        height: 60,
        overflow: 'hidden',
        opacity: labelOp,
        transform: `translateY(${labelTy}px)`,
      }}>
        <span style={{
          fontSize: 26,
          fontWeight: 400,
          color: 'SUPPORT_COLOR',
          fontFamily: 'sans-serif',
          lineHeight: 1.5,
        }}>
          {contextText}
        </span>
      </div>

      {/* Right panel accent — large faded number ghost */}
      <div style={{
        position: 'absolute',
        top: 240,
        left: 1100,
        width: 700,
        height: 400,
        overflow: 'hidden',
        opacity: subOp * 0.06,
        display: 'flex',
        alignItems: 'center',
      }}>
        <span style={{
          fontSize: 420,
          fontWeight: 900,
          color: 'PRIMARY_COLOR',
          fontFamily: 'sans-serif',
          lineHeight: 1,
          letterSpacing: -16,
        }}>
          {countValue}
        </span>
      </div>

    </div>
  )
}

export default AnimationComponent