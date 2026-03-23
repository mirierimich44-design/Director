import React, { useMemo } from 'react'
import { useCurrentFrame, interpolate } from 'remotion'

export const AnimationComponent = () => {
  const frame = useCurrentFrame()

  const title = "TITLE_TEXT"
  const rawPhases = ["PHASE_1", "PHASE_2", "PHASE_3", "PHASE_4"]
  const rawSteps = ["STEP_1", "STEP_2", "STEP_3", "STEP_4"]
  const rawBoxColors = ['PRIMARY_COLOR', 'PANEL_LEFT_BG', 'PANEL_LEFT_BG', 'SECONDARY_COLOR']
  const rawTextColors = ['TEXT_ON_PRIMARY', 'TEXT_ON_SECONDARY', 'TEXT_ON_SECONDARY', 'TEXT_ON_SECONDARY']

  const items = useMemo(() => {
    return rawPhases
      .map((phase, i) => ({
        phase,
        step: rawSteps[i],
        boxColor: rawBoxColors[i],
        textColor: rawTextColors[i]
      }))
      .filter(item => item.phase !== '' && item.phase !== 'Placeholder')
  }, [])

  const count = items.length

  const titleOp = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const titleTy = interpolate(frame, [0, 20], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const barW = interpolate(frame, [10, 40], [0, 1920], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  const boxW = 400
  const boxH = 140
  const arrowH = 50
  const totalH = count * boxH + (count > 0 ? count - 1 : 0) * arrowH
  const startY = (1080 - totalH) / 2
  const cx = 960

  const labelOp = interpolate(frame, [65, 80], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden', backgroundColor: 'BACKGROUND_COLOR' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 5, overflow: 'hidden', backgroundColor: 'PRIMARY_COLOR', opacity: titleOp }} />
      <div style={{ position: 'absolute', top: 1074, left: 0, width: barW, height: 6, overflow: 'hidden', backgroundColor: 'PRIMARY_COLOR' }} />
      <div style={{ position: 'absolute', top: 40, left: 0, width: 1920, height: 60, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: titleOp, transform: `translateY(${titleTy}px)` }}>
        <span style={{ fontSize: 26, fontWeight: 700, color: 'PRIMARY_COLOR', letterSpacing: 5, textTransform: 'uppercase', fontFamily: 'sans-serif' }}>{title}</span>
      </div>
      {items.map((item, i) => {
        const y = startY + i * (boxH + arrowH)
        const pOp = interpolate(frame, [15 + i * 13, 30 + i * 13], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
        const pTy = interpolate(frame, [15 + i * 13, 30 + i * 13], [-30, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
        
        return (
          <div key={i}>
            <div style={{ position: 'absolute', top: y, left: cx - boxW / 2, width: boxW, height: boxH, overflow: 'hidden', backgroundColor: item.boxColor, borderRadius: 6, opacity: pOp, transform: `translateY(${pTy}px)`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box', border: i === 0 || i === count - 1 ? 'none' : '2px solid', borderColor: 'CHART_BORDER' }}>
              <span style={{ fontSize: 28, fontWeight: 700, color: item.textColor, fontFamily: 'sans-serif', textAlign: 'center', lineHeight: 1.2 }}>{item.phase}</span>
            </div>
            <div style={{ position: 'absolute', top: y + boxH / 2 - 20, left: cx + boxW / 2 + 24, width: 500, height: 40, overflow: 'hidden', opacity: labelOp }}>
              <span style={{ fontSize: 22, fontWeight: 400, color: 'SUPPORT_COLOR', fontFamily: 'sans-serif' }}>{item.step}</span>
            </div>
          </div>
        )
      })}
      <svg width={1920} height={1080} style={{ position: 'absolute', top: 0, left: 0 }}>
        {items.slice(0, -1).map((_, i) => {
          const aOp = interpolate(frame, [32 + i * 13, 42 + i * 13], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
          const y1 = startY + (i + 1) * boxH + i * arrowH
          const y2 = y1 + arrowH - 10
          return (
            <g key={i} opacity={aOp}>
              <line x1={cx} y1={y1} x2={cx} y2={y2 - 2} stroke="LINE_STROKE" strokeWidth={2} />
              <polygon points={`${cx - 8},${y2 - 10} ${cx},${y2} ${cx + 8},${y2 - 10}`} fill="LINE_STROKE" />
            </g>
          )
        })}
      </svg>
    </div>
  )
}

export default AnimationComponent