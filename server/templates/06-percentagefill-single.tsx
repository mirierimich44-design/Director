import React from 'react'
import { useCurrentFrame, interpolate } from 'remotion'

export const AnimationComponent = () => {
  const frame = useCurrentFrame()

  const titleOp = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const titleTy = interpolate(frame, [0, 20], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const trackOp = interpolate(frame, [15, 30], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const fillProgress = interpolate(frame, [28, 78], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const valueOp = interpolate(frame, [72, 88], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const valueTy = interpolate(frame, [72, 88], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const labelOp = interpolate(frame, [80, 95], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const barW = interpolate(frame, [15, 45], [0, 1920], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  const title = "TITLE_TEXT"
  const percentValue = "PERCENT_VALUE"
  const percentLabel = "PERCENT_LABEL"
  const contextText = "CONTEXT_TEXT"

  // Bar dimensions
  const trackLeft = 360
  const trackTop = 460
  const trackWidth = 1200
  const trackHeight = 80
  const targetPct = 0.44
  const currentW = trackWidth * fillProgress * targetPct

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
          fontSize: 28,
          fontWeight: 700,
          color: 'PRIMARY_COLOR',
          letterSpacing: 5,
          textTransform: 'uppercase',
          fontFamily: 'sans-serif',
        }}>
          {title}
        </span>
      </div>

      {/* Large percentage number */}
      <div style={{
        position: 'absolute',
        top: 260,
        left: 0,
        width: 1920,
        height: 180,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: valueOp,
        transform: `translateY(${valueTy}px)`,
      }}>
        <span style={{
          fontSize: 180,
          fontWeight: 900,
          color: 'PRIMARY_COLOR',
          fontFamily: 'sans-serif',
          lineHeight: 1,
          letterSpacing: -4,
        }}>
          {percentValue}
        </span>
        <span style={{
          fontSize: 80,
          fontWeight: 700,
          color: 'ACCENT_COLOR',
          fontFamily: 'sans-serif',
          marginLeft: 8,
          alignSelf: 'flex-end',
          paddingBottom: 20,
        }}>
          %
        </span>
      </div>

      {/* Track background */}
      <div style={{
        position: 'absolute',
        top: trackTop,
        left: trackLeft,
        width: trackWidth,
        height: trackHeight,
        overflow: 'hidden',
        backgroundColor: 'CHART_BG',
        borderRadius: trackHeight / 2,
        opacity: trackOp,
        boxSizing: 'border-box',
        border: '2px solid',
        borderColor: 'CHART_BORDER',
      }} />

      {/* Fill bar */}
      <div style={{
        position: 'absolute',
        top: trackTop,
        left: trackLeft,
        width: currentW,
        height: trackHeight,
        overflow: 'hidden',
        backgroundColor: 'PRIMARY_COLOR',
        borderRadius: trackHeight / 2,
        opacity: trackOp,
      }} />

      {/* Percentage marker line */}
      <div style={{
        position: 'absolute',
        top: trackTop - 20,
        left: trackLeft + currentW - 2,
        width: 4,
        height: trackHeight + 40,
        overflow: 'hidden',
        backgroundColor: 'ACCENT_COLOR',
        opacity: trackOp,
      }} />

      {/* Percent label */}
      <div style={{
        position: 'absolute',
        top: trackTop + trackHeight + 28,
        left: 0,
        width: 1920,
        height: 60,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: labelOp,
      }}>
        <span style={{
          fontSize: 28,
          fontWeight: 600,
          color: 'ACCENT_COLOR',
          fontFamily: 'sans-serif',
          letterSpacing: 3,
          textTransform: 'uppercase',
        }}>
          {percentLabel}
        </span>
      </div>

      {/* Context text */}
      <div style={{
        position: 'absolute',
        top: trackTop + trackHeight + 100,
        left: 0,
        width: 1920,
        height: 50,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: labelOp,
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