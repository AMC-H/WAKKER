import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { UserProfile, DailyProgress } from '../types';

interface UserState {
  profile: UserProfile | null;
  progress: DailyProgress[];
  loading: boolean;
  currentDay: number;
  isSubscribed: boolean;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  markDayComplete: (day: number, exerciseData?: Record<string, any>) => Promise<void>;
  getDayProgress: (day: number) => DailyProgress | undefined;
  refreshProfile: () => Promise<void>;
}

const UserContext = createContext<UserState>({
  profile: null,
  progress: [],
  loading: true,
  currentDay: 1,
  isSubscribed: false,
  updateProfile: async () => {},
  markDayComplete: async () => {},
  getDayProgress: () => undefined,
  refreshProfile: async () => {},
});

// Demo profiel
const DEMO_PROFILE: UserProfile = {
  id: 'demo-user-001',
  email: 'demo@wakker.app',
  display_name: 'Demo Gebruiker',
  quit_date: null,
  start_date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 5 dagen geleden
  current_day: 5,
  daily_cost: 10,
  motivation: 'Ik wil vrij zijn van cannabis',
  is_subscribed: true, // Premium in demo zodat alles zichtbaar is
  subscription_tier: 'premium',
  revenuecat_id: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { user, isDemo } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [progress, setProgress] = useState<DailyProgress[]>([]);
  const [loading, setLoading] = useState(true);

  const currentDay = React.useMemo(() => {
    if (!profile?.start_date) return 1;
    const start = new Date(profile.start_date);
    const now = new Date();
    const diffTime = now.getTime() - start.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return Math.min(Math.max(diffDays, 1), 90);
  }, [profile?.start_date]);

  const isSubscribed = profile?.is_subscribed ?? false;

  const fetchProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setProgress([]);
      setLoading(false);
      return;
    }

    if (isDemo) {
      // Demo modus: lokale data
      setProfile(DEMO_PROFILE);
      // Een paar dagen als "voltooid" markeren
      setProgress([
        { id: 'd1', user_id: 'demo-user-001', day: 1, completed: true, completed_at: new Date().toISOString(), exercise_completed: true, exercise_data: {}, affirmation_read: true, time_spent_seconds: 300, created_at: new Date().toISOString() },
        { id: 'd2', user_id: 'demo-user-001', day: 2, completed: true, completed_at: new Date().toISOString(), exercise_completed: true, exercise_data: {}, affirmation_read: true, time_spent_seconds: 420, created_at: new Date().toISOString() },
        { id: 'd3', user_id: 'demo-user-001', day: 3, completed: true, completed_at: new Date().toISOString(), exercise_completed: true, exercise_data: {}, affirmation_read: true, time_spent_seconds: 360, created_at: new Date().toISOString() },
        { id: 'd4', user_id: 'demo-user-001', day: 4, completed: true, completed_at: new Date().toISOString(), exercise_completed: false, exercise_data: {}, affirmation_read: false, time_spent_seconds: 180, created_at: new Date().toISOString() },
      ]);
      setLoading(false);
      return;
    }

    // Echte Supabase modus
    try {
      const { supabase } = require('../lib/supabase');

      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (existingProfile) {
        setProfile(existingProfile as UserProfile);
      } else {
        const newProfile: Partial<UserProfile> = {
          id: user.id,
          email: user.email || '',
          display_name: '',
          start_date: new Date().toISOString(),
          current_day: 1,
          is_subscribed: false,
          subscription_tier: 'free',
        };

        const { data } = await supabase
          .from('profiles')
          .insert(newProfile)
          .select()
          .single();

        if (data) setProfile(data as UserProfile);
      }

      const { data: progressData } = await supabase
        .from('daily_progress')
        .select('*')
        .eq('user_id', user.id)
        .order('day', { ascending: true });

      if (progressData) setProgress(progressData as DailyProgress[]);
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  }, [user, isDemo]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;

    if (isDemo) {
      setProfile((prev) => prev ? { ...prev, ...updates, updated_at: new Date().toISOString() } : null);
      return;
    }

    const { supabase } = require('../lib/supabase');
    const { data } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', user.id)
      .select()
      .single();

    if (data) setProfile(data as UserProfile);
  };

  const markDayComplete = async (day: number, exerciseData?: Record<string, any>) => {
    if (!user) return;

    if (isDemo) {
      const existing = progress.find((p) => p.day === day);
      if (existing) {
        setProgress((prev) =>
          prev.map((p) => p.day === day ? { ...p, completed: true, completed_at: new Date().toISOString(), exercise_completed: !!exerciseData, exercise_data: exerciseData || p.exercise_data } : p)
        );
      } else {
        const newEntry: DailyProgress = {
          id: `demo-${day}`,
          user_id: 'demo-user-001',
          day,
          completed: true,
          completed_at: new Date().toISOString(),
          exercise_completed: !!exerciseData,
          exercise_data: exerciseData || {},
          affirmation_read: false,
          time_spent_seconds: 0,
          created_at: new Date().toISOString(),
        };
        setProgress((prev) => [...prev, newEntry]);
      }
      if (day >= currentDay) {
        await updateProfile({ current_day: Math.min(day + 1, 90) });
      }
      return;
    }

    // Echte Supabase modus
    const { supabase } = require('../lib/supabase');
    const existing = progress.find((p) => p.day === day);

    if (existing) {
      const { data } = await supabase
        .from('daily_progress')
        .update({
          completed: true,
          completed_at: new Date().toISOString(),
          exercise_completed: !!exerciseData,
          exercise_data: exerciseData || existing.exercise_data,
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (data) {
        setProgress((prev) =>
          prev.map((p) => (p.day === day ? (data as DailyProgress) : p))
        );
      }
    } else {
      const { data } = await supabase
        .from('daily_progress')
        .insert({
          user_id: user.id,
          day,
          completed: true,
          completed_at: new Date().toISOString(),
          exercise_completed: !!exerciseData,
          exercise_data: exerciseData,
          affirmation_read: false,
          time_spent_seconds: 0,
        })
        .select()
        .single();

      if (data) setProgress((prev) => [...prev, data as DailyProgress]);
    }

    if (day >= currentDay) {
      await updateProfile({ current_day: Math.min(day + 1, 90) });
    }
  };

  const getDayProgress = (day: number) => {
    return progress.find((p) => p.day === day);
  };

  return (
    <UserContext.Provider
      value={{
        profile,
        progress,
        loading,
        currentDay,
        isSubscribed,
        updateProfile,
        markDayComplete,
        getDayProgress,
        refreshProfile: fetchProfile,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
