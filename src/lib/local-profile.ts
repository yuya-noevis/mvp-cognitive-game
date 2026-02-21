import type { AgeGroup, ChildSettings } from '@/types';

export interface LocalChildProfile {
  id: string; // local id
  anonChildId: string;
  displayName: string;
  ageGroup: AgeGroup;
  avatarId: string;
  settings: Record<string, unknown>;
  consentFlags: Record<string, boolean>;
}

const KEY_CHILD = 'manas_child_profile_v1';
const KEY_SETTINGS = 'manas_child_settings_v1';
const KEY_CONSENTS = 'manas_child_consents_v1';

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function loadJson<T>(key: string, fallback: T): T {
  if (!canUseStorage()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function saveJson<T>(key: string, value: T) {
  if (!canUseStorage()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore quota / privacy mode
  }
}

export function getLocalChildProfile(): LocalChildProfile | null {
  return loadJson<LocalChildProfile | null>(KEY_CHILD, null);
}

export function setLocalChildProfile(profile: LocalChildProfile) {
  saveJson(KEY_CHILD, profile);
}

export function getLocalConsents(): Record<string, boolean> {
  return loadJson<Record<string, boolean>>(KEY_CONSENTS, {
    data_optimization: false,
    research_use: false,
    biometric: false,
  });
}

export function setLocalConsents(consents: Record<string, boolean>) {
  saveJson(KEY_CONSENTS, consents);
}

export function getLocalChildSettings(): ChildSettings | null {
  return loadJson<ChildSettings | null>(KEY_SETTINGS, null);
}

export function setLocalChildSettings(settings: ChildSettings) {
  saveJson(KEY_SETTINGS, settings);
}

export function clearLocalProfile() {
  if (!canUseStorage()) return;
  try {
    window.localStorage.removeItem(KEY_CHILD);
    window.localStorage.removeItem(KEY_SETTINGS);
    window.localStorage.removeItem(KEY_CONSENTS);
  } catch {
    // ignore
  }
}
