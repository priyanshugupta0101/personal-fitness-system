/*
# Solo Fitness Tracker Schema (single-tenant, no auth)

1. New Tables
- `profile` — single row holding level, exp, streak, rank, goals, water/sleep targets.
- `exercises` — user-defined exercise library (name, category, default exp).
- `quests` — daily exercise log entries (date, exercise ref, sets/reps/duration, completed flag, exp earned).
- `meals` — diet log entries (date, raw text, parsed nutrition: calories/protein/carbs/fat).
- `water_log` — daily water intake (date, glasses count, daily goal).
- `sleep_log` — daily sleep records (date, hours slept, quality, bedtime, wake time).
- `progress_photos` — body transformation photos (image url, date, note).
- `reminders` — user-set reminders for workouts / water (title, time, type, enabled).
- `achievements` — earned badges (badge id, earned date).
- `motivation_quotes` — rotating quotes shown on home (author, text).

2. Security
- This is a single-tenant personal app with no sign-in screen.
- RLS enabled on every table. All policies use `TO anon, authenticated` with `USING (true)` / `WITH CHECK (true)` because the data is intentionally shared/public for the single owner.

3. Notes
- `exp` and `level` are stored on profile and updated by the frontend when quests complete.
- `streak` increments when at least one quest is completed on a given day.
- `weekly_progress` is derived from quests grouped by date (current week).
*/

CREATE TABLE IF NOT EXISTS profile (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  level integer NOT NULL DEFAULT 1,
  exp integer NOT NULL DEFAULT 0,
  total_exp integer NOT NULL DEFAULT 0,
  streak integer NOT NULL DEFAULT 0,
  last_workout_date date,
  main_goal text,
  daily_water_goal integer NOT NULL DEFAULT 8,
  daily_sleep_goal numeric NOT NULL DEFAULT 8,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profile ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_profile" ON profile;
CREATE POLICY "anon_select_profile" ON profile FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_profile" ON profile;
CREATE POLICY "anon_insert_profile" ON profile FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_profile" ON profile;
CREATE POLICY "anon_update_profile" ON profile FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_profile" ON profile;
CREATE POLICY "anon_delete_profile" ON profile FOR DELETE TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL DEFAULT 'strength',
  exp_reward integer NOT NULL DEFAULT 50,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_exercises" ON exercises;
CREATE POLICY "anon_select_exercises" ON exercises FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_exercises" ON exercises;
CREATE POLICY "anon_insert_exercises" ON exercises FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_exercises" ON exercises;
CREATE POLICY "anon_update_exercises" ON exercises FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_exercises" ON exercises;
CREATE POLICY "anon_delete_exercises" ON exercises FOR DELETE TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS quests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL DEFAULT CURRENT_DATE,
  exercise_id uuid REFERENCES exercises(id) ON DELETE CASCADE,
  exercise_name text NOT NULL,
  category text NOT NULL DEFAULT 'strength',
  sets integer,
  reps integer,
  duration_min integer,
  exp_earned integer NOT NULL DEFAULT 0,
  completed boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE quests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_quests" ON quests;
CREATE POLICY "anon_select_quests" ON quests FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_quests" ON quests;
CREATE POLICY "anon_insert_quests" ON quests FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_quests" ON quests;
CREATE POLICY "anon_update_quests" ON quests FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_quests" ON quests;
CREATE POLICY "anon_delete_quests" ON quests FOR DELETE TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS meals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL DEFAULT CURRENT_DATE,
  meal_type text NOT NULL DEFAULT 'snack',
  description text NOT NULL,
  calories numeric NOT NULL DEFAULT 0,
  protein_g numeric NOT NULL DEFAULT 0,
  carbs_g numeric NOT NULL DEFAULT 0,
  fat_g numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE meals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_meals" ON meals;
CREATE POLICY "anon_select_meals" ON meals FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_meals" ON meals;
CREATE POLICY "anon_insert_meals" ON meals FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_meals" ON meals;
CREATE POLICY "anon_update_meals" ON meals FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_meals" ON meals;
CREATE POLICY "anon_delete_meals" ON meals FOR DELETE TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS water_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL DEFAULT CURRENT_DATE UNIQUE,
  glasses integer NOT NULL DEFAULT 0,
  goal integer NOT NULL DEFAULT 8,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE water_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_water" ON water_log;
CREATE POLICY "anon_select_water" ON water_log FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_water" ON water_log;
CREATE POLICY "anon_insert_water" ON water_log FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_water" ON water_log;
CREATE POLICY "anon_update_water" ON water_log FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_water" ON water_log;
CREATE POLICY "anon_delete_water" ON water_log FOR DELETE TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS sleep_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL DEFAULT CURRENT_DATE UNIQUE,
  hours_slept numeric NOT NULL DEFAULT 0,
  quality integer NOT NULL DEFAULT 3,
  bedtime text,
  wake_time text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE sleep_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_sleep" ON sleep_log;
CREATE POLICY "anon_select_sleep" ON sleep_log FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_sleep" ON sleep_log;
CREATE POLICY "anon_insert_sleep" ON sleep_log FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_sleep" ON sleep_log;
CREATE POLICY "anon_update_sleep" ON sleep_log FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_sleep" ON sleep_log;
CREATE POLICY "anon_delete_sleep" ON sleep_log FOR DELETE TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS progress_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  note text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE progress_photos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_photos" ON progress_photos;
CREATE POLICY "anon_select_photos" ON progress_photos FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_photos" ON progress_photos;
CREATE POLICY "anon_insert_photos" ON progress_photos FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_photos" ON progress_photos;
CREATE POLICY "anon_update_photos" ON progress_photos FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_photos" ON progress_photos;
CREATE POLICY "anon_delete_photos" ON progress_photos FOR DELETE TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  type text NOT NULL DEFAULT 'workout',
  time text NOT NULL,
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_reminders" ON reminders;
CREATE POLICY "anon_select_reminders" ON reminders FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_reminders" ON reminders;
CREATE POLICY "anon_insert_reminders" ON reminders FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_reminders" ON reminders;
CREATE POLICY "anon_update_reminders" ON reminders FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_reminders" ON reminders;
CREATE POLICY "anon_delete_reminders" ON reminders FOR DELETE TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  badge_id text NOT NULL UNIQUE,
  earned_at timestamptz DEFAULT now()
);

ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_achievements" ON achievements;
CREATE POLICY "anon_select_achievements" ON achievements FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_achievements" ON achievements;
CREATE POLICY "anon_insert_achievements" ON achievements FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_achievements" ON achievements;
CREATE POLICY "anon_delete_achievements" ON achievements FOR DELETE TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS motivation_quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  text text NOT NULL,
  author text NOT NULL DEFAULT 'Unknown',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE motivation_quotes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_quotes" ON motivation_quotes;
CREATE POLICY "anon_select_quotes" ON motivation_quotes FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_quotes" ON motivation_quotes;
CREATE POLICY "anon_insert_quotes" ON motivation_quotes FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_quests_date ON quests(date);
CREATE INDEX IF NOT EXISTS idx_meals_date ON meals(date);
CREATE INDEX IF NOT EXISTS idx_water_date ON water_log(date);
CREATE INDEX IF NOT EXISTS idx_sleep_date ON sleep_log(date);
CREATE INDEX IF NOT EXISTS idx_photos_date ON progress_photos(date);
