import type { SensorySettings } from './types';
import { DEFAULT_SENSORY_SETTINGS } from './types';

const STORAGE_KEY = 'manas_sensory_settings_v1';

function canUseStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function loadSensorySettings(): SensorySettings {
  if (!canUseStorage()) return { ...DEFAULT_SENSORY_SETTINGS };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_SENSORY_SETTINGS };
    const parsed = JSON.parse(raw) as Partial<SensorySettings>;
    return { ...DEFAULT_SENSORY_SETTINGS, ...parsed };
  } catch {
    return { ...DEFAULT_SENSORY_SETTINGS };
  }
}

export function saveSensorySettings(settings: SensorySettings): void {
  if (!canUseStorage()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // ignore quota / privacy mode errors
  }
}
