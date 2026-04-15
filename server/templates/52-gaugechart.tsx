import React, { useMemo } from 'react'
import { useCurrentFrame, interpolate } from 'remotion'

export const AnimationComponent = () => {
  const frame = useCurrentFrame()

  const titleOp = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const titleTy = interpolate(frame, [0, 20], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const barW = interpolate(frame, [10, 40], [0, 1920], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const gaugeProgress = interpolate(frame, [20, 80], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const valueOp = interpolate(frame, [72, 88], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const valueTy = interpolate(frame, [72, 88], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const labelOp = interpolate(frame, [80, 95], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  const title = "TITLE_TEXT"
  const percentValue = "PERCENT_VALUE"
  const percentLabel = "PERCENT_LABEL"
  const contextText = "CONTEXT_TEXT"

  const cx = 960
  const cy = 620
  const outerR = 340
  const strokeW = 60
  const arcR = outerR - strokeW / 2

  // Parse target percentage from string (e.g., "74" -> 0.74)
  const targetPct = useMemo(() => {
    const val = parseFloat(percentValue.replace(/[^0-9.]/g, '')) || 0;
    return Math.min(1, val / 100);
  }, [percentValue]);

  const currentPct = gaugeProgress * targetPct;
  const startAngle = Math.PI;
  const sweepAngle = currentPct * Math.PI;
  const endAngle = startAngle + sweepAngle;

  const x1 = cx + arcR * Math.cos(startAngle)
  const y1 = cy + arcR * Math.sin(startAngle)
  const x2 = cx + arcR * Math.cos(endAngle)
  const y2 = cy + arcR * Math.sin(endAngle)
  const largeArc = currentPct > 0.5 ? 1 : 0

  const arcPath = currentPct > 0.001 ? `M ${x1} ${y1} A ${arcR} ${arcR} 0 ${largeArc} 1 ${x2} ${y2}` : ''

  // Needle angle
  const needleAngle = Math.PI + currentPct * Math.PI;
  const needleX = cx + (arcR - 20) * Math.cos(needleAngle)
  const needleY = cy + (arcR - 20) * Math.sin(needleAngle)

  // Zone colors — background segments
  const zones = [
    { start: 0, end: 0.5, color: 'PRIMARY_COLOR' },
    { start: 0.5, end: 1.0, color: 'ACCENT_COLOR' },
  ].filter(zone => zone.color !== '' && zone.color !== 'Placeholder')

  return (
    <div style={{ 
      position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden', 
      backgroundColor: 'BACKGROUND_COLOR', fontFamily: 'Inter, system-ui, sans-serif' 
    }}>
      {/* Background Decor */}
      <div style={{ 
        position: 'absolute', top: '10%', left: '10%', width: '80%', height: '80%', 
        border: '1px solid rgba(255,255,255,0.03)', borderRadius: '50%', opacity: 0.5 
      }} />

      <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 5, overflow: 'hidden', backgroundColor: 'PRIMARY_COLOR', opacity: titleOp }} />
      <div style={{ position: 'absolute', top: 1074, left: 0, width: barW, height: 6, overflow: 'hidden', backgroundColor: 'PRIMARY_COLOR' }} />
      
      <div style={{ 
        position: 'absolute', top: 80, left: 0, width: 1920, height: 60, 
        overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', 
        opacity: titleOp, transform: `translateY(${titleTy}px)` 
      }}>
        <span style={{ fontSize: 24, fontWeight: 800, color: 'PRIMARY_COLOR', letterSpacing: 8, textTransform: 'uppercase' }}>{title}</span>
      </div>

      {/* Main Gauge Container (Glassy) */}
      <div style={{
        position: 'absolute', top: cy - 450, left: cx - 500, width: 1000, height: 600,
        backgroundColor: 'rgba(255,255,255,0.01)', backdropFilter: 'blur(10px)',
        borderRadius: '40px 40px 0 0', border: '1px solid rgba(255,255,255,0.05)',
        borderBottom: 'none', opacity: titleOp
      }} />

      <svg width={1920} height={1080} style={{ position: 'absolute', top: 0, left: 0 }}>
        <defs>
          <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="PRIMARY_COLOR" />
            <stop offset="100%" stopColor="ACCENT_COLOR" />
          </linearGradient>
        </defs>

        {/* Zone arcs background */}
        {zones.map((zone, i) => {
          const sa = Math.PI + zone.start * Math.PI
          const ea = Math.PI + zone.end * Math.PI
          const zx1 = cx + arcR * Math.cos(sa)
          const zy1 = cy + arcR * Math.sin(sa)
          const zx2 = cx + arcR * Math.cos(ea)
          const zy2 = cy + arcR * Math.sin(ea)
          const la = (zone.end - zone.start) > 0.5 ? 1 : 0
          return <path key={i} d={`M ${zx1} ${zy1} A ${arcR} ${arcR} 0 ${la} 1 ${zx2} ${zy2}`} fill="none" stroke={zone.color} strokeWidth={strokeW} opacity={0.05} />
        })}
        {/* Active arc */}
        {arcPath && <path d={arcPath} fill="none" stroke="url(#gaugeGradient)" strokeWidth={strokeW} strokeLinecap="round" filter="drop-shadow(0 0 10px rgba(0,0,0,0.5))" />}
        
        {/* Needle */}
        <line x1={cx} y1={cy} x2={needleX} y2={needleY} stroke="PRIMARY_COLOR" strokeWidth={6} strokeLinecap="round" opacity={gaugeProgress} />
        <circle cx={cx} cy={cy} r={22} fill="BACKGROUND_COLOR" stroke="PRIMARY_COLOR" strokeWidth={4} opacity={gaugeProgress} />
        
        {/* Min/Max labels */}
        <text x={cx - arcR} y={cy + 50} fill="SUPPORT_COLOR" fontSize={18} fontWeight={700} textAnchor="middle" opacity={labelOp}>MIN</text>
        <text x={cx + arcR} y={cy + 50} fill="SUPPORT_COLOR" fontSize={18} fontWeight={700} textAnchor="middle" opacity={labelOp}>MAX</text>
      </svg>

      <div style={{ 
        position: 'absolute', top: cy - 120, left: cx - 200, width: 400, height: 140, 
        overflow: 'hidden', opacity: valueOp, transform: `translateY(${valueTy}px)`, 
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' 
      }}>
        <span style={{ fontSize: 120, fontWeight: 900, color: 'PRIMARY_COLOR', lineHeight: 1, letterSpacing: -4 }}>{percentValue}</span>
        <span style={{ fontSize: 22, fontWeight: 700, color: 'PRIMARY_COLOR', textTransform: 'uppercase', letterSpacing: 4, marginTop: 10 }}>{percentLabel}</span>
      </div>

      <div style={{ position: 'absolute', top: cy + 120, left: 0, width: 1920, height: 50, overflow: 'hidden', opacity: labelOp, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ padding: '8px 24px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 100, border: '1px solid rgba(255,255,255,0.05)' }}>
          <span style={{ fontSize: 20, fontWeight: 500, color: 'SUPPORT_COLOR', letterSpacing: 1 }}>{contextText}</span>
        </div>
      </div>
    </div>
  )
}

export default AnimationComponent