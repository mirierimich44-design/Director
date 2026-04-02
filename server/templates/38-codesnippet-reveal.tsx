import React, { useMemo } from 'react'
import { useCurrentFrame, interpolate, Easing } from 'remotion'

export const AnimationComponent = () => {
  const frame = useCurrentFrame()

  const title = "TITLE_TEXT"
  const keyPath = "KEY_PATH"
  const rawCodeLines = [
    "CODE_LINE_1",
    "CODE_LINE_2",
    "CODE_LINE_3",
    "CODE_LINE_4",
    "CODE_LINE_5",
    "CODE_LINE_6",
    "CODE_LINE_7",
    "CODE_LINE_8",
  ]

  const codeLines = useMemo(() => {
    return rawCodeLines.filter(line => line !== '' && line !== 'Placeholder')
  }, [rawCodeLines])

  const lineCount = codeLines.length
  const highlightLineIndex = 4

  const titleOp = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const titleTy = interpolate(frame, [0, 20], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  const windowOp = interpolate(frame, [10, 30], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const windowScale = interpolate(frame, [10, 40], [0.95, 1], { extrapolateLeft: 'clamp', easing: Easing.out(Easing.quad) })

  const lineOpacities = codeLines.map((_, i) => interpolate(frame, [30 + i * 4, 45 + i * 4], [0, 1], { extrapolateLeft: 'clamp' }))
  const lineTx = codeLines.map((_, i) => interpolate(frame, [30 + i * 4, 45 + i * 4], [-15, 0], { extrapolateLeft: 'clamp', easing: Easing.out(Easing.quad) }))

  const highlightOp = interpolate(frame, [80, 95], [0, 1], { extrapolateLeft: 'clamp' })

  const lineHeight = 56
  const windowWidth = 1400

  return (
    <div style={{
      position: 'absolute', inset: 0, overflow: 'hidden',
      backgroundColor: 'BACKGROUND_COLOR', fontFamily: 'JetBrains Mono, Fira Code, monospace'
    }}>
      {/* Background Glow */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%', width: 800, height: 800,
        background: 'radial-gradient(circle, PRIMARY_COLOR 0%, transparent 70%)',
        opacity: 0.05, transform: 'translate(-50%, -50%)', filter: 'blur(100px)'
      }} />

      <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 5, backgroundColor: 'PRIMARY_COLOR', opacity: titleOp }} />
      
      {/* Title */}
      <div style={{
        position: 'absolute', top: 60, left: 0, width: 1920, textAlign: 'center',
        opacity: titleOp, transform: `translateY(${titleTy}px)`
      }}>
        <span style={{ fontSize: 24, fontWeight: 800, color: 'PRIMARY_COLOR', letterSpacing: 8, textTransform: 'uppercase' }}>
          {title}
        </span>
      </div>

      {/* IDE Window Container */}
      <div style={{
        position: 'absolute', top: 200, left: (1920 - windowWidth) / 2, width: windowWidth,
        opacity: windowOp, transform: `scale(${windowScale})`
      }}>
        
        {/* Title Bar (Mac-style) */}
        <div style={{
          height: 50, backgroundColor: 'rgba(30, 41, 59, 0.95)', backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)', borderBottom: 'none',
          borderRadius: '16px 16px 0 0', display: 'flex', alignItems: 'center', padding: '0 24px'
        }}>
           <div style={{ display: 'flex', gap: 8, marginRight: 32 }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#ff5f56' }} />
              <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#ffbd2e' }} />
              <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#27c93f' }} />
           </div>
           <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, fontWeight: 500, letterSpacing: 1 }}>{keyPath}</span>
        </div>

        {/* Code Content Area */}
        <div style={{
          backgroundColor: 'rgba(15, 23, 42, 0.98)', backdropFilter: 'blur(40px)',
          border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0 0 16px 16px',
          boxShadow: '0 40px 100px rgba(0,0,0,0.6)', padding: '32px 0', position: 'relative',
          overflow: 'hidden'
        }}>
          
          {/* Active Highlight */}
          {highlightLineIndex < lineCount && (
            <div style={{
              position: 'absolute', top: 32 + highlightLineIndex * lineHeight, left: 0, width: '100%',
              height: lineHeight, backgroundColor: 'PRIMARY_COLOR', opacity: highlightOp * 0.15,
              borderLeft: '4px solid PRIMARY_COLOR'
            }} />
          )}

          {codeLines.map((line, i) => (
            <div key={i} style={{
              height: lineHeight, display: 'flex', alignItems: 'center',
              opacity: lineOpacities[i], transform: `translateX(${lineTx[i]}px)`,
              padding: '0 48px'
            }}>
              <span style={{ width: 40, color: 'rgba(255,255,255,0.2)', fontSize: 16, textAlign: 'right', marginRight: 32 }}>{i + 1}</span>
              <span style={{ 
                  fontSize: 24, color: i === highlightLineIndex ? 'ACCENT_COLOR' : 'rgba(255,255,255,0.85)',
                  fontWeight: i === highlightLineIndex ? 700 : 400
              }}>
                {line}
              </span>
            </div>
          ))}
        </div>

        {/* Footer Info / Value Callout */}
        {highlightLineIndex < lineCount && (
          <div style={{
            marginTop: 32, opacity: highlightOp, display: 'flex', alignItems: 'center', gap: 24
          }}>
            <div style={{ width: 48, height: 2, backgroundColor: 'ACCENT_COLOR' }} />
            <div style={{ 
                backgroundColor: 'rgba(201,169,97,0.1)', border: '1px solid rgba(201,169,97,0.2)',
                padding: '12px 24px', borderRadius: 8
            }}>
              <span style={{ color: 'ACCENT_COLOR', fontWeight: 800, fontSize: 20 }}>KEY_VALUE</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AnimationComponent