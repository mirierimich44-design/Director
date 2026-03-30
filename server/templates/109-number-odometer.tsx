import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

export const AnimationComponent = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const targetNumbers = ["DIGIT_1", "DIGIT_2", "DIGIT_3", "DIGIT_4", "DIGIT_5", "DIGIT_6"];
  const label = "LABEL_TEXT";
  const sub = "SUB_TEXT";

  const digits = useMemo(() => targetNumbers.filter(d => d !== '' && d !== ' '), []);

  const containerOp = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const labelOp = interpolate(frame, [180, 210], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: 1920,
      height: 1080,
      overflow: 'hidden',
      backgroundColor: 'BACKGROUND_COLOR',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        gap: 24,
        opacity: containerOp,
      }}>
        {digits.map((digit, i) => {
          const startDelay = i * 15;
          const scrollY = interpolate(frame, [30 + startDelay, 120 + startDelay], [100, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          const opacity = interpolate(frame, [30 + startDelay, 50 + startDelay], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

          return (
            <div key={i} style={{
              width: 160,
              height: 200,
              backgroundColor: 'NODE_FILL',
              borderRadius: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 140,
              fontWeight: 'bold',
              fontFamily: 'monospace',
              color: 'PRIMARY_COLOR',
              overflow: 'hidden',
              position: 'relative',
              border: '4px solid rgba(255,255,255,0.1)',
            }}>
              <div style={{
                position: 'absolute',
                transform: `translateY(${scrollY}px)`,
                opacity: opacity,
              }}>
                {digit}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{
        marginTop: 80,
        textAlign: 'center',
        opacity: labelOp,
      }}>
        <div style={{
          fontSize: 40,
          fontWeight: 'bold',
          color: 'PRIMARY_COLOR',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
        }}>
          {label}
        </div>
        <div style={{
          fontSize: 24,
          color: 'SUPPORT_COLOR',
          marginTop: 16,
        }}>
          {sub}
        </div>
      </div>
    </div>
  );
};

export default AnimationComponent;