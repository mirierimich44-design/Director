import React, { useEffect, useRef, useState } from 'react'
import { useCurrentFrame, interpolate, Easing, useDelayRender } from 'remotion'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

export const AnimationComponent = () => {
  const frame = useCurrentFrame()
  const mapRef = useRef<HTMLDivElement>(null)
  const { delayRender, continueRender } = useDelayRender()
  const [handle] = useState(() => delayRender('Loading map'))

  const title = "TITLE_TEXT"
  const contextText = "CONTEXT_TEXT"

  // Origins → single destination
  // Pixel coords on world map (center [15,28], zoom 1.8, 1920x1080)
  const destination = { x: 860, y: 310, label: "ARC_TO" }
  const origins = [
    { x: 340,  y: 460, label: "MAP_LABEL_1", stat: "STAT_VALUE_1", width: 8 },
    { x: 620,  y: 560, label: "MAP_LABEL_2", stat: "STAT_VALUE_2", width: 5 },
    { x: 1160, y: 390, label: "MAP_LABEL_3", stat: "STAT_VALUE_3", width: 6 },
    { x: 1380, y: 280, label: "MAP_LABEL_4", stat: "STAT_VALUE_4", width: 3 },
  ].filter(o => o.label !== '' && o.label !== 'Placeholder')

  useEffect(() => {
    if (!mapRef.current) return
    const m = new maplibregl.Map({
      container: mapRef.current,
      style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
      interactive: false,
      fadeDuration: 0,
      center: [15, 28],
      zoom: 1.8,
    })
    m.on('load', () => continueRender(handle))
    return () => m.remove()
  }, [handle])

  const uiOp = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' })

  const getArcProgress = (i: number) =>
    interpolate(frame, [20 + i * 15, 80 + i * 15], [0, 1], {
      extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic),
    })

  const getLabelOp = (i: number) =>
    interpolate(frame, [70 + i * 15, 90 + i * 15], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  const destOp = interpolate(frame, [30, 50], [0, 1], { extrapolateRight: 'clamp' })
  const destPulse = interpolate(frame % 40, [0, 20, 40], [16, 36, 16])
  const destPulseOp = interpolate(frame % 40, [0, 20, 40], [0.5, 0.05, 0.5])

  const getArcPath = (from: typeof origins[0], progress: number) => {
    const cpx = (from.x + destination.x) / 2
    const cpy = Math.min(from.y, destination.y) - Math.abs(destination.x - from.x) * 0.2
    const tx = from.x + (destination.x - from.x) * progress
    const ty = from.y + (destination.y - from.y) * progress
    const bx = (1-progress)*(1-progress)*from.x + 2*(1-progress)*progress*cpx + progress*progress*tx
    const by = (1-progress)*(1-progress)*from.y + 2*(1-progress)*progress*cpy + progress*progress*ty
    return `M ${from.x} ${from.y} Q ${cpx} ${cpy} ${bx} ${by}`
  }

  const barW = interpolate(frame, [10, 40], [0, 1920], { extrapolateRight: 'clamp' })

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden', backgroundColor: 'BACKGROUND_COLOR', fontFamily: 'sans-serif' }}>
      <div ref={mapRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0.5 , filter: 'brightness(2.0) contrast(1.2) saturate(4) hue-rotate(180deg)'}} />
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.55) 100%)', pointerEvents: 'none' }} />

      <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 4, backgroundColor: 'PRIMARY_COLOR', opacity: uiOp }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, width: barW, height: 4, backgroundColor: 'PRIMARY_COLOR' }} />

      <div style={{ position: 'absolute', top: 52, left: 0, width: 1920, textAlign: 'center', opacity: uiOp }}>
        <span style={{ fontSize: 30, fontWeight: 900, color: 'PRIMARY_COLOR', letterSpacing: 5, textTransform: 'uppercase' }}>{title}</span>
      </div>

      <svg width={1920} height={1080} style={{ position: 'absolute', top: 0, left: 0 }}>
        <defs>
          <filter id="mf-glow">
            <feGaussianBlur stdDeviation="4" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        {/* Destination pulse */}
        <circle cx={destination.x} cy={destination.y} r={destPulse} fill="none" stroke="ACCENT_COLOR" strokeWidth={2} opacity={destPulseOp * destOp} />
        <circle cx={destination.x} cy={destination.y} r={18} fill="rgba(0,0,0,0.6)" stroke="ACCENT_COLOR" strokeWidth={3} opacity={destOp} filter="url(#mf-glow)" />
        <circle cx={destination.x} cy={destination.y} r={7} fill="ACCENT_COLOR" opacity={destOp} />

        {/* Migration arcs */}
        {origins.map((origin, i) => {
          const progress = getArcProgress(i)
          if (progress <= 0) return null
          const path = getArcPath(origin, progress)
          return (
            <g key={i}>
              {/* thick glow */}
              <path d={path} fill="none" stroke="PRIMARY_COLOR" strokeWidth={origin.width * 2} opacity={0.12} strokeLinecap="round" />
              {/* main arc */}
              <path d={path} fill="none" stroke="PRIMARY_COLOR" strokeWidth={origin.width} opacity={0.85} strokeLinecap="round" filter="url(#mf-glow)" />
              {/* animated particle */}
              {progress > 0.05 && progress < 0.98 && (
                <circle r={5} fill="#fff" opacity={0.9} filter="url(#mf-glow)">
                  <animateMotion path={path} dur={`${2 + i * 0.3}s`} repeatCount="indefinite" />
                </circle>
              )}
              {/* origin dot */}
              <circle cx={origin.x} cy={origin.y} r={9} fill="PRIMARY_COLOR" opacity={progress} stroke="#fff" strokeWidth={1.5} />
            </g>
          )
        })}
      </svg>

      {/* Origin labels */}
      {origins.map((origin, i) => {
        const op = getLabelOp(i)
        return (
          <div key={i} style={{ position: 'absolute', top: origin.y + 20, left: origin.x - 100, width: 200, textAlign: 'center', opacity: op }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', textShadow: '0 2px 6px rgba(0,0,0,0.9)' }}>{origin.label}</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: 'PRIMARY_COLOR', marginTop: 2 }}>{origin.stat}</div>
          </div>
        )
      })}

      {/* Destination label */}
      <div style={{ position: 'absolute', top: destination.y - 70, left: destination.x - 120, width: 240, textAlign: 'center', opacity: destOp }}>
        <div style={{ fontSize: 20, fontWeight: 900, color: 'ACCENT_COLOR', textTransform: 'uppercase', letterSpacing: 2, textShadow: '0 2px 8px rgba(0,0,0,0.9)' }}>{destination.label}</div>
      </div>

      {/* Context */}
      <div style={{ position: 'absolute', bottom: 28, left: '50%', transform: 'translateX(-50%)', opacity: interpolate(frame, [120, 140], [0, 1], { extrapolateRight: 'clamp' }), textAlign: 'center', width: 900 }}>
        <span style={{ fontSize: 18, color: 'SUPPORT_COLOR' }}>{contextText}</span>
      </div>
    </div>
  )
}

export default AnimationComponent
