import React, { useEffect, useRef, useMemo, useState } from 'react'
import { useCurrentFrame, interpolate, useDelayRender } from 'remotion'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

// Simplified world region SVG paths (viewBox 1920x1080, world map projection approximation)
const REGIONS: { id: string; path: string; cx: number; cy: number }[] = [
  { id: 'NORTH_AMERICA', cx: 310,  cy: 360,
    path: 'M 90,180 L 200,160 L 330,155 L 420,175 L 460,230 L 450,310 L 420,390 L 360,450 L 290,470 L 220,450 L 160,400 L 120,340 L 85,270 Z' },
  { id: 'SOUTH_AMERICA', cx: 370,  cy: 650,
    path: 'M 260,490 L 340,475 L 410,490 L 450,550 L 455,630 L 430,720 L 390,790 L 340,810 L 285,780 L 250,710 L 235,630 L 245,555 Z' },
  { id: 'EUROPE',        cx: 870,  cy: 280,
    path: 'M 760,185 L 860,170 L 960,175 L 1020,210 L 1030,265 L 990,320 L 920,345 L 840,340 L 770,310 L 740,265 Z' },
  { id: 'AFRICA',        cx: 900,  cy: 580,
    path: 'M 780,360 L 880,340 L 980,355 L 1050,410 L 1060,490 L 1040,580 L 990,660 L 920,710 L 840,700 L 775,645 L 745,560 L 750,470 Z' },
  { id: 'MIDDLE_EAST',   cx: 1080, cy: 380,
    path: 'M 1000,310 L 1080,295 L 1155,315 L 1175,365 L 1160,420 L 1105,450 L 1040,445 L 990,415 L 978,365 Z' },
  { id: 'RUSSIA',        cx: 1200, cy: 220,
    path: 'M 990,155 L 1120,140 L 1280,145 L 1450,150 L 1560,165 L 1570,220 L 1540,270 L 1460,300 L 1330,305 L 1180,295 L 1050,280 L 970,250 L 960,200 Z' },
  { id: 'ASIA',          cx: 1340, cy: 400,
    path: 'M 1150,310 L 1280,295 L 1420,300 L 1540,330 L 1580,390 L 1560,460 L 1490,510 L 1380,530 L 1260,515 L 1160,480 L 1130,415 Z' },
  { id: 'OCEANIA',       cx: 1540, cy: 680,
    path: 'M 1430,610 L 1530,595 L 1630,610 L 1670,660 L 1650,720 L 1590,745 L 1510,735 L 1455,695 Z' },
]

// Value tiers → opacity intensity
const getTierColor = (tier: number) => {
  // Returns opacity 0.15 (low) → 0.8 (high)
  return 0.15 + tier * 0.65 / 4
}

export const AnimationComponent = () => {
  const frame = useCurrentFrame()
  const mapRef = useRef<HTMLDivElement>(null)
  const { delayRender, continueRender } = useDelayRender()
  const [handle] = useState(() => delayRender('Loading map'))

  const title = "TITLE_TEXT"
  const contextText = "CONTEXT_TEXT"
  const metricLabel = "LABEL_1"

  // Data — tier 0-4 (low→high) per region; LLM fills STAT_VALUE_1-8
  const rawData: Record<string, { value: string; tier: number }> = {
    NORTH_AMERICA: { value: "STAT_VALUE_1", tier: 3 },
    SOUTH_AMERICA: { value: "STAT_VALUE_2", tier: 2 },
    EUROPE:        { value: "STAT_VALUE_3", tier: 4 },
    AFRICA:        { value: "STAT_VALUE_4", tier: 1 },
    MIDDLE_EAST:   { value: "STAT_VALUE_5", tier: 2 },
    RUSSIA:        { value: "STAT_VALUE_6", tier: 3 },
    ASIA:          { value: "STAT_VALUE_7", tier: 4 },
    OCEANIA:       { value: "STAT_VALUE_8", tier: 1 },
  }

  useEffect(() => {
    if (!mapRef.current) return
    const m = new maplibregl.Map({
      container: mapRef.current,
      style: 'https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json',
      interactive: false,
      fadeDuration: 0,
      center: [15, 25],
      zoom: 1.5,
    })
    m.on('load', () => continueRender(handle))
    return () => m.remove()
  }, [handle])

  const uiOp  = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' })
  const barW  = interpolate(frame, [5, 35], [0, 1920], { extrapolateRight: 'clamp' })
  const mapOp = interpolate(frame, [10, 30], [0, 1], { extrapolateRight: 'clamp' })

  const getRegionOp = (i: number) =>
    interpolate(frame, [20 + i * 12, 40 + i * 12], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  const getLabelOp = (i: number) =>
    interpolate(frame, [50 + i * 10, 65 + i * 10], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  const legendOp = interpolate(frame, [120, 140], [0, 1], { extrapolateRight: 'clamp' })

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden', backgroundColor: 'BACKGROUND_COLOR', fontFamily: 'sans-serif' }}>
      <div ref={mapRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: mapOp * 0.35 , filter: 'brightness(2.2) contrast(1.15)'}} />

      <svg width={1920} height={1080} style={{ position: 'absolute', top: 0, left: 0 }}>
        <defs>
          <filter id="ch-glow">
            <feGaussianBlur stdDeviation="6" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>
        {REGIONS.map((region, i) => {
          const data = rawData[region.id]
          const tier = data?.tier ?? 1
          const fillOp = getTierColor(tier) * getRegionOp(i) * mapOp
          return (
            <g key={region.id}>
              {/* glow fill */}
              <path d={region.path} fill="PRIMARY_COLOR" opacity={fillOp * 0.4} filter="url(#ch-glow)" />
              {/* main fill */}
              <path d={region.path} fill="PRIMARY_COLOR" opacity={fillOp} />
              {/* border */}
              <path d={region.path} fill="none" stroke="PRIMARY_COLOR" strokeWidth={1.5} opacity={getRegionOp(i) * 0.6} />
            </g>
          )
        })}
      </svg>

      {/* Value labels */}
      {REGIONS.map((region, i) => {
        const data = rawData[region.id]
        const op = getLabelOp(i)
        if (!data || data.value === '' || data.value === 'Placeholder') return null
        return (
          <div key={region.id} style={{ position: 'absolute', top: region.cy - 18, left: region.cx - 50, width: 100, textAlign: 'center', opacity: op * mapOp, pointerEvents: 'none' }}>
            <div style={{ fontSize: 18, fontWeight: 900, color: '#fff', textShadow: '0 0 8px rgba(0,0,0,0.9)' }}>{data.value}</div>
          </div>
        )
      })}

      {/* Chrome */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 4, backgroundColor: 'PRIMARY_COLOR', opacity: uiOp }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, width: barW, height: 4, backgroundColor: 'PRIMARY_COLOR' }} />

      <div style={{ position: 'absolute', top: 52, left: 0, width: 1920, textAlign: 'center', opacity: uiOp }}>
        <span style={{ fontSize: 30, fontWeight: 900, color: 'PRIMARY_COLOR', letterSpacing: 5, textTransform: 'uppercase' }}>{title}</span>
      </div>

      {/* Legend */}
      <div style={{ position: 'absolute', bottom: 60, right: 80, opacity: legendOp, backgroundColor: 'rgba(8,8,18,0.88)', border: '1px solid CHART_BORDER', borderRadius: 8, padding: '16px 22px', minWidth: 200 }}>
        <div style={{ fontSize: 12, color: 'SUPPORT_COLOR', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 12 }}>{metricLabel}</div>
        {[4, 3, 2, 1, 0].map(tier => (
          <div key={tier} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <div style={{ width: 28, height: 14, borderRadius: 3, backgroundColor: 'PRIMARY_COLOR', opacity: getTierColor(tier) }} />
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>{['Very Low', 'Low', 'Medium', 'High', 'Very High'][tier]}</span>
          </div>
        ))}
      </div>

      <div style={{ position: 'absolute', bottom: 28, left: '50%', transform: 'translateX(-50%)', opacity: legendOp, textAlign: 'center', width: 900 }}>
        <span style={{ fontSize: 17, color: 'SUPPORT_COLOR' }}>{contextText}</span>
      </div>
    </div>
  )
}

export default AnimationComponent
