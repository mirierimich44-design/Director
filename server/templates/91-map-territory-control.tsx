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
  const side1Label = "MAP_LABEL_1"
  const side2Label = "MAP_LABEL_2"
  const stat1 = "STAT_VALUE_1"
  const stat2 = "STAT_VALUE_2"
  const label1 = "LABEL_1"
  const label2 = "LABEL_2"

  // Two territory polygons — left (side1) and right (side2)
  // Designed for a regional conflict zone around eastern Europe/Middle East area
  // map center [32, 48], zoom 4
  const territory1 = 'M 540,200 L 720,190 L 800,250 L 820,340 L 790,440 L 730,510 L 640,530 L 540,510 L 460,450 L 430,360 L 440,270 Z'
  const territory2 = 'M 800,250 L 960,200 L 1080,220 L 1150,290 L 1140,390 L 1080,470 L 980,510 L 860,510 L 790,440 L 820,340 Z'

  // Front line: shared border between territories
  const frontLine = 'M 800,250 L 820,340 L 790,440'

  useEffect(() => {
    if (!mapRef.current) return
    const m = new maplibregl.Map({
      container: mapRef.current,
      style: 'https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json',
      interactive: false,
      fadeDuration: 0,
      center: [32, 48],
      zoom: 4,
    })
    m.on('load', () => continueRender(handle))
    return () => m.remove()
  }, [handle])

  const uiOp   = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' })
  const mapOp  = interpolate(frame, [10, 30], [0, 1], { extrapolateRight: 'clamp' })
  const t1Op   = interpolate(frame, [20, 45], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) })
  const t2Op   = interpolate(frame, [35, 60], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) })
  const frontDash = interpolate(frame, [55, 110], [500, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const frontOp   = interpolate(frame, [55, 75], [0, 1], { extrapolateRight: 'clamp' })
  const statOp    = interpolate(frame, [80, 100], [0, 1], { extrapolateRight: 'clamp' })
  const labelOp   = interpolate(frame, [90, 110], [0, 1], { extrapolateRight: 'clamp' })
  const barW      = interpolate(frame, [5, 35], [0, 1920], { extrapolateRight: 'clamp' })

  // Front line pulse
  const flPulse   = interpolate(frame % 30, [0, 15, 30], [1, 3, 1])
  const flPulseOp = interpolate(frame % 30, [0, 15, 30], [0.9, 0.4, 0.9])

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden', backgroundColor: 'BACKGROUND_COLOR', fontFamily: 'sans-serif' }}>
      <div ref={mapRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: mapOp * 0.6 , filter: 'brightness(2.2) contrast(1.15)'}} />

      <svg width={1920} height={1080} style={{ position: 'absolute', top: 0, left: 0 }}>
        <defs>
          <filter id="tc-glow">
            <feGaussianBlur stdDeviation="8" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="tc-glow-sm">
            <feGaussianBlur stdDeviation="3" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        {/* Territory 1 — PRIMARY_COLOR */}
        <path d={territory1} fill="PRIMARY_COLOR" opacity={t1Op * 0.35} filter="url(#tc-glow)" />
        <path d={territory1} fill="PRIMARY_COLOR" opacity={t1Op * 0.2} />
        <path d={territory1} fill="none" stroke="PRIMARY_COLOR" strokeWidth={2} opacity={t1Op * 0.7} />

        {/* Territory 2 — SECONDARY_COLOR */}
        <path d={territory2} fill="SECONDARY_COLOR" opacity={t2Op * 0.35} filter="url(#tc-glow)" />
        <path d={territory2} fill="SECONDARY_COLOR" opacity={t2Op * 0.2} />
        <path d={territory2} fill="none" stroke="SECONDARY_COLOR" strokeWidth={2} opacity={t2Op * 0.7} />

        {/* Front line */}
        <path d={frontLine} fill="none" stroke="#ff4444" strokeWidth={flPulse + 2} strokeDasharray={500} strokeDashoffset={frontDash}
          opacity={frontOp * flPulseOp} strokeLinecap="round" filter="url(#tc-glow-sm)" />
        <path d={frontLine} fill="none" stroke="#ff4444" strokeWidth={2} strokeDasharray="8 6"
          opacity={frontOp * 0.8} strokeLinecap="round" />

        {/* Front line label */}
        {frontOp > 0.1 && (
          <text x={810} y={350} textAnchor="middle" fill="#ff4444" fontSize={13} fontWeight={700} fontFamily="sans-serif" letterSpacing={2} opacity={frontOp}>
            FRONT LINE
          </text>
        )}
      </svg>

      {/* Chrome */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 4, backgroundColor: 'PRIMARY_COLOR', opacity: uiOp }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, width: barW, height: 4, backgroundColor: 'PRIMARY_COLOR' }} />

      <div style={{ position: 'absolute', top: 52, left: 0, width: 1920, textAlign: 'center', opacity: uiOp }}>
        <span style={{ fontSize: 30, fontWeight: 900, color: 'PRIMARY_COLOR', letterSpacing: 5, textTransform: 'uppercase' }}>{title}</span>
      </div>

      {/* Side 1 card */}
      <div style={{ position: 'absolute', top: 160, left: 80, width: 280, opacity: statOp, backgroundColor: 'rgba(8,8,18,0.9)', border: '2px solid PRIMARY_COLOR', borderRadius: 8, padding: '18px 22px' }}>
        <div style={{ width: 16, height: 16, borderRadius: 3, backgroundColor: 'PRIMARY_COLOR', marginBottom: 10 }} />
        <div style={{ fontSize: 22, fontWeight: 900, color: '#fff', marginBottom: 6, textTransform: 'uppercase' }}>{side1Label}</div>
        <div style={{ fontSize: 40, fontWeight: 900, color: 'PRIMARY_COLOR', lineHeight: 1 }}>{stat1}</div>
        <div style={{ fontSize: 13, color: 'SUPPORT_COLOR', textTransform: 'uppercase', letterSpacing: 1, marginTop: 6 }}>{label1}</div>
      </div>

      {/* Side 2 card */}
      <div style={{ position: 'absolute', top: 160, right: 80, width: 280, opacity: statOp, backgroundColor: 'rgba(8,8,18,0.9)', border: '2px solid SECONDARY_COLOR', borderRadius: 8, padding: '18px 22px', textAlign: 'right' }}>
        <div style={{ width: 16, height: 16, borderRadius: 3, backgroundColor: 'SECONDARY_COLOR', marginBottom: 10, marginLeft: 'auto' }} />
        <div style={{ fontSize: 22, fontWeight: 900, color: '#fff', marginBottom: 6, textTransform: 'uppercase' }}>{side2Label}</div>
        <div style={{ fontSize: 40, fontWeight: 900, color: 'SECONDARY_COLOR', lineHeight: 1 }}>{stat2}</div>
        <div style={{ fontSize: 13, color: 'SUPPORT_COLOR', textTransform: 'uppercase', letterSpacing: 1, marginTop: 6 }}>{label2}</div>
      </div>

      {/* Context */}
      <div style={{ position: 'absolute', bottom: 28, left: '50%', transform: 'translateX(-50%)', opacity: labelOp, textAlign: 'center', width: 900 }}>
        <span style={{ fontSize: 18, color: 'SUPPORT_COLOR' }}>{contextText}</span>
      </div>
    </div>
  )
}

export default AnimationComponent
