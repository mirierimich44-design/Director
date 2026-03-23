import React, { useMemo } from 'react'
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion'

export const AnimationComponent = () => {
  const frame = useCurrentFrame()

  const titleOp = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  const titleText = "TITLE_TEXT"

  const rawTiles = [
    { x: 100, y: 180, w: 620, h: 420, label: 'BAR_LABEL_1', value: 'BAR_VALUE_1', group: 0, delay: 10 },
    { x: 740, y: 180, w: 460, h: 220, label: 'BAR_LABEL_2', value: 'BAR_VALUE_2', group: 1, delay: 18 },
    { x: 740, y: 420, w: 460, h: 180, label: 'BAR_LABEL_3', value: 'BAR_VALUE_3', group: 1, delay: 26 },
    { x: 1220, y: 180, w: 600, h: 280, label: 'BAR_LABEL_4', value: 'BAR_VALUE_4', group: 2, delay: 34 },
    { x: 100, y: 620, w: 380, h: 280, label: 'LABEL_1',     value: 'STAT_VALUE_1', group: 2, delay: 42 },
    { x: 500, y: 620, w: 340, h: 280, label: 'LABEL_2',     value: 'STAT_VALUE_2', group: 0, delay: 48 },
    { x: 860, y: 620, w: 340, h: 280, label: 'LABEL_3',     value: 'STAT_VALUE_3', group: 1, delay: 54 },
    { x: 1220, y: 480, w: 300, h: 200, label: 'TAG_1',      value: 'LINE_VALUE_1', group: 2, delay: 60 },
    { x: 1540, y: 480, w: 280, h: 200, label: 'TAG_2',      value: 'LINE_VALUE_2', group: 0, delay: 66 },
    { x: 1220, y: 700, w: 600, h: 200, label: 'TAG_3',      value: 'LINE_VALUE_3', group: 1, delay: 72 },
  ]

  const tiles = useMemo(() => {
    return rawTiles.filter(tile => 
      tile.value !== '' && 
      tile.value !== 'Placeholder' && 
      tile.label !== '' && 
      tile.label !== 'Placeholder'
    )
  }, [])

  const groupColors = ['PRIMARY_COLOR', 'ACCENT_COLOR', 'SECONDARY_COLOR']
  const groupTextColors = ['TEXT_ON_PRIMARY', 'TEXT_ON_ACCENT', 'TEXT_ON_SECONDARY']

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

      {/* Tiles */}
      {tiles.map((tile, i) => {
        const tileOp = interpolate(frame, [tile.delay, tile.delay + 16], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        })
        const scaleX = interpolate(frame, [tile.delay, tile.delay + 16], [0.85, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        })
        const bg = groupColors[tile.group]
        const textColor = groupTextColors[tile.group]
        return (
          <div key={i} style={{
            position: 'absolute',
            top: tile.y + 2,
            left: tile.x + 2,
            width: tile.w - 4,
            height: tile.h - 4,
            overflow: 'hidden',
            backgroundColor: bg,
            opacity: tileOp,
            transform: `scaleX(${scaleX})`,
            boxSizing: 'border-box',
            padding: '20px 24px',
            borderRadius: 4,
          }}>
            <div style={{
              position: 'absolute',
              top: tile.h > 200 ? 28 : 14,
              left: 20,
              width: tile.w - 44,
              height: tile.h > 200 ? 60 : 36,
              overflow: 'hidden',
              fontSize: tile.w > 400 ? 40 : 26,
              fontWeight: 900,
              color: textColor,
            }}>
              {tile.value}
            </div>
            <div style={{
              position: 'absolute',
              top: tile.h > 200 ? tile.h - 80 : tile.h - 52,
              left: 20,
              width: tile.w - 44,
              height: 44,
              overflow: 'hidden',
              fontSize: tile.w > 400 ? 22 : 16,
              fontWeight: 600,
              color: textColor,
              opacity: 0.8,
            }}>
              {tile.label}
            </div>
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