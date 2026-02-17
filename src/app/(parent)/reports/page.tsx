'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
  ResponsiveContainer,
} from 'recharts';
import { REPORT_DISCLAIMER, COGNITIVE_DOMAINS, type DomainMeta } from '@/lib/constants';
import type { CognitiveDomain } from '@/types';
import { DomainIcon, SparkleIcon } from '@/components/icons';

/**
 * レポート閲覧画面（保護者向け）
 *
 * 安全設計：
 * - 断定ラベル（「低い」「障害」等）は使用禁止
 * - 免責表示を常に表示
 * - トレンドは「変化あり / 安定 / サポート推奨」の3段階
 * - 他者比較なし（自分比のみ）
 *
 * 可視化設計根拠：
 * - レーダーチャートで全体プロフィールを一目で把握 (Tufte, 2001)
 * - 個別ドメインはプログレスバー + ゲージで直感的理解
 * - 色は認知ドメインごとに固有色で一貫性を保持
 */

// Mock data for 15 cognitive domains
const mockDomainScores: Record<CognitiveDomain, {
  score: number;
  trend: 'improving' | 'stable' | 'needs_support';
  description: string;
}> = {
  attention:              { score: 72, trend: 'improving',     description: '集中の持続時間が伸びています。' },
  inhibition:            { score: 65, trend: 'stable',        description: '安定して取り組めています。' },
  working_memory:        { score: 78, trend: 'improving',     description: '記憶のステップ数が増えています。' },
  memory:                { score: 70, trend: 'stable',        description: '安定して取り組めています。' },
  processing_speed:      { score: 60, trend: 'needs_support', description: 'ゆっくり丁寧に取り組んでいます。' },
  cognitive_flexibility: { score: 68, trend: 'improving',     description: '切り替えが上手になっています。' },
  planning:              { score: 55, trend: 'stable',        description: '自分のペースで取り組んでいます。' },
  reasoning:             { score: 62, trend: 'stable',        description: '安定して取り組めています。' },
  problem_solving:       { score: 58, trend: 'needs_support', description: 'サポートがあるとスムーズです。' },
  visuospatial:          { score: 75, trend: 'improving',     description: '形の認識力が向上しています。' },
  perceptual:            { score: 66, trend: 'stable',        description: '安定して取り組めています。' },
  language:              { score: 50, trend: 'needs_support', description: '楽しみながら少しずつ伸びています。' },
  social_cognition:      { score: 45, trend: 'stable',        description: '自分のペースで成長しています。' },
  emotion_regulation:    { score: 63, trend: 'improving',     description: '落ち着いて取り組めるようになっています。' },
  motor_skills:          { score: 71, trend: 'stable',        description: '安定して取り組めています。' },
};

// Circular gauge component
function CircularGauge({ score, color, size = 64 }: { score: number; color: string; size?: number }) {
  const strokeWidth = 5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        cx={size / 2} cy={size / 2} r={radius}
        fill="none" stroke="var(--color-border-light)" strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2} cy={size / 2} r={radius}
        className="gauge-ring"
        stroke={color} strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
      />
    </svg>
  );
}

// Trend badge component
function TrendBadge({ trend }: { trend: string }) {
  const config = {
    improving:     { bg: 'var(--color-success-bg)', color: 'var(--color-success)', label: '変化あり' },
    needs_support: { bg: 'var(--color-warning-bg)', color: 'var(--color-warning)', label: 'サポート推奨' },
    stable:        { bg: 'var(--color-border-light)', color: 'var(--color-text-muted)', label: '安定' },
  }[trend] || { bg: 'var(--color-border-light)', color: 'var(--color-text-muted)', label: '安定' };

  return (
    <span className="text-xs px-2.5 py-1 rounded-full font-medium"
          style={{ background: config.bg, color: config.color }}>
      {config.label}
    </span>
  );
}

// Domain category groups for organized display
const DOMAIN_CATEGORIES = [
  {
    title: '注意・実行機能',
    keys: ['attention', 'inhibition', 'working_memory', 'cognitive_flexibility', 'planning'] as CognitiveDomain[],
  },
  {
    title: '記憶・処理',
    keys: ['memory', 'processing_speed', 'reasoning', 'problem_solving'] as CognitiveDomain[],
  },
  {
    title: '知覚・運動',
    keys: ['visuospatial', 'perceptual', 'motor_skills'] as CognitiveDomain[],
  },
  {
    title: 'コミュニケーション・社会性',
    keys: ['language', 'social_cognition', 'emotion_regulation'] as CognitiveDomain[],
  },
];

export default function ReportsPage() {
  const [expandedCategory, setExpandedCategory] = useState<number | null>(0);

  // Prepare radar chart data
  const radarData = COGNITIVE_DOMAINS.map(d => ({
    domain: d.labelKana,
    fullName: d.label,
    score: mockDomainScores[d.key]?.score || 0,
  }));

  const mockReport = {
    period: '2024年1月 第2週',
    summary: '安定して取り組めています。注意力とワーキングメモリに良い変化が見られます。',
    recommendations: [
      '引き続き楽しみながら取り組みましょう。',
      '処理速度を伸ばすゲームを少し多めにプレイしてみましょう。',
      'お子さまのペースを大切に、無理のない範囲で続けてください。',
    ],
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg)' }}>
      <header className="sticky top-0 z-10 backdrop-blur-md"
              style={{ background: 'rgba(254, 249, 240, 0.9)', borderBottom: '1px solid var(--color-border-light)' }}>
        <div className="max-w-lg mx-auto flex items-center gap-4 px-4 py-3">
          <Link href="/dashboard"
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: 'var(--color-border-light)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                 strokeLinecap="round" style={{ color: 'var(--color-text-secondary)' }}>
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </Link>
          <h1 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>レポート</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto p-4 space-y-4">
        {/* Disclaimer - always visible */}
        <div className="flex items-start gap-2.5 p-3.5 rounded-xl animate-fade-in"
             style={{ background: 'var(--color-info-bg)' }}>
          <span className="text-sm mt-0.5">&#9432;</span>
          <p className="text-xs leading-relaxed" style={{ color: '#4A90D9' }}>
            {REPORT_DISCLAIMER}
          </p>
        </div>

        {/* Report period + summary */}
        <section className="card p-5 animate-fade-in-up">
          <h2 className="text-base font-bold mb-1" style={{ color: 'var(--color-text)' }}>
            {mockReport.period}
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
            {mockReport.summary}
          </p>
        </section>

        {/* Radar Chart - Overall cognitive profile */}
        <section className="card p-5 animate-fade-in-up stagger-1">
          <h3 className="text-base font-bold mb-4" style={{ color: 'var(--color-text)' }}>
            にんちプロフィール（全体）
          </h3>
          <div className="flex justify-center">
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                <PolarGrid stroke="var(--color-border-light)" />
                <PolarAngleAxis
                  dataKey="domain"
                  tick={{ fontSize: 16 }}
                />
                <Radar
                  name="スコア"
                  dataKey="score"
                  stroke="#4AADA4"
                  fill="#4AADA4"
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-center mt-2" style={{ color: 'var(--color-text-muted)' }}>
            各アイコンが認知機能の領域を表しています
          </p>
        </section>

        {/* Domain categories with expandable sections */}
        {DOMAIN_CATEGORIES.map((category, catIndex) => (
          <section key={category.title} className={`card animate-fade-in-up stagger-${Math.min(catIndex + 2, 6)}`}>
            {/* Category header - clickable to expand/collapse */}
            <button
              onClick={() => setExpandedCategory(expandedCategory === catIndex ? null : catIndex)}
              className="w-full flex items-center justify-between p-5 text-left"
            >
              <h3 className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>
                {category.title}
              </h3>
              <div className="flex items-center gap-2">
                {/* Mini gauge indicators */}
                <div className="flex -space-x-1">
                  {category.keys.slice(0, 3).map(key => {
                    const domain = COGNITIVE_DOMAINS.find(d => d.key === key) as DomainMeta;
                    return (
                      <span key={key} className="flex items-center">
                        <DomainIcon domain={domain.key} size={16} style={{ color: domain.color }} />
                      </span>
                    );
                  })}
                  {category.keys.length > 3 && (
                    <span className="text-xs pl-1" style={{ color: 'var(--color-text-muted)' }}>
                      +{category.keys.length - 3}
                    </span>
                  )}
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                     strokeWidth="2" strokeLinecap="round"
                     style={{
                       color: 'var(--color-text-muted)',
                       transform: expandedCategory === catIndex ? 'rotate(180deg)' : 'rotate(0deg)',
                       transition: 'transform 0.2s ease',
                     }}>
                  <path d="M6 9l6 6 6-6"/>
                </svg>
              </div>
            </button>

            {/* Expanded domain details */}
            {expandedCategory === catIndex && (
              <div className="px-5 pb-5 space-y-4">
                {category.keys.map(key => {
                  const domain = COGNITIVE_DOMAINS.find(d => d.key === key) as DomainMeta;
                  const data = mockDomainScores[key];
                  if (!domain || !data) return null;

                  return (
                    <div key={key} className="flex items-start gap-3 p-3 rounded-xl animate-fade-in"
                         style={{ background: 'var(--color-bg)' }}>
                      {/* Circular gauge */}
                      <div className="relative flex-shrink-0">
                        <CircularGauge score={data.score} color={domain.color} />
                        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold"
                              style={{ color: 'var(--color-text)' }}>
                          {data.score}
                        </span>
                      </div>

                      {/* Domain info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <DomainIcon domain={domain.key} size={18} style={{ color: domain.color }} />
                          <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                            {domain.label}
                          </span>
                          <TrendBadge trend={data.trend} />
                        </div>
                        <p className="text-xs mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                          {data.description}
                        </p>
                        {/* Progress bar */}
                        <div className="progress-bar">
                          <div className="progress-bar-fill"
                               style={{ width: `${data.score}%`, background: domain.color }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        ))}

        {/* Recommendations */}
        <section className="card p-5 animate-fade-in-up stagger-6">
          <div className="flex items-center gap-2 mb-3">
            <SparkleIcon size={20} style={{ color: 'var(--color-warning)' }} />
            <h3 className="text-base font-bold" style={{ color: 'var(--color-text)' }}>
              おすすめ
            </h3>
          </div>
          <ul className="space-y-2.5">
            {mockReport.recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm"
                  style={{ color: 'var(--color-text-secondary)' }}>
                <span className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                      style={{ background: 'var(--color-primary-bg)', color: 'var(--color-primary-dark)' }}>
                  {i + 1}
                </span>
                <span className="leading-relaxed">{rec}</span>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
