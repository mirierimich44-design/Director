import React, { useMemo } from 'react'
import { useCurrentFrame, interpolate } from 'remotion'

export const AnimationComponent = () => {
  const frame = useCurrentFrame()

  const titleOp = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const titleTy = interpolate(frame, [0, 20], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const barW = interpolate(frame, [10, 40], [0, 1920], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const mapOp = interpolate(frame, [12, 28], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const arcProgress = interpolate(frame, [28, 72], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const dotOp = interpolate(frame, [68, 82], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const labelOp = interpolate(frame, [75, 90], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  const title = "TITLE_TEXT"
  const arcFrom = "ARC_FROM"
  const rawTargetLabels = ["MAP_LABEL_1", "MAP_LABEL_2", "MAP_LABEL_3", "MAP_LABEL_4"]
  const rawTargets = [
    { x: 280,  y: 310 },
    { x: 790,  y: 240 },
    { x: 820,  y: 440 },
    { x: 1380, y: 480 },
  ]

  const filteredData = useMemo(() => {
    return rawTargetLabels
      .map((label, index) => ({ label, target: rawTargets[index] }))
      .filter(item => item.label !== '' && item.label !== 'Placeholder')
  }, [])

  const mapboxToken = "MAPBOX_TOKEN"
  const mapboxUrl = mapboxToken
    ? `https://api.mapbox.com/styles/v1/mapbox/dark-v11/static/0,20,1.2/860x360@2x?access_token=${mapboxToken}`
    : null

  const mapX = 100
  const mapY = 150
  const mapW = 1720
  const mapH = 720

  const source = { x: 1180, y: 290 }

  const continents = [
    "M 230,230 L 400,210 L 440,290 L 400,400 L 310,440 L 240,400 L 200,310 Z",
    "M 330,460 L 410,440 L 450,520 L 430,640 L 360,660 L 320,600 L 330,510 Z",
    "M 710,185 L 840,175 L 860,235 L 820,285 L 740,275 L 705,235 Z",
    "M 710,305 L 840,295 L 880,425 L 840,565 L 760,585 L 700,505 L 695,385 Z",
    "M 880,165 L 1180,155 L 1260,205 L 1280,325 L 1180,405 L 980,385 L 860,305 L 850,225 Z",
    "M 1160,510 L 1280,490 L 1320,570 L 1260,630 L 1160,610 L 1120,550 Z",
  ]

  const getArcPath = (from: {x: number, y: number}, to: {x: number, y: number}, progress: number) => {
    const cpx = (from.x + to.x) / 2
    const cpy = Math.min(from.y, to.y) - Math.abs(to.x - from.x) * 0.25
    const t = progress
    const bx = (1-t)*(1-t)*from.x + 2*(1-t)*t*cpx + t*t*to.x
    const by = (1-t)*(1-t)*from.y + 2*(1-t)*t*cpy + t*t*to.y
    return `M ${from.x} ${from.y} Q ${cpx} ${cpy} ${bx} ${by}`
  }

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden', backgroundColor: 'BACKGROUND_COLOR' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 5, overflow: 'hidden', backgroundColor: 'PRIMARY_COLOR', opacity: titleOp }} />
      <div style={{ position: 'absolute', top: 1074, left: 0, width: barW, height: 6, overflow: 'hidden', backgroundColor: 'PRIMARY_COLOR' }} />
      <div style={{ position: 'absolute', top: 50, left: 0, width: 1920, height: 60, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: titleOp, transform: `translateY(${titleTy}px)` }}>
        <span style={{ fontSize: 28, fontWeight: 700, color: 'PRIMARY_COLOR', letterSpacing: 5, textTransform: 'uppercase', fontFamily: 'sans-serif' }}>{title}</span>
      </div>
      {mapboxUrl ? (
        <img
          src={mapboxUrl}
          style={{ position: 'absolute', top: mapY, left: mapX, width: mapW, height: mapH, opacity: mapOp, borderRadius: 4, objectFit: 'cover' }}
        />
      ) : null}
      <svg width={1920} height={1080} style={{ position: 'absolute', top: 0, left: 0 }}>
        {!mapboxUrl && <rect x={mapX} y={mapY} width={mapW} height={mapH} fill="CHART_BG" rx={4} opacity={mapOp} />}
        {!mapboxUrl && [0.25, 0.5, 0.75].map((r, i) => (
          <line key={`h${i}`} x1={mapX} y1={mapY + r * mapH} x2={mapX + mapW} y2={mapY + r * mapH} stroke="GRID_LINE" strokeWidth={1} opacity={mapOp * 0.3} />
        ))}
        {!mapboxUrl && [0.2, 0.4, 0.6, 0.8].map((r, i) => (
          <line key={`v${i}`} x1={mapX + r * mapW} y1={mapY} x2={mapX + r * mapW} y2={mapY + mapH} stroke="GRID_LINE" strokeWidth={1} opacity={mapOp * 0.3} />
        ))}
        {!mapboxUrl && continents.map((path, i) => (
          <path key={i} d={path} fill="PANEL_LEFT_BG" stroke="LINE_STROKE" strokeWidth={1} opacity={mapOp * 0.5} />
        ))}
        <rect x={mapX} y={mapY} width={mapW} height={mapH} fill="none" stroke="CHART_BORDER" strokeWidth={2} rx={4} opacity={mapOp} />
        {filteredData.map((item, i) => (
          <path key={i} d={getArcPath(source, item.target, arcProgress)} fill="none" stroke="SECONDARY_COLOR" strokeWidth={2.5} strokeDasharray="8 4" opacity={arcProgress > 0 ? 0.8 : 0} />
        ))}
        <circle cx={source.x} cy={source.y} r={18} fill="PRIMARY_COLOR" stroke="ACCENT_COLOR" strokeWidth={3} opacity={mapOp} />
        <circle cx={source.x} cy={source.y} r={10} fill="BACKGROUND_COLOR" opacity={mapOp} />
        {filteredData.map((item, i) => (
          <g key={i} opacity={dotOp}>
            <circle cx={item.target.x} cy={item.target.y} r={22} fill="none" stroke="SECONDARY_COLOR" strokeWidth={2} opacity={0.4} />
            <circle cx={item.target.x} cy={item.target.y} r={14} fill="SECONDARY_COLOR" />
            <circle cx={item.target.x} cy={item.target.y} r={6} fill="BACKGROUND_COLOR" />
          </g>
        ))}
      </svg>
      <div style={{ position: 'absolute', top: source.y - 50, left: source.x - 80, width: 160, height: 36, overflow: 'hidden', opacity: mapOp, backgroundColor: 'PRIMARY_COLOR', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: 'TEXT_ON_PRIMARY', fontFamily: 'sans-serif', letterSpacing: 1, textTransform: 'uppercase' }}>{arcFrom}</span>
      </div>
      {filteredData.map((item, i) => (
        <div key={i} style={{ position: 'absolute', top: item.target.y + 28, left: item.target.x - 90, width: 180, height: 36, overflow: 'hidden', opacity: labelOp, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 17, fontWeight: 600, color: 'PRIMARY_COLOR', fontFamily: 'sans-serif', textAlign: 'center', textTransform: 'uppercase', letterSpacing: 1 }}>{item.label}</span>
        </div>
      ))}
    </div>
  )
}

export default AnimationComponent