# オンボーディングv2 — Step 3: 実装

## 前提
- Step 1（探索）とStep 2（計画）が完了し、計画が承認済みであること
- 仕様書: `docs/prompt-onboarding-v2.md`

## 作業前の安全措置
```bash
git add -A && git commit -m "before-onboarding-v2"
```

## 実装タスク

Step 2 で策定した計画に沿って、以下の順序で実装してください。

### Phase A: 共通UIコンポーネントの作成
以下を `src/components/onboarding/` に作成：

1. **StepHeader.tsx** — フェーズラベル + タイトル + 補足テキスト
2. **YesNoButtons.tsx** — はい/いいえ ボタン + わからない リンク
3. **SingleSelectList.tsx** — 単一選択リスト（チェックマーク付き）
4. **ChipSelector.tsx** — 複数選択チップ（カテゴリ見出し対応）
5. **OnboardingProgressBar.tsx** — フェーズ対応プログレスバー

### Phase B: メインページの書き換え
`src/app/onboarding/page.tsx` を完全に書き換え：

1. OnboardingDataV2 型定義
2. 質問データ定義（QUESTIONS配列）
3. メインコンポーネント（状態管理、画面遷移、条件分岐）
4. 各Phase用のレンダリングロジック
5. Supabase保存ロジック（既存パターン踏襲）
6. ローカルフォールバック保存

### Phase C: 初期ドメインレベル推定
domainAnswers から DDA 初期難易度を設定する関数を追加

## デザインルール（厳守）
- 背景: deep-space (#0D0D2B)
- メインボタン: cosmic (#6C3CE1) 背景、白テキスト
- Yes/No ボタン: galaxy-light (#2A2A5A) 背景、stardust テキスト
- 「わからない」: cosmic色テキストリンク
- フォント: M PLUS Rounded 1c（レイアウトが既に適用済み）
- max-width: 430px（レイアウトが既に適用済み）
- タップターゲット: 最小48px
- input font-size: 16px以上（iOSズーム防止）
- macOS絵文字禁止 → Mogura コンポーネントを使用
- framer-motion の AnimatePresence で画面遷移アニメーション

## 各Phase実装後にやること
- TypeScript エラーがないことを確認: `npx tsc --noEmit`
- 各画面が正しくレンダリングされることを確認

## 完了条件
- 全25画面が遷移可能
- 条件分岐（画面4の回答による画面5/6の出し分け）が動作
- プログレスバーが正しく進む
- Supabase保存 or ローカル保存が動作
- TypeScriptエラーがゼロ
