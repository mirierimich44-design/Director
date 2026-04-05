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
          /* Fallback SVG world map — equirectangular, simplified continent outlines */
          <svg viewBox="0 0 1920 1080" style={{ width: '100%', height: '100%' }}>
            <rect width="1920" height="1080" fill="#0a1628" />
            {/* Graticule grid */}
            {[-60,-30,0,30,60].map(lat => (
              <line key={lat} x1={0} y1={(90-lat)*6} x2={1920} y2={(90-lat)*6} stroke="rgba(255,255,255,0.04)" strokeWidth={1} />
            ))}
            {[-120,-60,0,60,120].map(lon => (
              <line key={lon} x1={(lon+180)*5.333} y1={0} x2={(lon+180)*5.333} y2={1080} stroke="rgba(255,255,255,0.04)" strokeWidth={1} />
            ))}
            {/* North America */}
            <path fill="#1e3a5f" stroke="#2a5298" strokeWidth={1}
              d="M64,198 L107,174 L160,174 L240,180 L277,228 L299,258 L299,318 L336,348 L400,420 L480,450 L515,480 L560,474 L613,474 L613,432 L587,390 L533,390 L523,360 L560,330 L597,288 L619,258 L677,258 L651,222 L613,192 L587,162 L507,162 L453,120 L400,140 L267,150 Z" />
            {/* Greenland */}
            <path fill="#1e3a5f" stroke="#2a5298" strokeWidth={1}
              d="M640,90 L720,60 L800,72 L830,102 L820,162 L760,198 L700,200 L650,180 Z" />
            {/* South America */}
            <path fill="#1e3a5f" stroke="#2a5298" strokeWidth={1}
              d="M480,462 L560,444 L613,450 L640,444 L720,492 L773,570 L760,660 L747,690 L680,780 L613,870 L560,810 L533,750 L533,660 L507,600 L480,570 Z" />
            {/* Europe */}
            <path fill="#1e3a5f" stroke="#2a5298" strokeWidth={1}
              d="M880,270 L912,210 L960,192 L1000,192 L1050,174 L1120,192 L1200,210 L1280,252 L1280,282 L1219,312 L1160,318 L1080,312 L1016,318 L960,306 L933,300 Z" />
            {/* Africa */}
            <path fill="#1e3a5f" stroke="#2a5298" strokeWidth={1}
              d="M869,342 L912,300 L1016,294 L1120,300 L1157,330 L1189,384 L1219,474 L1200,540 L1160,600 L1120,660 L1056,750 L1000,744 L950,720 L907,660 L880,600 L869,540 Z" />
            {/* Asia */}
            <path fill="#1e3a5f" stroke="#2a5298" strokeWidth={1}
              d="M960,270 L1050,252 L1120,210 L1280,192 L1467,180 L1600,186 L1733,162 L1867,156 L1893,192 L1920,240 L1893,300 L1867,420 L1840,510 L1760,540 L1680,552 L1600,546 L1520,540 L1467,522 L1413,510 L1360,492 L1280,486 L1219,474 L1157,330 L1120,300 L1016,294 L960,306 L933,300 L960,270 Z" />
            {/* Japan */}
            <path fill="#1e3a5f" stroke="#2a5298" strokeWidth={1}
              d="M1648,282 L1664,264 L1680,276 L1680,312 L1664,318 L1648,306 Z" />
            {/* SE Asia / Indonesia */}
            <path fill="#1e3a5f" stroke="#2a5298" strokeWidth={1}
              d="M1400,510 L1467,504 L1520,516 L1547,540 L1520,558 L1467,564 L1413,552 Z" />
            {/* Australia */}
            <path fill="#1e3a5f" stroke="#2a5298" strokeWidth={1}
              d="M1264,552 L1360,534 L1467,528 L1547,546 L1573,594 L1573,660 L1547,714 L1467,732 L1360,726 L1280,702 L1240,654 L1240,600 Z" />
            {/* New Zealand */}
            <path fill="#1e3a5f" stroke="#2a5298" strokeWidth={1}
              d="M1680,738 L1696,720 L1712,738 L1712,768 L1696,780 L1680,762 Z" />
          </svg>
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