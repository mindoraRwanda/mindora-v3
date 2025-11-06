import { Colors } from '@/constants/theme';
import { useThemeColorScheme } from '@/hooks/use-theme-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HelpScreen() {
    const colorScheme = useThemeColorScheme();
    const colors = Colors[colorScheme ?? 'light'];

    const emergencyContacts = [
        {
            title: 'Rwanda National Police',
            number: '112',
            description: 'Emergency police services',
            icon: 'shield-checkmark' as const,
        },
        {
            title: 'Emergency Medical Services',
            number: '912',
            description: 'Medical emergencies',
            icon: 'medical' as const,
        },
        {
            title: 'Mental Health Crisis Line',
            number: '+250 788 123 456',
            description: '24/7 mental health support',
            icon: 'heart' as const,
        },
        {
            title: 'Suicide Prevention Hotline',
            number: '+250 788 654 321',
            description: 'Immediate crisis intervention',
            icon: 'call' as const,
        },
    ];

    const handleCall = (number: string) => {
        Linking.openURL(`tel:${number}`);
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Emergency Help</Text>
            </View>

            <ScrollView style={styles.content}>
                <View style={[styles.alertCard, { backgroundColor: colors.error + '10', borderColor: colors.error + '30' }]}>
                    <View style={[styles.alertIcon, { backgroundColor: colors.error }]}>
                        <Ionicons name="warning" size={24} color="#FFFFFF" />
                    </View>
                    <View style={styles.alertContent}>
                        <Text style={[styles.alertTitle, { color: colors.error }]}>Crisis Support</Text>
                        <Text style={[styles.alertText, { color: colors.text }]}>
                            If you're experiencing a mental health crisis or having thoughts of self-harm,
                            please reach out for immediate help using the contacts below.
                        </Text>
                    </View>
                </View>

                <Text style={[styles.sectionTitle, { color: colors.text }]}>Emergency Contacts</Text>

                {emergencyContacts.map((contact, index) => (
                    <TouchableOpacity
                        key={index}
                        style={[styles.contactCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                        onPress={() => handleCall(contact.number)}
                    >
                        <View style={[styles.contactIcon, { backgroundColor: colors.primary + '20' }]}>
                            <Ionicons name={contact.icon} size={24} color={colors.primary} />
                        </View>
                        <View style={styles.contactInfo}>
                            <Text style={[styles.contactTitle, { color: colors.text }]}>{contact.title}</Text>
                            <Text style={[styles.contactNumber, { color: colors.primary }]}>{contact.number}</Text>
                            <Text style={[styles.contactDescription, { color: colors.icon }]}>{contact.description}</Text>
                        </View>
                        <Ionicons name="call" size={20} color={colors.primary} />
                    </TouchableOpacity>
                ))}

                <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
                    <Text style={[styles.infoTitle, { color: colors.text }]}>When to Seek Help</Text>
                    <View style={styles.infoList}>
                        <View style={styles.infoItem}>
                            <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                            <Text style={[styles.infoText, { color: colors.text }]}>
                                Thoughts of self-harm or suicide
                            </Text>
                        </View>
                        <View style={styles.infoItem}>
                            <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                            <Text style={[styles.infoText, { color: colors.text }]}>
                                Severe anxiety or panic attacks
                            </Text>
                        </View>
                        <View style={styles.infoItem}>
                            <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                            <Text style={[styles.infoText, { color: colors.text }]}>
                                Inability to cope with daily activities
                            </Text>
                        </View>
                        <View style={styles.infoItem}>
                            <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                            <Text style={[styles.infoText, { color: colors.text }]}>
                                Substance abuse or addiction
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
                    <Text style={[styles.infoTitle, { color: colors.text }]}>Remember</Text>
                    <Text style={[styles.reminderText, { color: colors.text }]}>
                        You are not alone. Mental health struggles are common and treatable.
                        Seeking help is a sign of strength, not weakness. Professional support
                        is available 24/7 in Rwanda.
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        gap: 16,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    alertCard: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 24,
    },
    alertIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    alertContent: {
        flex: 1,
    },
    alertTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    alertText: {
        fontSize: 14,
        lineHeight: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    contactCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 12,
    },
    contactIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    contactInfo: {
        flex: 1,
    },
    contactTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 2,
    },
    contactNumber: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    contactDescription: {
        fontSize: 12,
    },
    infoCard: {
        padding: 20,
        borderRadius: 12,
        marginTop: 24,
        marginBottom: 16,
    },
    infoTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 16,
    },
    infoList: {
        gap: 12,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
    },
    infoText: {
        fontSize: 14,
        flex: 1,
        lineHeight: 20,
    },
    reminderText: {
        fontSize: 14,
        lineHeight: 22,
        textAlign: 'center',
    },
});