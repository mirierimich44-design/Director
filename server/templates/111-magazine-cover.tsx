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

  // Animations
  const bgScale = interpolate(frame, [0, 150], [1.05, 1], { extrapolateRight: 'clamp' });
  const opTitle = interpolate(frame, [10, 40], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const tyTitle = interpolate(frame, [10, 40], [30, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.quad) });
  
  const opSub = interpolate(frame, [35, 60], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const tySub = interpolate(frame, [35, 60], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const opStat1 = interpolate(frame, [60, 85], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const tyStat1 = interpolate(frame, [60, 85], [20, 0], { extrapolateLeft: 'clamp', easing: Easing.out(Easing.quad) });
  
  const opStat2 = interpolate(frame, [75, 100], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const tyStat2 = interpolate(frame, [75, 100], [20, 0], { extrapolateLeft: 'clamp', easing: Easing.out(Easing.quad) });

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, width: 1920, height: 1080,
      backgroundColor: 'BACKGROUND_COLOR', overflow: 'hidden',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      {/* Background Texture/Gradient Overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.05) 0%, transparent 80%)',
        opacity: 0.5, transform: `scale(${bgScale})`
      }} />

      {/* Magazine Masthead Style Title */}
      <div style={{
        position: 'absolute', top: 100, left: 0, width: '100%', textAlign: 'center',
        padding: '0 100px', boxSizing: 'border-box', opacity: opTitle, transform: `translateY(${tyTitle}px)`
      }}>
        <div style={{ 
            fontSize: 18, fontWeight: 900, color: 'PRIMARY_COLOR', letterSpacing: '0.5em', 
            marginBottom: 20, textTransform: 'uppercase', opacity: 0.6 
        }}>
          SPECIAL EDITION // VOL. 44
        </div>
        <h1 style={{
          fontSize: 160, fontWeight: 900, color: '#fff', margin: 0, lineHeight: 0.9,
          letterSpacing: '-0.04em', textTransform: 'uppercase',
          filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.3))'
        }}>
          {title}
        </h1>
      </div>

      {/* Subtitle/Lead Story */}
      <div style={{
        position: 'absolute', top: 440, left: '50%', transform: `translateX(-50%) translateY(${tySub}px)`,
        width: 1100, textAlign: 'center', opacity: opSub
      }}>
        <div style={{ height: 2, width: 80, backgroundColor: 'PRIMARY_COLOR', margin: '0 auto 32px' }} />
        <p style={{
          fontSize: 34, color: 'rgba(255,255,255,0.8)', fontWeight: 500,
          margin: 0, lineHeight: 1.4, fontStyle: 'italic'
        }}>
          {subtitle}
        </p>
      </div>

      {/* Bottom Features (Glassmorphism Cards) */}
      <div style={{
        position: 'absolute', bottom: 100, left: 160, width: 460,
        opacity: opStat1, transform: `translateY(${tyStat1}px)`,
        backgroundColor: 'rgba(255, 255, 255, 0.03)', backdropFilter: 'blur(30px)',
        border: '1px solid rgba(255,255,255,0.1)', borderRadius: 24, padding: 40,
        boxShadow: '0 40px 100px rgba(0,0,0,0.5)', overflow: 'hidden'
      }}>
        <div style={{ fontSize: 72, fontWeight: 900, color: 'PRIMARY_COLOR', lineHeight: 1 }}>{stat1}</div>
        <div style={{ fontSize: 18, color: '#fff', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 12, opacity: 0.6 }}>{label1}</div>
      </div>

      <div style={{
        position: 'absolute', bottom: 100, right: 160, width: 460,
        opacity: opStat2, transform: `translateY(${tyStat2}px)`,
        backgroundColor: 'rgba(255, 255, 255, 0.03)', backdropFilter: 'blur(30px)',
        border: '1px solid rgba(255,255,255,0.1)', borderRadius: 24, padding: 40,
        boxShadow: '0 40px 100px rgba(0,0,0,0.5)', textAlign: 'right', overflow: 'hidden'
      }}>
        <div style={{ fontSize: 72, fontWeight: 900, color: 'ACCENT_COLOR', lineHeight: 1 }}>{stat2}</div>
        <div style={{ fontSize: 18, color: '#fff', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 12, opacity: 0.6 }}>{label2}</div>
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