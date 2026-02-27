'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { DemoType } from './game-instructions';

interface DemoAnimationProps {
  demoType: DemoType;
  onComplete: () => void;
}

/** 手アイコンSVG */
function HandIcon({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2C11.45 2 11 2.45 11 3V11.5L7.62 9.17C7.24 8.9 6.73 8.9 6.37 9.2C5.95 9.55 5.9 10.18 6.25 10.58L11.1 16.5C11.5 17 12 17.5 13 17.5H17C18.65 17.5 20 16.15 20 14.5V8C20 7.45 19.55 7 19 7C18.45 7 18 7.45 18 8V11H17V4C17 3.45 16.55 3 16 3C15.45 3 15 3.45 15 4V11H14V3C14 2.45 13.55 2 13 2C12.45 2 12 2.45 12 3V11H11V3C11 2.45 11.55 2 12 2Z"
        fill="#FFD43B"
        stroke="#E8A800"
        strokeWidth="0.5"
      />
    </svg>
  );
}

/** tap-target: 手がターゲットに移動してタップ */
function TapTargetDemo({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<'idle' | 'moving' | 'tapping' | 'done'>('idle');

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    timers.push(setTimeout(() => setPhase('moving'), 400));
    timers.push(setTimeout(() => setPhase('tapping'), 1400));
    timers.push(setTimeout(() => setPhase('done'), 1900));
    timers.push(setTimeout(() => onComplete(), 2400));
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div className="relative w-64 h-48 mx-auto">
      {/* ターゲット */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full flex items-center justify-center"
        style={{ background: 'rgba(72, 187, 120, 0.3)', border: '3px solid #48BB78' }}
        animate={phase === 'tapping' ? { scale: [1, 1.3, 1] } : {}}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className="w-8 h-8 rounded-full"
          style={{ background: '#48BB78' }}
          animate={phase === 'tapping' ? {
            scale: [1, 0.8, 1.2, 1],
            boxShadow: ['0 0 0px #48BB78', '0 0 20px #48BB78', '0 0 0px #48BB78'],
          } : {}}
          transition={{ duration: 0.4 }}
        />
      </motion.div>

      {/* 手アイコン */}
      <motion.div
        className="absolute"
        initial={{ left: '20%', top: '80%', opacity: 0 }}
        animate={
          phase === 'idle' ? { left: '20%', top: '80%', opacity: 1 } :
          phase === 'moving' ? { left: '45%', top: '45%', opacity: 1 } :
          phase === 'tapping' ? { left: '45%', top: '45%', opacity: 1, scale: [1, 0.85, 1] } :
          { left: '45%', top: '45%', opacity: 0 }
        }
        transition={{ duration: phase === 'moving' ? 0.8 : 0.3, ease: 'easeInOut' }}
      >
        <HandIcon />
      </motion.div>
    </div>
  );
}

/** remember-sequence: ターゲットが順番に光る → 手が同じ順番でタップ */
function RememberSequenceDemo({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<'show' | 'replay' | 'done'>('show');
  const [activeIdx, setActiveIdx] = useState(-1);
  const [handTarget, setHandTarget] = useState(-1);

  const positions = [
    { x: '20%', y: '30%' },
    { x: '65%', y: '25%' },
    { x: '42%', y: '70%' },
  ];
  const sequence = [0, 2, 1]; // 光る順番

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    // Show phase: 順番に光る
    sequence.forEach((idx, i) => {
      timers.push(setTimeout(() => setActiveIdx(idx), 400 + i * 600));
      timers.push(setTimeout(() => setActiveIdx(-1), 400 + i * 600 + 400));
    });
    // Replay phase: 手がタップ
    const replayStart = 400 + sequence.length * 600 + 200;
    timers.push(setTimeout(() => setPhase('replay'), replayStart));
    sequence.forEach((idx, i) => {
      timers.push(setTimeout(() => {
        setHandTarget(idx);
        setActiveIdx(idx);
      }, replayStart + i * 700));
      timers.push(setTimeout(() => setActiveIdx(-1), replayStart + i * 700 + 400));
    });
    const endTime = replayStart + sequence.length * 700 + 300;
    timers.push(setTimeout(() => setPhase('done'), endTime));
    timers.push(setTimeout(() => onComplete(), endTime + 400));
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div className="relative w-64 h-48 mx-auto">
      {positions.map((pos, i) => (
        <motion.div
          key={i}
          className="absolute w-12 h-12 rounded-xl flex items-center justify-center"
          style={{
            left: pos.x,
            top: pos.y,
            transform: 'translate(-50%, -50%)',
            background: activeIdx === i ? '#FFD43B' : 'rgba(255, 212, 59, 0.2)',
            border: `2px solid ${activeIdx === i ? '#FFD43B' : 'rgba(255, 212, 59, 0.4)'}`,
          }}
          animate={activeIdx === i ? { scale: [1, 1.2, 1] } : { scale: 1 }}
          transition={{ duration: 0.3 }}
        />
      ))}

      {/* 手アイコン (replay phaseのみ) */}
      {phase === 'replay' && handTarget >= 0 && (
        <motion.div
          className="absolute"
          animate={{
            left: `calc(${positions[handTarget].x} + 10px)`,
            top: `calc(${positions[handTarget].y} + 10px)`,
          }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
        >
          <HandIcon size={28} />
        </motion.div>
      )}
    </div>
  );
}

/** swipe-path: 手がスワイプ軌跡を描く */
function SwipePathDemo({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<'idle' | 'swiping' | 'done'>('idle');
  const [progress, setProgress] = useState(0);

  // スワイプパスのポイント
  const pathPoints = [
    { x: 30, y: 140 },
    { x: 80, y: 60 },
    { x: 140, y: 100 },
    { x: 200, y: 40 },
    { x: 230, y: 80 },
  ];

  const pathD = `M ${pathPoints.map(p => `${p.x} ${p.y}`).join(' L ')}`;

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    timers.push(setTimeout(() => setPhase('swiping'), 400));

    // プログレスを段階的に更新
    const steps = 20;
    for (let i = 0; i <= steps; i++) {
      timers.push(setTimeout(() => setProgress(i / steps), 400 + i * 80));
    }

    timers.push(setTimeout(() => setPhase('done'), 400 + steps * 80 + 200));
    timers.push(setTimeout(() => onComplete(), 400 + steps * 80 + 600));
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  // パスに沿った手の位置を計算
  const handPos = (() => {
    if (progress === 0) return pathPoints[0];
    const totalSegments = pathPoints.length - 1;
    const segProgress = progress * totalSegments;
    const segIdx = Math.min(Math.floor(segProgress), totalSegments - 1);
    const t = segProgress - segIdx;
    const p1 = pathPoints[segIdx];
    const p2 = pathPoints[segIdx + 1];
    return {
      x: p1.x + (p2.x - p1.x) * t,
      y: p1.y + (p2.y - p1.y) * t,
    };
  })();

  return (
    <div className="relative w-64 h-48 mx-auto">
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 256 192">
        {/* パス背景 */}
        <path d={pathD} stroke="rgba(139, 92, 246, 0.2)" strokeWidth="8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        {/* パス進行 */}
        <motion.path
          d={pathD}
          stroke="#8B5CF6"
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: phase === 'swiping' || phase === 'done' ? 1 : 0 }}
          transition={{ duration: 1.6, ease: 'easeInOut' }}
        />
        {/* スタートとゴールのマーカー */}
        <circle cx={pathPoints[0].x} cy={pathPoints[0].y} r="8" fill="rgba(139, 92, 246, 0.3)" stroke="#8B5CF6" strokeWidth="2" />
        <circle cx={pathPoints[pathPoints.length - 1].x} cy={pathPoints[pathPoints.length - 1].y} r="8" fill="rgba(72, 187, 120, 0.3)" stroke="#48BB78" strokeWidth="2" />
      </svg>

      {/* 手アイコン */}
      {phase === 'swiping' && (
        <div
          className="absolute"
          style={{
            left: handPos.x,
            top: handPos.y,
            transform: 'translate(-30%, -10%)',
          }}
        >
          <HandIcon size={28} />
        </div>
      )}
    </div>
  );
}

/** フォールバック用の汎用デモ（tap-targetと同じ動き） */
function FallbackDemo({ onComplete }: { onComplete: () => void }) {
  return <TapTargetDemo onComplete={onComplete} />;
}

const DEMO_COMPONENTS: Record<DemoType, React.ComponentType<{ onComplete: () => void }>> = {
  'tap-target': TapTargetDemo,
  'wait-and-tap': FallbackDemo,
  'remember-sequence': RememberSequenceDemo,
  'match-shape': FallbackDemo,
  'swipe-path': SwipePathDemo,
  'select-word': FallbackDemo,
  'match-emotion': FallbackDemo,
  'drag-target': FallbackDemo,
};

export default function DemoAnimation({ demoType, onComplete }: DemoAnimationProps) {
  const [isPlaying, setIsPlaying] = useState(true);

  const handleComplete = useCallback(() => {
    setIsPlaying(false);
    onComplete();
  }, [onComplete]);

  const DemoComponent = DEMO_COMPONENTS[demoType];

  return (
    <AnimatePresence mode="wait">
      {isPlaying && (
        <motion.div
          key="demo"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <DemoComponent onComplete={handleComplete} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
