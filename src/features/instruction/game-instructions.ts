import type { IntegratedGameId } from '@/games/integrated/types';

export type DemoType =
  | 'tap-target'
  | 'wait-and-tap'
  | 'remember-sequence'
  | 'match-shape'
  | 'rule-change'
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
    shortSentence: 'ひかる いきものだけ タッチしてね',
    steps: [
      'いきものが つぎつぎ でてくるよ',
      'ひかっている いきものだけ タッチしよう',
      'ひかっていないのは さわらないでね',
    ],
    demoType: 'tap-target',
  },
  'oboete-susumu': {
    singleWord: 'おぼえて！',
    shortSentence: 'ひかった じゅんばんで タッチしてね',
    steps: [
      'ほうせきが じゅんばんに ひかるよ',
      'おなじ じゅんばんで タッチしよう',
      'おぼえられたら もっと ながくなるよ',
    ],
    demoType: 'remember-sequence',
  },
  'rule-change': {
    singleWord: 'チェンジ！',
    shortSentence: 'ルールが かわるよ よくみてね',
    steps: [
      'カードを いろ か かたちで わけよう',
      'とちゅうで ルールが チェンジするよ',
      'あたらしい ルールに きりかえてね',
    ],
    demoType: 'rule-change',
  },
  'kurukuru-puzzle': {
    singleWord: 'おなじ！',
    shortSentence: 'おなじ かたちを みつけてね',
    steps: [
      'うえの かたちと おなじものを さがそう',
      'くるくる まわっているのも あるよ',
      'よくみて おなじ かたちを タッチしてね',
    ],
    demoType: 'match-shape',
  },
  'tanken-meiro': {
    singleWord: 'ゴール！',
    shortSentence: 'めいろの みちを タッチしてね',
    steps: [
      'スタートから ゴールまで すすもう',
      'みちを タッチして すすんでね',
      'いきどまりに きをつけてね',
    ],
    demoType: 'swipe-path',
  },
  'kotoba-ehon': {
    singleWord: 'どれ？',
    shortSentence: 'ことばに あう えを えらんでね',
    steps: [
      'ことばが きこえるよ よくきいてね',
      'あっている えを タッチしよう',
      'いろんな ことばが でてくるよ',
    ],
    demoType: 'select-word',
  },
  'kimochi-friends': {
    singleWord: 'きもち！',
    shortSentence: 'どんな きもちか えらんでね',
    steps: [
      'かおの ひょうじょうを みてね',
      'うれしい、かなしい、おこっている...',
      'おなじ きもちを タッチしよう',
    ],
    demoType: 'match-emotion',
  },
  'touch-adventure': {
    singleWord: 'タッチ！',
    shortSentence: 'でてきた まるを タッチしてね',
    steps: [
      'まるが でてくるよ すばやく タッチ！',
      'ちいさい まるも あるよ',
      'はやく ただしく タッチしてね',
    ],
    demoType: 'drag-target',
  },
};
