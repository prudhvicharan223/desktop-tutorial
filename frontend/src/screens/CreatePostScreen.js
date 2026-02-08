import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { createPost, uploadMedia } from '../services/api';

export default function CreatePostScreen({ navigation }) {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [content, setContent] = useState('');
  const [media, setMedia] = useState([]);
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsMultipleSelection: true,
        quality: 0.8,
      });

      if (!result.canceled) {
        setMedia(prev => [...prev, ...result.assets]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick media');
    }
  };

  const removeMedia = (index) => {
    setMedia(prev => prev.filter((_, i) => i !== index));
  };

  const handlePost = async () => {
    if (!content.trim() && media.length === 0) {
      Alert.alert('Error', 'Please add some content or media');
      return;
    }

    setLoading(true);
    try {
      // Upload media if any
      let uploadedMedia = [];
      for (const item of media) {
        const formData = new FormData();
        formData.append('file', {
          uri: item.uri,
          type: item.type === 'video' ? 'video/mp4' : 'image/jpeg',
          name: `upload_${Date.now()}.${item.type === 'video' ? 'mp4' : 'jpg'}`,
        });

        const uploadResponse = await uploadMedia(formData);
        uploadedMedia.push({
          url: uploadResponse.data.url,
          type: item.type === 'video' ? 'video' : 'image',
          thumbnail: uploadResponse.data.thumbnail,
        });
      }

      // Create post
      const postData = {
        content: content.trim(),
        postType: media.length > 0 ? (media[0].type === 'video' ? 'video' : 'image') : 'text',
        media: uploadedMedia,
        tags: tags.split(',').map(t => t.trim()).filter(t => t),
      };

      await createPost(postData);
      Alert.alert('Success', 'Post created successfully');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to create post');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[styles.cancelBtn, { color: theme.colors.text }]}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handlePost}
          disabled={loading}
          style={[
            styles.postBtn,
            { backgroundColor: theme.colors.primary },
            loading && styles.postBtnDisabled
          ]}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.postBtnText}>Post</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.userInfo}>
          <Image
            source={{ uri: user.profilePicture || 'https://via.placeholder.com/50' }}
            style={styles.avatar}
          />
          <Text style={[styles.userName, { color: theme.colors.text }]}>
            {user.name}
          </Text>
        </View>

        <TextInput
          style={[styles.input, { color: theme.colors.text }]}
          placeholder="What's on your mind?"
          placeholderTextColor={theme.colors.textSecondary}
          multiline
          value={content}
          onChangeText={setContent}
          maxLength={5000}
        />

        {media.length > 0 && (
          <View style={styles.mediaContainer}>
            {media.map((item, index) => (
              <View key={index} style={styles.mediaItem}>
                <Image source={{ uri: item.uri }} style={styles.mediaImage} />
                <TouchableOpacity
                  style={styles.removeBtn}
                  onPress={() => removeMedia(index)}
                >
                  <Text style={styles.removeBtnText}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        <TextInput
          style={[styles.tagsInput, { color: theme.colors.text }]}
          placeholder="Add tags (comma separated)"
          placeholderTextColor={theme.colors.textSecondary}
          value={tags}
          onChangeText={setTags}
        />
      </ScrollView>

      <View style={[styles.footer, { borderTopColor: theme.colors.border }]}>
        <TouchableOpacity onPress={pickImage} style={styles.mediaBtn}>
          <Text style={[styles.mediaBtnText, { color: theme.colors.primary }]}>
            📷 Add Photo/Video
          </Text>
        </TouchableOpacity>
      </View>
    </View>
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
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  cancelBtn: {
    fontSize: 16,
  },
  postBtn: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 80,
    alignItems: 'center',
  },
  postBtnDisabled: {
    opacity: 0.5,
  },
  postBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  content: {
    flex: 1,
    padding: 15,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
  },
  input: {
    fontSize: 18,
    minHeight: 150,
    textAlignVertical: 'top',
  },
  mediaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 15,
  },
  mediaItem: {
    width: 100,
    height: 100,
    marginRight: 10,
    marginBottom: 10,
    position: 'relative',
  },
  mediaImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  removeBtn: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeBtnText: {
    color: '#fff',
    fontSize: 16,
  },
  tagsInput: {
    marginTop: 15,
    fontSize: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  footer: {
    borderTopWidth: 1,
    padding: 15,
  },
  mediaBtn: {
    padding: 10,
  },
  mediaBtnText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
