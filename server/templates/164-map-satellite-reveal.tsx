import React, { useEffect, useRef, useState } from 'react'
import { useCurrentFrame, interpolate, Easing, useDelayRender } from 'remotion'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

const CITY_COORDS: Record<string, { lng: number; lat: number; zoom: number }> = {
  LOS_ANGELES:   { lng: -118.2437, lat: 34.0522,  zoom: 11 },
  NEW_YORK:      { lng: -74.006,   lat: 40.7128,  zoom: 11 },
  LONDON:        { lng: -0.1276,   lat: 51.5074,  zoom: 11 },
  DUBAI:         { lng: 55.2708,   lat: 25.2048,  zoom: 11 },
  TOKYO:         { lng: 139.6917,  lat: 35.6895,  zoom: 11 },
  KYIV:          { lng: 30.5234,   lat: 50.4501,  zoom: 11 },
  MOSCOW:        { lng: 37.6173,   lat: 55.7558,  zoom: 11 },
  TEHRAN:        { lng: 51.3890,   lat: 35.6892,  zoom: 11 },
  GAZA:          { lng: 34.4667,   lat: 31.5000,  zoom: 12 },
  BEIJING:       { lng: 116.4074,  lat: 39.9042,  zoom: 11 },
  SINGAPORE:     { lng: 103.8198,  lat: 1.3521,   zoom: 11 },
  CAIRO:         { lng: 31.2357,   lat: 30.0444,  zoom: 11 },
}

export const AnimationComponent = () => {
  const frame = useCurrentFrame()
  const mapRef = useRef<HTMLDivElement>(null)
  const { delayRender, continueRender } = useDelayRender()
  const [mapHandle] = useState(() => delayRender('Loading map'))
  const [map, setMap] = useState<maplibregl.Map | null>(null)

  const locationKey  = "MAP_LABEL_1"
  const locationName = "MAP_LABEL_1"
  const title        = "TITLE_TEXT"
  const contextText  = "CONTEXT_TEXT"
  const stat1        = "STAT_VALUE_1"
  const stat2        = "STAT_VALUE_2"
  const label1       = "LABEL_1"
  const label2       = "LABEL_2"
  const classLevel   = "TAG_1"

  const city = CITY_COORDS[locationKey] || CITY_COORDS['NEW_YORK']

  // Zoom in from world to city level over frames 0-80
  const zoomVal = interpolate(frame, [0, 80], [1.5, city.zoom], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic),
  })

  useEffect(() => {
    if (!mapRef.current) return
    const m = new maplibregl.Map({
      container: mapRef.current,
      style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
      interactive: false,
      fadeDuration: 0,
      center: [city.lng, city.lat],
      zoom: 1.5,
    })
    m.on('load', () => { continueRender(mapHandle); setMap(m) })
    return () => m.remove()
  }, [mapHandle])

  useEffect(() => {
    if (!map) return
    const handle = delayRender('Camera zoom')
    map.jumpTo({ center: [city.lng, city.lat], zoom: zoomVal })
    map.once('idle', () => continueRender(handle))
  }, [frame, map])

  const uiOp       = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' })
  const gridOp     = interpolate(frame, [15, 45], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  // Crosshair appears and locks on at frame 90
  const crossOp    = interpolate(frame, [75, 100], [0, 1], { extrapolateRight: 'clamp' })
  const crossScale = interpolate(frame, [75, 100], [2, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) })
  const scanOp     = interpolate(frame, [100, 120], [1, 0], { extrapolateRight: 'clamp' })
  const infoOp     = interpolate(frame, [115, 135], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) })
  const barW       = interpolate(frame, [5, 35], [0, 1920], { extrapolateRight: 'clamp' })

  const CX = 960; const CY = 540; const CR = 120

  // Scanning rotation
  const scanAngle = interpolate(frame, [0, 120], [0, 360])

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden', backgroundColor: '#000', fontFamily: 'monospace' }}>
      <div ref={mapRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} />

      <svg width={1920} height={1080} style={{ position: 'absolute', top: 0, left: 0 }}>
        <defs>
          <filter id="sr-glow">
            <feGaussianBlur stdDeviation="3" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        {/* Grid overlay */}
        {Array.from({ length: 13 }).map((_, i) => (
          <line key={`v${i}`} x1={i * 160} y1={0} x2={i * 160} y2={1080}
            stroke="PRIMARY_COLOR" strokeWidth={0.5} opacity={gridOp * 0.15} />
        ))}
        {Array.from({ length: 7 }).map((_, i) => (
          <line key={`h${i}`} x1={0} y1={i * 180} x2={1920} y2={i * 180}
            stroke="PRIMARY_COLOR" strokeWidth={0.5} opacity={gridOp * 0.15} />
        ))}

        {/* Scanning crosshair — zooms in and locks */}
        <g transform={`translate(${CX}, ${CY}) scale(${crossScale})`} opacity={crossOp} filter="url(#sr-glow)">
          {/* Outer circle */}
          <circle cx={0} cy={0} r={CR} fill="none" stroke="PRIMARY_COLOR" strokeWidth={1.5} strokeDasharray="12 8" />
          {/* Rotating scan line */}
          <line x1={0} y1={0} x2={0} y2={-CR}
            stroke="PRIMARY_COLOR" strokeWidth={2} opacity={scanOp}
            transform={`rotate(${scanAngle})`} />
          {/* Cross hairs */}
          <line x1={-CR - 30} y1={0} x2={-CR + 20} y2={0} stroke="PRIMARY_COLOR" strokeWidth={2} />
          <line x1={CR - 20} y1={0} x2={CR + 30} y2={0} stroke="PRIMARY_COLOR" strokeWidth={2} />
          <line x1={0} y1={-CR - 30} x2={0} y2={-CR + 20} stroke="PRIMARY_COLOR" strokeWidth={2} />
          <line x1={0} y1={CR - 20} x2={0} y2={CR + 30} stroke="PRIMARY_COLOR" strokeWidth={2} />
          {/* Center dot */}
          <circle cx={0} cy={0} r={5} fill="PRIMARY_COLOR" />
          {/* Corner brackets */}
          {[[-CR, -CR], [CR, -CR], [-CR, CR], [CR, CR]].map(([bx, by], i) => (
            <g key={i} stroke="PRIMARY_COLOR" strokeWidth={2.5} strokeLinecap="round">
              <line x1={bx} y1={by} x2={bx + (bx > 0 ? -18 : 18)} y2={by} />
              <line x1={bx} y1={by} x2={bx} y2={by + (by > 0 ? -18 : 18)} />
            </g>
          ))}
        </g>
      </svg>

      {/* Info panel */}
      <div style={{ position: 'absolute', top: 200, right: 80, width: 360, opacity: infoOp, backgroundColor: 'rgba(0,10,0,0.92)', border: '1px solid PRIMARY_COLOR', borderRadius: 4, padding: '22px 26px', backdropFilter: 'blur(8px)' }}>
        <div style={{ fontSize: 11, color: 'PRIMARY_COLOR', letterSpacing: 5, marginBottom: 6 }}>TARGET ACQUIRED</div>
        <div style={{ fontSize: 28, fontWeight: 900, color: '#fff', marginBottom: 4 }}>{locationName}</div>
        <div style={{ fontSize: 12, color: 'PRIMARY_COLOR', letterSpacing: 3, marginBottom: 18, opacity: 0.7 }}>{classLevel}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 8 }}>
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 1 }}>{label1}</span>
            <span style={{ fontSize: 20, fontWeight: 700, color: 'PRIMARY_COLOR' }}>{stat1}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 1 }}>{label2}</span>
            <span style={{ fontSize: 20, fontWeight: 700, color: 'ACCENT_COLOR' }}>{stat2}</span>
          </div>
        </div>
        <div style={{ marginTop: 16, fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7 }}>{contextText}</div>
      </div>

      {/* HUD elements */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 4, backgroundColor: 'PRIMARY_COLOR', opacity: uiOp }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, width: barW, height: 4, backgroundColor: 'PRIMARY_COLOR' }} />
      <div style={{ position: 'absolute', top: 52, left: 0, width: 1920, textAlign: 'center', opacity: uiOp }}>
        <span style={{ fontSize: 20, fontWeight: 700, color: 'PRIMARY_COLOR', letterSpacing: 8, textTransform: 'uppercase' }}>{title}</span>
      </div>
      <div style={{ position: 'absolute', bottom: 22, left: 80, opacity: gridOp * 0.5, fontSize: 11, color: 'PRIMARY_COLOR', letterSpacing: 3 }}>
        {`LAT: ${city.lat.toFixed(4)} // LNG: ${city.lng.toFixed(4)} // ZOOM: ${zoomVal.toFixed(2)}`}
      </div>
    </div>
  )
}

export default AnimationComponent
