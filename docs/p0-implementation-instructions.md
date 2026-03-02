# P0 実装指示書 — Manas 設計書v3ベース

> **実行方法**: Claude Code Agent Teams（5 teammates + leader）で実行
> **参照必須**: `docs/game-design-v3.md`（設計の全仕様）
> **モデル**: 全員 sonnet を使用（コスト抑制）
> **前提**: `CLAUDE.md` を必ず先に読み、プロジェクトの既存構造を理解した上で着手すること

---

## チーム構成

| Teammate | 担当 | 成果物 |
|----------|------|--------|
| 1 | ゲーム記録保存バグ修正 | 修正コード + 動作確認ログ |
| 2 | オンボーディング再設計（Phase 1-3） | 新オンボーディングフロー |
| 3 | 感覚過敏コントロールUI | 設定画面 + useSettings hook |
| 4 | 移行期予告UI | トランジションコンポーネント群 |
| 5 | ストリーク保護バッファ + DDAパラメータ更新 | ストリーク保護ロジック + DDA設定更新 |

**リーダー**: 全員の完了後、`npm run build` と `tsc --noEmit` で統合ビルド確認。コンフリクト解消。

---

## Teammate 1: ゲーム記録保存バグ修正

### 背景
ゲームプレイ記録がSupabaseに保存されない問題が残っている可能性がある。過去2回修正を試みたが（コミット `7f7bac9`, `21e5699`）、完全に解決したか未確認。DDA・レポート・保護者ダッシュボードの全機能がこのデータに依存するため、最優先で修正する。

### タスク

#### Step 1: 現状の保存フローを調査
```
必ず以下のファイルを確認:
- src/ 配下で "game_records" "gameRecord" "saveRecord" "insertRecord" 等を含むファイルをgrepで検索
- useGameSession hook（もしくはゲーム終了時の保存処理を行う共通関数）を特定
- 混合セッション（/session/play）のゲーム完了コールバック内で保存関数が呼ばれているか確認
- フリープレイ（/game/[integratedId]）のゲーム完了コールバック内で保存関数が呼ばれているか確認
```

#### Step 2: 保存が失敗する原因を特定
```
以下の原因を順番にチェック:
1. childId が null/undefined のまま保存関数が呼ばれていないか
   → Supabaseからの取得が非同期で、ゲーム終了時にまだ取得完了していない可能性
2. supabase.from('テーブル名').insert() / .upsert() が実際に実行されているか
   → try-catch でエラーが握りつぶされていないか
3. 書き込み先テーブル/カラムと、ダッシュボードの読み取りクエリが一致しているか
4. RLS (Row Level Security) ポリシーが書き込みをブロックしていないか
```

#### Step 3: 修正実装
```
修正方針:
1. childId が確実に取得された後でのみ保存処理を実行するガードを入れる
2. 保存処理に明示的なエラーログを追加（console.error で data と error を両方出力）
3. 混合セッションのゲーム完了コールバック内で記録保存関数が呼ばれていなければ追加
4. フリープレイのゲーム完了コールバックも同様に確認・修正
```

#### Step 4: 検証
```
1. npm run build && tsc --noEmit でビルドエラーなし
2. ローカルで1ゲームプレイ → ブラウザDevToolsでSupabaseへのPOSTリクエストが飛んでいること
3. Supabase管理画面で該当テーブルにレコードが挿入されていること（可能なら）
4. ダッシュボードの「きろく」タブに反映されること
```

### コミットメッセージ
```
fix: ensure game records are saved to Supabase after every session
```

---

## Teammate 2: オンボーディング再設計

### 背景
現在のオンボーディングは25画面・サインアップファーストで、TTV（価値実感時間）が業界最低水準。設計書v3 Section 15 に基づき、3画面でゲーム体験 → サインアップ後置に再設計する。

### 重要な制約
- **既存の25画面のコードは削除しない**。Phase 5（任意の詳細情報）として保護者ダッシュボードから後日アクセスできるようにする
- 既存のオンボーディングの `useOnboarding` hook や状態管理の仕組みを調査した上で、最小限の変更で実現する

### タスク

#### Step 1: 既存オンボーディングの構造を調査
```
以下を調査:
- src/ 配下で "onboarding" を含むファイルを全て特定
- 現在の画面遷移フロー（何画面あるか、どのコンポーネントが何を担当しているか）を把握
- useOnboarding hook のステート管理（currentStep, totalSteps等）を理解
- サインアップ処理がどの画面のどの関数で実行されているかを特定
```

#### Step 2: 新フローの実装
```
【Phase 1: 高速開始（3画面）】
- Screen 1: 生年月日選択（既存コンポーネントを流用）→ AgeGroup自動判定
- Screen 2: 名前入力（既存コンポーネントを流用。ニックネームOK）
- Screen 3: 発話レベル選択（既存コンポーネントを流用。アイコン付き）

Phase 1完了後、ゲーム体験画面（Phase 2）に遷移。
この時点ではまだアカウント未作成。入力データはローカルstate（またはlocalStorage）に保持。

【Phase 2: 初回ゲーム体験 = キャリブレーション】
- 簡易版のゲーム体験画面を作成（既存GameShellを埋め込み可能か調査）
- 年齢に応じた1ゲーム × 3-5試行のデモプレイを提供
- 完了後に「よくできました！」の結果画面を表示

【Phase 3: アカウント作成（任意）】
- 「進捗を保存するには登録してください」のプロンプト
- スキップボタンあり → スキップした場合は匿名セッションとしてホーム画面へ
- サインアップした場合はPhase 1で入力したデータをSupabaseに保存
```

#### Step 3: 既存25画面をPhase 5として移行
```
- 既存のオンボーディング画面群を /settings/profile または /dashboard/profile 配下に移動
- 「プロフィールを充実させる」ボタンをダッシュボードに追加
- 認知ドメイン質問8問（旧Screen 7-14）のコンポーネントは残すが、
  オンボーディングフローからは除外（Phase 5の任意入力としてのみアクセス可能に）
```

#### Step 4: フロー遷移の管理
```
- useOnboarding hook を改修し、新フロー（3画面 → ゲーム体験 → サインアップ）を管理
- 既存のプログレスバー（CosmicProgressBar）を3画面用に調整
- Phase 1完了フラグ、Phase 2完了フラグ、アカウント作成済みフラグを管理
```

### 検証
```
1. npm run build && tsc --noEmit でビルドエラーなし
2. 初回アクセス → 3画面（生年月日→名前→発話レベル）→ ゲーム体験画面に遷移すること
3. ゲーム体験後 → サインアップ画面が表示されること（スキップ可能）
4. サインアップスキップ → ホーム画面に到達すること
5. サインアップ実行 → アカウント作成されホーム画面に到達すること
6. 既存の25画面がダッシュボード等から引き続きアクセス可能なこと
```

### コミットメッセージ
```
feat: redesign onboarding - 3 screens + signup deferred (v3 Section 15)
```

---

## Teammate 3: 感覚過敏コントロールUI

### 背景
ASDの37-69%が聴覚過敏。現状はフィードバックの音量・アニメーション速度等がハードコードされており、感覚過敏のあるユーザーが調整できない。設計書v3 Section 10「感覚過敏コントロールUI」に基づき実装する。

### タスク

#### Step 1: 既存の設定・音声・アニメーション管理を調査
```
以下を調査:
- src/ 配下で "settings" "sound" "audio" "animation" "volume" "vibration" を含むファイル
- 現在のフィードバック音・BGM・アニメーションがどこで管理されているか
- 既存の設定画面があるか（歯車アイコン等）
```

#### Step 2: useSettings hook の作成
```typescript
// src/hooks/useSettings.ts（新規作成 or 既存拡張）

interface SensorySettings {
  bgm: 'on' | 'off';
  soundEffectVolume: 'high' | 'normal' | 'low' | 'off';
  animationSpeed: 'normal' | 'slow' | 'none';
  vibration: 'on' | 'off';
}

const DEFAULT_SETTINGS: SensorySettings = {
  bgm: 'on',
  soundEffectVolume: 'normal',
  animationSpeed: 'normal',
  vibration: 'on',
};

// Supabase の children テーブル or 専用テーブルに保存
// 未ログイン時はローカルstateで保持
```

#### Step 3: 設定画面UIの作成
```
- 歯車アイコンからアクセスできる設定画面（モーダルまたはページ）
- 各設定項目をトグル/セレクターで表示
- 子どもが誤操作しないよう、設定画面への遷移に「保護者確認」（簡易的なもの）を入れる
  （例: 「設定を変えるには、画面上部の数字を長押ししてください」）
- 設定変更時は即時反映（ページリロード不要）

UI仕様:
- BGM: トグルスイッチ（オン/オフ）
- 効果音: 4段階セレクター（大/普通/小/オフ）。アイコン付き
- アニメーション: 3段階セレクター（ふつう/ゆっくり/なし）
- 振動: トグルスイッチ（オン/オフ）
```

#### Step 4: 全ゲームへの設定反映
```
- useSettings hook を各ゲームコンポーネントで呼び出し
- BGMオフ時: BGM再生をスキップ
- 効果音: 音量レベルに応じて Web Audio API or HTMLAudioElement の volume を調整
- アニメーション速度: CSS変数 --animation-duration を設定に応じて変更
  - normal: デフォルト値
  - slow: デフォルト × 2.0
  - none: duration を 0ms に設定（即時表示）
- 振動オフ: navigator.vibrate() の呼び出しをスキップ
- prefers-reduced-motion メディアクエリへの対応も追加
```

#### Step 5: 色彩チェック
```
全ゲームのCSSを確認し:
- 赤色（#FF0000系）が使われていないこと（実装済みのはず → 確認のみ）
- 高彩度色の彩度が60%以下であること
- 3回/秒以上の点滅アニメーションがないこと
問題があれば修正
```

### 検証
```
1. npm run build && tsc --noEmit でビルドエラーなし
2. 設定画面が開けること
3. BGMオフ → ゲーム中にBGMが鳴らないこと
4. 効果音オフ → ゲーム中に効果音が鳴らないこと
5. アニメーション「なし」→ アニメーションが即時完了すること
6. 設定がページ遷移後も保持されること（Supabase or ローカル）
```

### コミットメッセージ
```
feat: add sensory settings UI - BGM, sound, animation, vibration controls (v3 Section 10)
```

---

## Teammate 4: 移行期予告UI

### 背景
ASD児は活動の切り替え（トランジション）に困難を抱える。セッション終了やゲーム切り替え時に予告なく遷移すると、不安やパニックを引き起こす可能性がある。設計書v3 Section 10「移行期予告UI」に基づき実装する。

### タスク

#### Step 1: 既存のセッション・ゲーム遷移フローを調査
```
以下を調査:
- 混合セッション内でゲームAからゲームBに切り替わるタイミングと処理
- セッション完了時の画面遷移処理
- 既存のトランジション演出（あれば）
- セッションの残り時間管理（あれば）
```

#### Step 2: ゲーム切り替え予告コンポーネントの作成
```typescript
// src/components/transitions/GameTransition.tsx（新規作成）

interface GameTransitionProps {
  nextGameName: string;      // 次のゲーム名（日本語）
  nextGameIcon?: string;     // 次のゲームのアイコン/絵
  duration?: number;         // 表示時間（デフォルト3000ms）
  onComplete: () => void;    // 遷移完了コールバック
}

// 表示内容:
// 「つぎは ○○ だよ」+ 次ゲームの絵カード
// 3秒間表示 → onComplete呼び出し → 次のゲームへ

// デザイン:
// - 背景: 現在のテーマカラー（宇宙テーマ等）
// - 中央に次ゲームのアイコンと名前を大きく表示
// - マスコット（Luna）が手を振るアニメーション
// - プログレスバー（3秒のカウントダウン）を画面下部に表示
```

#### Step 3: セッション終了予告コンポーネントの作成
```typescript
// src/components/transitions/SessionEndWarning.tsx（新規作成）

interface SessionEndWarningProps {
  remainingMinutes: number;  // 残り分数
}

// セッション終了3分前:
// 画面上部にトースト表示「もうすぐ おわるよ」
// 最後のゲーム完了時にフルスクリーン遷移画面:
// 「またあした！よく がんばったね」
// + カレンダービジュアル（今日のマス完了表示）
// + 植物の今日の成長状態
```

#### Step 4: セッション完了画面の作成
```typescript
// src/components/transitions/SessionComplete.tsx（新規作成）

// 表示内容:
// 1. 「よく がんばったね！」のメッセージ
// 2. 今日プレイしたゲーム数と獲得スター
// 3. 植物の成長アニメーション（成長した場合）
// 4. 「またあした」ボタン → ホーム画面へ

// デザイン:
// - ポジティブな色調（紫系、Manasのブランドカラー）
// - マスコットが拍手するアニメーション
// - 自動遷移なし（子どもが「またあした」をタップするまで表示し続ける）
```

#### Step 5: 既存のセッションフローに組み込み
```
- 混合セッションのゲーム切り替えポイントに GameTransition を挿入
  → ゲームA完了 → GameTransition（3秒）→ ゲームB開始
- セッション終了前に SessionEndWarning を表示
- セッション完了時に SessionComplete を表示
  → 既存の完了画面があれば置き換える or 拡張する
```

### 検証
```
1. npm run build && tsc --noEmit でビルドエラーなし
2. 混合セッションでゲーム切り替え時に「つぎは○○だよ」が3秒間表示されること
3. セッション完了時に「よくがんばったね」画面が表示されること
4. 「またあした」ボタンでホーム画面に戻れること
5. 各コンポーネントが感覚過敏設定（アニメーション速度）を尊重すること
```

### コミットメッセージ
```
feat: add transition warnings for game switches and session end (v3 Section 10)
```

---

## Teammate 5: ストリーク保護バッファ + DDAパラメータ更新

### 背景
2つのタスクを担当する。
1. ストリーク保護: 7日以上のストリーク保持者に週1回の猶予日を付与（Day7-30リテンション+15-25%）
2. DDAパラメータ: ID重度のターゲット正答率を85→90%に引き上げ + 試行間インターバルの障害別設定を追加

### タスク A: ストリーク保護バッファ

#### Step 1: 既存のストリーク管理を調査
```
以下を調査:
- src/ 配下で "streak" "plant" "growth" を含むファイル
- 現在のストリーク計算ロジック（連続プレイ日数の計算方法）
- ダッシュボード上でのストリーク表示コンポーネント
- 植物成長システムが実装済みかどうか
```

#### Step 2: ストリーク保護ロジックの実装
```typescript
// 既存のストリーク管理ファイルに追加（または新規作成）

interface DailyStreak {
  currentDays: number;           // 連続プレイ日数
  growthLevel: 1 | 2 | 3 | 4 | 5;  // 植物成長レベル
  lastPlayedDate: string;        // YYYY-MM-DD
  graceAvailableThisWeek: boolean; // 今週の猶予が使用可能か
  graceUsedThisWeek: boolean;    // 今週の猶予を使用済みか
}

function calculateStreak(sessionDates: string[], today: string): DailyStreak {
  // ロジック:
  // 1. 連続プレイ日数が7日以上の場合、graceAvailableThisWeek = true
  // 2. 1日プレイしなかった日がある場合:
  //    - 猶予未使用 → 猶予を消費。ストリーク維持、成長レベル変更なし
  //    - 猶予使用済み → 通常通り成長レベル -1（最低1）
  // 3. 毎週月曜日に graceUsedThisWeek をリセット
  // 4. 成長レベルの計算:
  //    - プレイした日: +1（最大5）
  //    - プレイしなかった日（猶予なし）: -1（最低1）
  //    - プレイしなかった日（猶予使用）: 変更なし
}
```

#### Step 3: UI表示の更新
```
- ストリーク表示コンポーネントに「猶予日」の表示を追加
- 猶予日使用時: 「おやすみしたけどストリーク続いてるよ！」のメッセージ
- 毎週月曜のセッション開始時: 「今週は1回お休みができます」のメッセージ
```

### タスク B: DDAパラメータ更新

#### Step 1: DDA設定ファイルを調査
```
以下を調査:
- src/ 配下で "dda" "DDA" "difficulty" "targetAccuracy" "successRate" を含むファイル
- 障害種別ごとのターゲット正答率がどこで定義されているか
- 試行間インターバル（ITI）の設定がどこで管理されているか
```

#### Step 2: ID重度のターゲット正答率を更新
```
変更前: ID重度 = { min: 0.85, max: 0.95 }
変更後: ID重度 = { min: 0.90, max: 0.95 }

根拠: Errorless Learning原則。ID重度児はエラーからの学習効率が低く、
90%以上の成功率維持が動機づけと学習効率の両方に有効。
```

#### Step 3: 試行間インターバル（ITI）の障害別設定を追加
```typescript
// DDA設定に追加

const ITI_BY_DISABILITY = {
  ADHD:      { min: 1000, max: 1500 },  // ms。速いペースで注意維持
  ASD:       { min: 1500, max: 2000 },  // 処理時間の余裕を確保
  ID_MILD:   { min: 2000, max: 2500 },  // 処理速度低下への配慮
  ID_SEVERE: { min: 3000, max: 4000 },  // 処理速度の大きな違いを考慮
};

// 試行完了後、次の試行開始までの待ち時間にこのITIを適用
// 既存のゲームループで、試行間に setTimeout or delay を挿入
```

#### Step 4: 既存ゲームへのITI適用
```
- 各ゲームの試行ループ（正解/不正解処理後 → 次の試行開始）にITIを挿入
- ITIの値はuserプロファイルの障害種別から自動取得
- 障害種別が未設定の場合はデフォルト値（1500ms）を使用
```

### 検証
```
1. npm run build && tsc --noEmit でビルドエラーなし
2. ストリーク保護:
   - 7日連続プレイ後、1日休んでもストリークが維持されること
   - 同じ週に2日休んだ場合は2日目で成長レベルが下がること
   - ダッシュボードで猶予日の状態が確認できること
3. DDA:
   - ID重度プロファイルのユーザーでターゲット正答率が90-95%になっていること
   - 試行間のインターバルが障害種別に応じて変わること
```

### コミットメッセージ
```
feat: add streak grace buffer + update DDA params for ID-severe (v3 Sections 6, 11)
```

---

## リーダータスク: 統合確認

全5チームメイトの作業完了後:

1. **ビルド確認**
```bash
npm run build
tsc --noEmit
```

2. **コンフリクト解消**
- 各チームメイトが同じファイルを編集した場合、手動でマージ
- 特に注意: useOnboarding hook（Teammate 2）と設定系（Teammate 3）が共通のレイアウトコンポーネントに触る可能性

3. **統合テスト**
```
- 新規ユーザーとして初回アクセス → 3画面オンボーディング → ゲーム体験 → ホーム到達
- ゲームプレイ → 記録が保存されること
- 設定画面 → 感覚過敏設定が変更・反映されること
- 混合セッション → ゲーム切り替え時に予告が表示されること
- セッション完了 → 完了画面が表示されること
```

4. **コミット・プッシュ**
```bash
git add -A
git commit -m "feat: P0 implementation - onboarding, sensory settings, transitions, streak, DDA (v3)"
git push origin main
```

---

## 共通ルール（全チームメイト必読）

### 技術スタック
- Next.js (App Router) + TypeScript + Supabase + Tailwind CSS
- コンポーネントは React functional components + hooks
- スタイリングは Tailwind CSS（inline styles は避ける）

### コーディング規約
- TypeScript strict mode。any 型は禁止
- コンポーネント名は PascalCase、hook は use~ で始める
- 日本語コメントOK（ユーザーが日本語話者のため）
- console.log はデバッグ用に一時的に使用可。最終的には削除

### 既存コードを壊さない
- 既存のゲームロジックには極力触れない
- 新機能は新ファイルに実装し、既存ファイルからは import で呼び出す
- 既存のテーブル構造を変更する場合は、Supabase migration を作成する

### ビルド確認
- 作業完了時に必ず `npm run build` と `tsc --noEmit` を実行
- エラーがある場合は修正してからコミット
