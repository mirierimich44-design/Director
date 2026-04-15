import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, Easing } from 'remotion';

export const AnimationComponent = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const source = 'SOURCE_NAME';
  const target = 'TARGET_NAME';
  const val1 = 'VALUE_1';
  const val2 = 'VALUE_2';
  const val3 = 'VALUE_3';
  const val4 = 'VALUE_4';

  const flowData = useMemo(() => [
    { id: 0, label: val1, y: 150, h: 100, color: 'PRIMARY_COLOR' },
    { id: 1, label: val2, y: 300, h: 140, color: 'ACCENT_COLOR' },
    { id: 2, label: val3, y: 500, h: 80, color: 'SECONDARY_COLOR' },
    { id: 3, label: val4, y: 650, h: 120, color: 'PRIMARY_COLOR' },
  ].filter(f => f.label !== '' && f.label !== 'Placeholder'), [val1, val2, val3, val4]);

  const entryOp = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const flowProgress = interpolate(frame, [25, 120], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.quad) });

  const chartW = 1000;
  const chartX = 300;

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', backgroundColor: 'BACKGROUND_COLOR', fontFamily: 'Inter, system-ui, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      
      {/* 16:9 Safe Container */}
      <div style={{ width: 1600, height: 900, position: 'relative', opacity: entryOp }}>
        
        {/* Source Side Label */}
        <div style={{ position: 'absolute', top: 50, left: 50, textAlign: 'left' }}>
           <div style={{ color: 'PRIMARY_COLOR', fontSize: 14, fontWeight: 900, letterSpacing: 4, marginBottom: 8 }}>SOURCE_NODE</div>
           <div style={{ color: 'PRIMARY_COLOR', fontSize: 32, fontWeight: 900, textTransform: 'uppercase' }}>{source}</div>
        </div>

        {/* Target Side Label */}
        <div style={{ position: 'absolute', top: 50, right: 50, textAlign: 'right' }}>
           <div style={{ color: 'ACCENT_COLOR', fontSize: 14, fontWeight: 900, letterSpacing: 4, marginBottom: 8 }}>TARGET_DESTINATION</div>
           <div style={{ color: 'PRIMARY_COLOR', fontSize: 32, fontWeight: 900, textTransform: 'uppercase' }}>{target}</div>
        </div>

        <svg width={1600} height={900} style={{ position: 'absolute', top: 0, left: 0, overflow: 'visible' }}>
          {flowData.map((item, i) => {
            const op = interpolate(frame, [30 + (i * 10), 60 + (i * 10)], [0, 0.4], { extrapolateLeft: 'clamp' });
            
            // Sankey curve path from X=300 to X=1300
            const x1 = chartX;
            const x2 = chartX + chartW;
            const midX = (x1 + x2) / 2;
            
            const d = `M ${x1} ${item.y} 
                       C ${midX} ${item.y}, ${midX} ${item.y + 100}, ${x2} ${item.y + 100} 
                       L ${x2} ${item.y + 100 + item.h} 
                       C ${midX} ${item.y + 100 + item.h}, ${midX} ${item.y + item.h}, ${x1} ${item.y + item.h} 
                       Z`;

            return (
              <g key={item.id}>
                {/* Animated Flow Path */}
                <path 
                  d={d}
                  fill={item.color}
                  opacity={op * flowProgress}
                  style={{ filter: `drop-shadow(0 0 10px ${item.color})` }}
                />
                
                {/* Flow Value Label - Positioned at the end of the flow */}
                <text 
                   x={x2 + 20} 
                   y={item.y + 100 + item.h/2} 
                   fill="#fff" 
                   fontSize={22} 
                   fontWeight={800} 
                   opacity={op * 2}
                   dominantBaseline="middle"
                >
                  {item.label}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Footer info */}
        <div style={{ position: 'absolute', bottom: 40, left: 0, width: '100%', textAlign: 'center', opacity: 0.3 }}>
           <div style={{ color: 'SUPPORT_COLOR', fontSize: 10, fontFamily: 'monospace', letterSpacing: 2 }}>FLOW_ANALYSIS_NODE // REALTIME_VECT_DATA</div>
        </div>

      </div>
    </div>
  );
};

export default AnimationComponent;