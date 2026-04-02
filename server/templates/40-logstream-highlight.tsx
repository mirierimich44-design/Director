import React, { useMemo } from 'react'
import { useCurrentFrame, interpolate } from 'remotion'

export const AnimationComponent = () => {
  const frame = useCurrentFrame()

  const title = "TITLE_TEXT"
  const keyPath = "KEY_PATH"
  const rawLogLines = ["LOG_LINE_1", "LOG_LINE_2", "LOG_LINE_3", "LOG_LINE_4", "LOG_LINE_5", "LOG_LINE_6"]
  const keyValue = "KEY_VALUE"

  const logLines = useMemo(() => {
    return rawLogLines.filter((line) => line !== '' && line !== 'Placeholder')
  }, [rawLogLines])

  const lineCount = logLines.length
  const lineH = 62
  const highlightIndex = 3

  const titleOp = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const titleTy = interpolate(frame, [0, 20], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const barW = interpolate(frame, [10, 40], [0, 1920], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const panelOp = interpolate(frame, [12, 26], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const panelTy = interpolate(frame, [12, 26], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  const lineOpacities = logLines.map((_, i) => 
    interpolate(frame, [22 + i * 8, 34 + i * 8], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  )
  const highlightOp = interpolate(frame, [68, 82], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  const levelColors: Record<string, string> = { INFO: '#4ade80', WARN: '#facc15', ERROR: '#f87171', CRIT: '#f87171' }
  const getLevel = (line: string) => {
    if (line.includes('ERROR') || line.includes('CRIT')) return 'ERROR'
    if (line.includes('WARN')) return 'WARN'
    return 'INFO'
  }

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden', backgroundColor: 'BACKGROUND_COLOR' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 5, overflow: 'hidden', backgroundColor: 'PRIMARY_COLOR', opacity: titleOp }} />
      <div style={{ position: 'absolute', top: 1074, left: 0, width: barW, height: 6, overflow: 'hidden', backgroundColor: 'PRIMARY_COLOR' }} />
      <div style={{ position: 'absolute', top: 60, left: 0, width: 1920, height: 60, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: titleOp, transform: `translateY(${titleTy}px)` }}>
        <span style={{ fontSize: 26, fontWeight: 700, color: 'PRIMARY_COLOR', letterSpacing: 5, textTransform: 'uppercase', fontFamily: 'sans-serif' }}>{title}</span>
      </div>
      <div style={{ position: 'absolute', top: 148, left: 240, width: 1440, height: 44, overflow: 'hidden', backgroundColor: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px 16px 0 0', display: 'flex', alignItems: 'center', boxSizing: 'border-box', padding: '0 24px', opacity: panelOp }}>
        <span style={{ fontSize: 18, fontWeight: 500, color: 'ACCENT_COLOR', fontFamily: 'monospace', letterSpacing: 1 }}>{keyPath}</span>
      </div>
      <div style={{ position: 'absolute', top: 192, left: 240, width: 1440, height: lineH * lineCount + 48, overflow: 'hidden', backgroundColor: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0 0 16px 16px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', opacity: panelOp, transform: `translateY(${panelTy}px)` }}>
        {highlightIndex < lineCount && (
          <div style={{ position: 'absolute', top: 24 + highlightIndex * lineH, left: 0, width: 1440, height: lineH, overflow: 'hidden', backgroundColor: 'SECONDARY_COLOR', opacity: highlightOp * 0.15 }} />
        )}
        {logLines.map((line, i) => {
          const level = getLevel(line)
          const levelColor = levelColors[level] || '#4ade80'
          return (
            <div key={i} style={{ position: 'absolute', top: 24 + i * lineH, left: 0, width: 1440, height: lineH, overflow: 'hidden', display: 'flex', alignItems: 'center', opacity: lineOpacities[i] }}>
              <span style={{ width: 100, textAlign: 'center', fontSize: 16, fontWeight: 700, color: levelColor, fontFamily: 'monospace', flexShrink: 0 }}>{level}</span>
              <span style={{ fontSize: 20, color: i === highlightIndex ? 'ACCENT_COLOR' : 'TEXT_ON_SECONDARY', fontFamily: 'monospace', fontWeight: i === highlightIndex ? 700 : 400, paddingLeft: 16 }}>{line}</span>
            </div>
          )
        })}
      </div>
      <div style={{ position: 'absolute', top: 192 + 24 + (highlightIndex < lineCount ? highlightIndex * lineH + lineH + 16 : 0), left: 240, width: 1440, height: 50, overflow: 'hidden', opacity: highlightOp, display: 'flex', alignItems: 'center' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: 4, height: 50, overflow: 'hidden', backgroundColor: 'ACCENT_COLOR' }} />
        <span style={{ fontSize: 20, fontWeight: 600, color: 'SUPPORT_COLOR', fontFamily: 'monospace', paddingLeft: 24 }}>{keyValue}</span>
      </div>
    </div>
  )
}

export default AnimationComponent