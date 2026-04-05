import React, { useEffect, useRef } from 'react';
import { useCurrentFrame, interpolate, Easing, spring, useVideoConfig, delayRender, continueRender } from 'remotion';

// ─── Placeholders ─────────────────────────────────────────────────────────────
const TITLE       = 'TITLE_TEXT';
const BG_COLOR    = 'BACKGROUND_COLOR';
const ACCENT      = 'ACCENT_COLOR';
const PRIMARY     = 'PRIMARY_COLOR';

const IMAGE_URL_1 = 'IMAGE_URL_1';
const IMAGE_URL_2 = 'IMAGE_URL_2';
const IMAGE_URL_3 = 'IMAGE_URL_3';
const IMAGE_URL_4 = 'IMAGE_URL_4';
const IMAGE_URL_5 = 'IMAGE_URL_5';
const IMAGE_URL_6 = 'IMAGE_URL_6';

const LABEL_1     = 'LABEL_1';
const LABEL_2     = 'LABEL_2';
const LABEL_3     = 'LABEL_3';
const LABEL_4     = 'LABEL_4';
const LABEL_5     = 'LABEL_5';
const LABEL_6     = 'LABEL_6';
// ─────────────────────────────────────────────────────────────────────────────

const images = [IMAGE_URL_1, IMAGE_URL_2, IMAGE_URL_3, IMAGE_URL_4, IMAGE_URL_5, IMAGE_URL_6].filter(u => u && !u.startsWith('IMAGE_URL_'));
const labels = [LABEL_1, LABEL_2, LABEL_3, LABEL_4, LABEL_5, LABEL_6];

const hasTitle    = TITLE && !TITLE.startsWith('TITLE_TEXT');
const bgColor     = (BG_COLOR && !BG_COLOR.startsWith('BACKGROUND_COLOR')) ? BG_COLOR : '#0f172a';
const accentColor = (ACCENT && !ACCENT.startsWith('ACCENT_COLOR')) ? ACCENT : '#f59e0b';
const primaryColor = (PRIMARY && !PRIMARY.startsWith('PRIMARY_COLOR')) ? PRIMARY : '#3b82f6';

// Grid layouts per image count
const getGridLayout = (count: number): { cols: number; rows: number; cellW: number; cellH: number; offsetX: number; offsetY: number } => {
  const PAD = 40;
  const GAP = 12;
  const TITLE_H = hasTitle ? 100 : 0;
  const availW = 1920 - PAD * 2;
  const availH = 1080 - PAD * 2 - TITLE_H;

  if (count <= 1) return { cols: 1, rows: 1, cellW: availW, cellH: availH, offsetX: PAD, offsetY: PAD + TITLE_H };
  if (count === 2) return { cols: 2, rows: 1, cellW: (availW - GAP) / 2, cellH: availH, offsetX: PAD, offsetY: PAD + TITLE_H };
  if (count === 3) return { cols: 3, rows: 1, cellW: (availW - GAP * 2) / 3, cellH: availH, offsetX: PAD, offsetY: PAD + TITLE_H };
  if (count === 4) return { cols: 2, rows: 2, cellW: (availW - GAP) / 2, cellH: (availH - GAP) / 2, offsetX: PAD, offsetY: PAD + TITLE_H };
  if (count === 5) return { cols: 3, rows: 2, cellW: (availW - GAP * 2) / 3, cellH: (availH - GAP) / 2, offsetX: PAD, offsetY: PAD + TITLE_H };
  return { cols: 3, rows: 2, cellW: (availW - GAP * 2) / 3, cellH: (availH - GAP) / 2, offsetX: PAD, offsetY: PAD + TITLE_H };
};

const REVEAL_STAGGER = 18; // frames between each cell reveal

const GridCell: React.FC<{
  src: string; label: string; index: number;
  x: number; y: number; w: number; h: number;
}> = ({ src, label, index, x, y, w, h }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const handle = useRef(delayRender('Loading grid image'));

  useEffect(() => {
    const img = new window.Image();
    img.onload  = () => continueRender(handle.current);
    img.onerror = () => continueRender(handle.current);
    img.src = src;
  }, [src]);

  const revealFrame = index * REVEAL_STAGGER;
  const relFrame    = Math.max(0, frame - revealFrame);

  const scale   = spring({ frame: relFrame, fps, config: { damping: 16, stiffness: 120, mass: 0.9 } });
  const opacity = interpolate(relFrame, [0, 12], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const hasLabel = label && !label.startsWith('LABEL_');

  // Scan line effect — appears briefly when the cell reveals
  const scanOp = interpolate(relFrame, [0, 8, 20, 30], [0, 0.6, 0.3, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const scanY  = interpolate(relFrame, [0, 20], [0, h], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <div style={{
      position: 'absolute', left: x, top: y, width: w, height: h,
      transform: `scale(${scale})`, transformOrigin: 'center center',
      opacity,
      overflow: 'hidden',
      borderRadius: 8,
      boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
    }}>
      <img src={src} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />

      {/* Scan line reveal */}
      <div style={{
        position: 'absolute', top: scanY, left: 0, right: 0, height: 2,
        backgroundColor: accentColor, opacity: scanOp,
        boxShadow: `0 0 8px ${accentColor}`,
      }} />

      {/* Label overlay */}
      {hasLabel && (
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
          padding: '20px 16px 12px',
          opacity: interpolate(relFrame, [20, 35], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
        }}>
          <span style={{
            color: '#fff', fontSize: Math.max(14, Math.min(22, w / 14)),
            fontWeight: 700, fontFamily: 'Inter, system-ui, sans-serif',
            display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {label}
          </span>
        </div>
      )}

      {/* Corner bracket (top-left) */}
      <div style={{ position: 'absolute', top: 8, left: 8, width: 20, height: 20,
        borderTop: `3px solid ${accentColor}`, borderLeft: `3px solid ${accentColor}`,
        opacity: interpolate(relFrame, [10, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
      }} />
      <div style={{ position: 'absolute', bottom: hasLabel ? 52 : 8, right: 8, width: 20, height: 20,
        borderBottom: `3px solid ${accentColor}`, borderRight: `3px solid ${accentColor}`,
        opacity: interpolate(relFrame, [10, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
      }} />
    </div>
  );
};

export const AnimationComponent: React.FC = () => {
  const frame = useCurrentFrame();

  if (images.length === 0) {
    return (
      <div style={{ position: 'absolute', inset: 0, backgroundColor: bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 32 }}>No images uploaded</span>
      </div>
    );
  }

  const bgOp    = interpolate(frame, [0, 15], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const titleOp = interpolate(frame, [0, 22], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const count  = Math.min(images.length, 6);
  const layout = getGridLayout(count);
  const GAP    = 12;

  return (
    <div style={{ position: 'absolute', inset: 0, backgroundColor: bgColor, overflow: 'hidden', opacity: bgOp }}>
      {/* Background grid texture */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
      }} />

      {/* Title */}
      {hasTitle && (
        <div style={{
          position: 'absolute', top: layout.offsetY - 70, left: layout.offsetX, zIndex: 10,
          opacity: titleOp,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 6, height: 36, backgroundColor: primaryColor, borderRadius: 3 }} />
            <span style={{ fontSize: 40, fontWeight: 900, color: '#fff', fontFamily: 'Inter, system-ui, sans-serif', letterSpacing: '-0.01em' }}>
              {TITLE}
            </span>
          </div>
        </div>
      )}

      {/* Grid cells */}
      {images.slice(0, count).map((src, i) => {
        const col = i % layout.cols;
        const row = Math.floor(i / layout.cols);
        const x = layout.offsetX + col * (layout.cellW + GAP);
        const y = layout.offsetY + row * (layout.cellH + GAP);

        return (
          <GridCell
            key={i}
            src={src}
            label={labels[i]}
            index={i}
            x={x} y={y}
            w={layout.cellW} h={layout.cellH}
          />
        );
      })}
    </div>
  );
};

export default AnimationComponent;
