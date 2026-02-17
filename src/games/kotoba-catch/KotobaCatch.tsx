'use client';

import React, { useState, useCallback, useEffect } from 'react';
import type { AgeGroup, TrialResponse } from '@/types';
import { GameShell } from '@/features/game-engine/GameShell';
import { useGameSession } from '@/features/game-engine/hooks/useGameSession';
import { TrialFeedback } from '@/components/feedback/TrialFeedback';
import { VocabIcon } from '@/components/icons';
import { kotobaCatchConfig } from './config';
import { generateVocabTrial, speakWord, type VocabTrial } from './stimuli';
import { nowMs } from '@/lib/utils';

interface KotobaCatchProps {
  ageGroup: AgeGroup;
  stageMode?: boolean;
  maxTrials?: number;
  onStageComplete?: (accuracy: number) => void;
}

type Phase = 'ready' | 'listening' | 'choosing' | 'feedback';

export default function KotobaCatch({ ageGroup, stageMode, maxTrials: stageModeTrials, onStageComplete }: KotobaCatchProps) {
  const session = useGameSession({ gameConfig: kotobaCatchConfig, ageGroup });

  const [phase, setPhase] = useState<Phase>('ready');
  const [trial, setTrial] = useState<VocabTrial | null>(null);
  const [feedbackCorrect, setFeedbackCorrect] = useState<boolean | null>(null);

  const effectiveMaxTrials = stageModeTrials ?? kotobaCatchConfig.trial_count_range.max;
  const wordCategory = (session.difficulty.word_category as string) || 'basic_noun';
  const choiceCount = (session.difficulty.choice_count as number) || 2;

  const nextTrial = useCallback(() => {
    if (session.totalTrials >= effectiveMaxTrials) {
      session.endSession('completed');
      return;
    }

    const newTrial = generateVocabTrial(wordCategory, choiceCount);
    setTrial(newTrial);
    setPhase('listening');

    session.startTrial(
      { word: newTrial.targetWord, category: wordCategory, choice_count: choiceCount },
      { target_word: newTrial.targetWord },
    );
    session.presentStimulus();

    // Speak the word
    speakWord(newTrial.targetWord);

    // After a brief delay, allow choosing
    setTimeout(() => setPhase('choosing'), 1500);
  }, [session, effectiveMaxTrials, wordCategory, choiceCount]);

  const handleReplay = useCallback(() => {
    if (trial) speakWord(trial.targetWord);
  }, [trial]);

  const handleSelect = useCallback((choice: VocabTrial['choices'][0]) => {
    if (phase !== 'choosing') return;

    const response: TrialResponse = {
      type: 'select',
      value: { selected: choice.word, isCorrect: choice.isCorrect },
      timestamp_ms: nowMs(),
    };
    session.recordResponse(response);

    const isCorrect = choice.isCorrect;
    session.completeTrial(isCorrect, isCorrect ? null : 'selection');

    setFeedbackCorrect(isCorrect);
    setPhase('feedback');
  }, [phase, session]);

  const handleFeedbackComplete = useCallback(() => {
    setFeedbackCorrect(null);
    setPhase('ready');
    setTimeout(nextTrial, 600);
  }, [nextTrial]);

  useEffect(() => {
    if (session.sessionId && phase === 'ready' && session.totalTrials === 0) {
      nextTrial();
    }
  }, [session.sessionId, phase, session.totalTrials, nextTrial]);

  return (
    <GameShell gameName="ことばキャッチ" session={session}
               stageMode={stageMode} maxTrials={effectiveMaxTrials} onStageComplete={onStageComplete}>
      <div className="flex flex-col items-center w-full max-w-md">
        {/* Listening phase */}
        {(phase === 'listening' || phase === 'choosing') && trial && (
          <>
            <div className="text-center mb-6">
              <button
                onClick={handleReplay}
                className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-2
                  active:scale-95 transition-all"
                style={{ background: 'var(--color-primary-bg)' }}
              >
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                  style={{ color: '#8B5CF6' }}>
                  <polygon points="11,5 6,9 2,9 2,15 6,15 11,19" fill="currentColor" fillOpacity={0.2} />
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                </svg>
              </button>
              <p className="text-lg font-bold" style={{ color: 'var(--color-primary-dark)' }}>
                「{trial.targetWord}」
              </p>
              <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
                {phase === 'listening' ? 'きいてね...' : 'どの えかな？'}
              </p>
            </div>

            {/* Choices */}
            <div className={`grid gap-4 ${choiceCount <= 2 ? 'grid-cols-2' : 'grid-cols-2'}`}>
              {trial.choices.map(choice => (
                <button
                  key={choice.id}
                  onClick={() => handleSelect(choice)}
                  disabled={phase !== 'choosing'}
                  className={`tap-target-large aspect-square rounded-2xl flex flex-col items-center justify-center
                    border-4 transition-all active:scale-95
                    ${phase === 'choosing' ? '' : 'opacity-60'}`}
                  style={{
                    background: 'var(--color-surface)',
                    borderColor: 'var(--color-border-light)',
                  }}
                >
                  <VocabIcon word={choice.word} size={64} style={{ color: 'var(--color-primary)' }} />
                </button>
              ))}
            </div>
          </>
        )}

        {phase === 'ready' && (
          <span className="text-2xl" style={{ color: 'var(--color-text-muted)' }}>
            じゅんびちゅう...
          </span>
        )}
      </div>

      {feedbackCorrect !== null && (
        <TrialFeedback isCorrect={feedbackCorrect} onComplete={handleFeedbackComplete} />
      )}
    </GameShell>
  );
}
