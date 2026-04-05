import React, { useEffect, useRef } from 'react';
import { useCurrentFrame, interpolate, useVideoConfig, delayRender, continueRender } from 'remotion';

// ─── Placeholders ─────────────────────────────────────────────────────────────
const TITLE_TEXT   = 'TITLE_TEXT';
const IMAGE_URL_1  = 'IMAGE_URL_1';
const IMAGE_URL_2  = 'IMAGE_URL_2';
const IMAGE_URL_3  = 'IMAGE_URL_3';
const IMAGE_URL_4  = 'IMAGE_URL_4';
const IMAGE_URL_5  = 'IMAGE_URL_5';
const IMAGE_URL_6  = 'IMAGE_URL_6';
const LABEL_1      = 'LABEL_1';
const LABEL_2      = 'LABEL_2';
const LABEL_3      = 'LABEL_3';
const LABEL_4      = 'LABEL_4';
const LABEL_5      = 'LABEL_5';
const LABEL_6      = 'LABEL_6';
const SUGGESTION_1 = 'SUGGESTION_1';
const SUGGESTION_2 = 'SUGGESTION_2';
const SUGGESTION_3 = 'SUGGESTION_3';
const SUGGESTION_4 = 'SUGGESTION_4';
const SUGGESTION_5 = 'SUGGESTION_5';
const SUGGESTION_6 = 'SUGGESTION_6';
// ─────────────────────────────────────────────────────────────────────────────

const PAD     = 48;
const GAP     = 14;
const TITLE_H = 88;
const TOP     = PAD + TITLE_H + GAP;
const AVAIL_W = 1920 - PAD * 2;
const AVAIL_H = 1080 - TOP - PAD;
const CELL_W  = Math.floor((AVAIL_W - GAP * 2) / 3);
const CELL_H  = Math.floor((AVAIL_H - GAP) / 2);

const BLUE    = '#3b82f6';
const BG      = '#060d1e';
const CELL_BG = 'rgba(8,18,50,0.95)';
const hasTitle = TITLE_TEXT && !TITLE_TEXT.startsWith('TITLE_');

// 3×2 grid
const cells = [
  { src: IMAGE_URL_1, label: LABEL_1, suggestion: SUGGESTION_1, col: 0, row: 0, delay: 4  },
  { src: IMAGE_URL_2, label: LABEL_2, suggestion: SUGGESTION_2, col: 1, row: 0, delay: 10 },
  { src: IMAGE_URL_3, label: LABEL_3, suggestion: SUGGESTION_3, col: 2, row: 0, delay: 16 },
  { src: IMAGE_URL_4, label: LABEL_4, suggestion: SUGGESTION_4, col: 0, row: 1, delay: 22 },
  { src: IMAGE_URL_5, label: LABEL_5, suggestion: SUGGESTION_5, col: 1, row: 1, delay: 28 },
  { src: IMAGE_URL_6, label: LABEL_6, suggestion: SUGGESTION_6, col: 2, row: 1, delay: 34 },
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
  const lblY  = interpolate(rel, [12, 30], [10, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const lblOp = interpolate(rel, [16, 32], [0, 1],   { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, opacity: op, transform: `scale(${sc})`, transformOrigin: 'center' }}>
      <div style={{ position: 'absolute', inset: -2, borderRadius: 10, background: 'rgba(59,130,246,0.09)', filter: 'blur(5px)', opacity: hasImg ? 0.8 : 0.4 }} />
      <div style={{
        position: 'absolute', inset: 0, borderRadius: 7, overflow: 'hidden',
        border: hasImg ? '2px solid rgba(59,130,246,0.55)' : '2px dashed rgba(59,130,246,0.3)',
        backgroundColor: CELL_BG,
      }}>
        {hasImg ? (
          <img src={src} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20, boxSizing: 'border-box', textAlign: 'center' }}>
            <div style={{ fontSize: 38, marginBottom: 12, opacity: 0.25 }}>🖼</div>
            {hasSug && (
              <div style={{ color: 'rgba(148,163,184,0.75)', fontSize: 17, fontFamily: 'Inter,system-ui,sans-serif', fontWeight: 500, lineHeight: 1.4 }}>
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
            padding: '34px 14px 12px',
            transform: `translateY(${lblY}px)`, opacity: lblOp,
          }}>
            <span style={{ color: '#fff', fontSize: 18, fontWeight: 800, fontFamily: 'Inter,system-ui,sans-serif', display: 'block', textShadow: '0 2px 6px rgba(0,0,0,0.9)' }}>
              {label}
            </span>
          </div>
        )}
        <div style={{ position: 'absolute', top: 8, left: 8, width: 16, height: 16, borderTop: `2px solid ${BLUE}`, borderLeft: `2px solid ${BLUE}`, opacity: 0.7 }} />
        <div style={{ position: 'absolute', bottom: 8, right: 8, width: 16, height: 16, borderBottom: `2px solid ${BLUE}`, borderRight: `2px solid ${BLUE}`, opacity: 0.7 }} />
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
          <div style={{ width: 5, height: 40, backgroundColor: BLUE, borderRadius: 3 }} />
          <span style={{ fontSize: 44, fontWeight: 900, color: '#fff', fontFamily: 'Inter,system-ui,sans-serif', letterSpacing: '-0.02em' }}>{TITLE_TEXT}</span>
        </div>
      )}
      {cells.map((c, i) => (
        <ImageCell
          key={i}
          src={c.src} label={c.label} suggestion={c.suggestion}
          x={PAD + c.col * (CELL_W + GAP)}
          y={TOP  + c.row * (CELL_H + GAP)}
          w={CELL_W} h={CELL_H}
          delay={c.delay}
        />
      ))}
    </div>
  );
};

export default AnimationComponent;
