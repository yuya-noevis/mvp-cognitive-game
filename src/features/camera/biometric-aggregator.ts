import type { BiometricInput, BiometricSnapshot, PupilData, RppgData } from './types';
import { supabase } from '@/lib/supabase/client';

/**
 * BiometricAggregator - Aggregates biometric data every 5 seconds
 *
 * Computes:
 * - attention_score (0-100): pupil variability + gaze stability
 * - cognitive_load (0-100): task-evoked pupil dilation from baseline
 * - arousal_level (0-100): HRV-derived arousal estimation
 *
 * Features:
 * - 5-second aggregation window
 * - Saves to biometric_snapshots table
 * - Offline fallback: localStorage buffer
 */

const AGGREGATION_INTERVAL_MS = 5000;
const OFFLINE_BUFFER_KEY = 'manas_biometric_buffer';

export class BiometricAggregator {
  private pupilSamples: PupilData[] = [];
  private rppgSamples: RppgData[] = [];
  private timer: ReturnType<typeof setInterval> | null = null;
  private sessionId: string | null = null;
  private anonChildId: string | null = null;
  private onBiometricUpdate?: (input: BiometricInput) => void;

  /** Start aggregation for a session */
  start(
    sessionId: string,
    anonChildId: string,
    onBiometricUpdate?: (input: BiometricInput) => void,
  ): void {
    this.sessionId = sessionId;
    this.anonChildId = anonChildId;
    this.onBiometricUpdate = onBiometricUpdate;

    this.timer = setInterval(() => {
      this.aggregate();
    }, AGGREGATION_INTERVAL_MS);
  }

  /** Stop aggregation */
  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    // Final aggregation
    this.aggregate();
    // Flush offline buffer
    this.flushOfflineBuffer();

    this.pupilSamples = [];
    this.rppgSamples = [];
  }

  /** Add a pupil data sample */
  addPupilSample(data: PupilData): void {
    this.pupilSamples.push(data);
  }

  /** Add an rPPG data sample */
  addRppgSample(data: RppgData): void {
    this.rppgSamples.push(data);
  }

  /** Aggregate current window and save */
  private aggregate(): void {
    if (this.pupilSamples.length === 0 && this.rppgSamples.length === 0) return;
    if (!this.sessionId || !this.anonChildId) return;

    const attentionScore = this.computeAttentionScore();
    const cognitiveLoad = this.computeCognitiveLoad();
    const arousalLevel = this.computeArousalLevel();

    const snapshot: BiometricSnapshot = {
      sessionId: this.sessionId,
      anonChildId: this.anonChildId,
      tsMs: Date.now(),
      pupilDiameter: this.getAvgPupilDiameter(),
      heartRateBpm: this.getLatestHeartRate(),
      attentionScore,
      cognitiveLoad,
      arousalLevel,
    };

    // Notify listener
    const input: BiometricInput = { attentionScore, cognitiveLoad, arousalLevel };
    this.onBiometricUpdate?.(input);

    // Save to DB
    this.saveSnapshot(snapshot);

    // Clear samples for next window
    this.pupilSamples = [];
    this.rppgSamples = [];
  }

  /**
   * Attention score (0-100)
   * Based on pupil variability (low = focused) and gaze stability (high = attentive)
   */
  private computeAttentionScore(): number {
    if (this.pupilSamples.length === 0) return 50;

    // Gaze stability: average of all samples
    const avgStability = this.pupilSamples.reduce((s, p) => s + p.gazeStability, 0) / this.pupilSamples.length;

    // Pupil variability (coefficient of variation) - lower = more focused
    const diameters = this.pupilSamples.map(p => p.avgDiameter);
    const mean = diameters.reduce((a, b) => a + b, 0) / diameters.length;
    const variance = diameters.reduce((s, d) => s + (d - mean) ** 2, 0) / diameters.length;
    const cv = mean > 0 ? Math.sqrt(variance) / mean : 0;

    // Combine: 70% gaze stability, 30% low pupil variability
    const variabilityScore = Math.max(0, 100 - cv * 500);
    const attention = avgStability * 70 + variabilityScore * 0.3;

    return Math.round(Math.min(100, Math.max(0, attention)));
  }

  /**
   * Cognitive load (0-100)
   * Based on pupil dilation relative to average
   */
  private computeCognitiveLoad(): number {
    if (this.pupilSamples.length === 0) return 50;

    const diameters = this.pupilSamples.map(p => p.avgDiameter);
    const mean = diameters.reduce((a, b) => a + b, 0) / diameters.length;
    const latest = diameters[diameters.length - 1];

    if (mean === 0) return 50;

    // Dilation ratio > 1 means load, < 1 means relaxed
    const ratio = latest / mean;
    const load = (ratio - 0.8) / 0.5 * 100;

    return Math.round(Math.min(100, Math.max(0, load)));
  }

  /**
   * Arousal level (0-100)
   * Based on heart rate variability from rPPG
   */
  private computeArousalLevel(): number {
    if (this.rppgSamples.length < 2) return 50;

    const heartRates = this.rppgSamples.map(r => r.heartRateBpm);
    const mean = heartRates.reduce((a, b) => a + b, 0) / heartRates.length;

    // HRV approximation from BPM variability
    const variance = heartRates.reduce((s, hr) => s + (hr - mean) ** 2, 0) / heartRates.length;
    const hrv = Math.sqrt(variance);

    // High HR + low HRV = high arousal
    // Normalize: resting HR ~70, elevated ~100+
    const hrArousal = Math.min(100, Math.max(0, (mean - 60) / 50 * 100));
    const hrvArousal = Math.max(0, 100 - hrv * 10); // Low variability = high arousal

    return Math.round((hrArousal * 0.6 + hrvArousal * 0.4));
  }

  private getAvgPupilDiameter(): number | undefined {
    if (this.pupilSamples.length === 0) return undefined;
    return this.pupilSamples.reduce((s, p) => s + p.avgDiameter, 0) / this.pupilSamples.length;
  }

  private getLatestHeartRate(): number | undefined {
    if (this.rppgSamples.length === 0) return undefined;
    return this.rppgSamples[this.rppgSamples.length - 1].heartRateBpm;
  }

  /** Save snapshot to Supabase, with offline fallback */
  private async saveSnapshot(snapshot: BiometricSnapshot): Promise<void> {
    const row = {
      session_id: snapshot.sessionId,
      anon_child_id: snapshot.anonChildId,
      ts_ms: snapshot.tsMs,
      pupil_diameter: snapshot.pupilDiameter,
      heart_rate_bpm: snapshot.heartRateBpm,
      attention_score: snapshot.attentionScore,
      cognitive_load: snapshot.cognitiveLoad,
      arousal_level: snapshot.arousalLevel,
      raw_data: {},
    };

    const { error } = await supabase.from('biometric_snapshots').insert(row);

    if (error) {
      console.error('Failed to save biometric snapshot, buffering offline:', error);
      this.bufferOffline(row);
    }
  }

  /** Buffer failed saves to localStorage */
  private bufferOffline(row: Record<string, unknown>): void {
    try {
      const existing = JSON.parse(localStorage.getItem(OFFLINE_BUFFER_KEY) || '[]');
      existing.push(row);
      localStorage.setItem(OFFLINE_BUFFER_KEY, JSON.stringify(existing));
    } catch {
      // localStorage full or unavailable
    }
  }

  /** Flush offline buffer to Supabase */
  private async flushOfflineBuffer(): Promise<void> {
    try {
      const raw = localStorage.getItem(OFFLINE_BUFFER_KEY);
      if (!raw) return;

      const items = JSON.parse(raw);
      if (items.length === 0) return;

      const { error } = await supabase.from('biometric_snapshots').insert(items);
      if (!error) {
        localStorage.removeItem(OFFLINE_BUFFER_KEY);
      }
    } catch {
      // Silently fail
    }
  }
}
