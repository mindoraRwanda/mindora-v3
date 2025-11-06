import { CommunityPost as CommunityPostType } from '@/constants/Types';
import { Colors } from '@/constants/theme';
import { useThemeColorScheme } from '@/hooks/use-theme-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Avatar } from './ui/Avatar';
import { Card } from './ui/Card';

interface CommunityPostProps {
    post: CommunityPostType;
    onLike: () => void;
    onComment: () => void;
}

export function CommunityPost({ post, onLike, onComment }: CommunityPostProps) {
    const colorScheme = useThemeColorScheme();
    const colors = Colors[colorScheme ?? 'light'];

    return (
        <Card style={styles.card}>
            <View style={styles.header}>
                <Avatar source={post.avatar} name={post.author} size={40} />
                <View style={styles.authorInfo}>
                    <Text style={[styles.author, { color: colors.text }]}>{post.author}</Text>
                    <Text style={[styles.timestamp, { color: colors.icon }]}>{post.timestamp}</Text>
                </View>
            </View>

            <Text style={[styles.content, { color: colors.text }]}>{post.content}</Text>

            <View style={styles.actions}>
                <TouchableOpacity style={styles.action} onPress={onLike}>
                    <Ionicons
                        name={post.isLiked ? "heart" : "heart-outline"}
                        size={20}
                        color={post.isLiked ? colors.error : colors.icon}
                    />
                    <Text style={[styles.actionText, { color: colors.icon }]}>{post.likes}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.action} onPress={onComment}>
                    <Ionicons name="chatbubble-outline" size={20} color={colors.icon} />
                    <Text style={[styles.actionText, { color: colors.icon }]}>{post.comments}</Text>
                </TouchableOpacity>
            </View>
        </Card>
    );
}

const styles = StyleSheet.create({
    card: {
        marginBottom: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    authorInfo: {
        marginLeft: 12,
        flex: 1,
    },
    author: {
        fontSize: 16,
        fontWeight: '600',
    },
    timestamp: {
        fontSize: 12,
        marginTop: 2,
    },
    content: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 16,
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    action: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 24,
    },
    actionText: {
        fontSize: 14,
        marginLeft: 6,
    },
});