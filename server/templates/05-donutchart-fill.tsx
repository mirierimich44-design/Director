import React from 'react'
import { useCurrentFrame, interpolate } from 'remotion'

export const AnimationComponent = () => {
  const frame = useCurrentFrame()

  const titleOp = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const titleTy = interpolate(frame, [0, 20], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const ringOp = interpolate(frame, [15, 30], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const fillProgress = interpolate(frame, [28, 80], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const centerOp = interpolate(frame, [75, 90], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const centerTy = interpolate(frame, [75, 90], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const labelOp = interpolate(frame, [82, 96], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const barW = interpolate(frame, [15, 45], [0, 1920], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  const title = "TITLE_TEXT"
  const donutValue = "DONUT_VALUE"
  const donutLabel = "DONUT_LABEL"
  const contextText = "CONTEXT_TEXT"

  // Donut geometry
  const cx = 960
  const cy = 560
  const outerR = 280
  const innerR = 180
  const strokeW = outerR - innerR

  // Parse percentage from DONUT_VALUE placeholder — use 0.44 as default for stub
  const targetPct = 0.44
  const currentPct = fillProgress * targetPct

  // SVG arc calculation
  const circumference = 2 * Math.PI * (innerR + strokeW / 2)
  const arcRadius = innerR + strokeW / 2
  const dashArray = circumference
  const dashOffset = circumference * (1 - currentPct)

  // Start from top (-90 degrees)
  const startAngle = -Math.PI / 2
  const endAngle = startAngle + currentPct * 2 * Math.PI

  const x1 = cx + arcRadius * Math.cos(startAngle)
  const y1 = cy + arcRadius * Math.sin(startAngle)
  const x2 = cx + arcRadius * Math.cos(endAngle)
  const y2 = cy + arcRadius * Math.sin(endAngle)
  const largeArc = currentPct > 0.5 ? 1 : 0

  const arcPath = currentPct > 0.001
    ? `M ${x1} ${y1} A ${arcRadius} ${arcRadius} 0 ${largeArc} 1 ${x2} ${y2}`
    : ''

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

        {/* Background ring */}
        <circle
          cx={cx}
          cy={cy}
          r={arcRadius}
          fill="none"
          stroke="CHART_BG"
          strokeWidth={strokeW}
          opacity={ringOp}
        />

        {/* Fill arc */}
        {arcPath && (
          <path
            d={arcPath}
            fill="none"
            stroke="PRIMARY_COLOR"
            strokeWidth={strokeW}
            strokeLinecap="butt"
            opacity={ringOp}
          />
        )}

        {/* Inner circle */}
        <circle
          cx={cx}
          cy={cy}
          r={innerR - 8}
          fill="BACKGROUND_COLOR"
          opacity={ringOp}
        />

      </svg>

      {/* Center value */}
      <div style={{
        position: 'absolute',
        top: cy - 70,
        left: cx - 200,
        width: 400,
        height: 100,
        overflow: 'hidden',
        opacity: centerOp,
        transform: `translateY(${centerTy}px)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <span style={{
          fontSize: 88,
          fontWeight: 900,
          color: 'PRIMARY_COLOR',
          fontFamily: 'sans-serif',
          lineHeight: 1,
          letterSpacing: -2,
        }}>
          {donutValue}
        </span>
      </div>

      {/* Center label */}
      <div style={{
        position: 'absolute',
        top: cy + 44,
        left: cx - 200,
        width: 400,
        height: 50,
        overflow: 'hidden',
        opacity: centerOp,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <span style={{
          fontSize: 24,
          fontWeight: 500,
          color: 'SUPPORT_COLOR',
          fontFamily: 'sans-serif',
          textAlign: 'center',
          textTransform: 'uppercase',
          letterSpacing: 2,
        }}>
          {donutLabel}
        </span>
      </div>

      {/* Context text below */}
      <div style={{
        position: 'absolute',
        top: cy + outerR + 40,
        left: 0,
        width: 1920,
        height: 60,
        overflow: 'hidden',
        opacity: labelOp,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <span style={{
          fontSize: 24,
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