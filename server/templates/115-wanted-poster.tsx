import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

export const AnimationComponent = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const MONIKER = 'MONIKER_TEXT';
  const ALIASES = 'ALIASES_TEXT';
  const AFFILIATION = 'AFFILIATION_TEXT';
  const TOOLS = 'TOOLS_TEXT';
  const STATUS = 'STATUS_TEXT';

  const opacity = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const stampScale = interpolate(frame, [20, 40], [2, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const stampRotate = interpolate(frame, [20, 40], [15, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  
  const reveal1 = interpolate(frame, [50, 80], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const reveal2 = interpolate(frame, [80, 110], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const reveal3 = interpolate(frame, [110, 140], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const reveal4 = interpolate(frame, [140, 170], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden', backgroundColor: 'BACKGROUND_COLOR' }}>
      <div style={{ position: 'absolute', top: 108, left: 192, width: 1536, height: 864, border: '4px solid PRIMARY_COLOR', opacity: opacity, transform: `scale(${stampScale}) rotate(${stampRotate}deg)` }}>
        <div style={{ position: 'absolute', top: 60, left: 60, color: 'PRIMARY_COLOR', fontSize: 80, fontWeight: 'bold', letterSpacing: '0.12em', textTransform: 'uppercase' }}>{MONIKER}</div>
        <div style={{ position: 'absolute', top: 200, left: 60, width: 700, opacity: reveal1 }}>
          <div style={{ color: 'SUPPORT_COLOR', fontSize: 22, fontWeight: '600' }}>KNOWN ALIASES</div>
          <div style={{ color: 'TEXT_ON_PRIMARY', fontSize: 32, marginTop: 16 }}>{ALIASES}</div>
        </div>
        <div style={{ position: 'absolute', top: 350, left: 60, width: 700, opacity: reveal2 }}>
          <div style={{ color: 'SUPPORT_COLOR', fontSize: 22, fontWeight: '600' }}>AFFILIATION</div>
          <div style={{ color: 'TEXT_ON_PRIMARY', fontSize: 32, marginTop: 16 }}>{AFFILIATION}</div>
        </div>
        <div style={{ position: 'absolute', top: 500, left: 60, width: 700, opacity: reveal3 }}>
          <div style={{ color: 'SUPPORT_COLOR', fontSize: 22, fontWeight: '600' }}>PRIMARY TOOLS</div>
          <div style={{ color: 'TEXT_ON_PRIMARY', fontSize: 32, marginTop: 16 }}>{TOOLS}</div>
        </div>
        <div style={{ position: 'absolute', top: 650, left: 60, width: 700, opacity: reveal4 }}>
          <div style={{ color: 'ACCENT_COLOR', fontSize: 40, fontWeight: 'bold', textTransform: 'uppercase' }}>{STATUS}</div>
        </div>
        <div style={{ position: 'absolute', bottom: 60, right: 60, color: 'PRIMARY_COLOR', fontSize: 16, opacity: 0.5 }}>FILE REF: 115-SEC-ARXXIS</div>
      </div>
    </div>
  );
};

export default AnimationComponent;