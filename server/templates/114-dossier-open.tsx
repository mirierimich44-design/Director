import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, Img, staticFile, Easing } from 'remotion';

export const AnimationComponent = () => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();

  const name = 'SUBJECT_NAME';
  const alias = 'ALIAS_TEXT';
  const ttp1 = 'TTP_1';
  const ttp2 = 'TTP_2';
  const threatLevel = 'THREAT_LEVEL';
  const imageUrl = 'IMAGE_URL'; // Support for the new upload field

  // Entrance Timings
  const entryStart = 10;
  const folderOp = interpolate(frame, [entryStart, entryStart + 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const folderTy = interpolate(frame, [entryStart, entryStart + 25], [30, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.quad) });

  const contentOp = interpolate(frame, [entryStart + 20, entryStart + 40], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const badgeStart = entryStart + 50;
  const badgeOp = interpolate(frame, [badgeStart, badgeStart + 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const resolvedImageUrl = useMemo(() => {
      if (!imageUrl || imageUrl.startsWith('IMAGE_')) return null;
      if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) return imageUrl;
      if (/.(jpg|jpeg|png|gif|webp|svg|avif)$/i.test(imageUrl)) return staticFile(imageUrl);
      return null;
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
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
        backgroundSize: '120px 120px',
        opacity: 0.5
      }} />

      {/* Main Dossier Panel (Heavy Glass) */}
      <div style={{
        position: 'relative', width: 1300, height: 850,
        backgroundColor: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(32px)',
        borderRadius: 40, border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 50px 100px rgba(0,0,0,0.92)',
        display: 'flex', overflow: 'hidden',
        opacity: folderOp, transform: `translateY(${folderTy}px)`
      }}>
        
        {/* Left Sidebar: Photo & Stats */}
        <div style={{ width: 450, borderRight: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <div style={{ padding: '40px', backgroundColor: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ color: 'PRIMARY_COLOR', fontSize: 16, fontWeight: 900, letterSpacing: '0.2em', marginBottom: 8 }}>FORENSIC_DOSSIER</div>
            <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14, fontFamily: 'monospace' }}>FILE_ID: 0xFD-772-ALPHA</div>
          </div>

          {/* Subject Photo */}
          <div style={{ width: 450, height: 450, backgroundColor: '#000', overflow: 'hidden', position: 'relative' }}>
             {resolvedImageUrl ? (
                 <Img src={resolvedImageUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
             ) : (
                 <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 20 }}>
                    <div style={{ width: 140, height: 140, borderRadius: '50%', border: '4px dashed rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ color: 'rgba(255,255,255,0.1)', fontSize: 80 }}>👤</div>
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: 14, fontWeight: 800, letterSpacing: '0.1em' }}>MISSING_DATA_ASSET</div>
                 </div>
             )}
             <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: 6, backgroundColor: 'PRIMARY_COLOR', boxShadow: '0 0 20px PRIMARY_COLOR' }} />
          </div>

          {/* Quick Metrics */}
          <div style={{ flex: 1, padding: '40px', display: 'flex', flexDirection: 'column', gap: 32, opacity: contentOp }}>
             <div>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Primary Alias</div>
                <div style={{ color: 'PRIMARY_COLOR', fontSize: 24, fontWeight: 700, fontFamily: 'monospace' }}>{alias}</div>
             </div>
             <div style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.05)' }} />
             <div style={{ display: 'flex', gap: 20 }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#2a9d5c', boxShadow: '0 0 10px #2a9d5c' }} />
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, fontWeight: 700 }}>SESSION_ACTIVE_RETRACE</div>
             </div>
          </div>
        </div>

        {/* Right Content Area */}
        <div style={{ flex: 1, padding: '80px', display: 'flex', flexDirection: 'column', opacity: contentOp }}>
           <div style={{ fontSize: 80, fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1, marginBottom: 20 }}>
             {name}
           </div>
           
           <div style={{ fontSize: 24, fontWeight: 600, color: 'PRIMARY_COLOR', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 60 }}>
             IDENTIFIED_THREAT_ACTOR
           </div>

           <div style={{ height: 2, width: 100, backgroundColor: 'rgba(255,255,255,0.1)', marginBottom: 60 }} />

           <div style={{ marginBottom: 40 }}>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 16, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 24 }}>Tactics & Procedures (TTPs)</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                 {[ttp1, ttp2].map((ttp, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                       <div style={{ padding: '8px 16px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 8, color: 'ACCENT_COLOR', fontFamily: 'monospace', fontWeight: 900 }}>MET_0{i+1}</div>
                       <div style={{ fontSize: 28, color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>{ttp}</div>
                    </div>
                 ))}
              </div>
           </div>

           {/* Floating Badge (Glassmorphic) */}
           <div style={{
               position: 'absolute', top: 60, right: 60,
               padding: '16px 32px', backgroundColor: 'rgba(230, 57, 70, 0.15)',
               backdropFilter: 'blur(12px)', borderRadius: 20, border: '2px solid #e63946',
               display: 'flex', flexDirection: 'column', alignItems: 'center',
               opacity: badgeOp,
               boxShadow: '0 0 30px rgba(230,57,70,0.45)'
           }}>
              <div style={{ color: '#e63946', fontSize: 14, fontWeight: 900, letterSpacing: '0.1em', marginBottom: 4 }}>THREAT_LEVEL</div>
              <div style={{ color: '#fff', fontSize: 32, fontWeight: 900 }}>{threatLevel}</div>
           </div>

           {/* Footer detail */}
           <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 12, opacity: 0.2 }}>
              <div style={{ fontSize: 14, fontWeight: 900, color: '#fff', letterSpacing: '0.1em', fontFamily: 'monospace' }}>SECURE_ENCRYPTION_LOCKED // AES-256</div>
           </div>
        </div>

      </div>
    </div>
  );
};

export default AnimationComponent;