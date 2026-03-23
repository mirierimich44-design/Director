import React, { useMemo } from 'react'
import { useCurrentFrame, interpolate } from 'remotion'

export const AnimationComponent = () => {
  const frame = useCurrentFrame()

  const title = "TITLE_TEXT"
  const originLabel = "ORIGIN_LABEL"
  const rawTargets = ["TARGET_1", "TARGET_2", "TARGET_3", "TARGET_4", "TARGET_5", "TARGET_6"]
  const rawPositions = [
    { x: 900,  y: 260 },
    { x: 1100, y: 340 },
    { x: 1260, y: 480 },
    { x: 1260, y: 620 },
    { x: 1100, y: 760 },
    { x: 900,  y: 840 },
  ]

  const activeItems = useMemo(() => {
    return rawTargets
      .map((t, i) => ({ label: t, pos: rawPositions[i] }))
      .filter((item) => item.label !== '' && item.label !== 'Placeholder')
  }, [])

  const count = activeItems.length

  const titleOp = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const titleTy = interpolate(frame, [0, 20], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const originOp = interpolate(frame, [8, 25], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const originScale = interpolate(frame, [8, 25], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const ring1R = interpolate(frame, [20, 60], [0, 280], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const ring1Op = interpolate(frame, [20, 60], [0.8, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const ring2R = interpolate(frame, [32, 72], [0, 280], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const ring2Op = interpolate(frame, [32, 72], [0.8, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const ring3R = interpolate(frame, [44, 84], [0, 280], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const ring3Op = interpolate(frame, [44, 84], [0.8, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  
  const labelOp = interpolate(frame, [75, 90], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  const ox = 480
  const oy = 540

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

        <circle cx={ox} cy={oy} r={ring1R} fill="none" stroke="PRIMARY_COLOR" strokeWidth={3} opacity={ring1Op} />
        <circle cx={ox} cy={oy} r={ring2R} fill="none" stroke="PRIMARY_COLOR" strokeWidth={2.5} opacity={ring2Op} />
        <circle cx={ox} cy={oy} r={ring3R} fill="none" stroke="PRIMARY_COLOR" strokeWidth={2} opacity={ring3Op} />

        {activeItems.map((item, i) => {
          const tOp = interpolate(frame, [38 + (i * 6), 52 + (i * 6)], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
          const tScale = interpolate(frame, [38 + (i * 6), 52 + (i * 6)], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
          return (
            <g key={i}>
              <line
                x1={ox} y1={oy} x2={item.pos.x} y2={item.pos.y}
                stroke="LINE_STROKE"
                strokeWidth={3}
                opacity={tOp}
                strokeDasharray="10 6"
              />
              <circle cx={item.pos.x} cy={item.pos.y} r={30} fill="CHART_BG" stroke="ACCENT_COLOR" strokeWidth={3} opacity={tOp} transform={`scale(${tScale})`} style={{ transformOrigin: `${item.pos.x}px ${item.pos.y}px` }} />
              <circle cx={item.pos.x} cy={item.pos.y} r={18} fill="NODE_FILL" opacity={tOp} transform={`scale(${tScale})`} style={{ transformOrigin: `${item.pos.x}px ${item.pos.y}px` }} />
            </g>
          )
        })}

        <circle cx={ox} cy={oy} r={50} fill="CHART_BG" stroke="PRIMARY_COLOR" strokeWidth={4} opacity={originOp} transform={`scale(${originScale})`} style={{ transformOrigin: `${ox}px ${oy}px` }} />
        <circle cx={ox} cy={oy} r={32} fill="PRIMARY_COLOR" opacity={originOp} transform={`scale(${originScale})`} style={{ transformOrigin: `${ox}px ${oy}px` }} />
      </svg>

      <div style={{
        position: 'absolute',
        top: oy - 16,
        left: ox - 90,
        width: 180,
        height: 32,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: originOp,
      }}>
        <span style={{
          fontSize: 13,
          fontWeight: 800,
          color: '#FFFFFF',
          fontFamily: 'sans-serif',
          letterSpacing: 1,
          textTransform: 'uppercase',
        }}>
          {originLabel}
        </span>
      </div>

      {activeItems.map((item, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            top: item.pos.y + 36,
            left: item.pos.x - 100,
            width: 200,
            height: 40,
            overflow: 'hidden',
            opacity: labelOp,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span style={{
            fontSize: 18,
            fontWeight: 600,
            color: 'PRIMARY_COLOR',
            fontFamily: 'sans-serif',
            textAlign: 'center',
            letterSpacing: 1,
          }}>
            {item.label}
          </span>
        </div>
      ))}

    </div>
  )
}

export default AnimationComponent