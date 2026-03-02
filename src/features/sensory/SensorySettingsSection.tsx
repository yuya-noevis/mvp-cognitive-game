'use client';

import React from 'react';
import { useSensorySettings } from './SensorySettingsContext';
import type { SensorySettings } from './types';

// ============================================================
// 共通: Toggle スイッチ
// ============================================================

interface ToggleSwitchProps {
  isOn: boolean;
  onToggle: () => void;
  accentColor?: string;
  ariaLabel?: string;
}

function ToggleSwitch({ isOn, onToggle, accentColor = '#6C3CE1', ariaLabel }: ToggleSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={isOn}
      aria-label={ariaLabel}
      onClick={onToggle}
      className="w-12 h-7 rounded-full relative transition-all flex-shrink-0"
      style={{
        background: isOn ? accentColor : 'rgba(255,255,255,0.15)',
      }}
    >
      <div
        className="absolute w-5 h-5 rounded-full top-1 transition-all"
        style={{
          background: '#F0F0FF',
          left: isOn ? '26px' : '4px',
        }}
      />
    </button>
  );
}

// ============================================================
// 共通: セレクターボタン群
// ============================================================

interface SelectorOption<T extends string> {
  value: T;
  label: string;
  icon?: string;
}

interface SelectorProps<T extends string> {
  options: SelectorOption<T>[];
  value: T;
  onChange: (v: T) => void;
}

function Selector<T extends string>({ options, value, onChange }: SelectorProps<T>) {
  return (
    <div className="flex gap-2 mt-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className="flex-1 flex flex-col items-center gap-1 px-2 py-2 text-xs rounded-xl font-medium transition-all"
          style={{
            background: value === opt.value ? '#6C3CE1' : 'rgba(255,255,255,0.08)',
            color: value === opt.value ? '#FFFFFF' : '#B8B8D0',
          }}
        >
          {opt.icon && <span className="text-base leading-none">{opt.icon}</span>}
          <span>{opt.label}</span>
        </button>
      ))}
    </div>
  );
}

// ============================================================
// Main: 感覚過敏コントロールセクション
// ============================================================

const SOUND_EFFECT_OPTIONS: SelectorOption<SensorySettings['soundEffectVolume']>[] = [
  { value: 'high',   label: '大',    icon: '🔊' },
  { value: 'normal', label: 'ふつう', icon: '🔉' },
  { value: 'low',    label: '小',    icon: '🔈' },
  { value: 'off',    label: 'オフ',  icon: '🔇' },
];

const ANIMATION_SPEED_OPTIONS: SelectorOption<SensorySettings['animationSpeed']>[] = [
  { value: 'normal', label: 'ふつう', icon: '▶' },
  { value: 'slow',   label: 'ゆっくり', icon: '🐢' },
  { value: 'none',   label: 'なし',   icon: '⏸' },
];

/**
 * SensorySettingsSection
 * 設定ページに埋め込む感覚過敏コントロールUI。
 * useSensorySettings から設定を読み書きする。
 */
export function SensorySettingsSection() {
  const { settings, updateSettings } = useSensorySettings();

  return (
    <section
      className="p-5 rounded-2xl"
      style={{ background: 'rgba(42, 42, 90, 0.5)', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      {/* ヘッダー */}
      <div className="flex items-center gap-2 mb-5">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-base"
          style={{ background: 'rgba(255, 212, 59, 0.2)' }}
        >
          👂
        </div>
        <div>
          <h2 className="text-base font-bold" style={{ color: '#F0F0FF' }}>
            感覚過敏コントロール
          </h2>
          <p className="text-xs" style={{ color: '#8888AA' }}>
            ASD・感覚過敏のお子様向けの設定
          </p>
        </div>
      </div>

      <div className="space-y-5">
        {/* BGM */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm font-medium" style={{ color: '#F0F0FF' }}>BGM</span>
            <p className="text-xs" style={{ color: '#8888AA' }}>バックグラウンドミュージック</p>
          </div>
          <ToggleSwitch
            isOn={settings.bgm === 'on'}
            onToggle={() => updateSettings({ bgm: settings.bgm === 'on' ? 'off' : 'on' })}
            ariaLabel="BGMのオン/オフ"
          />
        </div>

        {/* 効果音 */}
        <div>
          <span className="text-sm font-medium" style={{ color: '#F0F0FF' }}>効果音</span>
          <p className="text-xs" style={{ color: '#8888AA' }}>正解・不正解の効果音の大きさ</p>
          <Selector
            options={SOUND_EFFECT_OPTIONS}
            value={settings.soundEffectVolume}
            onChange={(v) => updateSettings({ soundEffectVolume: v })}
          />
        </div>

        {/* アニメーション */}
        <div>
          <span className="text-sm font-medium" style={{ color: '#F0F0FF' }}>アニメーション</span>
          <p className="text-xs" style={{ color: '#8888AA' }}>
            動きに敏感な場合は「ゆっくり」または「なし」を推奨
          </p>
          <Selector
            options={ANIMATION_SPEED_OPTIONS}
            value={settings.animationSpeed}
            onChange={(v) => updateSettings({ animationSpeed: v })}
          />
        </div>

        {/* 振動 */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm font-medium" style={{ color: '#F0F0FF' }}>振動フィードバック</span>
            <p className="text-xs" style={{ color: '#8888AA' }}>正解時のバイブレーション</p>
          </div>
          <ToggleSwitch
            isOn={settings.vibration === 'on'}
            onToggle={() => updateSettings({ vibration: settings.vibration === 'on' ? 'off' : 'on' })}
            ariaLabel="振動フィードバックのオン/オフ"
          />
        </div>

        {/* 注意書き */}
        <div
          className="rounded-xl p-3 text-xs"
          style={{
            background: 'rgba(255, 212, 59, 0.08)',
            border: '1px solid rgba(255, 212, 59, 0.2)',
            color: '#B8B8D0',
          }}
        >
          <span style={{ color: '#FFD43B' }}>ℹ️ </span>
          設定はすぐに反映されます。保護者の方が操作してください。
        </div>
      </div>
    </section>
  );
}
