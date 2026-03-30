import React, { useMemo } from 'react'
import { useCurrentFrame, useVideoConfig, interpolate, Easing } from 'remotion'

export const AnimationComponent = () => {
  const frame = useCurrentFrame()
  const { width, height } = useVideoConfig()

  const titleText = "TITLE_TEXT"
  const label1 = "LABEL_1"
  const label2 = "LABEL_2"
  const label3 = "LABEL_3"
  const tag1 = "TAG_1"
  const tag2 = "TAG_2"
  const tag3 = "TAG_3"
  const stat1 = "STAT_VALUE_1"
  const stat2 = "STAT_VALUE_2"
  const contextText = "CONTEXT_TEXT"
  const alertText = "ALERT_TEXT"

  // Animation Sequence
  const entranceStart = 5
  const bgOp = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const panelOp = interpolate(frame, [entranceStart, entranceStart + 25], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const panelScale = interpolate(frame, [entranceStart, entranceStart + 35], [0.95, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.quad) })
  
  const contentOp = interpolate(frame, [entranceStart + 20, entranceStart + 45], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const contentTy = interpolate(frame, [entranceStart + 20, entranceStart + 45], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.quad) })

  const glassStyle: React.CSSProperties = {
    backgroundColor: 'rgba(15, 23, 42, 0.94)',
    backdropFilter: 'blur(32px)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    borderRadius: '32px',
    boxShadow: '0 40px 100px rgba(0,0,0,0.6)',
    position: 'absolute',
    overflow: 'hidden'
  }

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden', backgroundColor: 'BACKGROUND_COLOR', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* Cinematic Background Grid */}
      <div style={{
        position: 'absolute', width: '100%', height: '100%',
        backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.02) 0%, transparent 80%), linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
        backgroundSize: '100% 100%, 80px 80px, 80px 80px',
        opacity: bgOp * 0.6
      }} />

      {/* Header UI */}
      <div style={{ position: 'absolute', top: 60, width: '100%', textAlign: 'center', opacity: bgOp }}>
        <div style={{ fontSize: 16, fontWeight: 900, color: 'ACCENT_COLOR', letterSpacing: '0.6em', textTransform: 'uppercase' }}>{titleText}</div>
        <div style={{ width: 80, height: 4, backgroundColor: 'PRIMARY_COLOR', margin: '16px auto', borderRadius: 2, boxShadow: '0 0 20px PRIMARY_COLOR' }} />
      </div>

      {/* Main Dossier Panel */}
      <div style={{
        ...glassStyle,
        width: 1100, height: 800,
        top: 160, left: 160,
        opacity: panelOp,
        transform: `scale(${panelScale})`
      }}>
        {/* Banner */}
        <div style={{ 
            height: 120, backgroundColor: 'PRIMARY_COLOR', 
            display: 'flex', alignItems: 'center', padding: '0 60px', justifyContent: 'space-between'
        }}>
            <div style={{ fontSize: 48, fontWeight: 900, color: '#000', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label1}</div>
            <div style={{ 
                padding: '10px 24px', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 12, 
                border: '2px solid rgba(0,0,0,0.3)', color: '#000', fontSize: 18, fontWeight: 900 
            }}>{alertText}</div>
        </div>

        <div style={{ padding: '60px', opacity: contentOp, transform: `translateY(${contentTy}px)` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 12 }}>
                <div style={{ fontSize: 32, fontWeight: 800, color: 'ACCENT_COLOR', textTransform: 'uppercase' }}>{label2}</div>
                <div style={{ width: 1, height: 32, backgroundColor: 'rgba(255,255,255,0.2)' }} />
                <div style={{ fontSize: 24, color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>{label3}</div>
            </div>

            <div style={{ height: 2, width: 100, backgroundColor: 'ACCENT_COLOR', marginBottom: 60 }} />

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, marginBottom: 60 }}>
                <div style={{ padding: '40px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 24, border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ fontSize: 14, color: 'PRIMARY_COLOR', fontWeight: 900, textTransform: 'uppercase', marginBottom: 12 }}>{tag1}</div>
                    <div style={{ fontSize: 64, fontWeight: 900, color: '#fff', fontFamily: 'monospace' }}>{stat1}</div>
                </div>
                <div style={{ padding: '40px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 24, border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ fontSize: 14, color: 'ACCENT_COLOR', fontWeight: 900, textTransform: 'uppercase', marginBottom: 12 }}>{tag2}</div>
                    <div style={{ fontSize: 64, fontWeight: 900, color: '#fff', fontFamily: 'monospace' }}>{stat2}</div>
                </div>
            </div>

            {/* Context Box */}
            <div style={{ 
                padding: '40px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 24, 
                borderLeft: '8px solid SECONDARY_COLOR'
            }}>
                <div style={{ fontSize: 24, color: 'rgba(255,255,255,0.85)', lineHeight: 1.6, fontWeight: 500 }}>{contextText}</div>
            </div>
        </div>

        {/* Scanline Effect */}
        <div style={{ 
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', 
            backgroundImage: 'linear-gradient(transparent 50%, rgba(0,0,0,0.1) 50%)', 
            backgroundSize: '100% 4px', pointerEvents: 'none', opacity: 0.3 
        }} />
      </div>

      {/* Threat Level Sidebar (Right) */}
      <div style={{
          ...glassStyle,
          width: 440, height: 800,
          top: 160, right: 160,
          opacity: panelOp,
          transform: `scale(${panelScale})`
      }}>
          <div style={{ height: 120, backgroundColor: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontSize: 18, fontWeight: 900, color: 'SUPPORT_COLOR', letterSpacing: '0.4em' }}>THREAT_LEVEL</div>
          </div>

          <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', gap: 20 }}>
              {['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((level, i) => {
                  const isActive = i === 0;
                  return (
                      <div key={i} style={{ 
                          height: 80, borderRadius: 16, border: '1px solid rgba(255,255,255,0.1)',
                          backgroundColor: isActive ? 'SECONDARY_COLOR' : 'transparent',
                          display: 'flex', alignItems: 'center', padding: '0 30px',
                          opacity: isActive ? 1 : 0.4
                      }}>
                          <div style={{ fontSize: 24, fontWeight: 900, color: isActive ? '#000' : '#fff', letterSpacing: '0.1em' }}>{level}</div>
                          {isActive && <div style={{ marginLeft: 'auto', width: 12, height: 12, borderRadius: '50%', backgroundColor: '#000' }} />}
                      </div>
                  )
              })}
          </div>

          <div style={{ marginTop: 'auto', padding: '40px', textAlign: 'center' }}>
             <div style={{ fontSize: 14, color: 'ACCENT_COLOR', fontWeight: 900, letterSpacing: '0.2em', marginBottom: 8 }}>ASSIGNED_TAG</div>
             <div style={{ fontSize: 28, fontWeight: 800, color: '#fff', textTransform: 'uppercase' }}>{tag3}</div>
          </div>
      </div>

      {/* Technical Metadata */}
      <div style={{ position: 'absolute', bottom: 40, left: 60, opacity: 0.2 }}>
        <div style={{ color: '#fff', fontSize: 12, fontFamily: 'monospace' }}>
            ID: 0x{Math.floor(frame * 123).toString(16).toUpperCase()} // SECURE_RELAY: ACTIVE<br />
            MODE: THREAT_INTEL_ANALYSIS
        </div>
      </div>

    </div>
  )
}

export default AnimationComponent