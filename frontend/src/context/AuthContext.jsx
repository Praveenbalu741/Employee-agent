/**
 * context/AuthContext.jsx — Global auth state via React Context
 *
 * Fixes applied:
 *  - useRef abort guard prevents double-invocation in React StrictMode
 *  - Session restore errors are truly silent (no toast side effects)
 *  - `loading` only resolves after the attempt completes (prevents flash)
 */

import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { authAPI, setAccessToken, clearAccessToken } from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  // Guard against React StrictMode's double-invocation of effects
  const hasFetched = useRef(false);

  // ─── Try to restore session on mount ────────────────────────────────────────
  useEffect(() => {
    // Skip the second run in StrictMode dev (each effect mounts, unmounts, remounts)
    if (hasFetched.current) return;
    hasFetched.current = true;

    const restoreSession = async () => {
      try {
        // authAPI.refresh uses a plain axios instance — no interceptor loops
        const { data } = await authAPI.refresh();
        setAccessToken(data.accessToken);

        // Now fetch the user profile
        const me = await authAPI.me();
        setUser(me.data.user);
      } catch {
        // No valid session — this is expected for new visitors, stay silent
        clearAccessToken();
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  // ─── Login ────────────────────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    const { data } = await authAPI.login({ email, password });
    setAccessToken(data.accessToken);
    setUser(data.user);
    return data.user;
  }, []);

  // ─── Register ─────────────────────────────────────────────────────────────
  const register = useCallback(async (name, email, password, role) => {
    const { data } = await authAPI.register({ name, email, password, role });
    setAccessToken(data.accessToken);
    setUser(data.user);
    return data.user;
  }, []);

  // ─── Logout ───────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try { await authAPI.logout(); } catch { /* ignore backend errors on logout */ }
    clearAccessToken();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, isAuthenticated: !!user }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
