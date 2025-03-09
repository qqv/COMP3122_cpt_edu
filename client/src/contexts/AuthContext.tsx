import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

// Debug Mode: 可以设置为 false 来使用真实的 API
const DEBUG_MODE = false;
const DEBUG_USER = {
  _id: 'debug123',
  name: 'Debug Lecturer',
  email: 'lecturer@example.com',
  role: 'lecturer'
};

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(DEBUG_MODE ? DEBUG_USER : null);
  const [loading, setLoading] = useState(!DEBUG_MODE);

  useEffect(() => {
    // If in debug mode, skip authentication check
    if (DEBUG_MODE) {
      return;
    }

    // Check if user is logged in
    const checkAuth = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/auth/me');
        setUser(data);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    if (DEBUG_MODE) {
      setUser(DEBUG_USER);
      return;
    }

    try {
      const { data } = await api.post('/auth/login', { email, password });
      setUser(data.user);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed';
      throw new Error(message);
    }
  };

  const logout = async () => {
    if (DEBUG_MODE) {
      // In debug mode, just reset to debug user
      setUser(DEBUG_USER);
      return;
    }

    try {
      await api.post('/auth/logout');
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 