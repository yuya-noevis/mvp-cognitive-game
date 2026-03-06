export type Tier = 1 | 2 | 3;

export interface TierInput {
  // Phase 1: parent answers
  age: number;
  diagnosisLevel?: 'severe' | 'moderate' | 'mild' | 'none';
  languageUnderstanding?: 'none' | 'single-word' | 'two-word' | 'sentence';
  tabletOperation?: 'independent' | 'assisted' | 'not_yet';

  // Phase 3: calibration results
  calibrationResult?: {
    simpleReactionSuccess: boolean;
    goNoGoSuccess: boolean;
    shapeMatchSuccess: boolean;
    shapeMatchAccuracy: number; // 0-1
    randomPressRate: number; // 0-1
  };
}

/**
 * Derive diagnosisLevel from legacy disabilities array.
 */
export function deriveDiagnosisLevel(
  disabilities: string[],
): TierInput['diagnosisLevel'] {
  if (disabilities.includes('id_severe')) return 'severe';
  if (disabilities.includes('id_moderate')) return 'moderate';
  if (disabilities.includes('id_mild')) return 'mild';
  if (disabilities.includes('id_unspecified') || disabilities.includes('id_unknown')) return 'moderate';
  if (disabilities.includes('id')) return 'moderate';
  return 'none';
}

/**
 * Derive languageUnderstanding from the new speech level values.
 * Supports both old (v2) and new (v3) speech level formats.
 */
export function deriveLanguageUnderstanding(
  speechLevel: string,
): TierInput['languageUnderstanding'] {
  switch (speechLevel) {
    // New v3 values
    case 'nonverbal':
      return 'none';
    case 'single_word':
      return 'single-word';
    case 'two_word':
      return 'two-word';
    case 'short_sentence':
      return 'two-word';
    case 'conversational':
      return 'sentence';
    // Legacy v2 values
    case 'nonverbal_yesno':
    case 'single_words':
      return 'single-word';
    case 'partial_verbal':
      return 'two-word';
    case 'verbal':
      return 'sentence';
    default:
      return 'single-word';
  }
}

/**
 * Integrated Tier determination:
 * Step 1: Phase 1 parent answers -> provisional tier
 * Step 2: Phase 3 calibration -> confirm/correct
 * Step 3: Divergence detection -> calibration wins
 */
export function determineTier(input: TierInput): Tier {
  // Step 1: Provisional tier from parent answers
  let provisionalTier: Tier = 2; // default middle

  // Tablet operation: "not_yet" -> Tier 1 fixed candidate
  if (input.tabletOperation === 'not_yet') {
    provisionalTier = 1;
  }
  // Language-based provisional
  else if (input.languageUnderstanding === 'none') {
    provisionalTier = 1;
  } else if (input.languageUnderstanding === 'single-word') {
    provisionalTier = input.age < 5 ? 1 : 2;
  } else if (input.languageUnderstanding === 'two-word') {
    provisionalTier = 2;
  } else if (input.languageUnderstanding === 'sentence') {
    provisionalTier = 3;
  }

  // Diagnosis overrides
  if (input.diagnosisLevel === 'severe') provisionalTier = 1;
  if (input.diagnosisLevel === 'moderate' && provisionalTier > 2) provisionalTier = 2;

  // Age override
  if (input.age < 3) provisionalTier = 1;

  // Step 2: Calibration results confirm/correct
  if (input.calibrationResult) {
    const cal = input.calibrationResult;
    let calibrationTier: Tier;

    // Trial 1 (touch): no response or random -> Tier 1
    if (cal.randomPressRate > 0.7 || !cal.simpleReactionSuccess) {
      calibrationTier = 1;
    }
    // Trial 2 (shape match): < 50% -> Tier 1, >= 80% -> Tier 2 unlock
    else if (cal.shapeMatchAccuracy < 0.5) {
      calibrationTier = 1;
    } else if (cal.shapeMatchAccuracy >= 0.8 && cal.goNoGoSuccess) {
      // Trial 3 (Go/No-Go) success -> Tier 3 candidate
      calibrationTier = 3;
    } else if (cal.shapeMatchAccuracy >= 0.8) {
      calibrationTier = 2;
    } else {
      calibrationTier = 2;
    }

    // Step 3: Divergence -> calibration (objective data) wins
    return calibrationTier;
  }

  return provisionalTier;
}

/**
 * Check if there's a divergence between parent-reported and calibration tiers.
 * Returns true if they diverge (and calibration was used as override).
 */
export function detectTierDivergence(input: TierInput): boolean {
  if (!input.calibrationResult) return false;

  // Get provisional tier without calibration
  const withoutCal = { ...input, calibrationResult: undefined };
  const provisionalTier = determineTier(withoutCal);
  const finalTier = determineTier(input);

  return provisionalTier !== finalTier;
}
