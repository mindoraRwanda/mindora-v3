import { Colors } from '@/constants/theme';
import { useThemeColorScheme } from '@/hooks/use-theme-color-scheme';
import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';

interface AvatarProps {
    source?: string;
    name?: string;
    size?: number;
    style?: ViewStyle;
}

export function Avatar({ source, name, size = 40, style }: AvatarProps) {
    const colorScheme = useThemeColorScheme();
    const colors = Colors[colorScheme ?? 'light'];

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const avatarStyle = {
        width: size,
        height: size,
        borderRadius: size / 2,
    };

    if (source) {
        return (
            <Image
                source={{ uri: source }}
                style={[avatarStyle, style]}
                contentFit="cover"
            />
        );
    }

    return (
        <View
            style={[
                avatarStyle,
                styles.placeholder,
                { backgroundColor: colors.primary },
                style,
            ]}
        >
            <Text
                style={[
                    styles.initials,
                    { fontSize: size * 0.4, color: '#FFFFFF' },
                ]}
            >
                {name ? getInitials(name) : '?'}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    placeholder: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    initials: {
        fontWeight: '600',
    },
});