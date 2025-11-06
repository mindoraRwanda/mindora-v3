import { Colors } from '@/constants/theme';
import { useThemeColorScheme } from '@/hooks/use-theme-color-scheme';
import React from 'react';
import { Text, TextStyle, TouchableOpacity, ViewStyle } from 'react-native';

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'outline';
    size?: 'small' | 'medium' | 'large';
    disabled?: boolean;
    style?: ViewStyle;
}

export function Button({
    title,
    onPress,
    variant = 'primary',
    size = 'medium',
    disabled = false,
    style
}: ButtonProps) {
    const colorScheme = useThemeColorScheme();
    const colors = Colors[colorScheme ?? 'light'];

    const getButtonStyle = (): ViewStyle => {
        const baseStyle: ViewStyle = {
            borderRadius: 12,
            alignItems: 'center',
            justifyContent: 'center',
        };

        const sizeStyles = {
            small: { paddingVertical: 8, paddingHorizontal: 16 },
            medium: { paddingVertical: 12, paddingHorizontal: 24 },
            large: { paddingVertical: 16, paddingHorizontal: 32 },
        };

        const variantStyles = {
            primary: {
                backgroundColor: disabled ? '#D1D5DB' : colors.primary,
            },
            secondary: {
                backgroundColor: disabled ? '#F3F4F6' : colors.secondary,
                borderWidth: 1,
                borderColor: colors.border,
            },
            outline: {
                backgroundColor: 'transparent',
                borderWidth: 2,
                borderColor: disabled ? '#D1D5DB' : colors.primary,
            },
        };

        return {
            ...baseStyle,
            ...sizeStyles[size],
            ...variantStyles[variant],
        };
    };

    const getTextStyle = (): TextStyle => {
        const variantTextStyles = {
            primary: {
                color: disabled ? '#9CA3AF' : '#FFFFFF',
                fontWeight: '600' as const,
            },
            secondary: {
                color: disabled ? '#9CA3AF' : colors.text,
                fontWeight: '500' as const,
            },
            outline: {
                color: disabled ? '#9CA3AF' : colors.primary,
                fontWeight: '600' as const,
            },
        };

        return variantTextStyles[variant];
    };

    return (
        <TouchableOpacity
            style={[getButtonStyle(), style]}
            onPress={onPress}
            disabled={disabled}
            activeOpacity={0.8}
        >
            <Text style={getTextStyle()}>{title}</Text>
        </TouchableOpacity>
    );
}