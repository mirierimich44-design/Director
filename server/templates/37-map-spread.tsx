import React, { useMemo } from 'react'
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion'

export const AnimationComponent = () => {
  const frame = useCurrentFrame()
  const { durationInFrames } = useVideoConfig()

  const durationSeconds = parseInt("DURATION_SECONDS") || 5
  const totalFrames = Math.min(durationSeconds * 30, 600)

  const rawDots = [
    { x: 1180, y: 280, dist: 0.0 },
    { x: 1100, y: 300, dist: 0.05 },
    { x: 1250, y: 260, dist: 0.08 },
    { x: 1050, y: 340, dist: 0.12 },
    { x: 1300, y: 320, dist: 0.14 },
    { x: 980,  y: 280, dist: 0.18 },
    { x: 1350, y: 280, dist: 0.20 },
    { x: 920,  y: 320, dist: 0.24 },
    { x: 860,  y: 260, dist: 0.28 },
    { x: 820,  y: 300, dist: 0.30 },
    { x: 780,  y: 340, dist: 0.34 },
    { x: 760,  y: 220, dist: 0.36 },
    { x: 1380, y: 480, dist: 0.38 },
    { x: 720,  y: 280, dist: 0.40 },
    { x: 680,  y: 420, dist: 0.44 },
    { x: 640,  y: 360, dist: 0.46 },
    { x: 600,  y: 300, dist: 0.50 },
    { x: 560,  y: 440, dist: 0.52 },
    { x: 520,  y: 380, dist: 0.56 },
    { x: 480,  y: 320, dist: 0.58 },
    { x: 440,  y: 260, dist: 0.62 },
    { x: 400,  y: 360, dist: 0.64 },
    { x: 360,  y: 300, dist: 0.68 },
    { x: 320,  y: 380, dist: 0.70 },
    { x: 280,  y: 320, dist: 0.74 },
    { x: 240,  y: 260, dist: 0.78 },
    { x: 200,  y: 340, dist: 0.82 },
    { x: 820,  y: 480, dist: 0.72 },
    { x: 760,  y: 520, dist: 0.76 },
    { x: 700,  y: 560, dist: 0.80 },
  ]

  const rawContinents = [
    "M 230,230 L 400,210 L 440,290 L 400,400 L 310,440 L 240,400 L 200,310 Z",
    "M 330,460 L 410,440 L 450,520 L 430,640 L 360,660 L 320,600 L 330,510 Z",
    "M 710,185 L 840,175 L 860,235 L 820,285 L 740,275 L 705,235 Z",
    "M 710,305 L 840,295 L 880,425 L 840,565 L 760,585 L 700,505 L 695,385 Z",
    "M 880,165 L 1180,155 L 1260,205 L 1280,325 L 1180,405 L 980,385 L 860,305 L 850,225 Z",
    "M 1160,510 L 1280,490 L 1320,570 L 1260,630 L 1160,610 L 1120,550 Z",
  ]

  const spreadDots = useMemo(() => rawDots.filter(d => d.x !== 0 || d.y !== 0), [])
  const continents = useMemo(() => rawContinents.filter(p => p !== '' && p !== 'Placeholder'), [])

  const phases = {
    titleStart: 0,
    titleEnd: totalFrames * 0.15,
    barEnd: totalFrames * 0.3,
    mapFadeEnd: totalFrames * 0.35,
    spreadEnd: totalFrames * 0.8,
    countEnd: totalFrames * 0.9,
    labelEnd: totalFrames
  }

  const titleOp = interpolate(frame, [phases.titleStart, phases.titleEnd], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const titleTy = interpolate(frame, [phases.titleStart, phases.titleEnd], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const barW = interpolate(frame, [phases.titleStart * 0.5, phases.barEnd], [0, 1920], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const mapOp = interpolate(frame, [phases.titleStart * 0.6, phases.mapFadeEnd], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const spreadProgress = interpolate(frame, [phases.mapFadeEnd * 1.2, phases.spreadEnd], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const countOp = interpolate(frame, [phases.spreadEnd * 0.9, phases.countEnd], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const labelOp = interpolate(frame, [phases.countEnd, phases.labelEnd], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  const title = "TITLE_TEXT"
  const originLabel = "ORIGIN_LABEL"
  const countValue = "COUNT_VALUE"
  const countLabel = "COUNT_LABEL"
  const mapLabel1 = "MAP_LABEL_1"
  const mapLabel2 = "MAP_LABEL_2"

  const mapboxToken = "MAPBOX_TOKEN"
  const mapboxUrl = mapboxToken
    ? `https://api.mapbox.com/styles/v1/mapbox/dark-v11/static/0,20,1.2/860x340@2x?access_token=${mapboxToken}`
    : null

  const mapX = 100
  const mapY = 150
  const mapW = 1720
  const mapH = 680
  const origin = { x: 1180, y: 280 }

  const visibleCount = Math.floor(spreadProgress * spreadDots.length)
  const countDisplay = Math.floor(spreadProgress * 30)

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden', backgroundColor: 'BACKGROUND_COLOR' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 5, overflow: 'hidden', backgroundColor: 'SECONDARY_COLOR', opacity: titleOp }} />
      <div style={{ position: 'absolute', top: 1074, left: 0, width: barW, height: 6, overflow: 'hidden', backgroundColor: 'SECONDARY_COLOR' }} />
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
          <line key={`h${i}`} x1={mapX} y1={mapY + r * mapH} x2={mapX + mapW} y2={mapY + r * mapH} stroke="GRID_LINE" strokeWidth={1} opacity={mapOp * 0.25} />
        ))}
        {!mapboxUrl && [0.2, 0.4, 0.6, 0.8].map((r, i) => (
          <line key={`v${i}`} x1={mapX + r * mapW} y1={mapY} x2={mapX + r * mapW} y2={mapY + mapH} stroke="GRID_LINE" strokeWidth={1} opacity={mapOp * 0.25} />
        ))}
        {!mapboxUrl && continents.map((path, i) => (
          <path key={i} d={path} fill="PANEL_LEFT_BG" stroke="LINE_STROKE" strokeWidth={1} opacity={mapOp * 0.5} />
        ))}
        <rect x={mapX} y={mapY} width={mapW} height={mapH} fill="none" stroke="CHART_BORDER" strokeWidth={2} rx={4} opacity={mapOp} />
        {spreadDots.slice(0, visibleCount).map((dot, i) => (
          <g key={i}>
            <circle cx={dot.x} cy={dot.y} r={i === 0 ? 18 : 10} fill={i === 0 ? 'PRIMARY_COLOR' : 'SECONDARY_COLOR'} opacity={i === 0 ? 1 : 0.85} />
            {i === 0 && <circle cx={dot.x} cy={dot.y} r={10} fill="BACKGROUND_COLOR" />}
          </g>
        ))}
      </svg>
      <div style={{ position: 'absolute', top: origin.y - 48, left: origin.x - 80, width: 160, height: 36, overflow: 'hidden', opacity: mapOp, backgroundColor: 'PRIMARY_COLOR', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'TEXT_ON_PRIMARY', fontFamily: 'sans-serif', letterSpacing: 1, textTransform: 'uppercase' }}>{originLabel}</span>
      </div>
      <div style={{ position: 'absolute', top: 880, left: 140, width: 500, height: 80, overflow: 'hidden', opacity: countOp, display: 'flex', alignItems: 'center' }}>
        <span style={{ fontSize: 64, fontWeight: 900, color: 'SECONDARY_COLOR', fontFamily: 'sans-serif', letterSpacing: -2, marginRight: 20 }}>{countDisplay}</span>
        <span style={{ fontSize: 22, fontWeight: 500, color: 'SUPPORT_COLOR', fontFamily: 'sans-serif', letterSpacing: 2, textTransform: 'uppercase', alignSelf: 'flex-end', paddingBottom: 10 }}>{countLabel}</span>
      </div>
      <div style={{ position: 'absolute', top: 880, left: 1400, width: 380, height: 40, overflow: 'hidden', opacity: labelOp, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
        <span style={{ fontSize: 18, fontWeight: 600, color: 'ACCENT_COLOR', fontFamily: 'sans-serif', letterSpacing: 3, textTransform: 'uppercase' }}>{mapLabel1}</span>
      </div>
      <div style={{ position: 'absolute', top: 928, left: 1400, width: 380, height: 36, overflow: 'hidden', opacity: labelOp, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
        <span style={{ fontSize: 16, fontWeight: 400, color: 'SUPPORT_COLOR', fontFamily: 'sans-serif' }}>{mapLabel2}</span>
      </div>
    </div>
  )
}

export default AnimationComponent