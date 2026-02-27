# Claude Code指示書: ティア制ゲート実装（Step 3）

## 前提
- `docs/game-design-v2.md` の §4「アダプティブ・ゲート設計」を熟読すること
- Step 2で作成した `src/games/integrated/` を確認すること
- 既存のオンボーディングデータ構造（`src/app/onboarding/` 配下）を確認すること
- 既存のユーザープロファイル管理（localStorageやSupabase）の仕組みを確認すること

## 概要

ユーザーの発達段階に応じて3段階のティアを判定し、ゲーム・レベル帯の解放/ロックを制御する。

## ティア定義

| ティア | 対象像 | 解放されるもの |
|--------|--------|--------------|
| Tier 1（感覚・運動） | MA < 2歳、重度ID | 全ゲームのLv1-3のみ |
| Tier 2（ルール・弁別） | MA 2-4歳、中度ID、幼児 | 全ゲームのLv1-13 + ことばとえほん(音声理解あり) |
| Tier 3（実行機能） | MA > 4歳、軽度ID、定型、ASD/ADHD | 全ゲーム全レベル |

## 作業手順

### Step 3-1: ティア判定ロジック

`src/features/gating/tier-system.ts` を新規作成。

```typescript
export type Tier = 1 | 2 | 3;

export interface TierInput {
  // オンボーディングから取得
  age: number;                          // 年齢
  diagnosisLevel?: 'severe' | 'moderate' | 'mild' | 'none'; // 知的障害レベル
  languageUnderstanding?: 'none' | 'single-word' | 'two-word' | 'sentence'; // 言語理解
  
  // キャリブレーションから取得（Phase 2で実装、今はoptional）
  calibrationResult?: {
    simpleReactionSuccess: boolean;    // 単純反応成功
    goNoGoSuccess: boolean;            // Go/No-Go成立
    shapeMatchSuccess: boolean;        // 図形マッチ成立
    randomPressRate: number;           // ランダム押し率 (0-1)
  };
}

export function determineTier(input: TierInput): Tier {
  // キャリブレーション結果がある場合はそちらを優先
  if (input.calibrationResult) {
    const cal = input.calibrationResult;
    if (cal.randomPressRate > 0.7 || !cal.simpleReactionSuccess) return 1;
    if (!cal.goNoGoSuccess || !cal.shapeMatchSuccess) return 2;
    return 3;
  }
  
  // オンボーディング回答のみの場合
  if (input.diagnosisLevel === 'severe') return 1;
  if (input.age < 3) return 1;
  
  if (input.diagnosisLevel === 'moderate') return 2;
  if (input.age < 5 && input.languageUnderstanding !== 'sentence') return 2;
  if (input.languageUnderstanding === 'none' || input.languageUnderstanding === 'single-word') return 2;
  
  return 3;
}
```

**重要**: 上記のロジックは設計書v2のティア判定を実装したもの。オンボーディングで実際にどのフィールド名・型でデータが保存されているかを確認し、合わせること。確認コマンド:
```bash
cat src/app/onboarding/types.ts
grep -r "diagnosis\|障害\|知的\|language\|言語" src/app/onboarding/ --include="*.ts" --include="*.tsx"
grep -r "childProfile\|ChildProfile\|useChildProfile" src/ --include="*.ts" --include="*.tsx" -l
```

### Step 3-2: ゲーム別ロック定義

`src/features/gating/game-locks.ts` を新規作成。

```typescript
import { Tier } from './tier-system';
import { IntegratedGameId } from '@/games/integrated/types';

export interface GameLockRule {
  gameId: IntegratedGameId;
  // どのティアから解放されるか
  unlockTier: Tier;
  // レベル帯ごとのロック（ティア内でも上位レベルをロック）
  levelLocks: {
    minLevel: number;
    maxLevel: number;
    requiredTier: Tier;
    additionalCondition?: string; // 人間向け説明（将来の条件実装用）
  }[];
}

export const GAME_LOCK_RULES: GameLockRule[] = [
  {
    gameId: 'hikari-rescue',
    unlockTier: 1, // 全員解放
    levelLocks: [
      { minLevel: 1,  maxLevel: 3,  requiredTier: 1 },
      { minLevel: 4,  maxLevel: 15, requiredTier: 2 },
      { minLevel: 16, maxLevel: 25, requiredTier: 3, additionalCondition: '抑制プロファイル十分' },
    ],
  },
  {
    gameId: 'oboete-susumu',
    unlockTier: 1,
    levelLocks: [
      { minLevel: 1,  maxLevel: 8,  requiredTier: 1 },
      { minLevel: 9,  maxLevel: 13, requiredTier: 2 },
      { minLevel: 14, maxLevel: 25, requiredTier: 3, additionalCondition: '順方向span≥3' },
    ],
  },
  {
    gameId: 'rule-change',
    unlockTier: 2, // Tier 2から
    levelLocks: [
      { minLevel: 1,  maxLevel: 8,  requiredTier: 2 },
      { minLevel: 9,  maxLevel: 13, requiredTier: 2 },
      { minLevel: 14, maxLevel: 25, requiredTier: 3, additionalCondition: '2ルール理解成功' },
    ],
  },
  {
    gameId: 'kurukuru-puzzle',
    unlockTier: 1,
    levelLocks: [
      { minLevel: 1,  maxLevel: 8,  requiredTier: 1 },
      { minLevel: 9,  maxLevel: 13, requiredTier: 2 },
      { minLevel: 14, maxLevel: 25, requiredTier: 3, additionalCondition: '視覚マッチ正答率≥80%' },
    ],
  },
  {
    gameId: 'tanken-meiro',
    unlockTier: 1, // 全員解放
    levelLocks: [
      { minLevel: 1,  maxLevel: 13, requiredTier: 1 },
      { minLevel: 14, maxLevel: 25, requiredTier: 3, additionalCondition: '迷路完遂可能+順方向span≥3' },
    ],
  },
  {
    gameId: 'kotoba-ehon',
    unlockTier: 2, // 音声理解必須
    levelLocks: [
      { minLevel: 1,  maxLevel: 8,  requiredTier: 2 },
      { minLevel: 9,  maxLevel: 25, requiredTier: 3 },
    ],
  },
  {
    gameId: 'kimochi-friends',
    unlockTier: 2,
    levelLocks: [
      { minLevel: 1,  maxLevel: 8,  requiredTier: 2 },
      { minLevel: 9,  maxLevel: 18, requiredTier: 3 },
      { minLevel: 19, maxLevel: 25, requiredTier: 3, additionalCondition: 'きもちよみとり+Go/No-Go成立' },
    ],
  },
  {
    gameId: 'touch-adventure',
    unlockTier: 1, // 全員解放
    levelLocks: [
      { minLevel: 1,  maxLevel: 13, requiredTier: 1 },
      { minLevel: 14, maxLevel: 25, requiredTier: 3 },
    ],
  },
];
```

### Step 3-3: ゲート判定のユーティリティ関数

`src/features/gating/gate-checker.ts` を新規作成。

```typescript
import { Tier } from './tier-system';
import { GAME_LOCK_RULES } from './game-locks';
import { IntegratedGameId } from '@/games/integrated/types';

export interface GameAccessResult {
  accessible: boolean;        // ゲーム自体にアクセスできるか
  maxAccessibleLevel: number; // アクセス可能な最大レベル
  lockedReason?: string;      // ロック理由（UI表示用）
}

export function checkGameAccess(
  gameId: IntegratedGameId,
  userTier: Tier,
): GameAccessResult {
  const rule = GAME_LOCK_RULES.find(r => r.gameId === gameId);
  if (!rule) return { accessible: true, maxAccessibleLevel: 25 };

  // ゲーム自体がロックされているか
  if (userTier < rule.unlockTier) {
    return {
      accessible: false,
      maxAccessibleLevel: 0,
      lockedReason: `このゲームはもう少し成長してから遊べるよ`,
    };
  }

  // アクセス可能な最大レベルを計算
  let maxLevel = 0;
  for (const lock of rule.levelLocks) {
    if (userTier >= lock.requiredTier) {
      maxLevel = Math.max(maxLevel, lock.maxLevel);
    }
  }

  return {
    accessible: true,
    maxAccessibleLevel: maxLevel,
  };
}

export function getAccessibleGames(userTier: Tier): {
  accessible: IntegratedGameId[];
  locked: IntegratedGameId[];
} {
  const accessible: IntegratedGameId[] = [];
  const locked: IntegratedGameId[] = [];

  for (const rule of GAME_LOCK_RULES) {
    if (userTier >= rule.unlockTier) {
      accessible.push(rule.gameId);
    } else {
      locked.push(rule.gameId);
    }
  }

  return { accessible, locked };
}
```

### Step 3-4: barrel export

`src/features/gating/index.ts` を新規作成。

```typescript
export { determineTier, type Tier, type TierInput } from './tier-system';
export { GAME_LOCK_RULES, type GameLockRule } from './game-locks';
export { checkGameAccess, getAccessibleGames, type GameAccessResult } from './gate-checker';
```

### Step 3-5: ティア情報の保存・取得

既存のプロファイル管理の仕組み（localStorage / Supabase）を確認し、ティア情報を保存・取得するhookまたはユーティリティを作成する。

```bash
# 既存のプロファイル管理を調査
grep -r "localStorage\|useLocalStorage\|childProfile\|setChild" src/ --include="*.ts" --include="*.tsx" -l
grep -r "supabase" src/ --include="*.ts" --include="*.tsx" -l
```

調査結果に基づき、`src/features/gating/use-tier.ts` を作成:

```typescript
// 既存のプロファイル管理に合わせて実装
// オンボーディング完了時にdetermineTier()を呼び、結果を保存
// ホーム画面・ゲーム画面でティアを取得して使用
```

### Step 3-6: ホーム画面にロック表示を適用

Step 2で修正した `src/app/page.tsx` を更新:

1. ユーザーのティアを取得
2. `getAccessibleGames(tier)` でアクセス可能/ロックを判定
3. ロックされたゲームは「🔒」アイコン + グレーアウト表示
4. ロックされたゲームをタップすると「もう少し成長してから遊べるよ」表示（遷移はしない）

### Step 3-7: ゲーム画面にレベル制限を適用

`src/app/(game)/game/[integratedId]/page.tsx` を更新:

1. ユーザーのティアを取得
2. `checkGameAccess(gameId, tier)` でアクセス可能な最大レベルを取得
3. ユーザーの現在レベルが `maxAccessibleLevel` を超えていたら、`maxAccessibleLevel` に制限
4. 将来: レベル上限到達時に「新しいレベルが解放されるまでもう少し！」メッセージ

### Step 3-8: テスト

以下を確認:
1. `npm run build` がエラー0で通ること
2. ティア判定ロジックのユニットテスト（可能なら）:
   - 重度ID → Tier 1
   - 3歳+中度ID → Tier 2
   - 6歳+軽度ID → Tier 3
3. Tier 1でホーム画面を見ると: ひかりレスキュー、おぼえてすすむ、くるくるパズル、たんけんめいろ、タッチアドベンチャーがアクセス可能。ルールチェンジ、ことばとえほん、きもちフレンズがロック表示
4. Tier 2で全ゲームアクセス可能だが、高レベル帯はロック
5. Tier 3で全ゲーム全レベルアクセス可能

### 動作テスト方法

ティアを手動切替できるデバッグ機能を追加:
- 開発環境（NODE_ENV=development）でのみ表示
- ホーム画面のどこかに「Tier: [1] [2] [3]」のトグルボタン
- タップするとティアが即時切り替わり、ゲームのロック状態が変わる

## やらないこと（このステップでは）

- キャリブレーション（初回プレイ実績）の実装（Phase 2）
- `additionalCondition` の実際の判定実装（将来）
- ロック解放アニメーション
- ティア昇格の自動判定

## 完了条件

- [ ] `src/features/gating/` 配下に4ファイル作成
- [ ] ティア判定ロジックが動作
- [ ] ホーム画面でロック/解放が反映される
- [ ] ゲーム画面でレベル制限が機能する
- [ ] 開発用ティア切替トグルが動作する
- [ ] `npm run build` エラー0
