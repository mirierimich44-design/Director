import React, { useMemo } from 'react'
import { useCurrentFrame, interpolate } from 'remotion'

export const AnimationComponent = () => {
  const frame = useCurrentFrame()

  const title = "TITLE_TEXT"
  const keyPath = "KEY_PATH"
  const rawCodeLines = [
    "CODE_LINE_1",
    "CODE_LINE_2",
    "CODE_LINE_3",
    "CODE_LINE_4",
    "CODE_LINE_5",
    "CODE_LINE_6",
    "CODE_LINE_7",
    "CODE_LINE_8",
  ]

  const codeLines = useMemo(() => {
    return rawCodeLines.filter(line => line !== '' && line !== 'Placeholder')
  }, [rawCodeLines])

  const lineCount = codeLines.length
  const highlightLineIndex = 4 // Note: This index might need adjustment if the target line is filtered out

  const titleOp = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const titleTy = interpolate(frame, [0, 20], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  const panelOp = interpolate(frame, [10, 28], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const panelTy = interpolate(frame, [10, 28], [30, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  const lineOpacities = codeLines.map((_, i) => interpolate(frame, [22 + i * 6, 34 + i * 6], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }))
  const lineTx = codeLines.map((_, i) => interpolate(frame, [22 + i * 6, 34 + i * 6], [-20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }))

  const highlightOp = interpolate(frame, [70, 82], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  const lineHeight = 62

  const lineNumberColor = '#555555'

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
          fontSize: 26,
          fontWeight: 700,
          color: 'PRIMARY_COLOR',
          letterSpacing: 5,
          textTransform: 'uppercase',
          fontFamily: 'sans-serif',
        }}>
          {title}
        </span>
      </div>

      <div style={{
        position: 'absolute',
        top: 148,
        left: 240,
        width: 1440,
        height: 44,
        overflow: 'hidden',
        backgroundColor: 'PANEL_LEFT_BG',
        borderRadius: '6px 6px 0 0',
        boxSizing: 'border-box',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        opacity: panelOp,
      }}>
        <span style={{
          fontSize: 18,
          fontWeight: 500,
          color: 'ACCENT_COLOR',
          fontFamily: 'monospace',
          letterSpacing: 1,
        }}>
          {keyPath}
        </span>
      </div>

      <div style={{
        position: 'absolute',
        top: 192,
        left: 240,
        width: 1440,
        height: lineHeight * lineCount + 48,
        overflow: 'hidden',
        backgroundColor: 'CHART_BG',
        borderRadius: '0 0 6px 6px',
        boxSizing: 'border-box',
        opacity: panelOp,
        transform: `translateY(${panelTy}px)`,
      }}>

        {highlightLineIndex < lineCount && (
          <div style={{
            position: 'absolute',
            top: 24 + highlightLineIndex * lineHeight,
            left: 0,
            width: 1440,
            height: lineHeight,
            overflow: 'hidden',
            backgroundColor: 'PRIMARY_COLOR',
            opacity: highlightOp * 0.18,
          }} />
        )}

        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: 72,
          height: lineHeight * lineCount + 48,
          overflow: 'hidden',
          backgroundColor: 'PANEL_LEFT_BG',
        }} />

        {codeLines.map((line, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: 24 + i * lineHeight,
              left: 0,
              width: 1440,
              height: lineHeight,
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              opacity: lineOpacities[i],
              transform: `translateX(${lineTx[i]}px)`,
            }}
          >
            <span style={{
              width: 72,
              textAlign: 'center',
              fontSize: 18,
              fontWeight: 400,
              color: lineNumberColor,
              fontFamily: 'monospace',
              flexShrink: 0,
            }}>
              {i + 1}
            </span>
            <span style={{
              fontSize: 22,
              fontWeight: i === highlightLineIndex ? 700 : 400,
              color: i === highlightLineIndex ? 'ACCENT_COLOR' : 'TEXT_ON_SECONDARY',
              fontFamily: 'monospace',
              letterSpacing: 0.5,
              paddingLeft: 24,
            }}>
              {line}
            </span>
          </div>
        ))}

      </div>

      {highlightLineIndex < lineCount && (
        <div style={{
          position: 'absolute',
          top: 192 + 24 + highlightLineIndex * lineHeight + lineHeight + 16,
          left: 240,
          width: 1440,
          height: 50,
          overflow: 'hidden',
          opacity: highlightOp,
          display: 'flex',
          alignItems: 'center',
          gap: 16,
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: 4,
            height: 50,
            overflow: 'hidden',
            backgroundColor: 'ACCENT_COLOR',
          }} />
          <span style={{
            fontSize: 20,
            fontWeight: 600,
            color: 'SUPPORT_COLOR',
            fontFamily: 'monospace',
            paddingLeft: 24,
          }}>
            KEY_VALUE
          </span>
        </div>
      )}

    </div>
  )
}

export default AnimationComponent