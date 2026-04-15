import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

export const AnimationComponent = () => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();

  const rawLabels = ['NODE_LABEL_1', 'NODE_LABEL_2', 'NODE_LABEL_3', 'NODE_LABEL_4', 'NODE_LABEL_5', 'NODE_LABEL_6'];
  const labels = useMemo(() => {
    const filled = rawLabels.filter(l => l !== '' && l !== ' ' && !l.startsWith('NODE_LABEL_'));
    return filled.length > 0 ? filled : [
      "MALWARE_HASH_0x42", "SHARED_PDB_PATH", "C2_INFRASTRUCTURE", "APT_CAMPAIGN_74", "RED_PHOENIX_GROUP", "STATE_SPONSORED"
    ];
  }, []);

  const nodes = useMemo(() => [
    { label: labels[0] || 'START', x: 300, y: 540, type: 'ARTIFACT' },
    { label: labels[1] || 'LINK_A', x: 650, y: 300, type: 'LINK' },
    { label: labels[2] || 'LINK_B', x: 650, y: 780, type: 'LINK' },
    { label: labels[3] || 'CAMPAIGN', x: 1000, y: 540, type: 'CLUSTER' },
    { label: labels[4] || 'ACTOR', x: 1350, y: 540, type: 'THREAT_ACTOR' },
    { label: labels[5] || 'ORIGIN', x: 1680, y: 540, type: 'ATTRIBUTION' }
  ], [labels]);

  const connections = [
    [0, 1], [0, 2], [1, 3], [2, 3], [3, 4], [4, 5]
  ];

  // Timing
  const startDelay = 20;
  const framesPerPhase = Math.floor((durationInFrames - startDelay - 60) / nodes.length);

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden',
      backgroundColor: 'BACKGROUND_COLOR', fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      {/* Technical Background Grid */}
      <div style={{
        position: 'absolute', width: '100%', height: '100%',
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
        backgroundSize: '120px 120px',
        opacity: 0.5
      }} />

      {/* Header */}
      <div style={{ position: 'absolute', top: 60, left: 80, display: 'flex', alignItems: 'center', gap: 20 }}>
        <div style={{ width: 12, height: 40, backgroundColor: 'PRIMARY_COLOR', boxShadow: '0 0 15px PRIMARY_COLOR' }} />
        <div style={{ fontSize: 32, fontWeight: 900, color: 'PRIMARY_COLOR', letterSpacing: '0.15em' }}>ATTRIBUTION_GRAPH_v2.0</div>
      </div>

      {/* Connections Layer */}
      <svg width={1920} height={1080} style={{ position: 'absolute', top: 0, left: 0, zIndex: 1 }}>
        {connections.map((conn, i) => {
          const start = nodes[conn[0]];
          const end = nodes[conn[1]];
          const lineStart = startDelay + (conn[0] * framesPerPhase) + 15;
          const lineProgress = interpolate(frame, [lineStart, lineStart + 25], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          
          const ex = start.x + (end.x - start.x) * lineProgress;
          const ey = start.y + (end.y - start.y) * lineProgress;

          const isActive = frame >= lineStart;

          return (
            <g key={i}>
              <line x1={start.x} y1={start.y} x2={end.x} y2={end.y} stroke="rgba(255,255,255,0.05)" strokeWidth={4} />
              <line x1={start.x} y1={start.y} x2={ex} y2={ey} stroke="PRIMARY_COLOR" strokeWidth={4} style={{ filter: 'drop-shadow(0 0 10px PRIMARY_COLOR)' }} />
              {isActive && (
                <circle cx={ex} cy={ey} r={6} fill="#fff" style={{ filter: 'drop-shadow(0 0 15px #fff)' }} opacity={interpolate(frame % 30, [0, 10, 25, 30], [0, 1, 1, 0])} />
              )}
            </g>
          );
        })}
      </svg>

      {/* Nodes Layer */}
      {nodes.map((node, i) => {
        const appearFrame = startDelay + (i * framesPerPhase);
        const op = interpolate(frame, [appearFrame, appearFrame + 15], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
        const sc = interpolate(frame, [appearFrame, appearFrame + 15], [0.8, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
        
        const isAttribution = node.type === 'ATTRIBUTION';
        const color = isAttribution ? '#e63946' : 'PRIMARY_COLOR';

        return (
          <div key={i} style={{
            position: 'absolute', top: node.y, left: node.x, transform: `translate(-50%, -50%) scale(${sc})`,
            opacity: op, zIndex: 2
          }}>
            <div style={{
              width: 240, backgroundColor: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(20px)',
              borderRadius: 16, border: `2px solid ${color}`, padding: '24px 20px',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              boxShadow: `0 20px 40px rgba(0,0,0,0.92), 0 0 20px ${color}22`
            }}>
              <div style={{ 
                fontSize: 14, fontWeight: 900, color: color, 
                letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 12
              }}>
                {node.type}
              </div>
              <div style={{
                color: '#fff', fontSize: 20, fontWeight: 800, textAlign: 'center',
                lineHeight: 1.2, width: '100%', wordBreak: 'break-word'
              }}>
                {node.label}
              </div>
            </div>
            {/* Attribution Warning Ring */}
            {isAttribution && op === 1 && (
               <div style={{
                 position: 'absolute', top: -10, left: -10, right: -10, bottom: -10,
                 border: '2px solid #e63946', borderRadius: 20,
                 opacity: interpolate(frame % 45, [0, 45], [0.8, 0]),
                 transform: `scale(${interpolate(frame % 45, [0, 45], [1, 1.30])})`
               }} />
            )}
          </div>
        );
      })}

      {/* Footer System Legend */}
      <div style={{ position: 'absolute', bottom: 60, left: 80, display: 'flex', gap: 40, opacity: 0.4 }}>
         <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: 'PRIMARY_COLOR' }} />
            <div style={{ color: 'PRIMARY_COLOR', fontSize: 14, fontWeight: 700 }}>VERIFIED_LINK</div>
         </div>
         <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#e63946' }} />
            <div style={{ color: 'PRIMARY_COLOR', fontSize: 14, fontWeight: 700 }}>CONFIRMED_ORIGIN</div>
         </div>
      </div>
    </div>
  );
};

export default AnimationComponent;