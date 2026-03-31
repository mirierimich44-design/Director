import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, Easing } from 'remotion';

export const AnimationComponent = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const title = 'TITLE_TEXT';
  const subtitle = 'SUBTITLE_TEXT';
  const detailLabel = 'DETAIL_LABEL';
  const detailValue = 'DETAIL_VALUE';
  const bodyText = 'BODY_TEXT';

  // Animation Sequence
  const introEnd = 40;
  const zoomStart = 50;
  const zoomEnd = 130;
  
  const titleOp = interpolate(frame, [0, 20, zoomStart, zoomStart + 20], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const titleTy = interpolate(frame, [0, 20], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.quad) });

  const zoom = interpolate(frame, [zoomStart, zoomEnd], [1, 1.8], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.quad) });
  const panX = interpolate(frame, [zoomStart, zoomEnd], [0, -400], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.quad) });
  const panY = interpolate(frame, [zoomStart, zoomEnd], [0, -50], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.quad) });
  
  const detailOp = interpolate(frame, [zoomEnd - 20, zoomEnd + 10], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const detailTx = interpolate(frame, [zoomEnd - 20, zoomEnd + 10], [40, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.quad) });

  const glassStyle: React.CSSProperties = {
    backgroundColor: 'rgba(15, 23, 42, 0.92)',
    backdropFilter: 'blur(24px)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    borderRadius: '24px',
    boxShadow: '0 30px 80px rgba(0,0,0,0.92)',
  }

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden', backgroundColor: 'BACKGROUND_COLOR', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* Cinematic Background Grid */}
      <div style={{
        position: 'absolute', width: '100%', height: '100%',
        backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.02) 0%, transparent 80%), linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
        backgroundSize: '100% 100%, 80px 80px, 80px 80px',
        opacity: 0.5
      }} />

      {/* Zooming Canvas Area */}
      <div style={{ 
        position: 'absolute', 
        width: 1920, 
        height: 1080, 
        transform: `scale(${zoom}) translate(${panX}px, ${panY}px)`, 
        transformOrigin: '50% 50%',
        zIndex: 1
      }}>
        {/* Technical Target Area (the thing we zoom into) */}
        <div style={{ 
            position: 'absolute', top: 340, left: 400, width: 600, height: 400, 
            ...glassStyle, backgroundColor: 'rgba(255,255,255,0.02)',
            border: '2px solid PRIMARY_COLOR', display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden'
        }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 4, backgroundColor: 'PRIMARY_COLOR', opacity: 0.6 }} />
            <div style={{ fontSize: 120, fontWeight: 900, color: 'PRIMARY_COLOR', opacity: 0.4, fontFamily: 'monospace' }}>SCAN</div>
            {/* Animated Scanning Line */}
            <div style={{ 
                position: 'absolute', top: 0, left: 0, width: '100%', height: 2, 
                backgroundColor: 'ACCENT_COLOR', boxShadow: '0 0 15px ACCENT_COLOR',
                transform: `translateY(${interpolate(frame % 60, [0, 60], [0, 400])}px)`
            }} />
        </div>

        {/* Floating Decor Items in Canvas */}
        <div style={{ position: 'absolute', top: 200, left: 1100, width: 300, height: 10, backgroundColor: 'SECONDARY_COLOR', opacity: 0.3 }} />
        <div style={{ position: 'absolute', top: 800, left: 200, width: 400, height: 1, backgroundColor: 'rgba(255,255,255,0.1)' }} />
      </div>

      {/* UI Overlay: Initial Title (Top Left) */}
      <div style={{ position: 'absolute', top: 80, left: 100, opacity: titleOp, transform: `translateY(${titleTy}px)`, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ width: 8, height: 48, backgroundColor: 'PRIMARY_COLOR', borderRadius: 4 }} />
            <div style={{ fontSize: 48, fontWeight: 900, color: '#fff', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{title}</div>
        </div>
        <div style={{ fontSize: 22, color: 'SUPPORT_COLOR', marginLeft: 28, marginTop: 4, fontWeight: 500 }}>{subtitle}</div>
      </div>

      {/* UI Overlay: Detail Panel (Revealed after zoom) */}
      <div style={{ 
          position: 'absolute', top: '50%', right: 150, width: 550, 
          transform: `translateY(-50%) translateX(${detailTx}px)`, 
          opacity: detailOp, zIndex: 10,
          ...glassStyle, padding: '60px'
      }}>
        <div style={{ position: 'absolute', top: 30, right: 30, color: 'rgba(255,255,255,0.1)', fontFamily: 'monospace', fontSize: 14 }}>DET_REF: 0x{Math.floor(frame * 123).toString(16).toUpperCase()}</div>
        
        <div style={{ fontSize: 14, color: 'ACCENT_COLOR', fontWeight: 900, letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: 12 }}>{detailLabel}</div>
        <div style={{ fontSize: 72, fontWeight: 900, color: '#fff', fontFamily: 'monospace', letterSpacing: '-0.05em', lineHeight: 1, marginBottom: 30 }}>{detailValue}</div>
        
        <div style={{ height: 2, width: 80, backgroundColor: 'PRIMARY_COLOR', marginBottom: 30 }} />
        
        <div style={{ fontSize: 22, lineHeight: 1.6, color: 'rgba(255,255,255,0.8)', fontWeight: 400 }}>
          {bodyText}
        </div>

        <div style={{ marginTop: 40, display: 'flex', gap: 12, opacity: 0.4 }}>
            <div style={{ padding: '6px 12px', border: '1px solid #fff', borderRadius: 4, fontSize: 10, color: '#fff', fontWeight: 900 }}>ENCRYPTED</div>
            <div style={{ padding: '6px 12px', border: '1px solid #fff', borderRadius: 4, fontSize: 10, color: '#fff', fontWeight: 900 }}>LIVE_FEED</div>
        </div>
      </div>

      {/* Constant UI HUD elements */}
      <div style={{ position: 'absolute', bottom: 40, left: 60, opacity: 0.3 }}>
        <div style={{ color: '#fff', fontSize: 12, fontFamily: 'monospace' }}>
            ZOOM_COORD: {zoom.toFixed(2)}x // {panX.toFixed(0)},{panY.toFixed(0)}<br />
            STATUS: TARGET_LOCKED
        </div>
      </div>

    </div>
  );
};

export default AnimationComponent;