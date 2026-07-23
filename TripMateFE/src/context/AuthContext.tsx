import React, { createContext, useState, useEffect, type ReactNode } from 'react';
import type { User, AuthResponse } from '../types/auth';
import { storage } from '../utils/storage';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  registeredEmail: string | null;
  setRegisteredEmail: (email: string | null) => void;
  saveAuthSession: (authData: AuthResponse) => void;
  updateUser: (userInfo: Partial<User>) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Nạp trạng thái đăng nhập ban đầu từ LocalStorage
    const savedUser = storage.getUser<User>();
    const token = storage.getAccessToken();
    if (savedUser && token) {
      setUser(savedUser);
    }
    setIsLoading(false);
  }, []);

  const saveAuthSession = (authData: AuthResponse) => {
    storage.setAccessToken(authData.accessToken);
    storage.setRefreshToken(authData.refreshToken);

    const userInfo: User = {
      userId: authData.userId,
      fullName: authData.fullName,
      email: authData.email,
      role: authData.role,
      avatarUrl: authData.avatarUrl,
      phoneNumber: authData.phoneNumber,
    };

    storage.setUser(userInfo);
    setUser(userInfo);
  };

  const updateUser = (updatedFields: Partial<User>) => {
    setUser((prevUser) => {
      if (!prevUser) return null;
      const updatedUser = { ...prevUser, ...updatedFields };
      storage.setUser(updatedUser);
      return updatedUser;
    });
  };

  const logout = () => {
    storage.clearAuth();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        registeredEmail,
        setRegisteredEmail,
        saveAuthSession,
        updateUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
