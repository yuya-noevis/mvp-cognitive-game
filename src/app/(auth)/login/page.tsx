'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('ページ読み込み完了');

  async function doLogin() {
    setMsg('ログイン処理開始...');
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setMsg('エラー: ' + error.message);
        return;
      }
      setMsg('ログイン成功！リダイレクト中...');
      window.location.href = '/select';
    } catch (e) {
      setMsg('例外: ' + (e instanceof Error ? e.message : String(e)));
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0D0D2B', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 360, color: '#F0F0FF' }}>
        <h1 style={{ textAlign: 'center', fontSize: 28, marginBottom: 24 }}>Manas ログイン</h1>

        <div style={{ background: 'rgba(0,200,180,0.15)', padding: 12, borderRadius: 8, marginBottom: 16, fontSize: 14, color: '#4ECDC4' }}>
          {msg}
        </div>

        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="メールアドレス"
          style={{ width: '100%', height: 48, padding: '0 16px', borderRadius: 12, border: '2px solid #6C3CE1', background: 'rgba(42,42,90,0.6)', color: '#F0F0FF', fontSize: 16, marginBottom: 12, boxSizing: 'border-box' }}
        />
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="パスワード"
          style={{ width: '100%', height: 48, padding: '0 16px', borderRadius: 12, border: '2px solid #6C3CE1', background: 'rgba(42,42,90,0.6)', color: '#F0F0FF', fontSize: 16, marginBottom: 16, boxSizing: 'border-box' }}
        />

        <button
          type="button"
          onClick={doLogin}
          style={{ width: '100%', height: 52, borderRadius: 14, background: '#6C3CE1', color: '#fff', fontSize: 18, fontWeight: 'bold', border: 'none', cursor: 'pointer' }}
        >
          ログイン
        </button>

        <p style={{ textAlign: 'center', marginTop: 16, fontSize: 14, color: '#8888AA' }}>
          <a href="/onboarding" style={{ color: '#4ECDC4' }}>はじめてのかた</a>
        </p>
      </div>
    </div>
  );
}
