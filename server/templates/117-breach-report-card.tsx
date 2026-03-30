import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

export const AnimationComponent = () => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();

  const title = "TITLE_TEXT";
  const org = "ORG_NAME";
  const date = "INCIDENT_DATE";
  const records = "RECORDS_STOLEN";
  const impact = "IMPACT_LEVEL"; // e.g. CRITICAL, HIGH, MEDIUM
  const dataTypes = "DATA_TYPES";

  // Determine severity color
  const isCritical = impact.toUpperCase().includes('CRITICAL') || impact.toUpperCase().includes('HIGH');
  const severityColor = isCritical ? '#e63946' : '#f4a261';

  // Entrance Animations
  const cardOp = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const cardScale = interpolate(frame, [0, 25], [0.95, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const cardTy = interpolate(frame, [0, 25], [50, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  
  const contentReveal = interpolate(frame, [25, 45], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const barWidth = interpolate(frame, [40, 100], [0, 100], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Subtle scanning line
  const scanPos = interpolate(frame % 120, [0, 120], [-100, 1100], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden',
      backgroundColor: 'BACKGROUND_COLOR',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      {/* Technical Background Grid */}
      <div style={{
        position: 'absolute', width: '100%', height: '100%',
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
        backgroundSize: '80px 80px',
        opacity: 0.5
      }} />

      {/* Main Tactical Card */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: `translate(-50%, -50%) scale(${cardScale}) translateY(${cardTy}px)`,
        width: 1400, height: 800,
        backgroundColor: 'rgba(15, 23, 42, 0.92)',
        backdropFilter: 'blur(32px)',
        borderRadius: 32,
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 40px 100px rgba(0,0,0,0.6)',
        display: 'flex', overflow: 'hidden', opacity: cardOp
      }}>
        {/* Scanning Line Effect */}
        <div style={{
          position: 'absolute', top: scanPos, left: 0, width: '100%', height: 2,
          backgroundColor: 'PRIMARY_COLOR', opacity: 0.15, zIndex: 10, pointerEvents: 'none',
          boxShadow: '0 0 20px PRIMARY_COLOR'
        }} />

        {/* Severity Sidebar */}
        <div style={{
          width: 24, backgroundColor: severityColor,
          boxShadow: `0 0 30px ${severityColor}88`, position: 'relative'
        }}>
          <div style={{
            position: 'absolute', bottom: 0, left: 0, width: '100%', height: `${barWidth}%`,
            backgroundColor: '#fff', opacity: 0.3
          }} />
        </div>

        {/* Content Container */}
        <div style={{ flex: 1, padding: '80px', display: 'flex', flexDirection: 'column', opacity: contentReveal }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
            <div style={{ 
              fontSize: 24, fontWeight: 900, color: 'PRIMARY_COLOR', 
              letterSpacing: '0.2em', textTransform: 'uppercase' 
            }}>
              {title}
            </div>
            <div style={{
              padding: '10px 24px', backgroundColor: `${severityColor}22`,
              border: `1px solid ${severityColor}44`, borderRadius: 100,
              color: severityColor, fontSize: 20, fontWeight: 800, letterSpacing: '0.1em'
            }}>
              STATUS: {impact}
            </div>
          </div>

          {/* Org Name (Massive) */}
          <div style={{ 
            fontSize: 96, fontWeight: 900, color: '#fff', 
            letterSpacing: '-0.03em', lineHeight: 1, marginBottom: 60
          }}>
            {org}
          </div>

          {/* Metrics Grid */}
          <div style={{ display: 'flex', gap: 100, marginBottom: 80 }}>
            <div>
              <div style={{ fontSize: 18, color: 'rgba(255,255,255,0.4)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>Detection Date</div>
              <div style={{ fontSize: 40, fontWeight: 700, color: 'PRIMARY_COLOR', fontFamily: 'monospace' }}>{date}</div>
            </div>
            <div>
              <div style={{ fontSize: 18, color: 'rgba(255,255,255,0.4)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>Records Leaked</div>
              <div style={{ fontSize: 40, fontWeight: 700, color: 'ACCENT_COLOR', fontFamily: 'monospace' }}>{records}</div>
            </div>
          </div>

          {/* Data Types exposed */}
          <div style={{ 
            marginTop: 'auto', padding: '40px', backgroundColor: 'rgba(255,255,255,0.03)',
            borderRadius: 24, border: '1px solid rgba(255,255,255,0.05)'
          }}>
            <div style={{ fontSize: 18, color: 'PRIMARY_COLOR', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>Targeted Data Assets</div>
            <div style={{ fontSize: 28, color: 'rgba(255,255,255,0.8)', fontWeight: 500, lineHeight: 1.4 }}>
              {dataTypes}
            </div>
          </div>
        </div>

        {/* Decorative Technical Flair */}
        <div style={{
          position: 'absolute', bottom: 40, right: 40, color: 'rgba(255,255,255,0.1)',
          fontFamily: 'monospace', fontSize: 14, textAlign: 'right'
        }}>
          INCIDENT_ID: 0x{Math.floor(frame * 1234).toString(16).toUpperCase()}<br />
          SECURE_VAULT_v9.1
        </div>
      </div>
    </div>
  );
};

export default AnimationComponent;