import type { CameraState } from './types';

/**
 * CameraManager - Camera initialization and lifecycle management
 *
 * Features:
 * - Hidden video element (not visible to children)
 * - Low-spec detection: drops to 3fps if processing > 100ms
 * - Battery check: auto-stop below 20%
 */

export class CameraManager {
  private videoElement: HTMLVideoElement | null = null;
  private stream: MediaStream | null = null;
  private state: CameraState = 'idle';
  private onStateChange?: (state: CameraState) => void;
  private processingTimes: number[] = [];
  private lowSpecMode = false;

  constructor(onStateChange?: (state: CameraState) => void) {
    this.onStateChange = onStateChange;
  }

  /** Initialize camera with 320x240 user-facing */
  async initCamera(): Promise<HTMLVideoElement | null> {
    if (this.state === 'running') return this.videoElement;

    this.setState('initializing');

    try {
      // Check battery level
      if (await this.isBatteryLow()) {
        console.warn('Battery too low for camera (<20%)');
        this.setState('stopped');
        return null;
      }

      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 320 },
          height: { ideal: 240 },
          frameRate: { ideal: 15 },
        },
        audio: false,
      });

      // Create hidden video element
      this.videoElement = document.createElement('video');
      this.videoElement.srcObject = this.stream;
      this.videoElement.setAttribute('playsinline', '');
      this.videoElement.style.position = 'absolute';
      this.videoElement.style.opacity = '0';
      this.videoElement.style.pointerEvents = 'none';
      this.videoElement.style.width = '1px';
      this.videoElement.style.height = '1px';
      document.body.appendChild(this.videoElement);

      await this.videoElement.play();
      this.setState('running');

      return this.videoElement;
    } catch (err) {
      console.error('Camera initialization failed:', err);
      this.setState('error');
      return null;
    }
  }

  /** Stop camera and release all resources */
  stopCamera(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }

    if (this.videoElement) {
      this.videoElement.pause();
      this.videoElement.srcObject = null;
      this.videoElement.remove();
      this.videoElement = null;
    }

    this.setState('stopped');
  }

  /** Record a processing time for low-spec detection */
  recordProcessingTime(ms: number): void {
    this.processingTimes.push(ms);

    // Check first 10 frames for low-spec detection
    if (this.processingTimes.length === 10 && !this.lowSpecMode) {
      const avgTime = this.processingTimes.reduce((a, b) => a + b, 0) / 10;
      if (avgTime > 100) {
        this.lowSpecMode = true;
        console.warn('Low-spec device detected, dropping to 3fps');
      }
    }
  }

  /** Get the target FPS based on device capability */
  getTargetFps(): number {
    return this.lowSpecMode ? 3 : 5;
  }

  /** Get current camera state */
  getState(): CameraState {
    return this.state;
  }

  /** Get the video element */
  getVideoElement(): HTMLVideoElement | null {
    return this.videoElement;
  }

  /** Check if the device battery is low */
  private async isBatteryLow(): Promise<boolean> {
    try {
      // navigator.getBattery is not available in all browsers
      const nav = navigator as Navigator & { getBattery?: () => Promise<{ level: number; charging: boolean }> };
      if (!nav.getBattery) return false;
      const battery = await nav.getBattery();
      return !battery.charging && battery.level < 0.2;
    } catch {
      return false;
    }
  }

  private setState(state: CameraState): void {
    this.state = state;
    this.onStateChange?.(state);
  }
}
