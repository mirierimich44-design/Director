import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';

export const AnimationComponent = () => {
  const frame = useCurrentFrame();

  const institution = "TITLE_TEXT";   // e.g. "BaFin"
  const action = "LABEL_TEXT";        // e.g. "SHORT SELLING BAN"
  const target = "STAT_VALUE_1";      // e.g. "Wirecard AG"
  const dateText = "STAT_VALUE_2";    // e.g. "18 April 2020"
  const context = "SUB_TEXT";         // e.g. "In response to FT reporting, Germany's financial regulator..."

  const bgOp = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const barW = interpolate(frame, [5, 35], [0, 1920], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const badgeOp = interpolate(frame, [10, 35], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const badgeTy = interpolate(frame, [10, 35], [-20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const actionOp = interpolate(frame, [30, 60], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const actionScale = interpolate(frame, [30, 60], [0.88, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const targetOp = interpolate(frame, [55, 80], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const dividerW = interpolate(frame, [65, 100], [0, 700], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const contextOp = interpolate(frame, [85, 115], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const contextTy = interpolate(frame, [85, 115], [16, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, width: 1920, height: 1080,
      overflow: 'hidden', backgroundColor: 'BACKGROUND_COLOR',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      opacity: bgOp,
    }}>
      {/* Top accent bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: barW, height: 5, backgroundColor: 'PRIMARY_COLOR' }} />
      {/* Bottom accent bar */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, width: barW, height: 5, backgroundColor: 'PRIMARY_COLOR', opacity: 0.4 }} />

      {/* Center card */}
      <div style={{
        width: 1080,
        backgroundColor: 'CARD_BG',
        backdropFilter: 'blur(24px)',
        borderRadius: 20,
        border: '1px solid CARD_BORDER',
        borderTop: '5px solid PRIMARY_COLOR',
        padding: '72px 80px 64px',
        boxShadow: '0 32px 80px SHADOW_COLOR',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 0,
      }}>

        {/* Institution badge */}
        <div style={{
          opacity: badgeOp,
          transform: `translateY(${badgeTy}px)`,
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          gap: 16,
        }}>
          <div style={{ width: 48, height: 3, backgroundColor: 'PRIMARY_COLOR', opacity: 0.6 }} />
          <div style={{
            fontSize: 16,
            fontWeight: 900,
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            color: 'PRIMARY_COLOR',
            fontFamily: 'monospace',
          }}>
            {institution}
          </div>
          <div style={{ width: 48, height: 3, backgroundColor: 'PRIMARY_COLOR', opacity: 0.6 }} />
        </div>

        {/* Action declaration */}
        <div style={{
          opacity: actionOp,
          transform: `scale(${actionScale})`,
          textAlign: 'center',
          marginBottom: 8,
        }}>
          <div style={{
            fontSize: 96,
            fontWeight: 900,
            color: 'PRIMARY_COLOR',
            fontFamily: 'monospace',
            letterSpacing: '-0.03em',
            lineHeight: 1,
            textTransform: 'uppercase',
          }}>
            {action}
          </div>
        </div>

        {/* Target */}
        <div style={{
          opacity: targetOp,
          textAlign: 'center',
          marginBottom: 36,
        }}>
          <div style={{
            fontSize: 42,
            fontWeight: 700,
            color: '#ffffff',
            fontFamily: 'sans-serif',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            opacity: 0.9,
          }}>
            {target}
          </div>
        </div>

        {/* Divider */}
        <div style={{
          width: dividerW,
          height: 2,
          backgroundColor: 'PRIMARY_COLOR',
          opacity: 0.3,
          marginBottom: 32,
        }} />

        {/* Date */}
        <div style={{
          opacity: targetOp,
          marginBottom: 28,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}>
          <div style={{
            fontSize: 14,
            fontWeight: 700,
            color: 'SUPPORT_COLOR',
            fontFamily: 'monospace',
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            opacity: 0.55,
          }}>
            EFFECTIVE DATE
          </div>
          <div style={{
            fontSize: 18,
            fontWeight: 700,
            color: 'PRIMARY_COLOR',
            fontFamily: 'monospace',
            letterSpacing: '0.1em',
            opacity: 0.85,
          }}>
            {dateText}
          </div>
        </div>

        {/* Context text */}
        <div style={{
          opacity: contextOp,
          transform: `translateY(${contextTy}px)`,
          textAlign: 'center',
          maxWidth: 860,
        }}>
          <div style={{
            fontSize: 20,
            fontWeight: 400,
            color: 'SUPPORT_COLOR',
            fontFamily: 'sans-serif',
            lineHeight: 1.65,
            opacity: 0.7,
          }}>
            {context}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AnimationComponent;
