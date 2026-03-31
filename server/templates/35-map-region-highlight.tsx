import React, { useMemo } from 'react'
import { useCurrentFrame, interpolate } from 'remotion'

export const AnimationComponent = () => {
  const frame = useCurrentFrame()

  const title = "TITLE_TEXT"
  const arcTo = "ARC_TO"
  const mapLabel1 = "MAP_LABEL_1"
  const statValue = "STAT_VALUE_1"
  const statLabel = "LABEL_1"

  const rawContinents = [
    "M 230,230 L 400,210 L 440,290 L 400,400 L 310,440 L 240,400 L 200,310 Z",
    "M 330,460 L 410,440 L 450,520 L 430,640 L 360,660 L 320,600 L 330,510 Z",
    "M 710,185 L 840,175 L 860,235 L 820,285 L 740,275 L 705,235 Z",
    "M 710,305 L 840,295 L 880,425 L 840,565 L 760,585 L 700,505 L 695,385 Z",
    "M 880,165 L 1180,155 L 1260,205 L 1280,325 L 1180,405 L 980,385 L 860,305 L 850,225 Z",
    "M 1160,510 L 1280,490 L 1320,570 L 1260,630 L 1160,610 L 1120,550 Z",
  ]

  const continents = useMemo(() => {
    return rawContinents.filter(item => item !== '' && item !== 'Placeholder')
  }, [])

  const titleOp = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const titleTy = interpolate(frame, [0, 20], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const barW = interpolate(frame, [10, 40], [0, 1920], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const mapOp = interpolate(frame, [12, 28], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const regionOp = interpolate(frame, [28, 48], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const regionScale = interpolate(frame, [28, 48], [0.82, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const pulseOp = interpolate(frame % 60, [0, 30, 60], [0.8, 0.2, 0.8], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const labelOp = interpolate(frame, [45, 60], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const labelTy = interpolate(frame, [45, 60], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const statOp = interpolate(frame, [55, 70], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  const stadiaKey = "STADIA_API_KEY"
  const stadiaUrl = stadiaKey
    ? `https://tiles.stadiamaps.com/static/alidade_smooth_dark/0,20,1.2/860x360@2x.png?api_key=${stadiaKey}`
    : null

  const mapX = 100
  const mapY = 150
  const mapW = 1720
  const mapH = 720
  const regionX = 1080
  const regionY = 200
  const regionW = 480
  const regionH = 320

  const corners = [[regionX, regionY], [regionX + regionW, regionY], [regionX, regionY + regionH], [regionX + regionW, regionY + regionH]]

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden', backgroundColor: 'BACKGROUND_COLOR' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 5, overflow: 'hidden', backgroundColor: 'PRIMARY_COLOR', opacity: titleOp }} />
      <div style={{ position: 'absolute', top: 1074, left: 0, width: barW, height: 6, overflow: 'hidden', backgroundColor: 'PRIMARY_COLOR' }} />
      <div style={{ position: 'absolute', top: 50, left: 0, width: 1920, height: 60, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: titleOp, transform: `translateY(${titleTy}px)` }}>
        <span style={{ fontSize: 28, fontWeight: 700, color: 'PRIMARY_COLOR', letterSpacing: 5, textTransform: 'uppercase', fontFamily: 'sans-serif' }}>{title}</span>
      </div>
      {stadiaUrl ? (
        <img
          src={stadiaUrl}
          style={{ position: 'absolute', top: mapY, left: mapX, width: mapW, height: mapH, opacity: mapOp, borderRadius: 4, objectFit: 'cover' }}
        />
      ) : null}
      <svg width={1920} height={1080} style={{ position: 'absolute', top: 0, left: 0 }}>
        {!stadiaUrl && <rect x={mapX} y={mapY} width={mapW} height={mapH} fill="CHART_BG" rx={4} opacity={mapOp} />}
        {!stadiaUrl && [0.25, 0.5, 0.75].map((r, i) => (
          <line key={`h${i}`} x1={mapX} y1={mapY + r * mapH} x2={mapX + mapW} y2={mapY + r * mapH} stroke="GRID_LINE" strokeWidth={1} opacity={mapOp * 0.3} />
        ))}
        {!stadiaUrl && [0.2, 0.4, 0.6, 0.8].map((r, i) => (
          <line key={`v${i}`} x1={mapX + r * mapW} y1={mapY} x2={mapX + r * mapW} y2={mapY + mapH} stroke="GRID_LINE" strokeWidth={1} opacity={mapOp * 0.3} />
        ))}
        {!stadiaUrl && continents.map((path, i) => (
          <path key={i} d={path} fill="PANEL_LEFT_BG" stroke="LINE_STROKE" strokeWidth={1} opacity={mapOp * 0.5} />
        ))}
        <rect x={regionX} y={regionY} width={regionW} height={regionH} fill="SECONDARY_COLOR" rx={4} opacity={regionOp * 0.25} transform={`scale(${regionScale})`} style={{ transformOrigin: `${regionX + regionW / 2}px ${regionY + regionH / 2}px` }} />
        <rect x={regionX} y={regionY} width={regionW} height={regionH} fill="none" stroke="SECONDARY_COLOR" strokeWidth={3} rx={4} opacity={regionOp} transform={`scale(${regionScale})`} style={{ transformOrigin: `${regionX + regionW / 2}px ${regionY + regionH / 2}px` }} />
        {corners.map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r={8} fill="SECONDARY_COLOR" opacity={pulseOp * regionOp} />
        ))}
        <rect x={mapX} y={mapY} width={mapW} height={mapH} fill="none" stroke="CHART_BORDER" strokeWidth={2} rx={4} opacity={mapOp} />
      </svg>
      <div style={{ position: 'absolute', top: regionY - 50, left: regionX, width: regionW, height: 42, overflow: 'hidden', opacity: labelOp, transform: `translateY(${labelTy}px)`, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'SECONDARY_COLOR', borderRadius: 4 }}>
        <span style={{ fontSize: 20, fontWeight: 700, color: 'TEXT_ON_SECONDARY', fontFamily: 'sans-serif', letterSpacing: 2, textTransform: 'uppercase' }}>{arcTo}</span>
      </div>
      <div style={{ position: 'absolute', top: 860, left: 140, width: 440, height: 130, overflow: 'hidden', opacity: statOp, backgroundColor: 'PANEL_LEFT_BG', borderRadius: 6, boxSizing: 'border-box', border: '1px solid', borderColor: 'CHART_BORDER' }}>
        <div style={{ position: 'absolute', top: 20, left: 24, width: 392, height: 60, overflow: 'hidden' }}>
          <span style={{ fontSize: 52, fontWeight: 900, color: 'SECONDARY_COLOR', fontFamily: 'sans-serif', lineHeight: 1 }}>{statValue}</span>
        </div>
        <div style={{ position: 'absolute', top: 82, left: 24, width: 392, height: 32, overflow: 'hidden' }}>
          <span style={{ fontSize: 18, fontWeight: 500, color: 'SUPPORT_COLOR', fontFamily: 'sans-serif', textTransform: 'uppercase', letterSpacing: 1 }}>{statLabel}</span>
        </div>
      </div>
      <div style={{ position: 'absolute', top: 880, left: 1400, width: 380, height: 50, overflow: 'hidden', opacity: statOp, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
        <span style={{ fontSize: 20, fontWeight: 600, color: 'ACCENT_COLOR', fontFamily: 'sans-serif', letterSpacing: 3, textTransform: 'uppercase' }}>{mapLabel1}</span>
      </div>
    </div>
  )
}

export default AnimationComponent