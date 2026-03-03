'use client';

/**
 * AssistModeToggle - 介入モード切り替え UI
 *
 * セッション開始前に保護者が assist_mode を ON/OFF する。
 * GameShell のプレスタート画面に組み込むことを想定。
 *
 * 安全設計:
 * - ポジティブな表現のみ使用
 * - 赤色不使用
 * - わかりやすいトグルUI
 */

import React from 'react';

interface AssistModeToggleProps {
  /** 現在の assist_mode 状態 */
  enabled: boolean;
  /** トグル時のコールバック */
  onChange: (enabled: boolean) => void;
  /** コンパクト表示（GameShell 埋め込み用） */
  compact?: boolean;
}

export function AssistModeToggle({ enabled, onChange, compact = false }: AssistModeToggleProps) {
  const handleToggle = () => {
    onChange(!enabled);
  };

  if (compact) {
    return (
      <button
        type="button"
        onClick={handleToggle}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-200 tap-interactive"
        style={{
          background: enabled
            ? 'rgba(78, 205, 196, 0.15)'
            : 'rgba(255, 255, 255, 0.06)',
          border: `1px solid ${enabled ? 'rgba(78, 205, 196, 0.4)' : 'rgba(255, 255, 255, 0.1)'}`,
        }}
        aria-pressed={enabled}
        aria-label={enabled ? 'サポートモード: オン' : 'サポートモード: オフ'}
      >
        <ToggleSwitch enabled={enabled} />
        <span
          className="text-xs font-medium"
          style={{ color: enabled ? '#4ECDC4' : '#B8B8D0' }}
        >
          サポート
        </span>
      </button>
    );
  }

  return (
    <div
      className="rounded-2xl p-4 transition-all duration-200"
      style={{
        background: enabled
          ? 'rgba(78, 205, 196, 0.08)'
          : 'rgba(255, 255, 255, 0.04)',
        border: `1px solid ${enabled ? 'rgba(78, 205, 196, 0.25)' : 'rgba(255, 255, 255, 0.08)'}`,
      }}
    >
      <button
        type="button"
        onClick={handleToggle}
        className="w-full flex items-center justify-between tap-interactive"
        aria-pressed={enabled}
        aria-label={enabled ? 'サポートモード: オン' : 'サポートモード: オフ'}
      >
        <div className="flex items-center gap-3">
          <span className="text-xl" aria-hidden="true">
            {enabled ? '\uD83E\uDD1D' : '\uD83D\uDC64'}
          </span>
          <div className="text-left">
            <p
              className="text-sm font-bold"
              style={{ color: 'var(--color-text)' }}
            >
              サポートモード
            </p>
            <p
              className="text-xs mt-0.5"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {enabled
                ? 'おとなと いっしょに あそぶよ'
                : 'ひとりで チャレンジ!'}
            </p>
          </div>
        </div>
        <ToggleSwitch enabled={enabled} />
      </button>
    </div>
  );
}

// ============================================
// トグルスイッチ
// ============================================

function ToggleSwitch({ enabled }: { enabled: boolean }) {
  return (
    <div
      className="relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0"
      style={{
        background: enabled ? '#4ECDC4' : 'rgba(255, 255, 255, 0.15)',
      }}
    >
      <div
        className="absolute top-0.5 w-5 h-5 rounded-full transition-transform duration-200"
        style={{
          background: '#FFFFFF',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
          transform: enabled ? 'translateX(22px)' : 'translateX(2px)',
        }}
      />
    </div>
  );
}

export default AssistModeToggle;
