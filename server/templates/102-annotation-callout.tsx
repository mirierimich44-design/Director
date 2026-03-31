import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, Easing } from 'remotion';

export const AnimationComponent = () => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();

  const title = 'TITLE_TEXT';
  const subtitle = 'SUBTITLE_TEXT';
  const calloutHeader = 'CALLOUT_HEADER';
  const calloutBody = 'CALLOUT_BODY';
  const dataLabel = 'DATA_LABEL';

  // Point coordinates
  const px = 860;
  const py = 640;

  // Entrance
  const entryOp = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const pointOp = interpolate(frame, [15, 30], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const pointScale = interpolate(frame, [15, 35], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.backOut });
  
  // Lead line logic
  const lineProgress = interpolate(frame, [30, 60], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const lineX2 = px + (200 * lineProgress);
  const lineY2 = py - (200 * lineProgress);

  // Card Reveal
  const cardOp = interpolate(frame, [55, 75], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const cardScale = interpolate(frame, [55, 80], [0.82, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.quad) });
  const cardTy = interpolate(frame, [55, 80], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Pulsing Point
  const pulse = interpolate(Math.sin(frame / 8), [-1, 1], [1, 1.4]);

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden',
      backgroundColor: 'BACKGROUND_COLOR', fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      {/* Background Decor */}
      <div style={{
        position: 'absolute', width: '100%', height: '100%',
        backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px)',
        backgroundSize: '100% 100%, 80px 80px',
        opacity: 0.5
      }} />

      {/* Main Header */}
      <div style={{ position: 'absolute', top: 80, left: 100, opacity: entryOp }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ width: 12, height: 40, backgroundColor: 'PRIMARY_COLOR', boxShadow: '0 0 15px PRIMARY_COLOR' }} />
          <div style={{ fontSize: 40, fontWeight: 900, color: '#fff', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{title}</div>
        </div>
        <div style={{ fontSize: 24, color: 'SUPPORT_COLOR', marginLeft: 32, marginTop: 4, fontWeight: 600 }}>{subtitle}</div>
      </div>

      {/* Leader Line SVG */}
      <svg width="1920" height="1080" style={{ position: 'absolute', top: 0, left: 0, zIndex: 1 }}>
        <line 
          x1={px} y1={py} x2={lineX2} y2={lineY2} 
          stroke="PRIMARY_COLOR" strokeWidth={4} 
          strokeDasharray="12 8"
          style={{ filter: 'drop-shadow(0 0 10px PRIMARY_COLOR)' }}
        />
        {/* Pulsing Target Point */}
        <g opacity={pointOp} transform={`translate(${px}, ${py}) scale(${pointScale})`}>
          <circle r={12} fill="PRIMARY_COLOR" style={{ filter: 'drop-shadow(0 0 15px PRIMARY_COLOR)' }} />
          <circle r={24 * pulse} fill="none" stroke="PRIMARY_COLOR" strokeWidth={2} opacity={interpolate(pulse, [1, 1.4], [0.6, 0])} />
        </g>
      </svg>

      {/* Data Point Label */}
      <div style={{
        position: 'absolute', top: py + 40, left: px, transform: 'translateX(-50%)',
        opacity: pointOp, color: 'PRIMARY_COLOR', fontSize: 20, fontWeight: 900, 
        fontFamily: 'monospace', letterSpacing: '0.1em'
      }}>
        [ {dataLabel} ]
      </div>

      {/* Callout Card (Heavy Glass) */}
      <div style={{
        position: 'absolute', top: lineY2 - 320, left: lineX2,
        width: 500, backgroundColor: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(24px)',
        borderRadius: 24, border: '1px solid rgba(255,255,255,0.15)',
        boxShadow: '0 32px 64px rgba(0,0,0,0.80)', padding: '48px',
        opacity: cardOp, transform: `scale(${cardScale}) translateY(${cardTy}px)`,
        zIndex: 10, borderLeft: '8px solid PRIMARY_COLOR'
      }}>
        <div style={{ 
          fontSize: 14, fontWeight: 900, color: 'PRIMARY_COLOR', 
          letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 16
        }}>
          ANALYTIC_OBSERVATION
        </div>
        <div style={{ fontSize: 32, fontWeight: 800, color: '#fff', lineHeight: 1.1, marginBottom: 24 }}>
          {calloutHeader}
        </div>
        <div style={{ height: 2, width: 60, backgroundColor: 'rgba(255,255,255,0.1)', marginBottom: 24 }} />
        <div style={{ fontSize: 22, color: 'rgba(255,255,255,0.8)', lineHeight: 1.6, fontWeight: 500 }}>
          {calloutBody}
        </div>
      </div>

      {/* Technical Flair */}
      <div style={{ position: 'absolute', bottom: 60, right: 80, opacity: 0.2, textAlign: 'right' }}>
        <div style={{ color: '#fff', fontFamily: 'monospace', fontSize: 14 }}>
          REF_PT: {px},{py}<br />
          Z_INDEX: OVERLAY<br />
          LAYER: FORENSIC_04
        </div>
      </div>
    </div>
  );
};

export default AnimationComponent;