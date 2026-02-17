'use client';

import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ParentalGateProps {
  onUnlock: () => void;
  onCancel: () => void;
  isOpen: boolean;
}

/**
 * ParentalGate — 保護者確認ゲート
 *
 * 長押し2秒で解除。子供が誤操作しない設計。
 * テキストは最小限 — アイコンと進捗バーで視覚的に伝達。
 */
export function ParentalGate({ onUnlock, onCancel, isOpen }: ParentalGateProps) {
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startHold = useCallback(() => {
    let p = 0;
    intervalRef.current = setInterval(() => {
      p += 0.05;
      setProgress(p);
      if (p >= 1) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        onUnlock();
      }
    }, 100);
  }, [onUnlock]);

  const endHold = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setProgress(0);
  }, []);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(13, 13, 43, 0.85)', backdropFilter: 'blur(8px)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="flex flex-col items-center gap-6 p-8"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
          >
            {/* Lock icon */}
            <div className="w-20 h-20 rounded-full flex items-center justify-center"
                 style={{ background: 'rgba(108, 60, 225, 0.2)', border: '2px solid rgba(108, 60, 225, 0.4)' }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="#8B5CF6">
                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM12 17c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3-9H9V6c0-1.66 1.34-3 3-3s3 1.34 3 3v2z"/>
              </svg>
            </div>

            <p className="text-base font-medium text-center" style={{ color: '#B8B8D0' }}>
              おとなのかた：ながおし してください
            </p>

            {/* Hold button with progress */}
            <div className="relative">
              <button
                onMouseDown={startHold}
                onMouseUp={endHold}
                onMouseLeave={endHold}
                onTouchStart={startHold}
                onTouchEnd={endHold}
                className="w-24 h-24 rounded-full flex items-center justify-center relative overflow-hidden tap-target"
                style={{
                  background: 'rgba(108, 60, 225, 0.15)',
                  border: '3px solid #6C3CE1',
                }}
              >
                {/* Progress ring */}
                <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(108,60,225,0.2)" strokeWidth="6" />
                  <circle
                    cx="50" cy="50" r="46"
                    fill="none" stroke="#8B5CF6" strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 46}`}
                    strokeDashoffset={`${2 * Math.PI * 46 * (1 - progress)}`}
                    style={{ transition: 'stroke-dashoffset 100ms linear' }}
                  />
                </svg>

                {/* Gear icon */}
                <svg width="32" height="32" viewBox="0 0 24 24" fill="#8B5CF6">
                  <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
                </svg>
              </button>
            </div>

            {/* Cancel */}
            <button
              onClick={onCancel}
              className="text-sm font-medium tap-target"
              style={{ color: '#8888AA' }}
            >
              もどる
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
