import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

export const AnimationComponent = () => {
  const frame = useCurrentFrame();

  const title = 'TITLE_TEXT';
  const labelFixed    = 'FIXED_COSTS_LABEL';
  const labelVariable = 'VARIABLE_COSTS_LABEL';
  const labelRevenue  = 'REVENUE_LABEL';
  const breakEvenLabel = 'BREAK_EVEN_LABEL';

  const chartLeft   = 200;
  const chartWidth  = 1480;
  const chartTop    = 220;
  const chartHeight = 660;

  const lineOpacity   = interpolate(frame, [0, 30],   [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const fixedLineDraw = interpolate(frame, [30, 90],  [0, chartWidth], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const varLineDraw   = interpolate(frame, [60, 120], [0, chartWidth], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const revLineDraw   = interpolate(frame, [90, 150], [0, chartWidth], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const calloutOp     = interpolate(frame, [160, 190], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Y-axis tick values (0% to 100% in steps of 25%)
  const yTicks = [0, 25, 50, 75, 100];

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden', backgroundColor: 'BACKGROUND_COLOR', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{ position: 'absolute', top: 60, left: chartLeft, fontSize: 52, fontWeight: 900, color: 'TEXT_ON_PRIMARY', opacity: lineOpacity, letterSpacing: '-0.01em' }}>
        {title}
      </div>

      <svg style={{ position: 'absolute', top: chartTop, left: chartLeft, width: chartWidth + 80, height: chartHeight + 80 }}>
        {/* Axes */}
        <line x1={0} y1={chartHeight} x2={chartWidth} y2={chartHeight} stroke="GRID_LINE" strokeWidth={3} opacity={lineOpacity} />
        <line x1={0} y1={0}          x2={0}           y2={chartHeight} stroke="GRID_LINE" strokeWidth={3} opacity={lineOpacity} />

        {/* Y-axis ticks and horizontal grid lines */}
        {yTicks.map((pct, i) => {
          const y = chartHeight - (pct / 100) * chartHeight;
          return (
            <g key={i} opacity={lineOpacity}>
              <line x1={-8} y1={y} x2={chartWidth} y2={y} stroke="GRID_LINE" strokeWidth={1} strokeDasharray="8 5" opacity={0.3} />
              <text x={-14} y={y + 6} fill="TEXT_ON_PRIMARY" fontSize={24} fontWeight="600" textAnchor="end" opacity={0.7}>{pct}%</text>
            </g>
          );
        })}

        {/* Fixed Costs — horizontal dashed line */}
        <line
          x1={0} y1={chartHeight - 150}
          x2={fixedLineDraw} y2={chartHeight - 150}
          stroke="SUPPORT_COLOR" strokeWidth={8} strokeDasharray="14 7"
          opacity={lineOpacity}
        />

        {/* Variable Costs — rising diagonal */}
        <line
          x1={0} y1={chartHeight}
          x2={varLineDraw} y2={chartHeight - 400}
          stroke="SECONDARY_COLOR" strokeWidth={8}
          opacity={lineOpacity}
        />

        {/* Revenue — steeper diagonal */}
        <line
          x1={0} y1={chartHeight}
          x2={revLineDraw} y2={chartHeight - 600}
          stroke="PRIMARY_COLOR" strokeWidth={8}
          opacity={lineOpacity}
        />

        {/* Break-even dot */}
        <circle cx={chartWidth * 0.5} cy={chartHeight - 300} r={16} fill="ACCENT_COLOR" opacity={calloutOp} />
        <circle cx={chartWidth * 0.5} cy={chartHeight - 300} r={28} fill="ACCENT_COLOR" opacity={calloutOp * 0.25} />
      </svg>

      {/* Line labels */}
      <div style={{ position: 'absolute', top: chartTop + chartHeight - 185, left: chartLeft + 30, color: 'SUPPORT_COLOR', fontSize: 30, fontWeight: 700, opacity: lineOpacity }}>
        {labelFixed}
      </div>
      <div style={{ position: 'absolute', top: chartTop + 80, left: chartLeft + chartWidth - 280, color: 'PRIMARY_COLOR', fontSize: 30, fontWeight: 700, opacity: lineOpacity }}>
        {labelRevenue}
      </div>
      <div style={{ position: 'absolute', top: chartTop + 340, left: chartLeft + chartWidth - 280, color: 'SECONDARY_COLOR', fontSize: 30, fontWeight: 700, opacity: lineOpacity }}>
        {labelVariable}
      </div>

      {/* Break-even callout */}
      <div style={{ position: 'absolute', top: chartTop + chartHeight - 370, left: chartLeft + chartWidth * 0.5 + 36, color: 'ACCENT_COLOR', fontSize: 36, fontWeight: 900, opacity: calloutOp, letterSpacing: '1px' }}>
        {breakEvenLabel}
      </div>
    </div>
  );
};

export default AnimationComponent;
