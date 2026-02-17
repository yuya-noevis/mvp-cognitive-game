import type { RppgData, Landmark } from './types';

/**
 * RppgEstimator - Remote Photoplethysmography Heart Rate Estimation
 *
 * Uses CHROM algorithm (de Haan & Jeanne, 2013) to extract
 * heart rate from forehead skin color changes via webcam.
 *
 * Features:
 * - Forehead ROI extraction from face mesh landmarks
 * - CHROM algorithm for pulse signal extraction
 * - Bandpass filter 0.7-4Hz (42-240 BPM)
 * - 30-second buffer for stable HR estimation
 */

// Forehead region landmark indices (from Face Mesh)
const FOREHEAD_INDICES = [10, 67, 69, 104, 108, 151, 299, 337, 338, 297];

interface RGBSample {
  r: number;
  g: number;
  b: number;
  timestamp: number;
}

export class RppgEstimator {
  private rgbBuffer: RGBSample[] = [];
  private readonly BUFFER_DURATION_MS = 30000; // 30 seconds
  private readonly MIN_SAMPLES = 60; // ~2 seconds at 30fps
  private readonly SAMPLE_RATE = 30; // Expected fps

  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;

  constructor() {
    if (typeof document !== 'undefined') {
      this.canvas = document.createElement('canvas');
      this.canvas.width = 64;
      this.canvas.height = 64;
      this.ctx = this.canvas.getContext('2d');
    }
  }

  /**
   * Extract forehead ROI color from video frame using face landmarks
   */
  processFame(
    video: HTMLVideoElement,
    landmarks: Landmark[],
  ): RppgData | null {
    if (!this.ctx || !this.canvas || !landmarks || landmarks.length < 400) return null;

    // Get forehead bounding box from landmarks
    const foreheadPoints = FOREHEAD_INDICES.map(i => landmarks[i]);
    const xs = foreheadPoints.map(p => p.x * video.videoWidth);
    const ys = foreheadPoints.map(p => p.y * video.videoHeight);

    const minX = Math.max(0, Math.min(...xs));
    const maxX = Math.min(video.videoWidth, Math.max(...xs));
    const minY = Math.max(0, Math.min(...ys));
    const maxY = Math.min(video.videoHeight, Math.max(...ys));

    const roiWidth = maxX - minX;
    const roiHeight = maxY - minY;

    if (roiWidth < 5 || roiHeight < 5) return null;

    // Draw ROI to canvas
    this.ctx.drawImage(video, minX, minY, roiWidth, roiHeight, 0, 0, 64, 64);
    const imageData = this.ctx.getImageData(0, 0, 64, 64);
    const pixels = imageData.data;

    // Calculate average RGB of ROI
    let rSum = 0, gSum = 0, bSum = 0;
    const pixelCount = pixels.length / 4;
    for (let i = 0; i < pixels.length; i += 4) {
      rSum += pixels[i];
      gSum += pixels[i + 1];
      bSum += pixels[i + 2];
    }

    const sample: RGBSample = {
      r: rSum / pixelCount,
      g: gSum / pixelCount,
      b: bSum / pixelCount,
      timestamp: Date.now(),
    };

    this.rgbBuffer.push(sample);

    // Trim buffer to duration
    const cutoff = Date.now() - this.BUFFER_DURATION_MS;
    this.rgbBuffer = this.rgbBuffer.filter(s => s.timestamp > cutoff);

    // Need minimum samples for estimation
    if (this.rgbBuffer.length < this.MIN_SAMPLES) return null;

    return this.estimateHeartRate();
  }

  /** Reset estimator state */
  reset(): void {
    this.rgbBuffer = [];
  }

  /**
   * CHROM algorithm implementation
   * de Haan & Jeanne (2013) - Robust Pulse Rate from Chrominance-Based rPPG
   */
  private estimateHeartRate(): RppgData | null {
    const n = this.rgbBuffer.length;
    if (n < this.MIN_SAMPLES) return null;

    // Normalize RGB signals
    const rMean = this.rgbBuffer.reduce((s, v) => s + v.r, 0) / n;
    const gMean = this.rgbBuffer.reduce((s, v) => s + v.g, 0) / n;
    const bMean = this.rgbBuffer.reduce((s, v) => s + v.b, 0) / n;

    if (rMean === 0 || gMean === 0 || bMean === 0) return null;

    const rNorm = this.rgbBuffer.map(v => v.r / rMean);
    const gNorm = this.rgbBuffer.map(v => v.g / gMean);
    const bNorm = this.rgbBuffer.map(v => v.b / bMean);

    // CHROM signal: S1 = 3R - 2G, S2 = 1.5R + G - 1.5B
    const s1 = rNorm.map((r, i) => 3 * r - 2 * gNorm[i]);
    const s2 = rNorm.map((r, i) => 1.5 * r + gNorm[i] - 1.5 * bNorm[i]);

    // Combine: pulse = S1 - (std(S1)/std(S2)) * S2
    const s1Std = this.std(s1);
    const s2Std = this.std(s2);
    if (s2Std === 0) return null;

    const alpha = s1Std / s2Std;
    const pulse = s1.map((v, i) => v - alpha * s2[i]);

    // Bandpass filter 0.7-4 Hz (42-240 BPM)
    const filtered = this.bandpassFilter(pulse, this.SAMPLE_RATE, 0.7, 4.0);

    // Find dominant frequency via zero-crossing
    const bpm = this.estimateBpmFromSignal(filtered);
    if (bpm === null || bpm < 40 || bpm > 200) return null;

    // Confidence based on signal quality
    const snr = this.calculateSNR(filtered);
    const confidence = Math.min(1, Math.max(0, snr / 10));

    return {
      heartRateBpm: Math.round(bpm),
      confidence,
      timestamp: Date.now(),
    };
  }

  /** Simple moving average bandpass filter */
  private bandpassFilter(signal: number[], sampleRate: number, lowHz: number, highHz: number): number[] {
    // High-pass (remove DC + very slow drift)
    const highPassWindow = Math.round(sampleRate / lowHz);
    const highPassed = this.highPass(signal, highPassWindow);

    // Low-pass (remove high frequency noise)
    const lowPassWindow = Math.max(2, Math.round(sampleRate / highHz));
    return this.lowPass(highPassed, lowPassWindow);
  }

  private highPass(signal: number[], window: number): number[] {
    const smoothed = this.lowPass(signal, window);
    return signal.map((v, i) => v - smoothed[i]);
  }

  private lowPass(signal: number[], window: number): number[] {
    const result: number[] = [];
    for (let i = 0; i < signal.length; i++) {
      const start = Math.max(0, i - Math.floor(window / 2));
      const end = Math.min(signal.length, i + Math.ceil(window / 2));
      let sum = 0;
      for (let j = start; j < end; j++) sum += signal[j];
      result.push(sum / (end - start));
    }
    return result;
  }

  /** Estimate BPM from zero-crossings */
  private estimateBpmFromSignal(signal: number[]): number | null {
    // Count zero crossings
    let crossings = 0;
    for (let i = 1; i < signal.length; i++) {
      if ((signal[i - 1] < 0 && signal[i] >= 0) || (signal[i - 1] >= 0 && signal[i] < 0)) {
        crossings++;
      }
    }

    if (crossings < 4) return null;

    // Duration in seconds
    const durationMs = this.rgbBuffer[this.rgbBuffer.length - 1].timestamp - this.rgbBuffer[0].timestamp;
    const durationSec = durationMs / 1000;

    // Each full cycle has 2 zero crossings
    const cyclesPerSecond = (crossings / 2) / durationSec;
    return cyclesPerSecond * 60;
  }

  /** Standard deviation */
  private std(arr: number[]): number {
    const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
    const variance = arr.reduce((s, v) => s + (v - mean) ** 2, 0) / arr.length;
    return Math.sqrt(variance);
  }

  /** Simple signal-to-noise ratio */
  private calculateSNR(signal: number[]): number {
    const signalPower = signal.reduce((s, v) => s + v * v, 0) / signal.length;
    const noise = signal.map((v, i) => i > 0 ? v - signal[i - 1] : 0);
    const noisePower = noise.reduce((s, v) => s + v * v, 0) / noise.length;
    if (noisePower === 0) return 0;
    return 10 * Math.log10(signalPower / noisePower);
  }
}
