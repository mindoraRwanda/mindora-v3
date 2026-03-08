import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
  RefreshControl,
  TextInput,
  Alert,
  Linking,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/context/AuthContext';
import { getPosts, createPost, likePost, unlikePost, getPublicResources } from '@/services/api';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

interface Post {
  id: string;
  content: string;
  isAnonymous: boolean;
  author: {
    fullName: string;
    avatar?: string;
  };
  likesCount: number;
  commentsCount: number;
  isLiked: boolean;
  createdAt: string;
}

interface Resource {
  id: string;
  title: string;
  description: string;
  category?: string;
  url?: string;
}

export default function CommunityScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? 'light';
  const [activeTab, setActiveTab] = useState<'feed' | 'explore'>('feed');
  const [posts, setPosts] = useState<Post[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { user, token } = useAuth();

  useEffect(() => {
    if (token) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [token, activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'feed') {
        const response: any = await getPosts(token!);
        if (response.success) setPosts(response.data);
      } else {
        const response: any = await getPublicResources(token || undefined);
        if (response.success) setResources(response.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRefreshing(true);
    loadData();
  };

  const handleCreatePost = async () => {
    if (!newPostContent.trim() || !token) return;

    setSubmitting(true);
    try {
      const response: any = await createPost(token, {
        content: newPostContent,
        isAnonymous: false,
      });
      if (response.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setNewPostContent('');
        loadData();
        Alert.alert('Success', 'Your post has been shared!');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to create post');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (postId: string, isCurrentlyLiked: boolean) => {
    if (!token) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, isLiked: !isCurrentlyLiked, likesCount: isCurrentlyLiked ? p.likesCount - 1 : p.likesCount + 1 } : p
      )
    );
    try {
      if (isCurrentlyLiked) await unlikePost(token, postId);
      else await likePost(token, postId);
    } catch (err) {
      loadData();
    }
  };

  const renderPost = ({ item }: { item: Post }) => (
    <ThemedView style={styles.postCard}>
      <View style={styles.postHeader}>
        <View style={styles.avatarPlaceholder}>
          <ThemedText style={styles.avatarText}>{item.isAnonymous ? '?' : (item.author?.fullName?.charAt(0) || '?')}</ThemedText>
        </View>
        <View>
          <ThemedText type="defaultSemiBold">{item.isAnonymous ? 'Anonymous' : (item.author?.fullName || 'User')}</ThemedText>
          <ThemedText style={styles.timestamp}>{new Date(item.createdAt).toLocaleDateString()}</ThemedText>
        </View>
      </View>
      <ThemedText style={styles.postContent}>{item.content}</ThemedText>
      <View style={styles.postFooter}>
        <TouchableOpacity style={styles.actionButton} onPress={() => handleLike(item.id, item.isLiked)}>
          <IconSymbol name={item.isLiked ? 'heart.fill' : 'heart'} size={18} color={item.isLiked ? '#6D28D9' : '#8E8E93'} />
          <ThemedText style={[styles.actionText, item.isLiked && styles.likedText]}>{item.likesCount}</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <IconSymbol name="bubble.left.and.bubble.right" size={18} color="#8E8E93" />
          <ThemedText style={styles.actionText}>{item.commentsCount}</ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );

  const renderResource = ({ item }: { item: Resource }) => (
    <TouchableOpacity 
      style={styles.resourceCard} 
      onPress={() => item.url && Linking.openURL(item.url)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.categoryBadge}>
          <ThemedText style={styles.categoryText}>{item.category || 'GUIDE'}</ThemedText>
        </View>
        <IconSymbol name="chevron.right" size={16} color="#6D28D9" />
      </View>
      <ThemedText type="defaultSemiBold" style={styles.resourceTitle}>{item.title}</ThemedText>
      <ThemedText numberOfLines={2} style={styles.description}>{item.description}</ThemedText>
    </TouchableOpacity>
  );

  if (!user) {
    return (
      <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.centered}>
          <IconSymbol name="bubble.left.and.bubble.right" size={80} color="#6D28D9" />
          <ThemedText type="title" style={styles.mainTitle}>Community Hub</ThemedText>
          <ThemedText style={styles.mainSubtitle}>Sign in to join the conversation and explore resources.</ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ThemedView style={[styles.container, { paddingTop: insets.top || 60 }]}>
        <View style={styles.topHeader}>
          <ThemedText type="title">Community</ThemedText>
          <View style={styles.tabContainer}>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'feed' && styles.activeTab]} 
              onPress={() => {
                Haptics.selectionAsync();
                setActiveTab('feed');
              }}
            >
              <ThemedText style={[styles.tabText, activeTab === 'feed' && styles.activeTabText]}>Feed</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'explore' && styles.activeTab]} 
              onPress={() => {
                Haptics.selectionAsync();
                setActiveTab('explore');
              }}
            >
              <ThemedText style={[styles.tabText, activeTab === 'explore' && styles.activeTabText]}>Explore</ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        {activeTab === 'feed' && (
          <View style={styles.createPostBox}>
            <TextInput
              style={[styles.input, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}
              placeholder="Share your journey..."
              placeholderTextColor="#A0A0A0"
              value={newPostContent}
              onChangeText={setNewPostContent}
              multiline
            />
            <TouchableOpacity
              style={[styles.postButton, !newPostContent.trim() && styles.disabledButton]}
              onPress={handleCreatePost}
              disabled={!newPostContent.trim() || submitting}
            >
              {submitting ? <ActivityIndicator size="small" color="#fff" /> : <ThemedText style={styles.postButtonText}>Post</ThemedText>}
            </TouchableOpacity>
          </View>
        )}

        {loading ? (
          <ActivityIndicator size="large" color={Colors[colorScheme].tint} style={styles.loader} />
        ) : activeTab === 'feed' ? (
          <FlatList
            data={posts}
            renderItem={renderPost}
            keyExtractor={(item) => item.id}
            contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 40 }]}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors[colorScheme].tint} />}
            keyboardDismissMode="on-drag"
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <ThemedText style={styles.emptyText}>No posts yet.</ThemedText>
              </View>
            }
          />
        ) : (
          <FlatList
            data={resources}
            renderItem={renderResource}
            keyExtractor={(item) => item.id}
            contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 40 }]}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors[colorScheme].tint} />}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <ThemedText style={styles.emptyText}>No resources found.</ThemedText>
              </View>
            }
          />
        )}
      </ThemedView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topHeader: { paddingHorizontal: 20, marginBottom: 16 },
  tabContainer: { flexDirection: 'row', marginTop: 16, backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 12, padding: 4 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  activeTab: { backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  tabText: { fontSize: 14, fontWeight: '600', color: '#8E8E93' },
  activeTabText: { color: '#6D28D9' },
  createPostBox: { paddingHorizontal: 20, marginBottom: 20 },
  input: { backgroundColor: 'rgba(0,0,0,0.03)', borderRadius: 16, padding: 16, minHeight: 80, textAlignVertical: 'top', borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)' },
  postButton: { backgroundColor: '#6D28D9', marginTop: 10, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  disabledButton: { backgroundColor: '#E5E5E5', opacity: 0.5 },
  postButtonText: { color: '#fff', fontWeight: 'bold' },
  listContent: { paddingHorizontal: 20 },
  postCard: { backgroundColor: '#fff', borderRadius: 20, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2, borderWidth: 1, borderColor: 'rgba(0,0,0,0.02)' },
  postHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  avatarPlaceholder: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#F3E8FF', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#6D28D9', fontWeight: 'bold', fontSize: 18 },
  timestamp: { fontSize: 12, opacity: 0.4 },
  postContent: { fontSize: 15, lineHeight: 22, marginBottom: 16 },
  postFooter: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#F2F2F2', paddingTop: 12, gap: 24 },
  actionButton: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  actionText: { fontSize: 14, color: '#8E8E93' },
  likedText: { color: '#6D28D9', fontWeight: 'bold' },
  resourceCard: { backgroundColor: '#fff', borderRadius: 20, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  categoryBadge: { backgroundColor: '#F3E8FF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  categoryText: { fontSize: 10, fontWeight: 'bold', color: '#6D28D9' },
  resourceTitle: { fontSize: 18, marginBottom: 8 },
  description: { fontSize: 14, lineHeight: 20, opacity: 0.6 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  mainTitle: { fontSize: 32, fontWeight: 'bold', marginVertical: 12 },
  mainSubtitle: { textAlign: 'center', opacity: 0.6, lineHeight: 24 },
  loader: { marginTop: 40 },
  emptyContainer: { alignItems: 'center', paddingTop: 40 },
  emptyText: { opacity: 0.4, fontStyle: 'italic' },
});
