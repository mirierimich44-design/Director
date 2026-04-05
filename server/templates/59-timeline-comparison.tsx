import React, { useMemo } from 'react'
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion'

export const AnimationComponent = () => {
  const frame = useCurrentFrame()

  const titleOp = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  const titleText     = 'TITLE_TEXT'
  const compareLabel1 = 'COMPARE_LABEL_1'
  const compareLabel2 = 'COMPARE_LABEL_2'

  const rawTrack1Events = [
    { label: 'EVENT_1', date: 'DATE_1', x: 0.10, delay: 14 },
    { label: 'EVENT_2', date: 'DATE_2', x: 0.30, delay: 24 },
    { label: 'EVENT_3', date: 'DATE_3', x: 0.55, delay: 34 },
    { label: 'EVENT_4', date: 'DATE_4', x: 0.80, delay: 44 },
  ]

  const rawTrack2Events = [
    { label: 'EVENT_5', date: 'DATE_5', x: 0.15, delay: 18 },
    { label: 'EVENT_6', date: 'DATE_6', x: 0.40, delay: 28 },
    { label: 'STEP_1',  date: 'PHASE_1', x: 0.65, delay: 38 },
    { label: 'STEP_2',  date: 'PHASE_2', x: 0.88, delay: 48 },
  ]

  const isValid = (item: any) =>
    item.label !== '' && item.label !== 'Placeholder' &&
    item.date  !== '' && item.date  !== 'Placeholder'

  const track1Events = useMemo(() => rawTrack1Events.filter(isValid), [])
  const track2Events = useMemo(() => rawTrack2Events.filter(isValid), [])

  const trackLeft  = 200
  const trackRight = 1720
  const trackW     = trackRight - trackLeft
  const track1Y    = 360
  const track2Y    = 680

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden', backgroundColor: 'BACKGROUND_COLOR', fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* Title */}
      <div style={{
        position: 'absolute', top: 50, left: 100, width: 1720,
        fontSize: 48, fontWeight: 900, color: 'ACCENT_COLOR',
        letterSpacing: 4, textTransform: 'uppercase', opacity: titleOp,
      }}>
        {titleText}
      </div>

      {/* Track labels */}
      <div style={{
        position: 'absolute', top: track1Y - 56, left: trackLeft, width: 500,
        fontSize: 32, fontWeight: 800, color: 'PRIMARY_COLOR',
        letterSpacing: 2, textTransform: 'uppercase', opacity: titleOp,
      }}>
        {compareLabel1}
      </div>
      <div style={{
        position: 'absolute', top: track2Y - 56, left: trackLeft, width: 500,
        fontSize: 32, fontWeight: 800, color: 'SECONDARY_COLOR',
        letterSpacing: 2, textTransform: 'uppercase', opacity: titleOp,
      }}>
        {compareLabel2}
      </div>

      <svg width={1920} height={1080} style={{ position: 'absolute', top: 0, left: 0 }}>
        {/* Track lines */}
        <line x1={trackLeft} y1={track1Y} x2={trackRight} y2={track1Y} stroke="PRIMARY_COLOR"   strokeWidth={6} opacity={titleOp} />
        <line x1={trackLeft} y1={track2Y} x2={trackRight} y2={track2Y} stroke="SECONDARY_COLOR" strokeWidth={6} opacity={titleOp} />

        {/* Vertical comparison connectors */}
        {track2Events.map((ev, i) => {
          const connOp = interpolate(frame, [50 + i * 6, 62 + i * 6], [0, 0.35], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
          return (
            <line
              key={i}
              x1={trackLeft + ev.x * trackW} y1={track1Y}
              x2={trackLeft + ev.x * trackW} y2={track2Y}
              stroke="GRID_LINE" strokeWidth={2} strokeDasharray="6 5" opacity={connOp}
            />
          )
        })}

        {/* Track 1 nodes */}
        {track1Events.map((ev, i) => {
          const nx     = trackLeft + ev.x * trackW
          const nodeOp = interpolate(frame, [ev.delay, ev.delay + 12], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
          const nodeR  = interpolate(frame, [ev.delay, ev.delay + 12], [0, 20], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
          return (
            <g key={i} opacity={nodeOp}>
              <circle cx={nx} cy={track1Y} r={nodeR} fill="NODE_FILL" stroke="PRIMARY_COLOR" strokeWidth={4} />
              <circle cx={nx} cy={track1Y} r={7} fill="PRIMARY_COLOR" />
            </g>
          )
        })}

        {/* Track 2 nodes */}
        {track2Events.map((ev, i) => {
          const nx     = trackLeft + ev.x * trackW
          const nodeOp = interpolate(frame, [ev.delay, ev.delay + 12], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
          const nodeR  = interpolate(frame, [ev.delay, ev.delay + 12], [0, 20], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
          return (
            <g key={i} opacity={nodeOp}>
              <circle cx={nx} cy={track2Y} r={nodeR} fill="NODE_FILL" stroke="SECONDARY_COLOR" strokeWidth={4} />
              <circle cx={nx} cy={track2Y} r={7} fill="SECONDARY_COLOR" />
            </g>
          )
        })}
      </svg>

      {/* Track 1 labels — above the track */}
      {track1Events.map((ev, i) => {
        const nx      = trackLeft + ev.x * trackW
        const labelOp = interpolate(frame, [ev.delay + 6, ev.delay + 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
        return (
          <div key={i} style={{ position: 'absolute', top: track1Y - 148, left: nx - 130, width: 260, opacity: labelOp }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'ACCENT_COLOR', textAlign: 'center', letterSpacing: 2, marginBottom: 6 }}>
              {ev.date}
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: 'TEXT_ON_PRIMARY', textAlign: 'center', lineHeight: 1.25 }}>
              {ev.label}
            </div>
          </div>
        )
      })}

      {/* Track 2 labels — below the track */}
      {track2Events.map((ev, i) => {
        const nx      = trackLeft + ev.x * trackW
        const labelOp = interpolate(frame, [ev.delay + 6, ev.delay + 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
        return (
          <div key={i} style={{ position: 'absolute', top: track2Y + 36, left: nx - 130, width: 260, opacity: labelOp }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'ACCENT_COLOR', textAlign: 'center', letterSpacing: 2, marginBottom: 6 }}>
              {ev.date}
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: 'TEXT_ON_PRIMARY', textAlign: 'center', lineHeight: 1.25 }}>
              {ev.label}
            </div>
          </div>
        )
      })}

      {/* Bottom accent bar */}
      <div style={{ position: 'absolute', top: 1074, left: 0, width: 1920, height: 6, backgroundColor: 'ACCENT_COLOR', opacity: titleOp }} />
    </div>
  )
}

export default AnimationComponent
