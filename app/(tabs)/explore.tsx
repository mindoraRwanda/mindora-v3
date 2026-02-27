import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Fonts } from '@/constants/theme';
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

  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    try {
      const response: any = await getPublicResources();
      if (response.success) {
        setResources(response.data);
      } else {
        setError('Failed to load resources');
      }
    } catch (err) {
      setError('Error connecting to server');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={
        <IconSymbol
          size={310}
          color="#808080"
          name="book.fill"
          style={styles.headerImage}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText
          type="title"
          style={{
            fontFamily: Fonts.rounded,
          }}>
          Resources
        </ThemedText>
      </ThemedView>
      <ThemedText>Explore helpful resources for your mental well-being.</ThemedText>
      
      {loading ? (
        <ActivityIndicator size="large" />
      ) : error ? (
        <ThemedText style={{ color: 'red' }}>{error}</ThemedText>
      ) : resources.length === 0 ? (
        <ThemedText>No resources available at the moment.</ThemedText>
      ) : (
        resources.map((resource) => (
          <View key={resource.id} style={styles.resourceCard}>
            <ThemedText type="defaultSemiBold">{resource.title}</ThemedText>
            {resource.category && (
              <ThemedText style={styles.category}>{resource.category}</ThemedText>
            )}
            <ThemedText>{resource.description}</ThemedText>
          </View>
        ))
      )}
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  resourceCard: {
    padding: 15,
    borderRadius: 8,
    backgroundColor: 'rgba(150, 150, 150, 0.1)',
    marginBottom: 10,
  },
  category: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 4,
  },
});
