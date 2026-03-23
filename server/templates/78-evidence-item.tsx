import React from 'react'
import { useCurrentFrame, interpolate } from 'remotion'

export const AnimationComponent = () => {
  const frame = useCurrentFrame()

  const bgOp = interpolate(frame, [0, 18], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const barW = interpolate(frame, [10, 40], [0, 1920], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const panelOp = interpolate(frame, [12, 28], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const panelTy = interpolate(frame, [12, 28], [30, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const tagOp = interpolate(frame, [22, 36], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const titleOp = interpolate(frame, [28, 44], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const titleTy = interpolate(frame, [28, 44], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const divW = interpolate(frame, [38, 60], [0, 800], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const bodyOp = interpolate(frame, [48, 65], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const bodyTy = interpolate(frame, [48, 65], [16, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const metaOp = interpolate(frame, [62, 78], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const stampOp = interpolate(frame, [72, 88], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const stampScale = interpolate(frame, [72, 88], [1.4, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  const title = "TITLE_TEXT"
  const label1 = "LABEL_1"
  const label2 = "LABEL_2"
  const label3 = "LABEL_3"
  const tag1 = "TAG_1"
  const tag2 = "TAG_2"
  const contextText = "CONTEXT_TEXT"
  const alertText = "ALERT_TEXT"

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: 1920,
      height: 1080,
      overflow: 'hidden',
      backgroundColor: 'BACKGROUND_COLOR',
    }}>

      {/* Top accent */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: 1920,
        height: 5,
        overflow: 'hidden',
        backgroundColor: 'PRIMARY_COLOR',
        opacity: bgOp,
      }} />

      {/* Bottom bar */}
      <div style={{
        position: 'absolute',
        top: 1074,
        left: 0,
        width: barW,
        height: 6,
        overflow: 'hidden',
        backgroundColor: 'PRIMARY_COLOR',
      }} />

      {/* Main evidence panel */}
      <div style={{
        position: 'absolute',
        top: 140,
        left: 200,
        width: 1180,
        height: 780,
        overflow: 'hidden',
        backgroundColor: 'CHART_BG',
        borderRadius: 6,
        boxSizing: 'border-box',
        border: '1px solid',
        borderColor: 'CHART_BORDER',
        opacity: panelOp,
        transform: `translateY(${panelTy}px)`,
      }}>

        {/* Header bar */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: 1180,
          height: 72,
          overflow: 'hidden',
          backgroundColor: 'PANEL_LEFT_BG',
          display: 'flex',
          alignItems: 'center',
          boxSizing: 'border-box',
          padding: '0 32px',
        }}>
          <span style={{
            fontSize: 18,
            fontWeight: 600,
            color: 'SUPPORT_COLOR',
            fontFamily: 'monospace',
            letterSpacing: 2,
            textTransform: 'uppercase',
          }}>
            {title}
          </span>
        </div>

        {/* Tags row */}
        <div style={{
          position: 'absolute',
          top: 92,
          left: 32,
          width: 600,
          height: 44,
          overflow: 'hidden',
          opacity: tagOp,
          display: 'flex',
          gap: 12,
          alignItems: 'center',
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: 160,
            height: 44,
            overflow: 'hidden',
            backgroundColor: 'PRIMARY_COLOR',
            borderRadius: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <span style={{
              fontSize: 16,
              fontWeight: 700,
              color: 'TEXT_ON_PRIMARY',
              fontFamily: 'sans-serif',
              letterSpacing: 2,
              textTransform: 'uppercase',
            }}>
              {tag1}
            </span>
          </div>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 176,
            width: 160,
            height: 44,
            overflow: 'hidden',
            backgroundColor: 'SECONDARY_COLOR',
            borderRadius: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <span style={{
              fontSize: 16,
              fontWeight: 700,
              color: 'TEXT_ON_SECONDARY',
              fontFamily: 'sans-serif',
              letterSpacing: 2,
              textTransform: 'uppercase',
            }}>
              {tag2}
            </span>
          </div>
        </div>

        {/* Evidence title */}
        <div style={{
          position: 'absolute',
          top: 158,
          left: 32,
          width: 1100,
          height: 100,
          overflow: 'hidden',
          opacity: titleOp,
          transform: `translateY(${titleTy}px)`,
        }}>
          <span style={{
            fontSize: 56,
            fontWeight: 900,
            color: 'PRIMARY_COLOR',
            fontFamily: 'sans-serif',
            lineHeight: 1.1,
            letterSpacing: -1,
          }}>
            {label1}
          </span>
        </div>

        {/* Divider */}
        <div style={{
          position: 'absolute',
          top: 272,
          left: 32,
          width: divW,
          height: 2,
          overflow: 'hidden',
          backgroundColor: 'ACCENT_COLOR',
        }} />

        {/* Body text */}
        <div style={{
          position: 'absolute',
          top: 294,
          left: 32,
          width: 1100,
          height: 200,
          overflow: 'hidden',
          opacity: bodyOp,
          transform: `translateY(${bodyTy}px)`,
        }}>
          <span style={{
            fontSize: 28,
            fontWeight: 400,
            color: 'TEXT_ON_SECONDARY',
            fontFamily: 'sans-serif',
            lineHeight: 1.6,
          }}>
            {contextText}
          </span>
        </div>

        {/* Meta row */}
        <div style={{
          position: 'absolute',
          top: 530,
          left: 32,
          width: 1100,
          height: 50,
          overflow: 'hidden',
          opacity: metaOp,
          display: 'flex',
          alignItems: 'center',
        }}>
          <span style={{
            fontSize: 20,
            fontWeight: 500,
            color: 'ACCENT_COLOR',
            fontFamily: 'monospace',
            letterSpacing: 1,
          }}>
            {label2}
          </span>
          <span style={{
            fontSize: 20,
            fontWeight: 400,
            color: 'SUPPORT_COLOR',
            fontFamily: 'monospace',
            marginLeft: 40,
          }}>
            {label3}
          </span>
        </div>

        {/* Bottom alert bar */}
        <div style={{
          position: 'absolute',
          top: 620,
          left: 0,
          width: 1180,
          height: 60,
          overflow: 'hidden',
          backgroundColor: 'SECONDARY_COLOR',
          opacity: metaOp,
          display: 'flex',
          alignItems: 'center',
          boxSizing: 'border-box',
          padding: '0 32px',
        }}>
          <span style={{
            fontSize: 20,
            fontWeight: 700,
            color: 'TEXT_ON_SECONDARY',
            fontFamily: 'monospace',
            letterSpacing: 2,
            textTransform: 'uppercase',
          }}>
            {alertText}
          </span>
        </div>

      </div>

      {/* Stamp — right side */}
      <div style={{
        position: 'absolute',
        top: 340,
        left: 1460,
        width: 340,
        height: 340,
        overflow: 'hidden',
        opacity: stampOp,
        transform: `scale(${stampScale})`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <svg width={340} height={340} style={{ position: 'absolute', top: 0, left: 0 }}>
          <circle cx={170} cy={170} r={155} fill="none" stroke="PRIMARY_COLOR" strokeWidth={6} opacity={0.15} />
          <circle cx={170} cy={170} r={130} fill="none" stroke="PRIMARY_COLOR" strokeWidth={3} opacity={0.1} />
        </svg>
        <div style={{
          position: 'absolute',
          top: 80,
          left: 20,
          width: 300,
          height: 180,
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <span style={{
            fontSize: 38,
            fontWeight: 900,
            color: 'PRIMARY_COLOR',
            fontFamily: 'sans-serif',
            textAlign: 'center',
            textTransform: 'uppercase',
            letterSpacing: 2,
            opacity: 0.2,
            lineHeight: 1.2,
          }}>
            {tag1}
          </span>
        </div>
      </div>

    </div>
  )
}

export default AnimationComponent