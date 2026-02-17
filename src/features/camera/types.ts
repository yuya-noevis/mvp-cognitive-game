/** Biometric input for DDA integration */
export interface BiometricInput {
  attentionScore?: number;   // 0-100
  cognitiveLoad?: number;    // 0-100
  arousalLevel?: number;     // 0-100
}

/** A single biometric snapshot for DB storage */
export interface BiometricSnapshot {
  sessionId: string;
  anonChildId: string;
  tsMs: number;
  pupilDiameter?: number;
  heartRateBpm?: number;
  attentionScore?: number;
  cognitiveLoad?: number;
  arousalLevel?: number;
  rawData?: Record<string, unknown>;
}

/** Camera consent status */
export interface CameraConsent {
  childId: string;
  consented: boolean;
  consentedAt?: string;
  revokedAt?: string;
}

/** Camera manager state */
export type CameraState = 'idle' | 'initializing' | 'running' | 'stopped' | 'error';

/** Face mesh landmark point */
export interface Landmark {
  x: number;
  y: number;
  z?: number;
}

/** Pupil tracking result */
export interface PupilData {
  leftDiameter: number;
  rightDiameter: number;
  avgDiameter: number;
  gazeStability: number; // 0-1, higher = more stable
  timestamp: number;
}

/** rPPG estimation result */
export interface RppgData {
  heartRateBpm: number;
  confidence: number; // 0-1
  timestamp: number;
}
