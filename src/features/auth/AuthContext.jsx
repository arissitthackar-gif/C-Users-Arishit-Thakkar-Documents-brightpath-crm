import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';
import { AuthContext } from './authContextDef';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('signin'); // 'signin' | 'signup'

  const fetchProfile = useCallback(async (userId, userMetadata = {}, userEmail = '') => {
    if (!isSupabaseConfigured || !userId) {
      setProfile(null);
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.warn('[Auth] Error fetching profile:', error.message);
      }

      if (data) {
        setProfile(data);
        return data;
      }

      // Auto-create profile if trigger was delayed or missing
      const defaultName = userMetadata.full_name || userEmail.split('@')[0] || 'Academy Staff';
      const defaultRole = userMetadata.role || 'counsellor';

      const { data: createdProfile, error: insertError } = await supabase
        .from('profiles')
        .insert([{ id: userId, full_name: defaultName, role: defaultRole }])
        .select()
        .maybeSingle();

      if (!insertError && createdProfile) {
        setProfile(createdProfile);
        return createdProfile;
      }

      // Fallback in-memory profile
      const fallback = { id: userId, full_name: defaultName, role: defaultRole };
      setProfile(fallback);
      return fallback;
    } catch (err) {
      console.error('[Auth] Profile retrieval exception:', err);
      return null;
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    async function initSession() {
      if (!isSupabaseConfigured) {
        setLoading(false);
        return;
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (mounted) {
          if (session?.user) {
            setUser(session.user);
            await fetchProfile(session.user.id, session.user.user_metadata, session.user.email);
          } else {
            setUser(null);
            setProfile(null);
          }
        }
      } catch (err) {
        console.error('[Auth] Initial session check failed:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    initSession();

    // Listen to Supabase Auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      if (session?.user) {
        setUser(session.user);
        await fetchProfile(session.user.id, session.user.user_metadata, session.user.email);
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, [fetchProfile]);

  async function signInWithPassword(email, password) {
    setAuthError(null);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      });

      if (error) {
        setAuthError(error.message);
        return { success: false, error: error.message };
      }

      if (data?.user) {
        setUser(data.user);
        await fetchProfile(data.user.id, data.user.user_metadata, data.user.email);
      }

      setIsAuthModalOpen(false);
      return { success: true };
    } catch (err) {
      const msg = err.message || 'An unexpected error occurred during sign-in.';
      setAuthError(msg);
      return { success: false, error: msg };
    }
  }

  async function signUp(email, password, fullName) {
    setAuthError(null);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            role: 'counsellor' // New signups always default to least-privileged role
          }
        }
      });

      if (error) {
        setAuthError(error.message);
        return { success: false, error: error.message };
      }

      if (data?.user) {
        setUser(data.user);
        await fetchProfile(data.user.id, { full_name: fullName, role: 'counsellor' }, email);
      }

      setIsAuthModalOpen(false);
      return { success: true };
    } catch (err) {
      const msg = err.message || 'An unexpected error occurred during registration.';
      setAuthError(msg);
      return { success: false, error: msg };
    }
  }

  async function signOut() {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('[Auth] Sign out warning:', err);
    } finally {
      setUser(null);
      setProfile(null);
      setAuthError(null);
    }
  }

  function openAuthModal(mode = 'signin') {
    setAuthModalMode(mode);
    setAuthError(null);
    setIsAuthModalOpen(true);
  }

  function closeAuthModal() {
    setIsAuthModalOpen(false);
    setAuthError(null);
  }

  const role = profile?.role || 'counsellor';
  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Guest Counsellor';
  const initials = displayName
    .split(' ')
    .map(p => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const value = {
    user,
    profile,
    role,
    displayName,
    initials,
    loading,
    authError,
    isConfigured: isSupabaseConfigured,
    isAuthModalOpen,
    authModalMode,
    openAuthModal,
    closeAuthModal,
    setAuthModalMode,
    signInWithPassword,
    signUp,
    signOut,
    refreshProfile: () => user && fetchProfile(user.id, user.user_metadata, user.email)
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
