'use client';

import React from 'react';
import type { StageGameState } from '@/features/stage-system/types';
import { COGNITIVE_DOMAINS } from '@/lib/constants';
import { DomainIcon, CheckCircleIcon, RefreshIcon } from '@/components/icons';

interface VisualScheduleProps {
  games: StageGameState[];
  currentGameIndex: number;
}

/**
 * VisualSchedule - 宇宙テーマ TEACCH視覚スケジュール
 */
export function VisualSchedule({ games, currentGameIndex }: VisualScheduleProps) {
  return (
    <div className="flex items-center gap-2 px-4 py-3 overflow-x-auto">
      {games.map((game, index) => {
        const domainMeta = COGNITIVE_DOMAINS.find(d => d.key === game.domain);
        const isCurrent = index === currentGameIndex;
        const isCompleted = game.isCompleted;
        const isFuture = index > currentGameIndex;

        return (
          <React.Fragment key={`${game.gameId}-${index}`}>
            {index > 0 && (
              <div
                className="h-0.5 w-4 flex-shrink-0 rounded-full"
                style={{
                  background: isCompleted || isCurrent
                    ? '#6C3CE1'
                    : 'rgba(255,255,255,0.1)',
                }}
              />
            )}

            <div
              className={`relative flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center
                transition-all duration-300
                ${isCurrent ? 'scale-110' : ''}
                ${isFuture ? 'opacity-40' : 'opacity-100'}`}
              style={{
                background: isCompleted
                  ? '#6C3CE1'
                  : isCurrent
                    ? `${domainMeta?.color ?? '#6C3CE1'}30`
                    : 'rgba(42, 42, 90, 0.4)',
                border: isCurrent
                  ? `2px solid ${domainMeta?.color ?? '#8B5CF6'}`
                  : '2px solid transparent',
                boxShadow: isCurrent ? `0 0 12px ${domainMeta?.color ?? '#6C3CE1'}44` : 'none',
              }}
            >
              {isCompleted ? (
                <CheckCircleIcon size={18} style={{ color: 'white' }} />
              ) : (
                <DomainIcon domain={game.domain} size={18} style={{
                  color: isCurrent
                    ? (domainMeta?.color ?? '#8B5CF6')
                    : '#8888AA',
                }} />
              )}

              {isCurrent && (
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2">
                  <div className="w-1.5 h-1.5 rounded-full"
                       style={{ background: '#8B5CF6' }} />
                </div>
              )}

              {game.isReview && !isCompleted && (
                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center"
                     style={{ background: '#FFD43B' }}>
                  <RefreshIcon size={8} style={{ color: '#1A1A40' }} />
                </div>
              )}
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}
