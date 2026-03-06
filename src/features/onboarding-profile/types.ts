export type SpeechLevel = 'nonverbal' | 'single_word' | 'two_word' | 'short_sentence' | 'conversational';
export type TabletOperation = 'independent' | 'assisted' | 'not_yet';
export type AuditorySensitivity = 'severe' | 'mild' | 'none' | 'enjoys';
export type MascotChoice = 'luna' | 'mogura';
export type Honorific = 'kun' | 'chan' | 'name_only';

export type ConcernTag =
  | 'emotion_regulation'
  | 'attention'
  | 'communication'
  | 'social'
  | 'learning'
  | 'motor'
  | 'flexibility'
  | 'memory';

export type DiagnosisTag = 'asd' | 'adhd' | 'id' | 'ld' | 'down_syndrome' | 'undiagnosed' | 'unknown';
export type IdSeverity = 'id_mild' | 'id_moderate' | 'id_severe' | 'id_unknown';

export interface ConcernSeverity {
  category: string;
  severity: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  recordedAt: string;
}

export interface WeeklyCheckin {
  date: string;
  score: number;
  category: string;
}

export interface OnboardingProfile {
  speech_level: SpeechLevel;
  tablet_operation: TabletOperation;
  auditory_sensitivity: AuditorySensitivity;
  honorific: Honorific;
  diagnosis_tags: string[];
  id_severity: IdSeverity | null;
  concern_tags: ConcernTag[];
  concern_severities: ConcernSeverity[];
  baseline_category: string;
  baseline_score: number;
  baseline_date: string;
  selected_mascot: MascotChoice;
  daily_goal_minutes: 5 | 10 | 15 | 20;
  calibration_skipped: boolean;
  weekly_checkins: WeeklyCheckin[];
  companion_mode: boolean;
  onboarding_completed: boolean;
  expectation_shown: boolean;
}

export const DEFAULT_ONBOARDING_PROFILE: OnboardingProfile = {
  speech_level: 'single_word',
  tablet_operation: 'independent',
  auditory_sensitivity: 'none',
  honorific: 'kun',
  diagnosis_tags: [],
  id_severity: null,
  concern_tags: [],
  concern_severities: [],
  baseline_category: '',
  baseline_score: 0,
  baseline_date: '',
  selected_mascot: 'luna',
  daily_goal_minutes: 10,
  calibration_skipped: false,
  weekly_checkins: [],
  companion_mode: false,
  onboarding_completed: false,
  expectation_shown: false,
};

/**
 * Display child name with honorific.
 * Used across all onboarding screens and messages.
 */
export function getChildName(name: string, honorific: Honorific | ''): string {
  if (!name) return 'お子さま';
  if (!honorific || honorific === 'name_only') return name;
  if (honorific === 'kun') return `${name}くん`;
  if (honorific === 'chan') return `${name}ちゃん`;
  return name;
}
