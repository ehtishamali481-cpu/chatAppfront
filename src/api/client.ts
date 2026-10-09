import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { User, Conversation, Message, CopilotMessage, StoryStatus } from '../types';

export const apiClient: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 15000,
  withCredentials: true, 
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    if (error.response?.status === 401) {
      
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      localStorage.removeItem('current_user_id');
    }
    return Promise.reject(error);
  }
);

export const loginApi = async (
  email: string,
  password: string
): Promise<{ user: User; token: string }> => {
  try {
    const response = await apiClient.post('/auth/login', { email, password });
    const { user: rawUser, token } = response.data.data;

    const user: User = {
      ...rawUser,
      id: rawUser._id || rawUser.id,
      name: rawUser.fullName || rawUser.name,
      avatarUrl: rawUser.profileImage?.url || rawUser.profileImage,
    };

    if (token) {
      localStorage.setItem('token', token);
    }
    if (user.id) {
      localStorage.setItem('current_user_id', user.id);
    }

    return { user, token };
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || 'Login failed. Please verify credentials.'
    );
  }
};

export const signUpApi = async (userData: {
  fullName: string;
  email: string;
  password: string;
  avatarUrl?: string;
}): Promise<{ user: User; token: string }> => {
  try {
    const response = await apiClient.post('/auth/signup', {
      fullName: userData.fullName,
      email: userData.email,
      password: userData.password,
      profileImage: userData.avatarUrl,
    });

    const { user: rawUser, token } = response.data.data;

    const user: User = {
      ...rawUser,
      id: rawUser._id || rawUser.id,
      name: rawUser.fullName || rawUser.name,
      avatarUrl: rawUser.profileImage?.url || rawUser.profileImage,
    };

    if (token) {
      localStorage.setItem('token', token);
    }
    if (user.id) {
      localStorage.setItem('current_user_id', user.id);
    }

    return { user, token };
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Sign up failed.');
  }
};

export const logoutApi = async (): Promise<void> => {
  try {
    await apiClient.post('/auth/logout');
  } catch (e) {
    console.warn('Backend logout warning:', e);
  } finally {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    localStorage.removeItem('current_user_id');
  }
};

export const getCurrentUserApi = async (): Promise<User> => {
  const response = await apiClient.get('/auth/me');
  const rawUser = response.data.data?.user || response.data.user;
  const user: User = {
    ...rawUser,
    id: rawUser._id || rawUser.id,
    name: rawUser.fullName || rawUser.name,
    avatarUrl: rawUser.profileImage?.url || rawUser.profileImage,
    about: rawUser.about || 'Hey there! I am using WhatsApp.',
    aboutUpdatedAt: rawUser.aboutUpdatedAt || rawUser.updatedAt,
  };
  if (user.id) {
    localStorage.setItem('current_user_id', user.id);
  }
  return user;
};

export const updateUserProfileApi = async (data: Partial<User>): Promise<User> => {
  const payload: any = { ...data };
  if (data.name) payload.fullName = data.name;
  if (data.avatarUrl !== undefined) payload.profileImage = data.avatarUrl;
  if (data.about !== undefined) payload.about = data.about;

  const response = await apiClient.put('/users/profile', payload);
  const rawUser = response.data.data?.user || response.data.user;
  return {
    ...rawUser,
    id: rawUser._id || rawUser.id,
    name: rawUser.fullName || rawUser.name,
    avatarUrl: rawUser.profileImage?.url || rawUser.profileImage,
    about: rawUser.about,
    aboutUpdatedAt: rawUser.aboutUpdatedAt,
  };
};

export const updateAboutApi = async (about: string): Promise<User> => {
  const response = await apiClient.put('/users/profile/about', { about });
  const rawUser = response.data.data?.user || response.data.user;
  return {
    ...rawUser,
    id: rawUser._id || rawUser.id,
    name: rawUser.fullName || rawUser.name,
    avatarUrl: rawUser.profileImage?.url || rawUser.profileImage,
    about: rawUser.about,
    aboutUpdatedAt: rawUser.aboutUpdatedAt,
  };
};

export const searchUsersApi = async (query: string): Promise<User[]> => {
  try {
    const response = await apiClient.get(`/users/search?q=${encodeURIComponent(query)}`);
    const users = response.data.data?.users || response.data.users || [];
    return users.map((u: any) => ({
      ...u,
      id: u._id || u.id,
      name: u.fullName || u.name,
      avatarUrl: u.profileImage?.url || u.profileImage,
    }));
  } catch (error: any) {
    console.warn('Search users failed:', error.message);
    return [];
  }
};

export const getUserByIdApi = async (userId: string): Promise<User> => {
  const response = await apiClient.get(`/users/${userId}`);
  const u = response.data.data?.user || response.data.user;
  return {
    ...u,
    id: u._id || u.id,
    name: u.fullName || u.name,
    avatarUrl: u.profileImage?.url || u.profileImage,
  };
};

export const checkUserByEmailApi = async (email: string): Promise<User> => {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail) {
    throw new Error('Please enter a valid email address.');
  }

  const currentUserId = localStorage.getItem('current_user_id') || '';

try {
    const response = await apiClient.get(`/users/by-email?email=${encodeURIComponent(cleanEmail)}`);
    const rawUser = response.data?.data?.user || response.data?.user;
    if (rawUser) {
      const uId = rawUser._id || rawUser.id;
      if (currentUserId && uId && uId.toString() === currentUserId) {
        const err = new Error('You cannot start a direct conversation with yourself.');
        (err as any).isSelf = true;
        throw err;
      }

      return {
        ...rawUser,
        id: uId,
        name: rawUser.fullName || rawUser.name || cleanEmail,
        avatarUrl: rawUser.profileImage?.url || rawUser.profileImage || '',
      };
    }
  } catch (err: any) {
    if (err.isSelf) throw err;
    if (err.response?.status === 400 && err.response?.data?.isSelf) {
      const error = new Error('You cannot start a direct conversation with yourself.');
      (error as any).isSelf = true;
      throw error;
    }
    
  }

try {
    const response = await apiClient.get(`/users/search?q=${encodeURIComponent(cleanEmail)}`);
    const users = response.data?.data?.users || response.data?.users || [];
    const matched = users.find(
      (u: any) => u.email && u.email.toLowerCase().trim() === cleanEmail
    );

    if (matched) {
      const uId = matched._id || matched.id;
      if (currentUserId && uId && uId.toString() === currentUserId) {
        const error = new Error('You cannot start a direct conversation with yourself.');
        (error as any).isSelf = true;
        throw error;
      }

      return {
        ...matched,
        id: uId,
        name: matched.fullName || matched.name || cleanEmail,
        avatarUrl: matched.profileImage?.url || matched.profileImage || '',
      };
    }
  } catch (err: any) {
    if (err.isSelf) throw err;
  }

  throw new Error(`No registered user found with email: ${cleanEmail}`);
};

export const fetchConversationsApi = async (currentUserId?: string): Promise<Conversation[]> => {
  try {
    const response = await apiClient.get('/conversations');
    const resData = response.data?.data || response.data;
    const raw = resData?.items || resData?.conversations || (Array.isArray(resData) ? resData : []);
    const list = Array.isArray(raw) ? raw : [];

    const effectiveUserId = currentUserId || localStorage.getItem('current_user_id') || '';
    return list.map((c) => normalizeConversation(c, effectiveUserId));
  } catch (error: any) {
    throw new Error('Network error: Unable to sync conversations from database.');
  }
};

export const startChatByEmailApi = async (email: string, currentUserId?: string): Promise<Conversation> => {
  try {
    const response = await apiClient.post('/conversations/start', { email: email.trim().toLowerCase() });
    const data = response.data?.data || response.data;
    const effectiveUserId = currentUserId || localStorage.getItem('current_user_id') || '';
    const conversationData = data?.conversation || data;
    return normalizeConversation(conversationData, effectiveUserId);
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to start chat by email.');
  }
};

export const createConversationApi = async (
  participantIds: string[],
  name?: string,
  description?: string,
  currentUserId?: string
): Promise<Conversation> => {
  try {
    const response = await apiClient.post('/conversations', {
      name,
      participantIds,
      description,
    });
    const data = response.data?.data || response.data;
    const effectiveUserId = currentUserId || localStorage.getItem('current_user_id') || '';
    const conversationData = data?.conversation || data;
    return normalizeConversation(conversationData, effectiveUserId);
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to create conversation.');
  }
};

export const toggleArchiveApi = async (conversationId: string): Promise<{ archived: boolean }> => {
  const response = await apiClient.put(`/conversations/${conversationId}/archive`);
  return response.data.data || response.data;
};

export const toggleMuteApi = async (conversationId: string): Promise<{ muted: boolean }> => {
  const response = await apiClient.put(`/conversations/${conversationId}/mute`);
  return response.data.data || response.data;
};

export const togglePinApi = async (conversationId: string): Promise<{ pinned: boolean }> => {
  const response = await apiClient.put(`/conversations/${conversationId}/pin`);
  return response.data.data || response.data;
};

export const deleteConversationApi = async (conversationId: string): Promise<void> => {
  await apiClient.delete(`/conversations/${conversationId}`);
};

export const fetchMessagesApi = async (conversationId: string): Promise<Message[]> => {
  try {
    const response = await apiClient.get(`/messages/conversation/${conversationId}?limit=50`);
    const resData = response.data?.data || response.data;
    const raw = resData?.items || resData?.messages || (Array.isArray(resData) ? resData : []);
    const list = Array.isArray(raw) ? raw : [];
    return list.map(normalizeMessage);
  } catch (error: any) {
    throw new Error('Network error: Failed to fetch messages.');
  }
};

export const sendMessageApi = async (
  conversationId: string,
  text: string,
  messageType: 'text' | 'image' | 'audio' | 'file' | 'quote' = 'text',
  extra?: {
    audio?: { duration: number; waveform: number[] };
    attachment?: any;
    replyTo?: string;
    mediaUrl?: string;
  }
): Promise<Message> => {
  try {
    
    const backendType =
      messageType === 'quote'
        ? 'text'
        : messageType === 'file'
        ? 'document'
        : messageType;

    const mediaUrl = extra?.mediaUrl || extra?.attachment?.url || '';

    const response = await apiClient.post('/messages', {
      conversationId,
      messageType: backendType,
      text: text || '',
      mediaUrl,
      mediaMeta: extra?.attachment
        ? {
            fileName: extra.attachment.name,
            fileSize: extra.attachment.size ? parseInt(extra.attachment.size, 10) || 0 : 0,
            mimeType: extra.attachment.type,
            duration: extra.audio?.duration,
          }
        : extra?.audio
        ? {
            duration: extra.audio.duration,
            mimeType: 'audio/mp3',
          }
        : undefined,
      replyTo: extra?.replyTo,
    });

    const msgData = response.data.data?.message || response.data.data || response.data;
    return normalizeMessage(msgData);
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Message dispatch failed.');
  }
};

export const markMessagesReadApi = async (conversationId: string): Promise<void> => {
  try {
    await apiClient.put(`/messages/conversation/${conversationId}/read`);
  } catch (error: any) {
    console.warn('Failed to mark messages as read:', error.message);
  }
};

export const editMessageApi = async (messageId: string, text: string): Promise<Message> => {
  const response = await apiClient.put(`/messages/${messageId}/edit`, { text });
  const msgData = response.data.data?.message || response.data.data;
  return normalizeMessage(msgData);
};

export const deleteMessageForEveryoneApi = async (messageId: string): Promise<void> => {
  await apiClient.delete(`/messages/${messageId}/everyone`);
};

export const deleteMessageForMeApi = async (messageId: string): Promise<void> => {
  await apiClient.delete(`/messages/${messageId}/me`);
};

export const reactToMessageApi = async (messageId: string, emoji: string): Promise<any> => {
  const response = await apiClient.post(`/messages/${messageId}/reaction`, { emoji });
  return response.data.data;
};

export const searchMessagesApi = async (conversationId: string, q: string): Promise<Message[]> => {
  const response = await apiClient.get(`/messages/conversation/${conversationId}/search?q=${encodeURIComponent(q)}`);
  const raw = response.data.data?.messages || response.data.data || [];
  return Array.isArray(raw) ? raw.map(normalizeMessage) : [];
};

export const uploadFileApi = async (
  file: File,
  folder = 'media'
): Promise<{ url: string; fileName: string; fileSize: number; fileType: string }> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);

  const response = await apiClient.post('/uploads', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data.data || response.data;
};

export const createStatusApi = async (data: {
  type?: 'text' | 'image' | 'video';
  text?: string;
  mediaUrl?: string;
  mediaMeta?: any;
}): Promise<any> => {
  const response = await apiClient.post('/status', {
    type: data.type || (data.mediaUrl ? 'image' : 'text'),
    text: data.text || '',
    mediaUrl: data.mediaUrl || '',
    mediaMeta: data.mediaMeta || {},
  });
  return response.data.data?.status || response.data.data;
};

export const getMyStatusesApi = async (): Promise<any[]> => {
  try {
    const response = await apiClient.get('/status/my');
    return response.data.data?.statuses || response.data.statuses || [];
  } catch (error: any) {
    console.warn('Failed to get my statuses:', error.message);
    return [];
  }
};

export const getContactsStatusesApi = async (): Promise<any[]> => {
  try {
    const response = await apiClient.get('/status/contacts');
    return response.data.data?.statuses || response.data.statuses || [];
  } catch (error: any) {
    console.warn('Failed to get contact statuses:', error.message);
    return [];
  }
};

export const viewStatusApi = async (statusId: string): Promise<any> => {
  try {
    const response = await apiClient.post(`/status/${statusId}/view`);
    return response.data.data || response.data;
  } catch (error: any) {
    console.warn('Failed to record status view:', error.message);
  }
};

export const deleteStatusApi = async (statusId: string): Promise<void> => {
  await apiClient.delete(`/status/${statusId}`);
};


export const sendCopilotQueryApi = async (prompt: string, model?: string): Promise<CopilotMessage> => {
  try {
    const response = await apiClient.post('/copilot/query', { prompt, model });
    return response.data.data || response.data;
  } catch (error: any) {
    throw new Error('Copilot service unavailable.');
  }
};

export function normalizeConversation(raw: any, currentUserId?: string): Conversation {
  if (!raw) return raw;

  const participants: any[] = raw.participants || [];
  const isGroup = raw.type === 'group' || raw.isGroup || false;
  const myId = (currentUserId || localStorage.getItem('current_user_id') || '').toString();

  const otherUser = isGroup
    ? null
    : participants.find((p: any) => {
        const pId = (typeof p === 'string' ? p : (p?._id || p?.id || '')).toString();
        return pId && myId ? pId !== myId : true;
      }) || (participants.length > 1 ? (participants[0]?.toString() === myId ? participants[1] : participants[0]) : participants[0]);

  const name = isGroup
    ? raw.name || raw.group?.name || 'Group Chat'
    : otherUser?.fullName || otherUser?.name || raw.name || 'Direct Chat';

  const avatar = isGroup
    ? raw.image?.url || raw.avatar || raw.group?.image?.url
    : otherUser?.profileImage?.url || otherUser?.profileImage || otherUser?.avatarUrl || raw.avatar;

  const online = isGroup
    ? participants.some((p: any) => p.online)
    : Boolean(otherUser?.online);

const lm = raw.lastMessage;
  const lastMessageText = lm?.text || lm?.mediaUrl
    ? (lm.text || (lm.messageType === 'image' ? 'Sent an image' : 'Sent a file'))
    : 'No messages yet';

const unreadCount =
    (currentUserId && raw.unreadCounts && typeof raw.unreadCounts === 'object'
      ? raw.unreadCounts[currentUserId] || 0
      : 0) || 0;

const pinned = Boolean(
    currentUserId &&
      Array.isArray(raw.pinnedBy) &&
      raw.pinnedBy.some((p: any) => (p._id || p).toString() === currentUserId)
  );

  const archived = Boolean(
    currentUserId &&
      Array.isArray(raw.archivedBy) &&
      raw.archivedBy.some((p: any) => (p._id || p).toString() === currentUserId)
  );

  const muted = Boolean(
    currentUserId &&
      Array.isArray(raw.mutedBy) &&
      raw.mutedBy.some((p: any) => (p._id || p).toString() === currentUserId)
  );

  return {
    id: raw._id?.toString() || raw.id,
    name,
    isGroup,
    avatar,
    online,
    phone: otherUser?.phone || otherUser?.email || '',
    bio: otherUser?.about || otherUser?.bio || '',
    about: otherUser?.about || 'Hey there! I am using WhatsApp.',
    aboutUpdatedAt: otherUser?.aboutUpdatedAt || otherUser?.updatedAt || '',
    otherUserId: otherUser?._id?.toString() || otherUser?.id?.toString() || (typeof otherUser === 'string' ? otherUser : ''),
    lastMessage: {
      text: lastMessageText,
      sender: lm?.senderId?.fullName || lm?.senderId?.name,
      timestamp: lm?.createdAt
        ? new Date(lm.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : '',
      isAudio: lm?.messageType === 'audio',
      hasAttachment: lm?.messageType === 'image' || lm?.messageType === 'document' || lm?.messageType === 'file',
    },
    unreadCount,
    pinned,
    favorite: false,
    archived,
    muted,
  };
}

export function normalizeMessage(raw: any): Message {
  if (!raw) return raw;

  const sender = raw.senderId;
  const isAudio = raw.messageType === 'audio';
  const isImage = raw.messageType === 'image';
  const isDoc = raw.messageType === 'document' || raw.messageType === 'file';

  const type = isAudio ? 'audio' : isImage ? 'image' : isDoc ? 'file' : 'text';

  return {
    id: raw._id?.toString() || raw.id,
    conversationId: raw.conversationId?.toString() || '',
    senderId: sender?._id?.toString() || sender?.id?.toString() || sender?.toString() || '',
    senderName: sender?.fullName || sender?.name || 'User',
    senderAvatar: sender?.profileImage?.url || sender?.profileImage || sender?.avatarUrl,
    content: raw.text || '',
    timestamp: raw.createdAt
      ? new Date(raw.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : '',
    type: type as any,
    status: (raw.deletedForEveryone || raw.status === 'read' || (Array.isArray(raw.readBy) && raw.readBy.some((r: any) => {
      const rId = (r.userId?._id || r.userId || r).toString();
      const sId = (sender?._id || sender?.id || sender || '').toString();
      return rId && rId !== sId;
    })))
      ? 'read'
      : (raw.status === 'delivered' || (Array.isArray(raw.deliveredTo) && raw.deliveredTo.some((d: any) => {
          const dId = (d.userId?._id || d.userId || d).toString();
          const sId = (sender?._id || sender?.id || sender || '').toString();
          return dId && dId !== sId;
        })))
      ? 'delivered'
      : 'sent',
    reactions: (raw.reactions || []).map((r: any) => ({
      emoji: r.emoji,
      count: 1,
      users: [r.userId?._id?.toString() || r.userId?.toString() || ''],
    })),
    isPinned: Boolean(raw.isPinned),
    createdAt: raw.createdAt ? new Date(raw.createdAt).getTime() : Date.now(),
    isEdited: Boolean(raw.edited),
    isDeleted: Boolean(raw.deletedForEveryone),
    attachment: raw.mediaUrl
      ? {
          id: `att_${raw._id || Date.now()}`,
          name: raw.mediaMeta?.fileName || (isImage ? 'Photo' : 'Document'),
          size: raw.mediaMeta?.fileSize
            ? `${Math.round(raw.mediaMeta.fileSize / 1024)} KB`
            : '',
          type: raw.mediaMeta?.mimeType || (isImage ? 'Image' : 'Document'),
          url: raw.mediaUrl,
        }
      : undefined,
    audio: isAudio
      ? {
          duration: raw.mediaMeta?.duration || 5,
          url: raw.mediaUrl,
          waveform: [35, 65, 45, 85, 55, 75, 45, 95, 65, 45, 85, 55],
        }
      : undefined,
    ...(raw.replyTo
      ? {
          quote: {
            title: raw.replyTo.senderId?.fullName || raw.replyTo.senderId?.name || 'Message',
            text: raw.replyTo.text || '',
            time: raw.replyTo.createdAt
              ? new Date(raw.replyTo.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : '',
          },
        }
      : {}),
  };
}