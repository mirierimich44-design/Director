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

  // 4 supply chain stops — pixel positions on a world-view map (1920x1080, center [10,25] zoom 1.8)
  const stops = [
    { x: 340,  y: 460, label: "MAP_LABEL_1", stat: "STAT_VALUE_1", detail: "LABEL_1" },
    { x: 750,  y: 310, label: "MAP_LABEL_2", stat: "STAT_VALUE_2", detail: "LABEL_2" },
    { x: 1160, y: 380, label: "MAP_LABEL_3", stat: "STAT_VALUE_3", detail: "LABEL_3" },
    { x: 1560, y: 340, label: "MAP_LABEL_4", stat: "STAT_VALUE_4", detail: "LABEL_4" },
  ].filter(s => s.label !== '' && s.label !== 'Placeholder')

  useEffect(() => {
    if (!mapRef.current) return
    const m = new maplibregl.Map({
      container: mapRef.current,
      style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
      interactive: false,
      fadeDuration: 0,
      center: [10, 25],
      zoom: 1.8,
    })
    m.on('load', () => continueRender(handle))
    return () => m.remove()
  }, [handle])

  const uiOp  = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' })
  const barW  = interpolate(frame, [5, 35], [0, 1920], { extrapolateRight: 'clamp' })

  // Each segment animates sequentially
  const segDur = 35
  const getSegProgress = (i: number) =>
    interpolate(frame, [30 + i * segDur, 30 + (i + 1) * segDur], [0, 1], {
      extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic),
    })

  const getNodeOp = (i: number) =>
    interpolate(frame, [25 + i * segDur, 40 + i * segDur], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  const getLabelOp = (i: number) =>
    interpolate(frame, [40 + i * segDur, 55 + i * segDur], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  const getLinePath = (from: typeof stops[0], to: typeof stops[0], progress: number) => {
    const cpx = (from.x + to.x) / 2
    const cpy = Math.min(from.y, to.y) - 80
    const tx = from.x + (to.x - from.x) * progress
    const ty = from.y + (to.y - from.y) * progress
    // Approximate quadratic bezier point
    const bx = (1 - progress) * (1 - progress) * from.x + 2 * (1 - progress) * progress * cpx + progress * progress * tx
    const by = (1 - progress) * (1 - progress) * from.y + 2 * (1 - progress) * progress * cpy + progress * progress * ty
    return `M ${from.x} ${from.y} Q ${cpx} ${cpy} ${bx} ${by}`
  }

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden', backgroundColor: 'BACKGROUND_COLOR', fontFamily: 'sans-serif' }}>
      <div ref={mapRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0.55 , filter: 'brightness(2.2) contrast(1.15)'}} />

      {/* Vignette */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, transparent 20%, transparent 80%, rgba(0,0,0,0.6) 100%)', pointerEvents: 'none' }} />

      {/* Accent bars */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 4, backgroundColor: 'PRIMARY_COLOR', opacity: uiOp }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, width: barW, height: 4, backgroundColor: 'PRIMARY_COLOR' }} />

      {/* Title */}
      <div style={{ position: 'absolute', top: 52, left: 0, width: 1920, textAlign: 'center', opacity: uiOp }}>
        <span style={{ fontSize: 30, fontWeight: 900, color: 'PRIMARY_COLOR', letterSpacing: 6, textTransform: 'uppercase' }}>{title}</span>
      </div>

      {/* SVG: arcs + route dots */}
      <svg width={1920} height={1080} style={{ position: 'absolute', top: 0, left: 0 }}>
        <defs>
          <filter id="sc-glow">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Connecting arcs */}
        {stops.slice(0, -1).map((stop, i) => {
          const next = stops[i + 1]
          const progress = getSegProgress(i)
          if (progress <= 0) return null
          const path = getLinePath(stop, next, progress)
          return (
            <g key={`arc-${i}`}>
              <path d={path} fill="none" stroke="ACCENT_COLOR" strokeWidth={6} opacity={0.2} strokeLinecap="round" />
              <path d={path} fill="none" stroke="PRIMARY_COLOR" strokeWidth={2.5} opacity={0.9} strokeLinecap="round" filter="url(#sc-glow)" />
            </g>
          )
        })}

        {/* Node circles */}
        {stops.map((stop, i) => {
          const op = getNodeOp(i)
          return (
            <g key={`node-${i}`} opacity={op}>
              <circle cx={stop.x} cy={stop.y} r={28} fill="CHART_BG" stroke="PRIMARY_COLOR" strokeWidth={2.5} />
              <text x={stop.x} y={stop.y + 7} textAnchor="middle" fill="PRIMARY_COLOR" fontSize={18} fontWeight={900} fontFamily="sans-serif">{i + 1}</text>
            </g>
          )
        })}
      </svg>

      {/* Stop label cards */}
      {stops.map((stop, i) => {
        const op = getLabelOp(i)
        const cardX = stop.x - 130
        const cardY = stop.y + 45
        return (
          <div key={`card-${i}`} style={{ position: 'absolute', top: cardY, left: cardX, width: 260, opacity: op, backgroundColor: 'rgba(8,8,18,0.9)', border: '1px solid CHART_BORDER', borderRadius: 6, padding: '12px 16px', backdropFilter: 'blur(6px)' }}>
            <div style={{ fontSize: 18, fontWeight: 900, color: '#fff', marginBottom: 4 }}>{stop.label}</div>
            <div style={{ fontSize: 26, fontWeight: 900, color: 'PRIMARY_COLOR', lineHeight: 1 }}>{stop.stat}</div>
            <div style={{ fontSize: 13, color: 'SUPPORT_COLOR', textTransform: 'uppercase', letterSpacing: 1, marginTop: 4 }}>{stop.detail}</div>
          </div>
        )
      })}

      {/* Context */}
      <div style={{ position: 'absolute', bottom: 28, left: '50%', transform: 'translateX(-50%)', opacity: interpolate(frame, [30 + stops.length * segDur, 50 + stops.length * segDur], [0, 1], { extrapolateRight: 'clamp' }), textAlign: 'center', width: 900 }}>
        <span style={{ fontSize: 18, color: 'SUPPORT_COLOR', fontStyle: 'italic' }}>{contextText}</span>
      </div>
    </div>
  )
}

export default AnimationComponent
