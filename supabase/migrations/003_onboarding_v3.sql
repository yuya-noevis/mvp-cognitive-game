-- ========================================
-- 003: Onboarding v3 Extensions
-- Add onboarding profile fields to child_profiles
-- + weekly_checkins table
-- ========================================

-- 1. Extend child_profiles with onboarding v3 fields
ALTER TABLE child_profiles
  ADD COLUMN IF NOT EXISTS honorific text DEFAULT 'kun'
    CHECK (honorific IN ('kun', 'chan', 'name_only')),
  ADD COLUMN IF NOT EXISTS speech_level text,
  ADD COLUMN IF NOT EXISTS tablet_operation text
    CHECK (tablet_operation IN ('independent', 'assisted', 'not_yet')),
  ADD COLUMN IF NOT EXISTS auditory_sensitivity text
    CHECK (auditory_sensitivity IN ('severe', 'mild', 'none', 'enjoys')),
  ADD COLUMN IF NOT EXISTS diagnosis_tags jsonb DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS id_severity text
    CHECK (id_severity IN ('mild', 'moderate', 'severe', 'unknown')),
  ADD COLUMN IF NOT EXISTS concern_tags jsonb DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS concern_severities jsonb DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS daily_goal_minutes integer DEFAULT 10
    CHECK (daily_goal_minutes IN (5, 10, 15, 20)),
  ADD COLUMN IF NOT EXISTS calibration_skipped boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS calibration_tier integer
    CHECK (calibration_tier IN (1, 2, 3)),
  ADD COLUMN IF NOT EXISTS baseline_score numeric,
  ADD COLUMN IF NOT EXISTS baseline_category text,
  ADD COLUMN IF NOT EXISTS baseline_date date,
  ADD COLUMN IF NOT EXISTS companion_mode boolean DEFAULT false;

-- 2. Ensure children.display_name exists (should already from 001)
ALTER TABLE children
  ADD COLUMN IF NOT EXISTS display_name text;

-- 3. weekly_checkins table
CREATE TABLE IF NOT EXISTS weekly_checkins (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id uuid REFERENCES children(id) ON DELETE CASCADE,
  concern_category text NOT NULL,
  response text NOT NULL CHECK (response IN ('daily', 'weekly', 'rarely')),
  week_start date NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE weekly_checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their children's checkins"
  ON weekly_checkins
  FOR ALL
  USING (
    child_id IN (
      SELECT id FROM children WHERE parent_user_id = auth.uid()
    )
  );
