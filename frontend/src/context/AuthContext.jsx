import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import * as authApi from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true); // true while checking stored token

  // On mount, use cached user instantly then validate in background
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      // Use cached user data for instant render
      const cachedUser = localStorage.getItem('user');
      let hasCachedData = false;
      if (cachedUser) {
        try {
          setUser(JSON.parse(cachedUser));
          setIsAuthenticated(true);
          hasCachedData = true;
          setLoading(false); // Unblock UI immediately
        } catch { /* ignore parse errors */ }
      }

      // Validate token in background — don't block UI if cached
      authApi
        .getMe()
        .then((data) => {
          setUser(data.user);
          localStorage.setItem('user', JSON.stringify(data.user));
          setIsAuthenticated(true);
        })
        .catch(() => {
          // Token invalid/expired — clear
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
          setIsAuthenticated(false);
          setUser(null);
        })
        .finally(() => {
          if (!hasCachedData) setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await authApi.login(email, password);
    localStorage.setItem('access_token', data.tokens.access);
    localStorage.setItem('refresh_token', data.tokens.refresh);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    setIsAuthenticated(true);
    return data;
  }, []);

  const register = useCallback(async (formData) => {
    const data = await authApi.register(formData);
    localStorage.setItem('access_token', data.tokens.access);
    localStorage.setItem('refresh_token', data.tokens.refresh);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    setIsAuthenticated(true);
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('merchants');
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, loading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
