import { DoctorCard } from '@/components/DoctorCard';
import { mockDoctors } from '@/constants/Data';
import { Colors } from '@/constants/theme';
import { useThemeColorScheme } from '@/hooks/use-theme-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DoctorsScreen() {
    const colorScheme = useThemeColorScheme();
    const colors = Colors[colorScheme ?? 'light'];
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('All');
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        const pulse = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        );
        pulse.start();
        return () => pulse.stop();
    }, [pulseAnim]);

    const filters = ['All', 'Psychologist', 'Psychiatrist', 'Therapist', 'Counselor'];

    const filteredDoctors = mockDoctors.filter(doctor => {
        const matchesSearch = doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesFilter = selectedFilter === 'All' ||
            doctor.specialty.toLowerCase().includes(selectedFilter.toLowerCase());

        return matchesSearch && matchesFilter;
    });

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { flexDirection: 'row', alignItems: 'flex-start' }]}>
                <View style={styles.headerContent}>
                    <Text style={[styles.title, { color: colors.text }]}>Find a Doctor</Text>
                    <Text style={[styles.subtitle, { color: colors.icon }]}>
                        Connect with mental health professionals in Rwanda
                    </Text>
                </View>
                <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                    <TouchableOpacity
                        style={[styles.emergencyButton, { backgroundColor: colors.error + '20' }]}
                        onPress={() => {
                            try {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                            } catch (error) {
                                // Haptics not available, continue without feedback
                            }
                            router.push('/help');
                        }}
                    >
                        <Ionicons name="medical" size={20} color={colors.error} />
                    </TouchableOpacity>
                </Animated.View>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Ionicons name="search" size={20} color={colors.icon} />
                    <TextInput
                        style={[styles.searchInput, { color: colors.text }]}
                        placeholder="Search doctors or specialties..."
                        placeholderTextColor={colors.icon}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        returnKeyType="search"
                        autoCorrect={false}
                        clearButtonMode="while-editing"
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Ionicons name="close-circle" size={20} color={colors.icon} />
                        </TouchableOpacity>
                    )}
                </View>
                <TouchableOpacity
                    style={[styles.sortButton, { backgroundColor: colors.card, borderColor: colors.border }]}
                    onPress={() => {/* Sort functionality */ }}
                >
                    <Ionicons name="funnel" size={20} color={colors.icon} />
                </TouchableOpacity>
            </View>

            {/* Filters */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
                <View style={styles.filters}>
                    {filters.map((filter) => (
                        <TouchableOpacity
                            key={filter}
                            style={[
                                styles.filterChip,
                                {
                                    backgroundColor: selectedFilter === filter ? colors.primary : colors.card,
                                    borderColor: selectedFilter === filter ? colors.primary : colors.border,
                                },
                            ]}
                            onPress={() => {
                                try {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                } catch (error) {
                                    // Haptics not available, continue without feedback
                                }
                                setSelectedFilter(filter);
                            }}
                        >
                            <Text
                                style={[
                                    styles.filterText,
                                    { color: selectedFilter === filter ? '#FFFFFF' : colors.text },
                                ]}
                            >
                                {filter}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>

            {/* Statistics */}
            <View style={styles.statsContainer}>
                <View style={[styles.statCard, { backgroundColor: colors.primary + '10', borderColor: colors.primary + '30' }]}>
                    <View style={[styles.statIcon, { backgroundColor: colors.primary }]}>
                        <Ionicons name="people" size={16} color="#FFFFFF" />
                    </View>
                    <Text style={[styles.statNumber, { color: colors.primary }]}>{filteredDoctors.length}</Text>
                    <Text style={[styles.statLabel, { color: colors.text }]}>Available</Text>
                </View>
                <View style={[styles.statCard, { backgroundColor: colors.success + '10', borderColor: colors.success + '30' }]}>
                    <View style={[styles.statIcon, { backgroundColor: colors.success }]}>
                        <Ionicons name="star" size={16} color="#FFFFFF" />
                    </View>
                    <Text style={[styles.statNumber, { color: colors.success }]}>4.8</Text>
                    <Text style={[styles.statLabel, { color: colors.text }]}>Avg Rating</Text>
                </View>
                <View style={[styles.statCard, { backgroundColor: colors.warning + '10', borderColor: colors.warning + '30' }]}>
                    <View style={[styles.statIcon, { backgroundColor: colors.warning }]}>
                        <Ionicons name="time" size={16} color="#FFFFFF" />
                    </View>
                    <Text style={[styles.statNumber, { color: colors.warning }]}>24/7</Text>
                    <Text style={[styles.statLabel, { color: colors.text }]}>Support</Text>
                </View>
            </View>

            {/* Featured Doctor */}
            {searchQuery === '' && selectedFilter === 'All' && (
                <View style={styles.featuredSection}>
                    <View style={styles.featuredHeader}>
                        <Text style={[styles.featuredTitle, { color: colors.text }]}>Featured Doctor</Text>
                        <View style={[styles.featuredBadge, { backgroundColor: colors.primary }]}>
                            <Ionicons name="star" size={12} color="#FFFFFF" />
                            <Text style={styles.featuredBadgeText}>Top Rated</Text>
                        </View>
                    </View>
                    <DoctorCard
                        doctor={mockDoctors[0]}
                        onPress={() => router.push(`/doctor-details/${mockDoctors[0].id}`)}
                    />
                </View>
            )}

            {/* Doctors List */}
            <ScrollView style={styles.doctorsList} showsVerticalScrollIndicator={false}>
                <View style={styles.listContainer}>
                    <View style={styles.listHeader}>
                        <Text style={[styles.resultsText, { color: colors.text }]}>
                            {selectedFilter === 'All' ? 'All Doctors' : selectedFilter + 's'}
                        </Text>
                        <View style={styles.listActions}>
                            <Text style={[styles.resultsCount, { color: colors.icon }]}>
                                {filteredDoctors.length} found
                            </Text>
                            <TouchableOpacity style={styles.sortAction}>
                                <Ionicons name="swap-vertical" size={16} color={colors.icon} />
                                <Text style={[styles.sortText, { color: colors.icon }]}>Sort</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {filteredDoctors.length > 0 ? (
                        <View style={styles.doctorsGrid}>
                            {filteredDoctors.map((doctor) => (
                                <DoctorCard
                                    key={doctor.id}
                                    doctor={doctor}
                                    onPress={() => router.push(`/doctor-details/${doctor.id}`)}
                                />
                            ))}
                        </View>
                    ) : (
                        <View style={styles.emptyState}>
                            <View style={[styles.emptyIcon, { backgroundColor: colors.secondary }]}>
                                <Ionicons name="medical-outline" size={48} color={colors.icon} />
                            </View>
                            <Text style={[styles.emptyTitle, { color: colors.text }]}>No doctors found</Text>
                            <Text style={[styles.emptySubtitle, { color: colors.icon }]}>
                                Try adjusting your search or filter criteria
                            </Text>
                            <TouchableOpacity
                                style={[styles.clearFiltersButton, { backgroundColor: colors.primary }]}
                                onPress={() => {
                                    try {
                                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                    } catch (error) {
                                        // Haptics not available, continue without feedback
                                    }
                                    setSearchQuery('');
                                    setSelectedFilter('All');
                                }}
                            >
                                <Text style={styles.clearFiltersText}>Clear Filters</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        padding: 20,
        paddingBottom: 10,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 16,
    },
    searchContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        marginBottom: 16,
        gap: 12,
    },
    searchBar: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
    },
    searchInput: {
        flex: 1,
        marginLeft: 12,
        fontSize: 16,
    },
    filtersContainer: {
        marginBottom: 16,
    },
    filters: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        gap: 12,
    },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
    },
    filterText: {
        fontSize: 14,
        fontWeight: '500',
    },
    doctorsList: {
        flex: 1,
    },
    listContainer: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    statsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        marginBottom: 20,
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
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        fontWeight: '500',
    },
    listHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    resultsText: {
        fontSize: 18,
        fontWeight: '600',
    },
    resultsCount: {
        fontSize: 14,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 60,
        paddingHorizontal: 40,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginTop: 16,
        marginBottom: 8,
        textAlign: 'center',
    },
    emptySubtitle: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 24,
    },
    headerContent: {
        flex: 1,
    },
    emergencyButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sortButton: {
        width: 44,
        height: 44,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
    },
    statIcon: {
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    featuredSection: {
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    featuredHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    featuredTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    featuredBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    featuredBadgeText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '500',
    },
    listActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    sortAction: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    sortText: {
        fontSize: 14,
        fontWeight: '500',
    },
    doctorsGrid: {
        gap: 16,
    },
    emptyIcon: {
        width: 96,
        height: 96,
        borderRadius: 48,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    clearFiltersButton: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },
    clearFiltersText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
});