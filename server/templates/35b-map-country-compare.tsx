import React, { useEffect, useRef } from 'react'
import { useCurrentFrame, interpolate, useDelayRender } from 'remotion'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

// MapLibre-compatible coordinates per country [lon, lat, zoom]
const COUNTRY_COORDS: Record<string, [number, number, number]> = {
  USA:        [-100, 38, 3],
  UK:         [-2, 54, 5],
  RUSSIA:     [55, 55, 2.5],
  CHINA:      [103, 36, 3],
  NORTHKOREA: [127.5, 40, 5],
  IRAN:       [53, 32, 4],
  UKRAINE:    [32, 49, 5],
  ISRAEL:     [35, 31.5, 7],
  KENYA:      [37.5, 0.5, 5],
  GERMANY:    [10, 51, 5],
}

// Simplified country shapes for SVG overlay
const SHAPES: Record<string, string> = {
  USA:        'M 40,60 L 80,50 L 130,48 L 190,50 L 230,55 L 250,75 L 248,110 L 230,140 L 190,155 L 140,160 L 90,155 L 50,138 L 30,110 L 28,80 Z',
  UK:         'M 80,50 L 110,45 L 130,55 L 135,90 L 125,130 L 105,155 L 85,150 L 70,120 L 65,85 L 72,62 Z',
  RUSSIA:     'M 20,60 L 80,50 L 160,48 L 230,50 L 260,65 L 258,100 L 240,130 L 200,145 L 140,148 L 80,145 L 35,130 L 18,100 Z',
  CHINA:      'M 50,55 L 110,45 L 170,48 L 220,60 L 240,90 L 235,130 L 205,155 L 155,162 L 100,158 L 58,140 L 38,105 L 42,75 Z',
  NORTHKOREA: 'M 80,70 L 120,60 L 155,68 L 168,95 L 160,130 L 135,148 L 100,148 L 72,130 L 62,100 L 68,82 Z',
  IRAN:       'M 55,62 L 110,50 L 165,55 L 200,78 L 205,115 L 185,148 L 145,162 L 100,158 L 60,138 L 42,105 L 45,80 Z',
  UKRAINE:    'M 40,75 L 100,62 L 170,65 L 220,80 L 228,110 L 210,135 L 165,145 L 105,142 L 52,128 L 32,102 Z',
  ISRAEL:     'M 95,65 L 120,60 L 140,72 L 145,100 L 132,130 L 112,140 L 92,132 L 82,105 L 85,80 Z',
  KENYA:      'M 70,60 L 120,55 L 160,68 L 170,100 L 158,138 L 128,155 L 90,152 L 62,132 L 52,98 L 58,75 Z',
  GERMANY:    'M 65,58 L 120,50 L 160,58 L 172,88 L 162,125 L 130,142 L 90,140 L 58,122 L 50,88 Z',
}

export const AnimationComponent = () => {
  const frame = useCurrentFrame()
  const { delayRender, continueRender } = useDelayRender()
  const [handle] = React.useState(() => delayRender('Loading maps'))
  const mapRefs = useRef<(HTMLDivElement | null)[]>([])
  const loadedCount = useRef(0)

  const titleOp = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const titleTy = interpolate(frame, [0, 20], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const barWAnim = interpolate(frame, [10, 40], [0, 1920], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  const title = "TITLE_TEXT"
  const contextText = "CONTEXT_TEXT"

  const rawItems = [
    { key: 'NORTHKOREA', name: "MAP_LABEL_1", stat: "STAT_VALUE_1", label: "LABEL_1" },
    { key: 'IRAN',       name: "MAP_LABEL_2", stat: "STAT_VALUE_2", label: "LABEL_2" },
    { key: 'RUSSIA',     name: "MAP_LABEL_3", stat: "STAT_VALUE_3", label: "LABEL_3" },
  ]

  const items = rawItems.filter(item =>
    item.name !== '' && item.name !== 'Placeholder' &&
    item.stat !== '' && item.stat !== 'Placeholder'
  )

  const count = items.length
  const cardW = 500
  const cardH = 580
  const gap = 60
  const totalW = count * cardW + (count - 1) * gap
  const startX = (1920 - totalW) / 2
  const cardY = 160

  const getOp = (i: number) => interpolate(frame, [15 + i * 13, 32 + i * 13], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const getDash = (i: number) => interpolate(frame, [18 + i * 14, 55 + i * 14], [1500, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const labelOp = interpolate(frame, [62, 76], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const statOp = interpolate(frame, [70, 84], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  useEffect(() => {
    const total = items.length
    if (total === 0) { continueRender(handle); return }
    loadedCount.current = 0
    const maps: maplibregl.Map[] = []

    items.forEach((item, i) => {
      const container = mapRefs.current[i]
      if (!container) return
      const coords = COUNTRY_COORDS[item.key] || COUNTRY_COORDS['NORTHKOREA']
      const map = new maplibregl.Map({
        container,
        style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
        interactive: false,
        fadeDuration: 0,
        center: [coords[0], coords[1]],
        zoom: coords[2],
      })
      map.on('load', () => {
        loadedCount.current++
        if (loadedCount.current >= total) continueRender(handle)
      })
      maps.push(map)
    })

    return () => maps.forEach(m => m.remove())
  }, [handle])

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden', backgroundColor: 'BACKGROUND_COLOR' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 5, overflow: 'hidden', backgroundColor: 'PRIMARY_COLOR', opacity: titleOp }} />
      <div style={{ position: 'absolute', top: 1074, left: 0, width: barWAnim, height: 6, overflow: 'hidden', backgroundColor: 'PRIMARY_COLOR' }} />

      <div style={{ position: 'absolute', top: 60, left: 0, width: 1920, height: 60, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: titleOp, transform: `translateY(${titleTy}px)` }}>
        <span style={{ fontSize: 26, fontWeight: 700, color: 'PRIMARY_COLOR', letterSpacing: 5, textTransform: 'uppercase', fontFamily: 'sans-serif' }}>{title}</span>
      </div>

      {items.map((item, i) => {
        const x = startX + i * (cardW + gap)
        const shape = SHAPES[item.key] || SHAPES['NORTHKOREA']
        const cardOpacity = getOp(i)
        const dashOffset = getDash(i)

        return (
          <div key={i} style={{ position: 'absolute', top: cardY, left: x, width: cardW, height: cardH, overflow: 'hidden', backgroundColor: 'CHART_BG', borderRadius: 8, border: '1px solid', borderColor: 'CHART_BORDER', opacity: cardOpacity, boxSizing: 'border-box' }}>

            {/* MapLibre per-country background */}
            <div
              ref={el => { mapRefs.current[i] = el }}
              style={{ position: 'absolute', top: 0, left: 0, width: cardW, height: 260, opacity: 0.7 }}
            />

            <svg viewBox="0 0 280 220" width={cardW} height={260} style={{ position: 'absolute', top: 0, left: 0 }}>
              <path d={shape} fill="PRIMARY_COLOR" opacity={0.3} />
              <path d={shape} fill="none" stroke="PRIMARY_COLOR" strokeWidth={3} strokeDasharray={1500} strokeDashoffset={dashOffset} strokeLinecap="round" strokeLinejoin="round" opacity={0.95} />
              <path d={shape} fill="none" stroke="PRIMARY_COLOR" strokeWidth={6} strokeDasharray={1500} strokeDashoffset={dashOffset} strokeLinecap="round" strokeLinejoin="round" opacity={0.15} />
            </svg>

            <div style={{ position: 'absolute', top: 268, left: 20, width: cardW - 40, height: 50, overflow: 'hidden', opacity: labelOp }}>
              <span style={{ fontSize: 28, fontWeight: 900, color: 'PRIMARY_COLOR', fontFamily: 'sans-serif', textTransform: 'uppercase', letterSpacing: 1 }}>{item.name}</span>
            </div>

            <div style={{ position: 'absolute', top: 326, left: 20, width: cardW - 40, height: 2, overflow: 'hidden', backgroundColor: 'PRIMARY_COLOR', opacity: labelOp * 0.6 }} />

            <div style={{ position: 'absolute', top: 342, left: 20, width: cardW - 40, height: 80, overflow: 'hidden', opacity: statOp }}>
              <span style={{ fontSize: 60, fontWeight: 900, color: 'PRIMARY_COLOR', fontFamily: 'sans-serif', lineHeight: 1 }}>{item.stat}</span>
            </div>

            <div style={{ position: 'absolute', top: 428, left: 20, width: cardW - 40, height: 36, overflow: 'hidden', opacity: statOp }}>
              <span style={{ fontSize: 18, fontWeight: 500, color: 'SUPPORT_COLOR', fontFamily: 'sans-serif', textTransform: 'uppercase', letterSpacing: 1 }}>{item.label}</span>
            </div>

            <div style={{ position: 'absolute', top: 0, left: 0, width: cardW, height: 5, overflow: 'hidden', backgroundColor: 'PRIMARY_COLOR' }} />
          </div>
        )
      })}

      <div style={{ position: 'absolute', top: cardY + cardH + 24, left: startX, width: totalW, height: 60, overflow: 'hidden', opacity: statOp, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 22, fontWeight: 400, color: 'SUPPORT_COLOR', fontFamily: 'sans-serif', textAlign: 'center' }}>{contextText}</span>
      </div>
    </div>
  )
}

export default AnimationComponent
