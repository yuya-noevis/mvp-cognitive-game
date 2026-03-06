'use client';

import Mogura from '@/components/mascot/Mogura';
import type { MascotChoice } from '@/features/onboarding-profile';

interface MascotSelectionProps {
  selected: MascotChoice | '';
  onSelect: (mascot: MascotChoice) => void;
  onConfirm: () => void;
  childName: string;
}

export function MascotSelection({ selected, onSelect, onConfirm, childName }: MascotSelectionProps) {
  const displayName = childName || 'おともだち';

  return (
    <div className="flex flex-col items-center gap-6 pt-4">
      <div className="text-center">
        <h2 className="text-xl font-bold text-stardust">
          いっしょにあそぼう！
        </h2>
        <p className="text-sm text-moon mt-2">
          {displayName}のパートナーをえらんでね
        </p>
      </div>

      <div className="flex gap-6 justify-center">
        {/* Luna */}
        <button
          type="button"
          onClick={() => onSelect('luna')}
          className={`flex flex-col items-center gap-3 p-4 rounded-2xl transition-all border-2 ${
            selected === 'luna'
              ? 'border-cosmic bg-cosmic/10 shadow-lg'
              : 'border-transparent bg-galaxy-light/30'
          }`}
          style={{ minWidth: '130px' }}
        >
          <Mogura expression="waving" size={100} />
          <span className="text-base font-bold text-stardust">ルナ</span>
          {selected === 'luna' && (
            <div className="w-5 h-5 rounded-full bg-cosmic flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 20 20" fill="none">
                <path d="M4 10l4 4 8-8" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          )}
        </button>

        {/* Mogura */}
        <button
          type="button"
          onClick={() => onSelect('mogura')}
          className={`flex flex-col items-center gap-3 p-4 rounded-2xl transition-all border-2 ${
            selected === 'mogura'
              ? 'border-cosmic bg-cosmic/10 shadow-lg'
              : 'border-transparent bg-galaxy-light/30'
          }`}
          style={{ minWidth: '130px' }}
        >
          <Mogura expression="excited" size={100} />
          <span className="text-base font-bold text-stardust">モグラ</span>
          {selected === 'mogura' && (
            <div className="w-5 h-5 rounded-full bg-cosmic flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 20 20" fill="none">
                <path d="M4 10l4 4 8-8" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          )}
        </button>
      </div>

      <button
        type="button"
        disabled={!selected}
        onClick={onConfirm}
        className="w-full h-14 bg-cosmic text-white text-lg font-bold rounded-2xl shadow-lg transition-opacity disabled:opacity-40 active:scale-[0.98]"
      >
        このこにきめた！
      </button>
    </div>
  );
}
