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
import { router } from 'expo-router';

import { theme } from '@/constants/Theme';
import { Button, Card, Input } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';

const RestingPlaceIllustration = () => (
    <View style={styles.illustrationWrap}>
        <View style={styles.window}>
            <View style={styles.sun} />
            <View style={styles.windowLine} />
        </View>
        <View style={styles.wallPicture}>
            <View style={styles.pictureDot} />
        </View>
        <View style={styles.bedFrame}>
            <View style={styles.headboard} />
            <View style={styles.mattress}>
                <View style={styles.pillow} />
                <View style={styles.blanket} />
            </View>
            <View style={styles.bedLegLeft} />
            <View style={styles.bedLegRight} />
        </View>
        <View style={styles.sideTable}>
            <View style={styles.lampShade} />
            <View style={styles.lampStem} />
            <View style={styles.tableTop} />
            <View style={styles.tableBody} />
        </View>
        <View style={styles.floorLine} />
    </View>
);

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
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.hero}>
                    <RestingPlaceIllustration />
                    <Text style={styles.kicker}>AFFORDAILY</Text>
                    <Text style={styles.title}>A calm place to begin</Text>
                    <Text style={styles.subtitle}>
                        Welcome back. Sign in to care for stays, rooms, visitors, and payments.
                    </Text>
                </View>

                <Card style={styles.loginCard} padding="lg">
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>Staff sign in</Text>
                        <View style={styles.statusPill}>
                            <View style={styles.statusDot} />
                            <Text style={styles.statusText}>Private access</Text>
                        </View>
                    </View>

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

                    <TouchableOpacity
                        style={styles.forgotPasswordLink}
                        onPress={() => router.push('/auth/forgot-password')}
                    >
                        <Text style={styles.forgotPasswordText}>Forgot password?</Text>
                    </TouchableOpacity>

                    <Button
                        title="Sign In"
                        onPress={handleLogin}
                        loading={isLoading}
                        disabled={isLoading}
                        style={styles.loginButton}
                    />
                </Card>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F4FAF1',
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: theme.spacing.lg,
        paddingTop: theme.spacing.xl,
        paddingBottom: theme.spacing.xl,
        justifyContent: 'center',
    },
    hero: {
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: theme.spacing.xl,
        paddingHorizontal: theme.spacing.md,
    },
    kicker: {
        fontSize: theme.typography.fontSize.xs,
        color: '#6B8E36',
        fontWeight: theme.typography.fontWeight.bold,
        marginTop: theme.spacing.lg,
        marginBottom: theme.spacing.sm,
        letterSpacing: 1.5,
    },
    title: {
        fontSize: theme.typography.fontSize.xxxl,
        fontWeight: theme.typography.fontWeight.bold,
        color: '#143B1D',
        marginBottom: theme.spacing.sm,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: theme.typography.fontSize.md,
        color: '#55735C',
        lineHeight: 22,
        textAlign: 'center',
        maxWidth: 320,
    },
    loginCard: {
        borderColor: '#DDEBD5',
        backgroundColor: '#FFFFFF',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: theme.spacing.lg,
    },
    cardTitle: {
        fontSize: theme.typography.fontSize.lg,
        color: '#143B1D',
        fontWeight: theme.typography.fontWeight.bold,
    },
    statusPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.xs,
        paddingVertical: theme.spacing.xs,
        paddingHorizontal: theme.spacing.sm,
        borderRadius: 8,
        backgroundColor: '#EEF7EA',
    },
    statusDot: {
        width: 7,
        height: 7,
        borderRadius: 4,
        backgroundColor: '#7EA64A',
    },
    statusText: {
        fontSize: theme.typography.fontSize.xs,
        color: '#527B2E',
        fontWeight: theme.typography.fontWeight.semibold,
    },
    loginButton: {
        marginTop: theme.spacing.lg,
    },
    passwordToggle: {
        padding: theme.spacing.xs,
    },
    forgotPasswordLink: {
        alignSelf: 'flex-end',
        marginTop: -theme.spacing.sm,
        marginBottom: theme.spacing.sm,
        paddingVertical: theme.spacing.xs,
    },
    forgotPasswordText: {
        color: '#527B2E',
        fontSize: theme.typography.fontSize.sm,
        fontWeight: theme.typography.fontWeight.semibold,
    },
    illustrationWrap: {
        width: 250,
        height: 176,
        alignSelf: 'center',
        position: 'relative',
    },
    window: {
        position: 'absolute',
        top: 8,
        left: 30,
        width: 54,
        height: 62,
        borderRadius: 8,
        backgroundColor: '#E8F4EE',
        borderWidth: 2,
        borderColor: '#B9D2C1',
    },
    sun: {
        position: 'absolute',
        top: 10,
        right: 9,
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: '#D0F253',
    },
    windowLine: {
        position: 'absolute',
        left: 24,
        top: 0,
        bottom: 0,
        width: 2,
        backgroundColor: '#B9D2C1',
    },
    wallPicture: {
        position: 'absolute',
        top: 20,
        right: 40,
        width: 42,
        height: 34,
        borderRadius: 8,
        backgroundColor: '#F2F7E8',
        borderWidth: 2,
        borderColor: '#C9DDC1',
        alignItems: 'center',
        justifyContent: 'center',
    },
    pictureDot: {
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: '#9EBE67',
    },
    bedFrame: {
        position: 'absolute',
        left: 26,
        bottom: 32,
        width: 148,
        height: 72,
    },
    headboard: {
        position: 'absolute',
        left: 0,
        bottom: 0,
        width: 26,
        height: 64,
        borderRadius: 8,
        backgroundColor: '#5D7D45',
    },
    mattress: {
        position: 'absolute',
        left: 20,
        bottom: 10,
        width: 128,
        height: 48,
        borderRadius: 8,
        backgroundColor: '#FFFFFF',
        borderWidth: 2,
        borderColor: '#C7DEC0',
        overflow: 'hidden',
    },
    pillow: {
        position: 'absolute',
        left: 9,
        top: 9,
        width: 38,
        height: 22,
        borderRadius: 8,
        backgroundColor: '#E7F2E1',
    },
    blanket: {
        position: 'absolute',
        right: 0,
        bottom: 0,
        width: 78,
        height: 34,
        borderTopLeftRadius: 18,
        backgroundColor: '#D0F253',
    },
    bedLegLeft: {
        position: 'absolute',
        left: 34,
        bottom: 0,
        width: 8,
        height: 14,
        borderRadius: 4,
        backgroundColor: '#5D7D45',
    },
    bedLegRight: {
        position: 'absolute',
        right: 4,
        bottom: 0,
        width: 8,
        height: 14,
        borderRadius: 4,
        backgroundColor: '#5D7D45',
    },
    sideTable: {
        position: 'absolute',
        right: 34,
        bottom: 34,
        width: 52,
        height: 74,
        alignItems: 'center',
    },
    lampShade: {
        width: 34,
        height: 20,
        borderRadius: 8,
        backgroundColor: '#F2E6AE',
        borderWidth: 2,
        borderColor: '#D6C777',
    },
    lampStem: {
        width: 5,
        height: 18,
        backgroundColor: '#6D8555',
    },
    tableTop: {
        width: 44,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#7EA64A',
    },
    tableBody: {
        width: 34,
        height: 26,
        borderBottomLeftRadius: 8,
        borderBottomRightRadius: 8,
        backgroundColor: '#5D7D45',
    },
    floorLine: {
        position: 'absolute',
        left: 12,
        right: 12,
        bottom: 22,
        height: 3,
        borderRadius: 2,
        backgroundColor: '#CFE4C8',
    },
});
