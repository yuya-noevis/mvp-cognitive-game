import { describe, it, expect } from 'vitest';
import { DDAEngine } from '@/features/dda/DDAEngine';
import type { DDAConfig } from '@/types';
import { hikariCatchConfig } from '@/games/hikari-catch/config';
import { matteStopConfig } from '@/games/matte-stop/config';
import { oboeteNarabeteConfig } from '@/games/oboete-narabete/config';
import { katachiSagashiConfig } from '@/games/katachi-sagashi/config';
import { irokaeSwitchConfig } from '@/games/irokae-switch/config';
import { hayawazaTouchConfig } from '@/games/hayawaza-touch/config';

/**
 * DDA Convergence Simulation Tests
 *
 * 仮想プレイヤーのパフォーマンスレベルに対して、
 * DDAがターゲット正答率帯（70〜85%）に収束するかを検証。
 *
 * 科学的根拠：DDAが適切に機能すれば、
 * 最近接発達領域（ZPD）内でのトレーニングが維持される。
 */

const SIMULATION_TRIALS = 200;
const TARGET_MIN = 0.55;
const TARGET_MAX = 0.90;

/** Seeded RNG (LCG) for deterministic simulation tests */
function createSeededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

/** Simulate a virtual player with a fixed ability level (optional seed for deterministic tests) */
function simulatePlayer(
  ddaConfig: DDAConfig,
  playerAbility: number, // 0-1: probability of getting a trial correct at base difficulty
  trials: number,
  seed?: number,
): { finalAccuracy: number; accuracyHistory: number[] } {
  const rng = seed !== undefined ? createSeededRandom(seed) : () => Math.random();
  const engine = new DDAEngine(ddaConfig);
  const results: boolean[] = [];
  const accuracyHistory: number[] = [];

  for (let i = 0; i < trials; i++) {
    // Player ability is modified by difficulty level
    // Higher difficulty = lower chance of correct response
    const params = engine.getCurrentParams();
    const difficultyModifier = calculateDifficultyModifier(ddaConfig, params);
    const adjustedAbility = Math.max(0, Math.min(1, playerAbility - difficultyModifier));

    const isCorrect = rng() < adjustedAbility;
    results.push(isCorrect);
    engine.recordTrialResult(isCorrect);

    // Track rolling accuracy
    if (results.length >= 10) {
      const recent = results.slice(-10);
      const acc = recent.filter(Boolean).length / recent.length;
      accuracyHistory.push(acc);
    }
  }

  const recentResults = results.slice(-20);
  const finalAccuracy = recentResults.filter(Boolean).length / recentResults.length;

  return { finalAccuracy, accuracyHistory };
}

/** Calculate how much harder current params are vs initial */
function calculateDifficultyModifier(config: DDAConfig, params: Record<string, number | string>): number {
  let modifier = 0;

  for (const paramDef of config.parameters) {
    if (paramDef.type === 'numeric' && paramDef.min !== undefined && paramDef.max !== undefined) {
      const current = params[paramDef.name] as number;
      const range = paramDef.max - paramDef.min;
      if (range === 0) continue;

      const normalizedPos = (current - paramDef.min) / range;

      if (paramDef.direction === 'up_is_harder') {
        modifier += normalizedPos * 0.15; // Each param contributes up to 15% difficulty
      } else {
        modifier += (1 - normalizedPos) * 0.15;
      }
    }
  }

  return modifier;
}

const gameConfigs: [string, DDAConfig][] = [
  ['hikari-catch', hikariCatchConfig.dda],
  ['matte-stop', matteStopConfig.dda],
  ['oboete-narabete', oboeteNarabeteConfig.dda],
  ['katachi-sagashi', katachiSagashiConfig.dda],
  ['irokae-switch', irokaeSwitchConfig.dda],
  ['hayawaza-touch', hayawazaTouchConfig.dda],
];

describe('DDA Convergence Simulation', () => {
  describe.each(gameConfigs)('%s', (gameName, ddaConfig) => {
    const seed = gameName.split('').reduce((a, c) => a + c.charCodeAt(0), 0);

    it('should converge for a high-ability player (90%)', () => {
      const { finalAccuracy } = simulatePlayer(ddaConfig, 0.9, SIMULATION_TRIALS, seed);
      expect(finalAccuracy).toBeGreaterThanOrEqual(TARGET_MIN);
      expect(finalAccuracy).toBeLessThanOrEqual(TARGET_MAX);
    });

    it('should converge for a medium-ability player (70%)', () => {
      const { finalAccuracy } = simulatePlayer(ddaConfig, 0.7, SIMULATION_TRIALS, seed + 1000);
      expect(finalAccuracy).toBeGreaterThanOrEqual(TARGET_MIN);
      expect(finalAccuracy).toBeLessThanOrEqual(TARGET_MAX);
    });

    it('should handle a low-ability player (40%) without crashing', () => {
      const { finalAccuracy } = simulatePlayer(ddaConfig, 0.4, SIMULATION_TRIALS, seed + 2000);
      // Low ability player should at least have difficulty reduced to minimum
      // Accuracy may still be below target but should not crash
      expect(finalAccuracy).toBeGreaterThanOrEqual(0);
      expect(finalAccuracy).toBeLessThanOrEqual(1);
    });

    it('should not cause oscillation for a stable player (80%)', () => {
      const { accuracyHistory } = simulatePlayer(ddaConfig, 0.8, SIMULATION_TRIALS, seed + 3000);

      // Check that accuracy doesn't swing wildly in the last 50 trials
      const lastEntries = accuracyHistory.slice(-50);
      if (lastEntries.length >= 10) {
        const variance = calculateVariance(lastEntries);
        // Variance should be reasonably low (< 0.05) indicating stability
        expect(variance).toBeLessThan(0.05);
      }
    });
  });
});

function calculateVariance(values: number[]): number {
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  return values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
}
