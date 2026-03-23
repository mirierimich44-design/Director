import React, { useMemo } from 'react'
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion'

export const AnimationComponent = () => {
  const frame = useCurrentFrame()

  const titleOp = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  const axisOp = interpolate(frame, [5, 25], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  const titleText = "TITLE_TEXT"
  const lineLabel1 = "LINE_LABEL_1"
  const lineLabel2 = "LINE_LABEL_2"

  const plotLeft = 200
  const plotTop = 150
  const plotW = 1520
  const plotH = 700

  const rawPoints = [
    { px: 0.08, py: 0.85, s: 10, g: 0, delay: 15, label: 'Item 1' },
    { px: 0.15, py: 0.60, s: 14, g: 0, delay: 18, label: '' },
    { px: 0.22, py: 0.75, s: 8,  g: 0, delay: 21, label: 'Item 3' },
    { px: 0.30, py: 0.45, s: 18, g: 1, delay: 24, label: 'Placeholder' },
    { px: 0.38, py: 0.55, s: 12, g: 0, delay: 27, label: 'Item 5' },
    { px: 0.44, py: 0.30, s: 20, g: 1, delay: 30, label: 'Item 6' },
    { px: 0.50, py: 0.65, s: 9,  g: 0, delay: 33, label: 'Item 7' },
    { px: 0.55, py: 0.20, s: 16, g: 1, delay: 36, label: 'Item 8' },
    { px: 0.60, py: 0.50, s: 11, g: 0, delay: 39, label: 'Item 9' },
    { px: 0.65, py: 0.15, s: 22, g: 1, delay: 42, label: 'Item 10' },
    { px: 0.70, py: 0.40, s: 13, g: 1, delay: 45, label: 'Item 11' },
    { px: 0.75, py: 0.70, s: 7,  g: 0, delay: 48, label: 'Item 12' },
    { px: 0.80, py: 0.25, s: 19, g: 1, delay: 51, label: 'Item 13' },
    { px: 0.85, py: 0.55, s: 10, g: 0, delay: 54, label: 'Item 14' },
    { px: 0.90, py: 0.10, s: 24, g: 1, delay: 57, label: 'Item 15' },
    { px: 0.95, py: 0.35, s: 15, g: 1, delay: 60, label: 'Item 16' },
  ]

  const points = useMemo(() => {
    return rawPoints.filter(p => p.label !== '' && p.label !== 'Placeholder')
  }, [])

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: 1920,
      height: 1080,
      overflow: 'hidden',
      backgroundColor: 'BACKGROUND_COLOR',
    }}>

      <div style={{
        position: 'absolute',
        top: 60,
        left: 100,
        width: 1720,
        height: 60,
        overflow: 'hidden',
        fontSize: 22,
        fontWeight: 700,
        color: 'ACCENT_COLOR',
        letterSpacing: 6,
        textTransform: 'uppercase',
        opacity: titleOp,
      }}>
        {titleText}
      </div>

      <div style={{
        position: 'absolute',
        top: plotTop,
        left: plotLeft,
        width: plotW,
        height: plotH,
        overflow: 'hidden',
        backgroundColor: 'CHART_BG',
        borderRadius: 8,
        boxSizing: 'border-box',
        opacity: axisOp,
      }} />

      <svg width={1920} height={1080} style={{ position: 'absolute', top: 0, left: 0 }}>
        {[0.25, 0.5, 0.75].map((t, i) => (
          <g key={i} opacity={axisOp}>
            <line
              x1={plotLeft}
              y1={plotTop + plotH * t}
              x2={plotLeft + plotW}
              y2={plotTop + plotH * t}
              stroke="GRID_LINE"
              strokeWidth={1}
              strokeDasharray="6 4"
            />
            <line
              x1={plotLeft + plotW * t}
              y1={plotTop}
              x2={plotLeft + plotW * t}
              y2={plotTop + plotH}
              stroke="GRID_LINE"
              strokeWidth={1}
              strokeDasharray="6 4"
            />
          </g>
        ))}

        <line x1={plotLeft} y1={plotTop} x2={plotLeft} y2={plotTop + plotH} stroke="LINE_STROKE" strokeWidth={2} opacity={axisOp} />
        <line x1={plotLeft} y1={plotTop + plotH} x2={plotLeft + plotW} y2={plotTop + plotH} stroke="LINE_STROKE" strokeWidth={2} opacity={axisOp} />

        {points.map((p, i) => {
          const cx = plotLeft + p.px * plotW
          const cy = plotTop + p.py * plotH
          const dotOp = interpolate(frame, [p.delay, p.delay + 12], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          })
          const dotR = interpolate(frame, [p.delay, p.delay + 12], [0, p.s], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          })
          return (
            <g key={i} opacity={dotOp}>
              <circle
                cx={cx}
                cy={cy}
                r={dotR + 4}
                fill={p.g === 1 ? 'ACCENT_COLOR' : 'PRIMARY_COLOR'}
                opacity={0.2}
              />
              <circle
                cx={cx}
                cy={cy}
                r={dotR}
                fill={p.g === 1 ? 'ACCENT_COLOR' : 'PRIMARY_COLOR'}
                stroke={p.g === 1 ? 'ACCENT_COLOR' : 'PRIMARY_COLOR'}
                strokeWidth={2}
              />
            </g>
          )
        })}
      </svg>

      <div style={{
        position: 'absolute',
        top: plotTop + plotH + 20,
        left: plotLeft,
        width: plotW,
        height: 40,
        overflow: 'hidden',
        fontSize: 20,
        fontWeight: 600,
        color: 'SUPPORT_COLOR',
        textAlign: 'center',
        letterSpacing: 3,
        textTransform: 'uppercase',
        opacity: axisOp,
      }}>
        {lineLabel1}
      </div>

      <div style={{
        position: 'absolute',
        top: plotTop + plotH / 2 - 80,
        left: 20,
        width: 160,
        height: 160,
        overflow: 'hidden',
        fontSize: 20,
        fontWeight: 600,
        color: 'SUPPORT_COLOR',
        letterSpacing: 3,
        textTransform: 'uppercase',
        opacity: axisOp,
        transform: 'rotate(-90deg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {lineLabel2}
      </div>

      <div style={{
        position: 'absolute',
        top: 980,
        left: plotLeft,
        width: 400,
        height: 40,
        overflow: 'hidden',
        display: 'flex',
        gap: 32,
        alignItems: 'center',
        opacity: titleOp,
      }}>
        <div style={{ position: 'absolute', top: 10, left: 0, width: 16, height: 16, overflow: 'hidden', backgroundColor: 'PRIMARY_COLOR', borderRadius: 8 }} />
        <div style={{ position: 'absolute', top: 6, left: 24, width: 140, height: 24, overflow: 'hidden', fontSize: 17, color: 'SUPPORT_COLOR' }}>Low Risk</div>
        <div style={{ position: 'absolute', top: 10, left: 180, width: 16, height: 16, overflow: 'hidden', backgroundColor: 'ACCENT_COLOR', borderRadius: 8 }} />
        <div style={{ position: 'absolute', top: 6, left: 204, width: 140, height: 24, overflow: 'hidden', fontSize: 17, color: 'SUPPORT_COLOR' }}>High Risk</div>
      </div>

      <div style={{
        position: 'absolute',
        top: 1020,
        left: 0,
        width: 1920,
        height: 4,
        overflow: 'hidden',
        backgroundColor: 'ACCENT_COLOR',
        opacity: titleOp,
      }} />
    </div>
  )
}

export default AnimationComponent