import React, { useMemo } from 'react'
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion'

export const AnimationComponent = () => {
  const frame = useCurrentFrame()

  // Content
  const rawPhases = ["PHASE_1", "PHASE_2", "PHASE_3", "PHASE_4"]
  const rawSteps = ["STEP_1", "STEP_2", "STEP_3", "STEP_4"]

  // Filter items
  const data = useMemo(() => {
    return rawPhases
      .map((p, i) => ({ phase: p, step: rawSteps[i] }))
      .filter(item => item.phase !== '' && item.phase !== 'Placeholder' && item.step !== '' && item.step !== 'Placeholder')
  }, [])

  const count = data.length

  // Title
  const titleOp = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  const titleTy = interpolate(frame, [0, 20], [20, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  // Dynamic stagger based on count
  const phaseOpacities = data.map((_, i) => interpolate(frame, [15 + i * 10, 30 + i * 10], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }))
  const phaseTx = data.map((_, i) => interpolate(frame, [15 + i * 10, 30 + i * 10], [-40, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }))
  const stepOpacities = data.map((_, i) => interpolate(frame, [30 + i * 10, 45 + i * 10], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }))
  const arrowOpacities = data.length > 1 ? data.slice(0, -1).map((_, i) => interpolate(frame, [28 + i * 10, 38 + i * 10], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })) : []

  // Layout
  const boxW = 340
  const boxH = 200
  const arrowW = 60
  const totalW = count * boxW + (count - 1) * arrowW
  const startX = (1920 - totalW) / 2
  const boxY = 400

  const phaseColors = ['PRIMARY_COLOR', 'SECONDARY_COLOR', 'ACCENT_COLOR', 'SUPPORT_COLOR']
  const phaseTextColors = ['TEXT_ON_PRIMARY', 'TEXT_ON_SECONDARY', 'TEXT_ON_ACCENT', 'TEXT_ON_PRIMARY']

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
        top: 100,
        left: 0,
        width: 1920,
        height: 70,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: titleOp,
        transform: `translateY(${titleTy}px)`,
      }}>
        <span style={{
          fontSize: 30,
          fontWeight: 700,
          color: 'PRIMARY_COLOR',
          letterSpacing: 5,
          textTransform: 'uppercase',
          fontFamily: 'sans-serif',
        }}>
          TITLE_TEXT
        </span>
      </div>

      {data.map((item, i) => {
        const x = startX + i * (boxW + arrowW)
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: 320,
              left: x,
              width: boxW,
              height: 50,
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: phaseOpacities[i],
            }}
          >
            <span style={{
              fontSize: 16,
              fontWeight: 600,
              color: 'SUPPORT_COLOR',
              fontFamily: 'sans-serif',
              letterSpacing: 3,
              textTransform: 'uppercase',
            }}>
              PHASE {i + 1}
            </span>
          </div>
        )
      })}

      {data.map((item, i) => {
        const x = startX + i * (boxW + arrowW)
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: boxY,
              left: x,
              width: boxW,
              height: boxH,
              overflow: 'hidden',
              backgroundColor: phaseColors[i % phaseColors.length],
              borderRadius: 6,
              boxSizing: 'border-box',
              padding: '24px 28px',
              opacity: phaseOpacities[i],
              transform: `translateX(${phaseTx[i]}px)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span style={{
              fontSize: 26,
              fontWeight: 700,
              color: phaseTextColors[i % phaseTextColors.length],
              fontFamily: 'sans-serif',
              textAlign: 'center',
              lineHeight: 1.3,
            }}>
              {item.phase}
            </span>
          </div>
        )
      })}

      {data.map((item, i) => {
        const x = startX + i * (boxW + arrowW)
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: boxY + boxH + 24,
              left: x,
              width: boxW,
              height: 80,
              overflow: 'hidden',
              opacity: stepOpacities[i],
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'center',
              boxSizing: 'border-box',
              padding: '0 12px',
            }}
          >
            <span style={{
              fontSize: 19,
              fontWeight: 400,
              color: 'TEXT_ON_SECONDARY',
              fontFamily: 'sans-serif',
              textAlign: 'center',
              lineHeight: 1.5,
            }}>
              {item.step}
            </span>
          </div>
        )
      })}

      <svg
        width={1920}
        height={1080}
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        {arrowOpacities.map((op, i) => {
          const x = startX + (i + 1) * boxW + i * arrowW
          const cy = boxY + boxH / 2
          return (
            <g key={i} style={{ opacity: op }}>
              <line
                x1={x}
                y1={cy}
                x2={x + arrowW - 10}
                y2={cy}
                stroke="LINE_STROKE"
                strokeWidth={2}
              />
              <polygon
                points={`${x + arrowW - 10},${cy - 8} ${x + arrowW},${cy} ${x + arrowW - 10},${cy + 8}`}
                fill="LINE_STROKE"
              />
            </g>
          )
        })}
      </svg>
    </div>
  )
}

export default AnimationComponent