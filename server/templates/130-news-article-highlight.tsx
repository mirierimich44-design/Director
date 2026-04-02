import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

export const AnimationComponent = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Template Fields
  const publication = 'PUBLICATION_NAME';
  const date = 'ARTICLE_DATE';
  const author = 'AUTHOR_NAME';
  const headline = 'HEADLINE_TEXT';
  const bodyText = 'BODY_TEXT_1';
  const highlightQuote = 'HIGHLIGHT_QUOTE';

  // 1. Entrance Animations
  // The whole article container slides up
  const articleY = interpolate(frame, [0, 30], [200, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const articleOp = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // 2. Content Cascade Reveals
  const headerOp = interpolate(frame, [15, 30], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const headlineOp = interpolate(frame, [25, 40], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const headlineTy = interpolate(frame, [25, 40], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  
  const metaOp = interpolate(frame, [35, 50], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  
  const imageOp = interpolate(frame, [45, 60], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const imageScale = interpolate(frame, [45, 60], [0.82, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const bodyOp = interpolate(frame, [55, 75], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // 3. The "Highlight / Quote" Emphasis Effect
  const highlightStart = 90;
  const quoteOp = interpolate(frame, [highlightStart, highlightStart + 15], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const quoteTy = interpolate(frame, [highlightStart, highlightStart + 15], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  
  // The colored left-border of the quote grows
  const quoteBorderScale = interpolate(frame, [highlightStart + 10, highlightStart + 25], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  
  // A subtle sweeping glow behind the quote
  const quoteGlow = interpolate(frame, [highlightStart + 20, highlightStart + 40, highlightStart + 60], [0, 0.15, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden',
      backgroundColor: 'BACKGROUND_COLOR',
      fontFamily: 'Inter, system-ui, sans-serif',
      display: 'flex', justifyContent: 'center', alignItems: 'flex-start', paddingTop: 80
    }}>
      
      {/* Background Decor: Subtle dots to simulate a digital screen */}
      <div style={{
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
        backgroundImage: 'radial-gradient(rgba(255,255,255,0.05) 2px, transparent 2px)',
        backgroundSize: '40px 40px',
        opacity: 0.5,
        zIndex: 0
      }} />

      {/* Main Article Container */}
      <div style={{
        position: 'relative',
        width: 1000,
        height: 1200, // Taller than screen, bleeds off bottom
        backgroundColor: 'rgba(15, 23, 42, 0.95)', // Solid dark slate
        border: '1px solid rgba(255,255,255,0.1)',
        borderTop: '4px solid PRIMARY_COLOR',
        borderRadius: '24px 24px 0 0',
        boxShadow: '0 40px 100px rgba(0,0,0,0.92)',
        padding: '60px 80px',
        opacity: articleOp,
        transform: `translateY(${articleY}px)`,
        zIndex: 1,
        display: 'flex',
        flexDirection: 'column'
      }}>
        
        {/* Publication Header */}
        <div style={{ opacity: headerOp, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 24, marginBottom: 40 }}>
          <div style={{ fontSize: 24, fontWeight: 900, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.9)', textTransform: 'uppercase' }}>
            {publication}
          </div>
          <div style={{ fontSize: 18, color: 'PRIMARY_COLOR', fontWeight: 600, letterSpacing: '0.1em' }}>
            NEWS / TECHNOLOGY
          </div>
        </div>

        {/* Headline (Using serif for journalistic feel) */}
        <div style={{
          opacity: headlineOp,
          transform: `translateY(${headlineTy}px)`,
          fontFamily: 'Georgia, "Times New Roman", serif',
          fontSize: 64,
          fontWeight: 700,
          color: 'rgba(255,255,255,0.95)',
          lineHeight: 1.15,
          letterSpacing: '-0.01em',
          marginBottom: 32
        }}>
          {headline}
        </div>

        {/* Metadata */}
        <div style={{ opacity: metaOp, display: 'flex', alignItems: 'center', gap: 16, marginBottom: 48 }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.1)' }} />
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'rgba(255,255,255,0.9)' }}>By {author}</div>
            <div style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)' }}>Published: {date} • 5 min read</div>
          </div>
        </div>

        {/* Article Body */}
        <div style={{
          opacity: bodyOp,
          fontFamily: 'Georgia, "Times New Roman", serif',
          fontSize: 24,
          lineHeight: 1.8,
          color: 'rgba(255,255,255,0.75)',
          marginBottom: 40
        }}>
          {bodyText}
        </div>

        {/* Highlighted Quote / Emphasis Block */}
        <div style={{
          opacity: quoteOp,
          transform: `translateY(${quoteTy}px)`,
          position: 'relative',
          padding: '32px 40px',
          backgroundColor: 'rgba(255,255,255,0.03)',
          borderRadius: '0 16px 16px 0',
          marginTop: 16
        }}>
          {/* Animated Left Border */}
          <div style={{
            position: 'absolute', top: 0, left: 0, width: 6, height: '100%',
            backgroundColor: 'PRIMARY_COLOR',
            transformOrigin: 'top',
            transform: `scaleY(${quoteBorderScale})`,
            boxShadow: '0 0 20px PRIMARY_COLOR'
          }} />

          {/* Sweep Glow Background */}
          <div style={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            backgroundColor: 'PRIMARY_COLOR',
            opacity: quoteGlow,
            pointerEvents: 'none'
          }} />

          <div style={{
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontSize: 32,
            fontStyle: 'italic',
            fontWeight: 600,
            lineHeight: 1.5,
            color: 'PRIMARY_COLOR',
            position: 'relative',
            zIndex: 2
          }}>
            "{highlightQuote}"
          </div>
        </div>

      </div>
    </div>
  );
};

export default AnimationComponent;