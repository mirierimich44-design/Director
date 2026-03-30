import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, Img, staticFile, Easing } from 'remotion';

export const AnimationComponent = () => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();

  const handle = 'USER_HANDLE';
  const name = 'USER_NAME';
  const postText = 'POST_TEXT';
  const repostsTarget = 'REPOST_COUNT';
  const likesTarget = 'LIKE_COUNT';
  const timestamp = 'TIMESTAMP';
  const imageUrl = 'IMAGE_URL';

  const parseNum = (val: string) => {
    const n = parseInt(val.replace(/[^0-9]/g, ''));
    return isNaN(n) ? 0 : n;
  };

  const targetReposts = useMemo(() => parseNum(repostsTarget), [repostsTarget]);
  const targetLikes = useMemo(() => parseNum(likesTarget), [likesTarget]);

  // Entrance
  const cardOp = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp' });
  const cardScale = interpolate(frame, [0, 25], [0.9, 1], { extrapolateLeft: 'clamp', easing: Easing.backOut });

  // Counter animation (starts at 2s)
  const counterStart = 60;
  const counterEnd = durationInFrames - 30;
  const counterProgress = interpolate(frame, [counterStart, counterEnd], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.quad) });

  const currentReposts = Math.floor(counterProgress * targetReposts);
  const currentLikes = Math.floor(counterProgress * targetLikes);

  const resolvedImageUrl = useMemo(() => {
    if (!imageUrl || imageUrl.startsWith('IMAGE_')) return null;
    if (imageUrl.startsWith('http')) return imageUrl;
    return staticFile(imageUrl);
  }, [imageUrl]);

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden',
      backgroundColor: 'BACKGROUND_COLOR', fontFamily: 'Inter, system-ui, sans-serif',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      {/* Background Decor */}
      <div style={{
        position: 'absolute', width: '100%', height: '100%',
        backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.03) 0%, transparent 80%)',
      }} />

      {/* Social Media Card (X/Twitter style) */}
      <div style={{
        position: 'relative', width: 900, backgroundColor: 'rgba(15, 23, 42, 0.95)',
        backdropFilter: 'blur(30px)', borderRadius: 24, border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 40px 100px rgba(0,0,0,0.6)', padding: '60px',
        opacity: cardOp, transform: `scale(${cardScale})`
      }}>
        
        {/* Header: Profile */}
        <div style={{ display: 'flex', gap: 24, marginBottom: 32 }}>
           <div style={{ width: 100, height: 100, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.05)', overflow: 'hidden', border: '2px solid PRIMARY_COLOR' }}>
              {resolvedImageUrl ? <Img src={resolvedImageUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', backgroundColor: 'PRIMARY_COLOR', opacity: 0.2 }} />}
           </div>
           <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ color: '#fff', fontSize: 28, fontWeight: 800 }}>{name}</div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 22 }}>{handle}</div>
           </div>
           <div style={{ marginLeft: 'auto', color: 'rgba(255,255,255,0.2)', fontSize: 32 }}>𝕏</div>
        </div>

        {/* Content Body */}
        <div style={{ color: '#fff', fontSize: 36, lineHeight: 1.4, fontWeight: 500, marginBottom: 40, letterSpacing: '-0.01em' }}>
           {postText}
        </div>

        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 20, marginBottom: 32, paddingBottom: 32, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
           {timestamp} • {new Date().toLocaleDateString()} • <span style={{ color: 'PRIMARY_COLOR', fontWeight: 700 }}>1.2M</span> Views
        </div>

        {/* Engagement Stats */}
        <div style={{ display: 'flex', gap: 60 }}>
           <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
              <span style={{ color: '#fff', fontSize: 32, fontWeight: 800 }}>{currentReposts.toLocaleString()}</span>
              <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 20, textTransform: 'uppercase', fontWeight: 600 }}>Reposts</span>
           </div>
           <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
              <span style={{ color: '#fff', fontSize: 32, fontWeight: 800 }}>{currentLikes.toLocaleString()}</span>
              <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 20, textTransform: 'uppercase', fontWeight: 600 }}>Likes</span>
           </div>
        </div>

        {/* Actions Placeholder */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 48, opacity: 0.2 }}>
           {['💬', '🔄', '❤️', '🔖', '📤'].map((icon, i) => <div key={i} style={{ fontSize: 28 }}>{icon}</div>)}
        </div>

      </div>

      {/* Forensic Tag */}
      <div style={{ position: 'absolute', bottom: 40, left: 40, opacity: 0.2 }}>
         <div style={{ color: '#fff', fontSize: 14, fontFamily: 'monospace' }}>SOURCE_INTEL: SOCIAL_ANALYSIS_NODE_7</div>
      </div>

    </div>
  );
};

export default AnimationComponent;