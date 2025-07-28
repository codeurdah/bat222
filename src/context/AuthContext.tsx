import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { userService } from '../services/database';
import { logger } from '../utils/logger';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
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
    const loadUser = async () => {
      // Pour la démo, vérifier s'il y a un utilisateur stocké localement
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          logger.info('User session restored from localStorage', { userId: parsedUser.id });
        } catch (error) {
          localStorage.removeItem('currentUser');
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Pour la démo, utiliser l'authentification basique avec la table users
      // Au lieu de l'authentification Supabase Auth
      const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .or(`email.eq.${email},username.eq.${email}`)
        .eq('password_hash', password)
        .maybeSingle();

      if (error) {
        logger.error('Login error', error);
        return false;
      }

      if (users) {
        const fetchedUser = userService.mapUserFromDb(users);
        setUser(fetchedUser);
        logger.info('User logged in', { userId: users.id, email: users.email });
        return true;
      }
      return false;
    } catch (error) {
      logger.error('Login error', error as Error);
      return false;
    }
  };

  const logout = async () => {
    logger.info('User logged out', { username: user?.username });
    localStorage.removeItem('currentUser');
    
    // Clear any session timers or data
    sessionStorage.clear();
    
    setUser(null);
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