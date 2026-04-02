import React from 'react'
import { useCurrentFrame, interpolate, Easing } from 'remotion'

export const AnimationComponent = () => {
  const frame = useCurrentFrame()

  // Base Animations
  const bgOp = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const contentOp = interpolate(frame, [15, 40], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const barW = interpolate(frame, [10, 50], [0, 1000], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.quad) })

  const titleText = "TITLE_TEXT"
  const chapterWord = "CHAPTER_WORD"
  const chapterSub = "CHAPTER_SUB"
  const tag1 = "TAG_1"

  return (
    <div style={{
      position: 'absolute', inset: 0, overflow: 'hidden',
      backgroundColor: 'BACKGROUND_COLOR', fontFamily: 'Inter, system-ui, sans-serif',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      
      {/* Background Scrim - Forces visibility */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundColor: 'rgba(0,0,0,0.7)',
        opacity: bgOp
      }} />

      {/* 16:9 Safe Container */}
      <div style={{ 
          width: 1600, height: 900, position: 'relative',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          opacity: contentOp
      }}>
        
        {/* Top Category Label */}
        <div style={{ marginBottom: 24 }}>
          <span style={{ fontSize: 18, fontWeight: 900, color: 'PRIMARY_COLOR', letterSpacing: 8, textTransform: 'uppercase', opacity: 0.8 }}>
            {chapterWord}
          </span>
        </div>

        {/* Center Title - High Contrast White */}
        <div style={{ textAlign: 'center', maxWidth: 1200, marginBottom: 40 }}>
          <h1 style={{ 
              fontSize: 100, fontWeight: 900, color: '#fff', 
              textTransform: 'uppercase', letterSpacing: '-0.02em', margin: 0, lineHeight: 1.1
          }}>
            {titleText}
          </h1>
        </div>

        {/* Modern Accent Bar */}
        <div style={{ width: barW, height: 4, backgroundColor: 'ACCENT_COLOR', marginBottom: 40, boxShadow: '0 0 15px ACCENT_COLOR' }} />

        {/* Subtitle */}
        <div style={{ textAlign: 'center', maxWidth: 1000, marginBottom: 48 }}>
          <span style={{ fontSize: 28, fontWeight: 500, color: 'rgba(255,255,255,0.7)', lineHeight: 1.4 }}>
            {chapterSub}
          </span>
        </div>

        {/* Bottom Tag */}
        <div style={{ 
            padding: '8px 24px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 100, 
            border: '1px solid rgba(255,255,255,0.1)' 
        }}>
          <span style={{ fontSize: 14, fontWeight: 800, color: 'PRIMARY_COLOR', letterSpacing: 4, textTransform: 'uppercase' }}>
            {tag1}
          </span>
        </div>

      </div>
    </div>
  )
}

export default AnimationComponent;