import React, { useState, useEffect } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Text,
  Image,
  Dimensions
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { getExploreFeed, searchContent } from '../services/api';

const { width } = Dimensions.get('window');
const ITEM_SIZE = (width - 6) / 3;

export default function ExploreScreen({ navigation }) {
  const { theme } = useTheme();
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async (pageNum = 1) => {
    try {
      setLoading(true);
      const response = await getExploreFeed(pageNum, 30);
      
      if (pageNum === 1) {
        setContent(response.data);
      } else {
        setContent(prev => [...prev, ...response.data]);
      }
      
      setHasMore(response.pagination.hasMore);
      setPage(pageNum);
    } catch (error) {
      console.error('Failed to load explore feed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadContent(1);
      return;
    }

    try {
      setLoading(true);
      const response = await searchContent(searchQuery, 'all', 1, 30);
      setContent(response.data);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    if (!loading && hasMore && !searchQuery) {
      loadContent(page + 1);
    }
  };

  const handleItemPress = (item) => {
    if (item.contentType === 'post' || item.resultType === 'post') {
      navigation.navigate('PostDetail', { postId: item._id });
    } else if (item.contentType === 'reel' || item.resultType === 'reel') {
      navigation.navigate('Reels', { initialReelId: item._id });
    } else if (item.resultType === 'user') {
      navigation.navigate('UserProfile', { userId: item._id });
    }
  };

  const renderItem = ({ item }) => {
    let imageUrl = '';
    
    if (item.contentType === 'post' || item.resultType === 'post') {
      imageUrl = item.media?.[0]?.url || 'https://via.placeholder.com/150';
    } else if (item.contentType === 'reel' || item.resultType === 'reel') {
      imageUrl = item.thumbnail || 'https://via.placeholder.com/150';
    } else if (item.resultType === 'user') {
      imageUrl = item.profilePicture || 'https://via.placeholder.com/150';
    }

    return (
      <TouchableOpacity
        style={styles.gridItem}
        onPress={() => handleItemPress(item)}
        activeOpacity={0.7}
      >
        <Image
          source={{ uri: imageUrl }}
          style={styles.gridImage}
          resizeMode="cover"
        />
        {(item.contentType === 'reel' || item.resultType === 'reel') && (
          <View style={styles.reelBadge}>
            <Text style={styles.reelIcon}>▶</Text>
          </View>
        )}
        {item.resultType === 'user' && (
          <View style={styles.userOverlay}>
            <Text style={styles.userName} numberOfLines={1}>
              {item.name}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.searchBar, { backgroundColor: theme.colors.card }]}>
        <TextInput
          style={[styles.searchInput, { color: theme.colors.text }]}
          placeholder="Search posts, reels, users..."
          placeholderTextColor={theme.colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
        />
      </View>

      <FlatList
        data={content}
        keyExtractor={(item, index) => `${item._id}-${index}`}
        renderItem={renderItem}
        numColumns={3}
        columnWrapperStyle={styles.row}
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
  searchBar: {
    padding: 10,
  },
  searchInput: {
    height: 40,
    borderRadius: 20,
    paddingHorizontal: 20,
    fontSize: 16,
    backgroundColor: '#f0f0f0',
  },
  row: {
    gap: 2,
  },
  gridItem: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    position: 'relative',
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  reelBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reelIcon: {
    color: '#fff',
    fontSize: 10,
  },
  userOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 5,
  },
  userName: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
});
