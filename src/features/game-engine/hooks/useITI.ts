'use client';

/**
 * useITI - 試行間インターバル（ITI）管理フック
 *
 * ゲームのトライアル完了後に次のトライアルを開始するまでの
 * 待機時間を障害種別に応じて自動的に設定する。
 *
 * 使用方法:
 * ```tsx
 * const { isITIActive, startITI, itiMs } = useITI(disabilityType);
 *
 * // トライアル完了時
 * function handleAnswer(isCorrect: boolean) {
 *   session.completeTrial(isCorrect);
 *   startITI(() => {
 *     // ITI完了後: 次のトライアルを開始
 *     nextTrial();
 *   });
 * }
 *
 * // ITI中はボタンを非活性化
 * if (isITIActive) return <LoadingSpinner />;
 * ```
 */

import { useState, useCallback, useRef } from 'react';
import type { DisabilityType } from '@/features/dda/disability-profile';
import { getITI } from '@/features/dda/iti-config';

export interface UseITIResult {
  /** ITI中かどうか */
  isITIActive: boolean;
  /** 現在のITI時間（ms）—表示・プログレスバー用 */
  itiMs: number;
  /**
   * ITIを開始する。onComplete は ITI 終了後に呼ばれる。
   * ITI中に再呼び出しされた場合は前のタイマーをキャンセルして再開。
   */
  startITI: (onComplete: () => void) => void;
  /** ITIをキャンセルする（アンマウント時など） */
  cancelITI: () => void;
}

export function useITI(disabilityType?: DisabilityType): UseITIResult {
  const [isITIActive, setIsITIActive] = useState(false);
  const [itiMs, setItiMs] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelITI = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setIsITIActive(false);
    setItiMs(0);
  }, []);

  const startITI = useCallback((onComplete: () => void) => {
    // Cancel any existing ITI
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
    }

    const ms = getITI(disabilityType);
    setItiMs(ms);
    setIsITIActive(true);

    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      setIsITIActive(false);
      setItiMs(0);
      onComplete();
    }, ms);
  }, [disabilityType]);

  return { isITIActive, itiMs, startITI, cancelITI };
}
