import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, Easing } from 'remotion';

export const AnimationComponent = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const title = 'TITLE_TEXT';
  const subtitle = 'SUBTITLE_TEXT';
  const stat1 = 'STAT_VALUE_1';
  const stat2 = 'STAT_VALUE_2';
  const label1 = 'LABEL_1';
  const label2 = 'LABEL_2';

  // Base Animations
  const opTitle = interpolate(frame, [10, 40], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const opSub = interpolate(frame, [35, 60], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const opStat1 = interpolate(frame, [60, 85], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const opStat2 = interpolate(frame, [75, 100], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <div style={{
      position: 'absolute', inset: 0,
      backgroundColor: 'BACKGROUND_COLOR', overflow: 'hidden',
      fontFamily: 'Inter, system-ui, sans-serif',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      {/* 16:9 Safe Container (80% width/height) */}
      <div style={{ width: 1536, height: 864, position: 'relative' }}>
        
        {/* Magazine Masthead Style Title */}
        <div style={{
          position: 'absolute', top: 60, left: 0, width: '100%', textAlign: 'center',
          opacity: opTitle
        }}>
          <div style={{ 
              fontSize: 16, fontWeight: 900, color: 'PRIMARY_COLOR', letterSpacing: '0.4em', 
              marginBottom: 16, textTransform: 'uppercase', opacity: 0.8
          }}>
            SPECIAL EDITION // DIRECTOR STUDIO
          </div>
          <h1 style={{
            fontSize: 110, fontWeight: 900, color: 'PRIMARY_COLOR', margin: 0, lineHeight: 0.95,
            letterSpacing: '-0.03em', textTransform: 'uppercase'
          }}>
            {title}
          </h1>
        </div>

        {/* Subtitle/Lead Story */}
        <div style={{
          position: 'absolute', top: 340, left: '50%', transform: `translateX(-50%)`,
          width: 900, textAlign: 'center', opacity: opSub
        }}>
          <div style={{ height: 2, width: 60, backgroundColor: 'ACCENT_COLOR', margin: '0 auto 24px' }} />
          <p style={{
            fontSize: 28, color: 'SUPPORT_COLOR', fontWeight: 500,
            margin: 0, lineHeight: 1.4
          }}>
            {subtitle}
          </p>
        </div>

        {/* Bottom Features (Glassmorphism Cards) */}
        <div style={{
          position: 'absolute', bottom: 60, left: 0, width: 420,
          opacity: opStat1,
          backgroundColor: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: 32,
          boxShadow: '0 20px 50px rgba(0,0,0,0.2)'
        }}>
          <div style={{ fontSize: 64, fontWeight: 900, color: 'PRIMARY_COLOR', lineHeight: 1 }}>{stat1}</div>
          <div style={{ fontSize: 16, color: 'SUPPORT_COLOR', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 8 }}>{label1}</div>
        </div>

        <div style={{
          position: 'absolute', bottom: 60, right: 0, width: 420,
          opacity: opStat2,
          backgroundColor: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: 32,
          boxShadow: '0 20px 50px rgba(0,0,0,0.2)', textAlign: 'right'
        }}>
          <div style={{ fontSize: 64, fontWeight: 900, color: 'ACCENT_COLOR', lineHeight: 1 }}>{stat2}</div>
          <div style={{ fontSize: 16, color: 'SUPPORT_COLOR', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 8 }}>{label2}</div>
        </div>

      </div>

      {/* Sidebar Details */}
      <div style={{ 
          position: 'absolute', top: '50%', left: 80, transform: 'translateY(-50%) rotate(-90deg)',
          color: 'rgba(255,255,255,0.2)', fontSize: 14, fontWeight: 900, letterSpacing: '0.3em'
      }}>
        ESTABLISHED 2024 // DIRECTOR STUDIO
      </div>
    </div>
  );
};

export default AnimationComponent;