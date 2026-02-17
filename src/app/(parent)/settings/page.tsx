'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { DEFAULT_CHILD_SETTINGS, type ChildSettings } from '@/types';
import { AccessibilityIcon, LockIcon, ClipboardIcon, ExportIcon, TrashIcon, CheckCircleIcon } from '@/components/icons';

export default function SettingsPage() {
  const [settings, setSettings] = useState<ChildSettings>(DEFAULT_CHILD_SETTINGS);
  const [saved, setSaved] = useState(false);

  const updateSetting = <K extends keyof ChildSettings>(key: K, value: ChildSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    // TODO: Save to Supabase
    console.log('Settings saved:', settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg)' }}>
      <header className="sticky top-0 z-10 backdrop-blur-md"
              style={{ background: 'rgba(247, 247, 247, 0.95)', borderBottom: '1px solid #EEEEEE' }}>
        <div className="max-w-lg mx-auto flex items-center gap-4 px-4 py-3">
          <Link href="/dashboard"
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: '#EEEEEE' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                 strokeLinecap="round" style={{ color: '#777777' }}>
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </Link>
          <h1 className="text-lg font-bold" style={{ color: '#4B4B4B' }}>設定</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto p-4 space-y-4">
        {/* Accessibility settings */}
        <section className="card p-5 animate-fade-in-up">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                 style={{ background: 'var(--color-primary-bg)' }}>
              <AccessibilityIcon size={18} style={{ color: 'var(--color-primary)' }} />
            </div>
            <h2 className="text-base font-bold" style={{ color: 'var(--color-text)' }}>
              アクセシビリティ
            </h2>
          </div>

          <div className="space-y-5">
            {/* Sound */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>サウンド</span>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>効果音のON/OFF</p>
              </div>
              <button
                type="button"
                onClick={() => updateSetting('sound_enabled', !settings.sound_enabled)}
                className="toggle"
                data-on={String(settings.sound_enabled)}
                aria-label={`サウンド: ${settings.sound_enabled ? 'ON' : 'OFF'}`}
              >
                <div className="toggle-knob" />
              </button>
            </div>

            {/* Animation speed */}
            <div>
              <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>アニメーション速度</span>
              <p className="text-xs mb-2" style={{ color: 'var(--color-text-muted)' }}>
                感覚過敏の場合は「ゆっくり」を推奨
              </p>
              <div className="flex gap-2">
                {(['slow', 'normal', 'fast'] as const).map((speed) => (
                  <button
                    key={speed}
                    onClick={() => updateSetting('animation_speed', speed)}
                    className="btn flex-1 px-4 py-2.5 text-sm"
                    style={{
                      background: settings.animation_speed === speed ? 'var(--color-primary)' : 'var(--color-border-light)',
                      color: settings.animation_speed === speed ? 'white' : 'var(--color-text-secondary)',
                      borderRadius: 'var(--radius-lg)',
                    }}
                  >
                    {speed === 'slow' ? 'ゆっくり' : speed === 'normal' ? 'ふつう' : 'はやい'}
                  </button>
                ))}
              </div>
            </div>

            {/* Flash disabled */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>点滅を無効化</span>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  光過敏・てんかんリスクへの配慮
                </p>
              </div>
              <button
                type="button"
                onClick={() => updateSetting('flash_disabled', !settings.flash_disabled)}
                className="toggle"
                data-on={String(settings.flash_disabled)}
                aria-label={`点滅無効化: ${settings.flash_disabled ? 'ON' : 'OFF'}`}
              >
                <div className="toggle-knob" />
              </button>
            </div>

            {/* High contrast */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>高コントラスト</span>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  視覚情報の識別を助けます
                </p>
              </div>
              <button
                type="button"
                onClick={() => updateSetting('high_contrast', !settings.high_contrast)}
                className="toggle"
                data-on={String(settings.high_contrast)}
                aria-label={`高コントラスト: ${settings.high_contrast ? 'ON' : 'OFF'}`}
              >
                <div className="toggle-knob" />
              </button>
            </div>

            {/* Tap target size */}
            <div>
              <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>タップ領域の大きさ</span>
              <p className="text-xs mb-2" style={{ color: 'var(--color-text-muted)' }}>
                運動困難がある場合は「おおきめ」を推奨
              </p>
              <div className="flex gap-2">
                {(['normal', 'large'] as const).map((size) => (
                  <button
                    key={size}
                    onClick={() => updateSetting('tap_target_size', size)}
                    className="btn flex-1 px-4 py-2.5 text-sm"
                    style={{
                      background: settings.tap_target_size === size ? 'var(--color-primary)' : 'var(--color-border-light)',
                      color: settings.tap_target_size === size ? 'white' : 'var(--color-text-secondary)',
                      borderRadius: 'var(--radius-lg)',
                    }}
                  >
                    {size === 'normal' ? 'ふつう' : 'おおきめ'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Data management */}
        <section className="card p-5 animate-fade-in-up stagger-1">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                 style={{ background: 'var(--color-info-bg)' }}>
              <LockIcon size={18} style={{ color: 'var(--color-info)' }} />
            </div>
            <h2 className="text-base font-bold" style={{ color: 'var(--color-text)' }}>
              データ管理
            </h2>
          </div>

          <div className="space-y-1">
            <button className="w-full flex items-center gap-3 p-3 rounded-xl text-left text-sm transition-colors"
                    style={{ color: 'var(--color-text-secondary)' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-surface-hover)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
              <ClipboardIcon size={16} style={{ color: 'var(--color-text-secondary)' }} />
              同意設定の変更
              <svg className="ml-auto" width="16" height="16" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                   style={{ color: 'var(--color-text-muted)' }}>
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </button>
            <button className="w-full flex items-center gap-3 p-3 rounded-xl text-left text-sm transition-colors"
                    style={{ color: 'var(--color-text-secondary)' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-surface-hover)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
              <ExportIcon size={16} style={{ color: 'var(--color-text-secondary)' }} />
              データのエクスポート
              <svg className="ml-auto" width="16" height="16" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                   style={{ color: 'var(--color-text-muted)' }}>
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </button>
            <button className="w-full flex items-center gap-3 p-3 rounded-xl text-left text-sm transition-colors"
                    style={{ color: 'var(--color-accent)' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-accent-bg)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
              <TrashIcon size={16} style={{ color: 'var(--color-accent)' }} />
              データの削除
              <svg className="ml-auto" width="16" height="16" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                   style={{ color: 'var(--color-accent-light)' }}>
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </button>
          </div>
        </section>

        {/* Save button */}
        <button
          onClick={handleSave}
          className="btn-duo-green w-full py-3.5 text-base tap-target rounded-xl animate-fade-in-up stagger-2"
        >
          {saved ? '保存しました ✓' : '設定を保存'}
        </button>
      </main>
    </div>
  );
}
