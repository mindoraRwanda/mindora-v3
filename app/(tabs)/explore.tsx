import { useEffect, useState } from 'react';
import { ActivityIndicator, Linking, StyleSheet, TouchableOpacity, View } from 'react-native';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getPublicResources } from '@/services/api';

interface Resource {
  id: string;
  title: string;
  description: string;
  category?: string;
  url?: string;
}

export default function ResourcesScreen() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const colorScheme = useColorScheme();

  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    setLoading(true);
    setError(null);
    try {
      const response: any = await getPublicResources();
      if (response.success) {
        setResources(response.data);
      } else {
        setError('Failed to load resources');
      }
    } catch (err) {
      setError('Could not reach the server. Please check your internet connection.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openResource = (url?: string) => {
    if (url) {
      Linking.openURL(url).catch((err) => console.error("Couldn't load page", err));
    }
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#F0F2F5', dark: '#151718' }}
      headerImage={
        <View style={styles.headerContainer}>
          <View style={styles.iconCircle}>
            <IconSymbol
              size={120}
              color="#fff"
              name="book.fill"
            />
          </View>
          <ThemedText type="title" style={styles.headerTitle}>Knowledge Center</ThemedText>
        </View>
      }>

      <ThemedView style={styles.contentContainer}>
        <ThemedText style={styles.introText}>
          Explore our curated collection of mindfulness guides, therapy resources, and mental well-being articles.
        </ThemedText>

        {loading ? (
          <ActivityIndicator size="large" color="#0a7ea4" style={styles.loader} />
        ) : error ? (
          <View style={styles.errorContainer}>
            <ThemedText style={styles.errorText}>{error}</ThemedText>
            <TouchableOpacity onPress={loadResources} style={styles.retryButton}>
              <ThemedText style={styles.retryText}>Retry</ThemedText>
            </TouchableOpacity>
          </View>
        ) : resources.length === 0 ? (
          <View style={styles.emptyContainer}>
            <IconSymbol name="tray.fill" size={48} color="rgba(150,150,150,0.5)" />
            <ThemedText style={styles.emptyText}>No articles or resources have been posted yet. Check back soon!</ThemedText>
          </View>
        ) : (
          resources.map((resource) => (
            <TouchableOpacity
              key={resource.id}
              style={styles.resourceCard}
              onPress={() => openResource(resource.url)}
              activeOpacity={0.7}
              disabled={!resource.url}
            >
              <View style={styles.cardHeader}>
                {resource.category && (
                  <View style={styles.categoryBadge}>
                    <ThemedText style={styles.categoryText}>{resource.category.toUpperCase()}</ThemedText>
                  </View>
                )}
                {resource.url && (
                  <IconSymbol name="arrow.up.right" size={16} color="#0a7ea4" />
                )}
              </View>

              <ThemedText type="defaultSemiBold" style={styles.resourceTitle}>
                {resource.title}
              </ThemedText>

              <ThemedText style={styles.description} numberOfLines={3}>
                {resource.description}
              </ThemedText>

              {resource.url && (
                <ThemedText style={styles.readMore}>Read Article</ThemedText>
              )}
            </TouchableOpacity>
          ))
        )}
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
  },
  iconCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#0a7ea4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 10,
  },
  headerTitle: {
    fontSize: 28,
    color: '#0a7ea4',
    fontWeight: 'bold',
  },
  contentContainer: {
    gap: 16,
  },
  introText: {
    fontSize: 16,
    lineHeight: 24,
    opacity: 0.7,
    marginBottom: 8,
  },
  loader: {
    marginTop: 40,
  },
  errorContainer: {
    alignItems: 'center',
    padding: 24,
    gap: 12,
  },
  errorText: {
    textAlign: 'center',
    color: '#d9534f',
  },
  retryButton: {
    backgroundColor: '#0a7ea4',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
    gap: 16,
  },
  emptyText: {
    textAlign: 'center',
    opacity: 0.5,
    fontStyle: 'italic',
  },
  resourceCard: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(150, 150, 150, 0.08)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(150, 150, 150, 0.2)',
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryBadge: {
    backgroundColor: 'rgba(10, 126, 164, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#0a7ea4',
  },
  resourceTitle: {
    fontSize: 18,
    marginBottom: 8,
  },
  description: {
    lineHeight: 20,
    opacity: 0.8,
    fontSize: 14,
  },
  readMore: {
    marginTop: 12,
    color: '#0a7ea4',
    fontSize: 14,
    fontWeight: 'bold',
  }
});
