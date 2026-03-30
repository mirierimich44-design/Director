import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, Img, staticFile, Easing } from 'remotion';

export const AnimationComponent = () => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();

  const name = 'SUBJECT_NAME';
  const subtitle = 'SUBTITLE';
  const imageUrl = 'IMAGE_URL';
  const fact1Label = 'FACT_1_LABEL';
  const fact1Value = 'FACT_1_VALUE';
  const fact2Label = 'FACT_2_LABEL';
  const fact2Value = 'FACT_2_VALUE';
  const description = 'DESCRIPTION';

  // Entrance Animations
  const cardOp = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const cardScale = interpolate(frame, [0, 25], [0.95, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.quad) });
  const cardTy = interpolate(frame, [0, 25], [50, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const contentOp = interpolate(frame, [20, 40], [0, 1], { extrapolateLeft: 'clamp' });
  const imageScale = interpolate(frame, [25, 50], [1.1, 1], { extrapolateLeft: 'clamp', easing: Easing.out(Easing.quad) });

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
      {/* Background Tech Grid */}
      <div style={{
        position: 'absolute', width: '100%', height: '100%',
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
        backgroundSize: '100px 100px',
        opacity: 0.5
      }} />

      {/* Wikipedia-style Knowledge Card (Heavy Glass) */}
      <div style={{
        position: 'relative', width: 1200, height: 800,
        backgroundColor: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(32px)',
        borderRadius: 32, border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 40px 100px rgba(0,0,0,0.6)',
        display: 'flex', overflow: 'hidden',
        opacity: cardOp, transform: `scale(${cardScale}) translateY(${cardTy}px)`
      }}>
        
        {/* Left Side: Image & Facts */}
        <div style={{ width: 400, borderRight: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column' }}>
          {/* Image Placeholder or Actual Image */}
          <div style={{ width: 400, height: 400, backgroundColor: 'rgba(255,255,255,0.02)', overflow: 'hidden', position: 'relative' }}>
             {resolvedImageUrl ? (
                 <Img src={resolvedImageUrl} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${imageScale})` }} />
             ) : (
                 <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 20 }}>
                    <div style={{ width: 120, height: 120, borderRadius: '50%', border: '4px dashed rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ width: 60, height: 60, borderRadius: '50%', backgroundColor: 'PRIMARY_COLOR', opacity: 0.2 }} />
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: 14, fontWeight: 800, letterSpacing: '0.1em' }}>NO_IMAGE_SOURCE</div>
                 </div>
             )}
             <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: 4, backgroundColor: 'PRIMARY_COLOR', boxShadow: '0 0 15px PRIMARY_COLOR' }} />
          </div>

          {/* Quick Facts List */}
          <div style={{ padding: '40px', flex: 1, display: 'flex', flexDirection: 'column', gap: 32, opacity: contentOp }}>
             <div>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>{fact1Label}</div>
                <div style={{ color: '#fff', fontSize: 24, fontWeight: 700 }}>{fact1Value}</div>
             </div>
             <div>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>{fact2Label}</div>
                <div style={{ color: '#fff', fontSize: 24, fontWeight: 700 }}>{fact2Value}</div>
             </div>
          </div>
        </div>

        {/* Right Side: Content */}
        <div style={{ flex: 1, padding: '80px', display: 'flex', flexDirection: 'column', opacity: contentOp }}>
           <div style={{ 
               backgroundColor: 'rgba(79, 195, 247, 0.1)', color: '#4fc3f7',
               padding: '8px 20px', borderRadius: 8, fontSize: 16, fontWeight: 900,
               alignSelf: 'flex-start', letterSpacing: '0.1em', marginBottom: 32
           }}>
             KNOWLEDGE_DATABASE // ENTRY_081
           </div>

           <div style={{ fontSize: 80, fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1, marginBottom: 16 }}>
             {name}
           </div>
           
           <div style={{ fontSize: 28, fontWeight: 600, color: 'PRIMARY_COLOR', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 48 }}>
             {subtitle}
           </div>

           <div style={{ height: 2, width: 80, backgroundColor: 'rgba(255,255,255,0.1)', marginBottom: 48 }} />

           <div style={{ fontSize: 26, color: 'rgba(255,255,255,0.8)', lineHeight: 1.6, fontWeight: 500 }}>
             {description}
           </div>

           {/* Footer branding */}
           <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 12, opacity: 0.3 }}>
              <div style={{ width: 24, height: 24, backgroundColor: '#fff', borderRadius: 4 }} />
              <div style={{ fontSize: 18, fontWeight: 900, color: '#fff', letterSpacing: '0.1em' }}>WIKIPEDIA</div>
           </div>
        </div>

      </div>
    </div>
  );
};

export default AnimationComponent;