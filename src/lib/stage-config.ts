import type { AgeGroup, CognitiveDomain, GameId, StageConfig } from '@/types';
import {
  STAGE_DURATION_BY_AGE,
  GAMES_PER_STAGE_BY_AGE,
  TRIALS_PER_GAME_BY_AGE,
  SPACED_REPETITION,
} from './constants';

/**
 * ステージ制設定
 *
 * 設計根拠：
 * - TEACCH構造化教育: 予測可能な構造、ビジュアルスケジュール
 * - 行動モメンタム理論 (Nevin et al., 1983): 得意→苦手の順序で成功体験を先行させる
 * - Half-Life Regression (Settles & Meeder, 2016): 間隔反復による復習タイミング
 */

export const STAGE_CONFIG: StageConfig = {
  duration_ms: STAGE_DURATION_BY_AGE,
  games_per_stage: GAMES_PER_STAGE_BY_AGE,
  trials_per_game: TRIALS_PER_GAME_BY_AGE,
};

/**
 * ドメインの出現順序定義
 *
 * TEACCH構造化原則：得意領域 → 苦手領域のサンドイッチ配置
 * 行動モメンタム理論：高成功率タスクで「勢い」をつけてから挑戦タスクへ
 *
 * デフォルトの順序（子どもの強み・弱みがまだ不明な場合の一般的順序）
 * - 処理速度・注意（比較的取り組みやすい）→ 記憶・推論（中程度）→ 社会認知・言語（挑戦的）
 */
export const DEFAULT_DOMAIN_ORDER: CognitiveDomain[] = [
  'processing_speed',      // 簡単で即座に成功体験
  'attention',             // 比較的取り組みやすい
  'motor_skills',          // 身体的、楽しい
  'working_memory',        // 中程度の認知負荷
  'visuospatial',          // 視覚的で直感的
  'memory',                // 記憶系
  'perceptual',            // 知覚処理
  'inhibition',            // 実行機能（やや難）
  'cognitive_flexibility', // 実行機能（やや難）
  'planning',              // 高次実行機能
  'reasoning',             // 高次推論
  'problem_solving',       // 問題解決
  'emotion_regulation',    // 情動系
  'social_cognition',      // 社会認知
  'language',              // 言語系
];

/** ドメインに対応するデフォルトゲームID */
export const DOMAIN_TO_GAME: Record<CognitiveDomain, GameId> = {
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

/**
 * 間隔反復: 記憶強度の計算（Half-Life Regression）
 *
 * p(recall) = 2^(-t/h) where t = 経過時間, h = 半減期
 * 根拠: Settles & Meeder (2016) "A Trainable Spaced Repetition Model for Language Learning"
 */
export function computeRecallProbability(
  elapsedHours: number,
  halfLifeHours: number,
): number {
  return Math.pow(2, -elapsedHours / halfLifeHours);
}

/**
 * 半減期の更新
 * 正答で延長、不正答で短縮
 */
export function updateHalfLife(
  currentHalfLife: number,
  wasCorrect: boolean,
): number {
  const multiplier = wasCorrect
    ? SPACED_REPETITION.CORRECT_MULTIPLIER
    : SPACED_REPETITION.INCORRECT_MULTIPLIER;

  const newHalfLife = currentHalfLife * multiplier;
  return Math.min(newHalfLife, SPACED_REPETITION.MAX_HALF_LIFE_HOURS);
}

/**
 * 復習が必要かどうかを判定
 */
export function needsReview(
  elapsedHours: number,
  halfLifeHours: number,
): boolean {
  const recallProb = computeRecallProbability(elapsedHours, halfLifeHours);
  return recallProb < SPACED_REPETITION.REVIEW_THRESHOLD;
}

/**
 * 個人化されたドメイン順序の生成
 *
 * 行動モメンタム理論に基づき、強みドメインを先に配置：
 * 1. 正答率の高いドメインを先に（成功体験でモメンタム構築）
 * 2. 苦手ドメインは間に挟む（サンドイッチ配置）
 * 3. 楽しい活動で終了（ポジティブな終了体験）
 */
export function generatePersonalizedDomainOrder(
  domainAccuracies: Partial<Record<CognitiveDomain, number>>,
): CognitiveDomain[] {
  const domains = [...DEFAULT_DOMAIN_ORDER];

  // 正答率データがあるドメインをソート
  const withData = domains.filter(d => domainAccuracies[d] !== undefined);
  const withoutData = domains.filter(d => domainAccuracies[d] === undefined);

  // 得意順にソート
  withData.sort((a, b) => (domainAccuracies[b] ?? 0) - (domainAccuracies[a] ?? 0));

  // サンドイッチ配置: 得意 → 苦手 → 得意 → 苦手...
  const strong = withData.filter(d => (domainAccuracies[d] ?? 0) >= 0.7);
  const weak = withData.filter(d => (domainAccuracies[d] ?? 0) < 0.7);

  const result: CognitiveDomain[] = [];
  let si = 0, wi = 0;

  // 得意で開始
  while (si < strong.length || wi < weak.length) {
    if (si < strong.length) result.push(strong[si++]);
    if (wi < weak.length) result.push(weak[wi++]);
  }

  // データなしのドメインはデフォルト順序で追加
  result.push(...withoutData);

  return result;
}

/**
 * ステージに含めるゲームを選択
 */
export function selectGamesForStage(
  ageGroup: AgeGroup,
  domainOrder: CognitiveDomain[],
  reviewDomains: CognitiveDomain[],
): { gameId: GameId; domain: CognitiveDomain; isReview: boolean }[] {
  const { min, max } = GAMES_PER_STAGE_BY_AGE[ageGroup];
  const targetCount = Math.floor((min + max) / 2);

  const games: { gameId: GameId; domain: CognitiveDomain; isReview: boolean }[] = [];

  // まず復習ゲームを挿入（最大1-2個）
  const reviewCount = Math.min(reviewDomains.length, Math.floor(targetCount / 3));
  for (let i = 0; i < reviewCount; i++) {
    const domain = reviewDomains[i];
    games.push({
      gameId: DOMAIN_TO_GAME[domain],
      domain,
      isReview: true,
    });
  }

  // 残りは新規ドメインから
  const remaining = targetCount - games.length;
  let domainIdx = 0;
  for (let i = 0; i < remaining && domainIdx < domainOrder.length; domainIdx++) {
    const domain = domainOrder[domainIdx];
    if (!games.some(g => g.domain === domain)) {
      games.push({
        gameId: DOMAIN_TO_GAME[domain],
        domain,
        isReview: false,
      });
      i++;
    }
  }

  return games;
}
