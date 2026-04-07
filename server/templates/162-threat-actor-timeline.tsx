import React, { useMemo } from 'react';
import { useCurrentFrame, interpolate, Easing } from 'remotion';

export const AnimationComponent = () => {
  const frame = useCurrentFrame();

  const events = useMemo(() => [
    { date: 'DATE_1', sector: 'SECTOR_1', tech: 'TECH_1' },
    { date: 'DATE_2', sector: 'SECTOR_2', tech: 'TECH_2' },
    { date: 'DATE_3', sector: 'SECTOR_3', tech: 'TECH_3' },
    { date: 'DATE_4', sector: 'SECTOR_4', tech: 'TECH_4' },
    { date: 'DATE_5', sector: 'SECTOR_5', tech: 'TECH_5' },
  ].filter(e => e.date !== '' && e.date !== ' ' && !e.date.startsWith('DATE_')), []);

  const count = events.length || 5;

  const titleOp = interpolate(frame, [0, 22], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Vertical stepped layout — events stacked top to bottom, left-right alternating
  const TOP_START = 160;
  const ROW_H     = Math.min(160, Math.floor((1080 - TOP_START - 60) / count));
  const SPINE_X   = 960;
  const CARD_W    = 380;
  const CARD_H    = ROW_H - 24;

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden',
      backgroundColor: 'BACKGROUND_COLOR', fontFamily: 'Inter, system-ui, sans-serif',
    }}>
      {/* Top bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 5, backgroundColor: 'PRIMARY_COLOR', opacity: titleOp }} />

      {/* Title */}
      <div style={{ position: 'absolute', top: 40, left: 0, width: 1920, textAlign: 'center', opacity: titleOp }}>
        <span style={{ fontSize: 32, fontWeight: 900, color: 'PRIMARY_COLOR', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
          THREAT ACTOR DWELL TIMELINE
        </span>
      </div>

      {/* Vertical spine */}
      <svg width={1920} height={1080} style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}>
        <line x1={SPINE_X} y1={TOP_START} x2={SPINE_X} y2={TOP_START + count * ROW_H} stroke="GRID_LINE" strokeWidth={3} opacity={titleOp} />

        {events.map((ev, i) => {
          const startFrame = 20 + i * 14;
          const op = interpolate(frame, [startFrame, startFrame + 18], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          const rowCY = TOP_START + ROW_H * i + ROW_H / 2;
          const isLeft = i % 2 === 0;
          const connX1 = isLeft ? SPINE_X - 20 : SPINE_X + 20;
          const connX2 = isLeft ? SPINE_X - 80 : SPINE_X + 80;

          return (
            <g key={i} opacity={op}>
              {/* Spine node */}
              <circle cx={SPINE_X} cy={rowCY} r={14} fill="PRIMARY_COLOR" stroke="BACKGROUND_COLOR" strokeWidth={4} />
              {/* Connector */}
              <line x1={connX1} y1={rowCY} x2={connX2} y2={rowCY} stroke="ACCENT_COLOR" strokeWidth={2} />
              {/* Row divider */}
              <line x1={160} y1={TOP_START + ROW_H * (i + 1)} x2={1760} y2={TOP_START + ROW_H * (i + 1)} stroke="GRID_LINE" strokeWidth={1} strokeDasharray="4 6" opacity={0.2} />
            </g>
          );
        })}
      </svg>

      {/* Event cards */}
      {events.map((ev, i) => {
        const startFrame = 20 + i * 14;
        const op = interpolate(frame, [startFrame, startFrame + 18], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
        const tx = interpolate(frame, [startFrame, startFrame + 18], [i % 2 === 0 ? -30 : 30, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.quad) });
        const rowCY = TOP_START + ROW_H * i + ROW_H / 2;
        const isLeft = i % 2 === 0;
        const cardX = isLeft ? SPINE_X - 100 - CARD_W : SPINE_X + 100;

        return (
          <div key={i} style={{
            position: 'absolute',
            top: rowCY - CARD_H / 2,
            left: cardX,
            width: CARD_W,
            height: CARD_H,
            opacity: op,
            transform: `translateX(${tx}px)`,
          }}>
            {/* Date pill */}
            <div style={{
              display: 'inline-block',
              backgroundColor: 'PRIMARY_COLOR',
              color: 'TEXT_ON_PRIMARY',
              fontSize: 16,
              fontWeight: 800,
              padding: '4px 14px',
              borderRadius: 20,
              marginBottom: 8,
              letterSpacing: '0.05em',
            }}>
              {ev.date}
            </div>
            {/* Card body */}
            <div style={{
              backgroundColor: 'NODE_FILL',
              border: '1px solid NODE_STROKE',
              borderLeft: '5px solid PRIMARY_COLOR',
              borderRadius: 8,
              padding: '12px 18px',
              boxSizing: 'border-box',
            }}>
              <div style={{ color: 'TEXT_ON_PRIMARY', fontSize: 22, fontWeight: 900, marginBottom: 4, lineHeight: 1.2 }}>{ev.sector}</div>
              <div style={{ color: 'ACCENT_COLOR', fontSize: 17, fontWeight: 600, lineHeight: 1.3 }}>{ev.tech}</div>
            </div>
          </div>
        );
      })}

      {/* Bottom bar */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, width: 1920, height: 4, backgroundColor: 'PRIMARY_COLOR', opacity: titleOp }} />
    </div>
  );
};

export default AnimationComponent;
