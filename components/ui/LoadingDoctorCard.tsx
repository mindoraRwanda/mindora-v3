import { Colors } from '@/constants/theme';
import { useThemeColorScheme } from '@/hooks/use-theme-color-scheme';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card } from './Card';

export function LoadingDoctorCard() {
    const colorScheme = useThemeColorScheme();
    const colors = Colors[colorScheme ?? 'light'];

    return (
        <Card style={styles.card}>
            <View style={styles.header}>
                <View style={[styles.avatar, { backgroundColor: colors.secondary }]} />
                <View style={styles.info}>
                    <View style={[styles.namePlaceholder, { backgroundColor: colors.secondary }]} />
                    <View style={[styles.specialtyPlaceholder, { backgroundColor: colors.secondary }]} />
                    <View style={[styles.ratingPlaceholder, { backgroundColor: colors.secondary }]} />
                </View>
            </View>
            <View style={styles.footer}>
                <View style={[styles.availabilityPlaceholder, { backgroundColor: colors.secondary }]} />
                <View style={[styles.pricePlaceholder, { backgroundColor: colors.secondary }]} />
            </View>
        </Card>
    );
}

const styles = StyleSheet.create({
    card: {
        marginBottom: 16,
    },
    header: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
    },
    info: {
        flex: 1,
        marginLeft: 16,
    },
    namePlaceholder: {
        height: 20,
        width: '70%',
        borderRadius: 4,
        marginBottom: 8,
    },
    specialtyPlaceholder: {
        height: 16,
        width: '50%',
        borderRadius: 4,
        marginBottom: 8,
    },
    ratingPlaceholder: {
        height: 16,
        width: '60%',
        borderRadius: 4,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    availabilityPlaceholder: {
        height: 16,
        width: '40%',
        borderRadius: 4,
    },
    pricePlaceholder: {
        height: 16,
        width: '30%',
        borderRadius: 4,
    },
});