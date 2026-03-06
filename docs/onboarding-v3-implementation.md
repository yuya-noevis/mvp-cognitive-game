# Manas オンボーディング v3 実装指示書

**対象ファイル:** `src/app/onboarding/v2/` 以下を改修  
**優先度:** P0  
**前提:** onboarding-design-v1.md + 本指示書が正仕様。既存v2実装を本指示書に従い改修すること。

---

## 概要：変更点サマリー

| 変更項目 | 旧v2 | 新v3 |
|---------|------|------|
| 呼び方設定 | なし（固定で「くん」） | Screen 1に追加（くん/ちゃん/名前のみ） |
| 診断・特性情報 | Phase 6-P3（1ヶ月後） | Phase 1 Screen 5（基本情報内） |
| 困りごと選択上限 | 3項目 | 7項目 |
| 深刻度確認 | 頻度（1画面・1項目のみ） | 深刻度5段階（選択した全項目を1つずつ） |
| 目標設定 | なし | Phase 3キャリブレーション後に追加 |
| キャリブレーション | 必須 | スキップ可（スキップ時は暫定Tier 1） |
| Phase 6後置アセスメント | P1/P2/P3の3段階 | 廃止・Phase 1〜2に統合 |
| 呼称 | 固定「くん」 | 保護者が選択した呼び方を全画面で使用 |

---

## 完成形フロー

```
Phase 1: 基本情報（6画面・約2分）
  Screen 1: 年齢・名前・呼び方
  Screen 2: 発話レベル
  Screen 3: タブレット操作
  Screen 4: 聴覚過敏
  Screen 5: 診断・特性情報（複数選択）
  Screen 6: （削除 → 目標設定はPhase 3後に移動）

Phase 2: 困りごとアセスメント（最大8画面・約2分）
  Screen 7: 困りごと選択（最大7項目）
  Screen 8〜14: 深刻度確認（選択項目数分・各1画面）

Phase 3: キャリブレーション（約3分）
  案内画面: 保護者向け説明
  キャラ選択
  3試行（スキップ可）
  目標設定画面（Tier判定確定後に表示）

Phase 4: アカウント作成（任意・スキップ可）

Phase 5: ホーム到着＋期待値設定（2枚スワイプ）
```

---

## Phase 1: 基本情報

### Screen 1: 年齢・名前・呼び方

**変更点:** 呼び方選択を追加

```typescript
// data に追加
nickname: string;        // 既存
honorific: 'kun' | 'chan' | 'name_only';  // 新規追加

// 表示ヘルパー関数（全画面共通で使用）
function getChildName(name: string, honorific: string): string {
  if (!name || honorific === 'name_only') return name || 'お子さま';
  if (honorific === 'kun') return `${name}くん`;
  if (honorific === 'chan') return `${name}ちゃん`;
  return name;
}
```

**UI:**
- 年齢・名前は既存維持
- 呼び方は名前入力欄の下に3択ボタンで追加
  - 「〜くん」「〜ちゃん」「名前で呼ぶ」
- 名前未入力時は呼び方選択を非表示（名前が確定してから表示）
- プレビュー表示: 選択すると「○○くんとお呼びしますね」と即座に表示

**重要:** 以降の全画面・全メッセージで `getChildName()` を使用すること。ハードコードの「くん」を全て置き換える。

---

### Screen 2〜4: 発話レベル・タブレット操作・聴覚過敏

既存実装を維持。変更なし。

---

### Screen 5: 診断・特性情報（新規追加）

**目的:** DDA上限制御・ゲームロック設定の入力データ

**設問:**
> 「お子さまについて、あてはまるものを選んでください（複数選択可）」

**選択肢:**（複数選択可・任意）

| アイコン | 選択肢 | 内部タグ |
|--------|--------|---------|
| 🔵 | ASD（自閉スペクトラム症） | `asd` |
| 🟡 | ADHD（注意欠如・多動症） | `adhd` |
| 🟣 | 知的障害・発達の遅れ | `id` |
| 🟢 | 学習障害（LD・読み書き等） | `ld` |
| ⚪ | グレーゾーン・未診断 | `undiagnosed` |
| ❓ | まだわからない・検査中 | `unknown` |

**重度ID判定のための追加設問:**  
「知的障害・発達の遅れ」を選択した場合のみ追加表示：

> 「どの程度の遅れがありますか？」
> - 軽度（日常会話ができる）→ `id_mild`
> - 中度（簡単な言葉は理解できる）→ `id_moderate`  
> - 重度（言葉の理解が難しい）→ `id_severe`
> - わからない → `id_unknown`

**スキップ:** 「わからない・スキップ」ボタンを目立たない位置に配置

**DDA連携ロジック（既存 `determineTier` に追加）:**
```typescript
// Phase 6-P3の診断情報フィールドに書き込む（後方互換性維持）
if (diagnosis.includes('id_severe')) {
  profile.diagnosis = ['id'];
  profile.id_severity = 'severe';
  // Tier上限2に制限・DDAターゲット正答率90-95%
}
if (diagnosis.includes('id_moderate')) {
  profile.diagnosis = ['id'];
  // Tier3のStop-signal/backwardをロック
}
```

---

## Phase 2: 困りごとアセスメント

### Screen 7: 困りごと選択（既存Screen 5を改修）

**変更点:**
- 選択上限: 3項目 → **7項目**
- 確定ボタンのコピー変更: 「選択を確定する」→「次へ（選んだ順に確認します）」
- 選択後バナー削除（次画面で深刻度を聞くので不要）

**選択肢:** 既存8項目を維持

**内部処理:** 選択した順序を保持すること（`concernTags: string[]` の配列順）

---

### Screen 8〜14: 深刻度確認（既存Screen 6を抜本改修）

**設計:** 選択した困りごとの数だけ画面を生成（最大7画面）

**各画面の構成:**

**ヘッダー:** 「X / Y」（例: 1 / 3）進捗表示

**設問タイトル:** 困りごとカテゴリに応じた自然言語の問いかけ

```typescript
const SEVERITY_QUESTIONS: Record<string, string> = {
  emotion_regulation: `気持ちの切り替えが難しい場面で、${childName}はどのくらい困っていますか？`,
  attention: `集中が続かず気が散ってしまうことで、${childName}はどのくらい困っていますか？`,
  communication: `言葉でのやりとりの難しさで、${childName}はどのくらい困っていますか？`,
  social: `友達や人との関わりの難しさで、${childName}はどのくらい困っていますか？`,
  learning: `読み書きや学習の難しさで、${childName}はどのくらい困っていますか？`,
  motor: `手先の不器用さや身体の使い方で、${childName}はどのくらい困っていますか？`,
  flexibility: `予定や変化への対応の難しさで、${childName}はどのくらい困っていますか？`,
  memory: `物事を覚えることの難しさで、${childName}はどのくらい困っていますか？`,
};
```

**スケール UI:** 5段階・横並びボタン

```
1          2          3          4          5
ほとんど   たまに     ときどき    よく       毎日とても
気にならない 気になる  困る       困る       困っている
```

- 数字を大きく表示（40px程度）
- 選択するとボタンがハイライト（bg-cosmic）
- 選択後は自動で次の設問へ進む（0.5秒後）

**データ保存:**
```typescript
// 既存 baselineScore / baselineCategory を配列型に拡張
concernSeverities: Array<{
  category: string;    // concernTagsの各要素
  severity: 1 | 2 | 3 | 4 | 5;
  recordedAt: string;  // ISO date
}>;

// Supabaseカラム: concern_severities (jsonb)
// 既存 baseline_score / baseline_category は後方互換性のため
// concernSeverities[0]の値を引き続き書き込む
```

---

## Phase 3: キャリブレーション改修

### 追加: 保護者向け案内画面

キャラ選択の**前**に1画面追加：

```
タイトル: 「ここからはお子さまと一緒に」

本文:
「次の画面から、お子さまと一緒にかんたんなゲームを体験します。
${childName}のタブレット操作や理解度を自動で確認し、
ぴったりの難しさでゲームを始められるようにします。」

ボタン1: 「子どもと一緒に始める」（Primary）
ボタン2: 「スキップして後で」（Secondary・小さめ）
```

**スキップ時の処理:**
```typescript
// キャリブレーション結果なし → 暫定Tier 1で開始
if (calibrationSkipped) {
  tier = 1;
  profile.calibration_skipped = true;
  // 初回ゲームプレイ後に自動Tier補正を実施
}
```

### 目標設定画面（Tier判定確定後・新規追加）

キャリブレーション完了直後（またはスキップ後）に表示。

**タイトル:** 「毎日の目標を決めよう」

**Tier連動の推奨表示:**
```typescript
const TIER_RECOMMENDATIONS = {
  1: { minutes: 10, label: 'カジュアル', description: '無理なく続けられる' },
  2: { minutes: 15, label: 'レギュラー', description: 'おすすめのペース' },
  3: { minutes: 20, label: 'シリアス', description: 'しっかり取り組む' },
};

// 推奨ラベルの表示
// 「${childName}には1日${recommendedMinutes}分がおすすめです ⭐」
```

**4択UI（Duolingo型）:**

| ラベル | 時間 | 説明 |
|--------|------|------|
| カジュアル | 5分 | 気軽に続けたい |
| レギュラー | 10分 | バランスよく |
| シリアス | 15分 | しっかり取り組む |
| インテンス | 20分 | 本格的に |

- Tier判定結果に対応するプリセットに「おすすめ ⭐」バッジを表示
- 選択後、設定値を `daily_goal_minutes` としてプロファイルに保存
- 「あとで設定から変更できます」を小さく表示

---

## Phase 5: 期待値設定カード改修

### Card 2の変更

**旧:**
> 「週3回、続けてみてください。4週間後に、今日と同じ質問をします。どんな変化があったか、一緒に確認しましょう。」

**新:**
```typescript
// 目標設定で選んだ時間に連動
const goalMinutes = profile.daily_goal_minutes;

// Card 2 テキスト:
`毎日${goalMinutes}分、続けてみてください。

${childName}の成長の記録が、今日から始まりました。
続けるほど、得意なことと伸びしろが見えてきます。`
```

**理由:** 「4週間で変化がなかったら」という離脱リスクを回避。変化の約束ではなく「記録の開始」として訴求。

---

## データモデル変更

### OnboardingProfile（Supabase）

```typescript
// 追加カラム
honorific: 'kun' | 'chan' | 'name_only';        // 呼び方
diagnosis_tags: string[];                          // 診断・特性タグ配列
id_severity: 'mild' | 'moderate' | 'severe' | 'unknown' | null;
concern_severities: Array<{                        // 深刻度配列
  category: string;
  severity: 1 | 2 | 3 | 4 | 5;
  recordedAt: string;
}>;
daily_goal_minutes: 5 | 10 | 15 | 20;            // 目標時間
calibration_skipped: boolean;                      // キャリブレーションスキップフラグ

// 後方互換性のため維持（concern_severities[0]から自動設定）
baseline_score: number;
baseline_category: string;
```

### Supabaseマイグレーション

```sql
ALTER TABLE onboarding_profiles 
ADD COLUMN IF NOT EXISTS honorific text DEFAULT 'kun',
ADD COLUMN IF NOT EXISTS diagnosis_tags jsonb DEFAULT '[]',
ADD COLUMN IF NOT EXISTS id_severity text,
ADD COLUMN IF NOT EXISTS concern_severities jsonb DEFAULT '[]',
ADD COLUMN IF NOT EXISTS daily_goal_minutes integer DEFAULT 10,
ADD COLUMN IF NOT EXISTS calibration_skipped boolean DEFAULT false;
```

---

## 既存コードの修正箇所

### 1. ハードコードの「くん」を全て置き換え

```bash
# 検索対象
grep -rn "くん\|kun" src/app/onboarding/ src/features/ src/components/
```

全ての `くん` / `kun` ハードコードを `getChildName(profile.nickname, profile.honorific)` に置き換え。

### 2. useOnboardingV2.ts

- `data` の型定義に新規フィールドを追加
- `saveProfile()` に新規フィールドの保存処理を追加
- `concernTags` の最大選択数を 3 → 7 に変更

### 3. Phase1Screens.tsx

- Screen 1に呼び方選択UI追加
- Screen 5（聴覚過敏）の後にScreen 5（診断・特性）を挿入
  - 既存のScreen番号をずらすこと

### 4. Phase2Assessment.tsx

- BaselineScreen を SeverityScreen に改修
- 選択した困りごと数分ループする動的画面生成に変更
- データ保存を `concern_severities` 配列に変更

### 5. determineTier（tier-system.ts または useOnboardingV2.ts）

- 診断タグ（`id_severe` 等）をTier判定ロジックに追加

---

## 実装順序

1. `OnboardingProfile` 型定義＋Supabaseマイグレーション
2. `getChildName()` ヘルパー関数を共通ユーティリティに追加
3. Screen 1: 呼び方選択UI追加
4. Screen 5（新規）: 診断・特性情報UI
5. Phase2: SeverityScreen（深刻度確認）の動的生成
6. Phase3: 保護者案内画面＋スキップ処理
7. Phase3: 目標設定画面（Tier判定後）
8. Phase5: Card 2テキスト改修
9. 全画面のハードコード「くん」置き換え
10. `tsc --noEmit` → `vitest run` → `next build` で確認

---

## 検証チェックリスト

- [ ] Screen 1で「ちゃん」選択 → 全画面で「〇〇ちゃん」表示
- [ ] Screen 1で「名前のみ」選択 → 敬称なしで表示
- [ ] 診断で「知的障害」選択 → 重度選択肢が出る
- [ ] 診断で `id_severe` → Tier上限2に制限される
- [ ] 困りごとを7項目選択できる
- [ ] 深刻度確認が選択した項目数分だけ表示される
- [ ] 深刻度選択後0.5秒で次の設問へ自動遷移
- [ ] キャリブレーションスキップ → 暫定Tier 1でホーム到着
- [ ] 目標設定でTierに対応するプリセットに「おすすめ」バッジ表示
- [ ] `concern_severities` がSupabaseに正しく保存される
- [ ] 後方互換: `baseline_score` / `baseline_category` も引き続き保存される
