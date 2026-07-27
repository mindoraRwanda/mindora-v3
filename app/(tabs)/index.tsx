import { Link, useRouter } from 'expo-router';
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Card } from '@/components/ui/card';
import { IconSymbol, type IconSymbolName } from '@/components/ui/icon-symbol';
import { useAuth } from '@/context/AuthContext';
import { useLocale } from '@/context/LocaleContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Elevation, Radius, Spacing, Typography } from '@/constants/theme';

// No backend endpoint serves crisis contacts — a safety feature like this should
// work offline and instantly, so it ships as a small static list instead.
// Rwanda's general emergency lines (Police / Ambulance) — a dedicated mental-health
// crisis line should be added here once the team has a verified number to publish.
const HOTLINES = [
  { phone: '112', nameKey: 'home.hotlinePoliceName', descKey: 'home.hotlinePoliceDesc' } as const,
  { phone: '912', nameKey: 'home.hotlineAmbulanceName', descKey: 'home.hotlineAmbulanceDesc' } as const,
];

const QUICK_ACTIONS: { labelKey: string; icon: IconSymbolName; route: '/appointments' | '/messages' | '/games' | '/resources'; color: string }[] = [
  { labelKey: 'home.actionBooking', icon: 'calendar', route: '/appointments', color: '#6D28D9' },
  { labelKey: 'home.actionMessages', icon: 'message.fill', route: '/messages', color: '#2563EB' },
  { labelKey: 'home.actionExercises', icon: 'gamecontroller', route: '/games', color: '#B45309' },
  { labelKey: 'home.actionResources', icon: 'book.fill', route: '/resources', color: '#0F9D6A' },
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const { user, profile } = useAuth();
  const { t } = useLocale();
  const router = useRouter();

  const displayName = (profile?.userName || user?.email.split('@')[0] || t('home.guest')).trim();

  const handleCall = (phone: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Linking.openURL(`tel:${phone}`).catch(() => Alert.alert(t('common.error'), t('home.callError')));
  };

  const handleNavigate = (route: string) => {
    Haptics.selectionAsync();
    router.push(route as any);
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top || 60, paddingBottom: insets.bottom + 40 }}
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <ThemedText style={[styles.greeting, { color: colors.textMuted }]}>{t('home.greeting')}</ThemedText>
            <ThemedText type="title" style={styles.userName}>
              {displayName} 👋
            </ThemedText>
          </View>
          <TouchableOpacity activeOpacity={0.7}
            onPress={() => handleNavigate('/modal')}
            style={[styles.profileBtn, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
            <View style={[styles.avatarMini, { backgroundColor: colors.tintSoft }]}>
              <ThemedText style={{ color: colors.tint, fontWeight: '700' }}>{displayName.charAt(0).toUpperCase()}</ThemedText>
            </View>
          </TouchableOpacity>
        </View>

        {/* Hero Card */}
        <View style={[styles.heroCard, { backgroundColor: colors.tintSolid, shadowColor: colors.tintSolid }]}>
          <View style={styles.heroContent}>
            <ThemedText style={styles.heroTitle}>{t('home.heroTitle')}</ThemedText>
            <ThemedText style={styles.heroSubtitle}>{t('home.heroSubtitle')}</ThemedText>
            <TouchableOpacity activeOpacity={0.7} style={styles.heroBtn} onPress={() => handleNavigate('/reports')}>
              <ThemedText style={styles.heroBtnText}>{t('home.startCheckIn')}</ThemedText>
            </TouchableOpacity>
          </View>
          <View style={styles.heroGraphic}>
            <IconSymbol name="house.fill" size={84} color="rgba(255,255,255,0.16)" />
          </View>
        </View>

        {/* Quick Actions Grid */}
        <View style={styles.section}>
          <ThemedText style={[styles.sectionLabel, { color: colors.text }]}>{t('home.quickActions')}</ThemedText>
          <View style={styles.grid}>
            {QUICK_ACTIONS.map((item) => (
              <TouchableOpacity activeOpacity={0.7}
                key={item.labelKey}
                style={[styles.gridItem, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}
                onPress={() => handleNavigate(item.route)}>
                <View style={[styles.iconBox, { backgroundColor: item.color + '16' }]}>
                  <IconSymbol name={item.icon} size={22} color={item.color} />
                </View>
                <ThemedText style={styles.gridLabel}>{t(item.labelKey as any)}</ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* AI Assistant */}
        <View style={styles.section}>
          <TouchableOpacity activeOpacity={0.7}
            style={[styles.aiCard, { backgroundColor: colors.surface, borderColor: colors.border, shadowColor: colors.shadow }]}
            onPress={() => handleNavigate('/ai-chat')}>
            <View style={[styles.iconBox, { backgroundColor: colors.successSoft }]}>
              <IconSymbol name="sparkles" size={22} color={colors.success} />
            </View>
            <View style={styles.aiInfo}>
              <ThemedText style={styles.featureTitle}>{t('home.aiCardTitle')}</ThemedText>
              <ThemedText style={[styles.featureDesc, { color: colors.textMuted }]}>{t('home.aiCardDesc')}</ThemedText>
            </View>
            <IconSymbol name="chevron.right" size={20} color={colors.tint} />
          </TouchableOpacity>
        </View>

        {/* Emergency Section */}
        <View style={[styles.emergencyBox, { backgroundColor: colors.dangerSoft }]}>
          <View style={styles.emergencyHeader}>
            <IconSymbol name="phone.fill" size={17} color={colors.danger} />
            <ThemedText style={[styles.emergencyTitle, { color: colors.danger }]}>{t('home.emergencyTitle')}</ThemedText>
          </View>
          {HOTLINES.map((contact) => (
            <TouchableOpacity activeOpacity={0.7}
              key={contact.phone}
              style={[styles.callRow, { backgroundColor: colors.surface }]}
              onPress={() => handleCall(contact.phone)}>
              <View style={{ flex: 1 }}>
                <ThemedText style={styles.callName}>{t(contact.nameKey as any)}</ThemedText>
                <ThemedText style={[styles.callDesc, { color: colors.textMuted }]}>{t(contact.descKey as any)}</ThemedText>
              </View>
              <View style={[styles.callBtn, { backgroundColor: colors.danger }]}>
                <ThemedText style={styles.callBtnText}>{contact.phone}</ThemedText>
              </View>
            </TouchableOpacity>
          ))}
          <ThemedText style={[styles.emptyText, { color: colors.textMuted }]}>{t('home.emergencyNote')}</ThemedText>
        </View>

        {!user && (
          <Card style={[styles.authPromo, { backgroundColor: colors.tintSoft, borderWidth: 0 }]}>
            <ThemedText style={[styles.promoText, { color: colors.text }]}>{t('home.authPromo')}</ThemedText>
            <Link href="/auth/login" asChild>
              {/* `Link asChild`'s web Slot merges style via object-spread, which breaks on an
                  array style (produces numeric keys and crashes CSSStyleDeclaration) — keep
                  this flattened to a single object. */}
              <TouchableOpacity activeOpacity={0.7} style={StyleSheet.flatten([styles.signInBtn, { backgroundColor: colors.tintSolid }])}>
                <ThemedText style={styles.signInTxt}>{t('common.signIn')}</ThemedText>
              </TouchableOpacity>
            </Link>
          </Card>
        )}

        <View style={styles.footer}>
          <ThemedText style={[styles.footerText, { color: colors.textMuted }]}>{t('home.footer')}</ThemedText>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.xl, marginBottom: Spacing.xxl },
  greeting: { ...Typography.body, fontWeight: '500' },
  userName: { ...Typography.h1 },
  profileBtn: { width: 46, height: 46, borderRadius: 23, padding: 2, ...Elevation.sm },
  avatarMini: { flex: 1, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  heroCard: { marginHorizontal: Spacing.xl, borderRadius: Radius.xxl, padding: Spacing.xxl, flexDirection: 'row', overflow: 'hidden', marginBottom: Spacing.xxl, ...Elevation.md },
  heroContent: { flex: 1, zIndex: 1 },
  heroTitle: { color: '#fff', ...Typography.h1, fontSize: 21, marginBottom: Spacing.xs },
  heroSubtitle: { color: 'rgba(255,255,255,0.78)', ...Typography.bodySm, marginBottom: Spacing.xl, lineHeight: 18 },
  heroBtn: { backgroundColor: 'rgba(255,255,255,0.18)', alignSelf: 'flex-start', paddingHorizontal: Spacing.lg, paddingVertical: 10, borderRadius: Radius.md },
  heroBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  heroGraphic: { position: 'absolute', right: -18, bottom: -18, opacity: 0.2 },
  section: { paddingHorizontal: Spacing.xl, marginBottom: Spacing.xxl },
  sectionLabel: { ...Typography.h3, marginBottom: Spacing.lg },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
  gridItem: { width: '48%', borderRadius: Radius.xl, padding: Spacing.xl, alignItems: 'center', ...Elevation.sm },
  iconBox: { width: 46, height: 46, borderRadius: Radius.lg, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md },
  gridLabel: { ...Typography.caption, textAlign: 'center', fontSize: 12 },
  aiCard: { borderRadius: Radius.xl, padding: Spacing.lg, flexDirection: 'row', alignItems: 'center', gap: Spacing.md, borderWidth: 1, ...Elevation.sm },
  aiInfo: { flex: 1 },
  featureTitle: { ...Typography.h3, marginBottom: Spacing.xs },
  featureDesc: { ...Typography.caption, fontSize: 12, lineHeight: 17 },
  emergencyBox: { marginHorizontal: Spacing.xl, borderRadius: Radius.xl, padding: Spacing.lg, marginBottom: Spacing.xxl, gap: Spacing.sm },
  emergencyHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.xs },
  emergencyTitle: { fontWeight: '700', fontSize: 13, letterSpacing: 0.2 },
  callRow: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, borderRadius: Radius.lg },
  callName: { fontSize: 14, fontWeight: '600' },
  callDesc: { fontSize: 12, marginTop: 2 },
  callBtn: { paddingHorizontal: 10, height: 30, borderRadius: Radius.sm, alignItems: 'center', justifyContent: 'center', marginLeft: Spacing.md },
  callBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  emptyText: { textAlign: 'center', fontSize: 11, marginTop: Spacing.xs, lineHeight: 16 },
  authPromo: { marginHorizontal: Spacing.xl, alignItems: 'center', gap: Spacing.lg, marginBottom: Spacing.xxl },
  promoText: { textAlign: 'center', fontSize: 13, lineHeight: 20 },
  signInBtn: { paddingHorizontal: Spacing.xxl, paddingVertical: Spacing.md, borderRadius: Radius.md },
  signInTxt: { color: '#fff', fontWeight: '700' },
  footer: { alignItems: 'center', marginBottom: Spacing.xl },
  footerText: { fontSize: 11 },
});
