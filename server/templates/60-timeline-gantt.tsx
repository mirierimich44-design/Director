import React, { useMemo } from 'react'
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion'

export const AnimationComponent = () => {
  const frame = useCurrentFrame()

  const titleOp = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  const titleText = "TITLE_TEXT"

  const rawRows = [
    { label: 'PHASE_1', start: 0.00, end: 0.30, g: 0, delay: 14 },
    { label: 'PHASE_2', start: 0.10, end: 0.45, g: 1, delay: 20 },
    { label: 'PHASE_3', start: 0.30, end: 0.65, g: 0, delay: 26 },
    { label: 'PHASE_4', start: 0.50, end: 0.80, g: 2, delay: 32 },
    { label: 'STEP_1',  start: 0.60, end: 0.90, g: 1, delay: 38 },
    { label: 'STEP_2',  start: 0.72, end: 1.00, g: 2, delay: 44 },
  ]

  const rows = useMemo(() => {
    return rawRows.filter(row => row.label !== '' && row.label !== 'Placeholder')
  }, [])

  const colLabels = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6']

  const chartLeft = 360
  const chartTop = 180
  const chartW = 1440
  const rowH = 80
  const rowGap = 16

  const groupColors = ['PRIMARY_COLOR', 'ACCENT_COLOR', 'SECONDARY_COLOR']

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

      {/* Title */}
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

      {/* Column headers */}
      {colLabels.map((lbl, i) => (
        <div key={i} style={{
          position: 'absolute',
          top: chartTop - 40,
          left: chartLeft + (i / colLabels.length) * chartW,
          width: chartW / colLabels.length,
          height: 32,
          overflow: 'hidden',
          fontSize: 16,
          fontWeight: 600,
          color: 'SUPPORT_COLOR',
          textAlign: 'center',
          letterSpacing: 2,
          opacity: titleOp,
        }}>
          {lbl}
        </div>
      ))}

      {/* Grid lines */}
      <svg width={1920} height={1080} style={{ position: 'absolute', top: 0, left: 0 }}>
        {colLabels.map((_, i) => (
          <line
            key={i}
            x1={chartLeft + (i / colLabels.length) * chartW}
            y1={chartTop - 10}
            x2={chartLeft + (i / colLabels.length) * chartW}
            y2={chartTop + rows.length * (rowH + rowGap) + 20}
            stroke="GRID_LINE"
            strokeWidth={1}
            strokeDasharray="4 4"
            opacity={titleOp}
          />
        ))}
      </svg>

      {/* Row labels + bars */}
      {rows.map((row, i) => {
        const y = chartTop + i * (rowH + rowGap)
        const barProgress = interpolate(frame, [row.delay, row.delay + 22], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        })
        const labelOp = interpolate(frame, [row.delay, row.delay + 14], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        })
        const barX = chartLeft + row.start * chartW
        const barFullW = (row.end - row.start) * chartW
        const barW = barFullW * barProgress
        const barColor = groupColors[row.g]

        return (
          <div key={i}>
            {/* Row label */}
            <div style={{
              position: 'absolute',
              top: y + (rowH - 36) / 2,
              left: 60,
              width: 280,
              height: 36,
              overflow: 'hidden',
              fontSize: 20,
              fontWeight: 600,
              color: 'TEXT_ON_PRIMARY',
              textAlign: 'right',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              opacity: labelOp,
            }}>
              {row.label}
            </div>

            {/* Bar background */}
            <div style={{
              position: 'absolute',
              top: y,
              left: chartLeft + row.start * chartW,
              width: barFullW,
              height: rowH,
              overflow: 'hidden',
              backgroundColor: 'CHART_BG',
              borderRadius: 6,
            }} />

            {/* Bar fill */}
            <div style={{
              position: 'absolute',
              top: y,
              left: barX,
              width: barW,
              height: rowH,
              overflow: 'hidden',
              backgroundColor: barColor,
              borderRadius: 6,
              opacity: labelOp,
            }} />
          </div>
        )
      })}

      {/* Bottom bar */}
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