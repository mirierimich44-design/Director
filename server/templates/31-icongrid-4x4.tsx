import React from 'react'
import { useCurrentFrame, interpolate } from 'remotion'

export const AnimationComponent = () => {
  const frame = useCurrentFrame()

  const titleOp = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const titleTy = interpolate(frame, [0, 20], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const barW = interpolate(frame, [10, 40], [0, 1920], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  const rawIconLabels = [
    "ICON_LABEL_1","ICON_LABEL_2","ICON_LABEL_3","ICON_LABEL_4",
    "ICON_LABEL_5","ICON_LABEL_6","ICON_LABEL_7","ICON_LABEL_8",
    "ICON_LABEL_9","LABEL_1","LABEL_2","LABEL_3",
    "LABEL_4","LABEL_5","LABEL_6","LABEL_7",
  ]

  const rawIconSymbols = ['⬡','◈','⬢','◉','⬣','◎','⬟','◍','⬠','⬡','◈','⬢','◉','⬣','◎','⬟']

  const filteredData = rawIconLabels
    .map((label, i) => ({ label, symbol: rawIconSymbols[i] }))
    .filter(item => item.label !== '' && item.label !== 'Placeholder')

  const title = "TITLE_TEXT"
  const cols = 4
  const cellW = 360
  const cellH = 180
  const colGap = 48
  const rowGap = 32
  
  const totalItems = filteredData.length
  const actualCols = Math.min(totalItems, cols)
  const actualRows = Math.ceil(totalItems / cols)
  
  const totalW = actualCols * cellW + (actualCols - 1) * colGap
  const totalH = actualRows * cellH + (actualRows - 1) * rowGap
  const startX = (1920 - totalW) / 2
  const startY = (1080 - totalH) / 2 + 30

  const cells = filteredData.map((item, i) => {
    const col = i % cols
    const row = Math.floor(i / cols)
    const delay = i * 6
    const op = interpolate(frame, [18 + delay, 32 + delay], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    const scale = interpolate(frame, [18 + delay, 32 + delay], [0.7, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    const labelOp = interpolate(frame, [50 + delay, 64 + delay], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    return {
      x: startX + col * (cellW + colGap),
      y: startY + row * (cellH + rowGap),
      label: item.label, 
      symbol: item.symbol, 
      op, scale, labelOp,
    }
  })

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden', backgroundColor: 'BACKGROUND_COLOR' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 5, overflow: 'hidden', backgroundColor: 'PRIMARY_COLOR', opacity: titleOp }} />
      <div style={{ position: 'absolute', top: 1074, left: 0, width: barW, height: 6, overflow: 'hidden', backgroundColor: 'PRIMARY_COLOR' }} />
      <div style={{ position: 'absolute', top: 30, left: 0, width: 1920, height: 56, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: titleOp, transform: `translateY(${titleTy}px)` }}>
        <span style={{ fontSize: 24, fontWeight: 700, color: 'PRIMARY_COLOR', letterSpacing: 5, textTransform: 'uppercase', fontFamily: 'sans-serif' }}>{title}</span>
      </div>
      {cells.map((cell, i) => (
        <div key={i} style={{ position: 'absolute', top: cell.y, left: cell.x, width: cellW, height: cellH, overflow: 'hidden', backgroundColor: 'CHART_BG', borderRadius: 6, border: '1px solid', borderColor: 'CHART_BORDER', opacity: cell.op, transform: `scale(${cell.scale})`, boxSizing: 'border-box' }}>
          <div style={{ position: 'absolute', top: 18, left: 0, width: cellW, height: 72, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 56, color: 'PRIMARY_COLOR', fontFamily: 'sans-serif', lineHeight: 1 }}>{cell.symbol}</span>
          </div>
          <div style={{ position: 'absolute', top: 96, left: 8, width: cellW - 16, height: 52, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: cell.labelOp }}>
            <span style={{ fontSize: 17, fontWeight: 600, color: 'TEXT_ON_SECONDARY', fontFamily: 'sans-serif', textAlign: 'center', lineHeight: 1.3 }}>{cell.label}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

export default AnimationComponent