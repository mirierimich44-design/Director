import React, { useMemo } from 'react'
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion'

export const AnimationComponent = () => {
  const frame = useCurrentFrame()
  const { width, height, durationInFrames } = useVideoConfig()

  const title = "TITLE_TEXT"
  const originLabel = "ORIGIN_LABEL"
  const rawNodeLabels = ["NODE_LABEL_1", "NODE_LABEL_2", "NODE_LABEL_3", "NODE_LABEL_4", "NODE_LABEL_5", "NODE_LABEL_6"]

  const activeNodes = useMemo(() => {
    const filled = rawNodeLabels.filter(label => label !== '' && label !== 'Placeholder' && !label.startsWith('NODE_LABEL_'))
    return filled.length > 0 ? filled : ["GATEWAY_01", "FIREWALL_A", "DATA_STORE", "USER_ENDP", "VULN_SCAN", "BACKUP_02"]
  }, [rawNodeLabels])

  const count = activeNodes.length
  const angles = Array.from({ length: count }, (_, i) => (i * (360 / count) * Math.PI) / 180)

  // Center coordinates
  const cx = 960
  const cy = 540
  const radius = 380

  // Entrance animations
  const entryOp = interpolate(frame, [0, 25], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const centerScale = interpolate(frame, [10, 35], [0.8, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  
  // Rotating Ring Logic
  const rotation = interpolate(frame, [0, durationInFrames], [0, 90], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const rotationInv = interpolate(frame, [0, durationInFrames], [0, -45], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden',
      backgroundColor: 'BACKGROUND_COLOR',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      {/* Background Decor */}
      <div style={{
        position: 'absolute', width: '100%', height: '100%',
        backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.02) 0%, transparent 80%), linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
        backgroundSize: '100% 100%, 120px 120px, 120px 120px',
        opacity: 0.5
      }} />

      {/* Title Area */}
      <div style={{
        position: 'absolute', top: 80, left: '50%', transform: 'translateX(-50%)',
        textAlign: 'center', opacity: entryOp
      }}>
        <div style={{ fontSize: 40, fontWeight: 900, color: 'PRIMARY_COLOR', letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: 8 }}>
          {title}
        </div>
        <div style={{ width: 120, height: 4, backgroundColor: 'PRIMARY_COLOR', margin: '0 auto', boxShadow: '0 0 15px PRIMARY_COLOR' }} />
      </div>

      <svg width={1920} height={1080} style={{ position: 'absolute', top: 0, left: 0, zIndex: 1 }}>
        {/* Connection Lines with Moving Pulse */}
        {angles.map((a, i) => {
          const nx = cx + radius * Math.cos(a)
          const ny = cy + radius * Math.sin(a)
          
          const lineStart = 30 + (i * 5)
          const lineEnd = 55 + (i * 5)
          const lineProgress = interpolate(frame, [lineStart, lineEnd], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
          
          const lx = cx + (nx - cx) * lineProgress
          const ly = cy + (ny - cy) * lineProgress

          // Pulse animation along the line
          const pulseProgress = (frame % 60) / 60
          const px = cx + (nx - cx) * pulseProgress
          const py = cy + (ny - cy) * pulseProgress

          return (
            <g key={`line-${i}`}>
              <line x1={cx} y1={cy} x2={nx} y2={ny} stroke="rgba(255,255,255,0.05)" strokeWidth={4} />
              <line x1={cx} y1={cy} x2={lx} y2={ly} stroke="PRIMARY_COLOR" strokeWidth={4} style={{ filter: 'drop-shadow(0 0 8px PRIMARY_COLOR)' }} />
              {lineProgress === 1 && (
                <circle cx={px} cy={py} r={6} fill="#fff" style={{ filter: 'drop-shadow(0 0 12px #fff)' }} opacity={interpolate(frame % 60, [0, 10, 50, 60], [0, 1, 1, 0])} />
              )}
            </g>
          )
        })}

        {/* Center Node Rotating Rings */}
        <g transform={`translate(${cx}, ${cy}) rotate(${rotation})`} opacity={entryOp}>
          <circle r={140} fill="none" stroke="PRIMARY_COLOR" strokeWidth={2} strokeDasharray="40 20" opacity={0.3} />
        </g>
        <g transform={`translate(${cx}, ${cy}) rotate(${rotationInv})`} opacity={entryOp}>
          <circle r={110} fill="none" stroke="ACCENT_COLOR" strokeWidth={8} strokeDasharray="10 100" opacity={0.5} />
        </g>
      </svg>

      {/* Center Node Card */}
      <div style={{
        position: 'absolute', top: cy, left: cx, transform: `translate(-50%, -50%) scale(${centerScale})`,
        width: 180, height: 180, backgroundColor: 'rgba(15, 23, 42, 0.95)',
        backdropFilter: 'blur(20px)', borderRadius: 24, border: '2px solid PRIMARY_COLOR',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 0 40px rgba(0,0,0,0.5), 0 0 20px PRIMARY_COLOR44', zIndex: 2, opacity: entryOp
      }}>
        <div style={{ width: 40, height: 40, backgroundColor: 'PRIMARY_COLOR', borderRadius: 8, marginBottom: 16, boxShadow: '0 0 15px PRIMARY_COLOR' }} />
        <div style={{ color: 'rgba(255,255,255,0.95)', fontSize: 20, fontWeight: 800, textAlign: 'center', letterSpacing: '0.05em', padding: '0 10px' }}>
          {originLabel}
        </div>
      </div>

      {/* Outer Nodes */}
      {angles.map((a, i) => {
        const nx = cx + radius * Math.cos(a)
        const ny = cy + radius * Math.sin(a)
        
        const appearStart = 50 + (i * 5)
        const op = interpolate(frame, [appearStart, appearStart + 15], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
        const sc = interpolate(frame, [appearStart, appearStart + 15], [0.8, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

        return (
          <div key={`outer-${i}`} style={{
            position: 'absolute', top: ny, left: nx, transform: `translate(-50%, -50%) scale(${sc})`,
            opacity: op, width: 220, padding: '20px',
            backgroundColor: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(16px)',
            borderRadius: 16, border: '1px solid rgba(255,255,255,0.15)',
            boxShadow: '0 12px 32px rgba(0,0,0,0.4)', zIndex: 2,
            display: 'flex', alignItems: 'center', gap: 16
          }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: 'ACCENT_COLOR', boxShadow: '0 0 10px ACCENT_COLOR' }} />
            <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: 18, fontWeight: 600, letterSpacing: '0.02em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {activeNodes[i]}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default AnimationComponent