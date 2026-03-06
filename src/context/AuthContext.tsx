import { useState, useEffect, useCallback, type ReactNode } from 'react';
import type { User } from '@/types/api';
import { auth } from '@/api/endpoints';
import { setToken, clearToken } from '@/api/client';
import { AuthContext } from './authTypes';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const u = await auth.me();
      setUser(u);
    } catch {
      clearToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [fetchUser]);

  const login = async (email: string, password: string) => {
    const res = await auth.login({ email, password });
    setToken(res.token);
    setUser(res.user);
  };

  const logout = async () => {
    try {
      await auth.logout();
    } finally {
      clearToken();
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isSuperadmin: user?.role === 'superadmin',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
