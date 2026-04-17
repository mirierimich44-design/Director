import React, { useMemo } from 'react'
import { useCurrentFrame, interpolate, Easing } from 'remotion'

// Template: 186-channel-cascade
// Purpose: Shows content spreading across a branded chain of social/comms platforms
// Fields: TITLE_TEXT, POST_AUTHOR, POST_TEXT, CHANNEL_1..5, METRIC_1..5, SPREAD_LABEL

export const AnimationComponent = () => {
  const frame = useCurrentFrame()

  const title       = 'TITLE_TEXT'
  const postAuthor  = 'POST_AUTHOR'    // e.g. "Sarah K. — Senior Engineer at Stripe"
  const postText    = 'POST_TEXT'      // excerpt of what was shared

  const rawChannels = [
    { name: 'CHANNEL_1', metric: 'METRIC_1' },
    { name: 'CHANNEL_2', metric: 'METRIC_2' },
    { name: 'CHANNEL_3', metric: 'METRIC_3' },
    { name: 'CHANNEL_4', metric: 'METRIC_4' },
    { name: 'CHANNEL_5', metric: 'METRIC_5' },
  ]

  const spreadLabel = 'SPREAD_LABEL'   // e.g. "APPEARED ORGANIC"

  // ── Platform brand map ───────────────────────────────────────────
  // Maps platform name (uppercase) → { color, icon, label }
  const BRANDS: Record<string, { color: string; icon: string; label: string }> = {
    LINKEDIN:   { color: '#0077B5', icon: 'in',  label: 'LinkedIn'   },
    TWITTER:    { color: '#1DA1F2', icon: '𝕏',   label: 'Twitter'    },
    'X':        { color: '#e7e7e7', icon: '𝕏',   label: 'X'          },
    GITHUB:     { color: '#6e40c9', icon: '⬡',   label: 'GitHub'     },
    SLACK:      { color: '#4A154B', icon: '#',    label: 'Slack'      },
    DISCORD:    { color: '#5865F2', icon: '⊕',   label: 'Discord'    },
    EMAIL:      { color: '#EA4335', icon: '@',    label: 'Email'      },
    GMAIL:      { color: '#EA4335', icon: '@',    label: 'Gmail'      },
    REDDIT:     { color: '#FF4500', icon: 'r/',   label: 'Reddit'     },
    TELEGRAM:   { color: '#2CA5E0', icon: '✈',   label: 'Telegram'   },
    WHATSAPP:   { color: '#25D366', icon: '✆',   label: 'WhatsApp'   },
    INSTAGRAM:  { color: '#E1306C', icon: '◈',   label: 'Instagram'  },
    FACEBOOK:   { color: '#1877F2', icon: 'f',    label: 'Facebook'   },
    YOUTUBE:    { color: '#FF0000', icon: '▶',   label: 'YouTube'    },
    NPM:        { color: '#CB3837', icon: '⬢',   label: 'npm'        },
    PYPI:       { color: '#3775A9', icon: '🐍',   label: 'PyPI'       },
    HACKERNEWS: { color: '#FF6600', icon: 'Y',    label: 'Hacker News'},
    MEDIUM:     { color: '#00ab6c', icon: 'M',    label: 'Medium'     },
    SUBSTACK:   { color: '#FF6719', icon: 'S',    label: 'Substack'   },
  }

  const resolveBrand = (raw: string) => {
    const key = raw.toUpperCase().replace(/[^A-Z0-9]/g, '')
    return BRANDS[key] ?? { color: 'PRIMARY_COLOR_HEX', icon: raw.slice(0, 2).toUpperCase(), label: raw }
  }

  const channels = useMemo(() =>
    rawChannels
      .filter(c => c.name !== '' && c.name !== 'Placeholder' && !c.name.startsWith('CHANNEL_'))
      .map(c => ({ ...c, brand: resolveBrand(c.name) })),
  [])

  const count = channels.length

  // ── Animations ────────────────────────────────────────────────────
  const headerOp  = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const headerTy  = interpolate(frame, [0, 20], [-16, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  const cardOp    = interpolate(frame, [8, 28], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.quad) })
  const cardTy    = interpolate(frame, [8, 28], [16, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  const nodeOps = channels.map((_, i) =>
    interpolate(frame, [28 + i * 12, 46 + i * 12], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.back(1.2)) })
  )
  const nodeScale = channels.map((_, i) =>
    interpolate(frame, [28 + i * 12, 46 + i * 12], [0.7, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.back(1.2)) })
  )
  const connectorOps = channels.map((_, i) =>
    interpolate(frame, [38 + i * 12, 52 + i * 12], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  )

  // Flow particle progress along each connector
  const particleProgress = channels.map((_, i) =>
    interpolate(frame % 60, [0, 60], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  )

  const badgeOp   = interpolate(frame, [30 + count * 12, 50 + count * 12], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.back(1.3)) })

  // ── Layout ────────────────────────────────────────────────────────
  const nodeW     = 130
  const nodeH     = 150
  const connW     = count > 1 ? Math.min(100, Math.floor((1100 - count * nodeW) / (count - 1))) : 0
  const totalW    = count * nodeW + (count - 1) * connW
  const chainY    = 580
  const chainX    = (1600 - totalW) / 2
  const postCardY = 160

  return (
    <div style={{
      position: 'absolute', inset: 0, overflow: 'hidden',
      backgroundColor: 'BACKGROUND_COLOR',
      fontFamily: 'Inter, system-ui, sans-serif',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{ width: 1600, height: 900, position: 'relative' }}>

        {/* Subtle grid */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(GRID_LINE 1px, transparent 1px), linear-gradient(90deg, GRID_LINE 1px, transparent 1px)',
          backgroundSize: '80px 80px', opacity: 0.3,
        }} />

        {/* Header */}
        <div style={{
          position: 'absolute', top: 40, left: 0, width: '100%', textAlign: 'center',
          opacity: headerOp, transform: `translateY(${headerTy}px)`,
        }}>
          <div style={{ fontSize: 11, fontWeight: 900, color: 'ACCENT_COLOR', letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: 8 }}>
            PLATFORM PROPAGATION
          </div>
          <div style={{ fontSize: 34, fontWeight: 900, color: 'PRIMARY_COLOR', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {title}
          </div>
          <div style={{ width: 60, height: 3, backgroundColor: 'ACCENT_COLOR', margin: '10px auto 0', borderRadius: 2 }} />
        </div>

        {/* Post preview card */}
        <div style={{
          position: 'absolute',
          top: postCardY,
          left: '50%',
          transform: `translateX(-50%) translateY(${cardTy}px)`,
          width: 760,
          opacity: cardOp,
        }}>
          <div style={{
            backgroundColor: 'PANEL_RIGHT_BG',
            border: '1px solid CHART_BORDER',
            borderRadius: 14,
            padding: '22px 28px',
            display: 'flex',
            gap: 18,
            alignItems: 'flex-start',
          }}>
            {/* Avatar placeholder */}
            <div style={{
              width: 48, height: 48, borderRadius: '50%', flexShrink: 0,
              backgroundColor: 'rgba(255,204,0,0.12)',
              border: '2px solid ACCENT_COLOR',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontSize: 18, color: 'ACCENT_COLOR', fontWeight: 900 }}>
                {postAuthor ? postAuthor.charAt(0).toUpperCase() : '?'}
              </span>
            </div>

            <div style={{ flex: 1 }}>
              {/* Author */}
              <div style={{ fontSize: 14, fontWeight: 700, color: 'PRIMARY_COLOR', marginBottom: 4 }}>
                {postAuthor}
              </div>
              {/* Post text */}
              <div style={{
                fontSize: 15, color: 'PRIMARY_COLOR', opacity: 0.8, lineHeight: 1.5,
                display: '-webkit-box', WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical', overflow: 'hidden',
              }}>
                {postText}
              </div>
            </div>

            {/* "Verified" badge corner */}
            <div style={{
              flexShrink: 0, alignSelf: 'flex-start',
              backgroundColor: 'rgba(220,50,50,0.12)',
              border: '1px solid rgba(220,50,50,0.4)',
              borderRadius: 6, padding: '4px 10px',
            }}>
              <span style={{ fontSize: 9, fontWeight: 900, color: 'rgba(220,80,80,0.9)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                FLAGGED
              </span>
            </div>
          </div>

          {/* Downward arrow to chain */}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 10 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: cardOp }}>
              <div style={{ width: 2, height: 24, backgroundColor: 'CHART_BORDER' }} />
              <div style={{ width: 0, height: 0, borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderTop: '8px solid CHART_BORDER' }} />
            </div>
          </div>
        </div>

        {/* Platform chain */}
        <div style={{ position: 'absolute', top: chainY, left: chainX, display: 'flex', alignItems: 'center' }}>
          {channels.map((ch, i) => (
            <React.Fragment key={i}>
              {/* Platform node */}
              <div style={{
                width: nodeW,
                opacity: nodeOps[i],
                transform: `scale(${nodeScale[i]})`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}>
                {/* Brand icon circle */}
                <div style={{
                  width: 72, height: 72, borderRadius: '50%',
                  backgroundColor: ch.brand.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 12,
                  boxShadow: `0 0 24px ${ch.brand.color}55`,
                  border: `2px solid ${ch.brand.color}`,
                  position: 'relative',
                }}>
                  {/* Animated ring pulse */}
                  <div style={{
                    position: 'absolute',
                    width: 88, height: 88, borderRadius: '50%',
                    border: `1px solid ${ch.brand.color}`,
                    opacity: 0.3 + Math.sin(frame / 20 + i) * 0.15,
                  }} />
                  <span style={{
                    fontSize: ch.brand.icon.length > 2 ? 20 : 26,
                    fontWeight: 900,
                    color: '#fff',
                    fontFamily: 'monospace',
                    lineHeight: 1,
                  }}>
                    {ch.brand.icon}
                  </span>
                </div>

                {/* Platform label */}
                <div style={{
                  fontSize: 13, fontWeight: 800,
                  color: 'PRIMARY_COLOR',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  textAlign: 'center',
                  marginBottom: 6,
                }}>
                  {ch.brand.label}
                </div>

                {/* Metric */}
                {ch.metric && (
                  <div style={{
                    fontSize: 11, color: 'PRIMARY_COLOR', opacity: 0.55,
                    textAlign: 'center', lineHeight: 1.3,
                    padding: '0 8px',
                  }}>
                    {ch.metric}
                  </div>
                )}
              </div>

              {/* Connector + particle */}
              {i < channels.length - 1 && (
                <div style={{
                  width: connW, flexShrink: 0, position: 'relative',
                  height: 2,
                  opacity: connectorOps[i],
                }}>
                  {/* Line */}
                  <div style={{ width: '100%', height: 2, backgroundColor: 'CHART_BORDER', borderRadius: 1 }} />

                  {/* Flow particle */}
                  <div style={{
                    position: 'absolute',
                    top: -4,
                    left: particleProgress[i] * connW - 5,
                    width: 10, height: 10, borderRadius: '50%',
                    backgroundColor: channels[i].brand.color,
                    boxShadow: `0 0 8px ${channels[i].brand.color}`,
                    opacity: connectorOps[i],
                    transition: 'left 0.05s linear',
                  }} />

                  {/* Arrowhead at end */}
                  <div style={{
                    position: 'absolute',
                    right: -6, top: -5,
                    width: 0, height: 0,
                    borderTop: '6px solid transparent',
                    borderBottom: '6px solid transparent',
                    borderLeft: `8px solid CHART_BORDER`,
                  }} />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Spread badge */}
        <div style={{
          position: 'absolute',
          bottom: 52,
          left: '50%',
          transform: 'translateX(-50%)',
          opacity: badgeOp,
          textAlign: 'center',
        }}>
          <div style={{
            backgroundColor: 'rgba(220,50,50,0.1)',
            border: '1px solid rgba(220,50,50,0.4)',
            borderRadius: 8,
            padding: '10px 28px',
            display: 'inline-block',
          }}>
            <div style={{ fontSize: 10, color: 'rgba(220,80,80,0.8)', fontWeight: 900, letterSpacing: '0.35em', textTransform: 'uppercase', marginBottom: 4 }}>
              TRUST SIGNAL
            </div>
            <div style={{ fontSize: 18, fontWeight: 900, color: 'rgba(230,100,100,1)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {spreadLabel}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ position: 'absolute', bottom: 32, left: 0, width: '100%', textAlign: 'center', opacity: 0.25 }}>
          <div style={{ fontSize: 10, color: 'PRIMARY_COLOR', fontFamily: 'monospace', letterSpacing: '0.22em' }}>
            CHANNEL_PROPAGATION_MAP // SOCIAL_ENGINEERING_TRACE
          </div>
        </div>

      </div>
    </div>
  )
}

export default AnimationComponent
