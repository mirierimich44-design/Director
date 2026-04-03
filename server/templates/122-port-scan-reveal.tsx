import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

export const AnimationComponent = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const ports = useMemo(() => [
    { id: 'PORT_1', status: 'STATUS_1' },
    { id: 'PORT_2', status: 'STATUS_2' },
    { id: 'PORT_3', status: 'STATUS_3' },
    { id: 'PORT_4', status: 'STATUS_4' },
    { id: 'PORT_5', status: 'STATUS_5' },
    { id: 'PORT_6', status: 'STATUS_6' },
    { id: 'PORT_7', status: 'STATUS_7' },
    { id: 'PORT_8', status: 'STATUS_8' },
  ].filter(p => p.id !== ''), []);

  const gridCols = 4;
  const gridRows = 2;
  const cellW = 320;
  const cellH = 240;
  const startX = 240;
  const startY = 280;

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden', backgroundColor: 'BACKGROUND_COLOR' }}>
      <div style={{ position: 'absolute', top: 60, left: 192, right: 192, fontSize: 40, fontWeight: 'bold', color: 'TEXT_ON_PRIMARY', letterSpacing: '2px', wordBreak: 'break-word' }}>PORT SCAN ANALYSIS</div>
      
      {ports.map((port, i) => {
        const row = Math.floor(i / gridCols);
        const col = i % gridCols;
        const delay = i * 20;
        const op = interpolate(frame, [delay, delay + 30], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
        const scale = interpolate(frame, [delay, delay + 30], [0.8, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
        const isSuccess = port.status === 'OPEN';
        
        return (
          <div key={i} style={{
            position: 'absolute',
            top: startY + (row * (cellH + 40)),
            left: startX + (col * (cellW + 80)),
            width: cellW,
            height: cellH,
            backgroundColor: 'CHART_BG',
            border: `2px solid ${isSuccess ? 'PRIMARY_COLOR' : 'SUPPORT_COLOR'}`,
            opacity: op,
            transform: `scale(${scale})`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 8,
            padding: 20
          }}>
            <div style={{ fontSize: cellW / 5, fontWeight: 'bold', color: 'TEXT_ON_PRIMARY', fontFamily: 'monospace', textAlign: 'center', wordBreak: 'break-all' }}>{port.id}</div>
            <div style={{ fontSize: 24, color: isSuccess ? 'PRIMARY_COLOR' : 'SUPPORT_COLOR', marginTop: 16, textTransform: 'uppercase', letterSpacing: '0.12em', textAlign: 'center' }}>{port.status}</div>
          </div>
        );
      })}
    </div>
  );
};

export default AnimationComponent;