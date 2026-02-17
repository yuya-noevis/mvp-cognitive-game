'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ParentalGate } from '@/components/ui/ParentalGate';
import { CosmicButton } from '@/components/ui/CosmicButton';
import { supabase } from '@/lib/supabase/client';

interface CameraConsentModalProps {
  childId: string;
  isOpen: boolean;
  onConsent: (consented: boolean) => void;
  onClose: () => void;
}

/**
 * CameraConsentModal - Parental gate + camera consent flow
 *
 * Flow: ParentalGate (long-press) → Consent explanation → Accept/Decline
 * Saves consent to camera_consents table.
 */
export function CameraConsentModal({
  childId,
  isOpen,
  onConsent,
  onClose,
}: CameraConsentModalProps) {
  const [showGate, setShowGate] = useState(true);
  const [saving, setSaving] = useState(false);

  const handleGateUnlock = () => {
    setShowGate(false);
  };

  const handleConsent = async (consented: boolean) => {
    setSaving(true);

    try {
      await supabase.from('camera_consents').upsert(
        {
          child_id: childId,
          consented,
          consented_at: consented ? new Date().toISOString() : null,
          revoked_at: consented ? null : new Date().toISOString(),
        },
        { onConflict: 'child_id' },
      );
    } catch (err) {
      console.error('Failed to save camera consent:', err);
    }

    setSaving(false);
    onConsent(consented);
  };

  if (!isOpen) return null;

  // Show parental gate first
  if (showGate) {
    return (
      <ParentalGate
        isOpen={true}
        onUnlock={handleGateUnlock}
        onCancel={onClose}
      />
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(13, 13, 43, 0.9)', backdropFilter: 'blur(8px)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="w-full max-w-sm rounded-3xl p-6"
          style={{ background: 'rgba(42, 42, 90, 0.95)', border: '1px solid rgba(255,255,255,0.1)' }}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
        >
          {/* Camera icon */}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center"
                 style={{ background: 'rgba(78, 205, 196, 0.2)', border: '2px solid rgba(78, 205, 196, 0.4)' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="#4ECDC4">
                <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
              </svg>
            </div>
          </div>

          <h2 className="text-lg font-bold text-center mb-2" style={{ color: '#F0F0FF' }}>
            カメラ機能について
          </h2>

          <div className="space-y-3 mb-6">
            <div className="flex items-start gap-2 text-sm" style={{ color: '#B8B8D0' }}>
              <span style={{ color: '#4ECDC4' }}>&#10003;</span>
              <span>カメラ映像は端末内でのみ処理され、サーバーに送信されません</span>
            </div>
            <div className="flex items-start gap-2 text-sm" style={{ color: '#B8B8D0' }}>
              <span style={{ color: '#4ECDC4' }}>&#10003;</span>
              <span>注意度や認知負荷の推定に使用し、難易度調整の参考にします</span>
            </div>
            <div className="flex items-start gap-2 text-sm" style={{ color: '#B8B8D0' }}>
              <span style={{ color: '#4ECDC4' }}>&#10003;</span>
              <span>いつでも設定画面からOFFにできます</span>
            </div>
          </div>

          <div className="space-y-3">
            <CosmicButton
              variant="secondary"
              size="lg"
              className="w-full"
              disabled={saving}
              onClick={() => handleConsent(true)}
            >
              カメラを使う
            </CosmicButton>
            <CosmicButton
              variant="ghost"
              size="md"
              className="w-full"
              disabled={saving}
              onClick={() => handleConsent(false)}
            >
              使わない
            </CosmicButton>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
