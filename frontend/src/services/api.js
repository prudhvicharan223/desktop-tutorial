import axios from 'axios';
import { API_URL } from '../constants';

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
