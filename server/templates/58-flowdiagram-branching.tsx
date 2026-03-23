import React, { useMemo } from 'react'
import { useCurrentFrame, interpolate } from 'remotion'

export const AnimationComponent = () => {
  const frame = useCurrentFrame()

  const title = "TITLE_TEXT"
  const originLabel = "ORIGIN_LABEL"
  const rawPhases = ["PHASE_1", "PHASE_2", "PHASE_3"]
  const rawSteps = ["STEP_1", "STEP_2", "STEP_3"]
  const rawTags = ["TAG_1", "TAG_2", "TAG_3"]

  const activeItems = useMemo(() => {
    return rawPhases
      .map((phase, i) => ({
        phase,
        step: rawSteps[i],
        tag: rawTags[i]
      }))
      .filter(item => item.phase !== '' && item.phase !== 'Placeholder')
  }, [rawPhases, rawSteps, rawTags])

  const count = activeItems.length
  const rootY = 540
  const branchX = 900
  const leafX = 1480
  
  // Dynamic spacing based on count
  const spacing = count > 1 ? Math.min(280, 800 / count) : 0
  const startY = rootY - ((count - 1) * spacing) / 2
  const branchYPositions = Array.from({ length: count }, (_, i) => startY + i * spacing)

  const titleOp = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const titleTy = interpolate(frame, [0, 20], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const barW = interpolate(frame, [10, 40], [0, 1920], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const rootOp = interpolate(frame, [12, 26], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const rootScale = interpolate(frame, [12, 26], [0.6, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const lineOp = interpolate(frame, [24, 38], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const labelOp = interpolate(frame, [55, 70], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  const branchOpacities = activeItems.map((_, i) => interpolate(frame, [32 + i * 6, 46 + i * 6], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }))
  const branchScales = activeItems.map((_, i) => interpolate(frame, [32 + i * 6, 46 + i * 6], [0.6, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }))

  const rootX = 320
  const branchColors = ['PRIMARY_COLOR', 'SECONDARY_COLOR', 'ACCENT_COLOR']
  const branchTextColors = ['TEXT_ON_PRIMARY', 'TEXT_ON_SECONDARY', 'TEXT_ON_ACCENT']

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden', backgroundColor: 'BACKGROUND_COLOR' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 5, overflow: 'hidden', backgroundColor: 'PRIMARY_COLOR', opacity: titleOp }} />
      <div style={{ position: 'absolute', top: 1074, left: 0, width: barW, height: 6, overflow: 'hidden', backgroundColor: 'PRIMARY_COLOR' }} />
      <div style={{ position: 'absolute', top: 60, left: 0, width: 1920, height: 60, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: titleOp, transform: `translateY(${titleTy}px)` }}>
        <span style={{ fontSize: 28, fontWeight: 700, color: 'PRIMARY_COLOR', letterSpacing: 5, textTransform: 'uppercase', fontFamily: 'sans-serif' }}>{title}</span>
      </div>
      <svg width={1920} height={1080} style={{ position: 'absolute', top: 0, left: 0 }}>
        {branchYPositions.map((by, i) => (
          <line key={i} x1={rootX + 60} y1={rootY} x2={branchX - 100} y2={by} stroke="LINE_STROKE" strokeWidth={2} strokeDasharray="8 5" opacity={lineOp} />
        ))}
        {branchYPositions.map((by, i) => (
          <line key={i} x1={branchX + 100} y1={by} x2={leafX - 80} y2={by} stroke="LINE_STROKE" strokeWidth={1.5} strokeDasharray="6 4" opacity={branchOpacities[i]} />
        ))}
      </svg>
      <div style={{ position: 'absolute', top: rootY - 60, left: rootX - 60, width: 120, height: 120, overflow: 'hidden', borderRadius: 60, backgroundColor: 'PRIMARY_COLOR', opacity: rootOp, transform: `scale(${rootScale})`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box' }}>
        <span style={{ fontSize: 13, fontWeight: 800, color: 'TEXT_ON_PRIMARY', fontFamily: 'sans-serif', textAlign: 'center', textTransform: 'uppercase', letterSpacing: 1 }}>{originLabel}</span>
      </div>
      {activeItems.map((item, i) => (
        <div key={i} style={{ position: 'absolute', top: branchYPositions[i] - 50, left: branchX - 100, width: 200, height: 100, overflow: 'hidden', backgroundColor: branchColors[i % 3], borderRadius: 6, opacity: branchOpacities[i], transform: `scale(${branchScales[i]})`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box', padding: '0 16px' }}>
          <span style={{ fontSize: 22, fontWeight: 700, color: branchTextColors[i % 3], fontFamily: 'sans-serif', textAlign: 'center', lineHeight: 1.2 }}>{item.phase}</span>
        </div>
      ))}
      {activeItems.map((item, i) => (
        <div key={i} style={{ position: 'absolute', top: branchYPositions[i] - 70, left: leafX - 80, width: 420, height: 140, overflow: 'hidden', backgroundColor: 'CHART_BG', borderRadius: 6, border: '1px solid', borderColor: 'CHART_BORDER', opacity: branchOpacities[i], boxSizing: 'border-box' }}>
          <div style={{ position: 'absolute', top: 20, left: 24, width: 372, height: 36, overflow: 'hidden' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: branchColors[i % 3], fontFamily: 'sans-serif', letterSpacing: 2, textTransform: 'uppercase' }}>{item.tag}</span>
          </div>
          <div style={{ position: 'absolute', top: 60, left: 24, width: 372, height: 60, overflow: 'hidden', opacity: labelOp }}>
            <span style={{ fontSize: 24, fontWeight: 600, color: 'TEXT_ON_SECONDARY', fontFamily: 'sans-serif', lineHeight: 1.3 }}>{item.step}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

export default AnimationComponent