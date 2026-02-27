import type { IntegratedGameId } from '@/games/integrated/types';

export type DemoType =
  | 'tap-target'
  | 'wait-and-tap'
  | 'remember-sequence'
  | 'match-shape'
  | 'swipe-path'
  | 'select-word'
  | 'match-emotion'
  | 'drag-target';

export interface GameInstructionData {
  /** L2用: 1語 */
  singleWord: string;
  /** L3用: 短文 */
  shortSentence: string;
  /** L4用: ステップ説明 */
  steps: string[];
  /** デモアニメーションの種類 */
  demoType: DemoType;
}

export const GAME_INSTRUCTIONS: Record<IntegratedGameId, GameInstructionData> = {
  'hikari-rescue': {
    singleWord: 'タッチ！',
    shortSentence: 'ひかったら タッチしてね',
    steps: [
      'ひかる いきものが でてくるよ',
      'ひかったら タッチして たすけよう',
      'トゲトゲは さわらないでね',
    ],
    demoType: 'tap-target',
  },
  'oboete-susumu': {
    singleWord: 'おなじ！',
    shortSentence: 'おなじ じゅんばんで タッチしてね',
    steps: [
      'ロボットが いろを みせるよ',
      'おなじ じゅんばんで タッチしよう',
      'どんどん ながくなるよ',
    ],
    demoType: 'remember-sequence',
  },
  'rule-change': {
    singleWord: 'かえて！',
    shortSentence: 'ルールが かわるよ よくみてね',
    steps: [
      'カードを なかまに わけよう',
      'さいしょは いろで わけるよ',
      'とちゅうで ルールが かわるよ',
    ],
    demoType: 'match-shape',
  },
  'kurukuru-puzzle': {
    singleWord: 'おなじ！',
    shortSentence: 'おなじ かたちを みつけてね',
    steps: [
      'いろんな かたちが でてくるよ',
      'おなじ かたちを さがそう',
      'くるくる まわっているのも あるよ',
    ],
    demoType: 'match-shape',
  },
  'tanken-meiro': {
    singleWord: 'すすめ！',
    shortSentence: 'ゆびで みちを すすんでね',
    steps: [
      'めいろを たんけんしよう',
      'ゆびで スワイプして すすもう',
      'いきどまりに きをつけてね',
    ],
    demoType: 'swipe-path',
  },
  'kotoba-ehon': {
    singleWord: 'どれ？',
    shortSentence: 'いわれた ものを タッチしてね',
    steps: [
      'おとを よく きいてね',
      'いわれた ものの えを タッチしよう',
      'いろんな ことばが でてくるよ',
    ],
    demoType: 'select-word',
  },
  'kimochi-friends': {
    singleWord: 'きもち！',
    shortSentence: 'おなじ きもちの かおを さがしてね',
    steps: [
      'どうぶつの かおを みてね',
      'おなじ きもちの かおを さがそう',
      'うれしい、かなしい、おこってる...',
    ],
    demoType: 'match-emotion',
  },
  'touch-adventure': {
    singleWord: 'タッチ！',
    shortSentence: 'まるに タッチしてね',
    steps: [
      'まるが でてくるよ',
      'じょうずに タッチしよう',
      'ちいさいのも あるよ がんばって',
    ],
    demoType: 'drag-target',
  },
};
