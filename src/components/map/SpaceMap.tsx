'use client';

import React, { useState } from 'react';
import { StarField } from './StarField';
import { Planet } from './Planet';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { CosmicButton } from '@/components/ui/CosmicButton';
import { DomainIcon } from '@/components/icons';
import { GAME_CONFIGS, GAME_LIST } from '@/games';
import Link from 'next/link';
import type { CognitiveDomain, GameId } from '@/types';

/**
 * 星系の定義
 */
interface StarSystem {
  id: string;
  name: string;
  color: string;
  games: string[];
}

const STAR_SYSTEMS: StarSystem[] = [
  {
    id: 'hikari',
    name: 'ひかりの星系',
    color: '#6C3CE1',
    games: ['hikari-catch', 'kimochi-stop', 'matte-stop', 'kimochi-yomitori', 'oboete-narabete'],
  },
  {
    id: 'kangae',
    name: 'ひらめきの星系',
    color: '#4ECDC4',
    games: ['irokae-switch', 'pattern-puzzle', 'tsumitage-tower', 'meiro-tanken'],
  },
  {
    id: 'kankaku',
    name: 'かんかくの星系',
    color: '#2ED573',
    games: ['katachi-sagashi', 'kakurenbo-katachi', 'hayawaza-touch', 'touch-de-go'],
  },
  {
    id: 'kotoba',
    name: 'ことばの星系',
    color: '#FFD43B',
    games: ['kotoba-catch', 'oboete-match'],
  },
];

interface SpaceMapProps {
  unlockedSystems?: string[];
  className?: string;
}

export function SpaceMap({ unlockedSystems = ['hikari'], className = '' }: SpaceMapProps) {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const selectedConfig = selectedGame ? GAME_CONFIGS[selectedGame as GameId] : null;
  const selectedGameInfo = selectedGame ? GAME_LIST.find(g => g.id === selectedGame) : null;

  return (
    <div className={`relative min-h-screen bg-space overflow-x-auto ${className}`}>
      <StarField count={150} />

      {/* Nebula decorations */}
      <div className="absolute top-[10%] left-[5%] w-40 h-40 rounded-full animate-nebula-drift"
           style={{ background: 'radial-gradient(circle, rgba(108,60,225,0.1) 0%, transparent 70%)' }} />
      <div className="absolute top-[60%] right-[10%] w-56 h-56 rounded-full animate-nebula-drift"
           style={{ background: 'radial-gradient(circle, rgba(255,107,157,0.08) 0%, transparent 70%)', animationDelay: '4s' }} />

      {/* Scrollable star systems */}
      <div className="flex items-start gap-0 overflow-x-auto snap-x snap-mandatory px-4 pt-20 pb-8 min-h-screen"
           style={{ scrollBehavior: 'smooth' }}>
        {STAR_SYSTEMS.map((system) => {
          const isUnlocked = unlockedSystems.includes(system.id);

          return (
            <div
              key={system.id}
              className="flex-shrink-0 w-screen snap-center flex flex-col items-center px-4"
            >
              {/* System name */}
              <h2
                className="text-lg font-bold mb-8 text-center"
                style={{ color: isUnlocked ? system.color : '#8888AA' }}
              >
                {system.name}
              </h2>

              {/* Mother star (center) */}
              <div className="relative">
                <div
                  className="w-28 h-28 rounded-full flex items-center justify-center mb-8 mx-auto animate-gentle-pulse"
                  style={{
                    background: isUnlocked
                      ? `radial-gradient(circle at 35% 35%, ${system.color}FF 0%, ${system.color}88 100%)`
                      : 'radial-gradient(circle, #3A3A6A 0%, #2A2A5A 100%)',
                    boxShadow: isUnlocked
                      ? `0 0 40px ${system.color}44, 0 0 80px ${system.color}22`
                      : '0 4px 12px rgba(0,0,0,0.3)',
                  }}
                >
                  <svg width="40" height="40" viewBox="0 0 24 24" fill={isUnlocked ? 'white' : '#8888AA'}>
                    <polygon points="12,2 15,9 22,9 16.5,14 18.5,21 12,17 5.5,21 7.5,14 2,9 9,9" />
                  </svg>
                </div>

                {/* Satellite game planets arranged around */}
                <div className="flex flex-wrap justify-center gap-6 max-w-[320px] mx-auto">
                  {system.games.map((gameId) => {
                    const config = GAME_CONFIGS[gameId as GameId];
                    const game = GAME_LIST.find(g => g.id === gameId);
                    if (!config || !game) return null;

                    return (
                      <Planet
                        key={gameId}
                        name={game.name}
                        color={system.color}
                        size={70}
                        locked={!isUnlocked}
                        icon={
                          <DomainIcon
                            domain={config.primary_domain as CognitiveDomain}
                            size={24}
                            style={{ color: 'white' }}
                          />
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
        title={selectedGameInfo?.name}
      >
        {selectedConfig && selectedGame && (
          <div className="flex flex-col items-center gap-4 pb-4">
            {/* Domain icon large */}
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center"
              style={{
                background: `rgba(108, 60, 225, 0.15)`,
                border: '2px solid rgba(108, 60, 225, 0.3)',
              }}
            >
              <DomainIcon
                domain={selectedConfig.primary_domain as CognitiveDomain}
                size={40}
                style={{ color: '#8B5CF6' }}
              />
            </div>

            <p className="text-sm text-center" style={{ color: '#B8B8D0' }}>
              {selectedGameInfo?.description ?? ''}
            </p>

            <Link href={`/play/${selectedGame}`} className="w-full">
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
