import React from 'react'
import { useCurrentFrame, interpolate } from 'remotion'

export const AnimationComponent = () => {
  const frame = useCurrentFrame()

  const titleOp = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const titleTy = interpolate(frame, [0, 20], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const barW = interpolate(frame, [10, 40], [0, 1920], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const originScale = interpolate(frame, [10, 25], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const originOp = interpolate(frame, [10, 25], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const ring1R = interpolate(frame, [18, 50], [0, 320], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const ring1Op = interpolate(frame, [18, 50], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const ring2R = interpolate(frame, [26, 58], [0, 320], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const ring2Op = interpolate(frame, [26, 58], [0.7, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const ring3R = interpolate(frame, [34, 66], [0, 320], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const ring3Op = interpolate(frame, [34, 66], [0.4, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const pProgress = interpolate(frame, [18, 70], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const pOp = interpolate(frame, [18, 68], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const pScale = interpolate(frame, [18, 68], [1, 0.3], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const labelOp = interpolate(frame, [55, 72], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const labelTy = interpolate(frame, [55, 72], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  const title = "TITLE_TEXT"
  const originLabel = "ORIGIN_LABEL"
  const countValue = "COUNT_VALUE"
  const countLabel = "COUNT_LABEL"

  const cx = 960
  const cy = 480

  const particleCount = 16
  const particleDistance = 380
  const particles = Array.from({ length: particleCount }, (_, i) => {
    const angle = (i / particleCount) * 2 * Math.PI
    const size = i % 3 === 0 ? 14 : i % 2 === 0 ? 9 : 6
    return {
      x: cx + Math.cos(angle) * particleDistance * pProgress,
      y: cy + Math.sin(angle) * particleDistance * pProgress,
      size,
    }
  })

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

        <circle cx={cx} cy={cy} r={ring1R} fill="none" stroke="PRIMARY_COLOR" strokeWidth={3} opacity={ring1Op} />
        <circle cx={cx} cy={cy} r={ring2R} fill="none" stroke="ACCENT_COLOR" strokeWidth={2} opacity={ring2Op} />
        <circle cx={cx} cy={cy} r={ring3R} fill="none" stroke="PRIMARY_COLOR" strokeWidth={1} opacity={ring3Op} />

        {particles.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={p.size * pScale}
            fill={i % 4 === 0 ? 'ACCENT_COLOR' : i % 3 === 0 ? 'SECONDARY_COLOR' : 'PRIMARY_COLOR'}
            opacity={pOp}
          />
        ))}

        {/* Origin outer ring */}
        <circle
          cx={cx} cy={cy} r={55}
          fill="PRIMARY_COLOR"
          stroke="ACCENT_COLOR"
          strokeWidth={4}
          opacity={originOp}
          transform={`scale(${originScale})`}
          style={{ transformOrigin: `${cx}px ${cy}px` }}
        />
        {/* Origin inner ring */}
        <circle
          cx={cx} cy={cy} r={38}
          fill="BACKGROUND_COLOR"
          opacity={originOp}
          transform={`scale(${originScale})`}
          style={{ transformOrigin: `${cx}px ${cy}px` }}
        />

      </svg>

      {/* Origin label — dark text inside light inner circle */}
      <div style={{
        position: 'absolute',
        top: cy - 22,
        left: cx - 110,
        width: 220,
        height: 44,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: originOp,
      }}>
        <span style={{
          fontSize: 13,
          fontWeight: 900,
          color: 'PRIMARY_COLOR',
          fontFamily: 'sans-serif',
          letterSpacing: 1,
          textTransform: 'uppercase',
          textAlign: 'center',
        }}>
          {originLabel}
        </span>
      </div>

      {/* Count below */}
      <div style={{
        position: 'absolute',
        top: cy + 130,
        left: 0,
        width: 1920,
        height: 80,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: labelOp,
        transform: `translateY(${labelTy}px)`,
      }}>
        <span style={{
          fontSize: 72,
          fontWeight: 900,
          color: 'PRIMARY_COLOR',
          fontFamily: 'sans-serif',
          letterSpacing: -2,
          marginRight: 20,
        }}>
          {countValue}
        </span>
        <span style={{
          fontSize: 28,
          fontWeight: 500,
          color: 'SUPPORT_COLOR',
          fontFamily: 'sans-serif',
          letterSpacing: 3,
          textTransform: 'uppercase',
          alignSelf: 'flex-end',
          paddingBottom: 12,
        }}>
          {countLabel}
        </span>
      </div>

    </div>
  )
}

export default AnimationComponent