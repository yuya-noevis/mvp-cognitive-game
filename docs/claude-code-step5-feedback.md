# Claude Code指示書: フィードバック設計の実装（Step 5）

## 前提
- `docs/game-design-v2.md` の §10「フィードバック設計」を熟読すること
- Step 4で作成した `src/features/instruction/` の指示レベルを利用すること
- 既存ゲームのフィードバック処理を調査すること

```bash
# 既存のフィードバック処理を調査
grep -r "correct\|incorrect\|wrong\|right\|正解\|不正解\|score\|feedback" src/games/ --include="*.tsx" --include="*.ts" -l
grep -r "onCorrect\|onWrong\|onAnswer\|handleAnswer\|handleResult" src/games/ --include="*.tsx" --include="*.ts" -l
grep -r "sound\|audio\|Sound\|Audio\|振動\|vibra" src/ --include="*.tsx" --include="*.ts" -l
```

## 概要

正解/不正解時の多感覚フィードバック（音+視覚+振動）を統一的に実装する。連続正解ブースト、惜しいメカニクス、スキャフォールディングも含む。

## 設計原則

1. **正解 = 快** の条件付けを強化（パブロフ原理）
2. **不正解 ≠ 罰** — 挫折ゼロ設計。ブザー音・バツ印・赤全面表示は禁止
3. **指示レベルに応じたフィードバック強度**（L1は音なし）
4. **感覚過敏対応**（音量調整、振動OFF、エフェクト強度調整）

## 作業手順

### Step 5-1: フィードバック設定の定義

`src/features/feedback/feedback-config.ts` を新規作成。

```typescript
import { InstructionLevel } from '@/features/instruction';

// フィードバック強度設定（保護者が変更可能）
export interface FeedbackSettings {
  soundEnabled: boolean;
  soundVolume: number;       // 0-1
  vibrationEnabled: boolean;
  visualIntensity: 'subtle' | 'standard' | 'vivid';
}

export const DEFAULT_FEEDBACK_SETTINGS: FeedbackSettings = {
  soundEnabled: true,
  soundVolume: 0.7,
  vibrationEnabled: true,
  visualIntensity: 'standard',
};

// 指示レベルに応じたデフォルト
export function getFeedbackSettingsForLevel(level: InstructionLevel): FeedbackSettings {
  switch (level) {
    case 'L1':
      return {
        soundEnabled: false,   // 非言語モード: 音なし
        soundVolume: 0,
        vibrationEnabled: true,
        visualIntensity: 'subtle',
      };
    case 'L2':
      return {
        soundEnabled: true,
        soundVolume: 0.5,
        vibrationEnabled: true,
        visualIntensity: 'standard',
      };
    case 'L3':
      return DEFAULT_FEEDBACK_SETTINGS;
    case 'L4':
      return {
        ...DEFAULT_FEEDBACK_SETTINGS,
        soundVolume: 0.5,  // ASD: やや控えめ
      };
  }
}
```

### Step 5-2: サウンドマネージャー

`src/features/feedback/sound-manager.ts` を新規作成。

```typescript
// MVPでは Web Audio API で短い合成音を生成
// 将来: 録音音声ファイルに置換可能

export class SoundManager {
  private audioContext: AudioContext | null = null;

  private getContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
    }
    return this.audioContext;
  }

  // 正解音: 短い高音「ding」(200ms)
  playCorrect(volume: number = 0.7): void {
    const ctx = this.getContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880; // A5
    osc.type = 'sine';
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.2);
  }

  // 連続正解ブースト音: 上昇音（300ms）
  playStreak(volume: number = 0.7): void {
    const ctx = this.getContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(523, ctx.currentTime);    // C5
    osc.frequency.linearRampToValueAtTime(1047, ctx.currentTime + 0.3); // C6
    osc.type = 'sine';
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
  }

  // 不正解音: 柔らかい低音「ポン」(150ms) — L2以上のみ
  playIncorrect(volume: number = 0.3): void {
    const ctx = this.getContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 220; // A3（低く柔らかい）
    osc.type = 'sine';
    gain.gain.setValueAtTime(volume * 0.5, ctx.currentTime); // 正解より小さい音量
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.15);
  }
}

export const soundManager = new SoundManager();
```

### Step 5-3: 振動マネージャー

`src/features/feedback/vibration-manager.ts` を新規作成。

```typescript
export class VibrationManager {
  private supported: boolean;

  constructor() {
    this.supported = typeof navigator !== 'undefined' && 'vibrate' in navigator;
  }

  // 正解: 軽いパルス (50ms)
  vibrateCorrect(): void {
    if (this.supported) navigator.vibrate(50);
  }

  // 連続正解ブースト: ダブルパルス
  vibrateStreak(): void {
    if (this.supported) navigator.vibrate([50, 50, 50]);
  }

  // 不正解: なし（振動で罰を与えない）
  // 意図的に実装しない
}

export const vibrationManager = new VibrationManager();
```

### Step 5-4: 視覚エフェクトコンポーネント

`src/features/feedback/VisualFeedback.tsx` を新規作成。

正解・不正解・連続ブーストの視覚エフェクトを提供するReactコンポーネント。

```typescript
interface VisualFeedbackProps {
  type: 'correct' | 'incorrect' | 'streak-3' | 'streak-5' | 'near-miss' | null;
  intensity: 'subtle' | 'standard' | 'vivid';
  onComplete?: () => void; // アニメーション完了コールバック
}
```

**各エフェクトの仕様:**

| type | 視覚エフェクト | 持続時間 |
|------|-------------|---------|
| `correct` | ターゲット周辺に光の輪（緑〜金色のグロー） | 300ms |
| `incorrect` | 画面全体が軽く揺れる（CSS shake） | 200ms |
| `streak-3` | マスコットが喜ぶアニメーション（ジャンプ + 星エフェクト） | 800ms |
| `streak-5` | コンフェッティ（紙吹雪）+ マスコットスペシャル | 1200ms |
| `near-miss` | 黄色のグロー +「おしい！」テキスト（L2以上のみ） | 500ms |

**intensity による調整:**
- `subtle`: エフェクトサイズ50%、不透明度50%（Tier 1向け）
- `standard`: 通常表示
- `vivid`: エフェクトサイズ150%、パーティクル追加（Tier 3上位向け）

**実装方針:**
- CSS animation + requestAnimationFrame で実装
- コンフェッティは軽量ライブラリ（canvas-confetti）を使用してOK（`npm install canvas-confetti`）
- framer-motionが既に入っていれば、それを使ってもOK

```bash
# 既存のアニメーションライブラリを確認
grep -r "framer-motion\|gsap\|react-spring\|canvas-confetti" package.json
```

### Step 5-5: 連続正解トラッカー

`src/features/feedback/streak-tracker.ts` を新規作成。

```typescript
export class StreakTracker {
  private consecutiveCorrect: number = 0;
  private totalCorrect: number = 0;
  private totalAttempts: number = 0;
  private consecutiveIncorrect: number = 0;

  recordCorrect(): {
    streak: number;
    isStreak3: boolean;
    isStreak5: boolean;
  } {
    this.consecutiveCorrect++;
    this.consecutiveIncorrect = 0;
    this.totalCorrect++;
    this.totalAttempts++;
    return {
      streak: this.consecutiveCorrect,
      isStreak3: this.consecutiveCorrect === 3,
      isStreak5: this.consecutiveCorrect === 5,
    };
  }

  recordIncorrect(): {
    consecutiveIncorrect: number;
    shouldShowHint: boolean;       // 2連続不正解
    shouldShowDemo: boolean;       // 3連続不正解
    shouldEaseDifficulty: boolean; // 3連続不正解→DDAへ通知
  } {
    this.consecutiveCorrect = 0;
    this.consecutiveIncorrect++;
    this.totalAttempts++;
    return {
      consecutiveIncorrect: this.consecutiveIncorrect,
      shouldShowHint: this.consecutiveIncorrect === 2,
      shouldShowDemo: this.consecutiveIncorrect >= 3,
      shouldEaseDifficulty: this.consecutiveIncorrect >= 3,
    };
  }

  // 惜しい判定（near-miss）
  // ゲーム側が「惜しい回答だったか」を判断して呼ぶ
  recordNearMiss(): void {
    // 連続正解ブーストを失わない
    // consecutiveCorrectをリセットしない
    this.totalAttempts++;
  }

  reset(): void {
    this.consecutiveCorrect = 0;
    this.consecutiveIncorrect = 0;
    this.totalCorrect = 0;
    this.totalAttempts = 0;
  }

  getStats() {
    return {
      consecutiveCorrect: this.consecutiveCorrect,
      consecutiveIncorrect: this.consecutiveIncorrect,
      totalCorrect: this.totalCorrect,
      totalAttempts: this.totalAttempts,
      accuracy: this.totalAttempts > 0 ? this.totalCorrect / this.totalAttempts : 0,
    };
  }
}
```

### Step 5-6: 統合フィードバックhook

`src/features/feedback/use-feedback.ts` を新規作成。

音・視覚・振動・ストリークを統合して、ゲームコンポーネントから簡単に使えるhookを提供:

```typescript
import { useCallback, useState, useRef } from 'react';

export function useFeedback(settings: FeedbackSettings) {
  const [currentEffect, setCurrentEffect] = useState<VisualFeedbackProps['type']>(null);
  const streakTracker = useRef(new StreakTracker());

  const triggerCorrect = useCallback(() => {
    const result = streakTracker.current.recordCorrect();
    
    // サウンド
    if (settings.soundEnabled) {
      if (result.isStreak3 || result.isStreak5) {
        soundManager.playStreak(settings.soundVolume);
      } else {
        soundManager.playCorrect(settings.soundVolume);
      }
    }
    
    // 振動
    if (settings.vibrationEnabled) {
      if (result.isStreak3 || result.isStreak5) {
        vibrationManager.vibrateStreak();
      } else {
        vibrationManager.vibrateCorrect();
      }
    }
    
    // 視覚エフェクト
    if (result.isStreak5) {
      setCurrentEffect('streak-5');
    } else if (result.isStreak3) {
      setCurrentEffect('streak-3');
    } else {
      setCurrentEffect('correct');
    }
    
    return result;
  }, [settings]);

  const triggerIncorrect = useCallback(() => {
    const result = streakTracker.current.recordIncorrect();
    
    // サウンド（L1では鳴らさない = soundEnabled: false）
    if (settings.soundEnabled) {
      soundManager.playIncorrect(settings.soundVolume);
    }
    
    // 振動なし（不正解で振動は罰になる）
    
    // 視覚: 画面揺れ
    setCurrentEffect('incorrect');
    
    return result;
  }, [settings]);

  const triggerNearMiss = useCallback(() => {
    streakTracker.current.recordNearMiss();
    setCurrentEffect('near-miss');
  }, []);

  const clearEffect = useCallback(() => {
    setCurrentEffect(null);
  }, []);

  return {
    triggerCorrect,
    triggerIncorrect,
    triggerNearMiss,
    clearEffect,
    currentEffect,
    streakStats: streakTracker.current.getStats(),
  };
}
```

### Step 5-7: ゲーム画面への統合

`src/app/(game)/game/[integratedId]/page.tsx` を更新:

1. `useFeedback` hookを初期化
2. `VisualFeedback` コンポーネントをゲーム画面にオーバーレイ配置
3. **既存ゲームのフィードバック処理との統合方法を調査**:

```bash
# 既存ゲームがフィードバックをどう呼び出しているか確認
grep -r "onCorrect\|onIncorrect\|onResult\|handleResult\|onAnswer" src/games/ --include="*.tsx" -A 3
```

**統合方針**: 
- 既存ゲームがコールバック（onCorrect/onIncorrect等）を受け取る設計なら、そこにhookの関数を渡す
- コールバックがない場合は、ゲームのラッパーレベルでイベントを監視する仕組みを作る
- **既存ゲームのコード自体は極力変更しない**。統合レイヤー（`/game/[integratedId]/page.tsx`）で吸収する

### Step 5-8: barrel export

`src/features/feedback/index.ts` を新規作成。

### Step 5-9: 検証

1. `npm run build` エラー0
2. 正解時: ding音 + 緑グロー + 振動 が発生すること
3. 3問連続正解: ブースト音 + マスコットアニメ
4. 5問連続正解: コンフェッティ
5. 不正解時（L1）: 音なし、画面揺れのみ
6. 不正解時（L2-L4）: 柔らかい低音 + 画面揺れ
7. 2連続不正解: ヒント表示トリガー
8. 3連続不正解: デモ再生トリガー
9. 開発トグルでfeedback設定を変更できること（音ON/OFF、振動ON/OFF、intensity切替）

## やらないこと（このステップでは）

- 録音音声（ding音はWeb Audio APIの合成音でMVP）
- 既存ゲームコンポーネント内部のフィードバック処理書き換え
- マスコットキャラクターの本格デザイン（MVPでは絵文字 or シンプルSVG）
- セッション完了報酬（宝箱等）— Step 8で実装
- フィードバック設定の保護者向け設定画面

## 完了条件

- [ ] `src/features/feedback/` 配下にファイル群作成
- [ ] SoundManagerが正解音・ブースト音・不正解音を再生
- [ ] VibrationManagerが正解振動を発生
- [ ] VisualFeedbackが5種類のエフェクトを表示
- [ ] StreakTrackerが連続正解/不正解を正しくカウント
- [ ] useFeedback hookが統合的に動作
- [ ] ゲーム画面でフィードバックが実際に動作（最低1ゲームで確認）
- [ ] `npm run build` エラー0
