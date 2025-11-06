import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { mockDoctors } from '@/constants/Data';
import { Colors } from '@/constants/theme';
import { useThemeColorScheme } from '@/hooks/use-theme-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function BookingScreen() {
    const { doctorId } = useLocalSearchParams();
    const colorScheme = useThemeColorScheme();
    const colors = Colors[colorScheme ?? 'light'];

    const doctor = mockDoctors.find(d => d.id === doctorId);
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [selectedType, setSelectedType] = useState('video');

    if (!doctor) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
                <Text>Doctor not found</Text>
            </SafeAreaView>
        );
    }

    const dates = [
        { id: '2024-11-08', day: 'Today', date: 'Nov 8' },
        { id: '2024-11-09', day: 'Tomorrow', date: 'Nov 9' },
        { id: '2024-11-10', day: 'Sunday', date: 'Nov 10' },
        { id: '2024-11-11', day: 'Monday', date: 'Nov 11' },
        { id: '2024-11-12', day: 'Tuesday', date: 'Nov 12' },
    ];

    const times = [
        '9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM', '4:00 PM'
    ];

    const sessionTypes = [
        { id: 'video', name: 'Video Call', icon: 'videocam', description: 'Online session via video call' },
        { id: 'in-person', name: 'In Person', icon: 'location', description: 'Visit the clinic in person' },
    ];

    const handleBooking = () => {
        if (!selectedDate || !selectedTime) {
            Alert.alert('Error', 'Please select a date and time');
            return;
        }

        Alert.alert(
            'Confirm Booking',
            `Book appointment with ${doctor.name} on ${selectedDate} at ${selectedTime}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Confirm',
                    onPress: () => {
                        Alert.alert('Success', 'Appointment booked successfully!', [
                            {
                                text: 'Join Video Call',
                                onPress: () => router.push(`/video-call/appointment-${Date.now()}`)
                            },
                            { text: 'OK', onPress: () => router.back() }
                        ]);
                    }
                }
            ]
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>Book Appointment</Text>
                    <View style={{ width: 24 }} />
                </View>

                {/* Doctor Info */}
                <View style={styles.section}>
                    <Card>
                        <View style={styles.doctorInfo}>
                            <Avatar source={doctor.avatar} name={doctor.name} size={60} />
                            <View style={styles.doctorDetails}>
                                <Text style={[styles.doctorName, { color: colors.text }]}>{doctor.name}</Text>
                                <Text style={[styles.specialty, { color: colors.icon }]}>{doctor.specialty}</Text>
                                <Text style={[styles.price, { color: colors.primary }]}>{doctor.price.toLocaleString()} RWF/session</Text>
                            </View>
                        </View>
                    </Card>
                </View>

                {/* Session Type */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Session Type</Text>
                    {sessionTypes.map((type) => (
                        <TouchableOpacity
                            key={type.id}
                            style={[
                                styles.typeOption,
                                {
                                    backgroundColor: selectedType === type.id ? colors.primary + '20' : colors.card,
                                    borderColor: selectedType === type.id ? colors.primary : colors.border,
                                },
                            ]}
                            onPress={() => setSelectedType(type.id)}
                        >
                            <View style={styles.typeContent}>
                                <View style={[styles.typeIcon, { backgroundColor: colors.primary + '20' }]}>
                                    <Ionicons name={type.icon as any} size={24} color={colors.primary} />
                                </View>
                                <View style={styles.typeInfo}>
                                    <Text style={[styles.typeName, { color: colors.text }]}>{type.name}</Text>
                                    <Text style={[styles.typeDescription, { color: colors.icon }]}>{type.description}</Text>
                                </View>
                            </View>
                            {selectedType === type.id && (
                                <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                            )}
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Date Selection */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Select Date</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View style={styles.datesContainer}>
                            {dates.map((date) => (
                                <TouchableOpacity
                                    key={date.id}
                                    style={[
                                        styles.dateOption,
                                        {
                                            backgroundColor: selectedDate === date.id ? colors.primary : colors.card,
                                            borderColor: colors.border,
                                        },
                                    ]}
                                    onPress={() => setSelectedDate(date.id)}
                                >
                                    <Text
                                        style={[
                                            styles.dateDay,
                                            { color: selectedDate === date.id ? '#FFFFFF' : colors.text },
                                        ]}
                                    >
                                        {date.day}
                                    </Text>
                                    <Text
                                        style={[
                                            styles.dateText,
                                            { color: selectedDate === date.id ? '#FFFFFF' : colors.icon },
                                        ]}
                                    >
                                        {date.date}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </ScrollView>
                </View>

                {/* Time Selection */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Select Time</Text>
                    <View style={styles.timesContainer}>
                        {times.map((time) => (
                            <TouchableOpacity
                                key={time}
                                style={[
                                    styles.timeOption,
                                    {
                                        backgroundColor: selectedTime === time ? colors.primary : colors.card,
                                        borderColor: colors.border,
                                    },
                                ]}
                                onPress={() => setSelectedTime(time)}
                            >
                                <Text
                                    style={[
                                        styles.timeText,
                                        { color: selectedTime === time ? '#FFFFFF' : colors.text },
                                    ]}
                                >
                                    {time}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Booking Summary */}
                {selectedDate && selectedTime && (
                    <View style={styles.section}>
                        <Card style={[styles.summaryCard, { backgroundColor: colors.primary + '10' }]}>
                            <Text style={[styles.summaryTitle, { color: colors.text }]}>Booking Summary</Text>
                            <View style={styles.summaryItem}>
                                <Text style={[styles.summaryLabel, { color: colors.icon }]}>Doctor:</Text>
                                <Text style={[styles.summaryValue, { color: colors.text }]}>{doctor.name}</Text>
                            </View>
                            <View style={styles.summaryItem}>
                                <Text style={[styles.summaryLabel, { color: colors.icon }]}>Date:</Text>
                                <Text style={[styles.summaryValue, { color: colors.text }]}>{selectedDate}</Text>
                            </View>
                            <View style={styles.summaryItem}>
                                <Text style={[styles.summaryLabel, { color: colors.icon }]}>Time:</Text>
                                <Text style={[styles.summaryValue, { color: colors.text }]}>{selectedTime}</Text>
                            </View>
                            <View style={styles.summaryItem}>
                                <Text style={[styles.summaryLabel, { color: colors.icon }]}>Type:</Text>
                                <Text style={[styles.summaryValue, { color: colors.text }]}>
                                    {sessionTypes.find(t => t.id === selectedType)?.name}
                                </Text>
                            </View>
                            <View style={styles.summaryItem}>
                                <Text style={[styles.summaryLabel, { color: colors.icon }]}>Fee:</Text>
                                <Text style={[styles.summaryValue, { color: colors.primary, fontWeight: '600' }]}>
                                    ${doctor.price}
                                </Text>
                            </View>
                        </Card>
                    </View>
                )}
            </ScrollView>

            {/* Book Button */}
            <View style={[styles.bookingContainer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
                <Button
                    title="Book Appointment"
                    onPress={handleBooking}
                    disabled={!selectedDate || !selectedTime}
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
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 16,
    },
    doctorInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    doctorDetails: {
        marginLeft: 16,
        flex: 1,
    },
    doctorName: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 4,
    },
    specialty: {
        fontSize: 14,
        marginBottom: 4,
    },
    price: {
        fontSize: 16,
        fontWeight: '600',
    },
    typeOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 12,
    },
    typeContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    typeIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    typeInfo: {
        flex: 1,
    },
    typeName: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 2,
    },
    typeDescription: {
        fontSize: 14,
    },
    datesContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    dateOption: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderRadius: 12,
        borderWidth: 1,
        alignItems: 'center',
        minWidth: 80,
    },
    dateDay: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
    },
    dateText: {
        fontSize: 12,
    },
    timesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    timeOption: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 1,
    },
    timeText: {
        fontSize: 14,
        fontWeight: '500',
    },
    summaryCard: {
        borderWidth: 1,
        borderColor: 'transparent',
    },
    summaryTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
    },
    summaryItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    summaryLabel: {
        fontSize: 14,
    },
    summaryValue: {
        fontSize: 14,
        fontWeight: '500',
    },
    bookingContainer: {
        padding: 20,
        borderTopWidth: 1,
    },
    bookButton: {
        width: '100%',
    },
});