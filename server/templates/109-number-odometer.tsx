import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, Easing } from 'remotion';

export const AnimationComponent = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const institution = 'TITLE_TEXT';
  const action = 'LABEL_TEXT';
  const target = 'STAT_VALUE_1';
  const dateText = 'STAT_VALUE_2';
  const context = 'SUB_TEXT';

  // --- Exit fade ---
  const exitStart = durationInFrames - 18;
  const globalOp = interpolate(frame, [exitStart, durationInFrames], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.in(Easing.ease),
  });

  // --- Background fade in ---
  const bgOp = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // --- Accent bars sweep ---
  const barW = interpolate(frame, [0, 20], [0, 1920], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  // --- Institution row + brackets fade in / slide down ---
  const institutionOp = interpolate(frame, [10, 35], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const institutionTy = interpolate(frame, [10, 35], [16, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.quad),
  });

  // --- ACTION TEXT stamp: scale 1.4→1.0, opacity 0→1 ---
  const actionOp = interpolate(frame, [30, 60], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.quad),
  });
  const actionScale = interpolate(frame, [30, 60], [1.4, 1.0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.back(1.2)),
  });

  // --- Target text fade in ---
  const targetOp = interpolate(frame, [55, 75], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // --- Divider line draws left to right (as a 0→1 fraction) ---
  const dividerFrac = interpolate(frame, [65, 95], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  // --- Date row fade in ---
  const dateOp = interpolate(frame, [75, 100], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // --- Context paragraph fade in + slide up ---
  const contextOp = interpolate(frame, [88, 115], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const contextTy = interpolate(frame, [88, 115], [12, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.quad),
  });

  // --- Scan line (continuous loop from frame 20) ---
  const scanActive = frame >= 20 ? 1 : 0;
  const scanPeriod = 100;
  const scanProgress = ((frame - 20) % scanPeriod) / scanPeriod;
  const scanY = scanProgress * 1080;

  // Corner bracket arm length
  const ARM = 20;

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: 1920,
        height: 1080,
        overflow: 'hidden',
        backgroundColor: 'BACKGROUND_COLOR',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: globalOp * bgOp,
        fontFamily: 'monospace, "Courier New", Courier',
      }}
    >
      {/* Top accent bar */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: barW,
          height: 5,
          backgroundColor: 'PRIMARY_COLOR',
          zIndex: 10,
        }}
      />

      {/* Bottom accent bar */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: barW,
          height: 3,
          backgroundColor: 'PRIMARY_COLOR',
          zIndex: 10,
        }}
      />

      {/* Scan line */}
      <div
        style={{
          position: 'absolute',
          top: scanY,
          left: 0,
          width: 1920,
          height: 1,
          backgroundColor: 'PRIMARY_COLOR',
          opacity: 0.12 * scanActive,
          zIndex: 5,
          pointerEvents: 'none',
        }}
      />

      {/* Center document card */}
      <div
        style={{
          position: 'relative',
          width: 1100,
          backgroundColor: 'PANEL_RIGHT_BG',
          border: '1px solid CHART_BORDER',
          borderTop: '5px solid PRIMARY_COLOR',
          borderRadius: 16,
          padding: '64px 88px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          zIndex: 2,
        }}
      >
        {/* Corner brackets — SVG absolutely positioned over the card */}
        <svg
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            opacity: institutionOp * 0.6,
          }}
          viewBox="0 0 1100 100%"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* We use a separate positioned SVG per corner instead, see below */}
        </svg>

        {/* Corner brackets rendered as absolute SVGs */}
        {/* Top-left */}
        <svg
          width={ARM + 2}
          height={ARM + 2}
          style={{
            position: 'absolute',
            top: -1,
            left: -1,
            opacity: institutionOp * 0.6,
            pointerEvents: 'none',
          }}
          viewBox={`0 0 ${ARM + 2} ${ARM + 2}`}
          xmlns="http://www.w3.org/2000/svg"
        >
          <polyline
            points={`${ARM + 1},1 1,1 1,${ARM + 1}`}
            fill="none"
            stroke="PRIMARY_COLOR"
            strokeWidth="1.5"
            strokeLinecap="square"
          />
        </svg>

        {/* Top-right */}
        <svg
          width={ARM + 2}
          height={ARM + 2}
          style={{
            position: 'absolute',
            top: -1,
            right: -1,
            opacity: institutionOp * 0.6,
            pointerEvents: 'none',
          }}
          viewBox={`0 0 ${ARM + 2} ${ARM + 2}`}
          xmlns="http://www.w3.org/2000/svg"
        >
          <polyline
            points={`1,1 ${ARM + 1},1 ${ARM + 1},${ARM + 1}`}
            fill="none"
            stroke="PRIMARY_COLOR"
            strokeWidth="1.5"
            strokeLinecap="square"
          />
        </svg>

        {/* Bottom-left */}
        <svg
          width={ARM + 2}
          height={ARM + 2}
          style={{
            position: 'absolute',
            bottom: -1,
            left: -1,
            opacity: institutionOp * 0.6,
            pointerEvents: 'none',
          }}
          viewBox={`0 0 ${ARM + 2} ${ARM + 2}`}
          xmlns="http://www.w3.org/2000/svg"
        >
          <polyline
            points={`1,1 1,${ARM + 1} ${ARM + 1},${ARM + 1}`}
            fill="none"
            stroke="PRIMARY_COLOR"
            strokeWidth="1.5"
            strokeLinecap="square"
          />
        </svg>

        {/* Bottom-right */}
        <svg
          width={ARM + 2}
          height={ARM + 2}
          style={{
            position: 'absolute',
            bottom: -1,
            right: -1,
            opacity: institutionOp * 0.6,
            pointerEvents: 'none',
          }}
          viewBox={`0 0 ${ARM + 2} ${ARM + 2}`}
          xmlns="http://www.w3.org/2000/svg"
        >
          <polyline
            points={`1,${ARM + 1} ${ARM + 1},${ARM + 1} ${ARM + 1},1`}
            fill="none"
            stroke="PRIMARY_COLOR"
            strokeWidth="1.5"
            strokeLinecap="square"
          />
        </svg>

        {/* 1. Institution row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 20,
            opacity: institutionOp,
            transform: `translateY(${institutionTy}px)`,
            width: '100%',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              flex: 1,
              height: 2,
              backgroundColor: 'PRIMARY_COLOR',
              opacity: 0.5,
            }}
          />
          <div
            style={{
              fontSize: 13,
              fontWeight: 900,
              color: 'PRIMARY_COLOR',
              letterSpacing: '0.35em',
              textTransform: 'uppercase',
              fontFamily: 'monospace',
              whiteSpace: 'nowrap',
            }}
          >
            {institution}
          </div>
          <div
            style={{
              flex: 1,
              height: 2,
              backgroundColor: 'PRIMARY_COLOR',
              opacity: 0.5,
            }}
          />
        </div>

        {/* 2. Spacer 32px */}
        <div style={{ height: 32 }} />

        {/* 3. ACTION TEXT */}
        <div
          style={{
            opacity: actionOp,
            transform: `scale(${actionScale})`,
            width: '100%',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontSize: 88,
              fontWeight: 900,
              color: 'PRIMARY_COLOR',
              fontFamily: 'monospace',
              letterSpacing: '-0.02em',
              textTransform: 'uppercase',
              lineHeight: 1,
            }}
          >
            {action}
          </div>
        </div>

        {/* 4. Spacer 24px */}
        <div style={{ height: 24 }} />

        {/* 5. Target row */}
        <div
          style={{
            opacity: targetOp * 0.85,
            width: '100%',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontSize: 40,
              fontWeight: 700,
              color: 'PRIMARY_COLOR',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            {target}
          </div>
        </div>

        {/* 6. Spacer 32px */}
        <div style={{ height: 32 }} />

        {/* 7. Divider line that draws */}
        <div
          style={{
            width: '100%',
            height: 2,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: `${dividerFrac * 100}%`,
              height: '100%',
              backgroundColor: 'PRIMARY_COLOR',
              opacity: 0.2,
            }}
          />
        </div>

        {/* 8. Spacer 28px */}
        <div style={{ height: 28 }} />

        {/* 9. Date row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 20,
            opacity: dateOp,
          }}
        >
          <div
            style={{
              fontSize: 12,
              textTransform: 'uppercase',
              letterSpacing: '0.25em',
              color: 'SUPPORT_COLOR',
              fontFamily: 'monospace',
              opacity: 0.5,
            }}
          >
            EFFECTIVE DATE
          </div>
          <div
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: 'PRIMARY_COLOR',
              fontFamily: 'monospace',
              letterSpacing: '0.1em',
            }}
          >
            {dateText}
          </div>
        </div>

        {/* 10. Spacer 28px */}
        <div style={{ height: 28 }} />

        {/* 11. Context paragraph */}
        <div
          style={{
            opacity: contextOp * 0.65,
            transform: `translateY(${contextTy}px)`,
            maxWidth: 860,
            marginLeft: 'auto',
            marginRight: 'auto',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontSize: 18,
              fontWeight: 400,
              color: 'SUPPORT_COLOR',
              lineHeight: 1.7,
              fontFamily: 'sans-serif',
            }}
          >
            {context}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimationComponent;
