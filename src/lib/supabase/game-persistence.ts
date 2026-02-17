import { supabase } from './client';
import type { DifficultyParams, SessionSummary, SessionEndReason, GameId } from '@/types';
import { isSupabaseEnabled } from './client';

/** Create a new game session in the database */
export async function createGameSession(
  anonChildId: string,
  gameId: GameId,
  initialDifficulty: DifficultyParams,
): Promise<string | null> {
  if (!isSupabaseEnabled) return null;

  const { data, error } = await supabase
    .from('sessions')
    .insert({
      anon_child_id: anonChildId,
      game_id: gameId,
      context: 'home',
      initial_difficulty: initialDifficulty,
    })
    .select('id')
    .single();

  if (error) {
    console.error('Failed to create game session:', error);
    return null;
  }

  return data.id;
}

/** Save a batch of trial records */
export async function saveTrialBatch(
  trials: {
    session_id: string;
    trial_number: number;
    target_domain: string;
    difficulty: DifficultyParams;
    stimulus: Record<string, unknown>;
    correct_answer: Record<string, unknown>;
    response?: Record<string, unknown>;
    is_correct?: boolean;
    reaction_time_ms?: number;
    error_type?: string | null;
    hints_used: number;
    started_at: string;
    ended_at?: string;
  }[],
): Promise<void> {
  if (trials.length === 0) return;
  if (!isSupabaseEnabled) return;

  const { error } = await supabase.from('trials').insert(trials);

  if (error) {
    console.error('Failed to save trial batch:', error);
  }
}

/** End a game session with final data */
export async function endGameSession(
  sessionId: string,
  endReason: SessionEndReason,
  finalDifficulty: DifficultyParams,
  summary: SessionSummary,
): Promise<void> {
  if (!isSupabaseEnabled) return;

  const { error } = await supabase
    .from('sessions')
    .update({
      ended_at: new Date().toISOString(),
      end_reason: endReason,
      final_difficulty: finalDifficulty,
      summary,
    })
    .eq('id', sessionId);

  if (error) {
    console.error('Failed to end game session:', error);
  }
}

/** Save event logs in bulk */
export async function saveEvents(
  events: {
    session_id: string;
    trial_id?: string;
    ts_ms: number;
    event_type: string;
    payload: Record<string, unknown>;
  }[],
): Promise<void> {
  if (events.length === 0) return;
  if (!isSupabaseEnabled) return;

  const { error } = await supabase.from('events').insert(events);

  if (error) {
    console.error('Failed to save events:', error);
  }
}

/** Upsert daily metrics for a domain */
export async function updateDailyMetrics(
  anonChildId: string,
  domain: string,
  metricName: string,
  value: number,
  sessionCount: number,
  trialCount: number,
): Promise<void> {
  if (!isSupabaseEnabled) return;

  const today = new Date().toISOString().split('T')[0];

  const { error } = await supabase
    .from('metrics_daily')
    .upsert(
      {
        anon_child_id: anonChildId,
        date: today,
        domain,
        metric_name: metricName,
        value,
        session_count: sessionCount,
        trial_count: trialCount,
        method_version: 'v1',
      },
      { onConflict: 'anon_child_id,date,domain,metric_name' },
    );

  if (error) {
    console.error('Failed to update daily metrics:', error);
  }
}
