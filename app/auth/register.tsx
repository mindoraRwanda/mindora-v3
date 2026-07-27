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
import { ApiError, login, register, updateMyProfile } from '@/services/api';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Elevation, Radius, Spacing, Typography } from '@/constants/theme';

export default function RegisterScreen() {
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const { t, locale } = useLocale();
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { signIn } = useAuth();

  const canSubmit = userName.trim().length > 0 && email.trim().length > 0 && password.length >= 8;

  const handleRegister = async () => {
    if (!canSubmit) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(t('auth.register.missingInfoTitle'), t('auth.register.missingInfoMsg'));
      return;
    }

    setLoading(true);
    try {
      await register({ email: email.trim(), password, userName: userName.trim() });
      // Registration only creates the account — sign the user straight in for a smooth flow.
      const { accessToken } = await login({ email: email.trim(), password });
      await signIn(accessToken);
      // Keep the backend profile's language in sync with the app's current locale
      // (best-effort — a brand-new profile may not exist yet, that's fine either way).
      updateMyProfile(accessToken, { languagePreference: locale, timezone: 'Africa/Kigali' }).catch(() => {});
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/(tabs)');
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      const message = error instanceof ApiError ? error.message : t('auth.register.failedGeneric');
      Alert.alert(t('auth.register.failedTitle'), message);
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
            <ThemedText style={styles.title}>{t('auth.register.title')}</ThemedText>
            <ThemedText style={[styles.subtitle, { color: colors.textMuted }]}>{t('auth.register.subtitle')}</ThemedText>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <ThemedText type="defaultSemiBold" style={styles.inputLabel}>{t('auth.register.nameLabel')}</ThemedText>
              <View style={[styles.inputWrapper, { backgroundColor: colors.tintSoft, borderColor: colors.border }]}>
                <IconSymbol name="person.fill" size={18} color={colors.textMuted} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder={t('auth.register.namePlaceholder')}
                  value={userName}
                  onChangeText={setUserName}
                  autoComplete="name"
                  placeholderTextColor={colors.textMuted}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <ThemedText type="defaultSemiBold" style={styles.inputLabel}>{t('auth.register.emailLabel')}</ThemedText>
              <View style={[styles.inputWrapper, { backgroundColor: colors.tintSoft, borderColor: colors.border }]}>
                <IconSymbol name="envelope.fill" size={18} color={colors.textMuted} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder={t('auth.register.emailPlaceholder')}
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
              <ThemedText type="defaultSemiBold" style={styles.inputLabel}>{t('auth.register.passwordLabel')}</ThemedText>
              <View style={[styles.inputWrapper, { backgroundColor: colors.tintSoft, borderColor: colors.border }]}>
                <IconSymbol name="lock.fill" size={18} color={colors.textMuted} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder={t('auth.register.passwordPlaceholder')}
                  value={password}
                  onChangeText={setPassword}
                  autoComplete="password-new"
                  secureTextEntry
                  placeholderTextColor={colors.textMuted}
                />
              </View>
            </View>

            <Button title={t('auth.register.submit')} onPress={handleRegister} loading={loading} disabled={!canSubmit} style={{ marginTop: Spacing.xs }} />

            <View style={styles.footer}>
              <ThemedText style={{ fontSize: 14, color: colors.textMuted }}>{t('auth.register.haveAccount')}</ThemedText>
              <Link href="/auth/login" asChild>
                <TouchableOpacity activeOpacity={0.7} onPress={() => Haptics.selectionAsync()}>
                  <ThemedText type="link" style={styles.linkText}>{t('auth.register.signInLink')}</ThemedText>
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
  header: { marginBottom: Spacing.xxxl, alignItems: 'center' },
  logoCircle: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.xl, ...Elevation.md },
  title: { ...Typography.display, textAlign: 'center' },
  subtitle: { ...Typography.bodyLg, fontSize: 15, marginTop: Spacing.sm, textAlign: 'center' },
  form: { gap: Spacing.lg },
  inputContainer: { gap: Spacing.sm },
  inputLabel: { fontSize: 14, marginLeft: Spacing.xs },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', borderRadius: Radius.lg, paddingHorizontal: Spacing.lg, height: 56, borderWidth: 1 },
  input: { flex: 1, marginLeft: Spacing.md, fontSize: 16 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: Spacing.xxl },
  linkText: { fontSize: 14, fontWeight: '700' },
});
