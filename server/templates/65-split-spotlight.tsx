import React from 'react'
import { useCurrentFrame, interpolate } from 'remotion'

export const AnimationComponent = () => {
  const frame = useCurrentFrame()

  const titleText = "TITLE_TEXT"
  const label1 = "LABEL_1"
  const label2 = "LABEL_2"
  const label3 = "LABEL_3"
  const stat1 = "STAT_VALUE_1"
  const stat2 = "STAT_VALUE_2"
  const contextText = "CONTEXT_TEXT"
  const tag1 = "TAG_1"

  // Define data items for filtering
  const stats = [
    { value: stat1, label: tag1, color: 'PRIMARY_COLOR' },
    { value: stat2, label: label2, color: 'SECONDARY_COLOR' }
  ]

  // Filter out empty or placeholder items
  const activeStats = stats.filter(
    (item) => item.value !== '' && item.value !== 'Placeholder' && item.label !== '' && item.label !== 'Placeholder'
  )

  const bgOp = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const spotScale = interpolate(frame, [10, 40], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const spotOp = interpolate(frame, [10, 30], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const titleOp = interpolate(frame, [25, 42], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const titleTy = interpolate(frame, [25, 42], [30, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const subOp = interpolate(frame, [38, 55], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const subTy = interpolate(frame, [38, 55], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const statOp = interpolate(frame, [50, 66], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const barW = interpolate(frame, [10, 40], [0, 1920], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const divW = interpolate(frame, [30, 55], [0, 500], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  // Spotlight center
  const sx = 680
  const sy = 520

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden', backgroundColor: 'PRIMARY_COLOR' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden', backgroundColor: 'BACKGROUND_COLOR', opacity: bgOp * 0.92 }} />

      <div style={{ position: 'absolute', top: 1074, left: 0, width: barW, height: 6, overflow: 'hidden', backgroundColor: 'ACCENT_COLOR' }} />

      <svg width={1920} height={1080} style={{ position: 'absolute', top: 0, left: 0 }}>
        <defs>
          <radialGradient id="spot" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="PRIMARY_COLOR" stopOpacity="0.18" />
            <stop offset="60%" stopColor="PRIMARY_COLOR" stopOpacity="0.06" />
            <stop offset="100%" stopColor="PRIMARY_COLOR" stopOpacity="0" />
          </radialGradient>
        </defs>
        <ellipse cx={sx} cy={sy} rx={380 * spotScale} ry={340 * spotScale} fill="url(#spot)" opacity={spotOp} />
        <circle cx={sx} cy={sy} r={180 * spotScale} fill="none" stroke="PRIMARY_COLOR" strokeWidth={1} opacity={spotOp * 0.15} />
        <circle cx={sx} cy={sy} r={280 * spotScale} fill="none" stroke="PRIMARY_COLOR" strokeWidth={1} opacity={spotOp * 0.08} />
      </svg>

      <div style={{ position: 'absolute', top: sy - 160, left: sx - 300, width: 600, height: 80, overflow: 'hidden', opacity: titleOp, transform: `translateY(${titleTy}px)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 64, fontWeight: 900, color: 'TEXT_ON_PRIMARY', fontFamily: 'sans-serif', lineHeight: 1, textAlign: 'center' }}>{label1}</span>
      </div>
      <div style={{ position: 'absolute', top: sy - 60, left: sx - 300, width: 600, height: 36, overflow: 'hidden', opacity: subOp, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 22, fontWeight: 600, color: 'ACCENT_COLOR', fontFamily: 'sans-serif', letterSpacing: 3, textTransform: 'uppercase' }}>{tag1}</span>
      </div>
      <div style={{ position: 'absolute', top: sy, left: sx - 300, width: 600, height: 40, overflow: 'hidden', opacity: subOp, transform: `translateY(${subTy}px)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 22, fontWeight: 400, color: 'TEXT_ON_PRIMARY', fontFamily: 'sans-serif', opacity: 0.75, textAlign: 'center' }}>{label2}</span>
      </div>
      <div style={{ position: 'absolute', top: sy + 50, left: sx - 300, width: 600, height: 40, overflow: 'hidden', opacity: subOp, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 20, fontWeight: 400, color: 'TEXT_ON_PRIMARY', fontFamily: 'sans-serif', opacity: 0.6, textAlign: 'center' }}>{label3}</span>
      </div>

      <div style={{ position: 'absolute', top: 200, left: 1100, width: 680, height: 620, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: 680, height: 60, overflow: 'hidden', opacity: titleOp, transform: `translateY(${titleTy}px)` }}>
          <span style={{ fontSize: 26, fontWeight: 700, color: 'SUPPORT_COLOR', fontFamily: 'sans-serif', letterSpacing: 4, textTransform: 'uppercase' }}>{titleText}</span>
        </div>
        <div style={{ position: 'absolute', top: 72, left: 0, width: divW, height: 2, overflow: 'hidden', backgroundColor: 'ACCENT_COLOR' }} />
        
        {activeStats.map((item, i) => (
          <div key={i} style={{ position: 'absolute', top: 94, left: i * 340, width: 300, height: 140, overflow: 'hidden', opacity: statOp, backgroundColor: 'CHART_BG', borderRadius: 6, boxSizing: 'border-box', border: '1px solid', borderColor: 'CHART_BORDER' }}>
            <div style={{ position: 'absolute', top: 18, left: 20, width: 260, height: 70, overflow: 'hidden' }}>
              <span style={{ fontSize: 60, fontWeight: 900, color: item.color, fontFamily: 'sans-serif', lineHeight: 1 }}>{item.value}</span>
            </div>
            <div style={{ position: 'absolute', top: 96, left: 20, width: 260, height: 30, overflow: 'hidden' }}>
              <span style={{ fontSize: 16, fontWeight: 500, color: 'SUPPORT_COLOR', fontFamily: 'sans-serif', textTransform: 'uppercase', letterSpacing: 1 }}>{item.label}</span>
            </div>
          </div>
        ))}

        <div style={{ position: 'absolute', top: 268, left: 0, width: 680, height: 140, overflow: 'hidden', opacity: statOp }}>
          <span style={{ fontSize: 26, fontWeight: 400, color: 'TEXT_ON_SECONDARY', fontFamily: 'sans-serif', lineHeight: 1.6 }}>{contextText}</span>
        </div>
      </div>
    </div>
  )
}

export default AnimationComponent