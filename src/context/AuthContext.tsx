import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';

// Demo modus detectie — geen echte Supabase configuratie
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const IS_DEMO = !SUPABASE_URL || SUPABASE_URL.includes('YOUR_PROJECT');

// Demo user object
const DEMO_USER = {
  id: 'demo-user-001',
  email: 'demo@wakker.app',
  app_metadata: {},
  user_metadata: { display_name: 'Demo Gebruiker' },
  aud: 'authenticated',
  created_at: new Date().toISOString(),
} as unknown as User;

const DEMO_SESSION = {
  access_token: 'demo-token',
  refresh_token: 'demo-refresh',
  expires_in: 99999,
  token_type: 'bearer',
  user: DEMO_USER,
} as unknown as Session;

interface AuthState {
  session: Session | null;
  user: User | null;
  loading: boolean;
  isDemo: boolean;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({
  session: null,
  user: null,
  loading: true,
  isDemo: false,
  signUp: async () => ({ error: null }),
  signIn: async () => ({ error: null }),
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (IS_DEMO) {
      // Demo modus: direct inloggen
      setSession(DEMO_SESSION);
      setLoading(false);
      return;
    }

    // Echte Supabase modus
    const initAuth = async () => {
      try {
        const { supabase } = require('../lib/supabase');
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (_event: any, session: Session | null) => {
            setSession(session);
          }
        );

        return () => subscription.unsubscribe();
      } catch (err) {
        console.warn('Supabase niet beschikbaar, demo modus actief');
        setSession(DEMO_SESSION);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const signUp = async (email: string, password: string, displayName?: string) => {
    if (IS_DEMO) {
      setSession(DEMO_SESSION);
      return { error: null };
    }
    const { supabase } = require('../lib/supabase');
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName || '' },
      },
    });
    // With auto-confirm trigger, signup returns a session immediately
    if (data?.session) {
      setSession(data.session);
    }
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    if (IS_DEMO) {
      setSession(DEMO_SESSION);
      return { error: null };
    }
    const { supabase } = require('../lib/supabase');
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (data?.session) {
      setSession(data.session);
    }
    return { error };
  };

  const signOut = async () => {
    if (IS_DEMO) {
      setSession(null);
      return;
    }
    const { supabase } = require('../lib/supabase');
    await supabase.auth.signOut();
    setSession(null);
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        loading,
        isDemo: IS_DEMO,
        signUp,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
