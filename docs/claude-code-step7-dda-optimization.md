# Claude Code指示書: DDAパラメータの障害別最適化（Step 7）

## 前提
- `docs/game-design-v2.md` の §6「DDA仕様」を熟読すること
- 既存のDDAエンジンを調査すること

```bash
cat src/features/dda/DDAEngine.ts
grep -r "dda\|DDA\|difficulty\|Difficulty" src/ --include="*.ts" --include="*.tsx" -l
grep -r "targetAccuracy\|correctRate\|successRate" src/ --include="*.ts" --include="*.tsx"
```

## 概要

既存のDDAエンジンに障害種別ごとのターゲット正答率を導入し、難化/易化ルールを設計書v2に合わせて調整する。

## 障害種別ターゲット正答率

| 特性 | ターゲット正答率 | 根拠 |
|------|----------------|------|
| ASD（失敗回避傾向） | 80-90% | 失敗への耐性が低い。成功体験重視 |
| ADHD（即時報酬感度高） | 70-85% | 適度な挑戦で飽き防止 |
| ID 重度 | 85-95% | 学習性無力感防止 |
| ID 中度-軽度 | 80-90% | ASDに準じる |
| 定型発達（測定フェーズ） | 70-80% | 天井・床効果回避 |
| デフォルト（特性不明） | 75-85% | 中間値 |

## 作業手順

### Step 7-1: 障害プロファイル型の定義

`src/features/dda/disability-profile.ts` を新規作成。

```typescript
export type DisabilityType = 'asd' | 'adhd' | 'id-severe' | 'id-moderate' | 'id-mild' | 'typical' | 'unknown';

export interface DDAProfile {
  disabilityType: DisabilityType;
  targetAccuracyMin: number;  // ターゲット正答率の下限
  targetAccuracyMax: number;  // ターゲット正答率の上限
  difficultyUpThreshold: number;    // 難化に必要な連続成功回数
  difficultyDownThreshold: number;  // 易化に必要な連続失敗回数
  emergencyEaseThreshold: number;   // 即時易化（フラストレーション検出）の連続失敗回数
}

export const DDA_PROFILES: Record<DisabilityType, DDAProfile> = {
  'asd': {
    disabilityType: 'asd',
    targetAccuracyMin: 0.80,
    targetAccuracyMax: 0.90,
    difficultyUpThreshold: 2,     // 2連続成功で難化
    difficultyDownThreshold: 1,   // 1窓逸脱で易化
    emergencyEaseThreshold: 2,    // 2連続失敗で即時易化（失敗耐性低い）
  },
  'adhd': {
    disabilityType: 'adhd',
    targetAccuracyMin: 0.70,
    targetAccuracyMax: 0.85,
    difficultyUpThreshold: 2,
    difficultyDownThreshold: 1,
    emergencyEaseThreshold: 3,
  },
  'id-severe': {
    disabilityType: 'id-severe',
    targetAccuracyMin: 0.85,
    targetAccuracyMax: 0.95,
    difficultyUpThreshold: 3,     // 3連続成功でようやく難化（慎重に）
    difficultyDownThreshold: 1,   // 1窓逸脱で即易化
    emergencyEaseThreshold: 2,    // 2連続で即時易化
  },
  'id-moderate': {
    disabilityType: 'id-moderate',
    targetAccuracyMin: 0.80,
    targetAccuracyMax: 0.90,
    difficultyUpThreshold: 2,
    difficultyDownThreshold: 1,
    emergencyEaseThreshold: 3,
  },
  'id-mild': {
    disabilityType: 'id-mild',
    targetAccuracyMin: 0.80,
    targetAccuracyMax: 0.90,
    difficultyUpThreshold: 2,
    difficultyDownThreshold: 1,
    emergencyEaseThreshold: 3,
  },
  'typical': {
    disabilityType: 'typical',
    targetAccuracyMin: 0.70,
    targetAccuracyMax: 0.80,
    difficultyUpThreshold: 2,
    difficultyDownThreshold: 1,
    emergencyEaseThreshold: 3,
  },
  'unknown': {
    disabilityType: 'unknown',
    targetAccuracyMin: 0.75,
    targetAccuracyMax: 0.85,
    difficultyUpThreshold: 2,
    difficultyDownThreshold: 1,
    emergencyEaseThreshold: 3,
  },
};
```

### Step 7-2: オンボーディングから障害プロファイルを導出

`src/features/dda/derive-profile.ts` を新規作成。

```typescript
// オンボーディングのデータ構造を確認して実装
// Step 3で作成した deriveDiagnosisLevel 等を参考にする

import { DisabilityType } from './disability-profile';

export function deriveDisabilityType(onboardingData: any): DisabilityType {
  // 既存のオンボーディングデータのフィールドを確認して実装
  // 以下は想定ロジック — 実際のデータ構造に合わせること
  
  // 1. 診断情報から判定
  // 2. 複数の特性がある場合の優先順位:
  //    ID重度 > ID中度 > ASD > ADHD > ID軽度 > typical
  //    （最もサポートが必要な特性を優先）
}
```

```bash
# オンボーディングで保存される特性情報のフィールドを確認
grep -r "diagnosis\|障害\|特性\|asd\|adhd\|知的\|intellectual" src/app/onboarding/ --include="*.ts" --include="*.tsx"
cat src/app/onboarding/types.ts
```

### Step 7-3: 既存DDAエンジンの改修

既存の `src/features/dda/DDAEngine.ts` を確認し、以下を変更:

**変更方針: 最小限の変更で障害プロファイルを注入する**

1. DDAEngine の初期化時に `DDAProfile` を受け取れるようにする
2. 既存の固定ターゲット正答率を `DDAProfile.targetAccuracyMin/Max` で置換
3. 既存の難化/易化閾値を `DDAProfile.difficultyUpThreshold/DownThreshold` で置換
4. 緊急易化（emergencyEaseThreshold）を追加

**変更イメージ:**

```typescript
// Before（既存の固定値）
class DDAEngine {
  private targetAccuracy = 0.75;
  // ...
}

// After（プロファイル注入）
class DDAEngine {
  private profile: DDAProfile;
  
  constructor(profile?: DDAProfile) {
    this.profile = profile ?? DDA_PROFILES['unknown'];
  }
  
  private get targetAccuracy(): number {
    return (this.profile.targetAccuracyMin + this.profile.targetAccuracyMax) / 2;
  }
  // ...
}
```

**重要: 既存のDDAロジック全体を書き換えない。** プロファイルの注入ポイントのみ変更する。

### Step 7-4: DDA共通ルールの適用確認

設計書v2のDDA共通ルールが既存エンジンに反映されているか確認し、不足があれば追加:

| ルール | 仕様 | 確認 |
|--------|------|------|
| 難化条件 | N連続成功窓で1段階UP（Nはプロファイル依存） | 既存の実装を確認 |
| 易化条件 | 1窓逸脱で即時1段階DOWN | 既存の実装を確認 |
| 緊急易化 | N連続失敗で窓完了を待たず即時DOWN | 追加が必要な可能性高い |
| パラメータ優先順 | 弁別性→刺激数→速度→時間制限 | ゲーム別configで定義 |
| 天井検出 | 3セッション連続最高レベル→通知 | 後回しでOK |
| 床検出 | 3セッション連続最低レベル→通知 | 後回しでOK |

### Step 7-5: ウォームアップ結果のDDA連携

Step 6で実装した `SessionManager.getWarmupAdjustment()` の結果をDDAに反映:

```typescript
// ゲーム開始時
const warmupAdj = sessionManager.getWarmupAdjustment();
ddaEngine.adjustStartLevel(warmupAdj); // -2, -1, or 0
```

既存のDDAEngineに `adjustStartLevel()` メソッドを追加（既にあれば不要）。

### Step 7-6: ゲーム画面での統合

`src/app/(game)/game/[integratedId]/page.tsx` を更新:

1. ユーザーの障害プロファイルを取得
2. `DDA_PROFILES` からプロファイルを参照
3. DDAEngine初期化時にプロファイルを渡す
4. ウォームアップ完了後に `adjustStartLevel()` を呼ぶ

### Step 7-7: 開発用ツール拡張

既存の開発トグルに追加:
- 障害プロファイルの切替（ASD / ADHD / ID重度 / ID中度 / ID軽度 / 定型 / 不明）
- 現在のDDA状態表示（現在レベル、ターゲット正答率、直近の正答率）

### Step 7-8: barrel export

`src/features/dda/` の既存indexファイルに新しいexportを追加。

### Step 7-9: 検証

1. `npm run build` エラー0
2. 開発トグルでプロファイルを切り替えると、DDAの挙動が変わること:
   - ID重度: ほとんど間違えないレベルで推移（85-95%）
   - ADHD: やや挑戦的（70-85%）
   - ASD: 成功体験多め（80-90%）
3. 連続失敗時の緊急易化が発動すること（ASD: 2連続、ADHD: 3連続）
4. ウォームアップ不正解→DDA開始レベルが下がること

## やらないこと（このステップでは）

- ゲーム別のDDAパラメータ優先順（弁別性→刺激数→速度→時間制限）の個別実装
- 天井/床検出の保護者通知
- DDA結果のSupabase保存
- FrustrationDetector との統合（既存のものは温存、将来整理）

## 完了条件

- [ ] `src/features/dda/disability-profile.ts` 作成
- [ ] `src/features/dda/derive-profile.ts` 作成
- [ ] 既存DDAEngineにプロファイル注入が動作
- [ ] 緊急易化が追加されている
- [ ] ウォームアップ→DDA開始レベル調整が連携
- [ ] 開発トグルでプロファイル切替が動作
- [ ] `npm run build` エラー0
