'use client';

import React, { useState } from 'react';
import { useTier } from '@/features/gating';
import { useInstructionLevel } from '@/features/instruction';
import { dailyTracker } from '@/features/session/daily-tracker';
import { setDevDisabilityType, getDevDisabilityType } from '@/features/dda/disability-profile-store';
import type { Tier } from '@/features/gating';
import type { InstructionLevel } from '@/features/instruction';
import type { DisabilityType } from '@/features/dda/disability-profile';

const TIERS: Tier[] = [1, 2, 3];
const LEVELS: InstructionLevel[] = ['L1', 'L2', 'L3', 'L4'];
const TRIAL_OVERRIDES = [
  { label: 'Default', value: '' },
  { label: '3', value: '3' },
  { label: '5', value: '5' },
  { label: '12', value: '12' },
];

const DISABILITY_PROFILES: { label: string; value: DisabilityType | null }[] = [
  { label: 'Auto', value: null },
  { label: 'ASD', value: 'asd' },
  { label: 'ADHD', value: 'adhd' },
  { label: 'ID重', value: 'id-severe' },
  { label: 'ID中', value: 'id-moderate' },
  { label: 'ID軽', value: 'id-mild' },
  { label: '定型', value: 'typical' },
];

const DEV_SESSION_OVERRIDE_KEY = 'manas_session_trials_dev_override';

export function DevToggle() {
  const { tier, setDevTier } = useTier();
  const { instructionLevel, setDevInstructionLevel } = useInstructionLevel();
  const [open, setOpen] = useState(false);
  const [trialOverride, setTrialOverride] = useState(() => {
    try { return localStorage.getItem(DEV_SESSION_OVERRIDE_KEY) ?? ''; } catch { return ''; }
  });
  const [devProfile, setDevProfile] = useState<DisabilityType | null>(() => {
    try { return getDevDisabilityType(); } catch { return null; }
  });

  // 本番ビルドでは非表示
  if (process.env.NODE_ENV === 'production') return null;

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-20 right-2 z-[9999] w-8 h-8 rounded-full flex items-center justify-center text-xs"
        style={{ background: 'rgba(255,255,255,0.15)', color: '#B8B8D0' }}
      >
        D
      </button>
    );
  }

  const handleTrialOverride = (value: string) => {
    setTrialOverride(value);
    try {
      if (value) {
        localStorage.setItem(DEV_SESSION_OVERRIDE_KEY, value);
      } else {
        localStorage.removeItem(DEV_SESSION_OVERRIDE_KEY);
      }
    } catch { /* ignore */ }
  };

  const handleProfileChange = (value: DisabilityType | null) => {
    setDevProfile(value);
    setDevDisabilityType(value);
  };

  const handleResetDaily = () => {
    dailyTracker.reset();
    alert('Daily limit reset');
  };

  return (
    <div
      className="fixed bottom-20 right-2 z-[9999] rounded-xl p-3 space-y-2 text-xs"
      style={{ background: 'rgba(20, 20, 40, 0.95)', border: '1px solid rgba(255,255,255,0.1)' }}
    >
      <div className="flex items-center justify-between gap-2 mb-1">
        <span className="font-bold" style={{ color: '#B8B8D0' }}>Dev</span>
        <button onClick={() => setOpen(false)} style={{ color: '#B8B8D0' }}>x</button>
      </div>

      {/* Tier toggle */}
      <div className="space-y-1">
        <span style={{ color: '#8888A0' }}>Tier</span>
        <div className="flex gap-1">
          {TIERS.map(t => (
            <button
              key={t}
              onClick={() => setDevTier(t)}
              className="w-8 h-7 rounded-md text-xs font-bold transition-colors"
              style={{
                background: tier === t ? '#6C3CE1' : 'rgba(255,255,255,0.08)',
                color: tier === t ? '#fff' : '#B8B8D0',
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Instruction level toggle */}
      <div className="space-y-1">
        <span style={{ color: '#8888A0' }}>Instruction</span>
        <div className="flex gap-1">
          {LEVELS.map(l => (
            <button
              key={l}
              onClick={() => setDevInstructionLevel(l)}
              className="px-2 h-7 rounded-md text-xs font-bold transition-colors"
              style={{
                background: instructionLevel === l ? '#6C3CE1' : 'rgba(255,255,255,0.08)',
                color: instructionLevel === l ? '#fff' : '#B8B8D0',
              }}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Session trial count override */}
      <div className="space-y-1">
        <span style={{ color: '#8888A0' }}>Session Trials</span>
        <div className="flex gap-1">
          {TRIAL_OVERRIDES.map(({ label, value }) => (
            <button
              key={label}
              onClick={() => handleTrialOverride(value)}
              className="px-2 h-7 rounded-md text-xs font-bold transition-colors"
              style={{
                background: trialOverride === value ? '#6C3CE1' : 'rgba(255,255,255,0.08)',
                color: trialOverride === value ? '#fff' : '#B8B8D0',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* DDA Profile toggle */}
      <div className="space-y-1">
        <span style={{ color: '#8888A0' }}>DDA Profile</span>
        <div className="flex flex-wrap gap-1">
          {DISABILITY_PROFILES.map(({ label, value }) => (
            <button
              key={label}
              onClick={() => handleProfileChange(value)}
              className="px-2 h-7 rounded-md text-xs font-bold transition-colors"
              style={{
                background: devProfile === value ? '#6C3CE1' : 'rgba(255,255,255,0.08)',
                color: devProfile === value ? '#fff' : '#B8B8D0',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Daily limit reset */}
      <div className="space-y-1">
        <span style={{ color: '#8888A0' }}>Daily</span>
        <button
          onClick={handleResetDaily}
          className="w-full h-7 rounded-md text-xs font-bold transition-colors"
          style={{ background: 'rgba(255, 80, 80, 0.2)', color: '#FF8080' }}
        >
          Reset Limit
        </button>
      </div>
    </div>
  );
}
