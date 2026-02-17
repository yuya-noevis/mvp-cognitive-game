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

/** Median of numeric array */
export function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}
