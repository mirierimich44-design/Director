import React, { useMemo } from 'react'
import { useCurrentFrame, interpolate } from 'remotion'

export const AnimationComponent = () => {
  const frame = useCurrentFrame()

  const title = "TITLE_TEXT"
  const rawStages = ["PHASE_1", "PHASE_2", "PHASE_3", "PHASE_4"]
  const rawValues = ["BAR_VALUE_1", "BAR_VALUE_2", "BAR_VALUE_3", "BAR_VALUE_4"]
  const rawFunnelWidths = [1200, 900, 620, 380]

  const activeItems = useMemo(() => {
    return rawStages
      .map((stage, i) => ({
        stage,
        value: rawValues[i],
        width: rawFunnelWidths[i]
      }))
      .filter(item => item.stage !== '' && item.stage !== 'Placeholder' && item.value !== '' && item.value !== 'Placeholder')
  }, [])

  const count = activeItems.length

  const titleOp = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const titleTy = interpolate(frame, [0, 20], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const barW = interpolate(frame, [10, 40], [0, 1920], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  const stageH = 120
  const stageGap = 12
  const startY = 200
  const cx = 960

  const stageColors = ['PRIMARY_COLOR', 'PANEL_LEFT_BG', 'PANEL_LEFT_BG', 'SECONDARY_COLOR']
  const textColors = ['TEXT_ON_PRIMARY', 'TEXT_ON_SECONDARY', 'TEXT_ON_SECONDARY', 'TEXT_ON_SECONDARY']

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden', backgroundColor: 'BACKGROUND_COLOR' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 5, overflow: 'hidden', backgroundColor: 'PRIMARY_COLOR', opacity: titleOp }} />
      <div style={{ position: 'absolute', top: 1074, left: 0, width: barW, height: 6, overflow: 'hidden', backgroundColor: 'PRIMARY_COLOR' }} />
      <div style={{ position: 'absolute', top: 60, left: 0, width: 1920, height: 60, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: titleOp, transform: `translateY(${titleTy}px)` }}>
        <span style={{ fontSize: 28, fontWeight: 700, color: 'PRIMARY_COLOR', letterSpacing: 5, textTransform: 'uppercase', fontFamily: 'sans-serif' }}>{title}</span>
      </div>
      {activeItems.map((item, i) => {
        const sOp = interpolate(frame, [18 + i * 10, 32 + i * 10], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
        const sTx = interpolate(frame, [18 + i * 10, 32 + i * 10], [-40, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
        const labelOp = interpolate(frame, [60, 75], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

        const w = item.width
        const x = cx - w / 2
        const y = startY + i * (stageH + stageGap)
        
        return (
          <div key={i}>
            <div style={{ position: 'absolute', top: y, left: x, width: w, height: stageH, overflow: 'hidden', backgroundColor: stageColors[i % stageColors.length], borderRadius: 4, opacity: sOp, transform: `translateX(${sTx}px)`, boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 28, fontWeight: 700, color: textColors[i % textColors.length], fontFamily: 'sans-serif', textAlign: 'center' }}>{item.stage}</span>
            </div>
            <div style={{ position: 'absolute', top: y + stageH / 2 - 20, left: cx + w / 2 + 24, width: 300, height: 40, overflow: 'hidden', opacity: labelOp, display: 'flex', alignItems: 'center' }}>
              <span style={{ fontSize: 28, fontWeight: 800, color: i === count - 1 ? 'SECONDARY_COLOR' : 'ACCENT_COLOR', fontFamily: 'sans-serif' }}>{item.value}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default AnimationComponent