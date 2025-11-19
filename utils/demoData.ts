import AsyncStorage from '@react-native-async-storage/async-storage';

const DEMO_USERS = [
    {
        email: 'demo@mindora.com',
        password: 'demo123',
        user: {
            id: 'user-demo-1',
            name: 'Sarah Johnson',
            email: 'demo@mindora.com',
            phone: '+250 788 123 456',
            location: 'Kigali, Rwanda',
            avatar: 'https://ui-avatars.com/api/?name=Sarah+Johnson&size=150&background=8B5CF6',
            memberSince: 'January 2024',
            hasCompletedOnboarding: true,
            stats: {
                sessions: 24,
                exercises: 67,
                dayStreak: 12,
            },
        },
    },
    {
        email: 'john@example.com',
        password: 'password123',
        user: {
            id: 'user-demo-2',
            name: 'John Doe',
            email: 'john@example.com',
            phone: '+250 788 987 654',
            location: 'Nairobi, Kenya',
            avatar: 'https://ui-avatars.com/api/?name=John+Doe&size=150&background=10B981',
            memberSince: 'March 2024',
            hasCompletedOnboarding: true,
            stats: {
                sessions: 15,
                exercises: 42,
                dayStreak: 5,
            },
        },
    },
];

export async function seedDemoData() {
    try {
        const usersDbString = await AsyncStorage.getItem('@mindora_users_db');
        const usersDb = usersDbString ? JSON.parse(usersDbString) : {};

        // Add demo users if they don't exist
        let hasChanges = false;
        DEMO_USERS.forEach(demoUser => {
            if (!usersDb[demoUser.email]) {
                usersDb[demoUser.email] = demoUser;
                hasChanges = true;
            }
        });

        if (hasChanges) {
            await AsyncStorage.setItem('@mindora_users_db', JSON.stringify(usersDb));
            console.log('Demo data seeded successfully');
        }
    } catch (error) {
        console.error('Error seeding demo data:', error);
    }
}

export function getDemoCredentials() {
    return {
        email: 'demo@mindora.com',
        password: 'demo123',
    };
}
