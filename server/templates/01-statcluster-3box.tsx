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
        backgroundColor: 'PRIMARY_COLOR',
        borderRadius: 4,
        overflow: 'hidden',
        boxSizing: 'border-box',
        opacity: op1,
      }}>
        <div style={{
          position: 'absolute',
          top: 48,
          left: 40,
          width: 400,
          height: 120,
          color: 'TEXT_ON_PRIMARY',
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
          color: 'TEXT_ON_PRIMARY',
          fontSize: 20,
          fontWeight: 700,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          opacity: 0.8,
        }}>
          {label1}
        </div>
        <div style={{
          position: 'absolute',
          top: 244,
          left: 40,
          width: 400,
          height: 36,
          color: 'TEXT_ON_PRIMARY',
          fontSize: 18,
          fontWeight: 500,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          opacity: 0.6,
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
        backgroundColor: 'SECONDARY_COLOR',
        borderRadius: 4,
        overflow: 'hidden',
        boxSizing: 'border-box',
        opacity: op2,
      }}>
        <div style={{
          position: 'absolute',
          top: 48,
          left: 40,
          width: 400,
          height: 120,
          color: 'TEXT_ON_SECONDARY',
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
          color: 'TEXT_ON_SECONDARY',
          fontSize: 20,
          fontWeight: 700,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          opacity: 0.8,
        }}>
          {label2}
        </div>
        <div style={{
          position: 'absolute',
          top: 244,
          left: 40,
          width: 400,
          height: 36,
          color: 'TEXT_ON_SECONDARY',
          fontSize: 18,
          fontWeight: 500,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          opacity: 0.6,
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
        backgroundColor: 'ACCENT_COLOR',
        borderRadius: 4,
        overflow: 'hidden',
        boxSizing: 'border-box',
        opacity: op3,
      }}>
        <div style={{
          position: 'absolute',
          top: 48,
          left: 40,
          width: 400,
          height: 120,
          color: 'TEXT_ON_ACCENT',
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
          color: 'TEXT_ON_ACCENT',
          fontSize: 20,
          fontWeight: 700,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          opacity: 0.8,
        }}>
          {label3}
        </div>
        <div style={{
          position: 'absolute',
          top: 244,
          left: 40,
          width: 400,
          height: 36,
          color: 'TEXT_ON_ACCENT',
          fontSize: 18,
          fontWeight: 500,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          opacity: 0.6,
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
        backgroundColor: 'SECONDARY_COLOR',
        color: 'TEXT_ON_SECONDARY',
        borderRadius: 4,
        padding: '20px 40px',
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