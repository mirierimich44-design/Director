import React, { useMemo } from 'react'
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion'

export const AnimationComponent = () => {
  const frame = useCurrentFrame()

  const titleOp = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  const titleText = "TITLE_TEXT"

  // Filter logic: Remove clusters where hub or any satellite is empty/Placeholder
  const rawClusters = [
    {
      hub: { x: 380, y: 540, label: 'NODE_LABEL_1', delay: 8 },
      satellites: [
        { x: 200, y: 340, label: 'NODE_LABEL_2', delay: 22 },
        { x: 200, y: 560, label: 'NODE_LABEL_3', delay: 26 },
        { x: 220, y: 760, label: 'NODE_LABEL_4', delay: 30 },
      ],
    },
    {
      hub: { x: 960, y: 400, label: 'NODE_LABEL_5', delay: 14 },
      satellites: [
        { x: 820, y: 240, label: 'NODE_LABEL_6', delay: 28 },
        { x: 1100, y: 240, label: 'LABEL_1',     delay: 32 },
        { x: 960,  y: 580, label: 'LABEL_2',     delay: 36 },
      ],
    },
    {
      hub: { x: 1540, y: 560, label: 'LABEL_3', delay: 18 },
      satellites: [
        { x: 1700, y: 360, label: 'TAG_1', delay: 34 },
        { x: 1700, y: 580, label: 'TAG_2', delay: 38 },
        { x: 1700, y: 780, label: 'TAG_3', delay: 42 },
      ],
    },
  ]

  const isValid = (str: string) => str !== '' && str !== 'Placeholder'

  const clusters = useMemo(() => {
    return rawClusters
      .filter(c => isValid(c.hub.label))
      .map(c => ({
        ...c,
        satellites: c.satellites.filter(s => isValid(s.label))
      }))
  }, [])

  // Inter-cluster edges
  const interEdges = [
    { x1: 380, y1: 540, x2: 960,  y2: 400, delay: 50 },
    { x1: 960, y1: 400, x2: 1540, y2: 560, delay: 54 },
  ]

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

      <svg width={1920} height={1080} style={{ position: 'absolute', top: 0, left: 0 }}>
        {/* Inter-cluster edges */}
        {interEdges.map((e, i) => {
          const edgeOp = interpolate(frame, [e.delay, e.delay + 14], [0, 0.5], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          })
          return (
            <line
              key={i}
              x1={e.x1} y1={e.y1}
              x2={e.x2} y2={e.y2}
              stroke="ACCENT_COLOR"
              strokeWidth={2}
              opacity={edgeOp}
              strokeDasharray="8 6"
            />
          )
        })}

        {/* Cluster spokes + satellite nodes */}
        {clusters.map((cl, ci) => (
          <g key={ci}>
            {cl.satellites.map((sat, si) => {
              const spokeOp = interpolate(frame, [sat.delay - 4, sat.delay + 8], [0, 0.5], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              })
              const nodeOp = interpolate(frame, [sat.delay, sat.delay + 12], [0, 1], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              })
              const nodeR = interpolate(frame, [sat.delay, sat.delay + 12], [0, 18], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              })
              return (
                <g key={si}>
                  <line
                    x1={cl.hub.x} y1={cl.hub.y}
                    x2={sat.x} y2={sat.y}
                    stroke="LINE_STROKE"
                    strokeWidth={1.5}
                    opacity={spokeOp}
                  />
                  <circle cx={sat.x} cy={sat.y} r={nodeR} fill="NODE_FILL" stroke="NODE_STROKE" strokeWidth={2} opacity={nodeOp} />
                </g>
              )
            })}

            {/* Hub node */}
            {(() => {
              const hubOp = interpolate(frame, [cl.hub.delay, cl.hub.delay + 14], [0, 1], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              })
              const hubR = interpolate(frame, [cl.hub.delay, cl.hub.delay + 14], [0, 36], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              })
              return (
                <g opacity={hubOp}>
                  <circle cx={cl.hub.x} cy={cl.hub.y} r={hubR + 8} fill="PRIMARY_COLOR" opacity={0.2} />
                  <circle cx={cl.hub.x} cy={cl.hub.y} r={hubR} fill="NODE_FILL" stroke="PRIMARY_COLOR" strokeWidth={3} />
                  <circle cx={cl.hub.x} cy={cl.hub.y} r={14} fill="PRIMARY_COLOR" />
                </g>
              )
            })()}
          </g>
        ))}
      </svg>

      {/* Node labels */}
      {clusters.flatMap((cl, ci) => [
        { ...cl.hub, isHub: true },
        ...cl.satellites.map(s => ({ ...s, isHub: false })),
      ]).map((n, i) => {
        const labelOp = interpolate(frame, [n.delay + 8, n.delay + 20], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        })
        return (
          <div key={i} style={{
            position: 'absolute',
            top: n.y + (n.isHub ? 46 : 26),
            left: n.x - 100,
            width: 200,
            height: 40,
            overflow: 'hidden',
            fontSize: n.isHub ? 22 : 17,
            fontWeight: n.isHub ? 700 : 500,
            color: n.isHub ? 'PRIMARY_COLOR' : 'TEXT_ON_PRIMARY',
            textAlign: 'center',
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