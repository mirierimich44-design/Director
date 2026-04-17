import React, { useMemo } from 'react'
import { useCurrentFrame, interpolate, Easing } from 'remotion'

// Template: 183-dependency-depth
// Purpose: Show 3-4 layers deep nested dependency chains (supply chain, call stacks, trust hierarchies)
// Fields: TITLE_TEXT, LAYER_LABEL_1..5, LAYER_DESC_1..5, DEPTH_LABEL (e.g. "4 LAYERS DEEP"), ACCENT_LABEL

export const AnimationComponent = () => {
  const frame = useCurrentFrame()

  const title       = 'TITLE_TEXT'
  const depthLabel  = 'DEPTH_LABEL'
  const accentLabel = 'ACCENT_LABEL'

  const rawLayers = [
    { label: 'LAYER_LABEL_1', desc: 'LAYER_DESC_1' },
    { label: 'LAYER_LABEL_2', desc: 'LAYER_DESC_2' },
    { label: 'LAYER_LABEL_3', desc: 'LAYER_DESC_3' },
    { label: 'LAYER_LABEL_4', desc: 'LAYER_DESC_4' },
    { label: 'LAYER_LABEL_5', desc: 'LAYER_DESC_5' },
  ]

  const layers = useMemo(() =>
    rawLayers.filter(l => l.label !== '' && l.label !== 'Placeholder'),
  [])

  const count = layers.length

  // ── Animations ────────────────────────────────────────────────────
  const headerOp = interpolate(frame, [0, 22], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const headerTy = interpolate(frame, [0, 22], [-18, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  const layerOps = layers.map((_, i) =>
    interpolate(frame, [18 + i * 14, 36 + i * 14], [0, 1], {
      extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
      easing: Easing.out(Easing.cubic),
    })
  )
  const layerScale = layers.map((_, i) =>
    interpolate(frame, [18 + i * 14, 36 + i * 14], [0.88, 1], {
      extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
      easing: Easing.out(Easing.back(1.1)),
    })
  )

  const arrowOps = layers.map((_, i) =>
    interpolate(frame, [30 + i * 14, 44 + i * 14], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  )

  const badgeOp = interpolate(frame, [18 + count * 14, 38 + count * 14], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: Easing.out(Easing.back(1.3)),
  })

  // ── Layout ────────────────────────────────────────────────────────
  // Each layer is a rectangle that nests inward (inset increases with depth)
  const maxW    = 1100
  const insetPx = 60           // each layer insets by this amount on each side
  const rowH    = Math.min(100, Math.floor(660 / Math.max(count, 1)))
  const totalH  = count * rowH + (count - 1) * 10
  const startY  = (900 - totalH) / 2 + 40
  const centerX = 800

  // Color gradient: top layer lightest (most trusted), bottom darkest (deepest/most infected)
  const layerAlpha = layers.map((_, i) => 0.06 + (i / Math.max(count - 1, 1)) * 0.14)
  const depthNum   = layers.map((_, i) => i + 1)

  return (
    <div style={{
      position: 'absolute', inset: 0, overflow: 'hidden',
      backgroundColor: 'BACKGROUND_COLOR',
      fontFamily: 'Inter, system-ui, sans-serif',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{ width: 1600, height: 900, position: 'relative' }}>

        {/* Subtle radial spotlight */}
        <div style={{
          position: 'absolute',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 900, height: 700,
          borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(255,204,0,0.04) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Header */}
        <div style={{
          position: 'absolute', top: 40, left: 0, width: '100%', textAlign: 'center',
          opacity: headerOp, transform: `translateY(${headerTy}px)`,
        }}>
          <div style={{ fontSize: 11, fontWeight: 900, color: 'ACCENT_COLOR', letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: 8 }}>
            DEPENDENCY CHAIN
          </div>
          <div style={{ fontSize: 34, fontWeight: 900, color: 'PRIMARY_COLOR', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {title}
          </div>
          <div style={{ width: 60, height: 3, backgroundColor: 'ACCENT_COLOR', margin: '10px auto 0', borderRadius: 2 }} />
        </div>

        {/* Layer stack */}
        {layers.map((layer, i) => {
          const inset   = i * insetPx
          const w       = maxW - inset * 2
          const x       = centerX - w / 2
          const y       = startY + i * (rowH + 10)
          const isDeep  = i === count - 1

          return (
            <div key={i} style={{ position: 'absolute', top: 0, left: 0, width: '100%' }}>
              {/* Layer box */}
              <div style={{
                position: 'absolute',
                top: y,
                left: x,
                width: w,
                height: rowH,
                backgroundColor: `rgba(255, 204, 0, ${layerAlpha[i]})`,
                border: `1px solid ${isDeep ? 'ACCENT_COLOR' : 'CHART_BORDER'}`,
                borderRadius: 10,
                opacity: layerOps[i],
                transform: `scale(${layerScale[i]})`,
                boxShadow: isDeep ? '0 0 24px rgba(255,204,0,0.15)' : 'none',
                display: 'flex',
                alignItems: 'center',
                padding: '0 28px',
                boxSizing: 'border-box',
              }}>
                {/* Depth number */}
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  backgroundColor: isDeep ? 'ACCENT_COLOR' : 'CHART_BORDER',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginRight: 20, flexShrink: 0,
                }}>
                  <span style={{
                    fontSize: 14, fontWeight: 900,
                    color: isDeep ? 'BACKGROUND_COLOR' : 'PRIMARY_COLOR',
                    fontFamily: 'monospace',
                  }}>{depthNum[i]}</span>
                </div>

                {/* Label + desc */}
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: isDeep ? 20 : 18,
                    fontWeight: 800,
                    color: isDeep ? 'ACCENT_COLOR' : 'PRIMARY_COLOR',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: 3,
                  }}>{layer.label}</div>
                  <div style={{
                    fontSize: 13,
                    color: 'PRIMARY_COLOR',
                    opacity: 0.6,
                    fontWeight: 400,
                  }}>{layer.desc}</div>
                </div>

                {/* Depth tag right side */}
                <div style={{
                  fontSize: 10, fontFamily: 'monospace',
                  color: isDeep ? 'ACCENT_COLOR' : 'PRIMARY_COLOR',
                  opacity: 0.5,
                  letterSpacing: '0.2em',
                }}>
                  DEPTH_{depthNum[i]}
                </div>
              </div>

              {/* Arrow connector between layers */}
              {i < count - 1 && (
                <div style={{
                  position: 'absolute',
                  top: y + rowH + 1,
                  left: centerX - 1,
                  width: 2,
                  height: 8,
                  backgroundColor: 'CHART_BORDER',
                  opacity: arrowOps[i],
                }}>
                  {/* Arrowhead */}
                  <div style={{
                    position: 'absolute',
                    bottom: -5,
                    left: -4,
                    width: 0,
                    height: 0,
                    borderLeft: '5px solid transparent',
                    borderRight: '5px solid transparent',
                    borderTop: '6px solid CHART_BORDER',
                  }} />
                </div>
              )}
            </div>
          )
        })}

        {/* Depth badge — bottom right */}
        <div style={{
          position: 'absolute',
          bottom: 52,
          right: 80,
          opacity: badgeOp,
          textAlign: 'right',
        }}>
          <div style={{
            backgroundColor: 'PANEL_RIGHT_BG',
            border: '1px solid ACCENT_COLOR',
            borderRadius: 10,
            padding: '14px 24px',
            display: 'inline-block',
          }}>
            <div style={{ fontSize: 11, color: 'ACCENT_COLOR', fontWeight: 900, letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: 4 }}>
              {accentLabel || 'INFECTION POINT'}
            </div>
            <div style={{ fontSize: 26, fontWeight: 900, color: 'PRIMARY_COLOR', fontFamily: 'monospace' }}>
              {depthLabel}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          position: 'absolute', bottom: 36, left: 60,
          opacity: 0.28,
        }}>
          <div style={{ fontSize: 10, color: 'PRIMARY_COLOR', fontFamily: 'monospace', letterSpacing: '0.22em' }}>
            SUPPLY_CHAIN_DEPTH_ANALYSIS // TRUST_BOUNDARY_MAP
          </div>
        </div>

      </div>
    </div>
  )
}

export default AnimationComponent
