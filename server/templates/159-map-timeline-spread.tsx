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

  // Events spread across the map over time (pixel coords on world map center [15,28] zoom 1.8)
  const events = [
    { x: 860,  y: 310, label: "MAP_LABEL_1", date: "LABEL_1", appearsAt: 20  },
    { x: 1160, y: 390, label: "MAP_LABEL_2", date: "LABEL_2", appearsAt: 45  },
    { x: 340,  y: 460, label: "MAP_LABEL_3", date: "LABEL_3", appearsAt: 68  },
    { x: 620,  y: 250, label: "MAP_LABEL_4", date: "LABEL_4", appearsAt: 90  },
    { x: 1380, y: 280, label: "MAP_LABEL_5", date: "LABEL_5", appearsAt: 112 },
    { x: 500,  y: 620, label: "MAP_LABEL_6", date: "LABEL_6", appearsAt: 132 },
  ].filter(e => e.label !== '' && e.label !== 'Placeholder')

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
  const barW = interpolate(frame, [5, 35], [0, 1920], { extrapolateRight: 'clamp' })

  // Timeline bar progress
  const lastEvent = events[events.length - 1]
  const timelineW = interpolate(frame, [20, (lastEvent?.appearsAt ?? 130) + 20], [0, 1], { extrapolateRight: 'clamp' })

  const getEventOp = (appearsAt: number) =>
    interpolate(frame, [appearsAt, appearsAt + 15], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) })

  const getRippleR = (appearsAt: number) =>
    interpolate(Math.max(0, frame - appearsAt) % 50, [0, 50], [8, 40])

  const getRippleOp = (appearsAt: number) =>
    interpolate(Math.max(0, frame - appearsAt) % 50, [0, 25, 50], [0.7, 0.15, 0])

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden', backgroundColor: 'BACKGROUND_COLOR', fontFamily: 'sans-serif' }}>
      <div ref={mapRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0.5 , filter: 'brightness(2.0) contrast(1.2) saturate(4) hue-rotate(280deg)'}} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, transparent 15%, transparent 80%, rgba(0,0,0,0.5) 100%)', pointerEvents: 'none' }} />

      <svg width={1920} height={1080} style={{ position: 'absolute', top: 0, left: 0 }}>
        <defs>
          <filter id="ts-glow">
            <feGaussianBlur stdDeviation="4" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>
        {events.map((event, i) => {
          const op = getEventOp(event.appearsAt)
          if (op <= 0) return null
          return (
            <g key={i} opacity={op}>
              {/* Ripple */}
              <circle cx={event.x} cy={event.y} r={getRippleR(event.appearsAt)} fill="none"
                stroke="PRIMARY_COLOR" strokeWidth={2} opacity={getRippleOp(event.appearsAt)} />
              {/* Second ripple offset */}
              <circle cx={event.x} cy={event.y} r={getRippleR(event.appearsAt) * 0.6} fill="none"
                stroke="ACCENT_COLOR" strokeWidth={1.5} opacity={getRippleOp(event.appearsAt) * 0.6} />
              {/* Dot */}
              <circle cx={event.x} cy={event.y} r={9} fill="PRIMARY_COLOR" filter="url(#ts-glow)" />
              <circle cx={event.x} cy={event.y} r={4} fill="#fff" />
            </g>
          )
        })}
      </svg>

      {/* Event labels */}
      {events.map((event, i) => {
        const op = getEventOp(event.appearsAt)
        if (op <= 0) return null
        const labelY = event.y > 540 ? event.y - 55 : event.y + 22
        return (
          <div key={i} style={{ position: 'absolute', top: labelY, left: event.x - 110, width: 220, textAlign: 'center', opacity: op }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', textShadow: '0 2px 8px rgba(0,0,0,0.95)' }}>{event.label}</div>
            <div style={{ fontSize: 12, color: 'ACCENT_COLOR', letterSpacing: 2, fontWeight: 600, textTransform: 'uppercase', marginTop: 2, textShadow: '0 1px 4px rgba(0,0,0,0.9)' }}>{event.date}</div>
          </div>
        )
      })}

      {/* Chrome */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 4, backgroundColor: 'PRIMARY_COLOR', opacity: uiOp }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, width: barW, height: 4, backgroundColor: 'PRIMARY_COLOR' }} />

      <div style={{ position: 'absolute', top: 52, left: 0, width: 1920, textAlign: 'center', opacity: uiOp }}>
        <span style={{ fontSize: 30, fontWeight: 900, color: 'PRIMARY_COLOR', letterSpacing: 5, textTransform: 'uppercase' }}>{title}</span>
      </div>

      {/* Timeline progress bar */}
      <div style={{ position: 'absolute', bottom: 52, left: 160, right: 160 }}>
        <div style={{ height: 3, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 2 }}>
          <div style={{ height: '100%', width: `${timelineW * 100}%`, backgroundColor: 'PRIMARY_COLOR', borderRadius: 2, transition: 'none' }} />
        </div>
        {/* Event ticks on timeline */}
        {events.map((event, i) => {
          const tickX = (event.appearsAt - 20) / ((lastEvent?.appearsAt ?? 130) - 20) * 100
          const op = getEventOp(event.appearsAt)
          return (
            <div key={i} style={{ position: 'absolute', top: -20, left: `${tickX}%`, transform: 'translateX(-50%)', opacity: op }}>
              <div style={{ width: 2, height: 10, backgroundColor: 'PRIMARY_COLOR', margin: '0 auto' }} />
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', textAlign: 'center', whiteSpace: 'nowrap', marginTop: 3 }}>{event.date}</div>
            </div>
          )
        })}
      </div>

      <div style={{ position: 'absolute', bottom: 28, left: '50%', transform: 'translateX(-50%)', opacity: interpolate(frame, [140, 160], [0, 1], { extrapolateRight: 'clamp' }), textAlign: 'center', width: 900 }}>
        <span style={{ fontSize: 17, color: 'SUPPORT_COLOR' }}>{contextText}</span>
      </div>
    </div>
  )
}

export default AnimationComponent
