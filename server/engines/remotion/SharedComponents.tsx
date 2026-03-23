/**
 * SharedComponents.tsx
 * Copied into every render bundle so templates can import shared utilities.
 * Import in templates: import { LowerThird, AnimatedCounter } from './SharedComponents'
 */

import React from 'react'
import { useCurrentFrame, useVideoConfig, interpolate, Easing } from 'remotion'

// ─── LowerThird ───────────────────────────────────────────────────────────────
interface LowerThirdProps {
  text: string
  attribution?: string
  tone?: string
  startFrame?: number
  duration?: number
}

export const LowerThird: React.FC<LowerThirdProps> = ({
  text,
  attribution = '',
  tone = '#FF6600',
  startFrame = 0,
  duration = 60,
}) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const slideIn = interpolate(frame - startFrame, [0, 12], [40, 0], {
    clamp: true,
    easing: Easing.out(Easing.cubic),
  })
  const opacity = interpolate(frame - startFrame, [0, 8, duration - 12, duration], [0, 1, 1, 0], {
    clamp: true,
  })

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 80,
        left: 80,
        opacity,
        transform: `translateY(${slideIn}px)`,
      }}
    >
      <div
        style={{
          width: 4,
          height: attribution ? 52 : 32,
          backgroundColor: tone,
          position: 'absolute',
          left: 0,
          top: 0,
        }}
      />
      <div style={{ paddingLeft: 16 }}>
        <div
          style={{
            fontFamily: 'sans-serif',
            fontSize: 22,
            fontWeight: 700,
            color: '#FFFFFF',
            letterSpacing: 0.5,
          }}
        >
          {text}
        </div>
        {attribution ? (
          <div
            style={{
              fontFamily: 'sans-serif',
              fontSize: 14,
              color: 'rgba(255,255,255,0.6)',
              marginTop: 4,
            }}
          >
            {attribution}
          </div>
        ) : null}
      </div>
    </div>
  )
}

// ─── AnimatedCounter ──────────────────────────────────────────────────────────
interface AnimatedCounterProps {
  from?: number
  to: number
  decimals?: number
  prefix?: string
  suffix?: string
  style?: React.CSSProperties
  startFrame?: number
  duration?: number
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  from = 0,
  to,
  decimals = 0,
  prefix = '',
  suffix = '',
  style = {},
  startFrame = 0,
  duration = 60,
}) => {
  const frame = useCurrentFrame()
  const value = interpolate(frame - startFrame, [0, duration], [from, to], {
    clamp: true,
    easing: Easing.out(Easing.quad),
  })
  const display = value.toFixed(decimals)
  return (
    <span style={style}>
      {prefix}{display}{suffix}
    </span>
  )
}

// ─── FadeIn ───────────────────────────────────────────────────────────────────
interface FadeInProps {
  children: React.ReactNode
  startFrame?: number
  duration?: number
  style?: React.CSSProperties
}

export const FadeIn: React.FC<FadeInProps> = ({
  children,
  startFrame = 0,
  duration = 20,
  style = {},
}) => {
  const frame = useCurrentFrame()
  const opacity = interpolate(frame - startFrame, [0, duration], [0, 1], { clamp: true })
  return <div style={{ opacity, ...style }}>{children}</div>
}

// ─── SlideIn ──────────────────────────────────────────────────────────────────
interface SlideInProps {
  children: React.ReactNode
  direction?: 'left' | 'right' | 'up' | 'down'
  distance?: number
  startFrame?: number
  duration?: number
  style?: React.CSSProperties
}

export const SlideIn: React.FC<SlideInProps> = ({
  children,
  direction = 'up',
  distance = 40,
  startFrame = 0,
  duration = 20,
  style = {},
}) => {
  const frame = useCurrentFrame()
  const progress = interpolate(frame - startFrame, [0, duration], [0, 1], {
    clamp: true,
    easing: Easing.out(Easing.cubic),
  })
  const offset = (1 - progress) * distance
  const transforms: Record<string, string> = {
    up: `translateY(${offset}px)`,
    down: `translateY(${-offset}px)`,
    left: `translateX(${offset}px)`,
    right: `translateX(${-offset}px)`,
  }
  return (
    <div
      style={{
        opacity: progress,
        transform: transforms[direction],
        ...style,
      }}
    >
      {children}
    </div>
  )
}
