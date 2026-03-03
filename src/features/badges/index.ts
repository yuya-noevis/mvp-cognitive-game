export type {
  BadgeCategory,
  BadgeRank,
  BadgeDefinition,
  BadgeCriteria,
  EarnedBadge,
  BadgeStore,
  BadgeEvaluationInput,
} from './types';

export { BADGE_DEFINITIONS } from './badge-definitions';

export {
  evaluateBadges,
  detectNewBadges,
  loadBadgeStore,
  saveBadgeStore,
  updateBadges,
  resetBadgeStore,
  groupBadgesByCategory,
} from './badge-evaluator';
