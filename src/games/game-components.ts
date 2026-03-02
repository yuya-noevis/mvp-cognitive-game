import dynamic from 'next/dynamic';
import type React from 'react';
import type { AgeGroup, GameId } from '@/types';

/**
 * 15ゲーム全てのdynamic importを集約したレジストリ
 *
 * 以前は4ページにコピーされていたGAME_COMPONENTSを1箇所に統合。
 * prop型は全消費者（stage含む）の最広型を使用。
 */
export const GAME_COMPONENTS: Record<
  GameId,
  React.ComponentType<{
    ageGroup: AgeGroup;
    stageMode?: boolean;
    maxTrials?: number;
    onStageComplete?: (accuracy: number) => void;
  }>
> = {
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
