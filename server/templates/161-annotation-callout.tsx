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

  // Annotation anchor point (left-center area — chart-like placement)
  const px = 780;
  const py = 580;

  // Phase 1: header + rule slide in
  const headerOp = interpolate(frame, [0, 18], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const headerTx = interpolate(frame, [0, 18], [-30, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.quad) });

  // Phase 2: dot appears
  const dotOp = interpolate(frame, [18, 32], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const dotScale = interpolate(frame, [18, 36], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.back(2)) });

  // Phase 3: connector line draws
  const lineProgress = interpolate(frame, [32, 55], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.quad) });
  const connectorEndX = px + 220 * lineProgress;
  const connectorEndY = py - 190 * lineProgress;

  // Phase 4: callout card
  const cardOp = interpolate(frame, [52, 68], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const cardTy = interpolate(frame, [52, 70], [16, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.quad) });

  // Phase 5: data label
  const labelOp = interpolate(frame, [65, 78], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Subtle dot ring pulse
  const ringR = interpolate(Math.sin((frame - 32) / 10), [-1, 1], [18, 26]);
  const ringOp = interpolate(Math.sin((frame - 32) / 10), [-1, 1], [0.15, 0.45]);

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden',
      backgroundColor: 'BACKGROUND_COLOR', fontFamily: '"Inter", "IBM Plex Sans", system-ui, sans-serif'
    }}>

      {/* Subtle grid — academic/data feel */}
      <svg width="1920" height="1080" style={{ position: 'absolute', top: 0, left: 0, opacity: 0.06 }}>
        <defs>
          <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#ffffff" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="1920" height="1080" fill="url(#grid)" />
      </svg>

      {/* Top header block */}
      <div style={{
        position: 'absolute', top: 72, left: 100,
        opacity: headerOp, transform: `translateX(${headerTx}px)`
      }}>
        <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'PRIMARY_COLOR', marginBottom: 10 }}>
          {subtitle}
        </div>
        <div style={{ fontSize: 44, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
          {title}
        </div>
        {/* Thin accent rule under title */}
        <div style={{ marginTop: 16, height: 2, width: 64, backgroundColor: 'PRIMARY_COLOR', borderRadius: 1 }} />
      </div>

      {/* SVG layer: connector + dot */}
      <svg width="1920" height="1080" style={{ position: 'absolute', top: 0, left: 0, zIndex: 2 }}>
        {/* Connector line — straight two-segment elbow */}
        <line
          x1={px} y1={py}
          x2={connectorEndX} y2={connectorEndY}
          stroke="PRIMARY_COLOR" strokeWidth={1.5}
          strokeDasharray="none"
          opacity={0.7}
        />
        {/* Elbow tick at end */}
        {lineProgress > 0.98 && (
          <line
            x1={connectorEndX - 6} y1={connectorEndY}
            x2={connectorEndX + 6} y2={connectorEndY}
            stroke="PRIMARY_COLOR" strokeWidth={1.5} opacity={0.7}
          />
        )}

        {/* Anchor dot — clean filled circle */}
        <g opacity={dotOp} transform={`translate(${px}, ${py}) scale(${dotScale})`}>
          {/* Outer pulse ring */}
          <circle r={ringR} fill="none" stroke="PRIMARY_COLOR" strokeWidth={1} opacity={ringOp} />
          {/* Solid inner dot */}
          <circle r={8} fill="PRIMARY_COLOR" />
          {/* White center pip */}
          <circle r={3} fill="#fff" opacity={0.9} />
        </g>
      </svg>

      {/* Callout card — clean white-border card, no heavy glass */}
      <div style={{
        position: 'absolute',
        top: connectorEndY - 280,
        left: connectorEndX + 12,
        width: 460,
        backgroundColor: 'rgba(10, 16, 30, 0.92)',
        backdropFilter: 'blur(12px)',
        borderRadius: 6,
        border: '1px solid rgba(255,255,255,0.12)',
        borderTop: '3px solid PRIMARY_COLOR',
        padding: '36px 40px',
        opacity: cardOp,
        transform: `translateY(${cardTy}px)`,
        zIndex: 10,
      }}>
        {/* Eyebrow */}
        <div style={{
          fontSize: 11, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase',
          color: 'PRIMARY_COLOR', marginBottom: 14
        }}>
          Observation
        </div>

        {/* Main callout header */}
        <div style={{
          fontSize: 28, fontWeight: 700, color: '#fff',
          lineHeight: 1.25, letterSpacing: '-0.01em', marginBottom: 20
        }}>
          {calloutHeader}
        </div>

        {/* Divider */}
        <div style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.08)', marginBottom: 20 }} />

        {/* Body text */}
        <div style={{
          fontSize: 19, color: 'rgba(255,255,255,0.72)',
          lineHeight: 1.65, fontWeight: 400
        }}>
          {calloutBody}
        </div>
      </div>

      {/* Data label below anchor dot */}
      <div style={{
        position: 'absolute',
        top: py + 22,
        left: px,
        transform: 'translateX(-50%)',
        opacity: labelOp,
        fontFamily: '"IBM Plex Mono", "Fira Mono", monospace',
        fontSize: 13, fontWeight: 500,
        color: 'SUPPORT_COLOR',
        letterSpacing: '0.08em',
        whiteSpace: 'nowrap',
      }}>
        {dataLabel}
      </div>

      {/* Bottom-left source / reference strip */}
      <div style={{
        position: 'absolute', bottom: 48, left: 100,
        opacity: labelOp * 0.4,
        fontFamily: 'monospace', fontSize: 12, color: 'rgba(255,255,255,0.5)',
        letterSpacing: '0.06em'
      }}>
        ANNOTATED · {dataLabel}
      </div>
    </div>
  );
};

export default AnimationComponent;
