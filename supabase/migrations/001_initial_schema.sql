-- ========================================
-- Manas MVP - Initial Database Schema
-- ========================================

-- 1. children（子どもプロフィール）
CREATE TABLE children (
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

CREATE INDEX idx_children_parent ON children(parent_user_id);

-- 2. sessions（ゲームセッション）
CREATE TABLE sessions (
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

CREATE INDEX idx_sessions_child ON sessions(anon_child_id);
CREATE INDEX idx_sessions_game ON sessions(game_id);
CREATE INDEX idx_sessions_started ON sessions(started_at);

-- 3. trials（トライアル単位）
CREATE TABLE trials (
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

CREATE INDEX idx_trials_session ON trials(session_id);
CREATE INDEX idx_trials_domain ON trials(target_domain);

-- 4. events（ミリ秒粒度の行動ログ）
CREATE TABLE events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id      UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  trial_id        UUID REFERENCES trials(id) ON DELETE SET NULL,
  ts_ms           BIGINT NOT NULL,
  event_type      TEXT NOT NULL,
  payload         JSONB DEFAULT '{}'
);

CREATE INDEX idx_events_session ON events(session_id);
CREATE INDEX idx_events_trial ON events(trial_id);
CREATE INDEX idx_events_type ON events(event_type);
CREATE INDEX idx_events_ts ON events(ts_ms);

-- 5. metrics_daily（日次集計指標）
CREATE TABLE metrics_daily (
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

CREATE INDEX idx_metrics_child_date ON metrics_daily(anon_child_id, date);

-- 6. reports（レポート）
CREATE TABLE reports (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  anon_child_id   TEXT NOT NULL REFERENCES children(anon_child_id) ON DELETE CASCADE,
  period_type     TEXT NOT NULL CHECK (period_type IN ('session', 'daily', 'weekly')),
  period_start    DATE NOT NULL,
  period_end      DATE NOT NULL,
  content         JSONB NOT NULL,
  generated_at    TIMESTAMPTZ DEFAULT now(),
  method_version  TEXT NOT NULL DEFAULT 'v1'
);

CREATE INDEX idx_reports_child ON reports(anon_child_id);

-- ========================================
-- RLS (Row Level Security)
-- ========================================

ALTER TABLE children ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE trials ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE metrics_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Parents can only access their own children
CREATE POLICY "parents_own_children" ON children
  FOR ALL USING (parent_user_id = auth.uid());

-- Sessions: access through children
CREATE POLICY "parents_own_sessions" ON sessions
  FOR ALL USING (
    anon_child_id IN (SELECT anon_child_id FROM children WHERE parent_user_id = auth.uid())
  );

-- Trials: access through sessions → children
CREATE POLICY "parents_own_trials" ON trials
  FOR ALL USING (
    session_id IN (
      SELECT s.id FROM sessions s
      JOIN children c ON s.anon_child_id = c.anon_child_id
      WHERE c.parent_user_id = auth.uid()
    )
  );

-- Events: access through sessions → children
CREATE POLICY "parents_own_events" ON events
  FOR ALL USING (
    session_id IN (
      SELECT s.id FROM sessions s
      JOIN children c ON s.anon_child_id = c.anon_child_id
      WHERE c.parent_user_id = auth.uid()
    )
  );

-- Metrics: access through children
CREATE POLICY "parents_own_metrics" ON metrics_daily
  FOR ALL USING (
    anon_child_id IN (SELECT anon_child_id FROM children WHERE parent_user_id = auth.uid())
  );

-- Reports: access through children
CREATE POLICY "parents_own_reports" ON reports
  FOR ALL USING (
    anon_child_id IN (SELECT anon_child_id FROM children WHERE parent_user_id = auth.uid())
  );

-- Updated_at trigger for children
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
