import React, { useMemo } from 'react'
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion'

export const AnimationComponent = () => {
  const frame = useCurrentFrame()

  const titleOp = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  const titleText = "TITLE_TEXT"
  const leftHead = "LEFT_HEAD"
  const rightHead = "RIGHT_HEAD"

  const rawLeftNodes = [
    { label: 'NODE_LABEL_1', y: 250, delay: 10 },
    { label: 'NODE_LABEL_2', y: 420, delay: 16 },
    { label: 'NODE_LABEL_3', y: 590, delay: 22 },
    { label: 'NODE_LABEL_4', y: 760, delay: 28 },
  ]

  const rawRightNodes = [
    { label: 'NODE_LABEL_5', y: 310, delay: 14 },
    { label: 'NODE_LABEL_6', y: 520, delay: 20 },
    { label: 'NODE_LABEL_7', y: 710, delay: 26 },
  ]

  const rawEdges = [
    [0, 0, 30], [0, 1, 32],
    [1, 0, 34], [1, 2, 36],
    [2, 1, 38], [2, 2, 40],
    [3, 1, 42], [3, 2, 44],
  ]

  const isValid = (item: { label: string }) => item.label !== '' && item.label !== 'Placeholder'

  const leftNodes = useMemo(() => rawLeftNodes.filter(isValid), [])
  const rightNodes = useMemo(() => rawRightNodes.filter(isValid), [])
  
  const edges = useMemo(() => rawEdges.filter(([li, ri]) => 
    leftNodes.includes(rawLeftNodes[li]) && rightNodes.includes(rawRightNodes[ri])
  ), [leftNodes, rightNodes])

  const lx = 420
  const rx = 1500

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

      {/* Title */}
      <div style={{
        position: 'absolute',
        top: 60,
        left: 100,
        width: 1720,
        height: 60,
        overflow: 'hidden',
        fontSize: 22,
        fontWeight: 700,
        color: 'ACCENT_COLOR',
        letterSpacing: 6,
        textTransform: 'uppercase',
        opacity: titleOp,
      }}>
        {titleText}
      </div>

      {/* Column headers */}
      <div style={{
        position: 'absolute',
        top: 150,
        left: lx - 120,
        width: 280,
        height: 50,
        overflow: 'hidden',
        fontSize: 20,
        fontWeight: 700,
        color: 'PRIMARY_COLOR',
        textAlign: 'center',
        letterSpacing: 3,
        textTransform: 'uppercase',
        opacity: titleOp,
      }}>
        {leftHead}
      </div>
      <div style={{
        position: 'absolute',
        top: 150,
        left: rx - 120,
        width: 280,
        height: 50,
        overflow: 'hidden',
        fontSize: 20,
        fontWeight: 700,
        color: 'SECONDARY_COLOR',
        textAlign: 'center',
        letterSpacing: 3,
        textTransform: 'uppercase',
        opacity: titleOp,
      }}>
        {rightHead}
      </div>

      <svg width={1920} height={1080} style={{ position: 'absolute', top: 0, left: 0 }}>
        {/* Edges */}
        {edges.map(([li, ri, delay], i) => {
          const ly = rawLeftNodes[li].y
          const ry = rawRightNodes[ri].y
          const edgeOp = interpolate(frame, [delay, delay + 14], [0, 0.6], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          })
          const progress = interpolate(frame, [delay, delay + 14], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          })
          const ex = lx + (rx - lx) * progress
          const ey = ly + (ry - ly) * progress
          return (
            <line
              key={i}
              x1={lx}
              y1={ly}
              x2={ex}
              y2={ey}
              stroke="LINE_STROKE"
              strokeWidth={2}
              opacity={edgeOp}
            />
          )
        })}

        {/* Left nodes */}
        {leftNodes.map((n, i) => {
          const nodeOp = interpolate(frame, [n.delay, n.delay + 14], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          })
          return (
            <g key={i} opacity={nodeOp}>
              <circle cx={lx} cy={n.y} r={30} fill="NODE_FILL" stroke="PRIMARY_COLOR" strokeWidth={3} />
              <circle cx={lx} cy={n.y} r={12} fill="PRIMARY_COLOR" />
            </g>
          )
        })}

        {/* Right nodes */}
        {rightNodes.map((n, i) => {
          const nodeOp = interpolate(frame, [n.delay, n.delay + 14], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          })
          return (
            <g key={i} opacity={nodeOp}>
              <circle cx={rx} cy={n.y} r={30} fill="NODE_FILL" stroke="SECONDARY_COLOR" strokeWidth={3} />
              <circle cx={rx} cy={n.y} r={12} fill="SECONDARY_COLOR" />
            </g>
          )
        })}
      </svg>

      {/* Left node labels */}
      {leftNodes.map((n, i) => {
        const labelOp = interpolate(frame, [n.delay + 6, n.delay + 18], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        })
        return (
          <div key={i} style={{
            position: 'absolute',
            top: n.y - 18,
            left: lx - 300,
            width: 260,
            height: 36,
            overflow: 'hidden',
            fontSize: 22,
            fontWeight: 600,
            color: 'TEXT_ON_PRIMARY',
            textAlign: 'right',
            opacity: labelOp,
          }}>
            {n.label}
          </div>
        )
      })}

      {/* Right node labels */}
      {rightNodes.map((n, i) => {
        const labelOp = interpolate(frame, [n.delay + 6, n.delay + 18], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        })
        return (
          <div key={i} style={{
            position: 'absolute',
            top: n.y - 18,
            left: rx + 48,
            width: 260,
            height: 36,
            overflow: 'hidden',
            fontSize: 22,
            fontWeight: 600,
            color: 'TEXT_ON_PRIMARY',
            opacity: labelOp,
          }}>
            {n.label}
          </div>
        )
      })}

      {/* Bottom bar */}
      <div style={{
        position: 'absolute',
        top: 1020,
        left: 0,
        width: 1920,
        height: 4,
        overflow: 'hidden',
        backgroundColor: 'ACCENT_COLOR',
        opacity: titleOp,
      }} />
    </div>
  )
}

export default AnimationComponent