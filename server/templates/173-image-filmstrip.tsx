import React, { useEffect, useRef } from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, Easing, delayRender, continueRender } from 'remotion';

// ─── Placeholders ─────────────────────────────────────────────────────────────
const TITLE       = 'TITLE_TEXT';
const BG_COLOR    = 'BACKGROUND_COLOR';
const ACCENT      = 'ACCENT_COLOR';
const DWELL_STR   = 'FRAMES_PER_SLIDE';  // frames focused on each image

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

const dwellFrames  = parseInt(DWELL_STR) || 80;
const scrollFrames = 30; // frames to scroll between images
const stride       = dwellFrames + scrollFrames;

const hasTitle  = TITLE && !TITLE.startsWith('TITLE_TEXT');
const bgColor   = (BG_COLOR && !BG_COLOR.startsWith('BACKGROUND_COLOR')) ? BG_COLOR : '#0d0d0d';
const accentColor = (ACCENT && !ACCENT.startsWith('ACCENT_COLOR')) ? ACCENT : '#f5c518';

// Film strip cell dimensions
const CELL_W    = 380;
const CELL_H    = 260;
const CELL_GAP  = 24;
const STRIP_Y   = 380;  // center Y of the film strip
const SPROCKET_R = 14;
const SPROCKET_SPACING = 46;

// ─── Sprocket holes row ──────────────────────────────────────────────────────
const SprocketRow: React.FC<{ y: number; totalWidth: number }> = ({ y, totalWidth }) => {
  const count = Math.ceil(totalWidth / SPROCKET_SPACING) + 2;
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: i * SPROCKET_SPACING - 10,
          top: y - SPROCKET_R,
          width: SPROCKET_R * 2, height: SPROCKET_R * 2,
          borderRadius: '50%',
          backgroundColor: bgColor,
          border: '2px solid rgba(255,255,255,0.15)',
        }} />
      ))}
    </>
  );
};

// ─── Main composition ─────────────────────────────────────────────────────────
export const AnimationComponent: React.FC = () => {
  const frame = useCurrentFrame();
  const { width } = useVideoConfig();

  if (images.length === 0) {
    return (
      <div style={{ position: 'absolute', inset: 0, backgroundColor: bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 32, fontFamily: 'monospace' }}>No images uploaded</span>
      </div>
    );
  }

  const totalStripWidth = images.length * (CELL_W + CELL_GAP) + 400;
  const centerX = width / 2;

  // Current focused image index (changes at each stride boundary)
  const focusIndex = Math.min(Math.floor(frame / stride), images.length - 1);

  // Target scroll position: center the focused image
  const targetScrollX = centerX - (focusIndex * (CELL_W + CELL_GAP) + CELL_W / 2);

  // Animated scroll — lerps between positions
  const scrollStart = focusIndex * stride;
  const scrollEnd   = scrollStart + scrollFrames;
  const prevTargetX = centerX - ((focusIndex - 1) * (CELL_W + CELL_GAP) + CELL_W / 2);

  const scrollX = interpolate(
    frame,
    [scrollStart, scrollEnd],
    [focusIndex === 0 ? targetScrollX : prevTargetX, targetScrollX],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic) }
  );

  const bgOp = interpolate(frame, [0, 15], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const titleOp = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <div style={{ position: 'absolute', inset: 0, backgroundColor: bgColor, overflow: 'hidden', opacity: bgOp }}>

      {/* Vignette */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none',
        background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.7) 100%)',
      }} />

      {/* Film strip track */}
      <div style={{
        position: 'absolute',
        top: STRIP_Y - CELL_H / 2 - 40,
        left: 0,
        width: '100%',
        height: CELL_H + 80,
        backgroundColor: '#1a1a1a',
        borderTop: '2px solid rgba(255,255,255,0.1)',
        borderBottom: '2px solid rgba(255,255,255,0.1)',
      }} />

      {/* Scrolling content */}
      <div style={{ position: 'absolute', top: 0, left: scrollX, width: totalStripWidth, height: 1080 }}>
        {/* Top sprockets */}
        <div style={{ position: 'absolute', top: STRIP_Y - CELL_H / 2 - 26, left: 0, width: totalStripWidth, height: 30 }}>
          <SprocketRow y={15} totalWidth={totalStripWidth} />
        </div>

        {/* Bottom sprockets */}
        <div style={{ position: 'absolute', top: STRIP_Y + CELL_H / 2 + 10, left: 0, width: totalStripWidth, height: 30 }}>
          <SprocketRow y={15} totalWidth={totalStripWidth} />
        </div>

        {/* Image cells */}
        {images.map((src, i) => {
          const cellLeft = i * (CELL_W + CELL_GAP) + 200;
          const isFocused = i === focusIndex;
          const focusScale = interpolate(frame, [focusIndex * stride + scrollFrames, focusIndex * stride + scrollFrames + 15], [isFocused ? 0.92 : 1, isFocused ? 1.05 : 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

          const hasCaption = captions[i] && !captions[i].startsWith('CAPTION_');
          const captionOp = isFocused
            ? interpolate(frame, [focusIndex * stride + scrollFrames + 10, focusIndex * stride + scrollFrames + 25], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
            : 0;

          return (
            <div key={i} style={{
              position: 'absolute',
              left: cellLeft, top: STRIP_Y - CELL_H / 2,
              width: CELL_W, height: CELL_H,
              transform: `scale(${isFocused ? focusScale : 0.88})`,
              transformOrigin: 'center center',
              transition: 'none',
              zIndex: isFocused ? 3 : 1,
            }}>
              <img src={staticFile(src)} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />

              {/* Focus highlight */}
              {isFocused && (
                <div style={{
                  position: 'absolute', inset: 0,
                  boxShadow: `0 0 0 4px ${accentColor}, 0 0 40px rgba(0,0,0,0.6)`,
                }} />
              )}

              {/* Caption below cell */}
              {hasCaption && (
                <div style={{
                  position: 'absolute', top: CELL_H + 12, left: 0, width: CELL_W, textAlign: 'center',
                  color: '#fff', fontSize: 18, fontFamily: 'Inter, sans-serif', fontWeight: 600,
                  opacity: captionOp, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                  {captions[i]}
                </div>
              )}

              {/* Image number */}
              <div style={{
                position: 'absolute', top: 8, right: 10,
                color: 'rgba(255,255,255,0.6)', fontSize: 13, fontFamily: 'monospace',
                background: 'rgba(0,0,0,0.5)', padding: '2px 7px', borderRadius: 4,
              }}>
                {String(i + 1).padStart(2, '0')}
              </div>
            </div>
          );
        })}
      </div>

      {/* Title */}
      {hasTitle && (
        <div style={{
          position: 'absolute', top: 52, left: 0, right: 0, textAlign: 'center',
          zIndex: 10, opacity: titleOp,
        }}>
          <span style={{ fontSize: 36, fontWeight: 900, color: '#fff', fontFamily: 'Inter, sans-serif', letterSpacing: '0.1em', textTransform: 'uppercase', textShadow: '0 2px 12px rgba(0,0,0,0.9)' }}>
            {TITLE}
          </span>
        </div>
      )}

      {/* Image indicator dots */}
      <div style={{
        position: 'absolute', bottom: 56, left: 0, right: 0, zIndex: 10,
        display: 'flex', justifyContent: 'center', gap: 12, opacity: titleOp,
      }}>
        {images.map((_, i) => (
          <div key={i} style={{
            width: i === focusIndex ? 24 : 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: i === focusIndex ? accentColor : 'rgba(255,255,255,0.3)',
            transition: 'none',
          }} />
        ))}
      </div>
    </div>
  );
};

export default AnimationComponent;
