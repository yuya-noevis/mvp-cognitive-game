'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { GAME_LIST, GAME_CONFIGS } from '@/games';
import { COGNITIVE_DOMAINS } from '@/lib/constants';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { WorldScene } from '@/components/stage/WorldScene';
import { StageMap } from '@/components/stage/StageMap';
import { DomainIcon } from '@/components/icons';
import type { CognitiveDomain, MasteryLevel } from '@/types';

/**
 * ゲーム選択画面（子ども向け）
 *
 * 2つのモード:
 * 1. ステージモード: Duolingo ABC風ワールドビュー → ステージパス
 * 2. フリープレイ: ライブラリ風ゲームカードグリッド
 */

type ViewMode = 'world' | 'path' | 'library';

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

/** Colorful card border colors for library view */
const CARD_COLORS = [
  '#E74C3C', '#3498DB', '#FF8EC8', '#FF9600', '#2ECC71',
  '#9B59B6', '#1ABC9C', '#F39C12', '#E74C3C', '#3498DB',
  '#FF8EC8', '#2ECC71', '#FF9600', '#9B59B6', '#1ABC9C',
];

export default function GameSelectPage() {
  const [view, setView] = useState<ViewMode>('world');
  const stages = useMemo(generateDemoStages, []);
  const currentLevel = stages.find(s => s.isCurrent)?.stageNumber ?? 1;

  // World view: sky + buildings + tap to enter stage path
  if (view === 'world') {
    return (
      <WorldScene level={currentLevel}>
        {/* Tap the building area or a play button to enter stage path */}
        <div className="flex flex-col items-center justify-center flex-1 pt-8 pb-4 px-4">
          {/* Start playing button */}
          <button
            onClick={() => setView('path')}
            className="btn-duo-green px-10 py-4 rounded-2xl text-lg tap-interactive active:scale-95"
          >
            あそぶ
          </button>

          {/* Library link */}
          <button
            onClick={() => setView('library')}
            className="mt-4 px-8 py-3 rounded-xl text-sm font-bold tap-interactive active:scale-95"
            style={{
              background: 'rgba(255,255,255,0.9)',
              color: '#4B4B4B',
              boxShadow: '0 3px 0 rgba(0,0,0,0.08)',
            }}
          >
            ライブラリ
          </button>
        </div>
      </WorldScene>
    );
  }

  // Stage path: dark crosshatch path with nodes
  if (view === 'path') {
    return (
      <div data-theme="duo">
        <StageMap
          stages={stages}
          currentStage={currentLevel}
          onBack={() => setView('world')}
        />
      </div>
    );
  }

  // Library view: colorful game cards (dark bg like Duolingo ABC "My Library")
  return (
    <div data-theme="duo" className="min-h-screen"
         style={{ background: 'var(--duo-library-bg, #3C2A1E)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-12 pb-4"
           style={{ background: 'white' }}>
        <button
          onClick={() => setView('world')}
          className="w-10 h-10 rounded-full flex items-center justify-center tap-interactive"
          style={{ color: '#1CB0F6' }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="#1CB0F6" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </button>
        <h1 className="text-lg font-bold" style={{ color: '#4B4B4B' }}>
          ライブラリ
        </h1>
        <div className="w-10" />
      </div>

      {/* Game card grid */}
      <div className="px-4 py-6">
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
                {/* Card with colored border and "book spine" */}
                <div className="w-full aspect-square rounded-2xl flex items-center justify-center relative overflow-hidden"
                     style={{
                       background: cardColor,
                       border: `3px solid ${cardColor}`,
                       boxShadow: `0 4px 0 ${cardColor}88`,
                     }}>
                  {/* Inner illustration area */}
                  <div className="w-[85%] h-[70%] rounded-xl flex items-center justify-center"
                       style={{ background: 'rgba(255,255,255,0.18)' }}>
                    <DomainIcon
                      domain={cfg?.primary_domain ?? 'attention'}
                      size={42}
                      style={{ color: 'white' }}
                    />
                  </div>
                  {/* Book spine at bottom */}
                  <div className="absolute bottom-0 left-0 right-0 h-4 rounded-b-xl"
                       style={{ background: 'rgba(0,0,0,0.12)' }} />
                </div>

                {/* Title */}
                <span className="text-xs font-bold text-center mt-2 leading-tight"
                      style={{ color: 'white' }}>
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
