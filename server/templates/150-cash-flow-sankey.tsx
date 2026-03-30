import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

export const AnimationComponent = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const title = "TITLE_TEXT";
  const flow1 = "FLOW_LABEL_1";
  const flow2 = "FLOW_LABEL_2";
  const flow3 = "FLOW_LABEL_3";
  const val1 = "VAL_1";
  const val2 = "VAL_2";
  const val3 = "VAL_3";

  const titleOp = interpolate(frame, [0, 30], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const flow1Op = interpolate(frame, [40, 70], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const flow2Op = interpolate(frame, [80, 110], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const flow3Op = interpolate(frame, [120, 150], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const flow1W = interpolate(frame, [40, 100], [0, 400], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const flow2W = interpolate(frame, [80, 140], [0, 400], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const flow3W = interpolate(frame, [120, 180], [0, 400], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, overflow: 'hidden', backgroundColor: 'BACKGROUND_COLOR' }}>
      <div style={{ position: 'absolute', top: 60, left: 192, fontSize: 40, fontWeight: 'bold', color: 'TEXT_ON_PRIMARY', opacity: titleOp }}>{title}</div>
      
      <div style={{ position: 'absolute', top: 250, left: 200, width: 300, height: 500, borderRight: '2px solid rgba(255,255,255,0.2)' }}>
        <div style={{ position: 'absolute', top: 200, left: 0, color: 'PRIMARY_COLOR', fontSize: 32, fontWeight: 'bold' }}>INCOME</div>
      </div>

      <div style={{ position: 'absolute', top: 250, left: 500, width: 400, height: 40, backgroundColor: 'PRIMARY_COLOR', opacity: flow1Op, width: flow1W }} />
      <div style={{ position: 'absolute', top: 210, left: 520, color: 'TEXT_ON_PRIMARY', fontSize: 24, opacity: flow1Op }}>{flow1} : {val1}</div>

      <div style={{ position: 'absolute', top: 450, left: 500, width: 400, height: 40, backgroundColor: 'SECONDARY_COLOR', opacity: flow2Op, width: flow2W }} />
      <div style={{ position: 'absolute', top: 410, left: 520, color: 'TEXT_ON_SECONDARY', fontSize: 24, opacity: flow2Op }}>{flow2} : {val2}</div>

      <div style={{ position: 'absolute', top: 650, left: 500, width: 400, height: 40, backgroundColor: 'ACCENT_COLOR', opacity: flow3Op, width: flow3W }} />
      <div style={{ position: 'absolute', top: 610, left: 520, color: 'TEXT_ON_ACCENT', fontSize: 24, opacity: flow3Op }}>{flow3} : {val3}</div>
    </div>
  );
};

export default AnimationComponent;