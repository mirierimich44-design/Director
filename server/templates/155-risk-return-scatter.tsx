import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

export const AnimationComponent = () => {
  const frame = useCurrentFrame();

  const allPoints = useMemo(() => [
    { label: 'LABEL_1', x: 20, y: 30 },
    { label: 'LABEL_2', x: 40, y: 50 },
    { label: 'LABEL_3', x: 60, y: 45 },
    { label: 'LABEL_4', x: 80, y: 75 },
    { label: 'LABEL_5', x: 30, y: 65 },
    { label: 'LABEL_6', x: 70, y: 25 },
  ], []);

  // Filter out unfilled placeholder labels
  const points = useMemo(() =>
    allPoints.filter(p =>
      p.label !== '' && p.label !== ' ' &&
      !/^LABEL_\d+$/.test(p.label.trim())
    ),
  []);

  const chartArea = { left: 220, top: 140, width: 1460, height: 700 };
  const chartRight  = chartArea.left + chartArea.width;
  const chartBottom = chartArea.top  + chartArea.height;

  const gridOp  = interpolate(frame, [0, 30],  [0, 0.35], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const axisOp  = interpolate(frame, [20, 50], [0, 1],    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const titleOp = interpolate(frame, [0, 25],  [0, 1],    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Axis tick values (25, 50, 75, 100)
  const ticks = [25, 50, 75, 100];

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden', backgroundColor: 'BACKGROUND_COLOR', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Title */}
      <div style={{ position: 'absolute', top: 55, left: chartArea.left, fontSize: 52, fontWeight: 900, color: 'TEXT_ON_PRIMARY', opacity: titleOp }}>
        TITLE_TEXT
      </div>

      <svg style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 1080 }}>

        {/* Grid lines */}
        {ticks.map((t, i) => {
          const gx = chartArea.left + (t / 100) * chartArea.width;
          const gy = chartBottom   - (t / 100) * chartArea.height;
          return (
            <g key={i}>
              <line x1={gx} y1={chartArea.top} x2={gx} y2={chartBottom}
                stroke="GRID_LINE" strokeWidth={1} strokeDasharray="6 5" opacity={gridOp} />
              <line x1={chartArea.left} y1={gy} x2={chartRight} y2={gy}
                stroke="GRID_LINE" strokeWidth={1} strokeDasharray="6 5" opacity={gridOp} />
            </g>
          );
        })}

        {/* Axes */}
        <line x1={chartArea.left} y1={chartBottom} x2={chartRight}     y2={chartBottom}    stroke="GRID_LINE" strokeWidth={3} opacity={axisOp} />
        <line x1={chartArea.left} y1={chartArea.top} x2={chartArea.left} y2={chartBottom}   stroke="GRID_LINE" strokeWidth={3} opacity={axisOp} />

        {/* X-axis tick labels */}
        {ticks.map((t, i) => {
          const gx = chartArea.left + (t / 100) * chartArea.width;
          return (
            <text key={i} x={gx} y={chartBottom + 38} fill="TEXT_ON_PRIMARY" fontSize={24} fontWeight="600" textAnchor="middle" opacity={axisOp * 0.7}>
              {t}%
            </text>
          );
        })}

        {/* Y-axis tick labels */}
        {ticks.map((t, i) => {
          const gy = chartBottom - (t / 100) * chartArea.height;
          return (
            <text key={i} x={chartArea.left - 16} y={gy + 8} fill="TEXT_ON_PRIMARY" fontSize={24} fontWeight="600" textAnchor="end" opacity={axisOp * 0.7}>
              {t}%
            </text>
          );
        })}

        {/* Axis titles */}
        <text x={chartArea.left + chartArea.width / 2} y={chartBottom + 80}
          fill="TEXT_ON_PRIMARY" fontSize={28} fontWeight="800" textAnchor="middle" opacity={axisOp}>
          RISK →
        </text>
        <text
          x={chartArea.left - 80}
          y={chartArea.top + chartArea.height / 2}
          fill="TEXT_ON_PRIMARY" fontSize={28} fontWeight="800" textAnchor="middle" opacity={axisOp}
          transform={`rotate(-90, ${chartArea.left - 80}, ${chartArea.top + chartArea.height / 2})`}
        >
          RETURN ↑
        </text>

        {/* Efficient frontier curve */}
        <path
          d={`M ${chartArea.left} ${chartBottom} Q ${chartArea.left + chartArea.width * 0.5} ${chartArea.top + chartArea.height * 0.2} ${chartRight} ${chartArea.top}`}
          fill="none"
          stroke="ACCENT_COLOR"
          strokeWidth={4}
          strokeDasharray={chartArea.width * 2}
          strokeDashoffset={interpolate(frame, [180, 260], [chartArea.width * 2, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}
          opacity={0.7}
        />
        {/* Frontier label */}
        <text
          x={chartArea.left + chartArea.width * 0.72}
          y={chartArea.top + chartArea.height * 0.28}
          fill="ACCENT_COLOR" fontSize={22} fontWeight="700"
          opacity={interpolate(frame, [240, 270], [0, 0.9], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}
        >
          Efficient Frontier
        </text>

        {/* Scatter points */}
        {points.map((p, i) => {
          const delay = 60 + (i * 20);
          const op    = interpolate(frame, [delay, delay + 25], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          const scale = interpolate(frame, [delay, delay + 25], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          const px    = chartArea.left + (p.x / 100) * chartArea.width;
          const py    = chartBottom    - (p.y / 100) * chartArea.height;

          return (
            <g key={i} style={{ opacity: op, transform: `scale(${scale})`, transformOrigin: `${px}px ${py}px` }}>
              {/* Outer glow ring */}
              <circle cx={px} cy={py} r={20} fill="PRIMARY_COLOR" opacity={0.2} />
              {/* Main dot */}
              <circle cx={px} cy={py} r={13} fill="PRIMARY_COLOR" />
              <circle cx={px} cy={py} r={5}  fill="#fff" />
              {/* Label */}
              <text
                x={px + 22} y={py - 12}
                fill="#fff" fontSize={26} fontWeight="700"
                style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.8))' }}
              >
                {p.label}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Source text */}
      <div style={{ position: 'absolute', top: 1012, left: chartArea.left, fontSize: 20, color: 'SUPPORT_COLOR', opacity: axisOp * 0.8 }}>
        SOURCE_TEXT
      </div>
    </div>
  );
};

export default AnimationComponent;
