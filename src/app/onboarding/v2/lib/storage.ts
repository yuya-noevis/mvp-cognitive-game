import type { OnboardingV2State } from '../types';

const STORAGE_KEY = 'manas_onboarding_v3';

export function saveV2State(state: OnboardingV2State): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

export function loadV2State(): OnboardingV2State | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as OnboardingV2State;
  } catch {
    // ignore
  }
  return null;
}

export function clearV2State(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function defaultV2Data(): OnboardingV2State {
  return {
    phase: 'phase1_info',
    phase1ScreenIndex: 0,
    data: {
      birthYear: 2020,
      birthMonth: 1,
      birthDay: 1,
      childName: '',
      speechLevel: '',
      ageGroup: null,
      phase1Complete: false,
      phase2Complete: false,
      accountCreated: false,
      email: '',
      password: '',
    },
  };
}
