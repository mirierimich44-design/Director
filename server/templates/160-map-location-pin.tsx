import React, { useEffect, useRef, useState } from 'react'
import { useCurrentFrame, interpolate, Easing, useDelayRender } from 'remotion'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

const CITY_COORDS: Record<string, { lng: number; lat: number }> = {
  LOS_ANGELES:   { lng: -118.2437, lat: 34.0522  },
  NEW_YORK:      { lng: -74.006,   lat: 40.7128  },
  LONDON:        { lng: -0.1276,   lat: 51.5074  },
  PARIS:         { lng: 2.3522,    lat: 48.8566  },
  DUBAI:         { lng: 55.2708,   lat: 25.2048  },
  TOKYO:         { lng: 139.6917,  lat: 35.6895  },
  BEIJING:       { lng: 116.4074,  lat: 39.9042  },
  MOSCOW:        { lng: 37.6173,   lat: 55.7558  },
  SYDNEY:        { lng: 151.2093,  lat: -33.8688 },
  WASHINGTON_DC: { lng: -77.0369,  lat: 38.9072  },
  KYIV:          { lng: 30.5234,   lat: 50.4501  },
  TEHRAN:        { lng: 51.3890,   lat: 35.6892  },
  GAZA:          { lng: 34.4667,   lat: 31.5000  },
  SINGAPORE:     { lng: 103.8198,  lat: 1.3521   },
  CAIRO:         { lng: 31.2357,   lat: 30.0444  },
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

  const coords = CITY_COORDS[locationKey] || CITY_COORDS['NEW_YORK']

  // Camera: start at world zoom 1.5, fly in to city zoom 10 by frame 120
  const zoomVal = interpolate(frame, [0, 100], [1.5, 10], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic),
  })

  useEffect(() => {
    if (!mapRef.current) return
    const m = new maplibregl.Map({
      container: mapRef.current,
      style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
      interactive: false,
      fadeDuration: 0,
      center: [coords.lng, coords.lat],
      zoom: 1.5,
    })
    m.on('load', () => {
      continueRender(mapHandle)
      setMap(m)
    })
    return () => m.remove()
  }, [mapHandle])

  // Per-frame camera zoom
  useEffect(() => {
    if (!map) return
    const handle = delayRender('Camera zoom')
    map.jumpTo({ center: [coords.lng, coords.lat], zoom: zoomVal })
    map.once('idle', () => continueRender(handle))
  }, [frame, map])

  const uiOp    = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' })
  // Pin drops from above at frame 110
  const pinY    = interpolate(frame, [110, 130], [-60, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.bounce) })
  const pinOp   = interpolate(frame, [108, 115], [0, 1], { extrapolateRight: 'clamp' })
  const ringR   = interpolate(frame % 40, [0, 40], [8, 40])
  const ringOp  = interpolate(frame % 40, [0, 20, 40], [0.7, 0.15, 0])
  const cardOp  = interpolate(frame, [130, 150], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) })
  const cardX   = interpolate(frame, [130, 150], [60, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) })

  const PIN_X = 960
  const PIN_Y = 540

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden', backgroundColor: 'BACKGROUND_COLOR', fontFamily: 'sans-serif' }}>
      <div ref={mapRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' , filter: 'brightness(2.2) contrast(1.15)'}} />
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.5) 100%)', pointerEvents: 'none' }} />

      {/* Pin + rings overlay */}
      <svg width={1920} height={1080} style={{ position: 'absolute', top: 0, left: 0 }}>
        <defs>
          <filter id="pin-glow">
            <feGaussianBlur stdDeviation="6" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>
        {/* Pulse rings */}
        {pinOp > 0.1 && (
          <>
            <circle cx={PIN_X} cy={PIN_Y} r={ringR} fill="none" stroke="PRIMARY_COLOR" strokeWidth={2} opacity={ringOp * pinOp} />
            <circle cx={PIN_X} cy={PIN_Y} r={ringR * 0.55} fill="none" stroke="ACCENT_COLOR" strokeWidth={1.5} opacity={ringOp * 0.6 * pinOp} />
          </>
        )}
        {/* Pin body */}
        <g transform={`translate(${PIN_X}, ${PIN_Y + pinY})`} opacity={pinOp}>
          <circle cx={0} cy={0} r={20} fill="PRIMARY_COLOR" filter="url(#pin-glow)" />
          <circle cx={0} cy={0} r={8} fill="#fff" />
          {/* pin needle */}
          <line x1={0} y1={18} x2={0} y2={36} stroke="PRIMARY_COLOR" strokeWidth={4} strokeLinecap="round" />
        </g>
      </svg>

      {/* Info card */}
      <div style={{ position: 'absolute', top: 280, right: 100, width: 380, opacity: cardOp, transform: `translateX(${cardX}px)`, backgroundColor: 'rgba(8,8,18,0.92)', border: '1px solid PRIMARY_COLOR', borderRadius: 10, padding: '24px 28px', backdropFilter: 'blur(10px)' }}>
        <div style={{ fontSize: 11, color: 'PRIMARY_COLOR', fontWeight: 700, letterSpacing: 4, textTransform: 'uppercase', marginBottom: 10 }}>LOCATION</div>
        <div style={{ fontSize: 34, fontWeight: 900, color: '#fff', marginBottom: 20, lineHeight: 1.1 }}>{locationName}</div>
        <div style={{ display: 'flex', gap: 16 }}>
          <div style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 6, padding: '12px 14px' }}>
            <div style={{ fontSize: 30, fontWeight: 900, color: 'PRIMARY_COLOR', lineHeight: 1 }}>{stat1}</div>
            <div style={{ fontSize: 12, color: 'SUPPORT_COLOR', textTransform: 'uppercase', letterSpacing: 1, marginTop: 5 }}>{label1}</div>
          </div>
          <div style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 6, padding: '12px 14px' }}>
            <div style={{ fontSize: 30, fontWeight: 900, color: 'ACCENT_COLOR', lineHeight: 1 }}>{stat2}</div>
            <div style={{ fontSize: 12, color: 'SUPPORT_COLOR', textTransform: 'uppercase', letterSpacing: 1, marginTop: 5 }}>{label2}</div>
          </div>
        </div>
        <div style={{ marginTop: 16, fontSize: 15, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6 }}>{contextText}</div>
      </div>

      {/* Chrome */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 4, backgroundColor: 'PRIMARY_COLOR', opacity: uiOp }} />
      <div style={{ position: 'absolute', top: 52, left: 0, width: 1920, textAlign: 'center', opacity: uiOp }}>
        <span style={{ fontSize: 28, fontWeight: 900, color: 'PRIMARY_COLOR', letterSpacing: 5, textTransform: 'uppercase' }}>{title}</span>
      </div>
      <div style={{ position: 'absolute', bottom: 0, left: 0, width: `${interpolate(frame, [5, 35], [0, 100], { extrapolateRight: 'clamp' })}%`, height: 4, backgroundColor: 'PRIMARY_COLOR' }} />
    </div>
  )
}

export default AnimationComponent
