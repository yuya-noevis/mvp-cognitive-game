import type { GameId } from '@/types';

/** 8統合ゲームのID */
export type IntegratedGameId =
  | 'hikari-rescue'
  | 'oboete-susumu'
  | 'rule-change'
  | 'kurukuru-puzzle'
  | 'tanken-meiro'
  | 'kotoba-ehon'
  | 'kimochi-friends'
  | 'touch-adventure';

/** 統合ゲーム内のレベル帯 */
export interface IntegratedLevel {
  min: number;
  max: number;
  sourceGameId: GameId;
  label: string;
}

/** 5カテゴリ */
export type CognitiveCategory =
  | 'attention-inhibition'
  | 'memory-learning'
  | 'flexibility-control'
  | 'perception-spatial'
  | 'social-language';

/** 統合ゲーム定義 */
export interface IntegratedGameConfig {
  id: IntegratedGameId;
  name: string;
  description: string;
  category: CognitiveCategory;
  levels: IntegratedLevel[];
}
