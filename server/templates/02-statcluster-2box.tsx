import React from 'react'
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion'

export const AnimationComponent = () => {
  const frame = useCurrentFrame()

  // Panel animation
  const panelOp = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  const panelTy = interpolate(frame, [0, 20], [30, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  // Stat 1 animation
  const stat1Op = interpolate(frame, [15, 35], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  const stat1Ty = interpolate(frame, [15, 35], [40, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  // Stat 2 animation
  const stat2Op = interpolate(frame, [28, 48], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  const stat2Ty = interpolate(frame, [28, 48], [40, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  // Label animations
  const label1Op = interpolate(frame, [35, 50], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  const label2Op = interpolate(frame, [45, 60], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  // Sub animations
  const sub1Op = interpolate(frame, [50, 65], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  const sub2Op = interpolate(frame, [58, 73], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  // Divider line
  const dividerW = interpolate(frame, [10, 40], [0, 860], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  // Content placeholders
  const stat1 = "STAT_VALUE_1"
  const stat2 = "STAT_VALUE_2"
  const label1 = "LABEL_1"
  const label2 = "LABEL_2"
  const sub1 = "SUB_1"
  const sub2 = "SUB_2"
  const title = "TITLE_TEXT"

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

      {/* Top accent bar */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: 1920,
        height: 6,
        overflow: 'hidden',
        backgroundColor: 'PRIMARY_COLOR',
        opacity: panelOp,
      }} />

      {/* Title */}
      <div style={{
        position: 'absolute',
        top: 80,
        left: 0,
        width: 1920,
        height: 80,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: panelOp,
        transform: `translateY(${panelTy}px)`,
      }}>
        <span style={{
          fontSize: 28,
          fontWeight: 600,
          color: 'SECONDARY_COLOR',
          letterSpacing: 4,
          textTransform: 'uppercase',
          fontFamily: 'sans-serif',
        }}>
          {title}
        </span>
      </div>

      {/* Divider line */}
      <div style={{
        position: 'absolute',
        top: 170,
        left: 530,
        width: dividerW,
        height: 2,
        overflow: 'hidden',
        backgroundColor: 'ACCENT_COLOR',
      }} />

      {/* Left stat box */}
      <div style={{
        position: 'absolute',
        top: 220,
        left: 200,
        width: 680,
        height: 420,
        overflow: 'hidden',
        backgroundColor: 'PANEL_LEFT_BG',
        borderRadius: 8,
        boxSizing: 'border-box',
        padding: '48px 56px',
        opacity: stat1Op,
        transform: `translateY(${stat1Ty}px)`,
      }}>

        {/* Stat value */}
        <div style={{
          position: 'absolute',
          top: 60,
          left: 56,
          width: 568,
          height: 180,
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
        }}>
          <span style={{
            fontSize: 120,
            fontWeight: 800,
            color: 'PRIMARY_COLOR',
            fontFamily: 'sans-serif',
            lineHeight: 1,
          }}>
            {stat1}
          </span>
        </div>

        {/* Label */}
        <div style={{
          position: 'absolute',
          top: 250,
          left: 56,
          width: 568,
          height: 60,
          overflow: 'hidden',
          opacity: label1Op,
        }}>
          <span style={{
            fontSize: 32,
            fontWeight: 700,
            color: 'TEXT_ON_SECONDARY',
            fontFamily: 'sans-serif',
            textTransform: 'uppercase',
            letterSpacing: 2,
          }}>
            {label1}
          </span>
        </div>

        {/* Sub */}
        <div style={{
          position: 'absolute',
          top: 320,
          left: 56,
          width: 568,
          height: 60,
          overflow: 'hidden',
          opacity: sub1Op,
        }}>
          <span style={{
            fontSize: 22,
            fontWeight: 400,
            color: 'SUPPORT_COLOR',
            fontFamily: 'sans-serif',
          }}>
            {sub1}
          </span>
        </div>

        {/* Left accent bar */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: 6,
          height: 420,
          overflow: 'hidden',
          backgroundColor: 'PRIMARY_COLOR',
          borderRadius: 8,
        }} />
      </div>

      {/* Right stat box */}
      <div style={{
        position: 'absolute',
        top: 220,
        left: 1040,
        width: 680,
        height: 420,
        overflow: 'hidden',
        backgroundColor: 'PANEL_RIGHT_BG',
        borderRadius: 8,
        boxSizing: 'border-box',
        padding: '48px 56px',
        opacity: stat2Op,
        transform: `translateY(${stat2Ty}px)`,
      }}>

        {/* Stat value */}
        <div style={{
          position: 'absolute',
          top: 60,
          left: 56,
          width: 568,
          height: 180,
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
        }}>
          <span style={{
            fontSize: 120,
            fontWeight: 800,
            color: 'ACCENT_COLOR',
            fontFamily: 'sans-serif',
            lineHeight: 1,
          }}>
            {stat2}
          </span>
        </div>

        {/* Label */}
        <div style={{
          position: 'absolute',
          top: 250,
          left: 56,
          width: 568,
          height: 60,
          overflow: 'hidden',
          opacity: label2Op,
        }}>
          <span style={{
            fontSize: 32,
            fontWeight: 700,
            color: 'TEXT_ON_SECONDARY',
            fontFamily: 'sans-serif',
            textTransform: 'uppercase',
            letterSpacing: 2,
          }}>
            {label2}
          </span>
        </div>

        {/* Sub */}
        <div style={{
          position: 'absolute',
          top: 320,
          left: 56,
          width: 568,
          height: 60,
          overflow: 'hidden',
          opacity: sub2Op,
        }}>
          <span style={{
            fontSize: 22,
            fontWeight: 400,
            color: 'SUPPORT_COLOR',
            fontFamily: 'sans-serif',
          }}>
            {sub2}
          </span>
        </div>

        {/* Right accent bar */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: 6,
          height: 420,
          overflow: 'hidden',
          backgroundColor: 'ACCENT_COLOR',
          borderRadius: 8,
        }} />
      </div>

      {/* Bottom label */}
      <div style={{
        position: 'absolute',
        top: 700,
        left: 0,
        width: 1920,
        height: 60,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: sub2Op,
      }}>
        <span style={{
          fontSize: 20,
          fontWeight: 400,
          color: 'SUPPORT_COLOR',
          fontFamily: 'sans-serif',
          letterSpacing: 2,
        }}>
          {sub2}
        </span>
      </div>

    </div>
  )
}

export default AnimationComponent