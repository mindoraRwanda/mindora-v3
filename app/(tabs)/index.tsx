import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { mockAppointments, mockDoctors } from '@/constants/Data';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useThemeColorScheme } from '@/hooks/use-theme-color-scheme';
import { logActivity } from '@/utils/activityTracker';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const colorScheme = useThemeColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user, updateProfile } = useAuth();
  const [selectedMood, setSelectedMood] = useState<number | null>(null);

  const upcomingAppointment = mockAppointments.find(apt => apt.status === 'upcoming');
  const featuredDoctor = mockDoctors[0];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const handleMoodSelect = async (index: number) => {
    setSelectedMood(index);
    const moods = ['Very Sad', 'Sad', 'Neutral', 'Happy', 'Very Happy'];
    const moodEmojis = ['😢', '😕', '😐', '🙂', '😊'];

    Alert.alert('Mood Logged', `You're feeling ${moods[index]} today. Keep tracking your progress!`);

    // Log activity and update stats
    if (user) {
      await logActivity(
        user.id,
        'mood',
        'Mood Tracked',
        `Logged mood: ${moods[index]} ${moodEmojis[index]}`,
        'happy-outline',
        '#F59E0B'
      );

      await updateProfile({
        stats: {
          ...user.stats,
          dayStreak: user.stats.dayStreak + 1,
        }
      });
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: colors.icon }]}>{getGreeting()},</Text>
            <Text style={[styles.name, { color: colors.text }]}>{user?.name.split(' ')[0]}</Text>
          </View>
          <TouchableOpacity onPress={() => Alert.alert('Notifications', 'You have 3 new notifications')}>
            <View>
              <Ionicons name="notifications-outline" size={24} color={colors.icon} />
              <View style={[styles.badge, { backgroundColor: colors.error }]}>
                <Text style={styles.badgeText}>3</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/(tabs)/doctors')}
          >
            <Ionicons name="medical" size={24} color="#FFFFFF" />
            <Text style={styles.actionText}>Book Appointment</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.success }]}
            onPress={() => router.push('/(tabs)/exercises')}
          >
            <Ionicons name="fitness" size={24} color="#FFFFFF" />
            <Text style={styles.actionText}>Start Exercise</Text>
          </TouchableOpacity>
        </View>

        {/* Dashboard Access */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.dashboardCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => router.push('/dashboard')}
          >
            <View style={styles.dashboardHeader}>
              <View style={[styles.dashboardIcon, { backgroundColor: colors.warning + '20' }]}>
                <Ionicons name="analytics" size={24} color={colors.warning} />
              </View>
              <View style={styles.dashboardInfo}>
                <Text style={[styles.dashboardTitle, { color: colors.text }]}>Your Progress Dashboard</Text>
                <Text style={[styles.dashboardSubtitle, { color: colors.icon }]}>
                  View detailed insights and statistics
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.icon} />
            </View>
            <View style={styles.dashboardStats}>
              <View style={styles.dashboardStat}>
                <Text style={[styles.dashboardStatValue, { color: colors.success }]}>92%</Text>
                <Text style={[styles.dashboardStatLabel, { color: colors.icon }]}>Attendance</Text>
              </View>
              <View style={styles.dashboardStat}>
                <Text style={[styles.dashboardStatValue, { color: colors.primary }]}>7.2</Text>
                <Text style={[styles.dashboardStatLabel, { color: colors.icon }]}>Mood Avg</Text>
              </View>
              <View style={styles.dashboardStat}>
                <Text style={[styles.dashboardStatValue, { color: colors.warning }]}>78%</Text>
                <Text style={[styles.dashboardStatLabel, { color: colors.icon }]}>Exercises</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>



        {/* Upcoming Appointment */}
        {upcomingAppointment && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Upcoming Appointment</Text>
            <Card>
              <View style={styles.appointmentHeader}>
                <Avatar
                  source="https://unsplash.com/photos/woman-in-red-shirt-wearing-white-and-black-knit-cap-QwOQnsUj0xI"
                  name={upcomingAppointment.doctorName}
                  size={50}
                />
                <View style={styles.appointmentInfo}>
                  <Text style={[styles.doctorName, { color: colors.text }]}>
                    {upcomingAppointment.doctorName}
                  </Text>
                  <Text style={[styles.appointmentDate, { color: colors.icon }]}>
                    {upcomingAppointment.date} at {upcomingAppointment.time}
                  </Text>
                  <View style={styles.appointmentType}>
                    <Ionicons
                      name={upcomingAppointment.type === 'video' ? 'videocam' : 'location'}
                      size={16}
                      color={colors.primary}
                    />
                    <Text style={[styles.typeText, { color: colors.primary }]}>
                      {upcomingAppointment.type === 'video' ? 'Video Call' : 'In Person'}
                    </Text>
                  </View>
                </View>
                {upcomingAppointment.type === 'video' && (
                  <TouchableOpacity
                    style={[styles.joinCallButton, { backgroundColor: colors.success }]}
                    onPress={() => router.push(`/video-call/${upcomingAppointment.id}`)}
                  >
                    <Ionicons name="videocam" size={16} color="#FFFFFF" />
                    <Text style={styles.joinCallText}>Join Call</Text>
                  </TouchableOpacity>
                )}
              </View>
            </Card>
          </View>
        )}

        {/* Mental Health Tips */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Today's Tip</Text>
          <Card style={[styles.tipCard, { backgroundColor: colors.primary + '10' }]}>
            <View style={styles.tipHeader}>
              <Ionicons name="bulb" size={24} color={colors.primary} />
              <Text style={[styles.tipTitle, { color: colors.primary }]}>Mindful Breathing</Text>
            </View>
            <Text style={[styles.tipText, { color: colors.text }]}>
              Take 5 deep breaths when you feel overwhelmed. Breathe in for 4 counts, hold for 4, and exhale for 6.
            </Text>
          </Card>
        </View>

        {/* Featured Doctor */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Featured Doctor</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/doctors')}>
              <Text style={[styles.seeAll, { color: colors.primary }]}>See All</Text>
            </TouchableOpacity>
          </View>
          <Card>
            <TouchableOpacity
              onPress={() => router.push(`/doctor-details/${featuredDoctor.id}`)}
              style={styles.doctorCard}
            >
              <Avatar source={featuredDoctor.avatar} name={featuredDoctor.name} size={60} />
              <View style={styles.doctorInfo}>
                <Text style={[styles.doctorName, { color: colors.text }]}>{featuredDoctor.name}</Text>
                <Text style={[styles.doctorSpecialty, { color: colors.icon }]}>{featuredDoctor.specialty}</Text>
                <View style={styles.rating}>
                  <Ionicons name="star" size={16} color="#F59E0B" />
                  <Text style={[styles.ratingText, { color: colors.text }]}>
                    {featuredDoctor.rating} ({featuredDoctor.experience}+ years)
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.icon} />
            </TouchableOpacity>
          </Card>
        </View>

        {/* Mood Tracker */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>How are you feeling today?</Text>
          <View style={styles.moodTracker}>
            {['😢', '😕', '😐', '🙂', '😊'].map((emoji, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.moodButton,
                  selectedMood === index && { backgroundColor: colors.primary + '30', borderWidth: 2, borderColor: colors.primary }
                ]}
                onPress={() => handleMoodSelect(index)}
              >
                <Text style={styles.moodEmoji}>{emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>
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
    paddingBottom: 10,
  },
  greeting: {
    fontSize: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
  },
  actionText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '500',
  },
  appointmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
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
  appointmentDate: {
    fontSize: 14,
    marginBottom: 8,
  },
  appointmentType: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeText: {
    fontSize: 14,
    marginLeft: 4,
    fontWeight: '500',
  },
  tipCard: {
    borderWidth: 1,
    borderColor: 'transparent',
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  tipText: {
    fontSize: 14,
    lineHeight: 20,
  },
  doctorCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  doctorInfo: {
    flex: 1,
    marginLeft: 16,
  },
  doctorSpecialty: {
    fontSize: 14,
    marginBottom: 4,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    marginLeft: 4,
  },
  moodTracker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  moodButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
  },
  moodEmoji: {
    fontSize: 24,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  joinCallButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
    marginTop: 12,
  },
  joinCallText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  dashboardCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  dashboardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  dashboardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  dashboardInfo: {
    flex: 1,
  },
  dashboardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  dashboardSubtitle: {
    fontSize: 14,
  },
  dashboardStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  dashboardStat: {
    alignItems: 'center',
  },
  dashboardStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  dashboardStatLabel: {
    fontSize: 12,
  },

});