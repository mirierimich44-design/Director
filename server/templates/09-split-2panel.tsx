import React from 'react'
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion'

const leftHead = "LEFT_HEAD"
const leftSub1 = "LEFT_SUB1"
const leftSub2 = "LEFT_SUB2"
const leftSub3 = "LEFT_SUB3"
const rightHead = "RIGHT_HEAD"
const rightSub1 = "RIGHT_SUB1"
const rightSub2 = "RIGHT_SUB2"
const rightSub3 = "RIGHT_SUB3"
const verdict = "VERDICT_TEXT"

export const AnimationComponent = () => {
  const frame = useCurrentFrame()

  const opLH = interpolate(frame, [0, 25], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  const tyLH = interpolate(frame, [0, 25], [20, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  const opLS1 = interpolate(frame, [28, 52], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  const tyLS1 = interpolate(frame, [28, 52], [20, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  const opLS2 = interpolate(frame, [48, 72], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  const tyLS2 = interpolate(frame, [48, 72], [20, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  const opLS3 = interpolate(frame, [68, 92], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  const tyLS3 = interpolate(frame, [68, 92], [20, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  const opRH = interpolate(frame, [100, 125], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  const tyRH = interpolate(frame, [100, 125], [20, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  const opRS1 = interpolate(frame, [125, 148], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  const tyRS1 = interpolate(frame, [125, 148], [20, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  const opRS2 = interpolate(frame, [145, 168], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  const tyRS2 = interpolate(frame, [145, 168], [20, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  const opRS3 = interpolate(frame, [165, 188], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  const tyRS3 = interpolate(frame, [165, 188], [20, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  const opV = interpolate(frame, [205, 230], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  const tyV = interpolate(frame, [205, 230], [20, 0], {
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

      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: 960,
        height: 1080,
        backgroundColor: 'PANEL_LEFT_BG',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute',
          top: 240,
          left: 60,
          width: 840,
          height: 80,
          backgroundColor: 'PRIMARY_COLOR',
          color: 'TEXT_ON_PRIMARY',
          borderRadius: 4,
          padding: '20px 32px',
          boxSizing: 'border-box',
          fontSize: 32,
          fontWeight: 900,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          opacity: opLH,
          transform: `translateY(${tyLH}px)`,
        }}>
          {leftHead}
        </div>
        <div style={{
          position: 'absolute',
          top: 348,
          left: 60,
          width: 840,
          height: 64,
          backgroundColor: 'SECONDARY_COLOR',
          color: 'TEXT_ON_SECONDARY',
          borderRadius: 4,
          padding: '16px 28px',
          boxSizing: 'border-box',
          fontSize: 24,
          fontWeight: 700,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          opacity: opLS1,
          transform: `translateY(${tyLS1}px)`,
        }}>
          {leftSub1}
        </div>
        <div style={{
          position: 'absolute',
          top: 430,
          left: 60,
          width: 840,
          height: 64,
          backgroundColor: 'SUPPORT_COLOR',
          color: 'TEXT_ON_PRIMARY',
          borderRadius: 4,
          padding: '16px 28px',
          boxSizing: 'border-box',
          fontSize: 24,
          fontWeight: 700,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          opacity: opLS2,
          transform: `translateY(${tyLS2}px)`,
        }}>
          {leftSub2}
        </div>
        <div style={{
          position: 'absolute',
          top: 512,
          left: 60,
          width: 840,
          height: 64,
          backgroundColor: 'ACCENT_COLOR',
          color: 'TEXT_ON_ACCENT',
          borderRadius: 4,
          padding: '16px 28px',
          boxSizing: 'border-box',
          fontSize: 24,
          fontWeight: 700,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          opacity: opLS3,
          transform: `translateY(${tyLS3}px)`,
        }}>
          {leftSub3}
        </div>
      </div>

      <div style={{
        position: 'absolute',
        top: 0,
        left: 958,
        width: 4,
        height: 1080,
        backgroundColor: 'SUPPORT_COLOR',
        opacity: 0.3,
      }} />

      <div style={{
        position: 'absolute',
        top: 0,
        left: 960,
        width: 960,
        height: 1080,
        backgroundColor: 'PANEL_RIGHT_BG',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute',
          top: 240,
          left: 60,
          width: 840,
          height: 80,
          backgroundColor: 'SECONDARY_COLOR',
          color: 'TEXT_ON_SECONDARY',
          borderRadius: 4,
          padding: '20px 32px',
          boxSizing: 'border-box',
          fontSize: 32,
          fontWeight: 900,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          opacity: opRH,
          transform: `translateY(${tyRH}px)`,
        }}>
          {rightHead}
        </div>
        <div style={{
          position: 'absolute',
          top: 348,
          left: 60,
          width: 840,
          height: 64,
          backgroundColor: 'PRIMARY_COLOR',
          color: 'TEXT_ON_PRIMARY',
          borderRadius: 4,
          padding: '16px 28px',
          boxSizing: 'border-box',
          fontSize: 24,
          fontWeight: 700,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          opacity: opRS1,
          transform: `translateY(${tyRS1}px)`,
        }}>
          {rightSub1}
        </div>
        <div style={{
          position: 'absolute',
          top: 430,
          left: 60,
          width: 840,
          height: 64,
          backgroundColor: 'SUPPORT_COLOR',
          color: 'TEXT_ON_PRIMARY',
          borderRadius: 4,
          padding: '16px 28px',
          boxSizing: 'border-box',
          fontSize: 24,
          fontWeight: 700,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          opacity: opRS2,
          transform: `translateY(${tyRS2}px)`,
        }}>
          {rightSub2}
        </div>
        <div style={{
          position: 'absolute',
          top: 512,
          left: 60,
          width: 840,
          height: 64,
          backgroundColor: 'ACCENT_COLOR',
          color: 'TEXT_ON_ACCENT',
          borderRadius: 4,
          padding: '16px 28px',
          boxSizing: 'border-box',
          fontSize: 24,
          fontWeight: 700,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          opacity: opRS3,
          transform: `translateY(${tyRS3}px)`,
        }}>
          {rightSub3}
        </div>
      </div>

      <div style={{
        position: 'absolute',
        top: 900,
        left: 120,
        width: 1680,
        height: 72,
        backgroundColor: 'PRIMARY_COLOR',
        color: 'TEXT_ON_PRIMARY',
        borderRadius: 4,
        padding: '20px 40px',
        boxSizing: 'border-box',
        fontSize: 28,
        fontWeight: 900,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        opacity: opV,
        transform: `translateY(${tyV}px)`,
      }}>
        {verdict}
      </div>

    </div>
  )
}

export default AnimationComponent