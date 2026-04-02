import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

export const AnimationComponent = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const teams = ['TEAM_1', 'TEAM_2', 'TEAM_3', 'TEAM_4', 'TEAM_5', 'TEAM_6', 'TEAM_7', 'TEAM_8'];
  const winner = 'WINNER_TEXT';
  const title = 'TITLE_TEXT';

  const containerStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 1920,
    height: 1080,
    overflow: 'hidden',
    backgroundColor: 'BACKGROUND_COLOR',
  };

  const getOpacity = (start: number) => interpolate(frame, [start, start + 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <div style={containerStyle}>
      <div style={{ position: 'absolute', top: 60, left: 192, fontSize: 40, fontWeight: 'bold', color: 'PRIMARY_COLOR', letterSpacing: '2px', opacity: getOpacity(0) }}>
        {title}
      </div>

      {teams.map((team, i) => {
        const isTop = i < 4;
        const y = 200 + (i % 4) * 160 + (i >= 4 ? 40 : 0);
        const x = i < 4 ? 200 : 1400;
        
        return (
          <div key={i} style={{
            position: 'absolute',
            top: y,
            left: x,
            width: 320,
            height: 64,
            backgroundColor: 'rgba(15, 23, 42, 0.8)',
            color: 'TEXT_ON_SECONDARY',
            display: 'flex',
            alignItems: 'center',
            padding: '0 24px',
            borderRadius: 16,
            opacity: getOpacity(20 + i * 15),
            fontSize: 22,
            fontWeight: '600',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
          }}>
            {team}
          </div>
        );
      })}

      <div style={{
        position: 'absolute',
        top: 480,
        left: 760,
        width: 400,
        height: 120,
        backgroundColor: 'rgba(15, 23, 42, 0.8)',
        color: 'TEXT_ON_ACCENT',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 32,
        fontWeight: 'bold',
        borderRadius: 16,
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
        opacity: getOpacity(150),
        transform: `scale(${interpolate(frame, [150, 180], [0.8, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })})`
      }}>
        {winner}
      </div>

      <svg style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 1080 }}>
        {teams.map((_, i) => {
          const x1 = i < 4 ? 520 : 1400;
          const y1 = 232 + (i % 4) * 160 + (i >= 4 ? 40 : 0);
          const x2 = i < 4 ? 760 : 1160;
          const y2 = 540;
          const progress = interpolate(frame, [80 + i * 10, 130 + i * 10], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          
          return (
            <line 
              key={i} 
              x1={x1} y1={y1} 
              x2={x1 + (x2 - x1) * progress} y2={y1 + (y2 - y1) * progress} 
              stroke="LINE_STROKE" 
              strokeWidth={3} 
            />
          );
        })}
      </svg>
    </div>
  );
};

export default AnimationComponent;