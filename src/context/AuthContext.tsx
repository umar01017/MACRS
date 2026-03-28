'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export interface User {
  id: string;
  username: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, userData: User) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const storedToken = localStorage.getItem('macrs_token');
    const storedUser = localStorage.getItem('macrs_user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      if (!token && pathname === '/') {
        router.replace('/login');
      } else if (token && (pathname === '/login' || pathname === '/register')) {
        router.replace('/');
      }
    }
  }, [token, pathname, isLoading, router]);

  const login = (newToken: string, userData: User) => {
    localStorage.setItem('macrs_token', newToken);
    localStorage.setItem('macrs_user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
    router.push('/');
  };

  const logout = () => {
    localStorage.removeItem('macrs_token');
    localStorage.removeItem('macrs_user');
    setToken(null);
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
