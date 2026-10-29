import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';
import { AuthContext } from './authContextDef';


const DEMO_USERS = {
  counsellor: {
    id: 'demo-user-counsellor',
    email: 'counsellor@brightpath.edu',
    user_metadata: {
      full_name: 'Priya Sharma',
      role: 'counsellor'
    },
    profile: {
      id: 'demo-user-counsellor',
      full_name: 'Priya Sharma',
      role: 'counsellor'
    }
  },
  admin: {
    id: 'demo-user-admin',
    email: 'admin@brightpath.edu',
    user_metadata: {
      full_name: 'Arishit Thakkar',
      role: 'admin'
    },
    profile: {
      id: 'demo-user-admin',
      full_name: 'Arishit Thakkar',
      role: 'admin'
    }
  }
};

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
      // 1. Check local demo session first
      const savedDemo = localStorage.getItem('brightpath_demo_user');
      if (savedDemo) {
        try {
          const parsed = JSON.parse(savedDemo);
          if (parsed?.user) {
            setUser(parsed.user);
            setProfile(parsed.profile);
            setLoading(false);
            return;
          }
        } catch (e) {
          localStorage.removeItem('brightpath_demo_user');
        }
      }

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
        localStorage.removeItem('brightpath_demo_user');
        setUser(session.user);
        await fetchProfile(session.user.id, session.user.user_metadata, session.user.email);
      } else {
        const savedDemo = localStorage.getItem('brightpath_demo_user');
        if (!savedDemo) {
          setUser(null);
          setProfile(null);
        }
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, [fetchProfile]);

  function signInAsDemo(roleType = 'counsellor') {
    setAuthError(null);
    const demoData = DEMO_USERS[roleType] || DEMO_USERS.counsellor;
    setUser(demoData);
    setProfile(demoData.profile);
    localStorage.setItem('brightpath_demo_user', JSON.stringify({
      user: demoData,
      profile: demoData.profile
    }));
    setIsAuthModalOpen(false);
    return { success: true };
  }

  async function signInWithPassword(email, password) {
    setAuthError(null);
    const cleanEmail = email.trim().toLowerCase();

    // Check for demo accounts or quick offline match
    if (cleanEmail === 'admin@brightpath.edu' || (cleanEmail.includes('admin') && password === 'admin123')) {
      return signInAsDemo('admin');
    }
    if (cleanEmail === 'counsellor@brightpath.edu' || cleanEmail.includes('counsellor') || cleanEmail === 'demo@brightpath.edu') {
      return signInAsDemo('counsellor');
    }

    if (!isSupabaseConfigured) {
      // Offline fallback login
      const demoAccount = {
        id: `offline-${Date.now()}`,
        email: cleanEmail,
        user_metadata: {
          full_name: cleanEmail.split('@')[0],
          role: 'counsellor'
        }
      };
      const demoProf = {
        id: demoAccount.id,
        full_name: demoAccount.user_metadata.full_name,
        role: 'counsellor'
      };
      setUser(demoAccount);
      setProfile(demoProf);
      localStorage.setItem('brightpath_demo_user', JSON.stringify({
        user: demoAccount,
        profile: demoProf
      }));
      setIsAuthModalOpen(false);
      return { success: true };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password
      });

      if (error) {
        setAuthError(error.message);
        return { success: false, error: error.message };
      }

      if (data?.user) {
        localStorage.removeItem('brightpath_demo_user');
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
    const cleanEmail = email.trim().toLowerCase();

    if (!isSupabaseConfigured) {
      const demoAccount = {
        id: `offline-${Date.now()}`,
        email: cleanEmail,
        user_metadata: {
          full_name: fullName.trim(),
          role: 'counsellor'
        }
      };
      const demoProf = {
        id: demoAccount.id,
        full_name: fullName.trim(),
        role: 'counsellor'
      };
      setUser(demoAccount);
      setProfile(demoProf);
      localStorage.setItem('brightpath_demo_user', JSON.stringify({
        user: demoAccount,
        profile: demoProf
      }));
      setIsAuthModalOpen(false);
      return { success: true };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
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
        localStorage.removeItem('brightpath_demo_user');
        setUser(data.user);
        await fetchProfile(data.user.id, { full_name: fullName, role: 'counsellor' }, cleanEmail);
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
      localStorage.removeItem('brightpath_demo_user');
      if (isSupabaseConfigured) {
        await supabase.auth.signOut();
      }
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
  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Counsellor Staff';
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .map(p => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'BP';

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
    signInAsDemo,
    signUp,
    signOut,
    refreshProfile: () => user && fetchProfile(user.id, user.user_metadata, user.email)
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
