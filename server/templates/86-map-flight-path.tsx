import React, { useEffect, useRef, useState } from 'react'
import { useCurrentFrame, useVideoConfig, interpolate, Easing, useDelayRender } from 'remotion'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

const CITY_COORDS: Record<string, { lng: number; lat: number; label: string }> = {
  LOS_ANGELES:   { lng: -118.2437, lat: 34.0522,  label: 'Los Angeles' },
  NEW_YORK:      { lng: -74.006,   lat: 40.7128,  label: 'New York' },
  LONDON:        { lng: -0.1276,   lat: 51.5074,  label: 'London' },
  PARIS:         { lng: 2.3522,    lat: 48.8566,  label: 'Paris' },
  DUBAI:         { lng: 55.2708,   lat: 25.2048,  label: 'Dubai' },
  TOKYO:         { lng: 139.6917,  lat: 35.6895,  label: 'Tokyo' },
  BEIJING:       { lng: 116.4074,  lat: 39.9042,  label: 'Beijing' },
  MOSCOW:        { lng: 37.6173,   lat: 55.7558,  label: 'Moscow' },
  SYDNEY:        { lng: 151.2093,  lat: -33.8688, label: 'Sydney' },
  SAO_PAULO:     { lng: -46.6333,  lat: -23.5505, label: 'São Paulo' },
  SINGAPORE:     { lng: 103.8198,  lat: 1.3521,   label: 'Singapore' },
  WASHINGTON_DC: { lng: -77.0369,  lat: 38.9072,  label: 'Washington D.C.' },
}

export const AnimationComponent = () => {
  const frame = useCurrentFrame()
  const { durationInFrames } = useVideoConfig()
  const mapRef = useRef<HTMLDivElement>(null)
  const { delayRender, continueRender } = useDelayRender()
  const [mapHandle] = useState(() => delayRender('Loading map'))
  const [map, setMap] = useState<maplibregl.Map | null>(null)

  const originKey = "ARC_FROM"
  const destKey = "ARC_TO"
  const title = "TITLE_TEXT"
  const contextText = "CONTEXT_TEXT"
  const statValue = "STAT_VALUE_1"
  const statLabel = "LABEL_1"

  const origin = CITY_COORDS[originKey] || CITY_COORDS['LOS_ANGELES']
  const dest   = CITY_COORDS[destKey]   || CITY_COORDS['NEW_YORK']

  // Mid-point for initial camera (center of route)
  const midLng = (origin.lng + dest.lng) / 2
  const midLat = (origin.lat + dest.lat) / 2

  // Route progress: line draws from frame 40 → 160
  const routeProgress = interpolate(frame, [40, 160], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  })

  // Camera follows the line tip
  const camLng = origin.lng + (dest.lng - origin.lng) * routeProgress
  const camLat = origin.lat + (dest.lat - origin.lat) * routeProgress
  // Zoom: start at 3 (wide), arc up to 2.5 at mid, land at 3 at end
  const camZoom = interpolate(routeProgress, [0, 0.5, 1], [3, 2.5, 3])

  // UI animations
  const uiOp = interpolate(frame, [0, 25], [0, 1], { extrapolateRight: 'clamp' })
  const originCardOp = interpolate(frame, [10, 30], [0, 1], { extrapolateRight: 'clamp' })
  const destCardOp   = interpolate(frame, [150, 170], [0, 1], { extrapolateRight: 'clamp' })
  const statOp       = interpolate(frame, [155, 175], [0, 1], { extrapolateRight: 'clamp' })

  // Tip dot pulse
  const tipPulse = interpolate(frame % 20, [0, 10, 20], [4, 12, 4])
  const tipPulseOp = interpolate(frame % 20, [0, 10, 20], [0.8, 0.1, 0.8])

  // Init map
  useEffect(() => {
    if (!mapRef.current) return
    const m = new maplibregl.Map({
      container: mapRef.current,
      style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
      interactive: false,
      fadeDuration: 0,
      center: [midLng, midLat],
      zoom: 2.8,
    })
    m.on('load', () => {
      m.addSource('route', {
        type: 'geojson',
        data: { type: 'Feature', geometry: { type: 'LineString', coordinates: [] }, properties: {} },
      })
      m.addLayer({
        id: 'route-glow',
        type: 'line',
        source: 'route',
        paint: { 'line-color': 'ACCENT_COLOR', 'line-width': 8, 'line-opacity': 0.3 },
        layout: { 'line-cap': 'round' },
      })
      m.addLayer({
        id: 'route-line',
        type: 'line',
        source: 'route',
        paint: { 'line-color': 'PRIMARY_COLOR', 'line-width': 3 },
        layout: { 'line-cap': 'round' },
      })
      m.addSource('cities', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [
            { type: 'Feature', geometry: { type: 'Point', coordinates: [origin.lng, origin.lat] }, properties: {} },
            { type: 'Feature', geometry: { type: 'Point', coordinates: [dest.lng, dest.lat] }, properties: {} },
          ],
        },
      })
      m.addLayer({ id: 'city-dots', type: 'circle', source: 'cities', paint: { 'circle-radius': 8, 'circle-color': 'PRIMARY_COLOR', 'circle-stroke-width': 2, 'circle-stroke-color': '#ffffff' } })
      continueRender(mapHandle)
      setMap(m)
    })
    return () => m.remove()
  }, [mapHandle])

  // Per-frame: update camera + route
  useEffect(() => {
    if (!map) return
    const handle = delayRender('Camera frame')
    map.jumpTo({ center: [camLng, camLat], zoom: camZoom })
    const tipLng = origin.lng + (dest.lng - origin.lng) * routeProgress
    const tipLat = origin.lat + (dest.lat - origin.lat) * routeProgress
    const coords = routeProgress > 0 ? [[origin.lng, origin.lat], [tipLng, tipLat]] : []
    ;(map.getSource('route') as maplibregl.GeoJSONSource)?.setData({
      type: 'Feature', geometry: { type: 'LineString', coordinates: coords }, properties: {},
    })
    map.once('idle', () => continueRender(handle))
  }, [frame, map])

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden', backgroundColor: 'BACKGROUND_COLOR', fontFamily: 'sans-serif' }}>
      <div ref={mapRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' , filter: 'brightness(2.0) contrast(1.2) saturate(4) hue-rotate(30deg)'}} />

      {/* Vignette */}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.6) 100%)', pointerEvents: 'none' }} />

      {/* Title */}
      <div style={{ position: 'absolute', top: 60, left: 80, opacity: uiOp }}>
        <div style={{ width: 5, height: 36, backgroundColor: 'PRIMARY_COLOR', borderRadius: 3, display: 'inline-block', marginRight: 18, verticalAlign: 'middle' }} />
        <span style={{ fontSize: 36, fontWeight: 900, color: '#fff', letterSpacing: 2, textTransform: 'uppercase', verticalAlign: 'middle' }}>{title}</span>
      </div>

      {/* Origin card */}
      <div style={{ position: 'absolute', bottom: 120, left: 80, width: 260, opacity: originCardOp, backgroundColor: 'rgba(10,10,20,0.88)', border: '1px solid PRIMARY_COLOR', borderRadius: 8, padding: '18px 22px', backdropFilter: 'blur(8px)' }}>
        <div style={{ fontSize: 11, color: 'PRIMARY_COLOR', fontWeight: 700, letterSpacing: 4, textTransform: 'uppercase', marginBottom: 8 }}>ORIGIN</div>
        <div style={{ fontSize: 26, fontWeight: 900, color: '#fff' }}>{origin.label}</div>
      </div>

      {/* Destination card */}
      <div style={{ position: 'absolute', bottom: 120, right: 80, width: 260, opacity: destCardOp, backgroundColor: 'rgba(10,10,20,0.88)', border: '1px solid ACCENT_COLOR', borderRadius: 8, padding: '18px 22px', backdropFilter: 'blur(8px)', textAlign: 'right' }}>
        <div style={{ fontSize: 11, color: 'ACCENT_COLOR', fontWeight: 700, letterSpacing: 4, textTransform: 'uppercase', marginBottom: 8 }}>DESTINATION</div>
        <div style={{ fontSize: 26, fontWeight: 900, color: '#fff' }}>{dest.label}</div>
      </div>

      {/* Stat + context */}
      <div style={{ position: 'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)', opacity: statOp, textAlign: 'center' }}>
        <div style={{ fontSize: 42, fontWeight: 900, color: 'PRIMARY_COLOR' }}>{statValue}</div>
        <div style={{ fontSize: 16, color: 'rgba(255,255,255,0.6)', letterSpacing: 3, textTransform: 'uppercase', marginTop: 4 }}>{statLabel}</div>
      </div>

      {/* Context */}
      <div style={{ position: 'absolute', top: 60, right: 80, width: 380, opacity: statOp, textAlign: 'right' }}>
        <div style={{ fontSize: 18, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6 }}>{contextText}</div>
      </div>

      {/* Progress bar */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, width: `${routeProgress * 100}%`, height: 4, backgroundColor: 'PRIMARY_COLOR', transition: 'none' }} />
    </div>
  )
}

export default AnimationComponent
