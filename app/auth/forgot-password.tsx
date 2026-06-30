import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { Button, Card, Input } from '@/components/ui';
import { theme } from '@/constants/Theme';
import {
    useForgotPassword,
    useResetPassword,
    useVerifyPasswordOtp,
} from '@/hooks/useAuthQueries';

type Step = 'email' | 'otp' | 'reset';

export default function ForgotPasswordScreen() {
    const [step, setStep] = useState<Step>('email');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const forgotPassword = useForgotPassword();
    const verifyOtp = useVerifyPasswordOtp();
    const resetPassword = useResetPassword();

    const normalizedEmail = email.trim().toLowerCase();

    const requestOtp = async () => {
        if (!/\S+@\S+\.\S+/.test(normalizedEmail)) {
            Alert.alert('Invalid Email', 'Please enter a valid staff email.');
            return;
        }

        try {
            await forgotPassword.mutateAsync({ email: normalizedEmail });
            setStep('otp');
        } catch (error) {
            Alert.alert(
                'Reset Failed',
                error instanceof Error ? error.message : 'Unable to request reset code.'
            );
        }
    };

    const verifyCode = async () => {
        if (!/^\d{6}$/.test(otp)) {
            Alert.alert('Invalid Code', 'Enter the 6-digit reset code.');
            return;
        }

        try {
            await verifyOtp.mutateAsync({ email: normalizedEmail, otp });
            setStep('reset');
        } catch (error) {
            Alert.alert(
                'Invalid Code',
                error instanceof Error ? error.message : 'The reset code is invalid or expired.'
            );
        }
    };

    const submitPassword = async () => {
        if (password.length < 8) {
            Alert.alert('Password Too Short', 'Use at least 8 characters.');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Passwords Do Not Match', 'Please confirm the same password.');
            return;
        }

        try {
            await resetPassword.mutateAsync({
                email: normalizedEmail,
                otp,
                password,
                password_confirmation: confirmPassword,
            });

            Alert.alert('Password Updated', 'You can now sign in with your new password.', [
                { text: 'Sign In', onPress: () => router.replace('/auth/login') },
            ]);
        } catch (error) {
            Alert.alert(
                'Reset Failed',
                error instanceof Error ? error.message : 'Unable to reset password.'
            );
        }
    };

    const isLoading =
        forgotPassword.isPending || verifyOtp.isPending || resetPassword.isPending;

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={20} color="#527B2E" />
                    <Text style={styles.backText}>Back to sign in</Text>
                </TouchableOpacity>

                <View style={styles.hero}>
                    <View style={styles.iconShell}>
                        <Ionicons name="mail-open" size={30} color="#214E2B" />
                    </View>
                    <Text style={styles.kicker}>PASSWORD HELP</Text>
                    <Text style={styles.title}>Reset with a secure code</Text>
                    <Text style={styles.subtitle}>
                        We will send a 6-digit code to the staff email on record.
                    </Text>
                </View>

                <Card padding="lg">
                    <View style={styles.steps}>
                        {(['email', 'otp', 'reset'] as Step[]).map((item, index) => (
                            <View
                                key={item}
                                style={[
                                    styles.stepDot,
                                    step === item && styles.activeStepDot,
                                    stepIndex(step) > index && styles.doneStepDot,
                                ]}
                            />
                        ))}
                    </View>

                    {step === 'email' && (
                        <>
                            <Text style={styles.cardTitle}>Enter your email</Text>
                            <Input
                                label="Staff Email"
                                value={email}
                                onChangeText={setEmail}
                                placeholder="name@affordaily.com"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoComplete="email"
                            />
                            <Button
                                title="Send Reset Code"
                                onPress={requestOtp}
                                loading={isLoading}
                            />
                        </>
                    )}

                    {step === 'otp' && (
                        <>
                            <Text style={styles.cardTitle}>Check your email</Text>
                            <Text style={styles.helperText}>
                                Enter the 6-digit code sent to {normalizedEmail}.
                            </Text>
                            <Input
                                label="Reset Code"
                                value={otp}
                                onChangeText={(value) => setOtp(value.replace(/\D/g, '').slice(0, 6))}
                                placeholder="000000"
                                keyboardType="number-pad"
                                maxLength={6}
                            />
                            <Button
                                title="Verify Code"
                                onPress={verifyCode}
                                loading={isLoading}
                                disabled={otp.length !== 6}
                            />
                            <Button
                                title="Resend Code"
                                onPress={requestOtp}
                                variant="ghost"
                                style={styles.secondaryAction}
                            />
                        </>
                    )}

                    {step === 'reset' && (
                        <>
                            <Text style={styles.cardTitle}>Create a new password</Text>
                            <Input
                                label="New Password"
                                value={password}
                                onChangeText={setPassword}
                                placeholder="At least 8 characters"
                                secureTextEntry={!showPassword}
                                autoComplete="new-password"
                                rightIcon={
                                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                        <Ionicons
                                            name={showPassword ? 'eye-off' : 'eye'}
                                            size={20}
                                            color={theme.colors.gray[500]}
                                        />
                                    </TouchableOpacity>
                                }
                            />
                            <Input
                                label="Confirm Password"
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                placeholder="Repeat new password"
                                secureTextEntry={!showPassword}
                                autoComplete="new-password"
                            />
                            <Button
                                title="Update Password"
                                onPress={submitPassword}
                                loading={isLoading}
                                disabled={!password || !confirmPassword}
                            />
                        </>
                    )}
                </Card>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const stepIndex = (step: Step) => {
    if (step === 'email') return 0;
    if (step === 'otp') return 1;
    return 2;
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F4FAF1',
    },
    content: {
        flexGrow: 1,
        padding: theme.spacing.lg,
        justifyContent: 'center',
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing.lg,
    },
    backText: {
        color: '#527B2E',
        fontSize: theme.typography.fontSize.sm,
        fontWeight: theme.typography.fontWeight.medium,
    },
    hero: {
        alignItems: 'center',
        marginBottom: theme.spacing.xl,
    },
    iconShell: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: '#D0F253',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 6,
        borderColor: '#EEF7EA',
        marginBottom: theme.spacing.md,
    },
    kicker: {
        fontSize: theme.typography.fontSize.xs,
        color: '#6B8E36',
        fontWeight: theme.typography.fontWeight.bold,
        letterSpacing: 1.5,
        marginBottom: theme.spacing.sm,
    },
    title: {
        fontSize: theme.typography.fontSize.xxl,
        color: '#143B1D',
        fontWeight: theme.typography.fontWeight.bold,
        textAlign: 'center',
        marginBottom: theme.spacing.sm,
    },
    subtitle: {
        fontSize: theme.typography.fontSize.md,
        color: '#55735C',
        textAlign: 'center',
        lineHeight: 22,
    },
    steps: {
        flexDirection: 'row',
        gap: theme.spacing.sm,
        marginBottom: theme.spacing.lg,
    },
    stepDot: {
        flex: 1,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#DDEBD5',
    },
    activeStepDot: {
        backgroundColor: '#D0F253',
    },
    doneStepDot: {
        backgroundColor: '#7EA64A',
    },
    cardTitle: {
        fontSize: theme.typography.fontSize.lg,
        color: '#143B1D',
        fontWeight: theme.typography.fontWeight.bold,
        marginBottom: theme.spacing.md,
    },
    helperText: {
        fontSize: theme.typography.fontSize.sm,
        color: '#55735C',
        lineHeight: 20,
        marginBottom: theme.spacing.md,
    },
    secondaryAction: {
        marginTop: theme.spacing.sm,
    },
});
