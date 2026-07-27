import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import 'react-native-reanimated';

import { AuthProvider, useAuth } from '@/context/AuthContext';
import { LocaleProvider, useLocale } from '@/context/LocaleContext';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootLayoutNav() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { isLoading: authLoading } = useAuth();
  const { isLoading: localeLoading, t } = useLocale();

  // Show a loading screen while auth/locale state is being restored from storage.
  // This prevents a flash of the unauthenticated/wrong-language state on startup.
  if (authLoading || localeLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <View style={{ width: 80, height: 80, borderRadius: 24, backgroundColor: colors.tintSolid, alignItems: 'center', justifyContent: 'center', shadowColor: colors.tintSolid, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 }}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" options={{ title: t('stackTitles.notFound') }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: t('stackTitles.about') }} />
        <Stack.Screen name="privacy-policy" options={{ title: t('stackTitles.privacyPolicy') }} />
        <Stack.Screen name="resources" options={{ title: t('stackTitles.resources') }} />
        <Stack.Screen name="auth/login" options={{ title: t('stackTitles.signIn'), headerBackTitle: t('common.back') }} />
        <Stack.Screen name="auth/register" options={{ title: t('stackTitles.createAccount'), headerBackTitle: t('common.back') }} />
        <Stack.Screen name="auth/forgot-password" options={{ title: t('stackTitles.resetPassword'), headerBackTitle: t('common.back') }} />
        <Stack.Screen name="ai-chat" options={{ title: t('stackTitles.aiAssistant'), presentation: 'modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <LocaleProvider>
      <AuthProvider>
        <RootLayoutNav />
      </AuthProvider>
    </LocaleProvider>
  );
}
