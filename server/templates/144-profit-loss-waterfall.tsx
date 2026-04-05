import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

export const AnimationComponent = () => {
  const frame = useCurrentFrame();

  const title = 'TITLE_TEXT';
  const labels = ['LABEL_1', 'LABEL_2', 'LABEL_3', 'LABEL_4', 'LABEL_5'];
  const rawValues = ['STAT_VALUE_1', 'STAT_VALUE_2', 'STAT_VALUE_3', 'STAT_VALUE_4', 'STAT_VALUE_5'];
  const colors = ['PRIMARY_COLOR', 'SECONDARY_COLOR', 'SECONDARY_COLOR', 'SECONDARY_COLOR', 'ACCENT_COLOR'];

  const values = useMemo(() => {
    const parsed = rawValues.map(v => parseFloat(String(v).replace(/[^0-9.\-]/g, '')));
    return parsed.every(v => !isNaN(v) && v !== 0) ? parsed : [100, -30, -20, -10, 40];
  }, []);

  const maxAbs = Math.max(...values.map(Math.abs));
  const barWidth = 220;
  const gutter = 50;
  const startX = (1920 - labels.length * (barWidth + gutter) + gutter) / 2;
  const baselineY = 640;
  const chartHeight = 380;

  const titleOp = interpolate(frame, [0, 25], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden', backgroundColor: 'BACKGROUND_COLOR', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{ position: 'absolute', top: 60, left: 192, width: 1536, color: 'TEXT_ON_PRIMARY', fontSize: 52, fontWeight: 900, letterSpacing: '2px', opacity: titleOp }}>
        {title}
      </div>

      <svg style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 1080 }}>
        {/* Baseline */}
        <line x1={192} y1={baselineY} x2={1728} y2={baselineY} stroke="GRID_LINE" strokeWidth={3} opacity={0.6} />

        {labels.map((label, i) => {
          const val = values[i];
          const finalBarH = (Math.abs(val) / maxAbs) * chartHeight;
          const barH = interpolate(frame, [30 + i * 25, 70 + i * 25], [0, finalBarH], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          const x = startX + i * (barWidth + gutter);
          const y = val > 0 ? baselineY - barH : baselineY;
          const itemOp = interpolate(frame, [30 + i * 25, 55 + i * 25], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          const textOp = interpolate(frame, [60 + i * 25, 85 + i * 25], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

          return (
            <g key={i}>
              <rect x={x} y={y} width={barWidth} height={barH} fill={colors[i]} opacity={itemOp} rx={6} />

              {/* Value figure above positive / below negative */}
              <text
                x={x + barWidth / 2}
                y={val > 0 ? baselineY - finalBarH - 20 : baselineY + finalBarH + 54}
                fill={colors[i]}
                fontSize={34}
                fontWeight="bold"
                textAnchor="middle"
                opacity={textOp}
              >
                {rawValues[i]}
              </text>

              {/* Bar label below baseline */}
              <text
                x={x + barWidth / 2}
                y={baselineY + 60}
                fill="TEXT_ON_PRIMARY"
                fontSize={28}
                fontWeight="600"
                textAnchor="middle"
                opacity={textOp}
              >
                {label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default AnimationComponent;
