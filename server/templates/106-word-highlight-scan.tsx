import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

export const AnimationComponent = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const rawWords = ["WORD_1", "WORD_2", "WORD_3", "WORD_4", "WORD_5", "WORD_6", "WORD_7", "WORD_8"];
  
  const words = useMemo(() => {
    const filled = rawWords.filter(w => w !== '' && w !== ' ' && !w.startsWith('WORD_'));
    return filled.length > 0 ? filled : ["SYSTEM", "BREACH", "DETECTED", "ANALYZING", "THREAT"];
  }, []);

  const totalWords = words.length;
  const startDelay = 40;
  const endDelay = 30;
  // Dynamically calculate duration based on how many words we have to fit into the 15s
  const availableFrames = durationInFrames - startDelay - endDelay;
  const durationPerWord = Math.floor(availableFrames / totalWords);

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: 1920,
      height: 1080,
      backgroundColor: 'BACKGROUND_COLOR',
      backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.03) 0%, transparent 70%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      {/* Background Decorative Grid */}
      <div style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
        backgroundSize: '100px 100px',
        opacity: 0.3
      }} />

      <div style={{
        width: 1600,
        display: 'flex',
        flexWrap: 'wrap',
        gap: '32px',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1
      }}>
        {words.map((word, i) => {
          const entryStart = 10 + (i * 5);
          const entryEnd = entryStart + 25;
          
          const wordStart = startDelay + (i * durationPerWord);
          const wordEnd = wordStart + durationPerWord;
          
          // Entrance animation
          const entryOpacity = interpolate(frame, [entryStart, entryEnd], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          const entryTranslateY = interpolate(frame, [entryStart, entryEnd], [40, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          const entryScale = interpolate(frame, [entryStart, entryEnd], [0.9, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

          // Scanning highlight animation
          const isActive = frame >= wordStart && frame < wordEnd;
          const isPast = frame >= wordEnd;
          
          const highlightProgress = interpolate(frame, [wordStart, wordEnd], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          
          const cardScale = interpolate(frame, [wordStart, wordStart + 5, wordEnd - 5, wordEnd], [1, 1.05, 1.05, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          const cardGlow = interpolate(frame, [wordStart, wordStart + 5, wordEnd - 5, wordEnd], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

          return (
            <div key={i} style={{
              width: '350px',
              height: '140px',
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              backdropFilter: 'blur(16px)',
              borderRadius: '24px',
              border: `2px solid ${isActive ? 'PRIMARY_COLOR' : 'rgba(255, 255, 255, 0.1)'}`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
              opacity: entryOpacity,
              transform: `translateY(${entryTranslateY}px) scale(${entryScale * (isActive ? cardScale : 1)})`,
              boxShadow: isActive ? `0 0 40px ${'PRIMARY_COLOR'}44` : '0 8px 32px rgba(0,0,0,0.2)',
              transition: 'border 0.2s ease-out, box-shadow 0.2s ease-out',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Progress Line */}
              {isActive && (
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  height: '4px',
                  width: `${highlightProgress * 100}%`,
                  backgroundColor: 'PRIMARY_COLOR',
                  boxShadow: `0 0 10px PRIMARY_COLOR`
                }} />
              )}

              <div style={{
                fontSize: word.length > 10 ? 36 : 48,
                fontWeight: 800,
                color: isActive ? 'PRIMARY_COLOR' : isPast ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.4)',
                textAlign: 'center',
                letterSpacing: '-0.02em',
                textTransform: 'uppercase'
              }}>
                {word}
              </div>
              
              <div style={{
                marginTop: '8px',
                fontSize: '14px',
                fontWeight: 600,
                color: isActive ? 'ACCENT_COLOR' : 'transparent',
                letterSpacing: '0.2em',
                textTransform: 'uppercase'
              }}>
                {isActive ? 'SCANNING...' : ''}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AnimationComponent;
