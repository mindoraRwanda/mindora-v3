import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/context/AuthContext';
import { getMoodLogs, getMoodAnalytics, logMood, getMyMonitoring } from '@/services/api';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

const MOODS = [
  { level: 'VERY_SAD', icon: '😭', label: 'Very Sad', color: '#EF4444' },
  { level: 'SAD', icon: '😔', label: 'Sad', color: '#F59E0B' },
  { level: 'NEUTRAL', icon: '😐', label: 'Neutral', color: '#6B7280' },
  { level: 'HAPPY', icon: '😊', label: 'Happy', color: '#10B981' },
  { level: 'VERY_HAPPY', icon: '🤩', label: 'Great', color: '#6D28D9' },
];

const CACHE_KEY = 'MINDORA_MOOD_LOGS_CACHE';

export default function ReportsScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? 'light';
  const [moodLogs, setMoodLogs] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [monitoring, setMonitoring] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const { user, token } = useAuth();

  useEffect(() => {
    loadCachedData();
    if (token) loadData();
    else setLoading(false);
  }, [token]);

  const loadCachedData = async () => {
    try {
      const cached = await SecureStore.getItemAsync(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        setMoodLogs(parsed);
      }
    } catch (e) {
      console.warn('Failed to load cache', e);
    }
  };

  const saveDataToCache = async (data: any[]) => {
    try {
      await SecureStore.setItemAsync(CACHE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to cache data', e);
    }
  };

  const loadData = async () => {
    setSyncing(true);
    try {
      const [logsRes, analyticsRes, monitoringRes]: any = await Promise.all([
        getMoodLogs(token!),
        getMoodAnalytics(token!),
        getMyMonitoring(token!),
      ]);

      if (logsRes.success) {
        setMoodLogs(logsRes.data);
        saveDataToCache(logsRes.data);
      }
      if (analyticsRes.success) setAnalytics(analyticsRes.data);
      if (monitoringRes.success) setMonitoring(monitoringRes.data);
    } catch (err) {
      console.warn('Network load failed, using cache', err);
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  };

  const handleLogMood = async (level: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Optimistic update for UI
    const tempLog = { id: Date.now().toString(), level, createdAt: new Date().toISOString(), isSyncing: true };
    const updatedLogs = [tempLog, ...moodLogs];
    setMoodLogs(updatedLogs);

    try {
      const res: any = await logMood(token!, { level });
      if (res.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        loadData(); // Success sync
      }
    } catch (err) {
      Alert.alert('Logged Locally', 'We saved your mood locally. It will sync when you are back online.');
    }
  };

  if (!user) {
    return (
      <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.centered}>
          <IconSymbol name="chart.bar" size={80} color="#6D28D9" />
          <ThemedText type="title" style={styles.mainTitle}>Wellness Reports</ThemedText>
          <ThemedText style={styles.mainSubtitle}>Track your journey and visualize your progress.</ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={[styles.scroll, { paddingTop: insets.top || 60, paddingBottom: insets.bottom + 40 }]}>
        <View style={styles.topHeader}>
          <View>
            <ThemedText type="title">Wellness Center</ThemedText>
            <ThemedText style={styles.subtitle}>Insights into your well-being</ThemedText>
          </View>
          {syncing && <ActivityIndicator size="small" color={Colors[colorScheme].tint} />}
        </View>

        <View style={styles.moodSection}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>Daily Check-in</ThemedText>
          <View style={styles.moodGrid}>
            {MOODS.map((m, idx) => (
              <TouchableOpacity key={idx} style={styles.moodBtn} onPress={() => handleLogMood(m.level)}>
                <View style={[styles.moodCircle, { backgroundColor: m.color + '15' }]}>
                  <ThemedText style={styles.moodEmoji}>{m.icon}</ThemedText>
                </View>
                <ThemedText style={styles.moodLabel}>{m.label}</ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={[styles.statItem, { backgroundColor: colorScheme === 'dark' ? 'rgba(16, 185, 129, 0.1)' : '#F0FDF4' }]}>
            <ThemedText style={[styles.statVal, { color: '#16A34A' }]}>{analytics?.streak || 0}</ThemedText>
            <ThemedText style={styles.statLabel}>Day Streak</ThemedText>
          </View>
          <View style={[styles.statItem, { backgroundColor: colorScheme === 'dark' ? 'rgba(109, 40, 217, 0.1)' : '#F5F3FF' }]}>
            <ThemedText style={[styles.statVal, { color: '#6D28D9' }]}>{moodLogs.length}</ThemedText>
            <ThemedText style={styles.statLabel}>Total Logs</ThemedText>
          </View>
        </View>

        {monitoring && (
          <ThemedView style={styles.assessmentCard}>
            <View style={styles.cardHeader}>
              <ThemedText type="defaultSemiBold">Health Assessment</ThemedText>
              <View style={[styles.riskBadge, { backgroundColor: monitoring.riskLevel === 'LOW' ? '#ECFDF5' : '#FEF2F2' }]}>
                <ThemedText style={[styles.riskText, { color: monitoring.riskLevel === 'LOW' ? '#059669' : '#B91C1C' }]}>
                  {monitoring.riskLevel} RISK
                </ThemedText>
              </View>
            </View>
            <ThemedText style={styles.description}>{monitoring.summary || 'Maintain your current wellness routine. Your data shows stability.'}</ThemedText>
          </ThemedView>
        )}

        <View style={styles.historySection}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>Recent Progress</ThemedText>
          {moodLogs.length === 0 ? (
            <View style={styles.emptyBox}>
               <IconSymbol name="chart.bar" size={32} color="rgba(150,150,150,0.3)" />
               <ThemedText style={styles.emptyText}>Start logging your mood to see history.</ThemedText>
            </View>
          ) : (
            moodLogs.slice(0, 7).map((log, idx) => {
              const mood = MOODS.find(m => m.level === log.level);
              return (
                <View key={idx} style={styles.historyRow}>
                  <ThemedText style={styles.historyEmoji}>{mood?.icon || '😐'}</ThemedText>
                  <View style={styles.historyInfo}>
                    <ThemedText type="defaultSemiBold" style={styles.historyLevel}>{mood?.label || log.level}</ThemedText>
                    <ThemedText style={styles.historyDate}>
                      {new Date(log.createdAt).toLocaleDateString()} at {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </ThemedText>
                  </View>
                  {log.isSyncing && <IconSymbol name="book.fill" size={12} color="#A0A0A0" />}
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
  scroll: { },
  topHeader: { paddingHorizontal: 20, marginBottom: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  subtitle: { opacity: 0.5, fontSize: 14, marginTop: 4 },
  moodSection: { paddingHorizontal: 20, marginBottom: 24 },
  sectionTitle: { fontSize: 18, marginBottom: 16 },
  moodGrid: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#fff', borderRadius: 24, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3, borderWidth: 1, borderColor: 'rgba(0,0,0,0.02)' },
  moodBtn: { alignItems: 'center', gap: 8 },
  moodCircle: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  moodEmoji: { fontSize: 24 },
  moodLabel: { fontSize: 10, fontWeight: '600', color: '#666' },
  statsRow: { flexDirection: 'row', gap: 16, paddingHorizontal: 20, marginBottom: 24 },
  statItem: { flex: 1, padding: 20, borderRadius: 24, alignItems: 'center', gap: 4 },
  statVal: { fontSize: 28, fontWeight: 'bold' },
  statLabel: { fontSize: 12, opacity: 0.6, fontWeight: '600' },
  assessmentCard: { marginHorizontal: 20, backgroundColor: '#fff', padding: 20, borderRadius: 24, marginBottom: 24, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  riskBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  riskText: { fontSize: 10, fontWeight: 'bold' },
  description: { fontSize: 14, lineHeight: 22, opacity: 0.6 },
  historySection: { paddingHorizontal: 20 },
  historyRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 12, borderRadius: 16, marginBottom: 10, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 5, elevation: 1 },
  historyEmoji: { fontSize: 24, marginRight: 12 },
  historyInfo: { flex: 1 },
  historyLevel: { fontSize: 15 },
  historyDate: { fontSize: 12, opacity: 0.4 },
  emptyBox: { alignItems: 'center', padding: 40, gap: 12 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  mainTitle: { fontSize: 28, fontWeight: 'bold', marginVertical: 12 },
  mainSubtitle: { textAlign: 'center', opacity: 0.6, lineHeight: 22 },
  emptyText: { textAlign: 'center', opacity: 0.4, fontStyle: 'italic' },
});
