import React, { useMemo } from 'react'
import { useCurrentFrame, useVideoConfig, interpolate, Easing } from 'remotion'

export const AnimationComponent = () => {
  const frame = useCurrentFrame()
  const { width, height } = useVideoConfig()

  const title = "TITLE_TEXT"
  const compareLabel1 = "COMPARE_LABEL_1"
  const compareLabel2 = "COMPARE_LABEL_2"
  const compareValue1 = "COMPARE_VALUE_1"
  const compareValue2 = "COMPARE_VALUE_2"
  const contextText = "CONTEXT_TEXT"

  const items = useMemo(() => {
    const rawItems = [
      { label: compareLabel1, value: compareValue1, color: 'PRIMARY_COLOR', accent: 'ACCENT_COLOR' },
      { label: compareLabel2, value: compareValue2, color: 'SECONDARY_COLOR', accent: 'SUPPORT_COLOR' }
    ]
    return rawItems.filter(item => item.label !== '' && item.label !== 'Placeholder' && item.value !== '' && item.value !== 'Placeholder')
  }, [compareLabel1, compareLabel2, compareValue1, compareValue2])

  // Animation Timings
  const entranceStart = 10
  const bgOp = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' })
  const titleOp = interpolate(frame, [entranceStart, entranceStart + 30], [0, 1], { extrapolateRight: 'clamp' })
  const titleTy = interpolate(frame, [entranceStart, entranceStart + 30], [20, 0], { extrapolateRight: 'clamp', easing: Easing.out(Easing.quad) })
  
  const col1Op = interpolate(frame, [entranceStart + 20, entranceStart + 50], [0, 1], { extrapolateRight: 'clamp' })
  const col1Scale = interpolate(frame, [entranceStart + 20, entranceStart + 55], [0.95, 1], { extrapolateRight: 'clamp', easing: Easing.out(Easing.quad) })
  
  const vsOp = interpolate(frame, [entranceStart + 40, entranceStart + 60], [0, 1], { extrapolateRight: 'clamp' })
  const vsScale = interpolate(frame, [entranceStart + 40, entranceStart + 65], [0.5, 1], { extrapolateRight: 'clamp', easing: Easing.out(Easing.back(1.5)) })

  const col2Op = interpolate(frame, [entranceStart + 30, entranceStart + 60], [0, 1], { extrapolateRight: 'clamp' })
  const col2Scale = interpolate(frame, [entranceStart + 30, entranceStart + 65], [0.95, 1], { extrapolateRight: 'clamp', easing: Easing.out(Easing.quad) })

  const glassStyle: React.CSSProperties = {
    backgroundColor: 'rgba(15, 23, 42, 0.92)',
    backdropFilter: 'blur(32px)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    borderRadius: '32px',
    boxShadow: '0 40px 100px rgba(0,0,0,0.6)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px',
    width: 600,
    height: 500,
    position: 'relative',
    overflow: 'hidden'
  }

  // Dynamic Font Scaling for Comparison Values
  const getFontSize = (val: string) => {
    const len = String(val).length;
    if (len <= 4) return 120;
    if (len <= 6) return 100;
    if (len <= 10) return 80;
    return 60;
  };

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden', backgroundColor: 'BACKGROUND_COLOR', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* Cinematic Background Grid */}
      <div style={{
        position: 'absolute', width: '100%', height: '100%',
        backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.02) 0%, transparent 80%), linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
        backgroundSize: '100% 100%, 100px 100px, 100px 100px',
        opacity: bgOp * 0.6
      }} />

      {/* Header UI */}
      <div style={{ position: 'absolute', top: 80, width: '100%', textAlign: 'center', opacity: titleOp, transform: `translateY(${titleTy}px)`, zIndex: 10 }}>
        <div style={{ fontSize: 16, fontWeight: 900, color: 'ACCENT_COLOR', letterSpacing: '0.6em', textTransform: 'uppercase', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>DIFFERENTIAL_ANALYSIS_v9.2</div>
        <div style={{ fontSize: 56, fontWeight: 900, color: '#fff', letterSpacing: '0.05em', textTransform: 'uppercase', textShadow: '0 2px 20px rgba(0,0,0,0.8)' }}>{title}</div>
        <div style={{ width: 120, height: 4, backgroundColor: 'PRIMARY_COLOR', margin: '20px auto', borderRadius: 2, boxShadow: '0 0 20px PRIMARY_COLOR' }} />
      </div>

      {/* Comparison Container */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -40%)',
        display: 'flex', alignItems: 'center', gap: 60, zIndex: 5
      }}>
        
        {/* Left Side */}
        {items[0] && (
            <div style={{ ...glassStyle, opacity: col1Op, transform: `scale(${col1Scale})`, borderTop: `8px solid ${items[0].color}` }}>
                <div style={{ position: 'absolute', top: 0, right: 0, width: 300, height: 300, background: `radial-gradient(circle, ${items[0].color} 0%, transparent 70%)`, opacity: 0.1 }} />
                <div style={{ fontSize: 18, color: 'rgba(255,255,255,0.7)', fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 20, textAlign: 'center' }}>{items[0].label}</div>
                <div style={{ 
                    fontSize: getFontSize(items[0].value), 
                    fontWeight: 900, 
                    color: 'TEXT_ON_PRIMARY', 
                    fontFamily: 'monospace', 
                    lineHeight: 1, 
                    textAlign: 'center',
                    textShadow: `0 0 40px ${items[0].color}44`,
                    wordBreak: 'break-all'
                }}>{items[0].value}</div>
                <div style={{ marginTop: 40, width: 60, height: 2, backgroundColor: 'rgba(255,255,255,0.1)' }} />
            </div>
        )}

        {/* VS Element */}
        <div style={{ 
            width: 100, height: 100, borderRadius: '50%', backgroundColor: 'rgba(15, 23, 42, 0.95)',
            border: '2px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: vsOp, transform: `scale(${vsScale})`, zIndex: 10, backdropFilter: 'blur(10px)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
        }}>
            <div style={{ fontSize: 28, fontWeight: 900, color: 'ACCENT_COLOR', letterSpacing: '0.1em' }}>VS</div>
        </div>

        {/* Right Side */}
        {items[1] && (
            <div style={{ ...glassStyle, opacity: col2Op, transform: `scale(${col2Scale})`, borderTop: `8px solid ${items[1].color}` }}>
                <div style={{ position: 'absolute', top: 0, right: 0, width: 300, height: 300, background: `radial-gradient(circle, ${items[1].color} 0%, transparent 70%)`, opacity: 0.1 }} />
                <div style={{ fontSize: 18, color: 'rgba(255,255,255,0.7)', fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 20, textAlign: 'center' }}>{items[1].label}</div>
                <div style={{ 
                    fontSize: getFontSize(items[1].value), 
                    fontWeight: 900, 
                    color: items[1].color, 
                    fontFamily: 'monospace', 
                    lineHeight: 1, 
                    textAlign: 'center',
                    textShadow: `0 0 40px ${items[1].color}44`,
                    wordBreak: 'break-all'
                }}>{items[1].value}</div>
                <div style={{ marginTop: 40, width: 60, height: 2, backgroundColor: 'rgba(255,255,255,0.1)' }} />
            </div>
        )}

      </div>

      {/* Context Text Footer */}
      <div style={{ 
          position: 'absolute', bottom: 100, width: '100%', textAlign: 'center', 
          opacity: col2Op, transform: `translateY(${interpolate(frame, [entranceStart + 40, entranceStart + 70], [20, 0], { extrapolateRight: 'clamp' })}px)` 
      }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', fontSize: 24, color: '#fff', lineHeight: 1.6, fontWeight: 500, textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>
            {contextText}
        </div>
      </div>

      {/* Decorative Side Elements */}
      <div style={{ position: 'absolute', bottom: 60, left: 80, opacity: 0.3 }}>
        <div style={{ color: '#fff', fontSize: 12, fontFamily: 'monospace', textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
            COORD_SYNC: STABLE // MODE: CROSS_REF<br />
            ID: 0x{Math.floor(frame * 77).toString(16).toUpperCase()}
        </div>
      </div>

    </div>
  )
}

export default AnimationComponent