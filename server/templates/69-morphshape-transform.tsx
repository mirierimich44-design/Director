import React from 'react'
import { useCurrentFrame, interpolate } from 'remotion'

export const AnimationComponent = () => {
  const frame = useCurrentFrame()

  const bgOp = interpolate(frame, [0, 18], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const barW = interpolate(frame, [10, 40], [0, 1920], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  // Shape A fades out, Shape B fades in — crossfade morph
  const shapeAOp = interpolate(frame, [10, 55], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const shapeBOp = interpolate(frame, [35, 75], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const shapeBScale = interpolate(frame, [35, 75], [0.7, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  // Background shifts
  const bgShift = interpolate(frame, [30, 70], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  const label1Op = interpolate(frame, [8, 25], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const label1Ty = interpolate(frame, [8, 25], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const label2Op = interpolate(frame, [68, 85], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const label2Ty = interpolate(frame, [68, 85], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const contextOp = interpolate(frame, [78, 95], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  const compareLabel1 = "COMPARE_LABEL_1"
  const compareLabel2 = "COMPARE_LABEL_2"
  const compareValue1 = "COMPARE_VALUE_1"
  const compareValue2 = "COMPARE_VALUE_2"
  const contextText = "CONTEXT_TEXT"

  const cx = 960
  const cy = 520

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden', backgroundColor: 'BACKGROUND_COLOR' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden', backgroundColor: 'PANEL_LEFT_BG', opacity: bgOp * 0.08 }} />
      <div style={{ position: 'absolute', top: 1074, left: 0, width: barW, height: 6, overflow: 'hidden', backgroundColor: 'ACCENT_COLOR' }} />

      <svg width={1920} height={1080} style={{ position: 'absolute', top: 0, left: 0 }}>
        {/* Shape A — circle (state 1) */}
        <circle cx={cx} cy={cy} r={280} fill="PRIMARY_COLOR" opacity={shapeAOp * 0.3} />
        <circle cx={cx} cy={cy} r={280} fill="none" stroke="PRIMARY_COLOR" strokeWidth={4} opacity={shapeAOp} />
        <circle cx={cx} cy={cy} r={200} fill="none" stroke="PRIMARY_COLOR" strokeWidth={2} opacity={shapeAOp * 0.5} />

        {/* Shape B — irregular polygon (state 2 — threat/danger) */}
        <polygon
          points={`${cx},${cy-300} ${cx+260},${cy-140} ${cx+320},${cy+120} ${cx+180},${cy+310} ${cx-120},${cy+320} ${cx-310},${cy+100} ${cx-280},${cy-180}`}
          fill="SECONDARY_COLOR"
          opacity={shapeBOp * 0.25}
          transform={`scale(${shapeBScale})`}
          style={{ transformOrigin: `${cx}px ${cy}px` }}
        />
        <polygon
          points={`${cx},${cy-300} ${cx+260},${cy-140} ${cx+320},${cy+120} ${cx+180},${cy+310} ${cx-120},${cy+320} ${cx-310},${cy+100} ${cx-280},${cy-180}`}
          fill="none"
          stroke="SECONDARY_COLOR"
          strokeWidth={4}
          opacity={shapeBOp}
          transform={`scale(${shapeBScale})`}
          style={{ transformOrigin: `${cx}px ${cy}px` }}
        />
      </svg>

      {/* Label A — shown during shape A */}
      <div style={{ position: 'absolute', top: cy - 40, left: cx - 200, width: 400, height: 80, overflow: 'hidden', opacity: label1Op * shapeAOp, transform: `translateY(${label1Ty}px)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 52, fontWeight: 900, color: 'PRIMARY_COLOR', fontFamily: 'sans-serif', textAlign: 'center', textTransform: 'uppercase' }}>{compareValue1}</span>
      </div>
      <div style={{ position: 'absolute', top: cy + 50, left: cx - 200, width: 400, height: 40, overflow: 'hidden', opacity: label1Op * shapeAOp, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 22, fontWeight: 600, color: 'SUPPORT_COLOR', fontFamily: 'sans-serif', textTransform: 'uppercase', letterSpacing: 3 }}>{compareLabel1}</span>
      </div>

      {/* Label B — shown during shape B */}
      <div style={{ position: 'absolute', top: cy - 40, left: cx - 200, width: 400, height: 80, overflow: 'hidden', opacity: label2Op, transform: `translateY(${label2Ty}px)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 52, fontWeight: 900, color: 'SECONDARY_COLOR', fontFamily: 'sans-serif', textAlign: 'center', textTransform: 'uppercase' }}>{compareValue2}</span>
      </div>
      <div style={{ position: 'absolute', top: cy + 50, left: cx - 200, width: 400, height: 40, overflow: 'hidden', opacity: label2Op, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 22, fontWeight: 600, color: 'SECONDARY_COLOR', fontFamily: 'sans-serif', textTransform: 'uppercase', letterSpacing: 3 }}>{compareLabel2}</span>
      </div>

      {/* Context */}
      <div style={{ position: 'absolute', top: 900, left: 0, width: 1920, height: 50, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: contextOp }}>
        <span style={{ fontSize: 22, fontWeight: 400, color: 'SUPPORT_COLOR', fontFamily: 'sans-serif' }}>{contextText}</span>
      </div>
    </div>
  )
}

export default AnimationComponent