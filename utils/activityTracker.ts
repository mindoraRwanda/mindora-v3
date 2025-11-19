import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Activity {
    id: string;
    type: 'session' | 'exercise' | 'mood' | 'appointment';
    title: string;
    description: string;
    timestamp: string;
    icon: string;
    color: string;
}

const STORAGE_KEY = '@mindora_activities';

export async function logActivity(
    userId: string,
    type: Activity['type'],
    title: string,
    description: string,
    icon: string = 'checkmark-circle',
    color: string = '#10B981'
) {
    try {
        const activitiesString = await AsyncStorage.getItem(STORAGE_KEY);
        const allActivities = activitiesString ? JSON.parse(activitiesString) : {};

        const userActivities = allActivities[userId] || [];

        const newActivity: Activity = {
            id: `activity-${Date.now()}`,
            type,
            title,
            description,
            timestamp: new Date().toISOString(),
            icon,
            color,
        };

        userActivities.unshift(newActivity);

        // Keep only last 50 activities
        if (userActivities.length > 50) {
            userActivities.pop();
        }

        allActivities[userId] = userActivities;
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(allActivities));
    } catch (error) {
        console.error('Error logging activity:', error);
    }
}

export async function getUserActivities(userId: string): Promise<Activity[]> {
    try {
        const activitiesString = await AsyncStorage.getItem(STORAGE_KEY);
        const allActivities = activitiesString ? JSON.parse(activitiesString) : {};
        return allActivities[userId] || [];
    } catch (error) {
        console.error('Error getting activities:', error);
        return [];
    }
}

export async function clearUserActivities(userId: string) {
    try {
        const activitiesString = await AsyncStorage.getItem(STORAGE_KEY);
        const allActivities = activitiesString ? JSON.parse(activitiesString) : {};
        delete allActivities[userId];
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(allActivities));
    } catch (error) {
        console.error('Error clearing activities:', error);
    }
}
