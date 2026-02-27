import type { GameId } from '@/types';
import type { IntegratedGameConfig, IntegratedGameId } from './types';

/**
 * 8統合ゲーム定義
 * game-design-v2.md Section 2 のマッピングに従う
 */
export const INTEGRATED_GAME_MAP: Record<IntegratedGameId, IntegratedGameConfig> = {
  'hikari-rescue': {
    id: 'hikari-rescue',
    name: 'ひかりレスキュー',
    description: 'ちゅうい・よくせい',
    category: 'attention-inhibition',
    levels: [
      { min: 1, max: 3, sourceGameId: 'hikari-catch', label: 'Go only' },
      { min: 4, max: 15, sourceGameId: 'hikari-catch', label: 'Go/No-Go ~ CPT' },
      { min: 16, max: 20, sourceGameId: 'matte-stop', label: 'Stop-signal' },
      { min: 21, max: 25, sourceGameId: 'hayawaza-touch', label: '複合注意' },
    ],
  },
  'oboete-susumu': {
    id: 'oboete-susumu',
    name: 'おぼえてすすむ',
    description: 'きおく・がくしゅう',
    category: 'memory-learning',
    levels: [
      { min: 1, max: 13, sourceGameId: 'oboete-narabete', label: '順方向 + DMS' },
      { min: 14, max: 25, sourceGameId: 'oboete-match', label: '逆方向 + 遅延再認' },
    ],
  },
  'rule-change': {
    id: 'rule-change',
    name: 'ルールチェンジ',
    description: 'じゅうなんせい',
    category: 'flexibility-control',
    levels: [
      { min: 1, max: 25, sourceGameId: 'irokae-switch', label: 'DCCS全レベル' },
    ],
  },
  'kurukuru-puzzle': {
    id: 'kurukuru-puzzle',
    name: 'くるくるパズル',
    description: 'ちかく・すいろん',
    category: 'perception-spatial',
    levels: [
      { min: 1, max: 13, sourceGameId: 'katachi-sagashi', label: '形合わせ + 2D回転' },
      { min: 14, max: 25, sourceGameId: 'pattern-puzzle', label: '系列補完' },
    ],
  },
  'tanken-meiro': {
    id: 'tanken-meiro',
    name: 'たんけんめいろ',
    description: 'けいかく・もんだいかいけつ',
    category: 'flexibility-control',
    levels: [
      { min: 1, max: 13, sourceGameId: 'meiro-tanken', label: '迷路探検' },
      { min: 14, max: 25, sourceGameId: 'tsumitage-tower', label: '順序計画' },
    ],
  },
  'kotoba-ehon': {
    id: 'kotoba-ehon',
    name: 'ことばとえほん',
    description: 'ことば',
    category: 'social-language',
    levels: [
      { min: 1, max: 25, sourceGameId: 'kotoba-catch', label: '受容語彙' },
    ],
  },
  'kimochi-friends': {
    id: 'kimochi-friends',
    name: 'きもちフレンズ',
    description: 'しゃかいにんち',
    category: 'social-language',
    levels: [
      { min: 1, max: 18, sourceGameId: 'kimochi-yomitori', label: '表情認識' },
      { min: 19, max: 25, sourceGameId: 'kimochi-stop', label: '情動Go/No-Go' },
    ],
  },
  'touch-adventure': {
    id: 'touch-adventure',
    name: 'タッチアドベンチャー',
    description: 'びさいうんどう',
    category: 'perception-spatial',
    levels: [
      { min: 1, max: 13, sourceGameId: 'touch-de-go', label: 'タップ・ドラッグ' },
      { min: 14, max: 25, sourceGameId: 'hayawaza-touch', label: '精密操作' },
    ],
  },
};

/**
 * 統合ゲームID + ユーザーレベルから、実際に起動するソースゲームIDを解決する
 */
export function resolveSourceGame(integratedId: IntegratedGameId, userLevel: number): GameId {
  const config = INTEGRATED_GAME_MAP[integratedId];
  if (!config) {
    throw new Error(`Unknown integrated game: ${integratedId}`);
  }

  // レベルに合致するレベル帯を検索
  const matched = config.levels.find(
    (l) => userLevel >= l.min && userLevel <= l.max,
  );

  // 見つからなければ最初のレベル帯にフォールバック
  return matched?.sourceGameId ?? config.levels[0].sourceGameId;
}

/** 表示用の統合ゲームリスト */
export const INTEGRATED_GAME_LIST = Object.values(INTEGRATED_GAME_MAP);
