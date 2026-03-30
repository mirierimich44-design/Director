import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

export const AnimationComponent = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const TITLE = 'SQL_INJECTION_TITLE';
  const queryBase = 'QUERY_BASE';
  const injectionPayload = 'INJECTION_PAYLOAD';
  const resultQuery = 'RESULT_QUERY';
  const statusLabel = 'STATUS_LABEL';

  const opTitle = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const opBase = interpolate(frame, [30, 60], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const opInject = interpolate(frame, [90, 120], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const opResult = interpolate(frame, [150, 190], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const opStatus = interpolate(frame, [200, 230], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const tyBase = interpolate(frame, [30, 60], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const tyInject = interpolate(frame, [90, 120], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden', backgroundColor: 'BACKGROUND_COLOR' }}>
      <div style={{ position: 'absolute', top: 60, left: 192, width: 1536, height: 100, color: 'PRIMARY_COLOR', fontSize: 40, fontWeight: 'bold', letterSpacing: '2px', opacity: opTitle }}>
        {TITLE}
      </div>

      <div style={{ position: 'absolute', top: 200, left: 192, width: 1536, height: 120, backgroundColor: 'rgba(255,255,255,0.05)', padding: 40, boxSizing: 'border-box', opacity: opBase, transform: `translateY(${tyBase}px)` }}>
        <div style={{ color: 'TEXT_ON_PRIMARY', fontSize: 24, fontFamily: 'monospace' }}>{queryBase}</div>
      </div>

      <div style={{ position: 'absolute', top: 360, left: 192, width: 1536, height: 120, backgroundColor: 'rgba(230, 57, 70, 0.15)', border: '2px solid #e63946', padding: 40, boxSizing: 'border-box', opacity: opInject, transform: `translateY(${tyInject}px)` }}>
        <div style={{ color: '#e63946', fontSize: 24, fontFamily: 'monospace', fontWeight: 'bold' }}>{injectionPayload}</div>
      </div>

      <div style={{ position: 'absolute', top: 560, left: 192, width: 1536, height: 200, backgroundColor: 'rgba(255,255,255,0.08)', padding: 40, boxSizing: 'border-box', opacity: opResult }}>
        <div style={{ color: 'TEXT_ON_PRIMARY', fontSize: 28, fontFamily: 'monospace', lineHeight: 1.6 }}>
          {resultQuery}
        </div>
      </div>

      <div style={{ position: 'absolute', top: 800, left: 192, padding: '16px 32px', backgroundColor: '#e63946', color: 'white', fontSize: 24, fontWeight: 'bold', opacity: opStatus }}>
        {statusLabel}
      </div>
    </div>
  );
};

export default AnimationComponent;