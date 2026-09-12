import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import api from '../services/api';

const AuthContext = createContext();

function parseJwtExp(token) {
  if (!token) return null;
  try {
    const payloadBase64 = token.split('.')[1];
    if (!payloadBase64) return null;
    const decodedJson = atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/'));
    const payload = JSON.parse(decodedJson);
    return payload.exp ? payload.exp * 1000 : null; // Convert seconds to ms
  } catch (e) {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const timerRef = useRef(null);

  const logout = (expired = false) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    if (expired && typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
      window.location.href = '/login?expired=true';
    }
  };

  const scheduleExpirationTimer = (token) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    const expMs = parseJwtExp(token);
    if (!expMs) return;

    const delay = expMs - Date.now();
    if (delay <= 0) {
      logout(true);
      return;
    }

    timerRef.current = setTimeout(() => {
      logout(true);
    }, delay);
  };

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token') || (storedUser ? JSON.parse(storedUser)?.token : null);

      if (token) {
        const expMs = parseJwtExp(token);
        if (expMs && Date.now() >= expMs) {
          logout(true);
          setLoading(false);
          return;
        }
      }

      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        if (parsedUser?.token) {
          scheduleExpirationTimer(parsedUser.token);
        }
      }
    } catch (e) {
      console.error('Failed to parse stored auth user', e);
    } finally {
      setLoading(false);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      const loggedUser = response.data;
      setUser(loggedUser);
      localStorage.setItem('user', JSON.stringify(loggedUser));
      if (loggedUser.token) {
        localStorage.setItem('token', loggedUser.token);
        scheduleExpirationTimer(loggedUser.token);
      }
      return loggedUser;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password, role) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/register', { name, email, password, role });
      const newUser = response.data;
      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
      if (newUser.token) {
        localStorage.setItem('token', newUser.token);
        scheduleExpirationTimer(newUser.token);
      }
      return newUser;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
