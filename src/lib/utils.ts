import { v4 as uuidv4 } from 'uuid';

/** Generate a random anonymous child ID (non-reversible) */
export function generateAnonChildId(): string {
  return `child_${uuidv4().replace(/-/g, '').slice(0, 16)}`;
}

/** Get current epoch milliseconds */
export function nowMs(): number {
  return Date.now();
}

/** Clamp a value between min and max */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** Compute accuracy from recent trials */
export function computeAccuracy(results: boolean[], windowSize?: number): number {
  const window = windowSize ? results.slice(-windowSize) : results;
  if (window.length === 0) return 0;
  const correct = window.filter(Boolean).length;
  return correct / window.length;
}

/** Shuffle array (Fisher-Yates) */
export function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/** Random integer in [min, max] (inclusive) */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Shuffle an array with a marked "correct" item, ensuring the correct item's
 * final position doesn't repeat the same index 3+ times in a row.
 *
 * @param items - array of items
 * @param isCorrect - predicate to identify the correct item
 * @param recentPositions - mutable array of recent correct-answer indices (max length 2)
 * @returns shuffled array (recentPositions is updated in-place)
 */
export function shuffleWithBiasGuard<T>(
  items: T[],
  isCorrect: (item: T) => boolean,
  recentPositions: number[],
): T[] {
  const maxAttempts = 10;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const result = shuffle(items);
    const correctIdx = result.findIndex(isCorrect);
    // If recent 2 positions are the same and this would be a 3rd repeat, retry
    if (
      recentPositions.length >= 2 &&
      recentPositions[recentPositions.length - 1] === correctIdx &&
      recentPositions[recentPositions.length - 2] === correctIdx
    ) {
      continue;
    }
    // Accept this shuffle
    recentPositions.push(correctIdx);
    if (recentPositions.length > 2) recentPositions.shift();
    return result;
  }
  // Fallback: just use last shuffle
  const result = shuffle(items);
  const correctIdx = result.findIndex(isCorrect);
  recentPositions.push(correctIdx);
  if (recentPositions.length > 2) recentPositions.shift();
  return result;
}

/** Median of numeric array */
export function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}
