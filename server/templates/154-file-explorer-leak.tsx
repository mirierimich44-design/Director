import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, Easing } from 'remotion';

export const AnimationComponent = () => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();

  const path = 'DIRECTORY_PATH';
  const file1 = 'FILE_1_NAME';
  const file2 = 'FILE_2_NAME';
  const targetFile = 'TARGET_FILE';
  const statusText = 'STATUS_TEXT';

  const files = [file1, file2, targetFile];

  // 1. Cursor Movement
  const cursorStart = 30;
  const cursorEnd = 80;
  const cursorX = interpolate(frame, [cursorStart, cursorEnd], [400, 450], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const cursorY = interpolate(frame, [cursorStart, cursorEnd], [300, 500], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.quad) });

  // 2. Selection Phase
  const isSelected = frame >= cursorEnd;
  const selectionOp = interpolate(frame, [cursorEnd, cursorEnd + 10], [0, 1], { extrapolateLeft: 'clamp' });

  // 3. Download / Exfiltration Phase
  const downloadStart = cursorEnd + 30;
  const downloadEnd = durationInFrames - 30;
  const downloadProgress = interpolate(frame, [downloadStart, downloadEnd], [0, 100], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const showDownload = frame >= downloadStart;

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden',
      backgroundColor: 'BACKGROUND_COLOR', fontFamily: 'Inter, system-ui, sans-serif',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      
      {/* OS Window Container */}
      <div style={{
        width: 1200, height: 750, backgroundColor: 'rgba(15, 23, 42, 0.9)',
        backdropFilter: 'blur(30px)', borderRadius: 20, border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 50px 100px rgba(0,0,0,0.6)', overflow: 'hidden', display: 'flex', flexDirection: 'column'
      }}>
        
        {/* Title Bar */}
        <div style={{ height: 60, backgroundColor: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', px: 24, gap: 12, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
           <div style={{ display: 'flex', gap: 8, marginLeft: 20 }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#ff5f56' }} />
              <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#ffbd2e' }} />
              <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#27c93f' }} />
           </div>
           <div style={{ flex: 1, textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 14, fontWeight: 700, letterSpacing: '0.1em' }}>
             FILE_EXPLORER // {path}
           </div>
        </div>

        <div style={{ flex: 1, display: 'flex' }}>
           {/* Sidebar */}
           <div style={{ width: 250, borderRight: '1px solid rgba(255,255,255,0.05)', padding: '30px', display: 'flex', flexDirection: 'column', gap: 20 }}>
              {['Documents', 'Downloads', 'Network', 'Backups', 'Cloud'].map((item, i) => (
                  <div key={i} style={{ color: i === 3 ? 'PRIMARY_COLOR' : 'rgba(255,255,255,0.2)', fontSize: 18, fontWeight: 700 }}>{item}</div>
              ))}
           </div>

           {/* File List */}
           <div style={{ flex: 1, padding: '40px', position: 'relative' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 40 }}>
                 {files.map((file, i) => {
                    const isTarget = file === targetFile;
                    const selected = isTarget && isSelected;
                    return (
                        <div key={i} style={{ 
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
                            padding: '20px', borderRadius: 12,
                            backgroundColor: selected ? 'rgba(79, 195, 247, 0.15)' : 'transparent',
                            border: selected ? '2px solid PRIMARY_COLOR' : '2px solid transparent',
                            transition: 'all 0.2s'
                        }}>
                           <div style={{ width: 80, height: 100, backgroundColor: isTarget ? '#e63946' : 'rgba(255,255,255,0.1)', borderRadius: 4, position: 'relative' }}>
                              <div style={{ position: 'absolute', top: 0, right: 0, width: 30, height: 30, backgroundColor: 'rgba(255,255,255,0.1)', borderBottomLeftRadius: 4 }} />
                           </div>
                           <div style={{ color: selected ? '#fff' : 'rgba(255,255,255,0.6)', fontSize: 14, fontWeight: 600, textAlign: 'center', wordBreak: 'break-all' }}>{file}</div>
                        </div>
                    );
                 })}
              </div>

              {/* Exfiltration Popup */}
              {showDownload && (
                  <div style={{
                      position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                      width: 600, backgroundColor: 'rgba(10, 15, 25, 0.98)', borderRadius: 20,
                      border: '2px solid #e63946', padding: '40px', boxShadow: '0 0 50px rgba(230,57,70,0.3)',
                      zIndex: 20
                  }}>
                      <div style={{ color: '#e63946', fontSize: 24, fontWeight: 900, marginBottom: 20, letterSpacing: '0.1em' }}>{statusText}</div>
                      <div style={{ color: '#fff', fontSize: 18, marginBottom: 12 }}>Target: <span style={{ fontFamily: 'monospace', color: 'PRIMARY_COLOR' }}>{targetFile}</span></div>
                      
                      <div style={{ width: '100%', height: 12, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 6, overflow: 'hidden', marginBottom: 12 }}>
                         <div style={{ width: `${downloadProgress}%`, height: '100%', backgroundColor: '#e63946', boxShadow: '0 0 15px #e63946' }} />
                      </div>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(255,255,255,0.4)', fontSize: 14, fontWeight: 700 }}>
                         <span>{Math.round(downloadProgress)}% COMPLETED</span>
                         <span>{(downloadProgress * 12.4).toFixed(1)} MB / 1.24 GB</span>
                      </div>
                  </div>
              )}
           </div>
        </div>

        {/* Cursor */}
        <div style={{
            position: 'absolute', top: cursorY, left: cursorX,
            width: 32, height: 32, zIndex: 100, pointerEvents: 'none',
            opacity: isSelected ? 0 : 1
        }}>
            <svg viewBox="0 0 32 32" style={{ width: '100%', height: '100%', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }}>
                <path d="M0,0 L0,24 L7,17 L15,31 L19,29 L11,15 L20,15 Z" fill="white" stroke="black" strokeWidth="2" />
            </svg>
        </div>

      </div>

      {/* Technical Detail */}
      <div style={{ position: 'absolute', bottom: 40, left: 40, opacity: 0.2 }}>
         <div style={{ color: '#fff', fontSize: 14, fontFamily: 'monospace' }}>VOLUME_SERIAL: 0x4421-B // SECURE_MOUNT: TRUE</div>
      </div>

    </div>
  );
};

export default AnimationComponent;