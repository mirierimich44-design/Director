import React, { useMemo } from 'react'
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion'

export const AnimationComponent = () => {
  const frame = useCurrentFrame()

  const title = "TITLE_TEXT"
  const originLabel = "ORIGIN_LABEL"
  const rawNodeLabels = ["NODE_LABEL_1", "NODE_LABEL_2", "NODE_LABEL_3", "NODE_LABEL_4", "NODE_LABEL_5", "NODE_LABEL_6"]

  const activeNodes = useMemo(() => {
    return rawNodeLabels.filter(label => label !== '' && label !== 'Placeholder')
  }, [rawNodeLabels])

  const count = activeNodes.length
  const angles = Array.from({ length: count }, (_, i) => (i * (360 / count) * Math.PI) / 180)

  const titleOp = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const titleTy = interpolate(frame, [0, 20], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const centerOp = interpolate(frame, [10, 28], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const centerScale = interpolate(frame, [10, 28], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const lineOp = interpolate(frame, [25, 40], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const lineProgress = interpolate(frame, [25, 45], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  
  const outerOpacities = angles.map((_, i) => interpolate(frame, [35 + i * 5, 48 + i * 5], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }))
  const outerScales = angles.map((_, i) => interpolate(frame, [35 + i * 5, 48 + i * 5], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }))
  const lOp = interpolate(frame, [65, 80], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  const cx = 960
  const cy = 540
  const radius = 300
  const outerNodes = angles.map(a => ({
    x: cx + radius * Math.cos(a),
    y: cy + radius * Math.sin(a),
  }))

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
        opacity: titleOp,
      }} />

      <div style={{
        position: 'absolute',
        top: 60,
        left: 0,
        width: 1920,
        height: 60,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: titleOp,
        transform: `translateY(${titleTy}px)`,
      }}>
        <span style={{
          fontSize: 28,
          fontWeight: 700,
          color: 'PRIMARY_COLOR',
          letterSpacing: 5,
          textTransform: 'uppercase',
          fontFamily: 'sans-serif',
        }}>
          {title}
        </span>
      </div>

      <svg width={1920} height={1080} style={{ position: 'absolute', top: 0, left: 0 }}>
        {outerNodes.map((node, i) => {
          const ex = cx + (node.x - cx) * lineProgress
          const ey = cy + (node.y - cy) * lineProgress
          return (
            <line
              key={i}
              x1={cx} y1={cy} x2={ex} y2={ey}
              stroke="LINE_STROKE"
              strokeWidth={1.5}
              opacity={lineOp}
              strokeDasharray="6 4"
            />
          )
        })}

        <circle cx={cx} cy={cy} r={52} fill="CHART_BG" stroke="NODE_STROKE" strokeWidth={2} opacity={centerOp} transform={`scale(${centerScale})`} style={{ transformOrigin: `${cx}px ${cy}px` }} />
        <circle cx={cx} cy={cy} r={36} fill="PRIMARY_COLOR" opacity={centerOp} transform={`scale(${centerScale})`} style={{ transformOrigin: `${cx}px ${cy}px` }} />

        {outerNodes.map((node, i) => (
          <g key={i} opacity={outerOpacities[i]}>
            <circle cx={node.x} cy={node.y} r={34} fill="CHART_BG" stroke="NODE_STROKE" strokeWidth={1.5} transform={`scale(${outerScales[i]})`} style={{ transformOrigin: `${node.x}px ${node.y}px` }} />
            <circle cx={node.x} cy={node.y} r={22} fill="NODE_FILL" transform={`scale(${outerScales[i]})`} style={{ transformOrigin: `${node.x}px ${node.y}px` }} />
          </g>
        ))}
      </svg>

      <div style={{
        position: 'absolute',
        top: cy - 20,
        left: cx - 120,
        width: 240,
        height: 40,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: centerOp,
      }}>
        <span style={{
          fontSize: 15,
          fontWeight: 700,
          color: 'TEXT_ON_PRIMARY',
          fontFamily: 'sans-serif',
          textAlign: 'center',
          letterSpacing: 1,
        }}>
          {originLabel}
        </span>
      </div>

      {outerNodes.map((node, i) => {
        const isLeft = node.x < cx - 50
        const isRight = node.x > cx + 50
        const isTop = node.y < cy - 50
        const isBottom = node.y > cy + 50

        let labelLeft = node.x - 90
        let labelTop = node.y - 12

        if (isLeft) {
          labelLeft = node.x - 210
          labelTop = node.y - 14
        } else if (isRight) {
          labelLeft = node.x + 46
          labelTop = node.y - 14
        } else if (isTop) {
          labelLeft = node.x - 90
          labelTop = node.y - 64
        } else if (isBottom) {
          labelLeft = node.x - 90
          labelTop = node.y + 44
        }

        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: labelTop,
              left: labelLeft,
              width: 180,
              height: 30,
              overflow: 'hidden',
              opacity: lOp,
              display: 'flex',
              alignItems: 'center',
              justifyContent: isLeft ? 'flex-end' : isRight ? 'flex-start' : 'center',
            }}
          >
            <span style={{
              fontSize: 16,
              fontWeight: 500,
              color: 'TEXT_ON_SECONDARY',
              fontFamily: 'sans-serif',
              textAlign: 'center',
            }}>
              {activeNodes[i]}
            </span>
          </div>
        )
      })}

    </div>
  )
}

export default AnimationComponent