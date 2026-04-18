import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { supabase, restQuery } from '../lib/supabase';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId, token) => {
    try {
      const { data, error } = await restQuery(
        `/rest/v1/profiles?id=eq.${userId}&select=*`,
        { single: true },
        token
      );

      if (error) {
        console.error('[BotLab] Failed to fetch profile:', error.message);
        return null;
      }
      return data;
    } catch (err) {
      console.error('[BotLab] Profile fetch crashed:', err);
      return null;
    }
  }, []);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session: s } }) => {
      setSession(s);
      if (s?.user) {
        const p = await fetchProfile(s.user.id, s.access_token);
        setProfile(p);
      }
      setLoading(false);
    }).catch((err) => {
      console.error('[BotLab] getSession failed:', err);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, s) => {
        setSession(s);
        if (s?.user) {
          const p = await fetchProfile(s.user.id, s.access_token);
          setProfile(p);
        } else {
          setProfile(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const signIn = useCallback(async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }, []);

  const signUp = useCallback(async (email, password) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    return data;
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
  }, []);

  const isAdmin = profile?.role === 'admin';
  const isClient = profile?.role === 'client';
  const isAuthenticated = !!session;

  const value = useMemo(() => ({
    session,
    profile,
    loading,
    isAdmin,
    isClient,
    isAuthenticated,
    signIn,
    signUp,
    signOut,
  }), [session, profile, loading, isAdmin, isClient, isAuthenticated, signIn, signUp, signOut]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
