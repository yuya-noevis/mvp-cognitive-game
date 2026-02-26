'use client';

import { useMemo } from 'react';
import Mogura from '@/components/mascot/Mogura';
import type { OnboardingDataV2 } from '../types';

export function AccountScreen({
  data,
  showPassword,
  onTogglePassword,
  error,
  saving,
  onChange,
  onNext,
}: {
  data: OnboardingDataV2;
  showPassword: boolean;
  onTogglePassword: () => void;
  error: string;
  saving: boolean;
  onChange: (email: string, password: string) => void;
  onNext: () => void;
}) {
  const canProceed = useMemo(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(data.email) && data.password.length >= 8;
  }, [data.email, data.password]);

  return (
    <div className="flex flex-col items-center gap-6">
      <Mogura expression="waving" size={120} />
      <h2 className="text-xl font-bold text-stardust">Manasへようこそ</h2>

      <div className="w-full flex flex-col gap-3">
        <input
          type="email"
          value={data.email}
          onChange={(e) => onChange(e.target.value, data.password)}
          placeholder="メールアドレス"
          className="w-full h-12 px-4 rounded-xl text-base bg-galaxy-light text-stardust outline-none border-2 border-transparent focus:border-cosmic placeholder:text-moon"
        />
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={data.password}
            onChange={(e) => onChange(data.email, e.target.value)}
            placeholder="パスワード（8文字以上）"
            className="w-full h-12 px-4 pr-12 rounded-xl text-base bg-galaxy-light text-stardust outline-none border-2 border-transparent focus:border-cosmic placeholder:text-moon"
          />
          <button type="button" onClick={onTogglePassword} className="absolute right-3 top-1/2 -translate-y-1/2 text-moon">
            {showPassword ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {error && <p className="w-full text-sm text-supernova">{error}</p>}

      <button
        type="button"
        disabled={!canProceed || saving}
        onClick={onNext}
        className="w-full h-14 bg-cosmic text-white text-lg font-bold rounded-2xl shadow-lg transition-opacity disabled:opacity-40 active:scale-[0.98]"
      >
        {saving ? '処理中...' : 'アカウントを作成'}
      </button>

      <p className="text-sm text-moon">
        すでにアカウントをお持ちの方は{' '}
        <a href="/login" className="text-cosmic underline">ログイン</a>
      </p>
    </div>
  );
}
