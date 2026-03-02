'use client';

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { SensorySettings } from './types';
import { DEFAULT_SENSORY_SETTINGS, animationSpeedToMultiplier } from './types';
import { loadSensorySettings, saveSensorySettings } from './storage';

export interface SensorySettingsContextValue {
  settings: SensorySettings;
  updateSettings: (patch: Partial<SensorySettings>) => void;
}

const SensorySettingsContext = createContext<SensorySettingsContextValue>({
  settings: DEFAULT_SENSORY_SETTINGS,
  updateSettings: () => undefined,
});

/**
 * SensorySettingsProvider
 *
 * - localStorageから設定を読み込む（SSR安全）
 * - 設定変更時にCSS変数を即時反映:
 *     --animation-duration-multiplier
 *     data-animation="none" / "slow" / "normal"
 */
export function SensorySettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SensorySettings>(DEFAULT_SENSORY_SETTINGS);
  const mountedRef = useRef(false);

  // クライアントでのみlocalStorageを読む
  useEffect(() => {
    const stored = loadSensorySettings();
    setSettings(stored);
    applyAnimationCss(stored.animationSpeed);
    mountedRef.current = true;
  }, []);

  const updateSettings = useCallback((patch: Partial<SensorySettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      saveSensorySettings(next);
      if (patch.animationSpeed !== undefined) {
        applyAnimationCss(next.animationSpeed);
      }
      return next;
    });
  }, []);

  return (
    <SensorySettingsContext value={{ settings, updateSettings }}>
      {children}
    </SensorySettingsContext>
  );
}

export function useSensorySettings(): SensorySettingsContextValue {
  return useContext(SensorySettingsContext);
}

// === CSS変数の即時反映 ===

function applyAnimationCss(speed: SensorySettings['animationSpeed']): void {
  if (typeof document === 'undefined') return;
  const multiplier = animationSpeedToMultiplier(speed);

  // CSS変数: アニメーション持続時間倍率
  document.documentElement.style.setProperty(
    '--animation-duration-multiplier',
    String(multiplier),
  );

  // data属性: アニメーション「なし」モードの強制停止
  document.documentElement.setAttribute('data-animation', speed);
}
