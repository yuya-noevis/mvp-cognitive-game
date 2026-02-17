'use client';

import React, { useState, useCallback, useEffect } from 'react';
import type { AgeGroup, TrialResponse } from '@/types';
import { GameShell } from '@/features/game-engine/GameShell';
import { useGameSession } from '@/features/game-engine/hooks/useGameSession';
import { TrialFeedback } from '@/components/feedback/TrialFeedback';
import { kakurenboKatachiConfig } from './config';
import { nowMs, shuffle, randomInt } from '@/lib/utils';

interface KakurenboKatachiProps {
  ageGroup: AgeGroup;
  stageMode?: boolean;
  maxTrials?: number;
  onStageComplete?: (accuracy: number) => void;
}

type Phase = 'ready' | 'target_preview' | 'search' | 'feedback';

const TARGET_SHAPES = [
  { name: 'triangle', path: 'M25,5 L45,40 L5,40 Z' },
  { name: 'square', path: 'M5,5 L40,5 L40,40 L5,40 Z' },
  { name: 'circle', path: 'M22,5 a18,18 0 1,0 0,36 a18,18 0 1,0 0,-36' },
  { name: 'diamond', path: 'M22,2 L42,22 L22,42 L2,22 Z' },
  { name: 'star', path: 'M22,2 L28,16 L44,16 L31,26 L36,42 L22,32 L8,42 L13,26 L0,16 L16,16 Z' },
];

const COLORS = ['#EF4444', '#3B82F6', '#22C55E', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

interface ShapeItem {
  id: string;
  shapeName: string;
  path: string;
  color: string;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  isTarget: boolean;
}

function getSizeScale(targetSize: string): number {
  return targetSize === 'large' ? 1.2 : targetSize === 'medium' ? 1.0 : 0.8;
}

export default function KakurenboKatachi({ ageGroup, stageMode, maxTrials: stageModeTrials, onStageComplete }: KakurenboKatachiProps) {
  const session = useGameSession({ gameConfig: kakurenboKatachiConfig, ageGroup });

  const [phase, setPhase] = useState<Phase>('ready');
  const [targetShape, setTargetShape] = useState<typeof TARGET_SHAPES[0] | null>(null);
  const [targetColor, setTargetColor] = useState('');
  const [items, setItems] = useState<ShapeItem[]>([]);
  const [feedbackCorrect, setFeedbackCorrect] = useState<boolean | null>(null);

  const effectiveMaxTrials = stageModeTrials ?? kakurenboKatachiConfig.trial_count_range.max;
  const distractorCount = (session.difficulty.distractor_count as number) || 3;
  const targetSize = (session.difficulty.target_size as string) || 'large';
  const colorSimilarity = (session.difficulty.color_similarity as string) || 'low';

  const nextTrial = useCallback(() => {
    if (session.totalTrials >= effectiveMaxTrials) {
      session.endSession('completed');
      return;
    }

    // Pick target shape and color
    const tShape = TARGET_SHAPES[randomInt(0, TARGET_SHAPES.length - 1)];
    const tColor = COLORS[randomInt(0, COLORS.length - 1)];
    setTargetShape(tShape);
    setTargetColor(tColor);

    const scale = getSizeScale(targetSize);

    // Generate items
    const allItems: ShapeItem[] = [];

    // Target item
    allItems.push({
      id: `target_${randomInt(0, 9999)}`,
      shapeName: tShape.name,
      path: tShape.path,
      color: tColor,
      x: randomInt(15, 75),
      y: randomInt(15, 75),
      rotation: randomInt(0, 359),
      scale,
      isTarget: true,
    });

    // Distractor items
    for (let i = 0; i < distractorCount; i++) {
      const dShape = TARGET_SHAPES[randomInt(0, TARGET_SHAPES.length - 1)];
      let dColor: string;

      if (colorSimilarity === 'high') {
        dColor = tColor; // Same color, different shape
      } else if (colorSimilarity === 'mid') {
        dColor = COLORS[(COLORS.indexOf(tColor) + randomInt(1, 2)) % COLORS.length];
      } else {
        dColor = COLORS[(COLORS.indexOf(tColor) + randomInt(3, 5)) % COLORS.length];
      }

      allItems.push({
        id: `dist_${i}_${randomInt(0, 9999)}`,
        shapeName: dShape.name,
        path: dShape.path,
        color: dColor,
        x: randomInt(10, 80),
        y: randomInt(10, 80),
        rotation: randomInt(0, 359),
        scale: 0.8 + Math.random() * 0.4,
        isTarget: false,
      });
    }

    setItems(shuffle(allItems));

    // Show target preview first
    setPhase('target_preview');

    session.startTrial(
      { target_shape: tShape.name, distractor_count: distractorCount, target_size: targetSize },
      { target_shape: tShape.name, target_color: tColor },
    );
    session.presentStimulus();

    // After preview, switch to search
    setTimeout(() => setPhase('search'), 2000);
  }, [session, effectiveMaxTrials, distractorCount, targetSize, colorSimilarity]);

  const handleItemTap = useCallback((item: ShapeItem) => {
    if (phase !== 'search') return;

    const response: TrialResponse = {
      type: 'tap',
      value: { tapped: item.shapeName, isTarget: item.isTarget },
      timestamp_ms: nowMs(),
    };
    session.recordResponse(response);

    const isCorrect = item.isTarget;
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
    <GameShell gameName="かくれんぼカタチ" session={session}
               stageMode={stageMode} maxTrials={effectiveMaxTrials} onStageComplete={onStageComplete}>
      <div className="flex flex-col items-center w-full max-w-md">
        {/* Target preview */}
        {phase === 'target_preview' && targetShape && (
          <div className="text-center mb-4">
            <p className="text-lg font-medium mb-3" style={{ color: 'var(--color-primary-dark)' }}>
              このかたちを さがしてね！
            </p>
            <div className="w-24 h-24 mx-auto rounded-2xl flex items-center justify-center"
                 style={{ background: 'var(--color-primary-bg)' }}>
              <svg width="48" height="48" viewBox="0 0 45 45">
                <path d={targetShape.path} fill={targetColor} />
              </svg>
            </div>
          </div>
        )}

        {/* Search target reminder */}
        {phase === 'search' && targetShape && (
          <div className="flex items-center gap-2 mb-3 px-3 py-1 rounded-full"
               style={{ background: 'var(--color-primary-bg)' }}>
            <svg width="24" height="24" viewBox="0 0 45 45">
              <path d={targetShape.path} fill={targetColor} />
            </svg>
            <span className="text-sm font-medium" style={{ color: 'var(--color-primary-dark)' }}>
              をさがそう！
            </span>
          </div>
        )}

        {/* Search area */}
        {(phase === 'search' || phase === 'target_preview') && (
          <div className="relative w-full aspect-square rounded-3xl overflow-hidden"
               style={{ background: 'var(--color-surface)', maxWidth: '320px' }}>
            {phase === 'search' && items.map(item => (
              <button
                key={item.id}
                onClick={() => handleItemTap(item)}
                className="absolute transition-transform active:scale-90"
                style={{
                  left: `${item.x}%`,
                  top: `${item.y}%`,
                  transform: `translate(-50%, -50%) rotate(${item.rotation}deg) scale(${item.scale})`,
                }}
              >
                <svg width="48" height="48" viewBox="0 0 45 45">
                  <path d={item.path} fill={item.color} opacity={0.85} />
                </svg>
              </button>
            ))}
          </div>
        )}
      </div>

      {feedbackCorrect !== null && (
        <TrialFeedback isCorrect={feedbackCorrect} onComplete={handleFeedbackComplete} />
      )}
    </GameShell>
  );
}
