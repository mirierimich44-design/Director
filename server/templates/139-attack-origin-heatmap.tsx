import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, staticFile } from 'remotion';

export const AnimationComponent = () => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();

  const title = "TITLE_TEXT";
  const stat1 = "STAT_VALUE_1";
  const stat2 = "STAT_VALUE_2";
  const label1 = "LABEL_1";
  const label2 = "LABEL_2";
  const desc = "DESC_1";
  const centerLatStr = "CENTER_LAT";
  const centerLonStr = "CENTER_LON";
  const zoomLevelStr = "ZOOM_LEVEL";

  // Parse coordinates and zoom with fallbacks
  const centerLat = useMemo(() => {
    const n = parseFloat(centerLatStr);
    return isNaN(n) ? 20 : n;
  }, [centerLatStr]);

  const centerLon = useMemo(() => {
    const n = parseFloat(centerLonStr);
    return isNaN(n) ? 10 : n;
  }, [centerLonStr]);

  const zoomLevel = useMemo(() => {
    const n = parseFloat(zoomLevelStr);
    return isNaN(n) ? 1.5 : n;
  }, [zoomLevelStr]);

  // Map settings
  const stadiaKey = "STADIA_API_KEY";
  const mapUrl = stadiaKey
    ? `https://tiles.stadiamaps.com/static/alidade_smooth_dark/${centerLon},${centerLat},${zoomLevel}/1600x800@2x.png?api_key=${stadiaKey}`
    : null;

  // Entrance
  const entryOp = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const mapScale = interpolate(frame, [0, 120], [1.25, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  
  // Heat clusters pulsing
  const pulse = interpolate(Math.sin(frame / 12), [-1, 1], [0.8, 1.2]);
  
  // Anomaly reveals
  const clusters = [
    { x: 450, y: 320, r: 60, delay: 40 },
    { x: 1100, y: 280, r: 45, delay: 65 },
    { x: 800, y: 550, r: 80, delay: 90 },
    { x: 1350, y: 450, r: 35, delay: 110 }
  ];

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden',
      backgroundColor: 'BACKGROUND_COLOR', fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      {/* Cinematic Map Layer */}
      <div style={{
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
        opacity: entryOp, transform: `scale(${mapScale})`, zIndex: 1
      }}>
        {mapUrl ? (
          <img src={mapUrl} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }} />
        ) : (
          <div style={{ width: '100%', height: '100%', backgroundImage: 'radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        )}

        {/* Heat Clusters SVG */}
        <svg width="1920" height="1080" style={{ position: 'absolute', top: 0, left: 0 }}>
          <defs>
            <radialGradient id="heatGrad">
              <stop offset="0%" stopColor="#e63946" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#e63946" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#e63946" stopOpacity="0" />
            </radialGradient>
          </defs>
          {clusters.map((c, i) => {
            const clusterOp = interpolate(frame, [c.delay, c.delay + 20], [0, 1], { extrapolateLeft: 'clamp' });
            return (
              <circle key={i} cx={c.x} cy={c.y} r={c.r * pulse} fill="url(#heatGrad)" opacity={clusterOp} style={{ filter: 'blur(10px)' }} />
            );
          })}
        </svg>
      </div>

      {/* Header Panel */}
      <div style={{ position: 'absolute', top: 60, left: 80, zIndex: 10, opacity: entryOp }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <div style={{ width: 12, height: 48, backgroundColor: '#e63946', borderRadius: 4, boxShadow: '0 0 20px #e63946' }} />
          <div style={{ 
            fontSize: 48, fontWeight: 900, color: '#fff', letterSpacing: '0.1em', 
            textTransform: 'uppercase', textShadow: '0 2px 20px rgba(0,0,0,0.92)' 
          }}>
            {title}
          </div>
        </div>
        <div style={{ 
          fontSize: 24, color: 'SUPPORT_COLOR', marginLeft: 36, marginTop: 4, 
          fontWeight: 600, textShadow: '0 2px 10px rgba(0,0,0,0.92)' 
        }}>GLOBAL_THREAT_MONITORING</div>
      </div>

      {/* Floating Data Panels (Heavy Glass) */}
      <div style={{
        position: 'absolute', bottom: 80, left: 80, right: 80, height: 260,
        backgroundColor: 'rgba(15, 23, 42, 0.92)', backdropFilter: 'blur(32px)',
        borderRadius: 32, border: '1px solid rgba(255,255,255,0.15)',
        boxShadow: '0 40px 100px rgba(0,0,0,0.92)', zIndex: 10,
        padding: '60px 80px', display: 'flex', gap: 100, opacity: entryOp
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 300 }}>
          <div style={{ fontSize: 72, fontWeight: 900, color: 'PRIMARY_COLOR', fontFamily: 'monospace', lineHeight: 1 }}>{stat1}</div>
          <div style={{ fontSize: 20, color: 'rgba(255,255,255,0.7)', fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', marginTop: 12 }}>{label1}</div>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 300 }}>
          <div style={{ fontSize: 72, fontWeight: 900, color: 'ACCENT_COLOR', fontFamily: 'monospace', lineHeight: 1 }}>{stat2}</div>
          <div style={{ fontSize: 20, color: 'rgba(255,255,255,0.7)', fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', marginTop: 12 }}>{label2}</div>
        </div>

        <div style={{ flex: 1, borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: 60 }}>
          <div style={{ fontSize: 24, color: '#fff', lineHeight: 1.5, fontWeight: 500 }}>
            {desc}
          </div>
        </div>
      </div>

      {/* UI Elements */}
      <div style={{ position: 'absolute', top: 60, right: 80, zIndex: 10, opacity: 0.7, textAlign: 'right' }}>
        <div style={{ color: '#fff', fontFamily: 'monospace', fontSize: 14, textShadow: '0 2px 4px rgba(0,0,0,0.92)' }}>
          SIGNAL_LOCK: TRUE<br />
          COORDINATES: {centerLat.toFixed(2)}N / {centerLon.toFixed(2)}E<br />
          DENSITY_ALGORITHM: v2.4
        </div>
      </div>
    </div>
  );
};

export default AnimationComponent;