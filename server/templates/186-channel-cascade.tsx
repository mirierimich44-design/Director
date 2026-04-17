import React, { useMemo } from 'react'
import { useCurrentFrame, interpolate, Easing } from 'remotion'

// Template: 186-channel-cascade
// Layout: Full-width horizontal platform bars stacked vertically.
// Each platform is a screen-wide branded strip — color block on left,
// platform name large, content excerpt on right. Slides in one by one.
// Fields: TITLE_TEXT, POST_AUTHOR, POST_TEXT, CHANNEL_1..5, METRIC_1..5, SPREAD_LABEL

export const AnimationComponent = () => {
  const frame = useCurrentFrame()

  const title      = 'TITLE_TEXT'
  const postAuthor = 'POST_AUTHOR'
  const postText   = 'POST_TEXT'
  const spreadLabel = 'SPREAD_LABEL'

  const rawChannels = [
    { name: 'CHANNEL_1', metric: 'METRIC_1' },
    { name: 'CHANNEL_2', metric: 'METRIC_2' },
    { name: 'CHANNEL_3', metric: 'METRIC_3' },
    { name: 'CHANNEL_4', metric: 'METRIC_4' },
    { name: 'CHANNEL_5', metric: 'METRIC_5' },
  ]

  // ── Platform brand map ───────────────────────────────────────────
  const BRANDS: Record<string, { color: string; icon: string; label: string }> = {
    LINKEDIN:   { color: '#0077B5', icon: 'in',  label: 'LinkedIn'    },
    TWITTER:    { color: '#1DA1F2', icon: '𝕏',   label: 'Twitter'     },
    X:          { color: '#e7e7e7', icon: '𝕏',   label: 'X'           },
    GITHUB:     { color: '#6e40c9', icon: '⬡',   label: 'GitHub'      },
    SLACK:      { color: '#611f69', icon: '#',    label: 'Slack'       },
    DISCORD:    { color: '#5865F2', icon: '⊕',   label: 'Discord'     },
    EMAIL:      { color: '#EA4335', icon: '@',    label: 'Email'       },
    GMAIL:      { color: '#EA4335', icon: '@',    label: 'Gmail'       },
    REDDIT:     { color: '#FF4500', icon: 'r/',   label: 'Reddit'      },
    TELEGRAM:   { color: '#2CA5E0', icon: '✈',   label: 'Telegram'    },
    WHATSAPP:   { color: '#25D366', icon: '✆',   label: 'WhatsApp'    },
    INSTAGRAM:  { color: '#C13584', icon: '◈',   label: 'Instagram'   },
    FACEBOOK:   { color: '#1877F2', icon: 'f',    label: 'Facebook'    },
    YOUTUBE:    { color: '#FF0000', icon: '▶',   label: 'YouTube'     },
    NPM:        { color: '#CB3837', icon: '⬢',   label: 'npm'         },
    PYPI:       { color: '#3775A9', icon: 'Py',   label: 'PyPI'        },
    HACKERNEWS: { color: '#FF6600', icon: 'Y',    label: 'Hacker News' },
    MEDIUM:     { color: '#00ab6c', icon: 'M',    label: 'Medium'      },
    SUBSTACK:   { color: '#FF6719', icon: 'S',    label: 'Substack'    },
  }

  const resolve = (raw: string) => {
    const key = raw.toUpperCase().replace(/[^A-Z0-9]/g, '')
    return BRANDS[key] ?? { color: '#888888', icon: raw.slice(0, 2).toUpperCase(), label: raw }
  }

  const channels = useMemo(() =>
    rawChannels
      .filter(c => c.name !== '' && c.name !== 'Placeholder' && !c.name.startsWith('CHANNEL_'))
      .map(c => ({ ...c, brand: resolve(c.name) })),
  [])

  const count = channels.length

  // ── Animations ───────────────────────────────────────────────────
  const headerOp = interpolate(frame, [0, 18], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const headerTy = interpolate(frame, [0, 18], [-14, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  // Each bar slides in from the left
  const barTx = channels.map((_, i) =>
    interpolate(frame, [12 + i * 10, 30 + i * 10], [-1920, 0], {
      extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
      easing: Easing.out(Easing.expo),
    })
  )
  const barOp = channels.map((_, i) =>
    interpolate(frame, [12 + i * 10, 28 + i * 10], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  )

  // Content text fades in slightly after bar
  const textOp = channels.map((_, i) =>
    interpolate(frame, [24 + i * 10, 38 + i * 10], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  )

  // Badge
  const badgeOp = interpolate(frame, [20 + count * 10, 38 + count * 10], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: Easing.out(Easing.back(1.3)),
  })

  // ── Layout ───────────────────────────────────────────────────────
  const barH      = Math.min(120, Math.floor(700 / Math.max(count, 1)))
  const barGap    = 8
  const totalH    = count * barH + (count - 1) * barGap
  const startY    = (900 - totalH) / 2 + 30
  const iconBlockW = 200   // colored brand block width

  return (
    <div style={{
      position: 'absolute', inset: 0, overflow: 'hidden',
      backgroundColor: 'BACKGROUND_COLOR',
      fontFamily: 'Inter, system-ui, sans-serif',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{ width: 1600, height: 900, position: 'relative' }}>

        {/* Header */}
        <div style={{
          position: 'absolute', top: 36, left: 0, width: '100%', textAlign: 'center',
          opacity: headerOp, transform: `translateY(${headerTy}px)`, zIndex: 10,
        }}>
          <div style={{ fontSize: 11, fontWeight: 900, color: 'ACCENT_COLOR', letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: 6 }}>
            PLATFORM PROPAGATION
          </div>
          <div style={{ fontSize: 30, fontWeight: 900, color: 'PRIMARY_COLOR', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
            {title}
          </div>
          <div style={{ width: 56, height: 3, backgroundColor: 'ACCENT_COLOR', margin: '8px auto 0', borderRadius: 2 }} />
        </div>

        {/* Platform bars */}
        {channels.map((ch, i) => {
          const y = startY + i * (barH + barGap)
          return (
            <div key={i} style={{
              position: 'absolute',
              top: y,
              left: 0,
              width: 1600,
              height: barH,
              opacity: barOp[i],
              transform: `translateX(${barTx[i]}px)`,
              display: 'flex',
              overflow: 'hidden',
              borderRadius: 10,
              border: '1px solid CHART_BORDER',
            }}>
              {/* ── Brand color block (left) ─────────────── */}
              <div style={{
                width: iconBlockW,
                height: '100%',
                backgroundColor: ch.brand.color,
                flexShrink: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden',
              }}>
                {/* Large icon — fills most of the block */}
                <div style={{
                  fontSize: barH * 0.52,
                  lineHeight: 1,
                  color: 'rgba(255,255,255,0.20)',
                  position: 'absolute',
                  fontWeight: 900,
                  fontFamily: 'monospace',
                  userSelect: 'none',
                  letterSpacing: '-0.05em',
                }}>
                  {ch.brand.icon}
                </div>
                {/* Readable icon on top */}
                <div style={{
                  fontSize: barH * 0.32,
                  lineHeight: 1,
                  color: '#fff',
                  fontWeight: 900,
                  fontFamily: 'monospace',
                  zIndex: 1,
                  marginBottom: 6,
                }}>
                  {ch.brand.icon}
                </div>
                {/* Platform name under icon */}
                <div style={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: 'rgba(255,255,255,0.85)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  zIndex: 1,
                }}>
                  {ch.brand.label}
                </div>
              </div>

              {/* ── Content area (right) ─────────────────── */}
              <div style={{
                flex: 1,
                backgroundColor: 'PANEL_RIGHT_BG',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                padding: '0 32px',
                opacity: textOp[i],
              }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 8 }}>
                  {/* Author */}
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'PRIMARY_COLOR', opacity: 0.9 }}>
                    {postAuthor}
                  </div>
                  {/* Metric pill */}
                  {ch.metric && (
                    <div style={{
                      fontSize: 11, fontWeight: 700,
                      color: ch.brand.color,
                      backgroundColor: ch.brand.color + '1A',
                      border: `1px solid ${ch.brand.color}55`,
                      borderRadius: 20,
                      padding: '2px 12px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      flexShrink: 0,
                    }}>
                      {ch.metric}
                    </div>
                  )}
                </div>
                {/* Post text */}
                <div style={{
                  fontSize: Math.min(15, barH * 0.13),
                  color: 'PRIMARY_COLOR',
                  opacity: 0.65,
                  lineHeight: 1.45,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}>
                  {postText}
                </div>
              </div>

              {/* ── Right accent strip ───────────────────── */}
              <div style={{
                width: 5,
                backgroundColor: ch.brand.color,
                flexShrink: 0,
                opacity: 0.7,
              }} />
            </div>
          )
        })}

        {/* Spread badge */}
        <div style={{
          position: 'absolute', bottom: 40, right: 60,
          opacity: badgeOp,
        }}>
          <div style={{
            backgroundColor: 'rgba(220,50,50,0.10)',
            border: '1px solid rgba(220,50,50,0.45)',
            borderRadius: 8,
            padding: '10px 24px',
          }}>
            <div style={{ fontSize: 9, color: 'rgba(220,80,80,0.8)', fontWeight: 900, letterSpacing: '0.35em', textTransform: 'uppercase', marginBottom: 4 }}>
              TRUST SIGNAL
            </div>
            <div style={{ fontSize: 17, fontWeight: 900, color: 'rgba(230,100,100,1)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {spreadLabel}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ position: 'absolute', bottom: 30, left: 60, opacity: 0.22 }}>
          <div style={{ fontSize: 10, color: 'PRIMARY_COLOR', fontFamily: 'monospace', letterSpacing: '0.22em' }}>
            CHANNEL_PROPAGATION // SOCIAL_ENGINEERING_TRACE
          </div>
        </div>

      </div>
    </div>
  )
}

export default AnimationComponent
