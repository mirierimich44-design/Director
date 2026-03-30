import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

export const AnimationComponent = () => {
  const frame = useCurrentFrame();
  const { width } = useVideoConfig();

  const stocks = useMemo(() => [
    { sym: 'SYMBOL_1', val: 'PRICE_1', chg: 'CHANGE_1' },
    { sym: 'SYMBOL_2', val: 'PRICE_2', chg: 'CHANGE_2' },
    { sym: 'SYMBOL_3', val: 'PRICE_3', chg: 'CHANGE_3' },
    { sym: 'SYMBOL_4', val: 'PRICE_4', chg: 'CHANGE_4' },
    { sym: 'SYMBOL_5', val: 'PRICE_5', chg: 'CHANGE_5' },
    { sym: 'SYMBOL_6', val: 'PRICE_6', chg: 'CHANGE_6' }
  ].filter(s => s.sym !== '' && s.sym !== 'SYMBOL_1'), []);

  const scrollX = interpolate(frame, [0, 300], [1920, -1200], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const opacity = interpolate(frame, [0, 30], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: 1920,
      height: 1080,
      overflow: 'hidden',
      backgroundColor: 'BACKGROUND_COLOR',
    }}>
      <div style={{
        position: 'absolute',
        top: 940,
        left: 0,
        width: 1920,
        height: 80,
        backgroundColor: 'rgba(0,0,0,0.4)',
        display: 'flex',
        alignItems: 'center',
        opacity,
      }}>
        <div style={{
          position: 'absolute',
          left: scrollX,
          display: 'flex',
          gap: '80px',
          whiteSpace: 'nowrap',
        }}>
          {stocks.map((stock, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span style={{ fontSize: 32, fontWeight: 'bold', color: 'TEXT_ON_PRIMARY', fontFamily: 'sans-serif' }}>{stock.sym}</span>
              <span style={{ fontSize: 32, fontWeight: 'bold', color: 'TEXT_ON_PRIMARY', fontFamily: 'monospace' }}>{stock.val}</span>
              <span style={{
                fontSize: 24,
                fontWeight: 600,
                color: stock.chg.startsWith('+') ? '#2a9d5c' : '#e63946',
                fontFamily: 'sans-serif',
              }}>
                {stock.chg}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnimationComponent;