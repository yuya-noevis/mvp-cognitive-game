'use client';

import { useState, useEffect } from 'react';
import Mogura from '@/components/mascot/Mogura';
import { loadOnboardingProfile, addWeeklyCheckin } from '@/features/onboarding-profile';
import type { ConcernTag } from '@/features/onboarding-profile';

const CONCERN_LABELS: Record<ConcernTag, string> = {
  emotion_regulation: '気持ちの切り替えが難しい',
  attention: '集中が続かない、すぐ気が散る',
  communication: '言葉でのやりとりが難しい',
  social: '友達や人との関わりが難しい',
  learning: '読み書きや学習が難しい',
  motor: '手先が不器用、身体の使い方が気になる',
  flexibility: '予定や変化に対応するのが難しい',
  memory: '物事を覚えるのが難しい',
};

const CHECKIN_OPTIONS: { label: string; score: number }[] = [
  { label: 'ほぼ毎日', score: 6 },
  { label: '週数回', score: 3 },
  { label: 'ほとんどなかった', score: 0.5 },
];

interface WeeklyCheckinProps {
  onComplete: () => void;
  childId?: string;
}

export function WeeklyCheckin({ onComplete, childId }: WeeklyCheckinProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const profile = loadOnboardingProfile();
  const category = (profile.concern_tags[0] || '') as ConcernTag;
  const label = category ? CONCERN_LABELS[category] : '';

  // Skip if no concern tags (defer to useEffect to avoid calling during render)
  useEffect(() => {
    if (!category) {
      onComplete();
    }
  }, [category, onComplete]);

  if (!category) {
    return null;
  }

  const handleSubmit = async () => {
    if (selected === null) return;
    await addWeeklyCheckin({
      date: new Date().toISOString().split('T')[0],
      score: selected,
      category,
    }, childId);
    onComplete();
  };

  return (
    <div className="flex flex-col items-center gap-6 p-6 min-h-screen justify-center" style={{ background: '#0D0D2B' }}>
      <Mogura expression="encouraging" size={100} />

      <div className="text-center">
        <p className="text-xs font-bold tracking-wider mb-1" style={{ color: '#4ECDC4' }}>
          今週のふりかえり
        </p>
        <h2 className="text-lg font-bold text-stardust">
          今週、「{label}」の場面は<br />どのくらいありましたか？
        </h2>
      </div>

      <div className="w-full max-w-[400px] flex flex-col gap-3">
        {CHECKIN_OPTIONS.map((opt) => (
          <button
            key={opt.score}
            type="button"
            onClick={() => setSelected(opt.score)}
            className={`w-full flex items-center px-5 py-4 rounded-2xl transition-all border ${
              selected === opt.score
                ? 'bg-cosmic/20 border-cosmic/40'
                : 'bg-galaxy-light/50 border-galaxy-light'
            }`}
          >
            <span className="text-base text-stardust flex-1 text-left">{opt.label}</span>
            {selected === opt.score && (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M4 10l4 4 8-8" stroke="#6C3CE1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
        ))}
      </div>

      <button
        type="button"
        disabled={selected === null}
        onClick={handleSubmit}
        className="w-full max-w-[400px] h-14 bg-cosmic text-white text-lg font-bold rounded-2xl shadow-lg transition-opacity disabled:opacity-40 active:scale-[0.98]"
      >
        送信する
      </button>

      <button
        type="button"
        onClick={onComplete}
        className="text-sm text-moon/60 underline"
      >
        スキップ
      </button>
    </div>
  );
}

/** Check if weekly check-in should show (Sunday + not already checked in this week) */
export function shouldShowWeeklyCheckin(): boolean {
  const now = new Date();
  if (now.getDay() !== 0) return false; // Sunday only

  const profile = loadOnboardingProfile();
  if (!profile.onboarding_completed) return false;
  if (profile.concern_tags.length === 0) return false;

  const today = now.toISOString().split('T')[0];
  // Check if already answered this week (within last 7 days)
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const recentCheckin = profile.weekly_checkins.find(
    (c) => c.date >= weekAgo && c.date <= today,
  );
  return !recentCheckin;
}
