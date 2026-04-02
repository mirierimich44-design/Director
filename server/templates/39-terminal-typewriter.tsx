import React, { useMemo } from 'react'
import { useCurrentFrame, interpolate } from 'remotion'

export const AnimationComponent = () => {
  const frame = useCurrentFrame()

  const title = "TITLE_TEXT"
  const keyPath = "KEY_PATH"
  const rawLogLines = ["LOG_LINE_1", "LOG_LINE_2", "", "LOG_LINE_4", "Placeholder", "LOG_LINE_6"]

  const logLines = useMemo(() => {
    return rawLogLines.filter(line => line !== '' && line !== 'Placeholder')
  }, [rawLogLines])

  const titleOp = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const titleTy = interpolate(frame, [0, 20], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const barW = interpolate(frame, [10, 40], [0, 1920], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const panelOp = interpolate(frame, [12, 26], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const panelTy = interpolate(frame, [12, 26], [30, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const cursorOp = interpolate(frame % 24, [0, 12, 13, 24], [1, 1, 0, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  const lineH = 56
  const framesPerLine = 14

  const lineVisibilities = logLines.map((line, i) => {
    const startFrame = 25 + i * framesPerLine
    const progress = interpolate(frame, [startFrame, startFrame + framesPerLine], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    const chars = Math.floor(progress * line.length)
    return line.slice(0, chars)
  })

  const lineColors = ['#4ade80', '#4ade80', '#facc15', '#f87171', '#4ade80', '#4ade80']

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden', backgroundColor: 'BACKGROUND_COLOR' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 5, overflow: 'hidden', backgroundColor: 'PRIMARY_COLOR', opacity: titleOp }} />
      <div style={{ position: 'absolute', top: 1074, left: 0, width: barW, height: 6, overflow: 'hidden', backgroundColor: 'PRIMARY_COLOR' }} />
      <div style={{ position: 'absolute', top: 60, left: 0, width: 1920, height: 60, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: titleOp, transform: `translateY(${titleTy}px)` }}>
        <span style={{ fontSize: 26, fontWeight: 700, color: 'PRIMARY_COLOR', letterSpacing: 5, textTransform: 'uppercase', fontFamily: 'sans-serif' }}>{title}</span>
      </div>
      {/* Terminal window */}
      <div style={{ position: 'absolute', top: 160, left: 240, width: 1440, height: lineH * logLines.length + 100, overflow: 'hidden', backgroundColor: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, boxShadow: '0 20px 50px rgba(0,0,0,0.5)', opacity: panelOp, transform: `translateY(${panelTy}px)`, boxSizing: 'border-box' }}>
        {/* Title bar */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: 1440, height: 44, overflow: 'hidden', backgroundColor: 'rgba(15, 23, 42, 0.9)', borderRadius: '16px 16px 0 0', display: 'flex', alignItems: 'center', boxSizing: 'border-box', padding: '0 20px' }}>
          <div style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: '#ff5f57', marginRight: 8 }} />
          <div style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: '#febc2e', marginRight: 8 }} />
          <div style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: '#28c840', marginRight: 20 }} />
          <span style={{ fontSize: 16, color: '#8b949e', fontFamily: 'monospace' }}>{keyPath}</span>
        </div>
        {/* Log lines */}
        {logLines.map((_, i) => (
          <div key={i} style={{ position: 'absolute', top: 54 + i * lineH, left: 24, width: 1392, height: lineH, overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
            <span style={{ fontSize: 22, color: '#8b949e', fontFamily: 'monospace', marginRight: 16 }}>$</span>
            <span style={{ fontSize: 22, color: lineColors[i], fontFamily: 'monospace', letterSpacing: 0.5 }}>
              {lineVisibilities[i]}
              {i === logLines.length - 1 && (
                <span style={{ opacity: cursorOp, color: '#4ade80' }}>_</span>
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AnimationComponent