import React, { useMemo } from 'react'
import { useCurrentFrame, interpolate } from 'remotion'

export const AnimationComponent = () => {
  const frame = useCurrentFrame()

  const title = "TITLE_TEXT"
  const rawPhases = ["PHASE_1", "PHASE_2", "PHASE_3", "PHASE_4"]
  const rawSteps = ["STEP_1", "STEP_2", "STEP_3", "STEP_4"]
  const titleText2 = "TITLE_TEXT"
  const phaseColors = ['PRIMARY_COLOR', 'SECONDARY_COLOR', 'ACCENT_COLOR', 'SUPPORT_COLOR']
  const textColors = ['TEXT_ON_PRIMARY', 'TEXT_ON_SECONDARY', 'TEXT_ON_ACCENT', 'TEXT_ON_PRIMARY']

  const activeItems = useMemo(() => {
    return rawPhases
      .map((p, i) => ({ phase: p, step: rawSteps[i], color: phaseColors[i], textColor: textColors[i] }))
      .filter(item => item.phase !== '' && item.phase !== 'Placeholder' && item.step !== '' && item.step !== 'Placeholder')
  }, [])

  const count = activeItems.length
  const titleOp = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const titleTy = interpolate(frame, [0, 20], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const barW = interpolate(frame, [10, 40], [0, 1920], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const ringOp = interpolate(frame, [12, 28], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const arrowOp = interpolate(frame, [60, 75], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const centerOp = interpolate(frame, [65, 80], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  const cx = 960
  const cy = 560
  const radius = 320
  const nodeW = 260
  const nodeH = 130

  const angles = Array.from({ length: count }, (_, i) => (i * (360 / count) - 90) * (Math.PI / 180))
  const positions = angles.map(a => ({
    x: cx + radius * Math.cos(a),
    y: cy + radius * Math.sin(a),
  }))

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden', backgroundColor: 'BACKGROUND_COLOR' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 5, overflow: 'hidden', backgroundColor: 'PRIMARY_COLOR', opacity: titleOp }} />
      <div style={{ position: 'absolute', top: 1074, left: 0, width: barW, height: 6, overflow: 'hidden', backgroundColor: 'PRIMARY_COLOR' }} />
      <div style={{ position: 'absolute', top: 40, left: 0, width: 1920, height: 60, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: titleOp, transform: `translateY(${titleTy}px)` }}>
        <span style={{ fontSize: 26, fontWeight: 700, color: 'PRIMARY_COLOR', letterSpacing: 5, textTransform: 'uppercase', fontFamily: 'sans-serif' }}>{title}</span>
      </div>

      <svg width={1920} height={1080} style={{ position: 'absolute', top: 0, left: 0 }}>
        <circle cx={cx} cy={cy} r={radius + 60} fill="none" stroke="GRID_LINE" strokeWidth={1} opacity={ringOp} strokeDasharray="8 6" />
        <circle cx={cx} cy={cy} r={radius - 60} fill="none" stroke="GRID_LINE" strokeWidth={1} opacity={ringOp * 0.5} strokeDasharray="4 8" />

        {count > 1 && positions.map((pos, i) => {
          const next = positions[(i + 1) % count]
          const mx = (pos.x + next.x) / 2
          const my = (pos.y + next.y) / 2
          const dx = mx - cx
          const dy = my - cy
          const len = Math.sqrt(dx * dx + dy * dy)
          const cpx = mx + (dx / len) * 80
          const cpy = my + (dy / len) * 80
          return (
            <path key={i} d={`M ${pos.x} ${pos.y} Q ${cpx} ${cpy} ${next.x} ${next.y}`} fill="none" stroke="LINE_STROKE" strokeWidth={2} strokeDasharray="6 4" opacity={arrowOp} />
          )
        })}
      </svg>

      {activeItems.map((item, i) => {
        const frameStart = 22 + i * 10
        const op = interpolate(frame, [frameStart, frameStart + 14], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
        const scale = interpolate(frame, [frameStart, frameStart + 14], [0.6, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
        const pos = positions[i]
        return (
          <div key={i} style={{ position: 'absolute', top: pos.y - nodeH / 2, left: pos.x - nodeW / 2, width: nodeW, height: nodeH, overflow: 'hidden', backgroundColor: item.color, borderRadius: 8, opacity: op, transform: `scale(${scale})`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box' }}>
            <div style={{ position: 'absolute', top: 12, left: 0, width: nodeW, height: 24, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: item.textColor, fontFamily: 'sans-serif', letterSpacing: 3, textTransform: 'uppercase', opacity: 0.7 }}>PHASE {i + 1}</span>
            </div>
            <div style={{ position: 'absolute', top: 38, left: 12, width: nodeW - 24, height: 50, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 24, fontWeight: 700, color: item.textColor, fontFamily: 'sans-serif', textAlign: 'center', lineHeight: 1.2 }}>{item.phase}</span>
            </div>
            <div style={{ position: 'absolute', top: 90, left: 12, width: nodeW - 24, height: 28, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 16, fontWeight: 400, color: item.textColor, fontFamily: 'sans-serif', textAlign: 'center', opacity: 0.8 }}>{item.step}</span>
            </div>
          </div>
        )
      })}

      <div style={{ position: 'absolute', top: cy - 30, left: cx - 120, width: 240, height: 60, overflow: 'hidden', opacity: centerOp, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 20, fontWeight: 700, color: 'ACCENT_COLOR', fontFamily: 'sans-serif', textAlign: 'center', textTransform: 'uppercase', letterSpacing: 2 }}>{titleText2}</span>
      </div>
    </div>
  )
}

export default AnimationComponent