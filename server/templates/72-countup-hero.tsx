import React from 'react'
import { useCurrentFrame, interpolate, Easing } from 'remotion'

export const AnimationComponent = () => {
  const frame = useCurrentFrame()

  // Base Animations
  const contentScale = interpolate(frame, [0, 40], [0.98, 1], { extrapolateRight: 'clamp', easing: Easing.out(Easing.quad) });
  const bgOp = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  
  const prefixOp = interpolate(frame, [12, 35], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const prefixTy = interpolate(frame, [12, 35], [20, 0], { extrapolateLeft: 'clamp', easing: Easing.out(Easing.quad) })

  const countProgress = interpolate(frame, [20, 90], [0, 1], { extrapolateLeft: 'clamp', easing: Easing.out(Easing.cubic) })
  const finalOp = interpolate(frame, [85, 100], [0, 1], { extrapolateLeft: 'clamp' })

  const subOp = interpolate(frame, [75, 95], [0, 1], { extrapolateLeft: 'clamp' })
  const subTy = interpolate(frame, [75, 95], [15, 0], { extrapolateLeft: 'clamp' })

  const title = "TITLE_TEXT"
  const countValue = "COUNT_VALUE"
  const countLabel = "COUNT_LABEL"
  const subLabel = "SUB_LABEL"
  const contextText = "CONTEXT_TEXT"

  const targetNumber = parseFloat(countValue.replace(/[^0-9.]/g, '')) || 0
  const currentNumber = Math.floor(countProgress * targetNumber)
  
  const prefix = countValue.match(/^[^0-9.]+/)?.[0] || ""
  const suffix = countValue.match(/[^0-9.]+$/)?.[0] || ""

  return (
    <div style={{
      position: 'absolute', inset: 0, overflow: 'hidden',
      backgroundColor: 'BACKGROUND_COLOR', fontFamily: 'Inter, system-ui, sans-serif',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      {/* 16:9 Safe Container */}
      <div style={{ width: 1600, height: 900, position: 'relative', transform: `scale(${contentScale})` }}>
        
        <div style={{ position: 'absolute', top: 40, left: 0, width: '100%', textAlign: 'center', opacity: bgOp }}>
          <div style={{ 
              display: 'inline-block', padding: '6px 20px', backgroundColor: 'rgba(255,255,255,0.03)',
              borderRadius: 100, border: '1px solid rgba(255,255,255,0.05)',
              color: 'SUPPORT_COLOR', fontSize: 16, fontWeight: 800, letterSpacing: 6, textTransform: 'uppercase'
          }}>
            {title}
          </div>
        </div>

        {/* Content */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '100%', textAlign: 'center' }}>
          
          <div style={{ opacity: prefixOp, transform: `translateY(${prefixTy}px)`, marginBottom: 32 }}>
             <span style={{ fontSize: 24, fontWeight: 900, color: 'ACCENT_COLOR', letterSpacing: 4, textTransform: 'uppercase', opacity: 0.8 }}>
               {countLabel}
             </span>
          </div>

          <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'baseline' }}>
             <span style={{ fontSize: 320, fontWeight: 900, color: 'PRIMARY_COLOR', lineHeight: 0.8, letterSpacing: '-0.04em' }}>
                <span style={{ opacity: 1 - finalOp }}>{prefix}{currentNumber}{suffix}</span>
             </span>
             <div style={{ position: 'absolute', inset: 0, opacity: finalOp, display: 'flex', justifyContent: 'center', alignItems: 'baseline' }}>
               <span style={{ fontSize: 320, fontWeight: 900, color: 'PRIMARY_COLOR', lineHeight: 0.8, letterSpacing: '-0.04em' }}>
                 {countValue}
               </span>
             </div>
          </div>

          <div style={{ opacity: subOp, transform: `translateY(${subTy}px)`, marginTop: 32 }}>
             <span style={{ fontSize: 36, fontWeight: 800, color: 'PRIMARY_COLOR', letterSpacing: 1, textTransform: 'uppercase' }}>
               {subLabel}
             </span>
          </div>
        </div>

        <div style={{ position: 'absolute', bottom: 40, left: 0, width: '100%', textAlign: 'center', opacity: subOp }}>
          <p style={{ fontSize: 18, fontWeight: 500, color: 'SUPPORT_COLOR', opacity: 0.6, maxWidth: 800, margin: '0 auto' }}>
            {contextText}
          </p>
        </div>

      </div>
    </div>
  )
}

export default AnimationComponent;