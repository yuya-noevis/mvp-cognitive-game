# Claude Code指示書: 混合セッションエンジンの実装（Step 8）

## 前提
- `docs/game-design-v2.md` の §9「セッション設計: 混合セッション型」を熟読すること
- 既存の `src/features/session/` を確認すること（Step 6で実装済み）
- 既存の `src/games/integrated/game-map.ts` を確認すること

```bash
cat src/features/session/session-config.ts
cat src/features/session/session-manager.ts
cat src/features/session/SessionContext.tsx
cat src/games/integrated/game-map.ts
cat src/games/integrated/categories.ts
```

## 概要

現在のセッションは「1ゲーム×複数試行」。これを「3ゲーム混合×各2-3試行」に変更する。Duolingo型の「1セッション内で異なるゲームが切り替わる」体験を実現。

## ティア別セッション構成

| ティア | ゲーム数 | 各ゲーム試行数 | 合計試行数 |
|--------|---------|-------------|----------|
| Tier 1 | 2ゲーム | 2試行 | 4 + ウォームアップ1 |
| Tier 2 | 3ゲーム | 2試行 | 6 + ウォームアップ1 |
| Tier 3 | 3ゲーム | 3試行 | 9 + ウォームアップ2 |

## 作業手順

### Step 8-1: セッション構成の型定義

`src/features/session/mixed-session.ts` を新規作成。

```typescript
import { IntegratedGameId } from '@/games/integrated/types';
import { Tier } from '@/features/gating';

export interface MixedSessionConfig {
  tier: Tier;
  gameCount: number;        // セッション内のゲーム数
  trialsPerGame: number;    // 各ゲームの試行数
  warmupTrials: number;     // ウォームアップ試行数
}

export interface SessionGameSlot {
  gameId: IntegratedGameId;
  trialCount: number;
  order: number;            // セッション内の順番（0始まり）
}

export interface MixedSessionPlan {
  config: MixedSessionConfig;
  games: SessionGameSlot[];
  totalTrials: number;      // warmup含む
}

export function getMixedSessionConfig(tier: Tier): MixedSessionConfig {
  switch (tier) {
    case 1:
      return { tier, gameCount: 2, trialsPerGame: 2, warmupTrials: 1 };
    case 2:
      return { tier, gameCount: 3, trialsPerGame: 2, warmupTrials: 1 };
    case 3:
      return { tier, gameCount: 3, trialsPerGame: 3, warmupTrials: 2 };
  }
}
```

### Step 8-2: ゲーム選択エンジン

`src/features/session/session-engine.ts` を新規作成。

セッションに含めるゲームを選択するロジック:

```typescript
import { IntegratedGameId } from '@/games/integrated/types';
import { Tier } from '@/features/gating';
import { getAccessibleGames } from '@/features/gating';
import { COGNITIVE_CATEGORIES } from '@/games/integrated/categories';

interface GameSelectionInput {
  tier: Tier;
  gameCount: number;
  // 直近セッションでプレイしたゲーム（多様性確保用）
  recentGameIds?: IntegratedGameId[];
  // 認知プロファイル（弱いドメイン優先用）— 将来実装、今はoptional
  cognitiveProfile?: Record<string, number>;
}

export function selectGamesForSession(input: GameSelectionInput): IntegratedGameId[] {
  const { accessible } = getAccessibleGames(input.tier);
  
  // 1. 直近でプレイしていないゲームを優先
  let candidates = accessible.filter(id => !input.recentGameIds?.includes(id));
  if (candidates.length < input.gameCount) {
    candidates = accessible; // 足りなければ全ゲームから
  }
  
  // 2. 異なるカテゴリから選択（同一カテゴリ連続を避ける）
  const selected: IntegratedGameId[] = [];
  const usedCategories: string[] = [];
  
  for (const candidate of shuffleArray(candidates)) {
    if (selected.length >= input.gameCount) break;
    
    const category = getCategoryForGame(candidate);
    if (!usedCategories.includes(category) || selected.length >= accessible.length / 2) {
      selected.push(candidate);
      usedCategories.push(category);
    }
  }
  
  // 足りない場合は残りから埋める
  while (selected.length < input.gameCount && selected.length < accessible.length) {
    const remaining = accessible.filter(id => !selected.includes(id));
    if (remaining.length === 0) break;
    selected.push(remaining[0]);
  }
  
  return selected;
}

// ヘルパー: ゲームIDからカテゴリを取得
function getCategoryForGame(gameId: IntegratedGameId): string {
  for (const cat of COGNITIVE_CATEGORIES) {
    if (cat.games.includes(gameId)) return cat.id;
  }
  return 'unknown';
}

// ヘルパー: 配列シャッフル（Fisher-Yates）
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
```

**注意**: カテゴリ情報は `src/games/integrated/categories.ts` の `games` フィールドを参照。実際のフィールド名を確認して合わせること。

### Step 8-3: 混合セッションマネージャー

`src/features/session/mixed-session-manager.ts` を新規作成。

既存の `SessionManager` を拡張し、ゲーム切替を管理:

```typescript
export class MixedSessionManager {
  private plan: MixedSessionPlan;
  private currentGameIndex: number = 0;
  private currentTrialInGame: number = 0;
  private totalTrialsCompleted: number = 0;
  private warmupCompleted: boolean = false;
  private results: MixedTrialResult[] = [];

  constructor(plan: MixedSessionPlan) {
    this.plan = plan;
  }

  getCurrentGame(): SessionGameSlot {
    return this.plan.games[this.currentGameIndex];
  }

  getCurrentGameId(): IntegratedGameId {
    return this.getCurrentGame().gameId;
  }

  isWarmup(): boolean {
    return !this.warmupCompleted;
  }

  // 試行完了時に呼ぶ
  recordTrial(correct: boolean, responseTimeMs: number): {
    isGameSwitch: boolean;       // 次のゲームに切り替わるか
    isSessionComplete: boolean;  // セッション完了か
    nextGameId?: IntegratedGameId;
    progress: number;            // 0-1
  } {
    // ウォームアップ処理
    if (this.isWarmup()) {
      this.totalTrialsCompleted++;
      if (this.totalTrialsCompleted >= this.plan.config.warmupTrials) {
        this.warmupCompleted = true;
        this.totalTrialsCompleted = 0; // リセットして本番カウント開始
      }
      return {
        isGameSwitch: false,
        isSessionComplete: false,
        progress: 0,
      };
    }

    // 本番試行記録
    this.results.push({
      gameId: this.getCurrentGameId(),
      gameIndex: this.currentGameIndex,
      trialIndex: this.currentTrialInGame,
      correct,
      responseTimeMs,
      timestamp: Date.now(),
    });
    
    this.currentTrialInGame++;
    this.totalTrialsCompleted++;
    
    const scoredTotal = this.plan.games.reduce((sum, g) => sum + g.trialCount, 0);
    const progress = this.totalTrialsCompleted / scoredTotal;

    // 現在のゲームの試行が完了したか
    if (this.currentTrialInGame >= this.getCurrentGame().trialCount) {
      this.currentGameIndex++;
      this.currentTrialInGame = 0;
      
      // 全ゲーム完了
      if (this.currentGameIndex >= this.plan.games.length) {
        return {
          isGameSwitch: false,
          isSessionComplete: true,
          progress: 1,
        };
      }
      
      // 次のゲームに切替
      return {
        isGameSwitch: true,
        isSessionComplete: false,
        nextGameId: this.getCurrentGameId(),
        progress,
      };
    }

    return {
      isGameSwitch: false,
      isSessionComplete: false,
      progress,
    };
  }

  getResults(): MixedTrialResult[] {
    return this.results;
  }

  getGameResults(gameId: IntegratedGameId): MixedTrialResult[] {
    return this.results.filter(r => r.gameId === gameId);
  }
}

interface MixedTrialResult {
  gameId: IntegratedGameId;
  gameIndex: number;
  trialIndex: number;
  correct: boolean;
  responseTimeMs: number;
  timestamp: number;
}
```

### Step 8-4: ゲーム間トランジションコンポーネント

`src/features/session/GameTransition.tsx` を新規作成。

ゲーム切替時に表示する短いトランジション演出:

```typescript
interface GameTransitionProps {
  fromGameName: string;
  toGameName: string;
  toGameIcon?: string;
  onComplete: () => void; // トランジション完了コールバック
}
```

**仕様:**
- 持続時間: 1.5秒
- 演出: 前のゲームがフェードアウト → マスコットが移動するアニメーション → 次のゲーム名が表示 → フェードイン
- 「つぎは ○○！」のテキスト表示（L1では非表示）
- 自動でonCompleteを呼ぶ（タップ不要）

### Step 8-5: セッション画面の大幅改修

`src/app/(game)/game/[integratedId]/page.tsx` の現在の設計を変更。

**変更の方針:**
- 現在は `/game/[integratedId]` で1ゲームを直接プレイする設計
- これを**2つのモード**に分ける:
  1. **セッションモード**（デフォルト）: `/session/play` — 混合セッションとしてプレイ
  2. **フリープレイモード**: `/game/[integratedId]` — 個別ゲームを直接プレイ（既存動作を維持）

**新規ルート: `src/app/session/play/page.tsx`**

このページの責務:
1. ティアに基づいてMixedSessionConfigを生成
2. SessionEngineでゲームを選択
3. MixedSessionPlanを作成
4. MixedSessionManagerを初期化
5. 現在のゲームのコンポーネントをレンダリング
6. 試行完了時にrecordTrial()を呼び、ゲーム切替/セッション完了を処理
7. ゲーム切替時にGameTransitionを表示
8. セッション完了時にSessionCompleteを表示

**状態遷移:**
```
[ホーム画面]
  ├─ 「あそぶ」ボタン → /session/play（セッションモード）
  └─ 個別ゲームタップ → /game/[integratedId]（フリープレイ）

/session/play の内部遷移:
  [日次上限チェック]
    ├─ 上限到達 → メッセージ画面
    └─ OK → [ウォームアップ（ゲームAの簡単な試行）]
              → [ゲームA 試行1] → [ゲームA 試行2]
              → [トランジション演出]
              → [ゲームB 試行1] → [ゲームB 試行2]
              → [トランジション演出]
              → [ゲームC 試行1] → [ゲームC 試行2]
              → [セッション完了画面]
                ├─ 「もういちど」→ 新しいセッション生成
                └─ 「おうち」→ ホーム
```

### Step 8-6: ホーム画面に「あそぶ」ボタン追加

`src/app/page.tsx` を更新:

- **画面上部に大きな「あそぶ」ボタン**を追加 → `/session/play` に遷移
- 既存のゲーム一覧（8ゲーム）はその下に「じゆうにあそぶ」セクションとして維持
- 「あそぶ」ボタンがメインの導線、個別ゲームはサブ導線

### Step 8-7: プログレスバーの混合セッション対応

既存の `SessionProgressBar` を更新:

- ゲーム切替ポイントをバー上にマーカーで表示
- 現在どのゲームをプレイ中かのインジケーター
- Tier 1: シンプルなドット（ゲーム境界なし）
- Tier 2-3: ゲーム区間が色分けされたセグメントバー

### Step 8-8: 直近プレイ履歴の保存

ゲーム選択の多様性確保のため、直近セッションでプレイしたゲームIDをlocalStorageに保存:

```typescript
// 直近3セッションのゲームIDを保存
const RECENT_GAMES_KEY = 'manas-recent-session-games';

export function saveRecentGames(gameIds: IntegratedGameId[]): void {
  const stored = JSON.parse(localStorage.getItem(RECENT_GAMES_KEY) || '[]');
  stored.unshift(gameIds);
  if (stored.length > 3) stored.pop();
  localStorage.setItem(RECENT_GAMES_KEY, JSON.stringify(stored));
}

export function getRecentGames(): IntegratedGameId[] {
  const stored = JSON.parse(localStorage.getItem(RECENT_GAMES_KEY) || '[]');
  return stored.flat();
}
```

### Step 8-9: 検証

1. `npm run build` エラー0
2. ホーム画面に「あそぶ」ボタンが表示される
3. 「あそぶ」タップ → 混合セッション開始:
   - ウォームアップ後、ゲームAの試行が始まる
   - ゲームAの試行完了 → トランジション演出 → ゲームBに切り替わる
   - ゲームB完了 → トランジション → ゲームC
   - ゲームC完了 → セッション完了画面
4. セッション内で異なるゲームが選ばれていること（同一カテゴリ連続しない）
5. 個別ゲームタップ → 従来通りフリープレイ可能（後方互換性）
6. Tier 1: 2ゲーム×2試行、Tier 2: 3ゲーム×2試行、Tier 3: 3ゲーム×3試行
7. 日次上限が累計プレイ時間のみで制御されること（クールダウンなし）
8. 2回目のセッションでは前回と異なるゲームが優先されること

## やらないこと（このステップでは）

- 認知プロファイルに基づく弱ドメイン優先（将来）
- ASD向けゲーム順序固定パターン（将来）
- ユニット制（5セッション=1ユニット、ボス戦）（Step 9以降）
- 植物ストリーク（Step 9）

## 完了条件

- [ ] `src/features/session/mixed-session.ts` 作成
- [ ] `src/features/session/session-engine.ts` 作成
- [ ] `src/features/session/mixed-session-manager.ts` 作成
- [ ] `src/features/session/GameTransition.tsx` 作成
- [ ] `src/app/session/play/page.tsx` 作成
- [ ] ホーム画面に「あそぶ」ボタン追加
- [ ] 混合セッションの一連のフローが動作
- [ ] フリープレイモードが引き続き動作
- [ ] プログレスバーがゲーム切替に対応
- [ ] `npm run build` エラー0
