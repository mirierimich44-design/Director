import React from 'react'
import { useCurrentFrame, interpolate, Easing } from 'remotion'

export const AnimationComponent = () => {
  const frame = useCurrentFrame()

  // Base Animations
  const bgOp = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const barW = interpolate(frame, [10, 45], [0, 1920], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  
  const prefixOp = interpolate(frame, [12, 35], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const prefixTy = interpolate(frame, [12, 35], [40, 0], { extrapolateLeft: 'clamp', easing: Easing.out(Easing.quad) })

  const countProgress = interpolate(frame, [20, 90], [0, 1], { extrapolateLeft: 'clamp', easing: Easing.out(Easing.cubic) })
  const finalOp = interpolate(frame, [85, 100], [0, 1], { extrapolateLeft: 'clamp' })

  const labelOp = interpolate(frame, [50, 75], [0, 1], { extrapolateLeft: 'clamp' })
  const labelTy = interpolate(frame, [50, 75], [30, 0], { extrapolateLeft: 'clamp', easing: Easing.out(Easing.quad) })

  const subOp = interpolate(frame, [75, 95], [0, 1], { extrapolateLeft: 'clamp' })
  const subTy = interpolate(frame, [75, 95], [20, 0], { extrapolateLeft: 'clamp' })

  const title = "TITLE_TEXT"
  const countValue = "COUNT_VALUE"
  const countLabel = "COUNT_LABEL"
  const subLabel = "SUB_LABEL"
  const contextText = "CONTEXT_TEXT"

  // Parse numeric part from countValue
  const targetNumber = parseFloat(countValue.replace(/[^0-9.]/g, '')) || 0
  const currentNumber = Math.floor(countProgress * targetNumber)
  
  // Extract non-numeric parts (prefix/suffix like $ or B)
  const prefix = countValue.match(/^[^0-9.]+/)?.[0] || ""
  const suffix = countValue.match(/[^0-9.]+$/)?.[0] || ""

  return (
    <div style={{
      position: 'absolute', inset: 0, overflow: 'hidden',
      backgroundColor: '#050505', fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      {/* Dynamic Background */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%', width: 1400, height: 800,
        background: 'radial-gradient(circle at center, PRIMARY_COLOR 0%, transparent 70%)',
        opacity: 0.1, transform: 'translate(-50%, -50%)', filter: 'blur(120px)'
      }} />
      
      {/* Grid Pattern */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
        backgroundSize: '80px 80px', opacity: bgOp
      }} />

      <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 6, backgroundColor: 'PRIMARY_COLOR', opacity: bgOp }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, width: barW, height: 8, backgroundColor: 'ACCENT_COLOR' }} />

      {/* Top Center Title */}
      <div style={{
        position: 'absolute', top: 80, left: 0, width: 1920, textAlign: 'center', opacity: bgOp
      }}>
        <div style={{ 
            display: 'inline-block', padding: '8px 24px', backgroundColor: 'rgba(255,255,255,0.03)',
            borderRadius: 100, border: '1px solid rgba(255,255,255,0.05)',
            color: 'SUPPORT_COLOR', fontSize: 20, fontWeight: 800, letterSpacing: 8, textTransform: 'uppercase'
        }}>
          {title}
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        width: 1600, textAlign: 'center'
      }}>
        
        {/* Count Label */}
        <div style={{ opacity: prefixOp, transform: `translateY(${prefixTy}px)`, marginBottom: 40 }}>
           <span style={{ 
               fontSize: 32, fontWeight: 900, color: 'ACCENT_COLOR', 
               letterSpacing: 4, textTransform: 'uppercase', opacity: 0.8
           }}>
             {countLabel}
           </span>
        </div>

        {/* Huge Animated Number */}
        <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: 10 }}>
           <span style={{ fontSize: 480, fontWeight: 900, color: '#fff', lineHeight: 0.8, letterSpacing: '-0.04em', filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.5))' }}>
              <span style={{ opacity: 1 - finalOp }}>{prefix}{currentNumber}{suffix}</span>
           </span>
           
           {/* Final value snap to keep exact formatting */}
           <div style={{ position: 'absolute', inset: 0, opacity: finalOp, display: 'flex', justifyContent: 'center', alignItems: 'baseline' }}>
             <span style={{ fontSize: 480, fontWeight: 900, color: '#fff', lineHeight: 0.8, letterSpacing: '-0.04em' }}>
               {countValue}
             </span>
           </div>
        </div>

        {/* Sub Label */}
        <div style={{ opacity: subOp, transform: `translateY(${subTy}px)`, marginTop: 40 }}>
           <span style={{ 
               fontSize: 48, fontWeight: 800, color: 'PRIMARY_COLOR', 
               letterSpacing: 1, textTransform: 'uppercase' 
           }}>
             {subLabel}
           </span>
        </div>

      </div>

      {/* Footer / Context */}
      <div style={{
        position: 'absolute', bottom: 100, left: 0, width: 1920, textAlign: 'center', opacity: labelOp, transform: `translateY(${labelTy}px)`
      }}>
        <p style={{ fontSize: 24, fontWeight: 500, color: 'SUPPORT_COLOR', opacity: 0.6, maxWidth: 1000, margin: '0 auto' }}>
          {contextText}
        </p>
      </div>

    </div>
  )
}

export default AnimationComponent