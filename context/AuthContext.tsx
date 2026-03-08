import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'auth_refresh_token';
const USER_KEY = 'user_info';

interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
}

interface AuthContextType {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  signIn: (token: string, user: User, refreshToken?: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType>({
  token: null,
  user: null,
  isLoading: true,
  signIn: async () => {},
  signOut: async () => {},
  updateUser: () => {},
});

export const useAuth = () => useContext(AuthContext);

// Storage helpers that work cross-platform
const storage = {
  getItem: async (key: string): Promise<string | null> => {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    }
    return SecureStore.getItemAsync(key);
  },
  setItem: async (key: string, value: string): Promise<void> => {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
    } else {
      await SecureStore.setItemAsync(key, value);
    }
  },
  removeItem: async (key: string): Promise<void> => {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
    } else {
      await SecureStore.deleteItemAsync(key);
    }
  },
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Single effect to load both token and user — avoids race condition
  useEffect(() => {
    const initialize = async () => {
      try {
        const [storedToken, storedUser] = await Promise.all([
          storage.getItem(TOKEN_KEY),
          storage.getItem(USER_KEY),
        ]);

        if (storedToken) {
          setToken(storedToken);
        }
        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
          } catch {
            // Corrupted user data — clear it
            await storage.removeItem(USER_KEY);
          }
        }
      } catch (e) {
        console.error('Failed to initialize auth state', e);
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, []);

  const signIn = useCallback(async (newToken: string, newUser: User, refreshToken?: string) => {
    setToken(newToken);
    setUser(newUser);
    try {
      await Promise.all([
        storage.setItem(TOKEN_KEY, newToken),
        storage.setItem(USER_KEY, JSON.stringify(newUser)),
        ...(refreshToken ? [storage.setItem(REFRESH_TOKEN_KEY, refreshToken)] : []),
      ]);
    } catch (e) {
      console.error('Failed to persist auth state', e);
    }
  }, []);

  const signOut = useCallback(async () => {
    setToken(null);
    setUser(null);
    try {
      await Promise.all([
        storage.removeItem(TOKEN_KEY),
        storage.removeItem(USER_KEY),
        storage.removeItem(REFRESH_TOKEN_KEY),
      ]);
    } catch (e) {
      console.error('Failed to clear auth state', e);
    }
  }, []);

  const updateUser = useCallback((newUser: User) => {
    setUser(newUser);
    storage.setItem(USER_KEY, JSON.stringify(newUser)).catch(console.error);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isLoading,
        signIn,
        signOut,
        updateUser,
      }}>
      {children}
    </AuthContext.Provider>
  );
}
