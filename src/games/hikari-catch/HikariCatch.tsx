'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import type { AgeGroup, TrialResponse } from '@/types';
import { GameShell } from '@/features/game-engine/GameShell';
import { useGameSession } from '@/features/game-engine/hooks/useGameSession';
import { TrialFeedback } from '@/components/feedback/TrialFeedback';
import { hikariCatchConfig } from './config';
import { generateHikariStimulus, type HikariStimulus, type HikariItem } from './stimuli';
import { nowMs } from '@/lib/utils';
import { HikariCatchIcons } from '@/components/icons';

interface HikariCatchProps {
  ageGroup: AgeGroup;
  maxTrials?: number;
}

const COLOR_CLASSES: Record<string, string> = {
  yellow: 'bg-yellow-200 border-yellow-400',
  blue: 'bg-blue-200 border-blue-400',
  green: 'bg-green-200 border-green-400',
  pink: 'bg-pink-200 border-pink-400',
};

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
    <GameShell gameName="ひかりキャッチ" session={session} maxTrials={maxTrials}>
      {/* Target instruction */}
      <div className="mb-4 text-center">
        <span className="inline-flex items-center gap-1 text-lg text-indigo-600 font-medium">
          {(() => { const ButterflyIcon = HikariCatchIcons.butterfly; return <ButterflyIcon size={24} />; })()}
          をタップしよう！
        </span>
      </div>

      {/* Game area */}
      <div className="relative w-full max-w-md aspect-square bg-indigo-50 rounded-3xl overflow-hidden">
        {phase === 'showing' && stimulus && stimulus.items.map((item) => (
          <button
            key={item.id}
            onClick={() => handleTap(item)}
            className={`absolute tap-target-large rounded-full border-4 flex items-center justify-center
              transition-transform active:scale-90
              ${COLOR_CLASSES[item.color] || 'bg-gray-200 border-gray-400'}`}
            style={{
              left: `${item.position.x}%`,
              top: `${item.position.y}%`,
              transform: 'translate(-50%, -50%)',
              width: '80px',
              height: '80px',
            }}
            aria-label={item.isTarget ? 'ターゲット' : ''}
          >
            {(() => {
              const CreatureIcon = HikariCatchIcons[item.creature];
              return CreatureIcon ? <CreatureIcon size={32} /> : <span>?</span>;
            })()}
          </button>
        ))}

        {phase === 'ready' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl text-indigo-300">つぎの おともだちが くるよ...</span>
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
