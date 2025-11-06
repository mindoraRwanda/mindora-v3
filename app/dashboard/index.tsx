import { Colors } from '@/constants/theme';
import { useThemeColorScheme } from '@/hooks/use-theme-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const screenWidth = Dimensions.get('window').width;

export default function DashboardScreen() {
    const colorScheme = useThemeColorScheme();
    const colors = Colors[colorScheme ?? 'light'];
    const [selectedPeriod, setSelectedPeriod] = useState('week');

    // Mock data for charts
    const moodData = [3, 4, 2, 5, 4, 3, 4];
    const moodLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const exerciseData = [8, 12, 15, 18];
    const exerciseLabels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];

    const periods = [
        { id: 'week', label: 'Week' },
        { id: 'month', label: 'Month' },
        { id: 'quarter', label: '3 Months' },
        { id: 'year', label: 'Year' }
    ];

    const progressMetrics = [
        {
            title: 'Mood Improvement',
            value: '23%',
            change: '+5%',
            icon: 'happy-outline',
            color: colors.success,
            description: 'Average mood score increased'
        },
        {
            title: 'Session Attendance',
            value: '92%',
            change: '+8%',
            icon: 'calendar-outline',
            color: colors.primary,
            description: 'Appointments attended on time'
        },
        {
            title: 'Exercise Completion',
            value: '78%',
            change: '+12%',
            icon: 'fitness-outline',
            color: colors.warning,
            description: 'Mindfulness exercises completed'
        },
        {
            title: 'Sleep Quality',
            value: '7.2/10',
            change: '+0.8',
            icon: 'moon-outline',
            color: colors.info || colors.primary,
            description: 'Average sleep quality rating'
        }
    ];

    const recentAchievements = [
        {
            title: '7-Day Streak',
            description: 'Completed daily mood tracking',
            icon: 'trophy',
            color: colors.warning,
            date: '2 days ago'
        },
        {
            title: 'Anxiety Reduction',
            description: '30% decrease in anxiety levels',
            icon: 'trending-down',
            color: colors.success,
            date: '1 week ago'
        },
        {
            title: 'Session Milestone',
            description: 'Completed 10th therapy session',
            icon: 'medical',
            color: colors.primary,
            date: '2 weeks ago'
        }
    ];

    // Custom Line Chart Component
    const LineChart = ({ data, labels }: { data: number[], labels: string[] }) => {
        const maxValue = Math.max(...data);
        const chartHeight = 150;
        const chartWidth = screenWidth - 80;

        return (
            <View style={styles.customChart}>
                <View style={styles.chartContainer}>
                    {data.map((value, index) => {
                        const height = (value / maxValue) * chartHeight;
                        const left = (index / (data.length - 1)) * (chartWidth - 20);

                        return (
                            <View key={index} style={styles.chartPointContainer}>
                                <View
                                    style={[
                                        styles.chartPoint,
                                        {
                                            left: left,
                                            bottom: height,
                                            backgroundColor: colors.primary,
                                        }
                                    ]}
                                />
                                <Text
                                    style={[
                                        styles.chartLabel,
                                        {
                                            left: left - 15,
                                            bottom: -20,
                                            color: colors.icon
                                        }
                                    ]}
                                >
                                    {labels[index]}
                                </Text>
                                <Text
                                    style={[
                                        styles.chartValue,
                                        {
                                            left: left - 10,
                                            bottom: height + 10,
                                            color: colors.text
                                        }
                                    ]}
                                >
                                    {value}
                                </Text>
                            </View>
                        );
                    })}
                </View>
            </View>
        );
    };

    // Custom Bar Chart Component
    const BarChart = ({ data, labels }: { data: number[], labels: string[] }) => {
        const maxValue = Math.max(...data);
        const chartHeight = 150;
        const barWidth = (screenWidth - 120) / data.length;

        return (
            <View style={styles.customChart}>
                <View style={styles.barChartContainer}>
                    {data.map((value, index) => {
                        const height = (value / maxValue) * chartHeight;

                        return (
                            <View key={index} style={styles.barContainer}>
                                <Text style={[styles.barValue, { color: colors.text }]}>{value}</Text>
                                <View
                                    style={[
                                        styles.bar,
                                        {
                                            height: height,
                                            width: barWidth - 10,
                                            backgroundColor: colors.primary,
                                        }
                                    ]}
                                />
                                <Text style={[styles.barLabel, { color: colors.icon }]}>
                                    {labels[index]}
                                </Text>
                            </View>
                        );
                    })}
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={[styles.title, { color: colors.text }]}>Your Progress</Text>
                        <Text style={[styles.subtitle, { color: colors.icon }]}>
                            Mental health journey insights
                        </Text>
                    </View>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="close" size={24} color={colors.icon} />
                    </TouchableOpacity>
                </View>

                {/* Period Selector */}
                <View style={styles.periodSelector}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View style={styles.periods}>
                            {periods.map((period) => (
                                <TouchableOpacity
                                    key={period.id}
                                    style={[
                                        styles.periodChip,
                                        {
                                            backgroundColor: selectedPeriod === period.id ? colors.primary : colors.card,
                                            borderColor: selectedPeriod === period.id ? colors.primary : colors.border,
                                        },
                                    ]}
                                    onPress={() => setSelectedPeriod(period.id)}
                                >
                                    <Text
                                        style={[
                                            styles.periodText,
                                            { color: selectedPeriod === period.id ? '#FFFFFF' : colors.text },
                                        ]}
                                    >
                                        {period.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </ScrollView>
                </View>

                {/* Progress Metrics */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Key Metrics</Text>
                    <View style={styles.metricsGrid}>
                        {progressMetrics.map((metric, index) => (
                            <View key={index} style={[styles.metricCard, { backgroundColor: colors.card }]}>
                                <View style={styles.metricHeader}>
                                    <View style={[styles.metricIcon, { backgroundColor: metric.color + '20' }]}>
                                        <Ionicons name={metric.icon as any} size={20} color={metric.color} />
                                    </View>
                                    <View style={[styles.changeIndicator, { backgroundColor: colors.success + '20' }]}>
                                        <Text style={[styles.changeText, { color: colors.success }]}>
                                            {metric.change}
                                        </Text>
                                    </View>
                                </View>
                                <Text style={[styles.metricValue, { color: colors.text }]}>{metric.value}</Text>
                                <Text style={[styles.metricTitle, { color: colors.text }]}>{metric.title}</Text>
                                <Text style={[styles.metricDescription, { color: colors.icon }]}>
                                    {metric.description}
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Mood Tracking Chart */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Mood Tracking</Text>
                    <View style={[styles.chartCard, { backgroundColor: colors.card }]}>
                        <LineChart data={moodData} labels={moodLabels} />
                        <Text style={[styles.chartDescription, { color: colors.icon }]}>
                            Daily mood ratings (1-5 scale)
                        </Text>
                    </View>
                </View>

                {/* Exercise Progress */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Exercise Progress</Text>
                    <View style={[styles.chartCard, { backgroundColor: colors.card }]}>
                        <BarChart data={exerciseData} labels={exerciseLabels} />
                        <Text style={[styles.chartDescription, { color: colors.icon }]}>
                            Weekly mindfulness exercises completed
                        </Text>
                    </View>
                </View>

                {/* Session Types */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Session Distribution</Text>
                    <View style={[styles.chartCard, { backgroundColor: colors.card }]}>
                        <View style={styles.pieChartContainer}>
                            <View style={styles.pieChartLegend}>
                                <View style={styles.legendItem}>
                                    <View style={[styles.legendColor, { backgroundColor: colors.primary }]} />
                                    <Text style={[styles.legendText, { color: colors.text }]}>Video Sessions (8)</Text>
                                </View>
                                <View style={styles.legendItem}>
                                    <View style={[styles.legendColor, { backgroundColor: colors.success }]} />
                                    <Text style={[styles.legendText, { color: colors.text }]}>In-Person (4)</Text>
                                </View>
                            </View>
                            <View style={styles.pieChartStats}>
                                <Text style={[styles.pieChartTotal, { color: colors.text }]}>12</Text>
                                <Text style={[styles.pieChartLabel, { color: colors.icon }]}>Total Sessions</Text>
                            </View>
                        </View>
                        <Text style={[styles.chartDescription, { color: colors.icon }]}>
                            Therapy session types this month
                        </Text>
                    </View>
                </View>

                {/* Recent Achievements */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Achievements</Text>
                    {recentAchievements.map((achievement, index) => (
                        <View key={index} style={[styles.achievementCard, { backgroundColor: colors.card }]}>
                            <View style={[styles.achievementIcon, { backgroundColor: achievement.color + '20' }]}>
                                <Ionicons name={achievement.icon as any} size={24} color={achievement.color} />
                            </View>
                            <View style={styles.achievementContent}>
                                <Text style={[styles.achievementTitle, { color: colors.text }]}>
                                    {achievement.title}
                                </Text>
                                <Text style={[styles.achievementDescription, { color: colors.icon }]}>
                                    {achievement.description}
                                </Text>
                                <Text style={[styles.achievementDate, { color: colors.icon }]}>
                                    {achievement.date}
                                </Text>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Goals Section */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Current Goals</Text>
                    <View style={[styles.goalCard, { backgroundColor: colors.card }]}>
                        <View style={styles.goalHeader}>
                            <Text style={[styles.goalTitle, { color: colors.text }]}>Weekly Mindfulness</Text>
                            <Text style={[styles.goalProgress, { color: colors.primary }]}>5/7 days</Text>
                        </View>
                        <View style={[styles.progressBar, { backgroundColor: colors.secondary }]}>
                            <View
                                style={[
                                    styles.progressFill,
                                    { backgroundColor: colors.primary, width: '71%' }
                                ]}
                            />
                        </View>
                        <Text style={[styles.goalDescription, { color: colors.icon }]}>
                            Complete daily mindfulness exercises
                        </Text>
                    </View>

                    <View style={[styles.goalCard, { backgroundColor: colors.card }]}>
                        <View style={styles.goalHeader}>
                            <Text style={[styles.goalTitle, { color: colors.text }]}>Mood Stability</Text>
                            <Text style={[styles.goalProgress, { color: colors.success }]}>On Track</Text>
                        </View>
                        <View style={[styles.progressBar, { backgroundColor: colors.secondary }]}>
                            <View
                                style={[
                                    styles.progressFill,
                                    { backgroundColor: colors.success, width: '85%' }
                                ]}
                            />
                        </View>
                        <Text style={[styles.goalDescription, { color: colors.icon }]}>
                            Maintain consistent mood ratings above 3
                        </Text>
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
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 16,
    },
    periodSelector: {
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    periods: {
        flexDirection: 'row',
        gap: 12,
    },
    periodChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
    },
    periodText: {
        fontSize: 14,
        fontWeight: '500',
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
    metricsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    metricCard: {
        width: (screenWidth - 60) / 2,
        padding: 16,
        borderRadius: 12,
    },
    metricHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    metricIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    changeIndicator: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
    },
    changeText: {
        fontSize: 10,
        fontWeight: '600',
    },
    metricValue: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    metricTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
    },
    metricDescription: {
        fontSize: 12,
        lineHeight: 16,
    },
    chartCard: {
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    chartDescription: {
        fontSize: 12,
        marginTop: 8,
        textAlign: 'center',
    },
    customChart: {
        width: screenWidth - 80,
        height: 180,
        marginBottom: 10,
    },
    chartContainer: {
        position: 'relative',
        height: 150,
        width: '100%',
    },
    chartPointContainer: {
        position: 'absolute',
    },
    chartPoint: {
        width: 8,
        height: 8,
        borderRadius: 4,
        position: 'absolute',
    },
    chartLabel: {
        fontSize: 10,
        position: 'absolute',
        width: 30,
        textAlign: 'center',
    },
    chartValue: {
        fontSize: 10,
        position: 'absolute',
        width: 20,
        textAlign: 'center',
        fontWeight: '600',
    },
    barChartContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-around',
        height: 180,
        width: '100%',
    },
    barContainer: {
        alignItems: 'center',
        flex: 1,
    },
    bar: {
        borderRadius: 4,
        marginVertical: 8,
    },
    barValue: {
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 4,
    },
    barLabel: {
        fontSize: 10,
        textAlign: 'center',
    },
    pieChartContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        paddingVertical: 20,
    },
    pieChartLegend: {
        flex: 1,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    legendColor: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 8,
    },
    legendText: {
        fontSize: 14,
    },
    pieChartStats: {
        alignItems: 'center',
        flex: 1,
    },
    pieChartTotal: {
        fontSize: 32,
        fontWeight: 'bold',
    },
    pieChartLabel: {
        fontSize: 12,
    },
    achievementCard: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
    },
    achievementIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    achievementContent: {
        flex: 1,
    },
    achievementTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    achievementDescription: {
        fontSize: 14,
        marginBottom: 4,
    },
    achievementDate: {
        fontSize: 12,
    },
    goalCard: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
    },
    goalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    goalTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    goalProgress: {
        fontSize: 14,
        fontWeight: '600',
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
    goalDescription: {
        fontSize: 14,
    },
});