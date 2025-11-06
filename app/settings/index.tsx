import { Card } from '@/components/ui/Card';
import { Colors } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { useThemeColorScheme } from '@/hooks/use-theme-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SettingsScreen() {
    const colorScheme = useThemeColorScheme();
    const colors = Colors[colorScheme ?? 'light'];
    const { themeMode, setThemeMode } = useTheme();

    const [notifications, setNotifications] = useState(true);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [biometricEnabled, setBiometricEnabled] = useState(false);
    const [dataSharing, setDataSharing] = useState(false);

    const themeOptions = [
        { id: 'light', name: 'Light', icon: 'sunny' },
        { id: 'dark', name: 'Dark', icon: 'moon' },
        { id: 'system', name: 'System', icon: 'phone-portrait' },
    ];

    const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
        setThemeMode(theme);
        Alert.alert('Theme Changed', `Theme set to ${theme}`);
    };

    const settingSections = [
        {
            title: 'Appearance',
            items: [
                {
                    icon: 'color-palette',
                    title: 'Theme',
                    subtitle: 'Choose your preferred theme',
                    type: 'theme',
                },
            ],
        },
        {
            title: 'Notifications',
            items: [
                {
                    icon: 'notifications',
                    title: 'Push Notifications',
                    subtitle: 'Receive appointment reminders and updates',
                    type: 'switch',
                    value: notifications,
                    onToggle: setNotifications,
                },
                {
                    icon: 'volume-high',
                    title: 'Sound',
                    subtitle: 'Enable notification sounds',
                    type: 'switch',
                    value: soundEnabled,
                    onToggle: setSoundEnabled,
                },
            ],
        },
        {
            title: 'Security',
            items: [
                {
                    icon: 'finger-print',
                    title: 'Biometric Login',
                    subtitle: 'Use fingerprint or face ID to login',
                    type: 'switch',
                    value: biometricEnabled,
                    onToggle: setBiometricEnabled,
                },
                {
                    icon: 'lock-closed',
                    title: 'Change Password',
                    subtitle: 'Update your account password',
                    type: 'navigation',
                    onPress: () => Alert.alert('Change Password', 'Password change would be implemented here'),
                },
            ],
        },
        {
            title: 'Privacy',
            items: [
                {
                    icon: 'shield-checkmark',
                    title: 'Data Sharing',
                    subtitle: 'Share anonymous data to improve services',
                    type: 'switch',
                    value: dataSharing,
                    onToggle: setDataSharing,
                },
                {
                    icon: 'document-text',
                    title: 'Privacy Policy',
                    subtitle: 'Read our privacy policy',
                    type: 'navigation',
                    onPress: () => Alert.alert('Privacy Policy', 'Privacy policy would be displayed here'),
                },
                {
                    icon: 'information-circle',
                    title: 'Terms of Service',
                    subtitle: 'Read our terms of service',
                    type: 'navigation',
                    onPress: () => Alert.alert('Terms of Service', 'Terms would be displayed here'),
                },
            ],
        },
        {
            title: 'Support',
            items: [
                {
                    icon: 'help-circle',
                    title: 'Help Center',
                    subtitle: 'Get help and support',
                    type: 'navigation',
                    onPress: () => Alert.alert('Help Center', 'Help center would be implemented here'),
                },
                {
                    icon: 'mail',
                    title: 'Contact Us',
                    subtitle: 'Send us feedback or report issues',
                    type: 'navigation',
                    onPress: () => Alert.alert('Contact Us', 'Contact form would be implemented here'),
                },
                {
                    icon: 'star',
                    title: 'Rate App',
                    subtitle: 'Rate Mindora on the app store',
                    type: 'navigation',
                    onPress: () => Alert.alert('Rate App', 'App store rating would be implemented here'),
                },
            ],
        },
        {
            title: 'Account',
            items: [
                {
                    icon: 'download',
                    title: 'Export Data',
                    subtitle: 'Download your personal data',
                    type: 'navigation',
                    onPress: () => Alert.alert('Export Data', 'Data export would be implemented here'),
                },
                {
                    icon: 'trash',
                    title: 'Delete Account',
                    subtitle: 'Permanently delete your account',
                    type: 'navigation',
                    onPress: () => {
                        Alert.alert(
                            'Delete Account',
                            'Are you sure you want to delete your account? This action cannot be undone.',
                            [
                                { text: 'Cancel', style: 'cancel' },
                                { text: 'Delete', style: 'destructive', onPress: () => Alert.alert('Account Deleted', 'Your account has been deleted.') }
                            ]
                        );
                    },
                },
            ],
        },
    ];

    const renderSettingItem = (item: any) => {
        switch (item.type) {
            case 'theme':
                return (
                    <View>
                        <View style={styles.settingHeader}>
                            <View style={[styles.settingIcon, { backgroundColor: colors.primary + '20' }]}>
                                <Ionicons name={item.icon as any} size={20} color={colors.primary} />
                            </View>
                            <View style={styles.settingContent}>
                                <Text style={[styles.settingTitle, { color: colors.text }]}>{item.title}</Text>
                                <Text style={[styles.settingSubtitle, { color: colors.icon }]}>{item.subtitle}</Text>
                            </View>
                        </View>
                        <View style={styles.themeOptions}>
                            {themeOptions.map((theme) => (
                                <TouchableOpacity
                                    key={theme.id}
                                    style={[
                                        styles.themeOption,
                                        {
                                            backgroundColor: themeMode === theme.id ? colors.primary + '20' : colors.secondary,
                                            borderColor: themeMode === theme.id ? colors.primary : colors.border,
                                        },
                                    ]}
                                    onPress={() => handleThemeChange(theme.id as any)}
                                >
                                    <Ionicons
                                        name={theme.icon as any}
                                        size={20}
                                        color={themeMode === theme.id ? colors.primary : colors.icon}
                                    />
                                    <Text
                                        style={[
                                            styles.themeOptionText,
                                            { color: themeMode === theme.id ? colors.primary : colors.text },
                                        ]}
                                    >
                                        {theme.name}
                                    </Text>
                                    {themeMode === theme.id && (
                                        <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                );

            case 'switch':
                return (
                    <View style={styles.settingItem}>
                        <View style={[styles.settingIcon, { backgroundColor: colors.primary + '20' }]}>
                            <Ionicons name={item.icon as any} size={20} color={colors.primary} />
                        </View>
                        <View style={styles.settingContent}>
                            <Text style={[styles.settingTitle, { color: colors.text }]}>{item.title}</Text>
                            <Text style={[styles.settingSubtitle, { color: colors.icon }]}>{item.subtitle}</Text>
                        </View>
                        <Switch
                            value={item.value}
                            onValueChange={item.onToggle}
                            trackColor={{ false: colors.border, true: colors.primary + '40' }}
                            thumbColor={item.value ? colors.primary : colors.icon}
                        />
                    </View>
                );

            case 'navigation':
                return (
                    <TouchableOpacity style={styles.settingItem} onPress={item.onPress}>
                        <View style={[styles.settingIcon, { backgroundColor: colors.primary + '20' }]}>
                            <Ionicons name={item.icon as any} size={20} color={colors.primary} />
                        </View>
                        <View style={styles.settingContent}>
                            <Text style={[styles.settingTitle, { color: colors.text }]}>{item.title}</Text>
                            <Text style={[styles.settingSubtitle, { color: colors.icon }]}>{item.subtitle}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={colors.icon} />
                    </TouchableOpacity>
                );

            default:
                return null;
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>Settings</Text>
                    <View style={{ width: 24 }} />
                </View>

                {/* Settings Sections */}
                {settingSections.map((section, sectionIndex) => (
                    <View key={sectionIndex} style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>{section.title}</Text>
                        <Card>
                            {section.items.map((item, itemIndex) => (
                                <View key={itemIndex}>
                                    {renderSettingItem(item)}
                                    {itemIndex < section.items.length - 1 && (
                                        <View style={[styles.separator, { backgroundColor: colors.border }]} />
                                    )}
                                </View>
                            ))}
                        </Card>
                    </View>
                ))}

                {/* App Info */}
                <View style={styles.section}>
                    <Card>
                        <View style={styles.appInfo}>
                            <Text style={[styles.appName, { color: colors.text }]}>Mindora</Text>
                            <Text style={[styles.appVersion, { color: colors.icon }]}>Version 1.0.0</Text>
                            <Text style={[styles.appDescription, { color: colors.icon }]}>
                                Your mental health companion
                            </Text>
                        </View>
                    </Card>
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
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '600',
    },
    section: {
        paddingHorizontal: 20,
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },
    settingHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },
    settingIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    settingContent: {
        flex: 1,
    },
    settingTitle: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 2,
    },
    settingSubtitle: {
        fontSize: 14,
    },
    separator: {
        height: 1,
        marginLeft: 56,
    },
    themeOptions: {
        marginTop: 12,
        gap: 8,
    },
    themeOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        gap: 12,
    },
    themeOptionText: {
        fontSize: 16,
        fontWeight: '500',
        flex: 1,
    },
    appInfo: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    appName: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    appVersion: {
        fontSize: 14,
        marginBottom: 8,
    },
    appDescription: {
        fontSize: 14,
        textAlign: 'center',
    },
});