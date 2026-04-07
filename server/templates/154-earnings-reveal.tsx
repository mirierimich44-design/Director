import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';

export const AnimationComponent = () => {
  const frame = useCurrentFrame();
  const epsActual    = 'EPS_ACTUAL';
  const epsEstimate  = 'EPS_ESTIMATE';
  const revenueBeat  = 'REVENUE_BEAT';
  const guidanceText = 'GUIDANCE_TEXT';
  const quarterLabel = 'QUARTER_LABEL';

  const masterOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const slideY        = interpolate(frame, [0, 25], [40, 0],  { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const card1Opacity  = interpolate(frame, [20, 45],  [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const card1Scale    = interpolate(frame, [20, 45],  [0.92, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const card2Opacity  = interpolate(frame, [40, 65],  [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const card2Scale    = interpolate(frame, [40, 65],  [0.92, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const card3Opacity  = interpolate(frame, [60, 85],  [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const card3Scale    = interpolate(frame, [60, 85],  [0.92, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const cardStyle: React.CSSProperties = {
    backgroundColor: '#ffffff',
    border: 'none',
    borderRadius: 16,
    padding: '48px 56px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
  };

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, width: 1920, height: 1080,
      overflow: 'hidden', backgroundColor: 'BACKGROUND_COLOR',
      opacity: masterOpacity, transform: `translateY(${slideY}px)`,
      display: 'flex', flexDirection: 'column',
      padding: '60px 160px', boxSizing: 'border-box', gap: 32,
    }}>

      {/* Header */}
      <div style={{
        fontSize: 26, fontWeight: 700, letterSpacing: '0.18em',
        color: 'PRIMARY_COLOR', textTransform: 'uppercase',
      }}>
        {quarterLabel}
      </div>

      {/* Two main cards */}
      <div style={{ display: 'flex', gap: 40, flex: 1 }}>

        {/* EPS Card */}
        <div style={{
          ...cardStyle,
          flex: 1,
          opacity: card1Opacity,
          transform: `scale(${card1Scale})`,
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          borderTop: '6px solid PRIMARY_COLOR',
        }}>
          <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: '0.14em', color: '#555555', marginBottom: 24 }}>
            EPS PERFORMANCE
          </div>
          <div style={{ fontSize: 96, fontWeight: 800, color: '#111111', lineHeight: 1, fontFamily: 'monospace', marginBottom: 20 }}>
            {epsActual}
          </div>
          <div style={{ fontSize: 30, color: '#444444', fontFamily: 'monospace' }}>
            vs Est. {epsEstimate}
          </div>
        </div>

        {/* Revenue Card */}
        <div style={{
          ...cardStyle,
          flex: 1,
          opacity: card2Opacity,
          transform: `scale(${card2Scale})`,
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          borderTop: '6px solid ACCENT_COLOR',
        }}>
          <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: '0.14em', color: '#555555', marginBottom: 24 }}>
            REVENUE
          </div>
          <div style={{ fontSize: 96, fontWeight: 800, color: '#111111', lineHeight: 1, fontFamily: 'monospace', marginBottom: 20 }}>
            {revenueBeat}
          </div>
          <div style={{ fontSize: 22, color: '#444444' }}>
            QUARTERLY BEAT
          </div>
        </div>
      </div>

      {/* Guidance Card */}
      <div style={{
        ...cardStyle,
        opacity: card3Opacity,
        transform: `scale(${card3Scale})`,
        display: 'flex', alignItems: 'center', gap: 40,
        borderLeft: '8px solid PRIMARY_COLOR',
        padding: '36px 56px',
      }}>
        <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: '0.14em', color: '#555555', whiteSpace: 'nowrap' }}>
          GUIDANCE
        </div>
        <div style={{ width: 2, height: 40, backgroundColor: '#cccccc', flexShrink: 0 }} />
        <div style={{ fontSize: 28, color: '#111111', lineHeight: 1.4, fontWeight: 500 }}>
          {guidanceText}
        </div>
      </div>

    </div>
  );
};

export default AnimationComponent;
