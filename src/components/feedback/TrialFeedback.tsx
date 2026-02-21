'use client';

import { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import Mogura from '@/components/mascot/Mogura';

interface TrialFeedbackProps {
  isCorrect: boolean;
  onComplete: () => void;
  durationMs?: number;
  /** 'nogo_correct' for inhibition success, 'big_reward' for streak/milestone */
  variant?: 'normal' | 'nogo_correct' | 'big_reward';
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
}: TrialFeedbackProps) {
  const [visible, setVisible] = useState(true);
  const [showMogura, setShowMogura] = useState(false);

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

      {/* Sound placeholder */}
      {/* console.log('Sound: correct.mp3') */}
    </div>
  );
}

/**
 * SessionCompleteFeedback - Shown when session ends
 * Rocket flies up + sparkle burst + star rating
 */
export function SessionCompleteFeedback({ onComplete }: { onComplete: () => void }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onComplete();
    }, 2000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      {/* Rocket flying up */}
      <div className="animate-rocket-fly fixed left-1/2 -translate-x-1/2 bottom-0">
        <Image src="/assets/rocket.png" alt="" width={60} height={60} />
      </div>

      {/* Sparkle burst at center */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (360 / 8) * i;
        const rad = (angle * Math.PI) / 180;
        const tx = Math.cos(rad) * 80;
        const ty = Math.sin(rad) * 80;
        return (
          <div
            key={i}
            className="absolute animate-particle-burst"
            style={{
              '--tx': `${tx * 0.5}px`,
              '--ty': `${ty * 0.5}px`,
              '--tx2': `${tx}px`,
              '--ty2': `${ty}px`,
              animationDelay: `${0.3 + i * 0.05}s`,
            } as React.CSSProperties}
          >
            <Image
              src="/assets/effects/effect-sparkle.png"
              alt=""
              width={24}
              height={24}
              className="pointer-events-none"
            />
          </div>
        );
      })}
    </div>
  );
}
