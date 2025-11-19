import { Card } from '@/components/ui/Card';
import { mockExercises } from '@/constants/Data';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useThemeColorScheme } from '@/hooks/use-theme-color-scheme';
import { logActivity } from '@/utils/activityTracker';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Animated, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ExerciseSessionScreen() {
    const params = useLocalSearchParams();
    const exerciseId = Array.isArray(params.exerciseId) ? params.exerciseId[0] : params.exerciseId;
    const colorScheme = useThemeColorScheme();
    const colors = Colors[colorScheme ?? 'light'];
    const { user, updateProfile } = useAuth();

    const exercise = mockExercises.find(ex => ex.id === exerciseId);

    console.log('Exercise ID:', exerciseId);
    console.log('Found exercise:', exercise);

    const [isActive, setIsActive] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [currentStep, setCurrentStep] = useState(0);
    const [breatheAnimation] = useState(new Animated.Value(1));
    const [breathePhase, setbreathePhase] = useState<'in' | 'hold' | 'out' | 'rest'>('rest');
    const [hasStarted, setHasStarted] = useState(false);
    const startTimeRef = useRef<number>(0);

    if (!exercise) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>Exercise Not Found</Text>
                    <View style={{ width: 24 }} />
                </View>
                <View style={styles.notFoundContainer}>
                    <Ionicons name="alert-circle-outline" size={64} color={colors.icon} />
                    <Text style={[styles.notFoundTitle, { color: colors.text }]}>Exercise Not Found</Text>
                    <Text style={[styles.notFoundText, { color: colors.icon }]}>
                        The exercise you're looking for doesn't exist.{'\n'}
                        Exercise ID: {exerciseId || 'undefined'}
                    </Text>
                    <TouchableOpacity
                        style={[styles.backButton, { backgroundColor: colors.primary }]}
                        onPress={() => router.back()}
                    >
                        <Text style={styles.backButtonText}>Go Back</Text>
                    </TouchableOpacity>
                </View>
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
        } else if (!isActive) {
            setbreathePhase('rest');
            breatheAnimation.setValue(1);
        }
    }, [isActive, currentStep]);

    const startBreathingAnimation = () => {
        const breatheIn = () => {
            setbreathePhase('in');
            Animated.timing(breatheAnimation, {
                toValue: 1.5,
                duration: 4000,
                useNativeDriver: true,
            }).start(() => {
                if (!isActive) return;
                // Hold
                setbreathePhase('hold');
                setTimeout(() => {
                    if (!isActive) return;
                    breatheOut();
                }, 2000);
            });
        };

        const breatheOut = () => {
            setbreathePhase('out');
            Animated.timing(breatheAnimation, {
                toValue: 1,
                duration: 6000,
                useNativeDriver: true,
            }).start(() => {
                if (!isActive) return;
                setbreathePhase('rest');
                setTimeout(() => {
                    if (isActive) breatheIn();
                }, 1000);
            });
        };

        breatheIn();
    };

    const handleStart = async () => {
        try {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } catch (error) {
            // Haptics not available
        }

        setIsActive(true);
        setHasStarted(true);
        startTimeRef.current = Date.now();

        // Log activity when starting
        if (user && exercise) {
            await logActivity(
                user.id,
                'exercise',
                'Exercise Started',
                `Started ${exercise.title} - ${exercise.duration} min ${exercise.category}`,
                'play-circle-outline',
                '#10B981'
            );
        }
    };

    const handlePause = async () => {
        try {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } catch (error) {
            // Haptics not available
        }
        setIsActive(false);
    };

    const handleStop = () => {
        Alert.alert(
            'Stop Exercise',
            'Are you sure you want to stop the exercise? Your progress will not be saved.',
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

    const handleExerciseComplete = async () => {
        setIsActive(false);

        // Calculate time spent
        const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000 / 60); // in minutes

        // Update user stats
        if (user && exercise) {
            await updateProfile({
                stats: {
                    ...user.stats,
                    exercises: user.stats.exercises + 1,
                }
            });

            // Log completion activity
            await logActivity(
                user.id,
                'exercise',
                'Exercise Completed! 🎉',
                `Completed ${exercise.title} - ${timeSpent} minutes of ${exercise.category}`,
                'checkmark-circle-outline',
                '#10B981'
            );
        }

        Alert.alert(
            '🎉 Exercise Complete!',
            `Great job! You've completed the ${exercise.title} exercise.\n\nTime spent: ${timeSpent} minutes\nExercises completed: ${(user?.stats.exercises || 0) + 1}`,
            [
                {
                    text: 'View Progress',
                    onPress: () => {
                        router.back();
                        setTimeout(() => router.push('/dashboard'), 100);
                    }
                },
                { text: 'Done', onPress: () => router.back() }
            ]
        );
    };

    const handleNextStep = async () => {
        if (currentStep < exerciseSteps.length - 1) {
            try {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            } catch (error) {
                // Haptics not available
            }
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrevStep = async () => {
        if (currentStep > 0) {
            try {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            } catch (error) {
                // Haptics not available
            }
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
            <ScrollView showsVerticalScrollIndicator={false}>
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

                {/* Exercise Info */}
                {!hasStarted && (
                    <View style={styles.infoSection}>
                        <Card style={[styles.infoCard, { backgroundColor: colors.primary + '10' }]}>
                            <View style={styles.infoRow}>
                                <View style={[styles.infoIcon, { backgroundColor: colors.primary }]}>
                                    <Ionicons name="time" size={20} color="#FFFFFF" />
                                </View>
                                <View style={styles.infoContent}>
                                    <Text style={[styles.infoLabel, { color: colors.icon }]}>Duration</Text>
                                    <Text style={[styles.infoValue, { color: colors.text }]}>{exercise.duration} minutes</Text>
                                </View>
                            </View>
                            <View style={styles.infoRow}>
                                <View style={[styles.infoIcon, { backgroundColor: colors.success }]}>
                                    <Ionicons name="speedometer" size={20} color="#FFFFFF" />
                                </View>
                                <View style={styles.infoContent}>
                                    <Text style={[styles.infoLabel, { color: colors.icon }]}>Difficulty</Text>
                                    <Text style={[styles.infoValue, { color: colors.text }]}>{exercise.difficulty}</Text>
                                </View>
                            </View>
                            <View style={styles.infoRow}>
                                <View style={[styles.infoIcon, { backgroundColor: colors.warning }]}>
                                    <Ionicons name="leaf" size={20} color="#FFFFFF" />
                                </View>
                                <View style={styles.infoContent}>
                                    <Text style={[styles.infoLabel, { color: colors.icon }]}>Category</Text>
                                    <Text style={[styles.infoValue, { color: colors.text }]}>{exercise.category}</Text>
                                </View>
                            </View>
                        </Card>
                        <Text style={[styles.description, { color: colors.text }]}>{exercise.description}</Text>
                    </View>
                )}

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
                                <Ionicons
                                    name="leaf"
                                    size={48}
                                    color={colors.primary}
                                    style={{ marginBottom: 12 }}
                                />
                                <Text style={[styles.breathingText, { color: colors.primary }]}>
                                    {!isActive && !hasStarted && 'Ready?'}
                                    {!isActive && hasStarted && 'Paused'}
                                    {isActive && breathePhase === 'in' && 'Breathe In'}
                                    {isActive && breathePhase === 'hold' && 'Hold'}
                                    {isActive && breathePhase === 'out' && 'Breathe Out'}
                                    {isActive && breathePhase === 'rest' && 'Rest'}
                                </Text>
                                {isActive && (
                                    <Text style={[styles.breathingSubtext, { color: colors.icon }]}>
                                        {breathePhase === 'in' && 'Inhale slowly through your nose'}
                                        {breathePhase === 'hold' && 'Hold your breath gently'}
                                        {breathePhase === 'out' && 'Exhale slowly through your mouth'}
                                        {breathePhase === 'rest' && 'Relax and prepare'}
                                    </Text>
                                )}
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
                            <Text style={styles.playButtonText}>{hasStarted ? 'Resume' : 'Start Exercise'}</Text>
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

                {/* Tips */}
                {hasStarted && (
                    <View style={styles.tipsSection}>
                        <Card>
                            <View style={styles.tipHeader}>
                                <Ionicons name="bulb-outline" size={20} color={colors.primary} />
                                <Text style={[styles.tipTitle, { color: colors.text }]}>Tip</Text>
                            </View>
                            <Text style={[styles.tipText, { color: colors.icon }]}>
                                {exercise.category === 'breathing' && 'Focus on the rhythm of your breath. Let thoughts pass without judgment.'}
                                {exercise.category === 'meditation' && 'If your mind wanders, gently bring your attention back to the present moment.'}
                                {exercise.category === 'mindfulness' && 'Notice sensations without trying to change them. Simply observe.'}
                                {exercise.category === 'relaxation' && 'Release tension with each exhale. Feel your body becoming heavier and more relaxed.'}
                            </Text>
                        </Card>
                    </View>
                )}
            </ScrollView>
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
    infoSection: {
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    infoCard: {
        marginBottom: 16,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    infoIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    infoContent: {
        flex: 1,
    },
    infoLabel: {
        fontSize: 12,
        marginBottom: 2,
    },
    infoValue: {
        fontSize: 16,
        fontWeight: '600',
        textTransform: 'capitalize',
    },
    description: {
        fontSize: 14,
        lineHeight: 20,
        textAlign: 'center',
    },
    tipsSection: {
        paddingHorizontal: 20,
        marginTop: 20,
        marginBottom: 20,
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
    scrollContainer: {
        flex: 1,
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
        lineHeight: 20,
        marginBottom: 24,
    },
    backButton: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },
    backButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
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
        fontSize: 24,
        fontWeight: '600',
        textAlign: 'center',
    },
    breathingSubtext: {
        fontSize: 14,
        marginTop: 8,
        textAlign: 'center',
        paddingHorizontal: 20,
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