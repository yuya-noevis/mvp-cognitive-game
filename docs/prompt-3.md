プロンプト1（UIリスキン）とプロンプト2（Supabase接続）が完了した前提で、
本プロンプトでは保護者ダッシュボードの全面改修、4軸認知スコアシステム、AIレポート生成、
そしてアプリ全体の仕上げを行います。

========================================
A. 4軸認知スコアシステム（最重要設計）
========================================

Manasの認知機能レポートは、保護者が「何を」「なぜ」「どう」すべきかを即座に理解できる4軸設計。

【⚠️ 絶対厳守の表示ルール ⚠️】
- 平均値、偏差値、順位、他児比較は一切表示しない
- 「○○ちゃんは平均より低い」のような比較表現は絶対禁止
- スコアは「この子自身の変化」のみを追跡
- 内部的には年齢帯基準値（norm）で正規化するが、ユーザーには見せない

【4軸の定義】

■ 軸1: スコア（Score） — 0〜100
  パフォーマンスの現在値
  算出: 正答率(35%) + 反応時間(20%) + 到達レベル(20%) + 自立度(15%) + 集中度(10%)
  表示: 数値 + 円弧グラフ + トレンド矢印（↑向上/→維持/↓注意）

■ 軸2: 信頼度（Confidence） — High / Medium / Low
  スコアの信頼性（データ量と安定性）
  - High: 7日で5セッション以上 かつ 変動係数<0.2
  - Medium: 3-4セッション or 変動係数0.2-0.4
  - Low: 2セッション以下 or 変動係数>0.4
  表示: バッジ（High=aurora, Medium=star, Low=moon）

■ 軸3: 負荷（Load） — 0〜100
  疲労・ストレス兆候
  算出: 認知負荷(40%) + 後半正答率低下(30%) + 集中度低下(30%)
  ⚠️ 誤解防止ルール:
  負荷高＋スコア低 → 「能力低下」と断定せず「負荷の影響の可能性」を優先表示
  必ず代替提案: 休憩/静かな環境/難易度を下げる

■ 軸4: 支援優先度 Need — 0〜100
  次に優先支援すべき度合い
```typescript
  function calculateNeed(score, confidence, load, trend, lastPlayedDaysAgo): number {
    let need = 0;
    need += (100 - score) * 0.35;
    if (trend === 'declining') need += 20;
    else if (trend === 'stable') need += 5;
    need += Math.min(20, lastPlayedDaysAgo * 4);
    if (load > 70) need -= 15; // 負荷高→休ませるべき
    if (confidence === 'low') need += 10; // データ不足→収集優先
    return Math.min(100, Math.max(0, Math.round(need)));
  }
```

【4軸データ構造】
```typescript
interface DomainScore {
  domain: string;
  score: number;
  scoreTrend: 'improving' | 'stable' | 'declining';
  confidence: 'high' | 'medium' | 'low';
  load: number;
  need: number;
  lastAssessedAt: string;
  sessionCount7d: number;
}
```

【15領域とゲーム対応】
| 認知領域 | ゲームID | 表示名 |
|---------|---------|--------|
| attention | hikari-catch | 注意力 |
| inhibition | matte-stop | がまん力 |
| working_memory | oboete-narabete | 作業記憶 |
| visuospatial | katachi-sagashi | 空間認知 |
| cognitive_flexibility | irokae-switch | 切り替え力 |
| processing_speed | hayawaza-touch | 処理スピード |
| memory | oboete-match | 記憶力 |
| planning | tsumitage-tower | 計画力 |
| reasoning | pattern-puzzle | 推論力 |
| problem_solving | meiro-tanken | 問題解決 |
| perceptual | kakurenbo-katachi | 知覚力 |
| language | kotoba-catch | ことば |
| social_cognition | kimochi-yomitori | 社会理解 |
| emotion_regulation | kimochi-stop | 感情調整 |
| motor_skills | touch-de-go | 運動スキル |

========================================
B. スコア算出エンジン
========================================

src/features/scoring/ を新規作成:
- cognitive-scorer.ts: セッション結果→4軸スコア算出
- norm-engine.ts: 年齢帯基準値（3-4歳/4-5歳/5-6歳）で内部正規化（UI非表示）
- need-calculator.ts: Need算出 + 全領域優先順位リスト生成

========================================
C. 保護者ダッシュボード全面改修
========================================

デザイン: stardust背景、白カード、cosmic/cometアクセント

【階層構造】
レベル1（概要）→ レベル2（領域詳細）→ レベル3（セッション詳細）

--- レベル1: 概要ビュー ---

[1-1] ヘッダー: ←もどる / アバター+名前 / 設定

[1-2] 今日のサマリー（横並び3カード）:
プレイ回数(cosmic) / プレイ時間(comet) / 成長トレンド(aurora)

[1-3] 「きょうのおすすめ」カード（★最重要）:
Need上位3領域を表示。各領域に「あそぶ→」ボタンでゲーム直接起動。