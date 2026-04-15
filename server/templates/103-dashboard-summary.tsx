import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

export const AnimationComponent = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const title = "TITLE_TEXT";
  const kpi1Label = "KPI_LABEL_1";
  const kpi1Value = "KPI_VALUE_1";
  const kpi2Label = "KPI_LABEL_2";
  const kpi2Value = "KPI_VALUE_2";
  const summary = "SUMMARY_TEXT";

  // Exit fade: last 18 frames
  const exitOpacity = interpolate(
    frame,
    [durationInFrames - 18, durationInFrames - 1],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Corner brackets draw-in: frames 0-10
  const bracketProgress = interpolate(frame, [0, 10], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Header: slides down from -20px + fades, frames 0-25
  const headerOpacity = interpolate(frame, [0, 25], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const headerY = interpolate(frame, [0, 25], [-20, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // KPI 1: fades in frames 15-45
  const kpi1Opacity = interpolate(frame, [15, 45], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  // KPI 1 fill bar: frames 30-70
  const kpi1BarWidth = interpolate(frame, [30, 70], [0, 85], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // KPI 2: fades in frames 30-60
  const kpi2Opacity = interpolate(frame, [30, 60], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  // KPI 2 fill bar: frames 45-85
  const kpi2BarWidth = interpolate(frame, [45, 85], [0, 85], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Summary block: slides up from 16px + fades, frames 50-80
  const summaryOpacity = interpolate(frame, [50, 80], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const summaryY = interpolate(frame, [50, 80], [16, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Footer: fades in frames 75-100
  const footerOpacity = interpolate(frame, [75, 100], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Scan line: continuous 90-frame loop
  const scanFrame = frame % 90;
  const scanY = interpolate(scanFrame, [0, 89], [0, 1080], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Status dot blink: alternates 1/0.2 every 45 frames
  const blinkPhase = Math.floor(frame / 45) % 2;
  const dotOpacity = blinkPhase === 0 ? 1 : 0.2;

  // Bracket arm length animated (0 → 28px)
  const bracketArm = bracketProgress * 28;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        width: 1920,
        height: 1080,
        overflow: 'hidden',
        backgroundColor: 'BACKGROUND_COLOR',
        fontFamily: 'Inter, system-ui, sans-serif',
        opacity: exitOpacity,
      }}
    >
      {/* DOT GRID OVERLAY */}
      <svg
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
        width={1920}
        height={1080}
      >
        <defs>
          <pattern
            id="dotGrid"
            x={0}
            y={0}
            width={40}
            height={40}
            patternUnits="userSpaceOnUse"
          >
            <circle cx={20} cy={20} r={1} fill="SUPPORT_COLOR" opacity={0.08} />
          </pattern>
        </defs>
        <rect width={1920} height={1080} fill="url(#dotGrid)" />
      </svg>

      {/* SCAN LINE */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: scanY,
          width: 1920,
          height: 2,
          background:
            'linear-gradient(to bottom, transparent, rgba(255,255,255,0.06), transparent)',
          pointerEvents: 'none',
          zIndex: 10,
        }}
      />

      {/* CORNER BRACKETS */}
      <svg
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 20,
        }}
        width={1920}
        height={1080}
      >
        {/* Top-left */}
        <line
          x1={32}
          y1={32}
          x2={32 + bracketArm}
          y2={32}
          stroke="PRIMARY_COLOR"
          strokeWidth={2.5}
          strokeLinecap="square"
        />
        <line
          x1={32}
          y1={32}
          x2={32}
          y2={32 + bracketArm}
          stroke="PRIMARY_COLOR"
          strokeWidth={2.5}
          strokeLinecap="square"
        />
        {/* Top-right */}
        <line
          x1={1888}
          y1={32}
          x2={1888 - bracketArm}
          y2={32}
          stroke="PRIMARY_COLOR"
          strokeWidth={2.5}
          strokeLinecap="square"
        />
        <line
          x1={1888}
          y1={32}
          x2={1888}
          y2={32 + bracketArm}
          stroke="PRIMARY_COLOR"
          strokeWidth={2.5}
          strokeLinecap="square"
        />
        {/* Bottom-left */}
        <line
          x1={32}
          y1={1048}
          x2={32 + bracketArm}
          y2={1048}
          stroke="PRIMARY_COLOR"
          strokeWidth={2.5}
          strokeLinecap="square"
        />
        <line
          x1={32}
          y1={1048}
          x2={32}
          y2={1048 - bracketArm}
          stroke="PRIMARY_COLOR"
          strokeWidth={2.5}
          strokeLinecap="square"
        />
        {/* Bottom-right */}
        <line
          x1={1888}
          y1={1048}
          x2={1888 - bracketArm}
          y2={1048}
          stroke="PRIMARY_COLOR"
          strokeWidth={2.5}
          strokeLinecap="square"
        />
        <line
          x1={1888}
          y1={1048}
          x2={1888}
          y2={1048 - bracketArm}
          stroke="PRIMARY_COLOR"
          strokeWidth={2.5}
          strokeLinecap="square"
        />
      </svg>

      {/* HEADER ROW */}
      <div
        style={{
          position: 'absolute',
          top: 80,
          left: 80,
          right: 80,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          opacity: headerOpacity,
          transform: `translateY(${headerY}px)`,
        }}
      >
        {/* Left: bar + title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div
            style={{
              width: 6,
              height: 52,
              backgroundColor: 'PRIMARY_COLOR',
              borderRadius: 2,
              flexShrink: 0,
            }}
          />
          <div
            style={{
              color: 'PRIMARY_COLOR',
              fontSize: 48,
              fontWeight: 900,
              textTransform: 'uppercase',
              letterSpacing: '-0.02em',
              lineHeight: 1,
            }}
          >
            {title}
          </div>
        </div>

        {/* Right: blink dot + LIVE DATA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              backgroundColor: 'ACCENT_COLOR',
              opacity: dotOpacity,
              flexShrink: 0,
            }}
          />
          <div
            style={{
              color: 'SUPPORT_COLOR',
              fontSize: 12,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.18em',
            }}
          >
            LIVE DATA
          </div>
        </div>
      </div>

      {/* KPI ROW */}
      <div
        style={{
          position: 'absolute',
          top: 200,
          left: 80,
          right: 80,
          display: 'flex',
          gap: 40,
        }}
      >
        {/* KPI CARD 1 */}
        <div
          style={{
            flex: 1,
            backgroundColor: 'PANEL_RIGHT_BG',
            border: '1px solid CHART_BORDER',
            borderTop: '4px solid PRIMARY_COLOR',
            borderRadius: 16,
            padding: 40,
            opacity: kpi1Opacity,
          }}
        >
          <div
            style={{
              color: 'SUPPORT_COLOR',
              fontSize: 13,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
              opacity: 0.7,
              marginBottom: 16,
            }}
          >
            {kpi1Label}
          </div>
          <div
            style={{
              color: 'PRIMARY_COLOR',
              fontSize: 80,
              fontWeight: 900,
              fontFamily: 'monospace',
              lineHeight: 1,
              marginBottom: 24,
            }}
          >
            {kpi1Value}
          </div>
          {/* Fill bar */}
          <div
            style={{
              width: '100%',
              height: 4,
              backgroundColor: 'CHART_BORDER',
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${kpi1BarWidth}%`,
                height: '100%',
                backgroundColor: 'PRIMARY_COLOR',
                borderRadius: 2,
              }}
            />
          </div>
        </div>

        {/* KPI CARD 2 */}
        <div
          style={{
            flex: 1,
            backgroundColor: 'PANEL_RIGHT_BG',
            border: '1px solid CHART_BORDER',
            borderTop: '4px solid PRIMARY_COLOR',
            borderRadius: 16,
            padding: 40,
            opacity: kpi2Opacity,
          }}
        >
          <div
            style={{
              color: 'SUPPORT_COLOR',
              fontSize: 13,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
              opacity: 0.7,
              marginBottom: 16,
            }}
          >
            {kpi2Label}
          </div>
          <div
            style={{
              color: 'PRIMARY_COLOR',
              fontSize: 80,
              fontWeight: 900,
              fontFamily: 'monospace',
              lineHeight: 1,
              marginBottom: 24,
            }}
          >
            {kpi2Value}
          </div>
          {/* Fill bar */}
          <div
            style={{
              width: '100%',
              height: 4,
              backgroundColor: 'CHART_BORDER',
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${kpi2BarWidth}%`,
                height: '100%',
                backgroundColor: 'PRIMARY_COLOR',
                borderRadius: 2,
              }}
            />
          </div>
        </div>
      </div>

      {/* SUMMARY BLOCK */}
      <div
        style={{
          position: 'absolute',
          top: 460,
          left: 80,
          right: 80,
          backgroundColor: 'PANEL_RIGHT_BG',
          border: '1px solid CHART_BORDER',
          borderLeft: '6px solid PRIMARY_COLOR',
          borderRadius: 16,
          padding: 48,
          opacity: summaryOpacity,
          transform: `translateY(${summaryY}px)`,
        }}
      >
        <div
          style={{
            color: 'ACCENT_COLOR',
            fontSize: 11,
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.3em',
            marginBottom: 16,
          }}
        >
          ANALYSIS
        </div>
        <div
          style={{
            color: 'PRIMARY_COLOR',
            fontSize: 24,
            fontWeight: 400,
            lineHeight: 1.65,
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 6,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {summary}
        </div>
      </div>

      {/* FOOTER */}
      <div
        style={{
          position: 'absolute',
          bottom: 24,
          right: 80,
          opacity: footerOpacity * 0.25,
        }}
      >
        <div
          style={{
            color: 'SUPPORT_COLOR',
            fontFamily: 'monospace',
            fontSize: 12,
            textAlign: 'right',
            letterSpacing: '0.08em',
          }}
        >
          SYS:ONLINE&nbsp;&nbsp;◆&nbsp;&nbsp;AUTO-REFRESH
        </div>
      </div>
    </div>
  );
};

export default AnimationComponent;
