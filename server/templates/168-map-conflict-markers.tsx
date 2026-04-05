import React, { useEffect, useRef, useState } from 'react'
import { useCurrentFrame, interpolate, Easing, useDelayRender } from 'remotion'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

// Marker types and their SVG shapes
type MarkerType = 'strike' | 'warning' | 'troops' | 'incident'

const MarkerIcon = ({ type, size = 20 }: { type: MarkerType; size?: number }) => {
  const s = size
  if (type === 'strike') return (
    <g>
      <polygon points={`0,${-s} ${s * 0.6},${s * 0.5} ${-s * 0.6},${s * 0.5}`} fill="none" stroke="currentColor" strokeWidth={2} />
      <circle cx={0} cy={0} r={s * 0.25} fill="currentColor" />
    </g>
  )
  if (type === 'warning') return (
    <g>
      <polygon points={`0,${-s} ${s * 0.9},${s * 0.6} ${-s * 0.9},${s * 0.6}`} fill="currentColor" opacity={0.9} />
      <text x={0} y={s * 0.45} textAnchor="middle" fontSize={s * 0.7} fontWeight={900} fill="#000" fontFamily="sans-serif">!</text>
    </g>
  )
  if (type === 'troops') return (
    <g>
      <rect x={-s * 0.7} y={-s * 0.5} width={s * 1.4} height={s} rx={3} fill="currentColor" opacity={0.9} />
      <text x={0} y={s * 0.35} textAnchor="middle" fontSize={s * 0.6} fontWeight={900} fill="#000" fontFamily="sans-serif">✦</text>
    </g>
  )
  // incident
  return (
    <g>
      <circle cx={0} cy={0} r={s * 0.8} fill="currentColor" opacity={0.9} />
      <text x={0} y={s * 0.35} textAnchor="middle" fontSize={s * 0.7} fontWeight={900} fill="#000" fontFamily="sans-serif">×</text>
    </g>
  )
}

export const AnimationComponent = () => {
  const frame = useCurrentFrame()
  const mapRef = useRef<HTMLDivElement>(null)
  const { delayRender, continueRender } = useDelayRender()
  const [handle] = useState(() => delayRender('Loading map'))

  const title       = "TITLE_TEXT"
  const contextText = "CONTEXT_TEXT"
  const regionName  = "MAP_LABEL_1"
  const totalStat   = "STAT_VALUE_1"
  const totalLabel  = "LABEL_1"

  // Conflict events — pixel positions on regional map (center [33, 48], zoom 4.5)
  const events: { x: number; y: number; type: MarkerType; label: string; appearsAt: number }[] = [
    { x: 840,  y: 350, type: 'strike',   label: "MAP_LABEL_2", appearsAt: 20  },
    { x: 1020, y: 290, type: 'troops',   label: "MAP_LABEL_3", appearsAt: 40  },
    { x: 760,  y: 480, type: 'warning',  label: "MAP_LABEL_4", appearsAt: 58  },
    { x: 1120, y: 410, type: 'incident', label: "MAP_LABEL_5", appearsAt: 75  },
    { x: 680,  y: 340, type: 'strike',   label: "MAP_LABEL_6", appearsAt: 92  },
    { x: 960,  y: 530, type: 'warning',  label: "MAP_LABEL_7", appearsAt: 108 },
  ].filter(e => e.label !== '' && e.label !== 'Placeholder')

  const typeColors: Record<MarkerType, string> = {
    strike:   '#ff3333',
    warning:  '#ffaa00',
    troops:   '#4488ff',
    incident: '#cc44ff',
  }

  useEffect(() => {
    if (!mapRef.current) return
    const m = new maplibregl.Map({
      container: mapRef.current,
      style: 'https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json',
      interactive: false,
      fadeDuration: 0,
      center: [33, 48],
      zoom: 4.5,
    })
    m.on('load', () => continueRender(handle))
    return () => m.remove()
  }, [handle])

  const uiOp  = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' })
  const mapOp = interpolate(frame, [10, 30], [0, 1], { extrapolateRight: 'clamp' })
  const barW  = interpolate(frame, [5, 35], [0, 1920], { extrapolateRight: 'clamp' })

  const getEventOp = (appearsAt: number) =>
    interpolate(frame, [appearsAt, appearsAt + 12], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.back(2)) })

  const getEventScale = (appearsAt: number) =>
    interpolate(frame, [appearsAt, appearsAt + 12], [2.5, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) })

  const getBoom = (appearsAt: number) =>
    interpolate(Math.max(0, frame - appearsAt), [0, 20], [0, 80], { extrapolateRight: 'clamp' })

  const getBoomOp = (appearsAt: number) =>
    interpolate(Math.max(0, frame - appearsAt), [0, 5, 20], [0, 0.8, 0], { extrapolateRight: 'clamp' })

  const statOp    = interpolate(frame, [120, 140], [0, 1], { extrapolateRight: 'clamp' })
  const legendOp  = interpolate(frame, [110, 130], [0, 1], { extrapolateRight: 'clamp' })

  // Count by type
  const appearing = events.filter(e => frame >= e.appearsAt)
  const countByType = appearing.reduce((acc, e) => ({ ...acc, [e.type]: (acc[e.type] || 0) + 1 }), {} as Record<string, number>)

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden', backgroundColor: 'BACKGROUND_COLOR', fontFamily: 'sans-serif' }}>
      <div ref={mapRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: mapOp * 0.7 , filter: 'brightness(2.2) contrast(1.15)'}} />
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 50%, transparent 30%, rgba(0,0,0,0.45) 100%)', pointerEvents: 'none' }} />

      <svg width={1920} height={1080} style={{ position: 'absolute', top: 0, left: 0 }}>
        <defs>
          <filter id="cm-glow">
            <feGaussianBlur stdDeviation="5" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        {events.map((event, i) => {
          const op    = getEventOp(event.appearsAt)
          if (op <= 0) return null
          const scale = getEventScale(event.appearsAt)
          const color = typeColors[event.type]
          const boomR = getBoom(event.appearsAt)
          const boomOp = getBoomOp(event.appearsAt)
          return (
            <g key={i}>
              {/* Explosion shockwave */}
              {boomOp > 0 && (
                <circle cx={event.x} cy={event.y} r={boomR} fill={color} opacity={boomOp} />
              )}
              {/* Marker */}
              <g transform={`translate(${event.x}, ${event.y}) scale(${scale})`} opacity={op} color={color} filter="url(#cm-glow)">
                <MarkerIcon type={event.type} size={16} />
              </g>
            </g>
          )
        })}
      </svg>

      {/* Event labels */}
      {events.map((event, i) => {
        const op = getEventOp(event.appearsAt)
        if (op <= 0 || event.label === '' || event.label === 'Placeholder') return null
        return (
          <div key={i} style={{ position: 'absolute', top: event.y + 26, left: event.x - 90, width: 180, textAlign: 'center', opacity: op }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: typeColors[event.type], textShadow: '0 0 8px rgba(0,0,0,0.95)', letterSpacing: 1 }}>{event.label}</div>
          </div>
        )
      })}

      {/* Legend */}
      <div style={{ position: 'absolute', top: 130, left: 80, opacity: legendOp, backgroundColor: 'rgba(8,8,18,0.92)', border: '1px solid CHART_BORDER', borderRadius: 8, padding: '16px 20px', minWidth: 180 }}>
        <div style={{ fontSize: 11, color: 'SUPPORT_COLOR', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 12 }}>EVENT TYPES</div>
        {(Object.entries(typeColors) as [MarkerType, string][]).map(([type, color]) => (
          <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{ width: 12, height: 12, borderRadius: 2, backgroundColor: color }} />
            <span style={{ fontSize: 13, color: '#fff', textTransform: 'capitalize' }}>{type}</span>
            {countByType[type] && (
              <span style={{ fontSize: 13, color: color, fontWeight: 700, marginLeft: 'auto' }}>{countByType[type]}</span>
            )}
          </div>
        ))}
      </div>

      {/* Stats */}
      <div style={{ position: 'absolute', bottom: 100, right: 80, opacity: statOp, textAlign: 'right' }}>
        <div style={{ fontSize: 11, color: 'SUPPORT_COLOR', letterSpacing: 4, textTransform: 'uppercase', marginBottom: 4 }}>{regionName}</div>
        <div style={{ fontSize: 60, fontWeight: 900, color: '#ff3333', lineHeight: 1 }}>{totalStat}</div>
        <div style={{ fontSize: 15, color: 'SUPPORT_COLOR', textTransform: 'uppercase', letterSpacing: 2, marginTop: 6 }}>{totalLabel}</div>
      </div>

      <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 4, backgroundColor: 'PRIMARY_COLOR', opacity: uiOp }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, width: barW, height: 4, backgroundColor: 'PRIMARY_COLOR' }} />
      <div style={{ position: 'absolute', top: 52, left: 0, width: 1920, textAlign: 'center', opacity: uiOp }}>
        <span style={{ fontSize: 28, fontWeight: 900, color: 'PRIMARY_COLOR', letterSpacing: 5, textTransform: 'uppercase' }}>{title}</span>
      </div>
      <div style={{ position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)', opacity: statOp, textAlign: 'center', width: 900 }}>
        <span style={{ fontSize: 17, color: 'SUPPORT_COLOR' }}>{contextText}</span>
      </div>
    </div>
  )
}

export default AnimationComponent
