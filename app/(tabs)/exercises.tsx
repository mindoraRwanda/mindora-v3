import { ExerciseCard } from '@/components/ExerciseCard';
import { Card } from '@/components/ui/Card';
import { mockExercises } from '@/constants/Data';
import { Colors } from '@/constants/theme';
import { useThemeColorScheme } from '@/hooks/use-theme-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ExercisesScreen() {
    const colorScheme = useThemeColorScheme();
    const colors = Colors[colorScheme ?? 'light'];
    const [selectedCategory, setSelectedCategory] = useState('all');

    const categories = [
        { id: 'all', name: 'All', icon: 'grid-outline' },
        { id: 'breathing', name: 'Breathing', icon: 'leaf-outline' },
        { id: 'meditation', name: 'Meditation', icon: 'flower-outline' },
        { id: 'mindfulness', name: 'Mindfulness', icon: 'eye-outline' },
        { id: 'relaxation', name: 'Relaxation', icon: 'moon-outline' },
    ];

    const filteredExercises = selectedCategory === 'all'
        ? mockExercises
        : mockExercises.filter(exercise => exercise.category === selectedCategory);

    const handleStartExercise = (exerciseId: string) => {
        router.push(`/exercise-session/${exerciseId}`);
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={[styles.title, { color: colors.text }]}>Mental Health Exercises</Text>
                    <Text style={[styles.subtitle, { color: colors.icon }]}>
                        Practice mindfulness and relaxation techniques
                    </Text>
                </View>

                {/* Daily Progress */}
                <View style={styles.section}>
                    <Card style={[styles.progressCard, { backgroundColor: colors.primary + '10' }]}>
                        <View style={styles.progressHeader}>
                            <View>
                                <Text style={[styles.progressTitle, { color: colors.text }]}>Today's Progress</Text>
                                <Text style={[styles.progressSubtitle, { color: colors.icon }]}>
                                    Keep up the great work!
                                </Text>
                            </View>
                            <View style={[styles.progressCircle, { borderColor: colors.primary }]}>
                                <Text style={[styles.progressText, { color: colors.primary }]}>3/5</Text>
                            </View>
                        </View>
                        <View style={styles.progressStats}>
                            <View style={styles.stat}>
                                <Text style={[styles.statNumber, { color: colors.text }]}>25</Text>
                                <Text style={[styles.statLabel, { color: colors.icon }]}>Minutes</Text>
                            </View>
                            <View style={styles.stat}>
                                <Text style={[styles.statNumber, { color: colors.text }]}>3</Text>
                                <Text style={[styles.statLabel, { color: colors.icon }]}>Exercises</Text>
                            </View>
                            <View style={styles.stat}>
                                <Text style={[styles.statNumber, { color: colors.text }]}>7</Text>
                                <Text style={[styles.statLabel, { color: colors.icon }]}>Day Streak</Text>
                            </View>
                        </View>
                    </Card>
                </View>

                {/* Categories */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Categories</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View style={styles.categoriesContainer}>
                            {categories.map((category) => (
                                <TouchableOpacity
                                    key={category.id}
                                    style={[
                                        styles.categoryChip,
                                        {
                                            backgroundColor: selectedCategory === category.id ? colors.primary : colors.secondary,
                                            borderColor: colors.border,
                                        },
                                    ]}
                                    onPress={() => setSelectedCategory(category.id)}
                                >
                                    <Ionicons
                                        name={category.icon as any}
                                        size={20}
                                        color={selectedCategory === category.id ? '#FFFFFF' : colors.icon}
                                    />
                                    <Text
                                        style={[
                                            styles.categoryText,
                                            { color: selectedCategory === category.id ? '#FFFFFF' : colors.text },
                                        ]}
                                    >
                                        {category.name}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </ScrollView>
                </View>

                {/* Quick Start */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Start</Text>
                    <View style={styles.quickStartContainer}>
                        <TouchableOpacity
                            style={[styles.quickStartButton, { backgroundColor: colors.success }]}
                            onPress={() => router.push('/exercise-session/1')}
                        >
                            <Ionicons name="play" size={24} color="#FFFFFF" />
                            <Text style={styles.quickStartText}>5-Min Breathing</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.quickStartButton, { backgroundColor: colors.warning }]}
                            onPress={() => router.push('/exercise-session/2')}
                        >
                            <Ionicons name="flower" size={24} color="#FFFFFF" />
                            <Text style={styles.quickStartText}>10-Min Meditation</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Exercises List */}
                <View style={styles.section}>
                    <View style={styles.exercisesHeader}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>
                            {selectedCategory === 'all' ? 'All Exercises' : `${categories.find(c => c.id === selectedCategory)?.name} Exercises`}
                        </Text>
                        <Text style={[styles.exerciseCount, { color: colors.icon }]}>
                            {filteredExercises.length} exercises
                        </Text>
                    </View>

                    {filteredExercises.map((exercise) => (
                        <ExerciseCard
                            key={exercise.id}
                            exercise={exercise}
                            onPress={() => handleStartExercise(exercise.id)}
                        />
                    ))}
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
    section: {
        paddingHorizontal: 20,
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 16,
    },
    progressCard: {
        borderWidth: 1,
        borderColor: 'transparent',
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    progressTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 4,
    },
    progressSubtitle: {
        fontSize: 14,
    },
    progressCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        borderWidth: 3,
        alignItems: 'center',
        justifyContent: 'center',
    },
    progressText: {
        fontSize: 16,
        fontWeight: '600',
    },
    progressStats: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    stat: {
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
    },
    categoriesContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    categoryChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
        gap: 8,
    },
    categoryText: {
        fontSize: 14,
        fontWeight: '500',
    },
    quickStartContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    quickStartButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 16,
        gap: 8,
    },
    quickStartText: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 14,
    },
    exercisesHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    exerciseCount: {
        fontSize: 14,
    },
});