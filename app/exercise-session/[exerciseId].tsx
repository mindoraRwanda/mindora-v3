import { mockExercises } from '@/constants/Data';
import { Colors } from '@/constants/theme';
import { useThemeColorScheme } from '@/hooks/use-theme-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ExerciseSessionScreen() {
    const { exerciseId } = useLocalSearchParams();
    const colorScheme = useThemeColorScheme();
    const colors = Colors[colorScheme ?? 'light'];

    const exercise = mockExercises.find(ex => ex.id === exerciseId);

    const [isActive, setIsActive] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [currentStep, setCurrentStep] = useState(0);
    const [breatheAnimation] = useState(new Animated.Value(1));

    if (!exercise) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
                <Text>Exercise not found</Text>
            </SafeAreaView>
        );
    }

    const exerciseSteps = getExerciseSteps(exercise.category);

    useEffect(() => {
        setTimeRemaining(exercise.duration * 60); // Convert to seconds
    }, [exercise.duration]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isActive && timeRemaining > 0) {
            interval = setInterval(() => {
                setTimeRemaining(time => time - 1);
            }, 1000);
        } else if (timeRemaining === 0 && isActive) {
            handleExerciseComplete();
        }
        return () => clearInterval(interval);
    }, [isActive, timeRemaining]);

    useEffect(() => {
        if (exercise.category === 'breathing' && isActive) {
            startBreathingAnimation();
        }
    }, [isActive, currentStep]);

    const startBreathingAnimation = () => {
        const breatheIn = () => {
            Animated.timing(breatheAnimation, {
                toValue: 1.5,
                duration: 4000,
                useNativeDriver: true,
            }).start(() => {
                // Hold
                setTimeout(() => {
                    breatheOut();
                }, 2000);
            });
        };

        const breatheOut = () => {
            Animated.timing(breatheAnimation, {
                toValue: 1,
                duration: 6000,
                useNativeDriver: true,
            }).start(() => {
                if (isActive) {
                    setTimeout(breatheIn, 1000);
                }
            });
        };

        breatheIn();
    };

    const handleStart = () => {
        setIsActive(true);
    };

    const handlePause = () => {
        setIsActive(false);
    };

    const handleStop = () => {
        Alert.alert(
            'Stop Exercise',
            'Are you sure you want to stop the exercise?',
            [
                { text: 'Continue', style: 'cancel' },
                {
                    text: 'Stop',
                    style: 'destructive',
                    onPress: () => router.back()
                }
            ]
        );
    };

    const handleExerciseComplete = () => {
        setIsActive(false);
        Alert.alert(
            'Exercise Complete!',
            `Great job! You've completed the ${exercise.title} exercise.`,
            [
                { text: 'Done', onPress: () => router.back() }
            ]
        );
    };

    const handleNextStep = () => {
        if (currentStep < exerciseSteps.length - 1) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const currentStepData = exerciseSteps[currentStep];

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>{exercise.title}</Text>
                <TouchableOpacity onPress={handleStop}>
                    <Ionicons name="stop" size={24} color={colors.error} />
                </TouchableOpacity>
            </View>

            {/* Timer */}
            <View style={styles.timerContainer}>
                <Text style={[styles.timer, { color: colors.primary }]}>
                    {formatTime(timeRemaining)}
                </Text>
                <Text style={[styles.timerLabel, { color: colors.icon }]}>
                    {isActive ? 'Time Remaining' : 'Duration'}
                </Text>
            </View>

            {/* Exercise Content */}
            <View style={styles.content}>
                {exercise.category === 'breathing' && (
                    <View style={styles.breathingContainer}>
                        <Animated.View
                            style={[
                                styles.breathingCircle,
                                {
                                    backgroundColor: colors.primary + '20',
                                    borderColor: colors.primary,
                                    transform: [{ scale: breatheAnimation }],
                                },
                            ]}
                        >
                            <Text style={[styles.breathingText, { color: colors.primary }]}>
                                {isActive ? (currentStep % 2 === 0 ? 'Breathe In' : 'Breathe Out') : 'Ready?'}
                            </Text>
                        </Animated.View>
                    </View>
                )}

                {exercise.category !== 'breathing' && (
                    <View style={styles.stepContainer}>
                        <Text style={[styles.stepTitle, { color: colors.text }]}>
                            Step {currentStep + 1} of {exerciseSteps.length}
                        </Text>
                        <Text style={[styles.stepDescription, { color: colors.text }]}>
                            {currentStepData.description}
                        </Text>

                        {currentStepData.instruction && (
                            <Text style={[styles.stepInstruction, { color: colors.icon }]}>
                                {currentStepData.instruction}
                            </Text>
                        )}

                        <View style={styles.stepNavigation}>
                            <TouchableOpacity
                                style={[
                                    styles.stepButton,
                                    { backgroundColor: currentStep === 0 ? colors.secondary : colors.primary }
                                ]}
                                onPress={handlePrevStep}
                                disabled={currentStep === 0}
                            >
                                <Ionicons
                                    name="chevron-back"
                                    size={20}
                                    color={currentStep === 0 ? colors.icon : '#FFFFFF'}
                                />
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.stepButton,
                                    { backgroundColor: currentStep === exerciseSteps.length - 1 ? colors.secondary : colors.primary }
                                ]}
                                onPress={handleNextStep}
                                disabled={currentStep === exerciseSteps.length - 1}
                            >
                                <Ionicons
                                    name="chevron-forward"
                                    size={20}
                                    color={currentStep === exerciseSteps.length - 1 ? colors.icon : '#FFFFFF'}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </View>

            {/* Progress */}
            <View style={styles.progressContainer}>
                <View style={[styles.progressBar, { backgroundColor: colors.secondary }]}>
                    <View
                        style={[
                            styles.progressFill,
                            {
                                backgroundColor: colors.primary,
                                width: `${((exercise.duration * 60 - timeRemaining) / (exercise.duration * 60)) * 100}%`,
                            },
                        ]}
                    />
                </View>
                <Text style={[styles.progressText, { color: colors.icon }]}>
                    {Math.round(((exercise.duration * 60 - timeRemaining) / (exercise.duration * 60)) * 100)}% Complete
                </Text>
            </View>

            {/* Controls */}
            <View style={styles.controls}>
                {!isActive ? (
                    <TouchableOpacity
                        style={[styles.playButton, { backgroundColor: colors.primary }]}
                        onPress={handleStart}
                    >
                        <Ionicons name="play" size={32} color="#FFFFFF" />
                        <Text style={styles.playButtonText}>Start Exercise</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        style={[styles.pauseButton, { backgroundColor: colors.warning }]}
                        onPress={handlePause}
                    >
                        <Ionicons name="pause" size={32} color="#FFFFFF" />
                        <Text style={styles.pauseButtonText}>Pause</Text>
                    </TouchableOpacity>
                )}
            </View>
        </SafeAreaView>
    );
}

function getExerciseSteps(category: string) {
    switch (category) {
        case 'breathing':
            return [
                { description: 'Find a comfortable position', instruction: 'Sit or lie down comfortably' },
                { description: 'Close your eyes', instruction: 'Gently close your eyes and relax' },
                { description: 'Focus on your breath', instruction: 'Notice your natural breathing pattern' },
                { description: 'Begin controlled breathing', instruction: 'Follow the breathing guide' },
            ];
        case 'meditation':
            return [
                { description: 'Prepare your space', instruction: 'Find a quiet, comfortable place' },
                { description: 'Set your intention', instruction: 'Think about why you\'re meditating today' },
                { description: 'Focus on the present', instruction: 'Bring your attention to the here and now' },
                { description: 'Observe your thoughts', instruction: 'Notice thoughts without judgment' },
                { description: 'Return to breath', instruction: 'When distracted, gently return to breathing' },
            ];
        case 'mindfulness':
            return [
                { description: 'Ground yourself', instruction: 'Feel your connection to the present moment' },
                { description: '5-4-3-2-1 technique', instruction: '5 things you see, 4 you hear, 3 you feel, 2 you smell, 1 you taste' },
                { description: 'Body awareness', instruction: 'Notice sensations throughout your body' },
                { description: 'Emotional check-in', instruction: 'Acknowledge how you\'re feeling right now' },
            ];
        case 'relaxation':
            return [
                { description: 'Progressive muscle relaxation', instruction: 'Tense and release each muscle group' },
                { description: 'Start with your toes', instruction: 'Tense for 5 seconds, then release' },
                { description: 'Move up your body', instruction: 'Continue with calves, thighs, abdomen' },
                { description: 'Arms and shoulders', instruction: 'Tense and release your upper body' },
                { description: 'Face and head', instruction: 'Finish with facial muscles and scalp' },
            ];
        default:
            return [{ description: 'Follow the exercise', instruction: 'Complete the guided session' }];
    }
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
        fontSize: 18,
        fontWeight: '600',
    },
    timerContainer: {
        alignItems: 'center',
        marginVertical: 20,
    },
    timer: {
        fontSize: 48,
        fontWeight: 'bold',
    },
    timerLabel: {
        fontSize: 16,
        marginTop: 4,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    breathingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    breathingCircle: {
        width: 200,
        height: 200,
        borderRadius: 100,
        borderWidth: 3,
        alignItems: 'center',
        justifyContent: 'center',
    },
    breathingText: {
        fontSize: 20,
        fontWeight: '600',
    },
    stepContainer: {
        alignItems: 'center',
    },
    stepTitle: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 16,
    },
    stepDescription: {
        fontSize: 24,
        fontWeight: '500',
        textAlign: 'center',
        marginBottom: 12,
    },
    stepInstruction: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 32,
    },
    stepNavigation: {
        flexDirection: 'row',
        gap: 20,
    },
    stepButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
    },
    progressContainer: {
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    progressBar: {
        height: 6,
        borderRadius: 3,
        marginBottom: 8,
    },
    progressFill: {
        height: '100%',
        borderRadius: 3,
    },
    progressText: {
        fontSize: 14,
        textAlign: 'center',
    },
    controls: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    playButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 16,
        gap: 12,
    },
    playButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
    },
    pauseButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 16,
        gap: 12,
    },
    pauseButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
    },
});