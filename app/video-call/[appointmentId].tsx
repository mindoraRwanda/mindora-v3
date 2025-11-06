import { Colors } from '@/constants/theme';
import { useThemeColorScheme } from '@/hooks/use-theme-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function VideoCallScreen() {
    const { appointmentId } = useLocalSearchParams();
    const colorScheme = useThemeColorScheme();
    const colors = Colors[colorScheme ?? 'light'];
    const [isConnected, setIsConnected] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [callDuration, setCallDuration] = useState(0);

    useEffect(() => {
        // Simulate connection
        const timer = setTimeout(() => setIsConnected(true), 2000);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (isConnected) {
            const interval = setInterval(() => {
                setCallDuration(prev => prev + 1);
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [isConnected]);

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleEndCall = () => {
        router.back();
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: '#000000' }]}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.appointmentId}>Session: {appointmentId}</Text>
                {isConnected && (
                    <Text style={styles.duration}>{formatDuration(callDuration)}</Text>
                )}
            </View>

            {/* Video Area */}
            <View style={styles.videoContainer}>
                {!isConnected ? (
                    <View style={styles.connectingContainer}>
                        <View style={[styles.connectingIcon, { backgroundColor: colors.primary }]}>
                            <Ionicons name="videocam" size={48} color="#FFFFFF" />
                        </View>
                        <Text style={styles.connectingText}>Connecting to your session...</Text>
                        <Text style={styles.connectingSubtext}>Please wait while we establish the connection</Text>
                    </View>
                ) : (
                    <View style={styles.videoArea}>
                        <View style={styles.doctorVideo}>
                            <View style={[styles.videoPlaceholder, { backgroundColor: colors.primary + '30' }]}>
                                <Ionicons name="person" size={64} color={colors.primary} />
                                <Text style={[styles.videoLabel, { color: colors.primary }]}>Dr. Smith</Text>
                            </View>
                        </View>

                        <View style={styles.userVideo}>
                            <View style={[styles.videoPlaceholder, { backgroundColor: colors.secondary }]}>
                                <Ionicons name="person" size={32} color={colors.icon} />
                                <Text style={[styles.videoLabel, { color: colors.icon, fontSize: 12 }]}>You</Text>
                            </View>
                            {isVideoOff && (
                                <View style={styles.videoOffOverlay}>
                                    <Ionicons name="videocam-off" size={24} color="#FFFFFF" />
                                </View>
                            )}
                        </View>
                    </View>
                )}
            </View>

            {/* Controls */}
            <View style={styles.controls}>
                <TouchableOpacity
                    style={[styles.controlButton, { backgroundColor: isMuted ? colors.error : colors.card }]}
                    onPress={() => setIsMuted(!isMuted)}
                >
                    <Ionicons
                        name={isMuted ? "mic-off" : "mic"}
                        size={24}
                        color={isMuted ? "#FFFFFF" : colors.text}
                    />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.controlButton, { backgroundColor: isVideoOff ? colors.error : colors.card }]}
                    onPress={() => setIsVideoOff(!isVideoOff)}
                >
                    <Ionicons
                        name={isVideoOff ? "videocam-off" : "videocam"}
                        size={24}
                        color={isVideoOff ? "#FFFFFF" : colors.text}
                    />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.controlButton, { backgroundColor: colors.card }]}
                    onPress={() => {/* Screen share functionality */ }}
                >
                    <Ionicons name="desktop" size={24} color={colors.text} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.controlButton, { backgroundColor: colors.card }]}
                    onPress={() => {/* Chat functionality */ }}
                >
                    <Ionicons name="chatbubble" size={24} color={colors.text} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.endCallButton, { backgroundColor: colors.error }]}
                    onPress={handleEndCall}
                >
                    <Ionicons name="call" size={24} color="#FFFFFF" />
                </TouchableOpacity>
            </View>

            {/* Status */}
            <View style={styles.status}>
                <View style={styles.statusIndicator}>
                    <View style={[styles.statusDot, { backgroundColor: isConnected ? colors.success : colors.warning }]} />
                    <Text style={[styles.statusText, { color: colors.text }]}>
                        {isConnected ? 'Connected' : 'Connecting...'}
                    </Text>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    appointmentId: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 4,
    },
    duration: {
        color: '#FFFFFF',
        fontSize: 14,
        opacity: 0.8,
    },
    videoContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    connectingContainer: {
        alignItems: 'center',
    },
    connectingIcon: {
        width: 96,
        height: 96,
        borderRadius: 48,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    connectingText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 8,
    },
    connectingSubtext: {
        color: '#FFFFFF',
        fontSize: 14,
        opacity: 0.7,
        textAlign: 'center',
    },
    videoArea: {
        flex: 1,
        width: '100%',
        position: 'relative',
    },
    doctorVideo: {
        flex: 1,
        margin: 20,
        borderRadius: 16,
        overflow: 'hidden',
    },
    userVideo: {
        position: 'absolute',
        top: 40,
        right: 40,
        width: 120,
        height: 160,
        borderRadius: 12,
        overflow: 'hidden',
    },
    videoPlaceholder: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    videoLabel: {
        marginTop: 8,
        fontSize: 14,
        fontWeight: '500',
    },
    videoOffOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.8)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    controls: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
        paddingVertical: 30,
        gap: 20,
    },
    controlButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
    },
    endCallButton: {
        width: 64,
        height: 64,
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
        transform: [{ rotate: '135deg' }],
    },
    status: {
        alignItems: 'center',
        paddingBottom: 20,
    },
    statusIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    statusText: {
        fontSize: 14,
    },
});