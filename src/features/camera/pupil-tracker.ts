import type { PupilData, Landmark } from './types';

/**
 * PupilTracker - MediaPipe Face Mesh pupil tracking
 *
 * Extracts iris landmarks (468-477) from Face Mesh results
 * to estimate pupil diameter and gaze stability.
 * Runs at 5fps sampling rate.
 */

// MediaPipe iris landmark indices
const LEFT_IRIS_INDICES = [468, 469, 470, 471, 472];
const RIGHT_IRIS_INDICES = [473, 474, 475, 476, 477];

export class PupilTracker {
  private baselineDiameter: number | null = null;
  private recentDiameters: number[] = [];
  private recentPositions: { x: number; y: number }[] = [];
  private readonly BASELINE_WINDOW = 30; // First 30 samples for baseline
  private readonly STABILITY_WINDOW = 5;

  /** Process face mesh landmarks and extract pupil data */
  processLandmarks(landmarks: Landmark[]): PupilData | null {
    if (!landmarks || landmarks.length < 478) return null;

    // Extract iris landmarks
    const leftIris = LEFT_IRIS_INDICES.map(i => landmarks[i]);
    const rightIris = RIGHT_IRIS_INDICES.map(i => landmarks[i]);

    // Calculate iris diameters
    const leftDiameter = this.calculateIrisDiameter(leftIris);
    const rightDiameter = this.calculateIrisDiameter(rightIris);
    const avgDiameter = (leftDiameter + rightDiameter) / 2;

    // Track for baseline calculation
    this.recentDiameters.push(avgDiameter);
    if (this.recentDiameters.length > this.BASELINE_WINDOW * 2) {
      this.recentDiameters = this.recentDiameters.slice(-this.BASELINE_WINDOW * 2);
    }

    // Set baseline from first N samples
    if (!this.baselineDiameter && this.recentDiameters.length >= this.BASELINE_WINDOW) {
      const baselineSamples = this.recentDiameters.slice(0, this.BASELINE_WINDOW);
      this.baselineDiameter = baselineSamples.reduce((a, b) => a + b, 0) / baselineSamples.length;
    }

    // Calculate gaze stability
    const centerX = (leftIris[0].x + rightIris[0].x) / 2;
    const centerY = (leftIris[0].y + rightIris[0].y) / 2;
    this.recentPositions.push({ x: centerX, y: centerY });
    if (this.recentPositions.length > this.STABILITY_WINDOW) {
      this.recentPositions = this.recentPositions.slice(-this.STABILITY_WINDOW);
    }

    const gazeStability = this.calculateGazeStability();

    return {
      leftDiameter,
      rightDiameter,
      avgDiameter,
      gazeStability,
      timestamp: Date.now(),
    };
  }

  /** Get cognitive load from pupil dilation relative to baseline */
  getCognitiveLoad(): number {
    if (!this.baselineDiameter || this.recentDiameters.length === 0) return 50;

    const currentDiameter = this.recentDiameters[this.recentDiameters.length - 1];
    const dilationRatio = currentDiameter / this.baselineDiameter;

    // Map dilation ratio to 0-100 scale
    // 1.0 = baseline (50), 1.3+ = high load (100), 0.8- = low load (0)
    const load = Math.min(100, Math.max(0, (dilationRatio - 0.8) / 0.5 * 100));
    return Math.round(load);
  }

  /** Reset tracker state */
  reset(): void {
    this.baselineDiameter = null;
    this.recentDiameters = [];
    this.recentPositions = [];
  }

  /** Calculate diameter from iris landmarks */
  private calculateIrisDiameter(iris: Landmark[]): number {
    if (iris.length < 5) return 0;

    // Center point is index 0, surrounding points are 1-4
    const center = iris[0];
    let totalDist = 0;
    for (let i = 1; i < iris.length; i++) {
      const dx = iris[i].x - center.x;
      const dy = iris[i].y - center.y;
      totalDist += Math.sqrt(dx * dx + dy * dy);
    }

    return (totalDist / (iris.length - 1)) * 2; // Average radius * 2 = diameter
  }

  /** Calculate gaze stability from recent positions */
  private calculateGazeStability(): number {
    if (this.recentPositions.length < 2) return 1;

    let totalMovement = 0;
    for (let i = 1; i < this.recentPositions.length; i++) {
      const dx = this.recentPositions[i].x - this.recentPositions[i - 1].x;
      const dy = this.recentPositions[i].y - this.recentPositions[i - 1].y;
      totalMovement += Math.sqrt(dx * dx + dy * dy);
    }

    const avgMovement = totalMovement / (this.recentPositions.length - 1);
    // Map to 0-1: low movement = high stability
    return Math.max(0, Math.min(1, 1 - avgMovement * 100));
  }
}
