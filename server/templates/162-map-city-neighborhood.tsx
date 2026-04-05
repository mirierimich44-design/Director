import React, { useEffect, useRef, useState } from 'react'
import { useCurrentFrame, interpolate, Easing, useDelayRender } from 'remotion'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

const CITY_COORDS: Record<string, { lng: number; lat: number; zoom: number }> = {
  MANHATTAN:     { lng: -73.9857, lat: 40.7484, zoom: 13 },
  DOWNTOWN_LA:   { lng: -118.2437, lat: 34.0522, zoom: 13 },
  CITY_OF_LONDON:{ lng: -0.0922, lat: 51.5154, zoom: 14 },
  PARIS_CENTER:  { lng: 2.3522, lat: 48.8566, zoom: 13 },
  DUBAI_CENTER:  { lng: 55.2708, lat: 25.2048, zoom: 13 },
  TOKYO_CENTER:  { lng: 139.6917, lat: 35.6895, zoom: 13 },
  KYIV_CENTER:   { lng: 30.5234, lat: 50.4501, zoom: 13 },
  GAZA_CITY:     { lng: 34.4667, lat: 31.5000, zoom: 13 },
  ALEPPO:        { lng: 37.1612, lat: 36.2021, zoom: 13 },
  DONETSK:       { lng: 37.8028, lat: 48.0159, zoom: 13 },
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
  const stat2        = "STAT_VALUE_2"
  const label1       = "LABEL_1"
  const label2       = "LABEL_2"
  const areaName     = "MAP_LABEL_2"

  const city = CITY_COORDS[locationKey] || CITY_COORDS['MANHATTAN']

  useEffect(() => {
    if (!mapRef.current) return
    const m = new maplibregl.Map({
      container: mapRef.current,
      style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
      interactive: false,
      fadeDuration: 0,
      center: [city.lng, city.lat],
      zoom: city.zoom,
    })
    m.on('load', () => continueRender(handle))
    return () => m.remove()
  }, [handle])

  const uiOp   = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' })
  const mapOp  = interpolate(frame, [10, 35], [0, 1], { extrapolateRight: 'clamp' })
  const boxOp  = interpolate(frame, [30, 55], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) })
  const boxScale = interpolate(frame, [30, 55], [0.85, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) })
  const labelOp  = interpolate(frame, [50, 70], [0, 1], { extrapolateRight: 'clamp' })
  const cardOp   = interpolate(frame, [60, 80], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const barW     = interpolate(frame, [5, 35], [0, 1920], { extrapolateRight: 'clamp' })

  // Highlight box — centered on screen
  const BOX_X = 580; const BOX_Y = 200; const BOX_W = 760; const BOX_H = 580
  const cx = BOX_X + BOX_W / 2; const cy = BOX_Y + BOX_H / 2

  // Scanning line
  const scanY = interpolate(frame % 60, [0, 60], [BOX_Y, BOX_Y + BOX_H])

  // Corner brackets
  const corner = 28

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden', backgroundColor: 'BACKGROUND_COLOR', fontFamily: 'sans-serif' }}>
      <div ref={mapRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: mapOp , filter: 'brightness(2.2) contrast(1.15)'}} />

      <svg width={1920} height={1080} style={{ position: 'absolute', top: 0, left: 0 }}>
        <defs>
          <filter id="cn-glow">
            <feGaussianBlur stdDeviation="4" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <clipPath id="box-clip">
            <rect x={BOX_X} y={BOX_Y} width={BOX_W} height={BOX_H} />
          </clipPath>
        </defs>

        {/* Dim outside box */}
        <rect x={0} y={0} width={1920} height={1080} fill="rgba(0,0,0,0.5)" opacity={boxOp} />
        <rect x={BOX_X} y={BOX_Y} width={BOX_W} height={BOX_H} fill="rgba(0,0,0,0)" />

        {/* Scan line */}
        <line x1={BOX_X} y1={scanY} x2={BOX_X + BOX_W} y2={scanY}
          stroke="PRIMARY_COLOR" strokeWidth={1.5} opacity={boxOp * 0.5}
          clipPath="url(#box-clip)" filter="url(#cn-glow)" />

        {/* Box border */}
        <rect x={BOX_X} y={BOX_Y} width={BOX_W} height={BOX_H}
          fill="none" stroke="PRIMARY_COLOR" strokeWidth={1.5}
          opacity={boxOp * 0.6}
          transform={`scale(${boxScale})`}
          style={{ transformOrigin: `${cx}px ${cy}px` }} />

        {/* Corner brackets */}
        {[[BOX_X, BOX_Y, 1, 1], [BOX_X + BOX_W, BOX_Y, -1, 1], [BOX_X, BOX_Y + BOX_H, 1, -1], [BOX_X + BOX_W, BOX_Y + BOX_H, -1, -1]].map(([x, y, dx, dy], i) => (
          <g key={i} opacity={boxOp} filter="url(#cn-glow)">
            <line x1={x as number} y1={y as number} x2={(x as number) + (dx as number) * corner} y2={y as number} stroke="PRIMARY_COLOR" strokeWidth={3} strokeLinecap="round" />
            <line x1={x as number} y1={y as number} x2={x as number} y2={(y as number) + (dy as number) * corner} stroke="PRIMARY_COLOR" strokeWidth={3} strokeLinecap="round" />
          </g>
        ))}
      </svg>

      {/* Area label above box */}
      <div style={{ position: 'absolute', top: BOX_Y - 46, left: BOX_X, width: BOX_W, textAlign: 'center', opacity: labelOp }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: 'PRIMARY_COLOR', letterSpacing: 5, textTransform: 'uppercase' }}>{areaName}</span>
      </div>

      {/* Right panel */}
      <div style={{ position: 'absolute', top: 200, right: 80, width: 360, opacity: cardOp, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ backgroundColor: 'rgba(8,8,18,0.92)', border: '1px solid PRIMARY_COLOR', borderRadius: 8, padding: '20px 22px', backdropFilter: 'blur(10px)' }}>
          <div style={{ fontSize: 11, color: 'PRIMARY_COLOR', letterSpacing: 4, textTransform: 'uppercase', marginBottom: 8 }}>LOCATION</div>
          <div style={{ fontSize: 26, fontWeight: 900, color: '#fff' }}>{locationName}</div>
        </div>
        <div style={{ backgroundColor: 'rgba(8,8,18,0.92)', border: '1px solid CHART_BORDER', borderRadius: 8, padding: '20px 22px', backdropFilter: 'blur(10px)' }}>
          <div style={{ fontSize: 38, fontWeight: 900, color: 'PRIMARY_COLOR', lineHeight: 1 }}>{stat1}</div>
          <div style={{ fontSize: 13, color: 'SUPPORT_COLOR', textTransform: 'uppercase', letterSpacing: 1, marginTop: 6 }}>{label1}</div>
        </div>
        <div style={{ backgroundColor: 'rgba(8,8,18,0.92)', border: '1px solid CHART_BORDER', borderRadius: 8, padding: '20px 22px', backdropFilter: 'blur(10px)' }}>
          <div style={{ fontSize: 38, fontWeight: 900, color: 'SECONDARY_COLOR', lineHeight: 1 }}>{stat2}</div>
          <div style={{ fontSize: 13, color: 'SUPPORT_COLOR', textTransform: 'uppercase', letterSpacing: 1, marginTop: 6 }}>{label2}</div>
        </div>
        <div style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)', lineHeight: 1.65 }}>{contextText}</div>
      </div>

      <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 4, backgroundColor: 'PRIMARY_COLOR', opacity: uiOp }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, width: barW, height: 4, backgroundColor: 'PRIMARY_COLOR' }} />
      <div style={{ position: 'absolute', top: 52, left: 0, width: 1920, textAlign: 'center', opacity: uiOp }}>
        <span style={{ fontSize: 28, fontWeight: 900, color: 'PRIMARY_COLOR', letterSpacing: 5, textTransform: 'uppercase' }}>{title}</span>
      </div>
    </div>
  )
}

export default AnimationComponent
