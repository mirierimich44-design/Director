import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

export const AnimationComponent = () => {
  const frame = useCurrentFrame();

  const title   = 'TITLE_TEXT';
  const headers = ['HEADER_1', 'HEADER_2', 'HEADER_3'];

  const isPlaceholder = (s: string) => !s || s.trim() === '' || s.trim() === ' ' || /^[A-Z][A-Z0-9_]*$/.test(s.trim());

  const allRows = [
    { label: 'ROW_LABEL_1', val1: 'VAL_1_1', val2: 'VAL_1_2', val3: 'VAL_1_3' },
    { label: 'ROW_LABEL_2', val1: 'VAL_2_1', val2: 'VAL_2_2', val3: 'VAL_2_3' },
    { label: 'ROW_LABEL_3', val1: 'VAL_3_1', val2: 'VAL_3_2', val3: 'VAL_3_3' },
    { label: 'ROW_LABEL_4', val1: 'VAL_4_1', val2: 'VAL_4_2', val3: 'VAL_4_3' },
  ];

  const rows = useMemo(() =>
    allRows.filter(r =>
      !isPlaceholder(r.label) &&
      !(isPlaceholder(r.val1) && isPlaceholder(r.val2) && isPlaceholder(r.val3))
    ),
  []);

  const titleOp = interpolate(frame, [0, 20],  [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const tableOp = interpolate(frame, [20, 40], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden', backgroundColor: 'BACKGROUND_COLOR', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{ position: 'absolute', top: 60, left: 192, fontSize: 52, fontWeight: 900, color: 'PRIMARY_COLOR', opacity: titleOp }}>
        {title}
      </div>

      <div style={{
        position: 'absolute', top: 170, left: 192, width: 1536, opacity: tableOp,
        backgroundColor: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.12)', borderRadius: 24,
        boxShadow: '0 20px 50px rgba(0,0,0,0.5)', padding: '32px 48px',
        boxSizing: 'border-box'
      }}>
        {/* Header row */}
        <div style={{ display: 'flex', borderBottom: '3px solid PRIMARY_COLOR', paddingBottom: 20, marginBottom: 20 }}>
          <div style={{ width: 420, color: 'SUPPORT_COLOR', fontSize: 26, fontWeight: 700, letterSpacing: 1 }}>FEATURE</div>
          {headers.map((h, i) => (
            <div key={i} style={{ flex: 1, color: 'PRIMARY_COLOR', fontSize: 26, fontWeight: 700, textAlign: 'center' }}>{h}</div>
          ))}
        </div>

        {rows.map((row, i) => {
          const rowOp = interpolate(frame, [50 + i * 20, 80 + i * 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          const rowTy = interpolate(frame, [50 + i * 20, 80 + i * 20], [24, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

          return (
            <div key={i} style={{
              display: 'flex', padding: '22px 0',
              borderBottom: i < rows.length - 1 ? '2px solid rgba(255,255,255,0.08)' : 'none',
              opacity: rowOp, transform: `translateY(${rowTy}px)`
            }}>
              <div style={{ width: 420, fontSize: 28, fontWeight: 700, color: 'TEXT_ON_PRIMARY' }}>{row.label}</div>
              <div style={{ flex: 1, fontSize: 28, fontWeight: 600, color: 'SECONDARY_COLOR', textAlign: 'center' }}>
                {isPlaceholder(row.val1) ? '—' : row.val1}
              </div>
              <div style={{ flex: 1, fontSize: 28, fontWeight: 600, color: 'SECONDARY_COLOR', textAlign: 'center' }}>
                {isPlaceholder(row.val2) ? '—' : row.val2}
              </div>
              <div style={{ flex: 1, fontSize: 28, fontWeight: 600, color: 'SECONDARY_COLOR', textAlign: 'center' }}>
                {isPlaceholder(row.val3) ? '—' : row.val3}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AnimationComponent;
