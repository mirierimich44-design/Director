import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

export const AnimationComponent = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const title = "TITLE_TEXT";
  const labelFixed = "FIXED_COSTS_LABEL";
  const labelVariable = "VARIABLE_COSTS_LABEL";
  const labelRevenue = "REVENUE_LABEL";
  const breakEvenLabel = "BREAK_EVEN_LABEL";

  const chartLeft = 200;
  const chartWidth = 1520;
  const chartTop = 200;
  const chartHeight = 700;

  const lineOpacity = interpolate(frame, [0, 30], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const fixedLineDraw = interpolate(frame, [30, 90], [0, chartWidth], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const varLineDraw = interpolate(frame, [60, 120], [0, chartWidth], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const revLineDraw = interpolate(frame, [90, 150], [0, chartWidth], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const calloutOp = interpolate(frame, [180, 210], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden', backgroundColor: 'BACKGROUND_COLOR' }}>
      <div style={{ position: 'absolute', top: 60, left: 192, fontSize: 40, fontWeight: 'bold', color: 'TEXT_ON_PRIMARY', opacity: lineOpacity }}>{title}</div>
      
      <svg style={{ position: 'absolute', top: chartTop, left: chartLeft, width: chartWidth, height: chartHeight }}>
        <line x1={0} y1={chartHeight} x2={chartWidth} y2={chartHeight} stroke="GRID_LINE" strokeWidth={3} />
        <line x1={0} y1={0} x2={0} y2={chartHeight} stroke="GRID_LINE" strokeWidth={3} />
        
        <line x1={0} y1={chartHeight - 150} x2={fixedLineDraw} y2={chartHeight - 150} stroke="SUPPORT_COLOR" strokeWidth={4} strokeDasharray="10 5" />
        <line x1={0} y1={chartHeight} x2={varLineDraw} y2={chartHeight - 400} stroke="SECONDARY_COLOR" strokeWidth={4} />
        <line x1={0} y1={chartHeight} x2={revLineDraw} y2={chartHeight - 600} stroke="PRIMARY_COLOR" strokeWidth={4} />
        
        <circle cx={chartWidth * 0.5} cy={chartHeight - 300} r={12} fill="ACCENT_COLOR" style={{ opacity: calloutOp }} />
      </svg>

      <div style={{ position: 'absolute', top: chartTop + chartHeight - 180, left: chartLeft + 20, color: 'SUPPORT_COLOR', fontSize: 18, fontWeight: '600', opacity: lineOpacity }}>{labelFixed}</div>
      <div style={{ position: 'absolute', top: chartTop + 200, left: chartLeft + 1200, color: 'PRIMARY_COLOR', fontSize: 18, fontWeight: '600', opacity: lineOpacity }}>{labelRevenue}</div>
      <div style={{ position: 'absolute', top: chartTop + 500, left: chartLeft + 1200, color: 'SECONDARY_COLOR', fontSize: 18, fontWeight: '600', opacity: lineOpacity }}>{labelVariable}</div>
      
      <div style={{ position: 'absolute', top: chartTop + chartHeight - 400, left: chartLeft + (chartWidth * 0.5) + 20, color: 'ACCENT_COLOR', fontSize: 24, fontWeight: 'bold', opacity: calloutOp }}>{breakEvenLabel}</div>
    </div>
  );
};

export default AnimationComponent;