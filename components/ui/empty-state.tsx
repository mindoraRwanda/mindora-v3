import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol, type IconSymbolName } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function EmptyState({
  icon,
  title,
  message,
}: {
  icon: IconSymbolName;
  title: string;
  message?: string;
}) {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  return (
    <View style={styles.container}>
      <View style={[styles.iconCircle, { backgroundColor: colors.tintSoft }]}>
        <IconSymbol name={icon} size={32} color={colors.tint} />
      </View>
      <ThemedText type="defaultSemiBold" style={styles.title}>
        {title}
      </ThemedText>
      {message ? (
        <ThemedText style={[styles.message, { color: colors.textMuted }]}>{message}</ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', padding: 32, gap: 8 },
  iconCircle: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  title: { fontSize: 16, textAlign: 'center' },
  message: { fontSize: 13, textAlign: 'center', lineHeight: 19 },
});
