# 実装指示: ExpectationCards.tsx 複数困りごと対応

## 対象ファイル
`components/onboarding/ExpectationCards.tsx`（またはそれに相当するファイル）

## 問題
困りごとを複数選択した場合でも、1つ目の困りごとにのみフォーカスしたメッセージが表示される。

## 修正内容

`concern_tags`（または困りごとタグの配列）の件数に応じてメッセージを出し分ける。

### 修正前（現状）
困りごとの件数に関わらず、1件目の困りごと名を使ったメッセージを表示している。

### 修正後

```ts
const expectationMessage =
  concern_tags.length === 1
    ? `${concern_tags[0].label}が、ゲームを通して少しずつ楽になっていきます`
    : `選んでくれた困りごとが、ゲームを通して少しずつ楽になっていきます`;
```

- `concern_tags.length === 1` のとき → 「**[困りごと名]** が、ゲームを通して少しずつ楽になっていきます」
- `concern_tags.length >= 2` のとき → 「**選んでくれた困りごとが**、ゲームを通して少しずつ楽になっていきます」

※ `concern_tags[0].label` の参照キーは実際のデータ構造に合わせること（`name` / `text` 等の可能性あり）。

## 確認事項
- concern_tags が空（length === 0）のケースがあれば、フォールバック表示も確認すること。

## 検証手順
修正完了後、以下の順で検証して結果を表形式で報告すること。

```
tsc --noEmit
vitest run
next build
```

| コマンド | 結果 |
|---|---|
| tsc --noEmit | |
| vitest run | |
| next build | |
