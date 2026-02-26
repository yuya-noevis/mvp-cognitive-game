'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import Mogura from '@/components/mascot/Mogura';
import type { ScreenDef } from '../types';
import { StickyNextButton } from './StickyNextButton';

export function MultiChipScreen({
  screen,
  selected,
  onToggle,
  onNext,
}: {
  screen: ScreenDef;
  selected: string[];
  onToggle: (value: string) => void;
  onNext: () => void;
}) {
  const categories = useMemo(() => {
    const opts = screen.options || [];
    const cats = new Map<string, typeof opts>();
    for (const opt of opts) {
      const cat = opt.category || '';
      if (!cats.has(cat)) cats.set(cat, []);
      cats.get(cat)!.push(opt);
    }
    return cats;
  }, [screen.options]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col items-center gap-3">
        <Mogura expression={screen.expression} size={screen.expressionSize} />
        <div className="text-center">
          <h2 className="text-lg font-bold text-stardust">{screen.title}</h2>
          {screen.subtitle && (
            <p className="text-sm text-moon mt-1">{screen.subtitle}</p>
          )}
        </div>
      </div>

      <div className="max-h-[50vh] overflow-y-auto pb-4">
        {Array.from(categories.entries()).map(([cat, opts]) => (
          <div key={cat || '_default'}>
            {cat && (
              <p className="text-xs font-semibold text-moon uppercase tracking-wide mt-4 mb-2">
                {cat}
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              {opts.map((opt) => (
                <motion.button
                  key={opt.value}
                  type="button"
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onToggle(opt.value)}
                  className={`px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${
                    selected.includes(opt.value)
                      ? 'bg-cosmic text-white border border-cosmic shadow-sm'
                      : 'bg-galaxy-light text-stardust border border-galaxy-light'
                  }`}
                >
                  {opt.label}
                </motion.button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <StickyNextButton label="つぎへ" onClick={onNext} />
    </div>
  );
}
