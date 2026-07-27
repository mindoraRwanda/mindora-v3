import { ActivityIndicator, StyleSheet, TouchableOpacity, type TouchableOpacityProps } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { Colors, Radius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'md' | 'lg';

interface ButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  title: string;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  haptic?: boolean;
  style?: TouchableOpacityProps['style'];
}

export function Button({
  title,
  variant = 'primary',
  size = 'lg',
  loading = false,
  haptic = true,
  disabled,
  onPress,
  style,
  ...rest
}: ButtonProps) {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const isDisabled = disabled || loading;

  const backgroundColor = {
    primary: colors.tintSolid,
    secondary: colors.tintSoft,
    ghost: 'transparent',
    danger: colors.danger,
  }[variant];

  const textColor = {
    primary: '#fff',
    secondary: colors.tint,
    ghost: colors.tint,
    danger: '#fff',
  }[variant];

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={isDisabled}
      onPress={(e) => {
        if (haptic) Haptics.selectionAsync();
        onPress?.(e);
      }}
      style={[
        styles.base,
        size === 'lg' ? styles.lg : styles.md,
        { backgroundColor },
        isDisabled && styles.disabled,
        style,
      ]}
      {...rest}>
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <ThemedText style={[styles.text, { color: textColor }]}>{title}</ThemedText>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  lg: { height: 56, paddingHorizontal: 24 },
  md: { height: 44, paddingHorizontal: 18 },
  disabled: { opacity: 0.5 },
  text: { fontSize: 16, fontWeight: '700' },
});
