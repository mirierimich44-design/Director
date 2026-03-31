import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

export const AnimationComponent = () => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();

  const title = 'TITLE_TEXT';
  const subtitle = 'SUB_TEXT';
  
  // Raw fields from schema
  const rawLabels = ['SOURCE_NODE', 'HOP_1', 'HOP_2', 'HOP_3', 'TARGET_NODE'];
  
  // Filter out any empty fields but keep placeholders for preview
  const activeLabels = rawLabels.filter(l => l !== '' && l !== ' ');

  // Calculate dynamic positions for a staggered layout
  const nodes = useMemo(() => {
    const count = activeLabels.length;
    const startX = 200;
    const totalW = 1520;
    const spacingX = count > 1 ? totalW / (count - 1) : 0;
    
    return activeLabels.map((label, i) => {
      const isSource = i === 0;
      const isTarget = i === count - 1;
      
      // Alternate Y positions for visual interest: center, high, low, high, center
      const yPos = isSource || isTarget ? 540 : (i % 2 === 1 ? 280 : 800);
      
      return {
        id: `node-${i}`,
        index: i,
        label,
        x: startX + (i * spacingX),
        y: yPos,
        isSource,
        isTarget
      };
    });
  }, [activeLabels]);

  // Frame timing configuration
  const startDelay = 20;
  const endDelay = 30;
  const numSegments = nodes.length - 1;
  const framesPerSegment = numSegments > 0 ? Math.floor((durationInFrames - startDelay - endDelay) / numSegments) : 45;

  // Title Animations
  const titleOp = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const titleTy = interpolate(frame, [0, 20], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden', 
      backgroundColor: 'BACKGROUND_COLOR',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      {/* High-tech Background Grid */}
      <div style={{
        position: 'absolute', width: '100%', height: '100%',
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 2px, transparent 2px), linear-gradient(90deg, rgba(255,255,255,0.05) 2px, transparent 2px)',
        backgroundSize: '100px 100px',
        opacity: 0.4
      }} />

      {/* Header */}
      <div style={{ position: 'absolute', top: 60, left: 80, opacity: titleOp, transform: `translateY(${titleTy}px)`, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
          <div style={{ width: 8, height: 48, backgroundColor: '#e63946', marginRight: 24, borderRadius: 4, boxShadow: '0 0 20px #e63946' }} />
          <div style={{ fontSize: 48, fontWeight: 900, color: 'rgba(255,255,255,0.95)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            {title}
          </div>
        </div>
        <div style={{ fontSize: 28, color: 'SUPPORT_COLOR', marginLeft: 32, fontWeight: 500, letterSpacing: '0.02em' }}>
          {subtitle}
        </div>
      </div>

      {/* Network Lines Layer (SVG) */}
      <svg width={1920} height={1080} style={{ position: 'absolute', top: 0, left: 0, zIndex: 1 }}>
        {nodes.map((node, i) => {
          if (i === nodes.length - 1) return null; // No line from last node
          
          const nextNode = nodes[i + 1];
          const dist = Math.sqrt(Math.pow(nextNode.x - node.x, 2) + Math.pow(nextNode.y - node.y, 2));
          
          // Timing for this specific line segment
          const lineStartFrame = startDelay + (i * framesPerSegment) + 10; // Wait 10 frames after node appears
          const lineEndFrame = lineStartFrame + framesPerSegment - 15; // Finish before next node
          
          const drawProgress = interpolate(frame, [lineStartFrame, lineEndFrame], [dist, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          const isActive = frame >= lineStartFrame && frame <= lineEndFrame + 30;

          // Packet animation
          const packetProgress = interpolate(frame, [lineStartFrame, lineEndFrame], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          const packetX = node.x + (nextNode.x - node.x) * packetProgress;
          const packetY = node.y + (nextNode.y - node.y) * packetProgress;
          const packetOp = interpolate(frame, [lineStartFrame, lineStartFrame + 5, lineEndFrame - 5, lineEndFrame], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

          return (
            <g key={`line-${node.id}`}>
              {/* Dim Base Line */}
              <line 
                x1={node.x} y1={node.y} x2={nextNode.x} y2={nextNode.y} 
                stroke="rgba(255,255,255,0.1)" strokeWidth={6} strokeDasharray="12 12"
              />
              
              {/* Active Glowing Attack Line */}
              <line 
                x1={node.x} y1={node.y} x2={nextNode.x} y2={nextNode.y} 
                stroke="#e63946" strokeWidth={6} 
                strokeDasharray={dist} strokeDashoffset={drawProgress}
                style={{ filter: 'drop-shadow(0 0 16px rgba(230,57,70,0.8))' }}
              />

              {/* Data Packet / Attacker Blip */}
              {packetOp > 0 && (
                <circle 
                  cx={packetX} cy={packetY} r={8} 
                  fill="#ffffff" 
                  opacity={packetOp}
                  style={{ filter: 'drop-shadow(0 0 20px #ffffff)' }}
                />
              )}
            </g>
          );
        })}
      </svg>

      {/* Nodes Layer (HTML) */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 2 }}>
        {nodes.map((node, i) => {
          // Calculate when this node should appear
          const appearFrame = startDelay + (i * framesPerSegment);
          
          const scale = interpolate(frame, [appearFrame, appearFrame + 15], [0.8, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          const opacity = interpolate(frame, [appearFrame, appearFrame + 10], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          
          const isTarget = node.isTarget;
          const borderColor = isTarget ? '#e63946' : 'rgba(255, 255, 255, 0.2)';
          const shadowColor = isTarget ? 'rgba(230, 57, 70, 0.5)' : 'rgba(0,0,0,0.5)';

          return (
            <div key={node.id} style={{
              position: 'absolute',
              top: node.y,
              left: node.x,
              transform: `translate(-50%, -50%) scale(${scale})`,
              opacity,
              backgroundColor: 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(20px)',
              border: `2px solid ${borderColor}`,
              borderRadius: 16,
              padding: '24px 32px',
              minWidth: 260,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 24px 48px ${shadowColor}`,
              zIndex: isTarget ? 10 : 2
            }}>
              {/* Node Type Label */}
              <div style={{
                color: isTarget ? '#e63946' : 'PRIMARY_COLOR',
                fontSize: 16,
                fontWeight: 800,
                letterSpacing: '0.15em',
                marginBottom: 12,
                textTransform: 'uppercase',
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: isTarget ? '#e63946' : 'PRIMARY_COLOR', boxShadow: `0 0 10px ${isTarget ? '#e63946' : 'PRIMARY_COLOR'}` }} />
                {node.isSource ? 'ATTACK ORIGIN' : (isTarget ? 'FINAL TARGET' : `COMPROMISED HOP 0${i}`)}
              </div>
              
              {/* Node Name */}
              <div style={{
                color: 'rgba(255,255,255,0.95)',
                fontSize: 26,
                fontWeight: 700,
                textAlign: 'center',
                lineHeight: 1.3
              }}>
                {node.label}
              </div>

              {/* Target Alert Ring */}
              {isTarget && (
                <div style={{
                  position: 'absolute', top: -12, left: -12, right: -12, bottom: -12,
                  border: '2px solid #e63946', borderRadius: 24,
                  opacity: interpolate(frame % 45, [0, 45], [0.8, 0]),
                  transform: `scale(${interpolate(frame % 45, [0, 45], [1, 1.30])})`,
                  pointerEvents: 'none'
                }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AnimationComponent;