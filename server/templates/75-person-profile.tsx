import React, { useMemo } from 'react'
import { useCurrentFrame, interpolate } from 'remotion'

export const AnimationComponent = () => {
  const frame = useCurrentFrame()

  const label1 = "LABEL_1"
  const label2 = "LABEL_2"
  const label3 = "LABEL_3"
  const rawTags = ["TAG_1", "TAG_2", "TAG_3"]
  const contextText = "CONTEXT_TEXT"
  const titleText = "TITLE_TEXT"

  const tags = useMemo(() => {
    return rawTags.filter(tag => tag !== '' && tag !== 'Placeholder')
  }, [rawTags])

  const bgOp = interpolate(frame, [0, 18], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const panelOp = interpolate(frame, [8, 25], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const panelTx = interpolate(frame, [8, 25], [-60, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const avatarOp = interpolate(frame, [18, 35], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const avatarScale = interpolate(frame, [18, 35], [0.7, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const nameOp = interpolate(frame, [28, 44], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const nameTy = interpolate(frame, [28, 44], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const roleOp = interpolate(frame, [36, 50], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const roleTy = interpolate(frame, [36, 50], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  
  const tagOpacities = tags.map((_, i) => interpolate(frame, [44 + i * 6, 56 + i * 6], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }))
  
  const divW = interpolate(frame, [32, 55], [0, 560], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const contextOp = interpolate(frame, [62, 78], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const contextTy = interpolate(frame, [62, 78], [16, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const barW = interpolate(frame, [15, 50], [0, 1920], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  const tagColors = ['PRIMARY_COLOR', 'ACCENT_COLOR', 'SECONDARY_COLOR']
  const tagTextColors = ['TEXT_ON_PRIMARY', 'TEXT_ON_ACCENT', 'TEXT_ON_SECONDARY']

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

      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: 1920,
        height: 1080,
        overflow: 'hidden',
        backgroundColor: 'PANEL_LEFT_BG',
        opacity: bgOp * 0.08,
      }} />

      <div style={{
        position: 'absolute',
        top: 1074,
        left: 0,
        width: barW,
        height: 6,
        overflow: 'hidden',
        backgroundColor: 'PRIMARY_COLOR',
      }} />

      <div style={{
        position: 'absolute',
        top: 72,
        left: 0,
        width: 1920,
        height: 50,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: bgOp,
      }}>
        <span style={{
          fontSize: 20,
          fontWeight: 600,
          color: 'PRIMARY_COLOR',
          fontFamily: 'sans-serif',
          letterSpacing: 6,
          textTransform: 'uppercase',
        }}>
          {titleText}
        </span>
      </div>

      <div style={{
        position: 'absolute',
        top: 180,
        left: 200,
        width: 460,
        height: 700,
        overflow: 'hidden',
        opacity: panelOp,
        transform: `translateX(${panelTx}px)`,
      }}>

        <div style={{
          position: 'absolute',
          top: 40,
          left: 80,
          width: 300,
          height: 300,
          overflow: 'hidden',
          borderRadius: 150,
          backgroundColor: 'PANEL_LEFT_BG',
          border: '4px solid',
          borderColor: 'PRIMARY_COLOR',
          opacity: avatarOp,
          transform: `scale(${avatarScale})`,
          boxSizing: 'border-box',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <span style={{
            fontSize: 100,
            fontWeight: 900,
            color: 'PRIMARY_COLOR',
            fontFamily: 'sans-serif',
            lineHeight: 1,
          }}>
            ?
          </span>
        </div>

        {tags.map((tag, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: 380 + i * 68,
              left: 0,
              width: 460,
              height: 52,
              overflow: 'hidden',
              opacity: tagOpacities[i],
              backgroundColor: tagColors[i % tagColors.length],
              borderRadius: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxSizing: 'border-box',
            }}
          >
            <span style={{
              fontSize: 20,
              fontWeight: 700,
              color: tagTextColors[i % tagTextColors.length],
              fontFamily: 'sans-serif',
              letterSpacing: 2,
              textTransform: 'uppercase',
            }}>
              {tag}
            </span>
          </div>
        ))}

      </div>

      <div style={{
        position: 'absolute',
        top: 180,
        left: 740,
        width: 980,
        height: 700,
        overflow: 'hidden',
      }}>

        <div style={{
          position: 'absolute',
          top: 40,
          left: 0,
          width: 980,
          height: 120,
          overflow: 'hidden',
          opacity: nameOp,
          transform: `translateY(${nameTy}px)`,
        }}>
          <span style={{
            fontSize: 88,
            fontWeight: 900,
            color: 'PRIMARY_COLOR',
            fontFamily: 'sans-serif',
            lineHeight: 1,
            letterSpacing: -2,
          }}>
            {label1}
          </span>
        </div>

        <div style={{
          position: 'absolute',
          top: 172,
          left: 0,
          width: divW,
          height: 3,
          overflow: 'hidden',
          backgroundColor: 'ACCENT_COLOR',
        }} />

        <div style={{
          position: 'absolute',
          top: 192,
          left: 0,
          width: 980,
          height: 60,
          overflow: 'hidden',
          opacity: roleOp,
          transform: `translateY(${roleTy}px)`,
        }}>
          <span style={{
            fontSize: 34,
            fontWeight: 600,
            color: 'ACCENT_COLOR',
            fontFamily: 'sans-serif',
            letterSpacing: 2,
            textTransform: 'uppercase',
          }}>
            {label2}
          </span>
        </div>

        <div style={{
          position: 'absolute',
          top: 258,
          left: 0,
          width: 980,
          height: 50,
          overflow: 'hidden',
          opacity: roleOp,
        }}>
          <span style={{
            fontSize: 26,
            fontWeight: 400,
            color: 'SUPPORT_COLOR',
            fontFamily: 'sans-serif',
            letterSpacing: 1,
          }}>
            {label3}
          </span>
        </div>

        <div style={{
          position: 'absolute',
          top: 340,
          left: 0,
          width: 960,
          height: 200,
          overflow: 'hidden',
          opacity: contextOp,
          transform: `translateY(${contextTy}px)`,
        }}>
          <span style={{
            fontSize: 26,
            fontWeight: 400,
            color: 'TEXT_ON_SECONDARY',
            fontFamily: 'sans-serif',
            lineHeight: 1.6,
          }}>
            {contextText}
          </span>
        </div>

      </div>

      <div style={{
        position: 'absolute',
        top: 180,
        left: 160,
        width: 5,
        height: 700,
        overflow: 'hidden',
        backgroundColor: 'PRIMARY_COLOR',
        opacity: panelOp,
      }} />

    </div>
  )
}

export default AnimationComponent