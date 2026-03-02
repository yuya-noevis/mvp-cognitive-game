'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { InstructionLevel } from '@/features/instruction';
import { INSTRUCTION_LEVELS, saveInstructionLevel } from '@/features/instruction';
import { ParentalGate } from '@/components/ui/ParentalGate';

/**
 * 各指示レベルの表示設定（アイコン + 説明）
 */
const LEVEL_DISPLAY: Record<
  InstructionLevel,
  { icon: string; title: string; description: string }
> = {
  L1: {
    icon: '🎬',
    title: 'L1: 非言語',
    description: 'デモアニメのみ。テキスト・音声なし。重度ID・3〜4歳向け',
  },
  L2: {
    icon: '👆',
    title: 'L2: 最小言語',
    description: 'デモ + アイコン + 1語音声。中度ID向け',
  },
  L3: {
    icon: '🔊',
    title: 'L3: 音声支援',
    description: 'デモ + 短文音声 + アイコン。軽度ID・幼児向け',
  },
  L4: {
    icon: '📝',
    title: 'L4: 視覚優位',
    description: 'デモ + テキスト + 音声ON/OFF。知的正常ASD向け',
  },
};

const LEVELS: InstructionLevel[] = ['L1', 'L2', 'L3', 'L4'];

interface InstructionLevelSelectorProps {
  /** 現在の指示レベル */
  currentLevel: InstructionLevel;
  /** 選択変更時のコールバック */
  onChange: (level: InstructionLevel) => void;
}

/**
 * 保護者が指示レベルを手動変更できる4段階セレクター。
 *
 * ParentalGate（長押し2秒）を経由してアクセスする。
 * 設定変更は即時反映される。
 */
export function InstructionLevelSelector({
  currentLevel,
  onChange,
}: InstructionLevelSelectorProps) {
  const [gateOpen, setGateOpen] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [selected, setSelected] = useState<InstructionLevel>(currentLevel);

  const handleOpenGate = useCallback(() => {
    setGateOpen(true);
  }, []);

  const handleUnlock = useCallback(() => {
    setGateOpen(false);
    setUnlocked(true);
  }, []);

  const handleCancelGate = useCallback(() => {
    setGateOpen(false);
  }, []);

  const handleSelect = useCallback(
    (level: InstructionLevel) => {
      setSelected(level);
      saveInstructionLevel(level);
      onChange(level);
    },
    [onChange],
  );

  const handleClose = useCallback(() => {
    setUnlocked(false);
  }, []);

  return (
    <>
      {/* 設定ボタン（保護者確認ゲート起動） */}
      {!unlocked && (
        <button
          onClick={handleOpenGate}
          className="flex items-center gap-2 px-4 py-2 rounded-xl transition-transform active:scale-95"
          style={{
            background: 'rgba(139, 92, 246, 0.15)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            color: '#C4B5FD',
          }}
          aria-label="指示レベルを変更する"
        >
          <span className="text-base">⚙️</span>
          <span className="text-sm font-medium">指示レベル: {LEVEL_DISPLAY[currentLevel].title}</span>
        </button>
      )}

      {/* 保護者確認ゲート */}
      <ParentalGate
        isOpen={gateOpen}
        onUnlock={handleUnlock}
        onCancel={handleCancelGate}
      />

      {/* ロック解除後のセレクターパネル */}
      <AnimatePresence>
        {unlocked && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
            style={{ background: 'rgba(13, 13, 43, 0.9)', backdropFilter: 'blur(8px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full max-w-sm flex flex-col gap-4"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              {/* タイトル */}
              <div className="text-center mb-2">
                <p className="text-lg font-bold" style={{ color: '#E8E8F0' }}>
                  指示レベルを選択
                </p>
                <p className="text-xs mt-1" style={{ color: '#8888AA' }}>
                  お子さまの理解度に合わせて設定してください
                </p>
              </div>

              {/* レベル選択 */}
              <div className="flex flex-col gap-3">
                {LEVELS.map(level => {
                  const display = LEVEL_DISPLAY[level];
                  const config = INSTRUCTION_LEVELS[level];
                  const isSelected = selected === level;

                  return (
                    <motion.button
                      key={level}
                      onClick={() => handleSelect(level)}
                      className="flex items-start gap-3 p-3 rounded-2xl transition-transform active:scale-98 text-left"
                      style={{
                        background: isSelected
                          ? 'rgba(139, 92, 246, 0.25)'
                          : 'rgba(255, 255, 255, 0.05)',
                        border: `2px solid ${isSelected ? '#8B5CF6' : 'rgba(255,255,255,0.1)'}`,
                      }}
                      whileTap={{ scale: 0.97 }}
                    >
                      {/* アイコン */}
                      <span
                        className="text-2xl shrink-0 mt-0.5 w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{
                          background: isSelected
                            ? 'rgba(139, 92, 246, 0.3)'
                            : 'rgba(255, 255, 255, 0.08)',
                        }}
                      >
                        {display.icon}
                      </span>

                      {/* テキスト */}
                      <div className="flex-1">
                        <p
                          className="text-sm font-bold"
                          style={{ color: isSelected ? '#C4B5FD' : '#E8E8F0' }}
                        >
                          {display.title}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: '#8888AA' }}>
                          {display.description}
                        </p>
                        {/* 機能インジケーター */}
                        <div className="flex gap-1.5 mt-1.5">
                          {config.showDemo && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full"
                                  style={{ background: 'rgba(72,187,120,0.2)', color: '#68D391' }}>
                              デモ
                            </span>
                          )}
                          {config.showIcon && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full"
                                  style={{ background: 'rgba(251,191,36,0.2)', color: '#FCD34D' }}>
                              アイコン
                            </span>
                          )}
                          {config.showAudio && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full"
                                  style={{ background: 'rgba(139,92,246,0.2)', color: '#C4B5FD' }}>
                              音声
                            </span>
                          )}
                          {config.showText && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full"
                                  style={{ background: 'rgba(59,130,246,0.2)', color: '#93C5FD' }}>
                              テキスト
                            </span>
                          )}
                        </div>
                      </div>

                      {/* 選択チェック */}
                      {isSelected && (
                        <span className="shrink-0 text-lg" style={{ color: '#8B5CF6' }}>✓</span>
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {/* 閉じるボタン */}
              <button
                onClick={handleClose}
                className="mt-2 py-3 rounded-2xl text-sm font-medium transition-transform active:scale-95"
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  color: '#B8B8D0',
                }}
              >
                とじる
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
