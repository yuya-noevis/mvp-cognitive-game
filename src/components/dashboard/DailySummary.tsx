'use client';

import React from 'react';
import type { DailySummaryData } from './dashboard-data';

interface DailySummaryProps {
  data: DailySummaryData;
}

/**
 * Today's play summary: games played, session count, total time.
 * Uses positive, encouraging framing.
 */
export function DailySummary({ data }: DailySummaryProps) {
  const minutes = Math.round(data.totalDurationSec / 60);

  if (data.sessionCount === 0) {
    return (
      <div
        className="p-4 rounded-2xl"
        style={{
          background: 'rgba(42, 42, 90, 0.3)',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <p className="text-xs font-bold mb-2" style={{ color: '#B8B8D0' }}>
          きょうのまとめ
        </p>
        <p className="text-sm" style={{ color: '#8888AA' }}>
          まだプレイしていません。あそびにいこう！
        </p>
      </div>
    );
  }

  return (
    <div
      className="p-4 rounded-2xl"
      style={{
        background: 'rgba(42, 42, 90, 0.3)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <p className="text-xs font-bold mb-3" style={{ color: '#B8B8D0' }}>
        きょうのまとめ
      </p>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        {/* Sessions */}
        <div className="text-center">
          <p className="text-xl font-bold" style={{ color: '#8B5CF6' }}>
            {data.sessionCount}
          </p>
          <p className="text-xs" style={{ color: '#8888AA' }}>
            セッション
          </p>
        </div>
        {/* Time */}
        <div className="text-center">
          <p className="text-xl font-bold" style={{ color: '#4ECDC4' }}>
            {minutes}
          </p>
          <p className="text-xs" style={{ color: '#8888AA' }}>
            分
          </p>
        </div>
        {/* Accuracy */}
        <div className="text-center">
          <p className="text-xl font-bold" style={{ color: '#2ED573' }}>
            {data.overallAccuracy}%
          </p>
          <p className="text-xs" style={{ color: '#8888AA' }}>
            せいかい
          </p>
        </div>
      </div>

      {/* Games played */}
      {data.gamesPlayed.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {data.gamesPlayed.map((game) => (
            <div
              key={game.id}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
              style={{
                background: 'rgba(108, 60, 225, 0.1)',
                border: '1px solid rgba(108, 60, 225, 0.2)',
              }}
            >
              <span className="text-sm">{game.icon}</span>
              <span className="text-xs font-medium" style={{ color: '#F0F0FF' }}>
                {game.name}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
