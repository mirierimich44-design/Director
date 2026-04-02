import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

export const AnimationComponent = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const title = 'TITLE_TEXT';
  const subtitle = 'SUBTITLE_TEXT';
  const stat1 = 'STAT_VALUE_1';
  const stat2 = 'STAT_VALUE_2';
  const label1 = 'LABEL_1';
  const label2 = 'LABEL_2';

  const opTitle = interpolate(frame, [0, 30], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const tyTitle = interpolate(frame, [0, 30], [40, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  
  const opSub = interpolate(frame, [30, 60], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const tySub = interpolate(frame, [30, 60], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const opStat1 = interpolate(frame, [70, 100], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const opStat2 = interpolate(frame, [90, 120], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: 1920,
      height: 1080,
      backgroundColor: 'BACKGROUND_COLOR',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute',
        top: 108,
        left: 192,
        width: 1536,
        height: 300,
        opacity: opTitle,
        transform: `translateY(${tyTitle}px)`
      }}>
        <h1 style={{
          fontSize: 120,
          fontWeight: 900,
          color: 'PRIMARY_COLOR',
          margin: 0,
          lineHeight: 1.1,
          letterSpacing: '-0.02em',
          textTransform: 'uppercase'
        }}>
          {title}
        </h1>
      </div>

      <div style={{
        position: 'absolute',
        top: 408,
        left: 192,
        width: 800,
        height: 100,
        opacity: opSub,
        transform: `translateY(${tySub}px)`
      }}>
        <p style={{
          fontSize: 32,
          color: 'TEXT_ON_PRIMARY',
          opacity: 0.8,
          margin: 0
        }}>
          {subtitle}
        </p>
      </div>

      <div style={{
        position: 'absolute',
        top: 650,
        left: 192,
        width: 600,
        height: 200,
        opacity: opStat1,
        backgroundColor: 'rgba(15, 23, 42, 0.8)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 16,
        boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
        padding: 32,
        boxSizing: 'border-box'
      }}>
        <div style={{ fontSize: 80, fontWeight: 'bold', color: 'ACCENT_COLOR', fontFamily: 'monospace' }}>{stat1}</div>
        <div style={{ fontSize: 24, color: 'TEXT_ON_PRIMARY', opacity: 0.6, marginTop: 16 }}>{label1}</div>
      </div>

      <div style={{
        position: 'absolute',
        top: 650,
        left: 850,
        width: 600,
        height: 200,
        opacity: opStat2,
        backgroundColor: 'rgba(15, 23, 42, 0.8)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 16,
        boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
        padding: 32,
        boxSizing: 'border-box'
      }}>
        <div style={{ fontSize: 80, fontWeight: 'bold', color: 'SECONDARY_COLOR', fontFamily: 'monospace' }}>{stat2}</div>
        <div style={{ fontSize: 24, color: 'TEXT_ON_PRIMARY', opacity: 0.6, marginTop: 16 }}>{label2}</div>
      </div>
    </div>
  );
};

export default AnimationComponent;