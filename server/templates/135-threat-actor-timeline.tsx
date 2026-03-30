import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

export const AnimationComponent = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const events = useMemo(() => [
    { date: 'DATE_1', sector: 'SECTOR_1', tech: 'TECH_1' },
    { date: 'DATE_2', sector: 'SECTOR_2', tech: 'TECH_2' },
    { date: 'DATE_3', sector: 'SECTOR_3', tech: 'TECH_3' },
    { date: 'DATE_4', sector: 'SECTOR_4', tech: 'TECH_4' },
    { date: 'DATE_5', sector: 'SECTOR_5', tech: 'TECH_5' },
  ].filter(e => e.date !== '' && e.date !== ' '), []);

  const count = events.length;
  const spacing = 1440 / (count + 1);

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden', backgroundColor: 'BACKGROUND_COLOR' }}>
      <div style={{ position: 'absolute', top: 60, left: 192, fontSize: 40, fontWeight: 'bold', color: 'TEXT_ON_PRIMARY', letterSpacing: '2px' }}>OPERATIONAL TIMELINE</div>
      
      <div style={{ position: 'absolute', top: 540, left: 240, width: 1440, height: 6, backgroundColor: 'GRID_LINE' }} />

      {events.map((event, i) => {
        const startFrame = 30 + (i * 20);
        const op = interpolate(frame, [startFrame, startFrame + 20], [0, 0.85], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
        const scale = interpolate(frame, [startFrame, startFrame + 20], [0.5, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
        const x = 240 + (spacing * (i + 1));

        return (
          <div key={i} style={{ position: 'absolute', top: 480, left: x - 120, width: 240, opacity: op, transform: `scale(${scale})` }}>
            <div style={{ color: 'PRIMARY_COLOR', fontSize: 22, fontWeight: '800', textAlign: 'center', marginBottom: 8 }}>{event.date}</div>
            <div style={{ width: 240, height: 144, backgroundColor: 'NODE_FILL', borderRadius: 8, padding: 16, boxSizing: 'border-box', border: '4px solid NODE_STROKE' }}>
              <div style={{ color: 'TEXT_ON_PRIMARY', fontSize: 20, fontWeight: '900', marginBottom: 4 }}>{event.sector}</div>
              <div style={{ color: 'TEXT_ON_PRIMARY', fontSize: 16, fontWeight: '600' }}>{event.tech}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AnimationComponent;