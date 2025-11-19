import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useThemeColorScheme } from '@/hooks/use-theme-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const onboardingData = [
    {
        icon: 'heart',
        title: 'Welcome to Mindora',
        description: 'Your personal mental health companion. Track your mood, connect with professionals, and improve your wellbeing.',
        color: '#8B5CF6',
    },
    {
        icon: 'people',
        title: 'Connect with Experts',
        description: 'Book video or in-person sessions with licensed therapists and counselors who care about your mental health.',
        color: '#10B981',
    },
    {
        icon: 'fitness',
        title: 'Practice Daily Exercises',
        description: 'Access guided meditation, breathing exercises, and mindfulness activities designed to reduce stress.',
        color: '#F59E0B',
    },
    {
        icon: 'analytics',
        title: 'Track Your Progress',
        description: 'Monitor your mental health journey with detailed insights, mood tracking, and personalized recommendations.',
        color: '#3B82F6',
    },
];

export default function OnboardingScreen() {
    const colorScheme = useThemeColorScheme();
    const colors = Colors[colorScheme ?? 'light'];
    const { updateProfile, user } = useAuth();
    const [currentIndex, setCurrentIndex] = useState(0);

    const handleNext = () => {
        if (currentIndex < onboardingData.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            handleComplete();
        }
    };

    const handleSkip = () => {
        handleComplete();
    };

    const handleComplete = async () => {
        if (user) {
            await updateProfile({
                ...user,
                hasCompletedOnboarding: true,
            } as any);
        }
        router.replace('/(tabs)');
    };

    const currentSlide = onboardingData[currentIndex];

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.content}>
                {/* Skip Button */}
                {currentIndex < onboardingData.length - 1 && (
                    <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
                        <Text style={[styles.skipText, { color: colors.icon }]}>Skip</Text>
                    </TouchableOpacity>
                )}

                {/* Icon */}
                <View style={[styles.iconContainer, { backgroundColor: currentSlide.color + '20' }]}>
                    <Ionicons name={currentSlide.icon as any} size={80} color={currentSlide.color} />
                </View>

                {/* Title */}
                <Text style={[styles.title, { color: colors.text }]}>{currentSlide.title}</Text>

                {/* Description */}
                <Text style={[styles.description, { color: colors.icon }]}>{currentSlide.description}</Text>

                {/* Pagination Dots */}
                <View style={styles.pagination}>
                    {onboardingData.map((_, index) => (
                        <View
                            key={index}
                            style={[
                                styles.dot,
                                {
                                    backgroundColor: index === currentIndex ? currentSlide.color : colors.border,
                                    width: index === currentIndex ? 24 : 8,
                                },
                            ]}
                        />
                    ))}
                </View>

                {/* Next Button */}
                <Button
                    title={currentIndex === onboardingData.length - 1 ? "Get Started" : "Next"}
                    onPress={handleNext}
                    style={[styles.nextButton, { backgroundColor: currentSlide.color }]}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: 32,
        paddingVertical: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    skipButton: {
        position: 'absolute',
        top: 40,
        right: 32,
    },
    skipText: {
        fontSize: 16,
        fontWeight: '500',
    },
    iconContainer: {
        width: 160,
        height: 160,
        borderRadius: 80,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 48,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 16,
    },
    description: {
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 48,
    },
    pagination: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 48,
    },
    dot: {
        height: 8,
        borderRadius: 4,
    },
    nextButton: {
        width: '100%',
    },
});
