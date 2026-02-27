import type { OnboardingDataV2, DomainAnswer } from '../types';
import type { AgeGroup } from '@/types';

/* ====== Session Storage ====== */

const STORAGE_KEY = 'manas_onboarding_v2';

export function saveToSession(screenIdx: number, data: OnboardingDataV2) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ screenIdx, data }));
  } catch { /* ignore */ }
}

export function loadFromSession(): { screenIdx: number; data: OnboardingDataV2 } | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return null;
}

export function clearSession() {
  try { sessionStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
}

/* ====== Helpers ====== */

export function birthDateToAge(year: number, month: number, day: number): number {
  const today = new Date();
  let age = today.getFullYear() - year;
  const m = (today.getMonth() + 1) - month;
  if (m < 0 || (m === 0 && today.getDate() < day)) age--;
  return Math.max(0, age);
}

export function ageToAgeGroup(age: number): AgeGroup {
  if (age <= 5) return '3-5';
  return '6-9';
}

export function estimateInitialLevel(answer: DomainAnswer): number {
  switch (answer) {
    case 'yes': return 3;
    case 'no': return 1;
    case 'unknown': return 2;
    case 'skipped': return 2;
  }
}

export function defaultData(): OnboardingDataV2 {
  return {
    email: '',
    password: '',
    birthYear: 2021,
    birthMonth: 1,
    birthDay: 1,
    childName: '',
    speechLevel: '',
    hasEvaluation: 'no',
    disabilities: [],
    concerns: [],
    domainAnswers: {},
    behavioralTraits: [],
    socialTraits: [],
    sensorySensitive: 'skipped',
  };
}

export function buildSupportNeeds(data: OnboardingDataV2): string {
  const parts: string[] = [];
  if (data.disabilities.length > 0) parts.push(`disabilities: ${data.disabilities.join(', ')}`);
  if (data.concerns.length > 0) parts.push(`concerns: ${data.concerns.join(', ')}`);
  if (data.behavioralTraits.length > 0) parts.push(`behavioral: ${data.behavioralTraits.join(', ')}`);
  if (data.socialTraits.length > 0) parts.push(`social: ${data.socialTraits.join(', ')}`);
  return parts.join('; ') || '';
}
