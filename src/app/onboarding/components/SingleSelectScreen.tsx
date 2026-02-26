'use client';

import Mogura from '@/components/mascot/Mogura';
import type { ScreenDef } from '../types';
import { StickyNextButton } from './StickyNextButton';

export function SingleSelectScreen({
  screen,
  selectedValue,
  onSelect,
  onNext,
}: {
  screen: ScreenDef;
  selectedValue: string;
  onSelect: (value: string) => void;
  onNext: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-5">
      <Mogura expression={screen.expression} size={screen.expressionSize} />

      <div className="text-center">
        <h2 className="text-lg font-bold text-stardust">{screen.title}</h2>
        {screen.subtitle && (
          <p className="text-sm text-moon mt-1">{screen.subtitle}</p>
        )}
      </div>

      <div className="w-full flex flex-col">
        {screen.options?.map((opt, i) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onSelect(opt.value)}
            className={`w-full flex items-center justify-between px-4 py-4 transition-all ${
              i > 0 ? 'border-t border-galaxy-light' : ''
            } ${
              selectedValue === opt.value ? 'bg-galaxy-light' : ''
            }`}
          >
            <span className="text-base text-stardust">{opt.label}</span>
            {selectedValue === opt.value && (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M4 10l4 4 8-8" stroke="#6C3CE1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
        ))}
      </div>

      <StickyNextButton
        label="つぎへ"
        disabled={!selectedValue}
        onClick={onNext}
      />
    </div>
  );
}
