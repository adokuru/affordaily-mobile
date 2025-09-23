import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'expo-router';
import { apiService, User, LoginCredentials } from '../services/api';
import { useUser, useLogin, useLogout } from '../hooks/useAuthQueries';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (credentials: LoginCredentials) => Promise<void>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const router = useRouter();

    // Use TanStack Query for user data
    const { data: user, isLoading: userLoading, error: userError } = useUser();
    const loginMutation = useLogin();
    const logoutMutation = useLogout();

    const isAuthenticated = !!user && apiService.isAuthenticated();
    const isLoading = userLoading || loginMutation.isPending || logoutMutation.isPending;

    // Handle authentication errors
    useEffect(() => {
        if (userError && apiService.isAuthenticated()) {
            // Token is invalid, clear it
            apiService.clearToken();
        }
    }, [userError]);

    const login = async (credentials: LoginCredentials) => {
        try {
            await loginMutation.mutateAsync(credentials);
            // Navigate to main app
            router.replace('/(tabs)');
        } catch (error) {
            throw error;
        }
    };

    const logout = async () => {
        try {
            await logoutMutation.mutateAsync();
            // Navigate to auth screen
            router.replace('/auth/login');
        } catch (error) {
            // Even if API call fails, navigate to login
            router.replace('/auth/login');
        }
    };

    const refreshUser = async () => {
        // TanStack Query handles refetching automatically
        // This method is kept for compatibility but doesn't need to do anything
    };

    const value: AuthContextType = {
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
        refreshUser,
    };

    return (
        <AuthContext.Provider value={value}>
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
