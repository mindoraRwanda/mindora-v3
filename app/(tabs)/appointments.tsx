import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
  ScrollView,
  Alert,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/context/AuthContext';
import { getAppointments, getTherapists, bookAppointment } from '@/services/api';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

interface Appointment {
  id: string;
  therapistId: string;
  therapist: {
    user: { fullName: string };
    specialization: string;
  };
  dateTime: string;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  type: string;
}

interface Therapist {
  id: string;
  user: { fullName: string };
  specialization: string;
  bio: string;
  rating?: number;
}

const CATEGORIES = ['All', 'Psychologist', 'Psychiatrist', 'Counselor', 'Therapist'];

export default function AppointmentsScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? 'light';
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [filteredTherapists, setFilteredTherapists] = useState<Therapist[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const { user, token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (token) loadData();
    else setLoading(false);
  }, [token]);

  useEffect(() => {
    filterTherapists();
  }, [search, selectedCategory, therapists]);

  const loadData = async () => {
    try {
      const [apptsRes, therapistsRes]: any = await Promise.all([
        getAppointments(token!),
        getTherapists(token!),
      ]);
      if (apptsRes.success) setAppointments(apptsRes.data);
      if (therapistsRes.success) setTherapists(therapistsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filterTherapists = () => {
    let filtered = therapists;
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(t => t.specialization.includes(selectedCategory));
    }
    if (search) {
      filtered = filtered.filter(t => t.user?.fullName?.toLowerCase().includes(search.toLowerCase()));
    }
    setFilteredTherapists(filtered);
  };

  const handleBook = async (therapistId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert('Request Booking', 'Send an appointment request for tomorrow?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Confirm', 
        onPress: async () => {
          try {
            const res: any = await bookAppointment(token!, { therapistId, dateTime: new Date(Date.now() + 86400000).toISOString(), type: 'VIDEO' });
            if (res.success) {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              Alert.alert('Success', 'Request sent!');
              loadData();
            }
          } catch (err: any) {
            Alert.alert('Error', err.message);
          }
        }
      }
    ]);
  };

  if (!user) {
    return (
      <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.centered}>
          <IconSymbol name="calendar" size={80} color="#6D28D9" />
          <ThemedText type="title" style={styles.mainTitle}>Book a Session</ThemedText>
          <ThemedText style={styles.mainSubtitle}>Sign in to connect with licensed mental health professionals.</ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView 
        stickyHeaderIndices={[1]} 
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top || 60, paddingBottom: insets.bottom + 40 }]}
        keyboardDismissMode="on-drag"
      >
        <View style={styles.topSection}>
          <ThemedText type="title">Bookings</ThemedText>
          {appointments.length > 0 && (
            <View style={styles.upcomingBox}>
              <ThemedText type="defaultSemiBold" style={styles.upcomingTitle}>Upcoming Sessions</ThemedText>
              {appointments.slice(0, 2).map(appt => (
                <View key={appt.id} style={styles.miniCard}>
                  <View style={styles.miniInfo}>
                    <ThemedText style={styles.miniName}>{appt.therapist?.user?.fullName || 'Therapist'}</ThemedText>
                    <ThemedText style={styles.miniDate}>
                      {new Date(appt.dateTime).toLocaleDateString()} at {new Date(appt.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </ThemedText>
                  </View>
                  <View style={[styles.statusTag, styles[appt.status.toLowerCase()]]}>
                    <ThemedText style={styles.statusLabel}>{appt.status}</ThemedText>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={[styles.stickyHeader, { backgroundColor: colorScheme === 'dark' ? '#000' : '#FAFAFA' }]}>
          <View style={styles.searchBar}>
            <IconSymbol name="paperplane.fill" size={16} color="#A0A0A0" />
            <TextInput 
              placeholder="Search by name or specialty..." 
              placeholderTextColor="#A0A0A0"
              value={search} 
              onChangeText={setSearch} 
              style={[styles.searchInput, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}
            />
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categories}>
            {CATEGORIES.map(cat => (
              <TouchableOpacity 
                key={cat} 
                style={[styles.catChip, selectedCategory === cat && styles.activeChip]} 
                onPress={() => {
                  Haptics.selectionAsync();
                  setSelectedCategory(cat);
                }}
              >
                <ThemedText style={[styles.catText, selectedCategory === cat && styles.activeCatText]}>{cat}</ThemedText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.list}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>Available Therapists</ThemedText>
          {loading ? (
            <ActivityIndicator color={Colors[colorScheme].tint} style={{ marginTop: 20 }} />
          ) : filteredTherapists.length === 0 ? (
            <ThemedText style={styles.emptyText}>No therapists found matching your criteria.</ThemedText>
          ) : (
            filteredTherapists.map(t => (
              <TouchableOpacity key={t.id} style={styles.therapistCard} onPress={() => handleBook(t.id)}>
                <View style={styles.cardTop}>
                  <View style={styles.avatar}>
                    <ThemedText style={styles.avatarChar}>{t.user?.fullName?.charAt(0) || 'T'}</ThemedText>
                    <View style={styles.verifiedBadge}>
                      <IconSymbol name="paperplane.fill" size={8} color="#fff" />
                    </View>
                  </View>
                  <View style={styles.cardInfo}>
                    <ThemedText type="defaultSemiBold" style={styles.name}>{t.user?.fullName || 'Professional'}</ThemedText>
                    <ThemedText style={styles.specialization}>{t.specialization}</ThemedText>
                    <View style={styles.ratingRow}>
                       <ThemedText style={styles.rating}>⭐ 4.9</ThemedText>
                       <ThemedText style={styles.divider}>•</ThemedText>
                       <ThemedText style={styles.experience}>5+ years exp.</ThemedText>
                    </View>
                  </View>
                  <View style={styles.bookBtn}>
                    <IconSymbol name="calendar" size={20} color="#6D28D9" />
                  </View>
                </View>
                <ThemedText numberOfLines={2} style={styles.bio}>{t.bio}</ThemedText>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles: any = StyleSheet.create({
  container: { flex: 1 },
  scroll: { },
  topSection: { paddingHorizontal: 20, marginBottom: 10 },
  upcomingBox: { marginTop: 20, backgroundColor: '#6D28D9', borderRadius: 24, padding: 16 },
  upcomingTitle: { color: '#fff', fontSize: 13, marginBottom: 12, opacity: 0.8 },
  miniCard: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 16, padding: 10, flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  miniInfo: { flex: 1 },
  miniName: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  miniDate: { color: 'rgba(255,255,255,0.7)', fontSize: 11, marginTop: 2 },
  statusTag: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusLabel: { fontSize: 9, fontWeight: 'bold' },
  pending: { backgroundColor: '#FCD34D' },
  confirmed: { backgroundColor: '#34D399' },
  stickyHeader: { paddingVertical: 10 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.03)', marginHorizontal: 20, paddingHorizontal: 16, borderRadius: 16, height: 50, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)' },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 14 },
  categories: { marginTop: 12, paddingLeft: 20 },
  catChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, backgroundColor: '#fff', marginRight: 8, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  activeChip: { backgroundColor: '#6D28D9', borderColor: '#6D28D9' },
  catText: { fontSize: 13, fontWeight: '500', color: '#666' },
  activeCatText: { color: '#fff' },
  list: { paddingHorizontal: 20, marginTop: 20 },
  sectionTitle: { fontSize: 18, marginBottom: 16 },
  therapistCard: { backgroundColor: '#fff', borderRadius: 24, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3, borderWidth: 1, borderColor: 'rgba(0,0,0,0.02)' },
  cardTop: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#F3E8FF', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  avatarChar: { fontSize: 22, fontWeight: 'bold', color: '#6D28D9' },
  verifiedBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#34D399', width: 14, height: 14, borderRadius: 7, borderWidth: 2, borderColor: '#fff' },
  cardInfo: { flex: 1, marginLeft: 16 },
  name: { fontSize: 16 },
  specialization: { fontSize: 12, color: '#6D28D9', fontWeight: '600', marginTop: 2 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  rating: { fontSize: 12, fontWeight: 'bold' },
  divider: { marginHorizontal: 6, opacity: 0.2 },
  experience: { fontSize: 12, color: '#888' },
  bookBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F3E8FF', borderRadius: 12 },
  bio: { marginTop: 12, fontSize: 13, opacity: 0.6, lineHeight: 18 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  mainTitle: { fontSize: 28, fontWeight: 'bold', marginVertical: 12 },
  mainSubtitle: { textAlign: 'center', opacity: 0.6, lineHeight: 22 },
  emptyText: { textAlign: 'center', marginTop: 40, opacity: 0.4, fontStyle: 'italic' },
});
