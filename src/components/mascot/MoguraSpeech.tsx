'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Mogura from './Mogura';
import type { Expression } from './Mogura';

interface MoguraSpeechProps {
  expression?: Expression;
  size?: number;
  message?: string;
  position?: 'top' | 'bottom';
  animate?: boolean;
  onDismiss?: () => void;
  className?: string;
}

/**
 * MoguraSpeech — モグラ + 吹き出しの統合コンポーネント
 *
 * 子ども向けに大きめフォント、丸角、やさしい色合い。
 * タップで閉じられる（onDismiss）。
 */
export function MoguraSpeech({
  expression = 'happy',
  size = 120,
  message,
  position = 'top',
  animate = true,
  onDismiss,
  className = '',
}: MoguraSpeechProps) {
  return (
    <div
      className={`inline-flex flex-col items-center ${className}`}
      style={{ gap: position === 'top' ? 0 : 0 }}
    >
      {/* 吹き出し（上） */}
      {position === 'top' && message && (
        <AnimatePresence>
          <motion.div
            initial={animate ? { opacity: 0, scale: 0.8, y: 8 } : false}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 8 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="speech-bubble speech-bubble--bottom"
            onClick={onDismiss}
            role={onDismiss ? 'button' : undefined}
            tabIndex={onDismiss ? 0 : undefined}
            aria-label={onDismiss ? 'メッセージを閉じる' : undefined}
          >
            <p className="speech-bubble__text">{message}</p>
          </motion.div>
        </AnimatePresence>
      )}

      {/* モグラ本体 */}
      <div className="relative z-10">
        <Mogura expression={expression} size={size} />
      </div>

      {/* 吹き出し（下） */}
      {position === 'bottom' && message && (
        <AnimatePresence>
          <motion.div
            initial={animate ? { opacity: 0, scale: 0.8, y: -8 } : false}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -8 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="speech-bubble speech-bubble--top"
            onClick={onDismiss}
            role={onDismiss ? 'button' : undefined}
            tabIndex={onDismiss ? 0 : undefined}
            aria-label={onDismiss ? 'メッセージを閉じる' : undefined}
          >
            <p className="speech-bubble__text">{message}</p>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
