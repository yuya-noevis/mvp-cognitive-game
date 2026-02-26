import type { Expression } from '@/components/mascot/Mogura';

export type YesNoAnswer = 'yes' | 'no' | 'unknown';
export type DomainAnswer = 'yes' | 'no' | 'unknown' | 'skipped';

export interface OnboardingDataV2 {
  email: string;
  password: string;
  childAge: number;
  childName: string;
  speechLevel: 'nonverbal' | 'nonverbal_yesno' | 'single_words' | 'partial_verbal' | 'verbal';
  hasEvaluation: YesNoAnswer;
  disabilities: string[];
  concerns: string[];
  domainAnswers: Record<string, DomainAnswer>;
  behavioralTraits: string[];
  socialTraits: string[];
  sensorySensitive: DomainAnswer;
}

export type ScreenType = 'account' | 'single_select' | 'text_input' | 'yes_no' | 'multi_chips' | 'complete';

export type Phase = 'account' | 'preliminary' | 'disability' | 'cognitive' | 'social' | 'motor' | 'traits' | 'complete';

export interface ScreenDef {
  id: number;
  type: ScreenType;
  phase: Phase;
  phaseLabel?: string;
  phaseColor?: string;
  expression: Expression;
  expressionSize: number;
  title: string;
  subtitle?: string;
  domain?: string;
  dataKey: string;
  skippable: boolean;
  condition?: (data: OnboardingDataV2) => boolean;
  options?: { label: string; value: string; category?: string }[];
}
