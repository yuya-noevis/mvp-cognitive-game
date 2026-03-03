'use client';

import React from 'react';
import type { MonthlyBestSkillData } from './dashboard-data';
import { CATEGORY_COLORS } from './dashboard-data';

interface MonthlyBestSkillProps {
  data: MonthlyBestSkillData | null;
}

/**
 * Displays the most improved cognitive category this month.
 * Uses Strengths-Based framing ("得意みたい！") and positive expressions only.
 * Never uses negative language like "苦手" or "弱い".
 */
export function MonthlyBestSkill({ data }: MonthlyBestSkillProps) {
  if (!data) {
    return (
      <div
        className="p-5 rounded-2xl text-center"
        style={{
          background: 'rgba(42, 42, 90, 0.3)',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <p className="text-sm" style={{ color: '#8888AA' }}>
          今月のデータがたまると「いちばん伸びたスキル」が表示されます
        </p>
      </div>
    );
  }

  const color = CATEGORY_COLORS[data.category];

  // Strengths-based messages
  const messages = [
    `${data.label}が得意みたい！`,
    `${data.label}がぐんぐん伸びています！`,
    `${data.label}がキラキラ輝いています！`,
  ];
  // Pick a message based on improvement level
  const msgIndex = data.improvement >= 15 ? 1 : data.improvement >= 8 ? 2 : 0;
  const message = messages[msgIndex];

  return (
    <div
      className="p-5 rounded-2xl relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${color}15, ${color}08)`,
        border: `1px solid ${color}30`,
      }}
    >
      {/* Decorative sparkle */}
      <div
        className="absolute top-3 right-3 text-xl animate-gentle-pulse"
        style={{ opacity: 0.6 }}
      >
        ✨
      </div>

      <p className="text-xs font-bold mb-2" style={{ color: '#FFD43B' }}>
        今月いちばん伸びたスキル
      </p>

      <p className="text-lg font-bold mb-1" style={{ color: '#F0F0FF' }}>
        {message}
      </p>

      <div className="flex items-center gap-3 mt-3">
        {/* Score badge */}
        <div
          className="px-3 py-1.5 rounded-xl"
          style={{ background: `${color}20` }}
        >
          <span className="text-sm font-bold" style={{ color }}>
            {data.currentScore}点
          </span>
        </div>

        {/* Improvement indicator */}
        <div className="flex items-center gap-1">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 19V5M5 12l7-7 7 7"
              stroke="#2ED573"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="text-sm font-bold" style={{ color: '#2ED573' }}>
            +{data.improvement}%
          </span>
          <span className="text-xs" style={{ color: '#B8B8D0' }}>
            アップ
          </span>
        </div>
      </div>
    </div>
  );
}
