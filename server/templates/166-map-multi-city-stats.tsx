import React, { useEffect, useRef, useState } from 'react'
import { useCurrentFrame, interpolate, Easing, useDelayRender } from 'remotion'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

export const AnimationComponent = () => {
  const frame = useCurrentFrame()
  const mapRef = useRef<HTMLDivElement>(null)
  const { delayRender, continueRender } = useDelayRender()
  const [handle] = useState(() => delayRender('Loading map'))

  const title       = "TITLE_TEXT"
  const contextText = "CONTEXT_TEXT"

  // Cities on a world map (center [10, 28], zoom 1.8) — pixel positions
  const cities = [
    { x: 860,  y: 300, label: "MAP_LABEL_1", stat: "STAT_VALUE_1", detail: "LABEL_1", cardX: 760,  cardY: 140  },
    { x: 1160, y: 380, label: "MAP_LABEL_2", stat: "STAT_VALUE_2", detail: "LABEL_2", cardX: 1100, cardY: 220  },
    { x: 340,  y: 450, label: "MAP_LABEL_3", stat: "STAT_VALUE_3", detail: "LABEL_3", cardX: 150,  cardY: 310  },
    { x: 1380, y: 280, label: "MAP_LABEL_4", stat: "STAT_VALUE_4", detail: "LABEL_4", cardX: 1380, cardY: 130  },
    { x: 620,  y: 560, label: "MAP_LABEL_5", stat: "STAT_VALUE_5", detail: "LABEL_5", cardX: 380,  cardY: 640  },
    { x: 1540, y: 600, label: "MAP_LABEL_6", stat: "STAT_VALUE_6", detail: "LABEL_6", cardX: 1500, cardY: 680  },
  ].filter(c => c.label !== '' && c.label !== 'Placeholder')

  useEffect(() => {
    if (!mapRef.current) return
    const m = new maplibregl.Map({
      container: mapRef.current,
      style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
      interactive: false,
      fadeDuration: 0,
      center: [10, 28],
      zoom: 1.8,
    })
    m.on('load', () => continueRender(handle))
    return () => m.remove()
  }, [handle])

  const uiOp  = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' })
  const mapOp = interpolate(frame, [10, 30], [0, 1], { extrapolateRight: 'clamp' })
  const barW  = interpolate(frame, [5, 35], [0, 1920], { extrapolateRight: 'clamp' })

  const getCityOp   = (i: number) => interpolate(frame, [20 + i * 15, 38 + i * 15], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) })
  const getLineOp   = (i: number) => interpolate(frame, [28 + i * 15, 48 + i * 15], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const getCardOp   = (i: number) => interpolate(frame, [38 + i * 15, 58 + i * 15], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) })
  const getCardScale = (i: number) => interpolate(frame, [38 + i * 15, 58 + i * 15], [0.8, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.back(1.5)) })

  // Pulse animation for dots
  const pulseR  = interpolate(frame % 40, [0, 20, 40], [8, 22, 8])
  const pulseOp = interpolate(frame % 40, [0, 20, 40], [0.5, 0.05, 0.5])

  const CARD_W = 200

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden', backgroundColor: 'BACKGROUND_COLOR', fontFamily: 'sans-serif' }}>
      <div ref={mapRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: mapOp * 0.55 , filter: 'brightness(2.0) contrast(1.2) saturate(4) hue-rotate(185deg)'}} />
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.5) 100%)', pointerEvents: 'none' }} />

      <svg width={1920} height={1080} style={{ position: 'absolute', top: 0, left: 0 }}>
        <defs>
          <filter id="mc-glow">
            <feGaussianBlur stdDeviation="3" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>
        {cities.map((city, i) => {
          const dotOp  = getCityOp(i)
          const lineOp = getLineOp(i)
          const cardCX = city.cardX + CARD_W / 2
          const cardCY = city.cardY + 36
          return (
            <g key={i}>
              {/* Leader line from dot to card */}
              <line x1={city.x} y1={city.y} x2={cardCX} y2={cardCY}
                stroke="PRIMARY_COLOR" strokeWidth={1} strokeDasharray="5 4"
                opacity={lineOp * 0.6} />
              {/* Pulse ring */}
              <circle cx={city.x} cy={city.y} r={pulseR} fill="none"
                stroke="PRIMARY_COLOR" strokeWidth={1.5} opacity={pulseOp * dotOp} />
              {/* City dot */}
              <circle cx={city.x} cy={city.y} r={8} fill="PRIMARY_COLOR"
                opacity={dotOp} filter="url(#mc-glow)" />
              <circle cx={city.x} cy={city.y} r={3} fill="#fff" opacity={dotOp} />
            </g>
          )
        })}
      </svg>

      {/* Stat cards */}
      {cities.map((city, i) => {
        const cardOp    = getCardOp(i)
        const cardScale = getCardScale(i)
        return (
          <div key={i} style={{
            position: 'absolute', top: city.cardY, left: city.cardX, width: CARD_W,
            opacity: cardOp, transform: `scale(${cardScale})`, transformOrigin: 'top left',
            backgroundColor: 'rgba(8,8,18,0.9)', border: '1px solid PRIMARY_COLOR',
            borderRadius: 6, padding: '10px 14px', backdropFilter: 'blur(8px)',
          }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{city.label}</div>
            <div style={{ fontSize: 26, fontWeight: 900, color: 'PRIMARY_COLOR', lineHeight: 1 }}>{city.stat}</div>
            <div style={{ fontSize: 11, color: 'SUPPORT_COLOR', textTransform: 'uppercase', letterSpacing: 1, marginTop: 3 }}>{city.detail}</div>
          </div>
        )
      })}

      <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 4, backgroundColor: 'PRIMARY_COLOR', opacity: uiOp }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, width: barW, height: 4, backgroundColor: 'PRIMARY_COLOR' }} />
      <div style={{ position: 'absolute', top: 52, left: 0, width: 1920, textAlign: 'center', opacity: uiOp }}>
        <span style={{ fontSize: 28, fontWeight: 900, color: 'PRIMARY_COLOR', letterSpacing: 5, textTransform: 'uppercase' }}>{title}</span>
      </div>
      <div style={{ position: 'absolute', bottom: 22, left: '50%', transform: 'translateX(-50%)', opacity: interpolate(frame, [130, 150], [0, 1], { extrapolateRight: 'clamp' }), textAlign: 'center', width: 900 }}>
        <span style={{ fontSize: 17, color: 'SUPPORT_COLOR' }}>{contextText}</span>
      </div>
    </div>
  )
}

export default AnimationComponent
