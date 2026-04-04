import React, { useMemo } from 'react'
import { useCurrentFrame, interpolate } from 'remotion'

export const AnimationComponent = () => {
  const frame = useCurrentFrame()

  const title = "TITLE_TEXT"
  const rawSteps = ["STEP_1", "STEP_2", "STEP_3", "STEP_4"]
  const rawPhases = ["PHASE_1", "PHASE_2", "PHASE_3", "PHASE_4"]

  const items = useMemo(() => {
    return rawSteps
      .map((step, i) => ({ step, phase: rawPhases[i] }))
      .filter(item => item.step !== '' && item.step !== 'Placeholder' && item.phase !== '' && item.phase !== 'Placeholder')
  }, [])

  const count = items.length

  const titleOp = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const titleTy = interpolate(frame, [0, 20], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const barW = interpolate(frame, [10, 40], [0, 1920], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  const blockW = 340
  const blockH = 280
  const arrowW = 80
  const totalW = count * blockW + (count - 1) * arrowW
  const startX = (1920 - totalW) / 2
  const blockY = 380

  // All cards use a dark semi-transparent background, so text must always be light.
  // TEXT_ON_* colors are for light/colored backgrounds — avoid them here.
  const blockColors = ['PRIMARY_COLOR', 'PANEL_LEFT_BG', 'PANEL_LEFT_BG', 'SECONDARY_COLOR']
  const textColors = ['#ffffff', '#ffffff', '#ffffff', '#ffffff']

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

      {items.map((_, i) => {
        const x = startX + i * (blockW + arrowW)
        const op = interpolate(frame, [15 + i * 13, 30 + i * 13], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
        return (
          <div key={i} style={{
            position: 'absolute',
            top: blockY - 60,
            left: x,
            width: blockW,
            height: 48,
            overflow: 'hidden',
            opacity: op,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <span style={{
              fontSize: 18,
              fontWeight: 600,
              color: 'SUPPORT_COLOR',
              fontFamily: 'sans-serif',
              letterSpacing: 3,
              textTransform: 'uppercase',
            }}>
              STEP {i + 1}
            </span>
          </div>
        )
      })}

      {items.map((item, i) => {
        const x = startX + i * (blockW + arrowW)
        const op = interpolate(frame, [15 + i * 13, 30 + i * 13], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
        const ty = interpolate(frame, [15 + i * 13, 30 + i * 13], [30, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
        return (
          <div key={i} style={{
            position: 'absolute',
            top: blockY,
            left: x,
            width: blockW,
            height: blockH,
            overflow: 'hidden',
            backgroundColor: 'rgba(15, 23, 42, 0.8)',
            borderRadius: 16,
            boxSizing: 'border-box',
            border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
            opacity: op,
            transform: `translateY(${ty}px)`,
          }}>
            <div style={{ position: 'absolute', top: 28, left: 24, width: blockW - 48, height: 44 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'ACCENT_COLOR', fontFamily: 'sans-serif', letterSpacing: 3, textTransform: 'uppercase' }}>
                {item.phase}
              </span>
            </div>
            <div style={{ position: 'absolute', top: 80, left: 24, width: blockW - 48, height: 120 }}>
              <span style={{ fontSize: 30, fontWeight: 700, color: textColors[i % textColors.length], fontFamily: 'sans-serif', lineHeight: 1.3 }}>
                {item.step}
              </span>
            </div>
            <div style={{ position: 'absolute', top: blockH - 6, left: 0, width: blockW, height: 6, backgroundColor: i === count - 1 ? 'ACCENT_COLOR' : 'PRIMARY_COLOR', opacity: 0.4 }} />
          </div>
        )
      })}

      <svg width={1920} height={1080} style={{ position: 'absolute', top: 0, left: 0 }}>
        {Array.from({ length: count - 1 }).map((_, i) => {
          const op = interpolate(frame, [32 + i * 13, 44 + i * 13], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
          const x1 = startX + (i + 1) * blockW + i * arrowW
          const x2 = x1 + arrowW
          const cy = blockY + blockH / 2
          return (
            <g key={i} opacity={op}>
              <line x1={x1} y1={cy} x2={x2 - 12} y2={cy} stroke="LINE_STROKE" strokeWidth={2.5} />
              <polygon points={`${x2 - 12},${cy - 9} ${x2},${cy} ${x2 - 12},${cy + 9}`} fill="LINE_STROKE" />
            </g>
          )
        })}
      </svg>

      {items.map((item, i) => {
        const x = startX + i * (blockW + arrowW)
        const op = interpolate(frame, [65, 80], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
        return (
          <div key={i} style={{
            position: 'absolute',
            top: blockY + blockH + 24,
            left: x,
            width: blockW,
            height: 60,
            opacity: op,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 12px',
          }}>
            <span style={{ fontSize: 19, fontWeight: 400, color: 'SUPPORT_COLOR', fontFamily: 'sans-serif', textAlign: 'center' }}>
              {item.phase}
            </span>
          </div>
        )
      })}
    </div>
  )
}

export default AnimationComponent