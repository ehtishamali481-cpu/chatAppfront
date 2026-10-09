import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { User } from '../types';
import {
  loginApi,
  signUpApi,
  logoutApi,
  getCurrentUserApi,
  updateUserProfileApi,
} from '../api/client';
import { connectSocket, disconnectSocket } from '../services/socketService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, remember?: boolean) => Promise<boolean>;
  signup: (userData: {
    fullName: string;
    email: string;
    password: string;
    profileImage?: string;
  }) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

useEffect(() => {
    const verifySession = async () => {
      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (!token) {
          setUser(null);
          setIsLoading(false);
          return;
        }

        const currentUser = await getCurrentUserApi();
        if (currentUser) {
          setUser(currentUser);
          connectSocket(token);
        } else {
          setUser(null);
        }
      } catch (err) {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    verifySession();
  }, []);

  const login = async (
    email: string,
    password: string,
    remember: boolean = true
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await loginApi(email, password);

      if (!response || !response.user) {
        throw new Error('Invalid server response: User object is missing.');
      }

      setUser(response.user);
      if (remember) {
        localStorage.setItem('token', response.token);
      } else {
        sessionStorage.setItem('token', response.token);
      }
      localStorage.setItem('current_user_id', response.user.id);

connectSocket(response.token);

      toast.success(`Welcome back, ${response.user.name}!`);
      return true;
    } catch (err: any) {
      const errorMsg = err.message || 'Login failed. Please verify credentials.';
      toast.error(errorMsg);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (userData: {
    fullName: string;
    email: string;
    password: string;
    profileImage?: string;
  }): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await signUpApi({
        fullName: userData.fullName,
        email: userData.email,
        password: userData.password,
        avatarUrl: userData.profileImage,
      });

      setUser(response.user);
      localStorage.setItem('token', response.token);
      localStorage.setItem('current_user_id', response.user.id);

connectSocket(response.token);

      toast.success(`Account created successfully! Welcome, ${response.user.name}.`);
      return true;
    } catch (err: any) {
      const errorMsg = err.message || 'Registration failed. Please check inputs.';
      toast.error(errorMsg);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await logoutApi();
    } catch (e) {
      console.warn('Logout API error', e);
    }

    disconnectSocket();
    setUser(null);
  };

  const updateUser = async (data: Partial<User>): Promise<void> => {
    try {
      const updatedUser = await updateUserProfileApi(data);
      setUser(updatedUser);
      toast.success('Profile updated successfully.');
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to update profile.');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isLoading,
        login,
        signup,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};