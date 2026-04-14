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

// Auto-scale font size based on text length so nothing clips
function statFontSize(text: string): number {
  if (text.length <= 4) return 88
  if (text.length <= 8) return 72
  if (text.length <= 12) return 56
  return 44
}

export const AnimationComponent = () => {
  const frame = useCurrentFrame()

  const op1 = interpolate(frame, [0, 25], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const op2 = interpolate(frame, [30, 55], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const op3 = interpolate(frame, [60, 85], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const opConn1 = interpolate(frame, [50, 65], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const opConn2 = interpolate(frame, [80, 95], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const op4 = interpolate(frame, [100, 130], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const ty4 = interpolate(frame, [100, 130], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  // Box layout: 3 boxes of 500px with 90px connectors, centered in 1920
  // Total: 3×500 + 2×90 = 1680, margin = (1920-1680)/2 = 120
  const BOX_W = 500
  const CONN_W = 90
  const LEFT = 120
  const box1x = LEFT
  const conn1x = LEFT + BOX_W
  const box2x = conn1x + CONN_W
  const conn2x = box2x + BOX_W
  const box3x = conn2x + CONN_W
  const BOX_H = 310
  const BOX_TOP = 200

  const boxStyle = (borderColor: string, opacity: number): React.CSSProperties => ({
    position: 'absolute',
    top: BOX_TOP,
    width: BOX_W,
    height: BOX_H,
    backgroundColor: 'PANEL_RIGHT_BG',
    border: '1px solid CHART_BORDER',
    borderTop: `4px solid ${borderColor}`,
    borderRadius: 14,
    overflow: 'hidden',
    boxSizing: 'border-box',
    opacity,
  })

  return (
    <div style={{
      position: 'absolute',
      top: 0, left: 0,
      width: 1920, height: 1080,
      overflow: 'hidden',
      backgroundColor: 'BACKGROUND_COLOR',
    }}>

      {/* BOX 1 */}
      <div style={{ ...boxStyle('PRIMARY_COLOR', op1), left: box1x }}>
        <div style={{
          position: 'absolute',
          top: 36, left: 36,
          width: BOX_W - 72,
          minHeight: 140,
          color: 'PRIMARY_COLOR',
          fontSize: statFontSize(stat1),
          fontWeight: 900,
          whiteSpace: 'normal',
          wordBreak: 'break-word',
          lineHeight: 1.05,
          fontFamily: 'monospace',
          letterSpacing: '-0.02em',
        }}>
          {stat1}
        </div>
        <div style={{
          position: 'absolute',
          top: 204, left: 36,
          width: BOX_W - 72,
          color: 'PRIMARY_COLOR',
          fontSize: 18,
          fontWeight: 700,
          whiteSpace: 'normal',
          wordBreak: 'break-word',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          opacity: 0.9,
        }}>
          {label1}
        </div>
        <div style={{
          position: 'absolute',
          top: 254, left: 36,
          width: BOX_W - 72,
          color: 'SUPPORT_COLOR',
          fontSize: 15,
          fontWeight: 500,
          whiteSpace: 'normal',
          wordBreak: 'break-word',
          opacity: 0.75,
        }}>
          {sub1}
        </div>
      </div>

      {/* CONNECTOR 1 */}
      <div style={{
        position: 'absolute',
        top: BOX_TOP + BOX_H / 2 - 2,
        left: conn1x,
        width: CONN_W,
        height: 3,
        backgroundColor: 'SUPPORT_COLOR',
        opacity: opConn1,
      }} />

      {/* BOX 2 */}
      <div style={{ ...boxStyle('PRIMARY_COLOR', op2), left: box2x }}>
        <div style={{
          position: 'absolute',
          top: 36, left: 36,
          width: BOX_W - 72,
          minHeight: 140,
          color: 'PRIMARY_COLOR',
          fontSize: statFontSize(stat2),
          fontWeight: 900,
          whiteSpace: 'normal',
          wordBreak: 'break-word',
          lineHeight: 1.05,
          fontFamily: 'monospace',
          letterSpacing: '-0.02em',
        }}>
          {stat2}
        </div>
        <div style={{
          position: 'absolute',
          top: 204, left: 36,
          width: BOX_W - 72,
          color: 'PRIMARY_COLOR',
          fontSize: 18,
          fontWeight: 700,
          whiteSpace: 'normal',
          wordBreak: 'break-word',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          opacity: 0.9,
        }}>
          {label2}
        </div>
        <div style={{
          position: 'absolute',
          top: 254, left: 36,
          width: BOX_W - 72,
          color: 'SUPPORT_COLOR',
          fontSize: 15,
          fontWeight: 500,
          whiteSpace: 'normal',
          wordBreak: 'break-word',
          opacity: 0.75,
        }}>
          {sub2}
        </div>
      </div>

      {/* CONNECTOR 2 */}
      <div style={{
        position: 'absolute',
        top: BOX_TOP + BOX_H / 2 - 2,
        left: conn2x,
        width: CONN_W,
        height: 3,
        backgroundColor: 'SUPPORT_COLOR',
        opacity: opConn2,
      }} />

      {/* BOX 3 */}
      <div style={{ ...boxStyle('PRIMARY_COLOR', op3), left: box3x }}>
        <div style={{
          position: 'absolute',
          top: 36, left: 36,
          width: BOX_W - 72,
          minHeight: 140,
          color: 'PRIMARY_COLOR',
          fontSize: statFontSize(stat3),
          fontWeight: 900,
          whiteSpace: 'normal',
          wordBreak: 'break-word',
          lineHeight: 1.05,
          fontFamily: 'monospace',
          letterSpacing: '-0.02em',
        }}>
          {stat3}
        </div>
        <div style={{
          position: 'absolute',
          top: 204, left: 36,
          width: BOX_W - 72,
          color: 'PRIMARY_COLOR',
          fontSize: 18,
          fontWeight: 700,
          whiteSpace: 'normal',
          wordBreak: 'break-word',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          opacity: 0.9,
        }}>
          {label3}
        </div>
        <div style={{
          position: 'absolute',
          top: 254, left: 36,
          width: BOX_W - 72,
          color: 'SUPPORT_COLOR',
          fontSize: 15,
          fontWeight: 500,
          whiteSpace: 'normal',
          wordBreak: 'break-word',
          opacity: 0.75,
        }}>
          {sub3}
        </div>
      </div>

      {/* VERDICT BOX */}
      <div style={{
        position: 'absolute',
        top: 620,
        left: 120,
        width: 1680,
        backgroundColor: 'PANEL_RIGHT_BG',
        border: '1px solid CHART_BORDER',
        borderLeft: '4px solid PRIMARY_COLOR',
        color: 'PRIMARY_COLOR',
        borderRadius: 14,
        padding: '22px 44px',
        boxSizing: 'border-box',
        fontSize: 26,
        fontWeight: 600,
        lineHeight: 1.5,
        whiteSpace: 'normal',
        wordBreak: 'break-word',
        opacity: op4,
        transform: `translateY(${ty4}px)`,
      }}>
        {verdict}
      </div>

    </div>
  )
}

export default AnimationComponent
