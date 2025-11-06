import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Colors } from '@/constants/theme';
import { currentUser } from '@/constants/UserData';
import { useThemeColorScheme } from '@/hooks/use-theme-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
    const colorScheme = useThemeColorScheme();
    const colors = Colors[colorScheme ?? 'light'];

    const menuItems = [
        {
            icon: 'analytics-outline',
            title: 'Progress Dashboard',
            subtitle: 'View your mental health insights',
            onPress: () => router.push('/dashboard'),
        },
        {
            icon: 'person-outline',
            title: 'Edit Profile',
            subtitle: 'Update your personal information',
            onPress: () => Alert.alert('Edit Profile', 'Profile editing would be implemented here'),
        },
        {
            icon: 'calendar-outline',
            title: 'My Appointments',
            subtitle: 'View and manage your appointments',
            onPress: () => router.push('/appointments'),
        },
        {
            icon: 'heart-outline',
            title: 'Health Records',
            subtitle: 'Access your mental health records',
            onPress: () => Alert.alert('Health Records', 'Health records would be implemented here'),
        },
        {
            icon: 'notifications-outline',
            title: 'Notifications',
            subtitle: 'Manage your notification preferences',
            onPress: () => Alert.alert('Notifications', 'Notification settings would be implemented here'),
        },
        {
            icon: 'shield-outline',
            title: 'Privacy & Security',
            subtitle: 'Control your privacy settings',
            onPress: () => Alert.alert('Privacy', 'Privacy settings would be implemented here'),
        },
        {
            icon: 'help-circle-outline',
            title: 'Help & Support',
            subtitle: 'Get help and contact support',
            onPress: () => router.push('/help'),
        },
    ];

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: () => router.replace('/(auth)/login')
                }
            ]
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={[styles.title, { color: colors.text }]}>Profile</Text>
                    <TouchableOpacity onPress={() => router.push('/settings')}>
                        <Ionicons name="settings-outline" size={24} color={colors.icon} />
                    </TouchableOpacity>
                </View>

                {/* Profile Info */}
                <View style={styles.section}>
                    <Card>
                        <View style={styles.profileInfo}>
                            <Avatar
                                source={currentUser.avatar}
                                name={currentUser.name}
                                size={80}
                            />
                            <View style={styles.userInfo}>
                                <Text style={[styles.userName, { color: colors.text }]}>{currentUser.name}</Text>
                                <Text style={[styles.userEmail, { color: colors.icon }]}>{currentUser.email}</Text>
                                <Text style={[styles.memberSince, { color: colors.icon }]}>Member since {currentUser.memberSince}</Text>
                            </View>
                        </View>
                    </Card>
                </View>

                {/* Stats */}
                <View style={styles.section}>
                    <Card>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Progress</Text>
                        <View style={styles.statsContainer}>
                            <View style={styles.stat}>
                                <Text style={[styles.statNumber, { color: colors.primary }]}>{currentUser.stats.sessions}</Text>
                                <Text style={[styles.statLabel, { color: colors.icon }]}>Sessions</Text>
                            </View>
                            <View style={styles.stat}>
                                <Text style={[styles.statNumber, { color: colors.success }]}>{currentUser.stats.exercises}</Text>
                                <Text style={[styles.statLabel, { color: colors.icon }]}>Exercises</Text>
                            </View>
                            <View style={styles.stat}>
                                <Text style={[styles.statNumber, { color: colors.warning }]}>{currentUser.stats.dayStreak}</Text>
                                <Text style={[styles.statLabel, { color: colors.icon }]}>Day Streak</Text>
                            </View>
                        </View>
                    </Card>
                </View>

                {/* Menu Items */}
                <View style={styles.section}>
                    {menuItems.map((item, index) => (
                        <Card key={index} style={styles.menuCard}>
                            <TouchableOpacity style={styles.menuItem} onPress={item.onPress}>
                                <View style={[styles.menuIcon, { backgroundColor: colors.primary + '20' }]}>
                                    <Ionicons name={item.icon as any} size={24} color={colors.primary} />
                                </View>
                                <View style={styles.menuContent}>
                                    <Text style={[styles.menuTitle, { color: colors.text }]}>{item.title}</Text>
                                    <Text style={[styles.menuSubtitle, { color: colors.icon }]}>{item.subtitle}</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color={colors.icon} />
                            </TouchableOpacity>
                        </Card>
                    ))}
                </View>



                {/* Emergency Contact */}
                <View style={styles.section}>
                    <Card style={[styles.emergencyCard, { backgroundColor: colors.error + '10' }]}>
                        <View style={styles.emergencyHeader}>
                            <Ionicons name="warning" size={24} color={colors.error} />
                            <Text style={[styles.emergencyTitle, { color: colors.error }]}>Emergency Support</Text>
                        </View>
                        <Text style={[styles.emergencyText, { color: colors.text }]}>
                            If you're in crisis, please reach out for immediate help.
                        </Text>
                        <Button
                            title="Call Crisis Hotline"
                            onPress={() => Alert.alert('Crisis Hotline', 'Calling crisis hotline...')}
                            variant="outline"
                            style={[styles.emergencyButton, { borderColor: colors.error }]}
                        />
                    </Card>
                </View>

                {/* Logout */}
                <View style={styles.section}>
                    <Button
                        title="Logout"
                        onPress={handleLogout}
                        variant="outline"
                        style={[styles.logoutButton, { borderColor: colors.error }]}
                    />
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
        paddingBottom: 10,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
    },
    section: {
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 16,
    },
    profileInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    userInfo: {
        marginLeft: 20,
        flex: 1,
    },
    userName: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 14,
        marginBottom: 4,
    },
    memberSince: {
        fontSize: 12,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    stat: {
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
    },
    menuCard: {
        marginBottom: 8,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    menuIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    menuContent: {
        flex: 1,
    },
    menuTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 2,
    },
    menuSubtitle: {
        fontSize: 14,
    },
    emergencyCard: {
        borderWidth: 1,
        borderColor: 'transparent',
    },
    emergencyHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    emergencyTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    emergencyText: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 16,
    },
    emergencyButton: {
        marginTop: 8,
    },
    logoutButton: {
        marginBottom: 20,
    },

});