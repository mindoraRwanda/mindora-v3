import { useRouter } from 'expo-router';
import { Alert, Linking, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/context/AuthContext';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function AboutScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, signOut } = useAuth();

  const handleSignOut = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
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
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      'Delete Account',
      'This action is permanent and will delete all your data, including mood history and appointments. Are you absolutely sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Everything',
          style: 'destructive',
          onPress: async () => {
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
      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 40 }]} showsVerticalScrollIndicator={false}>
        {/* Logo / Brand */}
        <View style={styles.brandSection}>
          <View style={styles.logoCircle}>
             <IconSymbol name="house.fill" size={32} color="#fff" />
          </View>
          <ThemedText type="title" style={styles.appName}>Mindora</ThemedText>
          <ThemedText style={styles.tagline}>Your Mental Health Companion</ThemedText>
          <View style={styles.versionBadge}>
             <ThemedText style={styles.version}>VERSION 1.0.0</ThemedText>
          </View>
        </View>

        {/* User Info Section */}
        {user && (
          <View style={styles.section}>
            <ThemedText type="defaultSemiBold" style={styles.sectionLabel}>Account Settings</ThemedText>
            <View style={styles.accountCard}>
              <View style={styles.avatar}>
                 <ThemedText style={styles.avatarTxt}>{user.fullName.charAt(0)}</ThemedText>
              </View>
              <View style={styles.accountInfo}>
                <ThemedText type="defaultSemiBold" style={styles.userName}>{user.fullName}</ThemedText>
                <ThemedText style={styles.userEmail}>{user.email}</ThemedText>
              </View>
              <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
                <IconSymbol name="book.fill" size={16} color="#6D28D9" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Links Section */}
        <View style={styles.section}>
          <ThemedText type="defaultSemiBold" style={styles.sectionLabel}>Support & Legal</ThemedText>
          <View style={styles.linksContainer}>
            <TouchableOpacity
              style={styles.linkRow}
              onPress={() => { Haptics.selectionAsync(); router.push('/privacy-policy'); }}>
              <View style={styles.linkIconTitle}>
                <View style={[styles.miniIcon, { backgroundColor: '#F3E8FF' }]}>
                   <IconSymbol name="lock.fill" size={14} color="#6D28D9" />
                </View>
                <ThemedText style={styles.linkLabel}>Privacy Policy</ThemedText>
              </View>
              <IconSymbol name="chevron.right" size={12} color="#A0A0A0" />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.linkRow}
              onPress={() => { Haptics.selectionAsync(); Linking.openURL('mailto:support@mindora.app'); }}>
              <View style={styles.linkIconTitle}>
                <View style={[styles.miniIcon, { backgroundColor: '#DBEAFE' }]}>
                   <IconSymbol name="envelope.fill" size={14} color="#3B82F6" />
                </View>
                <ThemedText style={styles.linkLabel}>Contact Support</ThemedText>
              </View>
              <IconSymbol name="chevron.right" size={12} color="#A0A0A0" />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.linkRow}
              onPress={() => { Haptics.selectionAsync(); Linking.openURL('https://mindora.app/terms'); }}>
              <View style={styles.linkIconTitle}>
                <View style={[styles.miniIcon, { backgroundColor: '#DCFCE7' }]}>
                   <IconSymbol name="doc.text.fill" size={14} color="#10B981" />
                </View>
                <ThemedText style={styles.linkLabel}>Terms of Service</ThemedText>
              </View>
              <IconSymbol name="chevron.right" size={12} color="#A0A0A0" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Danger Zone */}
        {user && (
          <View style={styles.section}>
            <ThemedText type="defaultSemiBold" style={[styles.sectionLabel, { color: '#EF4444' }]}>Danger Zone</ThemedText>
            <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
              <IconSymbol name="book.fill" size={14} color="#EF4444" style={{ marginRight: 8 }} />
              <ThemedText style={styles.deleteButtonText}>Delete My Account</ThemedText>
            </TouchableOpacity>
            <ThemedText style={styles.dangerNote}>This will permanently erase all your progress and history.</ThemedText>
          </View>
        )}

        <View style={styles.footer}>
          <ThemedText style={styles.copyright}>
            Designed with ♥ for mental wellness.
          </ThemedText>
          <ThemedText style={styles.copyright}>
            © {new Date().getFullYear()} Mindora.
          </ThemedText>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 24 },
  brandSection: { alignItems: 'center', marginBottom: 40 },
  logoCircle: { width: 72, height: 72, borderRadius: 24, backgroundColor: '#6D28D9', alignItems: 'center', justifyContent: 'center', marginBottom: 16, shadowColor: '#6D28D9', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 4 },
  appName: { fontSize: 28, fontWeight: 'bold' },
  tagline: { opacity: 0.5, fontSize: 14, marginTop: 4 },
  versionBadge: { backgroundColor: 'rgba(0,0,0,0.05)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginTop: 12 },
  version: { fontSize: 10, fontWeight: 'bold', letterSpacing: 1, opacity: 0.6 },
  section: { marginBottom: 32 },
  sectionLabel: { fontSize: 13, textTransform: 'uppercase', letterSpacing: 1, opacity: 0.5, marginBottom: 12, marginLeft: 4 },
  accountCard: { backgroundColor: '#fff', borderRadius: 24, padding: 16, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2, borderWidth: 1, borderColor: 'rgba(0,0,0,0.02)' },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#F3E8FF', alignItems: 'center', justifyContent: 'center' },
  avatarTxt: { color: '#6D28D9', fontWeight: 'bold', fontSize: 18 },
  accountInfo: { flex: 1, marginLeft: 16 },
  userName: { fontSize: 16 },
  userEmail: { fontSize: 13, opacity: 0.5 },
  signOutButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(109, 40, 217, 0.05)', alignItems: 'center', justifyContent: 'center' },
  linksContainer: { backgroundColor: '#fff', borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 10, elevation: 1 },
  linkRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  linkIconTitle: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  miniIcon: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  linkLabel: { fontSize: 15 },
  divider: { height: 1, backgroundColor: 'rgba(0,0,0,0.03)', marginHorizontal: 16 },
  deleteButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF2F2', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#FEE2E2' },
  deleteButtonText: { color: '#EF4444', fontWeight: 'bold', fontSize: 15 },
  dangerNote: { fontSize: 12, opacity: 0.4, marginTop: 10, textAlign: 'center' },
  footer: { alignItems: 'center', marginTop: 20 },
  copyright: { fontSize: 11, opacity: 0.3, marginBottom: 4 },
});
