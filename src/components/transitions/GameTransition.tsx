'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

export interface GameTransitionProps {
  nextGameName: string;
  nextGameIcon?: string;
  duration?: number;
  onComplete: () => void;
}

/**
 * ゲーム切り替え予告コンポーネント
 * ASD児がトランジションに備えられるよう「つぎは ○○ だよ」を表示し、
 * カウントダウンバーで残り時間を視覚的に伝える。
 */
export function GameTransition({
  nextGameName,
  nextGameIcon = '🎮',
  duration = 3000,
  onComplete,
}: GameTransitionProps) {
  const [progress, setProgress] = useState(0);
  const startTimeRef = useRef<number>(Date.now());
  const rafRef = useRef<number | null>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    startTimeRef.current = Date.now();

    function tick() {
      const elapsed = Date.now() - startTimeRef.current;
      const ratio = Math.min(elapsed / duration, 1);
      setProgress(ratio);

      if (ratio < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        onCompleteRef.current();
      }
    }

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [duration]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-space"
    >
      {/* メインコンテンツ */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.92 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.15, duration: 0.4, ease: 'easeOut' }}
        className="flex flex-col items-center gap-6"
      >
        {/* 予告テキスト */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          className="text-xl font-bold"
          style={{ color: 'rgba(184, 184, 208, 0.8)' }}
        >
          つぎは
        </motion.p>

        {/* 次のゲームの絵カード */}
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.35, duration: 0.45, type: 'spring', stiffness: 180, damping: 16 }}
          className="flex flex-col items-center gap-4 px-10 py-8 rounded-3xl"
          style={{
            background: 'rgba(255, 255, 255, 0.07)',
            border: '2px solid rgba(255, 255, 255, 0.12)',
            minWidth: 200,
          }}
        >
          <span className="text-6xl leading-none">{nextGameIcon}</span>
          <p
            className="text-2xl font-bold text-center"
            style={{ color: '#E8E8F0' }}
          >
            {nextGameName}
          </p>
        </motion.div>

        {/* 「だよ」の補足テキスト */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55, duration: 0.3 }}
          className="text-xl font-bold"
          style={{ color: 'rgba(184, 184, 208, 0.8)' }}
        >
          だよ
        </motion.p>
      </motion.div>

      {/* カウントダウンプログレスバー（画面下部）*/}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.3 }}
        className="fixed bottom-8 left-6 right-6"
      >
        <div
          className="w-full h-3 rounded-full overflow-hidden"
          style={{ background: 'rgba(255, 255, 255, 0.1)' }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{
              background: 'linear-gradient(90deg, #6C3CE1, #8B5CF6)',
              width: `${progress * 100}%`,
            }}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}
