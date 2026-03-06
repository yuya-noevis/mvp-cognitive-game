# Manas オンボーディングデータ Supabase移行 実装指示書

**作成日:** 2026年3月6日  
**優先度:** P0  
**前提:** CLAUDE.md / docs/onboarding-v3-implementation.md を必ず読み込んでから作業すること

---

## 概要

オンボーディングv3で取得した全データが現在localStorageにのみ保存されている。
これをSupabaseに書き込む実装を追加し、デバイス間同期・データ永続化を実現する。

---

## Step 1: マイグレーションファイルの追加

`supabase/migrations/003_onboarding_v3.sql` を新規作成：

```sql
-- 003_onboarding_v3.sql
-- オンボーディングv3フィールドをchild_profilesに追加

ALTER TABLE child_profiles
  ADD COLUMN IF NOT EXISTS honorific text DEFAULT 'kun' 
    CHECK (honorific IN ('kun', 'chan', 'name_only')),
  ADD COLUMN IF NOT EXISTS speech_level text,
  ADD COLUMN IF NOT EXISTS tablet_operation text 
    CHECK (tablet_operation IN ('independent', 'assisted', 'not_yet')),
  ADD COLUMN IF NOT EXISTS auditory_sensitivity text 
    CHECK (auditory_sensitivity IN ('severe', 'mild', 'none', 'enjoys')),
  ADD COLUMN IF NOT EXISTS diagnosis_tags jsonb DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS id_severity text 
    CHECK (id_severity IN ('mild', 'moderate', 'severe', 'unknown')),
  ADD COLUMN IF NOT EXISTS concern_tags jsonb DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS concern_severities jsonb DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS daily_goal_minutes integer DEFAULT 10 
    CHECK (daily_goal_minutes IN (5, 10, 15, 20)),
  ADD COLUMN IF NOT EXISTS calibration_skipped boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS calibration_tier integer 
    CHECK (calibration_tier IN (1, 2, 3)),
  ADD COLUMN IF NOT EXISTS baseline_score numeric,
  ADD COLUMN IF NOT EXISTS baseline_category text,
  ADD COLUMN IF NOT EXISTS baseline_date date,
  ADD COLUMN IF NOT EXISTS companion_mode boolean DEFAULT false;

-- childrenテーブルのnameカラムが確実に存在することを確認
ALTER TABLE children
  ADD COLUMN IF NOT EXISTS display_name text;

-- weekly_checkinsテーブルを新規作成（未存在の場合）
CREATE TABLE IF NOT EXISTS weekly_checkins (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id uuid REFERENCES children(id) ON DELETE CASCADE,
  concern_category text NOT NULL,
  response text NOT NULL CHECK (response IN ('daily', 'weekly', 'rarely')),
  week_start date NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE weekly_checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their children's checkins"
  ON weekly_checkins
  FOR ALL
  USING (
    child_id IN (
      SELECT id FROM children WHERE parent_id = auth.uid()
    )
  );
```

---

## Step 2: Supabaseにマイグレーションを適用

**方法A: Supabase CLIがある場合**
```bash
supabase db push
```

**方法B: SQL Editorに直接貼り付け（推奨・確実）**
- Supabaseダッシュボード → SQL Editor
- 上記SQLを貼り付けて実行
- エラーがないことを確認

---

## Step 3: onboarding-profile の Supabase書き込み実装

### 3-1. saveOnboardingProfile() の改修

`src/features/onboarding-profile/index.ts` または `saveOnboardingProfile` が定義されているファイルを特定し、以下を実装：

```typescript
// saveOnboardingProfile: localStorage保存に加えてSupabaseにも書き込む
export async function saveOnboardingProfile(
  profile: OnboardingProfile,
  childId: string,
  supabase: SupabaseClient
): Promise<void> {
  // 1. localStorageに保存（既存処理・後方互換性維持）
  localStorage.setItem('onboarding_profile', JSON.stringify(profile));

  // 2. Supabaseのchild_profilesにupsert
  const { error } = await supabase
    .from('child_profiles')
    .upsert({
      child_id: childId,
      honorific: profile.honorific ?? 'kun',
      speech_level: profile.speechLevel,
      tablet_operation: profile.tabletOperation,
      auditory_sensitivity: profile.auditorySensitivity,
      diagnosis_tags: profile.diagnosisTags ?? [],
      id_severity: profile.idSeverity ?? null,
      concern_tags: profile.concernTags ?? [],
      concern_severities: profile.concernSeverities ?? [],
      daily_goal_minutes: profile.dailyGoalMinutes ?? 10,
      calibration_skipped: profile.calibrationSkipped ?? false,
      calibration_tier: profile.calibrationTier ?? 1,
      baseline_score: profile.concernSeverities?.[0]?.severity ?? null,
      baseline_category: profile.concernTags?.[0] ?? null,
      baseline_date: new Date().toISOString().split('T')[0],
      companion_mode: profile.companionMode ?? false,
      disability_types: profile.diagnosisTags ?? [],
      sensory_settings: profile.sensorySettings ?? {},
    }, { onConflict: 'child_id' });

  if (error) {
    console.error('Failed to save onboarding profile to Supabase:', error);
    // localStorageには保存済みなので握りつぶす（オフライン対応）
  }

  // 3. childrenテーブルのdisplay_nameを更新
  const displayName = getChildName(profile.nickname ?? '', profile.honorific ?? 'kun');
  await supabase
    .from('children')
    .update({ 
      display_name: displayName,
      name: profile.nickname ?? '',
      is_onboarded: true,
    })
    .eq('id', childId);
}
```

### 3-2. useOnboardingV2.ts の saveProfile() 改修

`handleSignup` および `saveProfile` 内で `saveOnboardingProfile()` を呼ぶ際に `supabase` と `childId` を渡すように変更。

```typescript
// saveProfile呼び出し箇所を全て以下に変更
await saveOnboardingProfile(profile, childId, supabase);
```

---

## Step 4: 名前取得ロジックの統一

### 4-1. HOME画面（src/app/page.tsx）

名前表示の取得順序を以下に統一：

```typescript
// 優先順位: Supabase children.display_name → localStorage → 'お子さま'
const displayName = 
  supabaseChild?.display_name ||     // Supabaseから取得
  localProfile?.nickname ||           // localStorage fallback
  'お子さま';                          // デフォルト
```

### 4-2. 認知プロファイルページ（src/app/dashboard/ 以下）

同様に `children.display_name` を優先して取得。
`getChildName()` ヘルパーを使用し、honorificも反映すること。

---

## Step 5: localStorageの残存データクリア処理

オンボーディング完了時（handleSignup成功後）に古いキャッシュをクリア：

```typescript
// Supabase保存成功後に実行
const OLD_KEYS = ['hio', 'child_name', 'display_name']; // 残存キー
localStorage.removeItem('onboarding_profile_cache');
// 必要に応じて他の古いキーも削除
```

---

## Step 6: weekly_checkins の Supabase書き込み

`src/features/weekly-checkin/WeeklyCheckin.tsx` の保存処理を改修：

```typescript
// 既存のlocalStorage保存に加えてSupabaseにも書き込む
const { error } = await supabase
  .from('weekly_checkins')
  .insert({
    child_id: childId,
    concern_category: concernCategory,
    response: selectedResponse,
    week_start: getWeekStart(), // 当週月曜日のdate
  });
```

---

## 実装順序

1. `003_onboarding_v3.sql` を作成 → Supabase SQL Editorで実行
2. `saveOnboardingProfile()` にSupabase書き込みを追加
3. `useOnboardingV2.ts` の `saveProfile()` / `handleSignup()` を更新
4. HOME画面・認知プロファイルページの名前取得ロジックを統一
5. `WeeklyCheckin.tsx` の保存処理にSupabase書き込みを追加
6. 古いlocalStorageキャッシュのクリア処理を追加

---

## 検証

```bash
tsc --noEmit
vitest run
next build
```

加えて以下をSupabase SQL Editorで確認：

```sql
-- オンボーディングデータが保存されているか確認
SELECT 
  c.name,
  c.display_name,
  cp.honorific,
  cp.diagnosis_tags,
  cp.concern_tags,
  cp.concern_severities,
  cp.daily_goal_minutes,
  cp.calibration_tier
FROM children c
LEFT JOIN child_profiles cp ON cp.child_id = c.id
ORDER BY c.created_at DESC
LIMIT 5;
```

全フィールドにデータが入っていることを確認してから完了報告すること。
