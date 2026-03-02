'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import type { InstructionLevel } from './instruction-level';
import { INSTRUCTION_LEVELS } from './instruction-level';
import type { IntegratedGameId } from '@/games/integrated/types';
import { INTEGRATED_GAME_MAP } from '@/games/integrated/game-map';
import { GAME_INSTRUCTIONS } from './game-instructions';
import DemoAnimation from './DemoAnimation';

interface GameInstructionProps {
  gameId: IntegratedGameId;
  instructionLevel: InstructionLevel;
  onComplete: () => void;
  onReplay?: () => void;
}

/** Web Speech API で音声を再生 */
function speakText(text: string) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'ja-JP';
  utterance.rate = 0.85;
  utterance.pitch = 1.1;
  window.speechSynthesis.speak(utterance);
}

export default function GameInstruction({
  gameId,
  instructionLevel,
  onComplete,
}: GameInstructionProps) {
  const config = INSTRUCTION_LEVELS[instructionLevel];
  const gameData = GAME_INSTRUCTIONS[gameId];
  const gameConfig = INTEGRATED_GAME_MAP[gameId];
  const [audioEnabled, setAudioEnabled] = useState(true);
  const audioPlayedRef = useRef(false);
  const router = useRouter();

  // 音声再生（L2-L4）— 初回のみ
  useEffect(() => {
    if (!config.showAudio || !audioEnabled || audioPlayedRef.current) return;
    audioPlayedRef.current = true;

    const text = instructionLevel === 'L2' ? gameData.singleWord : gameData.shortSentence;
    const timer = setTimeout(() => speakText(text), 800);
    return () => clearTimeout(timer);
  }, [config.showAudio, audioEnabled, instructionLevel, gameData]);

  const handleToggleAudio = useCallback(() => {
    setAudioEnabled(prev => !prev);
    if (audioEnabled) {
      window.speechSynthesis?.cancel();
    }
  }, [audioEnabled]);

  const handleBack = useCallback(() => {
    router.push('/');
  }, [router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-space">
      {/* Header: 戻るボタン + ゲームタイトル + 音声トグル */}
      <div className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 pt-3 pb-2 max-w-[430px] mx-auto"
           style={{ paddingTop: 'max(12px, env(safe-area-inset-top))' }}>
        {/* 戻るボタン */}
        <button
          onClick={handleBack}
          className="w-10 h-10 rounded-full flex items-center justify-center transition-transform active:scale-90"
          style={{ background: 'rgba(255,255,255,0.1)' }}
          aria-label="もどる"
        >
          <span className="text-xl" style={{ color: '#E8E8F0' }}>←</span>
        </button>

        {/* ゲームタイトル（L2以上でテキスト表示、L1はアイコンのみ） */}
        <div className="flex-1 text-center">
          {instructionLevel === 'L1' ? (
            <span className="text-xl">🎮</span>
          ) : (
            <span className="text-base font-bold" style={{ color: '#E8E8F0' }}>
              {gameConfig?.name ?? ''}
            </span>
          )}
        </div>

        {/* 音声ON/OFFトグル (L4のみ) */}
        {config.audioToggleable ? (
          <button
            onClick={handleToggleAudio}
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.1)' }}
            aria-label={audioEnabled ? '音声オフ' : '音声オン'}
          >
            <span className="text-xl">{audioEnabled ? '🔊' : '🔇'}</span>
          </button>
        ) : (
          <div className="w-10" /> /* spacer */
        )}
      </div>

      <motion.div
        className="w-full max-w-sm flex flex-col items-center gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* デモアニメーション（無限ループ） */}
        <div className="w-full rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.05)' }}>
          <DemoAnimation demoType={gameData.demoType} />
        </div>

        {/* L2: アイコン表示 */}
        {config.showIcon && instructionLevel === 'L2' && (
          <motion.div
            className="flex items-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <span className="text-2xl">👆</span>
          </motion.div>
        )}

        {/* L3: ひらがなテキスト + アイコン */}
        {config.showText && config.textStyle === 'hiragana' && (
          <motion.p
            className="text-center text-lg font-medium"
            style={{ color: '#E8E8F0' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <span className="mr-2">👆</span>
            {gameData.shortSentence}
          </motion.p>
        )}

        {/* L4: ステップ表示 */}
        {config.showText && config.textStyle === 'standard' && (
          <motion.div
            className="w-full space-y-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {gameData.steps.map((step, i) => (
              <motion.div
                key={i}
                className="flex items-start gap-3 px-4 py-2 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.05)' }}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + i * 0.2 }}
              >
                <span
                  className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold"
                  style={{ background: 'rgba(139, 92, 246, 0.3)', color: '#C4B5FD' }}
                >
                  {i + 1}
                </span>
                <span style={{ color: '#E8E8F0' }}>{step}</span>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* あそぶボタン（常時表示） */}
        <motion.div
          className="w-full"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          <button
            onClick={onComplete}
            className="w-full py-4 rounded-2xl text-lg font-bold transition-transform active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #48BB78, #38A169)',
              color: '#FFFFFF',
              boxShadow: '0 4px 15px rgba(72, 187, 120, 0.3)',
            }}
          >
            {instructionLevel === 'L1' ? '▶' : 'あそぶ ▶'}
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
