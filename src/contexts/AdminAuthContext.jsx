import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';

const AdminAuthContext = createContext();

const ADMIN_ROLE = 'admin';

const resolveRole = (user, profile) => {
  const roles = [profile?.role, user?.app_metadata?.role].filter(Boolean);

  if (roles.includes(ADMIN_ROLE)) {
    return ADMIN_ROLE;
  }

  return roles[0] || null;
};

const getAdminAccessErrorMessage = (profile) => {
  if (!profile?.id) {
    return 'Signed in, but no public.profiles row was found for this user. Create one and set role to admin.';
  }

  if (profile.role !== 'admin') {
    return `Signed in, but public.profiles.role is "${profile.role}". Update it to "admin" for admin access.`;
  }

  return 'This account is not allowed to access the admin panel.';
};

export const AdminAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const syncProfileFromAuth = useCallback(async (nextUser) => {
    if (nextUser?.app_metadata?.role !== ADMIN_ROLE) {
      return null;
    }

    const { error: rpcError } = await supabase.rpc('sync_current_user_profile');

    if (rpcError) {
      return null;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, role')
      .eq('id', nextUser.id)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    setProfile(data);
    return data;
  }, []);

  const loadProfile = useCallback(async (nextUser) => {
    if (!nextUser) {
      setProfile(null);
      return null;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, role')
      .eq('id', nextUser.id)
      .maybeSingle();

    if (error) {
      setProfile({ role: resolveRole(nextUser, null) });
      return null;
    }

    if (data?.role !== ADMIN_ROLE && nextUser?.app_metadata?.role === ADMIN_ROLE) {
      const syncedProfile = await syncProfileFromAuth(nextUser);

      if (syncedProfile) {
        return syncedProfile;
      }
    }

    setProfile(data || { role: resolveRole(nextUser, null) });
    return data;
  }, [syncProfileFromAuth]);

  useEffect(() => {
    let isMounted = true;

    const bootstrap = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!isMounted) {
        return;
      }

      const nextUser = session?.user ?? null;
      setUser(nextUser);
      await loadProfile(nextUser);
      setLoading(false);
    };

    bootstrap();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const nextUser = session?.user ?? null;
      setUser(nextUser);
      await loadProfile(nextUser);
      setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [loadProfile]);

  const login = useCallback(async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast({
        title: 'Login failed',
        description: error.message,
        variant: 'destructive',
      });
      return { error };
    }

    const profileData = await loadProfile(data.user);
    const nextRole = resolveRole(data.user, profileData);

    if (nextRole !== ADMIN_ROLE) {
      await supabase.auth.signOut();
      const authError = new Error(getAdminAccessErrorMessage(profileData));
      toast({
        title: 'Access denied',
        description: authError.message,
        variant: 'destructive',
      });
      return { error: authError };
    }

    return { error: null };
  }, [loadProfile]);

  const logout = () => {
    supabase.auth.signOut();
  };

  const role = resolveRole(user, profile);
  const isAuthenticated = Boolean(user) && role === ADMIN_ROLE;

  return (
    <AdminAuthContext.Provider
      value={{ isAuthenticated, login, logout, loading, user, profile, role }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
};
