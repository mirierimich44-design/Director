import React from 'react'
import { useCurrentFrame, interpolate } from 'remotion'

export const AnimationComponent = () => {
  const frame = useCurrentFrame()

  const titleOp = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const titleTy = interpolate(frame, [0, 20], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const barW = interpolate(frame, [15, 45], [0, 1920], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  // Count up number
  const countProgress = interpolate(frame, [20, 80], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  const labelOp = interpolate(frame, [25, 40], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const labelTy = interpolate(frame, [25, 40], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const subOp = interpolate(frame, [70, 85], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const subTy = interpolate(frame, [70, 85], [16, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const divW = interpolate(frame, [30, 55], [0, 300], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const accentOp = interpolate(frame, [78, 92], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  const title = "TITLE_TEXT"
  const countValue = "COUNT_VALUE"
  const countLabel = "COUNT_LABEL"
  const subLabel = "SUB_LABEL"
  const contextText = "CONTEXT_TEXT"

  // Parse the count value for animation — default 247 for stub
  const targetNumber = 247
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

      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: 1920,
        height: 5,
        overflow: 'hidden',
        backgroundColor: 'PRIMARY_COLOR',
        opacity: titleOp,
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

      {/* Title */}
      <div style={{
        position: 'absolute',
        top: 60,
        left: 0,
        width: 1920,
        height: 60,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: titleOp,
        transform: `translateY(${titleTy}px)`,
      }}>
        <span style={{
          fontSize: 26,
          fontWeight: 700,
          color: 'PRIMARY_COLOR',
          letterSpacing: 5,
          textTransform: 'uppercase',
          fontFamily: 'sans-serif',
        }}>
          {title}
        </span>
      </div>

      {/* Count label above number */}
      <div style={{
        position: 'absolute',
        top: 280,
        left: 0,
        width: 1920,
        height: 60,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: labelOp,
        transform: `translateY(${labelTy}px)`,
      }}>
        <span style={{
          fontSize: 24,
          fontWeight: 600,
          color: 'SUPPORT_COLOR',
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
        top: 358,
        left: (1920 - 300) / 2,
        width: divW,
        height: 3,
        overflow: 'hidden',
        backgroundColor: 'ACCENT_COLOR',
      }} />

      {/* Animated count number */}
      <div style={{
        position: 'absolute',
        top: 370,
        left: 0,
        width: 1920,
        height: 320,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: 1 - accentOp,
      }}>
        <span style={{
          fontSize: 280,
          fontWeight: 900,
          color: 'PRIMARY_COLOR',
          fontFamily: 'sans-serif',
          lineHeight: 1,
          letterSpacing: -8,
        }}>
          {currentNumber}
        </span>
      </div>

      {/* Static count value shown after animation */}
      <div style={{
        position: 'absolute',
        top: 370,
        left: 0,
        width: 1920,
        height: 320,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: accentOp,
      }}>
        <span style={{
          fontSize: 280,
          fontWeight: 900,
          color: 'PRIMARY_COLOR',
          fontFamily: 'sans-serif',
          lineHeight: 1,
          letterSpacing: -8,
        }}>
          {countValue}
        </span>
      </div>

      {/* Sub label */}
      <div style={{
        position: 'absolute',
        top: 730,
        left: 0,
        width: 1920,
        height: 60,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: subOp,
        transform: `translateY(${subTy}px)`,
      }}>
        <span style={{
          fontSize: 28,
          fontWeight: 600,
          color: 'ACCENT_COLOR',
          fontFamily: 'sans-serif',
          letterSpacing: 3,
          textTransform: 'uppercase',
        }}>
          {subLabel}
        </span>
      </div>

      {/* Context text */}
      <div style={{
        position: 'absolute',
        top: 808,
        left: 0,
        width: 1920,
        height: 50,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: subOp,
      }}>
        <span style={{
          fontSize: 22,
          fontWeight: 400,
          color: 'SUPPORT_COLOR',
          fontFamily: 'sans-serif',
          textAlign: 'center',
        }}>
          {contextText}
        </span>
      </div>

    </div>
  )
}

export default AnimationComponent