import React, { useMemo } from 'react'
import { useCurrentFrame, useVideoConfig, interpolate, Easing } from 'remotion'

export const AnimationComponent = () => {
  const frame = useCurrentFrame()
  const { durationInFrames } = useVideoConfig()

  const title         = 'TITLE_TEXT'
  const rawLineValues = ['LINE_VALUE_1', 'LINE_VALUE_2', 'LINE_VALUE_3', 'LINE_VALUE_4', 'LINE_VALUE_5']
  const rawXLabels    = ['DATE_1', 'DATE_2', 'DATE_3', 'DATE_4', 'DATE_5']

  const data = useMemo(() => {
    const filled = rawLineValues
      .map((val, i) => ({ val, label: rawXLabels[i] }))
      .filter(item => item.val !== '' && item.val !== 'Placeholder' && !item.val.startsWith('LINE_VALUE_'))
    return filled.length > 0 ? filled : [
      { val: '$2.1M', label: '2021' },
      { val: '$3.5M', label: '2022' },
      { val: '$4.2M', label: '2023' },
      { val: '$5.8M', label: '2024' },
      { val: '$7.4M', label: '2025' },
    ]
  }, [])

  const lineValues = data.map(d => d.val)
  const xLabels    = data.map(d => d.label)
  const itemCount  = data.length

  const entryOp  = interpolate(frame, [0, 20],  [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const gridOp   = interpolate(frame, [15, 35], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  const lineStart    = 40
  const lineEnd      = durationInFrames - 60
  const lineProgress = interpolate(frame, [lineStart, lineEnd], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.quad),
  })

  const chartW    = 1200
  const chartH    = 480
  const chartLeft = 220
  const chartTop  = 170
  const chartRight  = chartLeft + chartW
  const chartBottom = chartTop + chartH

  const points = useMemo(() => {
    const yRatios = [0.1, 0.3, 0.5, 0.75, 0.9]
    return Array.from({ length: itemCount }).map((_, i) => ({
      x: chartLeft + (itemCount > 1 ? (chartW / (itemCount - 1)) * i : 0),
      y: chartBottom - (yRatios[i % yRatios.length] * chartH),
    }))
  }, [itemCount, chartLeft, chartW, chartBottom, chartH])

  const progressInSegments = lineProgress * (points.length - 1)
  const fullSegmentsDone   = Math.floor(progressInSegments)
  const partialProgress    = progressInSegments - fullSegmentsDone

  const visiblePoints: { x: number; y: number }[] = []
  for (let i = 0; i <= fullSegmentsDone && i < points.length; i++) {
    visiblePoints.push(points[i])
  }
  if (fullSegmentsDone < points.length - 1) {
    const from = points[fullSegmentsDone]
    const to   = points[fullSegmentsDone + 1]
    visiblePoints.push({
      x: from.x + (to.x - from.x) * partialProgress,
      y: from.y + (to.y - from.y) * partialProgress,
    })
  }

  const polylinePath = visiblePoints.map(p => `${p.x},${p.y}`).join(' ')
  const areaPath     = visiblePoints.length > 0
    ? `${polylinePath} ${visiblePoints[visiblePoints.length - 1].x},${chartBottom} ${visiblePoints[0].x},${chartBottom}`
    : ''

  const currentX = visiblePoints.length > 0 ? visiblePoints[visiblePoints.length - 1].x : chartLeft
  const currentY = visiblePoints.length > 0 ? visiblePoints[visiblePoints.length - 1].y : chartBottom

  return (
    <div style={{
      position: 'absolute', inset: 0, overflow: 'hidden',
      backgroundColor: 'BACKGROUND_COLOR', fontFamily: 'Inter, system-ui, sans-serif',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{ width: 1600, height: 900, position: 'relative' }}>

        {/* Background grid */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '100px 100px',
          opacity: 0.5, borderRadius: 24, border: '1px solid rgba(255,255,255,0.05)',
        }} />

        {/* Header */}
        <div style={{ position: 'absolute', top: 36, left: 40, opacity: entryOp }}>
          <div style={{ color: 'PRIMARY_COLOR', fontSize: 22, fontWeight: 900, letterSpacing: 6, marginBottom: 8 }}>
            DATA STREAM ANALYSIS
          </div>
          <div style={{ color: '#fff', fontSize: 52, fontWeight: 900, textTransform: 'uppercase' }}>{title}</div>
        </div>

        <svg width={1600} height={900} style={{ position: 'absolute', top: 0, left: 0, zIndex: 1 }}>

          {/* Horizontal grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((r, i) => (
            <line key={`h-${i}`}
              x1={chartLeft} y1={chartBottom - r * chartH}
              x2={chartRight} y2={chartBottom - r * chartH}
              stroke="rgba(255,255,255,0.12)" strokeWidth={2}
              strokeDasharray="6 4" opacity={gridOp}
            />
          ))}

          {/* Vertical grid lines */}
          {points.map((p, i) => (
            <line key={`v-${i}`}
              x1={p.x} y1={chartTop}
              x2={p.x} y2={chartBottom}
              stroke="rgba(255,255,255,0.06)" strokeWidth={1} opacity={gridOp}
            />
          ))}

          <defs>
            <linearGradient id="areaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%"   stopColor="PRIMARY_COLOR" stopOpacity="0.4" />
              <stop offset="100%" stopColor="PRIMARY_COLOR" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          {visiblePoints.length > 1 && (
            <polygon points={areaPath} fill="url(#areaGrad)" opacity={0.8} />
          )}

          {/* Main line */}
          {visiblePoints.length > 1 && (
            <polyline
              points={polylinePath} fill="none"
              stroke="PRIMARY_COLOR" strokeWidth={7}
              strokeLinejoin="round" strokeLinecap="round"
              style={{ filter: 'drop-shadow(0 0 14px PRIMARY_COLOR)' }}
            />
          )}

          {/* Leading edge */}
          {lineProgress > 0 && lineProgress < 1 && (
            <g transform={`translate(${currentX}, ${currentY})`}>
              <circle cx={0} cy={0} r={14} fill="PRIMARY_COLOR" opacity={0.35} />
              <circle cx={0} cy={0} r={7}  fill="#fff" style={{ filter: 'drop-shadow(0 0 10px #fff)' }} />
            </g>
          )}

          {/* Data points */}
          {points.map((p, i) => {
            const reachFrame = lineStart + (i * (lineEnd - lineStart) / (itemCount - 1))
            const pop = interpolate(frame, [reachFrame, reachFrame + 10], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
            return (
              <g key={`dot-${i}`} opacity={pop}>
                <circle cx={p.x} cy={p.y} r={12} fill="BACKGROUND_COLOR" stroke="PRIMARY_COLOR" strokeWidth={4} />
                <circle cx={p.x} cy={p.y} r={5}  fill="#fff" />
              </g>
            )
          })}
        </svg>

        {/* X-axis labels */}
        {points.map((p, i) => {
          const reachFrame = lineStart + (i * (lineEnd - lineStart) / (itemCount - 1))
          const op = interpolate(frame, [reachFrame + 5, reachFrame + 22], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
          return (
            <div key={`label-${i}`} style={{
              position: 'absolute', top: chartBottom + 22, left: p.x, transform: 'translateX(-50%)',
              opacity: op, color: 'SUPPORT_COLOR', fontSize: 26, fontWeight: 700,
              fontFamily: 'JetBrains Mono, monospace', letterSpacing: 1,
            }}>
              {xLabels[i]}
            </div>
          )
        })}

        {/* Value callouts */}
        {points.map((p, i) => {
          const reachFrame = lineStart + (i * (lineEnd - lineStart) / (itemCount - 1))
          const op = interpolate(frame, [reachFrame + 10, reachFrame + 28], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
          return (
            <div key={`callout-${i}`} style={{
              position: 'absolute', top: p.y - 72, left: p.x, transform: 'translateX(-50%)',
              opacity: op, backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(10px)',
              borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)',
              padding: '10px 20px', boxShadow: '0 10px 24px rgba(0,0,0,0.5)',
              zIndex: 10, textAlign: 'center',
            }}>
              <div style={{ color: 'PRIMARY_COLOR', fontSize: 30, fontWeight: 900, letterSpacing: 1 }}>
                {lineValues[i]}
              </div>
            </div>
          )
        })}

      </div>
    </div>
  )
}

export default AnimationComponent
