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
  
  // High-tech modern icon symbols
  const iconSymbols = ['⬡', '◈', '⬢', '◉', '⬣', '◎', '⬟', '◍', '⬠']

  const activeItems = useMemo(() => {
    return rawIconLabels
      .map((label, i) => ({ label, symbol: iconSymbols[i] }))
      .filter(item => item.label !== '' && item.label !== 'Placeholder' && item.label !== ' ')
  }, [])

  const count = activeItems.length

  const titleOp = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const titleTy = interpolate(frame, [0, 20], [20, 0], { extrapolateLeft: 'clamp' })

  const cellOpacities = activeItems.map((_, i) => 
    interpolate(frame, [15 + i * 5, 30 + i * 5], [0, 1], { extrapolateLeft: 'clamp' })
  )

  const cellW = 280
  const cellH = 220
  const colGap = 40
  const rowGap = 40
  const cols = 3
  const rows = Math.ceil(count / cols)
  
  const totalW = Math.min(count, cols) * cellW + (Math.min(count, cols) - 1) * colGap
  const totalH = rows * cellH + (rows - 1) * rowGap
  const startX = (1600 - totalW) / 2
  const startY = (900 - totalH) / 2 + 30

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

  // Highlight the center item if there are enough, otherwise the first one
  const highlightIndex = count >= 5 ? 4 : 0

  return (
    <div style={{
      position: 'absolute', inset: 0, overflow: 'hidden',
      backgroundColor: 'BACKGROUND_COLOR', fontFamily: 'Inter, system-ui, sans-serif',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>

      {/* 16:9 Safe Container */}
      <div style={{ width: 1600, height: 900, position: 'relative' }}>

        <div style={{
          position: 'absolute', top: 40, left: 0, width: '100%', textAlign: 'center',
          opacity: titleOp, transform: `translateY(${titleTy}px)`
        }}>
          <span style={{ fontSize: 24, fontWeight: 900, color: 'PRIMARY_COLOR', letterSpacing: 8, textTransform: 'uppercase' }}>
            {title}
          </span>
        </div>

        {cells.map((cell, i) => {
          const isHighlight = i === highlightIndex;
          return (
            <div key={i} style={{
              position: 'absolute', top: cell.y, left: cell.x, width: cellW, height: cellH,
              backgroundColor: isHighlight ? 'PRIMARY_COLOR' : 'rgba(255,255,255,0.03)',
              borderRadius: 16, border: isHighlight ? 'none' : '1px solid rgba(255,255,255,0.08)',
              opacity: cellOpacities[i], display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              boxShadow: isHighlight ? '0 20px 50px rgba(0,0,0,0.5)' : 'none'
            }}>
              
              {/* Icon Symbol */}
              <div style={{
                fontSize: 80, color: isHighlight ? 'BACKGROUND_COLOR' : 'PRIMARY_COLOR',
                lineHeight: 1, marginBottom: 24
              }}>
                {cell.symbol}
              </div>

              {/* Explicit Text Label */}
              <div style={{
                fontSize: 18, fontWeight: isHighlight ? 800 : 600,
                color: isHighlight ? 'BACKGROUND_COLOR' : '#fff',
                textAlign: 'center', textTransform: 'uppercase', letterSpacing: 1,
                padding: '0 20px'
              }}>
                {cell.label}
              </div>

            </div>
          )
        })}

      </div>
    </div>
  )
}

export default AnimationComponent