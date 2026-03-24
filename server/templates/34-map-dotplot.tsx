import React, { useMemo } from 'react'
import { useCurrentFrame, interpolate } from 'remotion'

export const AnimationComponent = () => {
  const frame = useCurrentFrame()

  const title = "TITLE_TEXT"
  const rawMapLabels = ["MAP_LABEL_1", "MAP_LABEL_2", "MAP_LABEL_3", "MAP_LABEL_4"]
  const rawDotPositions = [
    { nx: 0.18, ny: 0.35, size: 22 },
    { nx: 0.48, ny: 0.25, size: 18 },
    { nx: 0.72, ny: 0.32, size: 26 },
    { nx: 0.50, ny: 0.55, size: 16 },
  ]

  const activeItems = useMemo(() => {
    return rawMapLabels
      .map((label, index) => ({ label, pos: rawDotPositions[index] }))
      .filter(item => item.label !== '' && item.label !== 'Placeholder')
  }, [])

  const count = activeItems.length

  const titleOp = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const titleTy = interpolate(frame, [0, 20], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const barW = interpolate(frame, [10, 40], [0, 1920], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const mapOp = interpolate(frame, [12, 28], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const labelOp = interpolate(frame, [58, 72], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  const dotOpacities = activeItems.map((_, i) => interpolate(frame, [25 + i * 7, 38 + i * 7], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }))
  const dotScales = activeItems.map((_, i) => interpolate(frame, [25 + i * 7, 38 + i * 7], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }))

  const mapboxToken = "MAPBOX_TOKEN"
  const mapboxUrl = mapboxToken
    ? `https://api.mapbox.com/styles/v1/mapbox/dark-v11/static/0,20,1.2/820x350@2x?access_token=${mapboxToken}`
    : null

  const mapX = 140
  const mapY = 160
  const mapW = 1640
  const mapH = 700

  const dots = activeItems.map(d => ({
    x: mapX + d.pos.nx * mapW,
    y: mapY + d.pos.ny * mapH,
    size: d.pos.size,
  }))

  const continents = [
    "M 280,220 L 420,200 L 460,280 L 420,380 L 340,420 L 280,380 L 240,300 Z",
    "M 360,440 L 420,420 L 450,500 L 430,620 L 370,640 L 330,580 L 340,490 Z",
    "M 740,180 L 860,170 L 880,230 L 840,280 L 760,270 L 720,230 Z",
    "M 740,300 L 860,290 L 900,420 L 860,560 L 780,580 L 720,500 L 710,380 Z",
    "M 900,160 L 1200,150 L 1280,200 L 1300,320 L 1200,400 L 1000,380 L 880,300 L 870,220 Z",
    "M 1180,500 L 1300,480 L 1340,560 L 1280,620 L 1180,600 L 1140,540 Z",
  ]

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
          <line key={`h${i}`} x1={mapX} y1={mapY + r * mapH} x2={mapX + mapW} y2={mapY + r * mapH} stroke="GRID_LINE" strokeWidth={1} opacity={mapOp * 0.4} />
        ))}
        {!mapboxUrl && [0.2, 0.4, 0.6, 0.8].map((r, i) => (
          <line key={`v${i}`} x1={mapX + r * mapW} y1={mapY} x2={mapX + r * mapW} y2={mapY + mapH} stroke="GRID_LINE" strokeWidth={1} opacity={mapOp * 0.4} />
        ))}
        {!mapboxUrl && continents.map((path, i) => (
          <path key={i} d={path} fill="PANEL_LEFT_BG" stroke="LINE_STROKE" strokeWidth={1} opacity={mapOp * 0.6} />
        ))}
        <rect x={mapX} y={mapY} width={mapW} height={mapH} fill="none" stroke="CHART_BORDER" strokeWidth={2} rx={4} opacity={mapOp} />
        {dots.map((dot, i) => (
          <g key={i} opacity={dotOpacities[i]}>
            <circle cx={dot.x} cy={dot.y} r={dot.size + 12} fill="none" stroke="SECONDARY_COLOR" strokeWidth={2} opacity={0.4} transform={`scale(${dotScales[i]})`} style={{ transformOrigin: `${dot.x}px ${dot.y}px` }} />
            <circle cx={dot.x} cy={dot.y} r={dot.size} fill="SECONDARY_COLOR" opacity={0.9} transform={`scale(${dotScales[i]})`} style={{ transformOrigin: `${dot.x}px ${dot.y}px` }} />
            <circle cx={dot.x} cy={dot.y} r={dot.size * 0.45} fill="BACKGROUND_COLOR" opacity={0.8} />
          </g>
        ))}
      </svg>
      {dots.map((dot, i) => (
        <div key={i} style={{ position: 'absolute', top: dot.y + activeItems[i].pos.size + 16, left: dot.x - 100, width: 200, height: 36, overflow: 'hidden', opacity: labelOp, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: 'PRIMARY_COLOR', fontFamily: 'sans-serif', textAlign: 'center', letterSpacing: 1, textTransform: 'uppercase' }}>{activeItems[i].label}</span>
        </div>
      ))}
    </div>
  )
}

export default AnimationComponent