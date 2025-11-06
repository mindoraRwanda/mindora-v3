import { Colors } from '@/constants/theme';
import { useThemeColorScheme } from '@/hooks/use-theme-color-scheme';
import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

interface CardProps {
    children: React.ReactNode;
    style?: ViewStyle;
    padding?: number;
}

export function Card({ children, style, padding = 16 }: CardProps) {
    const colorScheme = useThemeColorScheme();
    const colors = Colors[colorScheme ?? 'light'];

    return (
        <View
            style={[
                styles.card,
                {
                    backgroundColor: colors.card,
                    shadowColor: colors.text,
                    padding,
                },
                style,
            ]}
        >
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 16,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
});