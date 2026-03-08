import { useRouter } from 'expo-router';
import { Linking, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function AboutScreen() {
  const router = useRouter();

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

        {/* Description */}
        <View style={styles.card}>
          <ThemedText style={styles.description}>
            Mindora connects you with licensed therapists, helps you track your mood, provides
            mental health resources, and gives you a supportive community — all in one place.
          </ThemedText>
        </View>

        {/* Links */}
        <View style={styles.linksSection}>
          <TouchableOpacity
            style={styles.linkRow}
            onPress={() => router.push('/privacy-policy')}>
            <ThemedText style={styles.linkLabel}>🔒 Privacy Policy</ThemedText>
            <ThemedText style={styles.chevron}>›</ThemedText>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.linkRow}
            onPress={() => Linking.openURL('mailto:support@mindora.app')}>
            <ThemedText style={styles.linkLabel}>📧 Contact Support</ThemedText>
            <ThemedText style={styles.chevron}>›</ThemedText>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.linkRow}
            onPress={() => Linking.openURL('https://mindora.app/terms')}>
            <ThemedText style={styles.linkLabel}>📄 Terms of Service</ThemedText>
            <ThemedText style={styles.chevron}>›</ThemedText>
          </TouchableOpacity>
        </View>

        <ThemedText style={styles.copyright}>
          © {new Date().getFullYear()} Mindora. All rights reserved.
        </ThemedText>
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
    alignItems: 'center',
  },
  brandSection: {
    alignItems: 'center',
    marginBottom: 28,
    marginTop: 12,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: '#0a7ea4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#0a7ea4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  logoText: {
    color: '#fff',
    fontSize: 40,
    fontWeight: 'bold',
  },
  appName: {
    marginBottom: 4,
  },
  tagline: {
    opacity: 0.6,
    fontSize: 15,
    marginBottom: 6,
  },
  version: {
    opacity: 0.4,
    fontSize: 13,
  },
  card: {
    width: '100%',
    backgroundColor: 'rgba(10, 126, 164, 0.08)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  description: {
    lineHeight: 24,
    textAlign: 'center',
  },
  linksSection: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(150, 150, 150, 0.3)',
    marginBottom: 32,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  linkLabel: {
    fontSize: 16,
  },
  chevron: {
    fontSize: 22,
    opacity: 0.4,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(150, 150, 150, 0.3)',
    marginHorizontal: 16,
  },
  copyright: {
    opacity: 0.4,
    fontSize: 12,
    textAlign: 'center',
  },
});
