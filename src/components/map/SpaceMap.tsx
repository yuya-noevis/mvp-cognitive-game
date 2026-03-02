'use client';

import React, { useState } from 'react';
import { StarField } from './StarField';
import { Planet } from './Planet';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { CosmicButton } from '@/components/ui/CosmicButton';
import { CATEGORIES, INTEGRATED_GAME_MAP } from '@/games/integrated';
import type { CategoryDef } from '@/games/integrated';
import type { IntegratedGameId } from '@/games/integrated/types';
import Link from 'next/link';

/** カテゴリ別カラー */
const CATEGORY_COLORS: Record<string, string> = {
  'attention-inhibition': '#6C3CE1',
  'memory-learning': '#FFD43B',
  'flexibility-control': '#4ECDC4',
  'perception-spatial': '#2ED573',
  'social-language': '#FF6B9D',
};

interface SpaceMapProps {
  unlockedSystems?: string[];
  className?: string;
}

export function SpaceMap({ unlockedSystems = ['hikari'], className = '' }: SpaceMapProps) {
  const [selectedGame, setSelectedGame] = useState<IntegratedGameId | null>(null);
  const selectedConfig = selectedGame ? INTEGRATED_GAME_MAP[selectedGame] : null;

  return (
    <div className={`relative min-h-screen bg-space overflow-x-auto ${className}`}>
      <StarField count={150} />

      {/* Nebula decorations */}
      <div className="absolute top-[10%] left-[5%] w-40 h-40 rounded-full animate-nebula-drift"
           style={{ background: 'radial-gradient(circle, rgba(108,60,225,0.1) 0%, transparent 70%)' }} />
      <div className="absolute top-[60%] right-[10%] w-56 h-56 rounded-full animate-nebula-drift"
           style={{ background: 'radial-gradient(circle, rgba(255,107,157,0.08) 0%, transparent 70%)', animationDelay: '4s' }} />

      {/* Scrollable star systems — 5 categories */}
      <div className="flex items-start gap-0 overflow-x-auto snap-x snap-mandatory px-4 pt-20 pb-8 min-h-screen"
           style={{ scrollBehavior: 'smooth' }}>
        {CATEGORIES.map((category: CategoryDef) => {
          const color = CATEGORY_COLORS[category.id] ?? '#6C3CE1';
          const isUnlocked = unlockedSystems.includes(category.buildingId);

          return (
            <div
              key={category.id}
              className="flex-shrink-0 w-screen snap-center flex flex-col items-center px-4"
            >
              {/* System name */}
              <h2
                className="text-lg font-bold mb-8 text-center"
                style={{ color: isUnlocked ? color : '#8888AA' }}
              >
                {category.name}
              </h2>

              {/* Mother star (center) */}
              <div className="relative">
                <div
                  className="w-28 h-28 rounded-full flex items-center justify-center mb-8 mx-auto animate-gentle-pulse"
                  style={{
                    background: isUnlocked
                      ? `radial-gradient(circle at 35% 35%, ${color}FF 0%, ${color}88 100%)`
                      : 'radial-gradient(circle, #3A3A6A 0%, #2A2A5A 100%)',
                    boxShadow: isUnlocked
                      ? `0 0 40px ${color}44, 0 0 80px ${color}22`
                      : '0 4px 12px rgba(0,0,0,0.3)',
                  }}
                >
                  <svg width="40" height="40" viewBox="0 0 24 24" fill={isUnlocked ? 'white' : '#8888AA'}>
                    <polygon points="12,2 15,9 22,9 16.5,14 18.5,21 12,17 5.5,21 7.5,14 2,9 9,9" />
                  </svg>
                </div>

                {/* Satellite game planets — integrated games in this category */}
                <div className="flex flex-wrap justify-center gap-6 max-w-[320px] mx-auto">
                  {category.gameIds.map((gameId) => {
                    const config = INTEGRATED_GAME_MAP[gameId];
                    if (!config) return null;

                    return (
                      <Planet
                        key={gameId}
                        name={config.name}
                        color={color}
                        size={70}
                        locked={!isUnlocked}
                        icon={
                          <span style={{ fontSize: '24px' }}>{config.icon}</span>
                        }
                        onClick={() => setSelectedGame(gameId)}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Game detail bottom sheet */}
      <BottomSheet
        isOpen={!!selectedGame}
        onClose={() => setSelectedGame(null)}
        title={selectedConfig?.name}
      >
        {selectedConfig && selectedGame && (
          <div className="flex flex-col items-center gap-4 pb-4">
            {/* Icon large */}
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center"
              style={{
                background: `rgba(108, 60, 225, 0.15)`,
                border: '2px solid rgba(108, 60, 225, 0.3)',
              }}
            >
              <span style={{ fontSize: '40px' }}>{selectedConfig.icon}</span>
            </div>

            <p className="text-sm text-center" style={{ color: '#B8B8D0' }}>
              {selectedConfig.description}
            </p>

            <Link href={`/game/${selectedGame}`} className="w-full">
              <CosmicButton variant="primary" size="lg" className="w-full">
                あそぶ
              </CosmicButton>
            </Link>
          </div>
        )}
      </BottomSheet>
    </div>
  );
}
