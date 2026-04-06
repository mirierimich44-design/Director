import React, { useMemo } from 'react'
import { useCurrentFrame, useVideoConfig, interpolate, Img, staticFile } from 'remotion'

export const AnimationComponent = () => {
  const frame = useCurrentFrame()

  const personName = "PERSON_NAME"
  const personRole = "PERSON_ROLE"
  const bio1 = "BIO_LINE_1"
  const bio2 = "BIO_LINE_2"
  const bio3 = "BIO_LINE_3"
  const tag1 = "TAG_1"
  const tag2 = "TAG_2"
  const tag3 = "TAG_3"
  const imageSrc = "IMAGE_SRC"
  const orgLabel = "ORG_LABEL"

  // Resolve image — remote URLs must not be wrapped in staticFile()
  const resolvedImage = useMemo(() => {
    if (!imageSrc || imageSrc === 'IMAGE_SRC' || imageSrc.startsWith('IMAGE_')) return null;
    if (/^https?:\/\//i.test(imageSrc)) return imageSrc;
    return staticFile(imageSrc);
  }, [imageSrc])

  // Filter bio lines
  const activeBios = useMemo(() => {
    return [bio1, bio2, bio3].filter(b => b !== '' && b !== 'Placeholder')
  }, [bio1, bio2, bio3])

  // Filter tags
  const activeTags = useMemo(() => {
    return [tag1, tag2, tag3].filter(t => t !== '' && t !== 'Placeholder')
  }, [tag1, tag2, tag3])

  // Panel slide in
  const panelX = interpolate(frame, [0, 30], [-200, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  // Photo fade + scale
  const photoOp = interpolate(frame, [15, 45], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  const photoScale = interpolate(frame, [15, 45], [1.22, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  // Name reveal
  const nameOp = interpolate(frame, [35, 55], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  const nameY = interpolate(frame, [35, 55], [24, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  // Role reveal
  const roleOp = interpolate(frame, [45, 65], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  const roleY = interpolate(frame, [45, 65], [20, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  // Bio lines stagger
  const bioOp = (index: number) => interpolate(frame, [55 + (index * 7), 70 + (index * 7)], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  // Tag reveal
  const tagOp = interpolate(frame, [80, 95], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  const tagY = interpolate(frame, [80, 95], [16, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  // Accent line width
  const lineW = interpolate(frame, [35, 60], [0, 280], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  return (
    <div style={{
      position: 'absolute',
      top: 0, left: 0,
      width: 1920, height: 1080,
      overflow: 'hidden',
      backgroundColor: 'BACKGROUND_COLOR',
    }}>

      {/* Left photo panel */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0,
        width: 700, height: 1080,
        overflow: 'hidden',
        backgroundColor: 'PANEL_LEFT_BG',
        transform: `translateX(${panelX}px)`,
      }}>
        <div style={{
          position: 'absolute',
          top: 0, left: 0,
          width: 700, height: 1080,
          overflow: 'hidden',
          opacity: photoOp,
          transform: `scale(${photoScale})`,
          transformOrigin: 'center center',
        }}>
          <Img
            src={resolvedImage || ''}
            style={{
              position: 'absolute',
              top: 0, left: 0,
              width: 700,
              height: 1080,
              objectFit: 'cover',
              objectPosition: 'center top',
            }}
          />
        </div>

        <div style={{
          position: 'absolute',
          top: 0, left: 0,
          width: 700, height: 1080,
          overflow: 'hidden',
          backgroundColor: 'transparent',
          backgroundImage: 'linear-gradient(to right, transparent 60%, BACKGROUND_COLOR 100%)',
        }} />

        <div style={{
          position: 'absolute',
          bottom: 0, left: 0,
          width: 700, height: 300,
          overflow: 'hidden',
          backgroundColor: 'transparent',
          backgroundImage: 'linear-gradient(to top, BACKGROUND_COLOR 0%, transparent 100%)',
        }} />
      </div>

      {/* Right info panel */}
      <div style={{
        position: 'absolute',
        top: 0, left: 700,
        width: 1220, height: 1080,
        overflow: 'hidden',
        backgroundColor: 'PANEL_RIGHT_BG',
      }}>

        <div style={{
          position: 'absolute',
          top: 200, left: 100,
          width: 5, height: 480,
          overflow: 'hidden',
          backgroundColor: 'ACCENT_COLOR',
        }} />

        <div style={{
          position: 'absolute',
          top: 200, left: 130,
          height: 40,
          overflow: 'hidden',
          opacity: roleOp,
        }}>
          <div style={{
            fontFamily: 'monospace',
            fontSize: 18,
            letterSpacing: 6,
            textTransform: 'uppercase' as const,
            color: 'ACCENT_COLOR',
          }}>
            {orgLabel}
          </div>
        </div>

        <div style={{
          position: 'absolute',
          top: 252, left: 130,
          height: 120,
          overflow: 'hidden',
          opacity: nameOp,
          transform: `translateY(${nameY}px)`,
        }}>
          <div style={{
            fontFamily: 'sans-serif',
            fontSize: 72,
            fontWeight: 800,
            lineHeight: 1.1,
            color: 'PRIMARY_COLOR',
            letterSpacing: -1,
          }}>
            {personName}
          </div>
        </div>

        <div style={{
          position: 'absolute',
          top: 382, left: 130,
          height: 4,
          width: lineW,
          overflow: 'hidden',
          backgroundColor: 'ACCENT_COLOR',
        }} />

        <div style={{
          position: 'absolute',
          top: 402, left: 130,
          height: 50,
          overflow: 'hidden',
          opacity: roleOp,
          transform: `translateY(${roleY}px)`,
        }}>
          <div style={{
            fontFamily: 'sans-serif',
            fontSize: 28,
            fontWeight: 400,
            color: 'SECONDARY_COLOR',
            letterSpacing: 1,
          }}>
            {personRole}
          </div>
        </div>

        {/* Bio lines */}
        {activeBios.map((bio, i) => (
          <div key={i} style={{
            position: 'absolute',
            top: 490 + (i * 42), left: 130,
            height: 36,
            overflow: 'hidden',
            opacity: bioOp(i),
          }}>
            <div style={{
              fontFamily: 'sans-serif',
              fontSize: 22,
              color: 'SECONDARY_COLOR',
              lineHeight: 1.6,
            }}>
              {bio}
            </div>
          </div>
        ))}

        {/* Tags */}
        {activeTags.length > 0 && (
          <div style={{
            position: 'absolute',
            top: 660, left: 128,
            height: 48,
            overflow: 'hidden',
            opacity: tagOp,
            transform: `translateY(${tagY}px)`,
            display: 'flex',
            gap: 16,
            alignItems: 'center',
          }}>
            {activeTags.map((tag, i) => (
              <div key={i} style={{
                fontFamily: 'monospace',
                fontSize: 16,
                letterSpacing: 3,
                textTransform: 'uppercase' as const,
                color: 'TEXT_ON_ACCENT',
                backgroundColor: 'ACCENT_COLOR',
                padding: '8px 20px',
                borderRadius: 2,
              }}>
                {tag}
              </div>
            ))}
          </div>
        )}

      </div>

      <svg width={1920} height={1080} style={{ position: 'absolute', top: 0, left: 0 }}>
        <line x1="40" y1="40" x2="120" y2="40" stroke="LINE_STROKE" strokeWidth="2" opacity="0.6" />
        <line x1="40" y1="40" x2="40" y2="120" stroke="LINE_STROKE" strokeWidth="2" opacity="0.6" />
        <line x1="1800" y1="40" x2="1880" y2="40" stroke="LINE_STROKE" strokeWidth="2" opacity="0.6" />
        <line x1="1880" y1="40" x2="1880" y2="120" stroke="LINE_STROKE" strokeWidth="2" opacity="0.6" />
        <line x1="40" y1="1040" x2="120" y2="1040" stroke="LINE_STROKE" strokeWidth="2" opacity="0.6" />
        <line x1="40" y1="960" x2="40" y2="1040" stroke="LINE_STROKE" strokeWidth="2" opacity="0.6" />
        <line x1="1800" y1="1040" x2="1880" y2="1040" stroke="LINE_STROKE" strokeWidth="2" opacity="0.6" />
        <line x1="1880" y1="960" x2="1880" y2="1040" stroke="LINE_STROKE" strokeWidth="2" opacity="0.6" />
      </svg>

    </div>
  )
}

export default AnimationComponent