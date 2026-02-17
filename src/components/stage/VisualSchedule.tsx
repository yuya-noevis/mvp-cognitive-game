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
 * VisualSchedule - Duolingo風ダークテーマ対応 TEACCH視覚スケジュール
 *
 * 設計根拠：
 * - TEACCH (Mesibov et al., 2004): 視覚的に構造化された予測可能なスケジュール
 * - 言語非依存: アイコンと色のみで進捗を表現
 * - 「いまここ」マーカーで現在位置を明示
 * - ダークテーマのCSS変数に対応
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
            {/* Connector line */}
            {index > 0 && (
              <div
                className="h-0.5 w-4 flex-shrink-0 rounded-full"
                style={{
                  background: isCompleted || isCurrent
                    ? '#58CC02'
                    : '#E5E5E5',
                }}
              />
            )}

            {/* Game node */}
            <div
              className={`relative flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center
                transition-all duration-300
                ${isCurrent ? 'scale-110' : ''}
                ${isFuture ? 'opacity-40' : 'opacity-100'}`}
              style={{
                background: isCompleted
                  ? '#58CC02'
                  : isCurrent
                    ? `${domainMeta?.color ?? '#58CC02'}30`
                    : '#E5E5E5',
                border: isCurrent
                  ? `2px solid ${domainMeta?.color ?? '#1CB0F6'}`
                  : '2px solid transparent',
              }}
            >
              {isCompleted ? (
                <CheckCircleIcon size={18} style={{ color: 'white' }} />
              ) : (
                <DomainIcon domain={game.domain} size={18} style={{
                  color: isCurrent
                    ? (domainMeta?.color ?? '#1CB0F6')
                    : '#AFAFAF',
                }} />
              )}

              {/* 「いまここ」indicator */}
              {isCurrent && (
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2">
                  <div className="w-1.5 h-1.5 rounded-full"
                       style={{ background: '#1CB0F6' }} />
                </div>
              )}

              {/* Review badge */}
              {game.isReview && !isCompleted && (
                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center"
                     style={{ background: '#FFC800' }}>
                  <RefreshIcon size={8} style={{ color: 'white' }} />
                </div>
              )}
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}
