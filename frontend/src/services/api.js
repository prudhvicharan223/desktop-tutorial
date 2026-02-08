import axios from 'axios';
import { API_URL } from '../constants';

// Social Media APIs

// Posts
export const getFeed = async (page = 1, limit = 10) => {
  const response = await axios.get(`${API_URL}/api/posts/feed`, {
    params: { page, limit }
  });
  return response.data;
};

export const createPost = async (postData) => {
  const response = await axios.post(`${API_URL}/api/posts`, postData);
  return response.data;
};

export const getPost = async (postId) => {
  const response = await axios.get(`${API_URL}/api/posts/${postId}`);
  return response.data;
};

export const updatePost = async (postId, postData) => {
  const response = await axios.put(`${API_URL}/api/posts/${postId}`, postData);
  return response.data;
};

export const deletePost = async (postId) => {
  const response = await axios.delete(`${API_URL}/api/posts/${postId}`);
  return response.data;
};

export const likePost = async (postId) => {
  const response = await axios.post(`${API_URL}/api/posts/${postId}/like`);
  return response.data;
};

export const sharePost = async (postId) => {
  const response = await axios.post(`${API_URL}/api/posts/${postId}/share`);
  return response.data;
};

export const getUserPosts = async (userId, page = 1, limit = 12) => {
  const response = await axios.get(`${API_URL}/api/posts/user/${userId}`, {
    params: { page, limit }
  });
  return response.data;
};

// Comments
export const getComments = async (postId, page = 1, limit = 20) => {
  const response = await axios.get(`${API_URL}/api/posts/${postId}/comments`, {
    params: { page, limit }
  });
  return response.data;
};

export const createComment = async (postId, content, parentComment = null) => {
  const response = await axios.post(`${API_URL}/api/posts/${postId}/comments`, {
    content,
    parentComment
  });
  return response.data;
};

export const likeComment = async (commentId) => {
  const response = await axios.post(`${API_URL}/api/posts/comments/${commentId}/like`);
  return response.data;
};

export const deleteComment = async (commentId) => {
  const response = await axios.delete(`${API_URL}/api/posts/comments/${commentId}`);
  return response.data;
};

// Follow
export const followUser = async (userId) => {
  const response = await axios.post(`${API_URL}/api/users/${userId}/follow`);
  return response.data;
};

export const unfollowUser = async (userId) => {
  const response = await axios.delete(`${API_URL}/api/users/${userId}/unfollow`);
  return response.data;
};

export const getFollowers = async (userId, page = 1, limit = 20) => {
  const response = await axios.get(`${API_URL}/api/users/${userId}/followers`, {
    params: { page, limit }
  });
  return response.data;
};

export const getFollowing = async (userId, page = 1, limit = 20) => {
  const response = await axios.get(`${API_URL}/api/users/${userId}/following`, {
    params: { page, limit }
  });
  return response.data;
};

export const checkFollowing = async (userId) => {
  const response = await axios.get(`${API_URL}/api/users/${userId}/check`);
  return response.data;
};

// Stories
export const getStories = async () => {
  const response = await axios.get(`${API_URL}/api/stories`);
  return response.data;
};

export const getUserStories = async (userId) => {
  const response = await axios.get(`${API_URL}/api/stories/${userId}`);
  return response.data;
};

export const createStory = async (storyData) => {
  const response = await axios.post(`${API_URL}/api/stories`, storyData);
  return response.data;
};

export const deleteStory = async (storyId) => {
  const response = await axios.delete(`${API_URL}/api/stories/${storyId}`);
  return response.data;
};

export const getStoryViewers = async (storyId) => {
  const response = await axios.get(`${API_URL}/api/stories/${storyId}/viewers`);
  return response.data;
};

// Reels
export const getReels = async (page = 1, limit = 10) => {
  const response = await axios.get(`${API_URL}/api/reels`, {
    params: { page, limit }
  });
  return response.data;
};

export const getReel = async (reelId) => {
  const response = await axios.get(`${API_URL}/api/reels/${reelId}`);
  return response.data;
};

export const createReel = async (reelData) => {
  const response = await axios.post(`${API_URL}/api/reels`, reelData);
  return response.data;
};

export const deleteReel = async (reelId) => {
  const response = await axios.delete(`${API_URL}/api/reels/${reelId}`);
  return response.data;
};

export const likeReel = async (reelId) => {
  const response = await axios.post(`${API_URL}/api/reels/${reelId}/like`);
  return response.data;
};

export const shareReel = async (reelId) => {
  const response = await axios.post(`${API_URL}/api/reels/${reelId}/share`);
  return response.data;
};

export const getUserReels = async (userId, page = 1, limit = 12) => {
  const response = await axios.get(`${API_URL}/api/reels/user/${userId}`, {
    params: { page, limit }
  });
  return response.data;
};

// Explore
export const getExploreFeed = async (page = 1, limit = 20, type = 'all') => {
  const response = await axios.get(`${API_URL}/api/explore`, {
    params: { page, limit, type }
  });
  return response.data;
};

export const searchContent = async (query, type = 'all', page = 1, limit = 20) => {
  const response = await axios.get(`${API_URL}/api/explore/search`, {
    params: { query, type, page, limit }
  });
  return response.data;
};

export const getTrendingTags = async (limit = 20) => {
  const response = await axios.get(`${API_URL}/api/explore/trending`, {
    params: { limit }
  });
  return response.data;
};

// Moderation
export const reportContent = async (itemType, itemId, reason, description) => {
  const response = await axios.post(`${API_URL}/api/moderation/report`, {
    itemType,
    itemId,
    reason,
    description
  });
  return response.data;
};

// Analytics
export const getAnalytics = async (period = '7days') => {
  const response = await axios.get(`${API_URL}/api/analytics`, {
    params: { period }
  });
  return response.data;
};

export const getPostInsights = async (postId) => {
  const response = await axios.get(`${API_URL}/api/analytics/posts/${postId}`);
  return response.data;
};

export const getReelInsights = async (reelId) => {
  const response = await axios.get(`${API_URL}/api/analytics/reels/${reelId}`);
  return response.data;
};

// Upload
export const uploadMedia = async (formData) => {
  const response = await axios.post(`${API_URL}/api/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

// Chat APIs
export const getChats = async () => {
  const response = await axios.get(`${API_URL}/api/chats`);
  return response.data;
};

export const createChat = async (participantId) => {
  const response = await axios.post(`${API_URL}/api/chats/create`, {
    participantId
  });
  return response.data;
};

export const createGroup = async (groupName, participantIds, groupDescription, groupIcon) => {
  const response = await axios.post(`${API_URL}/api/chats/group`, {
    groupName,
    participantIds,
    groupDescription,
    groupIcon
  });
  return response.data;
};

export const getChat = async (chatId) => {
  const response = await axios.get(`${API_URL}/api/chats/${chatId}`);
  return response.data;
};

export const updateGroup = async (chatId, groupData) => {
  const response = await axios.put(`${API_URL}/api/chats/group/${chatId}`, groupData);
  return response.data;
};

export const addParticipants = async (chatId, participantIds) => {
  const response = await axios.post(`${API_URL}/api/chats/group/${chatId}/add-participants`, {
    participantIds
  });
  return response.data;
};

export const removeParticipant = async (chatId, participantId) => {
  const response = await axios.post(`${API_URL}/api/chats/group/${chatId}/remove-participant`, {
    participantId
  });
  return response.data;
};

// Message APIs
export const getMessages = async (chatId, page = 1, limit = 50) => {
  const response = await axios.get(`${API_URL}/api/messages/${chatId}`, {
    params: { page, limit }
  });
  return response.data;
};

export const sendMessage = async (messageData) => {
  const response = await axios.post(`${API_URL}/api/messages`, messageData);
  return response.data;
};

export const markAsRead = async (chatId) => {
  const response = await axios.put(`${API_URL}/api/messages/read/${chatId}`);
  return response.data;
};

export const deleteMessage = async (messageId, deleteFor = 'me') => {
  const response = await axios.delete(`${API_URL}/api/messages/${messageId}`, {
    data: { deleteFor }
  });
  return response.data;
};

// User APIs
export const searchUsers = async (query) => {
  const response = await axios.get(`${API_URL}/api/users/search`, {
    params: { query }
  });
  return response.data;
};

export const getUserById = async (userId) => {
  const response = await axios.get(`${API_URL}/api/users/${userId}`);
  return response.data;
};

export const blockUser = async (userId) => {
  const response = await axios.post(`${API_URL}/api/users/block/${userId}`);
  return response.data;
};

export const unblockUser = async (userId) => {
  const response = await axios.post(`${API_URL}/api/users/unblock/${userId}`);
  return response.data;
};

// Upload API
export const uploadFile = async (fileUri, mediaType) => {
  const formData = new FormData();
  
  const filename = fileUri.split('/').pop();
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `${mediaType}/${match[1]}` : mediaType;

  formData.append('file', {
    uri: fileUri,
    name: filename,
    type
  });
  formData.append('mediaType', mediaType);

  const response = await axios.post(`${API_URL}/api/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};
