import type { AgeGroup } from '@/types';
import type {
  SpeechLevel, TabletOperation, AuditorySensitivity,
  ConcernTag, MascotChoice, Honorific, ConcernSeverity,
} from '@/features/onboarding-profile';

/** Phase of the onboarding flow */
export type OnboardingV2Phase =
  | 'phase1_info'        // 5 screens: age+name+honorific, speech, tablet, auditory, diagnosis
  | 'phase2_assessment'  // 1 + N screens: concerns, then severity per concern
  | 'phase3_calibration' // guidance → character selection → calibration → goal setting
  | 'phase4_signup'      // optional account creation
  | 'complete';

export interface OnboardingV2Data {
  // Phase 1 inputs
  birthYear: number;
  birthMonth: number;
  birthDay: number;
  childName: string;
  honorific: Honorific | '';
  age: number | null;
  speechLevel: SpeechLevel | '';
  tabletOperation: TabletOperation | '';
  auditorySensitivity: AuditorySensitivity | '';
  diagnosisTags: string[];
  idSeverity: string;

  // Phase 2 inputs
  concernTags: ConcernTag[];
  concernSeverities: ConcernSeverity[];
  baselineCategory: string;
  baselineScore: number;

  // Phase 3 inputs
  selectedMascot: MascotChoice | '';
  calibrationResult: {
    touchSuccess: boolean;
    shapeMatchAccuracy: number;
    goNoGoSuccess: boolean;
  } | null;
  calibrationSkipped: boolean;
  dailyGoalMinutes: 5 | 10 | 15 | 20;

  // Derived
  ageGroup: AgeGroup | null;

  // Phase completion flags
  phase1Complete: boolean;
  phase2Complete: boolean;
  phase3Complete: boolean;
  accountCreated: boolean;

  // Phase 4 (signup)
  email: string;
  password: string;
}

export interface OnboardingV2State {
  phase: OnboardingV2Phase;
  phase1ScreenIndex: number; // 0=age+name+honorific, 1=speech, 2=tablet, 3=auditory, 4=diagnosis
  phase2ScreenIndex: number; // 0=concerns, 1..N=severity per concern
  phase3Step: 'guidance' | 'mascot' | 'calibration' | 'goal';
  data: OnboardingV2Data;
}
