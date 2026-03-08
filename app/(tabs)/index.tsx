import { Link, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/context/AuthContext';
import { getEmergencyContacts } from '@/services/api';

interface Contact {
  id: string;
  name: string;
  phone: string;
  description: string;
}

export default function HomeScreen() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response: any = await getEmergencyContacts();
      if (response.success) {
        setContacts(response.data);
      } else {
        setError('Failed to load contacts');
      }
    } catch (err) {
      setError('Could not reach the server. Please check your internet connection.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCall = (phone: string) => {
    const url = `tel:${phone}`;
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Alert.alert('Unable to make call', `Please dial ${phone} manually.`);
        }
      })
      .catch(console.error);
  };

  const handleSignOut = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => signOut(),
      },
    ]);
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#E6F4FE', dark: '#1D3D47' }}
      headerImage={
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <ThemedText style={styles.logoLetter}>M</ThemedText>
          </View>
          <ThemedText style={styles.logoSubtext}>Mindora</ThemedText>
        </View>
      }>

      {/* Welcome Section */}
      <ThemedView style={styles.titleContainer}>
        <View>
          <ThemedText type="title">
            {user ? `Hello, ${user.firstName}!` : 'Welcome to Mindora'}
          </ThemedText>
          <ThemedText style={styles.subtitle}>Your Mental Health Companion</ThemedText>
        </View>
      </ThemedView>

      {/* Auth Section */}
      <ThemedView style={styles.card}>
        {user ? (
          <View>
            <ThemedText type="defaultSemiBold" style={styles.cardTitle}>
              You are signed in
            </ThemedText>
            <ThemedText style={styles.emailText}>{user.email}</ThemedText>
            <View style={styles.rowButtons}>
              <TouchableOpacity
                onPress={() => router.push('/modal')}
                style={[styles.button, styles.secondaryButton]}>
                <ThemedText style={[styles.buttonText, styles.secondaryButtonText]}>
                  About
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSignOut} style={[styles.button, styles.dangerButton]}>
                <ThemedText style={styles.buttonText}>Sign Out</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View>
            <ThemedText type="defaultSemiBold" style={styles.cardTitle}>
              Get Started
            </ThemedText>
            <ThemedText style={styles.cardBody}>
              Sign in to access your appointments, mood tracking, therapist connections, and more.
            </ThemedText>
            <View style={styles.authButtons}>
              <Link href="/auth/login" asChild>
                <TouchableOpacity style={styles.button}>
                  <ThemedText style={styles.buttonText}>Sign In</ThemedText>
                </TouchableOpacity>
              </Link>
              <Link href="/auth/register" asChild>
                <TouchableOpacity style={[styles.button, styles.secondaryButton]}>
                  <ThemedText style={[styles.buttonText, styles.secondaryButtonText]}>
                    Sign Up
                  </ThemedText>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        )}
      </ThemedView>

      {/* Features Section (when not logged in) */}
      {!user && (
        <ThemedView style={styles.featuresCard}>
          <ThemedText type="defaultSemiBold" style={styles.cardTitle}>
            What Mindora Offers
          </ThemedText>
          {[
            { icon: 'person.2.fill', text: 'Connect with licensed therapists' },
            { icon: 'chart.bar.fill', text: 'Track your mood and wellness' },
            { icon: 'book.fill', text: 'Access mental health resources' },
            { icon: 'bubble.left.fill', text: 'Join a supportive community' },
          ].map((feature, idx) => (
            <View key={idx} style={styles.featureRow}>
              <IconSymbol name={feature.icon as any} size={20} color="#0a7ea4" />
              <ThemedText style={styles.featureText}>{feature.text}</ThemedText>
            </View>
          ))}
        </ThemedView>
      )}

      {/* Emergency Contacts */}
      <ThemedView style={styles.emergencySection}>
        <View style={styles.sectionHeader}>
          <IconSymbol name="phone.fill" size={18} color="#d9534f" />
          <ThemedText type="defaultSemiBold" style={styles.emergencyTitle}>
            Emergency Contacts
          </ThemedText>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#0a7ea4" style={styles.loader} />
        ) : error ? (
          <View style={styles.errorContainer}>
            <ThemedText style={styles.errorText}>{error}</ThemedText>
            <TouchableOpacity onPress={loadContacts} style={styles.retryButton}>
              <ThemedText style={styles.retryText}>Retry</ThemedText>
            </TouchableOpacity>
          </View>
        ) : contacts.length === 0 ? (
          <ThemedText style={styles.emptyText}>No emergency contacts available at the moment.</ThemedText>
        ) : (
          contacts.map((contact) => (
            <TouchableOpacity
              key={contact.id}
              style={styles.contactCard}
              onPress={() => handleCall(contact.phone)}
              accessibilityLabel={`Call ${contact.name} at ${contact.phone}`}
              accessibilityRole="button">
              <View style={styles.contactInfo}>
                <ThemedText type="defaultSemiBold">{contact.name}</ThemedText>
                <ThemedText style={styles.contactPhone}>{contact.phone}</ThemedText>
                {contact.description ? (
                  <ThemedText style={styles.contactDesc}>{contact.description}</ThemedText>
                ) : null}
              </View>
              <View style={styles.callIcon}>
                <IconSymbol name="phone.fill" size={20} color="#fff" />
              </View>
            </TouchableOpacity>
          ))
        )}
      </ThemedView>

      {/* Privacy Policy Link */}
      <View style={styles.privacyLinkContainer}>
        <Link href="/privacy-policy">
          <ThemedText style={styles.privacyLink}>Privacy Policy</ThemedText>
        </Link>
      </View>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  logoContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: '#0a7ea4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoLetter: {
    color: '#fff',
    fontSize: 44,
    fontWeight: 'bold',
  },
  logoSubtext: {
    color: '#0a7ea4',
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  titleContainer: {
    gap: 4,
    marginBottom: 4,
  },
  subtitle: {
    opacity: 0.6,
    fontSize: 15,
    marginTop: 4,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    backgroundColor: 'rgba(10, 126, 164, 0.06)',
  },
  featuresCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    gap: 10,
    backgroundColor: 'rgba(10, 126, 164, 0.06)',
  },
  cardTitle: {
    fontSize: 16,
    marginBottom: 6,
  },
  cardBody: {
    lineHeight: 22,
    opacity: 0.8,
    marginBottom: 12,
  },
  emailText: {
    opacity: 0.6,
    fontSize: 14,
    marginBottom: 12,
  },
  authButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  rowButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  button: {
    backgroundColor: '#0a7ea4',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  dangerButton: {
    backgroundColor: '#d9534f',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#0a7ea4',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  secondaryButtonText: {
    color: '#0a7ea4',
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  featureText: {
    fontSize: 15,
  },
  emergencySection: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    gap: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  emergencyTitle: {
    fontSize: 16,
    color: '#d9534f',
  },
  loader: {
    marginVertical: 12,
  },
  errorContainer: {
    gap: 8,
  },
  errorText: {
    color: '#d9534f',
    lineHeight: 22,
  },
  retryButton: {
    backgroundColor: '#0a7ea4',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  retryText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  emptyText: {
    opacity: 0.6,
    fontStyle: 'italic',
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(150, 150, 150, 0.1)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(150, 150, 150, 0.2)',
  },
  contactInfo: {
    flex: 1,
    gap: 2,
  },
  contactPhone: {
    color: '#0a7ea4',
    fontSize: 14,
  },
  contactDesc: {
    opacity: 0.6,
    fontSize: 13,
  },
  callIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#28a745',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  privacyLinkContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  privacyLink: {
    color: '#0a7ea4',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});
