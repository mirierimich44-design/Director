import React from 'react'
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion'

const stat1 = 'STAT_VALUE_1'
const stat2 = 'STAT_VALUE_2'
const stat3 = 'STAT_VALUE_3'
const label1 = 'LABEL_1'
const label2 = 'LABEL_2'
const label3 = 'LABEL_3'
const sub1 = 'SUB_1'
const sub2 = 'SUB_2'
const sub3 = 'SUB_3'
const verdict = 'VERDICT_TEXT'

function statFontSize(text: string): number {
  if (text.length <= 4) return 88
  if (text.length <= 8) return 68
  return 52
}

const clamp = { extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const }

export const AnimationComponent = () => {
  const frame = useCurrentFrame()
  const { durationInFrames } = useVideoConfig()

  // ── Exit fade ──────────────────────────────────────────────────────────────
  const exitOpacity = interpolate(
    frame,
    [durationInFrames - 18, durationInFrames - 2],
    [1, 0],
    clamp
  )

  // ── Corner brackets ────────────────────────────────────────────────────────
  const bracketOffset = interpolate(frame, [0, 15], [200, 0], clamp)

  // ── Scan line & overlines ──────────────────────────────────────────────────
  const scanOpacity = interpolate(frame, [0, 20], [0, 1], clamp)
  const scanY = (frame % 90) / 90 * 1080

  // ── Card slide + fade ─────────────────────────────────────────────────────
  const card1Opacity = interpolate(frame, [5, 30], [0, 1], clamp)
  const card1Y = interpolate(frame, [5, 30], [24, 0], clamp)

  const card2Opacity = interpolate(frame, [20, 45], [0, 1], clamp)
  const card2Y = interpolate(frame, [20, 45], [24, 0], clamp)

  const card3Opacity = interpolate(frame, [35, 60], [0, 1], clamp)
  const card3Y = interpolate(frame, [35, 60], [24, 0], clamp)

  // ── Connector lines ────────────────────────────────────────────────────────
  const connW = interpolate(frame, [55, 75], [0, 90], clamp)

  // ── Verdict box ────────────────────────────────────────────────────────────
  const verdictOpacity = interpolate(frame, [70, 100], [0, 1], clamp)
  const verdictY = interpolate(frame, [70, 100], [16, 0], clamp)

  // ── Accent bar pulse ───────────────────────────────────────────────────────
  const accentOpacity = 0.4 + Math.sin(frame * 0.07) * 0.25

  // ── Layout ─────────────────────────────────────────────────────────────────
  const CARD_W = 480
  const CARD_H = 340
  const GAP = 60
  const TOTAL_W = CARD_W * 3 + GAP * 2
  const LEFT = (1920 - TOTAL_W) / 2
  const CARD_TOP = 320
  const card1x = LEFT
  const conn1x = LEFT + CARD_W
  const card2x = conn1x + GAP
  const conn2x = card2x + CARD_W
  const card3x = conn2x + GAP

  const cardBase: React.CSSProperties = {
    position: 'absolute',
    top: CARD_TOP,
    width: CARD_W,
    height: CARD_H,
    backgroundColor: 'PANEL_RIGHT_BG',
    border: '1px solid CHART_BORDER',
    borderTop: '4px solid PRIMARY_COLOR',
    borderRadius: 12,
    overflow: 'hidden',
    boxSizing: 'border-box',
  }

  // Overline label per card
  const overlineStyle: React.CSSProperties = {
    position: 'absolute',
    top: 8,
    left: 36,
    color: 'ACCENT_COLOR',
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.25em',
    textTransform: 'uppercase',
    opacity: scanOpacity,
  }

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: 1920,
        height: 1080,
        overflow: 'hidden',
        backgroundColor: 'BACKGROUND_COLOR',
        opacity: exitOpacity,
      }}
    >
      {/* ── Corner bracket SVG ─────────────────────────────────────────── */}
      <svg
        style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, pointerEvents: 'none' }}
        viewBox="0 0 1920 1080"
      >
        {/* Top-left */}
        <polyline
          points="48,24 24,24 24,48"
          fill="none"
          stroke="PRIMARY_COLOR"
          strokeWidth={2}
          strokeDasharray={48}
          strokeDashoffset={bracketOffset}
        />
        {/* Top-right */}
        <polyline
          points="1872,24 1896,24 1896,48"
          fill="none"
          stroke="PRIMARY_COLOR"
          strokeWidth={2}
          strokeDasharray={48}
          strokeDashoffset={bracketOffset}
        />
        {/* Bottom-left */}
        <polyline
          points="24,1032 24,1056 48,1056"
          fill="none"
          stroke="PRIMARY_COLOR"
          strokeWidth={2}
          strokeDasharray={48}
          strokeDashoffset={bracketOffset}
        />
        {/* Bottom-right */}
        <polyline
          points="1896,1032 1896,1056 1872,1056"
          fill="none"
          stroke="PRIMARY_COLOR"
          strokeWidth={2}
          strokeDasharray={48}
          strokeDashoffset={bracketOffset}
        />
      </svg>

      {/* ── Scan line ──────────────────────────────────────────────────── */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: scanY,
          width: 1920,
          height: 1,
          background: 'linear-gradient(90deg, transparent, PRIMARY_COLOR, transparent)',
          opacity: scanOpacity * 0.18,
          pointerEvents: 'none',
        }}
      />

      {/* ══════════════════════ CARD 1 ══════════════════════════════════ */}
      <div
        style={{
          ...cardBase,
          left: card1x,
          opacity: card1Opacity,
          transform: `translateY(${card1Y}px)`,
        }}
      >
        {/* Overline */}
        <div style={overlineStyle}>◆ METRIC 01</div>

        {/* Stat value */}
        <div
          style={{
            position: 'absolute',
            top: 56,
            left: 36,
            width: CARD_W - 72,
            color: 'PRIMARY_COLOR',
            fontSize: statFontSize(stat1),
            fontWeight: 900,
            fontFamily: 'monospace',
            letterSpacing: '-0.02em',
            lineHeight: 1.0,
            whiteSpace: 'normal',
            wordBreak: 'break-word',
          }}
        >
          {stat1}
        </div>

        {/* Divider */}
        <div
          style={{
            position: 'absolute',
            top: 190,
            left: 36,
            width: 40,
            height: 2,
            backgroundColor: 'PRIMARY_COLOR',
            opacity: 0.4,
          }}
        />

        {/* Label */}
        <div
          style={{
            position: 'absolute',
            top: 206,
            left: 36,
            width: CARD_W - 72,
            color: 'SUPPORT_COLOR',
            fontSize: 15,
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            whiteSpace: 'normal',
            wordBreak: 'break-word',
          }}
        >
          {label1}
        </div>

        {/* Sub-text */}
        <div
          style={{
            position: 'absolute',
            top: 248,
            left: 36,
            width: CARD_W - 72,
            color: 'SUPPORT_COLOR',
            fontSize: 13,
            opacity: 0.6,
            whiteSpace: 'normal',
            wordBreak: 'break-word',
          }}
        >
          {sub1}
        </div>

        {/* Bottom accent bar */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
            height: 3,
            backgroundColor: 'ACCENT_COLOR',
            opacity: accentOpacity,
          }}
        />
      </div>

      {/* ── Connector 1 ────────────────────────────────────────────────── */}
      <div
        style={{
          position: 'absolute',
          top: CARD_TOP + CARD_H / 2 - 1,
          left: conn1x,
          width: connW,
          height: 3,
          backgroundColor: 'SUPPORT_COLOR',
          opacity: 0.4,
        }}
      />

      {/* ══════════════════════ CARD 2 ══════════════════════════════════ */}
      <div
        style={{
          ...cardBase,
          left: card2x,
          opacity: card2Opacity,
          transform: `translateY(${card2Y}px)`,
        }}
      >
        {/* Overline */}
        <div style={overlineStyle}>◆ METRIC 02</div>

        {/* Stat value */}
        <div
          style={{
            position: 'absolute',
            top: 56,
            left: 36,
            width: CARD_W - 72,
            color: 'PRIMARY_COLOR',
            fontSize: statFontSize(stat2),
            fontWeight: 900,
            fontFamily: 'monospace',
            letterSpacing: '-0.02em',
            lineHeight: 1.0,
            whiteSpace: 'normal',
            wordBreak: 'break-word',
          }}
        >
          {stat2}
        </div>

        {/* Divider */}
        <div
          style={{
            position: 'absolute',
            top: 190,
            left: 36,
            width: 40,
            height: 2,
            backgroundColor: 'PRIMARY_COLOR',
            opacity: 0.4,
          }}
        />

        {/* Label */}
        <div
          style={{
            position: 'absolute',
            top: 206,
            left: 36,
            width: CARD_W - 72,
            color: 'SUPPORT_COLOR',
            fontSize: 15,
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            whiteSpace: 'normal',
            wordBreak: 'break-word',
          }}
        >
          {label2}
        </div>

        {/* Sub-text */}
        <div
          style={{
            position: 'absolute',
            top: 248,
            left: 36,
            width: CARD_W - 72,
            color: 'SUPPORT_COLOR',
            fontSize: 13,
            opacity: 0.6,
            whiteSpace: 'normal',
            wordBreak: 'break-word',
          }}
        >
          {sub2}
        </div>

        {/* Bottom accent bar */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
            height: 3,
            backgroundColor: 'ACCENT_COLOR',
            opacity: accentOpacity,
          }}
        />
      </div>

      {/* ── Connector 2 ────────────────────────────────────────────────── */}
      <div
        style={{
          position: 'absolute',
          top: CARD_TOP + CARD_H / 2 - 1,
          left: conn2x,
          width: connW,
          height: 3,
          backgroundColor: 'SUPPORT_COLOR',
          opacity: 0.4,
        }}
      />

      {/* ══════════════════════ CARD 3 ══════════════════════════════════ */}
      <div
        style={{
          ...cardBase,
          left: card3x,
          opacity: card3Opacity,
          transform: `translateY(${card3Y}px)`,
        }}
      >
        {/* Overline */}
        <div style={overlineStyle}>◆ METRIC 03</div>

        {/* Stat value */}
        <div
          style={{
            position: 'absolute',
            top: 56,
            left: 36,
            width: CARD_W - 72,
            color: 'PRIMARY_COLOR',
            fontSize: statFontSize(stat3),
            fontWeight: 900,
            fontFamily: 'monospace',
            letterSpacing: '-0.02em',
            lineHeight: 1.0,
            whiteSpace: 'normal',
            wordBreak: 'break-word',
          }}
        >
          {stat3}
        </div>

        {/* Divider */}
        <div
          style={{
            position: 'absolute',
            top: 190,
            left: 36,
            width: 40,
            height: 2,
            backgroundColor: 'PRIMARY_COLOR',
            opacity: 0.4,
          }}
        />

        {/* Label */}
        <div
          style={{
            position: 'absolute',
            top: 206,
            left: 36,
            width: CARD_W - 72,
            color: 'SUPPORT_COLOR',
            fontSize: 15,
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            whiteSpace: 'normal',
            wordBreak: 'break-word',
          }}
        >
          {label3}
        </div>

        {/* Sub-text */}
        <div
          style={{
            position: 'absolute',
            top: 248,
            left: 36,
            width: CARD_W - 72,
            color: 'SUPPORT_COLOR',
            fontSize: 13,
            opacity: 0.6,
            whiteSpace: 'normal',
            wordBreak: 'break-word',
          }}
        >
          {sub3}
        </div>

        {/* Bottom accent bar */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
            height: 3,
            backgroundColor: 'ACCENT_COLOR',
            opacity: accentOpacity,
          }}
        />
      </div>

      {/* ══════════════════════ VERDICT BOX ═════════════════════════════ */}
      <div
        style={{
          position: 'absolute',
          top: 660,
          left: LEFT,
          width: TOTAL_W,
          backgroundColor: 'PANEL_RIGHT_BG',
          border: '1px solid CHART_BORDER',
          borderLeft: '5px solid PRIMARY_COLOR',
          color: 'PRIMARY_COLOR',
          borderRadius: 12,
          padding: '20px 44px',
          boxSizing: 'border-box',
          fontSize: 24,
          fontWeight: 500,
          lineHeight: 1.6,
          whiteSpace: 'normal',
          wordBreak: 'break-word',
          opacity: verdictOpacity,
          transform: `translateY(${verdictY}px)`,
        }}
      >
        {verdict}
      </div>
    </div>
  )
}

export default AnimationComponent
