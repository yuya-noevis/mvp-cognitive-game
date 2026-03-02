# 修正指示書: セッション・ゲームバグ修正 & デバッグログ追加

## 修正1: 混合セッションのゲージが途中でリセットされる（最優先）

### 症状
- 「あそぶ」→混合セッション開始、上部に進捗ゲージ `○/24` が表示される
- 数問プレイすると**ゲージが0に戻り**、セッションが永遠に終わらない

### 原因の可能性
- セッションエンジン（`session-engine.ts` / `mixed-session-manager.ts`）のステートが途中でリセットされている
- ゲーム切り替え時に `SessionProgressBar` に渡す `currentTrial` / `totalTrials` が再計算されて0に戻っている
- ゲーム間トランジション（`GameTransition.tsx`）でセッション全体のステートが初期化されている
- Reactの再レンダリングでステートが失われている（useStateの初期値に戻っている）

### 調査手順
1. `mixed-session-manager.ts` の `currentTrialIndex` (もしくは相当するカウンター) がどこで更新・リセットされるか全箇所を洗い出す
2. ゲーム間のトランジション時にセッション全体のステートが保持されているか確認
3. `session/play/page.tsx` のコンポーネントがアンマウント→再マウントしていないか確認（keyプロップの変更など）

### 修正方針
- セッション全体の進捗カウンターはセッションマネージャーで一元管理し、個別ゲームの開始/終了で上書きしない
- ゲーム切り替え時は「現在のゲームインデックス」だけ進め、累計試行数はインクリメントのみ

---

## 修正2: ひかりキャッチ・ことばキャッチの説明デモが表示されない

### 症状
- 単体の「ひかりキャッチであそぼう」を選択 → 説明デモが表示されない
- 「ことばキャッチであそぼう」も同様に説明デモが出ない

### 調査手順
1. `src/features/instruction/game-instructions.ts` で `ひかりキャッチ` と `ことばキャッチ` のintegratedId に対応するデモ定義が存在するか確認
2. `GameInstruction.tsx` のデモ表示条件を確認 — integratedId のマッピングミスで条件分岐をすり抜けている可能性
3. `DemoAnimation.tsx` が正しいゲームIDでデモデータを取得できているか確認

### 修正方針
- デモ定義が欠けていれば追加
- integratedIdのマッピングがズレていれば修正
- 全8ゲームについて、説明デモが表示されるか一通り確認すること

---

## 修正3: ひかりキャッチが12/14あたりでリロードされる

### 症状
- ひかりキャッチで12/14問あたりまで進むとページが自動リロードされ、最初に戻される

### 原因の可能性
- メモリリーク（アニメーション/タイマーの蓄積）でブラウザがタブをクラッシュ→リロード
- useEffect内のsetIntervalやrequestAnimationFrameがクリーンアップされていない
- エラーが発生してError Boundaryが発動し、再マウントしている
- Next.jsのホットリロードが誤発動（開発環境の場合）

### 調査手順
1. ひかりキャッチのゲームコンポーネント内のタイマー/アニメーション管理を確認
2. useEffectのクリーンアップ関数で `clearInterval` / `cancelAnimationFrame` が呼ばれているか
3. DevToolsのPerformanceタブでメモリ使用量が増え続けていないか確認
4. コンソールにエラーが出ていないか確認

### 修正方針
- 全タイマー/アニメーションのクリーンアップを確実に実装
- エラーバウンダリのログを追加して、クラッシュ原因を特定

---

## 修正4: ルールチェンジの問題が左端に寄っている

### 症状
- ルールチェンジのゲーム画面で、問題（選択肢やカード等）が左端に偏って表示される

### 修正方針
- ルールチェンジのゲームコンポーネント内のレイアウトを確認
- 問題表示エリアを `justify-content: center` / `align-items: center` で中央配置
- 他のゲームとレイアウトの一貫性を保つ

---

## 追加タスク: セッション状態デバッグログの実装

### 目的
今後のバグを事前検出するため、セッションエンジンの状態遷移を `console.log` で出力する。
本番ビルドでは `process.env.NODE_ENV === 'development'` の条件で出力を制限する。

### 実装内容
`mixed-session-manager.ts` (もしくは `session-engine.ts`) に以下のログを追加:

```typescript
// セッション状態デバッグログ（開発環境のみ）
function debugSessionLog(event: string, state: any) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Session] ${event}`, {
      currentGameIndex: state.currentGameIndex,
      currentTrialInGame: state.currentTrialInGame,
      totalTrialsCompleted: state.totalTrialsCompleted,
      totalTrialsInSession: state.totalTrialsInSession,
      currentGameId: state.currentGameId,
      timestamp: new Date().toISOString(),
    });
  }
}
```

以下のタイミングでログを出力:
1. **セッション開始**: `[Session] SESSION_START` — 全体の構成（ゲーム数、総試行数）
2. **試行完了**: `[Session] TRIAL_COMPLETE` — 正誤、現在の進捗
3. **ゲーム切替**: `[Session] GAME_SWITCH` — 次のゲームID、累計進捗
4. **セッション完了**: `[Session] SESSION_COMPLETE` — 最終結果
5. **ステートリセット検出**: `[Session] ⚠️ STATE_RESET_DETECTED` — totalTrialsCompletedが減少した場合に警告

特に **5番のリセット検出** が重要。今回のゲージリセットバグはこれで即座に原因箇所が特定できる。

---

## 重要: 全8ゲーム横断チェック

上記の修正はユーザーが確認したゲームで発見されたものだが、**同様の問題が他のゲームにも存在する可能性が高い**。全てのゲームを手動確認したわけではない。

### 指示
各修正を行う際、報告されたゲームだけでなく **全8ゲームに同じ問題がないか自主的に確認し、該当すれば一括で修正すること**。

### チェック項目（全8ゲーム共通）
1. **説明デモ**: 各ゲームの説明デモが正しく表示されるか。デモ定義が欠けていないか、integratedIdのマッピングにズレがないか
2. **レイアウト**: 問題・選択肢・操作エリアが中央に配置されているか。左右や上下に不自然に偏っていないか
3. **プレイ完了**: 最後の問題まで到達できるか。途中でリロードやクラッシュが発生しないか
4. **タイマー/アニメーション**: useEffect内のsetInterval / requestAnimationFrame / setTimeoutが全てクリーンアップされているか
5. **記録保存**: ゲーム完了時に保存関数が呼ばれているか（混合セッション・フリープレイ両方）

コードレビューレベルで全ゲームを通して確認し、問題を発見したら報告されたバグと同じコミットでまとめて修正すること。

---

## 検証方法（全修正共通）
1. `npm run build` & `tsc --noEmit` でビルドエラーなし
2. 混合セッション: 開始→全ゲーム完了まで通しプレイ。ゲージが途中でリセットされないこと
3. ひかりキャッチ単体: 説明デモ表示 → 最後までプレイ完了（リロードされないこと）
4. ことばキャッチ単体: 説明デモ表示確認
5. ルールチェンジ: 問題が中央に表示されること
6. DevToolsコンソールで `[Session]` ログが正しく出力されること

---

## デプロイ
```bash
git add -A && git commit -m "fix: session reset, demo display, reload crash, layout centering + debug logs" && git push origin main
```
