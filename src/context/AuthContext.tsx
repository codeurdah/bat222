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
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // Fetch user profile from public.users table using the Supabase Auth user ID
        try {
          const fetchedUser = await userService.getById(session.user.id);
          if (fetchedUser) {
            setUser(fetchedUser);
            logger.info('User session restored', { userId: session.user.id, email: session.user.email });
          } else {
            logger.warn('User profile not found in public.users for session ID', { userId: session.user.id });
            await supabase.auth.signOut(); // Sign out if profile not found
          }
        } catch (error) {
          logger.error('Error fetching user profile from public.users', error as Error);
          await supabase.auth.signOut();
        }
      } else {
        setUser(null);
      }
    };

    loadUser();

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        // Fetch user profile from public.users table
        userService.getById(session.user.id)
          .then(fetchedUser => {
            if (fetchedUser) {
              setUser(fetchedUser);
              logger.info('Auth state changed: User logged in', { userId: session.user.id, email: session.user.email });
            } else {
              logger.warn('Auth state changed: User profile not found in public.users', { userId: session.user.id });
              supabase.auth.signOut();
            }
          })
          .catch(error => {
            logger.error('Auth state changed: Error fetching user profile', error as Error);
            supabase.auth.signOut();
          });
      } else {
        setUser(null);
        logger.info('Auth state changed: User logged out');
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        logger.error('Supabase login error', error);
        return false;
      }

      if (data.user) {
        // Fetch user profile from public.users table using the Supabase Auth user ID
        const fetchedUser = await userService.getById(data.user.id);
        if (fetchedUser) {
          setUser(fetchedUser);
          logger.info('User logged in via Supabase Auth', { userId: data.user.id, email: data.user.email });
          return true;
        } else {
          logger.warn('User profile not found in public.users after Supabase Auth login', { userId: data.user.id });
          await supabase.auth.signOut(); // Sign out if profile not found in public.users
          return false;
        }
      }
      return false;
    } catch (error) {
      logger.error('Login error', error as Error);
      return false;
    }
  };

  const logout = async () => {
    logger.info('User logged out', { username: user?.username });
    await supabase.auth.signOut();
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