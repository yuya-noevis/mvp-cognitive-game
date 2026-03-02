'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import type { DemoType } from './game-instructions';

interface DemoAnimationProps {
  demoType: DemoType;
}

// ---------------------------------------------------------------------------
// Hand cursor component
// ---------------------------------------------------------------------------
function HandCursor({ size = 40 }: { size?: number }) {
  return (
    <span style={{ fontSize: size, lineHeight: 1, display: 'block', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}>
      👆
    </span>
  );
}

// ---------------------------------------------------------------------------
// Correct effect flash
// ---------------------------------------------------------------------------
function CorrectFlash() {
  return (
    <motion.div
      className="absolute inset-0 rounded-2xl pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 0.4, 0] }}
      transition={{ duration: 0.6 }}
      style={{ background: 'radial-gradient(circle, rgba(72,187,120,0.4) 0%, transparent 70%)' }}
    />
  );
}

// ---------------------------------------------------------------------------
// tap-target: 光る生き物をタップ (hikari-rescue)
// ---------------------------------------------------------------------------
function TapTargetDemo({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const t = [
      setTimeout(() => setStep(1), 300),
      setTimeout(() => setStep(2), 900),
      setTimeout(() => setStep(3), 1600),
      setTimeout(() => setStep(4), 1900),
      setTimeout(() => setStep(5), 2600),
      setTimeout(() => onComplete(), 3000),
    ];
    return () => t.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div className="relative w-full h-48 mx-auto overflow-hidden rounded-2xl"
         style={{ background: 'linear-gradient(180deg, #0F1A3E 0%, #1A1040 100%)' }}>
      {/* 3 creatures centered */}
      <div className="absolute inset-0 flex items-center justify-center gap-6">
        {[
          { glow: true },
          { glow: false },
          { glow: false },
        ].map((item, i) => {
          const isTarget = item.glow;
          const isGlowing = isTarget && step >= 1;
          const isHit = isTarget && step >= 4;
          return (
            <motion.div
              key={i}
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{
                background: isHit ? 'rgba(72,187,120,0.5)' :
                            isGlowing ? 'rgba(255,212,59,0.4)' : 'rgba(255,255,255,0.08)',
                border: `2px solid ${isGlowing ? '#FFD43B' : 'rgba(255,255,255,0.15)'}`,
                boxShadow: isGlowing ? '0 0 16px rgba(255,212,59,0.5)' : 'none',
              }}
              animate={isHit ? { scale: [1, 1.3, 0], opacity: [1, 1, 0] } : {}}
              transition={{ duration: 0.4 }}
            >
              <span className="text-lg">{isGlowing ? '✨' : '🐟'}</span>
            </motion.div>
          );
        })}
      </div>

      {/* Hand */}
      {step >= 2 && step < 5 && (
        <motion.div
          className="absolute"
          style={{ left: 'calc(50% - 60px)' }}
          initial={{ top: 160, opacity: 0 }}
          animate={
            step === 2 ? { top: 110, opacity: 1 } :
            step === 3 ? { top: 100, opacity: 1, scale: 0.85 } :
            { top: 100, opacity: 0, scale: 1 }
          }
          transition={{ duration: step === 2 ? 0.6 : 0.2, ease: 'easeOut' }}
        >
          <HandCursor />
        </motion.div>
      )}

      {step === 4 && <CorrectFlash />}
    </div>
  );
}

// ---------------------------------------------------------------------------
// remember-sequence: 宝石が順番に光る → 手が同じ順番でタップ (oboete-susumu)
// ---------------------------------------------------------------------------
function RememberSequenceDemo({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<'show' | 'replay' | 'done'>('show');
  const [activeIdx, setActiveIdx] = useState(-1);
  const [handTarget, setHandTarget] = useState(-1);
  const [showCorrect, setShowCorrect] = useState(false);

  const gems = [
    { color: '#EF4444' },
    { color: '#3B82F6' },
    { color: '#22C55E' },
    { color: '#F59E0B' },
  ];
  const seq = [0, 2, 1];

  useEffect(() => {
    const t: ReturnType<typeof setTimeout>[] = [];
    seq.forEach((idx, i) => {
      t.push(setTimeout(() => setActiveIdx(idx), 300 + i * 600));
      t.push(setTimeout(() => setActiveIdx(-1), 300 + i * 600 + 400));
    });
    const rs = 300 + seq.length * 600 + 400;
    t.push(setTimeout(() => setPhase('replay'), rs));
    seq.forEach((idx, i) => {
      t.push(setTimeout(() => { setHandTarget(idx); setActiveIdx(idx); }, rs + i * 700));
      t.push(setTimeout(() => setActiveIdx(-1), rs + i * 700 + 400));
    });
    const end = rs + seq.length * 700 + 200;
    t.push(setTimeout(() => { setShowCorrect(true); setPhase('done'); }, end));
    t.push(setTimeout(() => onComplete(), end + 800));
    return () => t.forEach(clearTimeout);
  }, [onComplete]);

  // Grid positions for hand cursor (approximate centers of 2x2 grid)
  const handPositions = [
    { left: 'calc(50% - 52px)', top: 52 },
    { left: 'calc(50% + 16px)', top: 52 },
    { left: 'calc(50% - 52px)', top: 122 },
    { left: 'calc(50% + 16px)', top: 122 },
  ];

  return (
    <div className="relative w-full h-48 mx-auto overflow-hidden rounded-2xl"
         style={{ background: 'linear-gradient(180deg, #1A1040 0%, #0F0A2E 100%)' }}>
      {/* 2x2 gem grid centered */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="grid grid-cols-2 gap-3">
          {gems.map((gem, i) => (
            <motion.div
              key={i}
              className="w-14 h-14 rounded-xl flex items-center justify-center"
              style={{
                background: activeIdx === i ? gem.color : `${gem.color}22`,
                border: `2px solid ${activeIdx === i ? gem.color : `${gem.color}44`}`,
                boxShadow: activeIdx === i ? `0 0 20px ${gem.color}88` : 'none',
              }}
              animate={activeIdx === i ? { scale: [1, 1.15, 1] } : { scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <span className="text-xl">💎</span>
            </motion.div>
          ))}
        </div>
      </div>

      {phase === 'replay' && handTarget >= 0 && (
        <motion.div
          className="absolute"
          animate={{
            left: handPositions[handTarget].left,
            top: handPositions[handTarget].top + 50,
          }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        >
          <HandCursor size={32} />
        </motion.div>
      )}

      {showCorrect && <CorrectFlash />}
    </div>
  );
}

// ---------------------------------------------------------------------------
// match-shape: 回転した図形と同じものを選ぶ (kurukuru-puzzle)
// ---------------------------------------------------------------------------
function MatchShapeDemo({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const t = [
      setTimeout(() => setStep(1), 500),
      setTimeout(() => setStep(2), 1200),
      setTimeout(() => setStep(3), 1800),
      setTimeout(() => setStep(4), 2300),
      setTimeout(() => setStep(5), 2700),
      setTimeout(() => onComplete(), 3300),
    ];
    return () => t.forEach(clearTimeout);
  }, [onComplete]);

  const shapes = [
    { shape: '■', color: '#EF4444', correct: false },
    { shape: '▲', color: '#22C55E', correct: true },
    { shape: '●', color: '#3B82F6', correct: false },
  ];

  return (
    <div className="relative w-full h-48 mx-auto overflow-hidden rounded-2xl"
         style={{ background: 'linear-gradient(180deg, #1A1A40 0%, #12102E 100%)' }}>
      {/* Rotated target shape at top center */}
      <motion.div
        className="absolute left-1/2 top-3 -translate-x-1/2 flex flex-col items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: step >= 1 ? 1 : 0 }}
      >
        <div className="w-16 h-16 rounded-xl flex items-center justify-center"
             style={{ background: 'rgba(139,92,246,0.2)', border: '2px solid rgba(139,92,246,0.4)' }}>
          <span className="text-3xl" style={{ color: '#22C55E', display: 'inline-block', transform: 'rotate(90deg)' }}>▲</span>
        </div>
        {step >= 1 && <span className="mt-1 text-[10px]" style={{ color: '#B8B8D0' }}>おなじのは？</span>}
      </motion.div>

      {/* 3 choices centered at bottom */}
      <div className="absolute bottom-4 inset-x-0 flex justify-center gap-3">
        {shapes.map((s, i) => {
          const isHit = s.correct && step >= 5;
          return (
            <motion.div
              key={i}
              className="w-14 h-14 rounded-xl flex items-center justify-center"
              style={{
                background: isHit ? 'rgba(72,187,120,0.3)' : 'rgba(255,255,255,0.06)',
                border: `2px solid ${isHit ? '#48BB78' : 'rgba(255,255,255,0.12)'}`,
              }}
              initial={{ opacity: 0, y: 10 }}
              animate={{
                opacity: step >= 2 ? 1 : 0,
                y: step >= 2 ? 0 : 10,
                scale: isHit ? [1, 1.15, 1] : 1,
              }}
              transition={{ duration: 0.3, delay: step < 3 ? i * 0.1 : 0 }}
            >
              <span className="text-2xl" style={{ color: s.color }}>{s.shape}</span>
            </motion.div>
          );
        })}
      </div>

      {/* Hand cursor */}
      {step >= 3 && step < 5 && (
        <motion.div
          className="absolute"
          initial={{ left: 'calc(50% + 60px)', top: 160, opacity: 0 }}
          animate={
            step === 3 ? { left: 'calc(50% - 4px)', top: 150, opacity: 1 } :
            { left: 'calc(50% - 4px)', top: 150, opacity: 1, scale: 0.85 }
          }
          transition={{ duration: step === 3 ? 0.4 : 0.2, ease: 'easeOut' }}
        >
          <HandCursor size={32} />
        </motion.div>
      )}

      {step === 5 && <CorrectFlash />}
    </div>
  );
}

// ---------------------------------------------------------------------------
// rule-change: ルールチェンジ (DCCS)
// いろ→かたち のルール切り替えデモ
// ---------------------------------------------------------------------------
function RuleChangeDemo({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const t = [
      // Phase 1: Color rule
      setTimeout(() => setStep(1), 300),    // "いろでわけよう" rule
      setTimeout(() => setStep(2), 800),    // Card + choices appear
      setTimeout(() => setStep(3), 1500),   // Hand appears
      setTimeout(() => setStep(4), 2000),   // Hand moves to red circle (color match)
      setTimeout(() => setStep(5), 2300),   // Tap
      setTimeout(() => setStep(6), 2700),   // Correct flash
      // Phase 2: Shape rule
      setTimeout(() => setStep(7), 3200),   // "かたちでわけよう" rule
      setTimeout(() => setStep(8), 3700),   // Card + choices appear
      setTimeout(() => setStep(9), 4300),   // Hand appears
      setTimeout(() => setStep(10), 4800),  // Hand moves to blue star (shape match)
      setTimeout(() => setStep(11), 5100),  // Tap
      setTimeout(() => setStep(12), 5500),  // Correct flash
      setTimeout(() => onComplete(), 6000),
    ];
    return () => t.forEach(clearTimeout);
  }, [onComplete]);

  const isPhase1 = step >= 1 && step <= 6;
  const isPhase2 = step >= 7;
  const ruleText = isPhase2 ? 'かたちで わけよう' : 'いろで わけよう';
  const ruleColor = isPhase2 ? '#8B5CF6' : '#F59E0B';
  const showCard = (isPhase1 && step >= 2) || (isPhase2 && step >= 8);
  const showChoices = showCard;
  const correctPhase1 = step >= 6 && step <= 6; // red circle highlighted
  const correctPhase2 = step >= 12;              // blue star highlighted

  return (
    <div className="relative w-full h-48 mx-auto overflow-hidden rounded-2xl"
         style={{ background: 'linear-gradient(180deg, #1A1A40 0%, #12102E 100%)' }}>
      {/* Rule label at top */}
      <motion.div
        className="absolute left-1/2 top-2 -translate-x-1/2 px-3 py-1 rounded-full"
        style={{ background: `${ruleColor}22`, border: `1px solid ${ruleColor}44` }}
        key={isPhase2 ? 'shape' : 'color'}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: (isPhase1 || isPhase2) ? 1 : 0, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <span className="text-[11px] font-bold" style={{ color: ruleColor }}>{ruleText}</span>
      </motion.div>

      {/* Center card: red star */}
      {showCard && (
        <motion.div
          className="absolute left-1/2 top-10 -translate-x-1/2 w-14 h-14 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.08)', border: '2px solid rgba(255,255,255,0.15)' }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <span className="text-2xl" style={{ color: '#EF4444' }}>★</span>
        </motion.div>
      )}

      {/* Two choices centered at bottom */}
      {showChoices && (
        <div className="absolute bottom-4 inset-x-0 flex justify-center gap-6">
          {/* Red circle */}
          <motion.div
            className="w-14 h-14 rounded-xl flex flex-col items-center justify-center gap-0.5"
            style={{
              background: correctPhase1 ? 'rgba(72,187,120,0.3)' : 'rgba(255,255,255,0.06)',
              border: `2px solid ${correctPhase1 ? '#48BB78' : 'rgba(255,255,255,0.12)'}`,
            }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0, scale: correctPhase1 ? [1, 1.15, 1] : 1 }}
            transition={{ duration: 0.3 }}
          >
            <span className="text-2xl" style={{ color: '#EF4444' }}>●</span>
          </motion.div>
          {/* Blue star */}
          <motion.div
            className="w-14 h-14 rounded-xl flex flex-col items-center justify-center gap-0.5"
            style={{
              background: correctPhase2 ? 'rgba(72,187,120,0.3)' : 'rgba(255,255,255,0.06)',
              border: `2px solid ${correctPhase2 ? '#48BB78' : 'rgba(255,255,255,0.12)'}`,
            }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0, scale: correctPhase2 ? [1, 1.15, 1] : 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <span className="text-2xl" style={{ color: '#3B82F6' }}>★</span>
          </motion.div>
        </div>
      )}

      {/* Hand - Phase 1: moves to red circle (left choice) */}
      {step >= 3 && step <= 5 && (
        <motion.div
          className="absolute"
          initial={{ left: 'calc(50% + 40px)', top: 155, opacity: 0 }}
          animate={
            step === 3 ? { left: 'calc(50% + 40px)', top: 155, opacity: 1 } :
            step === 4 ? { left: 'calc(50% - 48px)', top: 155, opacity: 1 } :
            { left: 'calc(50% - 48px)', top: 155, opacity: 1, scale: 0.85 }
          }
          transition={{ duration: step === 4 ? 0.4 : 0.2, ease: 'easeOut' }}
        >
          <HandCursor size={32} />
        </motion.div>
      )}

      {/* Hand - Phase 2: moves to blue star (right choice) */}
      {step >= 9 && step <= 11 && (
        <motion.div
          className="absolute"
          initial={{ left: 'calc(50% - 60px)', top: 155, opacity: 0 }}
          animate={
            step === 9 ? { left: 'calc(50% - 60px)', top: 155, opacity: 1 } :
            step === 10 ? { left: 'calc(50% + 20px)', top: 155, opacity: 1 } :
            { left: 'calc(50% + 20px)', top: 155, opacity: 1, scale: 0.85 }
          }
          transition={{ duration: step === 10 ? 0.4 : 0.2, ease: 'easeOut' }}
        >
          <HandCursor size={32} />
        </motion.div>
      )}

      {(step === 6 || step === 12) && <CorrectFlash />}
    </div>
  );
}

// ---------------------------------------------------------------------------
// swipe-path: 迷路をスワイプ (tanken-meiro)
// ---------------------------------------------------------------------------
function SwipePathDemo({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);

  const path = [
    { x: 30, y: 140 }, { x: 30, y: 80 },
    { x: 90, y: 80 }, { x: 90, y: 40 },
    { x: 170, y: 40 }, { x: 170, y: 100 },
    { x: 220, y: 100 },
  ];

  useEffect(() => {
    const t = [
      setTimeout(() => setStep(1), 300),
      setTimeout(() => setStep(2), 600),
    ];
    const steps = path.length;
    for (let i = 0; i < steps; i++) {
      t.push(setTimeout(() => setStep(i + 3), 600 + i * 300));
    }
    t.push(setTimeout(() => setStep(100), 600 + steps * 300 + 200));
    t.push(setTimeout(() => onComplete(), 600 + steps * 300 + 800));
    return () => t.forEach(clearTimeout);
  }, [onComplete]);

  const pathD = `M ${path.map(p => `${p.x} ${p.y}`).join(' L ')}`;
  const handIdx = Math.max(0, Math.min(step - 3, path.length - 1));
  const handPos = step >= 3 && step < 100 ? path[handIdx] : null;

  return (
    <div className="relative w-full h-48 mx-auto overflow-hidden rounded-2xl"
         style={{ background: 'linear-gradient(180deg, #1A2040 0%, #101030 100%)' }}>
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 256 192">
        <rect x="10" y="20" width="236" height="160" rx="8" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
        <line x1="60" y1="20" x2="60" y2="110" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
        <line x1="120" y1="60" x2="120" y2="180" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
        <line x1="60" y1="110" x2="200" y2="110" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
        <motion.path
          d={pathD}
          stroke="#8B5CF6"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: step >= 3 ? Math.min((step - 2) / path.length, 1) : 0 }}
          transition={{ duration: 0.25 }}
        />
        <circle cx={path[0].x} cy={path[0].y} r="6" fill="#8B5CF6" />
        <text x={path[0].x} y={path[0].y - 10} textAnchor="middle" fill="#B8B8D0" fontSize="9">S</text>
        <circle cx={path[path.length - 1].x} cy={path[path.length - 1].y} r="6" fill="#48BB78" />
        <text x={path[path.length - 1].x} y={path[path.length - 1].y - 10} textAnchor="middle" fill="#48BB78" fontSize="9">G</text>
      </svg>

      {handPos && (
        <motion.div
          className="absolute"
          animate={{ left: handPos.x - 4, top: handPos.y + 8 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        >
          <HandCursor size={28} />
        </motion.div>
      )}

      {step >= 100 && <CorrectFlash />}
    </div>
  );
}

// ---------------------------------------------------------------------------
// select-word: ことばを聞いて絵を選ぶ (kotoba-ehon)
// ---------------------------------------------------------------------------
function SelectWordDemo({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const t = [
      setTimeout(() => setStep(1), 300),
      setTimeout(() => setStep(2), 1200),
      setTimeout(() => setStep(3), 1800),
      setTimeout(() => setStep(4), 2200),
      setTimeout(() => setStep(5), 2600),
      setTimeout(() => onComplete(), 3200),
    ];
    return () => t.forEach(clearTimeout);
  }, [onComplete]);

  const pics = [
    { emoji: '🍎', label: 'りんご', correct: true },
    { emoji: '🚗', label: 'くるま', correct: false },
    { emoji: '🐱', label: 'ねこ', correct: false },
    { emoji: '🌸', label: 'はな', correct: false },
  ];

  return (
    <div className="relative w-full h-48 mx-auto overflow-hidden rounded-2xl"
         style={{ background: 'linear-gradient(180deg, #1E1040 0%, #140E30 100%)' }}>
      {/* Word prompt */}
      <motion.div
        className="absolute left-1/2 top-3 -translate-x-1/2 flex items-center gap-2 px-4 py-1.5 rounded-full"
        style={{ background: 'rgba(139,92,246,0.2)', border: '1px solid rgba(139,92,246,0.3)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: step >= 1 ? 1 : 0 }}
      >
        <span className="text-xs" style={{ color: '#C4B5FD' }}>🔊 「りんご」</span>
      </motion.div>

      {/* 2x2 picture cards centered */}
      <div className="absolute inset-x-0 bottom-3 flex justify-center">
        <div className="grid grid-cols-2 gap-2">
          {pics.map((p, i) => {
            const isHit = p.correct && step >= 5;
            return (
              <motion.div
                key={i}
                className="w-[72px] h-[48px] rounded-lg flex items-center justify-center gap-1"
                style={{
                  background: isHit ? 'rgba(72,187,120,0.25)' : 'rgba(255,255,255,0.06)',
                  border: `2px solid ${isHit ? '#48BB78' : 'rgba(255,255,255,0.1)'}`,
                }}
                animate={isHit ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                <span className="text-xl">{p.emoji}</span>
                <span className="text-[9px]" style={{ color: '#B8B8D0' }}>{p.label}</span>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Hand */}
      {step >= 2 && step < 5 && (
        <motion.div
          className="absolute"
          initial={{ left: 'calc(50% + 60px)', top: 160, opacity: 0 }}
          animate={
            step === 2 ? { left: 'calc(50% + 60px)', top: 160, opacity: 1 } :
            step === 3 ? { left: 'calc(50% - 56px)', top: 142, opacity: 1 } :
            { left: 'calc(50% - 56px)', top: 142, opacity: 1, scale: 0.85 }
          }
          transition={{ duration: step === 3 ? 0.4 : 0.2, ease: 'easeOut' }}
        >
          <HandCursor size={32} />
        </motion.div>
      )}

      {step === 5 && <CorrectFlash />}
    </div>
  );
}

// ---------------------------------------------------------------------------
// match-emotion: 顔の表情を選ぶ (kimochi-friends)
// ---------------------------------------------------------------------------
function MatchEmotionDemo({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const t = [
      setTimeout(() => setStep(1), 400),
      setTimeout(() => setStep(2), 1200),
      setTimeout(() => setStep(3), 1800),
      setTimeout(() => setStep(4), 2200),
      setTimeout(() => setStep(5), 2600),
      setTimeout(() => onComplete(), 3200),
    ];
    return () => t.forEach(clearTimeout);
  }, [onComplete]);

  const faces = [
    { emoji: '😊', label: 'うれしい', correct: true },
    { emoji: '😢', label: 'かなしい', correct: false },
    { emoji: '😠', label: 'おこってる', correct: false },
  ];

  return (
    <div className="relative w-full h-48 mx-auto overflow-hidden rounded-2xl"
         style={{ background: 'linear-gradient(180deg, #1E1040 0%, #140E30 100%)' }}>
      {/* Target face */}
      <motion.div
        className="absolute left-1/2 top-3 -translate-x-1/2 flex flex-col items-center gap-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: step >= 1 ? 1 : 0 }}
      >
        <span className="text-4xl">😊</span>
        <span className="text-[10px]" style={{ color: '#B8B8D0' }}>このきもちは？</span>
      </motion.div>

      {/* 3 choice faces centered */}
      <div className="absolute bottom-4 inset-x-0 flex justify-center gap-3">
        {faces.map((f, i) => {
          const isHit = f.correct && step >= 5;
          return (
            <motion.div
              key={i}
              className="w-16 h-[52px] rounded-xl flex flex-col items-center justify-center gap-0.5"
              style={{
                background: isHit ? 'rgba(72,187,120,0.25)' : 'rgba(255,255,255,0.06)',
                border: `2px solid ${isHit ? '#48BB78' : 'rgba(255,255,255,0.1)'}`,
              }}
              animate={isHit ? { scale: [1, 1.15, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              <span className="text-xl">{f.emoji}</span>
              <span className="text-[8px]" style={{ color: '#B8B8D0' }}>{f.label}</span>
            </motion.div>
          );
        })}
      </div>

      {/* Hand */}
      {step >= 2 && step < 5 && (
        <motion.div
          className="absolute"
          initial={{ left: 'calc(50% + 60px)', top: 160, opacity: 0 }}
          animate={
            step === 2 ? { left: 'calc(50% + 60px)', top: 160, opacity: 1 } :
            step === 3 ? { left: 'calc(50% - 48px)', top: 155, opacity: 1 } :
            { left: 'calc(50% - 48px)', top: 155, opacity: 1, scale: 0.85 }
          }
          transition={{ duration: step === 3 ? 0.4 : 0.2, ease: 'easeOut' }}
        >
          <HandCursor size={32} />
        </motion.div>
      )}

      {step === 5 && <CorrectFlash />}
    </div>
  );
}

// ---------------------------------------------------------------------------
// drag-target: まるをタッチ (touch-adventure)
// ---------------------------------------------------------------------------
function DragTargetDemo({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const t = [
      setTimeout(() => setStep(1), 300),
      setTimeout(() => setStep(2), 800),
      setTimeout(() => setStep(3), 1400),
      setTimeout(() => setStep(4), 1800),
      setTimeout(() => setStep(5), 2200),
      // Second target
      setTimeout(() => setStep(6), 2600),
      setTimeout(() => setStep(7), 3100),
      setTimeout(() => setStep(8), 3500),
      setTimeout(() => setStep(9), 3900),
      setTimeout(() => onComplete(), 4400),
    ];
    return () => t.forEach(clearTimeout);
  }, [onComplete]);

  const targets = [
    { left: 'calc(50% - 30px)', top: 60, size: 44, active: step >= 1 && step < 5 },
    { left: 'calc(50% + 30px)', top: 100, size: 32, active: step >= 6 && step < 9 },
  ];

  return (
    <div className="relative w-full h-48 mx-auto overflow-hidden rounded-2xl"
         style={{ background: 'linear-gradient(180deg, #101835 0%, #0D1228 100%)' }}>
      {/* Targets */}
      {targets.map((tgt, i) => (
        tgt.active && (
          <motion.div
            key={i}
            className="absolute rounded-full flex items-center justify-center"
            style={{
              left: tgt.left, top: tgt.top,
              width: tgt.size, height: tgt.size,
              background: 'rgba(139,92,246,0.3)',
              border: '3px solid #8B5CF6',
              boxShadow: '0 0 12px rgba(139,92,246,0.4)',
            }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          />
        )
      ))}

      {/* Hit effects */}
      {(step === 5 || step === 9) && (
        <motion.div
          className="absolute rounded-full"
          style={{
            left: step === 5 ? 'calc(50% - 30px - 8px)' : 'calc(50% + 30px - 14px)',
            top: (step === 5 ? targets[0].top : targets[1].top) - 8,
            width: 60, height: 60,
          }}
          initial={{ opacity: 0.6, scale: 0.5 }}
          animate={{ opacity: 0, scale: 2 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-full h-full rounded-full" style={{ background: 'rgba(72,187,120,0.4)' }} />
        </motion.div>
      )}

      {/* Hand - first target */}
      {step >= 2 && step < 5 && (
        <motion.div
          className="absolute"
          initial={{ left: 'calc(50% - 70px)', top: 150, opacity: 0 }}
          animate={
            step === 2 ? { left: 'calc(50% - 70px)', top: 150, opacity: 1 } :
            step === 3 ? { left: 'calc(50% - 34px)', top: targets[0].top + 36, opacity: 1 } :
            { left: 'calc(50% - 34px)', top: targets[0].top + 36, opacity: 1, scale: 0.85 }
          }
          transition={{ duration: step === 3 ? 0.5 : 0.2, ease: 'easeOut' }}
        >
          <HandCursor size={32} />
        </motion.div>
      )}

      {/* Hand - second target */}
      {step >= 7 && step < 9 && (
        <motion.div
          className="absolute"
          initial={{ left: 'calc(50% - 20px)', top: 150, opacity: 0 }}
          animate={
            step === 7 ? { left: 'calc(50% + 26px)', top: targets[1].top + 28, opacity: 1 } :
            { left: 'calc(50% + 26px)', top: targets[1].top + 28, opacity: 1, scale: 0.85 }
          }
          transition={{ duration: step === 7 ? 0.4 : 0.2, ease: 'easeOut' }}
        >
          <HandCursor size={32} />
        </motion.div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// wait-and-tap: Go/No-Go デモ (matte-stop)
// ---------------------------------------------------------------------------
function WaitAndTapDemo({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const t = [
      setTimeout(() => setStep(1), 300),   // Go signal
      setTimeout(() => setStep(2), 800),   // Hand taps
      setTimeout(() => setStep(3), 1200),  // Correct
      setTimeout(() => setStep(4), 1800),  // No-Go signal
      setTimeout(() => setStep(5), 2800),  // Hand waits (don't tap)
      setTimeout(() => setStep(6), 3300),  // Correct - didn't tap
      setTimeout(() => onComplete(), 3800),
    ];
    return () => t.forEach(clearTimeout);
  }, [onComplete]);

  const isGo = step >= 1 && step <= 3;
  const isNoGo = step >= 4 && step <= 6;

  return (
    <div className="relative w-full h-48 mx-auto overflow-hidden rounded-2xl"
         style={{ background: 'linear-gradient(180deg, #1A1040 0%, #0F0A2E 100%)' }}>
      {/* Signal centered */}
      <div className="absolute left-1/2 top-6 -translate-x-1/2 flex flex-col items-center gap-2">
        {isGo && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
            <div className="w-16 h-16 rounded-full flex items-center justify-center"
                 style={{ background: 'rgba(72,187,120,0.3)', border: '3px solid #48BB78' }}>
              <span className="text-2xl">🐕</span>
            </div>
            <p className="text-[10px] text-center mt-1" style={{ color: '#48BB78' }}>タッチ！</p>
          </motion.div>
        )}
        {isNoGo && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
            <div className="w-16 h-16 rounded-full flex items-center justify-center"
                 style={{ background: 'rgba(239,68,68,0.2)', border: '3px solid #EF4444' }}>
              <span className="text-2xl">🚩</span>
            </div>
            <p className="text-[10px] text-center mt-1" style={{ color: '#EF4444' }}>まって！</p>
          </motion.div>
        )}
      </div>

      {/* Hand taps for Go */}
      {step === 2 && (
        <motion.div
          className="absolute"
          initial={{ left: 'calc(50% - 4px)', top: 150, opacity: 0 }}
          animate={{ left: 'calc(50% - 4px)', top: 60, opacity: 1, scale: [1, 0.85, 1] }}
          transition={{ duration: 0.35 }}
        >
          <HandCursor size={32} />
        </motion.div>
      )}

      {step === 3 && <CorrectFlash />}

      {/* Hand stays away for No-Go */}
      {step === 5 && (
        <motion.div
          className="absolute"
          style={{ left: 'calc(50% - 10px)', top: 140 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 1, 0.5] }}
          transition={{ duration: 1 }}
        >
          <HandCursor size={32} />
          <motion.span
            className="absolute -top-4 -right-2 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            ✋
          </motion.span>
        </motion.div>
      )}
      {step === 6 && <CorrectFlash />}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Registry
// ---------------------------------------------------------------------------
const DEMO_COMPONENTS: Record<DemoType, React.ComponentType<{ onComplete: () => void }>> = {
  'tap-target': TapTargetDemo,
  'wait-and-tap': WaitAndTapDemo,
  'remember-sequence': RememberSequenceDemo,
  'match-shape': MatchShapeDemo,
  'rule-change': RuleChangeDemo,
  'swipe-path': SwipePathDemo,
  'select-word': SelectWordDemo,
  'match-emotion': MatchEmotionDemo,
  'drag-target': DragTargetDemo,
};

export default function DemoAnimation({ demoType }: DemoAnimationProps) {
  const [loopKey, setLoopKey] = useState(0);

  const handleCycleEnd = useCallback(() => {
    // Pause 1 second, then restart the demo from the beginning
    setTimeout(() => setLoopKey(k => k + 1), 1000);
  }, []);

  const DemoComponent = DEMO_COMPONENTS[demoType];

  return (
    <motion.div
      key={loopKey}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <DemoComponent onComplete={handleCycleEnd} />
    </motion.div>
  );
}
