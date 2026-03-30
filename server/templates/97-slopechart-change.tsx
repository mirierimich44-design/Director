import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

export const AnimationComponent = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const items = useMemo(() => [
    { label: 'LABEL_1', val1: 'VAL_1_START', val2: 'VAL_1_END' },
    { label: 'LABEL_2', val1: 'VAL_2_START', val2: 'VAL_2_END' },
    { label: 'LABEL_3', val1: 'VAL_3_START', val2: 'VAL_3_END' },
    { label: 'LABEL_4', val1: 'VAL_4_START', val2: 'VAL_4_END' }
  ].filter(i => i.label !== '' && i.label !== ' '), []);

  const title = 'TITLE_TEXT';
  const axis1 = 'AXIS_LEFT';
  const axis2 = 'AXIS_RIGHT';

  const containerOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden', backgroundColor: 'BACKGROUND_COLOR', opacity: containerOpacity }}>
      <div style={{ position: 'absolute', top: 60, left: 192, width: 1536, height: 100, color: 'TEXT_ON_PRIMARY', fontSize: 40, fontWeight: 'bold', letterSpacing: '2px' }}>{title}</div>
      
      <div style={{ position: 'absolute', top: 180, left: 300, width: 200, height: 720, display: 'flex', flexDirection: 'column', justifyContent: 'space-around' }}>
        <div style={{ fontSize: 22, color: 'SUPPORT_COLOR', fontWeight: '600' }}>{axis1}</div>
        {items.map((item, i) => (
          <div key={i} style={{ height: 100, display: 'flex', alignItems: 'center', color: 'TEXT_ON_PRIMARY', fontSize: 24, fontWeight: 'bold' }}>{item.val1}</div>
        ))}
      </div>

      <div style={{ position: 'absolute', top: 180, left: 1420, width: 200, height: 720, display: 'flex', flexDirection: 'column', justifyContent: 'space-around' }}>
        <div style={{ fontSize: 22, color: 'SUPPORT_COLOR', fontWeight: '600' }}>{axis2}</div>
        {items.map((item, i) => (
          <div key={i} style={{ height: 100, display: 'flex', alignItems: 'center', color: 'TEXT_ON_PRIMARY', fontSize: 24, fontWeight: 'bold' }}>{item.val2}</div>
        ))}
      </div>

      <svg style={{ position: 'absolute', top: 180, left: 500, width: 920, height: 720 }}>
        {items.map((item, i) => {
          const lineOp = interpolate(frame, [60 + (i * 20), 90 + (i * 20)], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          return (
            <g key={i} style={{ opacity: lineOp }}>
              <line x1={0} y1={100 + (i * 150)} x2={920} y2={100 + (i * 150)} stroke='PRIMARY_COLOR' strokeWidth={4} />
              <text x={460} y={80 + (i * 150)} fill='TEXT_ON_PRIMARY' fontSize={18} textAnchor='middle'>{item.label}</text>
            </g>
          );
        })}
      </svg>

      <div style={{ position: 'absolute', top: 940, left: 192, width: 1536, height: 80, color: 'SUPPORT_COLOR', fontSize: 16 }}>SOURCE_TEXT</div>
    </div>
  );
};

export default AnimationComponent;