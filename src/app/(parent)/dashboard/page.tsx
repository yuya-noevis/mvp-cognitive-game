'use client';

import React from 'react';
import Link from 'next/link';
import { GAME_LIST } from '@/games';
import { COGNITIVE_DOMAINS } from '@/lib/constants';
import { PlayIcon, SparkleIcon, FireIcon, SeedlingIcon, DomainIcon } from '@/components/icons';
import { ManasFace } from '@/components/mascot/ManasCharacter';
import type { CognitiveDomain } from '@/types';

export default function DashboardPage() {
  // TODO: Fetch children from Supabase
  const mockChild = {
    display_name: 'ゆうちゃん',
    age_group: '6-9',
    recent_sessions: 3,
    streak_days: 5,
  };

  // Mock cognitive summary (top 5 domains with scores)
  const mockCognitiveSnapshot = [
    { key: 'attention', score: 72 },
    { key: 'inhibition', score: 65 },
    { key: 'working_memory', score: 78 },
    { key: 'processing_speed', score: 60 },
    { key: 'cognitive_flexibility', score: 70 },
  ];

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg)' }}>
      {/* Header */}
      <header className="sticky top-0 z-10 backdrop-blur-md"
              style={{ background: 'rgba(247, 247, 247, 0.95)', borderBottom: '1px solid #EEEEEE' }}>
        <div className="max-w-lg mx-auto flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                 style={{ background: '#58CC02' }}>
              <span className="text-sm text-white font-bold">M</span>
            </div>
            <span className="font-bold" style={{ color: '#58CC02' }}>Manas</span>
          </div>
          <Link href="/settings"
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
                style={{ background: 'var(--color-border-light)' }}
                aria-label="設定">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-text-secondary)' }}>
              <circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
            </svg>
          </Link>
        </div>
      </header>

      <main className="max-w-lg mx-auto p-4 space-y-5">
        {/* Child profile + greeting */}
        <section className="card p-5 animate-fade-in-up">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center animate-gentle-pulse"
                 style={{ background: 'var(--color-primary-bg)' }}>
              <ManasFace expression="happy" size={48} />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>
                {mockChild.display_name}
              </h2>
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                {mockChild.age_group}歳グループ
              </p>
            </div>
            {/* Streak badge */}
            {mockChild.streak_days > 0 && (
              <div className="flex flex-col items-center px-3 py-1.5 rounded-xl"
                   style={{ background: 'var(--color-warning-bg)' }}>
                <FireIcon size={22} style={{ color: 'var(--color-warning)' }} />
                <span className="text-xs font-bold" style={{ color: 'var(--color-warning)' }}>
                  {mockChild.streak_days}日
                </span>
              </div>
            )}
          </div>
        </section>

        {/* Main CTA - Start game */}
        <section className="animate-fade-in-up stagger-1">
          <Link
            href="/select"
            className="card card-hover block w-full p-6 text-center relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #58CC02 0%, #46A302 100%)',
              border: 'none',
              boxShadow: '0 4px 0 #3A8502, 0 6px 12px rgba(0,0,0,0.1)',
            }}
          >
            <div className="relative z-10">
              <PlayIcon size={40} className="animate-gentle-bounce" style={{ color: 'white' }} />
              <span className="text-xl font-bold text-white block">ゲームをはじめる</span>
              <span className="text-sm text-white/70 block mt-1">たのしくチャレンジしよう！</span>
            </div>
            {/* Decorative circles */}
            <div className="absolute top-[-20px] right-[-20px] w-24 h-24 rounded-full opacity-10"
                 style={{ background: 'white' }} />
            <div className="absolute bottom-[-10px] left-[-10px] w-16 h-16 rounded-full opacity-10"
                 style={{ background: 'white' }} />
          </Link>
        </section>

        {/* Cognitive snapshot (mini overview) */}
        <section className="card p-5 animate-fade-in-up stagger-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold" style={{ color: 'var(--color-text)' }}>
              にんちプロフィール
            </h3>
            <Link href="/reports" className="text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                  style={{ background: 'var(--color-primary-bg)', color: 'var(--color-primary-dark)' }}>
              くわしく見る
            </Link>
          </div>
          <div className="space-y-3">
            {mockCognitiveSnapshot.map((item) => {
              const domain = COGNITIVE_DOMAINS.find(d => d.key === item.key);
              if (!domain) return null;
              return (
                <div key={item.key} className="flex items-center gap-3">
                  <span className="w-7 flex items-center justify-center">
                    <DomainIcon domain={domain.key as CognitiveDomain} size={20} style={{ color: domain.color }} />
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                        {domain.label}
                      </span>
                      <span className="text-xs font-bold" style={{ color: domain.color }}>
                        {item.score}%
                      </span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-bar-fill"
                           style={{ width: `${item.score}%`, background: domain.color }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Recent activity */}
        <section className="card p-5 animate-fade-in-up stagger-3">
          <h3 className="text-base font-bold mb-3" style={{ color: 'var(--color-text)' }}>
            さいきんのかつどう
          </h3>
          {mockChild.recent_sessions > 0 ? (
            <div className="flex items-center gap-3 p-3 rounded-xl"
                 style={{ background: 'var(--color-success-bg)' }}>
              <SparkleIcon size={28} style={{ color: 'var(--color-warning)' }} />
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                今週 <strong style={{ color: 'var(--color-primary-dark)' }}>{mockChild.recent_sessions}回</strong> ゲームに取り組みました
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-3 rounded-xl"
                 style={{ background: 'var(--color-bg-warm)' }}>
              <SeedlingIcon size={28} style={{ color: 'var(--color-primary)' }} />
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                まだ記録がありません。ゲームをはじめましょう！
              </p>
            </div>
          )}
        </section>

        {/* Games overview */}
        <section className="card p-5 animate-fade-in-up stagger-4">
          <h3 className="text-base font-bold mb-3" style={{ color: 'var(--color-text)' }}>
            ゲーム一覧
          </h3>
          <div className="space-y-1">
            {GAME_LIST.map((game) => (
              <Link key={game.id} href={`/play/${game.id}`}
                    className="flex items-center gap-3 p-3 rounded-xl transition-colors"
                    style={{ ':hover': { background: 'var(--color-surface-hover)' } } as React.CSSProperties}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-surface-hover)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                <DomainIcon domain={game.domain} size={24} style={{ color: 'var(--color-primary)' }} />
                <div>
                  <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                    {game.name}
                  </span>
                  <span className="text-xs ml-2" style={{ color: 'var(--color-text-muted)' }}>
                    {game.description}
                  </span>
                </div>
                <svg className="ml-auto" width="16" height="16" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                     style={{ color: 'var(--color-text-muted)' }}>
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
