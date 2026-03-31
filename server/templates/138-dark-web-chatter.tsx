import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

export const AnimationComponent = () => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();

  const rawMessages = [
    { user: 'USER_1', text: 'MESSAGE_1' },
    { user: 'USER_2', text: 'MESSAGE_2' },
    { user: 'USER_3', text: 'MESSAGE_3' },
    { user: 'USER_4', text: 'MESSAGE_4' },
    { user: 'USER_5', text: 'MESSAGE_5' },
    { user: 'USER_6', text: 'MESSAGE_6' },
  ];

  const messages = useMemo(() => {
    const filled = rawMessages.filter(m => m.text !== '' && m.text !== ' ' && !m.text.startsWith('MESSAGE_'));
    return filled.length > 0 ? filled : [
      { user: '0xGhost', text: 'Initial access established. Deploying payload now.' },
      { user: 'Reaper', text: 'Confirmed. Awaiting lateral movement clearance.' },
      { user: '0xGhost', text: 'Bypassing EDR. We have system privileges.' }
    ];
  }, []);

  // Use dynamic spacing based on the number of messages
  const msgCount = messages.length;
  const paddingY = 80;
  const availableHeight = height - (paddingY * 2);
  const estimatedCardHeight = 160; 
  const gap = msgCount > 1 ? Math.min(40, (availableHeight - (msgCount * estimatedCardHeight)) / (msgCount - 1)) : 0;
  
  // Center the stack vertically
  const totalStackHeight = (msgCount * estimatedCardHeight) + ((msgCount - 1) * gap);
  const startY = (height - totalStackHeight) / 2;

  // Frame timing configuration
  const startDelay = 15;
  const endDelay = 30;
  const framesPerMessage = msgCount > 0 ? Math.floor((durationInFrames - startDelay - endDelay) / msgCount) : 45;

  // Unique colors for different users to make the chat feel alive
  const userColors = ['PRIMARY_COLOR', 'ACCENT_COLOR', '#4fc3f7', '#e63946', '#2a9d5c', '#f4a261'];

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, width: 1920, height: 1080,
      overflow: 'hidden', backgroundColor: 'BACKGROUND_COLOR',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      {/* Background Decor */}
      <div style={{
        position: 'absolute', width: '100%', height: '100%',
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 2px, transparent 2px), linear-gradient(90deg, rgba(255,255,255,0.03) 2px, transparent 2px)',
        backgroundSize: '64px 64px',
        opacity: 0.4
      }} />

      {/* Header */}
      <div style={{
        position: 'absolute', top: 60, left: 120, display: 'flex', alignItems: 'center', opacity: 0.8
      }}>
        <div style={{ width: 16, height: 16, backgroundColor: '#e63946', borderRadius: '50%', marginRight: 16, boxShadow: '0 0 20px #e63946' }} />
        <div style={{ color: '#e63946', fontSize: 24, fontWeight: 900, letterSpacing: '0.2em', fontFamily: 'monospace' }}>
          ENCRYPTED COMMS // INTERCEPTED
        </div>
      </div>

      {/* Message Stack */}
      <div style={{
        position: 'absolute',
        top: startY,
        left: 200,
        width: 1520,
        display: 'flex',
        flexDirection: 'column',
        gap: `${gap}px`
      }}>
        {messages.map((msg, i) => {
          // Identify unique users for color mapping
          const userIndex = Array.from(new Set(messages.map(m => m.user))).indexOf(msg.user);
          const color = userColors[userIndex % userColors.length];

          const startFrame = startDelay + (i * framesPerMessage); // Stagger reveals
          const opacity = interpolate(frame, [startFrame, startFrame + 15], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          const translateY = interpolate(frame, [startFrame, startFrame + 20], [60, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          const scale = interpolate(frame, [startFrame, startFrame + 20], [0.82, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

          // Animated typing indicator before the message appears
          const isTyping = frame >= startFrame - 20 && frame < startFrame;
          const typingDots = Math.floor((frame % 15) / 5) + 1;

          return (
            <React.Fragment key={i}>
              {/* Typing Indicator */}
              {isTyping && (
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 24, fontStyle: 'italic', marginLeft: 100 }}>
                  {msg.user} is typing{'.'.repeat(typingDots)}
                </div>
              )}

              {/* The Message Card */}
              <div style={{
                opacity,
                transform: `translateY(${translateY}px) scale(${scale})`,
                backgroundColor: 'rgba(15, 23, 42, 0.85)', // Heavy Glass
                backdropFilter: 'blur(24px)',
                borderRadius: 24,
                border: '1px solid rgba(255,255,255,0.1)',
                borderLeft: `8px solid ${color}`,
                padding: '32px 48px',
                boxShadow: `0 24px 48px rgba(0,0,0,0.92), 0 0 20px ${color}22`,
                display: 'flex',
                alignItems: 'center',
                gap: 40
              }}>
                {/* Avatar Placeholder */}
                <div style={{
                  width: 80, height: 80, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.05)',
                  border: `2px solid ${color}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: `0 0 20px ${color}44`, flexShrink: 0
                }}>
                  <div style={{ color, fontSize: 32, fontWeight: 900, fontFamily: 'monospace' }}>
                    {msg.user.substring(0, 1).toUpperCase()}
                  </div>
                </div>

                {/* Message Content */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
                    <div style={{ fontSize: 28, fontWeight: 800, color, letterSpacing: '0.05em' }}>
                      {msg.user}
                    </div>
                    {/* Fake Timestamp */}
                    <div style={{ fontSize: 18, color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>
                      {new Date(1693526400000 + (i * 45000)).toISOString().substring(11, 19)} UTC
                    </div>
                  </div>
                  
                  <div style={{ fontSize: 34, color: 'rgba(255,255,255,0.95)', lineHeight: 1.4, fontWeight: 500 }}>
                    {msg.text}
                  </div>
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default AnimationComponent;