'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { BiometricInput, Landmark } from './types';
import { CameraManager } from './camera-manager';
import { PupilTracker } from './pupil-tracker';
import { RppgEstimator } from './rppg-estimator';
import { BiometricAggregator } from './biometric-aggregator';

interface UseBiometricSessionOptions {
  enabled: boolean;
  sessionId: string | null;
  anonChildId: string | null;
}

interface UseBiometricSessionResult {
  attentionScore: number;
  cognitiveLoad: number;
  arousalLevel: number;
  biometricInput: BiometricInput | null;
  cameraState: string;
}

/**
 * useBiometricSession - React hook for camera-based biometric tracking
 *
 * Manages camera lifecycle during game session.
 * Uses dynamic import for TensorFlow.js (only when camera enabled).
 * Returns biometric scores for DDA integration.
 */
export function useBiometricSession({
  enabled,
  sessionId,
  anonChildId,
}: UseBiometricSessionOptions): UseBiometricSessionResult {
  const [attentionScore, setAttentionScore] = useState(50);
  const [cognitiveLoad, setCognitiveLoad] = useState(50);
  const [arousalLevel, setArousalLevel] = useState(50);
  const [biometricInput, setBiometricInput] = useState<BiometricInput | null>(null);
  const [cameraState, setCameraState] = useState('idle');

  const cameraRef = useRef<CameraManager | null>(null);
  const pupilTrackerRef = useRef<PupilTracker | null>(null);
  const rppgRef = useRef<RppgEstimator | null>(null);
  const aggregatorRef = useRef<BiometricAggregator | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const faceMeshRef = useRef<unknown>(null);

  const handleBiometricUpdate = useCallback((input: BiometricInput) => {
    if (input.attentionScore !== undefined) setAttentionScore(input.attentionScore);
    if (input.cognitiveLoad !== undefined) setCognitiveLoad(input.cognitiveLoad);
    if (input.arousalLevel !== undefined) setArousalLevel(input.arousalLevel);
    setBiometricInput(input);
  }, []);

  useEffect(() => {
    if (!enabled || !sessionId || !anonChildId) return;

    let cancelled = false;

    async function startBiometricSession() {
      try {
        // Dynamic import TF.js and FaceMesh
        const [, faceMeshModule] = await Promise.all([
          import('@tensorflow/tfjs'),
          import('@mediapipe/face_mesh'),
        ]);

        if (cancelled) return;

        // Initialize camera
        const camera = new CameraManager((state) => setCameraState(state));
        cameraRef.current = camera;

        const video = await camera.initCamera();
        if (!video || cancelled) return;

        // Initialize Face Mesh
        const faceMesh = new faceMeshModule.FaceMesh({
          locateFile: (file: string) =>
            `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
        });

        faceMesh.setOptions({
          maxNumFaces: 1,
          refineLandmarks: true, // Needed for iris landmarks
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        faceMeshRef.current = faceMesh;

        // Initialize trackers
        const pupilTracker = new PupilTracker();
        pupilTrackerRef.current = pupilTracker;

        const rppg = new RppgEstimator();
        rppgRef.current = rppg;

        const aggregator = new BiometricAggregator();
        aggregatorRef.current = aggregator;
        aggregator.start(sessionId!, anonChildId!, handleBiometricUpdate);

        // Process frames
        let lastProcessTime = 0;
        const targetInterval = 1000 / camera.getTargetFps();

        // Set up FaceMesh results handler
        faceMesh.onResults((results: { multiFaceLandmarks?: Landmark[][] }) => {
          if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) return;

          const landmarks = results.multiFaceLandmarks[0];

          // Pupil tracking
          const pupilData = pupilTracker.processLandmarks(landmarks);
          if (pupilData) {
            aggregator.addPupilSample(pupilData);
          }

          // rPPG estimation
          if (video) {
            const rppgData = rppg.processFame(video, landmarks);
            if (rppgData) {
              aggregator.addRppgSample(rppgData);
            }
          }
        });

        // Frame processing loop
        const processFrame = async () => {
          if (cancelled || camera.getState() !== 'running') return;

          const now = performance.now();
          if (now - lastProcessTime >= targetInterval) {
            const startTime = performance.now();

            try {
              await faceMesh.send({ image: video });
            } catch {
              // Frame processing error, continue
            }

            const elapsed = performance.now() - startTime;
            camera.recordProcessingTime(elapsed);
            lastProcessTime = now;
          }

          animFrameRef.current = requestAnimationFrame(processFrame);
        };

        animFrameRef.current = requestAnimationFrame(processFrame);
      } catch (err) {
        console.error('Biometric session initialization failed:', err);
        setCameraState('error');
      }
    }

    startBiometricSession();

    return () => {
      cancelled = true;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      aggregatorRef.current?.stop();
      cameraRef.current?.stopCamera();
      pupilTrackerRef.current?.reset();
      rppgRef.current?.reset();
    };
  }, [enabled, sessionId, anonChildId, handleBiometricUpdate]);

  return {
    attentionScore,
    cognitiveLoad,
    arousalLevel,
    biometricInput,
    cameraState,
  };
}
