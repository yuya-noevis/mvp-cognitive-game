// ============================================
// Domain Types - 認知機能ドメイン
// ============================================

/** 15認知ドメイン */
export type CognitiveDomain =
  | 'attention'
  | 'inhibition'
  | 'working_memory'
  | 'memory'
  | 'processing_speed'
  | 'cognitive_flexibility'
  | 'planning'
  | 'reasoning'
  | 'problem_solving'
  | 'visuospatial'
  | 'perceptual'
  | 'language'
  | 'social_cognition'
  | 'emotion_regulation'
  | 'motor_skills';

/** ゲームID */
export type GameId =
  | 'hikari-catch'
  | 'matte-stop'
  | 'oboete-narabete'
  | 'katachi-sagashi'
  | 'irokae-switch'
  | 'hayawaza-touch'
  | 'oboete-match'       // 記憶 (CANTAB DMS)
  | 'tsumitage-tower'    // 計画 (Tower of London)
  | 'pattern-puzzle'     // 推論 (Raven's CPM)
  | 'meiro-tanken'       // 問題解決 (Maze Navigation)
  | 'kakurenbo-katachi'  // 知覚処理 (Embedded Figures Test)
  | 'kotoba-catch'       // 言語 (受容語彙 - PPVT型)
  | 'kimochi-yomitori'   // 社会認知 (表情認識)
  | 'kimochi-stop'       // 情動調整 (Emotional Go/No-Go)
  | 'touch-de-go';       // 運動スキル (Fitts' Law)

/** 年齢グループ（年齢別の安全策に使用） */
export type AgeGroup = '3-5' | '6-9' | '10-15';

// ============================================
// Child & Settings Types
// ============================================

export interface ChildSettings {
  sound_enabled: boolean;
  animation_speed: 'slow' | 'normal' | 'fast';
  flash_disabled: boolean;
  high_contrast: boolean;
  tap_target_size: 'normal' | 'large'; // large = 80px min for younger children
}

export const DEFAULT_CHILD_SETTINGS: ChildSettings = {
  sound_enabled: true,
  animation_speed: 'normal',
  flash_disabled: false,
  high_contrast: false,
  tap_target_size: 'normal',
};

export interface SupportNeeds {
  sensory_sensitivity?: 'low' | 'moderate' | 'high';
  motor_difficulty?: 'none' | 'moderate' | 'significant';
  attention_support?: 'minimal' | 'moderate' | 'significant';
}

export interface ConsentFlags {
  data_optimization: boolean;
  research_use: boolean;
  biometric: boolean; // Default OFF per design
}

export interface Child {
  id: string;
  anon_child_id: string;
  parent_user_id: string;
  display_name: string;
  birth_year_month?: string;
  age_group: AgeGroup;
  support_needs: SupportNeeds;
  settings: ChildSettings;
  consent_flags: ConsentFlags;
  created_at: string;
  updated_at: string;
}

// ============================================
// Session Types
// ============================================

export type SessionEndReason =
  | 'completed'
  | 'break_suggested'
  | 'user_quit'
  | 'parent_stopped';

export interface Session {
  id: string;
  anon_child_id: string;
  game_id: GameId;
  context: 'home' | 'school' | 'facility';
  started_at: string;
  ended_at?: string;
  end_reason?: SessionEndReason;
  initial_difficulty: DifficultyParams;
  final_difficulty?: DifficultyParams;
  summary: SessionSummary;
}

export interface SessionSummary {
  trial_count: number;
  correct_count: number;
  accuracy: number;
  avg_reaction_time_ms?: number;
  hints_used: number;
  breaks_taken: number;
  duration_ms: number;
}

// ============================================
// Trial Types - トライアル（1試行）
// ============================================

export type TrialPhase =
  | 'idle'
  | 'presenting'       // 刺激提示中
  | 'awaiting_response' // 応答待ち
  | 'feedback'          // フィードバック表示中
  | 'recording'         // ログ記録中
  | 'completed';

export type ErrorType =
  | 'commission'        // お手つき（No-Go時のタップ）
  | 'omission'          // 見逃し（Go時の無反応）
  | 'perseverative'     // 固執エラー（旧ルール適用）
  | 'position'          // 位置エラー（WMでの順序間違い）
  | 'selection'         // 選択エラー（間違った選択肢）
  | null;

export interface Trial {
  id: string;
  session_id: string;
  trial_number: number;
  target_domain: CognitiveDomain;
  difficulty: DifficultyParams;
  stimulus: Record<string, unknown>;
  correct_answer: Record<string, unknown>;
  response?: TrialResponse;
  is_correct?: boolean;
  reaction_time_ms?: number;
  error_type: ErrorType;
  hints_used: number;
  started_at: string;
  ended_at?: string;
}

export interface TrialResponse {
  type: 'tap' | 'withhold' | 'sequence' | 'select' | 'drag' | 'timeout';
  value: unknown;
  timestamp_ms: number;
}

// ============================================
// Difficulty / DDA Types - 難易度パラメータ
// ============================================

/** 各ゲーム固有の難易度パラメータ（共通インターフェース） */
export type DifficultyParams = Record<string, number | string>;

/** DDA調整の記録（説明可能性のため） */
export interface AdaptiveChange {
  parameter: string;
  old_value: number | string;
  new_value: number | string;
  reason: AdaptiveChangeReason;
  trigger_accuracy: number;
  trigger_window: number; // 直近何トライアルの正答率か
}

export type AdaptiveChangeReason =
  | 'accuracy_above_target'   // 正答率がターゲット上限超え
  | 'accuracy_below_target'   // 正答率がターゲット下限未満
  | 'frustration_detected'    // フラストレーション検知
  | 'calibration';            // 初回キャリブレーション

/** DDAの設定（ゲームごとに定義） */
export interface DDAConfig {
  target_accuracy_min: number;  // 0.70
  target_accuracy_max: number;  // 0.85
  window_size: number;          // 直近何トライアルで判定するか（例: 5）
  min_trials_before_adjust: number; // 調整開始前の最低トライアル数
  parameters: DDAParameterDef[];
}

export interface DDAParameterDef {
  name: string;
  type: 'numeric' | 'categorical';
  min?: number;
  max?: number;
  step?: number;              // numeric: 1ステップの変化量
  levels?: (string | number)[]; // categorical: 順序付きレベル
  initial: number | string;
  direction: 'up_is_harder' | 'down_is_harder';
}

// ============================================
// Event Log Types - 行動ログ
// ============================================

export type EventType =
  | 'session_start'
  | 'session_end'
  | 'trial_start'
  | 'trial_end'
  | 'stimulus_presented'
  | 'response'
  | 'hint_used'
  | 'adaptive_change'
  | 'pause'
  | 'resume'
  | 'break_suggested'
  | 'break_started'
  | 'break_ended'
  | 'frustration_detected';

export interface GameEvent {
  id: string;
  session_id: string;
  trial_id?: string;
  ts_ms: number;             // エポックミリ秒
  event_type: EventType;
  payload: Record<string, unknown>;
}

// ============================================
// Metrics Types - 指標
// ============================================

export type ConfidenceLevel = 'standard' | 'low_trial_count' | 'hypothesis';

export interface DailyMetric {
  id: string;
  anon_child_id: string;
  date: string;
  domain: CognitiveDomain;
  metric_name: string;
  value: number;
  confidence: ConfidenceLevel;
  method_version: string;
  session_count: number;
  trial_count: number;
}

// ============================================
// Report Types - レポート
// ============================================

export type ReportPeriod = 'session' | 'daily' | 'weekly';

export interface Report {
  id: string;
  anon_child_id: string;
  period_type: ReportPeriod;
  period_start: string;
  period_end: string;
  content: ReportContent;
  generated_at: string;
  method_version: string;
}

export interface ReportContent {
  summary: string;                      // 全体サマリ（1〜2文）
  domains: ReportDomainEntry[];
  recommendations: string[];            // 次の一手（2〜3項目）
  disclaimer: string;                   // 「支援の参考指標です」免責
}

export interface ReportDomainEntry {
  domain: CognitiveDomain;
  domain_label: string;                 // 日本語名
  trend: 'improving' | 'stable' | 'needs_support';
  trend_description: string;            // 「前回より○○の傾向が見られました」
  metrics: { name: string; label: string; value: number; unit: string }[];
  confidence: ConfidenceLevel;
}

// ============================================
// Safety Types - 安全検知
// ============================================

export type FrustrationSignal =
  | 'consecutive_errors'     // 連続誤答
  | 'response_timeout'       // 長時間無反応
  | 'rapid_random_taps'      // ランダムな高速タップ（投げやり兆候）
  | 'session_too_long';      // セッション時間超過

export interface SafetyAction {
  type: 'reduce_difficulty' | 'show_hint' | 'suggest_break' | 'end_session';
  reason: FrustrationSignal;
  timestamp_ms: number;
}

// ============================================
// Game Config Type - ゲーム共通設定
// ============================================

export interface GameConfig {
  id: GameId;
  name: string;                         // 日本語ゲーム名
  primary_domain: CognitiveDomain;
  secondary_domains: CognitiveDomain[];
  dda: DDAConfig;
  trial_count_range: { min: number; max: number };
  /** ステージモード時の年齢別試行数（DTTベース） */
  stage_trial_count?: Record<AgeGroup, number>;
  age_adjustments: Record<AgeGroup, Partial<DifficultyParams>>;
  safety: {
    consecutive_error_threshold: number;  // 連続誤答何回でヒント/休憩
    max_session_duration_ms: number;
    inactivity_timeout_ms: number;
  };
}

// ============================================
// Stage System Types - ステージ制
// ============================================

/** ステージ制設定 */
export interface StageConfig {
  /** 年齢別の1ステージ所要時間（ms） */
  duration_ms: Record<AgeGroup, { min: number; max: number }>;
  /** 年齢別の1ステージあたりゲーム数 */
  games_per_stage: Record<AgeGroup, { min: number; max: number }>;
  /** 年齢別のDTTベース試行数 */
  trials_per_game: Record<AgeGroup, { min: number; max: number }>;
}

/** ステージ進捗管理 */
export interface StageSession {
  id: string;
  anon_child_id: string;
  stage_id: string;
  stage_number: number;
  games: StageGameEntry[];
  current_game_index: number;
  started_at: string;
  ended_at?: string;
  is_completed: boolean;
}

export interface StageGameEntry {
  game_id: GameId;
  domain: CognitiveDomain;
  trial_count: number;
  is_completed: boolean;
  is_review: boolean;  // 間隔反復による復習ゲーム
  accuracy?: number;
}

/** 習熟判定基準（ABA/DTT標準） */
export interface MasteryCriteria {
  /** 習熟に必要な正答率（デフォルト: 0.80） */
  accuracy_threshold: number;
  /** 連続セッション数（デフォルト: 2） */
  consecutive_sessions: number;
}

/** ドメインごとの習熟レベル（5段階） */
export type MasteryLevel = 1 | 2 | 3 | 4 | 5;

// ============================================
// Biometric Types - 生体情報
// ============================================

/** Biometric input for DDA integration */
export interface BiometricInput {
  attentionScore?: number;   // 0-100
  cognitiveLoad?: number;    // 0-100
  arousalLevel?: number;     // 0-100
}

/** Biometric snapshot for DB storage */
export interface BiometricSnapshot {
  sessionId: string;
  anonChildId: string;
  tsMs: number;
  pupilDiameter?: number;
  heartRateBpm?: number;
  attentionScore?: number;
  cognitiveLoad?: number;
  arousalLevel?: number;
  rawData?: Record<string, unknown>;
}

// ============================================
// 4-Axis Cognitive Score Types - 4軸認知スコア
// ============================================

/** Score trend direction */
export type ScoreTrend = 'improving' | 'stable' | 'declining';

/** Confidence level for score reliability */
export type ScoreConfidence = 'high' | 'medium' | 'low';

/** 4-axis domain score (Score / Confidence / Load / Need) */
export interface DomainScore {
  domain: CognitiveDomain;
  score: number;           // 0-100: performance
  scoreTrend: ScoreTrend;
  confidence: ScoreConfidence;
  load: number;            // 0-100: fatigue/stress
  need: number;            // 0-100: support priority
  lastAssessedAt: string;
  sessionCount7d: number;
}

/** ドメイン進捗追跡 */
export interface DomainProgress {
  domain: CognitiveDomain;
  game_id: GameId;
  level: MasteryLevel;
  consecutive_mastery_sessions: number;
  last_accuracy: number;
  last_played_at?: string;
  /** 間隔反復: 次回復習推奨日 */
  next_review_at?: string;
  /** Half-Life Regression: 記憶の半減期（時間） */
  half_life_hours: number;
}
