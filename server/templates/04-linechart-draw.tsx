import React, { useMemo } from 'react'
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion'

export const AnimationComponent = () => {
  const frame = useCurrentFrame()
  const { width, height, durationInFrames } = useVideoConfig()

  const title = "TITLE_TEXT"
  const rawLineValues = ["LINE_VALUE_1", "LINE_VALUE_2", "LINE_VALUE_3", "LINE_VALUE_4", "LINE_VALUE_5"]
  const rawXLabels = ["DATE_1", "DATE_2", "DATE_3", "DATE_4", "DATE_5"]

  // Filter data early
  const data = useMemo(() => {
    const filled = rawLineValues
      .map((val, i) => ({ val, label: rawXLabels[i] }))
      .filter(item => item.val !== '' && item.val !== 'Placeholder' && !item.val.startsWith('LINE_VALUE_'))
    return filled.length > 0 ? filled : [
      { val: '$2.1M', label: '2021' },
      { val: '$3.5M', label: '2022' },
      { val: '$4.2M', label: '2023' },
      { val: '$5.8M', label: '2024' },
      { val: '$7.4M', label: '2025' }
    ]
  }, [])

  const lineValues = data.map(d => d.val)
  const xLabels = data.map(d => d.label)
  const itemCount = data.length

  // Entrance
  const entryOp = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const gridOp = interpolate(frame, [15, 35], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  
  // Line Animation configuration
  const lineStart = 40
  const lineEnd = durationInFrames - 60
  const lineProgress = interpolate(frame, [lineStart, lineEnd], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  // Chart area dimensions
  const chartLeft = 300
  const chartRight = 1620
  const chartTop = 250
  const chartBottom = 800
  const chartW = chartRight - chartLeft
  const chartH = chartBottom - chartTop

  // Normalized points (relative to chart area)
  const points = useMemo(() => {
    // Default Y ratios if no numeric data is easily parseable
    const yRatios = [0.8, 0.6, 0.5, 0.3, 0.1]
    return Array.from({ length: itemCount }).map((_, i) => ({
      x: chartLeft + (itemCount > 1 ? (chartW / (itemCount - 1)) * i : 0),
      y: chartBottom - (yRatios[i % yRatios.length] * chartH)
    }))
  }, [itemCount, chartLeft, chartW, chartBottom, chartH])

  // Calculate visible polyline path based on progress
  const progressInSegments = lineProgress * (points.length - 1)
  const fullSegmentsDone = Math.floor(progressInSegments)
  const partialProgress = progressInSegments - fullSegmentsDone

  const visiblePoints: { x: number; y: number }[] = []
  for (let i = 0; i <= fullSegmentsDone && i < points.length; i++) {
    visiblePoints.push(points[i])
  }
  if (fullSegmentsDone < points.length - 1) {
    const from = points[fullSegmentsDone]
    const to = points[fullSegmentsDone + 1]
    visiblePoints.push({
      x: from.x + (to.x - from.x) * partialProgress,
      y: from.y + (to.y - from.y) * partialProgress,
    })
  }

  const polylinePath = visiblePoints.map(p => `${p.x},${p.y}`).join(' ')
  const areaPath = visiblePoints.length > 0 
    ? `${polylinePath} ${visiblePoints[visiblePoints.length - 1].x},${chartBottom} ${visiblePoints[0].x},${chartBottom}`
    : ''

  const currentX = visiblePoints.length > 0 ? visiblePoints[visiblePoints.length - 1].x : chartLeft
  const currentY = visiblePoints.length > 0 ? visiblePoints[visiblePoints.length - 1].y : chartBottom

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden',
      backgroundColor: 'BACKGROUND_COLOR', fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      {/* Background Decor */}
      <div style={{
        position: 'absolute', width: '100%', height: '100%',
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
        backgroundSize: '100px 100px',
        opacity: 0.5
      }} />

      {/* Header */}
      <div style={{ position: 'absolute', top: 80, left: 80, opacity: entryOp }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <div style={{ width: 12, height: 48, backgroundColor: 'PRIMARY_COLOR', borderRadius: 4, boxShadow: '0 0 20px PRIMARY_COLOR' }} />
          <div style={{ 
            fontSize: 48, fontWeight: 900, color: '#fff', letterSpacing: '0.1em', 
            textTransform: 'uppercase', textShadow: '0 2px 20px rgba(0,0,0,0.92)' 
          }}>
            {title}
          </div>
        </div>
        <div style={{ 
          fontSize: 24, color: 'SUPPORT_COLOR', marginLeft: 36, marginTop: 4, 
          fontWeight: 600, letterSpacing: '0.05em', textShadow: '0 1px 10px rgba(0,0,0,0.77)' 
        }}>
          ANALYTIC_STREAM_v4.0
        </div>
      </div>

      <svg width={1920} height={1080} style={{ position: 'absolute', top: 0, left: 0, zIndex: 1 }}>
        {/* Horizontal Grid Lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((r, i) => (
          <line
            key={i}
            x1={chartLeft} y1={chartBottom - r * chartH}
            x2={chartRight} y2={chartBottom - r * chartH}
            stroke="rgba(255,255,255,0.05)" strokeWidth={2}
            opacity={gridOp}
          />
        ))}

        {/* Vertical Axis */}
        <line x1={chartLeft} y1={chartTop} x2={chartLeft} y2={chartBottom} stroke="PRIMARY_COLOR" strokeWidth={4} opacity={gridOp} />
        <line x1={chartLeft} y1={chartBottom} x2={chartRight} y2={chartBottom} stroke="PRIMARY_COLOR" strokeWidth={4} opacity={gridOp} />

        {/* Gradient Area Fill */}
        <defs>
          <linearGradient id="areaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="PRIMARY_COLOR" stopOpacity="0.3" />
            <stop offset="100%" stopColor="PRIMARY_COLOR" stopOpacity="0" />
          </linearGradient>
        </defs>
        {visiblePoints.length > 1 && (
          <polygon points={areaPath} fill="url(#areaGrad)" opacity={0.6} />
        )}

        {/* The Main Line */}
        {visiblePoints.length > 1 && (
          <polyline
            points={polylinePath}
            fill="none"
            stroke="PRIMARY_COLOR"
            strokeWidth={8}
            strokeLinejoin="round"
            strokeLinecap="round"
            style={{ filter: 'drop-shadow(0 0 15px PRIMARY_COLOR)' }}
          />
        )}

        {/* Leading Edge Comet */}
        {lineProgress > 0 && lineProgress < 1 && (
          <circle cx={currentX} cy={currentY} r={12} fill="#fff" style={{ filter: 'drop-shadow(0 0 20px #fff)' }} />
        )}

        {/* Data Points */}
        {points.map((p, i) => {
          const reachFrame = lineStart + (i * (lineEnd - lineStart) / (itemCount - 1))
          const pop = interpolate(frame, [reachFrame, reachFrame + 10], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
          return (
            <g key={`dot-${i}`} opacity={pop}>
              <circle cx={p.x} cy={p.y} r={14} fill="BACKGROUND_COLOR" stroke="PRIMARY_COLOR" strokeWidth={4} />
              <circle cx={p.x} cy={p.y} r={6} fill="ACCENT_COLOR" />
            </g>
          )
        })}
      </svg>

      {/* Axis Labels */}
      {points.map((p, i) => {
        const reachFrame = lineStart + (i * (lineEnd - lineStart) / (itemCount - 1))
        const op = interpolate(frame, [reachFrame + 5, reachFrame + 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
        return (
          <div key={`label-${i}`} style={{
            position: 'absolute', top: chartBottom + 24, left: p.x, transform: 'translateX(-50%)',
            opacity: op, color: 'rgba(255,255,255,0.4)', fontSize: 20, fontWeight: 700, fontFamily: 'monospace'
          }}>
            {xLabels[i]}
          </div>
        )
      })}

      {/* Data Callouts (Modern UI Style) */}
      {points.map((p, i) => {
        const reachFrame = lineStart + (i * (lineEnd - lineStart) / (itemCount - 1))
        const op = interpolate(frame, [reachFrame + 10, reachFrame + 25], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
        const ty = interpolate(frame, [reachFrame + 10, reachFrame + 25], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
        
        return (
          <div key={`callout-${i}`} style={{
            position: 'absolute', top: p.y - 100, left: p.x, transform: `translateX(-50%) translateY(${ty}px)`,
            opacity: op, backgroundColor: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(12px)',
            borderRadius: 12, border: '1px solid rgba(255,255,255,0.2)', padding: '12px 20px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.92)', zIndex: 10, minWidth: 120, textAlign: 'center'
          }}>
            <div style={{ color: 'ACCENT_COLOR', fontSize: 28, fontWeight: 900, letterSpacing: '-0.02em' }}>
              {lineValues[i]}
            </div>
          </div>
        )
      })}

      {/* Footer System Status */}
      <div style={{ position: 'absolute', bottom: 60, right: 80, opacity: entryOp, textAlign: 'right' }}>
        <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: 16, fontFamily: 'monospace' }}>
          DATA_INTEGRITY: 100%<br />
          SOURCE_FEED: TR-742-ALPHA
        </div>
      </div>
    </div>
  )
}

export default AnimationComponent