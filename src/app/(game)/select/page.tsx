'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { GAME_LIST, GAME_CONFIGS } from '@/games';
import { COGNITIVE_DOMAINS } from '@/lib/constants';
import { SpaceMap } from '@/components/map/SpaceMap';
import { StarField } from '@/components/map/StarField';
import { StageMap } from '@/components/stage/StageMap';
import { DomainIcon } from '@/components/icons';
import { ParentalGate } from '@/components/ui/ParentalGate';
import type { CognitiveDomain, MasteryLevel } from '@/types';

/**
 * ゲーム選択画面（子ども向け）
 *
 * 2つのモード:
 * 1. 宇宙マップ: 星系ベースのゲーム選択
 * 2. フリープレイ: ライブラリ風ゲームカードグリッド
 */

type ViewMode = 'space' | 'path' | 'library';

// Demo stage data
function generateDemoStages() {
  const domainGroups: CognitiveDomain[][] = [
    ['attention', 'processing_speed'],
    ['inhibition', 'working_memory'],
    ['visuospatial', 'memory'],
    ['cognitive_flexibility', 'planning'],
    ['reasoning', 'problem_solving'],
    ['perceptual', 'language'],
    ['social_cognition', 'emotion_regulation'],
    ['motor_skills', 'attention'],
    ['working_memory', 'reasoning'],
    ['inhibition', 'planning'],
  ];

  return domainGroups.map((domains, i) => ({
    stageNumber: i + 1,
    domains,
    isUnlocked: i <= 2,
    isCompleted: i === 0,
    isCurrent: i === 1,
    highestMastery: (i === 0 ? 2 : 1) as MasteryLevel,
  }));
}

/** Star system colors for library cards */
const CARD_COLORS = [
  '#6C3CE1', '#4ECDC4', '#FF6B9D', '#FFD43B', '#2ED573',
  '#8B5CF6', '#7EDDD6', '#FF8FB3', '#FFE066', '#4ECDC4',
  '#6C3CE1', '#2ED573', '#FFD43B', '#8B5CF6', '#FF6B9D',
];

export default function GameSelectPage() {
  const [view, setView] = useState<ViewMode>('space');
  const [parentalGateOpen, setParentalGateOpen] = useState(false);
  const stages = useMemo(generateDemoStages, []);
  const currentLevel = stages.find(s => s.isCurrent)?.stageNumber ?? 1;

  // Space map view (default)
  if (view === 'space') {
    return (
      <div className="relative min-h-screen">
        <SpaceMap unlockedSystems={['hikari', 'kangae']} />

        {/* Bottom nav bar */}
        <div className="fixed bottom-0 left-0 right-0 z-20 flex items-center justify-around py-3 px-4"
             style={{
               background: 'linear-gradient(180deg, transparent 0%, rgba(13,13,43,0.95) 30%)',
               paddingBottom: 'env(safe-area-inset-bottom, 16px)',
             }}>
          {/* Stage path */}
          <button
            onClick={() => setView('path')}
            className="flex flex-col items-center gap-1 tap-target"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="#B8B8D0">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
            <span className="text-[10px] font-bold" style={{ color: '#B8B8D0' }}>ステージ</span>
          </button>

          {/* Library */}
          <button
            onClick={() => setView('library')}
            className="flex flex-col items-center gap-1 tap-target"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="#B8B8D0">
              <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H8V4h12v12z"/>
            </svg>
            <span className="text-[10px] font-bold" style={{ color: '#B8B8D0' }}>ライブラリ</span>
          </button>

          {/* Settings (parental gate) */}
          <button
            onClick={() => setParentalGateOpen(true)}
            className="flex flex-col items-center gap-1 tap-target"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="#B8B8D0">
              <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
            </svg>
            <span className="text-[10px] font-bold" style={{ color: '#B8B8D0' }}>せってい</span>
          </button>
        </div>

        <ParentalGate
          isOpen={parentalGateOpen}
          onCancel={() => setParentalGateOpen(false)}
          onUnlock={() => {
            setParentalGateOpen(false);
            window.location.href = '/dashboard';
          }}
        />
      </div>
    );
  }

  // Stage path view
  if (view === 'path') {
    return (
      <StageMap
        stages={stages}
        currentStage={currentLevel}
        onBack={() => setView('space')}
      />
    );
  }

  // Library view: cosmic game cards
  return (
    <div className="min-h-screen bg-space relative">
      <StarField count={60} />

      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-12 pb-4 relative z-10"
           style={{ background: 'rgba(13, 13, 43, 0.8)', backdropFilter: 'blur(8px)' }}>
        <button
          onClick={() => setView('space')}
          className="w-10 h-10 rounded-full flex items-center justify-center tap-interactive"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="#8B5CF6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <h1 className="text-lg font-bold" style={{ color: '#F0F0FF' }}>
          ライブラリ
        </h1>
        <div className="w-10" />
      </div>

      {/* Game card grid */}
      <div className="px-4 py-6 relative z-10">
        <div className="grid grid-cols-3 gap-4">
          {GAME_LIST.map((game, i) => {
            const cfg = GAME_CONFIGS[game.id];
            const cardColor = CARD_COLORS[i % CARD_COLORS.length];

            return (
              <Link
                key={game.id}
                href={`/play/${game.id}`}
                className="flex flex-col items-center tap-interactive active:scale-95"
              >
                {/* Card with colored border */}
                <div className="w-full aspect-square rounded-2xl flex items-center justify-center relative overflow-hidden"
                     style={{
                       background: `linear-gradient(135deg, ${cardColor}33 0%, ${cardColor}66 100%)`,
                       border: `2px solid ${cardColor}88`,
                       boxShadow: `0 4px 12px ${cardColor}22`,
                     }}>
                  <div className="w-[85%] h-[70%] rounded-xl flex items-center justify-center"
                       style={{ background: 'rgba(255,255,255,0.08)' }}>
                    <DomainIcon
                      domain={cfg?.primary_domain ?? 'attention'}
                      size={42}
                      style={{ color: 'white' }}
                    />
                  </div>
                </div>

                {/* Title */}
                <span className="text-xs font-bold text-center mt-2 leading-tight"
                      style={{ color: '#F0F0FF' }}>
                  {game.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Bottom padding */}
      <div className="h-8" />
    </div>
  );
}
