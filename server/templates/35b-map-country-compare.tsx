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
        const cardOpacity = getOp(i)

        return (
          <div key={i} style={{ position: 'absolute', top: cardY, left: x, width: cardW, height: cardH, overflow: 'hidden', backgroundColor: 'CHART_BG', borderRadius: 8, border: '1px solid', borderColor: 'CHART_BORDER', opacity: cardOpacity, boxSizing: 'border-box' }}>

            {/* MapLibre map background */}
            <div
              ref={el => { mapRefs.current[i] = el }}
              style={{ position: 'absolute', top: 0, left: 0, width: cardW, height: 260, opacity: 0.7 }}
            />

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
