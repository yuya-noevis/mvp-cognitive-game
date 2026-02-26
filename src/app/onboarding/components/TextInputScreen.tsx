'use client';

import Mogura from '@/components/mascot/Mogura';
import type { ScreenDef } from '../types';
import { StickyNextButton } from './StickyNextButton';

export function TextInputScreen({
  screen,
  value,
  onChange,
  onNext,
}: {
  screen: ScreenDef;
  value: string;
  onChange: (v: string) => void;
  onNext: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-6">
      <Mogura expression={screen.expression} size={screen.expressionSize} />

      <div className="text-center">
        <h2 className="text-lg font-bold text-stardust">{screen.title}</h2>
        {screen.subtitle && (
          <p className="text-sm text-moon mt-1">{screen.subtitle}</p>
        )}
      </div>

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="例: たろう"
        autoFocus
        className="w-full h-14 px-4 rounded-xl text-lg bg-galaxy-light text-stardust outline-none border-2 border-transparent focus:border-cosmic placeholder:text-moon text-center"
      />

      <StickyNextButton
        label="つぎへ"
        disabled={!value.trim()}
        onClick={onNext}
      />
    </div>
  );
}
