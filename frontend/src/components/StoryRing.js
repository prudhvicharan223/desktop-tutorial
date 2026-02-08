import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { getStories } from '../services/api';

export default function StoryRing({ navigation }) {
  const { theme } = useTheme();
  const [stories, setStories] = useState([]);

  useEffect(() => {
    loadStories();
  }, []);

  const loadStories = async () => {
    try {
      const response = await getStories();
      setStories(response.data);
    } catch (error) {
      console.error('Failed to load stories:', error);
    }
  };

  const handleStoryPress = (userId, stories) => {
    navigation.navigate('Story', { userId, stories });
  };

  const handleCreateStory = () => {
    navigation.navigate('CreateStory');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.card }]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Create Story Button */}
        <TouchableOpacity
          style={styles.storyItem}
          onPress={handleCreateStory}
          activeOpacity={0.7}
        >
          <View style={[styles.storyRing, styles.createStoryRing]}>
            <Image
              source={{ uri: 'https://via.placeholder.com/60' }}
              style={styles.storyImage}
            />
            <View style={styles.addIcon}>
              <Text style={styles.addIconText}>+</Text>
            </View>
          </View>
          <Text style={[styles.storyName, { color: theme.colors.text }]}>
            Your Story
          </Text>
        </TouchableOpacity>

        {/* Stories from followed users */}
        {stories.map((story) => (
          <TouchableOpacity
            key={story.author._id}
            style={styles.storyItem}
            onPress={() => handleStoryPress(story.author._id, story.stories)}
            activeOpacity={0.7}
          >
            <View style={[styles.storyRing, styles.activeStoryRing]}>
              <Image
                source={{ uri: story.author.profilePicture || 'https://via.placeholder.com/60' }}
                style={styles.storyImage}
              />
            </View>
            <Text
              style={[styles.storyName, { color: theme.colors.text }]}
              numberOfLines={1}
            >
              {story.author.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  scrollContent: {
    paddingHorizontal: 8,
  },
  storyItem: {
    alignItems: 'center',
    marginHorizontal: 6,
    width: 70,
  },
  storyRing: {
    width: 68,
    height: 68,
    borderRadius: 34,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  createStoryRing: {
    borderWidth: 2,
    borderColor: '#ddd',
    position: 'relative',
  },
  activeStoryRing: {
    borderWidth: 3,
    borderColor: '#E1306C',
  },
  storyImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  addIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#1DA1F2',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  addIconText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  storyName: {
    fontSize: 12,
    textAlign: 'center',
  },
});
