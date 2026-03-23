import React, { useMemo } from 'react'
import { useCurrentFrame, interpolate } from 'remotion'

export const AnimationComponent = () => {
  const frame = useCurrentFrame()

  const title = "TITLE_TEXT"
  const keyPath = "KEY_PATH"
  const keyValue = "KEY_VALUE"
  const rawLogLines = ["LOG_LINE_1", "LOG_LINE_2", "LOG_LINE_3", "LOG_LINE_4"]

  const logLines = useMemo(() => {
    return rawLogLines.filter(line => line !== '' && line !== 'Placeholder')
  }, [rawLogLines])

  const titleOp = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const titleTy = interpolate(frame, [0, 20], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const barW = interpolate(frame, [10, 40], [0, 1920], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const panelOp = interpolate(frame, [12, 28], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  const lineH = 70
  const highlightIndex = 3
  
  // Generate opacities based on filtered length
  const lineOpacities = logLines.map((_, i) => {
    const start = 22 + (i * 10)
    return interpolate(frame, [start, start + 14], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  })
  
  const highlightOp = interpolate(frame, [65, 80], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden', backgroundColor: 'BACKGROUND_COLOR' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 5, overflow: 'hidden', backgroundColor: 'PRIMARY_COLOR', opacity: titleOp }} />
      <div style={{ position: 'absolute', top: 1074, left: 0, width: barW, height: 6, overflow: 'hidden', backgroundColor: 'PRIMARY_COLOR' }} />
      <div style={{ position: 'absolute', top: 60, left: 0, width: 1920, height: 60, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: titleOp, transform: `translateY(${titleTy}px)` }}>
        <span style={{ fontSize: 26, fontWeight: 700, color: 'PRIMARY_COLOR', letterSpacing: 5, textTransform: 'uppercase', fontFamily: 'sans-serif' }}>{title}</span>
      </div>
      <div style={{ position: 'absolute', top: 160, left: 240, width: 1440, height: 52, overflow: 'hidden', backgroundColor: 'PRIMARY_COLOR', borderRadius: '6px 6px 0 0', display: 'flex', alignItems: 'center', boxSizing: 'border-box', padding: '0 28px', opacity: panelOp }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'TEXT_ON_PRIMARY', fontFamily: 'monospace', letterSpacing: 1, opacity: 0.6, marginRight: 16 }}>HKEY</span>
        <span style={{ fontSize: 18, fontWeight: 600, color: 'ACCENT_COLOR', fontFamily: 'monospace', letterSpacing: 1 }}>{keyPath}</span>
      </div>
      <div style={{ position: 'absolute', top: 212, left: 240, width: 1440, height: Math.max(lineH * logLines.length + 60, 60), overflow: 'hidden', backgroundColor: '#0d1117', borderRadius: '0 0 6px 6px', opacity: panelOp }}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: 1440, height: 44, overflow: 'hidden', backgroundColor: '#161b22', display: 'flex', alignItems: 'center', boxSizing: 'border-box', padding: '0 24px' }}>
          <span style={{ fontSize: 14, color: '#8b949e', fontFamily: 'monospace', width: 300 }}>Name</span>
          <span style={{ fontSize: 14, color: '#8b949e', fontFamily: 'monospace', width: 200 }}>Type</span>
          <span style={{ fontSize: 14, color: '#8b949e', fontFamily: 'monospace' }}>Data</span>
        </div>
        {highlightIndex < logLines.length && (
          <div style={{ position: 'absolute', top: 44 + highlightIndex * lineH, left: 0, width: 1440, height: lineH, overflow: 'hidden', backgroundColor: '#f87171', opacity: highlightOp * 0.12 }} />
        )}
        {logLines.map((line, i) => (
          <div key={i} style={{ position: 'absolute', top: 44 + i * lineH, left: 0, width: 1440, height: lineH, overflow: 'hidden', display: 'flex', alignItems: 'center', opacity: lineOpacities[i], boxSizing: 'border-box', padding: '0 24px' }}>
            <span style={{ fontSize: 20, color: i === highlightIndex ? '#f87171' : '#4ade80', fontFamily: 'monospace', width: 300 }}>{line}</span>
            <span style={{ fontSize: 18, color: '#8b949e', fontFamily: 'monospace', width: 200 }}>REG_SZ</span>
            <span style={{ fontSize: 18, color: i === highlightIndex ? '#facc15' : '#8b949e', fontFamily: 'monospace', fontWeight: i === highlightIndex ? 700 : 400 }}>{i === highlightIndex ? keyValue : '...'}</span>
          </div>
        ))}
      </div>
      {highlightIndex < logLines.length && (
        <div style={{ position: 'absolute', top: 212 + 44 + highlightIndex * lineH + lineH + 16, left: 240, width: 1440, height: 50, overflow: 'hidden', opacity: highlightOp, display: 'flex', alignItems: 'center' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: 4, height: 50, overflow: 'hidden', backgroundColor: '#f87171' }} />
          <span style={{ fontSize: 20, fontWeight: 600, color: 'SUPPORT_COLOR', fontFamily: 'monospace', paddingLeft: 24 }}>{keyValue}</span>
        </div>
      )}
    </div>
  )
}

export default AnimationComponent