import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { mockAppointments, mockDoctors } from '@/constants/Data';
import { Colors } from '@/constants/theme';
import { useThemeColorScheme } from '@/hooks/use-theme-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AppointmentsScreen() {
    const colorScheme = useThemeColorScheme();
    const colors = Colors[colorScheme ?? 'light'];

    const [selectedTab, setSelectedTab] = useState<'upcoming' | 'past'>('upcoming');

    const upcomingAppointments = mockAppointments.filter(apt => apt.status === 'upcoming');
    const pastAppointments = mockAppointments.filter(apt => apt.status === 'completed');

    const getDoctor = (doctorId: string) => {
        return mockDoctors.find(doc => doc.id === doctorId);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'upcoming': return colors.primary;
            case 'completed': return colors.success;
            case 'cancelled': return colors.error;
            default: return colors.icon;
        }
    };

    const renderAppointment = (appointment: any) => {
        const doctor = getDoctor(appointment.doctorId);
        if (!doctor) return null;

        return (
            <Card key={appointment.id} style={styles.appointmentCard}>
                <View style={styles.appointmentHeader}>
                    <Avatar source={doctor.avatar} name={doctor.name} size={50} />
                    <View style={styles.appointmentInfo}>
                        <Text style={[styles.doctorName, { color: colors.text }]}>{doctor.name}</Text>
                        <Text style={[styles.specialty, { color: colors.icon }]}>{doctor.specialty}</Text>
                        <View style={styles.appointmentDetails}>
                            <Ionicons name="calendar" size={14} color={colors.icon} />
                            <Text style={[styles.dateTime, { color: colors.icon }]}>
                                {appointment.date} at {appointment.time}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.appointmentActions}>
                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(appointment.status) + '20' }]}>
                            <Text style={[styles.statusText, { color: getStatusColor(appointment.status) }]}>
                                {appointment.status}
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={styles.appointmentFooter}>
                    <View style={styles.typeIndicator}>
                        <Ionicons
                            name={appointment.type === 'video' ? 'videocam' : 'location'}
                            size={16}
                            color={colors.primary}
                        />
                        <Text style={[styles.typeText, { color: colors.primary }]}>
                            {appointment.type === 'video' ? 'Video Call' : 'In Person'}
                        </Text>
                    </View>

                    <View style={styles.actionButtons}>
                        {appointment.status === 'upcoming' && appointment.type === 'video' && (
                            <Button
                                title="Join Call"
                                onPress={() => router.push(`/video-call/${appointment.id}`)}
                                size="small"
                                style={styles.actionButton}
                            />
                        )}
                        {appointment.status === 'upcoming' && (
                            <Button
                                title="Reschedule"
                                onPress={() => router.push(`/booking/${appointment.doctorId}`)}
                                variant="outline"
                                size="small"
                                style={styles.actionButton}
                            />
                        )}
                        {appointment.status === 'completed' && (
                            <Button
                                title="Book Again"
                                onPress={() => router.push(`/booking/${appointment.doctorId}`)}
                                variant="outline"
                                size="small"
                                style={styles.actionButton}
                            />
                        )}
                    </View>
                </View>
            </Card>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>My Appointments</Text>
                <TouchableOpacity onPress={() => router.push('/(tabs)/doctors')}>
                    <Ionicons name="add" size={24} color={colors.primary} />
                </TouchableOpacity>
            </View>

            {/* Tabs */}
            <View style={styles.tabsContainer}>
                <TouchableOpacity
                    style={[
                        styles.tab,
                        {
                            backgroundColor: selectedTab === 'upcoming' ? colors.primary : colors.secondary,
                            borderColor: colors.border,
                        },
                    ]}
                    onPress={() => setSelectedTab('upcoming')}
                >
                    <Text
                        style={[
                            styles.tabText,
                            { color: selectedTab === 'upcoming' ? '#FFFFFF' : colors.text },
                        ]}
                    >
                        Upcoming ({upcomingAppointments.length})
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.tab,
                        {
                            backgroundColor: selectedTab === 'past' ? colors.primary : colors.secondary,
                            borderColor: colors.border,
                        },
                    ]}
                    onPress={() => setSelectedTab('past')}
                >
                    <Text
                        style={[
                            styles.tabText,
                            { color: selectedTab === 'past' ? '#FFFFFF' : colors.text },
                        ]}
                    >
                        Past ({pastAppointments.length})
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Appointments List */}
            <ScrollView style={styles.appointmentsList} showsVerticalScrollIndicator={false}>
                <View style={styles.listContainer}>
                    {selectedTab === 'upcoming' ? (
                        upcomingAppointments.length > 0 ? (
                            upcomingAppointments.map(renderAppointment)
                        ) : (
                            <View style={styles.emptyState}>
                                <Ionicons name="calendar-outline" size={64} color={colors.icon} />
                                <Text style={[styles.emptyTitle, { color: colors.text }]}>No Upcoming Appointments</Text>
                                <Text style={[styles.emptySubtitle, { color: colors.icon }]}>
                                    Book an appointment with one of our mental health professionals
                                </Text>
                                <Button
                                    title="Find a Doctor"
                                    onPress={() => router.push('/(tabs)/doctors')}
                                    style={styles.emptyButton}
                                />
                            </View>
                        )
                    ) : (
                        pastAppointments.length > 0 ? (
                            pastAppointments.map(renderAppointment)
                        ) : (
                            <View style={styles.emptyState}>
                                <Ionicons name="time-outline" size={64} color={colors.icon} />
                                <Text style={[styles.emptyTitle, { color: colors.text }]}>No Past Appointments</Text>
                                <Text style={[styles.emptySubtitle, { color: colors.icon }]}>
                                    Your completed appointments will appear here
                                </Text>
                            </View>
                        )
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '600',
    },
    tabsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        marginBottom: 20,
        gap: 12,
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        borderWidth: 1,
        alignItems: 'center',
    },
    tabText: {
        fontSize: 14,
        fontWeight: '500',
    },
    appointmentsList: {
        flex: 1,
    },
    listContainer: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    appointmentCard: {
        marginBottom: 16,
    },
    appointmentHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    appointmentInfo: {
        flex: 1,
        marginLeft: 16,
    },
    doctorName: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    specialty: {
        fontSize: 14,
        marginBottom: 8,
    },
    appointmentDetails: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dateTime: {
        fontSize: 14,
        marginLeft: 6,
    },
    appointmentActions: {
        alignItems: 'flex-end',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '500',
        textTransform: 'capitalize',
    },
    appointmentFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    typeIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    typeText: {
        fontSize: 14,
        marginLeft: 6,
        fontWeight: '500',
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 8,
    },
    actionButton: {
        minWidth: 80,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 60,
        paddingHorizontal: 40,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '600',
        marginTop: 16,
        marginBottom: 8,
        textAlign: 'center',
    },
    emptySubtitle: {
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 24,
    },
    emptyButton: {
        minWidth: 150,
    },
});