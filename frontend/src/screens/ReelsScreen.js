import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  FlatList,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  Text
} from 'react-native';
import { Video } from 'expo-av';
import { useTheme } from '../contexts/ThemeContext';
import { getReels, likeReel } from '../services/api';

const { height, width } = Dimensions.get('window');

export default function ReelsScreen({ navigation, route }) {
  const { theme } = useTheme();
  const [reels, setReels] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef(null);

  useEffect(() => {
    loadReels();
  }, []);

  const loadReels = async () => {
    try {
      const response = await getReels(1, 20);
      setReels(response.data);
      
      // If initial reel ID is provided, scroll to it
      if (route.params?.initialReelId) {
        const index = response.data.findIndex(r => r._id === route.params.initialReelId);
        if (index !== -1) {
          setCurrentIndex(index);
          flatListRef.current?.scrollToIndex({ index, animated: false });
        }
      }
    } catch (error) {
      console.error('Failed to load reels:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (reelId, index) => {
    try {
      const response = await likeReel(reelId);
      setReels(prev => prev.map((reel, i) => {
        if (i === index) {
          return {
            ...reel,
            isLiked: response.data.isLiked,
            likesCount: response.data.likesCount
          };
        }
        return reel;
      }));
    } catch (error) {
      console.error('Failed to like reel:', error);
    }
  };

  const handleViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const renderItem = ({ item, index }) => (
    <View style={styles.reelContainer}>
      <Video
        source={{ uri: item.videoUrl }}
        style={styles.video}
        resizeMode="cover"
        shouldPlay={index === currentIndex}
        isLooping
        isMuted={false}
      />

      {/* Overlay */}
      <View style={styles.overlay}>
        {/* Author info */}
        <TouchableOpacity
          style={styles.authorInfo}
          onPress={() => navigation.navigate('UserProfile', { userId: item.author._id })}
        >
          <Text style={styles.authorName}>@{item.author.name}</Text>
        </TouchableOpacity>

        {/* Caption */}
        {item.caption && (
          <Text style={styles.caption} numberOfLines={3}>
            {item.caption}
          </Text>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => handleLike(item._id, index)}
          >
            <Text style={styles.actionIcon}>
              {item.isLiked ? '❤️' : '🤍'}
            </Text>
            <Text style={styles.actionCount}>{item.likesCount}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn}>
            <Text style={styles.actionIcon}>💬</Text>
            <Text style={styles.actionCount}>{item.commentsCount}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn}>
            <Text style={styles.actionIcon}>🔗</Text>
            <Text style={styles.actionCount}>{item.sharesCount}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: '#000' }]}>
      <FlatList
        ref={flatListRef}
        data={reels}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={height}
        snapToAlignment="start"
        decelerationRate="fast"
        onViewableItemsChanged={handleViewableItemsChanged}
        viewabilityConfig={{
          itemVisiblePercentThreshold: 50
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  reelContainer: {
    height: height,
    width: width,
    position: 'relative',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 40,
  },
  authorInfo: {
    marginBottom: 10,
  },
  authorName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  caption: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  actions: {
    position: 'absolute',
    right: 20,
    bottom: 100,
    alignItems: 'center',
  },
  actionBtn: {
    alignItems: 'center',
    marginBottom: 20,
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: 4,
  },
  actionCount: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});
