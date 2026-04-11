import React, { useEffect, useRef } from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, Easing, spring, delayRender, continueRender } from 'remotion';

// ─── Placeholders ─────────────────────────────────────────────────────────────
const TITLE       = 'TITLE_TEXT';
const BG_COLOR    = 'BACKGROUND_COLOR';
const ACCENT      = 'ACCENT_COLOR';
const DWELL_STR   = 'FRAMES_PER_SLIDE';

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

const dwellFrames = parseInt(DWELL_STR) || 80;
const dealFrames  = 40;   // frames to deal top card forward
const stride      = dwellFrames + dealFrames;

const hasTitle    = TITLE && !TITLE.startsWith('TITLE_TEXT');
const bgColor     = (BG_COLOR && !BG_COLOR.startsWith('BACKGROUND_COLOR')) ? BG_COLOR : '#111827';
const accentColor = (ACCENT && !ACCENT.startsWith('ACCENT_COLOR')) ? ACCENT : '#f59e0b';

// Stack offsets: each card is slightly offset from the one above it
const STACK_OFFSET = 10; // px offset per card (x and y)
const CARD_W       = 1360;
const CARD_H       = 760;
const CARD_X       = (1920 - CARD_W) / 2;
const CARD_Y       = (1080 - CARD_H) / 2;

// Rotations for the stack (slightly varied per position)
const STACK_ROTS   = [0, 1.5, -1, 2, -2, 0.8];

const StackCard: React.FC<{ src: string; caption: string; index: number; totalCards: number; activeIndex: number }> = ({
  src, caption, index, totalCards, activeIndex,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const handle = useRef(delayRender('Loading stack image'));

  useEffect(() => {
    const img = new window.Image();
    img.onload  = () => continueRender(handle.current);
    img.onerror = () => continueRender(handle.current);
    img.src = staticFile(src);
  }, [src]);

  const hasCaption = caption && !caption.startsWith('CAPTION_');

  // Stack position in the deck (0 = top/active)
  const deckPos = index - activeIndex;

  // Cards that have already been dealt (index < activeIndex) — exit to the left
  if (index < activeIndex) {
    const exitFrame = index * stride + dwellFrames;
    const relFrame  = frame - exitFrame;
    const exitP     = interpolate(Math.min(relFrame, dealFrames), [0, dealFrames], [0, 1], {
      extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
      easing: Easing.inOut(Easing.quad),
    });
    const exitX = interpolate(exitP, [0, 1], [0, -2200]);
    const exitRot = interpolate(exitP, [0, 1], [0, -15]);
    const exitOp = interpolate(exitP, [0.8, 1], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

    return (
      <div style={{
        position: 'absolute',
        left: CARD_X, top: CARD_Y,
        width: CARD_W, height: CARD_H,
        transform: `translateX(${exitX}px) rotate(${exitRot}deg)`,
        opacity: exitOp,
        borderRadius: 12,
        overflow: 'hidden',
        zIndex: totalCards + index,
      }}>
        <img src={staticFile(src)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
    );
  }

  // Cards waiting in the deck (deckPos >= 0)
  if (deckPos < 0) return null;

  // Active card (deckPos === 0): animate "deal" up
  const dealStartFrame = index * stride;
  const dealRelFrame   = frame - dealStartFrame;

  const isActive = deckPos === 0;
  const dealP    = isActive
    ? interpolate(dealRelFrame, [0, 18], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.back(1.2)) })
    : 0;

  // Stack visual offsets — further back = smaller and more offset
  const backX   = deckPos * STACK_OFFSET;
  const backY   = deckPos * STACK_OFFSET;
  const backScale = 1 - deckPos * 0.03;
  const backOp  = deckPos > 3 ? 0 : 1;

  // Deal animation: active card lifts forward
  const dealY      = interpolate(dealP, [0, 1], [0, -30]);
  const dealScale  = interpolate(dealP, [0, 1], [backScale, 1.02]);
  const dealRot    = STACK_ROTS[deckPos % STACK_ROTS.length];

  const captionOp = isActive
    ? interpolate(dealRelFrame, [18, 36], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : 0;

  return (
    <div style={{
      position: 'absolute',
      left: CARD_X + backX, top: CARD_Y + backY + dealY,
      width: CARD_W, height: CARD_H,
      transform: `scale(${dealScale}) rotate(${dealRot}deg)`,
      transformOrigin: 'center center',
      opacity: backOp,
      borderRadius: 12,
      overflow: 'hidden',
      zIndex: totalCards - deckPos,
      boxShadow: isActive
        ? `0 40px 80px rgba(0,0,0,0.7), 0 0 0 3px ${accentColor}`
        : '0 20px 40px rgba(0,0,0,0.4)',
    }}>
      <img src={staticFile(src)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />

      {hasCaption && (
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 120,
          background: 'linear-gradient(transparent, rgba(0,0,0,0.85))',
          display: 'flex', alignItems: 'flex-end', padding: '0 48px 28px',
          opacity: captionOp,
        }}>
          <span style={{ color: '#fff', fontSize: 28, fontWeight: 700, fontFamily: 'Inter, sans-serif' }}>
            {caption}
          </span>
        </div>
      )}

      {/* Progress bar for this card */}
      {isActive && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 4,
          backgroundColor: 'rgba(255,255,255,0.15)',
        }}>
          <div style={{
            height: '100%',
            backgroundColor: accentColor,
            width: `${interpolate(dealRelFrame, [0, dwellFrames], [0, 100], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}%`,
          }} />
        </div>
      )}
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

  const bgOp = interpolate(frame, [0, 15], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const activeIndex = Math.min(Math.floor(frame / stride), images.length - 1);
  const titleOp = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <div style={{ position: 'absolute', inset: 0, backgroundColor: bgColor, overflow: 'hidden', opacity: bgOp }}>
      {/* Render cards back to front */}
      {images.map((src, i) => (
        <StackCard
          key={i}
          src={src}
          caption={captions[i]}
          index={i}
          totalCards={images.length}
          activeIndex={activeIndex}
        />
      ))}

      {/* Counter */}
      <div style={{
        position: 'absolute', bottom: 44, right: 60, zIndex: 100,
        color: 'rgba(255,255,255,0.7)', fontSize: 22, fontFamily: 'monospace', fontWeight: 700,
        background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)',
        padding: '8px 20px', borderRadius: 24,
      }}>
        {activeIndex + 1} / {images.length}
      </div>

      {hasTitle && (
        <div style={{
          position: 'absolute', top: 46, left: 60, zIndex: 100, opacity: titleOp,
          background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(10px)',
          padding: '12px 28px', borderRadius: 8, borderLeft: `5px solid ${accentColor}`,
        }}>
          <span style={{ color: '#fff', fontSize: 26, fontWeight: 800, fontFamily: 'Inter, sans-serif' }}>
            {TITLE}
          </span>
        </div>
      )}
    </div>
  );
};

export default AnimationComponent;
