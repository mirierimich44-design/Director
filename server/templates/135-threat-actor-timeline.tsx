import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

export const AnimationComponent = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const events = useMemo(() => [
    { date: 'DATE_1', sector: 'SECTOR_1', tech: 'TECH_1' },
    { date: 'DATE_2', sector: 'SECTOR_2', tech: 'TECH_2' },
    { date: 'DATE_3', sector: 'SECTOR_3', tech: 'TECH_3' },
    { date: 'DATE_4', sector: 'SECTOR_4', tech: 'TECH_4' },
    { date: 'DATE_5', sector: 'SECTOR_5', tech: 'TECH_5' },
  ].filter(e => e.date !== '' && e.date !== ' ' && !e.date.startsWith('DATE_')), []);

  const count = Math.max(events.length, 1);
  const titleOp = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Layout: timeline spine at y=540, cards alternate above/below
  const SPINE_Y = 520;
  const CARD_W = Math.min(280, Math.floor(1540 / count) - 20);
  const CARD_H = 160;
  const startX = 200;
  const totalW = 1520;
  const step = count > 1 ? totalW / (count - 1) : 0;

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden', backgroundColor: 'BACKGROUND_COLOR', fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* Title */}
      <div style={{ position: 'absolute', top: 52, left: 200, opacity: titleOp, display: 'flex', alignItems: 'center', gap: 18 }}>
        <div style={{ width: 6, height: 40, backgroundColor: 'PRIMARY_COLOR', borderRadius: 3 }} />
        <div style={{ fontSize: 36, fontWeight: 900, color: 'TEXT_ON_PRIMARY', letterSpacing: '0.08em', textTransform: 'uppercase' }}>OPERATIONAL TIMELINE</div>
      </div>

      <svg width={1920} height={1080} style={{ position: 'absolute', top: 0, left: 0 }}>
        {/* Spine gradient line */}
        <line x1={160} y1={SPINE_Y} x2={1760} y2={SPINE_Y} stroke="GRID_LINE" strokeWidth={3} opacity={titleOp} />

        {events.map((event, i) => {
          const startFrame = 25 + i * 18;
          const op = interpolate(frame, [startFrame, startFrame + 22], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          const x = count === 1 ? startX + totalW / 2 : startX + step * i;
          const isAbove = i % 2 === 0;
          const cardY = isAbove ? SPINE_Y - CARD_H - 60 : SPINE_Y + 60;
          const connY1 = isAbove ? cardY + CARD_H : SPINE_Y;
          const connY2 = isAbove ? SPINE_Y : cardY;

          return (
            <g key={i} opacity={op}>
              {/* Connector line */}
              <line x1={x} y1={connY1} x2={x} y2={connY2} stroke="ACCENT_COLOR" strokeWidth={2} strokeDasharray="6 4" />
              {/* Spine dot */}
              <circle cx={x} cy={SPINE_Y} r={10} fill="PRIMARY_COLOR" stroke="BACKGROUND_COLOR" strokeWidth={3} />
              {/* Date above/below card */}
              <text
                x={x}
                y={isAbove ? cardY - 16 : cardY + CARD_H + 34}
                textAnchor="middle"
                fill="PRIMARY_COLOR"
                fontSize={22}
                fontWeight="800"
                letterSpacing="1"
              >
                {event.date}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Event cards — rendered as divs for better text rendering */}
      {events.map((event, i) => {
        const startFrame = 25 + i * 18;
        const op = interpolate(frame, [startFrame, startFrame + 22], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
        const sc = interpolate(frame, [startFrame, startFrame + 22], [0.85, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
        const x = count === 1 ? startX + totalW / 2 : startX + step * i;
        const isAbove = i % 2 === 0;
        const cardY = isAbove ? SPINE_Y - CARD_H - 60 : SPINE_Y + 60;

        return (
          <div key={i} style={{
            position: 'absolute',
            top: cardY,
            left: x - CARD_W / 2,
            width: CARD_W,
            height: CARD_H,
            backgroundColor: 'NODE_FILL',
            borderRadius: 10,
            border: '2px solid NODE_STROKE',
            borderTop: '4px solid PRIMARY_COLOR',
            padding: '14px 16px',
            boxSizing: 'border-box',
            opacity: op,
            transform: `scale(${sc})`,
          }}>
            <div style={{ color: 'TEXT_ON_PRIMARY', fontSize: 22, fontWeight: 900, marginBottom: 8, lineHeight: 1.2, overflow: 'hidden' }}>{event.sector}</div>
            <div style={{ color: 'ACCENT_COLOR', fontSize: 17, fontWeight: 600, lineHeight: 1.3, overflow: 'hidden' }}>{event.tech}</div>
          </div>
        );
      })}

      {/* Bottom bar */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, width: 1920, height: 4, backgroundColor: 'PRIMARY_COLOR', opacity: titleOp }} />
    </div>
  );
};

export default AnimationComponent;
