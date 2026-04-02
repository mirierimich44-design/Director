import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, Easing } from 'remotion';

export const AnimationComponent = () => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();

  const query = 'SEARCH_QUERY';
  const r1Title = 'RESULT_1_TITLE';
  const r1Url = 'RESULT_1_URL';
  const r1Desc = 'RESULT_1_DESC';
  const kTitle = 'KNOWLEDGE_TITLE';
  const kDesc = 'KNOWLEDGE_DESC';

  // 1. Typing Phase (0s to 2s)
  const typingStart = 15;
  const typingDuration = 45;
  const visibleChars = Math.floor(interpolate(frame, [typingStart, typingStart + typingDuration], [0, query.length], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));
  
  // 2. Search Trigger
  const resultsStart = typingStart + typingDuration + 10;
  const resultsOp = interpolate(frame, [resultsStart, resultsStart + 15], [0, 1], { extrapolateLeft: 'clamp' });
  const resultsTy = interpolate(frame, [resultsStart, resultsStart + 15], [30, 0], { extrapolateLeft: 'clamp', easing: Easing.out(Easing.quad) });

  // 3. Knowledge Panel
  const knowledgeStart = resultsStart + 10;
  const knowledgeOp = interpolate(frame, [knowledgeStart, knowledgeStart + 20], [0, 1], { extrapolateLeft: 'clamp' });
  const knowledgeScale = interpolate(frame, [knowledgeStart, knowledgeStart + 20], [0.95, 1], { extrapolateLeft: 'clamp', easing: Easing.out(Easing.quad) });

  return (
    <div style={{
      position: 'absolute', inset: 0, overflow: 'hidden',
      backgroundColor: '#050505', fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      {/* Background Decor */}
      <div style={{ position: 'absolute', top: -200, right: -200, width: 600, height: 600, background: 'radial-gradient(circle, PRIMARY_COLOR 0%, transparent 70%)', opacity: 0.1, filter: 'blur(100px)' }} />

      {/* Modern Search Bar (Centered then shifts up or stays integrated) */}
      <div style={{ 
        position: 'absolute', top: 60, left: 0, width: '100%', height: 100, 
        display: 'flex', alignItems: 'center', padding: '0 80px', gap: 40,
        backgroundColor: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.05)', zIndex: 10
      }}>
         <div style={{ fontSize: 28, fontWeight: 900, color: 'PRIMARY_COLOR', letterSpacing: '-0.02em' }}>INTEL_SEARCH</div>
         
         <div style={{ 
             flex: 1, height: 56, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)', 
             border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', padding: '0 24px'
         }}>
            <div style={{ fontSize: 20, color: '#fff', fontWeight: 500 }}>
              {query.substring(0, visibleChars)}
              {frame < resultsStart && (frame % 20 < 10) && <span style={{ color: 'PRIMARY_COLOR' }}>_</span>}
            </div>
         </div>
      </div>

      {/* Content Container */}
      <div style={{ 
          position: 'absolute', top: 160, left: 80, right: 80, bottom: 40,
          display: 'flex', gap: 60
      }}>
        
        {/* Main Results Column */}
        <div style={{ flex: 1.6, opacity: resultsOp, transform: `translateY(${resultsTy}px)` }}>
           <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 16, marginBottom: 32, fontWeight: 600, letterSpacing: 1 }}>
             INDEXED_DATABASE // SEARCH_RESULTS
           </div>
           
           {/* Primary Result Card (Modernized) */}
           <div style={{ 
               padding: '40px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 24, 
               border: '1px solid rgba(255,255,255,0.08)', marginBottom: 32,
               boxShadow: '0 20px 50px rgba(0,0,0,0.3)'
           }}>
              <div style={{ color: 'ACCENT_COLOR', fontSize: 16, fontWeight: 800, marginBottom: 12, opacity: 0.8 }}>{r1Url}</div>
              <div style={{ color: '#fff', fontSize: 40, fontWeight: 900, marginBottom: 20, lineHeight: 1.1 }}>{r1Title}</div>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 22, lineHeight: 1.6, maxWidth: '90%' }}>{r1Desc}</div>
           </div>

           {/* Ghost Results */}
           {[1, 2, 3].map(i => (
               <div key={i} style={{ padding: '24px 40px', opacity: 0.2, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ height: 14, width: 180, backgroundColor: 'rgba(255,255,255,0.2)', marginBottom: 16, borderRadius: 2 }} />
                  <div style={{ height: 28, width: 500, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 2 }} />
               </div>
           ))}
        </div>

        {/* Knowledge Panel (High-End Side Card) */}
        <div style={{ 
            flex: 1, opacity: knowledgeOp, transform: `scale(${knowledgeScale})`,
            backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 32, border: '1px solid rgba(255,255,255,0.1)',
            padding: '48px', height: 'fit-content', backdropFilter: 'blur(30px)',
            boxShadow: '0 40px 100px rgba(0,0,0,0.5)', overflow: 'hidden'
        }}>
           <div style={{ 
               position: 'absolute', top: 0, left: 0, width: '100%', height: 4, 
               backgroundColor: 'PRIMARY_COLOR', boxShadow: '0 0 20px PRIMARY_COLOR' 
           }} />

           <div style={{ width: '100%', height: 200, backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 16, marginBottom: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ width: 100, height: 100, borderRadius: '50%', border: '4px dashed rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 50, height: 50, borderRadius: '50%', backgroundColor: 'PRIMARY_COLOR', opacity: 0.3 }} />
              </div>
           </div>
           
           <div style={{ fontSize: 36, fontWeight: 900, color: '#fff', marginBottom: 12, letterSpacing: '-0.02em' }}>{kTitle}</div>
           <div style={{ fontSize: 16, color: 'PRIMARY_COLOR', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 32 }}>KNOWLEDGE_ENTRY_FILE</div>
           
           <div style={{ fontSize: 22, color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, fontWeight: 500, marginBottom: 40 }}>
             {kDesc}
           </div>

           <div style={{ padding: '24px', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: 800, letterSpacing: '0.1em', marginBottom: 8 }}>SOURCE_AUTHENTICATED</div>
              <div style={{ color: '#4caf50', fontSize: 18, fontWeight: 700, fontFamily: 'monospace' }}>SECURE_CORE_082</div>
           </div>
        </div>

      </div>
    </div>
  );
};

export default AnimationComponent;