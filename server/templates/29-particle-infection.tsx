import React, { useMemo } from 'react'
import { useCurrentFrame, interpolate } from 'remotion'

export const AnimationComponent = () => {
  const frame = useCurrentFrame()

  const titleOp = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const titleTy = interpolate(frame, [0, 20], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const barW = interpolate(frame, [10, 40], [0, 1920], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const infectionProgress = interpolate(frame, [15, 85], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const countOp = interpolate(frame, [75, 90], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  const title = "TITLE_TEXT"
  const originLabel = "ORIGIN_LABEL"
  const countValue = "COUNT_VALUE"
  const countLabel = "COUNT_LABEL"

  // Define raw data and filter immediately
  const rawNodes = useMemo(() => {
    const data = []
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 8; c++) {
        data.push({ r, c, label: "NODE_LABEL" })
      }
    }
    return data.filter(item => item.label !== '' && item.label !== 'Placeholder')
  }, [])

  const activeNodes = rawNodes.length
  const cols = Math.min(8, activeNodes)
  const rows = Math.ceil(activeNodes / cols)
  
  const nodeSpacingX = 180
  const nodeSpacingY = 140
  const gridStartX = (1920 - (cols - 1) * nodeSpacingX) / 2
  const gridStartY = 180

  const nodes = rawNodes.map((item, i) => {
    const c = i % cols
    const r = Math.floor(i / cols)
    const x = gridStartX + c * nodeSpacingX
    const y = gridStartY + r * nodeSpacingY
    const dist = Math.sqrt(c * c + r * r) / Math.sqrt((cols - 1) * (cols - 1) + (rows - 1) * (rows - 1))
    const infected = infectionProgress > dist
    return { x, y, dist, infected, index: i, col: c, row: r }
  })

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden', backgroundColor: 'BACKGROUND_COLOR' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 5, overflow: 'hidden', backgroundColor: 'SECONDARY_COLOR', opacity: titleOp }} />
      <div style={{ position: 'absolute', top: 1074, left: 0, width: barW, height: 6, overflow: 'hidden', backgroundColor: 'SECONDARY_COLOR' }} />
      <div style={{ position: 'absolute', top: 60, left: 0, width: 1920, height: 60, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: titleOp, transform: `translateY(${titleTy}px)` }}>
        <span style={{ fontSize: 28, fontWeight: 700, color: 'PRIMARY_COLOR', letterSpacing: 5, textTransform: 'uppercase', fontFamily: 'sans-serif' }}>{title}</span>
      </div>
      <svg width={1920} height={1080} style={{ position: 'absolute', top: 0, left: 0 }}>
        {nodes.map((n, i) => {
          const lines = []
          if (n.col < cols - 1 && i + 1 < nodes.length) {
            const next = nodes[i + 1]
            lines.push(<line key={'h'+i} x1={n.x} y1={n.y} x2={next.x} y2={next.y} stroke={n.infected && next.infected ? 'SECONDARY_COLOR' : 'GRID_LINE'} strokeWidth={n.infected && next.infected ? 2 : 1} opacity={0.4} />)
          }
          if (n.row < rows - 1 && i + cols < nodes.length) {
            const below = nodes[i + cols]
            lines.push(<line key={'v'+i} x1={n.x} y1={n.y} x2={below.x} y2={below.y} stroke={n.infected && below.infected ? 'SECONDARY_COLOR' : 'GRID_LINE'} strokeWidth={n.infected && below.infected ? 2 : 1} opacity={0.4} />)
          }
          return lines
        })}
        {nodes.map((n, i) => (
          <circle key={i} cx={n.x} cy={n.y} r={i === 0 ? 22 : 16} fill={n.infected ? (i === 0 ? 'PRIMARY_COLOR' : 'SECONDARY_COLOR') : 'CHART_BG'} stroke={n.infected ? (i === 0 ? 'ACCENT_COLOR' : 'SECONDARY_COLOR') : 'NODE_STROKE'} strokeWidth={i === 0 ? 3 : 1.5} />
        ))}
      </svg>
      <div style={{ position: 'absolute', top: gridStartY - 50, left: gridStartX - 80, width: 160, height: 36, overflow: 'hidden', opacity: titleOp, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 14, fontWeight: 800, color: 'PRIMARY_COLOR', fontFamily: 'sans-serif', letterSpacing: 1, textTransform: 'uppercase' }}>{originLabel}</span>
      </div>
      <div style={{ position: 'absolute', top: gridStartY + rows * nodeSpacingY + 20, left: 0, width: 1920, height: 70, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: countOp }}>
        <span style={{ fontSize: 60, fontWeight: 900, color: 'SECONDARY_COLOR', fontFamily: 'sans-serif', letterSpacing: -2, marginRight: 20 }}>{countValue}</span>
        <span style={{ fontSize: 24, fontWeight: 500, color: 'SUPPORT_COLOR', fontFamily: 'sans-serif', letterSpacing: 3, textTransform: 'uppercase', alignSelf: 'flex-end', paddingBottom: 8 }}>{countLabel}</span>
      </div>
    </div>
  )
}

export default AnimationComponent