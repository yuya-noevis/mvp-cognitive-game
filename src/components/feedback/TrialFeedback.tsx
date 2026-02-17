'use client';

import { useEffect, useState } from 'react';
import { StarIcon, SparkleIcon } from '@/components/icons';
import { LunaFaceOnly } from '@/components/mascot/Luna';

interface TrialFeedbackProps {
  isCorrect: boolean;
  onComplete: () => void;
  durationMs?: number;
}

/**
 * TrialFeedback - 宇宙テーマのトライアル後フィードバック
 *
 * 安全設計：
 * - 正答：星パーティクル + 金色グロー → 変動比率強化スケジュール (Skinner)
 * - 誤答：軽い揺れ + 励まし → 自己効力感の保護 (Bandura, 1977)
 * - 赤色・×マーク・否定語は使用禁止
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
         style={{
           background: isCorrect
             ? 'radial-gradient(circle at 50% 50%, rgba(255, 212, 59, 0.1) 0%, transparent 70%)'
             : 'radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.08) 0%, transparent 70%)',
         }}>
      <div className="flex flex-col items-center animate-pop-in">
        {isCorrect ? (
          <>
            {/* Success: Luna celebrates with star particles */}
            <div className="relative">
              <LunaFaceOnly expression="excited" size={72} className="animate-success-pop" />
              {/* Star particles */}
              <span className="absolute -top-3 -left-4 opacity-70 animate-float">
                <StarIcon size={22} style={{ color: '#FFD43B' }} />
              </span>
              <span className="absolute -top-2 -right-5 opacity-50 animate-float" style={{ animationDelay: '0.2s' }}>
                <SparkleIcon size={18} style={{ color: '#FFD43B' }} />
              </span>
              <span className="absolute -bottom-1 -right-3 opacity-40 animate-float" style={{ animationDelay: '0.4s' }}>
                <StarIcon size={14} style={{ color: '#8B5CF6' }} />
              </span>
              {/* Golden glow ring */}
              <div
                className="absolute inset-[-8px] rounded-full animate-gentle-pulse"
                style={{
                  boxShadow: '0 0 20px rgba(255, 212, 59, 0.3), 0 0 40px rgba(255, 212, 59, 0.1)',
                }}
              />
            </div>
            <span className="mt-2 text-xl font-bold animate-fade-in-up"
                  style={{ color: '#FFD43B', animationDelay: '100ms' }}>
              すごい！
            </span>
          </>
        ) : (
          <>
            {/* Retry: Luna encourages with gentle shake, no negative cues */}
            <LunaFaceOnly expression="encouraging" size={64} className="animate-wiggle" />
            <span className="mt-2 text-lg font-medium animate-fade-in-up"
                  style={{ color: '#8B5CF6', animationDelay: '100ms' }}>
              もういちど！
            </span>
          </>
        )}
      </div>
    </div>
  );
}
