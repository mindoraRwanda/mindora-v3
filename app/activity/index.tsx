import { Card } from '@/components/ui/Card';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useThemeColorScheme } from '@/hooks/use-theme-color-scheme';
import { Activity, getUserActivities } from '@/utils/activityTracker';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ActivityScreen() {
    const colorScheme = useThemeColorScheme();
    const colors = Colors[colorScheme ?? 'light'];
    const { user } = useAuth();
    const [activities, setActivities] = useState<Activity[]>([]);

    useEffect(() => {
        loadActivities();
    }, []);

    const loadActivities = async () => {
        if (user) {
            const userActivities = await getUserActivities(user.id);
            setActivities(userActivities);
        }
    };

    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>Activity Feed</Text>
                    <View style={{ width: 24 }} />
                </View>

                {/* Activities */}
                <View style={styles.content}>
                    {activities.length === 0 ? (
                        <Card>
                            <View style={styles.emptyState}>
                                <Ionicons name="time-outline" size={48} color={colors.icon} />
                                <Text style={[styles.emptyTitle, { color: colors.text }]}>No Activity Yet</Text>
                                <Text style={[styles.emptyText, { color: colors.icon }]}>
                                    Your activities will appear here as you use the app
                                </Text>
                            </View>
                        </Card>
                    ) : (
                        activities.map((activity) => (
                            <Card key={activity.id} style={styles.activityCard}>
                                <View style={styles.activityItem}>
                                    <View style={[styles.activityIcon, { backgroundColor: activity.color + '20' }]}>
                                        <Ionicons name={activity.icon as any} size={24} color={activity.color} />
                                    </View>
                                    <View style={styles.activityContent}>
                                        <Text style={[styles.activityTitle, { color: colors.text }]}>
                                            {activity.title}
                                        </Text>
                                        <Text style={[styles.activityDescription, { color: colors.icon }]}>
                                            {activity.description}
                                        </Text>
                                        <Text style={[styles.activityTime, { color: colors.icon }]}>
                                            {formatTimestamp(activity.timestamp)}
                                        </Text>
                                    </View>
                                </View>
                            </Card>
                        ))
                    )}
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
    content: {
        paddingHorizontal: 20,
    },
    activityCard: {
        marginBottom: 12,
    },
    activityItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    activityIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    activityContent: {
        flex: 1,
    },
    activityTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    activityDescription: {
        fontSize: 14,
        marginBottom: 4,
        lineHeight: 20,
    },
    activityTime: {
        fontSize: 12,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginTop: 16,
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 14,
        textAlign: 'center',
    },
});
