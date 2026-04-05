import React, { useEffect, useRef } from 'react';
import { useCurrentFrame, interpolate, Easing, spring, useVideoConfig, delayRender, continueRender } from 'remotion';

// ─── Placeholders ─────────────────────────────────────────────────────────────
const TITLE       = 'TITLE_TEXT';
const BG_COLOR    = 'BACKGROUND_COLOR';

const IMAGE_URL_1 = 'IMAGE_URL_1';
const IMAGE_URL_2 = 'IMAGE_URL_2';
const IMAGE_URL_3 = 'IMAGE_URL_3';
const IMAGE_URL_4 = 'IMAGE_URL_4';
const IMAGE_URL_5 = 'IMAGE_URL_5';
const IMAGE_URL_6 = 'IMAGE_URL_6';

const CAPTION_1   = 'CAPTION_1';
const CAPTION_2   = 'CAPTION_2';
const CAPTION_3   = 'CAPTION_3';
const CAPTION_4   = 'CAPTION_4';
const CAPTION_5   = 'CAPTION_5';
const CAPTION_6   = 'CAPTION_6';
// ─────────────────────────────────────────────────────────────────────────────

const images   = [IMAGE_URL_1, IMAGE_URL_2, IMAGE_URL_3, IMAGE_URL_4, IMAGE_URL_5, IMAGE_URL_6].filter(u => u && !u.startsWith('IMAGE_URL_'));
const captions = [CAPTION_1, CAPTION_2, CAPTION_3, CAPTION_4, CAPTION_5, CAPTION_6];

const hasTitle = TITLE && !TITLE.startsWith('TITLE_TEXT');
const bgColor  = (BG_COLOR && !BG_COLOR.startsWith('BACKGROUND_COLOR')) ? BG_COLOR : '#1a1a2e';

// Polaroid positions for 1–6 cards (centered, spread, fan)
const POSITIONS: { x: number; y: number; rot: number }[][] = [
  [{ x: 960, y: 500, rot: -1 }],
  [{ x: 660, y: 500, rot: -4 }, { x: 1260, y: 500, rot: 3 }],
  [{ x: 480, y: 500, rot: -5 }, { x: 960, y: 480, rot: 1 }, { x: 1440, y: 500, rot: -3 }],
  [{ x: 400, y: 430, rot: -6 }, { x: 760, y: 520, rot: 2 }, { x: 1160, y: 440, rot: -2 }, { x: 1520, y: 510, rot: 5 }],
  [{ x: 300, y: 450, rot: -7 }, { x: 620, y: 530, rot: 3 }, { x: 960, y: 460, rot: -1 }, { x: 1300, y: 520, rot: 4 }, { x: 1620, y: 450, rot: -5 }],
  [{ x: 260, y: 440, rot: -8 }, { x: 550, y: 530, rot: 2 }, { x: 840, y: 450, rot: -3 }, { x: 1080, y: 530, rot: 4 }, { x: 1370, y: 450, rot: -2 }, { x: 1660, y: 520, rot: 6 }],
];

const CARD_W    = 340;
const CARD_H    = 400;
const IMG_H     = 300;
const DROP_INTERVAL = 30; // frames between each polaroid drop

// ─── Single Polaroid Card ────────────────────────────────────────────────────
const PolaroidCard: React.FC<{ src: string; caption: string; pos: { x: number; y: number; rot: number }; dropFrame: number }> = ({ src, caption, pos, dropFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const handle = useRef(delayRender('Loading polaroid image'));

  useEffect(() => {
    const img = new window.Image();
    img.onload  = () => continueRender(handle.current);
    img.onerror = () => continueRender(handle.current);
    img.src = src;
  }, [src]);

  if (frame < dropFrame) return null;

  const relFrame = frame - dropFrame;
  const dropScale = spring({ frame: relFrame, fps, config: { damping: 14, stiffness: 100, mass: 0.8 } });
  const opacity   = interpolate(relFrame, [0, 8], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Drop from above
  const startY = pos.y - 500;
  const currentY = interpolate(dropScale, [0, 1], [startY, pos.y]);

  const hasCaption = caption && !caption.startsWith('CAPTION_');

  return (
    <div style={{
      position: 'absolute',
      left: pos.x - CARD_W / 2,
      top: currentY - CARD_H / 2,
      width: CARD_W, height: CARD_H,
      transform: `rotate(${pos.rot}deg) scale(${dropScale})`,
      transformOrigin: 'center center',
      opacity,
      backgroundColor: '#fff',
      borderRadius: 4,
      padding: '12px 12px 48px',
      boxSizing: 'border-box',
      boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 4px 16px rgba(0,0,0,0.4)',
      zIndex: 10,
    }}>
      <img
        src={src}
        style={{ width: '100%', height: IMG_H, objectFit: 'cover', display: 'block', borderRadius: 2 }}
      />
      {hasCaption && (
        <div style={{ padding: '10px 4px 0', textAlign: 'center', fontFamily: "'Caveat', 'Comic Sans MS', cursive", fontSize: 18, color: '#333', lineHeight: 1.2 }}>
          {caption}
        </div>
      )}
    </div>
  );
};

// ─── Main composition ─────────────────────────────────────────────────────────
export const AnimationComponent: React.FC = () => {
  const frame = useCurrentFrame();

  if (images.length === 0) {
    return (
      <div style={{ position: 'absolute', inset: 0, backgroundColor: bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 32, fontFamily: 'Georgia, serif' }}>No images uploaded</span>
      </div>
    );
  }

  const count    = Math.min(images.length, 6);
  const positions = POSITIONS[count - 1];

  // Background gradient
  const bgOp = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const titleOp = interpolate(frame, [count * DROP_INTERVAL + 10, count * DROP_INTERVAL + 30], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <div style={{ position: 'absolute', inset: 0, backgroundColor: bgColor, overflow: 'hidden', opacity: bgOp }}>
      {/* Subtle texture */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(255,255,255,0.03) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.02) 0%, transparent 50%)',
      }} />

      {/* Polaroid cards */}
      {images.slice(0, count).map((src, i) => (
        <PolaroidCard
          key={i}
          src={src}
          caption={captions[i]}
          pos={positions[i]}
          dropFrame={i * DROP_INTERVAL}
        />
      ))}

      {/* Title */}
      {hasTitle && (
        <div style={{
          position: 'absolute', top: 50, left: 0, right: 0, textAlign: 'center',
          opacity: titleOp, zIndex: 20,
        }}>
          <span style={{ fontSize: 40, fontWeight: 900, color: '#fff', fontFamily: 'Inter, system-ui, sans-serif', textShadow: '0 2px 16px rgba(0,0,0,0.8)', letterSpacing: '0.05em' }}>
            {TITLE}
          </span>
        </div>
      )}
    </div>
  );
};

export default AnimationComponent;
