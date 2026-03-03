import { describe, it, expect } from 'vitest';
import {
  getPlantGrowthInfo,
  calculateXpMultiplier,
  applyGrowthXpBonus,
  calculateGrowthLevel,
} from '@/features/rewards/plant-growth';
import type { GrowthLevel } from '@/features/rewards/plant-growth';

describe('PlantGrowth', () => {
  describe('getPlantGrowthInfo', () => {
    it('should return correct info for level 1 (seed)', () => {
      const info = getPlantGrowthInfo(1);
      expect(info.level).toBe(1);
      expect(info.label).toBe('たね');
      expect(info.xpMultiplier).toBe(1.0);
      expect(info.hasBonusItem).toBe(false);
      expect(info.hasRareBoost).toBe(false);
      expect(info.hasExclusiveReward).toBe(false);
    });

    it('should return correct info for level 2 (sprout)', () => {
      const info = getPlantGrowthInfo(2);
      expect(info.level).toBe(2);
      expect(info.label).toBe('め');
      expect(info.xpMultiplier).toBe(1.2);
      expect(info.hasBonusItem).toBe(false);
    });

    it('should return correct info for level 3 (flower) with bonus item', () => {
      const info = getPlantGrowthInfo(3);
      expect(info.level).toBe(3);
      expect(info.label).toBe('はな');
      expect(info.xpMultiplier).toBe(1.5);
      expect(info.hasBonusItem).toBe(true);
      expect(info.hasRareBoost).toBe(false);
    });

    it('should return correct info for level 4 (tree) with rare boost', () => {
      const info = getPlantGrowthInfo(4);
      expect(info.level).toBe(4);
      expect(info.label).toBe('き');
      expect(info.xpMultiplier).toBe(2.0);
      expect(info.hasBonusItem).toBe(true);
      expect(info.hasRareBoost).toBe(true);
      expect(info.hasExclusiveReward).toBe(false);
    });

    it('should return correct info for level 5 (forest) with all bonuses', () => {
      const info = getPlantGrowthInfo(5);
      expect(info.level).toBe(5);
      expect(info.label).toBe('もり');
      expect(info.xpMultiplier).toBe(2.5);
      expect(info.hasBonusItem).toBe(true);
      expect(info.hasRareBoost).toBe(true);
      expect(info.hasExclusiveReward).toBe(true);
    });
  });

  describe('calculateXpMultiplier', () => {
    it('should return correct multipliers for each level', () => {
      const expected: [GrowthLevel, number][] = [
        [1, 1.0],
        [2, 1.2],
        [3, 1.5],
        [4, 2.0],
        [5, 2.5],
      ];
      for (const [level, multiplier] of expected) {
        expect(calculateXpMultiplier(level)).toBe(multiplier);
      }
    });
  });

  describe('applyGrowthXpBonus', () => {
    it('should not modify base XP at level 1', () => {
      expect(applyGrowthXpBonus(100, 1)).toBe(100);
    });

    it('should apply 1.2x at level 2', () => {
      expect(applyGrowthXpBonus(100, 2)).toBe(120);
    });

    it('should apply 1.5x at level 3', () => {
      expect(applyGrowthXpBonus(100, 3)).toBe(150);
    });

    it('should apply 2.0x at level 4', () => {
      expect(applyGrowthXpBonus(100, 4)).toBe(200);
    });

    it('should apply 2.5x at level 5', () => {
      expect(applyGrowthXpBonus(100, 5)).toBe(250);
    });

    it('should round the result', () => {
      // 33 * 1.2 = 39.6 → 40
      expect(applyGrowthXpBonus(33, 2)).toBe(40);
    });

    it('should handle zero XP', () => {
      expect(applyGrowthXpBonus(0, 5)).toBe(0);
    });
  });

  describe('calculateGrowthLevel', () => {
    it('should return level 1 for 0 or negative days', () => {
      expect(calculateGrowthLevel(0)).toBe(1);
      expect(calculateGrowthLevel(-1)).toBe(1);
    });

    it('should return level matching day count for 1-5', () => {
      expect(calculateGrowthLevel(1)).toBe(1);
      expect(calculateGrowthLevel(2)).toBe(2);
      expect(calculateGrowthLevel(3)).toBe(3);
      expect(calculateGrowthLevel(4)).toBe(4);
      expect(calculateGrowthLevel(5)).toBe(5);
    });

    it('should cap at level 5 for more than 5 days', () => {
      expect(calculateGrowthLevel(10)).toBe(5);
      expect(calculateGrowthLevel(100)).toBe(5);
    });
  });

  describe('growth progression properties', () => {
    it('should have monotonically increasing XP multipliers', () => {
      const levels: GrowthLevel[] = [1, 2, 3, 4, 5];
      for (let i = 1; i < levels.length; i++) {
        const prevMultiplier = calculateXpMultiplier(levels[i - 1]);
        const currMultiplier = calculateXpMultiplier(levels[i]);
        expect(currMultiplier).toBeGreaterThan(prevMultiplier);
      }
    });

    it('should have bonus items starting at level 3', () => {
      expect(getPlantGrowthInfo(1).hasBonusItem).toBe(false);
      expect(getPlantGrowthInfo(2).hasBonusItem).toBe(false);
      expect(getPlantGrowthInfo(3).hasBonusItem).toBe(true);
      expect(getPlantGrowthInfo(4).hasBonusItem).toBe(true);
      expect(getPlantGrowthInfo(5).hasBonusItem).toBe(true);
    });

    it('should have rare boost starting at level 4', () => {
      expect(getPlantGrowthInfo(3).hasRareBoost).toBe(false);
      expect(getPlantGrowthInfo(4).hasRareBoost).toBe(true);
      expect(getPlantGrowthInfo(5).hasRareBoost).toBe(true);
    });

    it('should have exclusive reward only at level 5', () => {
      expect(getPlantGrowthInfo(4).hasExclusiveReward).toBe(false);
      expect(getPlantGrowthInfo(5).hasExclusiveReward).toBe(true);
    });
  });
});
