'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import type { AgeGroup, TrialResponse } from '@/types';
import { GameShell } from '@/features/game-engine/GameShell';
import { useGameSession } from '@/features/game-engine/hooks/useGameSession';
import { TrialFeedback } from '@/components/feedback/TrialFeedback';
import { irokaeSwitchConfig } from './config';
import { nowMs, randomInt } from '@/lib/utils';
import { detectNearMiss, type NearMissResult, NOT_NEAR_MISS } from '@/features/near-miss';

interface IrokaeSwitchProps {
  ageGroup: AgeGroup;
  maxTrials?: number;
}

type Phase = 'ready' | 'rule_display' | 'stimulus' | 'feedback';
type RuleType = 'color' | 'shape';

const CARD_COLORS = ['red', 'blue'] as const;
const CARD_SHAPES = ['circle', 'star'] as const;

const COLOR_BG: Record<string, string> = {
  red: 'bg-red-400',
  blue: 'bg-blue-400',
};

const SHAPE_EMOJI: Record<string, string> = {
  circle: '●',
  star: '★',
};

interface Card {
  color: typeof CARD_COLORS[number];
  shape: typeof CARD_SHAPES[number];
}

interface SortBin {
  color: typeof CARD_COLORS[number];
  shape: typeof CARD_SHAPES[number];
}

export default function IrokaeSwitch({ ageGroup, maxTrials: maxTrialsProp }: IrokaeSwitchProps) {
  const session = useGameSession({
    gameConfig: irokaeSwitchConfig,
    ageGroup,
  });

  const [phase, setPhase] = useState<Phase>('ready');
  const [currentRule, setCurrentRule] = useState<RuleType>('color');
  const [trialInPhase, setTrialInPhase] = useState(0);
  const [currentCard, setCurrentCard] = useState<Card | null>(null);
  const [feedbackCorrect, setFeedbackCorrect] = useState<boolean | null>(null);
  const [nearMissResult, setNearMissResult] = useState<NearMissResult>(NOT_NEAR_MISS);
  const [showRuleChange, setShowRuleChange] = useState(false);
  const previousRuleRef = useRef<RuleType>('color');
  const ruleChangeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const feedbackTimerRef = useRef<NodeJS.Timeout | null>(null);

  const maxTrials = maxTrialsProp ?? irokaeSwitchConfig.trial_count_range.max;
  const switchFreq = (session.difficulty.switch_frequency as number) || 8;
  const cueSalience = (session.difficulty.cue_salience as string) || 'high';

  // Sort bins (fixed positions)
  const bins: SortBin[] = [
    { color: 'red', shape: 'circle' },
    { color: 'blue', shape: 'star' },
  ];

  const generateCard = useCallback((): Card => {
    return {
      color: CARD_COLORS[randomInt(0, 1)],
      shape: CARD_SHAPES[randomInt(0, 1)],
    };
  }, []);

  const getCorrectBinIndex = useCallback((card: Card, rule: RuleType): number => {
    if (rule === 'color') {
      return bins.findIndex(b => b.color === card.color);
    }
    return bins.findIndex(b => b.shape === card.shape);
  }, [bins]);

  const nextTrial = useCallback(() => {
    if (session.totalTrials >= maxTrials) {
      session.endSession('completed');
      return;
    }

    // Check if rule switch needed
    if (trialInPhase >= switchFreq) {
      const newRule: RuleType = currentRule === 'color' ? 'shape' : 'color';
      previousRuleRef.current = currentRule;
      setCurrentRule(newRule);
      setTrialInPhase(0);
      setShowRuleChange(true);
      setPhase('rule_display');

      // Show rule change for 2 seconds
      ruleChangeTimerRef.current = setTimeout(() => {
        setShowRuleChange(false);
        startStimulus(newRule);
      }, 2000);
      return;
    }

    startStimulus(currentRule);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, maxTrials, trialInPhase, switchFreq, currentRule]);

  const startStimulus = useCallback((rule: RuleType) => {
    const card = generateCard();
    setCurrentCard(card);
    setPhase('stimulus');

    const isSwitchTrial = previousRuleRef.current !== rule && trialInPhase === 0;
    session.startTrial(
      { card, current_rule: rule, is_switch_trial: isSwitchTrial },
      { correct_bin: getCorrectBinIndex(card, rule) },
    );
    session.presentStimulus();
  }, [generateCard, session, getCorrectBinIndex, trialInPhase]);

  const handleBinSelect = useCallback((binIndex: number) => {
    if (phase !== 'stimulus' || !currentCard) return;

    const correctBin = getCorrectBinIndex(currentCard, currentRule);
    const isCorrect = binIndex === correctBin;

    // Check for perseverative error (using old rule after switch)
    let errorType = null;
    if (!isCorrect) {
      const oldRuleCorrect = getCorrectBinIndex(currentCard, currentRule === 'color' ? 'shape' : 'color');
      if (binIndex === oldRuleCorrect) {
        errorType = 'perseverative' as const;
      } else {
        errorType = 'selection' as const;
      }
    }

    const response: TrialResponse = {
      type: 'select',
      value: { selected_bin: binIndex },
      timestamp_ms: nowMs(),
    };
    session.recordResponse(response);
    session.completeTrial(isCorrect, errorType);

    // ニアミス判定
    let nmResult = NOT_NEAR_MISS;
    if (!isCorrect) {
      nmResult = detectNearMiss({
        gameId: 'irokae-switch',
        correctAnswer: { correct_bin: correctBin },
        userResponse: { selected_bin: binIndex },
        errorType,
      });
    }
    setNearMissResult(nmResult);
    setTrialInPhase(prev => prev + 1);
    setFeedbackCorrect(isCorrect);
    setPhase('feedback');
  }, [phase, currentCard, currentRule, getCorrectBinIndex, session]);

  const handleFeedbackComplete = useCallback(() => {
    setFeedbackCorrect(null);
    setNearMissResult(NOT_NEAR_MISS);
    setPhase('ready');
    feedbackTimerRef.current = setTimeout(nextTrial, session.getITIMs());
  }, [nextTrial, session]);

  useEffect(() => {
    if (session.sessionId && phase === 'ready' && session.totalTrials === 0) {
      nextTrial();
    }
  }, [session.sessionId, phase, session.totalTrials, nextTrial]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (ruleChangeTimerRef.current) clearTimeout(ruleChangeTimerRef.current);
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    };
  }, []);

  // Rule indicator size based on cue salience
  const ruleIndicatorSize = cueSalience === 'high' ? 'text-2xl' : cueSalience === 'mid' ? 'text-lg' : 'text-sm';

  return (
    <GameShell gameName="いろかえスイッチ" session={session} maxTrials={maxTrials}>
      {/* Rule indicator */}
      <div className={`mb-4 text-center p-3 rounded-xl`}
        style={{ background: currentRule === 'color' ? 'rgba(108,60,225,0.15)' : 'rgba(78,205,196,0.15)' }}>
        <p className={`font-bold ${ruleIndicatorSize}`}
          style={{ color: currentRule === 'color' ? '#8B5CF6' : '#4ECDC4' }}>
          いまは「{currentRule === 'color' ? 'いろ' : 'かたち'}」！
        </p>
      </div>

      {/* Rule change animation */}
      {showRuleChange && (
        <div className="fixed inset-0 flex items-center justify-center z-40"
          style={{ background: 'rgba(26,26,64,0.85)' }}>
          <div className="text-center animate-bounce">
            <p className="text-3xl font-bold mb-2" style={{ color: '#8B5CF6' }}>ルール チェンジ！</p>
            <p className="text-2xl font-bold" style={{ color: '#4ECDC4' }}>
              こんどは「{currentRule === 'color' ? 'いろ' : 'かたち'}」で わけよう！
            </p>
          </div>
        </div>
      )}

      {/* Current card */}
      {currentCard && phase === 'stimulus' && (
        <div className={`w-36 h-36 rounded-2xl ${COLOR_BG[currentCard.color]} flex items-center justify-center mb-6 shadow-lg mx-auto`}>
          <span className="text-6xl text-white">
            {SHAPE_EMOJI[currentCard.shape]}
          </span>
        </div>
      )}

      {/* Sort bins */}
      <div className="grid grid-cols-2 gap-4 w-full">
        {bins.map((bin, index) => (
          <button
            key={index}
            onClick={() => handleBinSelect(index)}
            disabled={phase !== 'stimulus'}
            className={`tap-target-large aspect-square rounded-2xl border-4 border-dashed flex flex-col items-center justify-center
              transition-all active:scale-95
              ${phase === 'stimulus' ? 'border-gray-400 hover:border-purple-500' : 'border-gray-200'}`}
          >
            <div className={`w-16 h-16 rounded-lg ${COLOR_BG[bin.color]} flex items-center justify-center mb-1`}>
              <span className="text-2xl text-white">{SHAPE_EMOJI[bin.shape]}</span>
            </div>
          </button>
        ))}
      </div>

      {feedbackCorrect !== null && (
        <TrialFeedback
          isCorrect={feedbackCorrect}
          isNearMiss={nearMissResult.isNearMiss}
          nearMissMessage={nearMissResult.message}
          onComplete={handleFeedbackComplete}
        />
      )}
    </GameShell>
  );
}
