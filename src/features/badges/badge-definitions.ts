/**
 * BadgeDefinitions - 全バッジ定義
 *
 * 設計原則:
 * - 努力バッジ: 結果ではなくプロセスを評価
 * - 成長バッジ: 個人内の成長を可視化
 * - 発見バッジ: 強みの発見を祝う（「苦手」「弱い」は使わない）
 * - 特別バッジ: 長期継続のインセンティブ
 */

import type { BadgeDefinition } from './types';

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  // ==========================================
  // 努力バッジ (Effort)
  // ==========================================
  {
    id: 'play-count',
    category: 'effort',
    name: 'チャレンジャー',
    description: 'たくさん チャレンジしたね！',
    icon: '🏃',
    criteria: {
      bronze: { threshold: 10, label: '10かい プレイ' },
      silver: { threshold: 50, label: '50かい プレイ' },
      gold:   { threshold: 100, label: '100かい プレイ' },
    },
  },
  {
    id: 'play-days',
    category: 'effort',
    name: 'まいにちプレイヤー',
    description: 'まいにち がんばってるね！',
    icon: '📅',
    criteria: {
      bronze: { threshold: 7, label: '7にち プレイ' },
      silver: { threshold: 30, label: '30にち プレイ' },
      gold:   { threshold: 100, label: '100にち プレイ' },
    },
  },
  {
    id: 'all-games',
    category: 'effort',
    name: 'ぼうけんか',
    description: 'いろんな ゲームに チャレンジ！',
    icon: '🗺️',
    criteria: {
      bronze: { threshold: 3, label: '3つの ゲームを たいけん' },
      silver: { threshold: 5, label: '5つの ゲームを たいけん' },
      gold:   { threshold: 8, label: 'ぜんぶの ゲームを たいけん' },
    },
  },
  {
    id: 'streak',
    category: 'effort',
    name: 'れんぞくマスター',
    description: 'れんぞくで がんばった！',
    icon: '🔥',
    criteria: {
      bronze: { threshold: 3, label: '3にち れんぞく' },
      silver: { threshold: 7, label: '7にち れんぞく' },
      gold:   { threshold: 14, label: '14にち れんぞく' },
    },
  },

  // ==========================================
  // 成長バッジ (Growth)
  // ==========================================
  {
    id: 'tier-up',
    category: 'growth',
    name: 'レベルアップ',
    description: 'あたらしい せかいが ひらけた！',
    icon: '⬆️',
    criteria: {
      bronze: { threshold: 1, label: 'ティア 1 クリア' },
      silver: { threshold: 2, label: 'ティア 2 クリア' },
      gold:   { threshold: 3, label: 'ティア 3 とうたつ' },
    },
  },

  // ==========================================
  // 発見バッジ (Discovery)
  // ==========================================
  {
    id: 'strength-attention',
    category: 'discovery',
    name: 'ひかりの たつじん',
    description: 'ちゅういりょくが とくい みたい！',
    icon: '💡',
    criteria: {
      bronze: { threshold: 70, label: 'ちゅうい 70% いじょう' },
      silver: { threshold: 80, label: 'ちゅうい 80% いじょう' },
      gold:   { threshold: 90, label: 'ちゅうい 90% いじょう' },
    },
  },
  {
    id: 'strength-memory',
    category: 'discovery',
    name: 'きおくの たつじん',
    description: 'きおくりょくが とくい みたい！',
    icon: '🧠',
    criteria: {
      bronze: { threshold: 70, label: 'きおく 70% いじょう' },
      silver: { threshold: 80, label: 'きおく 80% いじょう' },
      gold:   { threshold: 90, label: 'きおく 90% いじょう' },
    },
  },
  {
    id: 'strength-flexibility',
    category: 'discovery',
    name: 'ひらめきの たつじん',
    description: 'やわらかい あたまが とくい みたい！',
    icon: '🌀',
    criteria: {
      bronze: { threshold: 70, label: 'ひらめき 70% いじょう' },
      silver: { threshold: 80, label: 'ひらめき 80% いじょう' },
      gold:   { threshold: 90, label: 'ひらめき 90% いじょう' },
    },
  },
  {
    id: 'strength-perception',
    category: 'discovery',
    name: 'かんかくの たつじん',
    description: 'かんかくが するどい みたい！',
    icon: '👁️',
    criteria: {
      bronze: { threshold: 70, label: 'かんかく 70% いじょう' },
      silver: { threshold: 80, label: 'かんかく 80% いじょう' },
      gold:   { threshold: 90, label: 'かんかく 90% いじょう' },
    },
  },
  {
    id: 'strength-social',
    category: 'discovery',
    name: 'こころの たつじん',
    description: 'きもちを よむのが とくい みたい！',
    icon: '💖',
    criteria: {
      bronze: { threshold: 70, label: 'こころ 70% いじょう' },
      silver: { threshold: 80, label: 'こころ 80% いじょう' },
      gold:   { threshold: 90, label: 'こころ 90% いじょう' },
    },
  },

  // ==========================================
  // 特別バッジ (Special)
  // ==========================================
  {
    id: 'first-session',
    category: 'special',
    name: 'はじめの いっぽ',
    description: 'さいしょの ぼうけんを はじめた！',
    icon: '🚀',
    criteria: {
      bronze: { threshold: 1, label: 'はじめての プレイ' },
      silver: { threshold: 1, label: 'はじめての プレイ' },
      gold:   { threshold: 1, label: 'はじめての プレイ' },
    },
  },
];
