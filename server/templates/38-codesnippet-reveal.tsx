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
    return rawCodeLines.filter(line => line !== '' && line !== 'Placeholder' && line !== ' ')
  }, [rawCodeLines])

  const lineCount = codeLines.length
  const highlightLineIndex = 4

  const titleOp = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const windowOp = interpolate(frame, [10, 30], [0, 1], { extrapolateLeft: 'clamp' })

  const lineOpacities = codeLines.map((_, i) => interpolate(frame, [30 + i * 4, 45 + i * 4], [0, 1], { extrapolateLeft: 'clamp' }))
  
  const highlightOp = interpolate(frame, [80, 95], [0, 1], { extrapolateLeft: 'clamp' })

  const lineHeight = 48
  const windowWidth = 1300

  return (
    <div style={{
      position: 'absolute', inset: 0, overflow: 'hidden',
      backgroundColor: 'BACKGROUND_COLOR', fontFamily: 'JetBrains Mono, Fira Code, monospace',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      {/* 16:9 Safe Container */}
      <div style={{ width: 1600, height: 900, position: 'relative' }}>
        
        {/* Title */}
        <div style={{
          position: 'absolute', top: 40, left: 0, width: '100%', textAlign: 'center',
          opacity: titleOp
        }}>
          <span style={{ fontSize: 22, fontWeight: 800, color: 'PRIMARY_COLOR', letterSpacing: 8, textTransform: 'uppercase' }}>
            {title}
          </span>
        </div>

        {/* IDE Window Container */}
        <div style={{
          position: 'absolute', top: 140, left: (1600 - windowWidth) / 2, width: windowWidth,
          opacity: windowOp
        }}>
          
          {/* Title Bar */}
          <div style={{
            height: 44, backgroundColor: 'rgba(30, 41, 59, 0.9)', backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.1)', borderBottom: 'none',
            borderRadius: '12px 12px 0 0', display: 'flex', alignItems: 'center', padding: '0 20px'
          }}>
             <div style={{ display: 'flex', gap: 6, marginRight: 24 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#ff5f56' }} />
                <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#ffbd2e' }} />
                <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#27c93f' }} />
             </div>
             <span style={{ color: 'SUPPORT_COLOR', fontSize: 13, fontWeight: 500, letterSpacing: 1, opacity: 0.6 }}>{keyPath}</span>
          </div>

          {/* Code Content Area */}
          <div style={{
            backgroundColor: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(30px)',
            border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0 0 12px 12px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.4)', padding: '24px 0', position: 'relative',
            overflow: 'hidden'
          }}>
            
            {highlightLineIndex < lineCount && (
              <div style={{
                position: 'absolute', top: 24 + highlightLineIndex * lineHeight, left: 0, width: '100%',
                height: lineHeight, backgroundColor: 'PRIMARY_COLOR', opacity: highlightOp * 0.12,
                borderLeft: '4px solid PRIMARY_COLOR'
              }} />
            )}

            {codeLines.map((line, i) => (
              <div key={i} style={{
                height: lineHeight, display: 'flex', alignItems: 'center',
                opacity: lineOpacities[i], padding: '0 40px'
              }}>
                <span style={{ width: 32, color: 'SUPPORT_COLOR', fontSize: 14, textAlign: 'right', marginRight: 24, opacity: 0.3 }}>{i + 1}</span>
                <span style={{ 
                    fontSize: 20, color: i === highlightLineIndex ? 'ACCENT_COLOR' : 'SUPPORT_COLOR',
                    fontWeight: i === highlightLineIndex ? 700 : 400
                }}>
                  {line}
                </span>
              </div>
            ))}
          </div>

          {/* Footer Callout */}
          {highlightLineIndex < lineCount && (
            <div style={{
              marginTop: 24, opacity: highlightOp, display: 'flex', justifyContent: 'center'
            }}>
              <div style={{ 
                  backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)',
                  padding: '10px 20px', borderRadius: 8, backdropFilter: 'blur(5px)'
              }}>
                <span style={{ color: 'ACCENT_COLOR', fontWeight: 800, fontSize: 16, letterSpacing: 1 }}>KEY_VALUE</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AnimationComponent;