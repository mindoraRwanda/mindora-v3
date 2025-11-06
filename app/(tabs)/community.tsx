import { CommunityPost } from '@/components/CommunityPost';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { mockCommunities, mockPosts } from '@/constants/Data';
import { Colors } from '@/constants/theme';
import { useThemeColorScheme } from '@/hooks/use-theme-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CommunityScreen() {
    const colorScheme = useThemeColorScheme();
    const colors = Colors[colorScheme ?? 'light'];
    const [posts, setPosts] = useState(mockPosts);

    const handleLike = (postId: string) => {
        setPosts(prevPosts =>
            prevPosts.map(post =>
                post.id === postId
                    ? {
                        ...post,
                        isLiked: !post.isLiked,
                        likes: post.isLiked ? post.likes - 1 : post.likes + 1,
                    }
                    : post
            )
        );
    };

    const handleComment = (postId: string) => {
        Alert.alert('Comments', 'Comment feature would be implemented here');
    };

    const handleJoinCommunity = (communityId: string) => {
        Alert.alert('Success', 'You have joined the community!');
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={[styles.title, { color: colors.text }]}>Community</Text>
                    <Text style={[styles.subtitle, { color: colors.icon }]}>
                        Connect with others on their wellness journey
                    </Text>
                </View>

                {/* Communities Section */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Join Communities</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View style={styles.communitiesContainer}>
                            {mockCommunities.map((community) => (
                                <Card key={community.id} style={styles.communityCard}>
                                    <View style={styles.communityHeader}>
                                        <Text style={[styles.communityName, { color: colors.text }]}>
                                            {community.name}
                                        </Text>
                                        <Text style={[styles.memberCount, { color: colors.icon }]}>
                                            {community.members.toLocaleString()} members
                                        </Text>
                                    </View>
                                    <Text style={[styles.communityDescription, { color: colors.icon }]} numberOfLines={2}>
                                        {community.description}
                                    </Text>
                                    <Button
                                        title={community.isJoined ? 'Joined' : 'Join'}
                                        onPress={() => handleJoinCommunity(community.id)}
                                        variant={community.isJoined ? 'secondary' : 'primary'}
                                        size="small"
                                        disabled={community.isJoined}
                                        style={styles.joinButton}
                                    />
                                </Card>
                            ))}
                        </View>
                    </ScrollView>
                </View>

                {/* Create Post */}
                <View style={styles.section}>
                    <Card>
                        <TouchableOpacity
                            style={styles.createPost}
                            onPress={() => router.push('/create-post')}
                        >
                            <Ionicons name="add-circle" size={24} color={colors.primary} />
                            <Text style={[styles.createPostText, { color: colors.icon }]}>
                                Share your thoughts or ask for support...
                            </Text>
                        </TouchableOpacity>
                    </Card>
                </View>

                {/* Posts Feed */}
                <View style={styles.section}>
                    <View style={styles.feedHeader}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Posts</Text>
                        <TouchableOpacity>
                            <Ionicons name="options-outline" size={20} color={colors.icon} />
                        </TouchableOpacity>
                    </View>

                    {posts.map((post) => (
                        <CommunityPost
                            key={post.id}
                            post={post}
                            onLike={() => handleLike(post.id)}
                            onComment={() => handleComment(post.id)}
                        />
                    ))}
                </View>

                {/* Support Resources */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Support Resources</Text>
                    <Card>
                        <View style={styles.resourceItem}>
                            <View style={[styles.resourceIcon, { backgroundColor: colors.error + '20' }]}>
                                <Ionicons name="call" size={20} color={colors.error} />
                            </View>
                            <View style={styles.resourceInfo}>
                                <Text style={[styles.resourceTitle, { color: colors.text }]}>Crisis Hotline</Text>
                                <Text style={[styles.resourceDescription, { color: colors.icon }]}>
                                    24/7 support available
                                </Text>
                            </View>
                            <TouchableOpacity>
                                <Ionicons name="chevron-forward" size={20} color={colors.icon} />
                            </TouchableOpacity>
                        </View>
                    </Card>
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
    communitiesContainer: {
        flexDirection: 'row',
        gap: 16,
    },
    communityCard: {
        width: 200,
        padding: 16,
    },
    communityHeader: {
        marginBottom: 8,
    },
    communityName: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    memberCount: {
        fontSize: 12,
    },
    communityDescription: {
        fontSize: 14,
        lineHeight: 18,
        marginBottom: 12,
    },
    joinButton: {
        marginTop: 'auto',
    },
    createPost: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 4,
    },
    createPostText: {
        fontSize: 16,
        marginLeft: 12,
        flex: 1,
    },
    feedHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    resourceItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    resourceIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    resourceInfo: {
        flex: 1,
    },
    resourceTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 2,
    },
    resourceDescription: {
        fontSize: 14,
    },
});