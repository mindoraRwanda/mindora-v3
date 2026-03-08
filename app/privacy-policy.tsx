import { Stack } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

const LAST_UPDATED = 'February 27, 2026';
const COMPANY_EMAIL = 'privacy@mindora.app';
const COMPANY_NAME = 'Mindora';

interface SectionProps {
    title: string;
    children: React.ReactNode;
}

function Section({ title, children }: SectionProps) {
    return (
        <View style={styles.section}>
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
                {title}
            </ThemedText>
            {children}
        </View>
    );
}

export default function PrivacyPolicyScreen() {
    return (
        <>
            <Stack.Screen options={{ title: 'Privacy Policy' }} />
            <ThemedView style={styles.container}>
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}>
                    {/* Header */}
                    <ThemedText type="title" style={styles.heading}>
                        Privacy Policy
                    </ThemedText>
                    <ThemedText style={styles.lastUpdated}>
                        Last Updated: {LAST_UPDATED}
                    </ThemedText>
                    <ThemedText style={styles.intro}>
                        Welcome to {COMPANY_NAME}. We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application.
                    </ThemedText>

                    <Section title="1. Information We Collect">
                        <ThemedText style={styles.bodyText}>
                            We may collect the following categories of information:
                        </ThemedText>
                        <ThemedText style={styles.bulletItem}>
                            • <ThemedText type="defaultSemiBold">Personal Identification Information:</ThemedText> First name, last name, email address, and profile photo.
                        </ThemedText>
                        <ThemedText style={styles.bulletItem}>
                            • <ThemedText type="defaultSemiBold">Health &amp; Wellness Data:</ThemedText> Mood logs, exercise progress, and other mental health-related information you voluntarily provide.
                        </ThemedText>
                        <ThemedText style={styles.bulletItem}>
                            • <ThemedText type="defaultSemiBold">Usage Data:</ThemedText> Pages visited, features used, time stamps, and interaction history to improve your experience.
                        </ThemedText>
                        <ThemedText style={styles.bulletItem}>
                            • <ThemedText type="defaultSemiBold">Device Information:</ThemedText> Device type, operating system version, and unique device identifiers.
                        </ThemedText>
                        <ThemedText style={styles.bulletItem}>
                            • <ThemedText type="defaultSemiBold">Communications:</ThemedText> Messages exchanged with therapists through the platform (stored securely and only accessible to you and your therapist).
                        </ThemedText>
                    </Section>

                    <Section title="2. How We Use Your Information">
                        <ThemedText style={styles.bodyText}>
                            We use the information we collect to:
                        </ThemedText>
                        <ThemedText style={styles.bulletItem}>• Create and manage your account</ThemedText>
                        <ThemedText style={styles.bulletItem}>• Connect you with licensed therapists and mental health resources</ThemedText>
                        <ThemedText style={styles.bulletItem}>• Track your mood and mental wellness over time</ThemedText>
                        <ThemedText style={styles.bulletItem}>• Send you appointment reminders and notifications</ThemedText>
                        <ThemedText style={styles.bulletItem}>• Improve and personalize your experience</ThemedText>
                        <ThemedText style={styles.bulletItem}>• Detect and prevent fraudulent or harmful activity</ThemedText>
                        <ThemedText style={styles.bulletItem}>• Comply with legal obligations</ThemedText>
                    </Section>

                    <Section title="3. How We Share Your Information">
                        <ThemedText style={styles.bodyText}>
                            We do <ThemedText type="defaultSemiBold">not</ThemedText> sell your personal information. We may share information with:
                        </ThemedText>
                        <ThemedText style={styles.bulletItem}>
                            • <ThemedText type="defaultSemiBold">Licensed Therapists:</ThemedText> Only the therapist(s) you book appointments with will have access to your shared profile and session notes.
                        </ThemedText>
                        <ThemedText style={styles.bulletItem}>
                            • <ThemedText type="defaultSemiBold">Service Providers:</ThemedText> Trusted third parties that help us operate the platform (e.g., cloud hosting, analytics), bound by confidentiality agreements.
                        </ThemedText>
                        <ThemedText style={styles.bulletItem}>
                            • <ThemedText type="defaultSemiBold">Legal Compliance:</ThemedText> We may disclose data if required by law or to protect the safety of our users or the public.
                        </ThemedText>
                    </Section>

                    <Section title="4. Data Security">
                        <ThemedText style={styles.bodyText}>
                            We implement industry-standard security measures to protect your data, including:
                        </ThemedText>
                        <ThemedText style={styles.bulletItem}>• Encryption of data in transit (TLS/HTTPS)</ThemedText>
                        <ThemedText style={styles.bulletItem}>• Encrypted storage of authentication tokens using device-level security</ThemedText>
                        <ThemedText style={styles.bulletItem}>• Role-based access controls to limit who can view your data</ThemedText>
                        <ThemedText style={styles.bulletItem}>• Regular security audits and vulnerability assessments</ThemedText>
                        <ThemedText style={styles.bodyText}>
                            While we strive to use commercially acceptable means to protect your information, no method of transmission over the Internet or electronic storage is 100% secure.
                        </ThemedText>
                    </Section>

                    <Section title="5. Health Information">
                        <ThemedText style={styles.bodyText}>
                            Mental health information you share on Mindora (such as mood logs, session notes, and exercise data) is treated with the highest level of sensitivity. This information is:
                        </ThemedText>
                        <ThemedText style={styles.bulletItem}>• Encrypted and stored securely</ThemedText>
                        <ThemedText style={styles.bulletItem}>• Only accessible to you and your designated therapist</ThemedText>
                        <ThemedText style={styles.bulletItem}>• Never used for advertising purposes</ThemedText>
                        <ThemedText style={styles.bulletItem}>• Never sold to third parties</ThemedText>
                    </Section>

                    <Section title="6. Data Retention">
                        <ThemedText style={styles.bodyText}>
                            We retain your personal information for as long as your account is active or as needed to provide you with our services. You may request deletion of your account and associated data at any time by contacting us at {COMPANY_EMAIL}. Note that some data may be retained for a limited period to comply with legal obligations.
                        </ThemedText>
                    </Section>

                    <Section title="7. Your Rights">
                        <ThemedText style={styles.bodyText}>
                            Depending on your location, you may have the following rights:
                        </ThemedText>
                        <ThemedText style={styles.bulletItem}>• <ThemedText type="defaultSemiBold">Access:</ThemedText> Request a copy of the personal data we hold about you.</ThemedText>
                        <ThemedText style={styles.bulletItem}>• <ThemedText type="defaultSemiBold">Correction:</ThemedText> Request that we correct inaccurate or incomplete data.</ThemedText>
                        <ThemedText style={styles.bulletItem}>• <ThemedText type="defaultSemiBold">Deletion:</ThemedText> Request that we delete your personal data.</ThemedText>
                        <ThemedText style={styles.bulletItem}>• <ThemedText type="defaultSemiBold">Portability:</ThemedText> Request a machine-readable copy of your data.</ThemedText>
                        <ThemedText style={styles.bulletItem}>• <ThemedText type="defaultSemiBold">Objection:</ThemedText> Object to certain types of data processing.</ThemedText>
                        <ThemedText style={styles.bodyText}>
                            To exercise any of these rights, please contact us at {COMPANY_EMAIL}.
                        </ThemedText>
                    </Section>

                    <Section title="8. Children&apos;s Privacy">
                        <ThemedText style={styles.bodyText}>
                            Mindora is not directed to children under the age of 13. We do not knowingly collect personal information from children under 13. If you become aware that a child has provided us with personal information, please contact us at {COMPANY_EMAIL} so we can take appropriate action.
                        </ThemedText>
                    </Section>

                    <Section title="9. Third-Party Services">
                        <ThemedText style={styles.bodyText}>
                            Our app may contain links to third-party websites or services that are not operated by us. We strongly advise you to review the Privacy Policy of every site you visit. We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party sites or services.
                        </ThemedText>
                    </Section>

                    <Section title="10. Changes to This Policy">
                        <ThemedText style={styles.bodyText}>
                            We may update this Privacy Policy from time to time. We will notify you of significant changes by posting the new policy within the app and updating the &quot;Last Updated&quot; date above. Your continued use of Mindora after any changes constitutes your acceptance of the updated policy.
                        </ThemedText>
                    </Section>

                    <Section title="11. Contact Us">
                        <ThemedText style={styles.bodyText}>
                            If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us at:
                        </ThemedText>
                        <ThemedText style={styles.bulletItem}>
                            📧 <ThemedText type="defaultSemiBold">{COMPANY_EMAIL}</ThemedText>
                        </ThemedText>
                        <ThemedText style={styles.bulletItem}>
                            🌐 <ThemedText type="defaultSemiBold">https://mindora.app/privacy</ThemedText>
                        </ThemedText>
                    </Section>

                    <View style={styles.footer}>
                        <ThemedText style={styles.footerText}>
                            © {new Date().getFullYear()} {COMPANY_NAME}. All rights reserved.
                        </ThemedText>
                    </View>
                </ScrollView>
            </ThemedView>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 48,
    },
    heading: {
        marginBottom: 4,
    },
    lastUpdated: {
        opacity: 0.6,
        fontSize: 13,
        marginBottom: 16,
    },
    intro: {
        lineHeight: 24,
        marginBottom: 24,
    },
    section: {
        marginBottom: 28,
        gap: 8,
    },
    sectionTitle: {
        fontSize: 17,
        marginBottom: 4,
        color: '#0a7ea4',
    },
    bodyText: {
        lineHeight: 24,
    },
    bulletItem: {
        lineHeight: 24,
        paddingLeft: 8,
    },
    footer: {
        marginTop: 20,
        paddingTop: 20,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: 'rgba(150,150,150,0.3)',
        alignItems: 'center',
    },
    footerText: {
        opacity: 0.5,
        fontSize: 12,
    },
});
