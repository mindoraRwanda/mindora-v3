import { Link, Stack } from 'expo-router';
import { StyleSheet, View, TouchableOpacity } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function NotFoundScreen() {
    return (
        <>
            <Stack.Screen options={{ title: 'Lost in Mindora?' }} />
            <ThemedView style={styles.container}>
                <View style={styles.content}>
                    <View style={styles.iconCircle}>
                        <IconSymbol name="book.fill" size={48} color="#6D28D9" />
                    </View>
                    <ThemedText type="title" style={styles.code}>404</ThemedText>
                    <ThemedText type="subtitle" style={styles.title}>Something is missing</ThemedText>
                    <ThemedText style={styles.description}>
                        We couldn't find the page you're looking for. Let's get you back on track.
                    </ThemedText>
                    
                    <Link href="/" asChild>
                        <TouchableOpacity style={styles.button}>
                             <ThemedText style={styles.buttonText}>Return Home</ThemedText>
                        </TouchableOpacity>
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
        padding: 24,
    },
    content: {
        alignItems: 'center',
        maxWidth: 300,
    },
    iconCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(109, 40, 217, 0.05)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    code: {
        fontSize: 64,
        fontWeight: 'bold',
        color: '#6D28D9',
        letterSpacing: -2,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    description: {
        textAlign: 'center',
        opacity: 0.5,
        lineHeight: 22,
        marginBottom: 32,
    },
    button: {
        backgroundColor: '#6D28D9',
        paddingHorizontal: 32,
        paddingVertical: 14,
        borderRadius: 14,
        shadowColor: '#6D28D9',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
