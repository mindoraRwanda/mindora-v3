import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { createContext, useContext, useEffect, useState } from 'react';

export interface User {
    id: string;
    name: string;
    email: string;
    phone?: string;
    location?: string;
    avatar?: string;
    memberSince: string;
    hasCompletedOnboarding?: boolean;
    stats: {
        sessions: number;
        exercises: number;
        dayStreak: number;
    };
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    signup: (name: string, email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    updateProfile: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEYS = {
    USER: '@mindora_user',
    USERS_DB: '@mindora_users_db',
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        initializeAuth();
    }, []);

    const initializeAuth = async () => {
        try {
            // Seed demo data on first load
            await seedDemoData();

            // Load current user
            const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER);
            if (userData) {
                setUser(JSON.parse(userData));
            }
        } catch (error) {
            console.error('Error initializing auth:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const seedDemoData = async () => {
        try {
            const usersDbString = await AsyncStorage.getItem(STORAGE_KEYS.USERS_DB);
            const usersDb = usersDbString ? JSON.parse(usersDbString) : {};

            // Add demo user if doesn't exist
            if (!usersDb['demo@mindora.com']) {
                usersDb['demo@mindora.com'] = {
                    password: 'demo123',
                    user: {
                        id: 'user-demo-1',
                        name: 'Sarah Johnson',
                        email: 'demo@mindora.com',
                        phone: '+250 788 123 456',
                        location: 'Kigali, Rwanda',
                        avatar: 'https://ui-avatars.com/api/?name=Sarah+Johnson&size=150&background=8B5CF6',
                        memberSince: 'January 2024',
                        hasCompletedOnboarding: true,
                        stats: {
                            sessions: 24,
                            exercises: 67,
                            dayStreak: 12,
                        },
                    },
                };
                await AsyncStorage.setItem(STORAGE_KEYS.USERS_DB, JSON.stringify(usersDb));
            }
        } catch (error) {
            console.error('Error seeding demo data:', error);
        }
    };

    const signup = async (name: string, email: string, password: string) => {
        try {
            // Get existing users database
            const usersDbString = await AsyncStorage.getItem(STORAGE_KEYS.USERS_DB);
            const usersDb = usersDbString ? JSON.parse(usersDbString) : {};

            // Check if user already exists
            if (usersDb[email]) {
                throw new Error('User with this email already exists');
            }

            // Create new user
            const newUser: User = {
                id: `user-${Date.now()}`,
                name,
                email,
                phone: '',
                location: '',
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=150&background=random`,
                memberSince: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
                hasCompletedOnboarding: false,
                stats: {
                    sessions: 0,
                    exercises: 0,
                    dayStreak: 0,
                },
            };

            // Store user credentials and data
            usersDb[email] = {
                password,
                user: newUser,
            };

            await AsyncStorage.setItem(STORAGE_KEYS.USERS_DB, JSON.stringify(usersDb));
            await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));

            setUser(newUser);
        } catch (error) {
            throw error;
        }
    };

    const login = async (email: string, password: string) => {
        try {
            // Get users database
            const usersDbString = await AsyncStorage.getItem(STORAGE_KEYS.USERS_DB);
            const usersDb = usersDbString ? JSON.parse(usersDbString) : {};

            // Check if user exists
            const userRecord = usersDb[email];
            if (!userRecord) {
                throw new Error('User not found. Please sign up first.');
            }

            // Verify password
            if (userRecord.password !== password) {
                throw new Error('Invalid password');
            }

            // Set current user
            await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userRecord.user));
            setUser(userRecord.user);
        } catch (error) {
            throw error;
        }
    };

    const logout = async () => {
        try {
            await AsyncStorage.removeItem(STORAGE_KEYS.USER);
            setUser(null);
            router.replace('/(auth)/login');
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    const updateProfile = async (updates: Partial<User>) => {
        try {
            if (!user) return;

            const updatedUser = { ...user, ...updates };

            // Update in users database
            const usersDbString = await AsyncStorage.getItem(STORAGE_KEYS.USERS_DB);
            const usersDb = usersDbString ? JSON.parse(usersDbString) : {};

            if (usersDb[user.email]) {
                usersDb[user.email].user = updatedUser;
                await AsyncStorage.setItem(STORAGE_KEYS.USERS_DB, JSON.stringify(usersDb));
            }

            // Update current user
            await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
            setUser(updatedUser);
        } catch (error) {
            console.error('Error updating profile:', error);
            throw error;
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated: !!user,
                login,
                signup,
                logout,
                updateProfile,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
