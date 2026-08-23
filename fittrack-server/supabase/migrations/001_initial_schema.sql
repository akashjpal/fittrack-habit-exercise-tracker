-- ============================================
-- FitTrack Database Schema for InsForge
-- ============================================

-- 1. Exercise Sections
CREATE TABLE exercise_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  target_sets INTEGER DEFAULT 10,
  date TIMESTAMPTZ NOT NULL,
  is_library BOOLEAN DEFAULT false,
  archived BOOLEAN DEFAULT false,
  library_section_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE exercise_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_read_own_sections" ON exercise_sections
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "users_insert_own_sections" ON exercise_sections
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_update_own_sections" ON exercise_sections
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_delete_own_sections" ON exercise_sections
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

CREATE TRIGGER exercise_sections_updated_at
  BEFORE UPDATE ON exercise_sections
  FOR EACH ROW
  EXECUTE FUNCTION system.update_updated_at();

CREATE INDEX idx_sections_user_id ON exercise_sections(user_id);
CREATE INDEX idx_sections_date ON exercise_sections(date);
CREATE INDEX idx_sections_library ON exercise_sections(user_id, is_library);

-- 2. Workouts
CREATE TABLE workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  section_id UUID REFERENCES exercise_sections(id) ON DELETE CASCADE NOT NULL,
  exercise_type TEXT NOT NULL,
  sets INTEGER NOT NULL DEFAULT 0,
  reps INTEGER NOT NULL DEFAULT 0,
  weight NUMERIC(8,2) NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'kg',
  completed BOOLEAN DEFAULT true,
  date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_read_own_workouts" ON workouts
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "users_insert_own_workouts" ON workouts
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_update_own_workouts" ON workouts
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_delete_own_workouts" ON workouts
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

CREATE TRIGGER workouts_updated_at
  BEFORE UPDATE ON workouts
  FOR EACH ROW
  EXECUTE FUNCTION system.update_updated_at();

CREATE INDEX idx_workouts_user_id ON workouts(user_id);
CREATE INDEX idx_workouts_section_id ON workouts(section_id);
CREATE INDEX idx_workouts_date ON workouts(date);
CREATE INDEX idx_workouts_user_date ON workouts(user_id, date);

-- 3. Habits
CREATE TABLE habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE habits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_read_own_habits" ON habits
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "users_insert_own_habits" ON habits
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_update_own_habits" ON habits
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_delete_own_habits" ON habits
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

CREATE TRIGGER habits_updated_at
  BEFORE UPDATE ON habits
  FOR EACH ROW
  EXECUTE FUNCTION system.update_updated_at();

CREATE INDEX idx_habits_user_id ON habits(user_id);

-- 4. Habit Completions
CREATE TABLE habit_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  habit_id UUID REFERENCES habits(id) ON DELETE CASCADE NOT NULL,
  date TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE habit_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_read_own_completions" ON habit_completions
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "users_insert_own_completions" ON habit_completions
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_delete_own_completions" ON habit_completions
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

CREATE INDEX idx_completions_user_id ON habit_completions(user_id);
CREATE INDEX idx_completions_habit_id ON habit_completions(habit_id);
CREATE INDEX idx_completions_date ON habit_completions(date);
CREATE INDEX idx_completions_habit_date ON habit_completions(habit_id, date);
