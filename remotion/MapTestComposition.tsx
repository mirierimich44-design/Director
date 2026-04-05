import React, { useEffect, useRef } from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Easing, useDelayRender } from 'remotion';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const CITIES = [
  { name: 'New York',  lng: -74.006,  lat: 40.7128, x: 380,  y: 310 },
  { name: 'London',    lng: -0.1276,  lat: 51.5074, x: 860,  y: 220 },
  { name: 'Tokyo',     lng: 139.6917, lat: 35.6895, x: 1540, y: 290 },
  { name: 'Dubai',     lng: 55.2708,  lat: 25.2048, x: 1120, y: 380 },
];

const ARCS = [
  { from: 0, to: 1, startFrame: 40 },
  { from: 1, to: 3, startFrame: 60 },
  { from: 3, to: 2, startFrame: 80 },
  { from: 0, to: 3, startFrame: 70 },
];

export const MapTestComposition: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const mapRef = useRef<HTMLDivElement>(null);
  const { delayRender, continueRender } = useDelayRender();
  const [handle] = React.useState(() => delayRender('Loading MapLibre'));

  useEffect(() => {
    if (!mapRef.current) return;
    const map = new maplibregl.Map({
      container: mapRef.current,
      style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
      interactive: false,
      fadeDuration: 0,
      center: [20, 30],
      zoom: 1.8,
    });
    map.on('load', () => continueRender(handle));
    return () => map.remove();
  }, [handle]);

  const bgOp = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: 'clamp' });
  const titleOp = interpolate(frame, [10, 35], [0, 1], { extrapolateRight: 'clamp' });
  const titleY = interpolate(frame, [10, 35], [30, 0], { extrapolateRight: 'clamp' });

  const getArcPath = (from: typeof CITIES[0], to: typeof CITIES[0]) => {
    const cpx = (from.x + to.x) / 2;
    const cpy = Math.min(from.y, to.y) - Math.abs(to.x - from.x) * 0.25;
    return `M ${from.x} ${from.y} Q ${cpx} ${cpy} ${to.x} ${to.y}`;
  };

  const getArcProgress = (startFrame: number) =>
    interpolate(frame, [startFrame, startFrame + 40], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.inOut(Easing.cubic),
    });

  const cityOp = interpolate(frame, [25, 45], [0, 1], { extrapolateRight: 'clamp' });
  const pulseR = interpolate(frame % 50, [0, 50], [6, 22]);
  const pulseOp = interpolate(frame % 50, [0, 25, 50], [0.6, 0.1, 0]);

  return (
    <AbsoluteFill style={{ backgroundColor: '#0a0a14' }}>
      {/* MapLibre world map */}
      <div
        ref={mapRef}
        style={{ position: 'absolute', top: 0, left: 0, width, height, opacity: bgOp }}
      />

      {/* SVG overlay: arcs + city dots */}
      <svg
        width={width}
        height={height}
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <linearGradient id="arcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00cfff" stopOpacity="0" />
            <stop offset="50%" stopColor="#00cfff" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Animated arcs */}
        {ARCS.map((arc, i) => {
          const from = CITIES[arc.from];
          const to = CITIES[arc.to];
          const path = getArcPath(from, to);
          const progress = getArcProgress(arc.startFrame);
          const totalLen = 1000;
          return (
            <g key={i}>
              {/* ghost trail */}
              <path d={path} fill="none" stroke="#00cfff" strokeWidth={1.5}
                strokeDasharray="6 6" opacity={progress * 0.2} />
              {/* animated reveal */}
              <path d={path} fill="none" stroke="url(#arcGrad)" strokeWidth={3}
                strokeDasharray={totalLen} strokeDashoffset={totalLen * (1 - progress)}
                strokeLinecap="round" filter="url(#glow)" />
            </g>
          );
        })}

        {/* City markers */}
        {CITIES.map((city, i) => (
          <g key={i} opacity={cityOp}>
            {/* pulse ring */}
            <circle cx={city.x} cy={city.y} r={pulseR} fill="none"
              stroke="#00cfff" strokeWidth={1.5} opacity={pulseOp} />
            {/* outer ring */}
            <circle cx={city.x} cy={city.y} r={14} fill="rgba(0,207,255,0.1)"
              stroke="#00cfff" strokeWidth={2} />
            {/* inner dot */}
            <circle cx={city.x} cy={city.y} r={5} fill="#00cfff" filter="url(#glow)" />
          </g>
        ))}
      </svg>

      {/* City labels */}
      {CITIES.map((city, i) => {
        const labelOp = interpolate(frame, [45 + i * 8, 62 + i * 8], [0, 1], { extrapolateRight: 'clamp' });
        const labelY = interpolate(frame, [45 + i * 8, 62 + i * 8], [10, 0], { extrapolateRight: 'clamp' });
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: city.x - 80,
              top: city.y + 24,
              width: 160,
              textAlign: 'center',
              opacity: labelOp,
              transform: `translateY(${labelY}px)`,
              pointerEvents: 'none',
            }}
          >
            <div style={{ fontSize: 16, fontWeight: 700, color: '#ffffff', fontFamily: 'sans-serif', letterSpacing: 2, textTransform: 'uppercase', textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>
              {city.name}
            </div>
          </div>
        );
      })}

      {/* Title */}
      <div style={{
        position: 'absolute', top: 60, left: 0, width, textAlign: 'center',
        opacity: titleOp, transform: `translateY(${titleY}px)`,
      }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#00cfff', fontFamily: 'sans-serif', letterSpacing: 6, textTransform: 'uppercase' }}>
          MapLibre · Remotion Test
        </div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace', marginTop: 8, letterSpacing: 3 }}>
          CartoDB Dark Matter · Free tiles · No API key
        </div>
      </div>

      {/* Bottom status */}
      <div style={{
        position: 'absolute', bottom: 40, right: 60,
        opacity: interpolate(frame, [100, 120], [0, 1], { extrapolateRight: 'clamp' }),
        textAlign: 'right',
        fontFamily: 'monospace', fontSize: 12, color: 'rgba(255,255,255,0.3)',
        lineHeight: 1.8,
      }}>
        <div>MAPLIBRE GL JS · CONNECTED</div>
        <div>FRAME {frame} / 180</div>
        <div>TILES: CARTOCDN</div>
      </div>
    </AbsoluteFill>
  );
};
