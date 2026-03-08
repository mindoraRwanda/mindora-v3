import { Link, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  StyleSheet,
  TouchableOpacity,
  View,
  ScrollView,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/context/AuthContext';
import { getEmergencyContacts } from '@/services/api';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

interface Contact {
  id: string;
  name: string;
  phone: string;
  description: string;
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? 'light';
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    loadContacts();
  }, [token]);

  const loadContacts = async () => {
    try {
      const response: any = await getEmergencyContacts(token || undefined);
      if (response.success) {
        setContacts(response.data);
      }
    } catch (err) {
      // Silently fail for home contacts to avoid disruptive error boxes
      console.warn('Emergency contacts load failed', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCall = (phone: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    const url = `tel:${phone}`;
    Linking.openURL(url).catch(() => Alert.alert('Error', 'Unable to make call'));
  };

  const handleNavigate = (route: string) => {
    Haptics.selectionAsync();
    router.push(route as any);
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView 
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top || 60, paddingBottom: insets.bottom + 40 }]} 
        showsVerticalScrollIndicator={false}
      >
        {/* Top Header */}
        <View style={styles.header}>
          <View>
            <ThemedText style={styles.greeting}>Good afternoon,</ThemedText>
            <ThemedText type="title" style={styles.userName}>
              {user?.fullName ? user.fullName.split(' ')[0] : 'Guest'} 👋
            </ThemedText>
          </View>
          <TouchableOpacity onPress={() => handleNavigate('/modal')} style={styles.profileBtn}>
            <View style={styles.avatarMini}>
              <ThemedText style={styles.avatarTxt}>{user?.fullName ? user.fullName.charAt(0) : 'M'}</ThemedText>
            </View>
          </TouchableOpacity>
        </View>

        {/* Hero Card */}
        <ThemedView style={styles.heroCard}>
          <View style={styles.heroContent}>
            <ThemedText style={styles.heroTitle}>How are you today?</ThemedText>
            <ThemedText style={styles.heroSubtitle}>Take a moment to check in with yourself.</ThemedText>
            <TouchableOpacity style={styles.heroBtn} onPress={() => handleNavigate('/reports')}>
              <ThemedText style={styles.heroBtnText}>Start Check-in</ThemedText>
            </TouchableOpacity>
          </View>
          <View style={styles.heroGraphic}>
             <IconSymbol name="house.fill" size={80} color="rgba(255,255,255,0.2)" />
          </View>
        </ThemedView>

        {/* Quick Actions Grid */}
        <View style={styles.section}>
          <ThemedText type="defaultSemiBold" style={styles.sectionLabel}>Quick Actions</ThemedText>
          <View style={styles.grid}>
            {[
              { label: 'Booking', icon: 'calendar', route: '/appointments', color: '#6D28D9' },
              { label: 'Community', icon: 'bubble.left.and.bubble.right', route: '/community', color: '#10B981' },
              { label: 'Exercises', icon: 'gamecontroller', route: '/games', color: '#F59E0B' },
              { label: 'Resources', icon: 'book.fill', route: '/community', color: '#3B82F6' },
            ].map((item, idx) => (
              <TouchableOpacity key={idx} style={styles.gridItem} onPress={() => handleNavigate(item.route)}>
                <View style={[styles.iconBox, { backgroundColor: item.color + '15' }]}>
                  <IconSymbol name={item.icon as any} size={24} color={item.color} />
                </View>
                <ThemedText style={styles.gridLabel}>{item.label}</ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recommended Content */}
        <View style={styles.section}>
          <ThemedText type="defaultSemiBold" style={styles.sectionLabel}>Featured for You</ThemedText>
          <TouchableOpacity style={styles.featureCard} onPress={() => handleNavigate('/community')}>
            <View style={styles.featureInfo}>
              <ThemedText style={styles.featureCategory}>GUIDE</ThemedText>
              <ThemedText type="defaultSemiBold" style={styles.featureTitle}>Understanding Anxiety</ThemedText>
              <ThemedText style={styles.featureDesc}>Learn about common symptoms and coping mechanisms.</ThemedText>
            </View>
            <IconSymbol name="chevron.right" size={20} color="#6D28D9" />
          </TouchableOpacity>
        </View>

        {/* Emergency Section */}
        <View style={styles.emergencyBox}>
          <View style={styles.emergencyHeader}>
             <IconSymbol name="phone" size={18} color="#EF4444" />
             <ThemedText style={styles.emergencyTitle}>Emergency Assistance</ThemedText>
          </View>
          {loading ? (
            <ActivityIndicator color={Colors[colorScheme].tint} style={{ marginTop: 10 }} />
          ) : contacts.length > 0 ? (
            contacts.slice(0, 1).map(contact => (
              <TouchableOpacity key={contact.id} style={styles.callRow} onPress={() => handleCall(contact.phone)}>
                <ThemedText style={styles.callName}>{contact.name}</ThemedText>
                <ThemedText style={styles.callPhone}>{contact.phone}</ThemedText>
                <View style={styles.callBtn}>
                   <IconSymbol name="phone" size={14} color="#fff" />
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <ThemedText style={styles.emptyText}>Emergency services are available 24/7.</ThemedText>
          )}
        </View>

        {!user && (
          <View style={styles.authPromo}>
            <ThemedText style={styles.promoText}>Sign in to unlock personalized insights and sync your progress.</ThemedText>
            <Link href="/auth/login" asChild>
              <TouchableOpacity style={styles.signInBtn}>
                <ThemedText style={styles.signInTxt}>Sign In</ThemedText>
              </TouchableOpacity>
            </Link>
          </View>
        )}

        <View style={styles.footer}>
          <ThemedText style={styles.footerText}>Mindora v1.0 • Professional Care</ThemedText>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 24 },
  greeting: { fontSize: 14, opacity: 0.5, fontWeight: '500' },
  userName: { fontSize: 24, fontWeight: '700' },
  profileBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#fff', padding: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  avatarMini: { flex: 1, borderRadius: 20, backgroundColor: '#F3E8FF', alignItems: 'center', justifyContent: 'center' },
  avatarTxt: { color: '#6D28D9', fontWeight: 'bold' },
  heroCard: { marginHorizontal: 20, backgroundColor: '#6D28D9', borderRadius: 28, padding: 24, flexDirection: 'row', overflow: 'hidden', marginBottom: 24 },
  heroContent: { flex: 1, zIndex: 1 },
  heroTitle: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginBottom: 8 },
  heroSubtitle: { color: 'rgba(255,255,255,0.7)', fontSize: 13, marginBottom: 20, lineHeight: 18 },
  heroBtn: { backgroundColor: 'rgba(255,255,255,0.2)', alignSelf: 'flex-start', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
  heroBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  heroGraphic: { position: 'absolute', right: -20, bottom: -20, opacity: 0.2 },
  section: { paddingHorizontal: 20, marginBottom: 24 },
  sectionLabel: { fontSize: 16, marginBottom: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  gridItem: { width: '48%', backgroundColor: '#fff', borderRadius: 24, padding: 20, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  iconBox: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  gridLabel: { fontSize: 13, fontWeight: '600', color: '#555' },
  featureCard: { backgroundColor: '#fff', borderRadius: 24, padding: 20, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2, borderWidth: 1, borderColor: '#F5F5F5' },
  featureInfo: { flex: 1 },
  featureCategory: { fontSize: 9, fontWeight: 'bold', color: '#6D28D9', letterSpacing: 1, marginBottom: 4 },
  featureTitle: { fontSize: 16, marginBottom: 4 },
  featureDesc: { fontSize: 12, opacity: 0.5, lineHeight: 18 },
  emergencyBox: { marginHorizontal: 20, backgroundColor: '#FEF2F2', borderRadius: 24, padding: 16, marginBottom: 24 },
  emergencyHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  emergencyTitle: { color: '#EF4444', fontWeight: 'bold', fontSize: 14 },
  callRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 12, borderRadius: 16 },
  callName: { flex: 1, fontSize: 14, fontWeight: '600' },
  callPhone: { fontSize: 14, color: '#EF4444', fontWeight: 'bold', marginRight: 12 },
  callBtn: { backgroundColor: '#EF4444', width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  emptyText: { textAlign: 'center', fontSize: 12, color: '#EF4444', opacity: 0.6 },
  authPromo: { backgroundColor: 'rgba(0,0,0,0.03)', marginHorizontal: 20, borderRadius: 24, padding: 20, alignItems: 'center', gap: 16, marginBottom: 24 },
  promoText: { textAlign: 'center', fontSize: 13, opacity: 0.6, lineHeight: 20 },
  signInBtn: { backgroundColor: '#333', paddingHorizontal: 32, paddingVertical: 12, borderRadius: 12 },
  signInTxt: { color: '#fff', fontWeight: 'bold' },
  footer: { alignItems: 'center', marginBottom: 20 },
  footerText: { fontSize: 11, opacity: 0.3 },
});
