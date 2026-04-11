import React, { useEffect, useRef } from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, Easing, Sequence, delayRender, continueRender } from 'remotion';

// ─── Placeholder values (replaced by templateFiller) ────────────────────────
const TITLE        = 'TITLE_TEXT';
const STYLE        = 'TRANSITION_STYLE';   // fade | slide-right | slide-left | slide-up | zoom | wipe
const FPS_STR      = 'FRAMES_PER_SLIDE';   // default 90
const TRANS_STR    = 'TRANSITION_FRAMES';  // default 25

const IMAGE_URL_1  = 'IMAGE_URL_1';
const IMAGE_URL_2  = 'IMAGE_URL_2';
const IMAGE_URL_3  = 'IMAGE_URL_3';
const IMAGE_URL_4  = 'IMAGE_URL_4';
const IMAGE_URL_5  = 'IMAGE_URL_5';
const IMAGE_URL_6  = 'IMAGE_URL_6';

const CAPTION_1    = 'CAPTION_1';
const CAPTION_2    = 'CAPTION_2';
const CAPTION_3    = 'CAPTION_3';
const CAPTION_4    = 'CAPTION_4';
const CAPTION_5    = 'CAPTION_5';
const CAPTION_6    = 'CAPTION_6';
// ────────────────────────────────────────────────────────────────────────────

const images   = [IMAGE_URL_1, IMAGE_URL_2, IMAGE_URL_3, IMAGE_URL_4, IMAGE_URL_5, IMAGE_URL_6].filter(u => u && !u.startsWith('IMAGE_URL_'));
const captions = [CAPTION_1, CAPTION_2, CAPTION_3, CAPTION_4, CAPTION_5, CAPTION_6];

const framesPerSlide  = parseInt(FPS_STR)   || 90;
const transitionFrames = parseInt(TRANS_STR) || 25;
const stride = framesPerSlide - transitionFrames;

const hasTitle = TITLE && !TITLE.startsWith('TITLE_TEXT');
const transitionStyle = (STYLE && !STYLE.startsWith('TRANSITION_STYLE')) ? STYLE : 'slide-right';

// ─── Single slide with enter/exit transition ─────────────────────────────────
const Slide: React.FC<{ src: string; caption: string; index: number; total: number }> = ({ src, caption, index, total }) => {
  const frame = useCurrentFrame();
  const handle = useRef(delayRender('Loading slide image'));

  useEffect(() => {
    const img = new window.Image();
    img.onload  = () => continueRender(handle.current);
    img.onerror = () => continueRender(handle.current);
    img.src = staticFile(src);
  }, [src]);

  const enterP = interpolate(frame, [0, transitionFrames], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
  const exitStart = framesPerSlide - transitionFrames;
  const exitP  = interpolate(frame, [exitStart, framesPerSlide], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.in(Easing.cubic) });

  const captionOp = interpolate(frame, [transitionFrames, transitionFrames + 18], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const hasCaption = caption && !caption.startsWith('CAPTION_');

  let transform = '';
  let opacity   = 1;

  switch (transitionStyle) {
    case 'fade':
      opacity = enterP * (1 - exitP * 0.9);
      break;
    case 'slide-left': {
      const ex = interpolate(enterP, [0, 1], [-1920, 0]);
      const exX = interpolate(exitP,  [0, 1], [0, 1920]);
      transform = `translateX(${ex + exX}px)`;
      break;
    }
    case 'slide-up': {
      const ey = interpolate(enterP, [0, 1], [1080, 0]);
      const eyX = interpolate(exitP,  [0, 1], [0, -1080]);
      transform = `translateY(${ey + eyX}px)`;
      break;
    }
    case 'zoom': {
      const scale = interpolate(enterP, [0, 1], [1.2, 1.0]);
      opacity = enterP * (1 - exitP);
      transform = `scale(${scale})`;
      break;
    }
    case 'wipe': {
      // Uses clipPath — handled via containerStyle below
      break;
    }
    case 'slide-right':
    default: {
      const ex = interpolate(enterP, [0, 1], [1920, 0]);
      const exX = interpolate(exitP,  [0, 1], [0, -1920]);
      transform = `translateX(${ex + exX}px)`;
      break;
    }
  }

  const clipPath = transitionStyle === 'wipe'
    ? `inset(0 ${interpolate(enterP, [0, 1], [100, 0])}% 0 0)`
    : undefined;

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', transform, opacity, clipPath }}>
      <img
        src={staticFile(src)}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
      />

      {/* Bottom caption */}
      {hasCaption && (
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 180,
          background: 'linear-gradient(transparent, rgba(0,0,0,0.85))',
          display: 'flex', alignItems: 'flex-end', padding: '0 80px 44px',
          opacity: captionOp,
        }}>
          <span style={{ color: '#fff', fontSize: 30, fontWeight: 700, fontFamily: 'Inter, system-ui, sans-serif', maxWidth: 1200, lineHeight: 1.4 }}>
            {caption}
          </span>
        </div>
      )}

      {/* Counter */}
      <div style={{
        position: 'absolute', top: 44, right: 64,
        color: 'rgba(255,255,255,0.75)', fontSize: 22, fontWeight: 700,
        fontFamily: 'JetBrains Mono, monospace', opacity: captionOp,
        background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)',
        padding: '6px 16px', borderRadius: 20,
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
        <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 32, fontFamily: 'Inter, sans-serif' }}>No images uploaded</span>
      </div>
    );
  }

  return (
    <div style={{ position: 'absolute', inset: 0, backgroundColor: '#000', overflow: 'hidden' }}>
      {images.map((src, i) => (
        <Sequence key={i} from={i * stride} durationInFrames={framesPerSlide} style={{ zIndex: i }}>
          <Slide src={src} caption={captions[i]} index={i} total={images.length} />
        </Sequence>
      ))}

      {/* Optional title badge (top-left) */}
      {hasTitle && (
        <div style={{
          position: 'absolute', top: 40, left: 60, zIndex: 999,
          backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(12px)',
          padding: '12px 28px', borderRadius: 8, borderLeft: '5px solid #fff',
        }}>
          <span style={{ color: '#fff', fontSize: 26, fontWeight: 900, fontFamily: 'Inter, system-ui, sans-serif', letterSpacing: '0.02em' }}>
            {TITLE}
          </span>
        </div>
      )}
    </div>
  );
};

export default AnimationComponent;
