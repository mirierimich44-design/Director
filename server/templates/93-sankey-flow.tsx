import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

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
    { id: 0, label: val1, y: 300, h: 120 },
    { id: 1, label: val2, y: 450, h: 160 },
    { id: 2, label: val3, y: 650, h: 100 },
    { id: 3, label: val4, y: 800, h: 140 },
  ], [val1, val2, val3, val4]);

  const titleOp = interpolate(frame, [0, 30], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const flowW = interpolate(frame, [40, 150], [0, 800], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden', backgroundColor: 'BACKGROUND_COLOR' }}>
      <div style={{ position: 'absolute', top: 60, left: 192, fontSize: 40, fontWeight: 'bold', color: 'TEXT_ON_PRIMARY', opacity: titleOp }}>
        {source} <span style={{ color: 'PRIMARY_COLOR' }}>→</span> {target}
      </div>

      <svg style={{ position: 'absolute', top: 180, left: 200, width: 1520, height: 720 }}>
        {flowData.map((item, i) => {
          const op = interpolate(frame, [80 + (i * 20), 120 + (i * 20)], [0, 0.6], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          return (
            <g key={item.id}>
              <path 
                d={`M 0 ${item.y} C 400 ${item.y}, 400 ${item.y + 50}, 800 ${item.y + 50} L 800 ${item.y + 50 + item.h} C 400 ${item.y + 50 + item.h}, 400 ${item.y + item.h}, 0 ${item.y + item.h} Z`}
                fill="PRIMARY_COLOR"
                opacity={op}
                transform={`scale(${flowW / 800}, 1)`}
              />
              <text x={820} y={item.y + item.h / 2} fill="TEXT_ON_PRIMARY" fontSize={24} opacity={op}>
                {item.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default AnimationComponent;