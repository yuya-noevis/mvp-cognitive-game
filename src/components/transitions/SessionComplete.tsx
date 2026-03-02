'use client';

import React from 'react';
import { motion } from 'framer-motion';

export interface SessionCompleteProps {
  /** 今日プレイしたゲーム数 */
  gameCount: number;
  /** 獲得スター数（1〜3） */
  starCount: number;
  /** 正解数 */
  totalCorrect: number;
  /** 総試行数 */
  totalAttempts: number;
  /** ホーム画面へ戻るボタンのコールバック（自動遷移なし） */
  onGoHome: () => void;
}

function StarDisplay({ count }: { count: number }) {
  return (
    <div className="flex gap-3 justify-center" role="img" aria-label={`${count}つぼし`}>
      {[1, 2, 3].map((i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, scale: 0, rotate: -30 }}
          animate={
            i <= count
              ? { opacity: 1, scale: 1, rotate: 0 }
              : { opacity: 0.18, scale: 0.8, rotate: 0 }
          }
          transition={{
            delay: 0.3 + i * 0.2,
            duration: 0.45,
            type: 'spring',
            stiffness: 200,
            damping: 14,
          }}
          className="text-5xl leading-none select-none"
          style={{ color: i <= count ? '#FFD43B' : 'rgba(255, 255, 255, 0.15)' }}
        >
          ★
        </motion.span>
      ))}
    </div>
  );
}

function getEncouragementMessage(starCount: number): string {
  if (starCount >= 3) return 'すごい！かんぺき！';
  if (starCount >= 2) return 'よく がんばったね！';
  return 'いっしょに がんばろう！';
}

/**
 * セッション完了画面
 * - 「よく がんばったね！」などポジティブメッセージ
 * - 今日プレイしたゲーム数と獲得スター
 * - 「またあした」ボタン（手動タップまで表示し続ける）
 * - 自動遷移なし（ASD児が自分のペースで完了を認識できるよう）
 * - 赤・Xマーク禁止、紫系ブランドカラー使用
 */
export function SessionComplete({
  gameCount,
  starCount,
  totalCorrect,
  totalAttempts,
  onGoHome,
}: SessionCompleteProps) {
  const message = getEncouragementMessage(starCount);

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center p-6 bg-space"
      role="main"
    >
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center gap-7 max-w-sm w-full"
      >
        {/* 星表示 */}
        <StarDisplay count={starCount} />

        {/* メッセージ */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0, duration: 0.4 }}
          className="text-3xl font-bold text-center"
          style={{ color: '#E8E8F0' }}
        >
          {message}
        </motion.p>

        {/* 今日のプレイ統計 */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.35 }}
          className="flex flex-col items-center gap-3 w-full"
        >
          {/* ゲーム数 */}
          <div
            className="flex items-center gap-3 px-5 py-3 rounded-2xl w-full justify-center"
            style={{ background: 'rgba(108, 60, 225, 0.18)', border: '1px solid rgba(108, 60, 225, 0.3)' }}
          >
            <span className="text-2xl leading-none">🎮</span>
            <span className="text-lg font-bold" style={{ color: '#B8B8D0' }}>
              きょう {gameCount}つの ゲームを あそんだよ
            </span>
          </div>

          {/* 正解数 */}
          {totalAttempts > 0 && (
            <div
              className="flex items-center gap-3 px-5 py-3 rounded-2xl w-full justify-center"
              style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.08)' }}
            >
              <span className="text-2xl leading-none">✨</span>
              <span className="text-base" style={{ color: '#B8B8D0' }}>
                {totalCorrect} / {totalAttempts} もん せいかい
              </span>
            </div>
          )}
        </motion.div>

        {/* 「またあした」ボタン（自動遷移なし）*/}
        <motion.button
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.4 }}
          onClick={onGoHome}
          className="w-full py-5 rounded-3xl text-xl font-bold transition-transform active:scale-95 mt-2"
          style={{
            background: 'linear-gradient(135deg, #6C3CE1 0%, #8B5CF6 100%)',
            color: '#fff',
            boxShadow: '0 4px 24px rgba(108, 60, 225, 0.4)',
          }}
          aria-label="またあした"
        >
          またあした
        </motion.button>
      </motion.div>
    </div>
  );
}

/**
 * セッション結果からスター数を算出するユーティリティ
 */
export function calcStarCount(accuracy: number): number {
  if (accuracy >= 0.9) return 3;
  if (accuracy >= 0.7) return 2;
  return 1;
}
