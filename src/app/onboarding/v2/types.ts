import type { AgeGroup } from '@/types';

/** Phase of the new 3-screen onboarding flow */
export type OnboardingV2Phase =
  | 'phase1_info'   // 3 screens: birthdate, name, speech level
  | 'phase2_game'   // calibration game demo
  | 'phase3_signup' // optional account creation
  | 'complete';

export interface OnboardingV2Data {
  // Phase 1 inputs
  birthYear: number;
  birthMonth: number;
  birthDay: number;
  childName: string;
  speechLevel: '' | 'nonverbal' | 'nonverbal_yesno' | 'single_words' | 'partial_verbal' | 'verbal';

  // Derived
  ageGroup: AgeGroup | null;

  // Phase completion flags
  phase1Complete: boolean;
  phase2Complete: boolean;
  accountCreated: boolean;

  // Phase 3 (signup)
  email: string;
  password: string;
}

export type Phase1ScreenId = 'birthdate' | 'name' | 'speech';

export interface OnboardingV2State {
  phase: OnboardingV2Phase;
  phase1ScreenIndex: number; // 0=birthdate, 1=name, 2=speech
  data: OnboardingV2Data;
}
