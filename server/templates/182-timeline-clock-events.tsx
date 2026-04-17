import React, { useMemo } from 'react'
import { useCurrentFrame, interpolate, Easing } from 'remotion'

// Template: 182-timeline-clock-events
// Purpose: Minute-precision intra-day attack timeline
// Fields: TITLE_TEXT, TIME_LABEL_1..6, EVENT_LABEL_1..6, DATE_LABEL

export const AnimationComponent = () => {
  const frame = useCurrentFrame()

  const title      = 'TITLE_TEXT'
  const dateLabel  = 'DATE_LABEL'

  const rawEvents = [
    { time: 'TIME_LABEL_1', label: 'EVENT_LABEL_1' },
    { time: 'TIME_LABEL_2', label: 'EVENT_LABEL_2' },
    { time: 'TIME_LABEL_3', label: 'EVENT_LABEL_3' },
    { time: 'TIME_LABEL_4', label: 'EVENT_LABEL_4' },
    { time: 'TIME_LABEL_5', label: 'EVENT_LABEL_5' },
    { time: 'TIME_LABEL_6', label: 'EVENT_LABEL_6' },
  ]

  const events = useMemo(() =>
    rawEvents.filter(e => e.time !== '' && e.time !== 'Placeholder' && e.label !== '' && e.label !== 'Placeholder'),
  [])

  const count = events.length

  // ── Animation ──────────────────────────────────────────
  const headerOp = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const headerTy = interpolate(frame, [0, 20], [-20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  // Spine line draws from top
  const spineH   = interpolate(frame, [15, 60 + count * 8], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.quad) })

  const eventOps = events.map((_, i) =>
    interpolate(frame, [20 + i * 12, 38 + i * 12], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.back(1.2)) })
  )
  const eventTx = events.map((_, i) =>
    interpolate(frame, [20 + i * 12, 38 + i * 12], [-24, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  )

  const footerOp = interpolate(frame, [60 + count * 8, 80 + count * 8], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  // ── Layout ─────────────────────────────────────────────
  const spineX   = 720
  const rowH     = Math.min(110, Math.floor(700 / Math.max(count, 1)))
  const totalH   = count * rowH
  const startY   = (900 - totalH) / 2 + 20

  return (
    <div style={{
      position: 'absolute', inset: 0, overflow: 'hidden',
      backgroundColor: 'BACKGROUND_COLOR',
      fontFamily: 'Inter, system-ui, sans-serif',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {/* Safe frame */}
      <div style={{ width: 1600, height: 900, position: 'relative' }}>

        {/* Background grid */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(GRID_LINE 1px, transparent 1px), linear-gradient(90deg, GRID_LINE 1px, transparent 1px)',
          backgroundSize: '80px 80px',
          opacity: 0.35,
        }} />

        {/* Header */}
        <div style={{
          position: 'absolute', top: 48, left: 0, width: '100%', textAlign: 'center',
          opacity: headerOp, transform: `translateY(${headerTy}px)`,
        }}>
          <div style={{ fontSize: 11, fontWeight: 900, color: 'ACCENT_COLOR', letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: 8 }}>
            INCIDENT TIMELINE
          </div>
          <div style={{ fontSize: 36, fontWeight: 900, color: 'PRIMARY_COLOR', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            {title}
          </div>
          <div style={{ width: 80, height: 3, backgroundColor: 'ACCENT_COLOR', margin: '12px auto 0', borderRadius: 2 }} />
        </div>

        {/* Date badge */}
        <div style={{
          position: 'absolute', top: 52, right: 60,
          backgroundColor: 'PANEL_RIGHT_BG', border: '1px solid CHART_BORDER',
          borderRadius: 8, padding: '8px 18px',
          opacity: headerOp,
        }}>
          <div style={{ fontSize: 10, color: 'ACCENT_COLOR', fontWeight: 800, letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: 3 }}>DATE</div>
          <div style={{ fontSize: 16, color: 'PRIMARY_COLOR', fontWeight: 700, fontFamily: 'monospace' }}>{dateLabel}</div>
        </div>

        {/* Spine */}
        <div style={{
          position: 'absolute',
          left: spineX - 1,
          top: startY,
          width: 2,
          height: totalH * spineH,
          backgroundColor: 'CHART_BORDER',
        }} />

        {/* Events */}
        {events.map((evt, i) => {
          const y   = startY + i * rowH + rowH / 2
          const side = i % 2 === 0 ? 'left' : 'right'
          return (
            <div key={i} style={{
              position: 'absolute',
              top: y - 32,
              opacity: eventOps[i],
              transform: `translateX(${eventTx[i]}px)`,
              width: '100%',
            }}>
              {/* Connector tick */}
              <div style={{
                position: 'absolute',
                left: spineX - (side === 'left' ? 180 : -4),
                top: 28,
                width: side === 'left' ? 176 : 176,
                height: 1,
                backgroundColor: 'CHART_BORDER',
              }} />

              {/* Dot on spine */}
              <div style={{
                position: 'absolute',
                left: spineX - 7,
                top: 22,
                width: 14,
                height: 14,
                borderRadius: '50%',
                backgroundColor: 'ACCENT_COLOR',
                border: '2px solid BACKGROUND_COLOR',
                boxShadow: '0 0 12px ACCENT_COLOR',
                zIndex: 2,
              }} />

              {/* Time stamp — left of spine for even, right for odd */}
              {side === 'left' ? (
                <div style={{
                  position: 'absolute',
                  right: 1600 - spineX + 24,
                  top: 0,
                  textAlign: 'right',
                  width: 440,
                }}>
                  <div style={{ fontSize: 30, fontWeight: 900, color: 'PRIMARY_COLOR', fontFamily: 'monospace', lineHeight: 1, marginBottom: 6 }}>
                    {evt.time}
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 500, color: 'PRIMARY_COLOR', opacity: 0.75, lineHeight: 1.4 }}>
                    {evt.label}
                  </div>
                </div>
              ) : (
                <div style={{
                  position: 'absolute',
                  left: spineX + 24,
                  top: 0,
                  textAlign: 'left',
                  width: 440,
                }}>
                  <div style={{ fontSize: 30, fontWeight: 900, color: 'PRIMARY_COLOR', fontFamily: 'monospace', lineHeight: 1, marginBottom: 6 }}>
                    {evt.time}
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 500, color: 'PRIMARY_COLOR', opacity: 0.75, lineHeight: 1.4 }}>
                    {evt.label}
                  </div>
                </div>
              )}
            </div>
          )
        })}

        {/* Footer */}
        <div style={{
          position: 'absolute', bottom: 36, left: 0, width: '100%', textAlign: 'center',
          opacity: footerOp,
        }}>
          <div style={{ fontSize: 10, color: 'PRIMARY_COLOR', fontFamily: 'monospace', opacity: 0.35, letterSpacing: '0.25em' }}>
            CHRONOLOGICAL EVENT LOG // TIMES ARE LOCAL
          </div>
        </div>

      </div>
    </div>
  )
}

export default AnimationComponent
