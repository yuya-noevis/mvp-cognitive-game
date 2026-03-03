'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import Image from 'next/image';
import Mogura from '@/components/mascot/Mogura';
import { useFeedbackContext } from '@/features/feedback/FeedbackContext';

interface TrialFeedbackProps {
  isCorrect: boolean;
  onComplete: () => void;
  durationMs?: number;
  /** 'nogo_correct' for inhibition success, 'big_reward' for streak/milestone */
  variant?: 'normal' | 'nogo_correct' | 'big_reward';
  /** ニアミス判定結果（不正解時にtrueなら「おしい！」フィードバックを表示） */
  isNearMiss?: boolean;
  /** ニアミス時のカスタムメッセージ */
  nearMissMessage?: string | null;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  angle: number;
  distance: number;
  delay: number;
}

function generateParticles(count: number, spread: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: 0,
    y: 0,
    size: 30 + Math.random() * 20,
    angle: (360 / count) * i + (Math.random() - 0.5) * 30,
    distance: spread * 0.6 + Math.random() * spread * 0.4,
    delay: Math.random() * 0.1,
  }));
}

/**
 * TrialFeedback - Image-based particle effects
 *
 * Correct (normal): effect-star.png particles radiate from center
 * Correct (big_reward): stars + confetti fall + Mogura(excited) popup
 * NoGo correct: effect-heart.png particles + Mogura(clapping) popup
 * Incorrect: shake animation only, no negative cues
 */
export function TrialFeedback({
  isCorrect,
  onComplete,
  durationMs = 1200,
  variant = 'normal',
  isNearMiss = false,
  nearMissMessage,
}: TrialFeedbackProps) {
  const [visible, setVisible] = useState(true);
  const [showMogura, setShowMogura] = useState(false);
  const feedback = useFeedbackContext();
  const feedbackTriggered = useRef(false);

  // マウント時にフィードバック（音・振動）をトリガー（1回のみ）
  useEffect(() => {
    if (feedbackTriggered.current || !feedback) return;
    feedbackTriggered.current = true;
    if (isCorrect) {
      feedback.triggerCorrect();
    } else if (isNearMiss) {
      feedback.triggerNearMiss();
    } else {
      feedback.triggerIncorrect();
    }
  }, [isCorrect, isNearMiss, feedback]);

  const particles = useMemo(() => {
    if (!isCorrect) return [];
    if (variant === 'nogo_correct') return generateParticles(5, 100);
    if (variant === 'big_reward') return generateParticles(8, 120);
    return generateParticles(6, 100);
  }, [isCorrect, variant]);

  const confettiPieces = useMemo(() => {
    if (!isCorrect || variant !== 'big_reward') return [];
    return Array.from({ length: 10 }, (_, i) => ({
      id: i,
      left: `${10 + Math.random() * 80}%`,
      delay: `${Math.random() * 0.5}s`,
      size: 20 + Math.random() * 15,
    }));
  }, [isCorrect, variant]);

  useEffect(() => {
    if (isCorrect && (variant === 'big_reward' || variant === 'nogo_correct')) {
      const moguraTimer = setTimeout(() => setShowMogura(true), 200);
      return () => clearTimeout(moguraTimer);
    }
  }, [isCorrect, variant]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onComplete();
    }, durationMs);
    return () => clearTimeout(timer);
  }, [durationMs, onComplete]);

  if (!visible) return null;

  // Near-miss: 「おしい！」フィードバック（黄色グロー + 励ましメッセージ）
  if (!isCorrect && isNearMiss) {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
        {/* 黄色グロー背景 */}
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle at 50% 50%, rgba(255, 212, 59, 0.15) 0%, transparent 60%)',
          }}
        />
        {/* 「おしい！」テキスト */}
        <div className="flex flex-col items-center gap-2 animate-fade-in-up">
          <span
            className="text-3xl font-bold"
            style={{ color: '#FFD43B', textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}
          >
            おしい！
          </span>
          {nearMissMessage && (
            <span
              className="text-base font-medium"
              style={{ color: '#F0F0FF', textShadow: '0 1px 4px rgba(0,0,0,0.3)' }}
            >
              {nearMissMessage}
            </span>
          )}
        </div>
      </div>
    );
  }

  // Incorrect: just shake, nothing else
  if (!isCorrect) {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
        <div className="animate-shake w-16 h-16 rounded-full bg-galaxy-light opacity-30" />
      </div>
    );
  }

  const particleImage = variant === 'nogo_correct'
    ? '/assets/effects/effect-heart.png'
    : '/assets/effects/effect-star.png';

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      {/* Radial glow */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(255, 212, 59, 0.12) 0%, transparent 60%)',
        }}
      />

      {/* Star/Heart particles radiating from center */}
      {particles.map((p) => {
        const rad = (p.angle * Math.PI) / 180;
        const tx = Math.cos(rad) * p.distance;
        const ty = Math.sin(rad) * p.distance;
        return (
          <div
            key={p.id}
            className="absolute animate-particle-burst"
            style={{
              '--tx': `${tx * 0.6}px`,
              '--ty': `${ty * 0.6}px`,
              '--tx2': `${tx}px`,
              '--ty2': `${ty}px`,
              animationDelay: `${p.delay}s`,
            } as React.CSSProperties}
          >
            <Image
              src={particleImage}
              alt=""
              width={p.size}
              height={p.size}
              className="pointer-events-none"
            />
          </div>
        );
      })}

      {/* Confetti fall (big_reward only) */}
      {confettiPieces.map((c) => (
        <div
          key={c.id}
          className="absolute top-0 animate-confetti-fall"
          style={{
            left: c.left,
            animationDelay: c.delay,
          }}
        >
          <Image
            src="/assets/effects/effect-confetti.png"
            alt=""
            width={c.size}
            height={c.size}
            className="pointer-events-none"
          />
        </div>
      ))}

      {/* Mogura popup (big_reward or nogo_correct) */}
      {showMogura && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 animate-pop-in z-50 pointer-events-none">
          <Mogura
            expression={variant === 'nogo_correct' ? 'clapping' : 'excited'}
            size={80}
          />
        </div>
      )}

      {/* Sound/vibration handled by FeedbackContext */}
    </div>
  );
}

/**
 * SessionCompleteFeedback - セッション完了時の演出
 *
 * 設計書v3仕様:
 * - 「よく がんばったね！」メッセージ
 * - プレイしたゲーム数・獲得スター表示
 * - Moguraの拍手アニメーション
 * - 自動遷移なし（「もどる」ボタンでユーザーが制御）
 * - ティア連動の視覚強度
 */
interface SessionCompleteFeedbackProps {
  /** プレイしたゲーム数 */
  gameCount?: number;
  /** 獲得スター数（1〜3） */
  starCount?: number;
  /** 視覚強度（ティアに連動） */
  intensity?: 'subtle' | 'standard' | 'vivid';
  /** もどるボタンのコールバック */
  onBack: () => void;
}

export function SessionCompleteFeedback({
  gameCount = 1,
  starCount = 3,
  intensity = 'standard',
  onBack,
}: SessionCompleteFeedbackProps) {
  // コンフェッティ (vivid のみ)
  const confetti = useMemo(() => {
    if (intensity !== 'vivid') return [];
    return Array.from({ length: 14 }, (_, i) => ({
      id: i,
      left: `${5 + Math.random() * 90}%`,
      delay: `${Math.random() * 0.6}s`,
      size: 16 + Math.random() * 14,
      rotation: Math.random() * 720,
    }));
  }, [intensity]);

  // 星スパークル（standard + vivid）
  const sparkles = useMemo(() => {
    if (intensity === 'subtle') return [];
    const count = intensity === 'vivid' ? 8 : 5;
    return Array.from({ length: count }, (_, i) => {
      const angle = (360 / count) * i;
      const rad = (angle * Math.PI) / 180;
      const dist = intensity === 'vivid' ? 110 : 80;
      return {
        id: i,
        tx: Math.cos(rad) * dist,
        ty: Math.sin(rad) * dist,
        delay: `${i * 0.06}s`,
        size: 20 + Math.random() * 12,
      };
    });
  }, [intensity]);

  const clampedStars = Math.min(3, Math.max(0, starCount));

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center z-[70]"
      style={{
        background: 'linear-gradient(180deg, #0D0D2B 0%, #1A1A4A 50%, #0D0D2B 100%)',
      }}
    >
      {/* コンフェッティ（vivid のみ） */}
      {confetti.map((c) => (
        <div
          key={c.id}
          className="absolute top-0 animate-confetti-fall pointer-events-none"
          style={{
            left: c.left,
            animationDelay: c.delay,
          }}
        >
          <Image
            src="/assets/effects/effect-confetti.png"
            alt=""
            width={c.size}
            height={c.size}
          />
        </div>
      ))}

      {/* Mogura 拍手アニメーション */}
      <div className="animate-pop-in mb-4">
        <Mogura expression="clapping" size={120} />
      </div>

      {/* メインメッセージ */}
      <h2
        className="text-2xl font-bold mb-2 animate-fade-in-up"
        style={{ color: '#F0F0FF', animationDelay: '150ms' }}
      >
        よく がんばったね！
      </h2>

      {/* プレイ情報 */}
      <p
        className="text-base mb-6 animate-fade-in-up"
        style={{ color: '#B8B8D0', animationDelay: '250ms' }}
      >
        きょう <span style={{ color: '#FFD43B', fontWeight: 'bold' }}>{gameCount}</span> こ あそんだよ！
      </p>

      {/* スター表示 */}
      <div
        className="flex items-center justify-center gap-2 mb-8 animate-fade-in-up"
        style={{ animationDelay: '350ms' }}
      >
        {[1, 2, 3].map((star) => (
          <div
            key={star}
            className={star <= clampedStars ? 'animate-pop-in' : ''}
            style={{ animationDelay: `${350 + star * 80}ms` }}
          >
            {/* 星スパークル（star === 2 中央から放射） */}
            {star === 2 && sparkles.map((s) => (
              <div
                key={s.id}
                className="absolute animate-particle-burst pointer-events-none"
                style={{
                  '--tx': `${s.tx * 0.5}px`,
                  '--ty': `${s.ty * 0.5}px`,
                  '--tx2': `${s.tx}px`,
                  '--ty2': `${s.ty}px`,
                  animationDelay: s.delay,
                } as React.CSSProperties}
              >
                <Image
                  src="/assets/effects/effect-star.png"
                  alt=""
                  width={s.size}
                  height={s.size}
                />
              </div>
            ))}
            <svg
              width={star <= clampedStars ? 48 : 36}
              height={star <= clampedStars ? 48 : 36}
              viewBox="0 0 24 24"
              fill={star <= clampedStars ? '#FFD43B' : 'rgba(255,255,255,0.12)'}
              style={{
                filter: star <= clampedStars ? 'drop-shadow(0 0 8px rgba(255,212,59,0.6))' : 'none',
                transition: 'all 0.3s ease',
              }}
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </div>
        ))}
      </div>

      {/* ロケット装飾（standard / vivid） */}
      {intensity !== 'subtle' && (
        <div className="animate-rocket-fly fixed left-1/2 -translate-x-1/2 bottom-0 z-20 pointer-events-none">
          <Image src="/assets/rocket.png" alt="" width={60} height={60} />
        </div>
      )}

      {/* もどるボタン（自動遷移なし） */}
      <button
        onClick={onBack}
        className="btn-comet px-14 py-5 text-lg rounded-2xl tap-interactive active:translate-y-[2px] active:shadow-sm transition-all duration-150 animate-fade-in-up"
        style={{ animationDelay: '500ms' }}
      >
        もどる
      </button>
    </div>
  );
}
