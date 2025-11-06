import { Colors } from '@/constants/theme';
import { useThemeColorScheme } from '@/hooks/use-theme-color-scheme';
import React from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
    containerStyle?: any;
}

export function Input({ label, error, containerStyle, style, ...props }: InputProps) {
    const colorScheme = useThemeColorScheme();
    const colors = Colors[colorScheme ?? 'light'];

    return (
        <View style={[styles.container, containerStyle]}>
            {label && (
                <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
            )}
            <TextInput
                style={[
                    styles.input,
                    {
                        backgroundColor: colors.card,
                        borderColor: error ? colors.error : colors.border,
                        color: colors.text,
                    },
                    style,
                ]}
                placeholderTextColor={colors.icon}
                {...props}
            />
            {error && (
                <Text style={[styles.error, { color: colors.error }]}>{error}</Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
    },
    error: {
        fontSize: 12,
        marginTop: 4,
    },
});