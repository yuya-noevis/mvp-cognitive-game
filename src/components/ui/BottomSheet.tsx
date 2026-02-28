'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

/**
 * BottomSheet — 下からスライドアップ
 *
 * galaxy半透明オーバーレイ + ドラッグ下スワイプで閉じ
 */
export function BottomSheet({ isOpen, onClose, children, title }: BottomSheetProps) {
  const dragControls = useDragControls();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(13, 13, 43, 0.7)', backdropFilter: 'blur(4px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl max-h-[85vh] overflow-y-auto"
            style={{
              background: 'linear-gradient(180deg, #2A2A5A 0%, #1A1A40 100%)',
              border: '1px solid rgba(108, 60, 225, 0.2)',
              borderBottom: 'none',
              boxShadow: '0 -8px 32px rgba(0,0,0,0.4)',
            }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            drag="y"
            dragControls={dragControls}
            dragConstraints={{ top: 0 }}
            dragElastic={0.2}
            onDragEnd={(_e, info) => {
              if (info.offset.y > 100) onClose();
            }}
          >
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-2">
              <div
                className="w-10 h-1 rounded-full"
                style={{ background: 'rgba(255,255,255,0.2)' }}
              />
            </div>

            {title && (
              <h3 className="text-lg font-bold text-center px-4 pb-2" style={{ color: '#F0F0FF' }}>
                {title}
              </h3>
            )}

            <div className="px-4 pb-6" style={{ paddingBottom: 'calc(24px + 72px + env(safe-area-inset-bottom))' }}>
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
