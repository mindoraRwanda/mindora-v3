import { Stack } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol, type IconSymbolName } from '@/components/ui/icon-symbol';
import { useLocale } from '@/context/LocaleContext';
import { Colors, Elevation, Radius, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

// Legal content is intentionally kept English-only for now — machine-translating a
// privacy policy risks subtly changing its legal meaning, which needs a proper legal
// review pass, not a best-effort pass. The surrounding screen chrome (title) still
// follows the app's locale via the root layout.
const LAST_UPDATED = 'March 08, 2026';
const COMPANY_EMAIL = 'privacy@mindora.app';
const COMPANY_NAME = 'Mindora';

interface SectionProps {
    title: string;
    icon: IconSymbolName;
    children: React.ReactNode;
}

function Section({ title, icon, children }: SectionProps) {
    const scheme = useColorScheme() ?? 'light';
    const colors = Colors[scheme];
    return (
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <View style={[styles.iconCircle, { backgroundColor: colors.tintSoft }]}>
                    <IconSymbol name={icon} size={14} color={colors.tint} />
                </View>
                <ThemedText type="defaultSemiBold" style={[styles.sectionTitle, { color: colors.tint }]}>
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
    const scheme = useColorScheme() ?? 'light';
    const colors = Colors[scheme];
    const { t } = useLocale();

    return (
        <>
            <Stack.Screen options={{ title: t('stackTitles.privacyPolicy') }} />
            <ThemedView style={styles.container}>
                <ScrollView
                    contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
                    showsVerticalScrollIndicator={false}>

                    <View style={styles.header}>
                        <View style={[styles.logoBadge, { backgroundColor: colors.tintSolid, shadowColor: colors.tintSolid }]}>
                            <ThemedText style={styles.logoBadgeText}>M</ThemedText>
                        </View>
                        <ThemedText style={styles.heading}>
                            Privacy Policy
                        </ThemedText>
                        <ThemedText style={[styles.lastUpdated, { color: colors.textMuted }]}>
                            Effective as of {LAST_UPDATED}
                        </ThemedText>
                    </View>

                    <ThemedText style={[styles.intro, { color: colors.textMuted }]}>
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
                        <ThemedText style={[styles.contactEmail, { color: colors.tint }]}>{COMPANY_EMAIL}</ThemedText>
                    </Section>

                    <View style={[styles.footer, { borderTopColor: colors.border }]}>
                        <ThemedText style={[styles.footerText, { color: colors.textMuted }]}>
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
    scrollContent: { padding: Spacing.xxl },
    header: { alignItems: 'center', marginBottom: Spacing.xxxl },
    logoBadge: { width: 44, height: 44, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.lg, ...Elevation.sm },
    logoBadgeText: { color: '#fff', fontSize: 24, fontWeight: '700' },
    heading: { ...Typography.h1 },
    lastUpdated: { fontSize: 12, marginTop: Spacing.xs },
    intro: { textAlign: 'center', lineHeight: 22, marginBottom: Spacing.xxxl + Spacing.sm },
    section: { marginBottom: Spacing.xxl },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.lg },
    iconCircle: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    sectionTitle: { fontSize: 16 },
    sectionContent: { paddingLeft: Spacing.xxxl + Spacing.xs },
    bodyText: { lineHeight: 22 },
    bulletItem: { lineHeight: 22, marginTop: Spacing.xs },
    contactEmail: { fontWeight: '700', marginTop: Spacing.sm },
    footer: { marginTop: Spacing.xxxl + Spacing.sm, alignItems: 'center', borderTopWidth: 1, paddingTop: Spacing.xl },
    footerText: { fontSize: 11 },
});
