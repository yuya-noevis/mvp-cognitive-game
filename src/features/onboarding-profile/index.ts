export type {
  OnboardingProfile,
  SpeechLevel,
  TabletOperation,
  AuditorySensitivity,
  MascotChoice,
  Honorific,
  ConcernTag,
  DiagnosisTag,
  IdSeverity,
  ConcernSeverity,
  WeeklyCheckin,
} from './types';
export { DEFAULT_ONBOARDING_PROFILE, getChildName } from './types';

import type { OnboardingProfile, WeeklyCheckin } from './types';
import { DEFAULT_ONBOARDING_PROFILE } from './types';

const STORAGE_KEY = 'manas_onboarding_profile_v1';

function canUseStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

/** Lazy-load Supabase client to avoid SSR/static-generation crashes */
function getSupabase() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const mod = require('@/lib/supabase/client');
  return {
    isEnabled: mod.isSupabaseEnabled as boolean,
    client: mod.supabase,
  };
}

export function loadOnboardingProfile(): OnboardingProfile {
  if (!canUseStorage()) return { ...DEFAULT_ONBOARDING_PROFILE };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_ONBOARDING_PROFILE };
    return { ...DEFAULT_ONBOARDING_PROFILE, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_ONBOARDING_PROFILE };
  }
}

/**
 * Save onboarding profile to localStorage + Supabase (if enabled).
 * @param profile - The profile data to save
 * @param childId - Optional Supabase child UUID. If provided and Supabase is enabled, writes to child_profiles.
 */
export async function saveOnboardingProfile(
  profile: OnboardingProfile,
  childId?: string,
): Promise<void> {
  // 1. Always save to localStorage (offline-first, backward compat)
  if (canUseStorage()) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch {
      // ignore quota / privacy mode
    }
  }

  // 2. If Supabase is enabled and childId is provided, upsert to child_profiles
  if (!childId) return;

  try {
    const { isEnabled, client } = getSupabase();
    if (!isEnabled) return;

    const { error } = await client
      .from('child_profiles')
      .upsert({
        child_id: childId,
        honorific: profile.honorific ?? 'kun',
        speech_level: profile.speech_level ?? null,
        tablet_operation: profile.tablet_operation ?? null,
        auditory_sensitivity: profile.auditory_sensitivity ?? null,
        diagnosis_tags: profile.diagnosis_tags ?? [],
        id_severity: profile.id_severity ?? null,
        concern_tags: profile.concern_tags ?? [],
        concern_severities: profile.concern_severities ?? [],
        daily_goal_minutes: profile.daily_goal_minutes ?? 10,
        calibration_skipped: profile.calibration_skipped ?? false,
        calibration_tier: null,
        baseline_score: profile.baseline_score ?? null,
        baseline_category: profile.baseline_category ?? null,
        baseline_date: profile.baseline_date || null,
        companion_mode: profile.companion_mode ?? false,
        disability_types: profile.diagnosis_tags ?? [],
        sensory_settings: {
          auditory_sensitivity: profile.auditory_sensitivity,
          tablet_operation: profile.tablet_operation,
        },
      }, { onConflict: 'child_id' });

    if (error) {
      console.warn('[saveOnboardingProfile] Supabase upsert failed:', error.message);
    }
  } catch (e) {
    console.warn('[saveOnboardingProfile] Supabase write error:', e);
  }
}

export async function addWeeklyCheckin(checkin: WeeklyCheckin, childId?: string): Promise<void> {
  const profile = loadOnboardingProfile();
  profile.weekly_checkins.push(checkin);
  await saveOnboardingProfile(profile);

  // Also write to Supabase weekly_checkins table if possible
  if (!childId) return;

  try {
    const { isEnabled, client } = getSupabase();
    if (!isEnabled) return;

    // Map score to response label
    let response: 'daily' | 'weekly' | 'rarely' = 'weekly';
    if (checkin.score >= 5) response = 'daily';
    else if (checkin.score >= 2) response = 'weekly';
    else response = 'rarely';

    const weekStart = getWeekStart();
    await client.from('weekly_checkins').insert({
      child_id: childId,
      concern_category: checkin.category,
      response,
      week_start: weekStart,
    });
  } catch (e) {
    console.warn('[addWeeklyCheckin] Supabase write error:', e);
  }
}

/** Get the Monday of the current week as YYYY-MM-DD */
function getWeekStart(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? 6 : day - 1;
  const monday = new Date(now);
  monday.setDate(now.getDate() - diff);
  return monday.toISOString().split('T')[0];
}
