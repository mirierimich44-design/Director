import React, { useEffect, useRef } from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, Easing, Sequence, delayRender, continueRender } from 'remotion';

// ─── Placeholders ─────────────────────────────────────────────────────────────
const TITLE       = 'TITLE_TEXT';
const FPS_STR     = 'FRAMES_PER_SLIDE';  // default 120 (4s per image)
const TRANS_STR   = 'TRANSITION_FRAMES'; // default 30

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

const framesPerSlide   = parseInt(FPS_STR)   || 120;
const transitionFrames = parseInt(TRANS_STR) || 30;
const stride = framesPerSlide - transitionFrames;

// Ken Burns movement patterns — cycled per image for variety
const KB_PATTERNS = [
  { fromScale: 1.0, toScale: 1.12, panX: [-20, 20],   panY: [0, -15] },   // zoom-in, pan-right
  { fromScale: 1.12, toScale: 1.0, panX: [20, -20],   panY: [-10, 10] },  // zoom-out, pan-left
  { fromScale: 1.0, toScale: 1.10, panX: [10, -10],   panY: [20, -20] },  // zoom-in, pan-up
  { fromScale: 1.08, toScale: 1.0, panX: [-15, 15],   panY: [-15, 15] },  // zoom-out, drift
  { fromScale: 1.0, toScale: 1.14, panX: [0, 0],      panY: [-25, 0]  },  // zoom-in, pan-up
  { fromScale: 1.12, toScale: 1.0, panX: [25, -25],   panY: [0, 0]    },  // zoom-out, pan-left
];

const hasTitle = TITLE && !TITLE.startsWith('TITLE_TEXT');

// ─── Ken Burns slide ──────────────────────────────────────────────────────────
const KBSlide: React.FC<{ src: string; caption: string; index: number; total: number }> = ({ src, caption, index, total }) => {
  const frame = useCurrentFrame();
  const handle = useRef(delayRender('Loading ken-burns image'));

  useEffect(() => {
    const img = new window.Image();
    img.onload  = () => continueRender(handle.current);
    img.onerror = () => continueRender(handle.current);
    img.src = staticFile(src);
  }, [src]);

  const pattern = KB_PATTERNS[index % KB_PATTERNS.length];
  const t = interpolate(frame, [0, framesPerSlide], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.linear });

  const scale = interpolate(t, [0, 1], [pattern.fromScale, pattern.toScale]);
  const panX  = interpolate(t, [0, 1], pattern.panX[0], pattern.panX[1]);
  const panY  = interpolate(t, [0, 1], pattern.panY[0], pattern.panY[1]);

  // Cross-fade: fade in at start, fade out at end
  const fadeIn  = interpolate(frame, [0, transitionFrames], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.quad) });
  const fadeOut = interpolate(frame, [framesPerSlide - transitionFrames, framesPerSlide], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.in(Easing.quad) });
  const opacity = Math.min(fadeIn, fadeOut);

  const captionOp = interpolate(frame, [transitionFrames, transitionFrames + 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const hasCaption = caption && !caption.startsWith('CAPTION_');

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', opacity }}>
      <img
        src={staticFile(src)}
        style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          objectFit: 'cover',
          transform: `scale(${scale}) translate(${panX}px, ${panY}px)`,
          transformOrigin: 'center center',
        }}
      />

      {/* Film grain overlay — subtle texture */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.03) 0px, rgba(0,0,0,0.03) 1px, transparent 1px, transparent 3px)',
        pointerEvents: 'none',
      }} />

      {/* Caption */}
      {hasCaption && (
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 160,
          background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
          display: 'flex', alignItems: 'flex-end', padding: '0 80px 36px',
          opacity: captionOp,
        }}>
          <span style={{ color: '#fff', fontSize: 28, fontWeight: 600, fontFamily: 'Georgia, serif', fontStyle: 'italic', maxWidth: 1100, lineHeight: 1.5 }}>
            {caption}
          </span>
        </div>
      )}

      {/* Image counter — subtle */}
      <div style={{
        position: 'absolute', bottom: 20, right: 60, opacity: captionOp * 0.6,
        color: '#fff', fontSize: 16, fontFamily: 'monospace', fontWeight: 600,
      }}>
        {index + 1} / {total}
      </div>
    </div>
  );
};

// ─── Main composition ─────────────────────────────────────────────────────────
export const AnimationComponent: React.FC = () => {
  if (images.length === 0) {
    return (
      <div style={{ position: 'absolute', inset: 0, backgroundColor: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 32, fontFamily: 'Georgia, serif' }}>No images uploaded</span>
      </div>
    );
  }

  return (
    <div style={{ position: 'absolute', inset: 0, backgroundColor: '#000', overflow: 'hidden' }}>
      {images.map((src, i) => (
        <Sequence key={i} from={i * stride} durationInFrames={framesPerSlide} style={{ zIndex: i }}>
          <KBSlide src={src} caption={captions[i]} index={i} total={images.length} />
        </Sequence>
      ))}

      {/* Title overlay — top left */}
      {hasTitle && (
        <div style={{
          position: 'absolute', top: 44, left: 60, zIndex: 999,
          borderLeft: '4px solid rgba(255,255,255,0.7)',
          paddingLeft: 20,
        }}>
          <span style={{ color: '#fff', fontSize: 28, fontWeight: 400, fontFamily: 'Georgia, serif', fontStyle: 'italic', textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>
            {TITLE}
          </span>
        </div>
      )}
    </div>
  );
};

export default AnimationComponent;
