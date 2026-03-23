import React from 'react'
import { useCurrentFrame, interpolate } from 'remotion'

export const AnimationComponent = () => {
  const frame = useCurrentFrame()

  const bgOp = interpolate(frame, [0, 18], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const barW = interpolate(frame, [10, 40], [0, 1920], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const panelOp = interpolate(frame, [10, 26], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const panelTx = interpolate(frame, [10, 26], [-50, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const headerOp = interpolate(frame, [20, 35], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const headerTy = interpolate(frame, [20, 35], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const divW = interpolate(frame, [30, 55], [0, 560], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const statsOp = interpolate(frame, [55, 70], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const statsTy = interpolate(frame, [55, 70], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const contextOp = interpolate(frame, [65, 80], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const contextTy = interpolate(frame, [65, 80], [16, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const glowOp = interpolate(frame, [15, 45], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  const titleText = "TITLE_TEXT"
  const label1 = "LABEL_1"
  const label2 = "LABEL_2"
  const label3 = "LABEL_3"
  const tag1 = "TAG_1"
  const tag2 = "TAG_2"
  const tag3 = "TAG_3"
  const stat1 = "STAT_VALUE_1"
  const stat2 = "STAT_VALUE_2"
  const contextText = "CONTEXT_TEXT"
  const alertText = "ALERT_TEXT"

  const rawTags = [
    { label: tag1, color: 'SECONDARY_COLOR', textColor: 'TEXT_ON_SECONDARY', op: interpolate(frame, [38, 52], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) },
    { label: tag2, color: 'PRIMARY_COLOR', textColor: 'TEXT_ON_PRIMARY', op: interpolate(frame, [44, 58], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) },
    { label: tag3, color: 'ACCENT_COLOR', textColor: 'TEXT_ON_ACCENT', op: interpolate(frame, [50, 64], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) }
  ]

  const filteredTags = rawTags.filter(t => t.label !== '' && t.label !== 'Placeholder')

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
        top: 200,
        left: 1300,
        width: 600,
        height: 600,
        overflow: 'hidden',
        borderRadius: 300,
        backgroundColor: 'PRIMARY_COLOR',
        opacity: glowOp * 0.04,
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
        top: 150,
        left: 160,
        width: 1100,
        height: 780,
        overflow: 'hidden',
        backgroundColor: 'CHART_BG',
        borderRadius: 8,
        boxSizing: 'border-box',
        border: '1px solid',
        borderColor: 'CHART_BORDER',
        opacity: panelOp,
        transform: `translateX(${panelTx}px)`,
      }}>

        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: 1100,
          height: 80,
          overflow: 'hidden',
          backgroundColor: 'PRIMARY_COLOR',
        }} />

        <div style={{
          position: 'absolute',
          top: 16,
          left: 32,
          width: 900,
          height: 50,
          overflow: 'hidden',
          opacity: headerOp,
          transform: `translateY(${headerTy}px)`,
        }}>
          <span style={{
            fontSize: 42,
            fontWeight: 900,
            color: 'TEXT_ON_PRIMARY',
            fontFamily: 'sans-serif',
            letterSpacing: 2,
            textTransform: 'uppercase',
            lineHeight: 1,
          }}>
            {label1}
          </span>
        </div>

        <div style={{
          position: 'absolute',
          top: 20,
          left: 940,
          width: 130,
          height: 40,
          overflow: 'hidden',
          backgroundColor: 'SECONDARY_COLOR',
          borderRadius: 4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: headerOp,
        }}>
          <span style={{
            fontSize: 14,
            fontWeight: 700,
            color: 'TEXT_ON_SECONDARY',
            fontFamily: 'sans-serif',
            letterSpacing: 1,
            textTransform: 'uppercase',
          }}>
            {alertText}
          </span>
        </div>

        <div style={{
          position: 'absolute',
          top: 110,
          left: 32,
          width: divW,
          height: 2,
          overflow: 'hidden',
          backgroundColor: 'ACCENT_COLOR',
        }} />

        <div style={{
          position: 'absolute',
          top: 126,
          left: 32,
          width: 900,
          height: 50,
          overflow: 'hidden',
          opacity: headerOp,
        }}>
          <span style={{
            fontSize: 28,
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
          top: 178,
          left: 32,
          width: 900,
          height: 40,
          overflow: 'hidden',
          opacity: headerOp,
        }}>
          <span style={{
            fontSize: 22,
            fontWeight: 400,
            color: 'SUPPORT_COLOR',
            fontFamily: 'sans-serif',
            letterSpacing: 1,
          }}>
            {label3}
          </span>
        </div>

        {filteredTags.map((tag, i) => (
          <div key={i} style={{
            position: 'absolute',
            top: 240,
            left: 32 + i * 176,
            width: 160,
            height: 44,
            overflow: 'hidden',
            backgroundColor: tag.color,
            borderRadius: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: tag.op,
          }}>
            <span style={{
              fontSize: 16,
              fontWeight: 700,
              color: tag.textColor,
              fontFamily: 'sans-serif',
              letterSpacing: 1,
              textTransform: 'uppercase',
            }}>
              {tag.label}
            </span>
          </div>
        ))}

        <div style={{
          position: 'absolute',
          top: 320,
          left: 32,
          width: 1020,
          height: 140,
          overflow: 'hidden',
          opacity: statsOp,
          transform: `translateY(${statsTy}px)`,
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: 460,
            height: 140,
            overflow: 'hidden',
            backgroundColor: 'PANEL_LEFT_BG',
            borderRadius: 6,
            boxSizing: 'border-box',
            padding: '20px 24px',
          }}>
            <div style={{
              position: 'absolute',
              top: 20,
              left: 24,
              width: 412,
              height: 70,
              overflow: 'hidden',
            }}>
              <span style={{
                fontSize: 60,
                fontWeight: 900,
                color: 'PRIMARY_COLOR',
                fontFamily: 'sans-serif',
                lineHeight: 1,
              }}>
                {stat1}
              </span>
            </div>
            <div style={{
              position: 'absolute',
              top: 96,
              left: 24,
              width: 412,
              height: 30,
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
                {tag1}
              </span>
            </div>
          </div>

          <div style={{
            position: 'absolute',
            top: 0,
            left: 480,
            width: 460,
            height: 140,
            overflow: 'hidden',
            backgroundColor: 'PANEL_LEFT_BG',
            borderRadius: 6,
            boxSizing: 'border-box',
          }}>
            <div style={{
              position: 'absolute',
              top: 20,
              left: 24,
              width: 412,
              height: 70,
              overflow: 'hidden',
            }}>
              <span style={{
                fontSize: 60,
                fontWeight: 900,
                color: 'ACCENT_COLOR',
                fontFamily: 'sans-serif',
                lineHeight: 1,
              }}>
                {stat2}
              </span>
            </div>
            <div style={{
              position: 'absolute',
              top: 96,
              left: 24,
              width: 412,
              height: 30,
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
                {tag2}
              </span>
            </div>
          </div>
        </div>

        <div style={{
          position: 'absolute',
          top: 490,
          left: 32,
          width: 1020,
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
            lineHeight: 1.65,
          }}>
            {contextText}
          </span>
        </div>

      </div>

      <div style={{
        position: 'absolute',
        top: 150,
        left: 1340,
        width: 420,
        height: 780,
        overflow: 'hidden',
        backgroundColor: 'CHART_BG',
        borderRadius: 8,
        boxSizing: 'border-box',
        border: '1px solid',
        borderColor: 'CHART_BORDER',
        opacity: panelOp,
      }}>

        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: 420,
          height: 80,
          overflow: 'hidden',
          backgroundColor: 'PANEL_LEFT_BG',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <span style={{
            fontSize: 16,
            fontWeight: 600,
            color: 'SUPPORT_COLOR',
            fontFamily: 'sans-serif',
            letterSpacing: 3,
            textTransform: 'uppercase',
          }}>
            THREAT LEVEL
          </span>
        </div>

        {['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((level, i) => {
          const isActive = i === 0
          const barColors = ['SECONDARY_COLOR', 'PRIMARY_COLOR', 'ACCENT_COLOR', 'SUPPORT_COLOR']
          return (
            <div key={i} style={{
              position: 'absolute',
              top: 110 + i * 80,
              left: 24,
              width: 372,
              height: 60,
              overflow: 'hidden',
              backgroundColor: isActive ? barColors[i] : 'PANEL_LEFT_BG',
              borderRadius: 4,
              opacity: statsOp,
              display: 'flex',
              alignItems: 'center',
              boxSizing: 'border-box',
              padding: '0 20px',
            }}>
              <span style={{
                fontSize: 18,
                fontWeight: isActive ? 700 : 500,
                color: isActive ? 'TEXT_ON_SECONDARY' : 'SUPPORT_COLOR',
                fontFamily: 'sans-serif',
                letterSpacing: 2,
                textTransform: 'uppercase',
              }}>
                {level}
              </span>
            </div>
          )
        })}

        <div style={{
          position: 'absolute',
          top: 460,
          left: 24,
          width: 372,
          height: 50,
          overflow: 'hidden',
          opacity: interpolate(frame, [50, 64], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <span style={{
            fontSize: 22,
            fontWeight: 700,
            color: 'ACCENT_COLOR',
            fontFamily: 'sans-serif',
            letterSpacing: 2,
            textTransform: 'uppercase',
          }}>
            {tag3}
          </span>
        </div>

      </div>

    </div>
  )
}

export default AnimationComponent