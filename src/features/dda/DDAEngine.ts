/**
 * DDAEngine - 動的難易度調整エンジン
 *
 * 科学的根拠：ターゲット正答率70〜85%を維持することで、
 * Zone of Proximal Development（最近接発達領域）内での学習を促進。
 * 調整は1ステップずつ行い、急激な変化を避ける。
 */

import type {
  DDAConfig,
  DDAParameterDef,
  DifficultyParams,
  AdaptiveChange,
  AdaptiveChangeReason,
} from '@/types';
import { computeAccuracy } from '@/lib/utils';

/** Accuracy zone for boundary-cross detection */
type AccuracyZone = 'above' | 'below' | 'in_range';

export class DDAEngine {
  private config: DDAConfig;
  private currentParams: DifficultyParams;
  private trialResults: boolean[] = [];
  private lastAccuracyZone: AccuracyZone | null = null;

  constructor(config: DDAConfig) {
    this.config = config;
    this.currentParams = this.getInitialParams();
  }

  /** Get initial difficulty parameters from config */
  private getInitialParams(): DifficultyParams {
    const params: DifficultyParams = {};
    for (const param of this.config.parameters) {
      params[param.name] = param.initial;
    }
    return params;
  }

  /** Get current difficulty parameters */
  getCurrentParams(): DifficultyParams {
    return { ...this.currentParams };
  }

  /** Record a trial result and check if adjustment is needed */
  recordTrialResult(isCorrect: boolean): AdaptiveChange | null {
    this.trialResults.push(isCorrect);

    const minTrials = Math.max(
      this.config.min_trials_before_adjust,
      this.config.window_size,
    );
    if (this.trialResults.length < minTrials) {
      return null;
    }

    const accuracy = computeAccuracy(this.trialResults, this.config.window_size);
    const zone: AccuracyZone =
      accuracy > this.config.target_accuracy_max
        ? 'above'
        : accuracy < this.config.target_accuracy_min
          ? 'below'
          : 'in_range';

    let change: AdaptiveChange | null = null;
    if (zone === 'above' && this.lastAccuracyZone !== 'above') {
      change = this.adjustDifficulty('up', accuracy, 'accuracy_above_target');
    } else if (zone === 'below' && this.lastAccuracyZone !== 'below') {
      change = this.adjustDifficulty('down', accuracy, 'accuracy_below_target');
    }

    this.lastAccuracyZone = zone;
    return change;
  }

  /** Force difficulty reduction (e.g., frustration detected) */
  forceReduceDifficulty(): AdaptiveChange | null {
    const accuracy = computeAccuracy(this.trialResults, this.config.window_size);
    return this.adjustDifficulty('down', accuracy, 'frustration_detected');
  }

  /** Adjust difficulty by 1 step in the given direction */
  private adjustDifficulty(
    direction: 'up' | 'down',
    triggerAccuracy: number,
    reason: AdaptiveChangeReason,
  ): AdaptiveChange | null {
    // Try each parameter in order until one can be adjusted
    for (const paramDef of this.config.parameters) {
      const change = this.tryAdjustParameter(paramDef, direction);
      if (change) {
        this.currentParams[paramDef.name] = change.new_value;
        return {
          ...change,
          reason,
          trigger_accuracy: triggerAccuracy,
          trigger_window: this.config.window_size,
        };
      }
    }
    return null; // All parameters at their limit
  }

  /** Try to adjust a single parameter by 1 step */
  private tryAdjustParameter(
    paramDef: DDAParameterDef,
    direction: 'up' | 'down',
  ): Pick<AdaptiveChange, 'parameter' | 'old_value' | 'new_value'> | null {
    const currentValue = this.currentParams[paramDef.name];

    // Determine if we should increase or decrease the parameter value
    const shouldIncrease =
      (direction === 'up' && paramDef.direction === 'up_is_harder') ||
      (direction === 'down' && paramDef.direction === 'down_is_harder');

    if (paramDef.type === 'numeric') {
      const numValue = currentValue as number;
      const step = paramDef.step ?? 1;
      const newValue = shouldIncrease ? numValue + step : numValue - step;

      if (paramDef.min !== undefined && newValue < paramDef.min) return null;
      if (paramDef.max !== undefined && newValue > paramDef.max) return null;

      return { parameter: paramDef.name, old_value: numValue, new_value: newValue };
    }

    if (paramDef.type === 'categorical' && paramDef.levels) {
      const currentIndex = paramDef.levels.indexOf(currentValue);
      if (currentIndex === -1) return null;

      const newIndex = shouldIncrease ? currentIndex + 1 : currentIndex - 1;
      if (newIndex < 0 || newIndex >= paramDef.levels.length) return null;

      return {
        parameter: paramDef.name,
        old_value: currentValue,
        new_value: paramDef.levels[newIndex],
      };
    }

    return null;
  }

  /** Reset for a new session */
  reset(): void {
    this.trialResults = [];
    this.lastAccuracyZone = null;
    this.currentParams = this.getInitialParams();
  }

  /** Get the current accuracy over the window */
  getCurrentAccuracy(): number {
    return computeAccuracy(this.trialResults, this.config.window_size);
  }

  /** Get total trials recorded */
  getTrialCount(): number {
    return this.trialResults.length;
  }
}
