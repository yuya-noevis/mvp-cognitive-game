-- ========================================
-- Prompt 2: Schema Extensions
-- Supabase Integration + Camera Biometrics
-- ========================================

-- 1. Extend children table
ALTER TABLE children
  ADD COLUMN IF NOT EXISTS name TEXT,
  ADD COLUMN IF NOT EXISTS birth_date DATE,
  ADD COLUMN IF NOT EXISTS avatar_id TEXT DEFAULT 'avatar_01',
  ADD COLUMN IF NOT EXISTS parent_role TEXT DEFAULT 'parent' CHECK (parent_role IN ('parent', 'supporter')),
  ADD COLUMN IF NOT EXISTS is_onboarded BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS current_mood TEXT;

-- 2. child_profiles (disability/traits/sensory settings)
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

-- 3. biometric_snapshots (pupil, HR, attention, cognitive load, arousal)
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

-- 4. camera_consents (per-child camera consent)
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

-- 5. ai_reports (4-axis cognitive score reports)
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

-- ========================================
-- RLS Policies for new tables
-- ========================================

ALTER TABLE child_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE biometric_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE camera_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_reports ENABLE ROW LEVEL SECURITY;

-- child_profiles: access through children
CREATE POLICY "parents_own_child_profiles" ON child_profiles
  FOR ALL USING (
    child_id IN (SELECT id FROM children WHERE parent_user_id = auth.uid())
  );

-- biometric_snapshots: access through children
CREATE POLICY "parents_own_biometric_snapshots" ON biometric_snapshots
  FOR ALL USING (
    anon_child_id IN (SELECT anon_child_id FROM children WHERE parent_user_id = auth.uid())
  );

-- camera_consents: access through children
CREATE POLICY "parents_own_camera_consents" ON camera_consents
  FOR ALL USING (
    child_id IN (SELECT id FROM children WHERE parent_user_id = auth.uid())
  );

-- ai_reports: access through children
CREATE POLICY "parents_own_ai_reports" ON ai_reports
  FOR ALL USING (
    anon_child_id IN (SELECT anon_child_id FROM children WHERE parent_user_id = auth.uid())
  );

-- Updated_at triggers for new tables
CREATE TRIGGER child_profiles_updated_at
  BEFORE UPDATE ON child_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER camera_consents_updated_at
  BEFORE UPDATE ON camera_consents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
