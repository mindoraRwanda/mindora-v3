import { Link, Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useLocale } from '@/context/LocaleContext';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function NotFoundScreen() {
    const scheme = useColorScheme() ?? 'light';
    const colors = Colors[scheme];
    const { t } = useLocale();
    return (
        <>
            <Stack.Screen options={{ title: t('stackTitles.notFound') }} />
            <ThemedView style={styles.container}>
                <View style={styles.content}>
                    <View style={[styles.iconCircle, { backgroundColor: colors.tintSoft }]}>
                        <IconSymbol name="book.fill" size={48} color={colors.tint} />
                    </View>
                    <ThemedText type="title" style={[styles.code, { color: colors.tint }]}>{t('notFound.code')}</ThemedText>
                    <ThemedText type="subtitle" style={styles.title}>{t('notFound.title')}</ThemedText>
                    <ThemedText style={[styles.description, { color: colors.textMuted }]}>{t('notFound.description')}</ThemedText>

                    <Link href="/" asChild>
                        <Button title={t('notFound.returnHome')} />
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
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    code: {
        fontSize: 64,
        letterSpacing: -2,
    },
    title: {
        fontSize: 22,
        marginBottom: 8,
    },
    description: {
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 32,
    },
});
