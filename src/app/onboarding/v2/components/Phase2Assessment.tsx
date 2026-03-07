'use client';

import { useState } from 'react';
import Mogura from '@/components/mascot/Mogura';
import { StickyNextButton } from '../../components/StickyNextButton';
import { getChildName } from '@/features/onboarding-profile';
import type { OnboardingV2Data } from '../types';
import type { ConcernTag, ConcernSeverity } from '@/features/onboarding-profile';

/* ============================================================
   Screen 7: Concern Selection (max 7, multi-select)
   ============================================================ */

const CONCERN_OPTIONS: { label: string; value: ConcernTag; icon: string }[] = [
  { label: '気持ちの切り替えが難しい（パニック・かんしゃく）', value: 'emotion_regulation', icon: '\uD83D\uDE24' },
  { label: '集中が続かない、すぐ気が散る', value: 'attention', icon: '\uD83D\uDC40' },
  { label: '言葉でのやりとりが難しい', value: 'communication', icon: '\uD83D\uDDE3\uFE0F' },
  { label: '友達や人との関わりが難しい', value: 'social', icon: '\uD83E\uDDE9' },
  { label: '読み書きや学習が難しい', value: 'learning', icon: '\uD83D\uDCDA' },
  { label: '手先が不器用、身体の使い方が気になる', value: 'motor', icon: '\uD83D\uDC50' },
  { label: '予定や変化に対応するのが難しい', value: 'flexibility', icon: '\uD83D\uDD04' },
  { label: '物事を覚えるのが難しい', value: 'memory', icon: '\uD83D\uDCAD' },
];

export function ConcernSelectionScreen({
  data,
  onUpdate,
  onNext,
}: {
  data: OnboardingV2Data;
  onUpdate: (partial: Partial<OnboardingV2Data>) => void;
  onNext: () => void;
}) {
  const toggleConcern = (tag: ConcernTag) => {
    const current = data.concernTags;
    if (current.includes(tag)) {
      onUpdate({ concernTags: current.filter((t) => t !== tag) });
    } else {
      onUpdate({ concernTags: [...current, tag] });
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <Mogura expression="encouraging" size={100} />

      <div className="text-center">
        <h2 className="text-lg font-bold text-stardust">
          今、お子さまのことで<br />気になっていることを選んでください
        </h2>
        <p className="text-sm text-moon mt-1">
          あてはまるものを全て選んでください（{data.concernTags.length}個選択中）
        </p>
      </div>

      <div className="w-full flex flex-col gap-2">
        {CONCERN_OPTIONS.map((opt) => {
          const selected = data.concernTags.includes(opt.value);
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => toggleConcern(opt.value)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all border text-left ${
                selected
                  ? 'bg-cosmic/20 border-cosmic/40'
                  : 'bg-galaxy-light/50 border-galaxy-light'
              }`}
            >
              <span className="text-xl flex-shrink-0">{opt.icon}</span>
              <span className="text-sm text-stardust flex-1">{opt.label}</span>
              {selected && (
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none" className="flex-shrink-0">
                  <path d="M4 10l4 4 8-8" stroke="#6C3CE1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
          );
        })}
      </div>

      <StickyNextButton
        label={data.concernTags.length > 0 ? '次へ（選んだ順に確認します）' : '選択を確定する'}
        disabled={data.concernTags.length === 0}
        onClick={onNext}
      />
    </div>
  );
}

/* ============================================================
   Screen 8~14: Severity per concern (dynamic, 1 screen per item)
   ============================================================ */

const SEVERITY_QUESTIONS: Record<string, string> = {
  emotion_regulation: '気持ちの切り替えが難しい場面で、{name}はどのくらい困っていますか？',
  attention: '集中が続かず気が散ってしまうことで、{name}はどのくらい困っていますか？',
  communication: '言葉でのやりとりの難しさで、{name}はどのくらい困っていますか？',
  social: '友達や人との関わりの難しさで、{name}はどのくらい困っていますか？',
  learning: '読み書きや学習の難しさで、{name}はどのくらい困っていますか？',
  motor: '手先の不器用さや身体の使い方で、{name}はどのくらい困っていますか？',
  flexibility: '予定や変化への対応の難しさで、{name}はどのくらい困っていますか？',
  memory: '物事を覚えることの難しさで、{name}はどのくらい困っていますか？',
};

const SEVERITY_LABELS = [
  '気に\nならない',
  'ほとんど\n気にならない',
  'たまに\n気になる',
  'ときどき\n困る',
  'よく\n困る',
  'かなり\n困る',
  '毎日とても\n困っている',
];

export function SeverityScreen({
  data,
  concernIndex,
  totalConcerns,
  onUpdate,
  onNext,
}: {
  data: OnboardingV2Data;
  concernIndex: number;
  totalConcerns: number;
  onUpdate: (partial: Partial<OnboardingV2Data>) => void;
  onNext: () => void;
}) {
  const category = data.concernTags[concernIndex];
  const childName = getChildName(data.childName, data.honorific);
  const question = (SEVERITY_QUESTIONS[category] || '').replace('{name}', childName);

  const existing = data.concernSeverities.find((s) => s.category === category);
  const [selected, setSelected] = useState<number | null>(existing?.severity ?? null);

  const handleSelect = (severity: 1 | 2 | 3 | 4 | 5 | 6 | 7) => {
    setSelected(severity);

    const newSeverity: ConcernSeverity = {
      category,
      severity,
      recordedAt: new Date().toISOString().split('T')[0],
    };
    const updated = data.concernSeverities.filter((s) => s.category !== category);
    updated.push(newSeverity);

    // Also maintain backward compatibility: first concern -> baseline
    const baselineUpdates: Partial<OnboardingV2Data> = {};
    if (concernIndex === 0) {
      baselineUpdates.baselineCategory = category;
      baselineUpdates.baselineScore = severity;
    }

    onUpdate({ concernSeverities: updated, ...baselineUpdates });
  };

  return (
    <div className="flex flex-col items-center gap-5">
      <Mogura expression="happy" size={100} />

      <p className="text-xs font-bold tracking-wider" style={{ color: '#6C3CE1' }}>
        {concernIndex + 1} / {totalConcerns}
      </p>

      <div className="text-center">
        <h2 className="text-lg font-bold text-stardust">
          {question}
        </h2>
      </div>

      <div className="w-full grid grid-cols-7 gap-1">
        {([1, 2, 3, 4, 5, 6, 7] as const).map((level) => (
          <button
            key={level}
            type="button"
            onClick={() => handleSelect(level)}
            className={`flex flex-col items-center gap-1 py-3 px-0.5 rounded-xl transition-all border ${
              selected === level
                ? 'bg-cosmic/20 border-cosmic/40'
                : 'bg-galaxy-light/50 border-galaxy-light'
            }`}
          >
            <span className="text-xl font-bold text-stardust">{level}</span>
            <span className="text-[9px] text-moon leading-tight text-center whitespace-pre-line">
              {SEVERITY_LABELS[level - 1]}
            </span>
          </button>
        ))}
      </div>

      <StickyNextButton
        label="つぎへ"
        disabled={selected === null}
        onClick={onNext}
      />
    </div>
  );
}
