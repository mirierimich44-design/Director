import React from 'react'
import { useCurrentFrame, interpolate, Easing } from 'remotion'

export const AnimationComponent = () => {
  const frame = useCurrentFrame()

  // Base Animations
  const bgOp = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const contentOp = interpolate(frame, [15, 35], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const contentScale = interpolate(frame, [15, 45], [0.98, 1], { extrapolateRight: 'clamp', easing: Easing.out(Easing.quad) });
  const markOp = interpolate(frame, [10, 30], [0, 0.15], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  const word1 = "QUOTE_LINE_1"
  const word2 = "QUOTE_LINE_2"
  const label1 = "LABEL_1"
  const label2 = "LABEL_2"
  const subLabel = "SUB_LABEL"

  return (
    <div style={{
      position: 'absolute', inset: 0, overflow: 'hidden',
      backgroundColor: 'BACKGROUND_COLOR', fontFamily: 'Inter, system-ui, sans-serif',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>

      {/* Background Scrim - Ensures 100% visibility regardless of theme or video */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundColor: 'rgba(0,0,0,0.4)',
        opacity: bgOp
      }} />

      {/* 16:9 Safe Container */}
      <div style={{ 
          width: 1600, height: 900, position: 'relative', 
          opacity: contentOp, transform: `scale(${contentScale})`
      }}>

        {/* Background Decorative Large Quote Mark */}
        <div style={{
          position: 'absolute', top: -50, left: -40, opacity: markOp
        }}>
          <span style={{ fontSize: 600, fontWeight: 900, color: 'PRIMARY_COLOR', fontFamily: 'serif', lineHeight: 1 }}>&ldquo;</span>
        </div>

        {/* Center Content Block */}
        <div style={{ 
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            width: 1200, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center'
        }}>

          {/* Accent Line Top */}
          <div style={{ width: 80, height: 4, backgroundColor: 'ACCENT_COLOR', marginBottom: 60 }} />

          {/* Main Quote Text */}
          <div style={{ width: '100%', marginBottom: 40 }}>
            <span style={{
              fontSize: 64, fontWeight: 800, color: '#fff',
              lineHeight: 1.2, letterSpacing: '-0.02em',
              display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden'
            }}>
              {word1}
            </span>
          </div>

          {/* Second Quote Line (Context) */}
          <div style={{ width: '100%', marginBottom: 60 }}>
            <span style={{
              fontSize: 32, fontWeight: 500, color: 'rgba(255,255,255,0.7)',
              lineHeight: 1.4, fontStyle: 'italic',
              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
            }}>
              {word2}
            </span>
          </div>

          {/* Source Attribution Block */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
             <div style={{ fontSize: 24, fontWeight: 900, color: 'ACCENT_COLOR', letterSpacing: 4, textTransform: 'uppercase' }}>
               {label1}
             </div>
             <div style={{ fontSize: 18, fontWeight: 600, color: 'SUPPORT_COLOR', opacity: 0.8 }}>
               {label2}
             </div>
          </div>

          {/* Accent Line Bottom */}
          <div style={{ width: 80, height: 4, backgroundColor: 'ACCENT_COLOR', marginTop: 60 }} />

        </div>

        {/* Top Edge Sub Label */}
        <div style={{
          position: 'absolute', top: 40, right: 0, opacity: 0.6
        }}>
          <span style={{ fontSize: 16, fontWeight: 900, color: 'PRIMARY_COLOR', letterSpacing: 6, textTransform: 'uppercase' }}>
            {subLabel}
          </span>
        </div>

      </div>
    </div>
  )
}

export default AnimationComponent;