import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Alert,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';

import { theme } from '@/constants/Theme';
import { Button, Card, Input } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginScreen() {
    const { login, isLoading } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email';
        }

        if (!formData.password.trim()) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleLogin = async () => {
        if (!validateForm()) return;

        try {
            await login(formData);
        } catch (error: any) {
            Alert.alert(
                'Login Failed',
                error.message || 'An error occurred during login. Please try again.'
            );
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <View style={styles.logoContainer}>
                        <Ionicons name="bed" size={48} color={theme.colors.secondary} />
                    </View>
                    <Text style={styles.title}>Welcome Back</Text>
                    <Text style={styles.subtitle}>Sign in to your account</Text>
                </View>

                <Card>
                    <Input
                        label="Email Address *"
                        value={formData.email}
                        onChangeText={(value) => handleInputChange('email', value)}
                        placeholder="Enter your email"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoComplete="email"
                        error={errors.email}
                    />

                    <Input
                        label="Password *"
                        value={formData.password}
                        onChangeText={(value) => handleInputChange('password', value)}
                        placeholder="Enter your password"
                        secureTextEntry={!showPassword}
                        autoComplete="password"
                        error={errors.password}
                        rightIcon={
                            <TouchableOpacity
                                onPress={() => setShowPassword(!showPassword)}
                                style={styles.passwordToggle}
                            >
                                <Ionicons
                                    name={showPassword ? 'eye-off' : 'eye'}
                                    size={20}
                                    color={theme.colors.gray[500]}
                                />
                            </TouchableOpacity>
                        }
                    />

                    <Button
                        title="Sign In"
                        onPress={handleLogin}
                        loading={isLoading}
                        disabled={isLoading}
                        style={styles.loginButton}
                    />

                    <View style={styles.credentialsInfo}>
                        <Text style={styles.credentialsTitle}>Default Credentials</Text>
                        <Text style={styles.credentialsText}>
                            Admin: admin@affordaily.com / admin123{'\n'}
                            Receptionist: receptionist@affordaily.com / receptionist123
                        </Text>
                    </View>
                </Card>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.gray[50],
    },
    scrollContent: {
        flexGrow: 1,
        padding: theme.spacing.lg,
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: theme.spacing.xl,
    },
    logoContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: theme.colors.secondary + '20',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: theme.spacing.lg,
    },
    title: {
        fontSize: theme.typography.fontSize.xxl,
        fontWeight: theme.typography.fontWeight.bold,
        color: theme.colors.black,
        marginBottom: theme.spacing.sm,
    },
    subtitle: {
        fontSize: theme.typography.fontSize.md,
        color: theme.colors.gray[600],
        textAlign: 'center',
    },
    loginButton: {
        marginTop: theme.spacing.lg,
    },
    passwordToggle: {
        padding: theme.spacing.xs,
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: theme.spacing.lg,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: theme.colors.gray[300],
    },
    dividerText: {
        marginHorizontal: theme.spacing.md,
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.gray[500],
    },
    credentialsInfo: {
        backgroundColor: theme.colors.gray[100],
        borderRadius: 8,
        padding: theme.spacing.md,
        marginTop: theme.spacing.lg,
    },
    credentialsTitle: {
        fontSize: theme.typography.fontSize.sm,
        fontWeight: theme.typography.fontWeight.semibold,
        color: theme.colors.gray[700],
        marginBottom: theme.spacing.sm,
    },
    credentialsText: {
        fontSize: theme.typography.fontSize.xs,
        color: theme.colors.gray[600],
        lineHeight: 16,
    },
});
