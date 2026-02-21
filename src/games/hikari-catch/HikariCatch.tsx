'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import Image from 'next/image';
import type { AgeGroup, TrialResponse } from '@/types';
import { GameShell } from '@/features/game-engine/GameShell';
import { useGameSession } from '@/features/game-engine/hooks/useGameSession';
import { TrialFeedback } from '@/components/feedback/TrialFeedback';
import { hikariCatchConfig } from './config';
import { generateHikariStimulus, getCreatureImagePath, type HikariStimulus, type HikariItem } from './stimuli';
import { nowMs } from '@/lib/utils';

interface HikariCatchProps {
  ageGroup: AgeGroup;
  maxTrials?: number;
}

type Phase = 'ready' | 'showing' | 'feedback' | 'waiting';

export default function HikariCatch({ ageGroup, maxTrials: maxTrialsProp }: HikariCatchProps) {
  const session = useGameSession({
    gameConfig: hikariCatchConfig,
    ageGroup,
  });

  const [phase, setPhase] = useState<Phase>('ready');
  const [stimulus, setStimulus] = useState<HikariStimulus | null>(null);
  const [feedbackCorrect, setFeedbackCorrect] = useState<boolean | null>(null);
  const [targetId, setTargetId] = useState<string>('');
  const maxTrials = maxTrialsProp ?? hikariCatchConfig.trial_count_range.max;
  const displayDuration = (session.difficulty.display_duration_ms as number) || 2000;
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Start next trial
  const nextTrial = useCallback(() => {
    if (session.totalTrials >= maxTrials) {
      session.endSession('completed');
      return;
    }

    const { stimulus: newStimulus, correctAnswer } = generateHikariStimulus(session.difficulty);
    setStimulus(newStimulus);
    setTargetId(correctAnswer.targetId);
    setPhase('showing');

    session.startTrial(
      newStimulus as unknown as Record<string, unknown>,
      correctAnswer as unknown as Record<string, unknown>,
    );
    session.presentStimulus();

    // Auto-hide after display duration (but keep items tappable)
    hideTimerRef.current = setTimeout(() => {
      // Items remain visible but this marks end of "fresh" display
    }, displayDuration);
  }, [session, maxTrials, displayDuration]);

  // Handle tap on item
  const handleTap = useCallback((item: HikariItem) => {
    if (phase !== 'showing') return;

    const response: TrialResponse = {
      type: 'tap',
      value: { tappedId: item.id, isTarget: item.isTarget },
      timestamp_ms: nowMs(),
    };

    session.recordResponse(response);

    const isCorrect = item.isTarget;
    const errorType = !isCorrect ? (item.isTarget ? null : 'commission' as const) : null;
    session.completeTrial(isCorrect, errorType);

    setFeedbackCorrect(isCorrect);
    setPhase('feedback');
  }, [phase, session]);

  // After feedback, go to next trial
  const handleFeedbackComplete = useCallback(() => {
    setFeedbackCorrect(null);
    setPhase('ready');
    // Small delay before next trial
    setTimeout(nextTrial, 500);
  }, [nextTrial]);

  // Auto-start first trial when session begins
  useEffect(() => {
    if (session.sessionId && phase === 'ready' && session.totalTrials === 0) {
      nextTrial();
    }
  }, [session.sessionId, phase, session.totalTrials, nextTrial]);

  // Cleanup timer
  useEffect(() => {
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, []);

  return (
    <GameShell gameName="ひかりキャッチ" gameId="hikari-catch" session={session} maxTrials={maxTrials}>
      {/* Target instruction */}
      <div className="mb-4 text-center">
        <span className="inline-flex items-center gap-2 text-lg font-medium text-cosmic-light">
          <Image src={getCreatureImagePath('star')} alt="" width={28} height={28} />
          をタップしよう!
        </span>
      </div>

      {/* Game area */}
      <div className="relative w-full max-w-md aspect-square rounded-3xl overflow-hidden"
           style={{ background: 'rgba(42,42,90,0.3)' }}>
        {phase === 'showing' && stimulus && stimulus.items.map((item) => (
          <button
            key={item.id}
            onClick={() => handleTap(item)}
            className="absolute tap-target-large rounded-full flex items-center justify-center
              transition-transform active:scale-90"
            style={{
              left: `${item.position.x}%`,
              top: `${item.position.y}%`,
              transform: 'translate(-50%, -50%)',
              width: '80px',
              height: '80px',
              background: item.isTarget ? 'rgba(108,60,225,0.2)' : 'rgba(42,42,90,0.3)',
              border: item.isTarget ? '3px solid rgba(108,60,225,0.4)' : '3px solid rgba(255,255,255,0.1)',
            }}
            aria-label={item.isTarget ? 'ターゲット' : ''}
          >
            <Image
              src={getCreatureImagePath(item.creature)}
              alt={item.creature}
              width={48}
              height={48}
            />
          </button>
        ))}

        {phase === 'ready' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xl text-cosmic-light">つぎの おともだちが くるよ...</span>
          </div>
        )}
      </div>

      {/* Feedback overlay */}
      {feedbackCorrect !== null && (
        <TrialFeedback
          isCorrect={feedbackCorrect}
          onComplete={handleFeedbackComplete}
        />
      )}
    </GameShell>
  );
}
