'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Mogura from '@/components/mascot/Mogura';
import { isSupabaseEnabled, supabase } from '@/lib/supabase/client';
import { getLocalChildProfile, clearLocalProfile } from '@/lib/local-profile';
import { clearChildCache } from '@/hooks/useChildProfile';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasLocalProfile, setHasLocalProfile] = useState(false);
  const [isDebug, setIsDebug] = useState(false);

  // Check if a demo profile already exists + debug mode
  useEffect(() => {
    if (!isSupabaseEnabled) {
      const profile = getLocalChildProfile();
      if (profile) setHasLocalProfile(true);
    }
    if (new URLSearchParams(window.location.search).get('debug') === '1') {
      setIsDebug(true);
    }
  }, []);

  // Demo mode: resume existing session
  const handleDemoResume = () => {
    document.cookie = 'manas_demo_session=1; path=/; max-age=2592000; SameSite=Lax';
    router.push('/');
  };

  // Demo mode: clear local profile and restart onboarding (for debug)
  const handleDemoReset = () => {
    clearLocalProfile();
    document.cookie = 'manas_demo_session=; path=/; max-age=0; SameSite=Lax';
    window.location.href = '/onboarding';
  };

  // Supabase login
  const handleLogin = async () => {
    if (!email || !password) {
      setError('メールアドレスとパスワードを入力してください');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) {
        setError('メールアドレスまたはパスワードが正しくありません');
        return;
      }
      window.location.href = '/';
    } catch {
      setError('ログイン中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-5 bg-deep-space">
      {/* Logo area */}
      <div className="mb-8 flex flex-col items-center">
        <Mogura expression="waving" size={100} />
        <h1 className="mt-4 text-2xl font-bold text-stardust">Manas</h1>
        <p className="mt-1 text-sm text-moon">おこさまの みらいを そだてよう</p>
      </div>

      {/* Login form */}
      <div className="w-full max-w-[340px] space-y-3">
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="メールアドレス"
          className="w-full h-12 px-4 rounded-xl text-base text-stardust placeholder-moon/50 outline-none"
          style={{
            background: 'rgba(42,42,90,0.6)',
            border: '2px solid rgba(108,60,225,0.3)',
          }}
        />
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="パスワード"
            className="w-full h-12 px-4 pr-12 rounded-xl text-base text-stardust placeholder-moon/50 outline-none"
            style={{
              background: 'rgba(42,42,90,0.6)',
              border: '2px solid rgba(108,60,225,0.3)',
            }}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-moon"
          >
            <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              {showPassword ? (
                <>
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </>
              ) : (
                <>
                  <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                  <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </>
              )}
            </svg>
          </button>
        </div>

        {error && (
          <p className="text-sm text-center" style={{ color: '#FF6B6B' }}>{error}</p>
        )}

        <button
          type="button"
          onClick={handleLogin}
          disabled={loading}
          className="w-full h-12 rounded-xl bg-cosmic font-bold text-white text-base active:scale-95 transition-transform disabled:opacity-50"
        >
          {loading ? 'ログイン中...' : 'ログイン'}
        </button>

        {/* Demo mode helpers */}
        {!isSupabaseEnabled && (
          <>
            {hasLocalProfile && (
              <button
                type="button"
                onClick={handleDemoResume}
                className="w-full h-12 rounded-xl font-bold text-base active:scale-95 transition-transform"
                style={{
                  background: 'rgba(78,205,196,0.15)',
                  color: '#4ECDC4',
                  border: '2px solid rgba(78,205,196,0.3)',
                }}
              >
                つづきから あそぶ
              </button>
            )}
            <button
              type="button"
              onClick={handleDemoReset}
              className="w-full h-11 rounded-xl text-sm font-medium active:scale-95 transition-transform border border-galaxy-light text-moon mt-1"
            >
              デバッグ用: サインアップから やりなおす
            </button>
          </>
        )}

        {/* Debug reset (visible with ?debug=1) */}
        {isDebug && isSupabaseEnabled && (
          <button
            type="button"
            onClick={() => {
              clearChildCache();
              clearLocalProfile();
              document.cookie = 'manas_demo_session=; path=/; max-age=0';
              try { sessionStorage.clear(); } catch {}
              try { localStorage.removeItem('manas_tier'); localStorage.removeItem('manas_disability_type'); } catch {}
              supabase.auth.signOut().finally(() => {
                window.location.href = '/onboarding';
              });
            }}
            className="w-full h-11 rounded-xl text-sm font-bold active:scale-95 transition-transform mt-1"
            style={{ background: 'rgba(255,59,48,0.2)', color: '#FF3B30', border: '2px solid rgba(255,59,48,0.4)' }}
          >
            RESET（オンボーディングからやり直す）
          </button>
        )}
      </div>

      {/* Bottom link */}
      <p className="mt-6 text-sm text-moon">
        <a href="/onboarding" className="text-cosmic-light hover:underline">
          はじめてのかた →
        </a>
      </p>
    </div>
  );
}
