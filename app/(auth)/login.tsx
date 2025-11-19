import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useThemeColorScheme } from '@/hooks/use-theme-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { Link, router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
    const colorScheme = useThemeColorScheme();
    const colors = Colors[colorScheme ?? 'light'];
    const { login } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            await login(email, password);
            router.replace('/(tabs)');
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to login');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.header}>
                    <View style={[styles.logo, { backgroundColor: colors.primary }]}>
                        <Ionicons name="heart" size={40} color="#FFFFFF" />
                    </View>
                    <Text style={[styles.title, { color: colors.text }]}>Welcome to Mindora</Text>
                    <Text style={[styles.subtitle, { color: colors.icon }]}>
                        Your mental health companion
                    </Text>
                </View>

                <View style={styles.form}>
                    <Input
                        label="Email"
                        value={email}
                        onChangeText={setEmail}
                        placeholder="Enter your email"
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />

                    <Input
                        label="Password"
                        value={password}
                        onChangeText={setPassword}
                        placeholder="Enter your password"
                        secureTextEntry
                    />

                    <Button
                        title={loading ? "Signing in..." : "Sign In"}
                        onPress={handleLogin}
                        disabled={loading}
                        style={styles.loginButton}
                    />

                    <View style={styles.divider}>
                        <View style={[styles.line, { backgroundColor: colors.border }]} />
                        <Text style={[styles.dividerText, { color: colors.icon }]}>or</Text>
                        <View style={[styles.line, { backgroundColor: colors.border }]} />
                    </View>

                    <Button
                        title="Continue with Google"
                        onPress={() => Alert.alert('Demo', 'Google login would be implemented here')}
                        variant="outline"
                        style={styles.socialButton}
                    />

                    {/* Demo Account Info */}
                    <View style={[styles.demoCard, { backgroundColor: colors.primary + '10', borderColor: colors.primary + '30' }]}>
                        <View style={styles.demoHeader}>
                            <Ionicons name="information-circle" size={20} color={colors.primary} />
                            <Text style={[styles.demoTitle, { color: colors.primary }]}>Try Demo Account</Text>
                        </View>
                        <Text style={[styles.demoText, { color: colors.text }]}>
                            Email: demo@mindora.com{'\n'}
                            Password: demo123
                        </Text>
                        <Button
                            title="Login with Demo Account"
                            onPress={() => {
                                setEmail('demo@mindora.com');
                                setPassword('demo123');
                            }}
                            variant="outline"
                            style={styles.demoButton}
                        />
                    </View>
                </View>

                <View style={styles.footer}>
                    <Text style={[styles.footerText, { color: colors.icon }]}>
                        Don't have an account?{' '}
                        <Link href="/(auth)/signup" style={[styles.link, { color: colors.primary }]}>
                            Sign up
                        </Link>
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flexGrow: 1,
        padding: 24,
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 48,
    },
    logo: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
    },
    form: {
        marginBottom: 32,
    },
    loginButton: {
        marginTop: 8,
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 24,
    },
    line: {
        flex: 1,
        height: 1,
    },
    dividerText: {
        marginHorizontal: 16,
        fontSize: 14,
    },
    socialButton: {
        marginBottom: 16,
    },
    footer: {
        alignItems: 'center',
    },
    footerText: {
        fontSize: 14,
    },
    link: {
        fontWeight: '600',
    },
    demoCard: {
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        marginTop: 16,
    },
    demoHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    demoTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 6,
    },
    demoText: {
        fontSize: 13,
        marginBottom: 12,
        fontFamily: 'monospace',
    },
    demoButton: {
        marginTop: 4,
    },
});