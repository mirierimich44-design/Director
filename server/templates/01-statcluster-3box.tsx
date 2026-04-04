import React from 'react'
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion'

const stat1 = "STAT_VALUE_1"
const stat2 = "STAT_VALUE_2"
const stat3 = "STAT_VALUE_3"
const label1 = "LABEL_1"
const label2 = "LABEL_2"
const label3 = "LABEL_3"
const sub1 = "SUB_1"
const sub2 = "SUB_2"
const sub3 = "SUB_3"
const verdict = "VERDICT_TEXT"

export const AnimationComponent = () => {
  const frame = useCurrentFrame()

  const op1 = interpolate(frame, [0, 30], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  const op2 = interpolate(frame, [35, 65], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  const op3 = interpolate(frame, [70, 100], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  const opConn1 = interpolate(frame, [63, 78], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  const opConn2 = interpolate(frame, [93, 108], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  const op4 = interpolate(frame, [115, 140], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  const ty4 = interpolate(frame, [115, 140], [20, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

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

      {/* BOX 1 */}
      <div style={{
        position: 'absolute',
        top: 180,
        left: 120,
        width: 480,
        height: 300,
        backgroundColor: 'rgba(20, 30, 55, 0.92)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.15)',
        borderTop: '3px solid PRIMARY_COLOR',
        borderRadius: 16,
        overflow: 'hidden',
        boxSizing: 'border-box',
        boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
        opacity: op1,
      }}>
        <div style={{
          position: 'absolute',
          top: 48,
          left: 40,
          width: 400,
          height: 120,
          color: 'PRIMARY_COLOR',
          fontSize: 80,
          fontWeight: 900,
          whiteSpace: 'nowrap',
          fontFamily: 'monospace',
          overflow: 'hidden',
        }}>
          {stat1}
        </div>
        <div style={{
          position: 'absolute',
          top: 196,
          left: 40,
          width: 400,
          height: 40,
          color: '#ffffff',
          fontSize: 20,
          fontWeight: 700,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          opacity: 0.9,
        }}>
          {label1}
        </div>
        <div style={{
          position: 'absolute',
          top: 244,
          left: 40,
          width: 400,
          height: 36,
          color: 'SUPPORT_COLOR',
          fontSize: 18,
          fontWeight: 500,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          opacity: 0.8,
        }}>
          {sub1}
        </div>
      </div>

      {/* CONNECTOR 1 */}
      <div style={{
        position: 'absolute',
        top: 326,
        left: 600,
        width: 120,
        height: 4,
        backgroundColor: 'SUPPORT_COLOR',
        opacity: opConn1,
      }} />

      {/* BOX 2 */}
      <div style={{
        position: 'absolute',
        top: 180,
        left: 720,
        width: 480,
        height: 300,
        backgroundColor: 'rgba(20, 30, 55, 0.92)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.15)',
        borderTop: '3px solid SECONDARY_COLOR',
        borderRadius: 16,
        overflow: 'hidden',
        boxSizing: 'border-box',
        boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
        opacity: op2,
      }}>
        <div style={{
          position: 'absolute',
          top: 48,
          left: 40,
          width: 400,
          height: 120,
          color: 'SECONDARY_COLOR',
          fontSize: 80,
          fontWeight: 900,
          whiteSpace: 'nowrap',
          fontFamily: 'monospace',
          overflow: 'hidden',
        }}>
          {stat2}
        </div>
        <div style={{
          position: 'absolute',
          top: 196,
          left: 40,
          width: 400,
          height: 40,
          color: '#ffffff',
          fontSize: 20,
          fontWeight: 700,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          opacity: 0.9,
        }}>
          {label2}
        </div>
        <div style={{
          position: 'absolute',
          top: 244,
          left: 40,
          width: 400,
          height: 36,
          color: 'SUPPORT_COLOR',
          fontSize: 18,
          fontWeight: 500,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          opacity: 0.8,
        }}>
          {sub2}
        </div>
      </div>

      {/* CONNECTOR 2 */}
      <div style={{
        position: 'absolute',
        top: 326,
        left: 1200,
        width: 120,
        height: 4,
        backgroundColor: 'SUPPORT_COLOR',
        opacity: opConn2,
      }} />

      {/* BOX 3 */}
      <div style={{
        position: 'absolute',
        top: 180,
        left: 1320,
        width: 480,
        height: 300,
        backgroundColor: 'rgba(20, 30, 55, 0.92)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.15)',
        borderTop: '3px solid ACCENT_COLOR',
        borderRadius: 16,
        overflow: 'hidden',
        boxSizing: 'border-box',
        boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
        opacity: op3,
      }}>
        <div style={{
          position: 'absolute',
          top: 48,
          left: 40,
          width: 400,
          height: 120,
          color: 'ACCENT_COLOR',
          fontSize: 80,
          fontWeight: 900,
          whiteSpace: 'nowrap',
          fontFamily: 'monospace',
          overflow: 'hidden',
        }}>
          {stat3}
        </div>
        <div style={{
          position: 'absolute',
          top: 196,
          left: 40,
          width: 400,
          height: 40,
          color: '#ffffff',
          fontSize: 20,
          fontWeight: 700,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          opacity: 0.9,
        }}>
          {label3}
        </div>
        <div style={{
          position: 'absolute',
          top: 244,
          left: 40,
          width: 400,
          height: 36,
          color: 'SUPPORT_COLOR',
          fontSize: 18,
          fontWeight: 500,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          opacity: 0.8,
        }}>
          {sub3}
        </div>
      </div>

      {/* VERDICT BOX */}
      <div style={{
        position: 'absolute',
        top: 600,
        left: 120,
        width: 1680,
        height: 72,
        backgroundColor: 'rgba(20, 30, 55, 0.92)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.15)',
        color: '#ffffff',
        borderRadius: 16,
        padding: '20px 40px',
        boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
        boxSizing: 'border-box',
        fontSize: 28,
        fontWeight: 900,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        opacity: op4,
        transform: `translateY(${ty4}px)`,
      }}>
        {verdict}
      </div>

    </div>
  )
}

export default AnimationComponent