# Claude Code指示書: 8ゲーム統合（Step 2）

## 方針

**旧15ゲームのコードには一切触らない。** 新しい「統合レイヤー」を追加し、8つの統合ゲームが旧ゲームをレベル帯に応じて呼び出す構造にする。

## 前提
- `docs/game-design-v2.md` を読み、8ゲーム統合マップ（§2）を理解すること
- 既存の `src/games/*/` 配下のファイルは**読み取り専用**として扱い、変更しない
- 新規ファイルは `src/games/integrated/` 配下に作成する

## 作業手順

### Step 2-1: 統合ゲームのルーティング定義

`src/games/integrated/game-map.ts` を新規作成。以下の8統合ゲームと、各レベル帯で呼び出す旧ゲームIDのマッピングを定義する。

```typescript
// 統合ゲームID → レベル帯 → 旧ゲームID のマッピング
export const INTEGRATED_GAME_MAP = {
  'hikari-rescue': {
    // ひかりレスキュー: G1 + G2 + G6
    id: 'hikari-rescue',
    name: 'ひかりレスキュー',
    category: 'attention-inhibition',
    levels: [
      { range: [1, 3],   sourceGame: 'hikari-catch',    mode: 'go-only' },
      { range: [4, 8],   sourceGame: 'hikari-catch',    mode: 'go-nogo' },
      { range: [9, 15],  sourceGame: 'hikari-catch',    mode: 'cpt' },
      { range: [16, 20], sourceGame: 'matte-stop',      mode: 'stop-signal' },
      { range: [21, 25], sourceGame: 'matte-stop',      mode: 'advanced' },
    ],
  },
  'oboete-susumu': {
    // おぼえてすすむ: G3 + G7
    id: 'oboete-susumu',
    name: 'おぼえてすすむ',
    category: 'memory-learning',
    levels: [
      { range: [1, 3],   sourceGame: 'oboete-narabete', mode: 'forward-2' },
      { range: [4, 8],   sourceGame: 'oboete-narabete', mode: 'forward-3-4' },
      { range: [9, 13],  sourceGame: 'oboete-match',    mode: 'dms-short' },
      { range: [14, 18], sourceGame: 'oboete-narabete', mode: 'backward' },
      { range: [19, 25], sourceGame: 'oboete-match',    mode: 'dms-long' },
    ],
  },
  'rule-change': {
    // ルールチェンジ: G5
    id: 'rule-change',
    name: 'ルールチェンジ',
    category: 'flexibility',
    levels: [
      { range: [1, 3],   sourceGame: 'iro-kae-switch',  mode: 'pre-switch' },
      { range: [4, 8],   sourceGame: 'iro-kae-switch',  mode: 'post-switch' },
      { range: [9, 13],  sourceGame: 'iro-kae-switch',  mode: 'multi-switch' },
      { range: [14, 18], sourceGame: 'iro-kae-switch',  mode: 'border' },
      { range: [19, 25], sourceGame: 'iro-kae-switch',  mode: 'advanced' },
    ],
  },
  'kurukuru-puzzle': {
    // くるくるパズル: G4 + G9
    id: 'kurukuru-puzzle',
    name: 'くるくるパズル',
    category: 'perception-reasoning',
    levels: [
      { range: [1, 3],   sourceGame: 'katachi-sagashi', mode: 'match-only' },
      { range: [4, 8],   sourceGame: 'katachi-sagashi', mode: 'rotation-2d' },
      { range: [9, 13],  sourceGame: 'katachi-sagashi', mode: 'rotation-mirror' },
      { range: [14, 18], sourceGame: 'pattern-puzzle',  mode: 'sequence' },
      { range: [19, 25], sourceGame: 'pattern-puzzle',  mode: 'matrix' },
    ],
  },
  'tanken-meiro': {
    // たんけんめいろ: G10 + G8
    id: 'tanken-meiro',
    name: 'たんけんめいろ',
    category: 'planning',
    levels: [
      { range: [1, 3],   sourceGame: 'meiro-tanken',    mode: 'single-path' },
      { range: [4, 8],   sourceGame: 'meiro-tanken',    mode: 'branching' },
      { range: [9, 13],  sourceGame: 'meiro-tanken',    mode: 'item-collect' },
      { range: [14, 18], sourceGame: 'tsumi-age-tower', mode: 'key-door' },
      { range: [19, 25], sourceGame: 'tsumi-age-tower', mode: 'multi-key' },
    ],
  },
  'kotoba-ehon': {
    // ことばとえほん: G12
    id: 'kotoba-ehon',
    name: 'ことばとえほん',
    category: 'language',
    levels: [
      { range: [1, 3],   sourceGame: 'kotoba-catch',    mode: 'noun-2choice' },
      { range: [4, 8],   sourceGame: 'kotoba-catch',    mode: 'noun-verb-3choice' },
      { range: [9, 13],  sourceGame: 'kotoba-catch',    mode: 'adjective-4choice' },
      { range: [14, 18], sourceGame: 'kotoba-catch',    mode: 'abstract' },
      { range: [19, 25], sourceGame: 'kotoba-catch',    mode: 'category' },
    ],
  },
  'kimochi-friends': {
    // きもちフレンズ: G13 + G14
    id: 'kimochi-friends',
    name: 'きもちフレンズ',
    category: 'social-cognition',
    levels: [
      { range: [1, 3],   sourceGame: 'kimochi-yomitori', mode: '2-emotion-match' },
      { range: [4, 8],   sourceGame: 'kimochi-yomitori', mode: '4-emotion-match' },
      { range: [9, 13],  sourceGame: 'kimochi-yomitori', mode: 'label-select' },
      { range: [14, 18], sourceGame: 'kimochi-yomitori', mode: 'subtle' },
      { range: [19, 25], sourceGame: 'kimochi-stop',     mode: 'emotional-gonogo' },
    ],
  },
  'touch-adventure': {
    // タッチアドベンチャー: G15 + G6
    id: 'touch-adventure',
    name: 'タッチアドベンチャー',
    category: 'fine-motor',
    levels: [
      { range: [1, 3],   sourceGame: 'touch-de-go',     mode: 'large-target' },
      { range: [4, 8],   sourceGame: 'touch-de-go',     mode: 'medium-drag' },
      { range: [9, 13],  sourceGame: 'touch-de-go',     mode: 'trace' },
      { range: [14, 18], sourceGame: 'touch-de-go',     mode: 'precision' },
      { range: [19, 25], sourceGame: 'hayawaza-touch',   mode: 'speed-accuracy' },
    ],
  },
} as const;
```

**重要**: 上記の `sourceGame` 値（`hikari-catch`, `matte-stop` 等）は仮のIDです。実際の `src/games/` 配下のディレクトリ名・ゲームID を確認し、正確な値に置き換えてください。確認コマンド:
```bash
ls src/games/
cat src/games/*/config.ts | grep -E "id:|gameId:"
```

### Step 2-2: 5カテゴリの定義

`src/games/integrated/categories.ts` を新規作成。

```typescript
export const COGNITIVE_CATEGORIES = [
  {
    id: 'attention-inhibition',
    name: '注意・抑制',
    description: '集中する力、待つ力',
    games: ['hikari-rescue'],
    icon: '👁️',
  },
  {
    id: 'memory-learning',
    name: '記憶・学習',
    description: '覚える力',
    games: ['oboete-susumu'],
    icon: '🧠',
  },
  {
    id: 'flexibility',
    name: '柔軟性・実行制御',
    description: 'ルールを切り替える力、計画する力',
    games: ['rule-change', 'tanken-meiro'],
    icon: '🔄',
  },
  {
    id: 'perception-reasoning',
    name: '知覚・空間・推論',
    description: '形を見分ける力、手先の器用さ',
    games: ['kurukuru-puzzle', 'touch-adventure'],
    icon: '🧩',
  },
  {
    id: 'social-language',
    name: '社会認知・言語',
    description: '気持ちを読む力、言葉の力',
    games: ['kimochi-friends', 'kotoba-ehon'],
    icon: '💬',
  },
] as const;
```

### Step 2-3: ホーム画面のゲーム一覧を8ゲーム表示に変更

**既存のホーム画面コンポーネントを特定**してください:
```bash
grep -r "ゲーム" src/app/ --include="*.tsx" -l
grep -r "game" src/app/ --include="*.tsx" -l
grep -r "GameCard\|GameList\|gameList" src/ --include="*.tsx" -l
```

特定したコンポーネントで以下を変更:
1. 旧15ゲームのリストの代わりに、`INTEGRATED_GAME_MAP` から8ゲームを表示
2. 各ゲームカードにはカテゴリアイコンとゲーム名を表示
3. **旧ゲームのルーティング（`/game/[旧ID]`）は削除しない**。新ルーティング（`/game/[統合ID]`）を追加する

### Step 2-4: 統合ゲームのルーティングページ

`src/app/game/[integratedId]/page.tsx` を新規作成（既存の旧ゲームルーティングとは別パス）。

このページの責務:
1. `integratedId` から `INTEGRATED_GAME_MAP` を参照
2. ユーザーの現在レベルから、対応するレベル帯を特定
3. そのレベル帯の `sourceGame` を特定
4. 旧ゲームコンポーネントを `mode` パラメータ付きで呼び出す

```typescript
// 疑似コード — 実際の旧ゲームコンポーネントのimport方法に合わせて調整
export default function IntegratedGamePage({ params }) {
  const gameConfig = INTEGRATED_GAME_MAP[params.integratedId];
  const userLevel = getUserCurrentLevel(params.integratedId); // 既存のレベル管理から取得
  const levelBand = gameConfig.levels.find(
    l => userLevel >= l.range[0] && userLevel <= l.range[1]
  );
  const SourceGameComponent = getGameComponent(levelBand.sourceGame);
  
  return <SourceGameComponent mode={levelBand.mode} level={userLevel} />;
}
```

**注意**: `mode` パラメータの受け渡しは、既存の各ゲームコンポーネントが対応していない可能性が高い。**Step 2-4の時点では `mode` は無視して、旧ゲームをそのまま呼び出すだけでOK**。`mode` による挙動変更は後続ステップで段階的に実装する。

### Step 2-5: 検証

以下を確認:
1. `npm run build` が通ること（TypeScript 0エラー）
2. ホーム画面に8ゲームが表示されること
3. 各統合ゲームをタップすると、対応する旧ゲームが起動すること
4. 旧ゲームの直接URL（`/game/[旧ID]`）もまだ動作すること（後方互換性）

### やらないこと（このステップでは）

- 旧ゲームのコード変更
- `mode` パラメータによる挙動切り替えの実装
- ティア制ゲートの実装（Step 3で行う）
- 旧ゲームの削除（当面は残す）
- UIデザインの改善（機能優先）

## 完了条件

- [ ] `src/games/integrated/game-map.ts` が作成され、正確な旧ゲームIDが記載されている
- [ ] `src/games/integrated/categories.ts` が作成されている
- [ ] ホーム画面が8ゲーム表示になっている
- [ ] 8ゲームすべてが旧ゲームにルーティングされ、プレイ可能
- [ ] `npm run build` がエラー0で通る
- [ ] 旧ゲームの直接URLも引き続き動作する
