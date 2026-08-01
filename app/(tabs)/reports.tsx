import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { useAuth } from '@/context/AuthContext';
import { useLocale } from '@/context/LocaleContext';
import {
  ApiError,
  MoodEntry,
  getMoodHistory,
  getMoodInsights,
  getMoodStreak,
  logMood,
} from '@/services/api';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Elevation, Radius, Spacing, Typography } from '@/constants/theme';

const MOODS = [
  { score: 1, icon: '😭', labelKey: 'reports.moodVerySad', color: '#EF4444' },
  { score: 3, icon: '😔', labelKey: 'reports.moodSad', color: '#F59E0B' },
  { score: 5, icon: '😐', labelKey: 'reports.moodNeutral', color: '#6B7280' },
  { score: 7, icon: '😊', labelKey: 'reports.moodHappy', color: '#10B981' },
  { score: 10, icon: '🤩', labelKey: 'reports.moodGreat', color: '#6D28D9' },
];

function closestMood(score: number) {
  return MOODS.reduce((best, m) => (Math.abs(m.score - score) < Math.abs(best.score - score) ? m : best), MOODS[2]);
}

const TREND_LABEL_KEYS: Record<string, string> = {
  improving: 'reports.trendImproving',
  declining: 'reports.trendDeclining',
  stable: 'reports.trendStable',
};

export default function ReportsScreen() {
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const { user, withAuth } = useAuth();
  const { t } = useLocale();

  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [streak, setStreak] = useState(0);
  const [trend, setTrend] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [logging, setLogging] = useState<number | null>(null);

  const loadData = useCallback(async () => {
    setSyncing(true);
    try {
      const [historyRes, streakRes, insightsRes] = await Promise.allSettled([
        withAuth((token) => getMoodHistory(token, { limit: 10 })),
        withAuth((token) => getMoodStreak(token)),
        withAuth((token) => getMoodInsights(token)),
      ]);
      if (historyRes.status === 'fulfilled') setEntries(historyRes.value.entries);
      else console.warn('Failed to load mood history', historyRes.reason);
      if (streakRes.status === 'fulfilled') setStreak(streakRes.value.streak);
      else console.warn('Failed to load mood streak', streakRes.reason);
      if (insightsRes.status === 'fulfilled') setTrend(insightsRes.value.trend);
      else console.warn('Failed to load mood insights', insightsRes.reason);
    } catch (err) {
      console.warn('Failed to load mood data', err);
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  }, [withAuth]);

  useEffect(() => {
    if (user) loadData();
    else setLoading(false);
  }, [user, loadData]);

  const handleLogMood = async (score: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLogging(score);
    try {
      await withAuth((token) => logMood(token, { moodScore: score }));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await loadData();
    } catch (err) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      const message =
        err instanceof ApiError && err.status === 429
          ? t('reports.checkInLimitMsg')
          : err instanceof ApiError
            ? err.message
            : t('reports.checkInErrorGeneric');
      Alert.alert(t('reports.checkInAlertTitle'), message);
    } finally {
      setLogging(null);
    }
  };

  if (!user) {
    return (
      <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.centered}>
          <EmptyState icon="chart.bar" title={t('reports.signInTitle')} message={t('reports.signInMsg')} />
        </View>
      </ThemedView>
    );
  }

  const trendKey = trend ? TREND_LABEL_KEYS[trend] : undefined;
  const trendText = trendKey ? t(trendKey as any) : trend;

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top || 60, paddingBottom: insets.bottom + 40 }}>
        <View style={styles.topHeader}>
          <View>
            <ThemedText type="title">{t('reports.title')}</ThemedText>
            <ThemedText style={[styles.subtitle, { color: colors.textMuted }]}>{t('reports.subtitle')}</ThemedText>
          </View>
          {syncing && <ActivityIndicator size="small" color={colors.tint} />}
        </View>

        <View style={styles.moodSection}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>{t('reports.dailyCheckIn')}</ThemedText>
          <Card style={styles.moodGrid}>
            {MOODS.map((m) => (
              <TouchableOpacity activeOpacity={0.7} key={m.score} style={styles.moodBtn} onPress={() => handleLogMood(m.score)} disabled={logging !== null}>
                <View style={[styles.moodCircle, { backgroundColor: m.color + '18' }]}>
                  {logging === m.score ? <ActivityIndicator size="small" color={m.color} /> : <ThemedText style={styles.moodEmoji}>{m.icon}</ThemedText>}
                </View>
                <ThemedText style={[styles.moodLabel, { color: colors.textMuted }]}>{t(m.labelKey as any)}</ThemedText>
              </TouchableOpacity>
            ))}
          </Card>
        </View>

        <View style={styles.statsRow}>
          <View style={[styles.statItem, { backgroundColor: colors.successSoft }]}>
            <ThemedText style={[styles.statVal, { color: colors.success }]}>{streak}</ThemedText>
            <ThemedText style={[styles.statLabel, { color: colors.textMuted }]}>{t('reports.dayStreak')}</ThemedText>
          </View>
          <View style={[styles.statItem, { backgroundColor: colors.tintSoft }]}>
            <ThemedText style={[styles.statVal, { color: colors.tint }]}>{entries.length}</ThemedText>
            <ThemedText style={[styles.statLabel, { color: colors.textMuted }]}>{t('reports.recentLogs')}</ThemedText>
          </View>
        </View>

        {trend && (
          <Card style={styles.assessmentCard}>
            <View style={styles.cardHeader}>
              <ThemedText type="defaultSemiBold">{t('reports.weeklyTrend')}</ThemedText>
              <View style={[styles.trendBadge, { backgroundColor: colors.tintSoft }]}>
                <ThemedText style={[styles.trendText, { color: colors.tint }]}>{trend.toUpperCase()}</ThemedText>
              </View>
            </View>
            <ThemedText style={[styles.description, { color: colors.textMuted }]}>{trendText}</ThemedText>
          </Card>
        )}

        <View style={styles.historySection}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>{t('reports.recentProgress')}</ThemedText>
          {loading ? (
            <ActivityIndicator color={colors.tint} style={{ marginTop: 20 }} />
          ) : entries.length === 0 ? (
            <EmptyState icon="chart.bar" title={t('reports.noCheckInsTitle')} message={t('reports.noCheckInsMsg')} />
          ) : (
            entries.map((entry) => {
              const mood = closestMood(entry.moodScore);
              return (
                <View key={entry.id} style={[styles.historyRow, { backgroundColor: colors.surface, borderColor: colors.border, shadowColor: colors.shadow }]}>
                  <ThemedText style={styles.historyEmoji}>{mood.icon}</ThemedText>
                  <View style={styles.historyInfo}>
                    <ThemedText type="defaultSemiBold" style={styles.historyLevel}>
                      {t('reports.moodScoreLabel', { score: entry.moodScore })}
                    </ThemedText>
                    <ThemedText style={[styles.historyDate, { color: colors.textMuted }]}>
                      {new Date(entry.createdAt).toLocaleDateString()} at{' '}
                      {new Date(entry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </ThemedText>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topHeader: { paddingHorizontal: Spacing.xl, marginBottom: Spacing.xxl, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  subtitle: { ...Typography.body, marginTop: Spacing.xs },
  moodSection: { paddingHorizontal: Spacing.xl, marginBottom: Spacing.xxl },
  sectionTitle: { ...Typography.h3, marginBottom: Spacing.lg },
  moodGrid: { flexDirection: 'row', justifyContent: 'space-between', padding: Spacing.xl },
  moodBtn: { alignItems: 'center', gap: Spacing.sm },
  moodCircle: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  moodEmoji: { fontSize: 24 },
  moodLabel: { ...Typography.overline, fontSize: 10 },
  statsRow: { flexDirection: 'row', gap: Spacing.lg, paddingHorizontal: Spacing.xl, marginBottom: Spacing.xxl },
  statItem: { flex: 1, padding: Spacing.xl, borderRadius: Radius.xl, alignItems: 'center', gap: Spacing.xs },
  statVal: { fontSize: 28, fontWeight: 'bold' },
  statLabel: { ...Typography.caption, fontSize: 12 },
  assessmentCard: { marginHorizontal: Spacing.xl, marginBottom: Spacing.xxl },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  trendBadge: { paddingHorizontal: Spacing.md, paddingVertical: 4, borderRadius: Radius.sm - 2 },
  trendText: { fontSize: 10, fontWeight: 'bold' },
  description: { ...Typography.body, lineHeight: 22 },
  historySection: { paddingHorizontal: Spacing.xl },
  historyRow: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, borderRadius: Radius.lg, marginBottom: Spacing.sm, borderWidth: 1, ...Elevation.sm },
  historyEmoji: { fontSize: 24, marginRight: Spacing.md },
  historyInfo: { flex: 1 },
  historyLevel: { fontSize: 15 },
  historyDate: { fontSize: 12 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xxxl + Spacing.sm },
});
