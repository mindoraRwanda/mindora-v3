import { useRouter } from 'expo-router';
import { Alert, Linking, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Card } from '@/components/ui/card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/context/AuthContext';
import { useLocale } from '@/context/LocaleContext';
import { LOCALES, LOCALE_LABELS, Locale } from '@/constants/i18n';
import { updateMyProfile } from '@/services/api';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function AboutScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const { user, profile, token, signOut } = useAuth();
  const { t, locale, setLocale } = useLocale();

  const displayName = profile?.userName || user?.email.split('@')[0] || 'User';

  const handleSelectLocale = (next: Locale) => {
    if (next === locale) return;
    Haptics.selectionAsync();
    setLocale(next);
    // Keep the backend profile's language in sync — best-effort, fine if it fails
    // (e.g. profile doesn't exist yet for a brand-new account).
    if (token) updateMyProfile(token, { languagePreference: next }).catch(() => {});
  };

  const handleSignOut = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(t('about.signOutConfirmTitle'), t('about.signOutConfirmMsg'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.signOut'),
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/');
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(t('about.deleteConfirmTitle'), t('about.deleteConfirmMsg'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('about.emailSupport'),
        onPress: () => Linking.openURL('mailto:support@mindora.app?subject=Account%20Deletion%20Request'),
      },
    ]);
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 40 }]} showsVerticalScrollIndicator={false}>
        {/* Logo / Brand */}
        <View style={styles.brandSection}>
          <View style={[styles.logoCircle, { backgroundColor: colors.tintSolid, shadowColor: colors.tintSolid }]}>
            <IconSymbol name="house.fill" size={32} color="#fff" />
          </View>
          <ThemedText style={styles.appName}>{t('about.appName')}</ThemedText>
          <ThemedText style={[styles.tagline, { color: colors.textMuted }]}>{t('about.tagline')}</ThemedText>
          <View style={[styles.versionBadge, { backgroundColor: colors.tintSoft }]}>
            <ThemedText style={[styles.version, { color: colors.tint }]}>{t('about.version')}</ThemedText>
          </View>
        </View>

        {/* User Info Section */}
        {user && (
          <View style={styles.section}>
            <ThemedText style={[styles.sectionLabel, { color: colors.textMuted }]}>{t('about.accountSettings')}</ThemedText>
            <Card style={styles.accountCard}>
              <View style={[styles.avatar, { backgroundColor: colors.tintSoft }]}>
                <ThemedText style={{ color: colors.tint, fontWeight: '700', fontSize: 18 }}>{displayName.charAt(0).toUpperCase()}</ThemedText>
              </View>
              <View style={styles.accountInfo}>
                <ThemedText type="defaultSemiBold" style={styles.userName}>{displayName}</ThemedText>
                <ThemedText style={[styles.userEmail, { color: colors.textMuted }]}>{user.email}</ThemedText>
              </View>
              <TouchableOpacity activeOpacity={0.7} style={[styles.signOutButton, { backgroundColor: colors.tintSoft }]} onPress={handleSignOut}>
                <IconSymbol name="rectangle.portrait.and.arrow.right" size={16} color={colors.tint} />
              </TouchableOpacity>
            </Card>
          </View>
        )}

        {/* Language Section */}
        <View style={styles.section}>
          <ThemedText style={[styles.sectionLabel, { color: colors.textMuted }]}>{t('about.language')}</ThemedText>
          <Card style={styles.languageCard}>
            {LOCALES.map((code, idx) => (
              <View key={code}>
                <TouchableOpacity activeOpacity={0.7} style={styles.linkRow} onPress={() => handleSelectLocale(code)}>
                  <ThemedText style={styles.linkLabel}>{LOCALE_LABELS[code]}</ThemedText>
                  {locale === code ? (
                    <IconSymbol name="checkmark" size={18} color={colors.tint} />
                  ) : (
                    <View style={{ width: 18 }} />
                  )}
                </TouchableOpacity>
                {idx < LOCALES.length - 1 && <View style={[styles.divider, { backgroundColor: colors.border }]} />}
              </View>
            ))}
          </Card>
        </View>

        {/* Links Section */}
        <View style={styles.section}>
          <ThemedText style={[styles.sectionLabel, { color: colors.textMuted }]}>{t('about.supportLegal')}</ThemedText>
          <Card style={styles.linksContainer}>
            <TouchableOpacity activeOpacity={0.7}
              style={styles.linkRow}
              onPress={() => { Haptics.selectionAsync(); router.push('/privacy-policy'); }}>
              <View style={styles.linkIconTitle}>
                <View style={[styles.miniIcon, { backgroundColor: colors.tintSoft }]}>
                  <IconSymbol name="lock.fill" size={14} color={colors.tint} />
                </View>
                <ThemedText style={styles.linkLabel}>{t('about.privacyPolicy')}</ThemedText>
              </View>
              <IconSymbol name="chevron.right" size={12} color={colors.textMuted} />
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <TouchableOpacity activeOpacity={0.7}
              style={styles.linkRow}
              onPress={() => { Haptics.selectionAsync(); Linking.openURL('mailto:support@mindora.app'); }}>
              <View style={styles.linkIconTitle}>
                <View style={[styles.miniIcon, { backgroundColor: colors.tintSoft }]}>
                  <IconSymbol name="envelope.fill" size={14} color={colors.tint} />
                </View>
                <ThemedText style={styles.linkLabel}>{t('about.contactSupport')}</ThemedText>
              </View>
              <IconSymbol name="chevron.right" size={12} color={colors.textMuted} />
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <TouchableOpacity activeOpacity={0.7}
              style={styles.linkRow}
              onPress={() => { Haptics.selectionAsync(); router.push('/resources'); }}>
              <View style={styles.linkIconTitle}>
                <View style={[styles.miniIcon, { backgroundColor: colors.tintSoft }]}>
                  <IconSymbol name="doc.text.fill" size={14} color={colors.tint} />
                </View>
                <ThemedText style={styles.linkLabel}>{t('about.knowledgeCenter')}</ThemedText>
              </View>
              <IconSymbol name="chevron.right" size={12} color={colors.textMuted} />
            </TouchableOpacity>
          </Card>
        </View>

        {/* Danger Zone */}
        {user && (
          <View style={styles.section}>
            <ThemedText style={[styles.sectionLabel, { color: colors.danger }]}>{t('about.dangerZone')}</ThemedText>
            <TouchableOpacity activeOpacity={0.7} style={[styles.deleteButton, { backgroundColor: colors.dangerSoft, borderColor: colors.danger + '30' }]} onPress={handleDeleteAccount}>
              <IconSymbol name="trash.fill" size={14} color={colors.danger} style={{ marginRight: Spacing.sm }} />
              <ThemedText style={[styles.deleteButtonText, { color: colors.danger }]}>{t('about.deleteAccount')}</ThemedText>
            </TouchableOpacity>
            <ThemedText style={[styles.dangerNote, { color: colors.textMuted }]}>{t('about.deleteNote')}</ThemedText>
          </View>
        )}

        <View style={styles.footer}>
          <ThemedText style={[styles.copyright, { color: colors.textMuted }]}>{t('about.footerLine1')}</ThemedText>
          <ThemedText style={[styles.copyright, { color: colors.textMuted }]}>{t('about.footerLine2', { year: new Date().getFullYear() })}</ThemedText>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: Spacing.xxl },
  brandSection: { alignItems: 'center', marginBottom: Spacing.xxxl + Spacing.sm },
  logoCircle: { width: 72, height: 72, borderRadius: Radius.xxl, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.lg, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 4 },
  appName: { ...Typography.h1 },
  tagline: { fontSize: 14, marginTop: Spacing.xs },
  versionBadge: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: Radius.sm, marginTop: Spacing.md },
  version: { fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  section: { marginBottom: Spacing.xxxl },
  sectionLabel: { fontSize: 13, textTransform: 'uppercase', letterSpacing: 1, marginBottom: Spacing.md, marginLeft: Spacing.xs },
  accountCard: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  accountInfo: { flex: 1, marginLeft: Spacing.lg },
  userName: { fontSize: 16 },
  userEmail: { fontSize: 13 },
  signOutButton: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  languageCard: { padding: 0, overflow: 'hidden' },
  linksContainer: { padding: 0, overflow: 'hidden' },
  linkRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.lg },
  linkIconTitle: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  miniIcon: { width: 32, height: 32, borderRadius: Radius.sm, alignItems: 'center', justifyContent: 'center' },
  linkLabel: { fontSize: 15 },
  divider: { height: 1, marginHorizontal: Spacing.lg },
  deleteButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: Spacing.lg, borderRadius: Radius.md, borderWidth: 1 },
  deleteButtonText: { fontWeight: '700', fontSize: 15 },
  dangerNote: { fontSize: 12, marginTop: Spacing.sm, textAlign: 'center' },
  footer: { alignItems: 'center', marginTop: Spacing.xl },
  copyright: { fontSize: 11, marginBottom: Spacing.xs },
});
