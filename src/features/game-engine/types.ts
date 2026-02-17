import type {
  TrialPhase,
  DifficultyParams,
  TrialResponse,
  ErrorType,
  AdaptiveChange,
  SafetyAction,
  GameConfig,
} from '@/types';

/** State of a single trial within the engine */
export interface TrialState {
  trialId: string;
  trialNumber: number;
  phase: TrialPhase;
  difficulty: DifficultyParams;
  stimulus: Record<string, unknown>;
  correctAnswer: Record<string, unknown>;
  response: TrialResponse | null;
  isCorrect: boolean | null;
  reactionTimeMs: number | null;
  errorType: ErrorType;
  hintsUsed: number;
  startedAt: number;     // epoch ms
  stimulusPresentedAt: number | null;
}

/** State of the entire game session */
export interface GameSessionState {
  sessionId: string;
  gameConfig: GameConfig;
  currentTrial: TrialState | null;
  trialNumber: number;
  totalCorrect: number;
  totalTrials: number;
  isBreakActive: boolean;
  isSessionEnded: boolean;
  endReason: string | null;
  adaptiveChanges: AdaptiveChange[];
  safetyActions: SafetyAction[];
}

/** Actions the game component can dispatch */
export type GameAction =
  | { type: 'START_SESSION' }
  | { type: 'START_TRIAL'; stimulus: Record<string, unknown>; correctAnswer: Record<string, unknown> }
  | { type: 'PRESENT_STIMULUS' }
  | { type: 'RECORD_RESPONSE'; response: TrialResponse }
  | { type: 'USE_HINT' }
  | { type: 'COMPLETE_TRIAL'; isCorrect: boolean; errorType: ErrorType }
  | { type: 'START_BREAK' }
  | { type: 'END_BREAK' }
  | { type: 'END_SESSION'; reason: string };
