'use client';

import React from 'react';
import { motion } from 'framer-motion';

export type Mood = 'great' | 'good' | 'okay' | 'tired' | 'upset';

interface MoodSelectorProps {
  onSelect: (mood: Mood) => void;
  className?: string;
}

const MOODS: { id: Mood; emoji: string; color: string }[] = [
  { id: 'great', emoji: '🌟', color: '#FFD43B' },
  { id: 'good', emoji: '😊', color: '#2ED573' },
  { id: 'okay', emoji: '🙂', color: '#4ECDC4' },
  { id: 'tired', emoji: '😴', color: '#8B5CF6' },
  { id: 'upset', emoji: '😢', color: '#FF6B9D' },
];

/**
 * MoodSelector — 気分チェック（テキスト不要）
 *
 * 5つの大きな絵文字ボタン。
 * 子供がタップするだけで気分を伝えられる。
 */
export function MoodSelector({ onSelect, className = '' }: MoodSelectorProps) {
  return (
    <div className={`flex items-center justify-center gap-3 ${className}`}>
      {MOODS.map((mood, i) => (
        <motion.button
          key={mood.id}
          onClick={() => onSelect(mood.id)}
          whileTap={{ scale: 0.85 }}
          whileHover={{ scale: 1.1 }}
          className="w-16 h-16 rounded-2xl flex items-center justify-center tap-target text-3xl"
          style={{
            background: `${mood.color}22`,
            border: `2px solid ${mood.color}44`,
            boxShadow: `0 4px 12px ${mood.color}20`,
            animationDelay: `${i * 50}ms`,
          }}
        >
          {mood.emoji}
        </motion.button>
      ))}
    </div>
  );
}
