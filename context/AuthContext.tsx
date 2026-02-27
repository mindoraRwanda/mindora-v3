import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'auth_token';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface AuthContextType {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  signIn: (token: string, user: User) => Promise<void>;
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadToken();
  }, []);

  const loadToken = async () => {
    try {
      let storedToken = null;
      if (Platform.OS === 'web') {
        storedToken = localStorage.getItem(TOKEN_KEY);
      } else {
        storedToken = await SecureStore.getItemAsync(TOKEN_KEY);
      }

      if (storedToken) {
        setToken(storedToken);
        // Here we could also fetch the user profile if we don't store user info
        // For now, we rely on the app to fetch profile after auth check if needed
        // Or we could store user info in storage too
      }
    } catch (e) {
      console.error('Failed to load token', e);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    try {
      if (Platform.OS === 'web') {
        localStorage.setItem(TOKEN_KEY, newToken);
        localStorage.setItem('user_info', JSON.stringify(newUser));
      } else {
        await SecureStore.setItemAsync(TOKEN_KEY, newToken);
        await SecureStore.setItemAsync('user_info', JSON.stringify(newUser));
      }
    } catch (e) {
      console.error('Failed to save token', e);
    }
  };

  const signOut = async () => {
    setToken(null);
    setUser(null);
    try {
      if (Platform.OS === 'web') {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem('user_info');
      } else {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
        await SecureStore.deleteItemAsync('user_info');
      }
    } catch (e) {
      console.error('Failed to delete token', e);
    }
  };

  const updateUser = (newUser: User) => {
    setUser(newUser);
  };

  // Try to load user from storage as well
  useEffect(() => {
    const loadUser = async () => {
      try {
        let storedUser = null;
        if (Platform.OS === 'web') {
          storedUser = localStorage.getItem('user_info');
        } else {
          storedUser = await SecureStore.getItemAsync('user_info');
        }

        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (e) {
        console.error('Failed to load user', e);
      }
    };
    loadUser();
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
