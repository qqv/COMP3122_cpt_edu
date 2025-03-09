import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

// 调试模式：模拟已登录的讲师用户
const DEBUG_MODE = true;
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
    // 如果处于调试模式，跳过身份验证检查
    if (DEBUG_MODE) {
      return;
    }

    // 检查用户是否已登录
    const checkAuth = async () => {
      try {
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

    const { data } = await api.post('/auth/login', { email, password });
    setUser(data.user);
  };

  const logout = async () => {
    if (DEBUG_MODE) {
      // 在调试模式下，只是重置为调试用户
      setUser(DEBUG_USER);
      return;
    }

    await api.post('/auth/logout');
    setUser(null);
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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 