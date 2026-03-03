import { describe, it, expect } from 'vitest';
import {
  evaluateBadges,
  detectNewBadges,
  groupBadgesByCategory,
} from '@/features/badges/badge-evaluator';
import { BADGE_DEFINITIONS } from '@/features/badges/badge-definitions';
import type { BadgeEvaluationInput, EarnedBadge } from '@/features/badges/types';

function makeInput(overrides: Partial<BadgeEvaluationInput> = {}): BadgeEvaluationInput {
  return {
    totalSessionCount: 0,
    totalPlayDays: 0,
    uniqueGamesPlayed: 0,
    totalGamesAvailable: 8,
    currentTier: 1,
    maxTierReached: 1,
    categoryAccuracies: {},
    currentStreakDays: 0,
    ...overrides,
  };
}

describe('BadgeEvaluator', () => {
  describe('evaluateBadges', () => {
    it('should return only tier-up bronze for a brand new user (at tier 1)', () => {
      const result = evaluateBadges(makeInput());
      // A new user at tier 1 gets tier-up bronze (threshold: 1)
      expect(result).toHaveLength(1);
      expect(result[0].badgeId).toBe('tier-up');
      expect(result[0].rank).toBe('bronze');
    });

    it('should return empty array for a user with maxTierReached 0', () => {
      const result = evaluateBadges(makeInput({ maxTierReached: 0 }));
      expect(result).toEqual([]);
    });

    it('should award first-session badge on first play', () => {
      const result = evaluateBadges(makeInput({ totalSessionCount: 1 }));
      const firstSession = result.find(b => b.badgeId === 'first-session');
      expect(firstSession).toBeDefined();
      // first-session has all thresholds at 1, so should get gold
      expect(firstSession!.rank).toBe('gold');
    });

    it('should award play-count bronze at 10 sessions', () => {
      const result = evaluateBadges(makeInput({ totalSessionCount: 10 }));
      const badge = result.find(b => b.badgeId === 'play-count');
      expect(badge).toBeDefined();
      expect(badge!.rank).toBe('bronze');
    });

    it('should award play-count silver at 50 sessions', () => {
      const result = evaluateBadges(makeInput({ totalSessionCount: 50 }));
      const badge = result.find(b => b.badgeId === 'play-count');
      expect(badge!.rank).toBe('silver');
    });

    it('should award play-count gold at 100+ sessions', () => {
      const result = evaluateBadges(makeInput({ totalSessionCount: 150 }));
      const badge = result.find(b => b.badgeId === 'play-count');
      expect(badge!.rank).toBe('gold');
    });

    it('should award play-days badges', () => {
      const result = evaluateBadges(makeInput({ totalPlayDays: 30 }));
      const badge = result.find(b => b.badgeId === 'play-days');
      expect(badge).toBeDefined();
      expect(badge!.rank).toBe('silver');
    });

    it('should award all-games badge based on unique games played', () => {
      const result = evaluateBadges(makeInput({ uniqueGamesPlayed: 5 }));
      const badge = result.find(b => b.badgeId === 'all-games');
      expect(badge).toBeDefined();
      expect(badge!.rank).toBe('silver');
    });

    it('should award streak badges', () => {
      const result = evaluateBadges(makeInput({ currentStreakDays: 7 }));
      const badge = result.find(b => b.badgeId === 'streak');
      expect(badge).toBeDefined();
      expect(badge!.rank).toBe('silver');
    });

    it('should award tier-up badges', () => {
      const result = evaluateBadges(makeInput({ maxTierReached: 2 }));
      const badge = result.find(b => b.badgeId === 'tier-up');
      expect(badge).toBeDefined();
      expect(badge!.rank).toBe('silver');
    });

    it('should award discovery badges based on category accuracy', () => {
      const result = evaluateBadges(makeInput({
        categoryAccuracies: {
          'attention-inhibition': 0.85,
          'memory-learning': 0.70,
        },
      }));

      const attention = result.find(b => b.badgeId === 'strength-attention');
      expect(attention).toBeDefined();
      expect(attention!.rank).toBe('silver'); // 85% >= 80 threshold

      const memory = result.find(b => b.badgeId === 'strength-memory');
      expect(memory).toBeDefined();
      expect(memory!.rank).toBe('bronze'); // 70% >= 70 threshold
    });

    it('should only return the highest earned rank per badge', () => {
      const result = evaluateBadges(makeInput({ totalSessionCount: 100 }));
      const playCountBadges = result.filter(b => b.badgeId === 'play-count');
      // Should only have ONE entry (the highest rank)
      expect(playCountBadges).toHaveLength(1);
      expect(playCountBadges[0].rank).toBe('gold');
    });

    it('should handle a fully accomplished user', () => {
      const result = evaluateBadges(makeInput({
        totalSessionCount: 200,
        totalPlayDays: 150,
        uniqueGamesPlayed: 8,
        currentTier: 3,
        maxTierReached: 3,
        currentStreakDays: 20,
        categoryAccuracies: {
          'attention-inhibition': 0.95,
          'memory-learning': 0.92,
          'flexibility-control': 0.90,
          'perception-spatial': 0.88,
          'social-language': 0.91,
        },
      }));

      // Should have many gold badges
      const goldBadges = result.filter(b => b.rank === 'gold');
      expect(goldBadges.length).toBeGreaterThanOrEqual(5);
    });
  });

  describe('detectNewBadges', () => {
    it('should detect new badges when previous is empty', () => {
      const current: EarnedBadge[] = [
        { badgeId: 'first-session', rank: 'gold', earnedAt: '2026-01-01' },
      ];
      const newBadges = detectNewBadges([], current);
      expect(newBadges).toHaveLength(1);
      expect(newBadges[0].badgeId).toBe('first-session');
    });

    it('should detect rank upgrades as new', () => {
      const previous: EarnedBadge[] = [
        { badgeId: 'play-count', rank: 'bronze', earnedAt: '2026-01-01' },
      ];
      const current: EarnedBadge[] = [
        { badgeId: 'play-count', rank: 'silver', earnedAt: '2026-01-15' },
      ];
      const newBadges = detectNewBadges(previous, current);
      expect(newBadges).toHaveLength(1);
      expect(newBadges[0].rank).toBe('silver');
    });

    it('should return empty when nothing changed', () => {
      const badges: EarnedBadge[] = [
        { badgeId: 'play-count', rank: 'bronze', earnedAt: '2026-01-01' },
      ];
      const newBadges = detectNewBadges(badges, badges);
      expect(newBadges).toHaveLength(0);
    });
  });

  describe('groupBadgesByCategory', () => {
    it('should group badges into correct categories', () => {
      const badges: EarnedBadge[] = [
        { badgeId: 'play-count', rank: 'bronze', earnedAt: '2026-01-01' },
        { badgeId: 'tier-up', rank: 'bronze', earnedAt: '2026-01-01' },
        { badgeId: 'strength-attention', rank: 'silver', earnedAt: '2026-01-01' },
        { badgeId: 'first-session', rank: 'gold', earnedAt: '2026-01-01' },
      ];

      const grouped = groupBadgesByCategory(badges);
      expect(grouped.effort).toHaveLength(1);
      expect(grouped.growth).toHaveLength(1);
      expect(grouped.discovery).toHaveLength(1);
      expect(grouped.special).toHaveLength(1);
    });

    it('should return empty arrays for categories with no badges', () => {
      const grouped = groupBadgesByCategory([]);
      expect(grouped.effort).toHaveLength(0);
      expect(grouped.growth).toHaveLength(0);
      expect(grouped.discovery).toHaveLength(0);
      expect(grouped.special).toHaveLength(0);
    });
  });

  describe('BADGE_DEFINITIONS integrity', () => {
    it('should have unique badge IDs', () => {
      const ids = BADGE_DEFINITIONS.map(d => d.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('should have all required fields', () => {
      for (const badge of BADGE_DEFINITIONS) {
        expect(badge.id).toBeTruthy();
        expect(badge.name).toBeTruthy();
        expect(badge.description).toBeTruthy();
        expect(badge.icon).toBeTruthy();
        expect(badge.category).toBeTruthy();
        expect(badge.criteria.bronze).toBeDefined();
        expect(badge.criteria.silver).toBeDefined();
        expect(badge.criteria.gold).toBeDefined();
      }
    });

    it('should have thresholds in ascending order (bronze <= silver <= gold)', () => {
      for (const badge of BADGE_DEFINITIONS) {
        expect(badge.criteria.bronze.threshold).toBeLessThanOrEqual(badge.criteria.silver.threshold);
        expect(badge.criteria.silver.threshold).toBeLessThanOrEqual(badge.criteria.gold.threshold);
      }
    });

    it('should cover all 4 badge categories', () => {
      const categories = new Set(BADGE_DEFINITIONS.map(d => d.category));
      expect(categories.has('effort')).toBe(true);
      expect(categories.has('growth')).toBe(true);
      expect(categories.has('discovery')).toBe(true);
      expect(categories.has('special')).toBe(true);
    });
  });
});
