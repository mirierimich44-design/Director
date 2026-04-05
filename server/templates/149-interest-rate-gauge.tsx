import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

export const AnimationComponent = () => {
  const frame = useCurrentFrame();

  const TITLE        = 'TITLE_TEXT';
  const CURRENT_RATE = 'CURRENT_RATE_VALUE';
  const labelLow     = 'LABEL_LOW';
  const labelHigh    = 'LABEL_HIGH';
  const subText      = 'SUB_TEXT';

  const cx = 960;
  const cy = 620;
  const R  = 340;  // gauge radius

  // Gauge arc: from 210° to 330° (150° sweep, semicircle style tilted down)
  // In SVG: 0° = right, clockwise. Start = 210°, End = 330° (via top).
  // We use -210 to -330 (i.e. 150° to 30° counterclockwise = standard gauge from left to right via top)
  // Simpler: use a helper to get arc point at a given degree (where 0°=3 o'clock, +clockwise)
  const deg2rad = (d: number) => (d * Math.PI) / 180;

  const arcPoint = (angle: number) => ({
    x: cx + R * Math.cos(deg2rad(angle)),
    y: cy + R * Math.sin(deg2rad(angle)),
  });

  // Gauge spans from 225° to 315°, going counterclockwise (i.e. 225→270→315 going through top = 270°)
  // More intuitively: left end = 225°, right end = 315°, top = 270°
  const startAngle = 225;
  const endAngle   = 315;
  const totalSweep = 270; // degrees of arc (225° to 315° going through 270° = 270° total sweep)

  // SVG large-arc-flag for 270° arc
  const arcStart = arcPoint(startAngle);
  const arcEnd   = arcPoint(endAngle);

  // Color zone arcs: low (green) 225→315+90=315, medium (yellow), high (red)
  const zone1End = arcPoint(startAngle + totalSweep / 3);      // 315°
  const zone2End = arcPoint(startAngle + (totalSweep * 2) / 3); // 405° = 45°

  const arcPath = (from: number, to: number) => {
    const p1 = arcPoint(from);
    const p2 = arcPoint(to);
    const sweep = ((to - from) + 360) % 360;
    const largeArc = sweep > 180 ? 1 : 0;
    return `M ${p1.x} ${p1.y} A ${R} ${R} 0 ${largeArc} 1 ${p2.x} ${p2.y}`;
  };

  // Needle rotation: -135° → +135° range maps to full gauge sweep
  const needleAngle = interpolate(frame, [40, 120], [startAngle, endAngle + totalSweep - 360], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  // Needle endpoint
  const needleLen = R - 20;
  const needleTip = {
    x: cx + needleLen * Math.cos(deg2rad(needleAngle)),
    y: cy + needleLen * Math.sin(deg2rad(needleAngle)),
  };

  // Tick marks at every 30° of the 270° sweep
  const tickAngles = useMemo(() => {
    const ticks = [];
    for (let i = 0; i <= 6; i++) {
      ticks.push(startAngle + (totalSweep / 6) * i);
    }
    return ticks;
  }, []);

  const titleOp   = interpolate(frame, [0, 30],   [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const gaugeOp   = interpolate(frame, [20, 60],  [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const needleOp  = interpolate(frame, [60, 90],  [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden', backgroundColor: 'BACKGROUND_COLOR', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Title */}
      <div style={{ position: 'absolute', top: 60, left: 192, width: 1536, color: 'TEXT_ON_PRIMARY', fontSize: 56, fontWeight: 900, textAlign: 'center', opacity: titleOp, letterSpacing: '2px' }}>
        {TITLE}
      </div>

      <svg style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 1080 }}>
        <g opacity={gaugeOp}>
          {/* Background arc — full sweep in dark */}
          <path d={arcPath(startAngle, startAngle + totalSweep)} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={50} strokeLinecap="round" />

          {/* Color zones */}
          {/* Low zone — green */}
          <path d={arcPath(startAngle, startAngle + totalSweep / 3)} fill="none" stroke="#22c55e" strokeWidth={50} strokeLinecap="butt" />
          {/* Mid zone — yellow/amber */}
          <path d={arcPath(startAngle + totalSweep / 3, startAngle + (totalSweep * 2) / 3)} fill="none" stroke="#f59e0b" strokeWidth={50} strokeLinecap="butt" />
          {/* High zone — red */}
          <path d={arcPath(startAngle + (totalSweep * 2) / 3, startAngle + totalSweep)} fill="none" stroke="#ef4444" strokeWidth={50} strokeLinecap="butt" />

          {/* Tick marks */}
          {tickAngles.map((angle, i) => {
            const inner = { x: cx + (R - 65) * Math.cos(deg2rad(angle)), y: cy + (R - 65) * Math.sin(deg2rad(angle)) };
            const outer = { x: cx + (R + 12) * Math.cos(deg2rad(angle)), y: cy + (R + 12) * Math.sin(deg2rad(angle)) };
            return (
              <line key={i} x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y}
                stroke="rgba(255,255,255,0.7)" strokeWidth={i === 0 || i === 6 ? 4 : 3} />
            );
          })}

          {/* Low / High labels */}
          <text x={arcStart.x - 10} y={arcStart.y + 40} fill="TEXT_ON_PRIMARY" fontSize={28} fontWeight="700" textAnchor="end" opacity={0.85}>{labelLow}</text>
          <text x={arcEnd.x + 10}   y={arcEnd.y + 40}   fill="TEXT_ON_PRIMARY" fontSize={28} fontWeight="700" textAnchor="start" opacity={0.85}>{labelHigh}</text>
        </g>

        {/* Needle */}
        <g opacity={needleOp}>
          <line x1={cx} y1={cy} x2={needleTip.x} y2={needleTip.y}
            stroke="ACCENT_COLOR" strokeWidth={8} strokeLinecap="round"
            style={{ filter: 'drop-shadow(0 0 8px ACCENT_COLOR)' }} />
          <circle cx={cx} cy={cy} r={22} fill="ACCENT_COLOR" />
          <circle cx={cx} cy={cy} r={10} fill="#fff" />
        </g>
      </svg>

      {/* Current rate display */}
      <div style={{ position: 'absolute', top: cy + 60, left: cx - 220, width: 440, textAlign: 'center', opacity: needleOp }}>
        <div style={{ fontSize: 100, fontWeight: 900, color: 'PRIMARY_COLOR', fontFamily: 'monospace', lineHeight: 1 }}>{CURRENT_RATE}</div>
        <div style={{ fontSize: 28, color: 'TEXT_ON_PRIMARY', marginTop: 16, fontWeight: 600, opacity: 0.85 }}>{subText}</div>
      </div>
    </div>
  );
};

export default AnimationComponent;
