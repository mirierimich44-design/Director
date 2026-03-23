import React, { useMemo } from 'react'
import { useCurrentFrame, interpolate } from 'remotion'

export const AnimationComponent = () => {
  const frame = useCurrentFrame()

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
  const rawTagColors = ['PRIMARY_COLOR', 'SECONDARY_COLOR', 'ACCENT_COLOR']
  const rawTagTextColors = ['TEXT_ON_PRIMARY', 'TEXT_ON_SECONDARY', 'TEXT_ON_ACCENT']

  const rawStats = [
    { value: stat1, label: "Employees" },
    { value: stat2, label: "Revenue" },
    { value: stat3, label: "Founded" },
  ]

  const filteredTags = useMemo(() => {
    return rawTags
      .map((tag, i) => ({ tag, color: rawTagColors[i], textColor: rawTagTextColors[i] }))
      .filter(item => item.tag !== '' && item.tag !== 'Placeholder')
  }, [])

  const filteredStats = useMemo(() => {
    return rawStats.filter(item => item.value !== '' && item.value !== 'Placeholder' && item.label !== '' && item.label !== 'Placeholder')
  }, [])

  const bgOp = interpolate(frame, [0, 18], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const barW = interpolate(frame, [10, 40], [0, 1920], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const panelOp = interpolate(frame, [10, 26], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const panelTy = interpolate(frame, [10, 26], [30, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const nameOp = interpolate(frame, [22, 38], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const nameTy = interpolate(frame, [22, 38], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const divW = interpolate(frame, [32, 55], [0, 1400], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const statsOp = interpolate(frame, [55, 70], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const statsTy = interpolate(frame, [55, 70], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const contextOp = interpolate(frame, [68, 82], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const contextTy = interpolate(frame, [68, 82], [16, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

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
        height: 5,
        overflow: 'hidden',
        backgroundColor: 'PRIMARY_COLOR',
        opacity: bgOp,
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
        top: 60,
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
          color: 'SUPPORT_COLOR',
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
        left: 160,
        width: 200,
        height: 200,
        overflow: 'hidden',
        backgroundColor: 'CHART_BG',
        borderRadius: 8,
        border: '2px solid',
        borderColor: 'CHART_BORDER',
        opacity: panelOp,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxSizing: 'border-box',
      }}>
        <span style={{
          fontSize: 64,
          fontWeight: 900,
          color: 'PRIMARY_COLOR',
          fontFamily: 'sans-serif',
          lineHeight: 1,
        }}>
          {label1.charAt(0)}
        </span>
      </div>

      <div style={{
        position: 'absolute',
        top: 180,
        left: 400,
        width: 1360,
        height: 200,
        overflow: 'hidden',
        opacity: nameOp,
        transform: `translateY(${nameTy}px)`,
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: 1360,
          height: 110,
          overflow: 'hidden',
        }}>
          <span style={{
            fontSize: 90,
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
          top: 118,
          left: 0,
          width: 1360,
          height: 44,
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          gap: 24,
        }}>
          <span style={{
            fontSize: 28,
            fontWeight: 500,
            color: 'ACCENT_COLOR',
            fontFamily: 'sans-serif',
            letterSpacing: 2,
            textTransform: 'uppercase',
          }}>
            {label2}
          </span>
          <span style={{
            fontSize: 22,
            fontWeight: 400,
            color: 'SUPPORT_COLOR',
            fontFamily: 'sans-serif',
            marginLeft: 20,
          }}>
            {label3}
          </span>
        </div>
      </div>

      <div style={{
        position: 'absolute',
        top: 400,
        left: 160,
        width: divW,
        height: 2,
        overflow: 'hidden',
        backgroundColor: 'ACCENT_COLOR',
      }} />

      {filteredTags.map((item, i) => {
        const tagOp = interpolate(frame, [40 + i * 6, 54 + i * 6], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
        return (
          <div key={i} style={{
            position: 'absolute',
            top: 424,
            left: 160 + i * 200,
            width: 180,
            height: 48,
            overflow: 'hidden',
            backgroundColor: item.color,
            borderRadius: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: tagOp,
          }}>
            <span style={{
              fontSize: 17,
              fontWeight: 700,
              color: item.textColor,
              fontFamily: 'sans-serif',
              letterSpacing: 1,
              textTransform: 'uppercase',
            }}>
              {item.tag}
            </span>
          </div>
        )
      })}

      <div style={{
        position: 'absolute',
        top: 510,
        left: 160,
        width: 1600,
        height: 160,
        overflow: 'hidden',
        opacity: statsOp,
        transform: `translateY(${statsTy}px)`,
      }}>
        {filteredStats.map((stat, i) => (
          <div key={i} style={{
            position: 'absolute',
            top: 0,
            left: i * 420,
            width: 380,
            height: 160,
            overflow: 'hidden',
            backgroundColor: 'CHART_BG',
            borderRadius: 6,
            border: '1px solid',
            borderColor: 'CHART_BORDER',
            boxSizing: 'border-box',
          }}>
            <div style={{
              position: 'absolute',
              top: 20,
              left: 24,
              width: 332,
              height: 80,
              overflow: 'hidden',
            }}>
              <span style={{
                fontSize: 64,
                fontWeight: 900,
                color: i === 0 ? 'PRIMARY_COLOR' : i === 1 ? 'ACCENT_COLOR' : 'SECONDARY_COLOR',
                fontFamily: 'sans-serif',
                lineHeight: 1,
              }}>
                {stat.value}
              </span>
            </div>
            <div style={{
              position: 'absolute',
              top: 110,
              left: 24,
              width: 332,
              height: 32,
              overflow: 'hidden',
            }}>
              <span style={{
                fontSize: 18,
                fontWeight: 500,
                color: 'SUPPORT_COLOR',
                fontFamily: 'sans-serif',
                textTransform: 'uppercase',
                letterSpacing: 1,
              }}>
                {stat.label}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div style={{
        position: 'absolute',
        top: 706,
        left: 160,
        width: 1600,
        height: 200,
        overflow: 'hidden',
        opacity: contextOp,
        transform: `translateY(${contextTy}px)`,
      }}>
        <span style={{
          fontSize: 28,
          fontWeight: 400,
          color: 'TEXT_ON_SECONDARY',
          fontFamily: 'sans-serif',
          lineHeight: 1.65,
        }}>
          {contextText}
        </span>
      </div>

    </div>
  )
}

export default AnimationComponent