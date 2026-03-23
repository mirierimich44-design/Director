import React, { useMemo } from 'react'
import { useCurrentFrame, interpolate } from 'remotion'

export const AnimationComponent = () => {
  const frame = useCurrentFrame()

  const title = "TITLE_TEXT"
  const rawIconLabels = [
    "ICON_LABEL_1", "ICON_LABEL_2", "ICON_LABEL_3",
    "ICON_LABEL_4", "ICON_LABEL_5", "ICON_LABEL_6",
    "ICON_LABEL_7", "ICON_LABEL_8", "ICON_LABEL_9",
  ]
  const iconSymbols = ['⬡', '◈', '⬢', '◉', '⬣', '◎', '⬟', '◍', '⬠']

  const activeItems = useMemo(() => {
    return rawIconLabels
      .map((label, i) => ({ label, symbol: iconSymbols[i] }))
      .filter(item => item.label !== '' && item.label !== 'Placeholder')
  }, [])

  const count = activeItems.length

  const titleOp = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const titleTy = interpolate(frame, [0, 20], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const barW = interpolate(frame, [15, 45], [0, 1920], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  const cellOpacities = activeItems.map((_, i) => 
    interpolate(frame, [18 + i * 6, 32 + i * 6], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  )
  const cellScales = activeItems.map((_, i) => 
    interpolate(frame, [18 + i * 6, 32 + i * 6], [0.6, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  )

  const labelOp = interpolate(frame, [75, 90], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  const cellW = 320
  const cellH = 260
  const colGap = 40
  const rowGap = 40
  const cols = 3
  const rows = Math.ceil(count / cols)
  
  const totalW = Math.min(count, cols) * cellW + (Math.min(count, cols) - 1) * colGap
  const totalH = rows * cellH + (rows - 1) * rowGap
  const startX = (1920 - totalW) / 2
  const startY = (1080 - totalH) / 2 + 40

  const cells = activeItems.map((item, i) => {
    const col = i % cols
    const row = Math.floor(i / cols)
    return {
      x: startX + col * (cellW + colGap),
      y: startY + row * (cellH + rowGap),
      label: item.label,
      symbol: item.symbol,
    }
  })

  const isHighlight = (i: number) => i === 4

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
        top: 0,
        left: 0,
        width: 1920,
        height: 5,
        overflow: 'hidden',
        backgroundColor: 'PRIMARY_COLOR',
        opacity: titleOp,
      }} />

      <div style={{
        position: 'absolute',
        top: 1074,
        left: 0,
        width: barW,
        height: 6,
        overflow: 'hidden',
        backgroundColor: 'PRIMARY_COLOR',
      }} />

      <div style={{
        position: 'absolute',
        top: 40,
        left: 0,
        width: 1920,
        height: 60,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: titleOp,
        transform: `translateY(${titleTy}px)`,
      }}>
        <span style={{
          fontSize: 26,
          fontWeight: 700,
          color: 'PRIMARY_COLOR',
          letterSpacing: 5,
          textTransform: 'uppercase',
          fontFamily: 'sans-serif',
        }}>
          {title}
        </span>
      </div>

      {cells.map((cell, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            top: cell.y,
            left: cell.x,
            width: cellW,
            height: cellH,
            overflow: 'hidden',
            backgroundColor: isHighlight(i) ? 'PRIMARY_COLOR' : 'CHART_BG',
            borderRadius: 8,
            boxSizing: 'border-box',
            border: isHighlight(i) ? 'none' : '1px solid',
            borderColor: 'CHART_BORDER',
            opacity: cellOpacities[i],
            transform: `scale(${cellScales[i]})`,
          }}
        >
          <div style={{
            position: 'absolute',
            top: 30,
            left: 0,
            width: cellW,
            height: 110,
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <span style={{
              fontSize: 90,
              color: isHighlight(i) ? 'TEXT_ON_PRIMARY' : 'PRIMARY_COLOR',
              fontFamily: 'sans-serif',
              lineHeight: 1,
            }}>
              {cell.symbol}
            </span>
          </div>

          <div style={{
            position: 'absolute',
            top: 158,
            left: 12,
            width: cellW - 24,
            height: 70,
            overflow: 'hidden',
            opacity: labelOp,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <span style={{
              fontSize: 21,
              fontWeight: isHighlight(i) ? 700 : 500,
              color: isHighlight(i) ? 'TEXT_ON_PRIMARY' : 'TEXT_ON_SECONDARY',
              fontFamily: 'sans-serif',
              textAlign: 'center',
              lineHeight: 1.3,
            }}>
              {cell.label}
            </span>
          </div>
        </div>
      ))}

    </div>
  )
}

export default AnimationComponent