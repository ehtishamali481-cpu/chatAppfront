import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Conversation, Message, StoryStatus, CallLog, UserPreferences, AppNotification } from '../types';
import {
  sendMessageApi,
  fetchConversationsApi,
  startChatByEmailApi,
  fetchMessagesApi,
  markMessagesReadApi,
  editMessageApi,
  deleteMessageForEveryoneApi,
  deleteMessageForMeApi,
  reactToMessageApi,
  toggleArchiveApi,
  toggleMuteApi,
  togglePinApi,
  createStatusApi,
  getMyStatusesApi,
  getContactsStatusesApi,
  viewStatusApi,
  sendCopilotQueryApi,
  deleteConversationApi,
} from '../api/client';

export const CHATLY_AI_CONVERSATION: Conversation = {
  id: 'chatly_ai',
  name: 'Chatly AI',
  isGroup: false,
  role: 'AI Assistant',
  avatar: '/chatly-ai-meta.png',
  online: false,
  bio: 'Chatly AI Assistant',
  about: 'AI Assistant',
  aboutUpdatedAt: '',
  phone: 'ai@chatly.internal',
  otherUserId: 'chatly_ai',
  pinned: false,
  favorite: false,
  unreadCount: 0,
  lastMessage: {
    text: '',
    sender: '',
    timestamp: '',
  },
};

const DEFAULT_INITIAL_CALL_LOGS: CallLog[] = [
  {
    id: 'call_seed_1',
    name: 'Chatly AI',
    avatar: '/chatly-ai-meta.png',
    conversationId: 'chatly_ai',
    type: 'outgoing',
    callType: 'audio',
    timestamp: 'Today, 04:15 AM',
    duration: '1m 24s',
  },
  {
    id: 'call_seed_2',
    name: 'Ali Awan',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    conversationId: 'conv_seed_2',
    type: 'incoming',
    callType: 'audio',
    timestamp: 'Yesterday, 11:20 PM',
    duration: '4m 12s',
  },
  {
    id: 'call_seed_3',
    name: 'Sarah Jenkins',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    conversationId: 'conv_seed_3',
    type: 'missed',
    callType: 'video',
    timestamp: 'Yesterday, 07:45 PM',
    duration: 'Missed',
  },
  {
    id: 'call_seed_4',
    name: 'Hamza Khan',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150',
    conversationId: 'conv_seed_4',
    type: 'outgoing',
    callType: 'video',
    timestamp: 'October 1, 09:30 PM',
    duration: '8m 45s',
  },
];
import {
  connectSocket,
  getSocket,
  joinConversation,
  leaveConversation,
  emitTypingStart,
  emitTypingStop,
} from '../services/socketService';
import { useAuth } from './AuthContext';
import { soundEffects } from '../utils/soundEffects';

export type TopTab = 'all' | 'channels' | 'copilot' | 'audio-video';
export type FilterType = 'all' | 'unread' | 'groups' | 'favorites' | 'archived';
export type SyncStatus = 'synced' | 'syncing' | 'offline' | 'pending';

interface ActiveCall {
  conversation: Conversation;
  type: 'audio' | 'video';
  status: 'ringing' | 'connected';
  startTime: number;
  isIncoming?: boolean;
  role?: 'caller' | 'callee';
}

interface PendingMessage {
  conversationId: string;
  message: Message;
}

interface ChatContextType {
  conversations: Conversation[];
  activeConversationId: string;
  activeConversation: Conversation | undefined;
  setActiveConversationId: (id: string) => void;
  filter: FilterType;
  setFilter: (filter: FilterType) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeTopTab: TopTab;
  setActiveTopTab: (tab: TopTab) => void;
  isInfoPanelOpen: boolean;
  setIsInfoPanelOpen: (open: boolean) => void;
  toggleInfoPanel: () => void;
  messages: Message[];
  sendMessage: (
    content: string,
    type?: 'text' | 'audio' | 'file' | 'image' | 'quote',
    extra?: { audio?: { duration: number; waveform: number[] }; attachment?: any; quote?: any; mediaUrl?: string }
  ) => Promise<void>;
  addReaction: (messageId: string, emoji: string) => Promise<void>;
  toggleReaction: (messageId: string, emoji: string) => Promise<void>;
  togglePinMessage: (messageId: string) => void;
  toggleFavoriteConversation: (conversationId: string) => void;
  toggleMuteConversation: (conversationId: string) => Promise<void>;
  toggleArchiveConversation: (conversationId: string) => Promise<void>;
  archiveConversation: (conversationId: string) => Promise<void>;
  unarchiveConversation: (conversationId: string) => Promise<void>;
  blockContact: (conversationId: string) => void;
  activeCall: ActiveCall | null;
  startCall: (conversation: Conversation, type: 'audio' | 'video') => void;
  acceptCall: () => void;
  rejectCall: () => void;
  endCall: () => void;
  stories: StoryStatus[];
  activeStory: StoryStatus | null;
  setActiveStory: (story: StoryStatus | null) => void;
  postStatus: (
    data: { type: 'text' | 'image' | 'video'; text?: string; mediaUrl?: string; bgColor?: string } | string,
    mediaUrl?: string
  ) => Promise<void>;
  viewStatus: (statusId: string) => Promise<void>;
  callLogs: CallLog[];
  notifications: AppNotification[];
  unreadNotificationCount: number;
  isNotificationsOpen: boolean;
  setIsNotificationsOpen: (open: boolean) => void;
  toggleNotifications: () => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  clearNotifications: () => void;
  isOnline: boolean;
  syncStatus: SyncStatus;
  pendingCount: number;
  manualSync: () => Promise<void>;
  userPrefs: UserPreferences;
  updateUserPrefs: (prefs: Partial<UserPreferences>) => void;
  replyingToMessage: Message | null;
  setReplyingToMessage: (msg: Message | null) => void;
  editMessage: (messageId: string, newContent: string) => Promise<boolean>;
  deleteMessageForMe: (messageId: string) => Promise<void>;
  deleteMessageForEveryone: (messageId: string) => Promise<boolean>;
  deleteConversation: (conversationId: string) => Promise<void>;
  refreshConversations: () => Promise<void>;
  refreshStatuses: () => Promise<void>;
  startDirectChat: (email: string) => Promise<Conversation>;
  startTyping: () => void;
  stopTyping: () => void;
  isAiThinking: boolean;
}

const defaultPreferences: UserPreferences = {
  soundEnabled: true,
  desktopNotify: true,
  readReceipts: true,
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationIdState] = useState<string>(() => {
    return localStorage.getItem('active_conversation_id') || '';
  });
  const [filter, setFilterState] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTopTab, setActiveTopTabState] = useState<TopTab>('all');
  const [isInfoPanelOpen, setIsInfoPanelOpenState] = useState<boolean>(false);
  const [allMessages, setAllMessages] = useState<Record<string, Message[]>>({});
  const [userPrefs, setUserPrefs] = useState<UserPreferences>(defaultPreferences);
  const [pendingMessages, setPendingMessages] = useState<PendingMessage[]>([]);
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('synced');
  const [activeCall, setActiveCall] = useState<ActiveCall | null>(null);
  const [stories, setStories] = useState<StoryStatus[]>([]);
  const [callLogs, setCallLogs] = useState<CallLog[]>(() => {
    try {
      const saved = localStorage.getItem('chatly_call_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Could not read call history from localStorage:', e);
    }
    return DEFAULT_INITIAL_CALL_LOGS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('chatly_call_history', JSON.stringify(callLogs));
    } catch (e) {
      console.warn('Could not save call history:', e);
    }
  }, [callLogs]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);
  const [activeStory, setActiveStory] = useState<StoryStatus | null>(null);
  const [replyingToMessage, setReplyingToMessage] = useState<Message | null>(null);

  const activeConversationIdRef = useRef(activeConversationId);
  activeConversationIdRef.current = activeConversationId;

  const conversationsRef = useRef(conversations);
  conversationsRef.current = conversations;

  const currentUserId = user?.id || '';

  const refreshConversations = useCallback(async () => {
    if (!user) return;
    try {
      const serverConvs = await fetchConversationsApi(user.id);
      const hasAi = serverConvs.some((c) => c.id === 'chatly_ai');
      const freshConvs = hasAi ? serverConvs : [CHATLY_AI_CONVERSATION, ...serverConvs];

      setConversations(freshConvs);
      if (freshConvs.length > 0) {
        const savedId = localStorage.getItem('active_conversation_id');
        const targetId =
          savedId && freshConvs.some((c) => c.id === savedId)
            ? savedId
            : (activeConversationIdRef.current && freshConvs.some((c) => c.id === activeConversationIdRef.current))
              ? activeConversationIdRef.current
              : freshConvs[0].id;

        setActiveConversationIdState(targetId);
        localStorage.setItem('active_conversation_id', targetId);

        if (targetId === 'chatly_ai') {
          setAllMessages((prev) => {
            const current = (prev['chatly_ai'] || []).filter((m) => m.id !== 'ai_welcome_1');
            return {
              ...prev,
              chatly_ai: current,
            };
          });
        } else {
          joinConversation(targetId);
          fetchMessagesApi(targetId)
            .then((msgs) => {
              setAllMessages((prev) => ({ ...prev, [targetId]: msgs }));
            })
            .catch((err) => console.warn('Could not load messages on refresh:', err));
        }
      }
    } catch (err) {
      console.warn('Could not refresh conversations:', err);
    }
  }, [user]);


  const refreshStatuses = useCallback(async () => {
    if (!user) return;
    try {
      const [myList, contactList] = await Promise.all([
        getMyStatusesApi(),
        getContactsStatusesApi(),
      ]);

      const formattedStories: StoryStatus[] = [];

      if (myList && myList.length > 0) {
        formattedStories.push({
          id: `own_story_${user.id}`,
          userId: user.id,
          userName: 'My Status',
          userAvatar: user.avatarUrl,
          isOwn: true,
          hasUnseen: false,
          timeAgo: 'Recently',
          items: myList.map((s: any) => ({
            id: s._id || s.id,
            type: s.type || (s.mediaUrl ? (s.mediaUrl.match(/\.(mp4|webm|mov|mkv)/i) ? 'video' : 'image') : 'text'),
            content: s.mediaUrl || s.text || '',
            caption: s.mediaUrl ? s.text || '' : '',
            timeAgo: s.createdAt ? new Date(s.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Today',
            bgColor: s.mediaMeta?.bgColor || '#065f46',
            viewers: s.viewers || [],
            viewersCount: s.totalViews ?? (s.viewers ? s.viewers.length : 0),
          })),
        });
      }

      const userGroupMap = new Map<string, any[]>();
      (contactList || []).forEach((s: any) => {
        const uId = s.userId?._id?.toString() || s.userId?.toString() || 'unknown';
        if (!userGroupMap.has(uId)) {
          userGroupMap.set(uId, []);
        }
        userGroupMap.get(uId)!.push(s);
      });

      userGroupMap.forEach((statusArray, uId) => {
        const first = statusArray[0];
        const uName = first.userId?.fullName || first.userId?.name || 'Contact';
        const uAvatar = first.userId?.profileImage?.url || first.userId?.profileImage;

        formattedStories.push({
          id: `contact_story_${uId}`,
          userId: uId,
          userName: uName,
          userAvatar: uAvatar,
          isOwn: false,
          hasUnseen: statusArray.some((s) => !s.viewers?.some((v: any) => (v.userId?._id || v.userId)?.toString() === user.id)),
          timeAgo: 'Recently',
          items: statusArray.map((s: any) => ({
            id: s._id || s.id,
            type: s.type || (s.mediaUrl ? (s.mediaUrl.match(/\.(mp4|webm|mov|mkv)/i) ? 'video' : 'image') : 'text'),
            content: s.mediaUrl || s.text || '',
            caption: s.mediaUrl ? s.text || '' : '',
            timeAgo: s.createdAt ? new Date(s.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Today',
            bgColor: s.mediaMeta?.bgColor || '#0f766e',
            viewers: s.viewers || [],
            viewersCount: s.totalViews ?? (s.viewers ? s.viewers.length : 0),
          })),
        });
      });

      setStories(formattedStories);
    } catch (err) {
      console.warn('Could not refresh statuses:', err);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) return;

    const sock = connectSocket(token);

    refreshConversations();
    refreshStatuses();

    const onMessageNew = (rawMsg: any) => {
      const msgConvId = rawMsg.conversationId?.toString() || '';
      const msgSenderId = rawMsg.senderId?._id?.toString() || rawMsg.senderId?.toString() || '';

      const isFromMe = msgSenderId === currentUserId;

      const msg: Message = {
        id: rawMsg._id?.toString() || rawMsg.id,
        conversationId: msgConvId,
        senderId: msgSenderId,
        senderName: rawMsg.senderId?.fullName || rawMsg.senderId?.name || 'User',
        senderAvatar: rawMsg.senderId?.profileImage?.url || rawMsg.senderId?.profileImage,
        content: rawMsg.text || '',
        timestamp: rawMsg.createdAt
          ? new Date(rawMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: (rawMsg.messageType === 'audio' ? 'audio' : rawMsg.messageType === 'image' ? 'image' : 'text') as any,
        status: isFromMe ? 'sent' : 'delivered',
        reactions: [],
        createdAt: rawMsg.createdAt ? new Date(rawMsg.createdAt).getTime() : Date.now(),
        attachment: rawMsg.mediaUrl
          ? {
            id: `att_${rawMsg._id || Date.now()}`,
            name: rawMsg.mediaMeta?.fileName || 'File',
            size: rawMsg.mediaMeta?.fileSize ? `${Math.round(rawMsg.mediaMeta.fileSize / 1024)} KB` : '',
            type: rawMsg.mediaMeta?.mimeType || (rawMsg.messageType === 'image' ? 'Image' : 'File'),
            url: rawMsg.mediaUrl,
          }
          : undefined,
      };

      if (!isFromMe) {
        if (userPrefs.soundEnabled) {
          soundEffects.playMessageReceived();
        }
        sock.emit('message:delivered', {
          messageId: msg.id,
          conversationId: msgConvId,
        });

        if (activeConversationIdRef.current === msgConvId) {
          markMessagesReadApi(msgConvId);
          sock.emit('message:read', { conversationId: msgConvId });
        }
      }

      setAllMessages((prev) => {
        const existing = prev[msgConvId] || [];
        if (existing.some((m) => m.id === msg.id)) return prev;
        if (msgSenderId === currentUserId) {
          const pendingIdx = existing.findIndex(
            (m) =>
              m.status === 'pending' ||
              (m.id.startsWith('msg_') && m.content === msg.content)
          );
          if (pendingIdx !== -1) {
            const nextList = [...existing];
            nextList[pendingIdx] = msg;
            return {
              ...prev,
              [msgConvId]: nextList,
            };
          }
        }

        return {
          ...prev,
          [msgConvId]: [...existing, msg],
        };
      });

      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === msgConvId) {
            return {
              ...c,
              lastMessage: {
                text: msg.content || (msg.type === 'image' ? 'Sent an image' : 'Attachment'),
                timestamp: msg.timestamp,
                sender: msg.senderName,
                isAudio: msg.type === 'audio',
                hasAttachment: msg.type === 'image' || msg.type === 'file',
              },
              unreadCount: c.id === activeConversationIdRef.current ? 0 : (c.unreadCount || 0) + 1,
            };
          }
          return c;
        })
      );
    };

    const onMessageEdit = (updatedMsg: any) => {
      const convId = updatedMsg.conversationId?.toString();
      if (!convId) return;
      setAllMessages((prev) => ({
        ...prev,
        [convId]: (prev[convId] || []).map((m) =>
          m.id === updatedMsg._id?.toString() ? { ...m, content: updatedMsg.text, isEdited: true } : m
        ),
      }));
    };

    const onMessageDelete = ({ messageId, conversationId: convId }: any) => {
      if (!convId) return;
      setAllMessages((prev) => ({
        ...prev,
        [convId]: (prev[convId] || []).map((m) =>
          m.id === messageId?.toString()
            ? { ...m, content: '🚫 This message was deleted', isDeleted: true, reactions: [] }
            : m
        ),
      }));
    };

    const onMessageReaction = ({ messageId, conversationId: convId, reactions }: any) => {
      if (!convId) return;
      setAllMessages((prev) => ({
        ...prev,
        [convId]: (prev[convId] || []).map((m) => {
          if (m.id === messageId?.toString()) {
            const grouped: Record<string, { emoji: string; count: number; users: string[] }> = {};
            (reactions || []).forEach((r: any) => {
              if (!grouped[r.emoji]) grouped[r.emoji] = { emoji: r.emoji, count: 0, users: [] };
              grouped[r.emoji].count++;
              grouped[r.emoji].users.push(r.userId?.toString() || '');
            });
            return { ...m, reactions: Object.values(grouped) };
          }
          return m;
        }),
      }));
    };

    const onMessageDelivered = ({ messageId, conversationId: convId }: any) => {
      const targetConvId = convId?.toString();
      if (!targetConvId) return;
      setAllMessages((prev) => {
        const currentList = prev[targetConvId] || [];
        return {
          ...prev,
          [targetConvId]: currentList.map((m) => {
            if (m.status === 'read') return m;
            if (!messageId || m.id === messageId?.toString() || m.status === 'sent' || m.status === 'pending') {
              return { ...m, status: 'delivered' as const };
            }
            return m;
          }),
        };
      });
    };

    const onMessageRead = ({ conversationId: convId }: any) => {
      const targetConvId = convId?.toString();
      if (!targetConvId) return;
      setAllMessages((prev) => ({
        ...prev,
        [targetConvId]: (prev[targetConvId] || []).map((m) => ({ ...m, status: 'read' as const })),
      }));
    };

    const onOnlineUsersList = (onlineIds: string[]) => {
      const set = new Set((onlineIds || []).map((id) => id?.toString()));
      setConversations((prev) =>
        prev.map((c) => ({
          ...c,
          online: c.isGroup ? false : Boolean(c.otherUserId && set.has(c.otherUserId)),
        }))
      );
    };

    const onUserOnline = ({ userId }: { userId: string }) => {
      const uId = userId?.toString();
      setConversations((prev) =>
        prev.map((c) => (c.otherUserId === uId ? { ...c, online: true } : c))
      );
    };

    const onUserOffline = ({ userId }: { userId: string }) => {
      const uId = userId?.toString();
      setConversations((prev) =>
        prev.map((c) => (c.otherUserId === uId ? { ...c, online: false } : c))
      );
    };

    const onCallIncoming = (data: {
      fromUserId: string;
      callerName: string;
      callerAvatar?: string;
      conversationId: string;
      callType: 'audio' | 'video';
    }) => {
      console.log('📞 Received call:incoming event:', data);
      if (userPrefs.soundEnabled) {
        soundEffects.playMessageReceived();
      }

      const convList = conversationsRef.current;
      const found = convList.find(
        (c) => c.id === data.conversationId || c.otherUserId === data.fromUserId
      );

      const convObj: Conversation = found || {
        id: data.conversationId,
        name: data.callerName || 'Incoming Caller',
        avatar: data.callerAvatar,
        isGroup: false,
        online: true,
        otherUserId: data.fromUserId,
        unreadCount: 0,
        pinned: false,
        favorite: false,
        lastMessage: {
          text: 'Incoming call',
          timestamp: 'Just now',
        },
      };

      setActiveCall({
        conversation: convObj,
        type: data.callType || 'audio',
        status: 'ringing',
        isIncoming: true,
        role: 'callee',
        startTime: Date.now(),
      });
    };

    const onCallConnected = () => {
      setActiveCall((prev) => (prev ? { ...prev, status: 'connected', startTime: Date.now() } : null));
    };

    const onCallEnded = () => {
      setActiveCall(null);
    };

    const onStatusNew = () => {
      refreshStatuses();
    };

    const onUserProfileUpdated = ({ userId, user: updatedUserData }: any) => {
      const uId = userId?.toString();
      if (!uId) return;
      setConversations((prev) =>
        prev.map((c) => {
          if (c.otherUserId === uId || c.id === uId) {
            return {
              ...c,
              name: updatedUserData.fullName || updatedUserData.name || c.name,
              avatar: updatedUserData.profileImage?.url || updatedUserData.profileImage || c.avatar,
              about: updatedUserData.about || c.about,
              aboutUpdatedAt: updatedUserData.aboutUpdatedAt || c.aboutUpdatedAt,
              bio: updatedUserData.about || c.bio,
            };
          }
          return c;
        })
      );
    };

    sock.on('message:new', onMessageNew);
    sock.on('message:edit', onMessageEdit);
    sock.on('message:delete', onMessageDelete);
    sock.on('message:reaction', onMessageReaction);
    sock.on('message:delivered', onMessageDelivered);
    sock.on('message:read', onMessageRead);
    sock.on('users:online_list', onOnlineUsersList);
    sock.on('user:online', onUserOnline);
    sock.on('user:offline', onUserOffline);
    sock.on('call:incoming', onCallIncoming);
    sock.on('call:connected', onCallConnected);
    sock.on('call:ended', onCallEnded);
    sock.on('call:rejected', onCallEnded);
    sock.on('status:new', onStatusNew);
    sock.on('user:profile_updated', onUserProfileUpdated);

    return () => {
      sock.off('message:new', onMessageNew);
      sock.off('message:edit', onMessageEdit);
      sock.off('message:delete', onMessageDelete);
      sock.off('message:reaction', onMessageReaction);
      sock.off('message:delivered', onMessageDelivered);
      sock.off('message:read', onMessageRead);
      sock.off('users:online_list', onOnlineUsersList);
      sock.off('user:online', onUserOnline);
      sock.off('user:offline', onUserOffline);
      sock.off('call:incoming', onCallIncoming);
      sock.off('call:connected', onCallConnected);
      sock.off('call:ended', onCallEnded);
      sock.off('call:rejected', onCallEnded);
      sock.off('status:new', onStatusNew);
      sock.off('user:profile_updated', onUserProfileUpdated);
    };
  }, [user, refreshConversations, refreshStatuses, currentUserId]);

  const setActiveConversationId = useCallback((id: string) => {
    if (activeConversationIdRef.current && activeConversationIdRef.current !== id) {
      leaveConversation(activeConversationIdRef.current);
    }
    setActiveConversationIdState(id);
    localStorage.setItem('active_conversation_id', id);

    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unreadCount: 0 } : c))
    );

    if (id === 'chatly_ai') {
      setAllMessages((prev) => {
        const current = (prev['chatly_ai'] || []).filter((m) => m.id !== 'ai_welcome_1');
        return {
          ...prev,
          chatly_ai: current,
        };
      });
      return;
    }

    joinConversation(id);
    markMessagesReadApi(id);
    const sock = getSocket();
    if (sock) {
      sock.emit('message:read', { conversationId: id });
    }

    fetchMessagesApi(id)
      .then((msgs) => {
        setAllMessages((prev) => ({ ...prev, [id]: msgs }));
      })
      .catch((err) => console.error('Failed to load messages:', err));
  }, []);

  const activeConversation = conversations.find((c) => c.id === activeConversationId);
  const messages = allMessages[activeConversationId] || [];

  const startDirectChat = useCallback(
    async (email: string): Promise<Conversation> => {
      if (!user) throw new Error('Not authenticated');
      const conv = await startChatByEmailApi(email, user.id);

      setConversations((prev) => {
        const index = prev.findIndex((c) => c.id === conv.id);
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = { ...updated[index], ...conv };
          return updated;
        }
        return [conv, ...prev];
      });

      setActiveConversationId(conv.id);

      fetchConversationsApi(user.id)
        .then((fresh) => {
          if (fresh && fresh.length > 0) {
            setConversations((prev) => {

              const mergedMap = new Map<string, Conversation>();
              fresh.forEach((c) => mergedMap.set(c.id, c));
              prev.forEach((c) => {
                if (!mergedMap.has(c.id)) mergedMap.set(c.id, c);
              });
              return Array.from(mergedMap.values());
            });
          }
        })
        .catch((e) => console.warn('Background sync error:', e));

      return conv;
    },
    [user, setActiveConversationId]
  );

  const setFilter = (newFilter: FilterType) => setFilterState(newFilter);
  const setActiveTopTab = (tab: TopTab) => setActiveTopTabState(tab);
  const setIsInfoPanelOpen = (open: boolean) => setIsInfoPanelOpenState(open);
  const toggleInfoPanel = () => setIsInfoPanelOpenState((prev) => !prev);
  const updateUserPrefs = (prefs: Partial<UserPreferences>) =>
    setUserPrefs((prev) => ({ ...prev, ...prefs }));

  const startTyping = () => {
    if (activeConversationId) emitTypingStart(activeConversationId);
  };

  const stopTyping = () => {
    if (activeConversationId) emitTypingStop(activeConversationId);
  };

  const sendMessage = async (
    content: string,
    type: 'text' | 'audio' | 'file' | 'image' | 'quote' = 'text',
    extra?: { audio?: { duration: number; waveform: number[] }; attachment?: any; quote?: any; mediaUrl?: string }
  ): Promise<void> => {
    if (!activeConversationId) return;

    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const hasQuote = extra?.quote || (replyingToMessage && {
      title: replyingToMessage.senderName,
      text: replyingToMessage.content,
      time: replyingToMessage.timestamp,
    });

    const finalType = hasQuote ? 'quote' : type;

    if (activeConversationId === 'chatly_ai') {
      const tempId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const optimisticMsg: Message = {
        id: tempId,
        conversationId: 'chatly_ai',
        senderId: currentUserId,
        senderName: user?.name || 'You',
        senderAvatar: user?.avatarUrl,
        content,
        timestamp: timeString,
        type: finalType,
        status: 'read',
        reactions: [],
        createdAt: Date.now(),
      };

      setReplyingToMessage(null);
      setAllMessages((prev) => ({
        ...prev,
        chatly_ai: [...(prev['chatly_ai'] || []), optimisticMsg],
      }));

      setConversations((prev) =>
        prev.map((c) =>
          c.id === 'chatly_ai'
            ? {
              ...c,
              lastMessage: {
                text: content,
                timestamp: 'Just now',
                sender: user?.name || 'You',
              },
            }
            : c
        )
      );

      if (userPrefs.soundEnabled) {
        soundEffects.playMessageSent();
      }

      setIsAiThinking(true);

      sendCopilotQueryApi(content)
        .then((aiRes) => {
          const aiText = aiRes?.content || 'Main aapka message receive kar chuka hoon aur hamesha active hoon!';
          const aiMsg: Message = {
            id: `msg_ai_${Date.now()}`,
            conversationId: 'chatly_ai',
            senderId: 'chatly_ai',
            senderName: 'Chatly AI',
            senderAvatar: CHATLY_AI_CONVERSATION.avatar,
            content: aiText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: 'text',
            status: 'read',
            reactions: [],
            createdAt: Date.now(),
          };

          setAllMessages((prev) => ({
            ...prev,
            chatly_ai: [...(prev['chatly_ai'] || []), aiMsg],
          }));

          setConversations((prev) =>
            prev.map((c) =>
              c.id === 'chatly_ai'
                ? {
                  ...c,
                  lastMessage: {
                    text: aiText,
                    timestamp: 'Just now',
                    sender: 'Chatly AI',
                  },
                }
                : c
            )
          );

          if (userPrefs.soundEnabled) {
            soundEffects.playMessageReceived();
          }
        })
        .catch((err) => {
          console.error('Chatly AI query error:', err);
        })
        .finally(() => {
          setIsAiThinking(false);
        });

      return;
    }

    const tempId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const optimisticMsg: Message = {
      id: tempId,
      conversationId: activeConversationId,
      senderId: currentUserId,
      senderName: user?.name || 'You',
      senderAvatar: user?.avatarUrl,
      content,
      timestamp: timeString,
      type: finalType,
      status: 'pending',
      reactions: [],
      createdAt: Date.now(),
      ...(hasQuote ? { quote: hasQuote } : {}),
      ...(extra?.audio ? { audio: extra.audio } : {}),
      ...(extra?.attachment ? { attachment: extra.attachment } : {}),
    };

    setReplyingToMessage(null);

    setAllMessages((prev) => ({
      ...prev,
      [activeConversationId]: [...(prev[activeConversationId] || []), optimisticMsg],
    }));

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === activeConversationId) {
          return {
            ...c,
            lastMessage: {
              text: content || (type === 'audio' ? 'Voice note' : type === 'image' ? 'Photo' : 'Attachment'),
              timestamp: 'Just now',
              sender: user?.name || 'You',
              isAudio: type === 'audio',
              hasAttachment: type === 'file' || type === 'image',
            },
          };
        }
        return c;
      })
    );

    if (userPrefs.soundEnabled) {
      soundEffects.playMessageSent();
    }

    try {
      const sentMsg = await sendMessageApi(
        activeConversationId,
        content,
        finalType,
        extra
      );

      const targetConv = conversations.find((c) => c.id === activeConversationId);
      const isRecipientOnline = Boolean(targetConv?.online);
      const initialStatus: 'sent' | 'delivered' | 'read' =
        sentMsg.status === 'read'
          ? 'read'
          : isRecipientOnline || sentMsg.status === 'delivered'
            ? 'delivered'
            : 'sent';

      setAllMessages((prev) => {
        const currentList = prev[activeConversationId] || [];
        if (currentList.some((m) => m.id === sentMsg.id)) {
          return {
            ...prev,
            [activeConversationId]: currentList.filter((m) => m.id !== tempId),
          };
        }
        return {
          ...prev,
          [activeConversationId]: currentList.map((m) =>
            m.id === tempId ? { ...sentMsg, status: initialStatus } : m
          ),
        };
      });
    } catch (err: any) {
      console.warn('Message send failed:', err);
      setAllMessages((prev) => ({
        ...prev,
        [activeConversationId]: (prev[activeConversationId] || []).map((m) =>
          m.id === tempId ? { ...m, status: 'pending' as const } : m
        ),
      }));
    }
  };

  const editMessage = async (messageId: string, newContent: string): Promise<boolean> => {
    try {
      const updated = await editMessageApi(messageId, newContent);
      setAllMessages((prev) => {
        const currentList = prev[activeConversationId] || [];
        return {
          ...prev,
          [activeConversationId]: currentList.map((m) =>
            m.id === messageId ? { ...m, content: updated.content, isEdited: true } : m
          ),
        };
      });
      return true;
    } catch (err) {
      console.warn('Failed to edit message on server:', err);
      return false;
    }
  };

  const deleteMessageForEveryone = async (messageId: string): Promise<boolean> => {
    try {
      await deleteMessageForEveryoneApi(messageId);
      setAllMessages((prev) => {
        const currentList = prev[activeConversationId] || [];
        return {
          ...prev,
          [activeConversationId]: currentList.map((m) =>
            m.id === messageId
              ? {
                ...m,
                content: '🚫 This message was deleted',
                isDeleted: true,
                attachment: undefined,
                audio: undefined,
                reactions: [],
              }
              : m
          ),
        };
      });
      return true;
    } catch (err) {
      console.warn('Failed to delete message for everyone:', err);
      return false;
    }
  };

  const deleteMessageForMe = async (messageId: string): Promise<void> => {
    try {
      await deleteMessageForMeApi(messageId);
      setAllMessages((prev) => {
        const currentList = prev[activeConversationId] || [];
        return {
          ...prev,
          [activeConversationId]: currentList.filter((m) => m.id !== messageId),
        };
      });
    } catch (err) {
      console.warn('Failed to delete message for me:', err);
    }
  };

  const toggleReaction = async (messageId: string, emoji: string): Promise<void> => {
    try {
      await reactToMessageApi(messageId, emoji);

    } catch (err) {
      console.warn('Failed to toggle reaction:', err);
    }
  };

  const addReaction = async (messageId: string, emoji: string): Promise<void> => {
    await toggleReaction(messageId, emoji);
  };

  const togglePinMessage = (messageId: string): void => {
    setAllMessages((prev) => {
      const currentList = prev[activeConversationId] || [];
      return {
        ...prev,
        [activeConversationId]: currentList.map((m) =>
          m.id === messageId ? { ...m, isPinned: !m.isPinned } : m
        ),
      };
    });
  };

  const toggleArchiveConversation = async (conversationId: string): Promise<void> => {
    try {
      const res = await toggleArchiveApi(conversationId);
      setConversations((prev) =>
        prev.map((c) => (c.id === conversationId ? { ...c, archived: res.archived } : c))
      );
    } catch (err) {
      console.warn('Toggle archive failed:', err);
    }
  };

  const archiveConversation = async (conversationId: string): Promise<void> => {
    await toggleArchiveConversation(conversationId);
  };

  const unarchiveConversation = async (conversationId: string): Promise<void> => {
    await toggleArchiveConversation(conversationId);
  };

  const toggleMuteConversation = async (conversationId: string): Promise<void> => {
    try {
      const res = await toggleMuteApi(conversationId);
      setConversations((prev) =>
        prev.map((c) => (c.id === conversationId ? { ...c, muted: res.muted } : c))
      );
    } catch (err) {
      console.warn('Toggle mute failed:', err);
    }
  };

  const toggleFavoriteConversation = async (conversationId: string): Promise<void> => {
    try {
      const res = await togglePinApi(conversationId);
      setConversations((prev) =>
        prev.map((c) => (c.id === conversationId ? { ...c, pinned: res.pinned, favorite: res.pinned } : c))
      );
    } catch (err) {
      console.warn('Toggle pin failed:', err);
    }
  };

  const blockContact = (conversationId: string): void => {
    toggleMuteConversation(conversationId);
  };

  const deleteConversation = async (conversationId: string): Promise<void> => {
    try {
      if (conversationId === 'chatly_ai') {
        setAllMessages((prev) => ({ ...prev, chatly_ai: [] }));
      } else {
        await deleteConversationApi(conversationId);
      }
      setConversations((prev) => prev.filter((c) => c.id !== conversationId));
      setAllMessages((prev) => {
        const next = { ...prev };
        delete next[conversationId];
        return next;
      });
      if (activeConversationId === conversationId) {
        setConversations((prev) => {
          const remaining = prev.filter((c) => c.id !== conversationId);
          const nextId = remaining.length > 0 ? remaining[0].id : '';
          setActiveConversationId(nextId);
          return remaining;
        });
      }
    } catch (err) {
      console.warn('Delete conversation failed:', err);
    }
  };

  const postStatus = async (
    data: { type: 'text' | 'image' | 'video'; text?: string; mediaUrl?: string; bgColor?: string } | string,
    mediaUrl?: string
  ): Promise<void> => {
    try {
      if (typeof data === 'string') {
        await createStatusApi({ type: mediaUrl ? 'image' : 'text', text: data, mediaUrl });
      } else {
        await createStatusApi({
          type: data.type,
          text: data.text || '',
          mediaUrl: data.mediaUrl || '',
          mediaMeta: { bgColor: data.bgColor },
        });
      }
      await refreshStatuses();
    } catch (err) {
      console.warn('Failed to post status:', err);
    }
  };

  const viewStatus = async (statusId: string): Promise<void> => {
    try {
      await viewStatusApi(statusId);
    } catch (err) {
      console.warn('Failed to view status:', err);
    }
  };

  const startCall = (conversation: Conversation, type: 'audio' | 'video'): void => {
    setActiveCall({
      conversation,
      type,
      status: 'ringing',
      startTime: Date.now(),
      isIncoming: false,
      role: 'caller',
    });

    if (conversation.id === 'chatly_ai' || conversation.otherUserId === 'chatly_ai' || conversation.role === 'AI Assistant') {
      setTimeout(() => {
        setActiveCall((prev) =>
          prev && (prev.conversation.id === 'chatly_ai' || prev.conversation.otherUserId === 'chatly_ai' || prev.conversation.role === 'AI Assistant')
            ? { ...prev, status: 'connected', startTime: Date.now() }
            : prev
        );
      }, 1200);
      return;
    }

    const sock = getSocket();
    if (sock) {
      sock.emit('call:start', {
        toUserId: conversation.otherUserId,
        conversationId: conversation.id,
        callType: type,
        callerName: user?.name,
        callerAvatar: user?.avatarUrl,
      });
    }
  };

  const acceptCall = (): void => {
    setActiveCall((prev) => (prev ? { ...prev, status: 'connected', startTime: Date.now() } : null));
    const sock = getSocket();
    if (sock && activeCall) {
      sock.emit('call:accept', {
        toUserId: activeCall.conversation.otherUserId,
        conversationId: activeCall.conversation.id,
      });
    }
  };

  const rejectCall = (): void => {
    if (activeCall) {
      const sock = getSocket();
      if (sock) {
        sock.emit('call:reject', {
          toUserId: activeCall.conversation.otherUserId,
          conversationId: activeCall.conversation.id,
        });
      }
      setActiveCall(null);
    }
  };

  const endCall = (): void => {
    if (activeCall) {
      const isConnected = activeCall.status === 'connected';
      const durationSeconds = isConnected ? Math.max(1, Math.round((Date.now() - activeCall.startTime) / 1000)) : 0;
      const mins = Math.floor(durationSeconds / 60);
      const secs = durationSeconds % 60;
      const formatted = isConnected ? `${mins}m ${secs}s` : 'Missed';

      const now = new Date();
      const timeStr = `Today, ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

      const newLog: CallLog = {
        id: `call_${Date.now()}`,
        name: activeCall.conversation.name,
        avatar: activeCall.conversation.avatar,
        conversationId: activeCall.conversation.id,
        type: isConnected ? (activeCall.isIncoming ? 'incoming' : 'outgoing') : 'missed',
        callType: activeCall.type,
        timestamp: timeStr,
        duration: formatted,
      };

      setCallLogs((prev) => [newLog, ...prev]);

      const sock = getSocket();
      if (sock) {
        sock.emit('call:end', {
          toUserId: activeCall.conversation.otherUserId,
          conversationId: activeCall.conversation.id,
        });
      }

      setActiveCall(null);
    }
  };

  const unreadNotificationCount = notifications.filter((n) => !n.read).length;
  const toggleNotifications = () => setIsNotificationsOpen((prev) => !prev);
  const markNotificationRead = (id: string) =>
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  const markAllNotificationsRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  const clearNotifications = () => setNotifications([]);

  const manualSync = async () => {
    setSyncStatus('synced');
    await refreshConversations();
  };

  return (
    <ChatContext.Provider
      value={{
        conversations,
        activeConversationId,
        activeConversation,
        setActiveConversationId,
        filter,
        setFilter,
        searchQuery,
        setSearchQuery,
        activeTopTab,
        setActiveTopTab,
        isInfoPanelOpen,
        setIsInfoPanelOpen,
        toggleInfoPanel,
        messages,
        sendMessage,
        addReaction,
        toggleReaction,
        togglePinMessage,
        toggleFavoriteConversation,
        toggleMuteConversation,
        toggleArchiveConversation,
        archiveConversation,
        unarchiveConversation,
        blockContact,
        activeCall,
        startCall,
        acceptCall,
        rejectCall,
        endCall,
        stories,
        activeStory,
        setActiveStory,
        postStatus,
        viewStatus,
        callLogs,
        notifications,
        unreadNotificationCount,
        isNotificationsOpen,
        setIsNotificationsOpen,
        toggleNotifications,
        markNotificationRead,
        markAllNotificationsRead,
        clearNotifications,
        isOnline,
        syncStatus,
        pendingCount: pendingMessages.length,
        manualSync,
        userPrefs,
        updateUserPrefs,
        replyingToMessage,
        setReplyingToMessage,
        editMessage,
        deleteMessageForMe,
        deleteMessageForEveryone,
        deleteConversation,
        refreshConversations,
        refreshStatuses,
        startDirectChat,
        startTyping,
        stopTyping,
        isAiThinking,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};