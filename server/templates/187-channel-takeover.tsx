import React, { useMemo } from 'react'
import { useCurrentFrame, interpolate, Easing } from 'remotion'

// Template: 187-channel-takeover
// Layout: Each platform takes over the FULL SCREEN one at a time — a hard cut
// branded wipe. The platform color floods in, giant icon fills center,
// platform name and metric overlay. Feels like flipping through channels.
// Fields: TITLE_TEXT, CHANNEL_1..5, METRIC_1..5, CONTENT_TEXT

export const AnimationComponent = () => {
  const frame = useCurrentFrame()

  const title       = 'TITLE_TEXT'
  const contentText = 'CONTENT_TEXT'  // what was shared/posted

  const rawChannels = [
    { name: 'CHANNEL_1', metric: 'METRIC_1' },
    { name: 'CHANNEL_2', metric: 'METRIC_2' },
    { name: 'CHANNEL_3', metric: 'METRIC_3' },
    { name: 'CHANNEL_4', metric: 'METRIC_4' },
    { name: 'CHANNEL_5', metric: 'METRIC_5' },
  ]

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

  // Each platform holds the screen for HOLD_FRAMES, then transitions
  const HOLD   = 30   // frames each platform is visible
  const TRANS  = 10   // transition frames
  const PERIOD = HOLD + TRANS
  const START  = 20   // header finishes first

  // Which platform is active
  const elapsed      = Math.max(0, frame - START)
  const activeIndex  = Math.min(Math.floor(elapsed / PERIOD), count - 1)
  const phaseFrame   = elapsed - activeIndex * PERIOD
  const isTransOut   = phaseFrame > HOLD

  // Header
  const headerOp = interpolate(frame, [0, 18], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  // For each platform, compute its visibility opacity
  const platformOp = channels.map((_, i) => {
    if (i < activeIndex) return 0
    if (i > activeIndex) return 0
    // Currently active
    if (phaseFrame < 8)    return interpolate(phaseFrame, [0, 8], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    if (isTransOut)        return interpolate(phaseFrame, [HOLD, HOLD + TRANS], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    return 1
  })

  // Icon scale: pops in with a bounce
  const iconScale = channels.map((_, i) => {
    if (i !== activeIndex) return 0
    return interpolate(phaseFrame, [0, 14], [0.4, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.back(1.5)) })
  })

  // Content text fades in after icon
  const textOp = channels.map((_, i) => {
    if (i !== activeIndex) return 0
    return interpolate(phaseFrame, [10, 22], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  })

  // Pip indicators
  const finalPipOp = interpolate(frame, [START + (count - 1) * PERIOD + 10, START + count * PERIOD], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  return (
    <div style={{
      position: 'absolute', inset: 0, overflow: 'hidden',
      backgroundColor: 'BACKGROUND_COLOR',
      fontFamily: 'Inter, system-ui, sans-serif',
    }}>

      {/* Platform full-screen takeovers */}
      {channels.map((ch, i) => (
        <div key={i} style={{
          position: 'absolute', inset: 0,
          backgroundColor: ch.brand.color,
          opacity: platformOp[i],
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {/* Giant ghost icon background */}
          <div style={{
            position: 'absolute',
            fontSize: 480,
            lineHeight: 1,
            color: 'rgba(255,255,255,0.07)',
            fontWeight: 900,
            fontFamily: 'monospace',
            userSelect: 'none',
            pointerEvents: 'none',
          }}>
            {ch.brand.icon}
          </div>

          {/* Centered content */}
          <div style={{
            textAlign: 'center',
            zIndex: 1,
            transform: `scale(${iconScale[i]})`,
          }}>
            {/* Platform icon — large */}
            <div style={{
              fontSize: 160,
              lineHeight: 1,
              color: '#fff',
              fontWeight: 900,
              fontFamily: 'monospace',
              marginBottom: 20,
              textShadow: '0 0 60px rgba(0,0,0,0.4)',
            }}>
              {ch.brand.icon}
            </div>

            {/* Platform name */}
            <div style={{
              fontSize: 64,
              fontWeight: 900,
              color: '#fff',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              marginBottom: 16,
              textShadow: '0 2px 20px rgba(0,0,0,0.3)',
            }}>
              {ch.brand.label}
            </div>

            {/* Divider */}
            <div style={{ width: 120, height: 3, backgroundColor: 'rgba(255,255,255,0.5)', margin: '0 auto 20px', borderRadius: 2 }} />

            {/* Metric */}
            <div style={{
              fontSize: 24,
              fontWeight: 600,
              color: 'rgba(255,255,255,0.85)',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              opacity: textOp[i],
            }}>
              {ch.metric}
            </div>

            {/* Content text */}
            <div style={{
              marginTop: 20,
              maxWidth: 800,
              fontSize: 18,
              color: 'rgba(255,255,255,0.65)',
              lineHeight: 1.5,
              opacity: textOp[i],
              padding: '0 40px',
            }}>
              {contentText}
            </div>
          </div>
        </div>
      ))}

      {/* Dark overlay at top for header readability */}
      <div style={{
        position: 'absolute', top: 0, left: 0, width: '100%', height: 120,
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.5), transparent)',
        pointerEvents: 'none',
      }} />

      {/* Header — always visible */}
      <div style={{
        position: 'absolute', top: 36, left: 0, width: '100%', textAlign: 'center',
        opacity: headerOp, zIndex: 10,
      }}>
        <div style={{ fontSize: 11, fontWeight: 900, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: 6 }}>
          PLATFORM PROPAGATION
        </div>
        <div style={{ fontSize: 24, fontWeight: 900, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.07em', textShadow: '0 1px 8px rgba(0,0,0,0.5)' }}>
          {title}
        </div>
      </div>

      {/* Progress pips — bottom center */}
      <div style={{
        position: 'absolute', bottom: 44, left: 0, width: '100%',
        display: 'flex', justifyContent: 'center', gap: 12,
        zIndex: 10,
      }}>
        {channels.map((ch, i) => (
          <div key={i} style={{
            width: i === activeIndex ? 36 : 10,
            height: 10,
            borderRadius: 5,
            backgroundColor: i <= activeIndex ? ch.brand.color : 'rgba(255,255,255,0.25)',
            transition: 'width 0.2s',
            boxShadow: i === activeIndex ? `0 0 12px ${ch.brand.color}` : 'none',
          }} />
        ))}
      </div>

      {/* Fallback base when no platform showing */}
      {count === 0 && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ color: 'PRIMARY_COLOR', fontSize: 24, opacity: 0.4 }}>Add channel names to populate</div>
        </div>
      )}
    </div>
  )
}

export default AnimationComponent
