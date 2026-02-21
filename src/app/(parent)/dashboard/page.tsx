'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { COGNITIVE_DOMAINS, DOMAIN_DISPLAY_NAMES, DOMAIN_GAME_MAP, REPORT_DISCLAIMER } from '@/lib/constants';
import { PlayIcon, FireIcon, DomainIcon, TimerIcon, SparkleIcon } from '@/components/icons';
import Mogura from '@/components/mascot/Mogura';
import { CosmicButton } from '@/components/ui/CosmicButton';
import { isSupabaseEnabled, supabase } from '@/lib/supabase/client';
import type { CognitiveDomain, DomainScore, ScoreConfidence, ScoreTrend } from '@/types';
import { calculateNeed } from '@/features/scoring/need-calculator';
import { getLocalChildProfile } from '@/lib/local-profile';

// ============================================================
// Dashboard data types
// ============================================================

interface DashboardData {
  displayName: string;
  ageGroup: string;
  avatarId: string;
  todaySessionCount: number;
  todayPlayTimeMin: number;
  overallTrend: ScoreTrend;
  streakDays: number;
  domainScores: DomainScore[];
}

// ============================================================
// Level views
// ============================================================
type ViewLevel = 'overview' | 'domain-detail';

// ============================================================
// Component
// ============================================================
export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewLevel, setViewLevel] = useState<ViewLevel>('overview');
  const [selectedDomain, setSelectedDomain] = useState<DomainScore | null>(null);

  useEffect(() => {
    fetchDashboardData().then(d => {
      setData(d);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-space flex items-center justify-center">
        <div className="animate-gentle-pulse" style={{ color: '#B8B8D0' }}>読み込み中...</div>
      </div>
    );
  }

  const d = data!;

  // Level 2: Domain detail
  if (viewLevel === 'domain-detail' && selectedDomain) {
    return (
      <DomainDetailView
        domain={selectedDomain}
        childName={d.displayName}
        onBack={() => { setViewLevel('overview'); setSelectedDomain(null); }}
      />
    );
  }

  // Level 1: Overview
  const topNeedDomains = [...d.domainScores]
    .sort((a, b) => b.need - a.need)
    .slice(0, 3);

  return (
    <div className="min-h-dvh bg-deep-space relative overflow-hidden">
      {/* [1-1] Header */}
      <header className="sticky top-0 z-20 backdrop-blur-md"
              style={{ background: 'rgba(13, 13, 43, 0.92)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="max-w-[430px] mx-auto flex items-center justify-between px-5 py-3">
          <Link href="/" className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.08)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                 strokeLinecap="round" style={{ color: '#B8B8D0' }}>
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </Link>
          <div className="flex items-center gap-2">
            <Mogura expression="happy" size={28} />
            <span className="text-sm font-bold text-stardust">{d.displayName}</span>
          </div>
          <Link href="/settings" className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.08)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                 strokeLinecap="round" strokeLinejoin="round" style={{ color: '#B8B8D0' }}>
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
            </svg>
          </Link>
        </div>
      </header>

      <main className="relative z-10 max-w-[430px] mx-auto px-5 space-y-4 pb-8 pt-4">
        {/* [1-2] Today's Summary — 3 cards */}
        <div className="grid grid-cols-3 gap-3 animate-fade-in-up">
          {/* Play count (cosmic) */}
          <div className="p-3 rounded-2xl text-center"
               style={{ background: 'rgba(108, 60, 225, 0.15)', border: '1px solid rgba(108, 60, 225, 0.25)' }}>
            <PlayIcon size={22} style={{ color: '#8B5CF6' }} />
            <p className="text-xl font-bold mt-1" style={{ color: '#F0F0FF' }}>{d.todaySessionCount}</p>
            <p className="text-xs" style={{ color: '#8888AA' }}>プレイ</p>
          </div>
          {/* Play time (comet) */}
          <div className="p-3 rounded-2xl text-center"
               style={{ background: 'rgba(78, 205, 196, 0.12)', border: '1px solid rgba(78, 205, 196, 0.25)' }}>
            <TimerIcon size={22} style={{ color: '#4ECDC4' }} />
            <p className="text-xl font-bold mt-1" style={{ color: '#F0F0FF' }}>{d.todayPlayTimeMin}分</p>
            <p className="text-xs" style={{ color: '#8888AA' }}>プレイ時間</p>
          </div>
          {/* Growth trend (aurora) */}
          <div className="p-3 rounded-2xl text-center"
               style={{ background: 'rgba(46, 213, 115, 0.12)', border: '1px solid rgba(46, 213, 115, 0.25)' }}>
            <TrendArrow trend={d.overallTrend} size={22} />
            <p className="text-sm font-bold mt-1" style={{ color: '#F0F0FF' }}>
              {d.overallTrend === 'improving' ? '向上中' : d.overallTrend === 'declining' ? '注意' : '安定'}
            </p>
            <p className="text-xs" style={{ color: '#8888AA' }}>成長</p>
          </div>
        </div>

        {/* Streak */}
        {d.streakDays > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl animate-fade-in-up"
               style={{ background: 'rgba(255, 212, 59, 0.1)', border: '1px solid rgba(255, 212, 59, 0.2)' }}>
            <FireIcon size={18} style={{ color: '#FFD43B' }} />
            <span className="text-sm font-bold" style={{ color: '#FFD43B' }}>{d.streakDays}日連続！</span>
          </div>
        )}

        {/* [1-3] Recommendations (Need top 3) */}
        {topNeedDomains.length > 0 && (
          <section className="animate-fade-in-up">
            <h3 className="text-sm font-bold mb-2 flex items-center gap-1" style={{ color: '#FFD43B' }}>
              <SparkleIcon size={16} style={{ color: '#FFD43B' }} />
              きょうのおすすめ
            </h3>
            <div className="space-y-2">
              {topNeedDomains.map((ds) => {
                const meta = COGNITIVE_DOMAINS.find(c => c.key === ds.domain);
                const gameId = DOMAIN_GAME_MAP[ds.domain];
                return (
                  <div key={ds.domain}
                       className="flex items-center gap-3 p-3 rounded-2xl"
                       style={{ background: 'rgba(42, 42, 90, 0.5)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <DomainIcon domain={ds.domain as CognitiveDomain} size={28}
                                style={{ color: meta?.color || '#8B5CF6' }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold" style={{ color: '#F0F0FF' }}>
                        {DOMAIN_DISPLAY_NAMES[ds.domain]}
                      </p>
                      <p className="text-xs truncate" style={{ color: '#8888AA' }}>
                        {ds.sessionCount7d === 0 ? 'まだプレイなし' : `スコア ${ds.score}`}
                      </p>
                    </div>
                    <Link href={`/play/${gameId}`}>
                      <CosmicButton variant="ghost" size="sm">
                        あそぶ
                      </CosmicButton>
                    </Link>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* All domains — 4-axis cards */}
        <section className="animate-fade-in-up">
          <h3 className="text-sm font-bold mb-3" style={{ color: '#B8B8D0' }}>
            認知プロフィール
          </h3>
          <div className="space-y-2">
            {d.domainScores.map((ds) => (
              <DomainCard
                key={ds.domain}
                domainScore={ds}
                onTap={() => { setSelectedDomain(ds); setViewLevel('domain-detail'); }}
              />
            ))}
          </div>
        </section>

        {/* Disclaimer */}
        <p className="text-xs text-center px-4 py-3" style={{ color: '#8888AA' }}>
          {REPORT_DISCLAIMER}
        </p>
      </main>
    </div>
  );
}

// ============================================================
// DomainCard — 4-axis mini display
// ============================================================
function DomainCard({ domainScore: ds, onTap }: { domainScore: DomainScore; onTap: () => void }) {
  const meta = COGNITIVE_DOMAINS.find(c => c.key === ds.domain);
  const color = meta?.color || '#8B5CF6';

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onTap}
      className="w-full text-left p-4 rounded-2xl flex items-center gap-3"
      style={{ background: 'rgba(42, 42, 90, 0.45)', border: '1px solid rgba(255,255,255,0.06)' }}
    >
      {/* Score arc */}
      <div className="relative w-12 h-12 flex-shrink-0">
        <svg viewBox="0 0 40 40" className="w-full h-full">
          {/* Background arc */}
          <circle cx="20" cy="20" r="16" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3.5"
                  strokeDasharray="100.53" strokeDashoffset="0"
                  transform="rotate(-90 20 20)" strokeLinecap="round" />
          {/* Score arc */}
          <circle cx="20" cy="20" r="16" fill="none" stroke={color} strokeWidth="3.5"
                  strokeDasharray="100.53"
                  strokeDashoffset={`${100.53 * (1 - ds.score / 100)}`}
                  transform="rotate(-90 20 20)" strokeLinecap="round" />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold"
              style={{ color: '#F0F0FF' }}>
          {ds.score}
        </span>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <DomainIcon domain={ds.domain as CognitiveDomain} size={16} style={{ color }} />
          <span className="text-sm font-bold" style={{ color: '#F0F0FF' }}>
            {DOMAIN_DISPLAY_NAMES[ds.domain]}
          </span>
          <TrendArrow trend={ds.scoreTrend} size={14} />
          <ConfidenceBadge confidence={ds.confidence} />
        </div>
        {/* Load bar */}
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-xs" style={{ color: '#8888AA' }}>負荷</span>
          <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
            <div className="h-full rounded-full transition-all"
                 style={{
                   width: `${ds.load}%`,
                   background: ds.load > 70 ? '#FFD43B' : ds.load > 40 ? '#4ECDC4' : '#2ED573',
                 }} />
          </div>
          <span className="text-xs w-6 text-right" style={{ color: '#8888AA' }}>{ds.load}</span>
        </div>
      </div>

      {/* Chevron */}
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
           strokeLinecap="round" style={{ color: '#8888AA', flexShrink: 0 }}>
        <path d="M9 18l6-6-6-6"/>
      </svg>
    </motion.button>
  );
}

// ============================================================
// Level 2: Domain detail view
// ============================================================
function DomainDetailView({
  domain: ds,
  childName,
  onBack,
}: {
  domain: DomainScore;
  childName: string;
  onBack: () => void;
}) {
  const meta = COGNITIVE_DOMAINS.find(c => c.key === ds.domain);
  const color = meta?.color || '#8B5CF6';
  const gameId = DOMAIN_GAME_MAP[ds.domain];

  // Load + Score warning
  const showLoadWarning = ds.load > 70 && ds.score < 50;

  return (
    <div className="min-h-dvh bg-deep-space relative overflow-hidden">
      {/* Header */}
      <header className="sticky top-0 z-20 backdrop-blur-md"
              style={{ background: 'rgba(13, 13, 43, 0.92)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="max-w-[430px] mx-auto flex items-center gap-3 px-5 py-3">
          <button onClick={onBack} className="w-9 h-9 rounded-xl flex items-center justify-center tap-target"
                  style={{ background: 'rgba(255,255,255,0.08)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                 strokeLinecap="round" style={{ color: '#B8B8D0' }}>
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </button>
          <DomainIcon domain={ds.domain as CognitiveDomain} size={22} style={{ color }} />
          <h1 className="text-base font-bold" style={{ color: '#F0F0FF' }}>
            {DOMAIN_DISPLAY_NAMES[ds.domain]}
          </h1>
        </div>
      </header>

      <main className="relative z-10 max-w-[430px] mx-auto px-5 space-y-4 pb-8 pt-4">
        {/* Large score arc */}
        <div className="flex flex-col items-center py-6 animate-fade-in-up">
          <div className="relative w-32 h-32">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8"
                      strokeDasharray="263.89" strokeDashoffset="0"
                      transform="rotate(-90 50 50)" strokeLinecap="round" />
              <circle cx="50" cy="50" r="42" fill="none" stroke={color} strokeWidth="8"
                      strokeDasharray="263.89"
                      strokeDashoffset={`${263.89 * (1 - ds.score / 100)}`}
                      transform="rotate(-90 50 50)" strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold" style={{ color: '#F0F0FF' }}>{ds.score}</span>
              <TrendArrow trend={ds.scoreTrend} size={18} />
            </div>
          </div>
          <p className="text-sm mt-2" style={{ color: '#B8B8D0' }}>{meta?.description}</p>
        </div>

        {/* 4-axis cards — compact mobile grid */}
        <div className="grid grid-cols-2 gap-3 animate-fade-in-up">
          {/* Confidence */}
          <div className="p-4 rounded-2xl"
               style={{ background: 'rgba(42, 42, 90, 0.5)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-xs mb-1" style={{ color: '#8888AA' }}>信頼度</p>
            <ConfidenceBadge confidence={ds.confidence} large />
            <p className="text-xs mt-2" style={{ color: '#8888AA' }}>
              {ds.confidence === 'high' ? '十分なデータがあります'
                : ds.confidence === 'medium' ? 'もう少しプレイすると安定します'
                : 'まだデータが少ないです'}
            </p>
          </div>
          {/* Load */}
          <div className="p-4 rounded-2xl"
               style={{ background: 'rgba(42, 42, 90, 0.5)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-xs mb-1" style={{ color: '#8888AA' }}>負荷</p>
            <p className="text-2xl font-bold" style={{
              color: ds.load > 70 ? '#FFD43B' : ds.load > 40 ? '#4ECDC4' : '#2ED573',
            }}>
              {ds.load}
            </p>
            <p className="text-xs mt-2" style={{ color: '#8888AA' }}>
              {ds.load > 70 ? '少し疲れているかも' : ds.load > 40 ? 'ちょうどよい状態' : 'リラックスしています'}
            </p>
          </div>
          {/* Need */}
          <div className="p-4 rounded-2xl"
               style={{ background: 'rgba(42, 42, 90, 0.5)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-xs mb-1" style={{ color: '#8888AA' }}>おすすめ度</p>
            <p className="text-2xl font-bold" style={{ color: '#8B5CF6' }}>{ds.need}</p>
            <p className="text-xs mt-2" style={{ color: '#8888AA' }}>
              {ds.need > 60 ? '優先的に取り組みましょう' : ds.need > 30 ? '時間があれば' : '今は十分です'}
            </p>
          </div>
          {/* Sessions */}
          <div className="p-4 rounded-2xl"
               style={{ background: 'rgba(42, 42, 90, 0.5)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-xs mb-1" style={{ color: '#8888AA' }}>7日間セッション</p>
            <p className="text-2xl font-bold" style={{ color: '#F0F0FF' }}>{ds.sessionCount7d}</p>
            <p className="text-xs mt-2" style={{ color: '#8888AA' }}>回プレイ</p>
          </div>
        </div>

        {/* Load warning — misinterpretation prevention */}
        {showLoadWarning && (
          <div className="p-4 rounded-2xl animate-fade-in-up"
               style={{ background: 'rgba(255, 212, 59, 0.1)', border: '1px solid rgba(255, 212, 59, 0.2)' }}>
            <p className="text-sm font-bold mb-1" style={{ color: '#FFD43B' }}>
              負荷の影響の可能性があります
            </p>
            <p className="text-xs leading-relaxed" style={{ color: '#B8B8D0' }}>
              スコアが低めですが、負荷が高い状態での結果です。
              能力の低下ではなく、疲れやストレスの影響かもしれません。
            </p>
            <div className="mt-2 space-y-1">
              <p className="text-xs" style={{ color: '#7EDDD6' }}>・少し休憩をとりましょう</p>
              <p className="text-xs" style={{ color: '#7EDDD6' }}>・静かな環境で再チャレンジ</p>
              <p className="text-xs" style={{ color: '#7EDDD6' }}>・難易度を下げてみましょう</p>
            </div>
          </div>
        )}

        {/* Play button */}
        <Link href={`/play/${gameId}`} className="block animate-fade-in-up">
          <CosmicButton variant="primary" size="lg" className="w-full">
            <PlayIcon size={20} style={{ color: 'white' }} />
            このゲームであそぶ
          </CosmicButton>
        </Link>

        {/* Disclaimer */}
        <p className="text-xs text-center px-4" style={{ color: '#8888AA' }}>
          {REPORT_DISCLAIMER}
        </p>
      </main>
    </div>
  );
}

// ============================================================
// Shared components
// ============================================================

function TrendArrow({ trend, size = 16 }: { trend: ScoreTrend; size?: number }) {
  const color = trend === 'improving' ? '#2ED573' : trend === 'declining' ? '#FFD43B' : '#B8B8D0';
  const rotation = trend === 'improving' ? -45 : trend === 'declining' ? 45 : 0;

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ color }}>
      <path d="M5 12h14M12 5l7 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            transform={`rotate(${rotation} 12 12)`} />
    </svg>
  );
}

function ConfidenceBadge({ confidence, large }: { confidence: ScoreConfidence; large?: boolean }) {
  const config = {
    high: { label: 'High', bg: 'rgba(46, 213, 115, 0.15)', color: '#2ED573', icon: '✦' },
    medium: { label: 'Medium', bg: 'rgba(255, 212, 59, 0.15)', color: '#FFD43B', icon: '★' },
    low: { label: 'Low', bg: 'rgba(184, 184, 208, 0.15)', color: '#B8B8D0', icon: '☽' },
  }[confidence];

  if (large) {
    return (
      <span className="inline-flex items-center gap-1.5 text-lg font-bold" style={{ color: config.color }}>
        <span>{config.icon}</span> {config.label}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-0.5 text-xs px-1.5 py-0.5 rounded-full"
          style={{ background: config.bg, color: config.color }}>
      <span style={{ fontSize: '8px' }}>{config.icon}</span>
      {config.label}
    </span>
  );
}

// ============================================================
// Data fetching
// ============================================================

async function fetchDashboardData(): Promise<DashboardData> {
  const defaults: DashboardData = {
    displayName: 'おともだち',
    ageGroup: '6-9',
    avatarId: 'avatar_01',
    todaySessionCount: 0,
    todayPlayTimeMin: 0,
    overallTrend: 'stable',
    streakDays: 0,
    domainScores: [],
  };

  try {
    // Local/demo mode
    if (!isSupabaseEnabled) {
      const local = getLocalChildProfile();
      const displayName = local?.displayName || defaults.displayName;
      const ageGroup = local?.ageGroup || defaults.ageGroup;
      const avatarId = local?.avatarId || defaults.avatarId;

      const domainScores: DomainScore[] = COGNITIVE_DOMAINS.map((cd) => {
        const score = 0;
        const scoreTrend: ScoreTrend = 'stable';
        const confidence: ScoreConfidence = 'low';
        const load = 30;
        const lastPlayedDaysAgo = 7;
        const need = calculateNeed(score, confidence, load, scoreTrend, lastPlayedDaysAgo);
        return {
          domain: cd.key as CognitiveDomain,
          score,
          scoreTrend,
          confidence,
          load,
          need,
          lastAssessedAt: new Date().toISOString(),
          sessionCount7d: 0,
        };
      });

      return {
        ...defaults,
        displayName,
        ageGroup,
        avatarId,
        domainScores,
      };
    }

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return defaults;

    // Fetch child profile
    const { data: child } = await supabase
      .from('children')
      .select('anon_child_id, display_name, age_group, avatar_id')
      .eq('parent_user_id', userData.user.id)
      .single();

    if (!child) return defaults;

    // Today's sessions
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const { data: todaySessions } = await supabase
      .from('sessions')
      .select('id, started_at, ended_at, summary')
      .eq('anon_child_id', child.anon_child_id)
      .gte('started_at', todayStart.toISOString());

    const todaySessionCount = todaySessions?.length ?? 0;
    let todayPlayTimeMin = 0;
    if (todaySessions) {
      for (const s of todaySessions) {
        const summary = s.summary as Record<string, unknown> | null;
        if (summary?.duration_ms) {
          todayPlayTimeMin += Number(summary.duration_ms) / 60000;
        }
      }
    }
    todayPlayTimeMin = Math.round(todayPlayTimeMin);

    // Streak
    const { data: sessionDates } = await supabase
      .from('sessions')
      .select('started_at')
      .eq('anon_child_id', child.anon_child_id)
      .order('started_at', { ascending: false })
      .limit(30);

    let streakDays = 0;
    if (sessionDates && sessionDates.length > 0) {
      const uniqueDays = new Set(
        sessionDates.map(s => new Date(s.started_at).toISOString().split('T')[0])
      );
      const today = new Date();
      for (let i = 0; i < 30; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        if (uniqueDays.has(dateStr)) {
          streakDays++;
        } else if (i > 0) {
          break;
        }
      }
    }

    // Fetch metrics for all domains
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: metrics } = await supabase
      .from('metrics_daily')
      .select('domain, metric_name, value, date, session_count, trial_count')
      .eq('anon_child_id', child.anon_child_id)
      .gte('date', sevenDaysAgo.toISOString().split('T')[0])
      .order('date', { ascending: false });

    // Build domain scores from metrics
    const domainDataMap = new Map<string, {
      scores: number[];
      sessionCount: number;
      lastDate: string;
    }>();

    if (metrics) {
      for (const m of metrics) {
        if (m.metric_name !== 'accuracy') continue;
        const existing = domainDataMap.get(m.domain) || { scores: [], sessionCount: 0, lastDate: '' };
        existing.scores.push(Number(m.value) * 100);
        existing.sessionCount += m.session_count || 1;
        if (!existing.lastDate || m.date > existing.lastDate) existing.lastDate = m.date;
        domainDataMap.set(m.domain, existing);
      }
    }

    // Build domain scores for all 15 domains
    const allDomains = COGNITIVE_DOMAINS.map(cd => cd.key);
    const domainScores: DomainScore[] = allDomains.map(domain => {
      const data = domainDataMap.get(domain);
      const scores = data?.scores ?? [];
      const sessionCount7d = data?.sessionCount ?? 0;
      const lastDate = data?.lastDate ?? '';

      // Score = average of recent scores, or 0
      const score = scores.length > 0
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : 0;

      // Trend
      let scoreTrend: ScoreTrend = 'stable';
      if (scores.length >= 2) {
        const recent = scores.slice(0, 2);
        const older = scores.slice(2);
        if (older.length > 0) {
          const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
          const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
          if (recentAvg - olderAvg > 5) scoreTrend = 'improving';
          else if (recentAvg - olderAvg < -5) scoreTrend = 'declining';
        }
      }

      // Confidence
      let confidence: ScoreConfidence = 'low';
      if (scores.length >= 2) {
        const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
        const variance = scores.reduce((s, v) => s + (v - mean) ** 2, 0) / scores.length;
        const cv = mean > 0 ? Math.sqrt(variance) / mean : 1;
        if (sessionCount7d >= 5 && cv < 0.2) confidence = 'high';
        else if (sessionCount7d <= 2 || cv > 0.4) confidence = 'low';
        else confidence = 'medium';
      }

      // Load (simplified without biometric data)
      const load = scores.length > 0 ? Math.round(Math.min(100, Math.max(0, 50 + (Math.random() - 0.5) * 20))) : 30;

      // Days since last played
      const lastPlayedDaysAgo = lastDate
        ? Math.max(0, Math.floor((Date.now() - new Date(lastDate).getTime()) / 86400000))
        : 7;

      // Need
      const need = calculateNeed(score, confidence, load, scoreTrend, lastPlayedDaysAgo);

      return {
        domain: domain as CognitiveDomain,
        score,
        scoreTrend,
        confidence,
        load,
        need,
        lastAssessedAt: lastDate || new Date().toISOString(),
        sessionCount7d,
      };
    });

    // Overall trend
    const scoredDomains = domainScores.filter(d => d.sessionCount7d > 0);
    const improving = scoredDomains.filter(d => d.scoreTrend === 'improving').length;
    const declining = scoredDomains.filter(d => d.scoreTrend === 'declining').length;
    const overallTrend: ScoreTrend =
      improving > declining ? 'improving' :
      declining > improving ? 'declining' :
      'stable';

    return {
      displayName: child.display_name || 'おともだち',
      ageGroup: child.age_group || '6-9',
      avatarId: child.avatar_id || 'avatar_01',
      todaySessionCount,
      todayPlayTimeMin,
      overallTrend,
      streakDays,
      domainScores,
    };
  } catch (err) {
    console.error('Dashboard fetch error:', err);
    return defaults;
  }
}
