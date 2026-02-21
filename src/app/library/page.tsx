'use client';

import React, { useState, useEffect } from 'react';
import { GAME_LIST } from '@/games';
import { useChildProfile } from '@/hooks/useChildProfile';
import { getRecentSessions, type RecentSessionRow } from '@/lib/supabase/game-persistence';
import type { GameId } from '@/types';

const GAME_DISPLAY_NAMES: Record<string, string> = Object.fromEntries(
  GAME_LIST.map((g) => [g.id, g.name]),
);

function formatSessionDate(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const isToday =
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear();
  if (isToday) return 'きょう';
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday =
    d.getDate() === yesterday.getDate() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getFullYear() === yesterday.getFullYear();
  if (isYesterday) return 'きのう';
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function SessionItem({ session }: { session: RecentSessionRow }) {
  const name = GAME_DISPLAY_NAMES[session.game_id as GameId] ?? session.game_id;
  const completed = session.end_reason === 'completed';
  const totalTrials = session.summary && typeof session.summary.trial_count === 'number'
    ? session.summary.trial_count
    : null;
  const totalCorrect = session.summary && typeof session.summary.correct_count === 'number'
    ? session.summary.correct_count
    : null;

  return (
    <li
      className="flex items-center justify-between py-3 px-4 rounded-xl border border-galaxy-light"
      style={{ background: 'rgba(255,255,255,0.06)' }}
    >
      <div>
        <span className="text-base font-medium text-stardust">{name}</span>
        <span className="ml-2 text-sm text-moon">{formatSessionDate(session.started_at)}</span>
      </div>
      {totalTrials != null && totalCorrect != null && (
        <span className="text-sm text-moon">
          {totalCorrect}/{totalTrials} せいかい
        </span>
      )}
      {completed && totalTrials == null && (
        <span className="text-xs text-moon">おわったよ</span>
      )}
    </li>
  );
}

export default function LibraryPage() {
  const { child, loading: profileLoading } = useChildProfile();
  const [sessions, setSessions] = useState<RecentSessionRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!child) {
      setLoading(false);
      return;
    }
    getRecentSessions(child.anonChildId, 30).then((list) => {
      setSessions(list);
      setLoading(false);
    });
  }, [child]);

  const isLoading = profileLoading || loading;
  const hasSessions = sessions.length > 0;

  return (
    <div
      className="min-h-dvh px-5 pt-14 pb-8"
      style={{
        background: 'var(--color-deep-space)',
      }}
    >
      <h1 className="text-xl font-bold text-stardust">きろく</h1>

      {/* れんしゅうのきろく（レポートに当たる部分） */}
      <section className="mt-6">
        <h2 className="text-sm font-bold text-moon mb-3">れんしゅうのきろく</h2>
        <div
          className="rounded-2xl border border-galaxy-light p-4 min-h-[120px]"
          style={{ background: 'rgba(255,255,255,0.06)' }}
        >
          {isLoading ? (
            <p className="text-sm text-moon">よみ込みちゅう...</p>
          ) : hasSessions ? (
            <ul className="space-y-2">
              {sessions.map((session) => (
                <SessionItem key={session.id} session={session} />
              ))}
            </ul>
          ) : (
            <p className="text-sm text-moon">まだ きろくが ないよ。ゲームで あそぶと きろくが のるよ。</p>
          )}
        </div>
      </section>

      {/* おうちの人向けメモ */}
      <p className="mt-6 text-xs text-moon/80">
        おうちのひとは ダッシュボードで くわしいレポートが みれるよ。
      </p>
    </div>
  );
}
