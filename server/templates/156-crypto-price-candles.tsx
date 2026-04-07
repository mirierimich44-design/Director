import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

export const AnimationComponent = () => {
  const frame = useCurrentFrame();

  const candleData = [
    { open: 100, close: 120, high: 130, low: 90,  vol: 50 },
    { open: 120, close: 110, high: 125, low: 105, vol: 80 },
    { open: 110, close: 140, high: 145, low: 108, vol: 120 },
    { open: 140, close: 135, high: 150, low: 130, vol: 60 },
    { open: 135, close: 160, high: 165, low: 132, vol: 150 },
    { open: 160, close: 155, high: 170, low: 150, vol: 90 },
  ];

  const titleText = 'TITLE_TEXT';
  const subText   = 'SUB_TEXT_1';

  // Chart geometry
  const CHART_LEFT  = 180;
  const CHART_TOP   = 160;
  const CHART_W     = 1500;
  const CHART_H     = 700;
  const VOL_H       = 100;
  const VOL_GAP     = 20;

  const n = candleData.length;
  const CANDLE_W = Math.floor((CHART_W / n) * 0.55);
  const slotW    = CHART_W / n;

  // Price scale
  const allPrices = candleData.flatMap(d => [d.open, d.high, d.low, d.close]);
  const minP = Math.min(...allPrices);
  const maxP = Math.max(...allPrices);
  const pad  = (maxP - minP) * 0.12;
  const scaleY = (p: number) => CHART_TOP + CHART_H - ((p - (minP - pad)) / (maxP + pad - (minP - pad))) * CHART_H;

  // Volume scale
  const maxVol = Math.max(...candleData.map(d => d.vol));
  const volTop = CHART_TOP + CHART_H + VOL_GAP;

  // Y-axis ticks
  const yTicks = useMemo(() => {
    const range = maxP - minP;
    const step = Math.ceil(range / 5 / 5) * 5 || 10;
    const ticks: number[] = [];
    for (let v = Math.ceil((minP - pad) / step) * step; v <= maxP + pad; v += step) ticks.push(v);
    return ticks.slice(0, 8);
  }, []);

  const titleOp = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const axisOp  = interpolate(frame, [10, 35], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden',
      backgroundColor: 'BACKGROUND_COLOR', fontFamily: 'Inter, system-ui, sans-serif',
    }}>
      {/* Title */}
      <div style={{ position: 'absolute', top: 52, left: CHART_LEFT, opacity: titleOp, display: 'flex', alignItems: 'center', gap: 18 }}>
        <div style={{ width: 6, height: 44, backgroundColor: 'PRIMARY_COLOR', borderRadius: 3 }} />
        <div style={{ fontSize: 48, fontWeight: 900, color: 'TEXT_ON_PRIMARY' }}>{titleText}</div>
      </div>

      <svg style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 1080 }}>
        {/* Y-axis */}
        <line x1={CHART_LEFT + 60} y1={CHART_TOP} x2={CHART_LEFT + 60} y2={CHART_TOP + CHART_H} stroke="GRID_LINE" strokeWidth={2} opacity={axisOp} />
        {/* X-axis */}
        <line x1={CHART_LEFT + 60} y1={CHART_TOP + CHART_H} x2={CHART_LEFT + CHART_W + 60} y2={CHART_TOP + CHART_H} stroke="GRID_LINE" strokeWidth={2} opacity={axisOp} />

        {/* Y-axis ticks and grid */}
        {yTicks.map((v, i) => {
          const y = scaleY(v);
          if (y < CHART_TOP || y > CHART_TOP + CHART_H) return null;
          return (
            <g key={i} opacity={axisOp}>
              <line x1={CHART_LEFT + 54} y1={y} x2={CHART_LEFT + CHART_W + 60} y2={y} stroke="GRID_LINE" strokeWidth={1} strokeDasharray="8 6" opacity={0.35} />
              <text x={CHART_LEFT + 48} y={y + 6} fill="TEXT_ON_PRIMARY" fontSize={20} fontWeight="600" textAnchor="end" opacity={0.8}>{v}</text>
            </g>
          );
        })}

        {/* Candles */}
        {candleData.map((d, i) => {
          const delay = 20 + i * 18;
          const wickOp = interpolate(frame, [delay, delay + 14], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          const finalBodyH = Math.max(6, Math.abs(scaleY(d.open) - scaleY(d.close)));
          const bodyH = interpolate(frame, [delay + 6, delay + 28], [0, finalBodyH], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          const textOp = interpolate(frame, [delay + 25, delay + 42], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

          const isBull = d.close >= d.open;
          const color  = isBull ? 'PRIMARY_COLOR' : 'SECONDARY_COLOR';
          const cx     = CHART_LEFT + 60 + i * slotW + slotW / 2;
          const bodyTop = isBull ? scaleY(d.close) : scaleY(d.open);
          const bodyTopAnim = isBull ? bodyTop + finalBodyH - bodyH : bodyTop;

          // Volume bar
          const vH = (d.vol / maxVol) * (VOL_H - 10);
          const vOp = interpolate(frame, [delay + 10, delay + 25], [0, 0.6], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

          // Close price label position
          const labelY = isBull ? scaleY(d.high) - 18 : scaleY(d.low) + 36;

          return (
            <g key={i}>
              {/* Wick */}
              <line x1={cx} y1={scaleY(d.high)} x2={cx} y2={scaleY(d.low)} stroke={color} strokeWidth={4} opacity={wickOp} strokeLinecap="round" />
              {/* Body */}
              <rect x={cx - CANDLE_W / 2} y={bodyTopAnim} width={CANDLE_W} height={bodyH} fill={color} rx={4} opacity={wickOp} />
              {/* Close price */}
              <text x={cx} y={labelY} fill={color} fontSize={22} fontWeight="800" textAnchor="middle" opacity={textOp}>{d.close}</text>
              {/* Volume bar */}
              <rect x={cx - CANDLE_W / 2} y={volTop + VOL_H - 10 - vH} width={CANDLE_W} height={vH} fill={color} rx={2} opacity={vOp} />
            </g>
          );
        })}

        {/* Volume axis label */}
        <text x={CHART_LEFT + 40} y={volTop + VOL_H / 2} fill="TEXT_ON_PRIMARY" fontSize={16} fontWeight="600" textAnchor="middle" opacity={axisOp * 0.5} transform={`rotate(-90, ${CHART_LEFT + 40}, ${volTop + VOL_H / 2})`}>VOL</text>

        {/* Divider between candles and volume */}
        <line x1={CHART_LEFT + 60} y1={volTop - 4} x2={CHART_LEFT + CHART_W + 60} y2={volTop - 4} stroke="GRID_LINE" strokeWidth={1} opacity={axisOp * 0.3} />
      </svg>

      <div style={{ position: 'absolute', top: 990, left: CHART_LEFT, fontSize: 22, color: 'SUPPORT_COLOR', opacity: 0.65 }}>{subText}</div>
    </div>
  );
};

export default AnimationComponent;
