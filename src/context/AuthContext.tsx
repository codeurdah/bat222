import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { userService } from '../services/database';
import { logger } from '../utils/logger';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const foundUser = await userService.getByUsername(username);
      
      if (foundUser && foundUser.password === password) {
        setUser(foundUser);
        localStorage.setItem('currentUser', JSON.stringify(foundUser));
        logger.info('User logged in', { username: foundUser.username, role: foundUser.role });
        return true;
      }
      logger.warn('Failed login attempt', { username });
      return false;
    } catch (error) {
      logger.error('Login error', error as Error);
      return false;
    }
  };

  const logout = () => {
    logger.info('User logged out', { username: user?.username });
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};