# オンボーディングv2 — Step 1: 探索（コードは書かないで）

## 目的
現在のオンボーディング実装と関連ファイルを調査し、改修の影響範囲を把握する。
**このステップではコードを一切書かないでください。調査と報告のみです。**

## 調査タスク

以下のファイルを読み込み、それぞれ要点を報告してください。

### 1. 現在のオンボーディング
- `src/app/onboarding/page.tsx` — 現在の7ステップ構成、状態管理、Supabase保存ロジック

### 2. 関連コンポーネント
- `src/components/mascot/Mogura.tsx` — Moguコンポーネントの使い方（props）
- `src/components/ui/CosmicProgressBar.tsx` — プログレスバーのprops
- `src/components/ui/CosmicButton.tsx` — ボタンの使い方

### 3. 認証・データ保存
- `src/lib/supabase/client.ts` — isSupabaseEnabled、supabaseインスタンス
- `src/lib/local-profile.ts` — ローカル保存のsetLocalChildProfile、setLocalConsents
- `src/hooks/useChildProfile.ts` — プロフィール取得のロジック

### 4. 型定義
- `src/types/index.ts` — Child、SupportNeeds、AgeGroup の定義

### 5. デザインシステム
- `src/app/globals.css` — カラートークン一覧（cosmic, galaxy, stardust等）

## 報告フォーマット

調査後、以下をまとめて報告してください：

1. **現在のオンボーディングの状態管理**: どのようにstepとdataを管理しているか
2. **Supabase保存の流れ**: どの関数でどのテーブルに何を保存しているか
3. **ローカルフォールバック**: Supabaseが無効の場合の保存先と方法
4. **再利用できるコンポーネント**: Mogura、CosmicProgressBar等、そのまま使えるもの
5. **変更が必要な型定義**: OnboardingData型の変更で影響を受ける箇所
6. **注意点・リスク**: 改修時に壊れそうな箇所、依存関係

**報告が終わるまでコードは書かないでください。**
