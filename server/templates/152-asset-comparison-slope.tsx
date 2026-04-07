import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, Easing } from 'remotion';

export const AnimationComponent = () => {
  const frame = useCurrentFrame();

  const title = 'TITLE_TEXT';
  const assetName = 'ASSET_NAME';
  const val1 = 'START_VALUE';
  const val2 = 'END_VALUE';
  const label1 = 'LABEL_START';
  const label2 = 'LABEL_END';
  const change = 'PERCENT_CHANGE';

  const masterOp  = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const titleTy   = interpolate(frame, [0, 24], [20, 0], { extrapolateLeft: 'clamp', easing: Easing.out(Easing.quad) });
  const lineDraw  = interpolate(frame, [30, 90], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.quad) });
  const labelOp   = interpolate(frame, [75, 100], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const changeSc  = interpolate(frame, [85, 110], [0.85, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.backOut });

  // Chart area
  const CX = 240, CY_TOP = 200, CY_BOT = 760;
  const CX2 = 1680;
  const lineLen = Math.sqrt((CX2 - CX) ** 2 + (CY_BOT - CY_TOP) ** 2);

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden',
      backgroundColor: 'BACKGROUND_COLOR', fontFamily: 'Inter, system-ui, sans-serif',
    }}>
      {/* Background grid */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
        backgroundSize: '120px 120px',
      }} />

      {/* Title */}
      <div style={{
        position: 'absolute', top: 60, left: 120, opacity: masterOp, transform: `translateY(${titleTy}px)`,
        display: 'flex', flexDirection: 'column', gap: 8,
      }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: 'PRIMARY_COLOR', letterSpacing: '0.2em', textTransform: 'uppercase' }}>{assetName}</div>
        <div style={{ fontSize: 52, fontWeight: 900, color: 'TEXT_ON_PRIMARY', letterSpacing: '-0.02em' }}>{title}</div>
      </div>

      <svg style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 1080 }}>
        {/* Horizontal reference lines */}
        {[CY_TOP, (CY_TOP + CY_BOT) / 2, CY_BOT].map((y, i) => (
          <line key={i} x1={160} y1={y} x2={1760} y2={y} stroke="GRID_LINE" strokeWidth={1} strokeDasharray="8 8" opacity={masterOp * 0.3} />
        ))}

        {/* The slope line — animated draw */}
        <line
          x1={CX} y1={CY_BOT}
          x2={CX + (CX2 - CX) * lineDraw}
          y2={CY_BOT - (CY_BOT - CY_TOP) * lineDraw}
          stroke="PRIMARY_COLOR"
          strokeWidth={8}
          strokeLinecap="round"
          opacity={masterOp}
        />

        {/* Start dot */}
        <circle cx={CX} cy={CY_BOT} r={18} fill="PRIMARY_COLOR" opacity={masterOp} />
        <circle cx={CX} cy={CY_BOT} r={8} fill="BACKGROUND_COLOR" opacity={masterOp} />

        {/* End dot — appears when line reaches it */}
        <circle cx={CX2} cy={CY_TOP} r={18} fill="ACCENT_COLOR" opacity={labelOp} />
        <circle cx={CX2} cy={CY_TOP} r={8} fill="BACKGROUND_COLOR" opacity={labelOp} />

        {/* Vertical dashed projections */}
        <line x1={CX} y1={CY_BOT} x2={CX} y2={900} stroke="PRIMARY_COLOR" strokeWidth={2} strokeDasharray="6 4" opacity={labelOp * 0.5} />
        <line x1={CX2} y1={CY_TOP} x2={CX2} y2={900} stroke="ACCENT_COLOR" strokeWidth={2} strokeDasharray="6 4" opacity={labelOp * 0.5} />
      </svg>

      {/* Start label */}
      <div style={{ position: 'absolute', top: CY_BOT - 120, left: CX - 130, width: 260, opacity: labelOp, textAlign: 'center' }}>
        <div style={{ fontSize: 20, color: 'SUPPORT_COLOR', fontWeight: 600, marginBottom: 8 }}>{label1}</div>
        <div style={{ fontSize: 72, fontWeight: 900, color: 'TEXT_ON_PRIMARY', fontFamily: 'monospace', lineHeight: 1 }}>{val1}</div>
      </div>

      {/* End label */}
      <div style={{ position: 'absolute', top: CY_TOP - 120, left: CX2 - 130, width: 260, opacity: labelOp, textAlign: 'center' }}>
        <div style={{ fontSize: 20, color: 'SUPPORT_COLOR', fontWeight: 600, marginBottom: 8 }}>{label2}</div>
        <div style={{ fontSize: 72, fontWeight: 900, color: 'ACCENT_COLOR', fontFamily: 'monospace', lineHeight: 1 }}>{val2}</div>
      </div>

      {/* Change badge — center of line */}
      <div style={{
        position: 'absolute',
        top: (CY_TOP + CY_BOT) / 2 - 44,
        left: (CX + CX2) / 2 - 110,
        width: 220,
        backgroundColor: 'PRIMARY_COLOR',
        borderRadius: 12,
        padding: '16px 28px',
        textAlign: 'center',
        opacity: labelOp,
        transform: `scale(${changeSc})`,
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      }}>
        <div style={{ fontSize: 38, fontWeight: 900, color: 'TEXT_ON_PRIMARY' }}>{change}</div>
      </div>

      {/* Bottom bar */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, width: 1920, height: 4, backgroundColor: 'PRIMARY_COLOR', opacity: masterOp }} />
    </div>
  );
};

export default AnimationComponent;
