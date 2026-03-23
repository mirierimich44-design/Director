import React, { useMemo } from 'react'
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion'

export const AnimationComponent = () => {
  const frame = useCurrentFrame()

  const titleOp = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  const titleText = "TITLE_TEXT"
  const lineLabel1 = "LINE_LABEL_1"
  const lineLabel2 = "LINE_LABEL_2"

  const rawHeatData = [
    0.1, 0.3, 0.6, 0.9, 0.7, 0.4, 0.2,
    0.2, 0.5, 0.8, 1.0, 0.9, 0.6, 0.3,
    0.1, 0.4, 0.7, 0.8, 0.6, 0.5, 0.2,
    0.0, 0.2, 0.4, 0.6, 0.5, 0.3, 0.1,
    0.1, 0.1, 0.2, 0.3, 0.2, 0.1, 0.0,
  ]

  const rawRowLabels = ['MON', 'TUE', 'WED', 'THU', 'FRI']
  const rawColLabels = ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00']

  // Filter logic
  const filteredData = useMemo(() => {
    return rawHeatData.filter(val => val !== '' && val !== 'Placeholder')
  }, [])

  const filteredRowLabels = useMemo(() => {
    return rawRowLabels.filter(lbl => lbl !== '' && lbl !== 'Placeholder')
  }, [])

  const filteredColLabels = useMemo(() => {
    return rawColLabels.filter(lbl => lbl !== '' && lbl !== 'Placeholder')
  }, [])

  const cols = filteredColLabels.length
  const rows = filteredRowLabels.length
  const cellW = 180
  const cellH = 110
  const gridLeft = (1920 - cols * cellW) / 2
  const gridTop = 220

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
        top: 200,
        left: 20,
        width: 130,
        height: 600,
        overflow: 'hidden',
        fontSize: 18,
        fontWeight: 600,
        color: 'SUPPORT_COLOR',
        textTransform: 'uppercase',
        letterSpacing: 2,
        opacity: titleOp,
      }}>
        <div style={{
          position: 'absolute',
          top: 160,
          left: 0,
          width: 130,
          height: 200,
          overflow: 'hidden',
          transform: 'rotate(-90deg)',
          transformOrigin: '65px 65px',
          fontSize: 18,
          textAlign: 'center',
        }}>
          {lineLabel2}
        </div>
      </div>

      {filteredData.map((heat, i) => {
        const col = i % cols
        const row = Math.floor(i / cols)
        const x = gridLeft + col * cellW
        const y = gridTop + row * cellH
        const delay = 12 + row * 8 + col * 2
        const cellOp = interpolate(frame, [delay, delay + 14], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        })
        const alpha = heat
        return (
          <div key={i} style={{
            position: 'absolute',
            top: y + 2,
            left: x + 2,
            width: cellW - 4,
            height: cellH - 4,
            overflow: 'hidden',
            backgroundColor: 'CHART_BG',
            backgroundImage: heat > 0.05
              ? `linear-gradient(135deg, transparent, rgba(255,80,40,${alpha * 0.85}))`
              : undefined,
            borderRadius: 4,
            opacity: cellOp,
            boxSizing: 'border-box',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {heat > 0.5 && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: cellW - 4,
                height: cellH - 4,
                overflow: 'hidden',
                fontSize: 20,
                fontWeight: 700,
                color: 'TEXT_ON_ACCENT',
                textAlign: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {Math.round(heat * 100)}
              </div>
            )}
          </div>
        )
      })}

      {filteredColLabels.map((lbl, i) => (
        <div key={i} style={{
          position: 'absolute',
          top: gridTop + rows * cellH + 16,
          left: gridLeft + i * cellW - 30,
          width: 100,
          height: 30,
          overflow: 'hidden',
          fontSize: 16,
          color: 'SUPPORT_COLOR',
          textAlign: 'center',
          opacity: titleOp,
        }}>
          {lbl}
        </div>
      ))}

      {filteredRowLabels.map((lbl, i) => (
        <div key={i} style={{
          position: 'absolute',
          top: gridTop + i * cellH + cellH / 2 - 12,
          left: gridLeft - 80,
          width: 70,
          height: 30,
          overflow: 'hidden',
          fontSize: 16,
          fontWeight: 600,
          color: 'SUPPORT_COLOR',
          textAlign: 'right',
          opacity: titleOp,
        }}>
          {lbl}
        </div>
      ))}

      <div style={{
        position: 'absolute',
        top: gridTop + rows * cellH + 60,
        left: gridLeft,
        width: cols * cellW,
        height: 30,
        overflow: 'hidden',
        fontSize: 18,
        fontWeight: 600,
        color: 'SUPPORT_COLOR',
        textAlign: 'center',
        letterSpacing: 3,
        textTransform: 'uppercase',
        opacity: titleOp,
      }}>
        {lineLabel1}
      </div>

      <div style={{
        position: 'absolute',
        top: 980,
        left: gridLeft,
        width: 500,
        height: 30,
        overflow: 'hidden',
        opacity: titleOp,
      }}>
        <div style={{
          position: 'absolute',
          top: 6,
          left: 0,
          width: 80,
          height: 18,
          overflow: 'hidden',
          fontSize: 16,
          color: 'SUPPORT_COLOR',
        }}>
          LOW
        </div>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 50,
          width: 300,
          height: 28,
          overflow: 'hidden',
          backgroundColor: 'CHART_BG',
          backgroundImage: 'linear-gradient(to right, transparent, rgba(255,80,40,0.85))',
          borderRadius: 4,
        }} />
        <div style={{
          position: 'absolute',
          top: 6,
          left: 360,
          width: 80,
          height: 18,
          overflow: 'hidden',
          fontSize: 16,
          color: 'ACCENT_COLOR',
        }}>
          HIGH
        </div>
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