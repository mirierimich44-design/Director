import React, { useEffect, useRef, useState } from 'react'
import { useCurrentFrame, interpolate, Easing, useDelayRender } from 'remotion'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

const CITY_COORDS: Record<string, { lng: number; lat: number; zoom: number }> = {
  LOS_ANGELES:   { lng: -118.2437, lat: 34.0522,  zoom: 8 },
  NEW_YORK:      { lng: -74.006,   lat: 40.7128,  zoom: 8 },
  LONDON:        { lng: -0.1276,   lat: 51.5074,  zoom: 8 },
  DUBAI:         { lng: 55.2708,   lat: 25.2048,  zoom: 8 },
  TOKYO:         { lng: 139.6917,  lat: 35.6895,  zoom: 8 },
  WASHINGTON_DC: { lng: -77.0369,  lat: 38.9072,  zoom: 8 },
  MOSCOW:        { lng: 37.6173,   lat: 55.7558,  zoom: 8 },
  TEHRAN:        { lng: 51.3890,   lat: 35.6892,  zoom: 8 },
  BEIJING:       { lng: 116.4074,  lat: 39.9042,  zoom: 8 },
  PYONGYANG:     { lng: 125.7625,  lat: 39.0392,  zoom: 9 },
}

export const AnimationComponent = () => {
  const frame = useCurrentFrame()
  const mapRef = useRef<HTMLDivElement>(null)
  const { delayRender, continueRender } = useDelayRender()
  const [handle] = useState(() => delayRender('Loading map'))

  const locationKey  = "MAP_LABEL_1"
  const locationName = "MAP_LABEL_1"
  const title        = "TITLE_TEXT"
  const contextText  = "CONTEXT_TEXT"
  const stat1        = "STAT_VALUE_1"
  const label1       = "LABEL_1"
  const stat2        = "STAT_VALUE_2"
  const label2       = "LABEL_2"

  const city = CITY_COORDS[locationKey] || CITY_COORDS['WASHINGTON_DC']

  useEffect(() => {
    if (!mapRef.current) return
    const m = new maplibregl.Map({
      container: mapRef.current,
      style: 'https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json',
      interactive: false,
      fadeDuration: 0,
      center: [city.lng, city.lat],
      zoom: city.zoom,
    })
    m.on('load', () => continueRender(handle))
    return () => m.remove()
  }, [handle])

  const uiOp      = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' })
  const mapOp     = interpolate(frame, [10, 30], [0, 1], { extrapolateRight: 'clamp' })
  const radarOp   = interpolate(frame, [20, 40], [0, 1], { extrapolateRight: 'clamp' })
  const barW      = interpolate(frame, [5, 35], [0, 1920], { extrapolateRight: 'clamp' })

  // Continuous radar rotation (2 full rotations over 120 frames)
  const sweepAngle = interpolate(frame, [0, 120], [0, 720], { extrapolateRight: 'clamp' })
  // After 120 frames stays at final detected state
  const finalAngle = Math.min(sweepAngle, 720)

  const CX = 960; const CY = 540
  const RADII = [160, 280, 400, 520]

  // Detected targets — appear when sweep first crosses their angle (within first rotation)
  const targets = [
    { angle: 45,  r: 200, label: "MAP_LABEL_2" },
    { angle: 120, r: 320, label: "MAP_LABEL_3" },
    { angle: 240, r: 150, label: "MAP_LABEL_4" },
    { angle: 310, r: 380, label: "MAP_LABEL_5" },
  ].filter(t => t.label !== '' && t.label !== 'Placeholder')

  const isDetected = (angle: number) => finalAngle >= angle

  const toXY = (angle: number, r: number) => ({
    x: CX + Math.cos((angle - 90) * Math.PI / 180) * r,
    y: CY + Math.sin((angle - 90) * Math.PI / 180) * r,
  })

  // Sweep trail gradient: bright at current, fading behind
  const sweepPath = (() => {
    const a = finalAngle % 360
    const steps = 60
    const pts = Array.from({ length: steps + 1 }, (_, i) => {
      const angle = a - (steps - i) * (90 / steps)
      return toXY(angle, 530)
    })
    const d = [`M ${CX} ${CY}`]
    pts.forEach(p => d.push(`L ${p.x} ${p.y}`))
    d.push('Z')
    return d.join(' ')
  })()

  const infoOp = interpolate(frame, [80, 100], [0, 1], { extrapolateRight: 'clamp' })
  const statOp = interpolate(frame, [100, 120], [0, 1], { extrapolateRight: 'clamp' })

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden', backgroundColor: '#000a04', fontFamily: 'monospace' }}>
      <div ref={mapRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: mapOp * 0.4, filter: 'hue-rotate(120deg) saturate(0.3)' }} />

      <svg width={1920} height={1080} style={{ position: 'absolute', top: 0, left: 0 }}>
        <defs>
          <radialGradient id="rdr-sweep" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="PRIMARY_COLOR" stopOpacity="0" />
            <stop offset="100%" stopColor="PRIMARY_COLOR" stopOpacity="0.25" />
          </radialGradient>
          <filter id="rdr-glow">
            <feGaussianBlur stdDeviation="4" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        {/* Concentric range rings */}
        {RADII.map((r, i) => (
          <circle key={i} cx={CX} cy={CY} r={r} fill="none" stroke="PRIMARY_COLOR"
            strokeWidth={1} opacity={radarOp * 0.25}
            strokeDasharray={i % 2 === 0 ? '8 6' : 'none'} />
        ))}

        {/* Crosshairs */}
        <line x1={CX - 560} y1={CY} x2={CX + 560} y2={CY} stroke="PRIMARY_COLOR" strokeWidth={0.8} opacity={radarOp * 0.2} />
        <line x1={CX} y1={CY - 560} x2={CX} y2={CY + 560} stroke="PRIMARY_COLOR" strokeWidth={0.8} opacity={radarOp * 0.2} />

        {/* Sweep trail */}
        <path d={sweepPath} fill="PRIMARY_COLOR" opacity={radarOp * 0.18} />

        {/* Sweep line */}
        {(() => {
          const tip = toXY(finalAngle % 360, 530)
          return (
            <line x1={CX} y1={CY} x2={tip.x} y2={tip.y}
              stroke="PRIMARY_COLOR" strokeWidth={2.5} opacity={radarOp}
              filter="url(#rdr-glow)" />
          )
        })()}

        {/* Center dot */}
        <circle cx={CX} cy={CY} r={8} fill="PRIMARY_COLOR" opacity={radarOp} filter="url(#rdr-glow)" />
        <circle cx={CX} cy={CY} r={3} fill="#fff" opacity={radarOp} />

        {/* Detected targets */}
        {targets.map((t, i) => {
          if (!isDetected(t.angle)) return null
          const pos = toXY(t.angle, t.r)
          const blipOp = interpolate(frame - (t.angle / 6), [0, 10], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
          const blipPulse = interpolate((frame - Math.floor(t.angle / 6)) % 30, [0, 15, 30], [6, 18, 6])
          const blipPulseOp = interpolate((frame - Math.floor(t.angle / 6)) % 30, [0, 15, 30], [0.8, 0.1, 0.8])
          return (
            <g key={i} opacity={blipOp}>
              <circle cx={pos.x} cy={pos.y} r={blipPulse} fill="none" stroke="ACCENT_COLOR" strokeWidth={1.5} opacity={blipPulseOp} />
              <circle cx={pos.x} cy={pos.y} r={6} fill="ACCENT_COLOR" filter="url(#rdr-glow)" />
              <line x1={CX} y1={CY} x2={pos.x} y2={pos.y} stroke="ACCENT_COLOR" strokeWidth={0.8} strokeDasharray="4 4" opacity={0.3} />
            </g>
          )
        })}
      </svg>

      {/* Target labels */}
      {targets.map((t, i) => {
        if (!isDetected(t.angle)) return null
        const pos = toXY(t.angle, t.r)
        const blipOp = interpolate(frame - (t.angle / 6), [0, 10], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
        return (
          <div key={i} style={{ position: 'absolute', top: pos.y + 14, left: pos.x - 80, width: 160, textAlign: 'center', opacity: blipOp }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'ACCENT_COLOR', letterSpacing: 2, textShadow: '0 0 8px rgba(0,0,0,0.9)' }}>{t.label}</div>
          </div>
        )
      })}

      {/* Info panel */}
      <div style={{ position: 'absolute', top: 120, left: 80, width: 300, opacity: infoOp, backgroundColor: 'rgba(0,10,4,0.92)', border: '1px solid PRIMARY_COLOR', borderRadius: 4, padding: '18px 22px', backdropFilter: 'blur(6px)' }}>
        <div style={{ fontSize: 11, color: 'PRIMARY_COLOR', letterSpacing: 4, marginBottom: 6 }}>RADAR STATION</div>
        <div style={{ fontSize: 24, fontWeight: 900, color: '#fff', marginBottom: 12 }}>{locationName}</div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>{contextText}</div>
      </div>

      <div style={{ position: 'absolute', bottom: 100, left: 80, display: 'flex', gap: 20, opacity: statOp }}>
        <div style={{ backgroundColor: 'rgba(0,10,4,0.92)', border: '1px solid PRIMARY_COLOR', borderRadius: 4, padding: '14px 20px' }}>
          <div style={{ fontSize: 32, fontWeight: 900, color: 'PRIMARY_COLOR', lineHeight: 1 }}>{stat1}</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 1, marginTop: 4 }}>{label1}</div>
        </div>
        <div style={{ backgroundColor: 'rgba(0,10,4,0.92)', border: '1px solid ACCENT_COLOR', borderRadius: 4, padding: '14px 20px' }}>
          <div style={{ fontSize: 32, fontWeight: 900, color: 'ACCENT_COLOR', lineHeight: 1 }}>{stat2}</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 1, marginTop: 4 }}>{label2}</div>
        </div>
      </div>

      <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 4, backgroundColor: 'PRIMARY_COLOR', opacity: uiOp }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, width: barW, height: 4, backgroundColor: 'PRIMARY_COLOR' }} />
      <div style={{ position: 'absolute', top: 52, left: 0, width: 1920, textAlign: 'center', opacity: uiOp }}>
        <span style={{ fontSize: 22, fontWeight: 700, color: 'PRIMARY_COLOR', letterSpacing: 8, textTransform: 'uppercase' }}>{title}</span>
      </div>
      <div style={{ position: 'absolute', bottom: 22, right: 80, opacity: mapOp * 0.4, fontSize: 11, color: 'PRIMARY_COLOR', letterSpacing: 3 }}>
        {`${locationName} // SWEEP: ${(finalAngle % 360).toFixed(0)}°`}
      </div>
    </div>
  )
}

export default AnimationComponent
