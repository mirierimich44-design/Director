import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

export const AnimationComponent = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const TITLE = 'TITLE_TEXT';
  const principalLabel = 'PRINCIPAL_LABEL';
  const interestLabel = 'INTEREST_LABEL';
  const STAT_1 = 'STAT_VALUE_1';
  const STAT_2 = 'STAT_VALUE_2';

  const chartWidth = 1400;
  const chartHeight = 600;
  const chartX = 260;
  const chartY = 300;

  const progress = interpolate(frame, [30, 200], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const titleOp = interpolate(frame, [0, 30], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const labelOp = interpolate(frame, [180, 220], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden', backgroundColor: 'BACKGROUND_COLOR' }}>
      <div style={{ position: 'absolute', top: 80, left: 260, color: 'TEXT_ON_PRIMARY', fontSize: 40, fontWeight: 'bold', opacity: titleOp, letterSpacing: '2px' }}>{TITLE}</div>
      
      <svg style={{ position: 'absolute', top: chartY, left: chartX, width: chartWidth, height: chartHeight }}>
        <defs>
          <linearGradient id="grad1" x1="0" x2="0" y1="1" y2="0">
            <stop offset="0%" stopColor="PRIMARY_COLOR" stopOpacity="0.6" />
            <stop offset="100%" stopColor="PRIMARY_COLOR" stopOpacity="0.2" />
          </linearGradient>
        </defs>
        <path 
          d={`M 0 ${chartHeight} Q ${chartWidth * 0.5} ${chartHeight * 0.9} ${chartWidth} ${chartHeight * 0.1} L ${chartWidth} ${chartHeight} Z`}
          fill="url(#grad1)"
          stroke="PRIMARY_COLOR"
          strokeWidth={4}
          strokeDasharray={chartWidth * 2}
          strokeDashoffset={chartWidth * 2 * (1 - progress)}
        />
      </svg>

      <div style={{ position: 'absolute', top: 400, left: 1400, opacity: labelOp }}>
        <div style={{ color: 'PRIMARY_COLOR', fontSize: 64, fontWeight: 'bold', fontFamily: 'monospace' }}>{STAT_1}</div>
        <div style={{ color: 'TEXT_ON_PRIMARY', fontSize: 20, fontWeight: '600' }}>{principalLabel}</div>
      </div>

      <div style={{ position: 'absolute', top: 200, left: 1400, opacity: labelOp }}>
        <div style={{ color: 'ACCENT_COLOR', fontSize: 64, fontWeight: 'bold', fontFamily: 'monospace' }}>{STAT_2}</div>
        <div style={{ color: 'TEXT_ON_PRIMARY', fontSize: 20, fontWeight: '600' }}>{interestLabel}</div>
      </div>
    </div>
  );
};

export default AnimationComponent;