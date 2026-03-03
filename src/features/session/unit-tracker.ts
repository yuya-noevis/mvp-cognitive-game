export type SessionType = 'normal' | 'bonus' | 'weakness' | 'review';

interface UnitState {
  unitNumber: number;
  sessionInUnit: number;
  lastCompletedAt: number;
}

const STORAGE_KEY = 'manas-unit-tracker';
const SESSIONS_PER_UNIT = 5;

/** sessionInUnit (1-indexed) → SessionType */
const SESSION_TYPE_MAP: Record<number, SessionType> = {
  1: 'normal',
  2: 'normal',
  3: 'bonus',
  4: 'weakness',
  5: 'review',
};

export function loadUnitState(): UnitState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as UnitState;
  } catch { /* ignore */ }
  return { unitNumber: 1, sessionInUnit: 1, lastCompletedAt: 0 };
}

function saveUnitState(state: UnitState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch { /* ignore */ }
}

export function getSessionType(state: UnitState): SessionType {
  return SESSION_TYPE_MAP[state.sessionInUnit] ?? 'normal';
}

export function advanceUnit(state: UnitState): UnitState {
  const next: UnitState = {
    ...state,
    sessionInUnit: state.sessionInUnit + 1,
    lastCompletedAt: Date.now(),
  };

  if (next.sessionInUnit > SESSIONS_PER_UNIT) {
    next.unitNumber++;
    next.sessionInUnit = 1;
  }

  saveUnitState(next);
  return next;
}
