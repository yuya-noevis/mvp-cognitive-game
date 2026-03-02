'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface SessionEndWarningProps {
  remainingMinutes: number;
  visible: boolean;
}

/**
 * セッション終了前のトースト通知
 * ASD児に「もうすぐ おわるよ」と予告し、突然の終了に備えられるようにする。
 * 赤・Xマーク禁止。ポジティブな星色（黄）のアクセントを使用。
 */
export function SessionEndWarning({ remainingMinutes, visible }: SessionEndWarningProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="session-end-warning"
          initial={{ opacity: 0, y: -16, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -16, scale: 0.95 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="fixed top-16 left-1/2 z-50 -translate-x-1/2 pointer-events-none"
        >
          <div
            className="flex items-center gap-3 px-5 py-3 rounded-2xl shadow-lg"
            style={{
              background: 'rgba(20, 16, 36, 0.92)',
              border: '1px solid rgba(255, 212, 59, 0.35)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
            }}
          >
            <span className="text-2xl leading-none">⏳</span>
            <div className="flex flex-col">
              <span
                className="text-base font-bold leading-tight"
                style={{ color: '#FFD43B' }}
              >
                もうすぐ おわるよ
              </span>
              {remainingMinutes > 0 && (
                <span
                  className="text-xs leading-tight mt-0.5"
                  style={{ color: 'rgba(184, 184, 208, 0.8)' }}
                >
                  あと やく {remainingMinutes}ふん
                </span>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * セッション終了警告のタイミングを管理するフック
 * セッション残り時間に応じて警告を表示するかどうかを返す。
 * @param sessionDurationMs - 現在のセッション経過時間 (ms)
 * @param maxDurationMs - セッションの最大時間 (ms)
 * @param warnAtMs - 終了何ms前から警告するか（デフォルト: 60000 = 1分前）
 */
export function useSessionEndWarning(
  sessionDurationMs: number,
  maxDurationMs: number,
  warnAtMs: number = 60000,
): { showWarning: boolean; remainingMinutes: number } {
  const remainingMs = Math.max(0, maxDurationMs - sessionDurationMs);
  const showWarning = remainingMs > 0 && remainingMs <= warnAtMs;
  const remainingMinutes = Math.ceil(remainingMs / 60000);

  return { showWarning, remainingMinutes };
}

/**
 * 一定間隔でセッション終了警告を確認するフック
 * @param getElapsedMs - 経過時間を取得する関数
 * @param maxDurationMs - セッションの最大時間 (ms)
 * @param warnAtMs - 終了何ms前から警告するか（デフォルト: 60000）
 * @param pollIntervalMs - ポーリング間隔 (デフォルト: 5000)
 */
export function useSessionEndWarningPolled(
  getElapsedMs: () => number,
  maxDurationMs: number,
  warnAtMs: number = 60000,
  pollIntervalMs: number = 5000,
): { showWarning: boolean; remainingMinutes: number } {
  const [elapsed, setElapsed] = React.useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setElapsed(getElapsedMs());
    }, pollIntervalMs);
    return () => clearInterval(id);
  }, [getElapsedMs, pollIntervalMs]);

  return useSessionEndWarning(elapsed, maxDurationMs, warnAtMs);
}
