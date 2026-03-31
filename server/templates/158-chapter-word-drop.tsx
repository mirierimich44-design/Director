import React, { useMemo } from 'react'
import { useCurrentFrame, interpolate } from 'remotion'

export const AnimationComponent = () => {
  const frame = useCurrentFrame()

  const bgOp = interpolate(frame, [0, 15], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const chapLabelOp = interpolate(frame, [8, 22], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const chapLabelTy = interpolate(frame, [8, 22], [-20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const wordOp = interpolate(frame, [18, 35], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const wordTy = interpolate(frame, [18, 35], [-80, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const subOp = interpolate(frame, [32, 48], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const subTy = interpolate(frame, [32, 48], [40, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const divW = interpolate(frame, [28, 50], [0, 400], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const ctxOp = interpolate(frame, [50, 65], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const ctxTy = interpolate(frame, [50, 65], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const barW = interpolate(frame, [20, 55], [0, 1920], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  const chapterWord = "CHAPTER_WORD"
  const chapterSub = "CHAPTER_SUB"
  const contextText = "CONTEXT_TEXT"

  // Streaming Data for BG
  const logs = [
    "BREACH_DETECTION: SALT_TYPHOON",
    "POST_MORTEM_INITIATED...",
    "TRACING_ORIGIN_NODE_0x7F",
    "ANALYZING_PACKET_SIGNATURES",
    "DECODING_MALWARE_PAYLOAD",
    "SYSTEM_VULNERABILITY_042",
    "NETWORK_EXFIL_DETECTED",
    "ENCRYPTION_LAYER_BYPASS",
  ]

  // Dynamic Font Scaling for Hero Word
  const heroFontSize = useMemo(() => {
    const len = chapterSub.length;
    if (len > 15) return 100;
    if (len > 12) return 120;
    if (len > 10) return 140;
    return 160;
  }, [chapterSub]);

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: 1920,
      height: 1080,
      overflow: 'hidden',
      backgroundColor: 'BACKGROUND_COLOR',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>

      {/* Modern Technical Background */}
      <div style={{
        position: 'absolute', width: '100%', height: '100%',
        backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.02) 0%, transparent 80%), linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
        backgroundSize: '100% 100%, 80px 80px, 80px 80px',
        opacity: bgOp * 0.8
      }} />

      {/* Streaming Forensic Logs in BG */}
      <div style={{ position: 'absolute', top: 0, left: 100, width: 400, height: '100%', opacity: bgOp * 0.15 }}>
        {logs.map((log, i) => {
           const logTy = interpolate(frame, [0, 450], [i * 140, (i * 140) - 200]);
           return (
             <div key={i} style={{ 
               color: 'PRIMARY_COLOR', fontFamily: 'monospace', fontSize: 14, 
               marginBottom: 120, transform: `translateY(${logTy}px)`,
               whiteSpace: 'nowrap'
             }}>
               {log} // 0x{Math.floor(frame * (i+1)).toString(16).toUpperCase()}
             </div>
           )
        })}
      </div>

      {/* Large Drifting Background Text */}
      <div style={{
        position: 'absolute', top: 400, right: -100, fontSize: 320, fontWeight: 900,
        color: 'PRIMARY_COLOR', opacity: bgOp * 0.03, transform: `translateX(${-frame * 0.5}px)`,
        whiteSpace: 'nowrap', pointerEvents: 'none'
      }}>
        {chapterSub.toUpperCase()}_{chapterSub.toUpperCase()}
      </div>

      {/* Floating Particles */}
      <svg width="1920" height="1080" style={{ position: 'absolute', top: 0, left: 0, opacity: bgOp * 0.4 }}>
        {[...Array(8)].map((_, i) => {
          const x = (i * 300 + 100) % 1920;
          const y = (i * 200 + 200) % 1080;
          const scale = interpolate(Math.sin((frame + i * 20) / 40), [-1, 1], [0.8, 1.2]);
          return (
            <g key={i} style={{ transform: `translate(${x}px, ${y}px) scale(${scale})` }}>
              <rect width="40" height="2" fill="ACCENT_COLOR" opacity="0.3" />
              <rect width="2" height="40" fill="ACCENT_COLOR" opacity="0.3" />
            </g>
          )
        })}
      </svg>

      {/* Main Content Area */}
      <div style={{ position: 'absolute', top: 220, left: 180, width: 1560 }}>
        
        {/* Top Marker Line */}
        <div style={{
            width: 5, height: 60, backgroundColor: 'PRIMARY_COLOR', 
            opacity: chapLabelOp, marginBottom: 10
        }} />

        {/* Chapter label */}
        <div style={{
            opacity: chapLabelOp,
            transform: `translateY(${chapLabelTy}px)`,
            marginBottom: 20
        }}>
            <span style={{
            fontSize: 24,
            fontWeight: 800,
            color: 'PRIMARY_COLOR',
            letterSpacing: 8,
            textTransform: 'uppercase',
            textShadow: '0 0 20px rgba(0,0,0,0.92)'
            }}>
            {chapterWord}
            </span>
        </div>

        {/* Divider line */}
        <div style={{
            width: divW,
            height: 4,
            backgroundColor: 'ACCENT_COLOR',
            boxShadow: '0 0 15px ACCENT_COLOR',
            marginBottom: 40
        }} />

        {/* Hero word with dynamic scaling */}
        <div style={{
            opacity: wordOp,
            transform: `translateY(${wordTy}px)`,
            marginBottom: 40
        }}>
            <span style={{
            fontSize: heroFontSize,
            fontWeight: 900,
            color: '#fff',
            lineHeight: 1,
            letterSpacing: -2,
            textTransform: 'uppercase',
            display: 'block',
            textShadow: '0 10px 40px rgba(0,0,0,0.92)'
            }}>
            {chapterSub}
            </span>
        </div>

        {/* Context text */}
        <div style={{
            width: 1200,
            opacity: ctxOp,
            transform: `translateY(${ctxTy}px)`,
            backgroundColor: 'rgba(255,255,255,0.03)',
            padding: '30px',
            borderRadius: '16px',
            borderLeft: '4px solid PRIMARY_COLOR',
            backdropFilter: 'blur(8px)'
        }}>
            <span style={{
            fontSize: 28,
            fontWeight: 400,
            color: 'rgba(255,255,255,0.8)',
            lineHeight: 1.6,
            }}>
            {contextText}
            </span>
        </div>
      </div>

      {/* Sub label bottom right (Technical ID) */}
      <div style={{
        position: 'absolute',
        bottom: 80,
        right: 100,
        opacity: subOp,
        transform: `translateY(${subTy}px)`,
        textAlign: 'right'
      }}>
        <div style={{ fontSize: 12, color: 'ACCENT_COLOR', fontWeight: 900, letterSpacing: '0.3em', marginBottom: 4 }}>FILE_REFERENCE</div>
        <div style={{
          fontSize: 20,
          fontWeight: 700,
          color: '#fff',
          fontFamily: 'monospace',
          letterSpacing: 2,
          textTransform: 'uppercase',
        }}>
          0x{Math.floor(frame * 1.5).toString(16).toUpperCase()}_{chapterWord}
        </div>
      </div>

    </div>
  )
}

export default AnimationComponent