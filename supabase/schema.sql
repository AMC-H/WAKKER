-- =============================================
-- WAKKER APP — Supabase Database Schema
-- =============================================
-- Voer dit uit in de Supabase SQL Editor
-- na het aanmaken van je project.
-- =============================================

-- 1. PROFILES — uitbreiding op Supabase auth.users
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT DEFAULT '',
  quit_date TIMESTAMPTZ,
  start_date TIMESTAMPTZ DEFAULT now(),
  current_day INTEGER DEFAULT 1 CHECK (current_day >= 1 AND current_day <= 90),
  daily_cost NUMERIC(6,2),          -- dagelijkse kosten cannabis in EUR
  motivation TEXT,                   -- persoonlijke motivatie
  is_subscribed BOOLEAN DEFAULT false,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium')),
  revenuecat_id TEXT,               -- RevenueCat customer ID
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. DAILY_PROGRESS — voortgang per dag per gebruiker
CREATE TABLE IF NOT EXISTS daily_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  day INTEGER NOT NULL CHECK (day >= 1 AND day <= 90),
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  exercise_completed BOOLEAN DEFAULT false,
  exercise_data JSONB,               -- opgeslagen journal/checklist data
  affirmation_read BOOLEAN DEFAULT false,
  time_spent_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(user_id, day)               -- 1 entry per gebruiker per dag
);

-- 3. JOURNAL_ENTRIES — alle dagboek-schrijfoefeningen
CREATE TABLE IF NOT EXISTS journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  day INTEGER NOT NULL CHECK (day >= 1 AND day <= 90),
  exercise_type TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. CRAVING_LOGS — craving momenten bijhouden
CREATE TABLE IF NOT EXISTS craving_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  intensity INTEGER NOT NULL CHECK (intensity >= 1 AND intensity <= 10),
  trigger TEXT,
  coping_strategy TEXT,
  passed BOOLEAN DEFAULT false,       -- craving overwonnen?
  notes TEXT,
  duration_minutes INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. SAVINGS — besparing bijhouden
CREATE TABLE IF NOT EXISTS savings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  day INTEGER NOT NULL,
  amount_saved NUMERIC(8,2) NOT NULL, -- cumulatief bespaard
  created_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(user_id, day)
);

-- 6. COACH_CONVERSATIONS — chat met Lina
CREATE TABLE IF NOT EXISTS coach_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  messages JSONB NOT NULL DEFAULT '[]',
  tokens_used INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- INDEXES
-- =============================================

CREATE INDEX IF NOT EXISTS idx_daily_progress_user ON daily_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_progress_day ON daily_progress(user_id, day);
CREATE INDEX IF NOT EXISTS idx_journal_user ON journal_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_craving_user ON craving_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_savings_user ON savings(user_id);
CREATE INDEX IF NOT EXISTS idx_coach_user ON coach_conversations(user_id);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Daily Progress
ALTER TABLE daily_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own progress"
  ON daily_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
  ON daily_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON daily_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- Journal Entries
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own journal"
  ON journal_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own journal"
  ON journal_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Craving Logs
ALTER TABLE craving_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own cravings"
  ON craving_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cravings"
  ON craving_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Savings
ALTER TABLE savings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own savings"
  ON savings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own savings"
  ON savings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own savings"
  ON savings FOR UPDATE
  USING (auth.uid() = user_id);

-- Coach Conversations
ALTER TABLE coach_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own conversations"
  ON coach_conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own conversations"
  ON coach_conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations"
  ON coach_conversations FOR UPDATE
  USING (auth.uid() = user_id);

-- =============================================
-- TRIGGER: auto-create profile on signup
-- =============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop if exists, then create
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
