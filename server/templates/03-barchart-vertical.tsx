import React, { useMemo } from 'react'
import { useCurrentFrame, interpolate, Easing } from 'remotion'

export const AnimationComponent = () => {
  const frame = useCurrentFrame()

  const title = "TITLE_TEXT"
  const rawBarLabels = ["BAR_LABEL_1", "BAR_LABEL_2", "BAR_LABEL_3", "BAR_LABEL_4"]
  const rawBarValues = ["BAR_VALUE_1", "BAR_VALUE_2", "BAR_VALUE_3", "BAR_VALUE_4"]
  const rawBarHeightRatios = [0.55, 0.70, 0.82, 1.0]

  // Filter items early
  const items = useMemo(() => {
    return rawBarLabels
      .map((label, i) => ({
        label,
        value: rawBarValues[i],
        ratio: rawBarHeightRatios[i]
      }))
      .filter(item => item.label !== '' && item.label !== 'Placeholder' && item.value !== '' && item.value !== 'Placeholder')
  }, [])

  const itemCount = items.length

  const titleOp = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const gridOp = interpolate(frame, [10, 30], [0, 1], { extrapolateLeft: 'clamp' })

  // Dynamic staggered animations
  const barGrowProgress = items.map((_, i) => 
    interpolate(frame, [20 + (i * 10), 50 + (i * 10)], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) })
  )
  const valueOpacities = items.map((_, i) => 
    interpolate(frame, [45 + (i * 10), 60 + (i * 10)], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  )
  const labelOp = interpolate(frame, [50, 70], [0, 1], { extrapolateLeft: 'clamp' })

  const chartH = 500
  const chartBottom = 750
  const barWidth = 160
  const barGap = 80
  const totalBarsW = itemCount * barWidth + (itemCount - 1) * barGap
  const startX = (1600 - totalBarsW) / 2

  return (
    <div style={{
      position: 'absolute', inset: 0, overflow: 'hidden',
      backgroundColor: 'BACKGROUND_COLOR', fontFamily: 'Inter, system-ui, sans-serif',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      
      {/* 16:9 Safe Container */}
      <div style={{ width: 1600, height: 900, position: 'relative' }}>

        {/* Background Grid */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '100px 100px',
          opacity: 0.5, borderRadius: 24, border: '1px solid rgba(255,255,255,0.05)'
        }} />

        {/* Header */}
        <div style={{ position: 'absolute', top: 40, left: 40, opacity: titleOp }}>
          <div style={{ color: 'PRIMARY_COLOR', fontSize: 14, fontWeight: 900, letterSpacing: 6, marginBottom: 8, textTransform: 'uppercase' }}>METRIC_DISTRIBUTION</div>
          <div style={{ color: 'PRIMARY_COLOR', fontSize: 32, fontWeight: 900, textTransform: 'uppercase' }}>{title}</div>
        </div>

        <svg width={1600} height={900} style={{ position: 'absolute', top: 0, left: 0 }}>
          {/* Horizontal Grid Lines */}
          {[0.25, 0.5, 0.75, 1.0].map((ratio, i) => {
            const y = chartBottom - ratio * chartH
            return (
              <line
                key={i}
                x1={startX - 40} y1={y}
                x2={startX + totalBarsW + 40} y2={y}
                stroke="GRID_LINE" strokeWidth={1}
                strokeDasharray="4 4"
                opacity={gridOp}
              />
            )
          })}
          {/* Baseline */}
          <line
            x1={startX - 40} y1={chartBottom}
            x2={startX + totalBarsW + 40} y2={chartBottom}
            stroke="PRIMARY_COLOR" strokeWidth={2}
            opacity={gridOp}
          />
        </svg>

        {items.map((item, i) => {
          const x = startX + i * (barWidth + barGap)
          const maxH = item.ratio * chartH
          const currentH = maxH * barGrowProgress[i]
          const barTop = chartBottom - currentH

          return (
            <React.Fragment key={i}>
              {/* Glowing Bar */}
              <div style={{
                position: 'absolute',
                top: barTop,
                left: x,
                width: barWidth,
                height: currentH,
                backgroundColor: i === itemCount - 1 ? 'ACCENT_COLOR' : 'PRIMARY_COLOR',
                borderRadius: '8px 8px 0 0',
                boxShadow: `0 0 20px ${i === itemCount - 1 ? 'ACCENT_COLOR' : 'PRIMARY_COLOR'}44`,
                opacity: 0.9
              }} />

              {/* Top Value Label */}
              <div style={{
                position: 'absolute',
                top: barTop - 50,
                left: x,
                width: barWidth,
                height: 40,
                opacity: valueOpacities[i],
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <span style={{
                  fontSize: 24,
                  fontWeight: 900,
                  color: i === itemCount - 1 ? 'ACCENT_COLOR' : 'PRIMARY_COLOR',
                  fontFamily: 'JetBrains Mono, monospace',
                  letterSpacing: -1
                }}>
                  {item.value}
                </span>
              </div>

              {/* Bottom Category Label */}
              <div style={{
                position: 'absolute',
                top: chartBottom + 20,
                left: x,
                width: barWidth,
                opacity: labelOp,
                textAlign: 'center'
              }}>
                <span style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: 'SUPPORT_COLOR',
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                  opacity: 0.6
                }}>
                  {item.label}
                </span>
              </div>
            </React.Fragment>
          )
        })}

        {/* Footer Technical Detail */}
        <div style={{ position: 'absolute', bottom: 40, right: 40, opacity: titleOp * 0.4 }}>
          <div style={{ color: 'SUPPORT_COLOR', fontSize: 10, fontFamily: 'monospace', textAlign: 'right' }}>
            REF_ID: STACK_DIST_v2<br />
            STATUS: REALTIME_COMPUTE
          </div>
        </div>

      </div>
    </div>
  )
}

export default AnimationComponent