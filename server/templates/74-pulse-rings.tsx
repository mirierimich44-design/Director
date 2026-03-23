import React from 'react'
import { useCurrentFrame, interpolate } from 'remotion'

export const AnimationComponent = () => {
  const frame = useCurrentFrame()

  const titleOp = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const titleTy = interpolate(frame, [0, 20], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const barW = interpolate(frame, [10, 40], [0, 1920], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  // Core node
  const coreOp = interpolate(frame, [8, 22], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const coreScale = interpolate(frame, [8, 22], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  // 4 rings pulsing outward in loop — offset by 20 frames each
  const r1R = interpolate(frame % 80, [0, 80], [0, 440], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const r1Op = interpolate(frame % 80, [0, 40, 80], [0.8, 0.4, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  const r2Frame = (frame + 20) % 80
  const r2R = interpolate(r2Frame, [0, 80], [0, 440], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const r2Op = interpolate(r2Frame, [0, 40, 80], [0.8, 0.4, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  const r3Frame = (frame + 40) % 80
  const r3R = interpolate(r3Frame, [0, 80], [0, 440], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const r3Op = interpolate(r3Frame, [0, 40, 80], [0.8, 0.4, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  const r4Frame = (frame + 60) % 80
  const r4R = interpolate(r4Frame, [0, 80], [0, 440], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const r4Op = interpolate(r4Frame, [0, 40, 80], [0.8, 0.4, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  // Label
  const labelOp = interpolate(frame, [22, 38], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const labelTy = interpolate(frame, [22, 38], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const subOp = interpolate(frame, [35, 50], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  const title = "TITLE_TEXT"
  const originLabel = "ORIGIN_LABEL"
  const countValue = "COUNT_VALUE"
  const countLabel = "COUNT_LABEL"
  const alertText = "ALERT_TEXT"

  const cx = 960
  const cy = 520

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

      <svg width={1920} height={1080} style={{ position: 'absolute', top: 0, left: 0 }}>

        {/* Pulse rings */}
        <circle cx={cx} cy={cy} r={r1R} fill="none" stroke="PRIMARY_COLOR" strokeWidth={3} opacity={r1Op} />
        <circle cx={cx} cy={cy} r={r2R} fill="none" stroke="ACCENT_COLOR" strokeWidth={2.5} opacity={r2Op} />
        <circle cx={cx} cy={cy} r={r3R} fill="none" stroke="PRIMARY_COLOR" strokeWidth={2} opacity={r3Op} />
        <circle cx={cx} cy={cy} r={r4R} fill="none" stroke="ACCENT_COLOR" strokeWidth={1.5} opacity={r4Op} />

        {/* Static inner rings */}
        <circle cx={cx} cy={cy} r={90} fill="none" stroke="GRID_LINE" strokeWidth={1} opacity={coreOp} />
        <circle cx={cx} cy={cy} r={60} fill="CHART_BG" stroke="NODE_STROKE" strokeWidth={2} opacity={coreOp} />

        {/* Core */}
        <circle
          cx={cx} cy={cy} r={44}
          fill="PRIMARY_COLOR"
          opacity={coreOp}
          transform={`scale(${coreScale})`}
          style={{ transformOrigin: `${cx}px ${cy}px` }}
        />

      </svg>

      {/* Core label */}
      <div style={{
        position: 'absolute',
        top: cy - 18,
        left: cx - 120,
        width: 240,
        height: 36,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: coreOp,
      }}>
        <span style={{
          fontSize: 14,
          fontWeight: 900,
          color: 'TEXT_ON_PRIMARY',
          fontFamily: 'sans-serif',
          letterSpacing: 1,
          textTransform: 'uppercase',
        }}>
          {originLabel}
        </span>
      </div>

      {/* Count — bottom left */}
      <div style={{
        position: 'absolute',
        top: 820,
        left: 160,
        width: 600,
        height: 100,
        overflow: 'hidden',
        opacity: labelOp,
        transform: `translateY(${labelTy}px)`,
      }}>
        <span style={{
          fontSize: 80,
          fontWeight: 900,
          color: 'PRIMARY_COLOR',
          fontFamily: 'sans-serif',
          lineHeight: 1,
          letterSpacing: -2,
        }}>
          {countValue}
        </span>
      </div>

      <div style={{
        position: 'absolute',
        top: 910,
        left: 160,
        width: 600,
        height: 40,
        overflow: 'hidden',
        opacity: subOp,
      }}>
        <span style={{
          fontSize: 22,
          fontWeight: 500,
          color: 'SUPPORT_COLOR',
          fontFamily: 'sans-serif',
          letterSpacing: 3,
          textTransform: 'uppercase',
        }}>
          {countLabel}
        </span>
      </div>

      {/* Alert — bottom right */}
      <div style={{
        position: 'absolute',
        top: 840,
        left: 1400,
        width: 360,
        height: 60,
        overflow: 'hidden',
        opacity: subOp,
        backgroundColor: 'SECONDARY_COLOR',
        borderRadius: 4,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxSizing: 'border-box',
      }}>
        <span style={{
          fontSize: 20,
          fontWeight: 700,
          color: 'TEXT_ON_SECONDARY',
          fontFamily: 'sans-serif',
          letterSpacing: 2,
          textTransform: 'uppercase',
        }}>
          {alertText}
        </span>
      </div>

    </div>
  )
}

export default AnimationComponent