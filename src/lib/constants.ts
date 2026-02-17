import type { AgeGroup, CognitiveDomain } from '@/types';

// DDA defaults
export const DDA_TARGET_ACCURACY_MIN = 0.70;
export const DDA_TARGET_ACCURACY_MAX = 0.85;
export const DDA_DEFAULT_WINDOW_SIZE = 5;
export const DDA_MIN_TRIALS_BEFORE_ADJUST = 3;

// Safety defaults
export const CONSECUTIVE_ERROR_HINT_THRESHOLD = 3;
export const CONSECUTIVE_ERROR_BREAK_THRESHOLD = 5;
export const INACTIVITY_TIMEOUT_MS = 30_000; // 30秒
export const MAX_SESSION_DURATION_MS = 15 * 60 * 1000; // 15分

// Age-based response window for processing speed game (ms)
export const RESPONSE_WINDOW_BY_AGE: Record<AgeGroup, number> = {
  '3-5': 3000,
  '6-9': 2500,
  '10-15': 2000,
};

// Tap target sizes (px)
export const TAP_TARGET_MIN = 48;
export const TAP_TARGET_LARGE = 80;

// Animation safety: max flash frequency (Hz) per WCAG
export const MAX_FLASH_FREQUENCY_HZ = 3;

// Report disclaimer (免責表示 - 必ずレポートに含める)
export const REPORT_DISCLAIMER =
  'このレポートは支援のための参考指標です。診断や能力の断定を目的としたものではありません。気になる点がある場合は、専門家にご相談ください。';

// 15 Cognitive Domain definitions
export interface DomainMeta {
  key: CognitiveDomain;
  label: string;
  labelKana: string;
  color: string;
  description: string;
}

export const COGNITIVE_DOMAINS: DomainMeta[] = [
  { key: 'attention',              label: '注意',           labelKana: 'ちゅうい',         color: 'var(--color-domain-attention)',              description: '必要なものに気づき、集中する力' },
  { key: 'inhibition',            label: '抑制',           labelKana: 'よくせい',         color: 'var(--color-domain-inhibition)',            description: '衝動をおさえ、がまんする力' },
  { key: 'working_memory',        label: 'ワーキングメモリ', labelKana: 'わーきんぐめもり', color: 'var(--color-domain-working-memory)',        description: '情報を一時的に覚えて使う力' },
  { key: 'memory',                label: '記憶',           labelKana: 'きおく',           color: 'var(--color-domain-memory)',                description: '覚えた情報を保つ力' },
  { key: 'processing_speed',      label: '処理速度',       labelKana: 'しょりそくど',     color: 'var(--color-domain-processing-speed)',      description: '情報をすばやく処理する力' },
  { key: 'cognitive_flexibility', label: '認知的柔軟性',   labelKana: 'にんちてきじゅうなんせい', color: 'var(--color-domain-cognitive-flexibility)', description: '考え方を切りかえる力' },
  { key: 'planning',              label: '計画・実行',     labelKana: 'けいかく',         color: 'var(--color-domain-planning)',              description: '順序を考えて実行する力' },
  { key: 'reasoning',             label: '推論',           labelKana: 'すいろん',         color: 'var(--color-domain-reasoning)',             description: 'ルールやパターンを見つける力' },
  { key: 'problem_solving',       label: '問題解決',       labelKana: 'もんだいかいけつ', color: 'var(--color-domain-problem-solving)',       description: '解決策を見つけて試す力' },
  { key: 'visuospatial',          label: '視空間',         labelKana: 'しくうかん',       color: 'var(--color-domain-visuospatial)',          description: '形や場所を見分ける力' },
  { key: 'perceptual',            label: '知覚処理',       labelKana: 'ちかくしょり',     color: 'var(--color-domain-perceptual)',            description: '見たもの・聞いたものを整理する力' },
  { key: 'language',              label: '言語',           labelKana: 'げんご',           color: 'var(--color-domain-language)',              description: 'ことばを理解し使う力' },
  { key: 'social_cognition',      label: '社会認知',       labelKana: 'しゃかいにんち',   color: 'var(--color-domain-social-cognition)',      description: '相手の気持ちを理解する力' },
  { key: 'emotion_regulation',    label: '情動調整',       labelKana: 'じょうどうちょうせい', color: 'var(--color-domain-emotion-regulation)',    description: '気持ちをコントロールする力' },
  { key: 'motor_skills',          label: '運動スキル',     labelKana: 'うんどう',         color: 'var(--color-domain-motor-skills)',          description: '体をうまく動かす力' },
];

// Domain labels (日本語) - backward compatible
export const DOMAIN_LABELS: Record<string, string> = Object.fromEntries(
  COGNITIVE_DOMAINS.map(d => [d.key, `${d.labelKana}（${d.label}）`])
);

/** Prompt-3 display names for parent dashboard (friendly names) */
export const DOMAIN_DISPLAY_NAMES: Record<string, string> = {
  attention: '注意力',
  inhibition: 'がまん力',
  working_memory: '作業記憶',
  visuospatial: '空間認知',
  cognitive_flexibility: '切り替え力',
  processing_speed: '処理スピード',
  memory: '記憶力',
  planning: '計画力',
  reasoning: '推論力',
  problem_solving: '問題解決',
  perceptual: '知覚力',
  language: 'ことば',
  social_cognition: '社会理解',
  emotion_regulation: '感情調整',
  motor_skills: '運動スキル',
};

/** Domain to game ID mapping */
export const DOMAIN_GAME_MAP: Record<string, string> = {
  attention: 'hikari-catch',
  inhibition: 'matte-stop',
  working_memory: 'oboete-narabete',
  visuospatial: 'katachi-sagashi',
  cognitive_flexibility: 'irokae-switch',
  processing_speed: 'hayawaza-touch',
  memory: 'oboete-match',
  planning: 'tsumitage-tower',
  reasoning: 'pattern-puzzle',
  problem_solving: 'meiro-tanken',
  perceptual: 'kakurenbo-katachi',
  language: 'kotoba-catch',
  social_cognition: 'kimochi-yomitori',
  emotion_regulation: 'kimochi-stop',
  motor_skills: 'touch-de-go',
};

// ============================================
// Stage System Constants - ステージ制
// ============================================

/**
 * 年齢別ステージ所要時間（ms）
 * 根拠: Korkman et al. (2007) NEPSY-II, Conners CPT-3, Cambridge CANTAB
 */
export const STAGE_DURATION_BY_AGE: Record<AgeGroup, { min: number; max: number }> = {
  '3-5':  { min: 8 * 60 * 1000,  max: 12 * 60 * 1000 },  // 8-12分
  '6-9':  { min: 15 * 60 * 1000, max: 20 * 60 * 1000 },  // 15-20分
  '10-15': { min: 20 * 60 * 1000, max: 25 * 60 * 1000 },  // 20-25分
};

/**
 * 年齢別1ステージあたりゲーム数
 * 根拠: 持続注意の発達段階に基づく
 */
export const GAMES_PER_STAGE_BY_AGE: Record<AgeGroup, { min: number; max: number }> = {
  '3-5':  { min: 2, max: 3 },
  '6-9':  { min: 3, max: 5 },
  '10-15': { min: 4, max: 6 },
};

/**
 * DTT（離散試行訓練）ベースの年齢別試行数
 * 根拠: Lovaas (1987), Smith (2001), CPT/CANTAB標準
 */
export const TRIALS_PER_GAME_BY_AGE: Record<AgeGroup, { min: number; max: number }> = {
  '3-5':  { min: 8,  max: 10 },
  '6-9':  { min: 10, max: 15 },
  '10-15': { min: 12, max: 20 },
};

/**
 * 習熟基準（ABA/DTTの標準）
 * 80%正答率 × 2連続セッション = 習熟
 * 根拠: Leaf & McEachin (1999)
 */
export const MASTERY_ACCURACY_THRESHOLD = 0.80;
export const MASTERY_CONSECUTIVE_SESSIONS = 2;

/**
 * 間隔反復スケジュール（Duolingo Half-Life Regression ベース）
 * 根拠: Settles & Meeder (2016)
 */
export const SPACED_REPETITION = {
  /** 初期の半減期（時間） */
  INITIAL_HALF_LIFE_HOURS: 24,
  /** 習熟時の半減期乗数（正答で延長） */
  CORRECT_MULTIPLIER: 2.0,
  /** 失敗時の半減期乗数（不正答で短縮） */
  INCORRECT_MULTIPLIER: 0.5,
  /** 復習閾値（記憶強度がこの値以下になったら復習推奨） */
  REVIEW_THRESHOLD: 0.5,
  /** 最大半減期（時間） */
  MAX_HALF_LIFE_HOURS: 720, // 30日
};

/** ゲーム間休憩時間（ms） */
export const STAGE_BREAK_DURATION_MS = 15_000; // 15秒

/** ステージ完了時の祝福画面表示時間（ms） */
export const STAGE_CELEBRATION_DURATION_MS = 5_000;
