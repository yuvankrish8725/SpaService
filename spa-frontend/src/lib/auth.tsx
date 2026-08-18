'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthResponse, BranchUnlockDto, UserDto, apiFetch } from './api';

interface AuthContextType {
  user: UserDto | null;
  activeUnlocks: BranchUnlockDto[];
  token: string | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<AuthResponse>;
  register: (fullName: string, email: string, phone: string, pass: string) => Promise<AuthResponse>;
  logout: () => void;
  updateAuth: (authResponse: AuthResponse) => void;
  isBranchUnlocked: (branchId: string) => boolean;
  getBranchUnlockRemainingTime: (branchId: string) => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserDto | null>(null);
  const [activeUnlocks, setActiveUnlocks] = useState<BranchUnlockDto[]>([]);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('spa_token');
      const storedUser = localStorage.getItem('spa_user');
      const storedUnlocks = localStorage.getItem('spa_unlocks');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        if (storedUnlocks) {
          const parsedUnlocks: BranchUnlockDto[] = JSON.parse(storedUnlocks);
          // filter out expired unlocks
          const now = new Date().getTime();
          const validUnlocks = parsedUnlocks.filter(u => new Date(u.expiresAt).getTime() > now);
          setActiveUnlocks(validUnlocks);
        }
      }
    } catch (e) {
      console.error('Failed to load stored auth', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateAuth = (auth: AuthResponse) => {
    setToken(auth.accessToken);
    setUser(auth.user);
    setActiveUnlocks(auth.activeUnlocks || []);

    localStorage.setItem('spa_token', auth.accessToken);
    localStorage.setItem('spa_user', JSON.stringify(auth.user));
    localStorage.setItem('spa_unlocks', JSON.stringify(auth.activeUnlocks || []));
  };

  const login = async (email: string, pass: string): Promise<AuthResponse> => {
    const res = await apiFetch<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password: pass }),
    });
    updateAuth(res);
    return res;
  };

  const register = async (fullName: string, email: string, phone: string, pass: string): Promise<AuthResponse> => {
    const res = await apiFetch<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ fullName, email, phone, password: pass }),
    });
    updateAuth(res);
    return res;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setActiveUnlocks([]);
    localStorage.removeItem('spa_token');
    localStorage.removeItem('spa_user');
    localStorage.removeItem('spa_unlocks');
  };

  const isBranchUnlocked = (branchId: string): boolean => {
    if (!user) return false;
    if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') return true;

    const now = new Date().getTime();
    return activeUnlocks.some(u => u.branchId === branchId && new Date(u.expiresAt).getTime() > now);
  };

  const getBranchUnlockRemainingTime = (branchId: string): string | null => {
    const unlock = activeUnlocks.find(u => u.branchId === branchId);
    if (!unlock) return null;

    const diff = new Date(unlock.expiresAt).getTime() - new Date().getTime();
    if (diff <= 0) return null;

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${mins}m`;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        activeUnlocks,
        token,
        isLoading,
        login,
        register,
        logout,
        updateAuth,
        isBranchUnlocked,
        getBranchUnlockRemainingTime,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
