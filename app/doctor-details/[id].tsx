import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { mockDoctors } from '@/constants/Data';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useThemeColorScheme } from '@/hooks/use-theme-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DoctorDetailsScreen() {
    const params = useLocalSearchParams();
    const doctorId = Array.isArray(params.id) ? params.id[0] : params.id;
    const colorScheme = useThemeColorScheme();
    const colors = Colors[colorScheme ?? 'light'];
    const { user } = useAuth();
    const [isFavorite, setIsFavorite] = useState(false);

    const doctor = mockDoctors.find(d => d.id === doctorId);

    useEffect(() => {
        // Log activity when viewing doctor profile
        if (user && doctor) {
            logActivity(
                user.id,
                'session',
                'Viewed Doctor Profile',
                `Viewed ${doctor.name} - ${doctor.specialty}`,
                'eye-outline',
                '#6B7280'
            );
        }
    }, [user, doctor]);

    if (!doctor) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>Doctor Not Found</Text>
                    <View style={{ width: 24 }} />
                </View>
                <View style={styles.notFoundContainer}>
                    <Ionicons name="medical-outline" size={64} color={colors.icon} />
                    <Text style={[styles.notFoundTitle, { color: colors.text }]}>Doctor Not Found</Text>
                    <Text style={[styles.notFoundText, { color: colors.icon }]}>
                        The doctor you're looking for doesn't exist.
                    </Text>
                    <Button
                        title="Browse Doctors"
                        onPress={() => router.push('/(tabs)/doctors')}
                        style={styles.browseButton}
                    />
                </View>
            </SafeAreaView>
        );
    }

    const handleBookAppointment = async () => {
        try {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } catch (error) {
            // Haptics not available
        }
        router.push(`/booking/${doctor.id}`);
    };

    const handleFavorite = async () => {
        try {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } catch (error) {
            // Haptics not available
        }

        setIsFavorite(!isFavorite);

        if (!isFavorite && user) {
            await logActivity(
                user.id,
                'session',
                'Added to Favorites',
                `Added ${doctor.name} to favorites`,
                'heart',
                '#EF4444'
            );
            Alert.alert('Added to Favorites', `${doctor.name} has been added to your favorites.`);
        } else {
            Alert.alert('Removed from Favorites', `${doctor.name} has been removed from your favorites.`);
        }
    };

    const handleCall = () => {
        Alert.alert(
            'Call Doctor',
            `Would you like to call ${doctor.name}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Call', onPress: () => Alert.alert('Calling', 'Phone call feature would be implemented here') }
            ]
        );
    };

    const handleMessage = () => {
        Alert.alert('Message', 'Messaging feature would be implemented here');
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
                    <TouchableOpacity onPress={handleFavorite}>
                        <Ionicons
                            name={isFavorite ? "heart" : "heart-outline"}
                            size={24}
                            color={isFavorite ? colors.error : colors.icon}
                        />
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

                {/* Quick Actions */}
                <View style={styles.section}>
                    <View style={styles.quickActions}>
                        <TouchableOpacity
                            style={[styles.actionButton, { backgroundColor: colors.card, borderColor: colors.border }]}
                            onPress={handleCall}
                        >
                            <View style={[styles.actionIcon, { backgroundColor: colors.success + '20' }]}>
                                <Ionicons name="call" size={20} color={colors.success} />
                            </View>
                            <Text style={[styles.actionText, { color: colors.text }]}>Call</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.actionButton, { backgroundColor: colors.card, borderColor: colors.border }]}
                            onPress={handleMessage}
                        >
                            <View style={[styles.actionIcon, { backgroundColor: colors.primary + '20' }]}>
                                <Ionicons name="chatbubble" size={20} color={colors.primary} />
                            </View>
                            <Text style={[styles.actionText, { color: colors.text }]}>Message</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.actionButton, { backgroundColor: colors.card, borderColor: colors.border }]}
                            onPress={() => router.push('/(tabs)/doctors')}
                        >
                            <View style={[styles.actionIcon, { backgroundColor: colors.warning + '20' }]}>
                                <Ionicons name="people" size={20} color={colors.warning} />
                            </View>
                            <Text style={[styles.actionText, { color: colors.text }]}>Browse</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Stats */}
                <View style={styles.section}>
                    <View style={styles.statsContainer}>
                        <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <Ionicons name="people" size={24} color={colors.primary} />
                            <Text style={[styles.statNumber, { color: colors.text }]}>500+</Text>
                            <Text style={[styles.statLabel, { color: colors.icon }]}>Patients</Text>
                        </View>
                        <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <Ionicons name="star" size={24} color={colors.warning} />
                            <Text style={[styles.statNumber, { color: colors.text }]}>{doctor.rating}</Text>
                            <Text style={[styles.statLabel, { color: colors.icon }]}>Rating</Text>
                        </View>
                        <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <Ionicons name="time" size={24} color={colors.success} />
                            <Text style={[styles.statNumber, { color: colors.text }]}>{doctor.experience}+</Text>
                            <Text style={[styles.statLabel, { color: colors.icon }]}>Years</Text>
                        </View>
                    </View>
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
    notFoundContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 40,
    },
    notFoundTitle: {
        fontSize: 20,
        fontWeight: '600',
        marginTop: 16,
        marginBottom: 8,
    },
    notFoundText: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 24,
    },
    browseButton: {
        minWidth: 150,
    },
    quickActions: {
        flexDirection: 'row',
        gap: 12,
    },
    actionButton: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 16,
        borderRadius: 12,
        borderWidth: 1,
    },
    actionIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    actionText: {
        fontSize: 12,
        fontWeight: '500',
    },
    statsContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    statCard: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 16,
        borderRadius: 12,
        borderWidth: 1,
    },
    statNumber: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 8,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
    },
});