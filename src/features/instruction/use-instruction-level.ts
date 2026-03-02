'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Tier } from '@/features/gating';
import type { InstructionLevel } from './instruction-level';
import { getDefaultInstructionLevel } from './instruction-level';

const STORAGE_KEY = 'manas_instruction_level_v1';
const DEV_OVERRIDE_KEY = 'manas_instruction_level_dev_override';

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function loadInstructionLevel(): InstructionLevel | null {
  if (!canUseStorage()) return null;
  try {
    const override = window.localStorage.getItem(DEV_OVERRIDE_KEY);
    if (override && isValidLevel(override)) return override as InstructionLevel;
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw && isValidLevel(raw)) return raw as InstructionLevel;
  } catch { /* ignore */ }
  return null;
}

function isValidLevel(value: string): value is InstructionLevel {
  return value === 'L1' || value === 'L2' || value === 'L3' || value === 'L4';
}

/** 指示レベルを localStorage に保存する */
export function saveInstructionLevel(level: InstructionLevel) {
  if (!canUseStorage()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, level);
  } catch { /* ignore */ }
}

/** 開発用: 指示レベルをオーバーライドする */
export function setInstructionLevelDevOverride(level: InstructionLevel | null) {
  if (!canUseStorage()) return;
  try {
    if (level === null) {
      window.localStorage.removeItem(DEV_OVERRIDE_KEY);
    } else {
      window.localStorage.setItem(DEV_OVERRIDE_KEY, level);
    }
  } catch { /* ignore */ }
}

/**
 * 有効な指示レベルを決定する。
 *
 * 優先順位:
 *   1. 開発用オーバーライド (Dev Override)
 *   2. 保護者が手動設定した値 (STORAGE_KEY)
 *   3. ティアから自動決定されたデフォルト値
 *
 * 保護者が手動設定した値とティアのデフォルト値が異なる場合、
 * より低い（シンプルな）方を採用する。ただし保護者が L4 を設定した場合はそれを尊重する。
 */
export function resolveInstructionLevel(
  storedLevel: InstructionLevel | null,
  tier: Tier,
): InstructionLevel {
  const tierDefault = getDefaultInstructionLevel(tier);

  if (storedLevel === null) {
    // 保護者が設定していない → ティアのデフォルトを使用
    return tierDefault;
  }

  // L4 は保護者が手動設定した場合のみ有効（自動適用しない）
  if (storedLevel === 'L4') {
    return 'L4';
  }

  // 保護者設定とティアデフォルトのうち低い（シンプルな）方を採用
  const LEVEL_ORDER: Record<InstructionLevel, number> = { L1: 1, L2: 2, L3: 3, L4: 4 };
  return LEVEL_ORDER[storedLevel] <= LEVEL_ORDER[tierDefault]
    ? storedLevel
    : tierDefault;
}

/**
 * 現在の指示レベルを取得するhook。
 *
 * tier が渡された場合、ティアに基づくデフォルト指示レベルと
 * ユーザー設定の指示レベルのうち、低い（シンプルな）方を使用する。
 * tier が省略された場合は従来通り localStorage の値（デフォルト L3）を使用する。
 */
export function useInstructionLevel(tier?: Tier): {
  instructionLevel: InstructionLevel;
  loading: boolean;
  setInstructionLevel: (level: InstructionLevel) => void;
  setDevInstructionLevel: (level: InstructionLevel) => void;
} {
  const [instructionLevel, setInstructionLevelState] = useState<InstructionLevel>('L3');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = loadInstructionLevel();
    if (tier !== undefined) {
      // ティア連動モード: ティアのデフォルトとユーザー設定のうち低い方
      const resolved = resolveInstructionLevel(stored, tier);
      setInstructionLevelState(resolved);
    } else {
      // 後方互換モード: localStorage の値を使用
      if (stored) setInstructionLevelState(stored);
    }
    setLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tier]);

  /** 保護者による手動設定（永続化） */
  const setInstructionLevel = useCallback((newLevel: InstructionLevel) => {
    saveInstructionLevel(newLevel);
    setInstructionLevelState(newLevel);
  }, []);

  /** 開発用: オーバーライド（再読み込みで適用） */
  const setDevInstructionLevel = useCallback((newLevel: InstructionLevel) => {
    setInstructionLevelDevOverride(newLevel);
    setInstructionLevelState(newLevel);
  }, []);

  return { instructionLevel, loading, setInstructionLevel, setDevInstructionLevel };
}
