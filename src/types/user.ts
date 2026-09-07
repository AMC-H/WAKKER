// Types voor gebruiker & voortgang

export interface UserProfile {
  id: string;
  email: string;
  display_name: string;
  quit_date?: string | null;           // datum waarop gebruiker stopt
  start_date: string;           // datum waarop app gestart
  current_day: number;          // huidige dag in programma (1-90)
  daily_cost?: number;          // dagelijkse kosten wiet in euros
  motivation?: string;          // persoonlijke motivatie
  is_subscribed: boolean;       // betaald abonnement
  subscription_tier?: 'free' | 'premium';
  revenuecat_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface DailyProgress {
  id: string;
  user_id: string;
  day: number;
  completed: boolean;
  completed_at?: string;
  exercise_completed: boolean;
  exercise_data?: Record<string, any>;  // opgeslagen journal entries etc.
  affirmation_read: boolean;
  time_spent_seconds: number;
  created_at: string;
}

export interface JournalEntry {
  id: string;
  user_id: string;
  day: number;
  exercise_type: string;
  content: string;
  created_at: string;
}

export interface CravingLog {
  id: string;
  user_id: string;
  intensity: number;          // 1-10
  trigger?: string;
  coping_strategy?: string;
  passed: boolean;            // craving overwonnen?
  notes?: string;
  created_at: string;
}

export interface SavingsEntry {
  id: string;
  user_id: string;
  day: number;
  amount_saved: number;       // cumulatief bespaard
  created_at: string;
}
