import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { mockDoctors } from '@/constants/Data';
import { Colors } from '@/constants/theme';
import { useThemeColorScheme } from '@/hooks/use-theme-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DoctorDetailsScreen() {
    const { id } = useLocalSearchParams();
    const colorScheme = useThemeColorScheme();
    const colors = Colors[colorScheme ?? 'light'];

    const doctor = mockDoctors.find(d => d.id === id);

    if (!doctor) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
                <Text>Doctor not found</Text>
            </SafeAreaView>
        );
    }

    const handleBookAppointment = () => {
        router.push(`/booking/${doctor.id}`);
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>Doctor Details</Text>
                    <TouchableOpacity>
                        <Ionicons name="heart-outline" size={24} color={colors.icon} />
                    </TouchableOpacity>
                </View>

                {/* Doctor Info */}
                <View style={styles.section}>
                    <Card>
                        <View style={styles.doctorHeader}>
                            <Avatar source={doctor.avatar} name={doctor.name} size={80} />
                            <View style={styles.doctorInfo}>
                                <Text style={[styles.doctorName, { color: colors.text }]}>{doctor.name}</Text>
                                <Text style={[styles.specialty, { color: colors.icon }]}>{doctor.specialty}</Text>
                                <View style={styles.rating}>
                                    <Ionicons name="star" size={16} color="#F59E0B" />
                                    <Text style={[styles.ratingText, { color: colors.text }]}>
                                        {doctor.rating} ({doctor.experience}+ years)
                                    </Text>
                                </View>
                                <View style={styles.location}>
                                    <Ionicons name="location-outline" size={16} color={colors.icon} />
                                    <Text style={[styles.locationText, { color: colors.icon }]}>{doctor.location}</Text>
                                </View>
                            </View>
                        </View>

                        {/* Price Badge */}
                        <View style={styles.priceContainer}>
                            <View style={[styles.priceBadge, { backgroundColor: colors.primary + '20' }]}>
                                <Text style={[styles.priceText, { color: colors.primary }]}>
                                    {doctor.price.toLocaleString()} RWF/session
                                </Text>
                            </View>
                        </View>
                    </Card>
                </View>

                {/* About */}
                <View style={styles.section}>
                    <Card>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>About</Text>
                        <Text style={[styles.bio, { color: colors.text }]}>{doctor.bio}</Text>
                    </Card>
                </View>

                {/* Availability */}
                <View style={styles.section}>
                    <Card>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Availability</Text>
                        <View style={styles.availabilityContainer}>
                            {doctor.availability.map((day, index) => (
                                <View key={index} style={[styles.dayChip, { backgroundColor: colors.primary + '20' }]}>
                                    <Text style={[styles.dayText, { color: colors.primary }]}>{day}</Text>
                                </View>
                            ))}
                        </View>
                    </Card>
                </View>

                {/* Services */}
                <View style={styles.section}>
                    <Card>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Services</Text>
                        <View style={styles.servicesList}>
                            {['Individual Therapy', 'Group Sessions', 'Video Consultations', 'Crisis Support'].map((service, index) => (
                                <View key={index} style={styles.serviceItem}>
                                    <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                                    <Text style={[styles.serviceText, { color: colors.text }]}>{service}</Text>
                                </View>
                            ))}
                        </View>
                    </Card>
                </View>

                {/* Reviews */}
                <View style={styles.section}>
                    <Card>
                        <View style={styles.reviewsHeader}>
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>Reviews</Text>
                            <TouchableOpacity>
                                <Text style={[styles.seeAll, { color: colors.primary }]}>See All</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.review}>
                            <View style={styles.reviewHeader}>
                                <Avatar name="John D." size={32} />
                                <View style={styles.reviewInfo}>
                                    <Text style={[styles.reviewerName, { color: colors.text }]}>John D.</Text>
                                    <View style={styles.reviewRating}>
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Ionicons key={star} name="star" size={12} color="#F59E0B" />
                                        ))}
                                    </View>
                                </View>
                            </View>
                            <Text style={[styles.reviewText, { color: colors.text }]}>
                                "Dr. {doctor.name.split(' ')[1]} has been incredibly helpful in my journey.
                                Professional, empathetic, and truly cares about patient wellbeing."
                            </Text>
                        </View>
                    </Card>
                </View>

                {/* Pricing */}
                <View style={styles.section}>
                    <Card>
                        <View style={styles.pricingHeader}>
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>Session Fee</Text>
                            <Text style={[styles.price, { color: colors.primary }]}>{doctor.price.toLocaleString()} RWF/session</Text>
                        </View>
                        <Text style={[styles.pricingNote, { color: colors.icon }]}>
                            Insurance accepted. Sliding scale available for qualifying patients.
                        </Text>
                    </Card>
                </View>
            </ScrollView>

            {/* Book Appointment Button */}
            <View style={[styles.bookingContainer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
                <Button
                    title="Book Appointment"
                    onPress={handleBookAppointment}
                    style={styles.bookButton}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        paddingBottom: 10,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    section: {
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 12,
    },
    doctorHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    doctorInfo: {
        marginLeft: 20,
        flex: 1,
    },
    doctorName: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    specialty: {
        fontSize: 16,
        marginBottom: 8,
    },
    rating: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    ratingText: {
        fontSize: 14,
        marginLeft: 4,
    },
    location: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    locationText: {
        fontSize: 14,
        marginLeft: 4,
    },
    bio: {
        fontSize: 16,
        lineHeight: 24,
    },
    availabilityContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    dayChip: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    dayText: {
        fontSize: 14,
        fontWeight: '500',
    },
    servicesList: {
        gap: 12,
    },
    serviceItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    serviceText: {
        fontSize: 16,
        marginLeft: 12,
    },
    reviewsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    seeAll: {
        fontSize: 14,
        fontWeight: '500',
    },
    review: {
        marginBottom: 16,
    },
    reviewHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    reviewInfo: {
        marginLeft: 12,
    },
    reviewerName: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 2,
    },
    reviewRating: {
        flexDirection: 'row',
    },
    reviewText: {
        fontSize: 14,
        lineHeight: 20,
    },
    pricingHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    price: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    pricingNote: {
        fontSize: 14,
        lineHeight: 18,
    },
    bookingContainer: {
        padding: 20,
        borderTopWidth: 1,
    },
    bookButton: {
        width: '100%',
    },
    priceContainer: {
        marginTop: 16,
        alignItems: 'center',
    },
    priceBadge: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    priceText: {
        fontSize: 16,
        fontWeight: '600',
    },
});