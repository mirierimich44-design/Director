import React, { useMemo } from 'react'
import { useCurrentFrame, interpolate, Easing } from 'remotion'

// Template: 185-doc-line-diff
// Purpose: Before/after document showing a single highlighted line insertion or change
// Fields: TITLE_TEXT, DOC_TITLE, CONTEXT_LINE_1..3 (surrounding unchanged lines),
//         REMOVED_LINE (shown struck in BEFORE), ADDED_LINE (shown highlighted in AFTER),
//         CHANGE_LABEL (e.g. "ONE LINE ADDED"), FILE_PATH

export const AnimationComponent = () => {
  const frame = useCurrentFrame()

  const title        = 'TITLE_TEXT'
  const docTitle     = 'DOC_TITLE'
  const filePath     = 'FILE_PATH'
  const changeLabel  = 'CHANGE_LABEL'

  // Surrounding unchanged context lines
  const rawContext = ['CONTEXT_LINE_1', 'CONTEXT_LINE_2', 'CONTEXT_LINE_3']

  // The changed line
  const removedLine = 'REMOVED_LINE'    // empty string = pure insertion (no removal)
  const addedLine   = 'ADDED_LINE'

  const contextLines = useMemo(() =>
    rawContext.filter(l => l !== '' && l !== 'Placeholder'),
  [])

  const hasRemoved = removedLine !== '' && removedLine !== 'Placeholder'

  // ── Animations ────────────────────────────────────────────────────
  const headerOp   = interpolate(frame, [0, 18], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const headerTy   = interpolate(frame, [0, 18], [-16, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  // BEFORE panel slides in from left
  const beforeOp   = interpolate(frame, [10, 30], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const beforeTx   = interpolate(frame, [10, 30], [-30, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.quad) })

  // AFTER panel slides in from right
  const afterOp    = interpolate(frame, [18, 38], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const afterTx    = interpolate(frame, [18, 38], [30, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.quad) })

  // The highlight row flashes in with a glow
  const highlightOp = interpolate(frame, [38, 52], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.back(1.2)) })
  const highlightGlow = interpolate(frame, [52, 90], [1, 0.4], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  // Change badge
  const badgeOp    = interpolate(frame, [52, 66], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.back(1.3)) })
  const badgeScale = interpolate(frame, [52, 66], [0.7, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.back(1.3)) })

  // Arrow between panels
  const arrowOp    = interpolate(frame, [30, 42], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  // ── Styles ────────────────────────────────────────────────────────
  const panelW   = 660
  const panelX_L = 80
  const panelX_R = 860
  const panelY   = 160
  const panelH   = 580
  const lineH    = 44
  const monoFont = 'monospace, Courier New'

  const codeLineStyle = (highlight: 'none' | 'remove' | 'add'): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    height: lineH,
    paddingLeft: 20,
    paddingRight: 16,
    backgroundColor:
      highlight === 'remove' ? 'rgba(220,50,50,0.14)' :
      highlight === 'add'    ? 'rgba(50,220,100,0.12)' :
      'transparent',
    borderLeft: highlight === 'remove' ? '3px solid rgba(220,50,50,0.8)' :
                highlight === 'add'    ? '3px solid rgba(50,220,100,0.8)' :
                '3px solid transparent',
    fontFamily: monoFont,
    fontSize: 14,
    color: highlight === 'remove' ? 'rgba(255,100,100,0.9)' :
           highlight === 'add'    ? 'rgba(100,230,130,0.95)' :
           'PRIMARY_COLOR',
    opacity: highlight === 'none' ? 0.55 : 1,
  })

  const gutter = (n: number, highlight: 'none' | 'remove' | 'add') => (
    <span style={{
      width: 32, textAlign: 'right', marginRight: 16, flexShrink: 0,
      fontFamily: monoFont, fontSize: 12,
      color: highlight === 'none' ? 'CHART_BORDER' : highlight === 'remove' ? 'rgba(220,80,80,0.6)' : 'rgba(80,200,100,0.6)',
      userSelect: 'none',
    }}>{n}</span>
  )

  const diffPrefix = (type: 'remove' | 'add' | 'none') => (
    <span style={{
      width: 14, flexShrink: 0, textAlign: 'center',
      color: type === 'remove' ? 'rgba(220,80,80,0.9)' : type === 'add' ? 'rgba(80,200,100,0.9)' : 'transparent',
      fontWeight: 900,
    }}>
      {type === 'remove' ? '−' : type === 'add' ? '+' : ' '}
    </span>
  )

  const lineNumbers = contextLines.map((_, i) => i + 1)
  const removedLineNum  = contextLines.length + 1
  const addedLineNum    = removedLineNum

  const panelHeader = (label: string, color: string) => (
    <div style={{
      height: 44,
      display: 'flex', alignItems: 'center', paddingLeft: 20,
      backgroundColor: 'PANEL_RIGHT_BG',
      borderBottom: `1px solid CHART_BORDER`,
      gap: 10,
    }}>
      <div style={{
        width: 10, height: 10, borderRadius: '50%',
        backgroundColor: color,
        boxShadow: `0 0 8px ${color}`,
      }} />
      <span style={{ fontSize: 11, fontWeight: 800, color: 'PRIMARY_COLOR', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.25em' }}>
        {label}
      </span>
      <span style={{ marginLeft: 'auto', marginRight: 16, fontSize: 11, color: 'PRIMARY_COLOR', opacity: 0.35, fontFamily: monoFont }}>
        {filePath}
      </span>
    </div>
  )

  return (
    <div style={{
      position: 'absolute', inset: 0, overflow: 'hidden',
      backgroundColor: 'BACKGROUND_COLOR',
      fontFamily: 'Inter, system-ui, sans-serif',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{ width: 1600, height: 900, position: 'relative' }}>

        {/* Header */}
        <div style={{
          position: 'absolute', top: 38, left: 0, width: '100%', textAlign: 'center',
          opacity: headerOp, transform: `translateY(${headerTy}px)`,
        }}>
          <div style={{ fontSize: 11, fontWeight: 900, color: 'ACCENT_COLOR', letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: 8 }}>
            FILE DIFF
          </div>
          <div style={{ fontSize: 34, fontWeight: 900, color: 'PRIMARY_COLOR', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {title}
          </div>
          <div style={{ width: 60, height: 3, backgroundColor: 'ACCENT_COLOR', margin: '10px auto 0', borderRadius: 2 }} />
        </div>

        {/* BEFORE panel */}
        <div style={{
          position: 'absolute', top: panelY, left: panelX_L, width: panelW,
          opacity: beforeOp, transform: `translateX(${beforeTx}px)`,
        }}>
          <div style={{
            backgroundColor: 'PANEL_RIGHT_BG',
            border: '1px solid CHART_BORDER',
            borderRadius: 12,
            overflow: 'hidden',
          }}>
            {panelHeader('BEFORE', 'rgba(220,80,80,0.8)')}

            {/* Doc title row */}
            <div style={{ padding: '10px 20px', borderBottom: '1px solid CHART_BORDER' }}>
              <span style={{ fontSize: 12, color: 'PRIMARY_COLOR', opacity: 0.4, fontFamily: monoFont }}>{docTitle}</span>
            </div>

            {/* Context lines */}
            {contextLines.map((line, i) => (
              <div key={i} style={codeLineStyle('none')}>
                {gutter(lineNumbers[i], 'none')}
                {diffPrefix('none')}
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{line}</span>
              </div>
            ))}

            {/* Removed line */}
            {hasRemoved && (
              <div style={{ ...codeLineStyle('remove'), opacity: 1 }}>
                {gutter(removedLineNum, 'remove')}
                {diffPrefix('remove')}
                <span style={{ textDecoration: 'line-through', opacity: 0.75, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{removedLine}</span>
              </div>
            )}
          </div>
        </div>

        {/* Arrow */}
        <div style={{
          position: 'absolute',
          top: panelY + panelH / 2,
          left: panelX_L + panelW + 10,
          width: panelX_R - (panelX_L + panelW) - 20,
          display: 'flex', alignItems: 'center',
          opacity: arrowOp,
        }}>
          <div style={{ flex: 1, height: 2, backgroundColor: 'ACCENT_COLOR' }} />
          <div style={{
            width: 0, height: 0,
            borderTop: '8px solid transparent',
            borderBottom: '8px solid transparent',
            borderLeft: '12px solid ACCENT_COLOR',
          }} />
        </div>

        {/* AFTER panel */}
        <div style={{
          position: 'absolute', top: panelY, left: panelX_R, width: panelW,
          opacity: afterOp, transform: `translateX(${afterTx}px)`,
        }}>
          <div style={{
            backgroundColor: 'PANEL_RIGHT_BG',
            border: '1px solid CHART_BORDER',
            borderRadius: 12,
            overflow: 'hidden',
          }}>
            {panelHeader('AFTER', 'rgba(80,200,100,0.8)')}

            {/* Doc title row */}
            <div style={{ padding: '10px 20px', borderBottom: '1px solid CHART_BORDER' }}>
              <span style={{ fontSize: 12, color: 'PRIMARY_COLOR', opacity: 0.4, fontFamily: monoFont }}>{docTitle}</span>
            </div>

            {/* Context lines */}
            {contextLines.map((line, i) => (
              <div key={i} style={codeLineStyle('none')}>
                {gutter(lineNumbers[i], 'none')}
                {diffPrefix('none')}
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{line}</span>
              </div>
            ))}

            {/* Added line — highlighted with glow */}
            <div style={{
              ...codeLineStyle('add'),
              opacity: highlightOp,
              boxShadow: `0 0 ${20 * highlightGlow}px rgba(50,220,100,0.3)`,
            }}>
              {gutter(addedLineNum, 'add')}
              {diffPrefix('add')}
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 700 }}>{addedLine}</span>
            </div>
          </div>
        </div>

        {/* Change badge */}
        <div style={{
          position: 'absolute',
          bottom: 80,
          left: '50%',
          transform: `translateX(-50%) scale(${badgeScale})`,
          opacity: badgeOp,
          textAlign: 'center',
        }}>
          <div style={{
            backgroundColor: 'rgba(50,220,100,0.12)',
            border: '1px solid rgba(50,220,100,0.6)',
            borderRadius: 8,
            padding: '10px 28px',
            display: 'inline-block',
          }}>
            <div style={{ fontSize: 10, color: 'rgba(80,220,110,0.8)', fontWeight: 900, letterSpacing: '0.35em', textTransform: 'uppercase', marginBottom: 4 }}>
              CHANGE
            </div>
            <div style={{ fontSize: 20, fontWeight: 900, color: 'rgba(100,230,130,1)', fontFamily: monoFont }}>
              {changeLabel}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ position: 'absolute', bottom: 36, left: 0, width: '100%', textAlign: 'center', opacity: 0.28 }}>
          <div style={{ fontSize: 10, color: 'PRIMARY_COLOR', fontFamily: 'monospace', letterSpacing: '0.25em' }}>
            FILE_DIFF_ANALYSIS // MANIFEST_INTEGRITY_CHECK
          </div>
        </div>

      </div>
    </div>
  )
}

export default AnimationComponent
