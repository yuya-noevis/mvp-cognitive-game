/**
 * DisabilityType の localStorage 永続化
 *
 * オンボーディング完了時に保存し、DDAEngine 起動時に参照する。
 * Dev override 用の別キーも用意。
 */

import type { DisabilityType } from './disability-profile';
import { DDA_PROFILES } from './disability-profile';

const STORAGE_KEY = 'manas_disability_type_v1';
const DEV_OVERRIDE_KEY = 'manas_disability_type_dev_override';

export function saveDisabilityType(type: DisabilityType): void {
  try {
    localStorage.setItem(STORAGE_KEY, type);
  } catch { /* SSR / quota */ }
}

export function loadDisabilityType(): DisabilityType {
  try {
    // Dev override takes priority
    const devOverride = localStorage.getItem(DEV_OVERRIDE_KEY);
    if (devOverride && devOverride in DDA_PROFILES) {
      return devOverride as DisabilityType;
    }

    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && stored in DDA_PROFILES) {
      return stored as DisabilityType;
    }
  } catch { /* SSR / quota */ }
  return 'unknown';
}

export function setDevDisabilityType(type: DisabilityType | null): void {
  try {
    if (type === null) {
      localStorage.removeItem(DEV_OVERRIDE_KEY);
    } else {
      localStorage.setItem(DEV_OVERRIDE_KEY, type);
    }
  } catch { /* SSR / quota */ }
}

export function getDevDisabilityType(): DisabilityType | null {
  try {
    const val = localStorage.getItem(DEV_OVERRIDE_KEY);
    if (val && val in DDA_PROFILES) return val as DisabilityType;
  } catch { /* SSR / quota */ }
  return null;
}
