import { Exercise } from '@/constants/Types';
import { Colors } from '@/constants/theme';
import { useThemeColorScheme } from '@/hooks/use-theme-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Card } from './ui/Card';

interface ExerciseCardProps {
    exercise: Exercise;
    onPress: () => void;
}

export function ExerciseCard({ exercise, onPress }: ExerciseCardProps) {
    const colorScheme = useThemeColorScheme();
    const colors = Colors[colorScheme ?? 'light'];

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'beginner': return colors.success;
            case 'intermediate': return colors.warning;
            case 'advanced': return colors.error;
            default: return colors.icon;
        }
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'breathing': return 'leaf-outline';
            case 'meditation': return 'flower-outline';
            case 'mindfulness': return 'eye-outline';
            case 'relaxation': return 'moon-outline';
            default: return 'heart-outline';
        }
    };

    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
            <Card style={styles.card}>
                <Image
                    source={{ uri: exercise.image }}
                    style={styles.image}
                    contentFit="cover"
                />
                <View style={styles.content}>
                    <View style={styles.header}>
                        <View style={styles.titleRow}>
                            <Ionicons
                                name={getCategoryIcon(exercise.category) as any}
                                size={20}
                                color={colors.primary}
                            />
                            <Text style={[styles.title, { color: colors.text }]}>{exercise.title}</Text>
                        </View>
                        <View style={[styles.difficulty, { backgroundColor: getDifficultyColor(exercise.difficulty) + '20' }]}>
                            <Text style={[styles.difficultyText, { color: getDifficultyColor(exercise.difficulty) }]}>
                                {exercise.difficulty}
                            </Text>
                        </View>
                    </View>

                    <Text style={[styles.description, { color: colors.icon }]} numberOfLines={2}>
                        {exercise.description}
                    </Text>

                    <View style={styles.footer}>
                        <View style={styles.duration}>
                            <Ionicons name="time-outline" size={16} color={colors.icon} />
                            <Text style={[styles.durationText, { color: colors.icon }]}>
                                {exercise.duration} min
                            </Text>
                        </View>
                    </View>
                </View>
            </Card>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        marginBottom: 16,
        padding: 0,
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: 120,
    },
    content: {
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    difficulty: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    difficultyText: {
        fontSize: 12,
        fontWeight: '500',
        textTransform: 'capitalize',
    },
    description: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 12,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    duration: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    durationText: {
        fontSize: 14,
        marginLeft: 4,
    },
});