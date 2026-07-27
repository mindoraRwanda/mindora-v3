import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import {
  ApiError,
  AuthUser,
  PatientProfile,
  TherapistProfile,
  getMe,
  getMyProfile,
  logout as apiLogout,
  refreshAccessToken,
} from '@/services/api';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_info';
const PROFILE_KEY = 'user_profile';

export type Profile = PatientProfile | TherapistProfile;

interface AuthContextType {
  token: string | null;
  user: AuthUser | null;
  profile: Profile | null;
  isLoading: boolean;
  signIn: (accessToken: string) => Promise<void>;
  signOut: () => Promise<void>;
  setProfile: (profile: Profile) => void;
  refreshProfile: () => Promise<void>;
  /** Runs `fn` with the current token; on a 401 it refreshes the session once and retries. */
  withAuth: <T>(fn: (token: string) => Promise<T>) => Promise<T>;
}

const AuthContext = createContext<AuthContextType>({
  token: null,
  user: null,
  profile: null,
  isLoading: true,
  signIn: async () => {},
  signOut: async () => {},
  setProfile: () => {},
  refreshProfile: async () => {},
  withAuth: async (fn) => fn(''),
});

export const useAuth = () => useContext(AuthContext);

// Storage helpers that work cross-platform
const storage = {
  getItem: async (key: string): Promise<string | null> => {
    if (Platform.OS === 'web') return localStorage.getItem(key);
    return SecureStore.getItemAsync(key);
  },
  setItem: async (key: string, value: string): Promise<void> => {
    if (Platform.OS === 'web') localStorage.setItem(key, value);
    else await SecureStore.setItemAsync(key, value);
  },
  removeItem: async (key: string): Promise<void> => {
    if (Platform.OS === 'web') localStorage.removeItem(key);
    else await SecureStore.deleteItemAsync(key);
  },
};

/** A profile doesn't exist yet for brand-new accounts — that's expected, not an error. */
const isProfileMissing = (err: unknown) => err instanceof ApiError && err.status === 404;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfileState] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const persistProfile = useCallback((p: Profile | null) => {
    setProfileState(p);
    if (p) storage.setItem(PROFILE_KEY, JSON.stringify(p)).catch(() => {});
    else storage.removeItem(PROFILE_KEY).catch(() => {});
  }, []);

  const loadProfile = useCallback(
    async (accessToken: string) => {
      try {
        const res = await getMyProfile(accessToken);
        persistProfile(res.profile);
      } catch (err) {
        if (isProfileMissing(err)) persistProfile(null);
        // Otherwise leave whatever cached profile is in state — likely offline.
      }
    },
    [persistProfile]
  );

  const clearSession = useCallback(async () => {
    setToken(null);
    setUser(null);
    setProfileState(null);
    await Promise.all([
      storage.removeItem(TOKEN_KEY),
      storage.removeItem(USER_KEY),
      storage.removeItem(PROFILE_KEY),
    ]).catch(() => {});
  }, []);

  const signIn = useCallback(
    async (accessToken: string) => {
      const authUser = await getMe(accessToken);
      setToken(accessToken);
      setUser(authUser);
      await Promise.all([
        storage.setItem(TOKEN_KEY, accessToken),
        storage.setItem(USER_KEY, JSON.stringify(authUser)),
      ]).catch(() => {});
      await loadProfile(accessToken);
    },
    [loadProfile]
  );

  const signOut = useCallback(async () => {
    if (token) apiLogout(token).catch(() => {});
    await clearSession();
  }, [token, clearSession]);

  const withAuth = useCallback(
    async <T,>(fn: (t: string) => Promise<T>): Promise<T> => {
      if (!token) throw new ApiError('Not signed in', 401);
      try {
        return await fn(token);
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          try {
            const { accessToken } = await refreshAccessToken();
            setToken(accessToken);
            storage.setItem(TOKEN_KEY, accessToken).catch(() => {});
            return await fn(accessToken);
          } catch {
            await clearSession();
          }
        }
        throw err;
      }
    },
    [token, clearSession]
  );

  // Restore session from storage on launch, then verify it's still valid.
  useEffect(() => {
    (async () => {
      try {
        const [storedToken, storedUser, storedProfile] = await Promise.all([
          storage.getItem(TOKEN_KEY),
          storage.getItem(USER_KEY),
          storage.getItem(PROFILE_KEY),
        ]);

        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
          } catch {
            await storage.removeItem(USER_KEY);
          }
        }
        if (storedProfile) {
          try {
            setProfileState(JSON.parse(storedProfile));
          } catch {
            await storage.removeItem(PROFILE_KEY);
          }
        }

        if (storedToken) {
          setToken(storedToken);
          try {
            await getMe(storedToken);
          } catch (err) {
            if (err instanceof ApiError && err.status === 401) {
              try {
                const { accessToken } = await refreshAccessToken();
                await signIn(accessToken);
              } catch {
                await clearSession();
              }
            }
          }
        }
      } catch (e) {
        console.error('Failed to restore auth session', e);
      } finally {
        setIsLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        profile,
        isLoading,
        signIn,
        signOut,
        setProfile: persistProfile,
        refreshProfile: async () => {
          if (token) await loadProfile(token);
        },
        withAuth,
      }}>
      {children}
    </AuthContext.Provider>
  );
}
