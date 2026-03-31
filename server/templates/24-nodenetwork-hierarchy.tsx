import React, { useMemo } from 'react'
import { useCurrentFrame, useVideoConfig, interpolate, Easing } from 'remotion'

export const AnimationComponent = () => {
  const frame = useCurrentFrame()
  const { width, height } = useVideoConfig()

  const title = "TITLE_TEXT"
  const originLabel = "ORIGIN_LABEL"
  const rawNodeLabels = ["NODE_LABEL_1", "NODE_LABEL_2", "NODE_LABEL_3", "NODE_LABEL_4", "NODE_LABEL_5", "NODE_LABEL_6"]
  const rawTags = ["TAG_1", "TAG_2", "TAG_3"]

  // Filter logic: Only keep nodes that have valid labels
  const activeData = useMemo(() => {
    const filtered = rawNodeLabels
      .map((label, i) => ({ label, tag: rawTags[Math.floor(i / 2)] }))
      .filter(item => item.label !== '' && item.label !== 'Placeholder')
    
    const midNodes = []
    const leafNodes = []
    const rootY = 220
    const midY = 520
    const leafY = 820
    
    // Grouping logic: 2 leaves per mid node
    const groups = Math.ceil(filtered.length / 2)
    const spacing = 1800 / (groups + 1)
    const startOffset = (1920 - (spacing * (groups - 1))) / 2
    
    for (let i = 0; i < groups; i++) {
      const midX = startOffset + (spacing * i)
      midNodes.push({ x: midX, y: midY, tag: rawTags[i] || `SEGMENT_${i+1}` })
      
      const leaves = filtered.slice(i * 2, i * 2 + 2)
      leaves.forEach((leaf, j) => {
        // Offset leaves slightly from mid node center
        const leafX = midX + (j === 0 ? -140 : 140)
        leafNodes.push({ 
            x: leafX, 
            y: leafY, 
            label: leaf.label, 
            parentIndex: i,
            id: `LN_${i}_${j}`
        })
      })
    }
    return { midNodes, leafNodes, rootY }
  }, [rawNodeLabels, rawTags])

  const { midNodes, leafNodes, rootY } = activeData
  const rootX = 960

  // Animation Timings
  const entranceStart = 10
  const titleOp = interpolate(frame, [entranceStart, entranceStart + 30], [0, 1], { extrapolateRight: 'clamp' })
  const titleTy = interpolate(frame, [entranceStart, entranceStart + 30], [20, 0], { extrapolateRight: 'clamp', easing: Easing.out(Easing.quad) })
  
  const rootEntrance = interpolate(frame, [entranceStart + 10, entranceStart + 40], [0, 1], { extrapolateRight: 'clamp', easing: Easing.out(Easing.back(1.5)) })
  const rootScale = interpolate(frame, [entranceStart + 10, entranceStart + 40], [0.5, 1], { extrapolateRight: 'clamp', easing: Easing.out(Easing.back(1.5)) })

  // Floating effect
  const floatY = Math.sin(frame / 30) * 10
  const floatRotate = Math.sin(frame / 45) * 2

  // Line Flow Progress
  const flowProgress = interpolate(frame % 90, [0, 90], [0, 1])

  const glassStyle: React.CSSProperties = {
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '16px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 10px 30px rgba(0,0,0,0.48)',
    position: 'absolute'
  }

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden', backgroundColor: 'BACKGROUND_COLOR', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* Background Grid */}
      <div style={{
        position: 'absolute', width: '100%', height: '100%',
        backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.02) 0%, transparent 80%), linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
        backgroundSize: '100% 100%, 80px 80px, 80px 80px',
        opacity: 0.6
      }} />

      {/* Header Panel */}
      <div style={{ 
          position: 'absolute', top: 60, left: 0, width: 1920, textAlign: 'center', 
          opacity: titleOp, transform: `translateY(${titleTy}px)`, zIndex: 10 
      }}>
        <div style={{ fontSize: 14, fontWeight: 900, color: 'ACCENT_COLOR', letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: 8 }}>NETWORK_HIERARCHY_v4.2</div>
        <div style={{ fontSize: 42, fontWeight: 900, color: 'PRIMARY_COLOR', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{title}</div>
        <div style={{ width: 120, height: 4, backgroundColor: 'ACCENT_COLOR', margin: '16px auto', borderRadius: 2, boxShadow: '0 0 15px ACCENT_COLOR' }} />
      </div>

      <svg width={1920} height={1080} style={{ position: 'absolute', top: 0, left: 0 }}>
        <defs>
            <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
            </filter>
        </defs>

        {/* Root to Mid Connections */}
        {midNodes.map((n, i) => {
            const lineOp = interpolate(frame, [entranceStart + 30 + i * 5, entranceStart + 50 + i * 5], [0, 0.6], { extrapolateRight: 'clamp' })
            return (
                <g key={`l1-${i}`}>
                    <line x1={rootX} y1={rootY} x2={n.x} y2={n.y} stroke="PRIMARY_COLOR" strokeWidth={2} opacity={lineOp} strokeDasharray="5 5" />
                    {/* Flow Particle */}
                    <circle r={3} fill="ACCENT_COLOR" opacity={lineOp}>
                        <animateMotion 
                            path={`M ${rootX} ${rootY} L ${n.x} ${n.y}`} 
                            dur="2s" 
                            repeatCount="indefinite" 
                            begin={`${i * 0.4}s`}
                        />
                    </circle>
                </g>
            )
        })}

        {/* Mid to Leaf Connections */}
        {leafNodes.map((n, i) => {
            const parent = midNodes[n.parentIndex]
            const lineOp = interpolate(frame, [entranceStart + 60 + i * 3, entranceStart + 80 + i * 3], [0, 0.4], { extrapolateRight: 'clamp' })
            return (
                <g key={`l2-${i}`}>
                    <line x1={parent.x} y1={parent.y} x2={n.x} y2={n.y} stroke="LINE_STROKE" strokeWidth={1} opacity={lineOp} strokeDasharray="3 3" />
                </g>
            )
        })}
      </svg>

      {/* Root Node (Master Control) */}
      <div style={{
          ...glassStyle,
          width: 240, height: 100,
          top: rootY - 50, left: rootX - 120,
          border: '2px solid PRIMARY_COLOR',
          opacity: rootEntrance,
          transform: `scale(${rootScale}) translateY(${floatY * 0.5}px)`,
          zIndex: 20
      }}>
          <div style={{ fontSize: 12, color: 'ACCENT_COLOR', fontWeight: 900, letterSpacing: '0.1em', marginBottom: 4 }}>ORIGIN_CORE</div>
          <div style={{ fontSize: 20, color: '#fff', fontWeight: 800, textTransform: 'uppercase' }}>{originLabel}</div>
          <div style={{ position: 'absolute', bottom: -15, width: '40%', height: 4, backgroundColor: 'PRIMARY_COLOR', borderRadius: 2 }} />
      </div>

      {/* Mid Nodes (Segments) */}
      {midNodes.map((n, i) => {
        const nodeOp = interpolate(frame, [entranceStart + 40 + i * 8, entranceStart + 60 + i * 8], [0, 1], { extrapolateRight: 'clamp' })
        const nodeScale = interpolate(frame, [entranceStart + 40 + i * 8, entranceStart + 60 + i * 8], [0.8, 1], { extrapolateRight: 'clamp', easing: Easing.out(Easing.back(1.2)) })
        
        return (
            <div key={`mn-${i}`} style={{
                ...glassStyle,
                width: 200, height: 80,
                top: n.y - 40, left: n.x - 100,
                borderTop: '4px solid SECONDARY_COLOR',
                opacity: nodeOp,
                transform: `scale(${nodeScale}) translateY(${Math.sin((frame + i * 20) / 30) * 8}px) rotate(${floatRotate}deg)`,
                zIndex: 15
            }}>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontWeight: 800, marginBottom: 4 }}>SEGMENT_TAG</div>
                <div style={{ fontSize: 16, color: 'SECONDARY_COLOR', fontWeight: 900, textTransform: 'uppercase' }}>{n.tag}</div>
            </div>
        )
      })}

      {/* Leaf Nodes (Endpoints) */}
      {leafNodes.map((n, i) => {
        const nodeOp = interpolate(frame, [entranceStart + 70 + i * 5, entranceStart + 90 + i * 5], [0, 1], { extrapolateRight: 'clamp' })
        const nodeTy = interpolate(frame, [entranceStart + 70 + i * 5, entranceStart + 90 + i * 5], [20, 0], { extrapolateRight: 'clamp' })
        
        return (
            <div key={`ln-${i}`} style={{
                ...glassStyle,
                width: 180, height: 60,
                top: n.y - 30, left: n.x - 90,
                backgroundColor: 'rgba(30, 41, 59, 0.6)',
                borderRadius: '8px',
                opacity: nodeOp,
                transform: `translateY(${nodeTy + Math.sin((frame + i * 15) / 25) * 5}px)`,
                padding: '0 15px',
                alignItems: 'flex-start',
                zIndex: 10
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'NODE_STROKE', boxShadow: '0 0 10px NODE_STROKE' }} />
                    <div style={{ fontSize: 14, color: '#fff', fontWeight: 600 }}>{n.label}</div>
                </div>
                <div style={{ fontSize: 9, color: 'SUPPORT_COLOR', fontFamily: 'monospace', marginTop: 4 }}>STATUS: ACTIVE // ID: {n.id}</div>
            </div>
        )
      })}

      {/* Forensic detail */}
      <div style={{ position: 'absolute', bottom: 40, right: 60, opacity: 0.3, textAlign: 'right' }}>
         <div style={{ color: '#fff', fontSize: 12, fontFamily: 'monospace' }}>
            SYSTEM_TREE_DECODED: TRUE<br />
            NODES_MAPPED: {leafNodes.length}<br />
            PROTOCOL: ARXXIS_v9
         </div>
      </div>
    </div>
  )
}

export default AnimationComponent