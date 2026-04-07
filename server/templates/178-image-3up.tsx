import React, { useEffect, useRef } from 'react';
import { useCurrentFrame, interpolate, useVideoConfig, delayRender, continueRender } from 'remotion';

// ─── Placeholders ─────────────────────────────────────────────────────────────
const TITLE_TEXT   = 'TITLE_TEXT';
const IMAGE_URL_1  = 'IMAGE_URL_1';
const IMAGE_URL_2  = 'IMAGE_URL_2';
const IMAGE_URL_3  = 'IMAGE_URL_3';
const LABEL_1      = 'LABEL_1';
const LABEL_2      = 'LABEL_2';
const LABEL_3      = 'LABEL_3';
const SUGGESTION_1 = 'SUGGESTION_1';
const SUGGESTION_2 = 'SUGGESTION_2';
const SUGGESTION_3 = 'SUGGESTION_3';
// ─────────────────────────────────────────────────────────────────────────────

const PAD     = 80;
const GAP     = 48;
const TITLE_H = 96;
const TOP     = PAD + TITLE_H + GAP;
const CELL_H  = 1080 - TOP - PAD;
const CELL_W  = Math.floor((1920 - PAD * 2 - GAP * 2) / 3);  // 581

const BLUE    = '#3b82f6';
const BG      = '#060d1e';
const CELL_BG = 'rgba(8,18,50,0.95)';
const hasTitle = TITLE_TEXT && !TITLE_TEXT.startsWith('TITLE_');

const cells = [
  { src: IMAGE_URL_1, label: LABEL_1, suggestion: SUGGESTION_1, x: PAD,                         delay: 5  },
  { src: IMAGE_URL_2, label: LABEL_2, suggestion: SUGGESTION_2, x: PAD + CELL_W + GAP,           delay: 12 },
  { src: IMAGE_URL_3, label: LABEL_3, suggestion: SUGGESTION_3, x: PAD + (CELL_W + GAP) * 2,     delay: 19 },
];

// ─── ImageCell ────────────────────────────────────────────────────────────────
const ImageCell: React.FC<{
  src: string; label: string; suggestion: string;
  x: number; y: number; w: number; h: number; delay: number;
}> = ({ src, label, suggestion, x, y, w, h, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const handle = useRef<number | null>(null);
  const hasImg = src && !src.startsWith('IMAGE_URL_');
  const hasLbl = label && !label.startsWith('LABEL_');
  const hasSug = suggestion && !suggestion.startsWith('SUGGESTION_');

  useEffect(() => {
    if (!hasImg) return;
    handle.current = delayRender('Loading image');
    const img = new window.Image();
    img.onload  = () => continueRender(handle.current!);
    img.onerror = () => continueRender(handle.current!);
    img.src = src;
  }, [src]);

  const rel   = Math.max(0, frame - delay);
  const op    = interpolate(rel, [0, 22], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const sc    = interpolate(rel, [0, 28], [0.95, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const lblY  = interpolate(rel, [12, 32], [14, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const lblOp = interpolate(rel, [16, 34], [0, 1],   { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, opacity: op, transform: `scale(${sc})`, transformOrigin: 'center' }}>
      <div style={{ position: 'absolute', inset: -2, borderRadius: 16, background: 'rgba(59,130,246,0.10)', filter: 'blur(6px)', opacity: hasImg ? 0.8 : 0.4 }} />
      <div style={{
        position: 'absolute', inset: 0, borderRadius: 14, overflow: 'hidden',
        border: hasImg ? '2px solid rgba(59,130,246,0.7)' : '2px dashed rgba(59,130,246,0.4)',
        backgroundColor: CELL_BG,
      }}>
        {hasImg ? (
          <img src={src} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 28, boxSizing: 'border-box', textAlign: 'center' }}>
            <div style={{ fontSize: 56, marginBottom: 16, opacity: 0.25 }}>🖼</div>
            {hasSug && (
              <div style={{ color: 'rgba(148,163,184,0.75)', fontSize: 20, fontFamily: 'Inter,system-ui,sans-serif', fontWeight: 500, lineHeight: 1.5 }}>
                {suggestion}
              </div>
            )}
          </div>
        )}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg,${BLUE},transparent)`, opacity: 0.7 }} />
        {hasLbl && hasImg && (
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            background: 'linear-gradient(transparent,rgba(2,8,24,0.92))',
            padding: '44px 18px 16px',
            transform: `translateY(${lblY}px)`, opacity: lblOp,
          }}>
            <span style={{ color: '#fff', fontSize: 24, fontWeight: 800, fontFamily: 'Inter,system-ui,sans-serif', display: 'block', textShadow: '0 2px 8px rgba(0,0,0,0.9)' }}>
              {label}
            </span>
          </div>
        )}
        <div style={{ position: 'absolute', top: 10, left: 10, width: 20, height: 20, borderTop: `3px solid ${BLUE}`, borderLeft: `3px solid ${BLUE}`, opacity: 0.7 }} />
        <div style={{ position: 'absolute', bottom: 10, right: 10, width: 20, height: 20, borderBottom: `3px solid ${BLUE}`, borderRight: `3px solid ${BLUE}`, opacity: 0.7 }} />
      </div>
    </div>
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────────
export const AnimationComponent: React.FC = () => {
  const frame   = useCurrentFrame();
  const bgOp    = interpolate(frame, [0, 18], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const titleOp = interpolate(frame, [0, 24], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const titleX  = interpolate(frame, [0, 24], [-30, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <div style={{ position: 'absolute', inset: 0, backgroundColor: BG, overflow: 'hidden', opacity: bgOp }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(59,130,246,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(59,130,246,0.04) 1px,transparent 1px)', backgroundSize: '80px 80px' }} />
      {hasTitle && (
        <div style={{ position: 'absolute', left: PAD, top: PAD, opacity: titleOp, transform: `translateX(${titleX}px)`, display: 'flex', alignItems: 'center', gap: 18 }}>
          <div style={{ width: 5, height: 42, backgroundColor: BLUE, borderRadius: 3 }} />
          <span style={{ fontSize: 48, fontWeight: 900, color: '#fff', fontFamily: 'Inter,system-ui,sans-serif', letterSpacing: '-0.02em' }}>{TITLE_TEXT}</span>
        </div>
      )}
      {cells.map((c, i) => (
        <ImageCell key={i} src={c.src} label={c.label} suggestion={c.suggestion} x={c.x} y={TOP} w={CELL_W} h={CELL_H} delay={c.delay} />
      ))}
    </div>
  );
};

export default AnimationComponent;
