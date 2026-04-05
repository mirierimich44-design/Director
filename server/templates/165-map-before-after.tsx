import React, { useEffect, useRef, useState } from 'react'
import { useCurrentFrame, interpolate, Easing, useDelayRender } from 'remotion'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

const CITY_COORDS: Record<string, { lng: number; lat: number; zoom: number }> = {
  LOS_ANGELES:   { lng: -118.2437, lat: 34.0522,  zoom: 10 },
  NEW_YORK:      { lng: -74.006,   lat: 40.7128,  zoom: 10 },
  LONDON:        { lng: -0.1276,   lat: 51.5074,  zoom: 10 },
  DUBAI:         { lng: 55.2708,   lat: 25.2048,  zoom: 10 },
  TOKYO:         { lng: 139.6917,  lat: 35.6895,  zoom: 10 },
  KYIV:          { lng: 30.5234,   lat: 50.4501,  zoom: 10 },
  GAZA:          { lng: 34.4667,   lat: 31.5000,  zoom: 11 },
  ALEPPO:        { lng: 37.1612,   lat: 36.2021,  zoom: 11 },
  BEIRUT:        { lng: 35.5018,   lat: 33.8938,  zoom: 11 },
  MARIUPOL:      { lng: 37.5423,   lat: 47.0951,  zoom: 11 },
}

export const AnimationComponent = () => {
  const frame = useCurrentFrame()
  const mapBeforeRef = useRef<HTMLDivElement>(null)
  const mapAfterRef  = useRef<HTMLDivElement>(null)
  const { delayRender, continueRender } = useDelayRender()
  const [handle] = useState(() => delayRender('Loading maps'))
  const loadedRef = useRef(0)

  const locationKey = "MAP_LABEL_1"
  const title       = "TITLE_TEXT"
  const beforeLabel = "LABEL_1"
  const afterLabel  = "LABEL_2"
  const beforeStat  = "STAT_VALUE_1"
  const afterStat   = "STAT_VALUE_2"
  const contextText = "CONTEXT_TEXT"

  const city = CITY_COORDS[locationKey] || CITY_COORDS['KYIV']

  useEffect(() => {
    const maps: maplibregl.Map[] = []
    const tryDone = () => { loadedRef.current++; if (loadedRef.current >= 2) continueRender(handle) }

    if (mapBeforeRef.current) {
      const m1 = new maplibregl.Map({
        container: mapBeforeRef.current,
        style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
        interactive: false, fadeDuration: 0,
        center: [city.lng, city.lat], zoom: city.zoom,
      })
      m1.on('load', tryDone)
      maps.push(m1)
    }
    if (mapAfterRef.current) {
      const m2 = new maplibregl.Map({
        container: mapAfterRef.current,
        style: 'https://basemaps.cartocdn.com/gl/positron-nolabels-gl-style/style.json',
        interactive: false, fadeDuration: 0,
        center: [city.lng, city.lat], zoom: city.zoom,
      })
      m2.on('load', tryDone)
      maps.push(m2)
    }
    return () => maps.forEach(m => m.remove())
  }, [handle])

  const uiOp      = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' })
  const mapOp     = interpolate(frame, [10, 30], [0, 1], { extrapolateRight: 'clamp' })
  // Divider slides in from center
  const divOp     = interpolate(frame, [20, 40], [0, 1], { extrapolateRight: 'clamp' })
  const labelOp   = interpolate(frame, [35, 55], [0, 1], { extrapolateRight: 'clamp' })
  const statOp    = interpolate(frame, [55, 75], [0, 1], { extrapolateRight: 'clamp' })
  const barW      = interpolate(frame, [5, 35], [0, 1920], { extrapolateRight: 'clamp' })

  // Divider line pulses
  const divPulse  = interpolate(frame % 40, [0, 20, 40], [3, 6, 3])

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden', backgroundColor: 'BACKGROUND_COLOR', fontFamily: 'sans-serif' }}>

      {/* Before map — left half */}
      <div ref={mapBeforeRef} style={{ position: 'absolute', top: 0, left: 0, width: 960, height: 1080, opacity: mapOp }} />

      {/* After map — right half */}
      <div ref={mapAfterRef} style={{ position: 'absolute', top: 0, left: 960, width: 960, height: 1080, opacity: mapOp }} />

      {/* Center divider */}
      <div style={{ position: 'absolute', top: 0, left: 960 - divPulse / 2, width: divPulse, height: 1080, backgroundColor: 'PRIMARY_COLOR', opacity: divOp, boxShadow: `0 0 20px PRIMARY_COLOR` }} />

      {/* Before label */}
      <div style={{ position: 'absolute', top: 120, left: 80, opacity: labelOp, backgroundColor: 'rgba(8,8,18,0.88)', border: '1px solid PRIMARY_COLOR', borderRadius: 6, padding: '12px 22px', backdropFilter: 'blur(8px)' }}>
        <div style={{ fontSize: 13, color: 'PRIMARY_COLOR', letterSpacing: 4, textTransform: 'uppercase', fontWeight: 700, marginBottom: 4 }}>BEFORE</div>
        <div style={{ fontSize: 22, fontWeight: 900, color: '#fff' }}>{beforeLabel}</div>
      </div>

      {/* After label */}
      <div style={{ position: 'absolute', top: 120, right: 80, opacity: labelOp, backgroundColor: 'rgba(8,8,18,0.88)', border: '1px solid SECONDARY_COLOR', borderRadius: 6, padding: '12px 22px', backdropFilter: 'blur(8px)', textAlign: 'right' }}>
        <div style={{ fontSize: 13, color: 'SECONDARY_COLOR', letterSpacing: 4, textTransform: 'uppercase', fontWeight: 700, marginBottom: 4 }}>AFTER</div>
        <div style={{ fontSize: 22, fontWeight: 900, color: '#fff' }}>{afterLabel}</div>
      </div>

      {/* Before stat */}
      <div style={{ position: 'absolute', bottom: 120, left: 80, opacity: statOp, backgroundColor: 'rgba(8,8,18,0.88)', border: '1px solid PRIMARY_COLOR', borderRadius: 8, padding: '18px 24px', backdropFilter: 'blur(8px)', minWidth: 200 }}>
        <div style={{ fontSize: 44, fontWeight: 900, color: 'PRIMARY_COLOR', lineHeight: 1 }}>{beforeStat}</div>
        <div style={{ fontSize: 13, color: 'SUPPORT_COLOR', textTransform: 'uppercase', letterSpacing: 1, marginTop: 6 }}>{beforeLabel}</div>
      </div>

      {/* After stat */}
      <div style={{ position: 'absolute', bottom: 120, right: 80, opacity: statOp, backgroundColor: 'rgba(8,8,18,0.88)', border: '1px solid SECONDARY_COLOR', borderRadius: 8, padding: '18px 24px', backdropFilter: 'blur(8px)', minWidth: 200, textAlign: 'right' }}>
        <div style={{ fontSize: 44, fontWeight: 900, color: 'SECONDARY_COLOR', lineHeight: 1 }}>{afterStat}</div>
        <div style={{ fontSize: 13, color: 'SUPPORT_COLOR', textTransform: 'uppercase', letterSpacing: 1, marginTop: 6 }}>{afterLabel}</div>
      </div>

      {/* Chrome */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 4, backgroundColor: 'PRIMARY_COLOR', opacity: uiOp }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, width: barW, height: 4, backgroundColor: 'PRIMARY_COLOR' }} />
      <div style={{ position: 'absolute', top: 52, left: 0, width: 1920, textAlign: 'center', opacity: uiOp }}>
        <span style={{ fontSize: 28, fontWeight: 900, color: '#fff', letterSpacing: 5, textTransform: 'uppercase' }}>{title}</span>
      </div>
      <div style={{ position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)', opacity: statOp, textAlign: 'center', width: 800 }}>
        <span style={{ fontSize: 17, color: 'SUPPORT_COLOR' }}>{contextText}</span>
      </div>
    </div>
  )
}

export default AnimationComponent
