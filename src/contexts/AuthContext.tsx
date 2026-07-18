import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useAuthStore } from '@/store/auth';
import type { User } from '@/types';

// ── Types ─────────────────────────────────────────────────────────────────────

interface SignInResult { error: string | null }
interface SignUpResult { error: string | null; needsConfirmation: boolean }

interface AuthContextValue {
  session: Session | null;
  profile: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isConfigured: boolean;
  signIn: (email: string, password: string) => Promise<SignInResult>;
  signUp: (email: string, password: string, fullName: string) => Promise<SignUpResult>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  updateProfile: (updates: Partial<Omit<User, 'id' | 'email' | 'role' | 'created_at'>>) => Promise<{ error: string | null }>;
  refreshProfile: () => Promise<void>;
}

// ── Context ───────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}

// ── Provider ──────────────────────────────────────────────────────────────────

async function fetchProfile(userId: string): Promise<User | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) return null;
  return data as User;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { setUser, signOut: storeSignOut } = useAuthStore();

  const loadProfile = useCallback(async (userId: string) => {
    const p = await fetchProfile(userId);
    setProfile(p);
    setUser(p);
    return p;
  }, [setUser]);

  // Initialize: get current session and subscribe to changes
  useEffect(() => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    let mounted = true;

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (!mounted) return;
      setSession(s);
      if (s?.user) {
        loadProfile(s.user.id).finally(() => {
          if (mounted) setIsLoading(false);
        });
      } else {
        setIsLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, s) => {
        if (!mounted) return;
        setSession(s);

        if (s?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED')) {
          await loadProfile(s.user.id);
        }

        if (event === 'SIGNED_OUT') {
          setProfile(null);
          storeSignOut();
        }

        setIsLoading(false);
      },
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [loadProfile, storeSignOut]);

  // ── Auth actions ────────────────────────────────────────────────────────────

  const signIn = useCallback(async (email: string, password: string): Promise<SignInResult> => {
    if (!supabase) return { error: 'Supabase is not configured.' };
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      const msg =
        error.message === 'Invalid login credentials'
          ? 'Incorrect email or password. Please try again.'
          : error.message;
      return { error: msg };
    }
    return { error: null };
  }, []);

  const signUp = useCallback(async (email: string, password: string, fullName: string): Promise<SignUpResult> => {
    if (!supabase) return { error: 'Supabase is not configured.', needsConfirmation: false };
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role: 'student' },
      },
    });
    if (error) return { error: error.message, needsConfirmation: false };
    // If identities is empty, email confirmation is needed
    const needsConfirmation = !data.session && Boolean(data.user && !data.user.confirmed_at);
    return { error: null, needsConfirmation };
  }, []);

  const signOut = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    if (!supabase) return { error: 'Supabase is not configured.' };
    const redirectTo = `${window.location.origin}/reset-password`;
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    return { error: error?.message ?? null };
  }, []);

  const updateProfile = useCallback(async (updates: Partial<Omit<User, 'id' | 'email' | 'role' | 'created_at'>>) => {
    if (!supabase || !session?.user) return { error: 'Not authenticated.' };
    const { error } = await supabase
      .from('users')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', session.user.id);
    if (!error) await loadProfile(session.user.id);
    return { error: error?.message ?? null };
  }, [supabase, session, loadProfile]);

  const refreshProfile = useCallback(async () => {
    if (session?.user) await loadProfile(session.user.id);
  }, [session, loadProfile]);

  return (
    <AuthContext.Provider
      value={{
        session,
        profile,
        isLoading,
        isAuthenticated: Boolean(session),
        isConfigured: isSupabaseConfigured,
        signIn,
        signUp,
        signOut,
        resetPassword,
        updateProfile,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
