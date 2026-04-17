import React, { useMemo } from 'react'
import { useCurrentFrame, interpolate, Easing } from 'remotion'

// Template: 184-parallel-events
// Purpose: Two simultaneous events happening in parallel (dual-release, coordinated attack, split timelines)
// Fields: TITLE_TEXT, TRACK_LABEL_1, TRACK_LABEL_2, EVENT_LABEL_1..4, EVENT_TIME_1..4, SYNC_LABEL

export const AnimationComponent = () => {
  const frame = useCurrentFrame()

  const title      = 'TITLE_TEXT'
  const syncLabel  = 'SYNC_LABEL'   // e.g. "SIMULTANEOUS RELEASE"

  // Track headers
  const trackA = 'TRACK_LABEL_1'
  const trackB = 'TRACK_LABEL_2'

  // Two events per track
  const rawEventsA = [
    { time: 'EVENT_TIME_1', label: 'EVENT_LABEL_1' },
    { time: 'EVENT_TIME_2', label: 'EVENT_LABEL_2' },
  ]
  const rawEventsB = [
    { time: 'EVENT_TIME_3', label: 'EVENT_LABEL_3' },
    { time: 'EVENT_TIME_4', label: 'EVENT_LABEL_4' },
  ]

  const eventsA = useMemo(() => rawEventsA.filter(e => e.label !== '' && e.label !== 'Placeholder'), [])
  const eventsB = useMemo(() => rawEventsB.filter(e => e.label !== '' && e.label !== 'Placeholder'), [])

  // ── Animations ────────────────────────────────────────────────────
  const headerOp  = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const headerTy  = interpolate(frame, [0, 20], [-18, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  // Center divider draws downward
  const dividerH  = interpolate(frame, [10, 50], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.quad) })

  // Track headers
  const trackOp   = interpolate(frame, [12, 28], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const trackTx   = interpolate(frame, [12, 28], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  // Track A events stagger
  const evAOps = eventsA.map((_, i) =>
    interpolate(frame, [28 + i * 14, 44 + i * 14], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.back(1.1)) })
  )
  const evATx = eventsA.map((_, i) =>
    interpolate(frame, [28 + i * 14, 44 + i * 14], [-30, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  )

  // Track B events stagger (same timing but from right)
  const evBOps = eventsB.map((_, i) =>
    interpolate(frame, [28 + i * 14, 44 + i * 14], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.back(1.1)) })
  )
  const evBTx = eventsB.map((_, i) =>
    interpolate(frame, [28 + i * 14, 44 + i * 14], [30, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  )

  // Sync badge pulses in
  const syncOp    = interpolate(frame, [50, 68], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.back(1.4)) })
  const syncScale = interpolate(frame, [50, 68], [0.6, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.back(1.4)) })

  // Connecting dashed line between first events of each track
  const connectOp = interpolate(frame, [44, 58], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  // ── Layout ────────────────────────────────────────────────────────
  const centerX     = 800
  const trackW      = 580
  const leftTrackX  = centerX - 60 - trackW  // right edge at center - 60
  const rightTrackX = centerX + 60            // left edge at center + 60
  const trackHeaderY = 180
  const firstEventY  = 280
  const eventGap     = 160

  return (
    <div style={{
      position: 'absolute', inset: 0, overflow: 'hidden',
      backgroundColor: 'BACKGROUND_COLOR',
      fontFamily: 'Inter, system-ui, sans-serif',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{ width: 1600, height: 900, position: 'relative' }}>

        {/* Dual spotlight — one per track */}
        <div style={{
          position: 'absolute', top: 100, left: leftTrackX + trackW / 2 - 300,
          width: 600, height: 600, borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(255,204,0,0.04) 0%, transparent 70%)',
        }} />
        <div style={{
          position: 'absolute', top: 100, left: rightTrackX + trackW / 2 - 300,
          width: 600, height: 600, borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(100,180,255,0.04) 0%, transparent 70%)',
        }} />

        {/* Header */}
        <div style={{
          position: 'absolute', top: 40, left: 0, width: '100%', textAlign: 'center',
          opacity: headerOp, transform: `translateY(${headerTy}px)`,
        }}>
          <div style={{ fontSize: 11, fontWeight: 900, color: 'ACCENT_COLOR', letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: 8 }}>
            COORDINATED OPERATION
          </div>
          <div style={{ fontSize: 34, fontWeight: 900, color: 'PRIMARY_COLOR', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {title}
          </div>
          <div style={{ width: 60, height: 3, backgroundColor: 'ACCENT_COLOR', margin: '10px auto 0', borderRadius: 2 }} />
        </div>

        {/* Center divider spine */}
        <div style={{
          position: 'absolute',
          left: centerX - 1,
          top: 140,
          width: 2,
          height: 660 * dividerH,
          background: 'linear-gradient(to bottom, ACCENT_COLOR, CHART_BORDER)',
        }} />

        {/* Sync badge — centered on spine */}
        <div style={{
          position: 'absolute',
          top: 430,
          left: centerX - 60,
          width: 120,
          opacity: syncOp,
          transform: `scale(${syncScale})`,
          textAlign: 'center',
          zIndex: 10,
        }}>
          <div style={{
            backgroundColor: 'ACCENT_COLOR',
            borderRadius: 8,
            padding: '8px 10px',
          }}>
            <div style={{ fontSize: 9, fontWeight: 900, color: 'BACKGROUND_COLOR', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 3 }}>
              SYNC
            </div>
            <div style={{ fontSize: 11, fontWeight: 800, color: 'BACKGROUND_COLOR', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {syncLabel}
            </div>
          </div>
        </div>

        {/* Track A — LEFT */}
        {/* Track header */}
        <div style={{
          position: 'absolute', top: trackHeaderY, left: leftTrackX, width: trackW,
          opacity: trackOp, transform: `translateX(${-trackTx}px)`,
        }}>
          <div style={{
            backgroundColor: 'PANEL_RIGHT_BG',
            border: '1px solid PRIMARY_COLOR',
            borderRadius: 10,
            padding: '14px 24px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 10, color: 'ACCENT_COLOR', fontWeight: 900, letterSpacing: '0.35em', textTransform: 'uppercase', marginBottom: 5 }}>
              TRACK A
            </div>
            <div style={{ fontSize: 22, fontWeight: 900, color: 'PRIMARY_COLOR', textTransform: 'uppercase' }}>
              {trackA}
            </div>
          </div>
        </div>

        {/* Track A events */}
        {eventsA.map((ev, i) => (
          <div key={i} style={{
            position: 'absolute',
            top: firstEventY + i * eventGap,
            left: leftTrackX,
            width: trackW,
            opacity: evAOps[i],
            transform: `translateX(${evATx[i]}px)`,
          }}>
            <div style={{
              backgroundColor: 'rgba(255,204,0,0.06)',
              border: '1px solid CHART_BORDER',
              borderLeft: '3px solid PRIMARY_COLOR',
              borderRadius: 8,
              padding: '18px 24px',
            }}>
              <div style={{ fontSize: 13, color: 'ACCENT_COLOR', fontWeight: 800, fontFamily: 'monospace', letterSpacing: '0.1em', marginBottom: 6 }}>
                {ev.time}
              </div>
              <div style={{ fontSize: 17, fontWeight: 600, color: 'PRIMARY_COLOR', lineHeight: 1.4 }}>
                {ev.label}
              </div>
            </div>
          </div>
        ))}

        {/* Track B — RIGHT */}
        {/* Track header */}
        <div style={{
          position: 'absolute', top: trackHeaderY, left: rightTrackX, width: trackW,
          opacity: trackOp, transform: `translateX(${trackTx}px)`,
        }}>
          <div style={{
            backgroundColor: 'PANEL_RIGHT_BG',
            border: '1px solid SECONDARY_COLOR',
            borderRadius: 10,
            padding: '14px 24px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 10, color: 'SECONDARY_COLOR', fontWeight: 900, letterSpacing: '0.35em', textTransform: 'uppercase', marginBottom: 5 }}>
              TRACK B
            </div>
            <div style={{ fontSize: 22, fontWeight: 900, color: 'PRIMARY_COLOR', textTransform: 'uppercase' }}>
              {trackB}
            </div>
          </div>
        </div>

        {/* Track B events */}
        {eventsB.map((ev, i) => (
          <div key={i} style={{
            position: 'absolute',
            top: firstEventY + i * eventGap,
            left: rightTrackX,
            width: trackW,
            opacity: evBOps[i],
            transform: `translateX(${evBTx[i]}px)`,
          }}>
            <div style={{
              backgroundColor: 'rgba(100,180,255,0.04)',
              border: '1px solid CHART_BORDER',
              borderLeft: '3px solid SECONDARY_COLOR',
              borderRadius: 8,
              padding: '18px 24px',
            }}>
              <div style={{ fontSize: 13, color: 'SECONDARY_COLOR', fontWeight: 800, fontFamily: 'monospace', letterSpacing: '0.1em', marginBottom: 6 }}>
                {ev.time}
              </div>
              <div style={{ fontSize: 17, fontWeight: 600, color: 'PRIMARY_COLOR', lineHeight: 1.4 }}>
                {ev.label}
              </div>
            </div>
          </div>
        ))}

        {/* Horizontal connection lines between first events of each track */}
        <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
          {eventsA.length > 0 && eventsB.length > 0 && (
            <line
              x1={leftTrackX + trackW}
              y1={firstEventY + 36}
              x2={rightTrackX}
              y2={firstEventY + 36}
              stroke="ACCENT_COLOR"
              strokeWidth={1}
              strokeDasharray="4 4"
              opacity={connectOp}
            />
          )}
          {eventsA.length > 1 && eventsB.length > 1 && (
            <line
              x1={leftTrackX + trackW}
              y1={firstEventY + eventGap + 36}
              x2={rightTrackX}
              y2={firstEventY + eventGap + 36}
              stroke="CHART_BORDER"
              strokeWidth={1}
              strokeDasharray="3 5"
              opacity={connectOp * 0.5}
            />
          )}
        </svg>

        {/* Footer */}
        <div style={{ position: 'absolute', bottom: 36, left: 0, width: '100%', textAlign: 'center', opacity: 0.28 }}>
          <div style={{ fontSize: 10, color: 'PRIMARY_COLOR', fontFamily: 'monospace', letterSpacing: '0.25em' }}>
            DUAL_TRACK_ANALYSIS // PARALLEL_EXECUTION_MAP
          </div>
        </div>

      </div>
    </div>
  )
}

export default AnimationComponent
