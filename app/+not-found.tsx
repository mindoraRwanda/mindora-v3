import { Link, Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function NotFoundScreen() {
    return (
        <>
            <Stack.Screen options={{ title: 'Page Not Found' }} />
            <ThemedView style={styles.container}>
                <View style={styles.content}>
                    <ThemedText type="title" style={styles.code}>404</ThemedText>
                    <ThemedText type="subtitle" style={styles.title}>Page Not Found</ThemedText>
                    <ThemedText style={styles.description}>
                        The screen you are looking for does not exist or may have been moved.
                    </ThemedText>
                    <Link href="/" style={styles.link}>
                        <ThemedText type="link">Go to Home Screen</ThemedText>
                    </Link>
                </View>
            </ThemedView>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    content: {
        alignItems: 'center',
        gap: 12,
        maxWidth: 320,
    },
    code: {
        fontSize: 80,
        fontWeight: 'bold',
        color: '#0a7ea4',
        lineHeight: 90,
    },
    title: {
        textAlign: 'center',
    },
    description: {
        textAlign: 'center',
        opacity: 0.7,
        lineHeight: 22,
    },
    link: {
        marginTop: 12,
    },
});
