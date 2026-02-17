-- ========================================
-- Combined Migration: 001 + 002
-- Run this in Supabase Dashboard → SQL Editor
-- ========================================

-- ========================================
-- 001: Initial Schema
-- ========================================

-- 1. children
CREATE TABLE IF NOT EXISTS children (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  anon_child_id   TEXT UNIQUE NOT NULL,
  parent_user_id  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name    TEXT NOT NULL,
  birth_year_month TEXT,
  age_group       TEXT NOT NULL CHECK (age_group IN ('3-5', '6-9', '10-15')),
  support_needs   JSONB DEFAULT '{}',
  settings        JSONB DEFAULT '{"sound_enabled":true,"animation_speed":"normal","flash_disabled":false,"high_contrast":false,"tap_target_size":"normal"}',
  consent_flags   JSONB DEFAULT '{"data_optimization":false,"research_use":false,"biometric":false}',
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_children_parent ON children(parent_user_id);

-- 2. sessions
CREATE TABLE IF NOT EXISTS sessions (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  anon_child_id      TEXT NOT NULL REFERENCES children(anon_child_id) ON DELETE CASCADE,
  game_id            TEXT NOT NULL,
  context            TEXT DEFAULT 'home' CHECK (context IN ('home', 'school', 'facility')),
  started_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at           TIMESTAMPTZ,
  end_reason         TEXT CHECK (end_reason IN ('completed', 'break_suggested', 'user_quit', 'parent_stopped')),
  initial_difficulty JSONB,
  final_difficulty   JSONB,
  summary            JSONB DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_sessions_child ON sessions(anon_child_id);
CREATE INDEX IF NOT EXISTS idx_sessions_game ON sessions(game_id);
CREATE INDEX IF NOT EXISTS idx_sessions_started ON sessions(started_at);

-- 3. trials
CREATE TABLE IF NOT EXISTS trials (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id      UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  trial_number    INT NOT NULL,
  target_domain   TEXT NOT NULL,
  difficulty      JSONB NOT NULL,
  stimulus        JSONB NOT NULL,
  correct_answer  JSONB NOT NULL,
  response        JSONB,
  is_correct      BOOLEAN,
  reaction_time_ms INT,
  error_type      TEXT,
  hints_used      INT DEFAULT 0,
  started_at      TIMESTAMPTZ NOT NULL,
  ended_at        TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_trials_session ON trials(session_id);
CREATE INDEX IF NOT EXISTS idx_trials_domain ON trials(target_domain);

-- 4. events
CREATE TABLE IF NOT EXISTS events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id      UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  trial_id        UUID REFERENCES trials(id) ON DELETE SET NULL,
  ts_ms           BIGINT NOT NULL,
  event_type      TEXT NOT NULL,
  payload         JSONB DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_events_session ON events(session_id);
CREATE INDEX IF NOT EXISTS idx_events_trial ON events(trial_id);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_ts ON events(ts_ms);

-- 5. metrics_daily
CREATE TABLE IF NOT EXISTS metrics_daily (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  anon_child_id   TEXT NOT NULL REFERENCES children(anon_child_id) ON DELETE CASCADE,
  date            DATE NOT NULL,
  domain          TEXT NOT NULL,
  metric_name     TEXT NOT NULL,
  value           NUMERIC NOT NULL,
  confidence      TEXT DEFAULT 'standard' CHECK (confidence IN ('standard', 'low_trial_count', 'hypothesis')),
  method_version  TEXT NOT NULL DEFAULT 'v1',
  session_count   INT,
  trial_count     INT,
  UNIQUE(anon_child_id, date, domain, metric_name)
);

CREATE INDEX IF NOT EXISTS idx_metrics_child_date ON metrics_daily(anon_child_id, date);

-- 6. reports
CREATE TABLE IF NOT EXISTS reports (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  anon_child_id   TEXT NOT NULL REFERENCES children(anon_child_id) ON DELETE CASCADE,
  period_type     TEXT NOT NULL CHECK (period_type IN ('session', 'daily', 'weekly')),
  period_start    DATE NOT NULL,
  period_end      DATE NOT NULL,
  content         JSONB NOT NULL,
  generated_at    TIMESTAMPTZ DEFAULT now(),
  method_version  TEXT NOT NULL DEFAULT 'v1'
);

CREATE INDEX IF NOT EXISTS idx_reports_child ON reports(anon_child_id);

-- ========================================
-- RLS (Row Level Security)
-- ========================================

ALTER TABLE children ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE trials ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE metrics_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "parents_own_children" ON children
  FOR ALL USING (parent_user_id = auth.uid());

CREATE POLICY "parents_own_sessions" ON sessions
  FOR ALL USING (
    anon_child_id IN (SELECT anon_child_id FROM children WHERE parent_user_id = auth.uid())
  );

CREATE POLICY "parents_own_trials" ON trials
  FOR ALL USING (
    session_id IN (
      SELECT s.id FROM sessions s
      JOIN children c ON s.anon_child_id = c.anon_child_id
      WHERE c.parent_user_id = auth.uid()
    )
  );

CREATE POLICY "parents_own_events" ON events
  FOR ALL USING (
    session_id IN (
      SELECT s.id FROM sessions s
      JOIN children c ON s.anon_child_id = c.anon_child_id
      WHERE c.parent_user_id = auth.uid()
    )
  );

CREATE POLICY "parents_own_metrics" ON metrics_daily
  FOR ALL USING (
    anon_child_id IN (SELECT anon_child_id FROM children WHERE parent_user_id = auth.uid())
  );

CREATE POLICY "parents_own_reports" ON reports
  FOR ALL USING (
    anon_child_id IN (SELECT anon_child_id FROM children WHERE parent_user_id = auth.uid())
  );

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER children_updated_at
  BEFORE UPDATE ON children
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ========================================
-- 002: Prompt 2 Extensions
-- ========================================

ALTER TABLE children
  ADD COLUMN IF NOT EXISTS name TEXT,
  ADD COLUMN IF NOT EXISTS birth_date DATE,
  ADD COLUMN IF NOT EXISTS avatar_id TEXT DEFAULT 'avatar_01',
  ADD COLUMN IF NOT EXISTS parent_role TEXT DEFAULT 'parent',
  ADD COLUMN IF NOT EXISTS is_onboarded BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS current_mood TEXT;

-- child_profiles
CREATE TABLE IF NOT EXISTS child_profiles (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id          UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE UNIQUE,
  disability_types  JSONB DEFAULT '[]',
  severity          TEXT,
  traits            JSONB DEFAULT '[]',
  sensory_settings  JSONB DEFAULT '{}',
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_child_profiles_child ON child_profiles(child_id);

-- biometric_snapshots
CREATE TABLE IF NOT EXISTS biometric_snapshots (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id      UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  anon_child_id   TEXT NOT NULL REFERENCES children(anon_child_id) ON DELETE CASCADE,
  ts_ms           BIGINT NOT NULL,
  pupil_diameter  NUMERIC,
  heart_rate_bpm  NUMERIC,
  attention_score NUMERIC CHECK (attention_score >= 0 AND attention_score <= 100),
  cognitive_load  NUMERIC CHECK (cognitive_load >= 0 AND cognitive_load <= 100),
  arousal_level   NUMERIC CHECK (arousal_level >= 0 AND arousal_level <= 100),
  raw_data        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_biometric_session ON biometric_snapshots(session_id);
CREATE INDEX IF NOT EXISTS idx_biometric_child ON biometric_snapshots(anon_child_id);
CREATE INDEX IF NOT EXISTS idx_biometric_ts ON biometric_snapshots(ts_ms);

-- camera_consents
CREATE TABLE IF NOT EXISTS camera_consents (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id        UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  consented       BOOLEAN NOT NULL DEFAULT FALSE,
  consented_at    TIMESTAMPTZ,
  revoked_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_camera_consents_child ON camera_consents(child_id);

-- ai_reports
CREATE TABLE IF NOT EXISTS ai_reports (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  anon_child_id   TEXT NOT NULL REFERENCES children(anon_child_id) ON DELETE CASCADE,
  report_type     TEXT NOT NULL DEFAULT 'cognitive_4axis',
  scores          JSONB NOT NULL DEFAULT '{}',
  insights        JSONB DEFAULT '[]',
  recommendations JSONB DEFAULT '[]',
  generated_at    TIMESTAMPTZ DEFAULT now(),
  method_version  TEXT NOT NULL DEFAULT 'v1'
);

CREATE INDEX IF NOT EXISTS idx_ai_reports_child ON ai_reports(anon_child_id);

-- RLS for new tables
ALTER TABLE child_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE biometric_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE camera_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "parents_own_child_profiles" ON child_profiles
  FOR ALL USING (
    child_id IN (SELECT id FROM children WHERE parent_user_id = auth.uid())
  );

CREATE POLICY "parents_own_biometric_snapshots" ON biometric_snapshots
  FOR ALL USING (
    anon_child_id IN (SELECT anon_child_id FROM children WHERE parent_user_id = auth.uid())
  );

CREATE POLICY "parents_own_camera_consents" ON camera_consents
  FOR ALL USING (
    child_id IN (SELECT id FROM children WHERE parent_user_id = auth.uid())
  );

CREATE POLICY "parents_own_ai_reports" ON ai_reports
  FOR ALL USING (
    anon_child_id IN (SELECT anon_child_id FROM children WHERE parent_user_id = auth.uid())
  );

CREATE TRIGGER child_profiles_updated_at
  BEFORE UPDATE ON child_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER camera_consents_updated_at
  BEFORE UPDATE ON camera_consents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
