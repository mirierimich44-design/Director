import React, { useMemo } from 'react';
import { useCurrentFrame, interpolate } from 'remotion';

export const AnimationComponent = () => {
  const frame = useCurrentFrame();
  const epsActual = 'EPS_ACTUAL';
  const epsEstimate = 'EPS_ESTIMATE';
  const revenueBeat = 'REVENUE_BEAT';
  const guidanceText = 'GUIDANCE_TEXT';
  const quarterLabel = 'QUARTER_LABEL';

  const opacity = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const slide = interpolate(frame, [0, 30], [50, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const reveal1 = interpolate(frame, [30, 60], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const reveal2 = interpolate(frame, [60, 90], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const reveal3 = interpolate(frame, [90, 120], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden', backgroundColor: 'BACKGROUND_COLOR', opacity, transform: `translateY(${slide}px)` }}>
      <div style={{ position: 'absolute', top: 60, left: 192, width: 1536, height: 100, color: 'PRIMARY_COLOR', fontSize: 40, fontWeight: 'bold', letterSpacing: '2px' }}>{quarterLabel}</div>
      
      <div style={{ position: 'absolute', top: 180, left: 192, width: 700, height: 720, zIndex: 1 }}>
        <div style={{ fontSize: 22, color: 'SUPPORT_COLOR', marginBottom: 16 }}>EPS PERFORMANCE</div>
        <div style={{ fontSize: 80, fontWeight: 'bold', color: 'TEXT_ON_PRIMARY', marginBottom: 8, opacity: reveal1 }}>{epsActual}</div>
        <div style={{ fontSize: 32, color: 'SUPPORT_COLOR', opacity: reveal1 }}>vs Est. {epsEstimate}</div>
      </div>

      <div style={{ position: 'absolute', top: 180, left: 1028, width: 700, height: 720, zIndex: 1 }}>
        <div style={{ fontSize: 22, color: 'SUPPORT_COLOR', marginBottom: 16 }}>REVENUE</div>
        <div style={{ fontSize: 80, fontWeight: 'bold', color: 'ACCENT_COLOR', marginBottom: 24, opacity: reveal2 }}>{revenueBeat}</div>
        <div style={{ fontSize: 24, lineHeight: 1.5, color: 'TEXT_ON_SECONDARY', opacity: reveal3, borderLeft: '4px solid PRIMARY_COLOR', paddingLeft: 24 }}>{guidanceText}</div>
      </div>

      <div style={{ position: 'absolute', top: 940, left: 192, width: 1536, height: 80, borderTop: '2px solid GRID_LINE', paddingTop: 24, color: 'SUPPORT_COLOR', fontSize: 16 }}>QUARTERLY EARNINGS REPORT — CONFIDENTIAL</div>
    </div>
  );
};

export default AnimationComponent;