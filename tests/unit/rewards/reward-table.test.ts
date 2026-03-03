import { describe, it, expect } from 'vitest';
import {
  rollRarity,
  getRarityProbabilities,
  pickRewardByRarity,
  rollTreasureChests,
  REWARD_POOL,
  PREDICTABLE_REWARD,
} from '@/features/rewards/reward-table';

describe('RewardTable', () => {
  describe('getRarityProbabilities', () => {
    it('should return base probabilities for growth level 1-3', () => {
      for (const level of [1, 2, 3]) {
        const probs = getRarityProbabilities(level);
        expect(probs.common).toBe(0.60);
        expect(probs.uncommon).toBe(0.30);
        expect(probs.rare).toBe(0.10);
        // Sum must be 1
        expect(probs.common + probs.uncommon + probs.rare).toBeCloseTo(1.0);
      }
    });

    it('should increase rare probability at growth level 4', () => {
      const probs = getRarityProbabilities(4);
      expect(probs.rare).toBe(0.15);
      expect(probs.uncommon).toBe(0.30);
      expect(probs.common).toBe(0.55);
      expect(probs.common + probs.uncommon + probs.rare).toBeCloseTo(1.0);
    });

    it('should further increase rare probability at growth level 5', () => {
      const probs = getRarityProbabilities(5);
      expect(probs.rare).toBe(0.20);
      expect(probs.uncommon).toBe(0.30);
      expect(probs.common).toBe(0.50);
      expect(probs.common + probs.uncommon + probs.rare).toBeCloseTo(1.0);
    });

    it('should clamp out-of-range levels', () => {
      expect(getRarityProbabilities(0)).toEqual(getRarityProbabilities(1));
      expect(getRarityProbabilities(6)).toEqual(getRarityProbabilities(5));
    });
  });

  describe('rollRarity', () => {
    it('should return rare when roll is below rare threshold', () => {
      const rng = () => 0.05; // Below 0.10
      expect(rollRarity(1, rng)).toBe('rare');
    });

    it('should return uncommon when roll is in uncommon range', () => {
      const rng = () => 0.25; // Between 0.10 and 0.40
      expect(rollRarity(1, rng)).toBe('uncommon');
    });

    it('should return common when roll is above uncommon+rare threshold', () => {
      const rng = () => 0.50; // Above 0.40
      expect(rollRarity(1, rng)).toBe('common');
    });

    it('should respect growth level 5 rare boost', () => {
      const rng = () => 0.15; // Would be uncommon at level 1, but rare at level 5
      expect(rollRarity(1, rng)).toBe('uncommon');
      expect(rollRarity(5, rng)).toBe('rare');
    });

    it('should handle edge case: roll exactly at boundary', () => {
      // At level 1: rare < 0.10, uncommon < 0.40, common >= 0.40
      expect(rollRarity(1, () => 0.10)).toBe('uncommon'); // Exactly at rare boundary
      expect(rollRarity(1, () => 0.40)).toBe('common'); // Exactly at uncommon boundary
    });
  });

  describe('pickRewardByRarity', () => {
    it('should return a common item', () => {
      const item = pickRewardByRarity('common', () => 0);
      expect(item.rarity).toBe('common');
    });

    it('should return an uncommon item', () => {
      const item = pickRewardByRarity('uncommon', () => 0);
      expect(item.rarity).toBe('uncommon');
    });

    it('should return a rare item', () => {
      const item = pickRewardByRarity('rare', () => 0);
      expect(item.rarity).toBe('rare');
    });

    it('should always return a valid reward item', () => {
      for (let i = 0; i < 100; i++) {
        const rarity = (['common', 'uncommon', 'rare'] as const)[Math.floor(Math.random() * 3)];
        const item = pickRewardByRarity(rarity);
        expect(item).toBeDefined();
        expect(item.id).toBeTruthy();
        expect(item.name).toBeTruthy();
      }
    });
  });

  describe('rollTreasureChests', () => {
    it('should return exactly 3 rewards', () => {
      const chests = rollTreasureChests(1);
      expect(chests).toHaveLength(3);
    });

    it('should return 3 distinct rewards (no duplicates)', () => {
      // Use a fixed seed for reproducibility
      let call = 0;
      const rng = () => {
        const values = [0.5, 0.5, 0.5, 0.01, 0.02, 0.5, 0.3, 0.7, 0.9];
        return values[call++ % values.length];
      };
      const chests = rollTreasureChests(1, rng);
      const ids = new Set(chests.map(c => c.id));
      expect(ids.size).toBe(3);
    });

    it('should produce rewards from the pool', () => {
      const chests = rollTreasureChests(3);
      const poolIds = new Set(REWARD_POOL.map(r => r.id));
      for (const chest of chests) {
        expect(poolIds.has(chest.id)).toBe(true);
      }
    });

    it('should work at all growth levels', () => {
      for (let level = 1; level <= 5; level++) {
        const chests = rollTreasureChests(level);
        expect(chests).toHaveLength(3);
        for (const chest of chests) {
          expect(chest.id).toBeTruthy();
        }
      }
    });
  });

  describe('REWARD_POOL', () => {
    it('should have items of each rarity', () => {
      const rarities = new Set(REWARD_POOL.map(r => r.rarity));
      expect(rarities.has('common')).toBe(true);
      expect(rarities.has('uncommon')).toBe(true);
      expect(rarities.has('rare')).toBe(true);
    });

    it('should have at least 3 items of each rarity for chest diversity', () => {
      const common = REWARD_POOL.filter(r => r.rarity === 'common');
      const uncommon = REWARD_POOL.filter(r => r.rarity === 'uncommon');
      const rare = REWARD_POOL.filter(r => r.rarity === 'rare');
      expect(common.length).toBeGreaterThanOrEqual(3);
      expect(uncommon.length).toBeGreaterThanOrEqual(3);
      expect(rare.length).toBeGreaterThanOrEqual(3);
    });

    it('should have unique IDs', () => {
      const ids = REWARD_POOL.map(r => r.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('should have bonus stars on bonus_stars type items', () => {
      const starItems = REWARD_POOL.filter(r => r.type === 'bonus_stars');
      for (const item of starItems) {
        expect(item.bonusStars).toBeGreaterThan(0);
      }
    });
  });

  describe('PREDICTABLE_REWARD', () => {
    it('should be a bonus_stars type with stars', () => {
      expect(PREDICTABLE_REWARD.type).toBe('bonus_stars');
      expect(PREDICTABLE_REWARD.bonusStars).toBeGreaterThan(0);
    });

    it('should be common rarity', () => {
      expect(PREDICTABLE_REWARD.rarity).toBe('common');
    });
  });

  describe('statistical distribution (Monte Carlo)', () => {
    it('should approximate expected rarity distribution over many rolls', () => {
      const counts = { common: 0, uncommon: 0, rare: 0 };
      const n = 10000;
      for (let i = 0; i < n; i++) {
        const rarity = rollRarity(1);
        counts[rarity]++;
      }
      // With 10000 rolls, we expect roughly:
      // common: 60%, uncommon: 30%, rare: 10%
      // Allow 3% tolerance
      expect(counts.common / n).toBeCloseTo(0.60, 1);
      expect(counts.uncommon / n).toBeCloseTo(0.30, 1);
      expect(counts.rare / n).toBeCloseTo(0.10, 1);
    });

    it('should show increased rare rate at growth level 5', () => {
      const counts = { common: 0, uncommon: 0, rare: 0 };
      const n = 10000;
      for (let i = 0; i < n; i++) {
        const rarity = rollRarity(5);
        counts[rarity]++;
      }
      // At level 5: common 50%, uncommon 30%, rare 20%
      expect(counts.rare / n).toBeCloseTo(0.20, 1);
      expect(counts.common / n).toBeCloseTo(0.50, 1);
    });
  });
});
