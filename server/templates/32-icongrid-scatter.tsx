import React, { useMemo } from 'react'
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion'

export const AnimationComponent = () => {
  const frame = useCurrentFrame()

  const titleOp = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  const titleText = "TITLE_TEXT"
  const countValue = "COUNT_VALUE"
  const countLabel = "COUNT_LABEL"

  const rawPositions = [
    { x: 180, y: 200 }, { x: 520, y: 160 }, { x: 860, y: 220 }, { x: 1200, y: 180 },
    { x: 1540, y: 210 }, { x: 1760, y: 300 }, { x: 300, y: 450 }, { x: 680, y: 480 },
    { x: 1020, y: 420 },
  ]

  const icons = useMemo(() => {
    return Array.from({ length: 9 }, (_, i) => ({
      label: `ICON_LABEL_${i + 1}`,
      x: rawPositions[i].x,
      y: rawPositions[i].y,
    })).filter(item => item.label !== '' && item.label !== 'Placeholder')
      .map((item, i) => ({
        ...item,
        delay: 8 + i * 6,
      }))
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

      {/* SVG connector lines between scattered icons */}
      <svg width={1920} height={1080} style={{ position: 'absolute', top: 0, left: 0 }}>
        {icons.map((icon, i) => {
          if (i === 0) return null
          const prev = icons[i - 1]
          const lineOp = interpolate(frame, [icon.delay + 4, icon.delay + 16], [0, 0.35], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          })
          return (
            <line
              key={i}
              x1={prev.x + 60}
              y1={prev.y + 60}
              x2={icon.x + 60}
              y2={icon.y + 60}
              stroke="LINE_STROKE"
              strokeWidth={1}
              opacity={lineOp}
              strokeDasharray="5 5"
            />
          )
        })}
      </svg>

      {/* Scattered icon cards */}
      {icons.map((icon, i) => {
        const op = interpolate(frame, [icon.delay, icon.delay + 16], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        })
        const scale = interpolate(frame, [icon.delay, icon.delay + 16], [0.5, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        })
        return (
          <div key={i} style={{
            position: 'absolute',
            top: icon.y,
            left: icon.x,
            width: 160,
            height: 160,
            overflow: 'hidden',
            backgroundColor: 'rgba(255,255,255,0.08)',
            borderRadius: 12,
            border: '2px solid',
            borderColor: 'ACCENT_COLOR',
            opacity: op,
            transform: `scale(${scale})`,
            boxSizing: 'border-box',
          }}>
            {/* Icon circle */}
            <div style={{
              position: 'absolute',
              top: 18,
              left: 52,
              width: 56,
              height: 56,
              overflow: 'hidden',
              backgroundColor: 'ACCENT_COLOR',
              borderRadius: 28,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <div style={{ width: 24, height: 24, backgroundColor: 'BACKGROUND_COLOR', borderRadius: 4, opacity: 0.9 }} />
            </div>
            {/* Label */}
            <div style={{
              position: 'absolute',
              top: 84,
              left: 0,
              width: 160,
              height: 64,
              overflow: 'hidden',
              fontSize: 15,
              fontWeight: 700,
              color: '#ffffff',
              textAlign: 'center',
              padding: '6px 8px',
              boxSizing: 'border-box',
              lineHeight: 1.3,
            }}>
              {icon.label}
            </div>
          </div>
        )
      })}

      {/* Count display — bottom right */}
      <div style={{
        position: 'absolute',
        top: 730,
        left: 1400,
        width: 420,
        height: 200,
        overflow: 'hidden',
        opacity: titleOp,
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: 420,
          height: 120,
          overflow: 'hidden',
          fontSize: 100,
          fontWeight: 900,
          color: 'ACCENT_COLOR',
          textAlign: 'center',
        }}>
          {countValue}
        </div>
        <div style={{
          position: 'absolute',
          top: 120,
          left: 0,
          width: 420,
          height: 40,
          overflow: 'hidden',
          fontSize: 18,
          fontWeight: 600,
          color: 'SUPPORT_COLOR',
          letterSpacing: 4,
          textTransform: 'uppercase',
          textAlign: 'center',
        }}>
          {countLabel}
        </div>
      </div>

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