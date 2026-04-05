import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

export const AnimationComponent = () => {
  const frame = useCurrentFrame();

  const TITLE          = 'TITLE_TEXT';
  const principalLabel = 'PRINCIPAL_LABEL';
  const interestLabel  = 'INTEREST_LABEL';
  const STAT_1         = 'STAT_VALUE_1';
  const STAT_2         = 'STAT_VALUE_2';

  const chartWidth  = 1300;
  const chartHeight = 560;
  const chartX      = 280;
  const chartY      = 280;

  const progress  = interpolate(frame, [30, 200], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const titleOp   = interpolate(frame, [0, 30],   [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const labelOp   = interpolate(frame, [180, 220], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Quadratic bezier: P0=(0,chartHeight), P1=(cW*0.5, cH*0.9), P2=(cW, cH*0.1)
  // Milestone points at t=0.25, 0.5, 0.75 — computed analytically
  const milestones = useMemo(() => {
    const P0 = { x: 0, y: chartHeight };
    const P1 = { x: chartWidth * 0.5, y: chartHeight * 0.9 };
    const P2 = { x: chartWidth, y: chartHeight * 0.1 };
    return [0.25, 0.5, 0.75].map(t => ({
      t,
      x: (1-t)*(1-t)*P0.x + 2*t*(1-t)*P1.x + t*t*P2.x,
      y: (1-t)*(1-t)*P0.y + 2*t*(1-t)*P1.y + t*t*P2.y,
    }));
  }, []);

  // Y-axis ticks
  const yTicks = [0, 25, 50, 75, 100];

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden', backgroundColor: 'BACKGROUND_COLOR', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{ position: 'absolute', top: 70, left: chartX, color: 'TEXT_ON_PRIMARY', fontSize: 52, fontWeight: 900, opacity: titleOp, letterSpacing: '-0.01em' }}>
        {TITLE}
      </div>

      {/* Y-axis labels */}
      {yTicks.map((pct, i) => {
        const y = chartY + chartHeight - (pct / 100) * chartHeight;
        return (
          <div key={i} style={{ position: 'absolute', top: y - 14, left: chartX - 72, color: 'TEXT_ON_PRIMARY', fontSize: 22, fontWeight: 600, opacity: titleOp * 0.6, textAlign: 'right', width: 60 }}>
            {pct}%
          </div>
        );
      })}

      <svg style={{ position: 'absolute', top: chartY, left: chartX, width: chartWidth + 20, height: chartHeight + 20 }}>
        <defs>
          <linearGradient id="grad1" x1="0" x2="0" y1="1" y2="0">
            <stop offset="0%"   stopColor="PRIMARY_COLOR" stopOpacity="0.5" />
            <stop offset="100%" stopColor="PRIMARY_COLOR" stopOpacity="0.15" />
          </linearGradient>
        </defs>

        {/* Y-axis grid lines */}
        {yTicks.map((pct, i) => {
          const y = chartHeight - (pct / 100) * chartHeight;
          return (
            <line key={i} x1={0} y1={y} x2={chartWidth} y2={y}
              stroke="GRID_LINE" strokeWidth={1} strokeDasharray="6 5" opacity={0.25} />
          );
        })}

        {/* Axes */}
        <line x1={0} y1={0} x2={0} y2={chartHeight} stroke="GRID_LINE" strokeWidth={2} opacity={0.5} />
        <line x1={0} y1={chartHeight} x2={chartWidth} y2={chartHeight} stroke="GRID_LINE" strokeWidth={2} opacity={0.5} />

        {/* Gradient area fill */}
        <path
          d={`M 0 ${chartHeight} Q ${chartWidth * 0.5} ${chartHeight * 0.9} ${chartWidth} ${chartHeight * 0.1} L ${chartWidth} ${chartHeight} Z`}
          fill="url(#grad1)"
          stroke="PRIMARY_COLOR"
          strokeWidth={6}
          strokeDasharray={chartWidth * 2}
          strokeDashoffset={chartWidth * 2 * (1 - progress)}
        />

        {/* Milestone markers — appear as the curve passes them */}
        {milestones.map((m, i) => {
          const markerOp = interpolate(frame, [30 + m.t * 170, 30 + m.t * 170 + 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          const growthPct = Math.round(m.t * 100);
          return (
            <g key={i} opacity={markerOp}>
              {/* Vertical dashed line from axis to point */}
              <line x1={m.x} y1={chartHeight} x2={m.x} y2={m.y + 16}
                stroke="ACCENT_COLOR" strokeWidth={2} strokeDasharray="5 4" opacity={0.4} />
              {/* Circle on curve */}
              <circle cx={m.x} cy={m.y} r={10} fill="ACCENT_COLOR" />
              <circle cx={m.x} cy={m.y} r={18} fill="ACCENT_COLOR" opacity={0.2} />
              {/* Growth label above */}
              <text x={m.x} y={m.y - 28} fill="ACCENT_COLOR" fontSize={24} fontWeight="700" textAnchor="middle">
                +{growthPct}%
              </text>
            </g>
          );
        })}
      </svg>

      {/* Final value callouts (right side) */}
      <div style={{ position: 'absolute', top: chartY - 30, left: chartX + chartWidth + 36, opacity: labelOp }}>
        <div style={{ color: 'ACCENT_COLOR', fontSize: 72, fontWeight: 900, fontFamily: 'monospace', lineHeight: 1 }}>{STAT_2}</div>
        <div style={{ color: 'TEXT_ON_PRIMARY', fontSize: 24, fontWeight: 700, marginTop: 10, letterSpacing: 1 }}>{interestLabel}</div>
      </div>

      <div style={{ position: 'absolute', top: chartY + chartHeight - 40, left: chartX + chartWidth + 36, opacity: labelOp }}>
        <div style={{ color: 'PRIMARY_COLOR', fontSize: 72, fontWeight: 900, fontFamily: 'monospace', lineHeight: 1 }}>{STAT_1}</div>
        <div style={{ color: 'TEXT_ON_PRIMARY', fontSize: 24, fontWeight: 700, marginTop: 10, letterSpacing: 1 }}>{principalLabel}</div>
      </div>
    </div>
  );
};

export default AnimationComponent;
