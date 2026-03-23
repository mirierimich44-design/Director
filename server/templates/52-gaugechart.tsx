import React from 'react'
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

  // Gauge is a half circle (180 degrees) from left to right
  const targetPct = 0.75
  const currentPct = gaugeProgress * targetPct
  const startAngle = Math.PI
  const sweepAngle = currentPct * Math.PI
  const endAngle = startAngle + sweepAngle

  const x1 = cx + arcR * Math.cos(startAngle)
  const y1 = cy + arcR * Math.sin(startAngle)
  const x2 = cx + arcR * Math.cos(endAngle)
  const y2 = cy + arcR * Math.sin(endAngle)
  const largeArc = currentPct > 0.5 ? 1 : 0

  const arcPath = currentPct > 0.001 ? `M ${x1} ${y1} A ${arcR} ${arcR} 0 ${largeArc} 1 ${x2} ${y2}` : ''

  // Needle angle
  const needleAngle = Math.PI + currentPct * Math.PI
  const needleX = cx + (arcR - 20) * Math.cos(needleAngle)
  const needleY = cy + (arcR - 20) * Math.sin(needleAngle)

  // Zone colors — background segments
  const zones = [
    { start: 0, end: 0.33, color: '#22c55e' },
    { start: 0.33, end: 0.66, color: '#f59e0b' },
    { start: 0.66, end: 1.0, color: '#ef4444' },
  ].filter(zone => zone.color !== '' && zone.color !== 'Placeholder')

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden', backgroundColor: 'BACKGROUND_COLOR' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 5, overflow: 'hidden', backgroundColor: 'PRIMARY_COLOR', opacity: titleOp }} />
      <div style={{ position: 'absolute', top: 1074, left: 0, width: barW, height: 6, overflow: 'hidden', backgroundColor: 'PRIMARY_COLOR' }} />
      <div style={{ position: 'absolute', top: 60, left: 0, width: 1920, height: 60, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: titleOp, transform: `translateY(${titleTy}px)` }}>
        <span style={{ fontSize: 28, fontWeight: 700, color: 'PRIMARY_COLOR', letterSpacing: 5, textTransform: 'uppercase', fontFamily: 'sans-serif' }}>{title}</span>
      </div>
      <svg width={1920} height={1080} style={{ position: 'absolute', top: 0, left: 0 }}>
        {/* Zone arcs background */}
        {zones.map((zone, i) => {
          const sa = Math.PI + zone.start * Math.PI
          const ea = Math.PI + zone.end * Math.PI
          const zx1 = cx + arcR * Math.cos(sa)
          const zy1 = cy + arcR * Math.sin(sa)
          const zx2 = cx + arcR * Math.cos(ea)
          const zy2 = cy + arcR * Math.sin(ea)
          const la = (zone.end - zone.start) > 0.5 ? 1 : 0
          return <path key={i} d={`M ${zx1} ${zy1} A ${arcR} ${arcR} 0 ${la} 1 ${zx2} ${zy2}`} fill="none" stroke={zone.color} strokeWidth={strokeW} opacity={0.2} />
        })}
        {/* Active arc */}
        {arcPath && <path d={arcPath} fill="none" stroke="PRIMARY_COLOR" strokeWidth={strokeW} strokeLinecap="round" />}
        {/* Needle */}
        <line x1={cx} y1={cy} x2={needleX} y2={needleY} stroke="ACCENT_COLOR" strokeWidth={4} strokeLinecap="round" opacity={gaugeProgress} />
        <circle cx={cx} cy={cy} r={18} fill="PRIMARY_COLOR" opacity={gaugeProgress} />
        {/* Min/Max labels */}
        <text x={cx - arcR - 10} y={cy + 40} fill="SUPPORT_COLOR" fontSize={20} fontFamily="sans-serif" textAnchor="middle" opacity={labelOp}>0</text>
        <text x={cx + arcR + 10} y={cy + 40} fill="SUPPORT_COLOR" fontSize={20} fontFamily="sans-serif" textAnchor="middle" opacity={100}>100</text>
      </svg>
      <div style={{ position: 'absolute', top: cy - 80, left: cx - 160, width: 320, height: 100, overflow: 'hidden', opacity: valueOp, transform: `translateY(${valueTy}px)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 88, fontWeight: 900, color: 'PRIMARY_COLOR', fontFamily: 'sans-serif', lineHeight: 1, letterSpacing: -2 }}>{percentValue}</span>
      </div>
      <div style={{ position: 'absolute', top: cy + 30, left: cx - 200, width: 400, height: 50, overflow: 'hidden', opacity: valueOp, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 24, fontWeight: 600, color: 'SUPPORT_COLOR', fontFamily: 'sans-serif', textTransform: 'uppercase', letterSpacing: 2 }}>{percentLabel}</span>
      </div>
      <div style={{ position: 'absolute', top: cy + 100, left: 0, width: 1920, height: 50, overflow: 'hidden', opacity: labelOp, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 22, fontWeight: 400, color: 'SUPPORT_COLOR', fontFamily: 'sans-serif' }}>{contextText}</span>
      </div>
    </div>
  )
}

export default AnimationComponent