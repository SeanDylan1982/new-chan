import { useState, useEffect } from 'react';
import { User } from '../types';

// Mock authentication hook - ready for backend integration
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockUser: User = {
        id: '1',
        username: 'user123',
        email,
        isAnonymous: false,
        joinDate: new Date().toISOString(),
        postCount: 42
      };
      
      setUser(mockUser);
      localStorage.setItem('user', JSON.stringify(mockUser));
    } catch (error) {
      throw new Error('Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (username: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockUser: User = {
        id: '2',
        username,
        email,
        isAnonymous: false,
        joinDate: new Date().toISOString(),
        postCount: 0
      };
      
      setUser(mockUser);
      localStorage.setItem('user', JSON.stringify(mockUser));
    } catch (error) {
      throw new Error('Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const signInAnonymous = () => {
    const anonUser: User = {
      id: 'anon-' + Date.now(),
      username: 'Anonymous',
      email: '',
      isAnonymous: true,
      joinDate: new Date().toISOString(),
      postCount: 0
    };
    setUser(anonUser);
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  return {
    user,
    isLoading,
    signIn,
    signUp,
    signOut,
    signInAnonymous,
    isAuthenticated: !!user
  };
};