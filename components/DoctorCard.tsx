import { Doctor } from '@/constants/Types';
import { Colors } from '@/constants/theme';
import { useThemeColorScheme } from '@/hooks/use-theme-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Avatar } from './ui/Avatar';
import { Card } from './ui/Card';

interface DoctorCardProps {
    doctor: Doctor;
    onPress: () => void;
}

export function DoctorCard({ doctor, onPress }: DoctorCardProps) {
    const colorScheme = useThemeColorScheme();
    const colors = Colors[colorScheme ?? 'light'];
    const scaleValue = React.useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        Animated.spring(scaleValue, {
            toValue: 0.98,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleValue, {
            toValue: 1,
            useNativeDriver: true,
        }).start();
    };

    return (
        <TouchableOpacity
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            activeOpacity={1}
        >
            <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
                <Card style={styles.card}>
                    <View style={styles.header}>
                        <Avatar source={doctor.avatar} name={doctor.name} size={60} />
                        <View style={styles.info}>
                            <View style={styles.nameRow}>
                                <Text style={[styles.name, { color: colors.text }]}>{doctor.name}</Text>
                                {doctor.rating >= 4.8 && (
                                    <View style={[styles.topRatedBadge, { backgroundColor: colors.success }]}>
                                        <Ionicons name="star" size={10} color="#FFFFFF" />
                                    </View>
                                )}
                            </View>
                            <Text style={[styles.specialty, { color: colors.icon }]}>{doctor.specialty}</Text>
                            <View style={styles.rating}>
                                <View style={styles.stars}>
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Ionicons
                                            key={star}
                                            name={star <= Math.floor(doctor.rating) ? "star" : "star-outline"}
                                            size={12}
                                            color="#F59E0B"
                                        />
                                    ))}
                                </View>
                                <Text style={[styles.ratingText, { color: colors.text }]}>
                                    {doctor.rating} ({doctor.experience}+ years)
                                </Text>
                            </View>
                            <View style={styles.location}>
                                <Ionicons name="location" size={12} color={colors.icon} />
                                <Text style={[styles.locationText, { color: colors.icon }]}>{doctor.location}</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.footer}>
                        <View style={styles.availability}>
                            <Ionicons name="calendar-outline" size={16} color={colors.success} />
                            <Text style={[styles.availabilityText, { color: colors.success }]}>
                                Available {doctor.availability.length} days/week
                            </Text>
                        </View>
                        <View style={[styles.priceContainer, { backgroundColor: colors.primary + '20' }]}>
                            <Text style={[styles.price, { color: colors.primary }]}>{doctor.price.toLocaleString()} RWF</Text>
                        </View>
                    </View>
                </Card>
            </Animated.View>
        </TouchableOpacity>
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
    info: {
        flex: 1,
        marginLeft: 16,
    },
    name: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 4,
    },
    specialty: {
        fontSize: 14,
        marginBottom: 8,
    },
    rating: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ratingText: {
        fontSize: 14,
        marginLeft: 4,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    availability: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    availabilityText: {
        fontSize: 12,
        marginLeft: 4,
    },
    price: {
        fontSize: 14,
        fontWeight: '600',
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    topRatedBadge: {
        width: 16,
        height: 16,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 8,
    },
    stars: {
        flexDirection: 'row',
        marginRight: 6,
    },
    location: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    locationText: {
        fontSize: 12,
        marginLeft: 4,
    },
    priceContainer: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
});