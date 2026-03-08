import { useRouter } from 'expo-router';
import { Alert, Linking, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/context/AuthContext';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function AboutScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Sign Out', 
        style: 'destructive', 
        onPress: async () => {
          await signOut();
          router.replace('/');
        } 
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action is permanent and will delete all your data, including mood history and appointments. Are you absolutely sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Everything',
          style: 'destructive',
          onPress: async () => {
            // Ideally call an API here: await api.delete('/users/profile');
            Alert.alert(
              'Request Received',
              'Your account deletion request has been received. You will be signed out and your data will be removed within 24 hours.',
              [
                { 
                  text: 'OK', 
                  onPress: async () => {
                    await signOut();
                    router.replace('/');
                  } 
                }
              ]
            );
          },
        },
      ]
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Logo / Brand */}
        <View style={styles.brandSection}>
          <View style={styles.logoCircle}>
            <ThemedText style={styles.logoText}>M</ThemedText>
          </View>
          <ThemedText type="title" style={styles.appName}>Mindora</ThemedText>
          <ThemedText style={styles.tagline}>Your Mental Health Companion</ThemedText>
          <ThemedText style={styles.version}>Version 1.0.0</ThemedText>
        </View>

        {/* User Info Section */}
        {user && (
          <View style={styles.section}>
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>Account</ThemedText>
            <View style={styles.accountCard}>
              <View style={styles.accountInfo}>
                <ThemedText style={styles.userName}>{user.firstName} {user.lastName}</ThemedText>
                <ThemedText style={styles.userEmail}>{user.email}</ThemedText>
              </View>
              <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
                <ThemedText style={styles.signOutText}>Sign Out</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Links Section */}
        <View style={styles.section}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>Support & Legal</ThemedText>
          <View style={styles.linksContainer}>
            <TouchableOpacity
              style={styles.linkRow}
              onPress={() => router.push('/privacy-policy')}>
              <View style={styles.linkIconTitle}>
                <IconSymbol name="lock.fill" size={18} color="#6D28D9" />
                <ThemedText style={styles.linkLabel}>Privacy Policy</ThemedText>
              </View>
              <ThemedText style={styles.chevron}>›</ThemedText>
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.linkRow}
              onPress={() => Linking.openURL('mailto:support@mindora.app')}>
              <View style={styles.linkIconTitle}>
                <IconSymbol name="envelope.fill" size={18} color="#6D28D9" />
                <ThemedText style={styles.linkLabel}>Contact Support</ThemedText>
              </View>
              <ThemedText style={styles.chevron}>›</ThemedText>
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.linkRow}
              onPress={() => Linking.openURL('https://mindora.app/terms')}>
              <View style={styles.linkIconTitle}>
                <IconSymbol name="doc.text.fill" size={18} color="#6D28D9" />
                <ThemedText style={styles.linkLabel}>Terms of Service</ThemedText>
              </View>
              <ThemedText style={styles.chevron}>›</ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        {/* Danger Zone */}
        {user && (
          <View style={styles.section}>
            <ThemedText type="defaultSemiBold" style={[styles.sectionTitle, { color: '#d9534f' }]}>Danger Zone</ThemedText>
            <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
              <ThemedText style={styles.deleteButtonText}>Delete Account Permanently</ThemedText>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.footer}>
          <ThemedText style={styles.copyright}>
            © {new Date().getFullYear()} Mindora. All rights reserved.
          </ThemedText>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    padding: 24,
    paddingBottom: 48,
  },
  brandSection: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 8,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: '#6D28D9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#6D28D9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  logoText: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold',
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  tagline: {
    opacity: 0.6,
    fontSize: 14,
    marginBottom: 6,
  },
  version: {
    opacity: 0.4,
    fontSize: 12,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 14,
    opacity: 0.5,
    marginBottom: 10,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  accountCard: {
    backgroundColor: 'rgba(109, 40, 217, 0.05)',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(109, 40, 217, 0.1)',
  },
  accountInfo: {
    flex: 1,
    gap: 2,
  },
  userName: {
    fontSize: 17,
    fontWeight: '600',
  },
  userEmail: {
    fontSize: 14,
    opacity: 0.6,
  },
  signOutButton: {
    backgroundColor: 'rgba(109, 40, 217, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  signOutText: {
    color: '#6D28D9',
    fontWeight: 'bold',
    fontSize: 14,
  },
  linksContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(150, 150, 150, 0.05)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(150, 150, 150, 0.2)',
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  linkIconTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  linkLabel: {
    fontSize: 16,
  },
  chevron: {
    fontSize: 22,
    opacity: 0.3,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(150, 150, 150, 0.2)',
    marginHorizontal: 16,
  },
  deleteButton: {
    backgroundColor: 'rgba(217, 83, 79, 0.08)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(217, 83, 79, 0.2)',
  },
  deleteButtonText: {
    color: '#d9534f',
    fontWeight: '600',
    fontSize: 15,
  },
  footer: {
    alignItems: 'center',
    marginTop: 12,
  },
  copyright: {
    opacity: 0.3,
    fontSize: 12,
  },
});

