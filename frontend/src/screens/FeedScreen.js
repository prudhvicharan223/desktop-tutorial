import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Text
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { getFeed, likePost, sharePost } from '../services/api';
import PostCard from '../components/PostCard';
import StoryRing from '../components/StoryRing';

export default function FeedScreen({ navigation }) {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadFeed = async (pageNum = 1, refresh = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
      } else if (pageNum === 1) {
        setLoading(true);
      }

      const response = await getFeed(pageNum, 10);
      
      if (refresh || pageNum === 1) {
        setPosts(response.data);
      } else {
        setPosts(prev => [...prev, ...response.data]);
      }
      
      setHasMore(response.pagination.hasMore);
      setPage(pageNum);
    } catch (error) {
      console.error('Failed to load feed:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadFeed(1);
  }, []);

  const handleRefresh = useCallback(() => {
    loadFeed(1, true);
  }, []);

  const handleLoadMore = useCallback(() => {
    if (!loading && hasMore) {
      loadFeed(page + 1);
    }
  }, [loading, hasMore, page]);

  const handleLike = async (postId) => {
    try {
      const response = await likePost(postId);
      // Update local state
      setPosts(prev => prev.map(post => {
        if (post._id === postId) {
          return {
            ...post,
            isLiked: response.data.isLiked,
            likesCount: response.data.likesCount
          };
        }
        return post;
      }));
    } catch (error) {
      console.error('Failed to like post:', error);
    }
  };

  const handleComment = (postId) => {
    navigation.navigate('PostDetail', { postId });
  };

  const handleShare = async (postId) => {
    try {
      await sharePost(postId);
      // Update share count
      setPosts(prev => prev.map(post => {
        if (post._id === postId) {
          return {
            ...post,
            sharesCount: post.sharesCount + 1
          };
        }
        return post;
      }));
    } catch (error) {
      console.error('Failed to share post:', error);
    }
  };

  const handleProfile = (userId) => {
    navigation.navigate('UserProfile', { userId });
  };

  const renderHeader = () => (
    <View>
      <StoryRing navigation={navigation} />
    </View>
  );

  const renderFooter = () => {
    if (!loading || page === 1) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.empty}>
        <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
          No posts yet. Follow users to see their posts!
        </Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={posts}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            onLike={() => handleLike(item._id)}
            onComment={() => handleComment(item._id)}
            onShare={() => handleShare(item._id)}
            onProfilePress={() => handleProfile(item.author._id)}
          />
        )}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  empty: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
});
