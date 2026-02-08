import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { formatDistanceToNow } from 'date-fns';

const { width } = Dimensions.get('window');

export default function PostCard({ post, onLike, onComment, onShare, onProfilePress }) {
  const { theme } = useTheme();

  const formatTime = (date) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch {
      return '';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.card }]}>
      {/* Header */}
      <TouchableOpacity
        style={styles.header}
        onPress={onProfilePress}
        activeOpacity={0.7}
      >
        <Image
          source={{ uri: post.author?.profilePicture || 'https://via.placeholder.com/40' }}
          style={styles.avatar}
        />
        <View style={styles.headerText}>
          <View style={styles.nameRow}>
            <Text style={[styles.name, { color: theme.colors.text }]}>
              {post.author?.name}
            </Text>
            {post.author?.isVerified && (
              <Text style={styles.verified}>✓</Text>
            )}
          </View>
          <Text style={[styles.time, { color: theme.colors.textSecondary }]}>
            {formatTime(post.createdAt)}
          </Text>
        </View>
        <TouchableOpacity style={styles.moreBtn}>
          <Text style={[styles.moreBtnText, { color: theme.colors.textSecondary }]}>
            •••
          </Text>
        </TouchableOpacity>
      </TouchableOpacity>

      {/* Content */}
      {post.content && (
        <Text style={[styles.content, { color: theme.colors.text }]}>
          {post.content}
        </Text>
      )}

      {/* Media */}
      {post.media && post.media.length > 0 && (
        <View style={styles.mediaContainer}>
          {post.media.map((item, index) => (
            <Image
              key={index}
              source={{ uri: item.url }}
              style={styles.mediaImage}
              resizeMode="cover"
            />
          ))}
        </View>
      )}

      {/* Stats */}
      <View style={styles.stats}>
        <Text style={[styles.statsText, { color: theme.colors.textSecondary }]}>
          {post.likesCount} {post.likesCount === 1 ? 'like' : 'likes'}
        </Text>
        <Text style={[styles.statsText, { color: theme.colors.textSecondary }]}>
          {post.commentsCount} {post.commentsCount === 1 ? 'comment' : 'comments'}
        </Text>
      </View>

      {/* Actions */}
      <View style={[styles.actions, { borderTopColor: theme.colors.border }]}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={onLike}
          activeOpacity={0.7}
        >
          <Text style={styles.actionIcon}>
            {post.isLiked ? '❤️' : '🤍'}
          </Text>
          <Text style={[styles.actionText, { color: theme.colors.text }]}>
            Like
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionBtn}
          onPress={onComment}
          activeOpacity={0.7}
        >
          <Text style={styles.actionIcon}>💬</Text>
          <Text style={[styles.actionText, { color: theme.colors.text }]}>
            Comment
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionBtn}
          onPress={onShare}
          activeOpacity={0.7}
        >
          <Text style={styles.actionIcon}>🔗</Text>
          <Text style={[styles.actionText, { color: theme.colors.text }]}>
            Share
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
    paddingBottom: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  headerText: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
  },
  verified: {
    marginLeft: 4,
    color: '#1DA1F2',
    fontSize: 14,
  },
  time: {
    fontSize: 12,
    marginTop: 2,
  },
  moreBtn: {
    padding: 5,
  },
  moreBtnText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    paddingHorizontal: 12,
    fontSize: 15,
    lineHeight: 20,
    marginBottom: 10,
  },
  mediaContainer: {
    width: '100%',
  },
  mediaImage: {
    width: width,
    height: width,
  },
  stats: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 15,
  },
  statsText: {
    fontSize: 13,
  },
  actions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingTop: 8,
    paddingHorizontal: 12,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  actionIcon: {
    fontSize: 20,
    marginRight: 6,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
