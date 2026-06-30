import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'expo-router';
import { apiService, User, LoginCredentials } from '../services/api';
import { useUser, useLogin, useLogout } from '../hooks/useAuthQueries';
import { useQueryClient } from '@tanstack/react-query';
import { authKeys } from '../hooks/useAuthQueries';

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
    const queryClient = useQueryClient();

    // Wait for SecureStore token to be read before making any auth decisions.
    // Without this, apiService.isAuthenticated() is always false on first render
    // because the async SecureStore read hasn't completed yet.
    const [tokenReady, setTokenReady] = useState(false);

    useEffect(() => {
        apiService.tokenReady.then(() => setTokenReady(true));
    }, []);

    // Only fetch user profile once the persisted token has been loaded
    const { data: user, isLoading: userLoading, error: userError } = useUser(tokenReady);
    const loginMutation = useLogin();
    const logoutMutation = useLogout();

    const isAuthenticated = !!user && apiService.isAuthenticated();
    // Show loading until SecureStore is checked AND any in-flight requests finish
    const isLoading = !tokenReady || userLoading || loginMutation.isPending || logoutMutation.isPending;

    // If the server rejects our stored token, clear it so the user sees the login screen
    useEffect(() => {
        if (userError && apiService.isAuthenticated()) {
            apiService.clearToken();
            queryClient.clear();
        }
    }, [userError, queryClient]);

    const login = async (credentials: LoginCredentials) => {
        await loginMutation.mutateAsync(credentials);
        router.replace('/(tabs)');
    };

    const logout = async () => {
        try {
            await logoutMutation.mutateAsync();
        } finally {
            router.replace('/auth/login');
        }
    };

    const refreshUser = async () => {
        await queryClient.invalidateQueries({ queryKey: authKeys.user() });
    };

    return (
        <AuthContext.Provider value={{ user: user ?? null, isAuthenticated, isLoading, login, logout, refreshUser }}>
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
