export type Tier = 1 | 2 | 3;

export interface TierInput {
  // オンボーディングから取得
  age: number;
  diagnosisLevel?: 'severe' | 'moderate' | 'mild' | 'none';
  languageUnderstanding?: 'none' | 'single-word' | 'two-word' | 'sentence';

  // キャリブレーションから取得（Phase 2で実装、今はoptional）
  calibrationResult?: {
    simpleReactionSuccess: boolean;
    goNoGoSuccess: boolean;
    shapeMatchSuccess: boolean;
    randomPressRate: number; // 0-1
  };
}

/**
 * オンボーディングの disabilities 配列から diagnosisLevel を導出する。
 * disabilities には 'id_severe', 'id_moderate', 'id_mild', 'id_unspecified' が含まれうる。
 */
export function deriveDiagnosisLevel(
  disabilities: string[],
): TierInput['diagnosisLevel'] {
  if (disabilities.includes('id_severe')) return 'severe';
  if (disabilities.includes('id_moderate')) return 'moderate';
  if (disabilities.includes('id_mild')) return 'mild';
  if (disabilities.includes('id_unspecified')) return 'moderate'; // 不明は中度扱い
  return 'none';
}

/**
 * オンボーディングの speechLevel から languageUnderstanding を導出する。
 */
export function deriveLanguageUnderstanding(
  speechLevel: string,
): TierInput['languageUnderstanding'] {
  switch (speechLevel) {
    case 'nonverbal':
      return 'none';
    case 'nonverbal_yesno':
    case 'single_words':
      return 'single-word';
    case 'partial_verbal':
      return 'two-word';
    case 'verbal':
      return 'sentence';
    default:
      return 'single-word'; // 未入力は中間扱い
  }
}

/**
 * ティア判定。キャリブレーション結果があればそちらを優先し、
 * なければオンボーディング回答から判定する。
 */
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
  if (
    input.languageUnderstanding === 'none' ||
    input.languageUnderstanding === 'single-word'
  )
    return 2;

  return 3;
}
