# Claude Code指示書: 指示4階層の実装（Step 4）

## 前提
- `docs/game-design-v2.md` の §5「指示方法: 4階層設計」を熟読すること
- Step 3で作成した `src/features/gating/` のティア情報を利用すること
- 既存ゲームの指示表示（チュートリアル/インストラクション）がどう実装されているか確認すること

```bash
grep -r "tutorial\|instruction\|チュートリアル\|指示\|説明" src/games/ --include="*.tsx" --include="*.ts" -l
grep -r "onStart\|showGuide\|howToPlay" src/games/ --include="*.tsx" --include="*.ts" -l
```

## 概要

ユーザーの言語理解レベルに応じて、ゲームの指示方法を4段階で切り替える。重度ID児が言語なしでもルールを理解できることが最重要目標。

## 4階層定義

| レベル | 名称 | 対象 | 指示形式 |
|--------|------|------|---------|
| L1 | 非言語 | 重度ID、3-4歳、言語理解限定 | デモアニメのみ。テキストなし、音声なし |
| L2 | 最小言語 | 中度ID、低年齢 | デモ + アイコン + 1語音声（「タップ」「まって」） |
| L3 | 音声支援 | 軽度ID、幼児一般 | デモ + 短文音声 + アイコン |
| L4 | 視覚優位対応 | 知的正常ASD、学齢期 | デモ + テキスト + 音声ON/OFF |

## 作業手順

### Step 4-1: 指示レベル定義と判定

`src/features/instruction/instruction-level.ts` を新規作成。

```typescript
export type InstructionLevel = 'L1' | 'L2' | 'L3' | 'L4';

export interface InstructionLevelConfig {
  level: InstructionLevel;
  label: string;
  showDemo: boolean;       // デモアニメーション
  showText: boolean;       // テキスト表示
  showAudio: boolean;      // 音声再生
  showIcon: boolean;       // アイコン表示
  audioToggleable: boolean; // 音声ON/OFF切替可能か
  textStyle: 'none' | 'icon-only' | 'hiragana' | 'standard';
}

export const INSTRUCTION_LEVELS: Record<InstructionLevel, InstructionLevelConfig> = {
  L1: {
    level: 'L1',
    label: '非言語',
    showDemo: true,
    showText: false,
    showAudio: false,
    showIcon: false,
    audioToggleable: false,
    textStyle: 'none',
  },
  L2: {
    level: 'L2',
    label: '最小言語',
    showDemo: true,
    showText: false,
    showAudio: true,  // 1語のみ
    showIcon: true,
    audioToggleable: false,
    textStyle: 'icon-only',
  },
  L3: {
    level: 'L3',
    label: '音声支援',
    showDemo: true,
    showText: true,
    showAudio: true,
    showIcon: true,
    audioToggleable: false,
    textStyle: 'hiragana',
  },
  L4: {
    level: 'L4',
    label: '視覚優位',
    showDemo: true,
    showText: true,
    showAudio: true,
    showIcon: true,
    audioToggleable: true,  // ASD聴覚過敏対応
    textStyle: 'standard',
  },
};

// ティアからデフォルト指示レベルを決定
import { Tier } from '@/features/gating';

export function getDefaultInstructionLevel(tier: Tier): InstructionLevel {
  switch (tier) {
    case 1: return 'L1';
    case 2: return 'L2';
    case 3: return 'L3'; // L4は保護者が手動で設定
  }
}
```

### Step 4-2: 指示レベルの保存・取得hook

`src/features/instruction/use-instruction-level.ts` を新規作成。

```typescript
// 既存のプロファイル管理（localStorage等）と同じ方式で保存
// - オンボーディング完了時にティアからデフォルト設定
// - 保護者が設定画面から手動変更可能
// - 開発用トグル（Step 3のティアトグルの隣に配置）
```

### Step 4-3: ゲーム指示コンポーネント

`src/features/instruction/GameInstruction.tsx` を新規作成。

このコンポーネントはゲーム開始前に表示される指示画面。指示レベルに応じて表示内容が変わる。

```typescript
interface GameInstructionProps {
  gameId: string;            // 統合ゲームID
  instructionLevel: InstructionLevel;
  onComplete: () => void;    // 指示完了（ゲーム開始）コールバック
  onReplay: () => void;      // デモ再視聴コールバック
}
```

**各レベルでの表示内容:**

#### L1（非言語）
- 画面中央にデモアニメーション再生
  - 「手」のアイコンが正解をタップする様子を示すアニメーション
  - テキスト一切なし、音声一切なし
- デモ完了後、「▶」ボタン（テキストなし）でゲーム開始
- 「🔄」ボタンでデモ再視聴

#### L2（最小言語）
- デモアニメーション + アイコン
- 1語音声再生（Web Speech API or 音声ファイル。MVPではWeb Speech APIでOK）
  - 例: 「タップ！」「まって！」「おなじ！」
- デモ完了後、「あそぶ ▶」ボタン
- 「もういちど 🔄」ボタン

#### L3（音声支援）
- デモアニメーション + アイコン + 短文テキスト（ひらがな）
- 音声再生: 1文（例:「ひかったら タッチしてね」）
- テキストはひらがな主体
- 「あそぶ ▶」ボタン + 「もういちど 🔄」ボタン

#### L4（視覚優位）
- デモアニメーション + テキスト + 音声（ON/OFF切替可能）
- テキストは標準表示（ひらがな + 漢字ルビ対応）
- 「🔇/🔊」ボタンで音声切替
- 手順をステップ表示（1. → 2. → 3.）
- 「あそぶ ▶」ボタン + 「もういちど 🔄」ボタン

### Step 4-4: ゲーム別の指示データ

`src/features/instruction/game-instructions.ts` を新規作成。

各統合ゲームの指示テキスト・音声テキストを定義:

```typescript
import { IntegratedGameId } from '@/games/integrated/types';
import { InstructionLevel } from './instruction-level';

interface GameInstructionData {
  // L2用: 1語
  singleWord: string;
  // L3用: 短文
  shortSentence: string;
  // L4用: ステップ説明
  steps: string[];
  // デモアニメーションの種類（将来: アニメーションコンポーネントを指定）
  demoType: 'tap-target' | 'wait-and-tap' | 'remember-sequence' | 'match-shape' | 'swipe-path' | 'select-word' | 'match-emotion' | 'drag-target';
}

export const GAME_INSTRUCTIONS: Record<IntegratedGameId, GameInstructionData> = {
  'hikari-rescue': {
    singleWord: 'タッチ！',
    shortSentence: 'ひかったら タッチしてね',
    steps: [
      'ひかる いきものが でてくるよ',
      'ひかったら タッチして たすけよう',
      'トゲトゲは さわらないでね',
    ],
    demoType: 'tap-target',
  },
  'oboete-susumu': {
    singleWord: 'おなじ！',
    shortSentence: 'おなじ じゅんばんで タッチしてね',
    steps: [
      'ロボットが いろを みせるよ',
      'おなじ じゅんばんで タッチしよう',
      'どんどん ながくなるよ',
    ],
    demoType: 'remember-sequence',
  },
  'rule-change': {
    singleWord: 'かえて！',
    shortSentence: 'ルールが かわるよ よくみてね',
    steps: [
      'カードを なかまに わけよう',
      'さいしょは いろで わけるよ',
      'とちゅうで ルールが かわるよ',
    ],
    demoType: 'match-shape',
  },
  'kurukuru-puzzle': {
    singleWord: 'おなじ！',
    shortSentence: 'おなじ かたちを みつけてね',
    steps: [
      'いろんな かたちが でてくるよ',
      'おなじ かたちを さがそう',
      'くるくる まわっているのも あるよ',
    ],
    demoType: 'match-shape',
  },
  'tanken-meiro': {
    singleWord: 'すすめ！',
    shortSentence: 'ゆびで みちを すすんでね',
    steps: [
      'めいろを たんけんしよう',
      'ゆびで スワイプして すすもう',
      'いきどまりに きをつけてね',
    ],
    demoType: 'swipe-path',
  },
  'kotoba-ehon': {
    singleWord: 'どれ？',
    shortSentence: 'いわれた ものを タッチしてね',
    steps: [
      'おとを よく きいてね',
      'いわれた ものの えを タッチしよう',
      'いろんな ことばが でてくるよ',
    ],
    demoType: 'select-word',
  },
  'kimochi-friends': {
    singleWord: 'きもち！',
    shortSentence: 'おなじ きもちの かおを さがしてね',
    steps: [
      'どうぶつの かおを みてね',
      'おなじ きもちの かおを さがそう',
      'うれしい、かなしい、おこってる...',
    ],
    demoType: 'match-emotion',
  },
  'touch-adventure': {
    singleWord: 'タッチ！',
    shortSentence: 'まるに タッチしてね',
    steps: [
      'まるが でてくるよ',
      'じょうずに タッチしよう',
      'ちいさいのも あるよ がんばって',
    ],
    demoType: 'drag-target',
  },
};
```

### Step 4-5: デモアニメーションコンポーネント

`src/features/instruction/DemoAnimation.tsx` を新規作成。

MVPではシンプルな実装でOK:
- 「手」アイコン（👆 or SVG）が画面上を動いてターゲットをタップする動き
- CSS animationまたはframer-motionで実装
- `demoType` ごとに異なるアニメーションパターン

**MVPで最低限実装すべき `demoType`:**
1. `tap-target`: 手がターゲットに移動してタップ
2. `remember-sequence`: ターゲットが順番に光る → 手が同じ順番でタップ
3. `swipe-path`: 手がスワイプ軌跡を描く

残りの `demoType` はMVP後でOK。未実装の場合は `tap-target` にフォールバック。

### Step 4-6: ゲーム画面に指示表示を統合

`src/app/(game)/game/[integratedId]/page.tsx` を更新:

1. ゲーム開始前に `GameInstruction` コンポーネントを表示
2. 指示完了（「あそぶ ▶」タップ）後にゲームコンポーネントをレンダリング
3. 初回プレイ時は指示を自動表示
4. 2回目以降は「?」ボタンで指示を再表示可能

状態遷移:
```
[指示画面] → (あそぶタップ) → [ゲームプレイ]
                                    ↓ (?ボタン)
                               [指示画面に戻る]
```

### Step 4-7: 不正解時のフィードバック対応

**L1（非言語）の不正解フィードバック:**
- 音なし（ブザー音禁止 — パニック誘発リスク）
- 画面が軽く揺れるだけ（CSS shake animation、200ms）
- 3回連続不正解 → デモアニメを自動再生

**L2-L4の不正解フィードバック:**
- 柔らかい短い音（「ポン」程度）+ 画面揺れ
- 2回連続不正解 → ヒント表示
- 3回連続不正解 → デモ再生

これは既存ゲームのフィードバック処理を確認して、適切な場所にフックする:
```bash
grep -r "wrong\|incorrect\|miss\|error\|不正解\|まちがい" src/games/ --include="*.tsx" --include="*.ts" -l
grep -r "feedback\|Feedback" src/games/ --include="*.tsx" --include="*.ts" -l
```

**注意**: 既存ゲームのフィードバック処理は変更が大きくなる可能性があるため、このステップでは `GameInstruction` コンポーネント（ゲーム開始前の指示画面）の実装を優先する。ゲーム内フィードバックの改修は別ステップとする。

### Step 4-8: 開発用トグル

Step 3で作成したティアトグルの隣に、指示レベルトグルを追加:

```
Tier: [1] [2] [3]  |  Instruction: [L1] [L2] [L3] [L4]
```

### Step 4-9: barrel export

`src/features/instruction/index.ts` を新規作成。

### Step 4-10: 検証

1. `npm run build` エラー0
2. 各指示レベルで表示が正しく切り替わること（開発トグルで確認）:
   - L1: デモアニメのみ、テキストなし、音声なし
   - L2: デモ + アイコン + 1語
   - L3: デモ + テキスト（ひらがな）+ 短文音声
   - L4: デモ + テキスト + 音声ON/OFF
3. ゲーム開始前に指示画面が表示されること
4. 「あそぶ」タップでゲームに遷移すること
5. 2回目以降は指示をスキップして直接ゲーム開始、「?」で再表示できること

## やらないこと（このステップでは）

- 録音音声の実装（MVPではWeb Speech API）
- ゲーム内フィードバック（正解/不正解エフェクト）の改修
- デモアニメーションの全 `demoType` 実装（MVP: tap-target, remember-sequence, swipe-path のみ）
- 指示レベルの動的調整（ランダム押し率による自動変更）

## 完了条件

- [ ] `src/features/instruction/` 配下にファイル群作成
- [ ] GameInstructionコンポーネントが4レベルで正しく表示切替
- [ ] DemoAnimationが最低3種類動作
- [ ] ゲーム画面で指示→プレイの遷移が動作
- [ ] 開発用指示レベルトグルが動作
- [ ] `npm run build` エラー0
