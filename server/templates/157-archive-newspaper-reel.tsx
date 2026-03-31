import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, Img, staticFile, Easing } from 'remotion';

export const AnimationComponent = () => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();

  const h1 = 'HEADLINE_1';
  const h2 = 'HEADLINE_2';
  const targetH = 'TARGET_HEADLINE';
  const pub = 'PUBLICATION_NAME';
  const date = 'DATE_TEXT';
  const imageUrl = 'IMAGE_URL';

  // 1. Reel Motion (0s to 3s)
  const reelProgress = interpolate(frame, [0, 90], [0, 1], { extrapolateRight: 'clamp', easing: Easing.inOut(Easing.quad) });
  const reelY = interpolate(reelProgress, [0, 1], [0, -1200]);

  // 2. Highlight/Zoom Phase (3s to 5s)
  const highlightStart = 90;
  const zoomProgress = interpolate(frame, [highlightStart, highlightStart + 60], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.quad) });
  
  const cardScale = interpolate(zoomProgress, [0, 1], [1, 1.4]);
  const cardRotate = interpolate(zoomProgress, [0, 1], [-10, 0]);
  const cardOp = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp' });

  const resolvedImageUrl = useMemo(() => {
    if (!imageUrl || imageUrl.startsWith('IMAGE_')) return null;
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) return imageUrl;
    if (/.(jpg|jpeg|png|gif|webp|svg|avif)$/i.test(imageUrl)) return staticFile(imageUrl);
    return null;
  }, [imageUrl]);

  const NewspaperPage = ({ headline, isTarget = false }: { headline: string, isTarget?: boolean }) => (
    <div style={{
        width: 900, height: 1200, backgroundColor: '#f4f1ea', border: '1px solid #d1cec7',
        padding: '60px', display: 'flex', flexDirection: 'column', color: '#1a1a1a',
        boxShadow: '0 20px 50px rgba(0,0,0,0.77)', marginBottom: 200,
        transform: `perspective(1000px) rotateY(${isTarget ? cardRotate : -15}deg) scale(${isTarget ? cardScale : 1})`,
        zIndex: isTarget ? 10 : 1
    }}>
        <div style={{ textAlign: 'center', borderBottom: '4px double #333', paddingBottom: 20, marginBottom: 40 }}>
            <div style={{ fontFamily: 'Georgia, serif', fontSize: 32, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{pub}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: 14, fontWeight: 700, textTransform: 'uppercase' }}>
                <span>Vol. LXXIV ... No. 25,402</span>
                <span>{date}</span>
                <span>Price: 5 Cents</span>
            </div>
        </div>

        <div style={{ fontFamily: 'Georgia, serif', fontSize: 64, fontWeight: 900, lineHeight: 1, textAlign: 'center', marginBottom: 40 }}>
            {headline}
        </div>

        <div style={{ flex: 1, display: 'flex', gap: 30 }}>
            <div style={{ flex: 1, borderRight: '1px solid #ccc', paddingRight: 20 }}>
                <div style={{ width: '100%', height: 300, backgroundColor: '#ddd', marginBottom: 20, overflow: 'hidden' }}>
                    {isTarget && resolvedImageUrl && <Img src={resolvedImageUrl} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'sepia(0.5) contrast(1.2)' }} />}
                </div>
                <div style={{ fontSize: 12, lineHeight: 1.6, color: '#444' }}>
                   {"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.".repeat(3)}
                </div>
            </div>
            <div style={{ flex: 1, fontSize: 12, lineHeight: 1.6, color: '#444' }}>
               {"Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.".repeat(5)}
            </div>
        </div>
    </div>
  );

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden',
      backgroundColor: '#121212', display: 'flex', justifyContent: 'center', alignItems: 'center'
    }}>
      {/* Background Vignette */}
      <div style={{ position: 'absolute', width: '100%', height: '100%', boxShadow: 'inset 0 0 300px rgba(0,0,0,0.92)', zIndex: 20, pointerEvents: 'none' }} />

      <div style={{ 
          transform: `translateY(${reelY}px)`, 
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          opacity: cardOp
      }}>
         <NewspaperPage headline={h1} />
         <NewspaperPage headline={targetH} isTarget={true} />
         <NewspaperPage headline={h2} />
      </div>
    </div>
  );
};

export default AnimationComponent;