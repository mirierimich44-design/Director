import React, { useMemo } from 'react'
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion'

export const AnimationComponent = () => {
  const frame = useCurrentFrame()

  const titleOp = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  const spotlightOp = interpolate(frame, [25, 50], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  const centerScale = interpolate(frame, [25, 45], [0.5, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  const titleText = "TITLE_TEXT"
  const countValue = "COUNT_VALUE"
  const countLabel = "COUNT_LABEL"
  const subLabel = "SUB_LABEL"

  const rawSurrounding = [
    { angle: 0,   label: 'ICON_LABEL_1', delay: 8  },
    { angle: 45,  label: 'ICON_LABEL_2', delay: 12 },
    { angle: 90,  label: 'ICON_LABEL_3', delay: 16 },
    { angle: 135, label: 'ICON_LABEL_4', delay: 20 },
    { angle: 180, label: 'ICON_LABEL_5', delay: 24 },
    { angle: 225, label: 'ICON_LABEL_6', delay: 28 },
    { angle: 270, label: 'ICON_LABEL_7', delay: 32 },
    { angle: 315, label: 'ICON_LABEL_8', delay: 36 },
  ]

  const surrounding = useMemo(() => {
    const filtered = rawSurrounding.filter(s => s.label !== '' && s.label !== 'Placeholder');
    const count = filtered.length;
    return filtered.map((s, i) => ({
      ...s,
      angle: (360 / count) * i
    }));
  }, []);

  const cx = 960
  const cy = 560
  const r = 320

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

      {/* SVG: connector spokes + spotlight ring */}
      <svg width={1920} height={1080} style={{ position: 'absolute', top: 0, left: 0 }}>
        {/* Outer orbit ring */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="GRID_LINE"
          strokeWidth={1}
          opacity={0.4}
          strokeDasharray="6 6"
        />

        {/* Spoke lines */}
        {surrounding.map((s, i) => {
          const rad = (s.angle * Math.PI) / 180
          const nx = cx + r * Math.cos(rad)
          const ny = cy + r * Math.sin(rad)
          const spokeOp = interpolate(frame, [s.delay + 4, s.delay + 16], [0, 0.5], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          })
          return (
            <line
              key={i}
              x1={cx}
              y1={cy}
              x2={nx}
              y2={ny}
              stroke="LINE_STROKE"
              strokeWidth={1}
              opacity={spokeOp}
              strokeDasharray="4 4"
            />
          )
        })}

        {/* Spotlight glow behind center */}
        <circle cx={cx} cy={cy} r={120} fill="PRIMARY_COLOR" opacity={spotlightOp * 0.15} />
        <circle cx={cx} cy={cy} r={80} fill="PRIMARY_COLOR" opacity={spotlightOp * 0.2} />

        {/* Surrounding nodes */}
        {surrounding.map((s, i) => {
          const rad = (s.angle * Math.PI) / 180
          const nx = cx + r * Math.cos(rad)
          const ny = cy + r * Math.sin(rad)
          const nodeOp = interpolate(frame, [s.delay, s.delay + 14], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          })
          return (
            <g key={i} opacity={nodeOp}>
              <circle cx={nx} cy={ny} r={32} fill="CHART_BG" stroke="NODE_STROKE" strokeWidth={2} />
              <circle cx={nx} cy={ny} r={12} fill="NODE_FILL" />
            </g>
          )
        })}
      </svg>

      {/* Center spotlight card */}
      <div style={{
        position: 'absolute',
        top: cy - 70,
        left: cx - 140,
        width: 280,
        height: 140,
        overflow: 'hidden',
        backgroundColor: 'PANEL_LEFT_BG',
        borderRadius: 16,
        border: '2px solid',
        borderColor: 'ACCENT_COLOR',
        opacity: spotlightOp,
        transform: `scale(${centerScale})`,
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{
          position: 'absolute',
          top: 14,
          left: 0,
          width: 280,
          height: 56,
          overflow: 'hidden',
          fontSize: 46,
          fontWeight: 900,
          color: 'ACCENT_COLOR',
          textAlign: 'center',
        }}>
          {countValue}
        </div>
        <div style={{
          position: 'absolute',
          top: 70,
          left: 0,
          width: 280,
          height: 36,
          overflow: 'hidden',
          fontSize: 16,
          fontWeight: 600,
          color: 'SUPPORT_COLOR',
          letterSpacing: 3,
          textTransform: 'uppercase',
          textAlign: 'center',
        }}>
          {countLabel}
        </div>
        <div style={{
          position: 'absolute',
          top: 100,
          left: 0,
          width: 280,
          height: 30,
          overflow: 'hidden',
          fontSize: 14,
          color: 'TEXT_ON_PRIMARY',
          textAlign: 'center',
          opacity: 0.7,
        }}>
          {subLabel}
        </div>
      </div>

      {/* Surrounding icon labels */}
      {surrounding.map((s, i) => {
        const rad = (s.angle * Math.PI) / 180
        const nx = cx + r * Math.cos(rad)
        const ny = cy + r * Math.sin(rad)
        const labelOp = interpolate(frame, [s.delay + 8, s.delay + 22], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        })
        return (
          <div key={i} style={{
            position: 'absolute',
            top: ny + 40,
            left: nx - 90,
            width: 180,
            height: 40,
            overflow: 'hidden',
            fontSize: 17,
            fontWeight: 600,
            color: 'TEXT_ON_PRIMARY',
            textAlign: 'center',
            opacity: labelOp,
          }}>
            {s.label}
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