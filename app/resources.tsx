import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Card } from '@/components/ui/card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useLocale } from '@/context/LocaleContext';
import { Colors, Elevation, Radius, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

// There's no CMS or resources endpoint on any backend service, so this is a small
// curated set of psychoeducation guides bundled directly into the app.
const GUIDE_KEYS = ['anxiety', 'sleep', 'stress', 'support', 'relationships'] as const;

export default function ResourcesScreen() {
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const { t } = useLocale();

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: Spacing.xl, paddingBottom: insets.bottom + 40 }}>
        <View style={[styles.iconCircle, { backgroundColor: colors.tintSolid, shadowColor: colors.tintSolid }]}>
          <IconSymbol size={48} color="#fff" name="book.fill" />
        </View>
        <ThemedText style={[styles.headerTitle, { color: colors.tint }]}>{t('resources.title')}</ThemedText>
        <ThemedText style={[styles.introText, { color: colors.textMuted }]}>{t('resources.intro')}</ThemedText>

        {GUIDE_KEYS.map((key) => (
          <Card key={key} style={[styles.resourceCard, { backgroundColor: colors.tintSoft, borderColor: colors.border }]}>
            <View style={[styles.categoryBadge, { backgroundColor: colors.surface }]}>
              <ThemedText style={[styles.categoryText, { color: colors.tint }]}>
                {t(`resources.${key}Category` as any).toUpperCase()}
              </ThemedText>
            </View>
            <ThemedText type="defaultSemiBold" style={styles.resourceTitle}>{t(`resources.${key}Title` as any)}</ThemedText>
            <ThemedText style={[styles.description, { color: colors.textMuted }]}>{t(`resources.${key}Description` as any)}</ThemedText>
          </Card>
        ))}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
    ...Elevation.lg,
  },
  headerTitle: { ...Typography.h1, fontSize: 26, textAlign: 'center' },
  introText: { fontSize: 15, lineHeight: 22, textAlign: 'center', marginTop: Spacing.sm, marginBottom: Spacing.xxl, paddingHorizontal: Spacing.sm },
  resourceCard: { marginBottom: Spacing.md + 2 },
  categoryBadge: { alignSelf: 'flex-start', paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: Radius.sm, marginBottom: Spacing.sm },
  categoryText: { fontSize: 10, fontWeight: '700' },
  resourceTitle: { fontSize: 17, marginBottom: Spacing.sm },
  description: { lineHeight: 20, fontSize: 14 },
});
