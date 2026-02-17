'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import type { GameId, AgeGroup } from '@/types';
import { GAME_CONFIGS } from '@/games';
import { SearchIcon } from '@/components/icons';

// Lazy load all game components for performance
const GAME_COMPONENTS: Record<GameId, React.ComponentType<{ ageGroup: AgeGroup; maxTrials?: number }>> = {
  'hikari-catch': dynamic(() => import('@/games/hikari-catch/HikariCatch')),
  'matte-stop': dynamic(() => import('@/games/matte-stop/MatteStop')),
  'oboete-narabete': dynamic(() => import('@/games/oboete-narabete/OboeteNarabete')),
  'katachi-sagashi': dynamic(() => import('@/games/katachi-sagashi/KatachiSagashi')),
  'irokae-switch': dynamic(() => import('@/games/irokae-switch/IrokaeSwitch')),
  'hayawaza-touch': dynamic(() => import('@/games/hayawaza-touch/HayawazaTouch')),
  'oboete-match': dynamic(() => import('@/games/oboete-match/OboeteMatch')),
  'tsumitage-tower': dynamic(() => import('@/games/tsumitage-tower/TsumitageTower')),
  'pattern-puzzle': dynamic(() => import('@/games/pattern-puzzle/PatternPuzzle')),
  'meiro-tanken': dynamic(() => import('@/games/meiro-tanken/MeiroTanken')),
  'kakurenbo-katachi': dynamic(() => import('@/games/kakurenbo-katachi/KakurenboKatachi')),
  'kotoba-catch': dynamic(() => import('@/games/kotoba-catch/KotobaCatch')),
  'kimochi-yomitori': dynamic(() => import('@/games/kimochi-yomitori/KimochiYomitori')),
  'kimochi-stop': dynamic(() => import('@/games/kimochi-stop/KimochiStop')),
  'touch-de-go': dynamic(() => import('@/games/touch-de-go/TouchDeGo')),
};

export default function GamePlayPage() {
  const params = useParams();
  const gameId = params.gameId as GameId;

  // TODO: Get from child profile after auth implementation
  const ageGroup: AgeGroup = '6-9';

  const GameComponent = GAME_COMPONENTS[gameId];
  const config = GAME_CONFIGS[gameId];

  // Use stage_trial_count for appropriate trial length
  const maxTrials = config?.stage_trial_count?.[ageGroup] ?? config?.trial_count_range?.max;

  if (!GameComponent) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-8 animate-fade-in"
           style={{ background: 'var(--color-bg)' }}>
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
             style={{ background: 'var(--color-warning-bg)' }}>
          <SearchIcon size={32} style={{ color: 'var(--color-warning)' }} />
        </div>
        <p className="text-lg font-medium" style={{ color: 'var(--color-text-secondary)' }}>
          ゲームが見つかりません
        </p>
      </div>
    );
  }

  return <GameComponent ageGroup={ageGroup} maxTrials={maxTrials} />;
}
