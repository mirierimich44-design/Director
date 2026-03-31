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
  const stat3 = "STAT_VALUE_3"
  const contextText = "CONTEXT_TEXT"

  const rawTags = [tag1, tag2, tag3]
  const rawStats = [
    { value: stat1, label: label1.toUpperCase() + "_METRIC" },
    { value: stat2, label: "GLOBAL_REACH" },
    { value: stat3, label: "ESTABLISHED" },
  ]

  const filteredTags = useMemo(() => {
    return rawTags
      .filter(tag => tag !== '' && tag !== 'Placeholder')
  }, [rawTags])

  const filteredStats = useMemo(() => {
    return rawStats.filter(item => item.value !== '' && item.value !== 'Placeholder')
  }, [rawStats])

  // Animation Timings
  const entranceStart = 5
  const bgOp = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const mainPanelOp = interpolate(frame, [entranceStart, entranceStart + 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const mainPanelScale = interpolate(frame, [entranceStart, entranceStart + 30], [0.82, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.quad) })
  
  const contentOp = interpolate(frame, [entranceStart + 15, entranceStart + 40], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const contentTy = interpolate(frame, [entranceStart + 15, entranceStart + 40], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.quad) })
  const contextOp = interpolate(frame, [entranceStart + 40, entranceStart + 70], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  const glassStyle: React.CSSProperties = {
    backgroundColor: 'rgba(15, 23, 42, 0.92)',
    backdropFilter: 'blur(32px)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    borderRadius: '32px',
    boxShadow: '0 40px 100px rgba(0,0,0,0.92)',
    position: 'absolute'
  }

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden', backgroundColor: '#0A0A14', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* Background Decor */}
      <div style={{
        position: 'absolute', width: '100%', height: '100%',
        backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.02) 0%, transparent 80%), linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
        backgroundSize: '100% 100%, 100px 100px, 100px 100px',
        opacity: bgOp * 0.5
      }} />

      {/* Modern Header */}
      <div style={{ position: 'absolute', top: 60, width: '100%', textAlign: 'center', opacity: bgOp }}>
        <div style={{ fontSize: 16, fontWeight: 900, color: 'ACCENT_COLOR', letterSpacing: '0.5em', textTransform: 'uppercase' }}>{titleText}</div>
        <div style={{ width: 60, height: 4, backgroundColor: 'PRIMARY_COLOR', margin: '16px auto', borderRadius: 2, boxShadow: '0 0 15px PRIMARY_COLOR' }} />
      </div>

      {/* Main Container */}
      <div style={{
        ...glassStyle,
        width: 1500, height: 750,
        top: 180, left: 210,
        opacity: mainPanelOp,
        transform: `scale(${mainPanelScale})`,
        display: 'flex',
        flexDirection: 'column',
        padding: '80px',
        overflow: 'hidden'
      }}>
        
        {/* Top Section: Identity */}
        <div style={{ display: 'flex', gap: 60, marginBottom: 60, opacity: contentOp, transform: `translateY(${contentTy}px)` }}>
           {/* Avatar / Icon */}
           <div style={{ 
               width: 180, height: 180, backgroundColor: 'PRIMARY_COLOR', borderRadius: 24,
               display: 'flex', alignItems: 'center', justifyContent: 'center',
               fontSize: 80, fontWeight: 900, color: '#0A0A14',
               boxShadow: '0 20px 50px rgba(0,0,0,0.92)'
           }}>
             {label1.charAt(0)}
           </div>

           <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ fontSize: 84, fontWeight: 900, color: '#fff', lineHeight: 1, marginBottom: 12 }}>{label1}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                 <div style={{ fontSize: 24, fontWeight: 700, color: 'ACCENT_COLOR', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label2}</div>
                 <div style={{ width: 1, height: 24, backgroundColor: 'rgba(255,255,255,0.2)' }} />
                 <div style={{ fontSize: 22, color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>{label3}</div>
              </div>
           </div>
        </div>

        {/* Middle Section: Tags & Divider */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 40, opacity: contentOp }}>
           {filteredTags.map((tag, i) => (
             <div key={i} style={{ 
               padding: '10px 24px', backgroundColor: 'rgba(255,255,255,0.05)', 
               borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)',
               color: 'PRIMARY_COLOR', fontSize: 16, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em'
             }}>
               {tag}
             </div>
           ))}
        </div>

        <div style={{ height: 1, width: '100%', backgroundColor: 'rgba(255,255,255,0.1)', marginBottom: 60 }} />

        {/* Bottom Section: Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 40, marginBottom: 60 }}>
           {filteredStats.map((stat, i) => {
             const statOp = interpolate(frame, [entranceStart + 30 + i * 10, entranceStart + 50 + i * 10], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
             const statTy = interpolate(frame, [entranceStart + 30 + i * 10, entranceStart + 50 + i * 10], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.quad) });
             
             return (
               <div key={i} style={{ opacity: statOp, transform: `translateY(${statTy}px)` }}>
                  <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 12 }}>{stat.label}</div>
                  <div style={{ fontSize: 56, fontWeight: 900, color: i === 1 ? 'ACCENT_COLOR' : '#fff', fontFamily: 'monospace' }}>{stat.value}</div>
               </div>
             )
           })}
        </div>

        {/* Context Text Footer */}
        <div style={{ 
            marginTop: 'auto', padding: '32px', backgroundColor: 'rgba(255,255,255,0.03)', 
            borderRadius: 20, border: '1px solid rgba(255,255,255,0.05)',
            opacity: contextOp, transform: `translateY(${contextOp * -10 + 10}px)`
        }}>
           <div style={{ fontSize: 24, color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, fontWeight: 400 }}>{contextText}</div>
        </div>

      </div>

      {/* Side Decorative Metadata */}
      <div style={{ position: 'absolute', bottom: 60, left: 80, opacity: 0.2 }}>
        <div style={{ color: '#fff', fontSize: 12, fontFamily: 'monospace', letterSpacing: '0.1em' }}>
           ORGN_PROFILE_v1.2 // SECURE_ARCHIVE<br />
           ACCESS_LEVEL: ALPHA // CLASSIFIED
        </div>
      </div>
    </div>
  )
}

export default AnimationComponent