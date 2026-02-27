'use client';

import { useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Mogura from '@/components/mascot/Mogura';
import Image from 'next/image';

export type FeedbackEffectType = 'correct' | 'incorrect' | 'streak-3' | 'streak-5' | 'near-miss' | null;

export interface VisualFeedbackProps {
  type: FeedbackEffectType;
  intensity: 'subtle' | 'standard' | 'vivid';
  onComplete?: () => void;
}

const DURATIONS: Record<NonNullable<FeedbackEffectType>, number> = {
  correct: 300,
  incorrect: 200,
  'streak-3': 800,
  'streak-5': 1200,
  'near-miss': 500,
};

const INTENSITY_SCALE: Record<string, { scale: number; opacity: number; particleCount: number }> = {
  subtle: { scale: 0.5, opacity: 0.5, particleCount: 3 },
  standard: { scale: 1, opacity: 1, particleCount: 6 },
  vivid: { scale: 1.5, opacity: 1, particleCount: 10 },
};

export function VisualFeedback({ type, intensity, onComplete }: VisualFeedbackProps) {
  useEffect(() => {
    if (!type) return;
    const timer = setTimeout(() => {
      onComplete?.();
    }, DURATIONS[type]);
    return () => clearTimeout(timer);
  }, [type, onComplete]);

  const intensityConfig = INTENSITY_SCALE[intensity];

  return (
    <AnimatePresence>
      {type === 'correct' && (
        <CorrectEffect intensity={intensityConfig} />
      )}
      {type === 'incorrect' && (
        <IncorrectEffect />
      )}
      {type === 'streak-3' && (
        <Streak3Effect intensity={intensityConfig} />
      )}
      {type === 'streak-5' && (
        <Streak5Effect intensity={intensityConfig} />
      )}
      {type === 'near-miss' && (
        <NearMissEffect intensity={intensityConfig} />
      )}
    </AnimatePresence>
  );
}

/** 正解: ターゲット周辺に光の輪（緑〜金色のグロー）300ms */
function CorrectEffect({ intensity }: { intensity: typeof INTENSITY_SCALE['standard'] }) {
  return (
    <motion.div
      key="correct"
      className="fixed inset-0 flex items-center justify-center z-[60] pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: intensity.opacity }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="rounded-full"
        style={{
          width: 120 * intensity.scale,
          height: 120 * intensity.scale,
          background: 'radial-gradient(circle, rgba(255, 212, 59, 0.4) 0%, rgba(72, 187, 120, 0.2) 50%, transparent 70%)',
          boxShadow: '0 0 40px rgba(255, 212, 59, 0.3)',
        }}
        initial={{ scale: 0.3, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 1.5, opacity: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      />
    </motion.div>
  );
}

/** 不正解: 画面全体が軽く揺れる 200ms */
function IncorrectEffect() {
  return (
    <motion.div
      key="incorrect"
      className="fixed inset-0 z-[60] pointer-events-none"
      initial={{ x: 0 }}
      animate={{
        x: [0, -4, 4, -3, 3, -2, 2, 0],
      }}
      exit={{ x: 0 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
    />
  );
}

/** 3連続正解: マスコットが喜ぶ + 星エフェクト 800ms */
function Streak3Effect({ intensity }: { intensity: typeof INTENSITY_SCALE['standard'] }) {
  const stars = useMemo(() => {
    return Array.from({ length: intensity.particleCount }, (_, i) => {
      const angle = (360 / intensity.particleCount) * i;
      const rad = (angle * Math.PI) / 180;
      const distance = 80 * intensity.scale;
      return {
        id: i,
        tx: Math.cos(rad) * distance,
        ty: Math.sin(rad) * distance,
        delay: i * 0.05,
        size: 24 + Math.random() * 12,
      };
    });
  }, [intensity.particleCount, intensity.scale]);

  return (
    <motion.div
      key="streak-3"
      className="fixed inset-0 flex items-center justify-center z-[60] pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* 星パーティクル */}
      {stars.map((s) => (
        <motion.div
          key={s.id}
          className="absolute"
          initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
          animate={{
            scale: [0, 1, 0],
            x: [0, s.tx * 0.6, s.tx],
            y: [0, s.ty * 0.6, s.ty],
            opacity: [1, 1, 0],
          }}
          transition={{ duration: 0.6, delay: s.delay, ease: 'easeOut' }}
        >
          <Image
            src="/assets/effects/effect-star.png"
            alt=""
            width={s.size}
            height={s.size}
            className="pointer-events-none"
          />
        </motion.div>
      ))}

      {/* マスコット ジャンプ */}
      <motion.div
        className="fixed bottom-8 left-1/2 z-[61]"
        initial={{ x: '-50%', y: 100, opacity: 0 }}
        animate={{
          y: [100, -10, 0],
          opacity: 1,
        }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <Mogura expression="excited" size={72} />
      </motion.div>
    </motion.div>
  );
}

/** 5連続正解: コンフェッティ + マスコットスペシャル 1200ms */
function Streak5Effect({ intensity }: { intensity: typeof INTENSITY_SCALE['standard'] }) {
  const confettiPieces = useMemo(() => {
    const count = Math.round(12 * intensity.scale);
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: 10 + Math.random() * 80,
      delay: Math.random() * 0.4,
      size: 18 + Math.random() * 14,
      rotation: Math.random() * 720,
    }));
  }, [intensity.scale]);

  const stars = useMemo(() => {
    return Array.from({ length: intensity.particleCount }, (_, i) => {
      const angle = (360 / intensity.particleCount) * i;
      const rad = (angle * Math.PI) / 180;
      const distance = 100 * intensity.scale;
      return {
        id: i,
        tx: Math.cos(rad) * distance,
        ty: Math.sin(rad) * distance,
        delay: i * 0.03,
        size: 20 + Math.random() * 16,
      };
    });
  }, [intensity.particleCount, intensity.scale]);

  return (
    <motion.div
      key="streak-5"
      className="fixed inset-0 z-[60] pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* ラジアルグロー */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.6, 0] }}
        transition={{ duration: 1.2 }}
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(255, 212, 59, 0.2) 0%, transparent 60%)',
        }}
      />

      {/* 星バースト */}
      <div className="absolute inset-0 flex items-center justify-center">
        {stars.map((s) => (
          <motion.div
            key={s.id}
            className="absolute"
            initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
            animate={{
              scale: [0, 1.2, 0],
              x: [0, s.tx * 0.5, s.tx],
              y: [0, s.ty * 0.5, s.ty],
              opacity: [1, 1, 0],
            }}
            transition={{ duration: 0.7, delay: s.delay, ease: 'easeOut' }}
          >
            <Image
              src="/assets/effects/effect-star.png"
              alt=""
              width={s.size}
              height={s.size}
              className="pointer-events-none"
            />
          </motion.div>
        ))}
      </div>

      {/* コンフェッティ */}
      {confettiPieces.map((c) => (
        <motion.div
          key={c.id}
          className="absolute top-0"
          style={{ left: `${c.left}%` }}
          initial={{ y: -20, opacity: 1, rotate: 0 }}
          animate={{
            y: ['-20px', '100vh'],
            rotate: [0, c.rotation],
            opacity: [1, 1, 0],
          }}
          transition={{ duration: 1.5, delay: c.delay, ease: 'easeIn' }}
        >
          <Image
            src="/assets/effects/effect-confetti.png"
            alt=""
            width={c.size}
            height={c.size}
            className="pointer-events-none"
          />
        </motion.div>
      ))}

      {/* マスコット スペシャル */}
      <motion.div
        className="fixed bottom-8 left-1/2 z-[61]"
        initial={{ x: '-50%', y: 100, opacity: 0, scale: 0.5 }}
        animate={{
          y: [100, -20, 0],
          opacity: 1,
          scale: [0.5, 1.2, 1],
        }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
      >
        <Mogura expression="excited" size={88} />
      </motion.div>
    </motion.div>
  );
}

/** 惜しい: 黄色のグロー + テキスト 500ms */
function NearMissEffect({ intensity }: { intensity: typeof INTENSITY_SCALE['standard'] }) {
  return (
    <motion.div
      key="near-miss"
      className="fixed inset-0 flex items-center justify-center z-[60] pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: intensity.opacity }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
    >
      {/* 黄色グロー */}
      <motion.div
        className="rounded-full"
        style={{
          width: 100 * intensity.scale,
          height: 100 * intensity.scale,
          background: 'radial-gradient(circle, rgba(255, 212, 59, 0.35) 0%, transparent 70%)',
        }}
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 1.3, opacity: 0 }}
        transition={{ duration: 0.5 }}
      />
      {/* テキスト */}
      <motion.span
        className="absolute text-2xl font-bold"
        style={{ color: '#FFD43B', textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}
        initial={{ scale: 0.5, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        おしい！
      </motion.span>
    </motion.div>
  );
}
