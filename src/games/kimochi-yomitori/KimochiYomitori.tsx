'use client';

import React, { useState, useCallback, useEffect } from 'react';
import type { AgeGroup, TrialResponse } from '@/types';
import { GameShell } from '@/features/game-engine/GameShell';
import { useGameSession } from '@/features/game-engine/hooks/useGameSession';
import { TrialFeedback } from '@/components/feedback/TrialFeedback';
import { KimochiYomitoriIcons } from '@/components/icons';
import { kimochiYomitoriConfig } from './config';
import { nowMs, shuffle, randomInt } from '@/lib/utils';

interface KimochiYomitoriProps {
  ageGroup: AgeGroup;
  stageMode?: boolean;
  maxTrials?: number;
  onStageComplete?: (accuracy: number) => void;
}

type Phase = 'ready' | 'showing' | 'feedback';

// 基本6感情 (Ekman, 1992) + SVG face icons
interface Emotion {
  id: string;
  iconKey: string;      // KimochiYomitoriIcons key
  label: string;        // 日本語ラベル
  labelKana: string;    // ひらがな
  group: 'positive' | 'negative' | 'neutral'; // for distance calculation
}

const EMOTIONS: Emotion[] = [
  { id: 'happy', iconKey: 'happy', label: '喜び', labelKana: 'うれしい', group: 'positive' },
  { id: 'sad', iconKey: 'sad', label: '悲しみ', labelKana: 'かなしい', group: 'negative' },
  { id: 'angry', iconKey: 'angry', label: '怒り', labelKana: 'おこってる', group: 'negative' },
  { id: 'surprised', iconKey: 'surprised', label: '驚き', labelKana: 'びっくり', group: 'neutral' },
  { id: 'afraid', iconKey: 'scared', label: '恐れ', labelKana: 'こわい', group: 'negative' },
  { id: 'disgusted', iconKey: 'disgusted', label: '嫌悪', labelKana: 'いやだ', group: 'negative' },
];

// Emotion distance groups (for DDA)
function getEmotionDistance(a: Emotion, b: Emotion): 'far' | 'mid' | 'close' {
  if (a.group !== b.group) return 'far';
  return 'close';
}

function generateEmotionTrial(
  choiceCount: number,
  emotionDistance: string,
): { target: Emotion; choices: { id: string; emotion: Emotion; isCorrect: boolean }[] } {
  const target = EMOTIONS[randomInt(0, EMOTIONS.length - 1)];

  // Select distractors based on distance preference
  let distractorPool = EMOTIONS.filter(e => e.id !== target.id);

  if (emotionDistance === 'far') {
    distractorPool = distractorPool.filter(e => e.group !== target.group);
    if (distractorPool.length < choiceCount - 1) {
      distractorPool = EMOTIONS.filter(e => e.id !== target.id);
    }
  } else if (emotionDistance === 'close') {
    const closeEmotions = distractorPool.filter(e => e.group === target.group);
    if (closeEmotions.length >= choiceCount - 1) {
      distractorPool = closeEmotions;
    }
  }

  const distractors = shuffle(distractorPool).slice(0, choiceCount - 1);

  const choices = shuffle([
    { id: `correct_${randomInt(0, 9999)}`, emotion: target, isCorrect: true },
    ...distractors.map((e, i) => ({
      id: `dist_${i}_${randomInt(0, 9999)}`,
      emotion: e,
      isCorrect: false,
    })),
  ]);

  return { target, choices };
}

export default function KimochiYomitori({ ageGroup, stageMode, maxTrials: stageModeTrials, onStageComplete }: KimochiYomitoriProps) {
  const session = useGameSession({ gameConfig: kimochiYomitoriConfig, ageGroup });

  const [phase, setPhase] = useState<Phase>('ready');
  const [targetEmotion, setTargetEmotion] = useState<Emotion | null>(null);
  const [choices, setChoices] = useState<{ id: string; emotion: Emotion; isCorrect: boolean }[]>([]);
  const [feedbackCorrect, setFeedbackCorrect] = useState<boolean | null>(null);

  const effectiveMaxTrials = stageModeTrials ?? kimochiYomitoriConfig.trial_count_range.max;
  const choiceCount = (session.difficulty.choice_count as number) || 2;
  const emotionDistance = (session.difficulty.emotion_distance as string) || 'far';

  const nextTrial = useCallback(() => {
    if (session.totalTrials >= effectiveMaxTrials) {
      session.endSession('completed');
      return;
    }

    const { target, choices: newChoices } = generateEmotionTrial(choiceCount, emotionDistance);
    setTargetEmotion(target);
    setChoices(newChoices);
    setPhase('showing');

    session.startTrial(
      { target_emotion: target.id, choice_count: choiceCount },
      { correct_emotion: target.id },
    );
    session.presentStimulus();
  }, [session, effectiveMaxTrials, choiceCount, emotionDistance]);

  const handleSelect = useCallback((choice: typeof choices[0]) => {
    if (phase !== 'showing') return;

    const response: TrialResponse = {
      type: 'select',
      value: { selected: choice.emotion.id, isCorrect: choice.isCorrect },
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
    <GameShell gameName="きもちよみとり" session={session}
               stageMode={stageMode} maxTrials={effectiveMaxTrials} onStageComplete={onStageComplete}>
      <div className="flex flex-col items-center w-full max-w-md">
        {/* Face display */}
        {targetEmotion && phase === 'showing' && (
          <>
            <div className="text-center mb-6">
              <p className="text-base font-medium mb-3" style={{ color: 'var(--color-text-muted)' }}>
                このかおは どんな きもち？
              </p>
              <div className="w-36 h-36 rounded-full flex items-center justify-center mx-auto"
                   style={{ background: 'var(--color-surface)', border: '4px solid var(--color-border-light)' }}>
                {(() => {
                  const FaceIcon = KimochiYomitoriIcons[targetEmotion.iconKey];
                  return FaceIcon ? <FaceIcon size={96} className="text-indigo-600" /> : null;
                })()}
              </div>
            </div>

            {/* Emotion choices */}
            <div className="grid grid-cols-2 gap-3 w-full">
              {choices.map(choice => (
                <button
                  key={choice.id}
                  onClick={() => handleSelect(choice)}
                  className="tap-target-large flex items-center gap-3 px-4 py-3 rounded-2xl
                    border-2 transition-all active:scale-95 hover:border-indigo-300"
                  style={{
                    background: 'var(--color-surface)',
                    borderColor: 'var(--color-border-light)',
                  }}
                >
                  {(() => {
                    const FaceIcon = KimochiYomitoriIcons[choice.emotion.iconKey];
                    return FaceIcon ? <FaceIcon size={32} className="text-indigo-500" /> : null;
                  })()}
                  <span className="text-base font-bold" style={{ color: 'var(--color-text)' }}>
                    {choice.emotion.labelKana}
                  </span>
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
