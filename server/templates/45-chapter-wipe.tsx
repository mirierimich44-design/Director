import React from 'react'
import { useCurrentFrame, interpolate, Easing } from 'remotion'

export const AnimationComponent = () => {
  const frame = useCurrentFrame()

  // Base Animations
  const bgOp = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const contentOp = interpolate(frame, [15, 35], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const wipeW = interpolate(frame, [10, 45], [0, 1400], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.quad) })

  const chapterWord = "CHAPTER_WORD"
  const chapterSub = "CHAPTER_SUB"
  const contextText = "CONTEXT_TEXT"

  return (
    <div style={{
      position: 'absolute', inset: 0, overflow: 'hidden',
      backgroundColor: 'BACKGROUND_COLOR', fontFamily: 'Inter, system-ui, sans-serif',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      
      {/* Background Scrim */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        opacity: bgOp
      }} />

      {/* 16:9 Safe Container */}
      <div style={{ width: 1600, height: 900, position: 'relative', opacity: contentOp }}>

        {/* Wipe bar (Modern Accent) */}
        <div style={{ 
            position: 'absolute', top: '50%', left: 100, transform: 'translateY(-50%)',
            width: wipeW, height: 280, backgroundColor: 'PRIMARY_COLOR', 
            borderRadius: 16, boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
            display: 'flex', alignItems: 'center', padding: '0 80px', overflow: 'hidden'
        }}>
            {/* Hero text inside wipe bar */}
            <span style={{ 
                fontSize: 110, fontWeight: 900, color: '#000', // Black text on primary bar for high contrast
                textTransform: 'uppercase', letterSpacing: '-0.04em', lineHeight: 1, whiteSpace: 'nowrap'
            }}>
                {chapterSub}
            </span>
        </div>

        {/* Chapter label above */}
        <div style={{ position: 'absolute', top: 220, left: 100 }}>
          <span style={{ fontSize: 16, fontWeight: 900, color: 'PRIMARY_COLOR', letterSpacing: 8, textTransform: 'uppercase', opacity: 0.8 }}>
            {chapterWord}
          </span>
        </div>

        {/* Context below */}
        <div style={{ position: 'absolute', top: 620, left: 180, width: 1000 }}>
          <span style={{ fontSize: 24, fontWeight: 500, color: 'rgba(255,255,255,0.7)', lineHeight: 1.4 }}>
            {contextText}
          </span>
        </div>

        {/* Corner Detail */}
        <div style={{ position: 'absolute', bottom: 40, right: 40, opacity: 0.4 }}>
          <span style={{ fontSize: 12, fontWeight: 900, color: 'SUPPORT_COLOR', letterSpacing: 4, textTransform: 'uppercase' }}>
            SECTION_TRANSITION // {chapterWord}
          </span>
        </div>

      </div>
    </div>
  )
}

export default AnimationComponent;