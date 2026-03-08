import { Stack } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';

const LAST_UPDATED = 'March 08, 2026';
const COMPANY_EMAIL = 'privacy@mindora.app';
const COMPANY_NAME = 'Mindora';

interface SectionProps {
    title: string;
    icon: any;
    children: React.ReactNode;
}

function Section({ title, icon, children }: SectionProps) {
    return (
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <View style={styles.iconCircle}>
                    <IconSymbol name={icon} size={14} color="#6D28D9" />
                </View>
                <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
                    {title}
                </ThemedText>
            </View>
            <View style={styles.sectionContent}>
                {children}
            </View>
        </View>
    );
}

export default function PrivacyPolicyScreen() {
    const insets = useSafeAreaInsets();
    
    return (
        <>
            <Stack.Screen options={{ title: 'Privacy Policy' }} />
            <ThemedView style={styles.container}>
                <ScrollView
                    contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
                    showsVerticalScrollIndicator={false}>
                    
                    <View style={styles.header}>
                        <View style={styles.logoBadge}>
                            <ThemedText style={styles.logoBadgeText}>M</ThemedText>
                        </View>
                        <ThemedText type="title" style={styles.heading}>
                            Privacy Policy
                        </ThemedText>
                        <ThemedText style={styles.lastUpdated}>
                            Effective as of {LAST_UPDATED}
                        </ThemedText>
                    </View>

                    <ThemedText style={styles.intro}>
                        At {COMPANY_NAME}, your privacy is our priority. This policy outlines how we handle your data with the care and security it deserves.
                    </ThemedText>

                    <Section title="1. Information We Collect" icon="person.2">
                        <ThemedText style={styles.bodyText}>
                            To provide a personalized experience, we collect:
                        </ThemedText>
                        <ThemedText style={styles.bulletItem}>• <ThemedText type="defaultSemiBold">Identity:</ThemedText> Name and email address.</ThemedText>
                        <ThemedText style={styles.bulletItem}>• <ThemedText type="defaultSemiBold">Wellness:</ThemedText> Mood logs and exercise progress.</ThemedText>
                        <ThemedText style={styles.bulletItem}>• <ThemedText type="defaultSemiBold">Usage:</ThemedText> Feature interaction history.</ThemedText>
                        <ThemedText style={styles.bulletItem}>• <ThemedText type="defaultSemiBold">Device:</ThemedText> OS version and identifiers.</ThemedText>
                    </Section>

                    <Section title="2. Usage of Data" icon="chart.bar">
                        <ThemedText style={styles.bodyText}>
                            Your information helps us:
                        </ThemedText>
                        <ThemedText style={styles.bulletItem}>• Personalize wellness insights.</ThemedText>
                        <ThemedText style={styles.bulletItem}>• Facilitate therapist connections.</ThemedText>
                        <ThemedText style={styles.bulletItem}>• Secure your account and data.</ThemedText>
                    </Section>

                    <Section title="3. Security Standards" icon="lock.fill">
                        <ThemedText style={styles.bodyText}>
                            We use industrial-grade encryption (TLS/HTTPS) for all data in transit and secure local storage for your credentials.
                        </ThemedText>
                    </Section>

                    <Section title="4. Your Control" icon="hand.raised.fill">
                        <ThemedText style={styles.bodyText}>
                            You have the right to access, correct, or permanently delete your data at any time via the Settings menu or by contacting support.
                        </ThemedText>
                    </Section>

                    <Section title="5. Contact" icon="envelope.fill">
                        <ThemedText style={styles.bodyText}>
                            For any privacy inquiries, reach out to our dedicated team at:
                        </ThemedText>
                        <ThemedText style={styles.contactEmail}>{COMPANY_EMAIL}</ThemedText>
                    </Section>

                    <View style={styles.footer}>
                        <ThemedText style={styles.footerText}>
                            © {new Date().getFullYear()} {COMPANY_NAME} • Secure & Confidential
                        </ThemedText>
                    </View>
                </ScrollView>
            </ThemedView>
        </>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { padding: 24 },
    header: { alignItems: 'center', marginBottom: 32 },
    logoBadge: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#6D28D9', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
    logoBadgeText: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
    heading: { fontSize: 24, fontWeight: 'bold' },
    lastUpdated: { opacity: 0.4, fontSize: 12, marginTop: 4 },
    intro: { textAlign: 'center', lineHeight: 22, opacity: 0.7, marginBottom: 40 },
    section: { marginBottom: 32 },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
    iconCircle: { width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(109, 40, 217, 0.1)', alignItems: 'center', justifyContent: 'center' },
    sectionTitle: { fontSize: 16, color: '#6D28D9' },
    sectionContent: { paddingLeft: 40 },
    bodyText: { lineHeight: 22, opacity: 0.8 },
    bulletItem: { lineHeight: 22, opacity: 0.8, marginTop: 4 },
    contactEmail: { color: '#6D28D9', fontWeight: 'bold', marginTop: 8 },
    footer: { marginTop: 40, alignItems: 'center', borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)', paddingTop: 20 },
    footerText: { opacity: 0.3, fontSize: 11 },
});
