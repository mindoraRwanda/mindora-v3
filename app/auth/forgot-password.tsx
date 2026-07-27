import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useLocale } from '@/context/LocaleContext';
import { ApiError, forgotPassword } from '@/services/api';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Elevation, Radius, Spacing, Typography } from '@/constants/theme';

export default function ForgotPasswordScreen() {
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const { t } = useLocale();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    if (!email.trim()) return;
    setLoading(true);
    try {
      await forgotPassword(email.trim());
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setSent(true);
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      const message = error instanceof ApiError ? error.message : t('auth.forgotPassword.errorGeneric');
      Alert.alert(t('common.error'), message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 40 }]}>
          <View style={styles.header}>
            <View style={[styles.iconCircle, { backgroundColor: colors.tintSoft }]}>
              <IconSymbol name="lock.fill" size={28} color={colors.tint} />
            </View>
            <ThemedText style={styles.title}>{t('auth.forgotPassword.title')}</ThemedText>
            <ThemedText style={[styles.subtitle, { color: colors.textMuted }]}>
              {sent ? t('auth.forgotPassword.subtitleSent') : t('auth.forgotPassword.subtitleIdle')}
            </ThemedText>
          </View>

          {!sent && (
            <View style={styles.form}>
              <View style={[styles.inputWrapper, { backgroundColor: colors.tintSoft, borderColor: colors.border }]}>
                <IconSymbol name="envelope.fill" size={18} color={colors.textMuted} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder={t('auth.forgotPassword.emailPlaceholder')}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  placeholderTextColor={colors.textMuted}
                />
              </View>
              <Button title={t('auth.forgotPassword.submit')} onPress={handleSubmit} loading={loading} disabled={!email.trim()} />
            </View>
          )}

          {sent && <Button title={t('auth.forgotPassword.backToSignIn')} variant="secondary" onPress={() => router.replace('/auth/login')} />}
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: Spacing.xxl, justifyContent: 'center', minHeight: '100%' },
  header: { marginBottom: Spacing.xxxl, alignItems: 'center' },
  iconCircle: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.xl, ...Elevation.sm },
  title: { ...Typography.h1, fontSize: 25, textAlign: 'center' },
  subtitle: { fontSize: 14, marginTop: Spacing.sm, textAlign: 'center', lineHeight: 20, paddingHorizontal: Spacing.sm },
  form: { gap: Spacing.lg },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', borderRadius: Radius.lg, paddingHorizontal: Spacing.lg, height: 56, borderWidth: 1 },
  input: { flex: 1, marginLeft: Spacing.md, fontSize: 16 },
});
