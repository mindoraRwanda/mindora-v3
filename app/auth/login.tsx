import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/context/AuthContext';
import { useLocale } from '@/context/LocaleContext';
import { ApiError, login } from '@/services/api';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Elevation, Radius, Spacing, Typography } from '@/constants/theme';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const { t } = useLocale();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { signIn } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(t('auth.login.missingInfoTitle'), t('auth.login.missingInfoMsg'));
      return;
    }

    setLoading(true);
    try {
      const { accessToken } = await login({ email: email.trim(), password });
      await signIn(accessToken);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/(tabs)');
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      const message = error instanceof ApiError ? error.message : t('auth.login.failedGeneric');
      Alert.alert(t('auth.login.failedTitle'), message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 40 }]}>
          <View style={styles.header}>
            <View style={[styles.logoCircle, { backgroundColor: colors.tintSolid, shadowColor: colors.tintSolid }]}>
              <IconSymbol name="house.fill" size={32} color="#fff" />
            </View>
            <ThemedText style={styles.title}>{t('auth.login.title')}</ThemedText>
            <ThemedText style={[styles.subtitle, { color: colors.textMuted }]}>{t('auth.login.subtitle')}</ThemedText>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <ThemedText type="defaultSemiBold" style={styles.inputLabel}>{t('auth.login.emailLabel')}</ThemedText>
              <View style={[styles.inputWrapper, { backgroundColor: colors.tintSoft, borderColor: colors.border }]}>
                <IconSymbol name="envelope.fill" size={18} color={colors.textMuted} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder={t('auth.login.emailPlaceholder')}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  autoComplete="email"
                  keyboardType="email-address"
                  placeholderTextColor={colors.textMuted}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <ThemedText type="defaultSemiBold" style={styles.inputLabel}>{t('auth.login.passwordLabel')}</ThemedText>
              <View style={[styles.inputWrapper, { backgroundColor: colors.tintSoft, borderColor: colors.border }]}>
                <IconSymbol name="lock.fill" size={18} color={colors.textMuted} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder={t('auth.login.passwordPlaceholder')}
                  value={password}
                  onChangeText={setPassword}
                  autoComplete="password"
                  secureTextEntry
                  placeholderTextColor={colors.textMuted}
                />
              </View>
            </View>

            <Link href="/auth/forgot-password" asChild>
              <TouchableOpacity activeOpacity={0.7} style={styles.forgotBtn}>
                <ThemedText style={{ fontSize: 13, color: colors.tint, fontWeight: '600' }}>{t('auth.login.forgotPassword')}</ThemedText>
              </TouchableOpacity>
            </Link>

            <Button title={t('auth.login.submit')} onPress={handleLogin} loading={loading} disabled={!email || !password} style={{ marginTop: Spacing.xs }} />

            <View style={styles.footer}>
              <ThemedText style={{ fontSize: 14, color: colors.textMuted }}>{t('auth.login.noAccount')}</ThemedText>
              <Link href="/auth/register" asChild>
                <TouchableOpacity activeOpacity={0.7} onPress={() => Haptics.selectionAsync()}>
                  <ThemedText type="link" style={styles.linkText}>{t('auth.login.signUpLink')}</ThemedText>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: Spacing.xxl, justifyContent: 'center', minHeight: '100%' },
  header: { marginBottom: Spacing.xxxl + Spacing.sm, alignItems: 'center' },
  logoCircle: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.xl, ...Elevation.md },
  title: { ...Typography.display, textAlign: 'center' },
  subtitle: { ...Typography.bodyLg, fontSize: 15, marginTop: Spacing.sm, textAlign: 'center' },
  form: { gap: Spacing.xl },
  inputContainer: { gap: Spacing.sm },
  inputLabel: { fontSize: 14, marginLeft: Spacing.xs },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', borderRadius: Radius.lg, paddingHorizontal: Spacing.lg, height: 56, borderWidth: 1 },
  input: { flex: 1, marginLeft: Spacing.md, fontSize: 16 },
  forgotBtn: { alignSelf: 'flex-end' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: Spacing.xxl },
  linkText: { fontSize: 14, fontWeight: '700' },
});
