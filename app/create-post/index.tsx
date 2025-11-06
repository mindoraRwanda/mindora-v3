import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Colors } from '@/constants/theme';
import { useThemeColorScheme } from '@/hooks/use-theme-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CreatePostScreen() {
    const colorScheme = useThemeColorScheme();
    const colors = Colors[colorScheme ?? 'light'];

    const [content, setContent] = useState('');
    const [selectedCommunity, setSelectedCommunity] = useState('anxiety-support');
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);

    const communities = [
        { id: 'anxiety-support', name: 'Anxiety Support', members: 1250 },
        { id: 'mindfulness-practice', name: 'Mindfulness Practice', members: 890 },
        { id: 'depression-recovery', name: 'Depression Recovery', members: 2100 },
        { id: 'general-wellness', name: 'General Wellness', members: 3400 },
    ];

    const availableTags = [
        'support', 'advice', 'success-story', 'question', 'resources',
        'meditation', 'therapy', 'self-care', 'motivation', 'gratitude'
    ];

    const handleTagToggle = (tag: string) => {
        setSelectedTags(prev =>
            prev.includes(tag)
                ? prev.filter(t => t !== tag)
                : [...prev, tag]
        );
    };

    const handlePost = () => {
        if (!content.trim()) {
            Alert.alert('Error', 'Please write something before posting');
            return;
        }

        if (content.length < 10) {
            Alert.alert('Error', 'Post must be at least 10 characters long');
            return;
        }

        Alert.alert(
            'Post Created',
            'Your post has been shared with the community!',
            [
                { text: 'OK', onPress: () => router.back() }
            ]
        );
    };

    const selectedCommunityData = communities.find(c => c.id === selectedCommunity);

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="close" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>Create Post</Text>
                    <TouchableOpacity onPress={handlePost}>
                        <Text style={[styles.postButton, { color: colors.primary }]}>Post</Text>
                    </TouchableOpacity>
                </View>

                {/* User Info */}
                <View style={styles.section}>
                    <Card>
                        <View style={styles.userInfo}>
                            {!isAnonymous ? (
                                <>
                                    <Avatar
                                        source={currentUser.avatar}
                                        name={currentUser.name}
                                        size={40}
                                    />
                                    <View style={styles.userDetails}>
                                        <Text style={[styles.userName, { color: colors.text }]}>{currentUser.name}</Text>
                                        <Text style={[styles.postingTo, { color: colors.icon }]}>
                                            Posting to {selectedCommunityData?.name}
                                        </Text>
                                    </View>
                                </>
                            ) : (
                                <>
                                    <View style={[styles.anonymousAvatar, { backgroundColor: colors.primary }]}>
                                        <Ionicons name="person" size={20} color="#FFFFFF" />
                                    </View>
                                    <View style={styles.userDetails}>
                                        <Text style={[styles.userName, { color: colors.text }]}>Anonymous</Text>
                                        <Text style={[styles.postingTo, { color: colors.icon }]}>
                                            Posting to {selectedCommunityData?.name}
                                        </Text>
                                    </View>
                                </>
                            )}

                            <TouchableOpacity onPress={() => setIsAnonymous(!isAnonymous)}>
                                <Ionicons
                                    name={isAnonymous ? "eye-off" : "eye"}
                                    size={20}
                                    color={colors.icon}
                                />
                            </TouchableOpacity>
                        </View>
                    </Card>
                </View>

                {/* Community Selection */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Select Community</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View style={styles.communitiesContainer}>
                            {communities.map((community) => (
                                <TouchableOpacity
                                    key={community.id}
                                    style={[
                                        styles.communityChip,
                                        {
                                            backgroundColor: selectedCommunity === community.id ? colors.primary : colors.secondary,
                                            borderColor: selectedCommunity === community.id ? colors.primary : colors.border,
                                        },
                                    ]}
                                    onPress={() => setSelectedCommunity(community.id)}
                                >
                                    <Text
                                        style={[
                                            styles.communityChipText,
                                            { color: selectedCommunity === community.id ? '#FFFFFF' : colors.text },
                                        ]}
                                    >
                                        {community.name}
                                    </Text>
                                    <Text
                                        style={[
                                            styles.communityMembers,
                                            { color: selectedCommunity === community.id ? '#FFFFFF' : colors.icon },
                                        ]}
                                    >
                                        {community.members} members
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </ScrollView>
                </View>

                {/* Post Content */}
                <View style={styles.section}>
                    <Card>
                        <TextInput
                            style={[styles.contentInput, { color: colors.text }]}
                            placeholder="What's on your mind? Share your thoughts, ask for support, or offer encouragement to others..."
                            placeholderTextColor={colors.icon}
                            multiline
                            numberOfLines={8}
                            value={content}
                            onChangeText={setContent}
                            textAlignVertical="top"
                            maxLength={1000}
                            returnKeyType="default"
                            blurOnSubmit={false}
                        />
                        <View style={styles.contentFooter}>
                            <Text style={[styles.characterCount, { color: colors.icon }]}>
                                {content.length}/1000
                            </Text>
                        </View>
                    </Card>
                </View>

                {/* Tags */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Add Tags (Optional)</Text>
                    <Card>
                        <View style={styles.tagsContainer}>
                            {availableTags.map((tag) => (
                                <TouchableOpacity
                                    key={tag}
                                    style={[
                                        styles.tag,
                                        {
                                            backgroundColor: selectedTags.includes(tag) ? colors.primary + '20' : colors.secondary,
                                            borderColor: selectedTags.includes(tag) ? colors.primary : colors.border,
                                        },
                                    ]}
                                    onPress={() => handleTagToggle(tag)}
                                >
                                    <Text
                                        style={[
                                            styles.tagText,
                                            { color: selectedTags.includes(tag) ? colors.primary : colors.text },
                                        ]}
                                    >
                                        #{tag}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </Card>
                </View>

                {/* Post Options */}
                <View style={styles.section}>
                    <Card>
                        <TouchableOpacity style={styles.option}>
                            <Ionicons name="image" size={20} color={colors.icon} />
                            <Text style={[styles.optionText, { color: colors.text }]}>Add Image</Text>
                            <Ionicons name="chevron-forward" size={16} color={colors.icon} />
                        </TouchableOpacity>

                        <View style={[styles.separator, { backgroundColor: colors.border }]} />

                        <TouchableOpacity style={styles.option}>
                            <Ionicons name="location" size={20} color={colors.icon} />
                            <Text style={[styles.optionText, { color: colors.text }]}>Add Location</Text>
                            <Ionicons name="chevron-forward" size={16} color={colors.icon} />
                        </TouchableOpacity>

                        <View style={[styles.separator, { backgroundColor: colors.border }]} />

                        <View style={styles.option}>
                            <Ionicons name="shield-checkmark" size={20} color={colors.success} />
                            <View style={styles.optionContent}>
                                <Text style={[styles.optionText, { color: colors.text }]}>Safe Space Guidelines</Text>
                                <Text style={[styles.optionSubtext, { color: colors.icon }]}>
                                    Be respectful, supportive, and kind to others
                                </Text>
                            </View>
                        </View>
                    </Card>
                </View>

                {/* Submit Button */}
                <View style={styles.section}>
                    <Button
                        title="Share Post"
                        onPress={handlePost}
                        disabled={!content.trim()}
                    />
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
        fontSize: 18,
        fontWeight: '600',
    },
    postButton: {
        fontSize: 16,
        fontWeight: '600',
    },
    section: {
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    userDetails: {
        flex: 1,
        marginLeft: 12,
    },
    userName: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 2,
    },
    postingTo: {
        fontSize: 14,
    },
    anonymousAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    communitiesContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    communityChip: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        alignItems: 'center',
        minWidth: 120,
    },
    communityChipText: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 2,
    },
    communityMembers: {
        fontSize: 12,
    },
    contentInput: {
        fontSize: 16,
        lineHeight: 24,
        minHeight: 120,
        textAlignVertical: 'top',
    },
    contentFooter: {
        alignItems: 'flex-end',
        marginTop: 8,
    },
    characterCount: {
        fontSize: 12,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    tag: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        borderWidth: 1,
    },
    tagText: {
        fontSize: 14,
        fontWeight: '500',
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },
    optionContent: {
        flex: 1,
        marginLeft: 12,
    },
    optionText: {
        fontSize: 16,
        fontWeight: '500',
        marginLeft: 12,
    },
    optionSubtext: {
        fontSize: 14,
        marginTop: 2,
    },
    separator: {
        height: 1,
        marginLeft: 32,
    },
});