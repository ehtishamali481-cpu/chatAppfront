export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  title?: string;
  phone?: string;
  handle?: string;
  bio?: string;
  about?: string;
  aboutUpdatedAt?: string;
  online?: boolean;
  lastActive?: string;
}

export type MessageType = 'text' | 'audio' | 'file' | 'quote' | 'image';

export interface Reaction {
  emoji: string;
  count: number;
  users: string[];
}

export interface Attachment {
  id: string;
  name: string;
  size: string;
  type: string;
  url?: string;
  pages?: number;
  thumbnailUrl?: string;
}

export interface AudioNote {
  duration: number; 
  url?: string;
  waveform: number[]; 
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  senderRole?: string;
  content: string;
  timestamp: string;
  type: MessageType;
  status: 'sent' | 'delivered' | 'read' | 'pending';
  attachment?: Attachment;
  audio?: AudioNote;
  quote?: {
    title: string;
    text: string;
    time: string;
  };
  reactions: Reaction[];
  isPinned?: boolean;
  createdAt?: number;
  isEdited?: boolean;
  isDeleted?: boolean;
}

export interface Conversation {
  id: string;
  name: string;
  isGroup: boolean;
  avatar?: string;
  initials?: string;
  color?: string;
  online?: boolean;
  lastSeen?: string;
  role?: string;
  handle?: string;
  phone?: string;
  bio?: string;
  about?: string;
  aboutUpdatedAt?: string;
  otherUserId?: string;
  lastMessage?: {
    text: string;
    sender?: string;
    timestamp: string;
    isAudio?: boolean;
    audioDuration?: string;
    hasAttachment?: boolean;
    attachmentCount?: number;
    isTyping?: boolean;
    isLocation?: boolean;
  };
  unreadCount?: number;
  pinned?: boolean;
  favorite?: boolean;
  archived?: boolean;
  muted?: boolean;
  pinnedNotice?: string;
  sharedAssets?: {
    mediaCount: number;
    docsCount: number;
    linksCount: number;
    media: { id: string; url?: string; title: string; category?: string; bgGradient?: string }[];
  };
  starredCount?: number;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  conversationId?: string;
  read: boolean;
  type: 'message' | 'call' | 'mention' | 'file' | 'system';
  avatar?: string;
}

export interface StoryStatus {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  isOwn?: boolean;
  hasUnseen: boolean;
  timeAgo: string;
  items: {
    id: string;
    type: 'image' | 'video' | 'text';
    content: string;
    caption?: string;
    timeAgo: string;
    bgColor?: string;
    viewers?: { userId: any; viewedAt: string }[];
    viewersCount?: number;
  }[];
}

export interface CallLog {
  id: string;
  name: string;
  avatar?: string;
  conversationId?: string;
  type: 'incoming' | 'outgoing' | 'missed';
  callType: 'audio' | 'video';
  timestamp: string;
  duration?: string;
}

export interface CopilotMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
  model?: string;
  parsedMetadata?: {
    channel: string;
    msgCount: number;
    groundedPct: number;
    decisions?: {
      id: number;
      title: string;
      desc: string;
    }[];
    draft?: {
      title: string;
      body: string;
    };
  };
}

export interface UserPreferences {
  soundEnabled: boolean;
  desktopNotify: boolean;
  readReceipts: boolean;
}

