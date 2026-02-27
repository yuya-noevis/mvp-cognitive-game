'use client';

import { useState, useEffect, useCallback } from 'react';
import type { InstructionLevel } from './instruction-level';

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

/** 現在の指示レベルを取得するhook。デフォルトは L3 */
export function useInstructionLevel(): {
  instructionLevel: InstructionLevel;
  loading: boolean;
  setDevInstructionLevel: (level: InstructionLevel) => void;
} {
  const [instructionLevel, setInstructionLevel] = useState<InstructionLevel>('L3');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = loadInstructionLevel();
    if (stored) setInstructionLevel(stored);
    setLoading(false);
  }, []);

  const setDevInstructionLevel = useCallback((newLevel: InstructionLevel) => {
    setInstructionLevelDevOverride(newLevel);
    setInstructionLevel(newLevel);
  }, []);

  return { instructionLevel, loading, setDevInstructionLevel };
}
