'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { TOKEN_KEY, toApiError } from '@/lib/api';
import { authApi } from '@/lib/endpoints';
import type { User } from '@/lib/types';

interface AuthContextValue {
  user: User | null;
  stats: Record<string, number>;
  loading: boolean;
  /** `identifier` is an email or a mobile number. */
  login: (identifier: string, password: string) => Promise<User>;
  register: (payload: {
    name: string;
    /** Optional — people can sign up with just a mobile number. */
    email?: string;
    phone: string;
    password: string;
    company?: string;
  }) => Promise<User>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  setUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/** Where each role lands after signing in. */
export function homeFor(role?: string) {
  if (role === 'admin') return '/admin';
  if (role === 'technician') return '/tech';
  return '/portal';
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const refresh = useCallback(async () => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const data = await authApi.me();
      setUser(data.user);
      setStats(data.stats || {});
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const login = useCallback(async (identifier: string, password: string) => {
    const data = await authApi.login({ identifier, password });
    localStorage.setItem(TOKEN_KEY, data.token);
    setUser(data.user);
    void authApi.me().then((d) => setStats(d.stats || {}));
    return data.user;
  }, []);

  const register = useCallback(
    async (payload: {
      name: string;
      email?: string;
      phone: string;
      password: string;
      company?: string;
    }) => {
      const data = await authApi.register(payload);
      localStorage.setItem(TOKEN_KEY, data.token);
      setUser(data.user);
      return data.user;
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (error) {
      // The local session is cleared regardless — a failed server call must
      // not leave the user stuck in a signed-in UI.
      console.warn(toApiError(error).message);
    }
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
    setStats({});
    toast.success('Signed out');
    router.push('/');
  }, [router]);

  const value = useMemo(
    () => ({ user, stats, loading, login, register, logout, refresh, setUser }),
    [user, stats, loading, login, register, logout, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>');
  return context;
}
