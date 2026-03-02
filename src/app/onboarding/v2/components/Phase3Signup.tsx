'use client';

import { useState } from 'react';
import Mogura from '@/components/mascot/Mogura';
import type { OnboardingV2Data } from '../types';

interface Phase3SignupProps {
  data: OnboardingV2Data;
  authError: string;
  saving: boolean;
  onUpdate: (partial: Partial<OnboardingV2Data>) => void;
  onSignup: () => void;
  onSkip: () => void;
}

export function Phase3Signup({
  data,
  authError,
  saving,
  onUpdate,
  onSignup,
  onSkip,
}: Phase3SignupProps) {
  const [showPassword, setShowPassword] = useState(false);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email);
  const passwordValid = data.password.length >= 8;
  const canSignup = emailValid && passwordValid;

  const displayName = data.childName || 'おともだち';

  return (
    <div className="flex flex-col items-center gap-5">
      <Mogura expression="encouraging" size={120} />

      <div className="text-center">
        <h2 className="text-xl font-bold text-stardust">
          {displayName}の記録を保存しよう
        </h2>
        <p className="text-sm text-moon mt-1">
          アカウントを作ると、成長記録を確認できます
        </p>
      </div>

      {/* Benefits list */}
      <div
        className="w-full rounded-2xl px-4 py-4 space-y-2"
        style={{ background: 'rgba(108, 60, 225, 0.08)', border: '1px solid rgba(108, 60, 225, 0.15)' }}
      >
        {[
          '成長の記録を振り返れる',
          '続きから遊べる',
          'お子さまに合ったゲームが自動で調整される',
        ].map((benefit, i) => (
          <div key={i} className="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8l3 3 7-7" stroke="#6C3CE1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-sm text-moon">{benefit}</span>
          </div>
        ))}
      </div>

      {/* Email input */}
      <div className="w-full space-y-3">
        <input
          type="email"
          value={data.email}
          onChange={(e) => onUpdate({ email: e.target.value })}
          placeholder="メールアドレス"
          className="w-full h-12 px-4 rounded-xl text-base bg-galaxy-light text-stardust outline-none border-2 border-transparent focus:border-cosmic placeholder:text-moon"
        />

        {/* Password input */}
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={data.password}
            onChange={(e) => onUpdate({ password: e.target.value })}
            placeholder="パスワード（8文字以上）"
            className="w-full h-12 px-4 pr-12 rounded-xl text-base bg-galaxy-light text-stardust outline-none border-2 border-transparent focus:border-cosmic placeholder:text-moon"
          />
          <button
            type="button"
            onClick={() => setShowPassword((p) => !p)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-moon p-1"
          >
            {showPassword ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {authError && (
        <p className="w-full text-sm text-supernova text-center">{authError}</p>
      )}

      {/* Signup button */}
      <button
        type="button"
        disabled={!canSignup || saving}
        onClick={onSignup}
        className="w-full h-14 bg-cosmic text-white text-lg font-bold rounded-2xl shadow-lg transition-opacity disabled:opacity-40 active:scale-[0.98]"
      >
        {saving ? '保存中...' : '登録してはじめる'}
      </button>

      {/* Skip button */}
      <button
        type="button"
        onClick={onSkip}
        disabled={saving}
        className="w-full h-11 text-sm font-medium text-moon border border-galaxy-light rounded-xl active:bg-galaxy-light/20 disabled:opacity-40"
      >
        今はスキップする
      </button>

      <p className="text-xs text-moon/60 text-center">
        スキップした場合でも、この端末でゲームを続けることができます
      </p>
    </div>
  );
}
