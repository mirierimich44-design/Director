import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

export const AnimationComponent = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const title = 'TITLE_TEXT';
  const headers = ['HEADER_1', 'HEADER_2', 'HEADER_3'];
  const rows = useMemo(() => [
    { label: 'ROW_LABEL_1', val1: 'VAL_1_1', val2: 'VAL_1_2', val3: 'VAL_1_3' },
    { label: 'ROW_LABEL_2', val1: 'VAL_2_1', val2: 'VAL_2_2', val3: 'VAL_2_3' },
    { label: 'ROW_LABEL_3', val1: 'VAL_3_1', val2: 'VAL_3_2', val3: 'VAL_3_3' },
    { label: 'ROW_LABEL_4', val1: 'VAL_4_1', val2: 'VAL_4_2', val3: 'VAL_4_3' },
  ].filter(r => r.label !== '' && r.label !== ' '), []);

  const titleOp = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const tableOp = interpolate(frame, [20, 40], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden', backgroundColor: 'BACKGROUND_COLOR', fontFamily: 'sans-serif' }}>
      <div style={{ position: 'absolute', top: 60, left: 192, fontSize: 40, fontWeight: 'bold', color: 'PRIMARY_COLOR', opacity: titleOp }}>{title}</div>
      
      <div style={{ position: 'absolute', top: 180, left: 192, width: 1536, opacity: tableOp }}>
        <div style={{ display: 'flex', borderBottom: '3px solid PRIMARY_COLOR', paddingBottom: 24, marginBottom: 24 }}>
          <div style={{ width: 400, color: 'SUPPORT_COLOR', fontSize: 22, fontWeight: 600 }}>FEATURE</div>
          {headers.map((h, i) => (
            <div key={i} style={{ flex: 1, color: 'PRIMARY_COLOR', fontSize: 22, fontWeight: 600, textAlign: 'center' }}>{h}</div>
          ))}
        </div>

        {rows.map((row, i) => {
          const rowOp = interpolate(frame, [50 + (i * 20), 80 + (i * 20)], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          const rowTy = interpolate(frame, [50 + (i * 20), 80 + (i * 20)], [30, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          
          return (
            <div key={i} style={{ display: 'flex', padding: '24px 0', borderBottom: '1px solid GRID_LINE', opacity: rowOp, transform: `translateY(${rowTy}px)` }}>
              <div style={{ width: 400, fontSize: 24, color: 'TEXT_ON_PRIMARY' }}>{row.label}</div>
              <div style={{ flex: 1, fontSize: 24, color: 'SECONDARY_COLOR', textAlign: 'center' }}>{row.val1}</div>
              <div style={{ flex: 1, fontSize: 24, color: 'SECONDARY_COLOR', textAlign: 'center' }}>{row.val2}</div>
              <div style={{ flex: 1, fontSize: 24, color: 'SECONDARY_COLOR', textAlign: 'center' }}>{row.val3}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AnimationComponent;