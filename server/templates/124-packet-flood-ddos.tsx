import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

export const AnimationComponent = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const title = 'TITLE_TEXT';
  const targetName = 'TARGET_NAME';
  const source1 = 'SOURCE_IP_1';
  const source2 = 'SOURCE_IP_2';
  const source3 = 'SOURCE_IP_3';
  const source4 = 'SOURCE_IP_4';

  const sources = [source1, source2, source3, source4].filter(s => s !== '');
  
  const titleOp = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const targetScale = interpolate(frame, [100, 130], [1, 1.2], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const targetColor = frame > 150 ? '#e63946' : 'PRIMARY_COLOR';

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden', backgroundColor: 'BACKGROUND_COLOR' }}>
      <div style={{ position: 'absolute', top: 60, left: 192, fontSize: 40, fontWeight: 'bold', color: 'TEXT_ON_PRIMARY', opacity: titleOp }}>{title}</div>
      
      {/* Target Server */}
      <div style={{ position: 'absolute', top: 440, left: 860, width: 200, height: 200, backgroundColor: targetColor, borderRadius: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${targetScale})`, zIndex: 2 }}>
        <span style={{ color: 'TEXT_ON_PRIMARY', fontSize: 24, fontWeight: 'bold' }}>{targetName}</span>
      </div>

      {/* Packets */}
      {sources.map((src, i) => {
        const startX = i % 2 === 0 ? 100 : 1720;
        const startY = 100 + (i * 200);
        const packetX = interpolate(frame, [60 + (i * 20), 150 + (i * 20)], [startX, 960], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
        const packetY = interpolate(frame, [60 + (i * 20), 150 + (i * 20)], [startY, 540], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
        const opacity = interpolate(frame, [60 + (i * 20), 160 + (i * 20)], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

        return (
          <div key={i} style={{ position: 'absolute', left: packetX, top: packetY, width: 40, height: 40, backgroundColor: 'ACCENT_COLOR', borderRadius: 20, opacity, zIndex: 1 }}>
            <div style={{ position: 'absolute', top: 50, left: -20, width: 80, textAlign: 'center', color: 'TEXT_ON_ACCENT', fontSize: 14 }}>{src}</div>
          </div>
        );
      })}
    </div>
  );
};

export default AnimationComponent;