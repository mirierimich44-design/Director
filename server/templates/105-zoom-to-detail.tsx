import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

export const AnimationComponent = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const TITLE = 'TITLE_TEXT';
  const SUBTITLE = 'SUBTITLE_TEXT';
  const detailLabel = 'DETAIL_LABEL';
  const detailBody = 'DETAIL_BODY';

  const zoom = interpolate(frame, [60, 150], [1, 1.5], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const panX = interpolate(frame, [60, 150], [0, -200], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const panY = interpolate(frame, [60, 150], [0, -50], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  
  const overviewOp = interpolate(frame, [120, 160], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const detailOp = interpolate(frame, [160, 200], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden', backgroundColor: 'BACKGROUND_COLOR' }}>
      <div style={{ 
        position: 'absolute', 
        width: 1920, 
        height: 1080, 
        transform: `scale(${zoom}) translate(${panX}px, ${panY}px)`, 
        transformOrigin: 'center center',
        opacity: overviewOp
      }}>
        <div style={{ position: 'absolute', top: 300, left: 400, fontSize: 80, fontWeight: 'bold', color: 'PRIMARY_COLOR' }}>{TITLE}</div>
        <div style={{ position: 'absolute', top: 400, left: 400, fontSize: 32, color: 'SUPPORT_COLOR' }}>{SUBTITLE}</div>
      </div>

      <div style={{ 
        position: 'absolute', 
        top: 200, 
        right: 200, 
        width: 600,
        height: 600,
        backgroundColor: 'rgba(15, 23, 42, 0.8)',
        opacity: detailOp,
        padding: 40,
        boxSizing: 'border-box',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 24,
        boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
      }}>
        <div style={{ fontSize: 40, fontWeight: 'bold', color: 'TEXT_ON_SECONDARY', marginBottom: 24 }}>{detailLabel}</div>
        <div style={{ fontSize: 24, color: 'TEXT_ON_SECONDARY', lineHeight: 1.6 }}>{detailBody}</div>
      </div>
    </div>
  );
};

export default AnimationComponent;