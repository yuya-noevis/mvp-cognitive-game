'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import type { FC } from 'react';
import type { AgeGroup, TrialResponse } from '@/types';
import { GameShell } from '@/features/game-engine/GameShell';
import { useGameSession } from '@/features/game-engine/hooks/useGameSession';
import { TrialFeedback } from '@/components/feedback/TrialFeedback';
import { KimochiYomitoriIcons, type IconProps } from '@/components/icons';
import { kimochiStopConfig } from './config';
import { nowMs, randomInt } from '@/lib/utils';

interface KimochiStopProps {
  ageGroup: AgeGroup;
  stageMode?: boolean;
  maxTrials?: number;
  onStageComplete?: (accuracy: number) => void;
}

type Phase = 'ready' | 'fixation' | 'stimulus' | 'feedback' | 'iti' | 'block_switch';

// Block type: which emotion is Go vs No-Go
type BlockRule = 'happy_go' | 'angry_go';

const FACE_ICONS: Record<string, FC<IconProps>> = {
  happy: KimochiYomitoriIcons.happy,
  angry: KimochiYomitoriIcons.angry,
};

const FACE_LABELS: Record<string, string> = {
  happy: 'にこにこ',
  angry: 'おこった',
};

export default function KimochiStop({ ageGroup, stageMode, maxTrials: stageModeTrials, onStageComplete }: KimochiStopProps) {
  const session = useGameSession({ gameConfig: kimochiStopConfig, ageGroup });

  const [phase, setPhase] = useState<Phase>('ready');
  const [blockRule, setBlockRule] = useState<BlockRule>('happy_go');
  const [currentFace, setCurrentFace] = useState<'happy' | 'angry'>('happy');
  const [trialInBlock, setTrialInBlock] = useState(0);
  const [responded, setResponded] = useState(false);
  const [feedbackCorrect, setFeedbackCorrect] = useState<boolean | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const stimulusOnsetRef = useRef(0);

  const effectiveMaxTrials = stageModeTrials ?? kimochiStopConfig.trial_count_range.max;
  const displayDuration = (session.difficulty.display_duration_ms as number) || 2000;
  const blockSwitchFreq = (session.difficulty.block_switch_freq as number) || 8;

  const clearTimer = useCallback(() => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
  }, []);

  const isGoTrial = useCallback((face: 'happy' | 'angry', rule: BlockRule): boolean => {
    return (rule === 'happy_go' && face === 'happy') ||
           (rule === 'angry_go' && face === 'angry');
  }, []);

  const nextTrial = useCallback(() => {
    if (session.totalTrials >= effectiveMaxTrials) {
      session.endSession('completed');
      return;
    }

    // Check for block switch
    if (trialInBlock >= blockSwitchFreq) {
      const newRule: BlockRule = blockRule === 'happy_go' ? 'angry_go' : 'happy_go';
      setBlockRule(newRule);
      setTrialInBlock(0);
      setPhase('block_switch');

      timerRef.current = setTimeout(() => {
        startStimulus(newRule);
      }, 2500);
      return;
    }

    startStimulus(blockRule);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, effectiveMaxTrials, trialInBlock, blockSwitchFreq, blockRule]);

  const startStimulus = useCallback((rule: BlockRule) => {
    // 75% Go, 25% No-Go
    const isGo = Math.random() < 0.75;
    const face: 'happy' | 'angry' = isGo
      ? (rule === 'happy_go' ? 'happy' : 'angry')
      : (rule === 'happy_go' ? 'angry' : 'happy');

    setCurrentFace(face);
    setResponded(false);
    setPhase('fixation');

    timerRef.current = setTimeout(() => {
      setPhase('stimulus');
      stimulusOnsetRef.current = nowMs();

      session.startTrial(
        { face, block_rule: rule, is_go: isGoTrial(face, rule) },
        { expected: isGoTrial(face, rule) ? 'tap' : 'withhold' },
      );
      session.presentStimulus();

      // Response window
      timerRef.current = setTimeout(() => {
        if (!responded) {
          handleTimeout(face, rule);
        }
      }, displayDuration);
    }, randomInt(500, 1000));
  }, [session, displayDuration, isGoTrial, responded]);

  const handleTap = useCallback(() => {
    if (phase !== 'stimulus' || responded) return;
    setResponded(true);
    clearTimer();

    const response: TrialResponse = {
      type: 'tap',
      value: { tapped: true, face: currentFace },
      timestamp_ms: nowMs(),
    };
    session.recordResponse(response);

    const isGo = isGoTrial(currentFace, blockRule);
    const isCorrect = isGo;
    const errorType = !isGo ? 'commission' as const : null;
    session.completeTrial(isCorrect, errorType);

    setTrialInBlock(prev => prev + 1);
    setFeedbackCorrect(isCorrect);
    setPhase('feedback');
  }, [phase, responded, currentFace, blockRule, session, clearTimer, isGoTrial]);

  const handleTimeout = useCallback((face: 'happy' | 'angry', rule: BlockRule) => {
    setResponded(true);
    const response: TrialResponse = {
      type: 'withhold',
      value: { tapped: false, face },
      timestamp_ms: nowMs(),
    };
    session.recordResponse(response);

    const isGo = isGoTrial(face, rule);
    const isCorrect = !isGo; // Withholding on No-Go is correct
    const errorType = isGo ? 'omission' as const : null;
    session.completeTrial(isCorrect, errorType);

    setTrialInBlock(prev => prev + 1);
    setFeedbackCorrect(isCorrect);
    setPhase('feedback');
  }, [session, isGoTrial]);

  const handleFeedbackComplete = useCallback(() => {
    setFeedbackCorrect(null);
    setPhase('iti');
    setTimeout(nextTrial, randomInt(800, 1200));
  }, [nextTrial]);

  useEffect(() => {
    if (session.sessionId && phase === 'ready' && session.totalTrials === 0) {
      nextTrial();
    }
  }, [session.sessionId, phase, session.totalTrials, nextTrial]);

  useEffect(() => { return clearTimer; }, [clearTimer]);

  const goFace = blockRule === 'happy_go' ? 'happy' : 'angry';
  const nogoFace = blockRule === 'happy_go' ? 'angry' : 'happy';
  const GoIcon = FACE_ICONS[goFace];
  const NogoIcon = FACE_ICONS[nogoFace];

  return (
    <GameShell gameName="きもちストップ" session={session}
               stageMode={stageMode} maxTrials={effectiveMaxTrials} onStageComplete={onStageComplete}>
      <div className="flex flex-col items-center w-full max-w-md">
        {/* Rule indicator */}
        <div className="mb-4 text-center p-3 rounded-xl"
             style={{ background: 'var(--color-info-bg)' }}>
          <div className="flex items-center justify-center gap-1 text-sm font-medium" style={{ color: 'var(--color-info)' }}>
            <GoIcon size={20} /> <span>→ タップ！</span>
            <span className="mx-2" />
            <NogoIcon size={20} /> <span>→ まって！</span>
          </div>
        </div>

        {/* Block switch announcement */}
        {phase === 'block_switch' && (
          <div className="fixed inset-0 flex items-center justify-center z-40" style={{ background: 'rgba(26,26,64,0.85)' }}>
            <div className="text-center animate-scale-in">
              <p className="text-2xl font-bold mb-3" style={{ color: 'var(--color-primary-dark)' }}>
                ルール チェンジ！
              </p>
              <div className="flex items-center justify-center gap-2 text-xl">
                {(() => {
                  const SwitchIcon = FACE_ICONS[blockRule === 'happy_go' ? 'happy' : 'angry'];
                  return <SwitchIcon size={28} />;
                })()}
                <span>→ タップ！</span>
              </div>
            </div>
          </div>
        )}

        {/* Stimulus area */}
        <div
          className="w-48 h-48 rounded-full flex items-center justify-center cursor-pointer select-none
            transition-all active:scale-90"
          style={{
            background: phase === 'stimulus' ? 'var(--color-primary-bg)' : 'var(--color-border-light)',
          }}
          onClick={handleTap}
        >
          {phase === 'fixation' && (
            <span className="text-4xl" style={{ color: 'var(--color-text-muted)' }}>+</span>
          )}
          {phase === 'stimulus' && (() => {
            const FaceIcon = FACE_ICONS[currentFace];
            return FaceIcon ? <FaceIcon size={96} style={{ color: '#8B5CF6' }} /> : null;
          })()}
          {(phase === 'ready' || phase === 'iti') && (
            <span className="text-xl" style={{ color: 'var(--color-text-muted)' }}>...</span>
          )}
        </div>
      </div>

      {feedbackCorrect !== null && (
        <TrialFeedback isCorrect={feedbackCorrect} onComplete={handleFeedbackComplete} />
      )}
    </GameShell>
  );
}
