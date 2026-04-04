import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, Easing } from 'remotion';

export const AnimationComponent = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const query = 'SEARCH_QUERY';
  const r1Title = 'RESULT_1_TITLE';
  const r1Url = 'RESULT_1_URL';
  const r1Desc = 'RESULT_1_DESC';
  const kTitle = 'KNOWLEDGE_TITLE';
  const kDesc = 'KNOWLEDGE_DESC';

  // 1. Typing Phase
  const typingStart = 15;
  const typingDuration = 40;
  const visibleChars = Math.floor(interpolate(frame, [typingStart, typingStart + typingDuration], [0, query.length], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));
  
  // 2. Search Trigger
  const resultsStart = typingStart + typingDuration + 10;
  const resultsOp = interpolate(frame, [resultsStart, resultsStart + 15], [0, 1], { extrapolateLeft: 'clamp' });

  // 3. Knowledge Panel
  const knowledgeStart = resultsStart + 8;
  const knowledgeOp = interpolate(frame, [knowledgeStart, knowledgeStart + 15], [0, 1], { extrapolateLeft: 'clamp' });

  return (
    <div style={{
      position: 'absolute', inset: 0, overflow: 'hidden',
      backgroundColor: 'BACKGROUND_COLOR', fontFamily: 'Inter, system-ui, sans-serif',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      {/* 16:9 Safe Container */}
      <div style={{ width: 1600, height: 900, position: 'relative' }}>
        
        {/* Modern Search Bar */}
        <div style={{ 
          position: 'absolute', top: 20, left: 0, width: '100%', height: 80, 
          display: 'flex', alignItems: 'center', padding: '0 40px', gap: 30,
          backgroundColor: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(10px)',
          borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)'
        }}>
           <div style={{ fontSize: 24, fontWeight: 900, color: 'PRIMARY_COLOR', letterSpacing: '-0.02em' }}>DIRECTOR_SEARCH</div>
           <div style={{ 
               flex: 1, height: 44, borderRadius: 8, backgroundColor: 'rgba(0,0,0,0.2)', 
               border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', padding: '0 20px'
           }}>
              <div style={{ fontSize: 24, color: '#fff', fontWeight: 500 }}>
                {query.substring(0, visibleChars)}
                {frame < resultsStart && (frame % 20 < 10) && <span style={{ color: 'PRIMARY_COLOR' }}>_</span>}
              </div>
           </div>
        </div>

        {/* Content Area */}
        <div style={{ position: 'absolute', top: 130, left: 0, right: 0, bottom: 0, display: 'flex', gap: 40 }}>
          
          {/* Results List */}
          <div style={{ flex: 1.6, opacity: resultsOp }}>
             <div style={{ color: 'SUPPORT_COLOR', fontSize: 14, marginBottom: 24, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
               TOP_MATCHES // INDEXED
             </div>
             
             {/* Primary Result Card */}
             <div style={{ 
                 padding: '32px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 20, 
                 border: '1px solid rgba(255,255,255,0.05)', marginBottom: 24
             }}>
                <div style={{ color: 'ACCENT_COLOR', fontSize: 18, fontWeight: 800, marginBottom: 10 }}>{r1Url}</div>
                <div style={{ color: 'PRIMARY_COLOR', fontSize: 42, fontWeight: 900, marginBottom: 18, lineHeight: 1.1 }}>{r1Title}</div>
                <div style={{ color: 'SUPPORT_COLOR', fontSize: 24, lineHeight: 1.5, opacity: 0.8 }}>{r1Desc}</div>
             </div>

             {/* Ghost Results */}
             {[1, 2].map(i => (
                 <div key={i} style={{ padding: '16px 32px', opacity: 0.15, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ height: 12, width: 150, backgroundColor: 'rgba(255,255,255,0.5)', marginBottom: 12, borderRadius: 2 }} />
                    <div style={{ height: 24, width: 400, backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: 2 }} />
                 </div>
             ))}
          </div>

          {/* Knowledge Panel */}
          <div style={{ 
              flex: 1, opacity: knowledgeOp,
              backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 24, border: '1px solid rgba(255,255,255,0.08)',
              padding: '40px', maxHeight: 720, backdropFilter: 'blur(20px)',
              display: 'flex', flexDirection: 'column', overflow: 'hidden'
          }}>
             <div style={{ width: '100%', height: 160, backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 12, marginBottom: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ width: 60, height: 60, borderRadius: '50%', border: '3px dashed rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: 30, height: 30, borderRadius: '50%', backgroundColor: 'PRIMARY_COLOR', opacity: 0.3 }} />
                </div>
             </div>
             
             <div style={{ fontSize: 36, fontWeight: 900, color: 'PRIMARY_COLOR', marginBottom: 8 }}>{kTitle}</div>
             <div style={{ fontSize: 14, color: 'SUPPORT_COLOR', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 24 }}>KNOWLEDGE_DATABASE_ENTRY</div>

             <div style={{ fontSize: 22, color: 'SUPPORT_COLOR', lineHeight: 1.5, marginBottom: 32, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 8, WebkitBoxOrient: 'vertical' }}>
               {kDesc}
             </div>

             <div style={{ marginTop: 'auto', padding: '16px', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ color: 'SUPPORT_COLOR', fontSize: 10, fontWeight: 800, marginBottom: 4, opacity: 0.5 }}>SOURCE_VERIFIED</div>
                <div style={{ color: 'ACCENT_COLOR', fontSize: 14, fontWeight: 700, fontFamily: 'monospace' }}>INTEL_CORE_822</div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AnimationComponent;