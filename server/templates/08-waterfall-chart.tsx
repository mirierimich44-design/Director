import React from 'react'
import { useCurrentFrame, interpolate } from 'remotion'

export const AnimationComponent = () => {
  const frame = useCurrentFrame()

  const titleOp = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const titleTy = interpolate(frame, [0, 20], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const barW = interpolate(frame, [10, 40], [0, 1920], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const axisOp = interpolate(frame, [15, 30], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  const b1H = interpolate(frame, [25, 50], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const b2H = interpolate(frame, [32, 57], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const b3H = interpolate(frame, [39, 64], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const b4H = interpolate(frame, [46, 71], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const b5H = interpolate(frame, [53, 78], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const labelOp = interpolate(frame, [70, 84], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  const title = "TITLE_TEXT"
  
  // Filter out any inputs that are completely empty strings or placeholders
  const rawWaterfalls = ["WATERFALL_1", "WATERFALL_2", "WATERFALL_3", "WATERFALL_4", "WATERFALL_5"]
  const rawBarValues = ["BAR_VALUE_1", "BAR_VALUE_2", "BAR_VALUE_3", "BAR_VALUE_4", "BAR_VALUE_5"]
  const rawHeights = [280, -120, 180, -80, 300]
  
  // Combine into data objects and filter out missing ones
  const activeData = rawWaterfalls.map((label, i) => ({
    label: label,
    val: rawBarValues[i],
    h: rawHeights[i]
  })).filter(d => 
    d.label && d.label !== '' && d.label !== 'Placeholder' &&
    d.val && d.val !== '' && d.val !== 'Placeholder'
  )
  
  const waterfalls = activeData.map(d => d.label)
  const barValues = activeData.map(d => d.val)
  const barHeights = activeData.map(d => d.h)
  const isPositive = barHeights.map(h => h > 0)
  
  // Dynamic widths based on how many bars actually exist
  const barCount = barHeights.length
  
  // If no bars exist, prevent math errors
  if (barCount === 0) {
    return <div style={{ backgroundColor: 'BACKGROUND_COLOR', width: 1920, height: 1080 }} />
  }

  const grows = [b1H, b2H, b3H, b4H, b5H].slice(0, barCount)

  const chartH = 500
  const chartBottom = 780
  
  // Calculate dynamic spacing
  const totalW = 1200 // Fixed chart width
  const barGap = barCount > 1 ? 80 : 0
  const barWidth = (totalW - (barGap * (barCount - 1))) / barCount
  const startX = (1920 - totalW) / 2

  // Waterfall offsets — each bar starts where last left off
  let runningY = chartBottom
  const barTops: number[] = []
  barHeights.forEach((h, i) => {
    if (h > 0) {
      barTops.push(runningY - Math.abs(h))
      runningY -= Math.abs(h)
    } else {
      barTops.push(runningY)
      runningY += Math.abs(h)
    }
  })

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden', backgroundColor: 'BACKGROUND_COLOR' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 5, overflow: 'hidden', backgroundColor: 'PRIMARY_COLOR', opacity: titleOp }} />
      <div style={{ position: 'absolute', top: 1074, left: 0, width: barW, height: 6, overflow: 'hidden', backgroundColor: 'PRIMARY_COLOR' }} />
      <div style={{ position: 'absolute', top: 60, left: 0, width: 1920, height: 60, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: titleOp, transform: `translateY(${titleTy}px)` }}>
        <span style={{ fontSize: 28, fontWeight: 700, color: 'PRIMARY_COLOR', letterSpacing: 5, textTransform: 'uppercase', fontFamily: 'sans-serif' }}>{title}</span>
      </div>
      <svg width={1920} height={1080} style={{ position: 'absolute', top: 0, left: 0 }}>
        <line x1={startX - 20} y1={chartBottom} x2={startX + totalW + 20} y2={chartBottom} stroke="LINE_STROKE" strokeWidth={2} opacity={axisOp} />
        {[0.25, 0.5, 0.75].map((r, i) => (
          <line key={i} x1={startX - 20} y1={chartBottom - r * chartH} x2={startX + totalW + 20} y2={chartBottom - r * chartH} stroke="GRID_LINE" strokeWidth={1} strokeDasharray="6 4" opacity={axisOp} />
        ))}
        {/* Connector lines between bars */}
        {barTops.map((top, i) => {
          if (i === barTops.length - 1) return null
          const x1 = startX + i * (barWidth + barGap) + barWidth
          const x2 = startX + (i + 1) * (barWidth + barGap)
          const nextTop = barTops[i + 1]
          const connY = isPositive[i] ? top : top + Math.abs(barHeights[i])
          return <line key={i} x1={x1} y1={connY} x2={x2} y2={connY} stroke="GRID_LINE" strokeWidth={1} strokeDasharray="4 3" opacity={axisOp} />
        })}
      </svg>
      {barHeights.map((h, i) => {
        const x = startX + i * (barWidth + barGap)
        const absH = Math.abs(h) * grows[i]
        const top = isPositive[i] ? barTops[i] + Math.abs(h) * (1 - grows[i]) : barTops[i]
        return (
          <div key={i}>
            <div style={{ position: 'absolute', top, left: x, width: barWidth, height: absH, overflow: 'hidden', backgroundColor: isPositive[i] ? 'PRIMARY_COLOR' : 'SECONDARY_COLOR', borderRadius: isPositive[i] ? '4px 4px 0 0' : '0 0 4px 4px' }} />
            <div style={{ position: 'absolute', top: isPositive[i] ? barTops[i] - 48 : barTops[i] + Math.abs(h) + 8, left: x, width: barWidth, height: 40, overflow: 'hidden', opacity: labelOp, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 24, fontWeight: 800, color: isPositive[i] ? 'PRIMARY_COLOR' : 'SECONDARY_COLOR', fontFamily: 'sans-serif' }}>{barValues[i]}</span>
            </div>
            <div style={{ position: 'absolute', top: chartBottom + 16, left: x, width: barWidth, height: 40, overflow: 'hidden', opacity: labelOp, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 20, fontWeight: 500, color: 'SUPPORT_COLOR', fontFamily: 'sans-serif', textAlign: 'center' }}>{waterfalls[i]}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default AnimationComponent