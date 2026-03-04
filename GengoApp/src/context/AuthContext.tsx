import React, { createContext, useContext, useEffect, useState } from 'react';
import { loadUser, saveUser, clearUser } from '../utils/storage';
import type { UserProfile } from '../types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AuthContextValue {
  user: UserProfile | null;
  loading: boolean;
  login: (name: string) => Promise<void>;
  logout: () => Promise<void>;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
});

// ─── Provider ────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser().then((profile) => {
      setUser(profile);
      setLoading(false);
    });
  }, []);

  async function login(name: string) {
    const profile: UserProfile = { name, createdAt: new Date().toISOString() };
    await saveUser(profile);
    setUser(profile);
  }

  async function logout() {
    await clearUser();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}
