import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/context/AuthContext';
import { getExercises } from '@/services/api';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

interface Exercise {
  id: string;
  title: string;
  description: string;
  duration: string;
  category: string;
  thumbnail?: string;
}

export default function GamesScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? 'light';
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, token } = useAuth();

  useEffect(() => {
    if (token) {
      loadExercises();
    } else {
      setLoading(false);
    }
  }, [token]);

  const loadExercises = async () => {
    try {
      const res: any = await getExercises(token!);
      if (res.success) {
        setExercises(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStart = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Future implementation: Navigate to game player
  };

  const renderExercise = ({ item }: { item: Exercise }) => (
    <TouchableOpacity style={styles.exerciseCard} activeOpacity={0.8} onPress={handleStart}>
      <View style={styles.exerciseImagePlaceholder}>
        <IconSymbol name="gamecontroller" size={40} color="rgba(109, 40, 217, 0.4)" />
      </View>
      <View style={styles.exerciseContent}>
        <View style={styles.cardHeader}>
          <View style={styles.categoryBadge}>
            <ThemedText style={styles.categoryText}>{item.category || 'Mindfulness'}</ThemedText>
          </View>
          <ThemedText style={styles.duration}>{item.duration || '5-10 min'}</ThemedText>
        </View>
        <ThemedText type="defaultSemiBold" style={styles.exerciseTitle}>{item.title}</ThemedText>
        <ThemedText numberOfLines={2} style={styles.exerciseDescription}>{item.description}</ThemedText>
        
        <View style={styles.playButton}>
          <ThemedText style={styles.playText}>Start Activity</ThemedText>
          <IconSymbol name="chevron.right" size={16} color="#6D28D9" />
        </View>
      </View>
    </TouchableOpacity>
  );

  if (!user) {
    return (
      <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.centered}>
          <IconSymbol name="gamecontroller" size={80} color="#6D28D9" />
          <ThemedText type="title" style={styles.mainTitle}>Mind Games</ThemedText>
          <ThemedText style={styles.mainSubtitle}>
          Interactive activities and games designed to improve focus and reduce stress. Please sign in to unlock.
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top || 60 }]}>
        <ThemedText type="title">Mind Games</ThemedText>
        <ThemedText style={styles.subtitle}>Gamified mindfulness & coping strategies</ThemedText>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={Colors[colorScheme].tint} style={styles.loader} />
      ) : (
        <FlatList
          data={exercises}
          renderItem={renderExercise}
          keyExtractor={(item) => item.id}
          numColumns={1}
          contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 40 }]}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <IconSymbol name="gamecontroller" size={48} color="rgba(150,150,150,0.5)" />
              <ThemedText style={styles.emptyText}>No games or activities available right now. Check back soon!</ThemedText>
            </View>
          }
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, marginBottom: 20 },
  subtitle: { fontSize: 16, opacity: 0.6 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  mainTitle: { fontSize: 28, fontWeight: 'bold', marginVertical: 12 },
  mainSubtitle: { textAlign: 'center', opacity: 0.6, lineHeight: 22 },
  loader: { marginTop: 40 },
  listContent: { paddingHorizontal: 20 },
  exerciseCard: { backgroundColor: '#fff', borderRadius: 24, overflow: 'hidden', marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 15, elevation: 3 },
  exerciseImagePlaceholder: { height: 120, backgroundColor: 'rgba(109, 40, 217, 0.05)', alignItems: 'center', justifyContent: 'center' },
  exerciseContent: { padding: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  categoryBadge: { backgroundColor: 'rgba(109, 40, 217, 0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  categoryText: { fontSize: 10, fontWeight: 'bold', color: '#6D28D9', textTransform: 'uppercase' },
  duration: { fontSize: 12, opacity: 0.5 },
  exerciseTitle: { fontSize: 18, marginBottom: 6 },
  exerciseDescription: { fontSize: 13, lineHeight: 18, opacity: 0.6, marginBottom: 16 },
  playButton: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  playText: { color: '#6D28D9', fontWeight: 'bold', fontSize: 14 },
  emptyContainer: { alignItems: 'center', padding: 40 },
  emptyText: { textAlign: 'center', opacity: 0.4, fontStyle: 'italic', marginTop: 12 },
});
