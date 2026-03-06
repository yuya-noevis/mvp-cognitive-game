'use client';

import Mogura from '@/components/mascot/Mogura';
import { getChildName } from '@/features/onboarding-profile';
import type { Honorific } from '@/features/onboarding-profile';
import type { Tier } from '@/features/gating';
import { StickyNextButton } from '../../components/StickyNextButton';

interface GoalSettingProps {
  childName: string;
  honorific: Honorific | '';
  tier: Tier;
  selectedMinutes: 5 | 10 | 15 | 20;
  onSelect: (minutes: 5 | 10 | 15 | 20) => void;
  onNext: () => void;
}

const GOAL_OPTIONS: { label: string; minutes: 5 | 10 | 15 | 20; description: string }[] = [
  { label: 'カジュアル', minutes: 5, description: '気軽に続けたい' },
  { label: 'レギュラー', minutes: 10, description: 'バランスよく' },
  { label: 'シリアス', minutes: 15, description: 'しっかり取り組む' },
  { label: 'インテンス', minutes: 20, description: '本格的に' },
];

const TIER_RECOMMENDED_MINUTES: Record<Tier, number> = {
  1: 10,
  2: 15,
  3: 20,
};

export function GoalSetting({ childName, honorific, tier, selectedMinutes, onSelect, onNext }: GoalSettingProps) {
  const displayName = getChildName(childName, honorific);
  const recommendedMinutes = TIER_RECOMMENDED_MINUTES[tier];

  return (
    <div className="flex flex-col items-center gap-5 pt-4">
      <Mogura expression="happy" size={120} />

      <div className="text-center">
        <h2 className="text-xl font-bold text-stardust">
          毎日の目標を決めよう
        </h2>
        <p className="text-sm mt-2" style={{ color: '#4ECDC4' }}>
          {displayName}には1日{recommendedMinutes}分がおすすめです
        </p>
      </div>

      <div className="w-full flex flex-col gap-3">
        {GOAL_OPTIONS.map((opt) => {
          const isRecommended = opt.minutes === recommendedMinutes;
          const isSelected = selectedMinutes === opt.minutes;
          return (
            <button
              key={opt.minutes}
              type="button"
              onClick={() => onSelect(opt.minutes)}
              className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl transition-all border ${
                isSelected
                  ? 'bg-cosmic/20 border-cosmic/40'
                  : 'bg-galaxy-light/50 border-galaxy-light'
              }`}
            >
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold text-stardust">{opt.label}</span>
                  {isRecommended && (
                    <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                      style={{ background: 'rgba(78, 205, 196, 0.2)', color: '#4ECDC4' }}>
                      おすすめ
                    </span>
                  )}
                </div>
                <span className="text-sm text-moon">{opt.description}</span>
              </div>
              <span className="text-lg font-bold text-stardust">{opt.minutes}分</span>
              {isSelected && (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M4 10l4 4 8-8" stroke="#6C3CE1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
          );
        })}
      </div>

      <p className="text-xs text-moon/60 text-center">
        あとで設定から変更できます
      </p>

      <StickyNextButton
        label="つぎへ"
        onClick={onNext}
      />
    </div>
  );
}
