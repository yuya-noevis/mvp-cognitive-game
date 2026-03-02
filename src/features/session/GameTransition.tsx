'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

interface GameTransitionProps {
  fromGameName: string;
  toGameName: string;
  toGameIcon?: string;
  onComplete: () => void;
}

export function GameTransition({ toGameName, onComplete }: GameTransitionProps) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 1500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-space"
    >
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.4, ease: 'easeOut' }}
        className="flex flex-col items-center gap-4"
      >
        {/* マスコット移動アニメーション */}
        <motion.div
          initial={{ x: -40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5, ease: 'easeOut' }}
          className="text-5xl"
        >
          🎮
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.3 }}
          className="text-2xl font-bold"
          style={{ color: '#FFD43B' }}
        >
          つぎは {toGameName}！
        </motion.p>
      </motion.div>
    </motion.div>
  );
}
