import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, Easing } from 'remotion';

export const AnimationComponent = () => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();

  const contactName = 'CONTACT_NAME';
  const statusText = 'STATUS_TEXT';

  const rawMessages = [
    { text: 'MSG_1', sender: 'SENDER_1' },
    { text: 'MSG_2', sender: 'SENDER_2' },
    { text: 'MSG_3', sender: 'SENDER_3' },
    { text: 'MSG_4', sender: 'SENDER_4' },
    { text: 'MSG_5', sender: 'SENDER_5' },
    { text: 'MSG_6', sender: 'SENDER_6' },
  ];

  const messages = useMemo(() => {
    const filled = rawMessages.filter(m => m.text !== '' && m.text !== ' ' && !m.text.startsWith('MSG_'));
    return filled.length > 0 ? filled : [
      { text: "Have you seen the latest logs?", sender: "THEM" },
      { text: "Just checking now. Why?", sender: "ME" },
      { text: "Something isn't right with the API gateway.", sender: "THEM" },
      { text: "I see it. High latency on node 04.", sender: "ME" }
    ];
  }, []);

  const count = messages.length;
  const startDelay = 30;
  const endDelay = 40;
  const framesPerMsg = Math.floor((durationInFrames - startDelay - endDelay) / count);

  // Background Entrance
  const entryOp = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden',
      backgroundColor: 'BACKGROUND_COLOR', fontFamily: 'Inter, system-ui, sans-serif',
      display: 'flex', justifyContent: 'center'
    }}>
      
      {/* Phone-style background container */}
      <div style={{
        width: 1000, height: '100%', backgroundColor: 'rgba(15, 23, 42, 0.95)',
        borderLeft: '1px solid rgba(255,255,255,0.1)', borderRight: '1px solid rgba(255,255,255,0.1)',
        display: 'flex', flexDirection: 'column', opacity: entryOp, boxShadow: '0 0 100px rgba(0,0,0,0.92)'
      }}>
        
        {/* Header Bar */}
        <div style={{
          height: 160, backgroundColor: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.1)',
          display: 'flex', alignItems: 'center', padding: '0 60px', gap: 30
        }}>
          {/* Avatar */}
          <div style={{
            width: 80, height: 80, borderRadius: '50%', backgroundColor: 'PRIMARY_COLOR',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 32, fontWeight: 900, color: 'BACKGROUND_COLOR',
            boxShadow: '0 0 20px PRIMARY_COLOR44'
          }}>
            {contactName.substring(0, 1).toUpperCase()}
          </div>
          
          <div style={{ flex: 1 }}>
            <div style={{ color: '#fff', fontSize: 32, fontWeight: 800 }}>{contactName}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#2a9d5c', boxShadow: '0 0 10px #2a9d5c' }} />
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 18, fontWeight: 600 }}>{statusText}</div>
            </div>
          </div>

          <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: 32 }}>⋮</div>
        </div>

        {/* Message Thread Area */}
        <div style={{ 
            flex: 1, 
            padding: '40px 60px', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 30,
            overflow: 'hidden', // Ensure nothing leaves this box
            position: 'relative'
        }}>
          {/* Scrollable Inner Container */}
          <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 30,
              // Calculate a shift to keep newer messages visible if they exceed the container
              // This is a simple version; real scrolling would need more logic
              transform: messages.length > 4 ? `translateY(-${(messages.length - 4) * 120}px)` : 'none',
              transition: 'transform 0.5s ease-in-out'
          }}>
            {messages.map((msg, i) => {
                const isMe = msg.sender.toUpperCase() === 'ME';
                const appearFrame = startDelay + (i * framesPerMsg);
                
                const op = interpolate(frame, [appearFrame, appearFrame + 12], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
                const sc = interpolate(frame, [appearFrame, appearFrame + 15], [0.75, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.backOut });
                const tx = interpolate(frame, [appearFrame, appearFrame + 12], [isMe ? 40 : -40, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

                const bubbleBg = isMe ? 'PRIMARY_COLOR' : 'rgba(255,255,255,0.08)';
                const textColor = isMe ? 'BACKGROUND_COLOR' : 'rgba(255,255,255,0.95)';

                return (
                <div key={i} style={{
                    alignSelf: isMe ? 'flex-end' : 'flex-start',
                    maxWidth: '85%', opacity: op, transform: `translateX(${tx}px) scale(${sc})`,
                    display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start'
                }}>
                    <div style={{
                    backgroundColor: bubbleBg, padding: '24px 32px',
                    borderRadius: isMe ? '32px 32px 4px 32px' : '32px 32px 32px 4px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.51)',
                    fontSize: 26, fontWeight: 500, lineHeight: 1.4, color: textColor
                    }}>
                    {msg.text}
                    </div>
                    <div style={{ marginTop: 8, fontSize: 16, color: 'rgba(255,255,255,0.2)', fontWeight: 600 }}>
                    {new Date(1693526400000 + i * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                </div>
                );
            })}
          </div>
        </div>

        {/* Bottom Input Bar Placeholder */}
        <div style={{
          height: 120, borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', padding: '0 40px', gap: 24
        }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>+</div>
          <div style={{ flex: 1, height: 56, borderRadius: 28, border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.02)', padding: '0 24px', display: 'flex', alignItems: 'center', color: 'rgba(255,255,255,0.2)', fontSize: 20 }}>Type a message...</div>
          <div style={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: 'PRIMARY_COLOR', opacity: 0.3 }} />
        </div>

      </div>

      {/* Security Banner top right */}
      <div style={{ position: 'absolute', top: 40, right: 40, display: 'flex', alignItems: 'center', gap: 12, opacity: 0.2 }}>
         <div style={{ width: 14, height: 14, border: '2px solid CHART_BORDER', borderRadius: 2 }} />
         <div style={{ fontSize: 14, color: 'PRIMARY_COLOR', fontWeight: 800, letterSpacing: '0.1em' }}>E2EE_ACTIVE</div>
      </div>

    </div>
  );
};

export default AnimationComponent;