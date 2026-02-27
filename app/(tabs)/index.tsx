import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View, TouchableOpacity } from 'react-native';
import { Link, useRouter } from 'expo-router';

import { HelloWave } from '@/components/hello-wave';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { getEmergencyContacts } from '@/services/api';
import { useAuth } from '@/context/AuthContext';

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
  const { user, token, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      const response: any = await getEmergencyContacts();
      if (response.success) {
        setContacts(response.data);
      } else {
        setError('Failed to load contacts');
      }
    } catch (err) {
      setError('Error connecting to server');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">
          {user ? `Welcome, ${user.firstName}` : 'Welcome to Mindora'}
        </ThemedText>
        <HelloWave />
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Your Mental Health Companion</ThemedText>
        {user ? (
          <View>
            <ThemedText>You are logged in as {user.email}.</ThemedText>
            <TouchableOpacity onPress={signOut} style={styles.button}>
              <ThemedText style={styles.buttonText}>Sign Out</ThemedText>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            <ThemedText>
              Please log in to access your appointments, mood tracking, and more.
            </ThemedText>
            <View style={styles.authButtons}>
              <Link href="/auth/login" asChild>
                <TouchableOpacity style={styles.button}>
                  <ThemedText style={styles.buttonText}>Sign In</ThemedText>
                </TouchableOpacity>
              </Link>
              <Link href="/auth/register" asChild>
                <TouchableOpacity style={[styles.button, styles.secondaryButton]}>
                  <ThemedText style={[styles.buttonText, styles.secondaryButtonText]}>Sign Up</ThemedText>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        )}
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Emergency Contacts</ThemedText>
        {loading ? (
          <ActivityIndicator size="large" />
        ) : error ? (
          <ThemedText style={{ color: 'red' }}>{error}</ThemedText>
        ) : contacts.length === 0 ? (
          <ThemedText>No contacts available at the moment.</ThemedText>
        ) : (
          contacts.map((contact) => (
            <View key={contact.id} style={styles.contactCard}>
              <ThemedText type="defaultSemiBold">{contact.name}</ThemedText>
              <ThemedText>{contact.phone}</ThemedText>
              {contact.description && <ThemedText>{contact.description}</ThemedText>}
            </View>
          ))
        )}
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  contactCard: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(150, 150, 150, 0.1)',
    marginBottom: 8,
  },
  authButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  button: {
    backgroundColor: '#0a7ea4',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#0a7ea4',
  },
  secondaryButtonText: {
    color: '#0a7ea4',
  },
});
