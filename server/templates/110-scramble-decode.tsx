import React, { useMemo } from 'react';
import { useCurrentFrame, interpolate } from 'remotion';

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&';

const ScrambleText = ({ text, startFrame, endFrame }: { text: string, startFrame: number, endFrame: number }) => {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [startFrame, endFrame], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  
  const scrambled = useMemo(() => {
    if (progress >= 1) return text;
    return text.split('').map((char) => 
      Math.random() > progress ? CHARS[Math.floor(Math.random() * CHARS.length)] : char
    ).join('');
  }, [frame, progress, text]);

  return <>{scrambled}</>;
};

export const AnimationComponent = () => {
  const lines = ['LINE_1', 'LINE_2', 'LINE_3', 'LINE_4', 'LINE_5', 'LINE_6'].filter(l => l !== '');
  
  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: 1920,
      height: 1080,
      backgroundColor: 'BACKGROUND_COLOR',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      paddingLeft: 192,
      overflow: 'hidden',
    }}>
      {lines.map((text, i) => (
        <div key={i} style={{
          fontSize: 72,
          fontWeight: 'bold',
          fontFamily: 'monospace',
          color: 'PRIMARY_COLOR',
          marginBottom: 32,
          letterSpacing: '0.05em',
          height: 80,
          overflow: 'hidden',
        }}>
          <ScrambleText 
            text={text} 
            startFrame={i * 20} 
            endFrame={150 + (i * 20)} 
          />
        </div>
      ))}
    </div>
  );
};

export default AnimationComponent;