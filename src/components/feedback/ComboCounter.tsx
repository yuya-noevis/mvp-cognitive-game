'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useFeedbackContext } from '@/features/feedback/FeedbackContext';

/**
 * ComboCounter — ゲーム中のコンボカウンター表示
 *
 * 2連続正解以上で表示。3連続/5連続で特別スタイル。
 * GameShellヘッダーに配置。
 */
export function ComboCounter() {
  const feedback = useFeedbackContext();
  const combo = feedback?.consecutiveCorrect ?? 0;

  // 2連続以上でのみ表示
  const visible = combo >= 2;

  // 5連続以上: ゴールド、3連続以上: パープル、その他: シアン
  const color = combo >= 5 ? '#FFD43B' : combo >= 3 ? '#8B5CF6' : '#4ECDC4';
  const glowColor = combo >= 5 ? 'rgba(255, 212, 59, 0.4)' : combo >= 3 ? 'rgba(139, 92, 246, 0.3)' : 'rgba(78, 205, 196, 0.2)';

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key={combo}
          initial={{ scale: 0.5, opacity: 0, y: -4 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.5, opacity: 0, y: 4 }}
          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          className="flex items-center gap-1 px-2 py-0.5 rounded-full"
          style={{
            background: glowColor,
            boxShadow: `0 0 8px ${glowColor}`,
          }}
          aria-label={`${combo}連続正解`}
          role="status"
          aria-live="polite"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill={color} aria-hidden="true">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          <span
            className="text-xs font-bold"
            style={{ color }}
          >
            x{combo}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
