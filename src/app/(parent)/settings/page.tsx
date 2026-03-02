'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DEFAULT_CHILD_SETTINGS, type ChildSettings } from '@/types';
import { AccessibilityIcon, LockIcon, ClipboardIcon, ExportIcon, TrashIcon } from '@/components/icons';
import { StarField } from '@/components/map/StarField';
import { CosmicButton } from '@/components/ui/CosmicButton';
import { isSupabaseEnabled, supabase } from '@/lib/supabase/client';
import { getLocalChildProfile, getLocalChildSettings, setLocalChildProfile, setLocalChildSettings } from '@/lib/local-profile';
import { SensorySettingsSection } from '@/features/sensory/SensorySettingsSection';

export default function SettingsPage() {
  const [settings, setSettings] = useState<ChildSettings>(DEFAULT_CHILD_SETTINGS);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [volume, setVolume] = useState(80);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [childId, setChildId] = useState<string | null>(null);

  // Load settings from Supabase on mount
  useEffect(() => {
    async function loadSettings() {
      // Local/demo mode
      if (!isSupabaseEnabled) {
        const localSettings = getLocalChildSettings();
        if (localSettings) {
          setSettings({ ...DEFAULT_CHILD_SETTINGS, ...localSettings });
          if (localSettings.volume !== undefined) setVolume(localSettings.volume);
          if (localSettings.camera_enabled !== undefined) setCameraEnabled(localSettings.camera_enabled);
        }
        // Keep childId null in local mode
        setLoading(false);
        return;
      }

      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        setLoading(false);
        return;
      }

      const { data: child } = await supabase
        .from('children')
        .select('id, settings, consent_flags')
        .eq('parent_user_id', userData.user.id)
        .single();

      if (child) {
        setChildId(child.id);
        if (child.settings) {
          setSettings({ ...DEFAULT_CHILD_SETTINGS, ...child.settings });
          if (child.settings.volume !== undefined) setVolume(child.settings.volume);
          if (child.settings.camera_enabled !== undefined) setCameraEnabled(child.settings.camera_enabled);
        }
      }

      // Load sensory settings from child_profiles
      if (child) {
        const { data: profile } = await supabase
          .from('child_profiles')
          .select('sensory_settings')
          .eq('child_id', child.id)
          .single();

        if (profile?.sensory_settings) {
          if (profile.sensory_settings.camera_enabled !== undefined) {
            setCameraEnabled(profile.sensory_settings.camera_enabled);
          }
          if (profile.sensory_settings.volume !== undefined) {
            setVolume(profile.sensory_settings.volume);
          }
        }
      }

      setLoading(false);
    }
    loadSettings();
  }, []);

  const updateSetting = <K extends keyof ChildSettings>(key: K, value: ChildSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    // Local/demo mode: persist to localStorage
    if (!isSupabaseEnabled) {
      const next = { ...settings, volume, camera_enabled: cameraEnabled } as ChildSettings;
      setLocalChildSettings(next);
      const local = getLocalChildProfile();
      if (local) {
        setLocalChildProfile({
          ...local,
          settings: { ...(local.settings || {}), volume, camera_enabled: cameraEnabled },
        });
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      return;
    }

    if (!childId) return;

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    // Save children.settings
    await supabase
      .from('children')
      .update({
        settings: { ...settings, volume, camera_enabled: cameraEnabled },
      })
      .eq('parent_user_id', userData.user.id);

    // Save child_profiles.sensory_settings
    await supabase
      .from('child_profiles')
      .update({
        sensory_settings: { volume, camera_enabled: cameraEnabled },
      })
      .eq('child_id', childId);

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-space flex items-center justify-center">
        <div className="animate-gentle-pulse" style={{ color: '#B8B8D0' }}>読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-space relative overflow-hidden" data-theme="parent">
      <StarField count={40} />

      <header className="sticky top-0 z-10 backdrop-blur-md"
              style={{ background: 'rgba(13, 13, 43, 0.9)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="max-w-lg mx-auto flex items-center gap-4 px-4 py-3">
          <Link href="/dashboard"
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.1)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                 strokeLinecap="round" style={{ color: '#B8B8D0' }}>
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </Link>
          <h1 className="text-lg font-bold" style={{ color: '#F0F0FF' }}>設定</h1>
        </div>
      </header>

      <main className="relative z-10 max-w-lg mx-auto p-4 space-y-4">
        {/* Accessibility settings */}
        <section className="p-5 rounded-2xl animate-fade-in-up"
                 style={{ background: 'rgba(42, 42, 90, 0.5)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                 style={{ background: 'rgba(108, 60, 225, 0.2)' }}>
              <AccessibilityIcon size={18} style={{ color: '#8B5CF6' }} />
            </div>
            <h2 className="text-base font-bold" style={{ color: '#F0F0FF' }}>
              アクセシビリティ
            </h2>
          </div>

          <div className="space-y-5">
            {/* Sound */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium" style={{ color: '#F0F0FF' }}>サウンド</span>
                <p className="text-xs" style={{ color: '#8888AA' }}>効果音のON/OFF</p>
              </div>
              <button
                type="button"
                onClick={() => updateSetting('sound_enabled', !settings.sound_enabled)}
                className="w-12 h-7 rounded-full relative transition-all"
                style={{
                  background: settings.sound_enabled ? '#6C3CE1' : 'rgba(255,255,255,0.15)',
                }}
              >
                <div className="absolute w-5 h-5 rounded-full top-1 transition-all"
                     style={{
                       background: '#F0F0FF',
                       left: settings.sound_enabled ? '26px' : '4px',
                     }} />
              </button>
            </div>

            {/* Volume slider */}
            <div>
              <span className="text-sm font-medium" style={{ color: '#F0F0FF' }}>音量</span>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-xs" style={{ color: '#8888AA' }}>🔈</span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={volume}
                  onChange={(e) => { setVolume(Number(e.target.value)); setSaved(false); }}
                  className="flex-1 accent-purple-500"
                />
                <span className="text-xs w-8 text-right" style={{ color: '#B8B8D0' }}>{volume}%</span>
              </div>
            </div>

            {/* Animation speed */}
            <div>
              <span className="text-sm font-medium" style={{ color: '#F0F0FF' }}>アニメーション速度</span>
              <p className="text-xs mb-2" style={{ color: '#8888AA' }}>
                感覚過敏の場合は「ゆっくり」を推奨
              </p>
              <div className="flex gap-2">
                {(['slow', 'normal', 'fast'] as const).map((speed) => (
                  <button
                    key={speed}
                    onClick={() => updateSetting('animation_speed', speed)}
                    className="flex-1 px-4 py-2.5 text-sm rounded-xl font-bold transition-all"
                    style={{
                      background: settings.animation_speed === speed ? '#6C3CE1' : 'rgba(255,255,255,0.08)',
                      color: settings.animation_speed === speed ? '#FFFFFF' : '#B8B8D0',
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
                <span className="text-sm font-medium" style={{ color: '#F0F0FF' }}>点滅を無効化</span>
                <p className="text-xs" style={{ color: '#8888AA' }}>光過敏・てんかんリスクへの配慮</p>
              </div>
              <button
                type="button"
                onClick={() => updateSetting('flash_disabled', !settings.flash_disabled)}
                className="w-12 h-7 rounded-full relative transition-all"
                style={{
                  background: settings.flash_disabled ? '#6C3CE1' : 'rgba(255,255,255,0.15)',
                }}
              >
                <div className="absolute w-5 h-5 rounded-full top-1 transition-all"
                     style={{
                       background: '#F0F0FF',
                       left: settings.flash_disabled ? '26px' : '4px',
                     }} />
              </button>
            </div>

            {/* High contrast */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium" style={{ color: '#F0F0FF' }}>高コントラスト</span>
                <p className="text-xs" style={{ color: '#8888AA' }}>視覚情報の識別を助けます</p>
              </div>
              <button
                type="button"
                onClick={() => updateSetting('high_contrast', !settings.high_contrast)}
                className="w-12 h-7 rounded-full relative transition-all"
                style={{
                  background: settings.high_contrast ? '#6C3CE1' : 'rgba(255,255,255,0.15)',
                }}
              >
                <div className="absolute w-5 h-5 rounded-full top-1 transition-all"
                     style={{
                       background: '#F0F0FF',
                       left: settings.high_contrast ? '26px' : '4px',
                     }} />
              </button>
            </div>

            {/* Tap target size */}
            <div>
              <span className="text-sm font-medium" style={{ color: '#F0F0FF' }}>タップ領域の大きさ</span>
              <p className="text-xs mb-2" style={{ color: '#8888AA' }}>
                運動困難がある場合は「おおきめ」を推奨
              </p>
              <div className="flex gap-2">
                {(['normal', 'large'] as const).map((size) => (
                  <button
                    key={size}
                    onClick={() => updateSetting('tap_target_size', size)}
                    className="flex-1 px-4 py-2.5 text-sm rounded-xl font-bold transition-all"
                    style={{
                      background: settings.tap_target_size === size ? '#6C3CE1' : 'rgba(255,255,255,0.08)',
                      color: settings.tap_target_size === size ? '#FFFFFF' : '#B8B8D0',
                    }}
                  >
                    {size === 'normal' ? 'ふつう' : 'おおきめ'}
                  </button>
                ))}
              </div>
            </div>

            {/* Camera toggle */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium" style={{ color: '#F0F0FF' }}>カメラ（生体推定）</span>
                <p className="text-xs" style={{ color: '#8888AA' }}>注意度・認知負荷の推定に使用</p>
              </div>
              <button
                type="button"
                onClick={() => { setCameraEnabled(!cameraEnabled); setSaved(false); }}
                className="w-12 h-7 rounded-full relative transition-all"
                style={{
                  background: cameraEnabled ? '#4ECDC4' : 'rgba(255,255,255,0.15)',
                }}
              >
                <div className="absolute w-5 h-5 rounded-full top-1 transition-all"
                     style={{
                       background: '#F0F0FF',
                       left: cameraEnabled ? '26px' : '4px',
                     }} />
              </button>
            </div>
          </div>
        </section>

        {/* Sensory settings */}
        <div className="animate-fade-in-up">
          <SensorySettingsSection />
        </div>

        {/* Data management */}
        <section className="p-5 rounded-2xl animate-fade-in-up"
                 style={{ background: 'rgba(42, 42, 90, 0.5)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                 style={{ background: 'rgba(78, 205, 196, 0.2)' }}>
              <LockIcon size={18} style={{ color: '#4ECDC4' }} />
            </div>
            <h2 className="text-base font-bold" style={{ color: '#F0F0FF' }}>
              データ管理
            </h2>
          </div>

          <div className="space-y-1">
            <Link href="/consent"
                  className="w-full flex items-center gap-3 p-3 rounded-xl text-left text-sm transition-colors"
                  style={{ color: '#B8B8D0' }}>
              <ClipboardIcon size={16} style={{ color: '#B8B8D0' }} />
              同意設定の変更
              <svg className="ml-auto" width="16" height="16" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                   style={{ color: '#8888AA' }}>
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </Link>
            <button className="w-full flex items-center gap-3 p-3 rounded-xl text-left text-sm transition-colors"
                    style={{ color: '#B8B8D0' }}>
              <ExportIcon size={16} style={{ color: '#B8B8D0' }} />
              データのエクスポート
              <svg className="ml-auto" width="16" height="16" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                   style={{ color: '#8888AA' }}>
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </button>
            <button className="w-full flex items-center gap-3 p-3 rounded-xl text-left text-sm transition-colors"
                    style={{ color: '#FFD43B' }}>
              <TrashIcon size={16} style={{ color: '#FFD43B' }} />
              データの削除
              <svg className="ml-auto" width="16" height="16" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                   style={{ color: '#FFD43B' }}>
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </button>
          </div>
        </section>

        {/* Save button */}
        <CosmicButton
          variant="primary"
          size="lg"
          className="w-full"
          onClick={handleSave}
        >
          {saved ? '保存しました' : '設定を保存'}
        </CosmicButton>
      </main>
    </div>
  );
}
