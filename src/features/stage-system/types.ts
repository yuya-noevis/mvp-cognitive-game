import type { GameId, CognitiveDomain, AgeGroup, MasteryLevel } from '@/types';

/** ステージの状態 */
export type StageStatus = 'idle' | 'playing' | 'break' | 'celebration' | 'completed';

/** ステージ内の個別ゲーム状態 */
export interface StageGameState {
  gameId: GameId;
  domain: CognitiveDomain;
  trialCount: number;
  isReview: boolean;
  isCompleted: boolean;
  accuracy: number;
  trialsCompleted: number;
}

/** ステージセッション全体の状態 */
export interface StageState {
  status: StageStatus;
  stageId: string;
  stageNumber: number;
  ageGroup: AgeGroup;
  games: StageGameState[];
  currentGameIndex: number;
  startedAt: number;
  totalElapsedMs: number;
}

/** ステージアクション */
export type StageAction =
  | { type: 'START_STAGE'; stageId: string; stageNumber: number; games: StageGameState[] }
  | { type: 'START_GAME' }
  | { type: 'COMPLETE_GAME'; accuracy: number }
  | { type: 'START_BREAK' }
  | { type: 'END_BREAK' }
  | { type: 'START_CELEBRATION' }
  | { type: 'COMPLETE_STAGE' }
  | { type: 'ABORT_STAGE' };

/** 習熟追跡レコード */
export interface MasteryRecord {
  domain: CognitiveDomain;
  gameId: GameId;
  level: MasteryLevel;
  consecutiveMasterySessions: number;
  recentAccuracies: number[];
  lastPlayedAt: number;
  halfLifeHours: number;
  nextReviewAt: number;
}
