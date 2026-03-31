import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

export const AnimationComponent = () => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();

  const rawRows = ["ROW_1", "ROW_2", "ROW_3", "ROW_4", "ROW_5", "ROW_6", "ROW_7", "ROW_8"];
  const rows = useMemo(() => {
    const filled = rawRows.filter(r => r !== '' && r !== ' ' && !r.startsWith('ROW_'));
    return filled.length > 0 ? filled : [
      "48 65 6c 6c 6f 20 57 6f 72 6c 64 21",
      "53 79 73 74 65 6d 20 42 72 65 61 63 68",
      "41 6e 61 6c 79 7a 69 6e 67 20 44 61 74 61",
      "50 61 79 6c 6f 61 64 20 44 65 63 6f 64 65",
      "4d 61 6c 69 63 69 6f 75 73 20 43 6f 64 65",
      "55 6e 61 75 74 68 6f 72 69 7a 65 64 20 41",
      "43 72 69 74 69 63 61 6c 20 45 76 65 6e 74",
      "42 61 63 6b 64 6f 6f 72 20 41 63 74 69 76"
    ];
  }, []);

  // Helper to convert hex strings to ASCII
  const hexToAscii = (hex: string) => {
    try {
      return hex.split(' ').map(h => {
        const char = String.fromCharCode(parseInt(h, 16));
        return (char.match(/[ -~]/)) ? char : '.';
      }).join('');
    } catch(e) { return '........'; }
  };

  // Timings
  const scrollStart = 20;
  const scrollEnd = durationInFrames - 40;
  const scrollY = interpolate(frame, [scrollStart, scrollEnd], [0, -400], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden',
      backgroundColor: 'BACKGROUND_COLOR', fontFamily: 'monospace'
    }}>
      {/* Background Decor */}
      <div style={{
        position: 'absolute', width: '100%', height: '100%',
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
        backgroundSize: '100px 100px',
        opacity: 0.5
      }} />

      {/* Header */}
      <div style={{ position: 'absolute', top: 60, left: 100, display: 'flex', alignItems: 'center', gap: 24, zIndex: 10 }}>
        <div style={{ padding: '8px 16px', backgroundColor: 'PRIMARY_COLOR', borderRadius: 4, color: 'BACKGROUND_COLOR', fontWeight: 900, fontSize: 24 }}>PAYLOAD_DECODER</div>
        <div style={{ color: 'PRIMARY_COLOR', fontSize: 20, letterSpacing: '0.2em' }}>ANALYZING BITSTREAM...</div>
      </div>

      {/* Main Container with 3D Perspective */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%) perspective(1000px) rotateX(10deg)',
        width: 1400, height: 700, backgroundColor: 'rgba(15, 23, 42, 0.8)',
        borderRadius: 32, border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 40px 100px rgba(0,0,0,0.92)', overflow: 'hidden',
        display: 'flex'
      }}>
        {/* Left Side: Raw Hex */}
        <div style={{ flex: 2, borderRight: '1px solid rgba(255,255,255,0.1)', padding: '60px' }}>
          <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: 18, marginBottom: 40, display: 'flex', gap: 40 }}>
            <span style={{ width: 100 }}>OFFSET</span>
            <span>HEXADECIMAL DATA STREAM</span>
          </div>
          
          <div style={{ transform: `translateY(${scrollY}px)` }}>
            {rows.map((row, i) => {
              const isActive = frame >= scrollStart + (i * 10);
              const isDecoding = frame >= scrollStart + (i * 10) + 20;
              return (
                <div key={i} style={{ 
                  height: 80, display: 'flex', alignItems: 'center', gap: 40,
                  opacity: isActive ? 1 : 0, transition: 'opacity 0.2s'
                }}>
                  <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 24 }}>0x{ (i * 16).toString(16).padStart(4, '0') }</span>
                  <span style={{ 
                    color: isDecoding ? 'PRIMARY_COLOR' : 'rgba(255,255,255,0.7)', 
                    fontSize: 32, letterSpacing: '0.1em', fontWeight: isDecoding ? 900 : 400 
                  }}>
                    {row}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Decoded String */}
        <div style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.2)', padding: '60px' }}>
          <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: 18, marginBottom: 40 }}>ASCII_INTERPRETATION</div>
          
          <div style={{ transform: `translateY(${scrollY}px)` }}>
            {rows.map((row, i) => {
              const isDecoding = frame >= scrollStart + (i * 10) + 20;
              const text = hexToAscii(row);
              const charCount = text.length;
              const visibleChars = Math.floor(interpolate(frame, [scrollStart + (i * 10) + 20, scrollStart + (i * 10) + 40], [0, charCount], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));

              return (
                <div key={i} style={{ height: 80, display: 'flex', alignItems: 'center' }}>
                  <span style={{ 
                    color: isDecoding ? 'ACCENT_COLOR' : 'transparent', 
                    fontSize: 32, fontWeight: 800, letterSpacing: '0.1em'
                  }}>
                    {text.substring(0, visibleChars)}
                    {isDecoding && visibleChars < charCount && <span style={{ color: '#fff' }}>█</span>}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Decoding Progress Overlay */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, width: '100%', height: 100,
          background: 'linear-gradient(transparent, rgba(15, 23, 42, 1))',
          display: 'flex', alignItems: 'center', padding: '0 60px', gap: 40
        }}>
           <div style={{ flex: 1, height: 4, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
              <div style={{ 
                height: '100%', backgroundColor: 'PRIMARY_COLOR', 
                width: `${interpolate(frame, [scrollStart, scrollEnd], [0, 100], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}%`,
                boxShadow: '0 0 10px PRIMARY_COLOR'
              }} />
           </div>
           <div style={{ color: 'PRIMARY_COLOR', fontSize: 20, fontWeight: 800, width: 150 }}>DECODING: { Math.floor(interpolate(frame, [scrollStart, scrollEnd], [0, 100], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })) }%</div>
        </div>
      </div>

      {/* Footer System Detail */}
      <div style={{ position: 'absolute', bottom: 60, right: 100, textAlign: 'right' }}>
        <div style={{ color: 'rgba(255,255,255,0.1)', fontSize: 16 }}>
          ALGORITHM: RS-DECODE_v2<br />
          STREAM_BUFFER: 0xFF021A
        </div>
      </div>
    </div>
  );
};

export default AnimationComponent;