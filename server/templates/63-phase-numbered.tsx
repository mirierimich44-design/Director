import React, { useMemo } from 'react'
import { useCurrentFrame, interpolate } from 'remotion'

export const AnimationComponent = () => {
  const frame = useCurrentFrame()

  const rawPhases = ["PHASE_1", "PHASE_2", "PHASE_3", "PHASE_4"]
  const rawSteps = ["STEP_1", "STEP_2", "STEP_3", "STEP_4"]

  const items = useMemo(() => {
    return rawPhases
      .map((phase, i) => ({ phase, step: rawSteps[i] }))
      .filter(item => item.phase !== '' && item.phase !== 'Placeholder' && item.step !== '' && item.step !== 'Placeholder')
  }, [])

  const numItems = items.length

  const titleOp = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const titleTy = interpolate(frame, [0, 20], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const barW = interpolate(frame, [10, 40], [0, 1920], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  const phaseOpacities = items.map((_, i) => interpolate(frame, [15 + i * 11, 30 + i * 11], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }))
  const phaseTx = items.map((_, i) => interpolate(frame, [15 + i * 11, 30 + i * 11], [-30, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }))
  
  const labelOp = interpolate(frame, [15 + (numItems - 1) * 11 + 12, 15 + (numItems - 1) * 11 + 27], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  const title = "TITLE_TEXT"
  const rowH = 160
  const rowGap = 30
  const startY = 180
  const numW = 100
  const numX = 200
  const contentX = numX + numW + 30
  const contentW = 1300

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden', backgroundColor: 'BACKGROUND_COLOR' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 5, overflow: 'hidden', backgroundColor: 'PRIMARY_COLOR', opacity: titleOp }} />
      <div style={{ position: 'absolute', top: 1074, left: 0, width: barW, height: 6, overflow: 'hidden', backgroundColor: 'PRIMARY_COLOR' }} />
      <div style={{ position: 'absolute', top: 60, left: 0, width: 1920, height: 60, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: titleOp, transform: `translateY(${titleTy}px)` }}>
        <span style={{ fontSize: 26, fontWeight: 700, color: 'PRIMARY_COLOR', letterSpacing: 5, textTransform: 'uppercase', fontFamily: 'sans-serif' }}>{title}</span>
      </div>
      {numItems > 1 && (
        <div style={{ position: 'absolute', top: startY + rowH / 2, left: numX + numW / 2 - 2, width: 4, height: (numItems - 1) * (rowH + rowGap), overflow: 'hidden', backgroundColor: 'GRID_LINE', opacity: titleOp }} />
      )}
      {items.map((item, i) => {
        const y = startY + i * (rowH + rowGap)
        const isLast = i === numItems - 1
        return (
          <div key={i} style={{ position: 'absolute', top: y, left: numX, width: contentX + contentW - numX, height: rowH, overflow: 'hidden', opacity: phaseOpacities[i], transform: `translateX(${phaseTx[i]}px)` }}>
            <div style={{ position: 'absolute', top: rowH / 2 - 40, left: 0, width: 80, height: 80, overflow: 'hidden', borderRadius: 40, backgroundColor: isLast ? 'SECONDARY_COLOR' : 'PRIMARY_COLOR', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 36, fontWeight: 900, color: isLast ? 'TEXT_ON_SECONDARY' : 'TEXT_ON_PRIMARY', fontFamily: 'sans-serif' }}>{i + 1}</span>
            </div>
            <div style={{ position: 'absolute', top: 20, left: 110, width: contentW, height: 60, overflow: 'hidden' }}>
              <span style={{ fontSize: 36, fontWeight: 700, color: 'PRIMARY_COLOR', fontFamily: 'sans-serif', lineHeight: 1 }}>{item.phase}</span>
            </div>
            <div style={{ position: 'absolute', top: 80, left: 110, width: contentW, height: 60, overflow: 'hidden', opacity: labelOp }}>
              <span style={{ fontSize: 24, fontWeight: 400, color: 'SUPPORT_COLOR', fontFamily: 'sans-serif', lineHeight: 1.4 }}>{item.step}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default AnimationComponent