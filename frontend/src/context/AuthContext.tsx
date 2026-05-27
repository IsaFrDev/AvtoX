import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { auth as authApi } from '../services/api';

interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'user' | 'company_admin' | 'superadmin';
  company_id?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  registerUser: (data: { email: string; password: string; full_name: string; phone: string }) => Promise<void>;
  registerCompany: (data: any) => Promise<void>;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>(null!);

function parseJwt(token: string): any {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(() => {
    const token = localStorage.getItem('access_token');
    if (!token) { setLoading(false); return; }
    const payload = parseJwt(token);
    if (!payload || payload.exp * 1000 < Date.now()) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setLoading(false);
      return;
    }
    setUser({
      id: payload.sub || payload.user_id,
      email: payload.email || '',
      full_name: payload.full_name || '',
      role: payload.role || 'user',
      company_id: payload.company_id,
    });
    setLoading(false);
  }, []);

  useEffect(() => { loadUser(); }, [loadUser]);

  const login = async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    localStorage.setItem('access_token', res.access_token);
    localStorage.setItem('refresh_token', res.refresh_token);
    loadUser();
  };

  const logout = async () => {
    const refresh = localStorage.getItem('refresh_token') || '';
    try { await authApi.logout(refresh); } catch {}
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
  };

  const registerUser = async (data: any) => {
    await authApi.registerUser(data);
  };

  const registerCompany = async (data: any) => {
    const res = await authApi.registerCompany(data);
    localStorage.setItem('access_token', res.access_token);
    localStorage.setItem('refresh_token', res.refresh_token);
    loadUser();
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      logout,
      registerUser,
      registerCompany,
      isAdmin: user?.role === 'company_admin',
      isSuperAdmin: user?.role === 'superadmin',
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
