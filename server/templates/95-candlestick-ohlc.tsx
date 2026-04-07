import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

export const AnimationComponent = () => {
  const frame = useCurrentFrame();

  const title = 'TITLE_TEXT';
  const dateLabels = ['DATE_1', 'DATE_2', 'DATE_3', 'DATE_4', 'DATE_5', 'DATE_6'];

  const candleData = useMemo(() => [
    { open: 100, high: 120, low: 90,  close: 110, bull: true },
    { open: 110, high: 115, low: 100, close: 105, bull: false },
    { open: 105, high: 130, low: 105, close: 125, bull: true },
    { open: 125, high: 140, low: 120, close: 135, bull: true },
    { open: 135, high: 138, low: 110, close: 115, bull: false },
    { open: 115, high: 125, low: 115, close: 120, bull: true },
  ], []);

  // Price scale: map price range to SVG Y coordinates
  const allPrices = candleData.flatMap(d => [d.open, d.high, d.low, d.close]);
  const minPrice = Math.min(...allPrices) - 5;
  const maxPrice = Math.max(...allPrices) + 5;
  const priceRange = maxPrice - minPrice;

  const svgLeft = 160;
  const svgTop = 150;
  const chartW = 1520;
  const chartH = 640;
  const candleW = 100;
  const spacing = (chartW - candleW) / (candleData.length - 1);

  const scaleY = (price: number) => chartH - ((price - minPrice) / priceRange) * chartH;

  // Y-axis tick values
  const yTicks = useMemo(() => {
    const step = Math.ceil(priceRange / 6 / 5) * 5;
    const ticks: number[] = [];
    for (let v = Math.ceil(minPrice / step) * step; v <= maxPrice; v += step) {
      ticks.push(v);
    }
    return ticks;
  }, []);

  const titleOp = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const axisOp  = interpolate(frame, [10, 35], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden', backgroundColor: 'BACKGROUND_COLOR', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{ position: 'absolute', top: 60, left: svgLeft, fontSize: 52, fontWeight: 900, color: 'TEXT_ON_PRIMARY', opacity: titleOp }}>
        {title}
      </div>

      <svg style={{ position: 'absolute', top: svgTop, left: svgLeft, width: chartW + 120, height: chartH + 120 }}>
        {/* Y-axis */}
        <line x1={60} y1={0} x2={60} y2={chartH} stroke="GRID_LINE" strokeWidth={2} opacity={axisOp} />
        {/* X-axis */}
        <line x1={60} y1={chartH} x2={chartW + 60} y2={chartH} stroke="GRID_LINE" strokeWidth={2} opacity={axisOp} />

        {/* Y-axis ticks and grid lines */}
        {yTicks.map((v, i) => {
          const y = scaleY(v);
          return (
            <g key={i} opacity={axisOp}>
              <line x1={50} y1={y} x2={chartW + 60} y2={y} stroke="GRID_LINE" strokeWidth={1} strokeDasharray="6 4" opacity={0.4} />
              <text x={48} y={y + 6} fill="TEXT_ON_PRIMARY" fontSize={24} fontWeight="700" textAnchor="end" opacity={0.85}>{v}</text>
            </g>
          );
        })}

        {/* Candles */}
        {candleData.map((d, i) => {
          const delay = i * 28;
          const wickOp  = interpolate(frame, [delay, delay + 15], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          const finalBodyH = Math.max(4, Math.abs(scaleY(d.open) - scaleY(d.close)));
          const bodyH = interpolate(frame, [delay + 8, delay + 35], [0, finalBodyH], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          const textOp = interpolate(frame, [delay + 30, delay + 50], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

          const cx = 60 + i * spacing + candleW / 2;
          const bodyTop = Math.min(scaleY(d.open), scaleY(d.close));
          const bodyTopAnim = d.bull ? bodyTop + finalBodyH - bodyH : bodyTop;

          const color = d.bull ? 'PRIMARY_COLOR' : 'SECONDARY_COLOR';

          // OHLC label: show close price above/below candle
          const labelY = d.bull
            ? scaleY(d.high) - 14
            : scaleY(d.low) + 36;

          return (
            <g key={i}>
              {/* Wick */}
              <line
                x1={cx} y1={scaleY(d.high)}
                x2={cx} y2={scaleY(d.low)}
                stroke={color} strokeWidth={3} opacity={wickOp}
              />
              {/* Body */}
              <rect
                x={60 + i * spacing} y={bodyTopAnim}
                width={candleW} height={bodyH}
                fill={color} rx={3} opacity={wickOp}
              />
              {/* Close price label */}
              <text
                x={cx} y={labelY}
                fill={color} fontSize={26} fontWeight="800"
                textAnchor="middle" opacity={textOp}
              >
                {d.close}
              </text>
              {/* Date label on X axis */}
              <text
                x={cx} y={chartH + 44}
                fill="TEXT_ON_PRIMARY" fontSize={24} fontWeight="700"
                textAnchor="middle" opacity={textOp}
              >
                {dateLabels[i]}
              </text>
            </g>
          );
        })}
      </svg>

      <div style={{ position: 'absolute', top: 940, left: svgLeft, fontSize: 20, color: 'SUPPORT_COLOR', opacity: 0.7 }}>
        SOURCE_TEXT
      </div>
    </div>
  );
};

export default AnimationComponent;
