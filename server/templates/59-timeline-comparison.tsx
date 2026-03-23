import React, { useMemo } from 'react'
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion'

export const AnimationComponent = () => {
  const frame = useCurrentFrame()

  const titleOp = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  const titleText = "TITLE_TEXT"
  const compareLabel1 = "COMPARE_LABEL_1"
  const compareLabel2 = "COMPARE_LABEL_2"

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

  const isValid = (item: any) => item.label !== '' && item.label !== 'Placeholder' && item.date !== '' && item.date !== 'Placeholder'

  const track1Events = useMemo(() => rawTrack1Events.filter(isValid), [])
  const track2Events = useMemo(() => rawTrack2Events.filter(isValid), [])

  const trackLeft = 200
  const trackRight = 1720
  const trackW = trackRight - trackLeft
  const track1Y = 380
  const track2Y = 660

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: 1920,
      height: 1080,
      overflow: 'hidden',
      backgroundColor: 'BACKGROUND_COLOR',
    }}>

      {/* Title */}
      <div style={{
        position: 'absolute',
        top: 60,
        left: 100,
        width: 1720,
        height: 60,
        overflow: 'hidden',
        fontSize: 22,
        fontWeight: 700,
        color: 'ACCENT_COLOR',
        letterSpacing: 6,
        textTransform: 'uppercase',
        opacity: titleOp,
      }}>
        {titleText}
      </div>

      {/* Track labels */}
      <div style={{
        position: 'absolute',
        top: track1Y - 50,
        left: trackLeft,
        width: 400,
        height: 36,
        overflow: 'hidden',
        fontSize: 18,
        fontWeight: 700,
        color: 'PRIMARY_COLOR',
        letterSpacing: 3,
        textTransform: 'uppercase',
        opacity: titleOp,
      }}>
        {compareLabel1}
      </div>
      <div style={{
        position: 'absolute',
        top: track2Y - 50,
        left: trackLeft,
        width: 400,
        height: 36,
        overflow: 'hidden',
        fontSize: 18,
        fontWeight: 700,
        color: 'SECONDARY_COLOR',
        letterSpacing: 3,
        textTransform: 'uppercase',
        opacity: titleOp,
      }}>
        {compareLabel2}
      </div>

      <svg width={1920} height={1080} style={{ position: 'absolute', top: 0, left: 0 }}>
        {/* Track lines */}
        <line x1={trackLeft} y1={track1Y} x2={trackRight} y2={track1Y} stroke="PRIMARY_COLOR" strokeWidth={3} opacity={titleOp} />
        <line x1={trackLeft} y1={track2Y} x2={trackRight} y2={track2Y} stroke="SECONDARY_COLOR" strokeWidth={3} opacity={titleOp} />

        {/* Vertical comparison connectors */}
        {track2Events.map((ev, i) => {
          const connOp = interpolate(frame, [50 + i * 6, 62 + i * 6], [0, 0.3], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          })
          return (
            <line
              key={i}
              x1={trackLeft + ev.x * trackW}
              y1={track1Y}
              x2={trackLeft + ev.x * trackW}
              y2={track2Y}
              stroke="GRID_LINE"
              strokeWidth={1}
              strokeDasharray="4 4"
              opacity={connOp}
            />
          )
        })}

        {/* Track 1 nodes */}
        {track1Events.map((ev, i) => {
          const nx = trackLeft + ev.x * trackW
          const nodeOp = interpolate(frame, [ev.delay, ev.delay + 12], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          })
          const nodeR = interpolate(frame, [ev.delay, ev.delay + 12], [0, 16], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          })
          return (
            <g key={i} opacity={nodeOp}>
              <circle cx={nx} cy={track1Y} r={nodeR} fill="NODE_FILL" stroke="PRIMARY_COLOR" strokeWidth={3} />
              <circle cx={nx} cy={track1Y} r={6} fill="PRIMARY_COLOR" />
            </g>
          )
        })}

        {/* Track 2 nodes */}
        {track2Events.map((ev, i) => {
          const nx = trackLeft + ev.x * trackW
          const nodeOp = interpolate(frame, [ev.delay, ev.delay + 12], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          })
          const nodeR = interpolate(frame, [ev.delay, ev.delay + 12], [0, 16], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          })
          return (
            <g key={i} opacity={nodeOp}>
              <circle cx={nx} cy={track2Y} r={nodeR} fill="NODE_FILL" stroke="SECONDARY_COLOR" strokeWidth={3} />
              <circle cx={nx} cy={track2Y} r={6} fill="SECONDARY_COLOR" />
            </g>
          )
        })}
      </svg>

      {/* Track 1 labels */}
      {track1Events.map((ev, i) => {
        const nx = trackLeft + ev.x * trackW
        const labelOp = interpolate(frame, [ev.delay + 6, ev.delay + 18], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        })
        return (
          <div key={i} style={{
            position: 'absolute',
            top: track1Y - 120,
            left: nx - 110,
            width: 220,
            height: 100,
            overflow: 'hidden',
            opacity: labelOp,
          }}>
            <div style={{
              position: 'absolute', top: 0, left: 0, width: 220, height: 28, overflow: 'hidden',
              fontSize: 15, fontWeight: 700, color: 'ACCENT_COLOR', textAlign: 'center', letterSpacing: 2,
            }}>
              {ev.date}
            </div>
            <div style={{
              position: 'absolute', top: 30, left: 0, width: 220, height: 60, overflow: 'hidden',
              fontSize: 19, fontWeight: 600, color: 'TEXT_ON_PRIMARY', textAlign: 'center', lineHeight: 1.3,
            }}>
              {ev.label}
            </div>
          </div>
        )
      })}

      {/* Track 2 labels */}
      {track2Events.map((ev, i) => {
        const nx = trackLeft + ev.x * trackW
        const labelOp = interpolate(frame, [ev.delay + 6, ev.delay + 18], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        })
        return (
          <div key={i} style={{
            position: 'absolute',
            top: track2Y + 30,
            left: nx - 110,
            width: 220,
            height: 100,
            overflow: 'hidden',
            opacity: labelOp,
          }}>
            <div style={{
              position: 'absolute', top: 0, left: 0, width: 220, height: 28, overflow: 'hidden',
              fontSize: 15, fontWeight: 700, color: 'ACCENT_COLOR', textAlign: 'center', letterSpacing: 2,
            }}>
              {ev.date}
            </div>
            <div style={{
              position: 'absolute', top: 30, left: 0, width: 220, height: 60, overflow: 'hidden',
              fontSize: 19, fontWeight: 600, color: 'TEXT_ON_PRIMARY', textAlign: 'center', lineHeight: 1.3,
            }}>
              {ev.label}
            </div>
          </div>
        )
      })}

      {/* Bottom bar */}
      <div style={{
        position: 'absolute',
        top: 1020,
        left: 0,
        width: 1920,
        height: 4,
        overflow: 'hidden',
        backgroundColor: 'ACCENT_COLOR',
        opacity: titleOp,
      }} />
    </div>
  )
}

export default AnimationComponent