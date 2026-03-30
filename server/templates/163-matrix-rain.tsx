import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

export const AnimationComponent = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const charSet = '0123456789ABCDEFカタカナ';
  const columns = 40;
  const colWidth = width / columns;

  const drops = useMemo(() => {
    return Array.from({ length: columns }, (_, i) => ({
      x: i * colWidth,
      speed: 2 + Math.random() * 5,
      offset: Math.random() * -1000,
      chars: Array.from({ length: 20 }, () => charSet[Math.floor(Math.random() * charSet.length)])
    }));
  }, [colWidth]);

  const titleText = 'TITLE_TEXT';
  const stat1 = 'STAT_VALUE_1';
  const stat2 = 'STAT_VALUE_2';
  const label1 = 'LABEL_1';
  const label2 = 'LABEL_2';

  const overlayOp = interpolate(frame, [0, 60], [0, 0.85], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const contentOp = interpolate(frame, [100, 150], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden', backgroundColor: 'BACKGROUND_COLOR' }}>
      {drops.map((drop, i) => (
        <div key={i} style={{ 
          position: 'absolute', 
          left: drop.x, 
          top: (frame * drop.speed + drop.offset) % height - 100, 
          color: 'PRIMARY_COLOR', 
          fontSize: 24, 
          fontFamily: 'monospace', 
          opacity: 0.4 
        }}>
          {drop.chars.map((c, j) => <div key={j}>{c}</div>)}
        </div>
      ))}

      <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, backgroundColor: 'rgba(0,0,0,0.5)', opacity: overlayOp }} />

      <div style={{ position: 'absolute', top: 108, left: 192, width: 1536, opacity: contentOp, zIndex: 1 }}>
        <h1 style={{ color: 'TEXT_ON_PRIMARY', fontSize: 64, fontWeight: 'bold', letterSpacing: '2px' }}>{titleText}</h1>
        <div style={{ display: 'flex', gap: 80, marginTop: 80 }}>
          <div style={{ borderLeft: '4px solid PRIMARY_COLOR', paddingLeft: 24 }}>
            <div style={{ color: 'PRIMARY_COLOR', fontSize: 80, fontFamily: 'monospace' }}>{stat1}</div>
            <div style={{ color: 'TEXT_ON_PRIMARY', fontSize: 22, marginTop: 8 }}>{label1}</div>
          </div>
          <div style={{ borderLeft: '4px solid SECONDARY_COLOR', paddingLeft: 24 }}>
            <div style={{ color: 'SECONDARY_COLOR', fontSize: 80, fontFamily: 'monospace' }}>{stat2}</div>
            <div style={{ color: 'TEXT_ON_PRIMARY', fontSize: 22, marginTop: 8 }}>{label2}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimationComponent;