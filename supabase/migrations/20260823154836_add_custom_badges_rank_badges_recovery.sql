/*
# Custom badges + rank badges + recovery log

1. New Tables
- `custom_badges` — user-created badges with an unlock criterion (metric + threshold).
  - id, name, description, icon, tier, criterion_type, criterion_value, created_at
  - criterion_type is one of: level, streak, quests, water_hits, sleep_hits, meals, photos, days_active
  - criterion_value is the numeric threshold the metric must reach to earn the badge.
- `recovery_log` — daily recovery/rest entries to track rest days, soreness, mood, notes.
  - id, date (unique), rest_day (bool), soreness (1-5), mood (1-5), notes, created_at

2. Modified Tables
- None (no destructive changes).

3. Security
- Single-tenant no-auth app. RLS enabled. Policies TO anon, authenticated with USING/WITH CHECK true.

4. Notes
- Custom badge ids are prefixed with `custom_` in achievements to avoid collisions with built-in badges.
- Rank badges are built-in (handled in app code) and unlock automatically when the player reaches a new rank.
*/

CREATE TABLE IF NOT EXISTS custom_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL DEFAULT 'Star',
  tier text NOT NULL DEFAULT 'bronze',
  criterion_type text NOT NULL DEFAULT 'quests',
  criterion_value integer NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE custom_badges ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_custom_badges" ON custom_badges;
CREATE POLICY "anon_select_custom_badges" ON custom_badges FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_custom_badges" ON custom_badges;
CREATE POLICY "anon_insert_custom_badges" ON custom_badges FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_custom_badges" ON custom_badges;
CREATE POLICY "anon_update_custom_badges" ON custom_badges FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_custom_badges" ON custom_badges;
CREATE POLICY "anon_delete_custom_badges" ON custom_badges FOR DELETE TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS recovery_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL DEFAULT CURRENT_DATE UNIQUE,
  rest_day boolean NOT NULL DEFAULT false,
  soreness integer NOT NULL DEFAULT 3,
  mood integer NOT NULL DEFAULT 3,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE recovery_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_recovery" ON recovery_log;
CREATE POLICY "anon_select_recovery" ON recovery_log FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_recovery" ON recovery_log;
CREATE POLICY "anon_insert_recovery" ON recovery_log FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_recovery" ON recovery_log;
CREATE POLICY "anon_update_recovery" ON recovery_log FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_recovery" ON recovery_log;
CREATE POLICY "anon_delete_recovery" ON recovery_log FOR DELETE TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_recovery_date ON recovery_log(date);
