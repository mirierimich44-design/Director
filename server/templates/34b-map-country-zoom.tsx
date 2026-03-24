import React from 'react'
import { useCurrentFrame, interpolate } from 'remotion'

// Mapbox Static Image coordinates per country [lon, lat, zoom]
const COUNTRY_MAPBOX: Record<string, [number, number, number]> = {
  USA:        [-100, 38, 3],
  UK:         [-2, 54, 5],
  RUSSIA:     [55, 55, 2.5],
  CHINA:      [103, 36, 3],
  NORTHKOREA: [127.5, 40, 5],
  IRAN:       [53, 32, 4],
  UKRAINE:    [32, 49, 5],
  ISRAEL:     [35, 31.5, 7],
  KENYA:      [37.5, 0.5, 5],
  GERMANY:    [10, 51, 5],
}

// Country border paths — simplified but recognizable outlines
// All paths normalized to fit within a 1200x800 viewBox, centered on the country
const COUNTRY_PATHS: Record<string, { path: string; viewBox: string; label: string }> = {
  USA: {
    viewBox: '0 0 1200 800',
    label: 'UNITED STATES',
    path: 'M 120,180 L 180,160 L 280,155 L 380,150 L 500,148 L 620,150 L 720,155 L 820,160 L 900,180 L 940,220 L 960,280 L 950,350 L 920,420 L 880,470 L 820,490 L 760,500 L 680,510 L 600,520 L 500,525 L 400,520 L 300,510 L 220,490 L 160,460 L 120,420 L 100,360 L 95,290 L 110,230 Z M 960,200 L 1020,190 L 1060,220 L 1050,270 L 1010,290 L 970,270 L 955,240 Z',
  },
  UK: {
    viewBox: '0 0 1200 800',
    label: 'UNITED KINGDOM',
    path: 'M 540,160 L 580,150 L 620,160 L 640,200 L 650,260 L 640,320 L 620,380 L 590,440 L 560,500 L 530,540 L 510,520 L 490,470 L 480,410 L 490,350 L 500,290 L 510,230 L 520,190 Z M 460,200 L 500,190 L 520,220 L 510,270 L 480,280 L 455,260 L 450,230 Z',
  },
  RUSSIA: {
    viewBox: '0 0 1200 800',
    label: 'RUSSIA',
    path: 'M 80,200 L 200,180 L 350,170 L 500,165 L 650,168 L 800,172 L 950,178 L 1050,190 L 1100,220 L 1110,270 L 1090,330 L 1060,380 L 1000,420 L 920,450 L 820,460 L 700,455 L 580,450 L 460,445 L 360,440 L 260,430 L 180,410 L 120,380 L 85,340 L 75,290 L 78,250 Z',
  },
  CHINA: {
    viewBox: '0 0 1200 800',
    label: 'CHINA',
    path: 'M 200,180 L 320,160 L 460,150 L 600,155 L 740,165 L 860,185 L 940,220 L 980,270 L 970,340 L 940,410 L 890,470 L 820,520 L 740,550 L 640,560 L 540,550 L 440,530 L 350,500 L 270,460 L 210,410 L 175,350 L 168,280 L 182,230 Z',
  },
  NORTHKOREA: {
    viewBox: '0 0 1200 800',
    label: 'NORTH KOREA',
    path: 'M 480,220 L 540,200 L 610,205 L 670,225 L 710,265 L 720,315 L 700,370 L 660,415 L 610,440 L 555,445 L 505,425 L 470,385 L 455,335 L 460,280 Z',
  },
  IRAN: {
    viewBox: '0 0 1200 800',
    label: 'IRAN',
    path: 'M 380,220 L 460,195 L 560,185 L 660,195 L 750,225 L 810,270 L 830,330 L 820,395 L 790,450 L 740,490 L 670,510 L 590,505 L 510,480 L 450,440 L 400,385 L 375,320 L 372,265 Z',
  },
  UKRAINE: {
    viewBox: '0 0 1200 800',
    label: 'UKRAINE',
    path: 'M 280,280 L 380,255 L 500,248 L 620,255 L 730,275 L 800,310 L 820,360 L 800,410 L 750,445 L 670,460 L 570,455 L 470,440 L 370,415 L 290,375 L 255,325 L 262,295 Z',
  },
  ISRAEL: {
    viewBox: '0 0 1200 800',
    label: 'ISRAEL',
    path: 'M 560,240 L 590,230 L 620,240 L 635,275 L 630,320 L 610,365 L 580,395 L 555,375 L 540,335 L 535,290 L 545,260 Z',
  },
  KENYA: {
    viewBox: '0 0 1200 800',
    label: 'KENYA',
    path: 'M 460,220 L 540,205 L 620,215 L 680,250 L 700,305 L 690,370 L 660,430 L 610,470 L 550,480 L 490,460 L 440,420 L 415,360 L 420,295 L 440,255 Z',
  },
  GERMANY: {
    viewBox: '0 0 1200 800',
    label: 'GERMANY',
    path: 'M 460,200 L 530,188 L 610,192 L 670,215 L 690,260 L 680,320 L 650,375 L 600,410 L 540,420 L 475,405 L 430,365 L 415,305 L 425,248 Z',
  },
}

export const AnimationComponent = () => {
  const frame = useCurrentFrame()

  // Which country to show — controlled by placeholder
  const countryKey = "MAP_LABEL_1"

  // Use NORTHKOREA as default for stub rendering
  const country = COUNTRY_PATHS['NORTHKOREA']

  const stadiaKey = "STADIA_API_KEY"
  const mapboxCoords = COUNTRY_MAPBOX[countryKey] || COUNTRY_MAPBOX['NORTHKOREA']
  const stadiaUrl = stadiaKey
    ? `https://tiles.stadiamaps.com/static/alidade_smooth_dark/${mapboxCoords[0]},${mapboxCoords[1]},${mapboxCoords[2]}/480x400@2x.png?api_key=${stadiaKey}`
    : null

  // Animations
  const bgOp = interpolate(frame, [0, 18], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const titleOp = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const titleTy = interpolate(frame, [0, 20], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const barWAnim = interpolate(frame, [10, 40], [0, 1920], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  // Country fill fades in
  const fillOp = interpolate(frame, [15, 40], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  // Border draws via dashoffset
  const borderDash = interpolate(frame, [20, 70], [3000, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  // Pulse ring
  const pulseR1 = interpolate(frame % 70, [0, 70], [0, 200], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const pulseOp1 = interpolate(frame % 70, [0, 35, 70], [0.6, 0.2, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const pulseR2 = interpolate((frame + 35) % 70, [0, 70], [0, 200], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const pulseOp2 = interpolate((frame + 35) % 70, [0, 35, 70], [0.6, 0.2, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  // Label animations
  const nameOp = interpolate(frame, [55, 70], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const nameTy = interpolate(frame, [55, 70], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const stat1Op = interpolate(frame, [62, 76], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const stat2Op = interpolate(frame, [70, 84], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const divW = interpolate(frame, [58, 78], [0, 400], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  // Center of country shape (approximate centroid)
  const cx = 590
  const cy = 325

  // Content placeholders
  const titleText = "TITLE_TEXT"
  const countryName = "MAP_LABEL_1"
  const statValue1 = "STAT_VALUE_1"
  const statLabel1 = "LABEL_1"
  const statValue2 = "STAT_VALUE_2"
  const statLabel2 = "LABEL_2"
  const contextText = "CONTEXT_TEXT"
  const tag1 = "TAG_1"

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden', backgroundColor: 'BACKGROUND_COLOR' }}>

      {/* Background tint */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden', backgroundColor: 'PANEL_LEFT_BG', opacity: bgOp * 0.06 }} />

      {/* Top + bottom accents */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 5, overflow: 'hidden', backgroundColor: 'PRIMARY_COLOR', opacity: titleOp }} />
      <div style={{ position: 'absolute', top: 1074, left: 0, width: barWAnim, height: 6, overflow: 'hidden', backgroundColor: 'PRIMARY_COLOR' }} />

      {/* Title */}
      <div style={{ position: 'absolute', top: 50, left: 0, width: 1920, height: 60, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: titleOp, transform: `translateY(${titleTy}px)` }}>
        <span style={{ fontSize: 26, fontWeight: 700, color: 'PRIMARY_COLOR', letterSpacing: 5, textTransform: 'uppercase', fontFamily: 'sans-serif' }}>{titleText}</span>
      </div>

      {/* Mapbox background for country area */}
      {stadiaUrl ? (
        <img
          src={stadiaUrl}
          style={{ position: 'absolute', top: 140, left: 60, width: 960, height: 800, opacity: fillOp * 0.6, borderRadius: 4, objectFit: 'cover' }}
        />
      ) : null}

      {/* SVG — country shape centered on left portion of screen */}
      <svg
        viewBox={country.viewBox}
        width={960}
        height={800}
        style={{ position: 'absolute', top: 140, left: 60 }}
      >
        {/* Glow layer — same shape, blurred fill */}
        <path d={country.path} fill="PRIMARY_COLOR" opacity={fillOp * 0.08} />

        {/* Country fill */}
        <path d={country.path} fill="PRIMARY_COLOR" opacity={fillOp * 0.35} />

        {/* Animated border outline */}
        <path
          d={country.path}
          fill="none"
          stroke="PRIMARY_COLOR"
          strokeWidth={6}
          strokeDasharray={3000}
          strokeDashoffset={borderDash}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.9}
        />

        {/* Secondary outline glow */}
        <path
          d={country.path}
          fill="none"
          stroke="ACCENT_COLOR"
          strokeWidth={2}
          strokeDasharray={3000}
          strokeDashoffset={borderDash}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.5}
        />

        {/* Pulse rings at centroid */}
        <circle cx={cx} cy={cy} r={pulseR1} fill="none" stroke="PRIMARY_COLOR" strokeWidth={2} opacity={pulseOp1 * fillOp} />
        <circle cx={cx} cy={cy} r={pulseR2} fill="none" stroke="ACCENT_COLOR" strokeWidth={1.5} opacity={pulseOp2 * fillOp} />

        {/* Center dot */}
        <circle cx={cx} cy={cy} r={14} fill="PRIMARY_COLOR" opacity={fillOp} />
        <circle cx={cx} cy={cy} r={6} fill="BACKGROUND_COLOR" opacity={fillOp} />
      </svg>

      {/* Right side info panel */}
      <div style={{ position: 'absolute', top: 160, left: 1020, width: 820, height: 720, overflow: 'hidden' }}>

        {/* Country name */}
        <div style={{ position: 'absolute', top: 40, left: 0, width: 820, height: 110, overflow: 'hidden', opacity: nameOp, transform: `translateY(${nameTy}px)` }}>
          <span style={{ fontSize: 80, fontWeight: 900, color: 'PRIMARY_COLOR', fontFamily: 'sans-serif', lineHeight: 1, letterSpacing: -2 }}>{countryName}</span>
        </div>

        {/* Divider */}
        <div style={{ position: 'absolute', top: 162, left: 0, width: divW, height: 3, overflow: 'hidden', backgroundColor: 'ACCENT_COLOR' }} />

        {/* Tag */}
        <div style={{ position: 'absolute', top: 182, left: 0, width: 820, height: 44, overflow: 'hidden', opacity: nameOp }}>
          <span style={{ fontSize: 22, fontWeight: 600, color: 'ACCENT_COLOR', fontFamily: 'sans-serif', letterSpacing: 3, textTransform: 'uppercase' }}>{tag1}</span>
        </div>

        {/* Stat 1 */}
        <div style={{ position: 'absolute', top: 260, left: 0, width: 380, height: 160, overflow: 'hidden', opacity: stat1Op, backgroundColor: 'CHART_BG', borderRadius: 6, border: '1px solid', borderColor: 'CHART_BORDER', boxSizing: 'border-box' }}>
          <div style={{ position: 'absolute', top: 20, left: 24, width: 332, height: 80, overflow: 'hidden' }}>
            <span style={{ fontSize: 64, fontWeight: 900, color: 'PRIMARY_COLOR', fontFamily: 'sans-serif', lineHeight: 1 }}>{statValue1}</span>
          </div>
          <div style={{ position: 'absolute', top: 106, left: 24, width: 332, height: 34, overflow: 'hidden' }}>
            <span style={{ fontSize: 18, fontWeight: 500, color: 'SUPPORT_COLOR', fontFamily: 'sans-serif', textTransform: 'uppercase', letterSpacing: 1 }}>{statLabel1}</span>
          </div>
        </div>

        {/* Stat 2 */}
        <div style={{ position: 'absolute', top: 260, left: 420, width: 380, height: 160, overflow: 'hidden', opacity: stat2Op, backgroundColor: 'CHART_BG', borderRadius: 6, border: '1px solid', borderColor: 'CHART_BORDER', boxSizing: 'border-box' }}>
          <div style={{ position: 'absolute', top: 20, left: 24, width: 332, height: 80, overflow: 'hidden' }}>
            <span style={{ fontSize: 64, fontWeight: 900, color: 'SECONDARY_COLOR', fontFamily: 'sans-serif', lineHeight: 1 }}>{statValue2}</span>
          </div>
          <div style={{ position: 'absolute', top: 106, left: 24, width: 332, height: 34, overflow: 'hidden' }}>
            <span style={{ fontSize: 18, fontWeight: 500, color: 'SUPPORT_COLOR', fontFamily: 'sans-serif', textTransform: 'uppercase', letterSpacing: 1 }}>{statLabel2}</span>
          </div>
        </div>

        {/* Context paragraph */}
        <div style={{ position: 'absolute', top: 450, left: 0, width: 820, height: 200, overflow: 'hidden', opacity: stat2Op }}>
          <span style={{ fontSize: 26, fontWeight: 400, color: 'TEXT_ON_SECONDARY', fontFamily: 'sans-serif', lineHeight: 1.65 }}>{contextText}</span>
        </div>

      </div>

    </div>
  )
}

export default AnimationComponent