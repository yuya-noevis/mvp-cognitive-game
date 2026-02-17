'use client';

import { useEffect, useState } from 'react';
import { StarIcon, SparkleIcon } from '@/components/icons';
import { ManasFace } from '@/components/mascot/ManasCharacter';

interface TrialFeedbackProps {
  isCorrect: boolean;
  onComplete: () => void;
  durationMs?: number;
}

/**
 * TrialFeedback - トライアル後のフィードバック
 *
 * 安全設計：
 * - 正答：マスコットが喜ぶ + 星エフェクト → 変動比率強化スケジュール (Skinner)
 * - 誤答：マスコットが励ます → 自己効力感の保護 (Bandura, 1977)
 * - 赤色・×マーク・否定語は使用禁止 → 不安・フラストレーション回避
 * - アニメーションは穏やか → 感覚過敏への配慮
 */
export function TrialFeedback({
  isCorrect,
  onComplete,
  durationMs = 1200,
}: TrialFeedbackProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onComplete();
    }, durationMs);
    return () => clearTimeout(timer);
  }, [durationMs, onComplete]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
         style={{ background: isCorrect ? 'rgba(88, 204, 2, 0.06)' : 'rgba(28, 176, 246, 0.05)' }}>
      <div className="flex flex-col items-center animate-pop-in">
        {isCorrect ? (
          <>
            {/* Success: mascot celebrates with stars */}
            <div className="relative">
              <ManasFace expression="excited" size={72} className="animate-success-pop" />
              {/* Star particles */}
              <span className="absolute -top-3 -left-4 opacity-70 animate-float">
                <StarIcon size={22} style={{ color: '#FFC800' }} />
              </span>
              <span className="absolute -top-2 -right-5 opacity-50 animate-float" style={{ animationDelay: '0.2s' }}>
                <SparkleIcon size={18} style={{ color: '#FFC800' }} />
              </span>
              <span className="absolute -bottom-1 -right-3 opacity-40 animate-float" style={{ animationDelay: '0.4s' }}>
                <StarIcon size={14} style={{ color: '#58CC02' }} />
              </span>
            </div>
            <span className="mt-2 text-xl font-bold animate-fade-in-up"
                  style={{ color: '#FFC800', animationDelay: '100ms' }}>
              すごい！
            </span>
          </>
        ) : (
          <>
            {/* Retry: mascot encourages, no negative cues */}
            <ManasFace expression="encouraging" size={64} className="animate-wiggle" />
            <span className="mt-2 text-lg font-medium animate-fade-in-up"
                  style={{ color: '#1CB0F6', animationDelay: '100ms' }}>
              もういちど！
            </span>
          </>
        )}
      </div>
    </div>
  );
}
