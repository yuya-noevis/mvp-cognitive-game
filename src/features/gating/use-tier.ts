'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Tier } from './tier-system';

const STORAGE_KEY = 'manas_user_tier_v1';
const DEV_OVERRIDE_KEY = 'manas_tier_dev_override';

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

/** localStorage からティアを読み取る */
function loadTier(): Tier | null {
  if (!canUseStorage()) return null;
  try {
    // 開発用オーバーライドがあればそちらを優先
    const override = window.localStorage.getItem(DEV_OVERRIDE_KEY);
    if (override) {
      const parsed = Number(override);
      if (parsed === 1 || parsed === 2 || parsed === 3) return parsed;
    }
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = Number(raw);
    if (parsed === 1 || parsed === 2 || parsed === 3) return parsed;
  } catch { /* ignore */ }
  return null;
}

/** ティアを localStorage に保存する */
export function saveTier(tier: Tier) {
  if (!canUseStorage()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, String(tier));
  } catch { /* ignore */ }
}

/** 開発用: ティアをオーバーライドする */
export function setTierDevOverride(tier: Tier | null) {
  if (!canUseStorage()) return;
  try {
    if (tier === null) {
      window.localStorage.removeItem(DEV_OVERRIDE_KEY);
    } else {
      window.localStorage.setItem(DEV_OVERRIDE_KEY, String(tier));
    }
  } catch { /* ignore */ }
}

/** 現在のティアを取得するhook。デフォルトは Tier 3（全解放） */
export function useTier(): {
  tier: Tier;
  loading: boolean;
  setDevTier: (tier: Tier) => void;
} {
  const [tier, setTier] = useState<Tier>(3);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = loadTier();
    if (stored) setTier(stored);
    setLoading(false);
  }, []);

  const setDevTier = useCallback((newTier: Tier) => {
    setTierDevOverride(newTier);
    setTier(newTier);
  }, []);

  return { tier, loading, setDevTier };
}
