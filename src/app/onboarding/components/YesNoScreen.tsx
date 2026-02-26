'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Mogura from '@/components/mascot/Mogura';
import type { ScreenDef, YesNoAnswer } from '../types';

export function YesNoScreen({
  screen,
  answer,
  onAnswer,
}: {
  screen: ScreenDef;
  answer?: YesNoAnswer;
  onAnswer: (a: YesNoAnswer) => void;
}) {
  const [selected, setSelected] = useState<YesNoAnswer | null>(null);

  const handleSelect = (a: YesNoAnswer) => {
    setSelected(a);
    onAnswer(a);
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <Mogura expression={screen.expression} size={screen.expressionSize} />

      <h2 className="text-lg font-bold text-stardust text-center leading-relaxed">
        {screen.title}
      </h2>

      <div className="w-full flex gap-3">
        <motion.button
          type="button"
          whileTap={{ scale: 0.95 }}
          onClick={() => handleSelect('yes')}
          className={`flex-1 h-14 rounded-2xl text-lg font-bold transition-all ${
            selected === 'yes' || answer === 'yes'
              ? 'bg-cosmic text-white'
              : 'bg-galaxy-light text-stardust'
          }`}
        >
          はい
        </motion.button>
        <motion.button
          type="button"
          whileTap={{ scale: 0.95 }}
          onClick={() => handleSelect('no')}
          className={`flex-1 h-14 rounded-2xl text-lg font-bold transition-all ${
            selected === 'no' || answer === 'no'
              ? 'bg-cosmic text-white'
              : 'bg-galaxy-light text-stardust'
          }`}
        >
          いいえ
        </motion.button>
      </div>

      <button
        type="button"
        onClick={() => handleSelect('unknown')}
        className={`text-sm font-medium transition-colors ${
          selected === 'unknown' || answer === 'unknown' ? 'text-cosmic-light' : 'text-cosmic'
        }`}
      >
        わからない
      </button>
    </div>
  );
}
