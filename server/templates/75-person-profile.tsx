import React, { useMemo } from 'react'
import { useCurrentFrame, interpolate, Easing } from 'remotion'

export const AnimationComponent = () => {
  const frame = useCurrentFrame()

  const label1 = "LABEL_1" // Name
  const label2 = "LABEL_2" // Role
  const label3 = "LABEL_3" // Organization
  const rawTags = ["TAG_1", "TAG_2", "TAG_3"]
  const contextText = "CONTEXT_TEXT"
  const titleText = "TITLE_TEXT"

  const tags = useMemo(() => {
    return rawTags.filter(tag => tag !== '' && tag !== 'Placeholder' && tag !== ' ')
  }, [rawTags])

  // Base Animations (Fades only)
  const bgOp = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const cardOp = interpolate(frame, [15, 40], [0, 1], { extrapolateLeft: 'clamp' })
  const contentOp = interpolate(frame, [30, 50], [0, 1], { extrapolateLeft: 'clamp' })

  return (
    <div style={{
      position: 'absolute', inset: 0, overflow: 'hidden',
      backgroundColor: 'BACKGROUND_COLOR', fontFamily: 'Inter, system-ui, sans-serif',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      
      {/* Background Decor */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
        backgroundSize: '120px 120px', opacity: bgOp
      }} />

      {/* 16:9 Safe Container */}
      <div style={{ width: 1600, height: 900, position: 'relative', opacity: cardOp, display: 'flex', alignItems: 'center' }}>

        {/* Profile Glass Card */}
        <div style={{
          width: 1300, height: 600, backgroundColor: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(30px)', borderRadius: 32, border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 40px 100px rgba(0,0,0,0.6)', display: 'flex', overflow: 'hidden',
          marginLeft: 150
        }}>
           
           {/* Left Color Accent Bar */}
           <div style={{ width: 12, backgroundColor: 'PRIMARY_COLOR', boxShadow: '0 0 20px PRIMARY_COLOR' }} />

           {/* Avatar Section */}
           <div style={{ width: 400, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid rgba(255,255,255,0.05)', padding: 40 }}>
              <div style={{
                width: 240, height: 240, borderRadius: '50%',
                backgroundColor: 'rgba(255,255,255,0.03)', border: '4px solid PRIMARY_COLOR',
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 40,
                boxShadow: '0 0 30px rgba(0,0,0,0.3)'
              }}>
                <span style={{ fontSize: 80, fontWeight: 900, color: 'PRIMARY_COLOR', opacity: 0.5 }}>PERSON</span>
              </div>

              {/* Action Tags */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center', opacity: contentOp }}>
                {tags.map((tag, i) => (
                  <div key={i} style={{
                    padding: '6px 16px', backgroundColor: 'rgba(255,255,255,0.05)',
                    borderRadius: 100, border: '1px solid rgba(255,255,255,0.1)'
                  }}>
                    <span style={{ fontSize: 12, fontWeight: 900, color: 'ACCENT_COLOR', letterSpacing: 2, textTransform: 'uppercase' }}>{tag}</span>
                  </div>
                ))}
              </div>
           </div>

           {/* Content Section */}
           <div style={{ flex: 1, padding: '80px', display: 'flex', flexDirection: 'column', opacity: contentOp }}>
              <div style={{ color: 'PRIMARY_COLOR', fontSize: 14, fontWeight: 900, letterSpacing: 6, textTransform: 'uppercase', marginBottom: 12, opacity: 0.8 }}>IDENTIFIED_SUBJECT</div>
              
              <h1 style={{ fontSize: 80, fontWeight: 900, color: '#fff', margin: 0, lineHeight: 1, letterSpacing: '-0.02em', marginBottom: 24 }}>
                {label1}
              </h1>

              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 40 }}>
                <div style={{ height: 2, width: 40, backgroundColor: 'ACCENT_COLOR' }} />
                <span style={{ fontSize: 24, fontWeight: 700, color: 'ACCENT_COLOR', textTransform: 'uppercase', letterSpacing: 2 }}>{label2}</span>
                <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 20 }}>//</span>
                <span style={{ fontSize: 20, fontWeight: 600, color: 'SUPPORT_COLOR' }}>{label3}</span>
              </div>

              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 22, lineHeight: 1.6, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical' }}>
                {contextText}
              </div>

              {/* Bottom Metadata */}
              <div style={{ marginTop: 'auto', display: 'flex', gap: 40, opacity: 0.4 }}>
                 <div>
                    <div style={{ fontSize: 10, fontWeight: 900, color: 'SUPPORT_COLOR', letterSpacing: 2 }}>STATUS</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>VERIFIED</div>
                 </div>
                 <div>
                    <div style={{ fontSize: 10, fontWeight: 900, color: 'SUPPORT_COLOR', letterSpacing: 2 }}>ACCESS_LVL</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>RESTRICTED</div>
                 </div>
              </div>
           </div>
        </div>

        {/* Floating Title Label (Safe Zone Top) */}
        <div style={{ position: 'absolute', top: 40, left: 150, opacity: bgOp }}>
           <span style={{ fontSize: 16, fontWeight: 900, color: 'PRIMARY_COLOR', letterSpacing: 10, textTransform: 'uppercase' }}>{titleText}</span>
        </div>

      </div>
    </div>
  )
}

export default AnimationComponent;