import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

export const AnimationComponent = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const title = 'TITLE_TEXT';
  const subtitle = 'SUBTITLE_TEXT';
  const severity = 'SEVERITY_LEVEL'; // e.g. CRITICAL, WARNING, INFO
  const timestamp = 'TIMESTAMP_TEXT';
  const description = 'DESCRIPTION_TEXT';

  // Determine severity color
  const isCritical = severity.toUpperCase().includes('CRITICAL') || severity.toUpperCase().includes('HIGH');
  const isWarning = severity.toUpperCase().includes('WARNING') || severity.toUpperCase().includes('MED');
  const severityColor = isCritical ? '#e63946' : isWarning ? '#f4a261' : '#4fc3f7';

  // Entrance animations
  const cardScale = interpolate(frame, [0, 25], [0.95, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const cardOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const cardTranslateY = interpolate(frame, [0, 25], [50, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  
  const contentReveal = interpolate(frame, [20, 45], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const contentTranslateX = interpolate(frame, [20, 45], [-20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Pulse animation for the background
  const pulseScale = interpolate(frame % 60, [0, 60], [1, 1.2], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const pulseOpacity = interpolate(frame % 60, [0, 30, 60], [0, 0.4, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <div style={{ 
      position: 'absolute', 
      top: 0, 
      left: 0, 
      width: 1920, 
      height: 1080, 
      overflow: 'hidden', 
      backgroundColor: 'BACKGROUND_COLOR',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      {/* Dynamic Background Pulse */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: '1200px',
        height: '1200px',
        transform: `translate(-50%, -50%) scale(${pulseScale})`,
        borderRadius: '50%',
        border: `2px solid ${severityColor}`,
        opacity: pulseOpacity,
        zIndex: 0
      }} />

      {/* Main Alert Card */}
      <div style={{ 
        position: 'absolute', 
        top: '50%', 
        left: '50%', 
        transform: `translate(-50%, -50%) scale(${cardScale}) translateY(${cardTranslateY}px)`,
        width: '1100px', 
        backgroundColor: 'rgba(15, 23, 42, 0.8)', // Dark slate blue base
        backdropFilter: 'blur(24px)',
        borderRadius: '32px',
        border: '2px solid rgba(255, 255, 255, 0.1)',
        boxShadow: `0 32px 64px rgba(0, 0, 0, 0.4), 0 0 20px ${severityColor}22`,
        display: 'flex',
        overflow: 'hidden',
        opacity: cardOpacity,
        zIndex: 1
      }}>
        {/* Severity Sidebar */}
        <div style={{
          width: '12px',
          backgroundColor: severityColor,
          boxShadow: `0 0 20px ${severityColor}`
        }} />

        {/* Content Area */}
        <div style={{ 
          flex: 1, 
          padding: '60px 80px', 
          opacity: contentReveal,
          transform: `translateX(${contentTranslateX}px)`
        }}>
          {/* Header Row */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '40px' 
          }}>
            <div style={{ 
              backgroundColor: `${severityColor}22`,
              color: severityColor,
              padding: '8px 24px',
              borderRadius: '100px',
              fontSize: '20px',
              fontWeight: 800,
              letterSpacing: '0.1em',
              border: `1px solid ${severityColor}44`,
              textTransform: 'uppercase'
            }}>
              {severity}
            </div>
            <div style={{ 
              color: 'rgba(255, 255, 255, 0.5)', 
              fontSize: '20px', 
              fontFamily: 'monospace',
              letterSpacing: '0.05em' 
            }}>
              {timestamp}
            </div>
          </div>

          {/* Main Content */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ 
              color: 'PRIMARY_COLOR', 
              fontSize: '64px', 
              fontWeight: 900, 
              lineHeight: 1.1,
              letterSpacing: '-0.03em',
              marginBottom: '16px'
            }}>
              {title}
            </div>
            {subtitle && (
              <div style={{ 
                color: 'ACCENT_COLOR', 
                fontSize: '24px', 
                fontWeight: 600, 
                opacity: 0.9,
                letterSpacing: '0.02em',
                marginBottom: '32px'
              }}>
                {subtitle}
              </div>
            )}
          </div>

          <div style={{
            height: '2px',
            width: '100px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            marginBottom: '32px'
          }} />

          <div style={{ 
            color: 'rgba(255, 255, 255, 0.8)', 
            fontSize: '26px', 
            fontWeight: 400, 
            lineHeight: 1.6,
            maxWidth: '850px' 
          }}>
            {description}
          </div>
        </div>
      </div>

      {/* Decorative Corner Accents */}
      <div style={{
        position: 'absolute',
        top: '60px',
        right: '60px',
        color: 'rgba(255, 255, 255, 0.1)',
        fontSize: '14px',
        fontFamily: 'monospace',
        textAlign: 'right'
      }}>
        SYSTEM_OVERRIDE_ACTIVE<br />
        SECURE_CHANNEL_v4.2
      </div>
    </div>
  );
};

export default AnimationComponent;