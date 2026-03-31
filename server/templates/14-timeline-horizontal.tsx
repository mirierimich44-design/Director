import React, { useMemo } from 'react'
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion'

export const AnimationComponent = () => {
  const frame = useCurrentFrame()
  const { fps, durationInFrames } = useVideoConfig()

  // Content
  const rawEvents = ["EVENT_1", "EVENT_2", "EVENT_3", "EVENT_4", "EVENT_5", "EVENT_6"]
  const rawDates = ["DATE_1", "DATE_2", "DATE_3", "DATE_4", "DATE_5", "DATE_6"]

  // Filter out empty or placeholder items
  const data = useMemo(() => {
    return rawEvents
      .map((event, i) => ({ event, date: rawDates[i] }))
      .filter(item => item.event !== '' && item.event !== 'Placeholder' && !item.event.startsWith('EVENT_') && item.date !== '' && item.date !== 'Placeholder' && !item.date.startsWith('DATE_'))
  }, [])

  // Provide fallback data if empty for preview purposes
  const displayData = data.length > 0 ? data : [
    { event: "EVENT_1", date: "DATE_1" },
    { event: "EVENT_2", date: "DATE_2" }
  ];

  const count = displayData.length
  const events = displayData.map(d => d.event)
  const dates = displayData.map(d => d.date)

  // Layout math
  const startX = 200
  const totalWidth = 1520
  const nodeXPositions = Array.from({ length: count }, (_, i) => 
    count > 1 ? startX + (i * (totalWidth / (count - 1))) : startX + totalWidth/2
  )
  const lineY = 540
  const labelAbove = Array.from({ length: count }, (_, i) => i % 2 === 0)

  // Title
  const titleOp = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const titleTy = interpolate(frame, [0, 20], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  // Main line draw - thick modern track
  const trackDrawFrames = durationInFrames - 120; // Leave 4 seconds at the end
  const lineProgress = interpolate(frame, [15, 15 + trackDrawFrames], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const currentDrawX = startX + (totalWidth * lineProgress);

  const title = "TITLE_TEXT"

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
      {/* Background Decor */}
      <div style={{
        position: 'absolute', width: '100%', height: '100%',
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
        backgroundSize: '120px 120px',
        opacity: 0.5
      }} />

      {/* Header Area */}
      <div style={{
        position: 'absolute',
        top: 60,
        left: 80,
        display: 'flex',
        alignItems: 'center',
        opacity: titleOp,
        transform: `translateY(${titleTy}px)`,
        zIndex: 10
      }}>
        <div style={{ width: 8, height: 48, backgroundColor: 'PRIMARY_COLOR', marginRight: 24, borderRadius: 4, boxShadow: '0 0 15px PRIMARY_COLOR' }} />
        <span style={{
          fontSize: 48,
          fontWeight: 900,
          color: 'rgba(255,255,255,0.95)',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
        }}>
          {title}
        </span>
      </div>

      {/* Timeline Track Layer */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1 }}>
        {/* Background Track (dim) */}
        <div style={{
          position: 'absolute',
          top: lineY - 6,
          left: startX,
          width: totalWidth,
          height: 12,
          backgroundColor: 'rgba(255,255,255,0.05)',
          borderRadius: 6
        }} />

        {/* Active Animated Track (bright) */}
        <div style={{
          position: 'absolute',
          top: lineY - 6,
          left: startX,
          width: totalWidth * lineProgress,
          height: 12,
          backgroundColor: 'PRIMARY_COLOR',
          borderRadius: 6,
          boxShadow: '0 0 30px PRIMARY_COLOR'
        }} />
        
        {/* Leading Edge Glow */}
        {lineProgress > 0 && lineProgress < 1 && (
          <div style={{
            position: 'absolute',
            top: lineY - 12,
            left: currentDrawX - 12,
            width: 24,
            height: 24,
            backgroundColor: '#fff',
            borderRadius: '50%',
            boxShadow: '0 0 40px 10px PRIMARY_COLOR'
          }} />
        )}
      </div>

      {/* Nodes and Cards Layer */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 2 }}>
        {nodeXPositions.map((x, i) => {
          // Calculate when the line reaches this node
          const distanceRatio = (x - startX) / totalWidth;
          const reachFrame = 15 + (trackDrawFrames * distanceRatio);
          
          // Animate node and card AFTER the line reaches it
          const nodeScale = interpolate(frame, [reachFrame, reachFrame + 10], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          const cardOp = interpolate(frame, [reachFrame + 5, reachFrame + 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          
          const above = labelAbove[i];
          const cardY = above ? lineY - 260 : lineY + 60;
          const cardTranslateY = interpolate(frame, [reachFrame + 5, reachFrame + 20], [above ? 40 : -40, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          
          const isActive = frame >= reachFrame;

          return (
            <React.Fragment key={`node-${i}`}>
              {/* Connector Line */}
              {isActive && (
                <div style={{
                  position: 'absolute',
                  left: x - 1,
                  top: above ? cardY + 160 : lineY,
                  width: 3,
                  height: above ? lineY - (cardY + 160) : (cardY) - lineY,
                  backgroundColor: 'PRIMARY_COLOR',
                  opacity: cardOp,
                  transformOrigin: above ? 'bottom' : 'top',
                  transform: `scaleY(${cardOp})`
                }} />
              )}

              {/* Node on Timeline */}
              <div style={{
                position: 'absolute',
                top: lineY - 16,
                left: x - 16,
                width: 32,
                height: 32,
                borderRadius: '50%',
                backgroundColor: 'BACKGROUND_COLOR',
                border: '6px solid PRIMARY_COLOR',
                boxShadow: isActive ? '0 0 20px PRIMARY_COLOR' : 'none',
                transform: `scale(${nodeScale})`,
                zIndex: 3
              }}>
                <div style={{
                  position: 'absolute', top: 4, left: 4, width: 12, height: 12, 
                  backgroundColor: 'ACCENT_COLOR', borderRadius: '50%', opacity: isActive ? 1 : 0
                }} />
              </div>

              {/* Content Card */}
              <div style={{
                position: 'absolute',
                top: cardY,
                left: x - 160,
                width: 320,
                backgroundColor: 'rgba(15, 23, 42, 0.85)',
                backdropFilter: 'blur(16px)',
                borderRadius: 16,
                border: '1px solid rgba(255,255,255,0.15)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.80)',
                padding: '24px',
                opacity: cardOp,
                transform: `translateY(${cardTranslateY}px)`,
                display: 'flex',
                flexDirection: 'column',
                zIndex: 4,
                borderTop: above ? '4px solid ACCENT_COLOR' : '1px solid rgba(255,255,255,0.15)',
                borderBottom: !above ? '4px solid ACCENT_COLOR' : '1px solid rgba(255,255,255,0.15)',
              }}>
                <span style={{
                  fontSize: 28,
                  fontWeight: 800,
                  color: 'ACCENT_COLOR',
                  letterSpacing: '0.05em',
                  marginBottom: 12,
                  textTransform: 'uppercase',
                }}>
                  {dates[i]}
                </span>
                <span style={{
                  fontSize: 24,
                  fontWeight: 500,
                  color: 'rgba(255,255,255,0.95)',
                  lineHeight: 1.4,
                }}>
                  {events[i]}
                </span>
              </div>
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}

export default AnimationComponent