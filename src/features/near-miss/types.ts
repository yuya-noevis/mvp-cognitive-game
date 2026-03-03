/**
 * Near-Miss Detection Types
 *
 * 「惜しい！」ニアミス判定のための型定義。
 *
 * 科学的根拠:
 * - Near-miss効果: 惜しい結果は次の試行への動機を高める (Reid, 1986)
 * - 成長マインドセット: 失敗を「学習の一部」と肯定的にフレーミング (Dweck, 2006)
 * - 連続正解ブースト維持: ニアミス時にストリークを失わないことで動機づけを維持
 */

import type { GameId, ErrorType } from '@/types';

/** ニアミス判定結果 */
export interface NearMissResult {
  /** ニアミスかどうか */
  isNearMiss: boolean;
  /** ニアミスのタイプ（ゲーム固有） */
  nearMissType: NearMissType | null;
  /** 表示メッセージ（ゲーム固有の励まし） */
  message: string | null;
}

/**
 * ゲーム共通のニアミスタイプ
 *
 * 各ゲーム固有のニアミス条件をカテゴライズ:
 * - delayed_inhibition: 抑制の途中段階（ひかりレスキュー）
 * - near_rt: RT基準値に近い反応（はやわざタッチ）
 * - span_minus_one: 系列の1要素だけ間違い（おぼえてすすむ）
 * - order_swap: 順序入れ替わり（おぼえてすすむ）
 * - perseveration: 直前ルールで正しい回答（ルールチェンジ）
 * - rotation_close: 回転角度が近い誤差（くるくるパズル）
 * - mirror_image: 鏡像選択（くるくるパズル）
 * - near_goal: ゴールに近いが到達できていない（たんけんめいろ）
 * - same_category: 同カテゴリの別単語（ことばとえほん）
 * - same_valence: valenceは合っているが具体的表情を間違え（きもちフレンズ）
 * - edge_touch: ターゲット縁に触れている（タッチアドベンチャー）
 * - shape_correct: 形は正解だが色が違う（パターンパズル）
 * - color_correct: 色は正解だが形が違う（パターンパズル）
 */
export type NearMissType =
  | 'delayed_inhibition'
  | 'near_rt'
  | 'span_minus_one'
  | 'order_swap'
  | 'perseveration'
  | 'rotation_close'
  | 'mirror_image'
  | 'near_goal'
  | 'same_category'
  | 'same_valence'
  | 'edge_touch'
  | 'shape_correct'
  | 'color_correct';

/** ニアミス判定に渡すコンテキスト（ゲームごとに異なるフィールドを使用） */
export interface NearMissContext {
  gameId: GameId;
  /** 正解 */
  correctAnswer: Record<string, unknown>;
  /** ユーザーの回答 */
  userResponse: Record<string, unknown>;
  /** エラータイプ（既存のエラー分類） */
  errorType: ErrorType;
  /** 追加のゲーム固有データ */
  extra?: Record<string, unknown>;
}

/** ニアミス判定関数のインターフェース */
export type NearMissDetector = (context: NearMissContext) => NearMissResult;

/** ニアミスではない結果を返すユーティリティ定数 */
export const NOT_NEAR_MISS: NearMissResult = {
  isNearMiss: false,
  nearMissType: null,
  message: null,
};
