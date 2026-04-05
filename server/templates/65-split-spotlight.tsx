import React from 'react'
import { useCurrentFrame, interpolate } from 'remotion'

export const AnimationComponent = () => {
  const frame = useCurrentFrame()

  const titleText   = 'TITLE_TEXT'
  const label1      = 'LABEL_1'
  const label2      = 'LABEL_2'
  const label3      = 'LABEL_3'
  const stat1       = 'STAT_VALUE_1'
  const stat2       = 'STAT_VALUE_2'
  const contextText = 'CONTEXT_TEXT'
  const tag1        = 'TAG_1'

  const stats = [
    { value: stat1, label: tag1,   color: 'PRIMARY_COLOR' },
    { value: stat2, label: label2, color: 'SECONDARY_COLOR' },
  ]

  const activeStats = stats.filter(
    item => item.value !== '' && item.value !== 'Placeholder' && item.label !== '' && item.label !== 'Placeholder'
  )

  const bgOp    = interpolate(frame, [0, 20],  [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const spotScale = interpolate(frame, [10, 40], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const spotOp  = interpolate(frame, [10, 30],  [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const titleOp = interpolate(frame, [25, 42],  [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const titleTy = interpolate(frame, [25, 42],  [30, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const subOp   = interpolate(frame, [38, 55],  [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const subTy   = interpolate(frame, [38, 55],  [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const statOp  = interpolate(frame, [50, 66],  [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const barW    = interpolate(frame, [10, 40],  [0, 1920], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const divW    = interpolate(frame, [30, 55],  [0, 500], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  const sx = 680
  const sy = 520

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden', backgroundColor: 'PRIMARY_COLOR' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, backgroundColor: 'BACKGROUND_COLOR', opacity: bgOp * 0.92 }} />

      {/* Bottom accent bar */}
      <div style={{ position: 'absolute', top: 1074, left: 0, width: barW, height: 6, backgroundColor: 'ACCENT_COLOR' }} />

      <svg width={1920} height={1080} style={{ position: 'absolute', top: 0, left: 0 }}>
        <defs>
          <radialGradient id="spot" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="PRIMARY_COLOR" stopOpacity="0.22" />
            <stop offset="60%"  stopColor="PRIMARY_COLOR" stopOpacity="0.08" />
            <stop offset="100%" stopColor="PRIMARY_COLOR" stopOpacity="0" />
          </radialGradient>
        </defs>
        <ellipse cx={sx} cy={sy} rx={380 * spotScale} ry={340 * spotScale} fill="url(#spot)" opacity={spotOp} />
        <circle  cx={sx} cy={sy} r={180 * spotScale}  fill="none" stroke="PRIMARY_COLOR" strokeWidth={1} opacity={spotOp * 0.2} />
        <circle  cx={sx} cy={sy} r={280 * spotScale}  fill="none" stroke="PRIMARY_COLOR" strokeWidth={1} opacity={spotOp * 0.1} />
      </svg>

      {/* Spotlight center — main label */}
      <div style={{ position: 'absolute', top: sy - 160, left: sx - 320, width: 640, textAlign: 'center', opacity: titleOp, transform: `translateY(${titleTy}px)` }}>
        <span style={{ fontSize: 72, fontWeight: 900, color: '#fff', fontFamily: 'sans-serif', lineHeight: 1 }}>{label1}</span>
      </div>

      {/* Tag / category — bright ACCENT_COLOR */}
      <div style={{ position: 'absolute', top: sy - 52, left: sx - 320, width: 640, textAlign: 'center', opacity: subOp }}>
        <span style={{ fontSize: 32, fontWeight: 800, color: 'ACCENT_COLOR', fontFamily: 'sans-serif', letterSpacing: 4, textTransform: 'uppercase' }}>{tag1}</span>
      </div>

      {/* Sub-labels */}
      <div style={{ position: 'absolute', top: sy + 16, left: sx - 320, width: 640, textAlign: 'center', opacity: subOp, transform: `translateY(${subTy}px)` }}>
        <span style={{ fontSize: 26, fontWeight: 600, color: '#fff', fontFamily: 'sans-serif', opacity: 0.9 }}>{label2}</span>
      </div>
      <div style={{ position: 'absolute', top: sy + 66, left: sx - 320, width: 640, textAlign: 'center', opacity: subOp }}>
        <span style={{ fontSize: 24, fontWeight: 400, color: '#fff', fontFamily: 'sans-serif', opacity: 0.8 }}>{label3}</span>
      </div>

      {/* Right panel */}
      <div style={{ position: 'absolute', top: 200, left: 1100, width: 680, height: 620 }}>
        {/* Title */}
        <div style={{ width: 680, opacity: titleOp, transform: `translateY(${titleTy}px)`, marginBottom: 12 }}>
          <span style={{ fontSize: 32, fontWeight: 800, color: '#fff', fontFamily: 'sans-serif', letterSpacing: 3, textTransform: 'uppercase' }}>{titleText}</span>
        </div>

        {/* Divider line */}
        <div style={{ width: divW, height: 3, backgroundColor: 'ACCENT_COLOR', marginBottom: 24 }} />

        {/* Stat cards */}
        <div style={{ display: 'flex', gap: 20, marginBottom: 32 }}>
          {activeStats.map((item, i) => (
            <div key={i} style={{
              flex: 1, opacity: statOp,
              backgroundColor: 'CHART_BG', borderRadius: 10, padding: '20px 24px',
              border: '1px solid', borderColor: 'CHART_BORDER', boxSizing: 'border-box'
            }}>
              <div style={{ fontSize: 60, fontWeight: 900, color: item.color, fontFamily: 'sans-serif', lineHeight: 1, marginBottom: 10 }}>
                {item.value}
              </div>
              <div style={{ fontSize: 18, fontWeight: 600, color: '#fff', fontFamily: 'sans-serif', textTransform: 'uppercase', letterSpacing: 2, opacity: 0.9 }}>
                {item.label}
              </div>
            </div>
          ))}
        </div>

        {/* Context text */}
        <div style={{ opacity: statOp }}>
          <span style={{ fontSize: 26, fontWeight: 400, color: '#fff', fontFamily: 'sans-serif', lineHeight: 1.6, opacity: 0.9 }}>{contextText}</span>
        </div>
      </div>
    </div>
  )
}

export default AnimationComponent
