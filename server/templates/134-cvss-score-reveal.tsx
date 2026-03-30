import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

export const AnimationComponent = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const cveId = 'CVE_ID';
  const CVSS_SCORE = 8.5;
  const vectorString = 'VECTOR_STRING';
  const severityLabel = 'SEVERITY_LABEL';

  const progress = interpolate(frame, [30, 150], [0, CVSS_SCORE], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const rotation = interpolate(progress, [0, 10], [0, 180], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  
  const opacity = interpolate(frame, [0, 30], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const textOp = interpolate(frame, [150, 180], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const getColor = (score: number) => {
    if (score < 4) return '#2a9d5c';
    if (score < 7) return '#f4a261';
    return '#e63946';
  };

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden', backgroundColor: 'BACKGROUND_COLOR', opacity }}>
      <div style={{ position: 'absolute', top: 150, left: 760, width: 400, height: 400 }}>
        <svg viewBox="0 0 200 100" style={{ width: '100%', height: '100%' }}>
          <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#333" strokeWidth="20" strokeLinecap="round" />
          <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke={getColor(progress)} strokeWidth="20" strokeLinecap="round" strokeDasharray="251.2" strokeDashoffset={251.2 - (progress / 10) * 251.2} />
        </svg>
        <div style={{ position: 'absolute', top: 120, left: 0, width: '100%', textAlign: 'center', color: 'TEXT_ON_PRIMARY', fontSize: 80, fontWeight: 'bold', fontFamily: 'monospace' }}>
          {progress.toFixed(1)}
        </div>
      </div>

      <div style={{ position: 'absolute', top: 600, left: 460, width: 1000, textAlign: 'center', opacity: textOp }}>
        <div style={{ fontSize: 40, fontWeight: 'bold', color: 'PRIMARY_COLOR', letterSpacing: '2px', marginBottom: 16 }}>{cveId}</div>
        <div style={{ fontSize: 32, color: 'SUPPORT_COLOR', marginBottom: 8 }}>{severityLabel}</div>
        <div style={{ fontSize: 24, color: 'TEXT_ON_SECONDARY', fontFamily: 'monospace', backgroundColor: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: 8 }}>{vectorString}</div>
      </div>
    </div>
  );
};

export default AnimationComponent;