import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function ScreenHeader({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  return (
    <View style={styles.row}>
      <View style={styles.textCol}>
        <ThemedText type="title">{title}</ThemedText>
        {subtitle ? <ThemedText style={[styles.subtitle, { color: colors.textMuted }]}>{subtitle}</ThemedText> : null}
      </View>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 20 },
  textCol: { flex: 1 },
  subtitle: { fontSize: 14, marginTop: 4 },
});
