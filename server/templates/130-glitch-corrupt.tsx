import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

export const AnimationComponent = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const title = "TITLE_TEXT";
  const subtitle = "SUB_1";
  const data1 = "DATA_1";
  const data2 = "DATA_2";
  const status = "STATUS_TEXT";

  const glitch = (f: number) => (f % 10 < 2 ? Math.random() * 20 - 10 : 0);
  const glitchX = glitch(frame);

  const opacity = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: 1920,
      height: 1080,
      overflow: 'hidden',
      backgroundColor: 'BACKGROUND_COLOR',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      fontFamily: 'monospace',
      color: 'PRIMARY_COLOR',
      opacity
    }}>
      <div style={{
        position: 'absolute',
        top: 200,
        left: 400 + glitchX,
        fontSize: 80,
        fontWeight: 'bold',
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        textShadow: '4px 0 rgba(230, 57, 70, 0.5), -4px 0 rgba(79, 195, 247, 0.5)'
      }}>
        {title}
      </div>

      <div style={{
        position: 'absolute',
        top: 400,
        left: 400,
        width: 1120,
        height: 400,
        border: '2px solid rgba(255,255,255,0.2)',
        padding: 40,
        boxSizing: 'border-box'
      }}>
        <div style={{ fontSize: 32, marginBottom: 24 }}>{subtitle}</div>
        <div style={{ fontSize: 64, color: 'ACCENT_COLOR', marginBottom: 16 }}>{data1}</div>
        <div style={{ fontSize: 64, color: 'SECONDARY_COLOR' }}>{data2}</div>
        <div style={{
          position: 'absolute',
          bottom: 40,
          right: 40,
          fontSize: 24,
          padding: '8px 16px',
          backgroundColor: 'rgba(230, 57, 70, 0.2)'
        }}>
          {status}
        </div>
      </div>

      {/* Glitch Overlay Lines */}
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} style={{
          position: 'absolute',
          top: 100 + i * 200,
          left: 0,
          width: '100%',
          height: 2,
          backgroundColor: 'rgba(255,255,255,0.1)',
          transform: `translateX(${glitch(frame + i * 50) * 5}px)`
        }} />
      ))}
    </div>
  );
};

export default AnimationComponent;