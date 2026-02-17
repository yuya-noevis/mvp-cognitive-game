'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // TODO: Supabase auth integration
      console.log('Login:', email);
    } catch {
      setError('ログインに失敗しました。メールアドレスとパスワードをご確認ください。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4"
         style={{ background: 'linear-gradient(160deg, #F7F7F7 0%, rgba(88,204,2,0.06) 50%, #FFFFFF 100%)' }}>
      <div className="w-full max-w-sm animate-fade-in-up">
        {/* Logo area */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
               style={{ background: '#58CC02', boxShadow: '0 4px 0 #46A302, 0 6px 16px rgba(88,204,2,0.3)' }}>
            <span className="text-3xl text-white font-bold">M</span>
          </div>
          <h1 className="text-2xl font-bold" style={{ color: '#58CC02' }}>
            Manas
          </h1>
          <p className="text-sm mt-1" style={{ color: '#AFAFAF' }}>
            おかえりなさい
          </p>
        </div>

        {/* Form card */}
        <div className="card p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1.5"
                     style={{ color: 'var(--color-text-secondary)' }}>
                メールアドレス
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 text-base rounded-xl outline-none transition-all"
                style={{
                  border: '1.5px solid var(--color-border)',
                  background: 'var(--color-bg)',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-primary)';
                  e.currentTarget.style.boxShadow = '0 0 0 3px var(--color-primary-bg)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-border)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1.5"
                     style={{ color: 'var(--color-text-secondary)' }}>
                パスワード
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 text-base rounded-xl outline-none transition-all"
                style={{
                  border: '1.5px solid var(--color-border)',
                  background: 'var(--color-bg)',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-primary)';
                  e.currentTarget.style.boxShadow = '0 0 0 3px var(--color-primary-bg)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-border)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg text-sm"
                   style={{ background: 'var(--color-warning-bg)', color: '#B8860B' }}>
                <span>&#9888;</span>
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-duo-green w-full py-3.5 text-base tap-target rounded-xl disabled:opacity-50"
            >
              {loading ? 'ログイン中...' : 'ログイン'}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm" style={{ color: 'var(--color-text-muted)' }}>
          アカウントをお持ちでない方は{' '}
          <Link href="/signup" className="font-medium hover:underline"
                style={{ color: 'var(--color-primary)' }}>
            新規登録
          </Link>
        </p>
      </div>
    </div>
  );
}
