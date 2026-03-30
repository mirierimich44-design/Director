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

  // 1. Typing Phase (0s to 3s)
  const typingStart = 20;
  const typingDuration = 60;
  const visibleChars = Math.floor(interpolate(frame, [typingStart, typingStart + typingDuration], [0, query.length], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));
  
  // 2. Search Trigger (3s to 4s)
  const resultsStart = typingStart + typingDuration + 15;
  const resultsOp = interpolate(frame, [resultsStart, resultsStart + 20], [0, 1], { extrapolateLeft: 'clamp' });
  const resultsTy = interpolate(frame, [resultsStart, resultsStart + 20], [40, 0], { extrapolateLeft: 'clamp', easing: Easing.out(Easing.quad) });

  // 3. Knowledge Panel (4s onwards)
  const knowledgeStart = resultsStart + 15;
  const knowledgeOp = interpolate(frame, [knowledgeStart, knowledgeStart + 20], [0, 1], { extrapolateLeft: 'clamp' });
  const knowledgeTx = interpolate(frame, [knowledgeStart, knowledgeStart + 20], [40, 0], { extrapolateLeft: 'clamp' });

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden',
      backgroundColor: '#0f172a', fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      {/* Search Header */}
      <div style={{ 
        position: 'absolute', top: 0, left: 0, width: '100%', height: 120, 
        backgroundColor: '#1e293b', borderBottom: '1px solid rgba(255,255,255,0.1)',
        display: 'flex', alignItems: 'center', padding: '0 80px', gap: 60
      }}>
         <div style={{ fontSize: 32, fontWeight: 900, color: 'PRIMARY_COLOR', letterSpacing: '-0.05em' }}>SEARCH_HUB</div>
         
         <div style={{ 
             flex: 1, height: 60, borderRadius: 30, backgroundColor: '#334155', 
             border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', padding: '0 30px'
         }}>
            <div style={{ fontSize: 24, color: '#fff', fontWeight: 500 }}>
              {query.substring(0, visibleChars)}
              {frame < resultsStart && (frame % 20 < 10) && <span style={{ color: 'PRIMARY_COLOR' }}>|</span>}
            </div>
         </div>

         <div style={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.1)' }} />
      </div>

      {/* Main Results Area */}
      <div style={{ position: 'absolute', top: 120, left: 0, width: '100%', height: 960, display: 'flex', padding: '80px', gap: 80 }}>
        
        {/* Results List */}
        <div style={{ flex: 2, opacity: resultsOp, transform: `translateY(${resultsTy}px)` }}>
           <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 18, marginBottom: 40 }}>About 1,240,000 results (0.42 seconds)</div>
           
           {/* Primary Result Card */}
           <div style={{ 
               padding: '40px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 20, 
               border: '1px solid rgba(255,255,255,0.05)', marginBottom: 40
           }}>
              <div style={{ color: '#4fc3f7', fontSize: 20, marginBottom: 8, fontFamily: 'monospace' }}>{r1Url}</div>
              <div style={{ color: 'PRIMARY_COLOR', fontSize: 36, fontWeight: 800, marginBottom: 16 }}>{r1Title}</div>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 22, lineHeight: 1.5 }}>{r1Desc}</div>
           </div>

           {/* Secondary Ghost Results */}
           {[1, 2].map(i => (
               <div key={i} style={{ padding: '20px 40px', opacity: 0.3 }}>
                  <div style={{ height: 16, width: 200, backgroundColor: 'rgba(255,255,255,0.1)', marginBottom: 12, borderRadius: 4 }} />
                  <div style={{ height: 24, width: 400, backgroundColor: 'rgba(255,255,255,0.1)', marginBottom: 12, borderRadius: 4 }} />
                  <div style={{ height: 16, width: 600, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 4 }} />
               </div>
           ))}
        </div>

        {/* Knowledge Panel (Right Sidebar) */}
        <div style={{ 
            flex: 1, opacity: knowledgeOp, transform: `translateX(${knowledgeTx}px)`,
            backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 24, border: '1px solid rgba(255,255,255,0.1)',
            padding: '48px', height: 'fit-content'
        }}>
           <div style={{ width: '100%', height: 240, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, marginBottom: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 80, height: 80, borderRadius: '50%', backgroundColor: 'PRIMARY_COLOR', opacity: 0.2 }} />
           </div>
           
           <div style={{ fontSize: 32, fontWeight: 900, color: '#fff', marginBottom: 12 }}>{kTitle}</div>
           <div style={{ fontSize: 18, color: 'PRIMARY_COLOR', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 24 }}>Official Intelligence Report</div>
           
           <div style={{ height: 1, width: '100%', backgroundColor: 'rgba(255,255,255,0.1)', marginBottom: 24 }} />
           
           <div style={{ fontSize: 20, color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>
             {kDesc}
           </div>

           <div style={{ marginTop: 40, padding: '16px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, fontWeight: 800, marginBottom: 8 }}>SOURCE_VERIFIED</div>
              <div style={{ color: '#2a9d5c', fontSize: 16, fontWeight: 700 }}>DATABASE_ENTRY_4402-A</div>
           </div>
        </div>

      </div>
    </div>
  );
};

export default AnimationComponent;